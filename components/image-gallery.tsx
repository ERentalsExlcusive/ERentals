import { View, Image, StyleSheet, Pressable, ScrollView, Dimensions, Platform } from 'react-native';
import { useState } from 'react';
import { BrandColors, Spacing } from '@/constants/theme';

interface ImageGalleryProps {
  images: string[];
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) return null;

  // If only one image, show it full size
  if (images.length === 1) {
    return (
      <Image
        source={{ uri: images[0] }}
        style={styles.singleImage}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Main Image */}
      <Image
        source={{ uri: images[selectedIndex] }}
        style={styles.mainImage}
        resizeMode="cover"
      />

      {/* Thumbnail Strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.thumbnails}
      >
        {images.map((imageUrl, index) => (
          <Pressable
            key={index}
            onPress={() => setSelectedIndex(index)}
            style={[
              styles.thumbnail,
              index === selectedIndex && styles.thumbnailSelected,
            ]}
          >
            <Image
              source={{ uri: imageUrl }}
              style={styles.thumbnailImage}
              resizeMode="cover"
            />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  singleImage: {
    width: '100%',
    height: Platform.OS === 'web' ? 500 : 350,
  },
  mainImage: {
    width: '100%',
    height: Platform.OS === 'web' ? 500 : 350,
  },
  thumbnails: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailSelected: {
    borderColor: BrandColors.black,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
});
