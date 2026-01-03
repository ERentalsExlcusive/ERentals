/**
 * Favorites Context
 * Provides shared favorites state across all components
 * Uses Supabase for authenticated users, localStorage for anonymous
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Platform } from 'react-native';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/context/auth-context';

interface Favorite {
  propertyId: number;
  propertySlug: string;
  savedAt: string;
}

interface FavoritesContextType {
  favorites: Favorite[];
  isLoading: boolean;
  isFavorite: (propertyId: number) => boolean;
  addFavorite: (propertyId: number, propertySlug: string) => Promise<boolean>;
  removeFavorite: (propertyId: number) => Promise<boolean>;
  toggleFavorite: (propertyId: number, propertySlug: string) => Promise<boolean>;
  favoritesCount: number;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

const STORAGE_KEY = 'erentals_favorites';

// Local storage helpers
function getLocalFavorites(): Favorite[] {
  if (Platform.OS !== 'web' || typeof localStorage === 'undefined') {
    return [];
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setLocalFavorites(favorites: Favorite[]): void {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites on mount and when user changes
  useEffect(() => {
    const loadFavorites = async () => {
      setIsLoading(true);

      if (isSupabaseConfigured() && user && !user.isAnonymous) {
        // Load from Supabase for authenticated users
        try {
          const { data, error } = await supabase
            .from('favorites')
            .select('property_id, property_slug, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (!error && data) {
            setFavorites(data.map(f => ({
              propertyId: f.property_id,
              propertySlug: f.property_slug,
              savedAt: f.created_at,
            })));
          }
        } catch (error) {
          console.error('Failed to load favorites:', error);
        }
      } else {
        // Load from localStorage for anonymous users
        setFavorites(getLocalFavorites());
      }

      setIsLoading(false);
    };

    loadFavorites();
  }, [user?.id, user?.isAnonymous]);

  const isFavorite = useCallback((propertyId: number): boolean => {
    return favorites.some(f => f.propertyId === propertyId);
  }, [favorites]);

  const addFavorite = useCallback(async (propertyId: number, propertySlug: string): Promise<boolean> => {
    // Optimistically update UI immediately
    const newFavorite: Favorite = {
      propertyId,
      propertySlug,
      savedAt: new Date().toISOString(),
    };

    // Check if already favorited
    if (favorites.some(f => f.propertyId === propertyId)) {
      return true;
    }

    // Update state immediately for instant UI feedback
    setFavorites(prev => [newFavorite, ...prev]);

    if (isSupabaseConfigured() && user && !user.isAnonymous) {
      // Save to Supabase
      try {
        const { error } = await supabase.from('favorites').insert({
          user_id: user.id,
          property_id: propertyId,
          property_slug: propertySlug,
        });

        if (error) {
          console.error('Failed to add favorite:', error);
          // Rollback on error
          setFavorites(prev => prev.filter(f => f.propertyId !== propertyId));
          return false;
        }
      } catch (error) {
        console.error('Failed to add favorite:', error);
        // Rollback on error
        setFavorites(prev => prev.filter(f => f.propertyId !== propertyId));
        return false;
      }
    } else {
      // Save to localStorage
      const updated = [newFavorite, ...favorites];
      setLocalFavorites(updated);
    }

    return true;
  }, [favorites, user]);

  const removeFavorite = useCallback(async (propertyId: number): Promise<boolean> => {
    // Store current state for rollback
    const previousFavorites = favorites;

    // Update state immediately for instant UI feedback
    setFavorites(prev => prev.filter(f => f.propertyId !== propertyId));

    if (isSupabaseConfigured() && user && !user.isAnonymous) {
      // Remove from Supabase
      try {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', propertyId);

        if (error) {
          console.error('Failed to remove favorite:', error);
          // Rollback on error
          setFavorites(previousFavorites);
          return false;
        }
      } catch (error) {
        console.error('Failed to remove favorite:', error);
        // Rollback on error
        setFavorites(previousFavorites);
        return false;
      }
    } else {
      // Remove from localStorage
      const updated = favorites.filter(f => f.propertyId !== propertyId);
      setLocalFavorites(updated);
    }

    return true;
  }, [favorites, user]);

  const toggleFavorite = useCallback(async (propertyId: number, propertySlug: string): Promise<boolean> => {
    if (favorites.some(f => f.propertyId === propertyId)) {
      return removeFavorite(propertyId);
    } else {
      return addFavorite(propertyId, propertySlug);
    }
  }, [favorites, addFavorite, removeFavorite]);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isLoading,
        isFavorite,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        favoritesCount: favorites.length,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextType {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
