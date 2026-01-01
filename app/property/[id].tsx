import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Pressable, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { getRentalById } from '@/services/api';
import { Rental } from '@/types/rental';
import { BrandColors, Spacing } from '@/constants/theme';
import { BrandButton } from '@/components/brand-button';
import { ImageGallery } from '@/components/image-gallery';
import { ContactForm, ContactFormData } from '@/components/contact-form';
import { Header } from '@/components/header';

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [rental, setRental] = useState<Rental | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);

  useEffect(() => {
    async function loadRental() {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const data = await getRentalById(parseInt(id, 10));
        setRental(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load property'));
      } finally {
        setLoading(false);
      }
    }

    loadRental();
  }, [id]);

  const handleContactSubmit = (formData: ContactFormData) => {
    console.log('Contact form submitted:', formData);
    // TODO: Send to backend/email service
    alert('Thank you! We will contact you shortly.');
    setShowContactForm(false);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={BrandColors.black} />
        <Text style={styles.loadingText}>Loading property...</Text>
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
          style={styles.backButton}
        />
      </View>
    );
  }

  const locationParts = [rental.city?.name, rental.country?.name].filter(Boolean);
  const location = locationParts.join(', ');

  // Gather all available images (for now just featured image, can expand later)
  const images = rental.featuredImage ? [rental.featuredImage.url] : [];

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <ImageGallery images={images} />

        {/* Content Container */}
        <View style={styles.content}>
          {/* Property Header */}
          <View style={styles.propertyHeader}>
            <View>
              {rental.category && (
                <Text style={styles.category}>{rental.category.name}</Text>
              )}
              <Text style={styles.title}>
                {rental.title.replace(' – Preview', '').replace(' &#8211; Preview', '')}
              </Text>
              {location && (
                <Text style={styles.location}>📍 {location}</Text>
              )}
            </View>
          </View>

          {/* Quick Details */}
          <View style={styles.quickDetails}>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>👥</Text>
              <Text style={styles.detailText}>6 guests</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>🛏</Text>
              <Text style={styles.detailText}>3 bedrooms</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>🚿</Text>
              <Text style={styles.detailText}>2 bathrooms</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this property</Text>
            {rental.excerpt ? (
              <Text style={styles.description}>
                {rental.excerpt.replace(/<[^>]*>/g, '').trim()}
              </Text>
            ) : rental.content ? (
              <Text style={styles.description}>
                {rental.content.replace(/<[^>]*>/g, '').substring(0, 500)}...
              </Text>
            ) : (
              <Text style={styles.description}>
                Experience luxury at its finest in this exclusive {rental.category?.name.toLowerCase()}
                located in the heart of {rental.city?.name}. Contact us to learn more about this exceptional property.
              </Text>
            )}
          </View>

          {/* Amenities (if available from ACF) */}
          {rental.acf && Object.keys(rental.acf).length > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Property Features</Text>
                <View style={styles.features}>
                  {Object.entries(rental.acf).slice(0, 8).map(([key, value]) => {
                    if (typeof value === 'string' && value && key !== 'gallery') {
                      return (
                        <View key={key} style={styles.feature}>
                          <Text style={styles.featureIcon}>✓</Text>
                          <Text style={styles.featureText}>
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Text>
                        </View>
                      );
                    }
                    return null;
                  })}
                </View>
              </View>
            </>
          )}

          <View style={styles.divider} />

          {/* Pricing */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing</Text>
            <View style={styles.pricingCard}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>From</Text>
                <Text style={styles.price}>$500</Text>
                <Text style={styles.priceUnit}>/ night</Text>
              </View>
              <Text style={styles.priceNote}>
                Rates vary by season and length of stay. Contact us for exact pricing and availability.
              </Text>
            </View>
          </View>

          {/* Contact Form */}
          {showContactForm ? (
            <>
              <View style={styles.divider} />
              <View style={styles.section}>
                <ContactForm
                  propertyTitle={rental.title}
                  onSubmit={handleContactSubmit}
                />
              </View>
            </>
          ) : (
            <View style={styles.ctaContainer}>
              <BrandButton
                title="Request Availability"
                variant="primary"
                onPress={() => setShowContactForm(true)}
                style={styles.ctaButton}
              />
              <BrandButton
                title="Contact Us"
                variant="ghost"
                onPress={() => setShowContactForm(true)}
                style={styles.ctaButton}
              />
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Property ID: {rental.id}</Text>
            <Text style={styles.footerText}>
              Last updated: {new Date(rental.dateModified).toLocaleDateString()}
            </Text>
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
    marginTop: Spacing.md,
    fontSize: 15,
    color: BrandColors.gray.medium,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: BrandColors.black,
    marginBottom: Spacing.xs,
  },
  errorText: {
    fontSize: 15,
    color: BrandColors.gray.medium,
    marginBottom: Spacing.lg,
  },
  backButton: {
    marginTop: Spacing.lg,
  },
  content: {
    maxWidth: Platform.OS === 'web' ? 900 : '100%',
    alignSelf: 'center',
    width: '100%',
    padding: Spacing.xxl,
  },
  propertyHeader: {
    marginBottom: Spacing.lg,
  },
  category: {
    fontSize: 13,
    fontWeight: '600',
    color: BrandColors.gray.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: BrandColors.black,
    marginBottom: Spacing.sm,
    lineHeight: 40,
  },
  location: {
    fontSize: 16,
    color: BrandColors.gray.dark,
  },
  quickDetails: {
    flexDirection: 'row',
    gap: Spacing.xxl,
    paddingVertical: Spacing.lg,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  detailIcon: {
    fontSize: 20,
  },
  detailText: {
    fontSize: 15,
    color: BrandColors.black,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: BrandColors.gray.border,
    marginVertical: Spacing.xxl,
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: BrandColors.black,
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
    color: BrandColors.gray.dark,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    width: Platform.OS === 'web' ? '48%' : '100%',
  },
  featureIcon: {
    fontSize: 16,
    color: BrandColors.secondary,
  },
  featureText: {
    fontSize: 15,
    color: BrandColors.black,
  },
  pricingCard: {
    backgroundColor: BrandColors.gray.light,
    padding: Spacing.lg,
    borderRadius: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.sm,
  },
  priceLabel: {
    fontSize: 16,
    color: BrandColors.gray.dark,
    marginRight: Spacing.xs,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: BrandColors.black,
  },
  priceUnit: {
    fontSize: 16,
    color: BrandColors.gray.dark,
    marginLeft: Spacing.xs,
  },
  priceNote: {
    fontSize: 14,
    color: BrandColors.gray.medium,
    lineHeight: 20,
  },
  ctaContainer: {
    gap: Spacing.md,
    marginTop: Spacing.xxl,
    marginBottom: Spacing.xxl,
  },
  ctaButton: {
    width: '100%',
  },
  footer: {
    paddingTop: Spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: BrandColors.gray.border,
    gap: Spacing.xs,
  },
  footerText: {
    fontSize: 13,
    color: BrandColors.gray.medium,
  },
});
