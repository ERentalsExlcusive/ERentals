import { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { BrandColors, Typography, Spacing } from '@/constants/theme';
import { APP_CATEGORIES, CATEGORIES_ARRAY } from '@/constants/category-mapping';
import { SearchParams } from '@/types/search';

export interface SearchContainerProps {
  variant?: 'expanded' | 'compact';
  onSearch?: (params: SearchParams) => void;
  initialValues?: Partial<SearchParams>;
}

export function SearchContainer({
  variant = 'expanded',
  onSearch,
  initialValues,
}: SearchContainerProps) {
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialValues?.categories || []
  );
  const [guests, setGuests] = useState({
    adults: initialValues?.guests?.adults || 2,
    children: initialValues?.guests?.children || 0,
  });

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      }
      return [...prev, categoryId];
    });
  };

  const handleSearch = () => {
    const searchParams: SearchParams = {
      categories: selectedCategories,
      guests,
    };

    if (onSearch) {
      onSearch(searchParams);
    } else {
      // Default behavior: navigate to results page
      const categoryParam = selectedCategories.join(',');
      router.push(`/results?category=${categoryParam}&adults=${guests.adults}&children=${guests.children}` as any);
    }
  };

  const isExpanded = variant === 'expanded';

  return (
    <View style={[styles.container, isExpanded ? styles.expanded : styles.compact]}>
      {isExpanded && (
        <Text style={styles.title}>Find Your Perfect Stay</Text>
      )}

      {/* Category Selector */}
      <View style={styles.section}>
        {isExpanded && <Text style={styles.label}>Category</Text>}
        <View style={styles.categoryButtons}>
          {CATEGORIES_ARRAY.map((category) => {
            const isSelected = selectedCategories.includes(category.id);
            return (
              <Pressable
                key={category.id}
                style={({ pressed }) => [
                  styles.categoryButton,
                  isSelected && styles.categoryButtonActive,
                  pressed && styles.categoryButtonPressed,
                ]}
                onPress={() => toggleCategory(category.id)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    isSelected && styles.categoryButtonTextActive,
                  ]}
                >
                  {category.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Guest Picker - Simple version */}
      {isExpanded && (
        <View style={styles.section}>
          <Text style={styles.label}>Guests</Text>
          <View style={styles.guestPicker}>
            <View style={styles.guestRow}>
              <Text style={styles.guestLabel}>Adults</Text>
              <View style={styles.guestControls}>
                <Pressable
                  style={({ pressed }) => [
                    styles.guestButton,
                    pressed && styles.guestButtonPressed,
                  ]}
                  onPress={() => setGuests(prev => ({ ...prev, adults: Math.max(1, prev.adults - 1) }))}
                >
                  <Text style={styles.guestButtonText}>-</Text>
                </Pressable>
                <Text style={styles.guestCount}>{guests.adults}</Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.guestButton,
                    pressed && styles.guestButtonPressed,
                  ]}
                  onPress={() => setGuests(prev => ({ ...prev, adults: prev.adults + 1 }))}
                >
                  <Text style={styles.guestButtonText}>+</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.guestRow}>
              <Text style={styles.guestLabel}>Children</Text>
              <View style={styles.guestControls}>
                <Pressable
                  style={({ pressed }) => [
                    styles.guestButton,
                    pressed && styles.guestButtonPressed,
                  ]}
                  onPress={() => setGuests(prev => ({ ...prev, children: Math.max(0, prev.children - 1) }))}
                >
                  <Text style={styles.guestButtonText}>-</Text>
                </Pressable>
                <Text style={styles.guestCount}>{guests.children}</Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.guestButton,
                    pressed && styles.guestButtonPressed,
                  ]}
                  onPress={() => setGuests(prev => ({ ...prev, children: prev.children + 1 }))}
                >
                  <Text style={styles.guestButtonText}>+</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Search Button */}
      <Pressable
        style={({ pressed }) => [
          styles.searchButton,
          pressed && styles.searchButtonPressed,
          selectedCategories.length === 0 && styles.searchButtonDisabled,
        ]}
        onPress={handleSearch}
        disabled={selectedCategories.length === 0}
      >
        <Text style={styles.searchButtonText}>
          Search {selectedCategories.length > 0 && `(${selectedCategories.length})`}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: BrandColors.white,
    borderRadius: 12,
    padding: Spacing.lg,
  },
  expanded: {
    minWidth: 400,
    maxWidth: 600,
  },
  compact: {
    width: '100%',
  },
  title: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 28,
    color: BrandColors.primary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    letterSpacing: 1,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 16,
    color: BrandColors.gray.dark,
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: BrandColors.secondary,
    backgroundColor: BrandColors.white,
  },
  categoryButtonActive: {
    backgroundColor: BrandColors.secondary,
  },
  categoryButtonPressed: {
    opacity: 0.7,
  },
  categoryButtonText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 16,
    color: BrandColors.secondary,
    letterSpacing: 0.5,
  },
  categoryButtonTextActive: {
    color: BrandColors.white,
  },
  guestPicker: {
    gap: Spacing.md,
  },
  guestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  guestLabel: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 16,
    color: BrandColors.gray.dark,
  },
  guestControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  guestButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BrandColors.gray.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestButtonPressed: {
    backgroundColor: BrandColors.secondary,
  },
  guestButtonText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 18,
    color: BrandColors.primary,
  },
  guestCount: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 18,
    color: BrandColors.primary,
    minWidth: 24,
    textAlign: 'center',
  },
  searchButton: {
    backgroundColor: BrandColors.secondary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  searchButtonPressed: {
    backgroundColor: BrandColors.primary,
  },
  searchButtonDisabled: {
    backgroundColor: BrandColors.gray.medium,
    opacity: 0.5,
  },
  searchButtonText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 18,
    color: BrandColors.white,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
