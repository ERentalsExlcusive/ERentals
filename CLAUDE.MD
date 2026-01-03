# CLAUDE.MD - ERentals Exclusive Project Documentation

> **Last Updated:** January 2, 2026
> **Status:** QA Phase 2 - Search Pill Rebuild
> **Deployment:** https://dist-seven-iota-53.vercel.app/

---

## 1. Project Overview

**ERentals Exclusive** is a luxury property rental marketplace built with React Native/Expo for cross-platform deployment (Web, iOS, Android).

| Attribute | Value |
|-----------|-------|
| **Framework** | Expo SDK 54 with TypeScript |
| **Platforms** | Web (primary), iOS, Android |
| **Backend** | WordPress REST API |
| **Hosting** | Vercel (static export) |
| **Bundle ID** | `com.erentals.exclusive` |
| **App Scheme** | `erentals://` |

### Brand Identity
A luxury property rental company projecting sophistication, elegance, and premium quality. Tone: "curated," "exclusive," "discerning," "unparalleled."

---

## 2. Quick Start

```bash
# Prerequisites: Node.js 20+
node -v  # Should be v20.x or higher

# Install dependencies
npm install

# Development
npm run web        # Web browser
npm run ios        # iOS Simulator (requires Xcode)
npm start          # Choose platform interactively

# Production Build
npx expo export --platform web   # Outputs to dist/
vercel --prod                    # Deploy to Vercel

# Code Quality
npm run lint       # ESLint
npx tsc --noEmit   # TypeScript check
```

---

## 3. Project Architecture

```
ERentals/
├── app/                              # Expo Router (file-based routing)
│   ├── _layout.tsx                   # Root layout (fonts, theme, providers)
│   ├── modal.tsx                     # Modal screen
│   ├── +not-found.tsx                # 404 fallback
│   ├── (tabs)/                       # Tab navigation group
│   │   ├── _layout.tsx               # Tab navigator config
│   │   ├── index.tsx                 # Home (Hero + Search + Grid)
│   │   ├── explore.tsx               # Creator Hub (coming soon)
│   │   └── contact.tsx               # Contact/Concierge
│   └── property/
│       └── [id].tsx                  # Property detail (dynamic route)
│
├── components/                       # 32 UI components
│   ├── brand-button.tsx              # Primary CTA button
│   ├── hero.tsx                      # Full-height hero section
│   ├── header.tsx                    # Top navigation bar
│   ├── search-bar.tsx                # Advanced search (637 lines)
│   ├── bottom-sheet.tsx              # Modal overlay component
│   ├── date-picker.tsx               # Calendar date range picker
│   ├── property-card.tsx             # Property listing card
│   ├── property-grid.tsx             # Responsive grid layout
│   ├── property-gallery.tsx          # Image carousel with fullscreen
│   ├── booking-card.tsx              # Desktop booking sidebar
│   ├── booking-bottom-bar.tsx        # Mobile floating booking bar
│   ├── category-tabs.tsx             # Filter tabs (Villa/Yacht/Transport)
│   ├── custom-tab-bar.tsx            # Bottom tab navigation
│   ├── amenity-icons.tsx             # WiFi, Pool, AC, etc. icons
│   ├── luxury-amenity-icons.tsx      # Premium icon variants
│   ├── skeleton.tsx                  # Loading placeholder
│   ├── skeleton-loader.tsx           # Animated skeleton
│   ├── contact-form.tsx              # Inquiry form
│   ├── favorite-prompt-modal.tsx     # Email capture modal
│   └── [... 13 more components]
│
├── constants/
│   ├── theme.ts                      # Brand colors, typography
│   └── design-tokens.ts              # 8pt grid, spacing, shadows
│
├── hooks/
│   ├── use-rentals.ts                # Rental data fetching
│   ├── use-responsive.ts             # Breakpoint detection
│   ├── use-locations.ts              # City/country fetching
│   ├── use-cities.ts                 # Cities with images
│   ├── use-color-scheme.ts           # Light/dark mode
│   ├── use-color-scheme.web.ts       # Web-specific scheme
│   └── use-theme-color.ts            # Theme color utility
│
├── services/
│   └── api.ts                        # WordPress REST API client (260 lines)
│
├── types/
│   └── rental.ts                     # TypeScript interfaces
│
├── data/
│   └── property-data.ts              # 90+ properties with pricing (1536 lines)
│
├── assets/images/                    # Icons, logos, splash screens
├── dist/                             # Production build output
├── .vercel/                          # Vercel deployment config
│
├── package.json                      # Dependencies
├── app.json                          # Expo configuration
├── tsconfig.json                     # TypeScript config
├── vercel.json                       # Vercel build config
├── QA_BUG_LIST.md                    # Known issues & fix plan
└── CLAUDE.MD                         # This file
```

---

## 4. Brand & Design System

### Color Palette

```typescript
// constants/theme.ts
BrandColors = {
  primary: '#000000',        // Pure black - primary text, backgrounds
  secondary: '#bc944d',      // Gold accent - CTAs, highlights, tab icons
  white: '#ffffff',
  black: '#000000',
  gray: {
    light: '#f8f8f8',        // Ultra light backgrounds
    medium: '#999999',       // Secondary text
    dark: '#333333',         // Body text
    darker: '#1a1a1a',       // Dark mode backgrounds
    border: '#e5e5e5',       // Borders
  },
}
```

### Typography

| Level | Size | Weight | Line Height |
|-------|------|--------|-------------|
| H1 | 48px | Bold (700) | 56px |
| H2 | 36px | Bold (700) | 44px |
| H3 | 28px | SemiBold (600) | 36px |
| Body | 18px | Regular (400) | 28px |
| Body Small | 16px | Regular (400) | 24px |
| Button | 16px | SemiBold (600) | 24px |

**Font Families:**
- **Web:** Cormorant Garamond, DM Serif Display
- **iOS:** Georgia (serif fallback)
- **Android:** System serif

### Design Tokens (8pt Grid)

```typescript
// constants/design-tokens.ts
Space = { 0:0, 1:4, 2:8, 3:12, 4:16, 5:20, 6:24, 8:32, 10:40, 12:48, 14:56, 16:64, 20:80, 24:96 }
FontSize = { xs:11, sm:13, base:15, md:16, lg:18, xl:20, '2xl':24, '3xl':28, '4xl':32, '5xl':36, '6xl':44 }
Radius = { none:0, sm:2, base:4, md:8, lg:12, xl:16, '2xl':20, full:9999 }
TouchTarget = { min:44, comfortable:48, spacious:56 }
ZIndex = { base:0, dropdown:1000, sticky:1100, overlay:1200, modal:1300, toast:1400 }
```

### Button Variants

| Variant | Background | Text | Use Case |
|---------|------------|------|----------|
| **Primary** | Black (#000) | White | Main CTAs |
| **Ghost** | Transparent + border | Black | Secondary actions |
| **Accent** | Gold (#bc944d) | White | Highlights, premium |

All buttons: 24px border-radius (pill shape), 14px vertical / 28px horizontal padding.

---

## 5. Component Library (32 Components)

### Core UI
| Component | File | Purpose |
|-----------|------|---------|
| `BrandButton` | brand-button.tsx | Reusable button (primary/ghost/accent) |
| `ThemedText` | themed-text.tsx | Auto-themed text (title/subtitle/link) |
| `ThemedView` | themed-view.tsx | Auto-themed container |

### Hero & Search
| Component | File | Lines | Purpose |
|-----------|------|-------|---------|
| `Hero` | hero.tsx | 123 | Full-height hero with image background |
| `SearchBar` | search-bar.tsx | 637 | Destination, dates, guests search |
| `BottomSheet` | bottom-sheet.tsx | 206 | Platform-aware modal overlay |
| `DatePicker` | date-picker.tsx | 358 | Calendar range picker |

### Property Listings
| Component | File | Purpose |
|-----------|------|---------|
| `PropertyCard` | property-card.tsx | Modern property card with wishlist |
| `PropertyGrid` | property-grid.tsx | Responsive 1-4 column grid |
| `RentalCard` | rental-card.tsx | Simple property card |

### Property Detail
| Component | File | Purpose |
|-----------|------|---------|
| `PropertyGallery` | property-gallery.tsx | Swipe carousel + fullscreen modal |
| `ImageGallery` | image-gallery.tsx | Main image + thumbnails |
| `BookingCard` | booking-card.tsx | Desktop sticky booking sidebar |
| `BookingBottomBar` | booking-bottom-bar.tsx | Mobile floating inquiry bar |
| `AmenityList` | amenity-list.tsx | Amenity display with icons |

### Navigation
| Component | File | Purpose |
|-----------|------|---------|
| `Header` | header.tsx | Top nav with desktop links |
| `CustomTabBar` | custom-tab-bar.tsx | Bottom tab navigation |
| `CategoryTabs` | category-tabs.tsx | Horizontal filter pills |
| `HapticTab` | haptic-tab.tsx | Tab with iOS haptic feedback |

### Icons
| Component | File | Icons |
|-----------|------|-------|
| `AmenityIcons` | amenity-icons.tsx | WiFi, Pool, AC, Parking, Kitchen, Gym, Beach, TV, Pet, Washer |
| `LuxuryAmenityIcons` | luxury-amenity-icons.tsx | Premium monolinear variants |
| `CustomIcons` | custom-icons.tsx | GroupedAvatars, Phone |
| `IconSymbol` | ui/icon-symbol.tsx | SF Symbols / Material Icons |

### Loading & Forms
| Component | File | Purpose |
|-----------|------|---------|
| `Skeleton` | skeleton.tsx | Pulsing placeholder |
| `SkeletonLoader` | skeleton-loader.tsx | Reanimated skeleton |
| `ContactForm` | contact-form.tsx | Inquiry form with validation |
| `FavoritePromptModal` | favorite-prompt-modal.tsx | Email capture modal |

---

## 6. Data Layer

### WordPress REST API

**Base URL:** `https://erentalsexclusive.com/wp-json/wp/v2`

| Endpoint | Description |
|----------|-------------|
| `/rental_asset` | Primary rental properties |
| `/listing` | Secondary listings |
| `/creator` | User content |
| `/city` | City taxonomy |
| `/country` | Country taxonomy |
| `/rental_category` | Property types |

**Category IDs:**
```typescript
RentalCategory = { Villa: 44, Yacht: 45, Transport: 84, Property: 99, Hotel: 102 }
Country = { Colombia: 111, CostaRica: 129, France: 119, Greece: 133, Mexico: 100, Turkey: 116, USA: 117 }
```

### API Functions (`services/api.ts`)

```typescript
getRentals(params?)          // Paginated listings with filters
getRentalById(id)            // Single rental by ID
getRentalBySlug(slug)        // Single rental by URL slug
getCities()                  // All city terms
getCountries()               // All country terms
getRentalCategories()        // All category terms
searchRentals(query)         // Keyword search
getRentalGallery(rentalId)   // Property gallery images
```

### TypeScript Types (`types/rental.ts`)

```typescript
interface Rental {
  id: number
  title: string
  slug: string
  link: string
  datePublished: string
  dateModified: string
  content: string
  excerpt: string
  featuredImage: { url, alt, width, height, sizes } | null
  city: TaxonomyTerm | null
  country: TaxonomyTerm | null
  category: TaxonomyTerm | null
  status: TaxonomyTerm | null
  acf?: Record<string, unknown>
}

interface TaxonomyTerm { id, name, slug, count, description?, link? }
```

### Custom Hooks (`hooks/`)

| Hook | Returns | Purpose |
|------|---------|---------|
| `useRentals(params?)` | rentals, loading, error, loadMore, refresh | Paginated listing data |
| `useRental(id)` | rental, loading, error | Single rental detail |
| `useCities()` | cities (with images), loading, error | Cities for location picker |
| `useLocations()` | locations, loading, error | Combined cities + countries |
| `useResponsive()` | width, isMobile, isTablet, isDesktop | Breakpoint detection |
| `useColorScheme()` | 'light' \| 'dark' | System color scheme |
| `useThemeColor(props, colorName)` | color string | Theme-aware color |

### Property Data Enrichment (`data/property-data.ts`)

**90+ properties** with pricing, specs, and amenities sourced from Google Sheets.

```typescript
interface PropertyData {
  assetName: string
  assetSlug: string
  category: 'villa' | 'yacht' | 'transport' | 'property' | 'hotel'
  country, region, city: string
  guestMax, bedrooms, bathrooms: number | null
  overview: string
  displayPrice: string
  minStayNights: number | null
  amenities: string[]
  icalUrl?: string
}

// Usage:
import { getPropertyDataBySlug } from '@/data/property-data';
const propertyData = getPropertyDataBySlug(rental.slug);
```

### Data Flow

```
WordPress API (rental_asset)
    ↓ [fetch with _embed=true]
transformRental() in api.ts
    ↓ [decode HTML, extract media/taxonomies, filter previews]
Rental object (typed)
    ↓ [passed to component]
getPropertyDataBySlug(rental.slug)
    ↓ [merge pricing, specs, amenities]
Complete property display
```

---

## 7. App Routes & Navigation

### Route Map

| Path | Screen | Data Source |
|------|--------|-------------|
| `/` | Home | Hero + SearchBar + PropertyGrid |
| `/explore` | Creator Hub | Coming soon placeholder |
| `/contact` | Contact | Concierge info |
| `/property/[id]` | Property Detail | useRental(id) + getPropertyDataBySlug() |

### Tab Navigation

```
Home (house icon) → / (index.tsx)
Creators (avatars icon) → /explore (explore.tsx)
Contact (phone icon) → /contact (contact.tsx)
```

### Root Layout Features (`app/_layout.tsx`)
- Font loading (Cormorant Garamond, DM Serif Display)
- Theme provider (light/dark mode)
- Splash screen handling
- Status bar configuration

---

## 8. Configuration Files

### package.json (Key Dependencies)

```json
{
  "react": "19.1.0",
  "react-native": "0.81.5",
  "expo": "~54.0.30",
  "expo-router": "~6.0.21",
  "typescript": "~5.9.2",
  "react-native-web": "~0.21.0",
  "react-native-reanimated": "~4.1.1",
  "@react-navigation/bottom-tabs": "^7.4.0",
  "@expo-google-fonts/cormorant-garamond": "^0.4.1",
  "@expo-google-fonts/dm-serif-display": "^0.4.2"
}
```

### app.json (Expo Config)

```json
{
  "name": "ERentals Exclusive",
  "slug": "erentals-exclusive",
  "scheme": "erentals",
  "newArchEnabled": true,
  "experiments": { "typedRoutes": true, "reactCompiler": true },
  "ios": { "bundleIdentifier": "com.erentals.exclusive" },
  "web": { "output": "static" }
}
```

### vercel.json

```json
{
  "buildCommand": "npx expo export --platform web",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### tsconfig.json

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": { "@/*": ["./*"] }
  }
}
```

---

## 9. Deployment

| Attribute | Value |
|-----------|-------|
| **Production URL** | https://dist-seven-iota-53.vercel.app/ |
| **Platform** | Vercel |
| **Build Command** | `npx expo export --platform web` |
| **Output Directory** | `dist/` |
| **Routing** | SPA rewrites to index.html |

### Build Output (`dist/`)
```
dist/
├── index.html
├── contact.html, explore.html, modal.html
├── property/[id].html
├── _expo/static/js/     # Web, iOS, Android bundles
├── assets/              # Images, fonts (hashed)
└── metadata.json
```

### Environment Variables
- `.env.local` - Vercel OIDC token (auto-generated, do not commit)

---

## 10. Current QA Status

**14 bugs documented in `QA_BUG_LIST.md`**

| Phase | Status | Focus |
|-------|--------|-------|
| 1 | ✅ Complete | Bug documentation |
| 2 | 🔥 **Current** | Search pill rebuild |
| 3 | Pending | "Where to?" modal fix |
| 4 | Pending | Date picker fix |
| 5 | Pending | Listing page polish |
| 6 | Pending | Booking flow |
| 7 | Pending | iCal availability |

### Critical Bugs
1. **Search Bar:** Giant black "Clear" bar, cramped spacing, typography issues
2. **Where To Modal:** Destinations not clickable (scroll conflict)
3. **Date Picker:** Calendar not working on home page
4. **Listing Page:** Too much whitespace, black hero images, header shows "[id]"
5. **Booking Flow:** No actual booking functionality yet

### Quality Standards
- 8pt spacing system (8/12/16/24/32/48)
- 56px minimum touch targets on mobile
- Test on iOS Safari + desktop Chrome
- No "AI vibe" - intentional luxury aesthetic

---

## 11. Development Roadmap

### Completed
- ✅ Expo project with TypeScript
- ✅ Brand theme system (colors, typography, spacing)
- ✅ WordPress REST API integration
- ✅ Property listings with live data
- ✅ Property detail pages with galleries
- ✅ Booking cards (desktop sidebar, mobile bar)
- ✅ Search bar with destination/date/guest pickers
- ✅ Category filtering tabs
- ✅ Responsive grid layouts (1-4 columns)
- ✅ Skeleton loading states
- ✅ Custom amenity icons
- ✅ Vercel deployment

### In Progress
- 🔥 Search pill UI polish
- 🔥 Date picker reliability

### Upcoming
- [ ] Booking inquiry → GoHighLevel webhook
- [ ] iCal availability integration
- [ ] Confirmation page with WhatsApp CTA
- [ ] User authentication
- [ ] Favorites/saved properties
- [ ] Push notifications

---

## 12. Critical Reminders for Claude

### Code Conventions
```typescript
// Use path aliases
import { BrandButton } from '@/components/brand-button';
import { BrandColors, Typography } from '@/constants/theme';
import { Space, FontSize, Radius } from '@/constants/design-tokens';

// Use property data enrichment
import { getPropertyDataBySlug } from '@/data/property-data';
const propertyData = getPropertyDataBySlug(rental.slug);

// Use responsive hooks
const { isMobile, isTablet, isDesktop, width } = useResponsive();
```

### Styling Rules
- **Always use 8pt grid:** Space[2]=8, Space[4]=16, Space[6]=24, etc.
- **Use design tokens:** Never hardcode colors, sizes, or spacing
- **Pill buttons:** 24px border-radius
- **Touch targets:** Minimum 44px, prefer 48-56px on mobile
- **Typography:** Use Typography.h1/h2/h3/body from theme

### Font Usage
```typescript
// Google Fonts (loaded in _layout.tsx)
fontFamily: 'CormorantGaramond_400Regular'
fontFamily: 'CormorantGaramond_600SemiBold'
fontFamily: 'CormorantGaramond_700Bold'
fontFamily: 'DMSerifDisplay_400Regular'
```

### Testing Checklist
- [ ] iOS Safari (mobile viewport 375x667)
- [ ] Desktop Chrome (1440px+)
- [ ] Check all touch targets
- [ ] Verify no micro-glitches
- [ ] Ensure luxury aesthetic (no "AI vibe")

### Git Repository
```bash
git remote: git@github.com-silo:ERentalsExlcusive/ERentals.git
```

---

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native](https://reactnative.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [WordPress REST API](https://developer.wordpress.org/rest-api/)

---

**Maintainer:** Claude Code Assistant
**Project:** ERentals Exclusive
**Version:** 1.0.0
