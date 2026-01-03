import { View, Text, StyleSheet, Pressable, TextInput, Platform, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Feather } from '@expo/vector-icons';
import { BrandColors, Spacing } from '@/constants/theme';
import { Space, FontSize, LineHeight, FontWeight, Radius, Shadow, ZIndex, TouchTarget } from '@/constants/design-tokens';
import { useDestinations, Destination } from '@/hooks/use-destinations';
import { useResponsive } from '@/hooks/use-responsive';
import { useSearchContext, AssetCategory } from '@/context/search-context';
import { DatePicker } from './date-picker';
import { BottomSheet } from './bottom-sheet';

interface SearchBarProps {
  onSearch?: (params: SearchParams) => void;
  selectedCategory?: AssetCategory;
}

export interface SearchParams {
  // Category
  category?: AssetCategory;

  // Shared
  destination: string;
  destinationId?: number;
  destinationType?: 'city' | 'country';
  guests: number;
  adults?: number;
  children?: number;
  infants?: number;
  occasion?: string;

  // Villa/Hotel
  checkIn: Date | null;
  checkOut: Date | null;

  // Yacht
  charterDate?: Date | null;
  charterTime?: string;
  charterDuration?: string;

  // Transport
  pickupLocation?: string;
  dropoffLocation?: string;
  pickupDate?: Date | null;
  pickupTime?: string;
}

// Charter duration options
const CHARTER_DURATIONS = [
  { value: '4hr', label: '4 Hours', description: 'Half-day cruise' },
  { value: '6hr', label: '6 Hours', description: 'Extended cruise' },
  { value: '8hr', label: '8 Hours', description: 'Full day' },
  { value: 'overnight', label: 'Overnight', description: 'Multi-day' },
];

// Departure time options
const DEPARTURE_TIMES = [
  { value: '08:00', label: '8:00 AM' },
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '17:00', label: '5:00 PM' },
  { value: '18:00', label: '6:00 PM' },
];

// Date preset options for quick selection
const DATE_PRESETS = [
  { label: 'This weekend', getValue: () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;
    const friday = new Date(today);
    friday.setDate(today.getDate() + daysUntilFriday);
    const sunday = new Date(friday);
    sunday.setDate(friday.getDate() + 2);
    return { start: friday, end: sunday };
  }},
  { label: 'Next weekend', getValue: () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7 + 7;
    const friday = new Date(today);
    friday.setDate(today.getDate() + daysUntilFriday);
    const sunday = new Date(friday);
    sunday.setDate(friday.getDate() + 2);
    return { start: friday, end: sunday };
  }},
  { label: 'Next week', getValue: () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() + 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start, end };
  }},
  { label: 'This month', getValue: () => {
    const today = new Date();
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { start: today, end };
  }},
];

// Occasion options
const OCCASIONS = [
  { value: 'vacation', label: 'Vacation', icon: 'sun' },
  { value: 'wedding', label: 'Wedding', icon: 'heart' },
  { value: 'corporate', label: 'Corporate', icon: 'briefcase' },
  { value: 'celebration', label: 'Celebration', icon: 'gift' },
  { value: 'family', label: 'Family Reunion', icon: 'users' },
];

export function SearchBar({ onSearch, selectedCategory = 'all' }: SearchBarProps) {
  const { destinations, featured, loading, error } = useDestinations();
  const { isMobile } = useResponsive();
  const { searchState, setSearchState } = useSearchContext();

  // Determine effective category
  const category = selectedCategory || searchState.category || 'all';
  const isYacht = category === 'yacht';
  const isTransport = category === 'transport';
  const isVillaType = category === 'all' || category === 'villa' || category === 'property' || category === 'hotel';

  // Local state synced with context
  const [destination, setDestination] = useState(searchState.destination);
  const [checkIn, setCheckIn] = useState<Date | null>(searchState.checkIn);
  const [checkOut, setCheckOut] = useState<Date | null>(searchState.checkOut);
  const [guests, setGuests] = useState(searchState.guests);
  const [adults, setAdults] = useState(searchState.adults || 2);
  const [children, setChildren] = useState(searchState.children || 0);
  const [infants, setInfants] = useState(searchState.infants || 0);
  const [occasion, setOccasion] = useState(searchState.occasion || '');

  // Yacht-specific state
  const [charterDate, setCharterDate] = useState<Date | null>(searchState.charterDate || null);
  const [charterTime, setCharterTime] = useState(searchState.charterTime || '');
  const [charterDuration, setCharterDuration] = useState(searchState.charterDuration || '');

  // Transport-specific state
  const [pickupLocation, setPickupLocation] = useState(searchState.pickupLocation || '');
  const [dropoffLocation, setDropoffLocation] = useState(searchState.dropoffLocation || '');
  const [pickupDate, setPickupDate] = useState<Date | null>(searchState.pickupDate || null);
  const [pickupTime, setPickupTime] = useState(searchState.pickupTime || '');

  // Modal states
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [showPickupInput, setShowPickupInput] = useState(false);
  const [showDropoffInput, setShowDropoffInput] = useState(false);

  const [selectedDestination, setSelectedDestination] = useState<{
    id: number;
    name: string;
    type: 'city' | 'country';
  } | null>(searchState.destinationId ? {
    id: searchState.destinationId,
    name: searchState.destination,
    type: searchState.destinationType || 'city',
  } : null);

  // Sync guests total from breakdown
  useEffect(() => {
    setGuests(adults + children);
  }, [adults, children]);

  // Ref for reliable input focus
  const destinationInputRef = useRef<TextInput>(null);

  // Focus input when destination dropdown opens
  useEffect(() => {
    if (showDestinationDropdown && destinationInputRef.current) {
      // Small delay to ensure modal is rendered
      const timer = setTimeout(() => {
        destinationInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showDestinationDropdown]);

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setShowDestinationDropdown(false);
    setShowDatePicker(false);
    setShowGuestPicker(false);
    setShowTimePicker(false);
    setShowDurationPicker(false);
    setShowPickupInput(false);
    setShowDropoffInput(false);
  };

  // NOTE: Removed document click-outside handler - it was breaking modal interactions
  // The Modal component's backdrop already handles click-outside-to-close

  // Filter destinations based on search input
  const filteredDestinations = useMemo(() => {
    if (destination) {
      return destinations.filter(d =>
        d.name.toLowerCase().includes(destination.toLowerCase())
      ).slice(0, 8);
    }
    // Show featured destinations when no search
    return featured;
  }, [destination, destinations, featured]);

  const handleDatesChange = (start: Date | null, end: Date | null) => {
    if (isYacht) {
      // Yacht uses single date
      setCharterDate(start);
      closeAllDropdowns();
    } else if (isTransport) {
      // Transport uses single date
      setPickupDate(start);
      closeAllDropdowns();
    } else {
      // Villa uses date range
      setCheckIn(start);
      setCheckOut(end);
      if (start && end) {
        closeAllDropdowns();
      }
    }
  };

  const handleSearch = () => {
    const baseParams = {
      category,
      destination: selectedDestination?.name || destination,
      destinationId: selectedDestination?.id,
      destinationType: selectedDestination?.type,
      guests,
      adults,
      children,
      infants,
      occasion,
    };

    let searchParams: SearchParams;

    if (isYacht) {
      searchParams = {
        ...baseParams,
        checkIn: null,
        checkOut: null,
        charterDate,
        charterTime,
        charterDuration,
      };
    } else if (isTransport) {
      searchParams = {
        ...baseParams,
        checkIn: null,
        checkOut: null,
        pickupLocation,
        dropoffLocation,
        pickupDate,
        pickupTime,
      };
    } else {
      searchParams = {
        ...baseParams,
        checkIn,
        checkOut,
      };
    }

    // Update context so search persists across pages
    setSearchState(searchParams);

    onSearch?.(searchParams);
    closeAllDropdowns();
  };

  const handleReset = () => {
    // Reset all fields
    setDestination('');
    setSelectedDestination(null);
    setCheckIn(null);
    setCheckOut(null);
    setGuests(2);
    setAdults(2);
    setChildren(0);
    setInfants(0);
    setOccasion('');
    setCharterDate(null);
    setCharterTime('');
    setCharterDuration('');
    setPickupLocation('');
    setDropoffLocation('');
    setPickupDate(null);
    setPickupTime('');
    closeAllDropdowns();

    const resetParams: SearchParams = {
      category: 'all',
      destination: '',
      destinationId: undefined,
      destinationType: undefined,
      checkIn: null,
      checkOut: null,
      guests: 2,
      adults: 2,
      children: 0,
      infants: 0,
      occasion: '',
    };

    // Clear context
    setSearchState(resetParams);

    // Reset search without scrolling
    onSearch?.(resetParams);
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return isMobile ? 'Add' : 'Add dates';
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return isMobile ? `${month.slice(0, 3)} ${day}` : `${month} ${day}`;
  };

  const formatSingleDate = (date: Date | null): string => {
    if (!date) return isMobile ? 'Date' : 'Select date';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (time: string): string => {
    if (!time) return isMobile ? 'Time' : 'Select time';
    const found = DEPARTURE_TIMES.find(t => t.value === time);
    return found?.label || time;
  };

  const formatDuration = (duration: string): string => {
    if (!duration) return isMobile ? 'Duration' : 'Select duration';
    const found = CHARTER_DURATIONS.find(d => d.value === duration);
    return found?.label || duration;
  };

  const hasActiveFilters = destination || checkIn || checkOut || guests !== 2;

  const handleDestinationSelect = (dest: Destination) => {
    setDestination(dest.name);
    setSelectedDestination({
      id: dest.id,
      name: dest.name,
      type: dest.type,
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
        <Pressable
          style={({ pressed }) => [
            styles.field,
            isMobile && [styles.fieldMobile, styles.fieldMobileWhere],
            pressed && styles.fieldPressed
          ]}
          onPress={openDestinationDropdown}
        >
          <Text style={[styles.label, isMobile && styles.labelMobile]} numberOfLines={1}>
            {isMobile ? 'Where' : 'Where'}
          </Text>
          <Text
            style={[styles.value, !destination && styles.valuePlaceholder, isMobile && styles.valueMobile]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {destination || (isMobile ? "Any" : "Search destinations")}
          </Text>
        </Pressable>

        <View style={[styles.divider, isMobile && styles.dividerMobile]} />

        {/* VILLA/HOTEL: Check In + Check Out */}
        {isVillaType && (
          <>
            <Pressable
              style={({ pressed }) => [
                styles.field,
                isMobile && [styles.fieldMobile, styles.fieldMobileDate],
                pressed && styles.fieldPressed
              ]}
              onPress={openDatePicker}
            >
              <Text style={[styles.label, isMobile && styles.labelMobile]} numberOfLines={1}>
                {isMobile ? 'In' : 'Check in'}
              </Text>
              <Text
                style={[styles.value, !checkIn && styles.valuePlaceholder, isMobile && styles.valueMobile]}
                numberOfLines={1}
              >
                {formatDate(checkIn)}
              </Text>
            </Pressable>

            <View style={[styles.divider, isMobile && styles.dividerMobile]} />

            <Pressable
              style={({ pressed }) => [
                styles.field,
                checkIn && !checkOut && styles.fieldHighlight,
                isMobile && [styles.fieldMobile, styles.fieldMobileDate],
                pressed && styles.fieldPressed
              ]}
              onPress={openDatePicker}
            >
              <Text style={[styles.label, isMobile && styles.labelMobile]} numberOfLines={1}>
                {isMobile ? 'Out' : 'Check out'}
              </Text>
              <Text
                style={[styles.value, !checkOut && styles.valuePlaceholder, isMobile && styles.valueMobile]}
                numberOfLines={1}
              >
                {formatDate(checkOut)}
              </Text>
            </Pressable>
          </>
        )}

        {/* YACHT: Charter Date + Time + Duration */}
        {isYacht && (
          <>
            <Pressable
              style={({ pressed }) => [
                styles.field,
                isMobile && [styles.fieldMobile, styles.fieldMobileDate],
                pressed && styles.fieldPressed
              ]}
              onPress={openDatePicker}
            >
              <Text style={[styles.label, isMobile && styles.labelMobile]} numberOfLines={1}>Date</Text>
              <Text
                style={[styles.value, !charterDate && styles.valuePlaceholder, isMobile && styles.valueMobile]}
                numberOfLines={1}
              >
                {formatSingleDate(charterDate)}
              </Text>
            </Pressable>

            <View style={[styles.divider, isMobile && styles.dividerMobile]} />

            <Pressable
              style={({ pressed }) => [
                styles.field,
                isMobile && [styles.fieldMobile, styles.fieldMobileDate],
                pressed && styles.fieldPressed
              ]}
              onPress={() => { closeAllDropdowns(); setShowTimePicker(true); }}
            >
              <Text style={[styles.label, isMobile && styles.labelMobile]} numberOfLines={1}>Time</Text>
              <Text
                style={[styles.value, !charterTime && styles.valuePlaceholder, isMobile && styles.valueMobile]}
                numberOfLines={1}
              >
                {formatTime(charterTime)}
              </Text>
            </Pressable>

            <View style={[styles.divider, isMobile && styles.dividerMobile]} />

            <Pressable
              style={({ pressed }) => [
                styles.field,
                isMobile && [styles.fieldMobile, styles.fieldMobileDate],
                pressed && styles.fieldPressed
              ]}
              onPress={() => { closeAllDropdowns(); setShowDurationPicker(true); }}
            >
              <Text style={[styles.label, isMobile && styles.labelMobile]} numberOfLines={1}>Duration</Text>
              <Text
                style={[styles.value, !charterDuration && styles.valuePlaceholder, isMobile && styles.valueMobile]}
                numberOfLines={1}
              >
                {formatDuration(charterDuration)}
              </Text>
            </Pressable>
          </>
        )}

        {/* TRANSPORT: Pickup + Dropoff + Date + Time */}
        {isTransport && (
          <>
            <Pressable
              style={({ pressed }) => [
                styles.field,
                isMobile && [styles.fieldMobile, styles.fieldMobileDate],
                pressed && styles.fieldPressed
              ]}
              onPress={() => { closeAllDropdowns(); setShowPickupInput(true); }}
            >
              <Text style={[styles.label, isMobile && styles.labelMobile]} numberOfLines={1}>Pickup</Text>
              <Text
                style={[styles.value, !pickupLocation && styles.valuePlaceholder, isMobile && styles.valueMobile]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {pickupLocation || (isMobile ? 'Location' : 'Pickup location')}
              </Text>
            </Pressable>

            <View style={[styles.divider, isMobile && styles.dividerMobile]} />

            <Pressable
              style={({ pressed }) => [
                styles.field,
                isMobile && [styles.fieldMobile, styles.fieldMobileDate],
                pressed && styles.fieldPressed
              ]}
              onPress={openDatePicker}
            >
              <Text style={[styles.label, isMobile && styles.labelMobile]} numberOfLines={1}>Date</Text>
              <Text
                style={[styles.value, !pickupDate && styles.valuePlaceholder, isMobile && styles.valueMobile]}
                numberOfLines={1}
              >
                {formatSingleDate(pickupDate)}
              </Text>
            </Pressable>

            <View style={[styles.divider, isMobile && styles.dividerMobile]} />

            <Pressable
              style={({ pressed }) => [
                styles.field,
                isMobile && [styles.fieldMobile, styles.fieldMobileDate],
                pressed && styles.fieldPressed
              ]}
              onPress={() => { closeAllDropdowns(); setShowTimePicker(true); }}
            >
              <Text style={[styles.label, isMobile && styles.labelMobile]} numberOfLines={1}>Time</Text>
              <Text
                style={[styles.value, !pickupTime && styles.valuePlaceholder, isMobile && styles.valueMobile]}
                numberOfLines={1}
              >
                {formatTime(pickupTime)}
              </Text>
            </Pressable>
          </>
        )}

        <View style={[styles.divider, isMobile && styles.dividerMobile]} />

        {/* Guests */}
        <Pressable
          style={({ pressed }) => [
            styles.field,
            isMobile && [styles.fieldMobile, styles.fieldMobileGuest],
            pressed && styles.fieldPressed
          ]}
          onPress={openGuestPicker}
        >
          <Text style={[styles.label, isMobile && styles.labelMobile]} numberOfLines={1}>
            {isMobile ? 'Who' : 'Guests'}
          </Text>
          <Text style={[styles.value, isMobile && styles.valueMobile]} numberOfLines={1}>{guests}</Text>
        </Pressable>

        {/* Clear Button - In flex flow, before search button */}
        {hasActiveFilters && (
          <Pressable
            style={[styles.clearButtonFlex, isMobile && styles.clearButtonFlexMobile]}
            onPress={handleReset}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Feather name="x" size={isMobile ? 14 : 16} color={BrandColors.gray.dark} />
          </Pressable>
        )}

        {/* Search Button */}
        <Pressable style={[styles.searchButton, isMobile && styles.searchButtonMobile]} onPress={handleSearch}>
          <Feather name="search" size={isMobile ? 18 : 20} color={BrandColors.white} />
          {!isMobile && <Text style={styles.searchButtonText}>Search</Text>}
        </Pressable>
      </View>

      {/* Destination Autocomplete Bottom Sheet */}
      <BottomSheet
        visible={showDestinationDropdown}
        onClose={() => setShowDestinationDropdown(false)}
        title="Where to?"
      >
        {/* Search Input - Always visible, prominent styling */}
        <View style={styles.searchInputContainer}>
          <Feather name="search" size={20} color={BrandColors.gray.medium} />
          <TextInput
            ref={destinationInputRef}
            style={styles.searchInput}
            placeholder="Search destinations"
            placeholderTextColor={BrandColors.gray.medium}
            value={destination}
            onChangeText={(text) => {
              setDestination(text);
              // Only clear selection if text differs from selected destination
              if (selectedDestination && text.toLowerCase() !== selectedDestination.name.toLowerCase()) {
                setSelectedDestination(null);
              }
            }}
            onSubmitEditing={() => {
              closeAllDropdowns();
              handleSearch();
            }}
            autoFocus={false} // Using ref-based focus instead
            returnKeyType="search"
            clearButtonMode="while-editing"
            autoCapitalize="words"
            autoCorrect={false}
          />
          {destination.length > 0 && (
            <Pressable
              onPress={() => {
                setDestination('');
                setSelectedDestination(null);
              }}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Feather name="x-circle" size={18} color={BrandColors.gray.medium} />
            </Pressable>
          )}
        </View>

        {/* Featured Destinations Grid - Show visual cards when not searching */}
        {!destination && loading && (
          <>
            <Text style={styles.sectionLabel}>Popular Destinations</Text>
            <View style={styles.destinationGrid}>
              {[...Array(6)].map((_, i) => (
                <View key={i} style={styles.destinationCardSkeleton}>
                  <View style={styles.skeletonPulse} />
                  <View style={styles.destinationCardContent}>
                    <View style={styles.skeletonTextLarge} />
                    <View style={styles.skeletonTextSmall} />
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {!destination && !loading && featured.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Popular Destinations</Text>
            <View style={styles.destinationGrid}>
              {featured.map((dest) => (
                <TouchableOpacity
                  key={`${dest.type}-${dest.id}`}
                  style={styles.destinationCard}
                  activeOpacity={0.85}
                  onPress={() => handleDestinationSelect(dest)}
                >
                  {dest.imageUrl ? (
                    <Image
                      source={{ uri: dest.imageUrl }}
                      style={styles.destinationCardImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.destinationCardImage, styles.destinationCardPlaceholder]}>
                      <Feather name="map-pin" size={24} color={BrandColors.gray.medium} />
                    </View>
                  )}
                  <View style={styles.destinationCardOverlay} />
                  <View style={styles.destinationCardContent}>
                    <Text style={styles.destinationCardName}>{dest.name}</Text>
                    <Text style={styles.destinationCardMeta}>
                      {dest.propertyCount} {dest.propertyCount === 1 ? 'property' : 'properties'}
                      {dest.startingPrice && ` · From ${dest.startingPrice}`}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Search Results List - Show when searching */}
        {destination && filteredDestinations.length > 0 && (
          <View style={styles.destinationsList}>
            {filteredDestinations.map((dest) => (
              <TouchableOpacity
                key={`${dest.type}-${dest.id}`}
                style={styles.destinationItem}
                activeOpacity={0.7}
                onPress={() => handleDestinationSelect(dest)}
              >
                {dest.imageUrl ? (
                  <Image
                    source={{ uri: dest.imageUrl }}
                    style={styles.destinationItemImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.destinationIconContainer}>
                    <Feather
                      name={dest.type === 'city' ? 'map-pin' : 'globe'}
                      size={20}
                      color={BrandColors.black}
                    />
                  </View>
                )}
                <View style={styles.destinationInfo}>
                  <Text style={styles.destinationName}>{dest.name}</Text>
                  <Text style={styles.destinationType}>
                    {dest.type === 'city' ? 'City' : 'Country'}
                    {dest.propertyCount > 0 && ` · ${dest.propertyCount} properties`}
                  </Text>
                </View>
                {dest.startingPrice && (
                  <Text style={styles.destinationPrice}>From {dest.startingPrice}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* No Results */}
        {destination && filteredDestinations.length === 0 ? (
          <View style={styles.noResults}>
            <Feather name="map-pin" size={32} color={BrandColors.gray.medium} style={{ marginBottom: Space[3] }} />
            <Text style={styles.noResultsText}>No destinations found for "{destination}"</Text>
            <Text style={styles.noResultsHint}>Try a different search or explore our curated destinations</Text>

            {/* Search Anyway Option */}
            <Pressable
              style={({ pressed }) => [styles.searchAnywayButton, pressed && styles.searchAnywayButtonPressed]}
              onPress={() => {
                setSelectedDestination(null);
                closeAllDropdowns();
                handleSearch();
              }}
            >
              <Feather name="search" size={16} color={BrandColors.black} />
              <Text style={styles.searchAnywayText}>Search "{destination}" anyway</Text>
            </Pressable>

            {/* Message Concierge CTA */}
            <Pressable
              style={({ pressed }) => [styles.conciergeButton, pressed && styles.conciergeButtonPressed]}
              onPress={() => {
                closeAllDropdowns();
                // Navigate to contact or open WhatsApp
                if (Platform.OS === 'web') {
                  window.open('https://wa.me/1234567890?text=Hi, I\'m looking for properties in ' + destination, '_blank');
                }
              }}
            >
              <Feather name="message-circle" size={16} color={BrandColors.white} />
              <Text style={styles.conciergeButtonText}>Message Concierge</Text>
            </Pressable>
          </View>
        ) : null}
      </BottomSheet>

      {/* Date Picker Bottom Sheet */}
      <BottomSheet
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        title="Select Dates"
        scrollEnabled={false}
      >
        {/* Quick Date Presets */}
        <View style={styles.datePresets}>
          <Text style={styles.presetsLabel}>Quick Select</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsScroll}>
            <View style={styles.presetsRow}>
              {DATE_PRESETS.map((preset) => (
                <TouchableOpacity
                  key={preset.label}
                  style={styles.presetChip}
                  activeOpacity={0.7}
                  onPress={() => {
                    const { start, end } = preset.getValue();
                    setCheckIn(start);
                    setCheckOut(end);
                  }}
                >
                  <Text style={styles.presetChipText}>{preset.label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.presetChip, styles.presetChipFlexible]}
                activeOpacity={0.7}
                onPress={() => {
                  setCheckIn(null);
                  setCheckOut(null);
                }}
              >
                <Feather name="calendar" size={14} color={BrandColors.secondary} />
                <Text style={[styles.presetChipText, styles.presetChipTextFlexible]}>I'm flexible</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        <DatePicker
          startDate={checkIn || undefined}
          endDate={checkOut || undefined}
          onDatesChange={handleDatesChange}
          minDate={new Date()}
        />
        <Pressable
          style={styles.applyButton}
          onPress={() => setShowDatePicker(false)}
        >
          <Text style={styles.applyButtonText}>
            {checkIn && checkOut ? 'Apply' : 'Done'}
          </Text>
        </Pressable>
      </BottomSheet>

      {/* Guest Picker Bottom Sheet */}
      <BottomSheet
        visible={showGuestPicker}
        onClose={() => setShowGuestPicker(false)}
        title="Who's coming?"
        scrollEnabled={true}
      >
        <View style={styles.guestPickerContent}>
          {/* Adults */}
          <View style={styles.guestRow}>
            <View style={styles.guestRowInfo}>
              <Text style={styles.guestLabel}>Adults</Text>
              <Text style={styles.guestSubLabel}>Ages 13+</Text>
            </View>
            <View style={styles.guestControls}>
              <Pressable
                style={[styles.guestButton, adults <= 1 && styles.guestButtonDisabled]}
                onPress={() => setAdults(Math.max(1, adults - 1))}
                disabled={adults <= 1}
              >
                <Feather name="minus" size={18} color={adults <= 1 ? BrandColors.gray.border : BrandColors.gray.dark} />
              </Pressable>
              <Text style={styles.guestCount}>{adults}</Text>
              <Pressable
                style={styles.guestButton}
                onPress={() => setAdults(Math.min(20, adults + 1))}
              >
                <Feather name="plus" size={18} color={BrandColors.gray.dark} />
              </Pressable>
            </View>
          </View>

          {/* Children */}
          <View style={styles.guestRow}>
            <View style={styles.guestRowInfo}>
              <Text style={styles.guestLabel}>Children</Text>
              <Text style={styles.guestSubLabel}>Ages 2-12</Text>
            </View>
            <View style={styles.guestControls}>
              <Pressable
                style={[styles.guestButton, children <= 0 && styles.guestButtonDisabled]}
                onPress={() => setChildren(Math.max(0, children - 1))}
                disabled={children <= 0}
              >
                <Feather name="minus" size={18} color={children <= 0 ? BrandColors.gray.border : BrandColors.gray.dark} />
              </Pressable>
              <Text style={styles.guestCount}>{children}</Text>
              <Pressable
                style={styles.guestButton}
                onPress={() => setChildren(Math.min(10, children + 1))}
              >
                <Feather name="plus" size={18} color={BrandColors.gray.dark} />
              </Pressable>
            </View>
          </View>

          {/* Infants */}
          <View style={styles.guestRow}>
            <View style={styles.guestRowInfo}>
              <Text style={styles.guestLabel}>Infants</Text>
              <Text style={styles.guestSubLabel}>Under 2</Text>
            </View>
            <View style={styles.guestControls}>
              <Pressable
                style={[styles.guestButton, infants <= 0 && styles.guestButtonDisabled]}
                onPress={() => setInfants(Math.max(0, infants - 1))}
                disabled={infants <= 0}
              >
                <Feather name="minus" size={18} color={infants <= 0 ? BrandColors.gray.border : BrandColors.gray.dark} />
              </Pressable>
              <Text style={styles.guestCount}>{infants}</Text>
              <Pressable
                style={styles.guestButton}
                onPress={() => setInfants(Math.min(5, infants + 1))}
              >
                <Feather name="plus" size={18} color={BrandColors.gray.dark} />
              </Pressable>
            </View>
          </View>

          {/* Occasion Selector */}
          <View style={styles.occasionSection}>
            <Text style={styles.occasionLabel}>Traveling for...</Text>
            <View style={styles.occasionGrid}>
              {OCCASIONS.map((occ) => (
                <TouchableOpacity
                  key={occ.value}
                  style={[
                    styles.occasionChip,
                    occasion === occ.value && styles.occasionChipActive
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setOccasion(occasion === occ.value ? '' : occ.value)}
                >
                  <Feather
                    name={occ.icon as any}
                    size={16}
                    color={occasion === occ.value ? BrandColors.white : BrandColors.gray.dark}
                  />
                  <Text style={[
                    styles.occasionChipText,
                    occasion === occ.value && styles.occasionChipTextActive
                  ]}>
                    {occ.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Summary */}
          <View style={styles.guestSummary}>
            <Text style={styles.guestSummaryText}>
              {guests} {guests === 1 ? 'guest' : 'guests'}
              {infants > 0 && `, ${infants} ${infants === 1 ? 'infant' : 'infants'}`}
              {occasion && ` · ${OCCASIONS.find(o => o.value === occasion)?.label}`}
            </Text>
          </View>

          <Pressable
            style={styles.applyButton}
            onPress={() => setShowGuestPicker(false)}
          >
            <Text style={styles.applyButtonText}>Apply</Text>
          </Pressable>
        </View>
      </BottomSheet>

      {/* Time Picker Bottom Sheet (Yacht/Transport) */}
      <BottomSheet
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        title={isYacht ? "Departure Time" : "Pickup Time"}
        scrollEnabled={true}
      >
        <View style={styles.timePickerContent}>
          {DEPARTURE_TIMES.map((time) => (
            <TouchableOpacity
              key={time.value}
              style={[
                styles.timeOption,
                (isYacht ? charterTime : pickupTime) === time.value && styles.timeOptionActive
              ]}
              activeOpacity={0.7}
              onPress={() => {
                if (isYacht) {
                  setCharterTime(time.value);
                } else {
                  setPickupTime(time.value);
                }
                setShowTimePicker(false);
              }}
            >
              <Text style={[
                styles.timeOptionText,
                (isYacht ? charterTime : pickupTime) === time.value && styles.timeOptionTextActive
              ]}>
                {time.label}
              </Text>
              {(isYacht ? charterTime : pickupTime) === time.value && (
                <Feather name="check" size={20} color={BrandColors.white} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheet>

      {/* Duration Picker Bottom Sheet (Yacht only) */}
      <BottomSheet
        visible={showDurationPicker}
        onClose={() => setShowDurationPicker(false)}
        title="Charter Duration"
        scrollEnabled={true}
      >
        <View style={styles.durationPickerContent}>
          {CHARTER_DURATIONS.map((duration) => (
            <TouchableOpacity
              key={duration.value}
              style={[
                styles.durationOption,
                charterDuration === duration.value && styles.durationOptionActive
              ]}
              activeOpacity={0.7}
              onPress={() => {
                setCharterDuration(duration.value);
                setShowDurationPicker(false);
              }}
            >
              <View style={styles.durationInfo}>
                <Text style={[
                  styles.durationLabel,
                  charterDuration === duration.value && styles.durationLabelActive
                ]}>
                  {duration.label}
                </Text>
                <Text style={[
                  styles.durationDescription,
                  charterDuration === duration.value && styles.durationDescriptionActive
                ]}>
                  {duration.description}
                </Text>
              </View>
              {charterDuration === duration.value && (
                <Feather name="check" size={20} color={BrandColors.white} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheet>

      {/* Pickup Location Input Bottom Sheet (Transport only) */}
      <BottomSheet
        visible={showPickupInput}
        onClose={() => setShowPickupInput(false)}
        title="Pickup Location"
        scrollEnabled={true}
      >
        <View style={styles.locationInputContent}>
          <View style={styles.locationInputContainer}>
            <Feather name="map-pin" size={20} color={BrandColors.gray.medium} />
            <TextInput
              style={styles.locationInput}
              placeholder="Hotel, airport, address..."
              placeholderTextColor={BrandColors.gray.medium}
              value={pickupLocation}
              onChangeText={setPickupLocation}
              autoFocus={true}
              returnKeyType="done"
              onSubmitEditing={() => setShowPickupInput(false)}
            />
            {pickupLocation.length > 0 && (
              <Pressable
                onPress={() => setPickupLocation('')}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <Feather name="x-circle" size={18} color={BrandColors.gray.medium} />
              </Pressable>
            )}
          </View>

          {/* Common locations */}
          <Text style={styles.commonLocationsLabel}>Common Locations</Text>
          {['Airport', 'Hotel/Resort', 'Port/Marina', 'City Center'].map((loc) => (
            <TouchableOpacity
              key={loc}
              style={styles.commonLocationItem}
              activeOpacity={0.7}
              onPress={() => {
                setPickupLocation(loc);
                setShowPickupInput(false);
              }}
            >
              <Feather
                name={loc === 'Airport' ? 'navigation' : loc.includes('Hotel') ? 'home' : loc.includes('Port') ? 'anchor' : 'map-pin'}
                size={18}
                color={BrandColors.gray.dark}
              />
              <Text style={styles.commonLocationText}>{loc}</Text>
            </TouchableOpacity>
          ))}

          <Pressable
            style={styles.applyButton}
            onPress={() => setShowPickupInput(false)}
          >
            <Text style={styles.applyButtonText}>Done</Text>
          </Pressable>
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 900,
    position: 'relative',
    paddingHorizontal: Platform.OS === 'web' ? 0 : Space[4],
  },
  searchBox: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.white,
    borderRadius: Radius.full,
    paddingVertical: Space[3], // 12px - more breathing room
    paddingHorizontal: Space[4], // 16px - balanced padding
    paddingRight: Space[2], // Tighter on right for search button
    ...Shadow.lg,
    minHeight: 68, // Comfortable height for desktop
  },
  searchBoxMobile: {
    borderRadius: Radius.xl, // 16px - softer corners
    paddingVertical: Space[3], // 12px
    paddingHorizontal: Space[3], // 12px
    paddingRight: Space[2], // 8px - room for search button
    minHeight: TouchTarget.spacious, // 56px - iOS comfortable
  },
  // Clear button - flex item before search button (no absolute positioning)
  clearButtonFlex: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: BrandColors.gray.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Space[2],
    flexShrink: 0,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  clearButtonFlexMobile: {
    width: 28,
    height: 28,
    marginLeft: Space[1],
  },
  // Field container
  field: {
    flex: 1,
    paddingHorizontal: Space[4], // 16px
    paddingVertical: Space[3], // 12px - more vertical room
    justifyContent: 'center',
    minHeight: TouchTarget.comfortable, // 48px
  },
  fieldMobile: {
    paddingHorizontal: Space[2], // 8px - tighter but balanced
    paddingVertical: Space[2], // 8px
    minHeight: TouchTarget.min, // 44px - iOS minimum
    overflow: 'hidden', // Prevent text overflow
  },
  fieldPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: Radius.lg, // 12px - match container feel
  },
  fieldHighlight: {
    backgroundColor: 'rgba(188, 148, 77, 0.08)',
    borderRadius: Radius.lg,
  },
  // Mobile field sizing - balanced proportions with 8pt grid
  fieldMobileWhere: {
    flex: 1.2, // Compact - "Where" + "Any"
    minWidth: Space[14], // 56px - 8pt grid
  },
  fieldMobileDate: {
    flex: 1, // Equal for "In" / "Out" + date
    minWidth: Space[12], // 48px - 8pt grid
  },
  fieldMobileGuest: {
    flex: 0.6, // Smallest - "Who" + number
    minWidth: Space[10], // 40px - 8pt grid
  },
  // Typography - Labels (small, light weight, muted)
  label: {
    fontSize: FontSize.xs, // 11px - consistent token
    lineHeight: 14,
    fontWeight: FontWeight.medium, // Lighter than value
    color: BrandColors.gray.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Space[1], // 4px - 8pt grid
  },
  labelMobile: {
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.5,
  },
  // Typography - Values (larger, bold, high contrast)
  value: {
    fontSize: FontSize.md, // 16px
    lineHeight: LineHeight.md,
    fontWeight: FontWeight.bold, // Strong emphasis
    color: BrandColors.black,
  },
  valueMobile: {
    fontSize: FontSize.base, // 15px
    lineHeight: LineHeight.base,
    fontWeight: FontWeight.bold, // Keep bold on mobile
  },
  valuePlaceholder: {
    color: BrandColors.gray.medium,
    fontWeight: FontWeight.normal, // Light for placeholder
  },
  // Dividers - subtle separators
  divider: {
    width: 1,
    height: 28, // Balanced with field height
    backgroundColor: BrandColors.gray.border,
    marginHorizontal: Space[1], // 4px
  },
  dividerMobile: {
    height: 20, // Smaller on mobile
    marginHorizontal: Space[1], // Keep some margin
    opacity: 0.6, // Subtle on mobile
  },
  // Search button - prominent CTA
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space[2], // 8px
    backgroundColor: BrandColors.black,
    paddingHorizontal: Space[5], // 20px
    paddingVertical: Space[3], // 12px
    borderRadius: Radius.full,
    marginLeft: Space[3], // 12px - breathing room
    minHeight: TouchTarget.comfortable, // 48px
  },
  searchButtonMobile: {
    paddingHorizontal: Space[3], // 12px
    paddingVertical: Space[3], // 12px
    minHeight: TouchTarget.min, // 44px
    minWidth: TouchTarget.min, // 44px - square on mobile
    marginLeft: Space[2], // 8px
  },
  searchButtonText: {
    fontSize: FontSize.base,
    lineHeight: LineHeight.base,
    fontWeight: FontWeight.semibold,
    color: BrandColors.white,
  },
  // Bottom Sheet Content Styles - Prominent search input
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[3],
    paddingHorizontal: Space[4],
    paddingVertical: Space[4], // More vertical padding
    backgroundColor: BrandColors.white,
    borderRadius: Radius.xl, // Larger radius
    borderWidth: 2,
    borderColor: BrandColors.gray.border,
    marginBottom: Space[4],
    minHeight: TouchTarget.spacious, // 56px - prominent
    ...Shadow.sm, // Subtle shadow for depth
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.lg, // Larger font
    lineHeight: LineHeight.lg,
    color: BrandColors.black,
    minHeight: TouchTarget.min,
    paddingVertical: Space[2],
    fontWeight: FontWeight.medium,
  },
  // Section label for "Popular Destinations"
  sectionLabel: {
    fontSize: FontSize.xs,
    lineHeight: LineHeight.xs,
    fontWeight: FontWeight.semibold,
    color: BrandColors.gray.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Space[3],
    marginTop: Space[2],
  },
  // Container for destination items (replaces FlatList)
  destinationsList: {
    marginTop: Space[2],
  },
  noResults: {
    paddingVertical: Space[10],
    paddingHorizontal: Space[4],
    alignItems: 'center',
    gap: Space[3],
  },
  noResultsText: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
    textAlign: 'center',
  },
  noResultsHint: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.medium,
    textAlign: 'center',
    marginBottom: Space[4],
  },
  // Search Anyway button
  searchAnywayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space[2],
    paddingVertical: Space[3],
    paddingHorizontal: Space[5],
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: BrandColors.gray.border,
    backgroundColor: BrandColors.white,
    marginTop: Space[2],
    minHeight: TouchTarget.min,
  },
  searchAnywayButtonPressed: {
    backgroundColor: BrandColors.gray.light,
  },
  searchAnywayText: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    fontWeight: FontWeight.medium,
    color: BrandColors.black,
  },
  // Message Concierge CTA button
  conciergeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space[2],
    paddingVertical: Space[3],
    paddingHorizontal: Space[5],
    borderRadius: Radius.full,
    backgroundColor: BrandColors.black,
    marginTop: Space[3],
    minHeight: TouchTarget.min,
  },
  conciergeButtonPressed: {
    backgroundColor: BrandColors.gray.darker,
  },
  conciergeButtonText: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    fontWeight: FontWeight.semibold,
    color: BrandColors.white,
  },
  destinationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Space[4],
    paddingHorizontal: Space[4],
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray.border,
    gap: Space[4],
    minHeight: TouchTarget.comfortable, // Ensure comfortable touch target
  },
  destinationItemPressed: {
    backgroundColor: BrandColors.gray.light,
  },
  destinationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: BrandColors.gray.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destinationInfo: {
    flex: 1,
  },
  destinationName: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    fontWeight: FontWeight.medium,
    color: BrandColors.black,
    marginBottom: Space[1],
  },
  destinationType: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.medium,
  },
  guestPickerContent: {
    gap: Space[8],
  },
  guestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Space[4],
  },
  guestLabel: {
    fontSize: FontSize.lg,
    lineHeight: LineHeight.lg,
    fontWeight: FontWeight.medium,
    color: BrandColors.black,
  },
  guestControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[6],
  },
  guestButton: {
    width: TouchTarget.min,
    height: TouchTarget.min,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: BrandColors.gray.border,
    backgroundColor: BrandColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestCount: {
    fontSize: FontSize.xl,
    lineHeight: LineHeight.xl,
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
    minWidth: 48,
    textAlign: 'center',
  },
  applyButton: {
    backgroundColor: BrandColors.black,
    paddingVertical: Space[4],
    paddingHorizontal: Space[8],
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: TouchTarget.min,
    marginTop: Space[4],
  },
  applyButtonText: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    fontWeight: FontWeight.semibold,
    color: BrandColors.white,
  },

  // Visual Destination Cards Grid
  destinationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space[3],
    marginTop: Space[2],
  },
  destinationCard: {
    width: '48%',
    aspectRatio: 1.4,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    position: 'relative',
    ...Shadow.md,
  },
  destinationCardImage: {
    width: '100%',
    height: '100%',
    backgroundColor: BrandColors.gray.light,
  },
  destinationCardPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  destinationCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)',
  },
  destinationCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Space[3],
  },
  destinationCardName: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    fontWeight: FontWeight.bold,
    color: BrandColors.white,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  destinationCardMeta: {
    fontSize: FontSize.xs,
    lineHeight: LineHeight.xs,
    color: 'rgba(255,255,255,0.9)',
    marginTop: Space[1],
  },

  // Destination Item with Image
  destinationItemImage: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: BrandColors.gray.light,
  },
  destinationPrice: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    fontWeight: FontWeight.semibold,
    color: BrandColors.secondary,
  },

  // Date Presets
  datePresets: {
    marginBottom: Space[4],
  },
  presetsLabel: {
    fontSize: FontSize.xs,
    lineHeight: LineHeight.xs,
    fontWeight: FontWeight.semibold,
    color: BrandColors.gray.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Space[2],
  },
  presetsScroll: {
    marginHorizontal: -Space[2],
  },
  presetsRow: {
    flexDirection: 'row',
    gap: Space[2],
    paddingHorizontal: Space[2],
  },
  presetChip: {
    paddingVertical: Space[3],
    paddingHorizontal: Space[5],
    borderRadius: Radius.full,
    backgroundColor: BrandColors.white,
    borderWidth: 1.5,
    borderColor: BrandColors.gray.border,
    minHeight: TouchTarget.min,
    justifyContent: 'center',
    ...Shadow.sm,
  },
  presetChipFlexible: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[2],
    backgroundColor: 'rgba(188, 148, 77, 0.08)',
    borderColor: BrandColors.secondary,
    borderWidth: 1.5,
  },
  presetChipText: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
    letterSpacing: 0.2,
  },
  presetChipTextFlexible: {
    color: BrandColors.secondary,
    fontWeight: FontWeight.semibold,
  },

  // Guest Breakdown Styles
  guestRowInfo: {
    flex: 1,
  },
  guestSubLabel: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.medium,
    marginTop: Space[1],
  },
  guestButtonDisabled: {
    borderColor: BrandColors.gray.light,
    backgroundColor: BrandColors.gray.light,
  },

  // Occasion Selector
  occasionSection: {
    paddingTop: Space[4],
    borderTopWidth: 1,
    borderTopColor: BrandColors.gray.border,
  },
  occasionLabel: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    fontWeight: FontWeight.medium,
    color: BrandColors.black,
    marginBottom: Space[3],
  },
  occasionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space[2],
  },
  occasionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[2],
    paddingVertical: Space[3],
    paddingHorizontal: Space[4],
    borderRadius: Radius.full,
    backgroundColor: BrandColors.white,
    borderWidth: 1.5,
    borderColor: BrandColors.gray.border,
    minHeight: TouchTarget.min,
    ...Shadow.sm,
  },
  occasionChipActive: {
    backgroundColor: BrandColors.black,
    borderColor: BrandColors.black,
    ...Shadow.md,
  },
  occasionChipText: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
    letterSpacing: 0.2,
  },
  occasionChipTextActive: {
    color: BrandColors.white,
  },

  // Guest Summary
  guestSummary: {
    paddingVertical: Space[3],
    alignItems: 'center',
  },
  guestSummaryText: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    fontWeight: FontWeight.medium,
    color: BrandColors.gray.dark,
  },

  // Skeleton Loading Styles
  destinationCardSkeleton: {
    width: '48%',
    aspectRatio: 1.4,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: BrandColors.gray.light,
  },
  skeletonPulse: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BrandColors.gray.border,
    opacity: 0.5,
    ...Platform.select({
      web: {
        animation: 'pulse 1.5s ease-in-out infinite',
      },
    }),
  },
  skeletonTextLarge: {
    width: '70%',
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: Radius.sm,
    marginBottom: Space[1],
  },
  skeletonTextSmall: {
    width: '50%',
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radius.sm,
  },

  // Time Picker Styles
  timePickerContent: {
    gap: Space[2],
  },
  timeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Space[4],
    paddingHorizontal: Space[4],
    borderRadius: Radius.lg,
    backgroundColor: BrandColors.white,
    borderWidth: 1.5,
    borderColor: BrandColors.gray.border,
    minHeight: TouchTarget.comfortable,
  },
  timeOptionActive: {
    backgroundColor: BrandColors.black,
    borderColor: BrandColors.black,
  },
  timeOptionText: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    fontWeight: FontWeight.medium,
    color: BrandColors.black,
  },
  timeOptionTextActive: {
    color: BrandColors.white,
  },

  // Duration Picker Styles
  durationPickerContent: {
    gap: Space[3],
  },
  durationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Space[4],
    paddingHorizontal: Space[4],
    borderRadius: Radius.lg,
    backgroundColor: BrandColors.white,
    borderWidth: 1.5,
    borderColor: BrandColors.gray.border,
    minHeight: TouchTarget.spacious,
  },
  durationOptionActive: {
    backgroundColor: BrandColors.black,
    borderColor: BrandColors.black,
  },
  durationInfo: {
    flex: 1,
  },
  durationLabel: {
    fontSize: FontSize.lg,
    lineHeight: LineHeight.lg,
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
  },
  durationLabelActive: {
    color: BrandColors.white,
  },
  durationDescription: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.medium,
    marginTop: Space[1],
  },
  durationDescriptionActive: {
    color: 'rgba(255,255,255,0.8)',
  },

  // Location Input Styles
  locationInputContent: {
    gap: Space[4],
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[3],
    paddingHorizontal: Space[4],
    paddingVertical: Space[4],
    backgroundColor: BrandColors.white,
    borderRadius: Radius.xl,
    borderWidth: 2,
    borderColor: BrandColors.gray.border,
    minHeight: TouchTarget.spacious,
    ...Shadow.sm,
  },
  locationInput: {
    flex: 1,
    fontSize: FontSize.lg,
    lineHeight: LineHeight.lg,
    color: BrandColors.black,
    minHeight: TouchTarget.min,
    paddingVertical: Space[2],
    fontWeight: FontWeight.medium,
  },
  commonLocationsLabel: {
    fontSize: FontSize.xs,
    lineHeight: LineHeight.xs,
    fontWeight: FontWeight.semibold,
    color: BrandColors.gray.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: Space[2],
  },
  commonLocationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[3],
    paddingVertical: Space[4],
    paddingHorizontal: Space[2],
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray.border,
    minHeight: TouchTarget.comfortable,
  },
  commonLocationText: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    fontWeight: FontWeight.medium,
    color: BrandColors.black,
  },
});
