import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { BrandColors, Spacing, Typography } from '@/constants/theme';

interface CategoryTab {
  id: number | 'all';
  name: string;
  slug: string;
}

interface CategoryTabsProps {
  categories: CategoryTab[];
  selectedId: number | 'all';
  onSelect: (id: number | 'all') => void;
}

export function CategoryTabs({ categories, selectedId, onSelect }: CategoryTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category) => {
        const isSelected = category.id === selectedId;
        return (
          <Pressable
            key={category.id}
            onPress={() => onSelect(category.id)}
            style={({ pressed }) => [
              styles.tab,
              isSelected && styles.tabSelected,
              pressed && styles.tabPressed,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                isSelected && styles.tabTextSelected,
              ]}
            >
              {category.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.gray.border,
  },
  tabSelected: {
    backgroundColor: BrandColors.black,
    borderColor: BrandColors.black,
  },
  tabPressed: {
    opacity: 0.7,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: BrandColors.gray.dark,
  },
  tabTextSelected: {
    color: BrandColors.white,
  },
});
