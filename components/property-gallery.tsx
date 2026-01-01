import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
  Platform,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { GalleryImage } from '@/services/api';
import { BrandColors, Spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';

interface PropertyGalleryProps {
  images: GalleryImage[];
}

export function PropertyGallery({ images }: PropertyGalleryProps) {
  const { isMobile, width } = useResponsive();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  if (images.length === 0) return null;

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  };

  const scrollToIndex = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * width,
      animated: true,
    });
    setCurrentIndex(index);
  };

  const nextImage = () => {
    const nextIndex = (currentIndex + 1) % images.length;
    scrollToIndex(nextIndex);
  };

  const prevImage = () => {
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    scrollToIndex(prevIndex);
  };

  return (
    <>
      <View style={styles.container}>
        {/* Main Gallery Carousel */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
        >
          {images.map((image) => (
            <Pressable
              key={image.id}
              onPress={() => setFullscreenVisible(true)}
              style={[styles.imageContainer, { width }]}
            >
              <Image
                source={{ uri: image.sizes.large || image.url }}
                style={styles.image}
                resizeMode="cover"
              />
            </Pressable>
          ))}
        </ScrollView>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Pressable
              style={[styles.arrow, styles.arrowLeft, isMobile && styles.arrowMobile]}
              onPress={prevImage}
            >
              <Feather name="chevron-left" size={isMobile ? 24 : 36} color={BrandColors.white} />
            </Pressable>
            <Pressable
              style={[styles.arrow, styles.arrowRight, isMobile && styles.arrowMobile]}
              onPress={nextImage}
            >
              <Feather name="chevron-right" size={isMobile ? 24 : 36} color={BrandColors.white} />
            </Pressable>
          </>
        )}

        {/* Image Counter */}
        <View style={styles.counter}>
          <View style={styles.counterBadge}>
            <Feather name="image" size={14} color={BrandColors.white} />
            <Text style={styles.counterText}>
              {currentIndex + 1} / {images.length}
            </Text>
          </View>
        </View>

        {/* Fullscreen Toggle */}
        <Pressable
          style={styles.fullscreenButton}
          onPress={() => setFullscreenVisible(true)}
        >
          <Feather name="maximize" size={20} color={BrandColors.white} />
        </Pressable>

        {/* Pagination Dots */}
        {images.length > 1 && images.length <= 10 && (
          <View style={styles.pagination}>
            {images.map((_, index) => (
              <Pressable
                key={index}
                onPress={() => scrollToIndex(index)}
                style={[
                  styles.dot,
                  index === currentIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>
        )}
      </View>

      {/* Fullscreen Modal */}
      <Modal
        visible={fullscreenVisible}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setFullscreenVisible(false)}
      >
        <View style={styles.fullscreenContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
          >
            {images.map((image) => (
              <View
                key={image.id}
                style={[styles.fullscreenImageContainer, { width: Dimensions.get('window').width }]}
              >
                <Image
                  source={{ uri: image.url }}
                  style={styles.fullscreenImage}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>

          {/* Close Button */}
          <Pressable
            style={styles.closeButton}
            onPress={() => setFullscreenVisible(false)}
          >
            <Feather name="x" size={28} color={BrandColors.white} />
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: Platform.select({ web: 600, default: 400 }),
    backgroundColor: BrandColors.black,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    height: '100%',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: BrandColors.black,
  },
  arrow: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -24 }],
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  arrowLeft: {
    left: Spacing.lg,
  },
  arrowRight: {
    right: Spacing.lg,
  },
  arrowMobile: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  counter: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    zIndex: 10,
  },
  counterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  counterText: {
    color: BrandColors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  fullscreenButton: {
    position: 'absolute',
    top: Spacing.lg,
    left: Spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  pagination: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  dotActive: {
    backgroundColor: BrandColors.white,
    width: 24,
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: BrandColors.black,
  },
  fullscreenImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.select({ web: 40, default: 60 }),
    right: Spacing.xl,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
});
