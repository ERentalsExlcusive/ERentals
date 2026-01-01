import { View, Text, StyleSheet, Pressable, TextInput, Platform, FlatList } from 'react-native';
import { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { BrandColors, Spacing } from '@/constants/theme';
import { useLocations } from '@/hooks/use-locations';
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
      setShowDatePicker(false);
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
    setShowDestinationDropdown(false);
    setShowGuestPicker(false);
    setShowDatePicker(false);
  };

  const handleReset = () => {
    setDestination('');
    setSelectedDestination(null);
    setCheckIn(null);
    setCheckOut(null);
    setGuests(2);
    setShowDestinationDropdown(false);
    setShowGuestPicker(false);
    setShowDatePicker(false);
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
    if (!date) return 'Add dates';
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
    setShowDestinationDropdown(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        {/* Destination */}
        <View style={styles.field}>
          <Text style={styles.label}>Where</Text>
          <TextInput
            style={styles.input}
            placeholder="Search destinations"
            placeholderTextColor={BrandColors.gray.medium}
            value={destination}
            onChangeText={(text) => {
              setDestination(text);
              setSelectedDestination(null);
              setShowDestinationDropdown(true);
            }}
            onFocus={() => setShowDestinationDropdown(true)}
          />
        </View>

        <View style={styles.divider} />

        {/* Check In */}
        <Pressable
          style={styles.field}
          onPress={() => {
            setShowDatePicker(true);
            setShowDestinationDropdown(false);
            setShowGuestPicker(false);
          }}
        >
          <Text style={styles.label}>Check in</Text>
          <Text style={[styles.input, !checkIn && styles.inputPlaceholder]}>
            {formatDate(checkIn)}
          </Text>
        </Pressable>

        <View style={styles.divider} />

        {/* Check Out */}
        <Pressable
          style={[styles.field, checkIn && !checkOut && styles.fieldHighlight]}
          onPress={() => {
            setShowDatePicker(true);
            setShowDestinationDropdown(false);
            setShowGuestPicker(false);
          }}
        >
          <Text style={[styles.label, checkIn && !checkOut && styles.labelHighlight]}>
            Check out {checkIn && !checkOut && '→'}
          </Text>
          <Text style={[styles.input, !checkOut && styles.inputPlaceholder]}>
            {formatDate(checkOut)}
          </Text>
        </Pressable>

        <View style={styles.divider} />

        {/* Guests */}
        <Pressable
          style={styles.field}
          onPress={() => setShowGuestPicker(!showGuestPicker)}
        >
          <Text style={styles.label}>Guests</Text>
          <Text style={styles.input}>{guests} guest{guests !== 1 ? 's' : ''}</Text>
        </Pressable>

        {/* Reset Button - Only show if filters are active */}
        {hasActiveFilters && (
          <Pressable style={styles.resetButton} onPress={handleReset}>
            <Feather name="x" size={18} color={BrandColors.gray.dark} />
          </Pressable>
        )}

        {/* Search Button */}
        <Pressable style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </Pressable>
      </View>

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
    fontSize: 14,
    color: BrandColors.gray.dark,
  },
  inputPlaceholder: {
    color: BrandColors.gray.medium,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: BrandColors.gray.border,
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
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 8,
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    padding: Spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    maxHeight: 320,
    zIndex: 1000,
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
    left: '50%',
    transform: [{ translateX: '-50%' }],
    marginTop: 8,
    zIndex: 1000,
  },
  guestPicker: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 8,
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    minWidth: 300,
    zIndex: 1000,
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
