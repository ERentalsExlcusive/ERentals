import { View, Text, StyleSheet, Platform, Pressable, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BrandColors } from '@/constants/theme';
import { Space, FontSize, LineHeight, FontWeight, Radius } from '@/constants/design-tokens';

interface LocationMapProps {
  city?: string;
  country?: string;
  isMobile?: boolean;
}

// City coordinates for OpenStreetMap
// Using approximate city center coordinates
const CITY_COORDINATES: Record<string, { lat: number; lon: number; zoom: number }> = {
  // Mexico
  'tulum': { lat: 20.2114, lon: -87.4654, zoom: 13 },
  'mexico city': { lat: 19.4326, lon: -99.1332, zoom: 12 },
  'puerto escondido': { lat: 15.8720, lon: -97.0767, zoom: 13 },
  'cuernavaca': { lat: 18.9242, lon: -99.2216, zoom: 13 },
  'cancun': { lat: 21.1619, lon: -86.8515, zoom: 12 },
  // Greece
  'mykonos': { lat: 37.4467, lon: 25.3289, zoom: 13 },
  'santorini': { lat: 36.3932, lon: 25.4615, zoom: 13 },
  'athens': { lat: 37.9838, lon: 23.7275, zoom: 12 },
  // Turkey
  'bodrum': { lat: 37.0343, lon: 27.4305, zoom: 13 },
  'istanbul': { lat: 41.0082, lon: 28.9784, zoom: 12 },
  // France
  'cannes': { lat: 43.5528, lon: 7.0174, zoom: 13 },
  'monaco': { lat: 43.7384, lon: 7.4246, zoom: 14 },
  'nice': { lat: 43.7102, lon: 7.2620, zoom: 13 },
  'st tropez': { lat: 43.2727, lon: 6.6407, zoom: 14 },
  // USA
  'miami': { lat: 25.7617, lon: -80.1918, zoom: 12 },
  'los angeles': { lat: 34.0522, lon: -118.2437, zoom: 11 },
  'new york': { lat: 40.7128, lon: -74.0060, zoom: 11 },
  'aspen': { lat: 39.1911, lon: -106.8175, zoom: 13 },
  'malibu': { lat: 34.0259, lon: -118.7798, zoom: 12 },
  // Colombia
  'cartagena': { lat: 10.3910, lon: -75.4794, zoom: 13 },
  'medellin': { lat: 6.2442, lon: -75.5812, zoom: 12 },
  'bogota': { lat: 4.7110, lon: -74.0721, zoom: 12 },
  // Costa Rica
  'san jose': { lat: 9.9281, lon: -84.0907, zoom: 12 },
  'guanacaste': { lat: 10.4268, lon: -85.4516, zoom: 11 },
  // Caribbean
  'st barts': { lat: 17.8966, lon: -62.8508, zoom: 14 },
  // UAE
  'dubai': { lat: 25.2048, lon: 55.2708, zoom: 12 },
  // Spain
  'ibiza': { lat: 38.9067, lon: 1.4206, zoom: 12 },
  'mallorca': { lat: 39.6953, lon: 3.0176, zoom: 11 },
  'barcelona': { lat: 41.3851, lon: 2.1734, zoom: 12 },
};

// Country fallback coordinates
const COUNTRY_COORDINATES: Record<string, { lat: number; lon: number; zoom: number }> = {
  'mexico': { lat: 23.6345, lon: -102.5528, zoom: 5 },
  'greece': { lat: 39.0742, lon: 21.8243, zoom: 6 },
  'turkey': { lat: 38.9637, lon: 35.2433, zoom: 6 },
  'france': { lat: 46.2276, lon: 2.2137, zoom: 5 },
  'usa': { lat: 37.0902, lon: -95.7129, zoom: 4 },
  'colombia': { lat: 4.5709, lon: -74.2973, zoom: 5 },
  'costa rica': { lat: 9.7489, lon: -83.7534, zoom: 7 },
  'uae': { lat: 23.4241, lon: 53.8478, zoom: 6 },
  'spain': { lat: 40.4637, lon: -3.7492, zoom: 5 },
};

function getCoordinates(city?: string, country?: string) {
  // Try city first
  if (city) {
    const cityKey = city.toLowerCase().trim();
    if (CITY_COORDINATES[cityKey]) {
      return CITY_COORDINATES[cityKey];
    }
  }

  // Fall back to country
  if (country) {
    const countryKey = country.toLowerCase().trim();
    if (COUNTRY_COORDINATES[countryKey]) {
      return COUNTRY_COORDINATES[countryKey];
    }
  }

  return null;
}

export function LocationMap({ city, country, isMobile }: LocationMapProps) {
  const coords = getCoordinates(city, country);

  if (!coords) {
    return null;
  }

  // OpenStreetMap embed URL
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lon - 0.05},${coords.lat - 0.03},${coords.lon + 0.05},${coords.lat + 0.03}&layer=mapnik&marker=${coords.lat},${coords.lon}`;

  // Full map URL for "View larger map" link
  const fullMapUrl = `https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lon}#map=${coords.zoom}/${coords.lat}/${coords.lon}`;

  const handleOpenMap = () => {
    Linking.openURL(fullMapUrl);
  };

  // Only render on web - native would need react-native-maps
  if (Platform.OS !== 'web') {
    return (
      <Pressable style={styles.nativeMapPlaceholder} onPress={handleOpenMap}>
        <Feather name="map" size={32} color={BrandColors.gray.medium} />
        <Text style={styles.nativeMapText}>View on Map</Text>
        <Text style={styles.nativeMapSubtext}>{city}, {country}</Text>
      </Pressable>
    );
  }

  return (
    <View style={[styles.container, isMobile && styles.containerMobile]}>
      <View style={styles.mapWrapper}>
        <iframe
          src={mapUrl}
          style={{
            border: 0,
            width: '100%',
            height: '100%',
            borderRadius: 12,
          }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Map of ${city || country}`}
        />
      </View>
      <View style={styles.mapFooter}>
        <View style={styles.mapInfo}>
          <Feather name="map-pin" size={14} color={BrandColors.gray.medium} />
          <Text style={styles.mapInfoText}>
            General area shown for privacy
          </Text>
        </View>
        <Pressable style={styles.viewLargerButton} onPress={handleOpenMap}>
          <Text style={styles.viewLargerText}>View larger map</Text>
          <Feather name="external-link" size={14} color={BrandColors.secondary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Space[4],
  },
  containerMobile: {
    marginTop: Space[3],
  },
  mapWrapper: {
    width: '100%',
    height: 250,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: BrandColors.gray.light,
  },
  mapFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Space[3],
    flexWrap: 'wrap',
    gap: Space[2],
  },
  mapInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[1],
  },
  mapInfoText: {
    fontSize: FontSize.xs,
    lineHeight: LineHeight.xs,
    color: BrandColors.gray.medium,
    fontStyle: 'italic',
  },
  viewLargerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[1],
  },
  viewLargerText: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.secondary,
    fontWeight: FontWeight.medium,
  },
  nativeMapPlaceholder: {
    marginTop: Space[4],
    height: 180,
    backgroundColor: BrandColors.gray.light,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space[2],
  },
  nativeMapText: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    fontWeight: FontWeight.medium,
    color: BrandColors.gray.dark,
  },
  nativeMapSubtext: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.medium,
  },
});
