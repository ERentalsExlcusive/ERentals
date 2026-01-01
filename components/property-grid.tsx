import { StyleSheet, View, FlatList, Platform, Dimensions } from 'react-native';
import { PropertyCard } from './property-card';
import { Rental } from '@/types/rental';
import { Spacing } from '@/constants/theme';

interface PropertyGridProps {
  properties: Rental[];
  onPropertyPress?: (rental: Rental) => void;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
}

// Determine number of columns based on screen width
function getNumColumns() {
  if (Platform.OS !== 'web') return 2;
  const width = Dimensions.get('window').width;
  if (width > 1400) return 4;
  if (width > 1024) return 3;
  if (width > 768) return 2;
  return 1;
}

export function PropertyGrid({
  properties,
  onPropertyPress,
  ListHeaderComponent,
  ListFooterComponent,
}: PropertyGridProps) {
  const numColumns = getNumColumns();

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
