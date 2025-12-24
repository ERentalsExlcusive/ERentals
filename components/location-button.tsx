import { StyleSheet, Pressable, Text, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandColors, Typography, Spacing } from '@/constants/theme';
import { CityWithImage } from '@/hooks/use-cities';

interface LocationButtonProps {
  city: CityWithImage;
  onPress: (cityId: number) => void;
}

export function LocationButton({ city, onPress }: LocationButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={() => onPress(city.id)}
    >
      <ImageBackground
        source={{ uri: city.imageUrl }}
        style={styles.imageBackground}
        imageStyle={styles.image}
      >
        <LinearGradient
          colors={['rgba(31, 40, 57, 0.3)', 'rgba(31, 40, 57, 0.8)']}
          style={styles.gradient}
        >
          <Text style={styles.cityName}>{city.name}</Text>
          <Text style={styles.propertyCount}>
            {city.count} {city.count === 1 ? 'Property' : 'Properties'}
          </Text>
        </LinearGradient>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  pressed: {
    opacity: 0.8,
  },
  imageBackground: {
    width: '100%',
    height: '100%',
  },
  image: {
    borderRadius: 10,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: Spacing.lg,
  },
  cityName: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 32,
    color: BrandColors.white,
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  propertyCount: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 16,
    color: BrandColors.secondary,
    letterSpacing: 1,
  },
});
