import { StyleSheet, View, FlatList, Platform } from 'react-native';
import { PropertyCard } from './property-card';
import { Rental } from '@/types/rental';
import { Spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';

interface PropertyGridProps {
  properties: Rental[];
  onPropertyPress?: (rental: Rental) => void;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
}

export function PropertyGrid({
  properties,
  onPropertyPress,
  ListHeaderComponent,
  ListFooterComponent,
}: PropertyGridProps) {
  const { width, isMobile } = useResponsive();

  // Determine number of columns based on screen width
  const numColumns = Platform.OS !== 'web'
    ? 1 // Native mobile: single column
    : isMobile
    ? 1 // Web mobile: single column
    : width > 1400
    ? 4 // Large desktop: 4 columns
    : width > 1024
    ? 3 // Desktop: 3 columns
    : 2; // Tablet: 2 columns

  return (
    <FlatList
      data={properties}
      renderItem={({ item }) => (
        <View style={[styles.cardWrapper, { width: `${100 / numColumns}%` }]}>
          <View style={styles.cardInner}>
            <PropertyCard rental={item} onPress={onPropertyPress} />
          </View>
        </View>
      )}
      keyExtractor={(item) => item.id.toString()}
      numColumns={numColumns}
      key={numColumns} // Force re-render when columns change
      contentContainerStyle={styles.gridContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
    />
  );
}

const styles = StyleSheet.create({
  gridContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  cardWrapper: {
    padding: Spacing.sm,
  },
  cardInner: {
    flex: 1,
  },
});
