/**
 * Category Mapping - WordPress to App Categories
 * Maps WordPress rental_category IDs to app-level search categories
 */

export interface AppCategory {
  id: string;
  label: string;
  icon: string;
  wordpressIds: number[];
  description: string;
}

export const APP_CATEGORIES: Record<string, AppCategory> = {
  HOMES: {
    id: 'homes',
    label: 'Homes & Villas',
    icon: 'house',
    wordpressIds: [44, 99], // Villa (44), Property (99)
    description: 'Luxury villas, estates, and vacation homes',
  },
  YACHTS: {
    id: 'yachts',
    label: 'Yachts',
    icon: 'sailboat',
    wordpressIds: [45], // Yacht (45)
    description: 'Superyachts and luxury boat charters',
  },
  TRANSPORT: {
    id: 'transport',
    label: 'Transport',
    icon: 'car',
    wordpressIds: [84], // Transport (84)
    description: 'Luxury vehicles and private transportation',
  },
};

/**
 * Get WordPress category IDs from app category ID
 */
export function getWordPressCategoryIds(appCategoryId: string): number[] {
  const category = Object.values(APP_CATEGORIES).find(
    (cat) => cat.id === appCategoryId
  );
  return category?.wordpressIds || [];
}

/**
 * Get app category from WordPress category ID
 */
export function getAppCategoryFromWordPressId(wpCategoryId: number): AppCategory | null {
  return (
    Object.values(APP_CATEGORIES).find((cat) =>
      cat.wordpressIds.includes(wpCategoryId)
    ) || null
  );
}

/**
 * Get all category IDs as array for easy iteration
 */
export const CATEGORY_IDS = Object.keys(APP_CATEGORIES);

/**
 * Get categories as array for rendering
 */
export const CATEGORIES_ARRAY = Object.values(APP_CATEGORIES);
