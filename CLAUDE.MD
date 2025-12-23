# CLAUDE.MD - Project Context & Objectives

## Project Overview

**Name:** ERentals Exclusive
**Type:** Cross-platform React Native application
**Framework:** Expo with TypeScript
**Target Platforms:** Web, iOS
**Created:** December 20, 2025

## Brand Guidelines

### Brand Identity
ERentals Exclusive is a luxury property rental company specializing in exclusive vacation accommodations. The brand projects sophistication, elegance, and premium quality.

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Primary (Navy) | `#1f2839` | Headers, dark backgrounds, pressed states |
| Secondary (Gold) | `#bc944d` | Accents, CTAs, highlights, tab icons |
| White | `#ffffff` | Backgrounds, text on dark |
| Black | `#000000` | Primary text |
| Gray Light | `#f5f4f4` | Card backgrounds, subtle fills |
| Gray Medium | `#818181` | Secondary text, icons |
| Gray Dark | `#505050` | Body text |
| Gray Darker | `#232323` | Dark mode backgrounds |

### Typography
**Font Families:**
- **Cormorant Garamond** (Primary) - Elegant serif for headings and body
  - Regular (400), SemiBold (600), Bold (700)
- **DM Serif Display** - Display font for accent text and taglines

**Type Scale:**
- H1: 48px, Bold
- H2: 36px, Bold
- H3: 28px, SemiBold
- Body: 18px, Regular
- Button: 16px, SemiBold, uppercase, letter-spacing: 1

### Design Patterns
- **Buttons:** Gold background, white text, 10px border-radius, 16px vertical / 40px horizontal padding
- **Pressed State:** Navy background
- **Dividers:** 2px gold line, 40-60px width
- **Cards:** Light gray background (#f5f4f4), 10px border-radius
- **Spacing:** 8px base unit (xs:4, sm:8, md:16, lg:24, xl:32, xxl:48)

### Tone of Voice
- Sophisticated and refined
- Emphasizes exclusivity and luxury
- Uses words like: "curated," "exclusive," "discerning," "unparalleled," "elegant"

## Current Objectives

### Primary Goal
Create a luxury rental property app that matches the erentalsexclusive.com brand identity.

### Completed Tasks
- ✅ Initialize Expo project with default template
- ✅ Configure project name to "erentals-exclusive" (app.json, package.json)
- ✅ Set up iOS bundle identifier: `com.erentals.exclusive`
- ✅ Implement brand theme system (colors, typography, spacing)
- ✅ Set up Google Fonts (Cormorant Garamond, DM Serif Display)
- ✅ Create branded home screen with hero section
- ✅ Create BrandButton component (primary, secondary, outline variants)
- ✅ Connect to WordPress REST API backend
- ✅ Create API service layer with TypeScript types
- ✅ Implement rental listings with live data from WordPress
- ✅ Create RentalCard component with image, title, location, category

### Current Status
**BLOCKED:** Requires Node.js 20+ to run (currently on v18.19.1)
- User is using nvm and can easily upgrade
- Once Node is upgraded, app should run successfully

## Backend API (WordPress)

### Base URL
`https://erentalsexclusive.com/wp-json/wp/v2`

### Custom Post Types
| Endpoint | Description |
|----------|-------------|
| `/rental_asset` | Primary rental property listings |
| `/listing` | Secondary listing content |
| `/creator` | User-generated content |

### Taxonomies
| Endpoint | Description | Example Values |
|----------|-------------|----------------|
| `/city` | Geographic cities | Mykonos, Tulum, Miami |
| `/country` | Countries | USA (40), Mexico (26), France (9), Greece (7) |
| `/rental_category` | Property types | Villa (54), Yacht (16), Transport (13), Property (5), Hotel (2) |
| `/rental_status` | Availability status | - |

### Query Parameters
- `_embed=true` - Include featured media and taxonomy terms
- `per_page=N` - Items per page (default 10)
- `page=N` - Pagination
- `city=ID` - Filter by city
- `country=ID` - Filter by country
- `rental_category=ID` - Filter by category
- `search=term` - Search by keyword

### Response Headers
- `X-WP-Total` - Total items
- `X-WP-TotalPages` - Total pages

### App Integration
- **Types:** `types/rental.ts` - TypeScript interfaces for API responses
- **Service:** `services/api.ts` - API fetch functions with transforms
- **Hooks:** `hooks/use-rentals.ts` - React hooks for data fetching

## Technology Stack

### Core Technologies
- **React:** 19.1.0
- **React Native:** 0.81.5
- **TypeScript:** ~5.9.2
- **Expo SDK:** ~54.0.30
- **Expo Router:** ~6.0.21 (file-based navigation)

### Key Dependencies
- `react-native-web`: ~0.21.0 (web support)
- `react-native-reanimated`: ~4.1.1 (animations)
- `@react-navigation/bottom-tabs`: ^7.4.0 (tab navigation)
- `@expo-google-fonts/cormorant-garamond`: ^0.4.1 (brand typography)
- `@expo-google-fonts/dm-serif-display`: ^0.4.2 (display font)

### Development Tools
- ESLint: ^9.25.0
- TypeScript strict mode enabled
- Expo Metro bundler

## Architecture

### Project Structure
```
erentals-app/
├── app/                          # Expo Router - File-based routing
│   ├── (tabs)/                   # Tab navigation route group
│   │   ├── _layout.tsx           # Tab navigator configuration
│   │   ├── index.tsx             # Home screen with hero
│   │   └── explore.tsx           # Properties listing (live data)
│   ├── _layout.tsx               # Root layout (theme, fonts, providers)
│   └── +not-found.tsx            # 404 fallback page
│
├── components/                   # Reusable UI components
│   ├── brand-button.tsx          # Branded button (primary/secondary/outline)
│   ├── rental-card.tsx           # Property card with image overlay
│   ├── themed-text.tsx           # Text with automatic theming
│   ├── themed-view.tsx           # View with automatic theming
│   └── ui/                       # UI component library
│
├── constants/                    # App-wide constants
│   └── theme.ts                  # Brand colors, typography, spacing
│
├── hooks/                        # Custom React hooks
│   ├── use-color-scheme.ts       # Light/dark mode detection
│   └── use-rentals.ts            # Rental data fetching hooks
│
├── services/                     # API layer
│   └── api.ts                    # WordPress REST API client
│
├── types/                        # TypeScript definitions
│   └── rental.ts                 # Rental, taxonomy, API types
│
├── assets/                       # Static assets
│   ├── images/                   # Icons, logos, splash screens
│   └── fonts/                    # Custom fonts
│
├── app.json                      # Expo configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies and scripts
└── CLAUDE.MD                     # This file - AI context document
```

### Key Architectural Decisions

1. **Expo Router (File-based Navigation)**
   - Routes are defined by file structure in `app/` directory
   - Route groups like `(tabs)` organize navigation without affecting URLs
   - Typed routes enabled for type-safe navigation

2. **Theme System**
   - Automatic light/dark mode support
   - Themed components (ThemedText, ThemedView) throughout
   - Color scheme detection via custom hooks

3. **TypeScript Configuration**
   - Strict mode enabled
   - Path aliases configured: `@/` maps to project root
   - Examples: `@/components/*`, `@/constants/*`, `@/hooks/*`

4. **Modern React Native Architecture**
   - New Architecture enabled (`newArchEnabled: true`)
   - React Compiler experiments enabled
   - Better performance and future-proofing

## Development Workflow

### Available Scripts
```bash
npm start          # Start Expo dev server (choose platform)
npm run web        # Launch web version
npm run ios        # Launch iOS simulator
npm run android    # Launch Android emulator (not configured yet)
npm run lint       # Run ESLint
npx tsc --noEmit   # TypeScript type checking
```

### Development Server
- Metro bundler serves both web and native platforms
- Hot reload enabled (Fast Refresh)
- Press `w` for web, `i` for iOS from `npm start`

### Build & Deploy
- **Web:** `npx expo export` → static files for deployment
- **iOS:** Use EAS Build (`eas build --platform ios`)

## Current Implementation

### Home Screen (`app/(tabs)/index.tsx`)
Branded landing page with luxury aesthetic:
- **Hero Section:** Navy background with brand name in Cormorant Garamond
- **Tagline:** "Exclusive" in gold DM Serif Display with wide letter-spacing
- **Divider:** Gold accent line
- **Subtitle:** "Luxury Properties for Discerning Guests"
- **Content Section:** Welcome message and CTA button
- **Button:** Gold "Explore Properties" with press state

### Properties Screen (`app/(tabs)/explore.tsx`)
Live rental listings from WordPress:
- **Header:** "Our Properties" with dynamic count
- **FlatList:** Paginated rental cards with pull-to-refresh
- **Loading State:** Branded spinner with loading text
- **Error Handling:** Graceful error display
- **Infinite Scroll:** Load more on scroll end

### RentalCard Component (`components/rental-card.tsx`)
Property card with image overlay:
- **Featured Image:** Full-bleed with dark gradient overlay
- **Category Badge:** Gold pill with category name
- **Title:** Large serif text (removes "– Preview" suffix)
- **Location:** City, Country format
- **Press State:** Scale and opacity feedback

### BrandButton Component (`components/brand-button.tsx`)
Reusable button with three variants:
- **Primary:** Gold background, white text
- **Secondary:** Navy background, white text
- **Outline:** Transparent with gold border, gold text
All variants have press states and consistent styling

### API Layer (`services/api.ts`)
WordPress REST API client:
- **getRentals():** Paginated listing with filters
- **getRentalById():** Single rental by ID
- **getRentalBySlug():** Single rental by URL slug
- **getCities/getCountries/getRentalCategories():** Taxonomy fetchers
- **searchRentals():** Keyword search

## Known Issues

### Critical
1. **Node.js Version Mismatch**
   - Required: Node.js 20.19.4+
   - Current: v18.19.1
   - Error: `configs.toReversed is not a function`
   - Solution: Upgrade via nvm (`nvm install 20 && nvm use 20`)

### Warnings (Non-blocking)
- Various deprecated packages (inflight, rimraf, glob@7)
  - These are dependencies of dependencies, not urgent

## Next Steps

### Immediate
1. [ ] Upgrade Node.js to version 20+
2. [ ] Test web app: `npm run web`
3. [ ] Test iOS app: `npm run ios` (requires Xcode)

### Future Development Roadmap
1. [ ] Create rental detail screen with full property info
2. [ ] Add category/country filter UI
3. [ ] Implement search functionality
4. [ ] Add favorites/saved properties (local storage)
5. [ ] Create booking inquiry flow
6. [ ] Add image gallery/carousel for properties
7. [ ] Implement push notifications
8. [ ] Add testing setup (Jest, React Testing Library)
9. [ ] Configure CI/CD pipeline

### Scalability Considerations
When the app grows, consider:
- Moving to `src/` directory structure
- Adding `types/` for shared TypeScript definitions
- Creating `utils/` for helper functions
- Setting up `services/` for API calls
- Implementing `store/` or `context/` for state management
- Adding `config/` for environment variables

## Important Notes

### For Future Claude Sessions
- Project uses **Expo Router** (not React Navigation directly)
- Path aliases are configured: use `@/components/...` instead of relative paths
- **Use brand fonts:** `CormorantGaramond_400Regular`, `CormorantGaramond_600SemiBold`, `CormorantGaramond_700Bold`, `DMSerifDisplay_400Regular`
- **Use brand colors:** Import from `@/constants/theme` (BrandColors, Colors, Typography, Spacing)
- **Use BrandButton component** for all CTAs - supports primary, secondary, outline variants
- Maintain luxury aesthetic: elegant typography, gold accents, generous spacing
- TypeScript strict mode is enabled - maintain type safety

### Environment Configuration
- No `.env` file yet - add when API keys are needed
- iOS bundle ID: `com.erentals.exclusive`
- App scheme: `erentals://`

### Git Repository
- Git initialized
- Remote: `git@github.com-silo:ERentalsExlcusive/ERentals.git`

## Resources

### Official Documentation
- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [React Native Documentation](https://reactnative.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Key Expo Router Concepts
- [File-based routing](https://docs.expo.dev/router/create-pages/)
- [Typed routes](https://docs.expo.dev/router/reference/typed-routes/)
- [Layouts](https://docs.expo.dev/router/layouts/)
- [Route groups](https://docs.expo.dev/router/layouts/#route-groups)

---

**Last Updated:** December 23, 2025
**Status:** WordPress API integrated, live rental listings, pending Node.js upgrade
**Maintainer:** Claude Code Assistant
