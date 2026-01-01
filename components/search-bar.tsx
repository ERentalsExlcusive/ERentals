import { View, Text, StyleSheet, Pressable, TextInput, Platform, FlatList } from 'react-native';
import { useState, useEffect } from 'react';
import { Feather } from '@expo/vector-icons';
import { BrandColors, Spacing } from '@/constants/theme';
import { useLocations } from '@/hooks/use-locations';
import { useResponsive } from '@/hooks/use-responsive';
import { DatePicker } from './date-picker';

interface SearchBarProps {
  onSearch?: (params: SearchParams) => void;
}

export interface SearchParams {
  destination: string;
  destinationId?: number;
  destinationType?: 'city' | 'country';
  checkIn: Date | null;
  checkOut: Date | null;
  guests: number;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const { locations, loading } = useLocations();
  const { isMobile } = useResponsive();
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState(2);
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<{
    id: number;
    name: string;
    type: 'city' | 'country';
  } | null>(null);

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setShowDestinationDropdown(false);
    setShowDatePicker(false);
    setShowGuestPicker(false);
  };

  // Handle clicks outside the search bar
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        const container = document.getElementById('search-bar-container');
        // Check if click is outside search bar container
        if (container && !container.contains(target)) {
          closeAllDropdowns();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, []);

  // Top destination suggestions (shown when input is focused but empty)
  const topDestinations = [
    'Miami',
    'Tulum',
    'Mexico City',
    'Puerto Escondido',
    'Mykonos',
    'Ibiza',
  ];

  // Filter locations based on search input
  const filteredLocations = destination
    ? locations.filter(loc =>
        loc.name.toLowerCase().includes(destination.toLowerCase())
      ).slice(0, 8)
    : locations
        .filter(loc => topDestinations.some(dest =>
          loc.name.toLowerCase().includes(dest.toLowerCase())
        ))
        .slice(0, 6);

  const handleDatesChange = (start: Date | null, end: Date | null) => {
    setCheckIn(start);
    setCheckOut(end);
    // Close picker if both dates are selected
    if (start && end) {
      closeAllDropdowns();
    }
  };

  const handleSearch = () => {
    onSearch?.({
      destination: selectedDestination?.name || destination,
      destinationId: selectedDestination?.id,
      destinationType: selectedDestination?.type,
      checkIn,
      checkOut,
      guests,
    });
    closeAllDropdowns();
  };

  const handleReset = () => {
    setDestination('');
    setSelectedDestination(null);
    setCheckIn(null);
    setCheckOut(null);
    setGuests(2);
    closeAllDropdowns();
    // Reset search without scrolling
    if (onSearch) {
      onSearch({
        destination: '',
        destinationId: undefined,
        destinationType: undefined,
        checkIn: null,
        checkOut: null,
        guests: 2,
      });
    }
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return isMobile ? 'Dates' : 'Add dates';
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  const hasActiveFilters = destination || checkIn || checkOut || guests !== 2;

  const handleDestinationSelect = (location: typeof filteredLocations[0]) => {
    setDestination(location.name);
    setSelectedDestination({
      id: location.id,
      name: location.name,
      type: location.type,
    });
    closeAllDropdowns();
  };

  const openDestinationDropdown = () => {
    closeAllDropdowns();
    setShowDestinationDropdown(true);
  };

  const openDatePicker = () => {
    closeAllDropdowns();
    setShowDatePicker(true);
  };

  const openGuestPicker = () => {
    closeAllDropdowns();
    setShowGuestPicker(true);
  };

  return (
    <View style={styles.container} nativeID="search-bar-container">
      <View style={[styles.searchBox, isMobile && styles.searchBoxMobile]}>
        {/* Destination */}
        <View style={[styles.field, isMobile && [styles.fieldMobile, styles.fieldMobileWhere]]}>
          <Text style={styles.label}>Where</Text>
          <TextInput
            style={[styles.input, isMobile && styles.inputMobile]}
            placeholder={isMobile ? "Search" : "Search destinations"}
            placeholderTextColor={BrandColors.gray.medium}
            value={destination}
            onChangeText={(text) => {
              setDestination(text);
              setSelectedDestination(null);
              openDestinationDropdown();
            }}
            onFocus={openDestinationDropdown}
          />
        </View>

        <View style={[styles.divider, isMobile && styles.dividerMobile]} />

        {/* Check In */}
        <Pressable
          style={[styles.field, isMobile && [styles.fieldMobile, styles.fieldMobileDate]]}
          onPress={openDatePicker}
        >
          <Text style={[styles.label, isMobile && styles.labelMobile]}>Check in</Text>
          <Text
            style={[styles.input, !checkIn && styles.inputPlaceholder, isMobile && styles.inputMobile]}
            numberOfLines={1}
            ellipsizeMode="clip"
          >
            {formatDate(checkIn)}
          </Text>
        </Pressable>

        <View style={[styles.divider, isMobile && styles.dividerMobile]} />

        {/* Check Out */}
        <Pressable
          style={[styles.field, checkIn && !checkOut && styles.fieldHighlight, isMobile && [styles.fieldMobile, styles.fieldMobileDate]]}
          onPress={openDatePicker}
        >
          <Text style={[styles.label, checkIn && !checkOut && styles.labelHighlight, isMobile && styles.labelMobile]} numberOfLines={1}>
            Check out {checkIn && !checkOut && '→'}
          </Text>
          <Text
            style={[styles.input, !checkOut && styles.inputPlaceholder, isMobile && styles.inputMobile]}
            numberOfLines={1}
            ellipsizeMode="clip"
          >
            {formatDate(checkOut)}
          </Text>
        </Pressable>

        <View style={[styles.divider, isMobile && styles.dividerMobile]} />

        {/* Guests */}
        <Pressable
          style={[styles.field, isMobile && [styles.fieldMobile, styles.fieldMobileGuest]]}
          onPress={openGuestPicker}
        >
          <Text style={styles.label}>Guests</Text>
          <Text style={[styles.input, isMobile && styles.inputMobile]} numberOfLines={1}>{guests}</Text>
        </Pressable>

        {/* Reset Button - Only show if filters are active */}
        {hasActiveFilters && !isMobile && (
          <Pressable style={styles.resetButton} onPress={handleReset}>
            <Feather name="x" size={18} color={BrandColors.gray.dark} />
          </Pressable>
        )}

        {/* Search Button */}
        <Pressable style={[styles.searchButton, isMobile && styles.searchButtonMobile]} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </Pressable>
      </View>

      {/* Mobile Reset Button */}
      {hasActiveFilters && isMobile && (
        <Pressable style={styles.resetButtonMobile} onPress={handleReset}>
          <Feather name="x" size={16} color={BrandColors.white} />
          <Text style={styles.resetButtonText}>Clear</Text>
        </Pressable>
      )}

      {/* Destination Autocomplete Dropdown */}
      {showDestinationDropdown && filteredLocations.length > 0 && (
        <View style={styles.dropdown}>
          {!destination && (
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownHeaderText}>Popular Destinations</Text>
            </View>
          )}
          <FlatList
            data={filteredLocations}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            renderItem={({ item }) => (
              <Pressable
                style={styles.dropdownItem}
                onPress={() => handleDestinationSelect(item)}
              >
                <Text style={styles.dropdownText}>{item.name}</Text>
                <View style={styles.dropdownTypeContainer}>
                  <Feather
                    name={item.type === 'city' ? 'map-pin' : 'globe'}
                    size={12}
                    color={BrandColors.gray.medium}
                  />
                  <Text style={styles.dropdownType}>
                    {item.type === 'city' ? 'City' : 'Country'}
                  </Text>
                </View>
              </Pressable>
            )}
            scrollEnabled={false}
          />
        </View>
      )}

      {/* Date Picker Dropdown */}
      {showDatePicker && (
        <View style={styles.datePickerContainer}>
          <DatePicker
            startDate={checkIn || undefined}
            endDate={checkOut || undefined}
            onDatesChange={handleDatesChange}
            minDate={new Date()}
          />
        </View>
      )}

      {/* Guest Picker Dropdown */}
      {showGuestPicker && (
        <View style={styles.guestPicker}>
          <View style={styles.guestRow}>
            <Text style={styles.guestLabel}>Guests</Text>
            <View style={styles.guestControls}>
              <Pressable
                style={styles.guestButton}
                onPress={() => setGuests(Math.max(1, guests - 1))}
              >
                <Text style={styles.guestButtonText}>-</Text>
              </Pressable>
              <Text style={styles.guestCount}>{guests}</Text>
              <Pressable
                style={styles.guestButton}
                onPress={() => setGuests(Math.max(1, Math.min(40, guests + 1)))}
              >
                <Text style={styles.guestButtonText}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 900,
    position: 'relative',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.white,
    borderRadius: 50,
    paddingVertical: Platform.OS === 'web' ? 8 : 12,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  field: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  fieldHighlight: {
    backgroundColor: 'rgba(188, 148, 77, 0.08)',
    borderRadius: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandColors.black,
    marginBottom: 4,
  },
  labelHighlight: {
    color: BrandColors.secondary,
  },
  input: {
    fontSize: 15,
    color: BrandColors.black,
  },
  inputPlaceholder: {
    color: BrandColors.gray.medium,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: BrandColors.gray.border,
  },
  dividerMobile: {
    height: 24,
  },
  labelMobile: {
    fontSize: 10,
  },
  resetButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BrandColors.gray.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  searchButton: {
    backgroundColor: BrandColors.black,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 50,
    marginLeft: 8,
  },
  searchButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: BrandColors.white,
  },
  // Mobile-specific styles
  searchBoxMobile: {
    flexDirection: 'row',
    borderRadius: 50,
    paddingVertical: 4,
    paddingHorizontal: 4,
    gap: 0,
    alignItems: 'center',
  },
  fieldMobile: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 0,
    justifyContent: 'center',
  },
  // Where field gets more space
  fieldMobileWhere: {
    flex: 2,
    minWidth: 90,
  },
  // Date fields get moderate space
  fieldMobileDate: {
    flex: 1.5,
    minWidth: 75,
  },
  // Guest field gets less space (just shows number)
  fieldMobileGuest: {
    flex: 1,
    minWidth: 55,
  },
  inputMobile: {
    fontSize: 13,
  },
  searchButtonMobile: {
    marginLeft: 0,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 65,
  },
  resetButtonMobile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.black,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 50,
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  resetButtonText: {
    color: BrandColors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: Platform.OS === 'web' ? 0 : Spacing.sm,
    right: Platform.OS === 'web' ? 0 : Spacing.sm,
    marginTop: 8,
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    maxHeight: 280,
    zIndex: 1001,
    overflow: 'hidden',
  },
  dropdownHeader: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray.border,
    marginBottom: Spacing.xs,
  },
  dropdownHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandColors.gray.dark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
  },
  dropdownText: {
    fontSize: 15,
    color: BrandColors.black,
    fontWeight: '500',
  },
  dropdownTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dropdownType: {
    fontSize: 13,
    color: BrandColors.gray.medium,
  },
  datePickerContainer: {
    position: 'absolute',
    top: '100%',
    left: Platform.OS === 'web' ? '50%' : Spacing.sm,
    right: Platform.OS === 'web' ? undefined : Spacing.sm,
    transform: Platform.OS === 'web' ? [{ translateX: '-50%' }] : undefined,
    marginTop: 8,
    zIndex: 1002,
    maxWidth: Platform.OS === 'web' ? 380 : undefined,
  },
  guestPicker: {
    position: 'absolute',
    top: '100%',
    right: Platform.OS === 'web' ? 0 : Spacing.sm,
    left: Platform.OS === 'web' ? undefined : Spacing.sm,
    marginTop: 8,
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    minWidth: Platform.OS === 'web' ? 300 : undefined,
    maxWidth: Platform.OS === 'web' ? 300 : undefined,
    zIndex: 1001,
  },
  guestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  guestLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: BrandColors.black,
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
    borderWidth: 1,
    borderColor: BrandColors.gray.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestButtonText: {
    fontSize: 18,
    color: BrandColors.gray.dark,
  },
  guestCount: {
    fontSize: 15,
    fontWeight: '600',
    color: BrandColors.black,
    minWidth: 24,
    textAlign: 'center',
  },
});
