import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';

// Asset category type
export type AssetCategory = 'all' | 'villa' | 'yacht' | 'transport' | 'property' | 'hotel';

// UTM attribution fields
export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  er_id?: string;
  creator_id?: string;
}

export interface SearchState {
  // Category selection
  category: AssetCategory;

  // Shared fields
  destination: string;
  destinationId?: number;
  destinationType?: 'city' | 'country';
  guests: number;
  adults?: number;
  children?: number;
  infants?: number;
  occasion?: string;

  // Villa/Hotel fields
  checkIn: Date | null;
  checkOut: Date | null;

  // Yacht fields
  charterDate: Date | null;
  charterTime: string;
  charterDuration: string;

  // Transport fields
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: Date | null;
  pickupTime: string;
  flightNumber?: string;
  luggageCount?: number;

  // Attribution (auto-captured)
  attribution: UTMParams;
}

interface SearchContextType {
  searchState: SearchState;
  setSearchState: (state: Partial<SearchState>) => void;
  clearSearch: () => void;
  setCategory: (category: AssetCategory) => void;
}

const defaultSearchState: SearchState = {
  category: 'all',
  destination: '',
  destinationId: undefined,
  destinationType: undefined,
  guests: 2,
  adults: 2,
  children: 0,
  infants: 0,
  occasion: '',
  checkIn: null,
  checkOut: null,
  charterDate: null,
  charterTime: '',
  charterDuration: '',
  pickupLocation: '',
  dropoffLocation: '',
  pickupDate: null,
  pickupTime: '',
  flightNumber: '',
  luggageCount: undefined,
  attribution: {},
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Extract UTM params from URL
function extractUTMParams(): UTMParams {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return {};
  }

  try {
    const params = new URLSearchParams(window.location.search);
    const utmParams: UTMParams = {};

    if (params.get('utm_source')) utmParams.utm_source = params.get('utm_source')!;
    if (params.get('utm_medium')) utmParams.utm_medium = params.get('utm_medium')!;
    if (params.get('utm_campaign')) utmParams.utm_campaign = params.get('utm_campaign')!;
    if (params.get('utm_content')) utmParams.utm_content = params.get('utm_content')!;
    if (params.get('utm_term')) utmParams.utm_term = params.get('utm_term')!;
    if (params.get('er_id')) utmParams.er_id = params.get('er_id')!;
    if (params.get('creator_id')) utmParams.creator_id = params.get('creator_id')!;

    return utmParams;
  } catch {
    return {};
  }
}

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchState, setSearchStateInternal] = useState<SearchState>(defaultSearchState);

  // Extract UTM params on mount
  useEffect(() => {
    const utmParams = extractUTMParams();
    if (Object.keys(utmParams).length > 0) {
      setSearchStateInternal(prev => ({
        ...prev,
        attribution: { ...prev.attribution, ...utmParams },
      }));
    }
  }, []);

  // Partial update function
  const setSearchState = (updates: Partial<SearchState>) => {
    setSearchStateInternal(prev => ({
      ...prev,
      ...updates,
      // Preserve attribution unless explicitly updated
      attribution: updates.attribution
        ? { ...prev.attribution, ...updates.attribution }
        : prev.attribution,
    }));
  };

  const setCategory = (category: AssetCategory) => {
    setSearchStateInternal(prev => ({ ...prev, category }));
  };

  const clearSearch = () => {
    // Preserve attribution when clearing search
    setSearchStateInternal(prev => ({
      ...defaultSearchState,
      attribution: prev.attribution,
    }));
  };

  return (
    <SearchContext.Provider value={{ searchState, setSearchState, clearSearch, setCategory }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchContext() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
}
