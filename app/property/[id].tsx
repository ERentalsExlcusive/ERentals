import { StyleSheet, View, Text, ScrollView, Pressable, Platform, useWindowDimensions, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { getRentals, getRentalGallery, GalleryImage } from '@/services/api';
import { Rental } from '@/types/rental';
import { BrandColors, Spacing } from '@/constants/theme';
import { Space, FontSize, LineHeight, FontWeight, Radius, Shadow, ZIndex, Container, TouchTarget } from '@/constants/design-tokens';
import { BrandButton } from '@/components/brand-button';
import { PropertyGallery } from '@/components/property-gallery';
import { Header } from '@/components/header';
import { getPropertyDataBySlug } from '@/data/property-data';
import { useResponsive } from '@/hooks/use-responsive';
import { Feather } from '@expo/vector-icons';
import {
  LuxuryWiFiIcon,
  LuxuryPoolIcon,
  LuxuryACIcon,
  LuxuryParkingIcon,
  LuxuryKitchenIcon,
  LuxuryGymIcon,
  LuxuryBeachIcon,
  LuxuryTVIcon,
  LuxuryPetIcon,
  LuxuryWasherIcon,
} from '@/components/luxury-amenity-icons';
import { BookingCard } from '@/components/booking-card';
import { BookingBottomBar } from '@/components/booking-bottom-bar';
import { PropertyPageSkeleton } from '@/components/skeleton';
import { BookingInquiryForm } from '@/components/booking-inquiry-form';
import { BookingConfirmation } from '@/components/booking-confirmation';
import { CharterBookingForm, CharterBookingData } from '@/components/charter-booking-form';
import { useAvailability } from '@/hooks/use-availability';
import { useSearchContext } from '@/context/search-context';

// Map amenity names to luxury icons
function getAmenityIcon(amenity: string) {
  const lower = amenity.toLowerCase();
  if (lower.includes('wifi') || lower.includes('internet')) return LuxuryWiFiIcon;
  if (lower.includes('pool') || lower.includes('swimming')) return LuxuryPoolIcon;
  if (lower.includes('air') || lower.includes('ac') || lower.includes('conditioning')) return LuxuryACIcon;
  if (lower.includes('parking') || lower.includes('garage')) return LuxuryParkingIcon;
  if (lower.includes('kitchen') || lower.includes('chef')) return LuxuryKitchenIcon;
  if (lower.includes('gym') || lower.includes('fitness')) return LuxuryGymIcon;
  if (lower.includes('beach') || lower.includes('ocean')) return LuxuryBeachIcon;
  if (lower.includes('tv') || lower.includes('television') || lower.includes('entertainment')) return LuxuryTVIcon;
  if (lower.includes('pet')) return LuxuryPetIcon;
  if (lower.includes('washer') || lower.includes('laundry') || lower.includes('dryer')) return LuxuryWasherIcon;
  return null;
}

// Generate editorial luxury copy
function getEditorialDescription(rental: Rental): string {
  const category = rental.category?.name.toLowerCase() || 'property';
  const city = rental.city?.name;
  const country = rental.country?.name;

  const destinations: Record<string, string> = {
    'mykonos': 'the sun-drenched Cyclades',
    'santorini': 'the iconic caldera',
    'tulum': 'the Caribbean coastline',
    'ibiza': 'the Balearic Islands',
    'miami': 'the Miami shores',
    'malibu': 'the Pacific Coast',
    'aspen': 'the Rocky Mountains',
    'st barts': 'the French West Indies',
    'monaco': 'the French Riviera',
    'dubai': 'the Arabian Gulf',
  };

  const locale = destinations[city?.toLowerCase() || ''] || (city && country ? `${city}, ${country}` : 'an exclusive destination');

  const categoryDescriptors: Record<string, string[]> = {
    'villa': [
      `A sanctuary of refined living`,
      `An architectural masterpiece`,
      `A study in contemporary luxury`,
      `An exercise in sophisticated restraint`,
    ],
    'yacht': [
      `A floating palace of modern design`,
      `Maritime elegance redefined`,
      `Where nautical heritage meets contemporary luxury`,
      `An intimate vessel of exceptional pedigree`,
    ],
    'transport': [
      `Bespoke mobility, elevated`,
      `Travel as art form`,
      `Where journey becomes destination`,
      `Curated movement, refined experience`,
    ],
  };

  const descriptor = categoryDescriptors[category]?.[0] || 'An exceptional retreat';

  return `${descriptor} set against ${locale}. Every detail has been considered, every element curated. This is the art of living, distilled to its essence.`;
}

// Parse nightly rate from displayPrice string (e.g., "From $269 USD per night" -> 269)
function parseNightlyRate(displayPrice?: string): number | undefined {
  if (!displayPrice) return undefined;
  // Match price patterns like $269, $1,500, $2,500.00
  const match = displayPrice.match(/\$(\d+(?:,\d+)?(?:\.\d+)?)/);
  if (match) {
    // Remove commas and parse as float
    return parseFloat(match[1].replace(/,/g, ''));
  }
  return undefined;
}

// Generate location editorial copy
function getLocationCopy(city?: string, country?: string, category?: string): string {
  if (!city) return '';

  const locationNarratives: Record<string, string> = {
    'mykonos': 'Where ancient Cycladic tradition meets contemporary sophistication. Whitewashed architecture cascades down sun-bleached hillsides, while crystalline waters lap at private shores.',
    'santorini': 'Perched above the caldera, where volcanic drama meets serene Aegean beauty. Sunset becomes ceremony, architecture becomes art.',
    'tulum': 'Where jungle meets sea, ancient ruins meet modern design. The Caribbean whispers through palm fronds, turquoise waters stretch to infinity.',
    'ibiza': 'Beyond the mythology, a refined sanctuary. Pine-scented cliffs, hidden calas, and Mediterranean light that transforms the ordinary into the sublime.',
    'miami': 'Where Art Deco heritage meets contemporary glamour. Ocean breezes, palm-lined boulevards, and the rhythm of cosmopolitan living.',
    'malibu': 'Where the Pacific meets the Santa Monica Mountains. Endless horizon, golden light, and the California dream, realized.',
    'aspen': 'Alpine elegance at altitude. Where mountain grandeur meets cultivated refinement, and seasons paint the landscape in dramatic transformation.',
    'st barts': 'French sophistication in Caribbean paradise. Yacht-dotted harbors, pristine beaches, and the art of living well, perfected.',
    'monaco': 'Where the Alps descend into the Mediterranean. Principality of refinement, harbor of dreams, jewel of the Riviera.',
    'dubai': 'Where desert meets sea, tradition meets innovation. A city that defies convention, a destination that exceeds expectation.',
  };

  return locationNarratives[city.toLowerCase()] ||
    `Set in ${city}, where discerning travelers discover authentic luxury. A destination of distinction, a place of rare character.`;
}


export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isMobile } = useResponsive();
  const { searchState } = useSearchContext();
  const [rental, setRental] = useState<Rental | null>(null);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [webhookWarning, setWebhookWarning] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [isSubmittingCharter, setIsSubmittingCharter] = useState(false);

  // Fetch availability when rental is loaded
  const {
    blockedDates,
    blockedRanges,
    isLoading: isLoadingAvailability,
    isDateBlocked,
    isRangeAvailable,
  } = useAvailability(rental?.slug || null);

  const handleInquirySuccess = (hasWebhookWarning = false) => {
    setShowInquiryForm(false);
    setWebhookWarning(hasWebhookWarning);
    setShowConfirmation(true);
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
  };

  const handleHeaderCategorySelect = (category: 'villa' | 'yacht' | 'transport') => {
    // Navigate to homepage with category parameter
    router.push(`/?category=${category}`);
  };

  // Set page title when rental loads
  useEffect(() => {
    if (rental && Platform.OS === 'web') {
      const cleanTitle = rental.title.replace(' – Preview', '').replace(' &#8211; Preview', '');
      document.title = `${cleanTitle} | ERentals Exclusive`;
    }
    return () => {
      if (Platform.OS === 'web') {
        document.title = 'ERentals Exclusive';
      }
    };
  }, [rental]);

  useEffect(() => {
    async function loadRental() {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch rental data
        const response = await getRentals({ perPage: 100 });
        const found = response.data.find(r => r.id === parseInt(id, 10));

        if (found) {
          setRental(found);

          // Show floating button on mobile
          if (typeof window !== 'undefined') {
            setTimeout(() => setShowFloatingButton(true), 1000);
          }

          // Fetch gallery images
          try {
            const images = await getRentalGallery(found.id);

            // If gallery has images, ensure featured is first
            if (images.length > 0) {
              if (found.featuredImage) {
                const featuredUrl = found.featuredImage.url;
                const featuredIndex = images.findIndex(img => img.url === featuredUrl);

                if (featuredIndex > 0) {
                  // Move featured image to first position
                  const featuredImg = images[featuredIndex];
                  images.splice(featuredIndex, 1);
                  images.unshift(featuredImg);
                }
              }
              setGallery(images);
            } else if (found.featuredImage) {
              // Fallback: use featured image when gallery is empty
              setGallery([{
                id: found.id,
                url: found.featuredImage.url,
                alt: found.featuredImage.alt || found.title,
                width: found.featuredImage.width || 1920,
                height: found.featuredImage.height || 1280,
                sizes: {
                  thumbnail: found.featuredImage.sizes?.thumbnail,
                  medium: found.featuredImage.sizes?.medium,
                  large: found.featuredImage.sizes?.large,
                  full: found.featuredImage.url,
                },
              }]);
            }
          } catch (galleryError) {
            // Fallback to featured image on error
            if (found.featuredImage) {
              setGallery([{
                id: found.id,
                url: found.featuredImage.url,
                alt: found.featuredImage.alt || found.title,
                width: found.featuredImage.width || 1920,
                height: found.featuredImage.height || 1280,
                sizes: {
                  thumbnail: found.featuredImage.sizes?.thumbnail,
                  medium: found.featuredImage.sizes?.medium,
                  large: found.featuredImage.sizes?.large,
                  full: found.featuredImage.url,
                },
              }]);
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load property'));
      } finally {
        setLoading(false);
      }
    }

    loadRental();
  }, [id]);

  if (loading) {
    return <PropertyPageSkeleton />;
  }

  if (error || !rental) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Property not found</Text>
        <Text style={styles.errorText}>Unable to load this property</Text>
        <BrandButton
          title="Go Back"
          variant="ghost"
          onPress={() => router.back()}
        />
      </View>
    );
  }

  const propertyData = getPropertyDataBySlug(rental.slug);
  const locationParts = [rental.city?.name, rental.country?.name].filter(Boolean);
  const location = locationParts.join(', ');

  // Determine category from property data or WordPress taxonomy
  const rentalCategory = propertyData?.category || rental.category?.slug || rental.category?.name?.toLowerCase();

  return (
    <View style={styles.container}>
      <Header onHomePress={() => router.push('/')} onCategorySelect={handleHeaderCategorySelect} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Premium Gallery - Full Screen Images */}
        <View style={[styles.galleryContainer, isMobile && styles.galleryContainerMobile]}>
          <PropertyGallery images={gallery} />

          {/* Back Button Overlay */}
          <Pressable style={styles.backButtonOverlay} onPress={() => router.back()}>
            <View style={styles.backButtonCircle}>
              <Feather name="arrow-left" size={20} color={BrandColors.black} />
            </View>
          </Pressable>
        </View>

        {/* Main Container - 2 Column Grid on Desktop */}
        <View style={[styles.mainContainer, isMobile && styles.mainContainerMobile]}>

          {/* Left Column - Content */}
          <View style={[styles.contentColumn, isMobile && styles.contentColumnMobile]}>
          {/* Property Header - Editorial Style */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              {rental.category && (
                <Text style={styles.category}>{rental.category.name}</Text>
              )}
              {location && (
                <View style={styles.locationRowTop}>
                  <Feather name="map-pin" size={14} color={BrandColors.gray.medium} />
                  <Text style={styles.locationTop}>{location}</Text>
                </View>
              )}
            </View>

            <Text style={[styles.title, isMobile && styles.titleMobile]}>
              {rental.title.replace(' – Preview', '').replace(' &#8211; Preview', '')}
            </Text>

            {/* Inline Specs - Editorial Minimal */}
            {propertyData && (
              <View style={styles.specsInline}>
                {propertyData.guestMax && (
                  <>
                    <Text style={styles.specInlineText}>
                      {propertyData.guestMax} {propertyData.guestMax === 1 ? 'Guest' : 'Guests'}
                    </Text>
                    {(propertyData.bedrooms || propertyData.bathrooms) && (
                      <Text style={styles.specDivider}>·</Text>
                    )}
                  </>
                )}
                {propertyData.bedrooms && propertyData.category !== 'transport' && (
                  <>
                    <Text style={styles.specInlineText}>
                      {propertyData.bedrooms} {propertyData.category === 'yacht' ? 'Cabins' : propertyData.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
                    </Text>
                    {propertyData.bathrooms && (
                      <Text style={styles.specDivider}>·</Text>
                    )}
                  </>
                )}
                {propertyData.bathrooms && propertyData.category !== 'transport' && (
                  <Text style={styles.specInlineText}>
                    {propertyData.bathrooms} {propertyData.bathrooms === 1 ? 'Bath' : 'Baths'}
                  </Text>
                )}
              </View>
            )}
          </View>

          <View style={styles.goldDivider} />

          {/* The Property */}
          <View style={styles.section}>
            <Text style={[styles.description, isMobile && styles.descriptionMobile]}>
              {propertyData?.overview || getEditorialDescription(rental)}
            </Text>
          </View>

          <View style={styles.goldDivider} />

          {/* Location */}
          {location && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
                Location
              </Text>
              <View style={[styles.locationCard, isMobile && styles.locationCardMobile]}>
                <View style={[styles.locationHeader, isMobile && styles.locationHeaderMobile]}>
                  <View style={styles.locationInfo}>
                    <Text style={styles.locationCity}>{rental.city?.name}</Text>
                    <Text style={styles.locationCountry}>{rental.country?.name}</Text>
                  </View>
                </View>
                <Text style={[styles.locationDescription, isMobile && styles.descriptionMobile]}>
                  {getLocationCopy(rental.city?.name, rental.country?.name, rental.category?.name)}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.goldDivider} />

          {/* Amenities - Editorial List */}
          {propertyData?.amenities && propertyData.amenities.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
                Amenities
              </Text>
              <View style={styles.amenitiesList}>
                {propertyData.amenities.map((amenity, index) => {
                  const IconComponent = getAmenityIcon(amenity);
                  return (
                    <View key={index} style={styles.amenityRow}>
                      <View style={styles.amenityIcon}>
                        {IconComponent ? (
                          <IconComponent size={18} color={BrandColors.black} strokeWidth={1.8} />
                        ) : (
                          <Feather name="check" size={16} color={BrandColors.black} />
                        )}
                      </View>
                      <Text style={styles.amenityText}>{amenity}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {location} · Property {rental.id}
            </Text>
            <Text style={styles.footerCopyright}>
              ERentals Exclusive © {new Date().getFullYear()}
            </Text>
          </View>

          </View>
          {/* End Left Column */}

          {/* Right Column - Booking Card (Desktop Only) */}
          {!isMobile && (
            <View style={styles.bookingColumn}>
              <BookingCard
                price={propertyData?.displayPrice}
                minStay={propertyData?.minStayNights}
                category={propertyData?.category}
                onInquire={() => setShowInquiryForm(true)}
                blockedRanges={blockedRanges}
                isLoadingAvailability={isLoadingAvailability}
              />
            </View>
          )}

        </View>
        {/* End Main Container */}

      </ScrollView>

      {/* Mobile Bottom Bar */}
      {isMobile && (
        <BookingBottomBar
          price={propertyData?.displayPrice}
          category={propertyData?.category}
          onInquire={() => setShowInquiryForm(true)}
          hasAvailability={blockedRanges ? blockedRanges.length === 0 : undefined}
          isLoadingAvailability={isLoadingAvailability}
        />
      )}

      {/* Booking Inquiry Modal */}
      <Modal
        visible={showInquiryForm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInquiryForm(false)}
      >
        {/* Show Charter Form for yachts/transport, regular form for villas */}
        {rentalCategory === 'yacht' || rentalCategory === 'transport' ? (
          <View style={styles.charterModalContainer}>
            <View style={styles.charterModalContent}>
              <View style={styles.charterModalHeader}>
                <Text style={styles.charterModalTitle}>
                  {rentalCategory === 'yacht' ? 'Request Charter' : 'Request Transfer'}
                </Text>
                <Pressable
                  style={styles.charterModalClose}
                  onPress={() => setShowInquiryForm(false)}
                  hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                  <Feather name="x" size={24} color={BrandColors.black} />
                </Pressable>
              </View>
              <CharterBookingForm
                propertyName={rental.title.replace(' – Preview', '').replace(' &#8211; Preview', '')}
                propertyCategory={rentalCategory as 'yacht' | 'transport'}
                displayPrice={propertyData?.displayPrice}
                maxGuests={propertyData?.guestMax || 10}
                isSubmitting={isSubmittingCharter}
                onSubmit={async (data: CharterBookingData) => {
                  setIsSubmittingCharter(true);
                  try {
                    // Split name into first/last
                    const nameParts = data.name.trim().split(/\s+/);
                    const firstName = nameParts[0] || '';
                    const lastName = nameParts.slice(1).join(' ') || '';

                    // Build payload for /api/inquiry
                    const payload = {
                      firstName,
                      lastName,
                      email: data.email,
                      phone: data.phone,
                      propertyName: rental.title.replace(' – Preview', '').replace(' &#8211; Preview', ''),
                      propertyId: rental.id,
                      propertyCategory: rentalCategory as 'yacht' | 'transport',
                      // Yacht/Transport specific
                      charterDate: data.date.toISOString().split('T')[0],
                      charterTime: data.departureTime,
                      charterDuration: data.duration,
                      guests: data.guests,
                      occasion: data.occasion,
                      message: data.notes,
                      // Transport specific
                      pickupLocation: data.pickup,
                      dropoffLocation: data.dropoff,
                      // Attribution
                      source: 'website-charter-form',
                      utm_source: searchState.attribution?.utm_source,
                      utm_medium: searchState.attribution?.utm_medium,
                      utm_campaign: searchState.attribution?.utm_campaign,
                      utm_content: searchState.attribution?.utm_content,
                      utm_term: searchState.attribution?.utm_term,
                      er_id: searchState.attribution?.er_id,
                      creator_id: searchState.attribution?.creator_id,
                    };

                    const response = await fetch('/api/inquiry', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload),
                    });

                    const result = await response.json();
                    console.log('Charter inquiry response:', result);

                    if (response.ok && result.ok) {
                      handleInquirySuccess(!!result.warning);
                    } else {
                      console.warn('Charter submission issue:', result);
                      handleInquirySuccess(true);
                    }
                  } catch (error) {
                    console.error('Charter submission error:', error);
                    handleInquirySuccess(true);
                  } finally {
                    setIsSubmittingCharter(false);
                  }
                }}
              />
            </View>
          </View>
        ) : (
          <BookingInquiryForm
            propertyName={rental.title.replace(' – Preview', '').replace(' &#8211; Preview', '')}
            propertyId={rental.id}
            price={propertyData?.displayPrice}
            nightlyRate={parseNightlyRate(propertyData?.displayPrice)}
            checkIn={searchState.checkIn}
            checkOut={searchState.checkOut}
            guests={searchState.guests}
            minStayNights={propertyData?.minStayNights || undefined}
            blockedDates={blockedDates}
            attribution={searchState.attribution}
            onClose={() => setShowInquiryForm(false)}
            onSuccess={handleInquirySuccess}
          />
        )}
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmation}
        transparent
        animationType="fade"
        onRequestClose={handleCloseConfirmation}
      >
        <BookingConfirmation
          propertyName={rental.title.replace(' – Preview', '').replace(' &#8211; Preview', '')}
          onClose={handleCloseConfirmation}
          webhookWarning={webhookWarning}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.white,
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BrandColors.white,
    padding: Space[12],
  },
  errorTitle: {
    fontSize: FontSize['2xl'],
    lineHeight: LineHeight['2xl'],
    fontWeight: FontWeight.bold,
    color: BrandColors.black,
    marginBottom: Space[2],
  },
  errorText: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    color: BrandColors.gray.medium,
    marginBottom: Space[8],
  },
  galleryContainer: {
    width: '100%',
    position: 'relative',
  },
  galleryContainerMobile: {
    marginTop: 60,
  },
  backButtonOverlay: {
    position: 'absolute',
    top: Platform.select({ web: 80, default: 20 }),
    left: Space[6],
    zIndex: ZIndex.dropdown,
  },
  backButtonCircle: {
    width: TouchTarget.min,
    height: TouchTarget.min,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.base,
  },
  mainContainer: {
    maxWidth: Container.listing,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: Space[6],
    paddingTop: Space[8],
    paddingBottom: Space[12],
    ...Platform.select({
      web: {
        flexDirection: 'row',
        gap: Space[12],
        alignItems: 'flex-start',
      },
    }),
  },
  mainContainerMobile: {
    flexDirection: 'column',
    paddingHorizontal: Space[4],
    paddingTop: Space[4],
    paddingBottom: Space[8],
  },
  contentColumn: {
    flex: 1,
    maxWidth: Platform.select({ web: 720, default: '100%' }) as any,
  },
  contentColumnMobile: {
    maxWidth: '100%',
  },
  bookingColumn: {
    width: 380,
    flexShrink: 0,
  },
  header: {
    marginBottom: Space[6],
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Space[4],
  },
  category: {
    fontSize: FontSize.xs,
    lineHeight: LineHeight.xs,
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  locationRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[2],
  },
  locationTop: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.medium,
    fontWeight: FontWeight.medium,
  },
  title: {
    fontSize: FontSize['6xl'],
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
    marginBottom: Space[6],
    lineHeight: LineHeight['6xl'],
    letterSpacing: -1.2,
  },
  titleMobile: {
    fontSize: FontSize['4xl'],
    lineHeight: LineHeight['4xl'],
    letterSpacing: -0.8,
  },
  specsInline: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  specInlineText: {
    fontSize: FontSize.base,
    lineHeight: LineHeight.base,
    color: BrandColors.gray.dark,
    fontWeight: FontWeight.normal,
    letterSpacing: 0.2,
  },
  specDivider: {
    fontSize: FontSize.base,
    lineHeight: LineHeight.base,
    color: BrandColors.gray.medium,
    marginHorizontal: Space[2],
  },
  goldDivider: {
    height: 1,
    width: 60,
    backgroundColor: BrandColors.gray.border,
    marginVertical: Space[6], // Reduced from Space[10]
  },
  section: {
    marginBottom: Space[6], // Reduced from Space[12]
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    lineHeight: LineHeight.xl,
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
    marginBottom: Space[4], // Reduced from Space[6]
    letterSpacing: -0.3,
  },
  sectionTitleMobile: {
    fontSize: FontSize.lg,
    lineHeight: LineHeight.lg,
  },
  description: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md * 2,
    color: BrandColors.gray.dark,
    letterSpacing: 0.1,
    fontWeight: FontWeight.normal,
  },
  descriptionMobile: {
    fontSize: FontSize.base,
    lineHeight: LineHeight.base + 4,
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space[4],
    marginTop: Space[4],
  },
  amenityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[3],
    width: Platform.select({
      web: 'calc(33.333% - 11px)',
      default: 'calc(50% - 8px)'
    }) as any,
    paddingVertical: Space[3],
    paddingHorizontal: Space[4],
    backgroundColor: BrandColors.gray.light,
    borderRadius: Radius.md,
    minHeight: TouchTarget.min,
  },
  amenityIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amenityText: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.black,
    fontWeight: FontWeight.medium,
    flex: 1,
  },
  ctaSection: {
    backgroundColor: BrandColors.black,
    paddingVertical: Space[20],
    paddingHorizontal: Space[20],
    borderRadius: Radius.sm,
    alignItems: 'center',
    marginBottom: Space[12],
  },
  ctaSectionMobile: {
    paddingVertical: Space[16],
    paddingHorizontal: Space[8],
  },
  ctaTitle: {
    fontSize: FontSize['2xl'],
    lineHeight: LineHeight['2xl'],
    fontWeight: FontWeight.semibold,
    color: BrandColors.white,
    textAlign: 'center',
    marginBottom: Space[6],
    letterSpacing: -0.5,
  },
  ctaTitleMobile: {
    fontSize: FontSize.xl,
    lineHeight: LineHeight.xl,
  },
  ctaSubtitle: {
    fontSize: FontSize.base,
    lineHeight: LineHeight.base + 2,
    color: BrandColors.gray.light,
    textAlign: 'center',
    marginBottom: Space[12],
    maxWidth: 500,
    fontWeight: FontWeight.normal,
  },
  ctaButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 400,
  },
  ctaButtonsMobile: {
    maxWidth: '100%',
  },
  ctaButtonPrimary: {
    backgroundColor: BrandColors.white,
    paddingVertical: Space[5],
    paddingHorizontal: Space[16],
    borderRadius: Radius.none,
    minWidth: 200,
    minHeight: TouchTarget.min,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonPrimaryText: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  footer: {
    paddingTop: Space[8],
    paddingBottom: Space[6],
    alignItems: 'center',
    gap: Space[2],
  },
  footerText: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.medium,
    fontWeight: FontWeight.normal,
    letterSpacing: 0.2,
  },
  footerCopyright: {
    fontSize: FontSize.xs,
    lineHeight: LineHeight.xs,
    color: BrandColors.gray.medium,
    fontWeight: FontWeight.normal,
    letterSpacing: 0.5,
  },
  floatingButton: {
    position: 'fixed',
    bottom: 90,
    right: Space[6],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[2],
    backgroundColor: BrandColors.black,
    paddingVertical: Space[4],
    paddingHorizontal: Space[6],
    borderRadius: Radius.full,
    zIndex: ZIndex.overlay - 2,
    ...Shadow.lg,
  },
  floatingButtonText: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    fontWeight: FontWeight.semibold,
    color: BrandColors.white,
  },
  locationCard: {
    backgroundColor: 'transparent',
    paddingVertical: Space[6],
  },
  locationCardMobile: {
    paddingVertical: Space[4],
  },
  locationHeader: {
    marginBottom: Space[6],
  },
  locationHeaderMobile: {
    marginBottom: Space[4],
  },
  locationIconCircle: {
    display: 'none',
  },
  locationInfo: {
    flex: 1,
  },
  locationCity: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
    marginBottom: Space[1],
    letterSpacing: -0.2,
  },
  locationCountry: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.medium,
    fontWeight: FontWeight.normal,
  },
  locationDescription: {
    fontSize: FontSize.base,
    lineHeight: LineHeight.base + 4,
    color: BrandColors.gray.dark,
    fontWeight: FontWeight.normal,
  },

  // Charter Modal Styles - Unified with Villa modal spacing
  charterModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Space[4],
    ...Platform.select({
      web: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: ZIndex.modal,
      },
    }),
  },
  charterModalContent: {
    backgroundColor: BrandColors.white,
    borderRadius: Radius.xl,
    width: Platform.select({ web: 'min(92vw, 480px)', default: '100%' }) as any,
    maxWidth: 480,
    maxHeight: Platform.select({ web: 'min(90vh, 720px)', default: '90%' }) as any,
    overflow: 'hidden',
    ...Shadow.xl,
  },
  charterModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space[6],
    paddingVertical: Space[5],
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray.border,
  },
  charterModalTitle: {
    fontSize: FontSize.xl,
    lineHeight: LineHeight.xl,
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
  },
  charterModalClose: {
    width: TouchTarget.min,
    height: TouchTarget.min,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
});
