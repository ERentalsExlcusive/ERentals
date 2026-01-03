import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { BrandColors, Spacing, Typography } from '@/constants/theme';
import { Space, FontSize, LineHeight, FontWeight, Radius, TouchTarget } from '@/constants/design-tokens';

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
    paddingHorizontal: Space[6],
    paddingVertical: Space[4],
    gap: Space[2],
  },
  tab: {
    paddingVertical: Space[3],
    paddingHorizontal: Space[6],
    borderRadius: Radius.full,
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.gray.border,
    minHeight: TouchTarget.min,
    justifyContent: 'center',
  },
  tabSelected: {
    backgroundColor: BrandColors.black,
    borderColor: BrandColors.black,
  },
  tabPressed: {
    opacity: 0.7,
  },
  tabText: {
    fontSize: FontSize.base,
    lineHeight: LineHeight.base,
    fontWeight: FontWeight.medium,
    color: BrandColors.gray.dark,
  },
  tabTextSelected: {
    color: BrandColors.white,
  },
});
