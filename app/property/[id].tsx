import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Pressable, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { getRentals, getRentalGallery, GalleryImage } from '@/services/api';
import { Rental } from '@/types/rental';
import { BrandColors, Spacing } from '@/constants/theme';
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

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isMobile } = useResponsive();
  const [rental, setRental] = useState<Rental | null>(null);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showInquiry, setShowInquiry] = useState(false);

  const handleHeaderCategorySelect = (category: 'villa' | 'yacht' | 'transport') => {
    // Navigate to homepage with category parameter
    router.push(`/?category=${category}`);
  };

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

          // Fetch gallery images
          try {
            const images = await getRentalGallery(found.id);

            // Ensure featured image is first in gallery
            if (found.featuredImage && images.length > 0) {
              const featuredId = found.featuredImage.url;
              const featuredIndex = images.findIndex(img => img.url === featuredId);

              if (featuredIndex > 0) {
                // Move featured image to first position
                const featuredImg = images[featuredIndex];
                images.splice(featuredIndex, 1);
                images.unshift(featuredImg);
              }
            }

            setGallery(images);
          } catch (galleryError) {
            console.error('Failed to load gallery:', galleryError);
            // Continue even if gallery fails
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
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={BrandColors.black} />
        <Text style={styles.loadingText}>Loading luxury property...</Text>
      </View>
    );
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

  return (
    <View style={styles.container}>
      <Header onHomePress={() => router.push('/')} onCategorySelect={handleHeaderCategorySelect} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Premium Gallery - Full Screen Images */}
        {gallery.length > 0 && (
          <View style={[styles.galleryContainer, isMobile && styles.galleryContainerMobile]}>
            <PropertyGallery images={gallery} />

            {/* Back Button Overlay */}
            <Pressable style={styles.backButtonOverlay} onPress={() => router.back()}>
              <View style={styles.backButtonCircle}>
                <Feather name="arrow-left" size={20} color={BrandColors.black} />
              </View>
            </Pressable>
          </View>
        )}

        {/* Content Container */}
        <View style={[styles.content, isMobile && styles.contentMobile]}>
          {/* Property Header */}
          <View style={styles.header}>
            {rental.category && (
              <Text style={styles.category}>{rental.category.name.toUpperCase()}</Text>
            )}
            <Text style={[styles.title, isMobile && styles.titleMobile]}>
              {rental.title.replace(' – Preview', '').replace(' &#8211; Preview', '')}
            </Text>
            {location && (
              <View style={styles.locationRow}>
                <Feather name="map-pin" size={18} color={BrandColors.secondary} />
                <Text style={styles.location}>{location}</Text>
              </View>
            )}
          </View>

          {/* Gold Divider */}
          <View style={styles.goldDivider} />

          {/* Quick Specs */}
          {propertyData && (
            <View style={[styles.specsRow, isMobile && styles.specsRowMobile]}>
              {propertyData.guestMax && (
                <View style={styles.specCard}>
                  <View style={styles.specIconCircle}>
                    <Feather name="users" size={24} color={BrandColors.secondary} />
                  </View>
                  <Text style={styles.specValue}>{propertyData.guestMax}</Text>
                  <Text style={styles.specLabel}>Guests</Text>
                </View>
              )}
              {propertyData.bedrooms && propertyData.category !== 'transport' && (
                <View style={styles.specCard}>
                  <View style={styles.specIconCircle}>
                    <Feather name="home" size={24} color={BrandColors.secondary} />
                  </View>
                  <Text style={styles.specValue}>{propertyData.bedrooms}</Text>
                  <Text style={styles.specLabel}>
                    {propertyData.category === 'yacht' ? 'Cabins' : 'Bedrooms'}
                  </Text>
                </View>
              )}
              {propertyData.bathrooms && propertyData.category !== 'transport' && (
                <View style={styles.specCard}>
                  <View style={styles.specIconCircle}>
                    <Feather name="droplet" size={24} color={BrandColors.secondary} />
                  </View>
                  <Text style={styles.specValue}>{propertyData.bathrooms}</Text>
                  <Text style={styles.specLabel}>Bathrooms</Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.goldDivider} />

          {/* The Experience Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
              The Experience
            </Text>
            <Text style={[styles.description, isMobile && styles.descriptionMobile]}>
              {propertyData?.overview || `Experience unparalleled luxury in this exclusive ${rental.category?.name.toLowerCase()} nestled in the heart of ${rental.city?.name}. Every detail has been meticulously curated to provide an extraordinary experience for the most discerning guests.`}
            </Text>
          </View>

          {/* Pricing Card */}
          {propertyData?.displayPrice && (
            <View style={styles.pricingContainer}>
              <View style={styles.pricingCard}>
                <View style={styles.pricingContent}>
                  <View>
                    <Text style={styles.priceLabel}>Starting From</Text>
                    <Text style={[styles.price, isMobile && styles.priceMobile]}>
                      {propertyData.displayPrice.replace('From ', '')}
                    </Text>
                    {propertyData.minStayNights && (
                      <Text style={styles.minStay}>
                        Minimum {propertyData.minStayNights} night{propertyData.minStayNights > 1 ? 's' : ''}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </View>
          )}

          <View style={styles.goldDivider} />

          {/* Premium Amenities Grid */}
          {propertyData?.amenities && propertyData.amenities.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
                Exclusive Amenities
              </Text>
              <View style={[styles.amenitiesGrid, isMobile && styles.amenitiesGridMobile]}>
                {propertyData.amenities.map((amenity, index) => {
                  const IconComponent = getAmenityIcon(amenity);
                  return (
                    <View key={index} style={styles.amenityCard}>
                      <View style={styles.amenityIconContainer}>
                        {IconComponent ? (
                          <IconComponent size={32} color={BrandColors.secondary} />
                        ) : (
                          <Feather name="check-circle" size={28} color={BrandColors.secondary} />
                        )}
                      </View>
                      <Text style={styles.amenityText}>{amenity}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          <View style={styles.goldDivider} />

          {/* Call to Action Section */}
          {!showInquiry ? (
            <View style={[styles.ctaSection, isMobile && styles.ctaSectionMobile]}>
              <Text style={[styles.ctaTitle, isMobile && styles.ctaTitleMobile]}>
                Ready for the Extraordinary?
              </Text>
              <Text style={styles.ctaSubtitle}>
                Our dedicated concierge team is available 24/7 to craft your perfect luxury experience
              </Text>
              <View style={[styles.ctaButtons, isMobile && styles.ctaButtonsMobile]}>
                <BrandButton
                  title="Request Availability"
                  variant="primary"
                  onPress={() => setShowInquiry(true)}
                  style={styles.ctaButton}
                />
                <Pressable
                  style={styles.conciergeButton}
                  onPress={() => setShowInquiry(true)}
                >
                  <Feather name="message-circle" size={20} color={BrandColors.secondary} />
                  <Text style={styles.conciergeButtonText}>Contact Concierge</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={[styles.inquirySection, isMobile && styles.inquirySectionMobile]}>
              <Text style={[styles.inquiryTitle, isMobile && styles.inquiryTitleMobile]}>Request Availability</Text>
              <Text style={[styles.inquirySubtitle, isMobile && styles.inquirySubtitleMobile]}>
                Contact our dedicated concierge team via WhatsApp
              </Text>
              <View style={styles.contactCard}>
                <View style={styles.contactItem}>
                  <Feather name="mail" size={22} color={BrandColors.secondary} />
                  <Text style={styles.contactText}>info@erentalsexclusive.com</Text>
                </View>
                <View style={styles.contactItem}>
                  <Feather name="message-circle" size={22} color={BrandColors.secondary} />
                  <View>
                    <Text style={styles.contactText}>+63 928 228 6597</Text>
                    <Text style={styles.contactSubtext}>via WhatsApp</Text>
                  </View>
                </View>
              </View>
              <BrandButton
                title="Close"
                variant="outline"
                onPress={() => setShowInquiry(false)}
              />
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerDivider} />
            <Text style={styles.footerText}>Property ID: {rental.id}</Text>
            <Text style={styles.footerText}>{location}</Text>
          </View>
        </View>
      </ScrollView>
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
    padding: Spacing.xxl,
  },
  loadingText: {
    marginTop: Spacing.lg,
    fontSize: 16,
    color: BrandColors.gray.medium,
    fontStyle: 'italic',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: BrandColors.black,
    marginBottom: Spacing.sm,
  },
  errorText: {
    fontSize: 16,
    color: BrandColors.gray.medium,
    marginBottom: Spacing.xl,
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
    left: Spacing.lg,
    zIndex: 100,
  },
  backButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    maxWidth: 1000,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: Spacing.xxl * 2.5,
    paddingTop: Spacing.xxl * 2.5,
    paddingBottom: 120,
  },
  contentMobile: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: 100,
  },
  header: {
    marginBottom: Spacing.xxl,
  },
  category: {
    fontSize: 13,
    fontWeight: '700',
    color: BrandColors.secondary,
    letterSpacing: 2.5,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 52,
    fontWeight: '700',
    color: BrandColors.black,
    marginBottom: Spacing.md,
    lineHeight: 62,
    letterSpacing: -1.5,
  },
  titleMobile: {
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: -1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  location: {
    fontSize: 18,
    color: BrandColors.gray.dark,
    fontWeight: '500',
  },
  goldDivider: {
    height: 2,
    width: 80,
    backgroundColor: BrandColors.secondary,
    marginVertical: Spacing.xxl * 1.5,
  },
  specsRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  specsRowMobile: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: Spacing.md,
  },
  specCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BrandColors.gray.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  specIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${BrandColors.secondary}12`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  specValue: {
    fontSize: 32,
    fontWeight: '700',
    color: BrandColors.black,
    marginBottom: Spacing.xs,
  },
  specLabel: {
    fontSize: 13,
    color: BrandColors.gray.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  section: {
    marginBottom: Spacing.xxl * 1.5,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: BrandColors.black,
    marginBottom: Spacing.lg,
    letterSpacing: -0.8,
  },
  sectionTitleMobile: {
    fontSize: 26,
  },
  description: {
    fontSize: 18,
    lineHeight: 34,
    color: BrandColors.gray.dark,
    letterSpacing: 0.3,
  },
  descriptionMobile: {
    fontSize: 17,
    lineHeight: 30,
  },
  pricingContainer: {
    marginBottom: Spacing.xxl,
  },
  pricingCard: {
    backgroundColor: BrandColors.white,
    padding: Spacing.xxl,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: BrandColors.secondary,
    shadowColor: BrandColors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  pricingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontSize: 14,
    color: BrandColors.gray.medium,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  price: {
    fontSize: 42,
    fontWeight: '700',
    color: BrandColors.black,
    marginBottom: Spacing.xs,
    letterSpacing: -1,
  },
  priceMobile: {
    fontSize: 32,
  },
  minStay: {
    fontSize: 15,
    color: BrandColors.gray.dark,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
  },
  amenitiesGridMobile: {
    gap: Spacing.md,
  },
  amenityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    width: Platform.OS === 'web' ? 'calc(50% - 12px)' : '100%',
    padding: Spacing.lg,
    backgroundColor: BrandColors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.gray.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  amenityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${BrandColors.secondary}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amenityText: {
    fontSize: 16,
    color: BrandColors.black,
    fontWeight: '500',
    flex: 1,
  },
  ctaSection: {
    backgroundColor: BrandColors.gray.light,
    padding: Spacing.xxl * 2,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: Spacing.xxl,
    borderWidth: 2,
    borderColor: BrandColors.secondary,
  },
  ctaSectionMobile: {
    padding: Spacing.xl,
  },
  ctaTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: BrandColors.black,
    textAlign: 'center',
    marginBottom: Spacing.md,
    letterSpacing: -1,
  },
  ctaTitleMobile: {
    fontSize: 26,
  },
  ctaSubtitle: {
    fontSize: 17,
    color: BrandColors.gray.dark,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    maxWidth: 600,
    lineHeight: 28,
  },
  ctaButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
    maxWidth: 600,
  },
  ctaButtonsMobile: {
    flexDirection: 'column',
  },
  ctaButton: {
    flex: 1,
  },
  conciergeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.white,
    borderWidth: 2,
    borderColor: BrandColors.secondary,
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.xl,
    borderRadius: 8,
    gap: Spacing.sm,
  },
  conciergeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: BrandColors.secondary,
  },
  inquirySection: {
    backgroundColor: BrandColors.gray.light,
    padding: Spacing.xxl * 1.5,
    borderRadius: 20,
    marginBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: BrandColors.gray.border,
  },
  inquirySectionMobile: {
    padding: Spacing.xl,
  },
  inquiryTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: BrandColors.black,
    marginBottom: Spacing.sm,
    letterSpacing: -0.5,
  },
  inquiryTitleMobile: {
    fontSize: 22,
  },
  inquirySubtitle: {
    fontSize: 16,
    color: BrandColors.gray.dark,
    marginBottom: Spacing.xl,
    lineHeight: 26,
  },
  inquirySubtitleMobile: {
    fontSize: 15,
    lineHeight: 24,
  },
  contactCard: {
    backgroundColor: BrandColors.white,
    padding: Spacing.xl,
    borderRadius: 16,
    marginBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  contactText: {
    fontSize: 16,
    color: BrandColors.black,
    fontWeight: '500',
  },
  contactSubtext: {
    fontSize: 13,
    color: BrandColors.gray.medium,
    marginTop: 2,
  },
  footer: {
    paddingTop: Spacing.xxl * 1.5,
    alignItems: 'center',
  },
  footerDivider: {
    height: 1,
    width: 80,
    backgroundColor: BrandColors.gray.border,
    marginBottom: Spacing.lg,
  },
  footerText: {
    fontSize: 14,
    color: BrandColors.gray.medium,
    marginBottom: Spacing.xs,
  },
});
