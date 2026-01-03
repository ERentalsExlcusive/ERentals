import { View, Text, StyleSheet, Pressable, Modal, Platform, ScrollView } from 'react-native';
import { ReactNode } from 'react';
import { BrandColors } from '@/constants/theme';
import { Space, FontSize, LineHeight, FontWeight, Radius, Shadow, ZIndex, TouchTarget } from '@/constants/design-tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  height?: 'full' | 'half' | 'auto';
  scrollEnabled?: boolean;
}

export function BottomSheet({ visible, onClose, title, children, height = 'auto', scrollEnabled = true }: BottomSheetProps) {
  const insets = useSafeAreaInsets();

  // On web/desktop, show as a centered dropdown instead of bottom sheet
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.innerWidth > 768) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        {/* Backdrop - clicking closes modal */}
        <Pressable style={styles.backdrop} onPress={onClose}>
          {/* Content container - clicking inside does NOT close */}
          <Pressable
            style={styles.dropdownContainer}
            onPress={(e) => e.stopPropagation()}
          >
            {title && (
              <View style={styles.dropdownHeader}>
                <Text style={styles.title}>{title}</Text>
                <Pressable style={styles.closeButton} onPress={onClose}>
                  <Feather name="x" size={20} color={BrandColors.gray.dark} />
                </Pressable>
              </View>
            )}
            {scrollEnabled ? (
              <ScrollView
                style={styles.dropdownScrollContent}
                contentContainerStyle={styles.dropdownContentInner}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="always"
              >
                {children}
              </ScrollView>
            ) : (
              <View style={styles.dropdownContent}>
                {children}
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    );
  }

  // Mobile: Full-height bottom sheet
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Backdrop - clicking closes modal */}
      <Pressable style={styles.mobileBackdrop} onPress={onClose}>
        {/* Sheet content - clicking inside does NOT close */}
        <Pressable
          style={[
            styles.sheet,
            height === 'full' && styles.sheetFull,
            height === 'half' && styles.sheetHalf,
            { paddingBottom: Math.max(insets.bottom, Space[4]) }
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle Bar */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          {title && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <Pressable style={styles.closeButton} onPress={onClose}>
                <Feather name="x" size={24} color={BrandColors.black} />
              </Pressable>
            </View>
          )}

          {/* Content */}
          {scrollEnabled ? (
            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
              bounces={false}
              keyboardShouldPersistTaps="always"
            >
              {children}
            </ScrollView>
          ) : (
            <View style={[styles.content, styles.contentContainer]}>
              {children}
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Desktop backdrop - ensure full coverage over other modals
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: ZIndex.modal + 100, // Higher than other modals
        backdropFilter: 'blur(8px)',
      },
    }),
  },
  // Mobile backdrop - ensure full coverage
  mobileBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    ...Platform.select({
      web: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: ZIndex.modal + 100,
      },
    }),
  },
  sheet: {
    backgroundColor: BrandColors.white,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingTop: Space[3],
    maxHeight: '90%',
    ...Shadow.xl,
  },
  sheetFull: {
    maxHeight: '100%',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  sheetHalf: {
    maxHeight: '60%',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: Space[2],
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: BrandColors.gray.border,
    borderRadius: Radius.full,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space[6],
    paddingVertical: Space[4],
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray.border,
  },
  title: {
    fontSize: FontSize.lg,
    lineHeight: LineHeight.lg,
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
  },
  closeButton: {
    width: TouchTarget.min,
    height: TouchTarget.min,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Space[6],
  },
  // Desktop dropdown styles - FIXED dimensions to prevent resize
  dropdownContainer: {
    backgroundColor: BrandColors.white,
    borderRadius: Radius.xl,
    width: 480, // Fixed width - no resizing
    minHeight: 400, // Minimum height - stable sizing
    maxHeight: '80vh',
    overflow: 'hidden',
    ...Shadow.lg,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Space[6],
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray.border,
  },
  dropdownScrollContent: {
    flex: 1,
  },
  dropdownContentInner: {
    padding: Space[6],
  },
  dropdownContent: {
    padding: Space[6],
  },
});
