# ERentals Marketplace Specification

> **Version:** 1.0.0
> **Date:** January 3, 2026
> **Status:** Active Development
> **Deployment:** https://dist-seven-iota-53.vercel.app/

---

## 1. System Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ERentals Public Journey                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   SEARCH     │───▶│   LISTING    │───▶│    MODAL     │───▶│   INQUIRY    │
│              │    │   DETAIL     │    │    FORM      │    │   OBJECT     │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Category     │    │ Asset Data   │    │ Form Fields  │    │ GHL Webhook  │
│ Detection    │    │ + Enrichment │    │ per Category │    │ + CRM Route  │
│              │    │              │    │              │    │              │
│ • Villa      │    │ • WordPress  │    │ • Villa Form │    │ • Contact    │
│ • Yacht      │    │ • property-  │    │ • Yacht Form │    │ • Custom     │
│ • Transport  │    │   data.ts    │    │ • Transport  │    │   Fields     │
│              │    │              │    │   Form       │    │ • Tags       │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
       │                   │                   │                   │
       └───────────────────┴───────────────────┴───────────────────┘
                                    │
                          ┌────────▼────────┐
                          │  ATTRIBUTION    │
                          │  PASSTHROUGH    │
                          │                 │
                          │ • asset_slug    │
                          │ • asset_name    │
                          │ • category      │
                          │ • er_id         │
                          │ • creator_id    │
                          │ • utm_source    │
                          │ • utm_medium    │
                          │ • utm_campaign  │
                          └─────────────────┘
```

### 1.1 Journey Flow Details

| Stage | Component | Location | Responsibility |
|-------|-----------|----------|----------------|
| **Search** | `SearchBar` | `components/search-bar.tsx` | Category-aware search with dynamic fields |
| **Listing Grid** | `PropertyGrid` | `components/property-grid.tsx` | Display filtered results with category badges |
| **Listing Detail** | `PropertyDetailScreen` | `app/property/[id].tsx` | Full asset view with category-specific layout |
| **Inquiry Modal** | `BookingInquiryForm` / `CharterBookingForm` | `components/` | Category-specific form fields |
| **Submission** | `submitBookingInquiry` / `submitCharterInquiry` | `services/api.ts` | GHL webhook POST |
| **Confirmation** | `BookingConfirmation` | `components/booking-confirmation.tsx` | Success state + WhatsApp CTA |

---

## 2. Data Specification

### 2.1 Shared Core Fields (All Asset Types)

| Field | Type | Required | Source | Notes |
|-------|------|----------|--------|-------|
| `asset_name` | string | ✅ | WordPress `title.rendered` | Cleaned of "– Preview" suffix |
| `asset_slug` | string | ✅ | WordPress `slug` | URL-safe identifier |
| `category` | enum | ✅ | WordPress taxonomy | `villa` \| `yacht` \| `transport` \| `property` \| `hotel` |
| `country` | string | ✅ | WordPress taxonomy | Country name |
| `region` | string | ❌ | `property-data.ts` | Sub-region (e.g., "Riviera Maya") |
| `city` | string | ✅ | WordPress taxonomy | City/port name |
| `guest_max` | number | ❌ | `property-data.ts` | Maximum guest capacity |
| `overview` | string | ❌ | `property-data.ts` | 100-word description |
| `hero_image_url` | string | ✅ | WordPress featured media | Primary image |
| `gallery` | array | ❌ | WordPress media | Additional images |
| `display_price` | string | ❌ | `property-data.ts` | "From $X" or "Price Upon Request" |
| `amenities` | array | ❌ | `property-data.ts` | List of amenity strings |
| `er_id` | string | ✅ | Generated | ERentals internal ID |
| `creator_id` | string | ❌ | URL param / session | Affiliate/creator tracking |

### 2.2 Villa / Property / Hotel Extension

| Field | Type | Required | Display Rule |
|-------|------|----------|--------------|
| `bedrooms` | number | ❌ | Show as "X Bedrooms" |
| `bathrooms` | number | ❌ | Show as "X Baths" |
| `min_stay_nights` | number | ❌ | Show "X night minimum" |
| `ical_url` | string | ❌ | Enable availability calendar |
| `display_price_unit` | string | ✅ | Always "/ night" |

**Pricing Display:**
```
If display_price exists:     "From $X,XXX / night"
If min_stay_nights exists:   "+ X night minimum"
Else:                        "Price Upon Request"
                             "Contact us for rates based on your dates"
```

### 2.3 Yacht Extension

| Field | Type | Required | Display Rule |
|-------|------|----------|--------------|
| `build_model` | string | ❌ | Show in specs section |
| `year` | number | ❌ | Show as "Built YYYY" |
| `home_port` | string | ✅ | Primary location/marina |
| `charter_hours` | array | ✅ | e.g., `["4hr", "6hr", "8hr", "overnight"]` |
| `cabins` | number | ❌ | Show as "X Cabins" (not bedrooms) |
| `water_toys` | array | ❌ | Jet ski, paddleboards, etc. |
| `charter_includes` | string | ❌ | High-level inclusions |
| `display_price_unit` | string | ✅ | "/ charter" or "/ 4 hours" etc. |

**Pricing Display:**
```
If display_price exists:     "From $X,XXX / charter"
If charter_hours[0]:         "Starting at X hours"
Else:                        "Price Upon Request"
                             "Rates vary by duration and season"
```

### 2.4 Transport Extension

| Field | Type | Required | Display Rule |
|-------|------|----------|--------------|
| `service_area` | array | ✅ | Multi-city/region coverage |
| `passenger_count` | number | ✅ | Same as `guest_max` |
| `vehicle_type` | string | ❌ | "Sprinter", "Suburban", "Luxury Sedan" |
| `service_types` | array | ✅ | `["chauffeur", "transfer", "day_rate"]` |
| `display_price_unit` | string | ✅ | "/ day" or "/ transfer" |

**Pricing Display:**
```
If display_price exists:     "From $XXX / day"
If service_types.transfer:   "Airport transfers available"
Else:                        "Price Upon Request"
                             "Quote based on itinerary"
```

---

## 3. UX Rules & Component States

### 3.1 Category-Aware Search Bar

**Current State:** Single search bar with date range + guests.

**Required State:** Dynamic fields per category.

| Category | Field 1 | Field 2 | Field 3 | Field 4 | Field 5 |
|----------|---------|---------|---------|---------|---------|
| **All** | Where | Check-in | Check-out | Guests | — |
| **Villa/Hotel** | Where | Check-in | Check-out | Guests | — |
| **Yacht** | Home Port | Charter Date | Start Time | Duration | Guests |
| **Transport** | Pickup | Dropoff | Date | Time | Passengers |

**Implementation Priority:** HIGH - This is the core marketplace differentiator.

### 3.2 Component State Definitions

#### Buttons (BrandButton)

| State | Background | Border | Text | Shadow |
|-------|------------|--------|------|--------|
| **Default** | `#000000` | none | `#FFFFFF` | `Shadow.sm` |
| **Hover** | `#1a1a1a` | none | `#FFFFFF` | `Shadow.md` |
| **Focus** | `#000000` | `2px solid #bc944d` | `#FFFFFF` | `Shadow.sm` |
| **Pressed** | `#333333` | none | `#FFFFFF` | none |
| **Disabled** | `#999999` | none | `#FFFFFF` | none |
| **Loading** | `#000000` | none | Spinner | none |

#### Chips (Duration, Occasion, Category)

| State | Background | Border | Text |
|-------|------------|--------|------|
| **Default** | `#FFFFFF` | `1.5px #e5e5e5` | `#000000` |
| **Hover** | `#f8f8f8` | `1.5px #e5e5e5` | `#000000` |
| **Selected** | `#000000` | `1.5px #000000` | `#FFFFFF` |
| **Disabled** | `#f8f8f8` | `1.5px #e5e5e5` | `#999999` |

#### Form Inputs

| State | Background | Border | Text | Label |
|-------|------------|--------|------|-------|
| **Default** | `#FFFFFF` | `1px #e5e5e5` | `#000000` | `#999999` |
| **Focus** | `#FFFFFF` | `2px #000000` | `#000000` | `#000000` |
| **Filled** | `#FFFFFF` | `1px #000000` | `#000000` | `#333333` |
| **Error** | `#FFFFFF` | `2px #dc2626` | `#000000` | `#dc2626` |
| **Disabled** | `#f8f8f8` | `1px #e5e5e5` | `#999999` | `#999999` |

### 3.3 CTA Text by Category

| Category | Primary CTA | Modal Title | Submit Button |
|----------|-------------|-------------|---------------|
| **Villa/Hotel** | "Request to Book" | "Request Booking" | "Send Request" |
| **Yacht** | "Request Charter" | "Request Charter" | "Request Charter" |
| **Transport** | "Request Transfer" | "Request Booking" | "Send Request" |

### 3.4 Focus State Policy

**CRITICAL:** Replace all default blue focus rings with ERentals brand.

```css
/* Remove default */
:focus { outline: none; }

/* Add brand focus */
:focus-visible {
  outline: 2px solid #bc944d;
  outline-offset: 2px;
}
```

---

## 4. Inquiry Form Specification

### 4.1 Shared Required Fields (All Categories)

| Field | Type | Validation | Keyboard |
|-------|------|------------|----------|
| `full_name` | text | Required, min 2 chars | `default` |
| `phone` | tel | Required, min 10 digits | `phone-pad` |
| `email` | email | Required, valid format | `email-address` |
| `preferred_contact` | select | Required | — |
| `message` | textarea | Optional, max 500 chars | `default` |

**Preferred Contact Options:**
- WhatsApp (default)
- Email

### 4.2 Villa/Hotel Required Fields

| Field | Type | Validation |
|-------|------|------------|
| `check_in` | date | Required, >= today |
| `check_out` | date | Required, > check_in |
| `guest_count` | number | Required, 1-guest_max |

### 4.3 Yacht Required Fields

| Field | Type | Validation |
|-------|------|------------|
| `charter_date` | date | Required, >= today |
| `charter_start_time` | time | Required, from allowed times |
| `charter_duration` | select | Required, from charter_hours |
| `guest_count` | number | Required, 1-guest_max |

**Duration Options (from asset data):**
```typescript
const YACHT_DURATIONS = [
  { value: '4hr', label: '4 Hours', description: 'Half-day cruise' },
  { value: '6hr', label: '6 Hours', description: 'Extended cruise' },
  { value: '8hr', label: '8 Hours', description: 'Full day' },
  { value: 'overnight', label: 'Overnight', description: 'Multi-day charter' },
];
```

### 4.4 Transport Required Fields

| Field | Type | Validation |
|-------|------|------------|
| `pickup_location` | text | Required |
| `dropoff_location` | text | Required |
| `date` | date | Required, >= today |
| `time` | time | Required |
| `passenger_count` | number | Required, 1-passenger_max |

**Optional Fields:**
- `flight_number` (text)
- `luggage_count` (number)
- `stops` (textarea)

### 4.5 Hidden Attribution Fields (Auto-Attached)

```typescript
interface AttributionData {
  asset_slug: string;       // From rental data
  asset_name: string;       // From rental data
  category: string;         // villa/yacht/transport
  er_id: string;           // Generated or from URL
  creator_id?: string;      // From URL param
  utm_source?: string;      // From URL param
  utm_medium?: string;      // From URL param
  utm_campaign?: string;    // From URL param
  page_url: string;         // Current page URL
  submitted_at: string;     // ISO timestamp
}
```

---

## 5. Bugfix & Polish Backlog

### 5.1 BLOCKER Bugs

#### BUG-001: Search Bar Does Not Switch Fields by Category
- **Severity:** BLOCKER
- **Repro:** Select "Yachts" category → Search bar still shows Check-in/Check-out instead of Date/Time/Duration
- **Expected:** Fields dynamically change per category
- **Actual:** Same fields for all categories
- **Cause:** SearchBar component not category-aware
- **Fix:** Add `selectedCategory` prop to SearchBar, render different field sets
- **Acceptance:** Yacht search shows Date + Time + Duration + Guests; Transport shows Pickup + Dropoff + Date + Time + Passengers

#### BUG-002: Attribution Loss on Modal Open
- **Severity:** BLOCKER
- **Repro:** Navigate to listing via UTM link → Open inquiry modal → Submit → Check GHL payload
- **Expected:** UTM params preserved in submission
- **Actual:** UTMs not captured or passed through
- **Cause:** No UTM extraction in context/state
- **Fix:** Add UTM extraction to SearchContext on mount, pass to inquiry forms
- **Acceptance:** All UTM params visible in GHL custom fields

#### BUG-003: Silent Webhook Failure
- **Severity:** BLOCKER
- **Repro:** Submit inquiry with invalid data → Check UI → Check network
- **Expected:** User sees error message, can retry
- **Actual:** Form closes, shows success even on failure
- **Cause:** Error handling shows success regardless in catch block
- **Fix:** Add proper error state, show retry option, log errors
- **Acceptance:** Failed submissions show error toast, form stays open, user can retry

### 5.2 HIGH Severity Bugs

#### BUG-004: Villa Form Shows for Unknown Categories
- **Severity:** HIGH
- **Repro:** View property with category "Hotel" → Click Request to Book
- **Expected:** Villa-style form with date range
- **Actual:** May show charter form or break
- **Cause:** Category detection only checks `yacht` and `transport`
- **Fix:** Add explicit handling for `villa`, `property`, `hotel` → BookingInquiryForm
- **Acceptance:** All villa-type categories show correct form

#### BUG-005: Default Blue Focus Rings
- **Severity:** HIGH
- **Repro:** Tab through any form on desktop
- **Expected:** Gold (#bc944d) focus rings
- **Actual:** Browser default blue focus rings
- **Cause:** No global focus style override
- **Fix:** Add global CSS for `:focus-visible` with brand color
- **Acceptance:** All interactive elements show gold focus ring

#### BUG-006: Date Picker Not Respecting min_stay_nights
- **Severity:** HIGH
- **Repro:** Open villa with 7-night minimum → Select 3-night stay → Submit
- **Expected:** Validation error before submit, or auto-extend checkout
- **Actual:** Allows any date range
- **Cause:** min_stay_nights not passed to DatePicker
- **Fix:** Add `minNights` prop to DatePicker, validate on selection
- **Acceptance:** Cannot select fewer nights than minimum

#### BUG-007: Phone Input Not Using tel Keyboard
- **Severity:** HIGH
- **Repro:** Open inquiry form on mobile → Tap phone field
- **Expected:** Numeric phone keyboard
- **Actual:** Standard text keyboard
- **Cause:** Missing `keyboardType="phone-pad"` on TextInput
- **Fix:** Add correct keyboardType to phone inputs
- **Acceptance:** Phone fields show numeric keyboard on mobile

#### BUG-008: Guest Count Can Exceed Maximum
- **Severity:** HIGH
- **Repro:** Open yacht with 12 max guests → Increment to 20
- **Expected:** Cannot exceed 12
- **Actual:** Can increment indefinitely (or to 20)
- **Cause:** Hardcoded max instead of asset-specific
- **Fix:** Pass `guest_max` from property data, enforce in counter
- **Acceptance:** Guest counter respects asset's guest_max

### 5.3 MEDIUM Severity Bugs

#### BUG-009: Modal Scroll Lock Not Working on iOS Safari
- **Severity:** MEDIUM
- **Repro:** Open any modal on iOS Safari → Scroll inside modal → Background scrolls too
- **Expected:** Background locked, only modal scrolls
- **Actual:** Both scroll
- **Cause:** iOS Safari body scroll lock requires special handling
- **Fix:** Add `body-scroll-lock` package or custom iOS fix
- **Acceptance:** Background does not scroll when modal is open on iOS

#### BUG-010: Loading State Not Visible on Submit
- **Severity:** MEDIUM
- **Repro:** Submit inquiry → Watch button
- **Expected:** Button shows spinner, text changes to "Sending..."
- **Actual:** Button flickers or no visible change
- **Cause:** `isSubmitting` state not properly connected
- **Fix:** Verify state flow, add visible spinner component
- **Acceptance:** Clear loading indicator during submission

#### BUG-011: No Validation Error Messages
- **Severity:** MEDIUM
- **Repro:** Submit form with empty required field
- **Expected:** Field highlights red, error message appears below
- **Actual:** Submit blocked but no visual feedback
- **Cause:** Validation prevents submit but no error display
- **Fix:** Add per-field error state and error message components
- **Acceptance:** Each invalid field shows specific error message

#### BUG-012: Price Duplication "per night / night"
- **Severity:** MEDIUM
- **Repro:** View villa with price "From $500 / night"
- **Expected:** Clean price display
- **Actual:** Shows "From $500 / night / night"
- **Cause:** displayPrice already contains unit, code adds another
- **Fix:** Parse displayPrice, don't add unit if already present
- **Acceptance:** Prices display without duplication

#### BUG-013: Occasion Selector Not Saving to Inquiry
- **Severity:** MEDIUM
- **Repro:** Select "Wedding" occasion → Submit charter → Check GHL
- **Expected:** occasion field populated
- **Actual:** occasion field empty or undefined
- **Cause:** occasion not passed through to submission
- **Fix:** Verify occasion is in CharterBookingData and submitted
- **Acceptance:** Occasion visible in GHL lead record

### 5.4 LOW Severity Bugs

#### BUG-014: Skeleton Animation Choppy on Low-End Devices
- **Severity:** LOW
- **Repro:** Load home page on older phone
- **Expected:** Smooth skeleton pulse
- **Actual:** Janky animation
- **Cause:** CSS animation not hardware-accelerated
- **Fix:** Use `transform` and `opacity` for animation
- **Acceptance:** Smooth animation on mid-tier devices

#### BUG-015: Calendar Month Navigation Touch Target Small
- **Severity:** LOW
- **Repro:** Try to tap month arrows on mobile
- **Expected:** Easy to tap
- **Actual:** Requires precise tap
- **Cause:** Arrow buttons under 44px
- **Fix:** Increase touch target to 44px minimum
- **Acceptance:** Month navigation meets 44px touch target

#### BUG-016: Missing Hover States on Desktop
- **Severity:** LOW
- **Repro:** Hover over cards/buttons on desktop
- **Expected:** Subtle hover feedback
- **Actual:** No change on hover
- **Cause:** Hover states not defined
- **Fix:** Add hover styles with slight lift/shadow
- **Acceptance:** All interactive elements have hover feedback

---

## 6. Build Roadmap

### Phase 1: Stabilize (Week 1-2)

**Goal:** Fix all BLOCKER bugs, establish reliable lead capture.

| Task | Priority | Estimate | Depends On |
|------|----------|----------|------------|
| BUG-001: Category-aware search fields | P0 | 4h | — |
| BUG-002: Attribution passthrough | P0 | 2h | — |
| BUG-003: Webhook error handling | P0 | 2h | — |
| BUG-004: Category detection fix | P0 | 1h | — |
| Add error toast component | P0 | 2h | BUG-003 |
| Add loading spinner to forms | P1 | 1h | — |
| Test full flow: Search → Submit | P0 | 2h | All above |

**Definition of Done:**
- [ ] All BLOCKERs resolved
- [ ] Every submit creates valid GHL lead
- [ ] UTMs preserved end-to-end
- [ ] Error states visible to user

### Phase 2: Asset-Type UX (Week 2-3)

**Goal:** Each category has correct search and inquiry experience.

| Task | Priority | Estimate | Depends On |
|------|----------|----------|------------|
| Yacht search fields (Date/Time/Duration) | P0 | 4h | Phase 1 |
| Transport search fields (Pickup/Dropoff) | P0 | 4h | Phase 1 |
| Transport inquiry form | P0 | 4h | Phase 1 |
| Duration packages from asset data | P1 | 2h | Yacht search |
| min_stay validation | P1 | 2h | — |
| guest_max enforcement | P1 | 1h | — |
| Category-specific CTA text | P1 | 1h | — |
| BUG-005: Focus states | P1 | 2h | — |
| BUG-006: min_stay_nights | P1 | 2h | — |
| BUG-007: Phone keyboard | P1 | 30m | — |
| BUG-008: Guest max | P1 | 1h | — |

**Definition of Done:**
- [ ] Yacht search shows Date + Time + Duration + Guests
- [ ] Transport search shows Pickup + Dropoff + Date + Time + Passengers
- [ ] Each category has correct inquiry form
- [ ] All HIGH bugs resolved

### Phase 3: Inquiry Routing & CRM (Week 3-4)

**Goal:** Bulletproof lead capture with proper routing.

| Task | Priority | Estimate | Depends On |
|------|----------|----------|------------|
| GHL webhook validation | P0 | 2h | — |
| Retry logic for failed submits | P0 | 2h | — |
| Lead deduplication | P1 | 2h | — |
| WhatsApp deep link on confirmation | P1 | 2h | — |
| Email confirmation (if API available) | P2 | 4h | — |
| BUG-009: iOS scroll lock | P1 | 2h | — |
| BUG-010: Loading states | P1 | 1h | — |
| BUG-011: Validation errors | P1 | 3h | — |
| BUG-012: Price duplication | P1 | 1h | — |
| BUG-013: Occasion saving | P1 | 1h | — |

**Definition of Done:**
- [ ] Zero silent failures
- [ ] Retry mechanism for network errors
- [ ] WhatsApp CTA on confirmation
- [ ] All MEDIUM bugs resolved

### Phase 4: Polish & QA (Week 4-5)

**Goal:** Production-ready quality bar.

| Task | Priority | Estimate | Depends On |
|------|----------|----------|------------|
| BUG-014: Skeleton animation | P2 | 1h | — |
| BUG-015: Calendar touch targets | P2 | 1h | — |
| BUG-016: Hover states | P2 | 2h | — |
| Cross-browser testing | P1 | 4h | — |
| Mobile device testing | P1 | 4h | — |
| Performance audit | P2 | 2h | — |
| Accessibility audit | P2 | 2h | — |
| Final QA regression | P0 | 4h | All above |

**Definition of Done:**
- [ ] All LOW bugs resolved
- [ ] Tested on iOS Safari, Chrome, Firefox
- [ ] Tested on iPhone, Android
- [ ] Lighthouse score > 80

---

## 7. Definition of Done Checklist

### 7.1 Per-Category QA Matrix

| Test Case | Villa | Yacht | Transport |
|-----------|-------|-------|-----------|
| Search fields correct | ☐ | ☐ | ☐ |
| Listing shows correct specs | ☐ | ☐ | ☐ |
| CTA text correct | ☐ | ☐ | ☐ |
| Inquiry form has correct fields | ☐ | ☐ | ☐ |
| All required fields validated | ☐ | ☐ | ☐ |
| Guest count respects max | ☐ | ☐ | ☐ |
| Date/time validation works | ☐ | ☐ | ☐ |
| Submit creates GHL lead | ☐ | ☐ | ☐ |
| Attribution preserved | ☐ | ☐ | ☐ |
| Confirmation shows correctly | ☐ | ☐ | ☐ |
| WhatsApp CTA works | ☐ | ☐ | ☐ |

### 7.2 Regression Test Script

```bash
# Run for each category
1. Navigate to homepage
2. Select category tab
3. Enter search criteria
4. Tap Search
5. Select first listing
6. Verify specs display correctly
7. Tap primary CTA
8. Verify correct form opens
9. Fill all required fields
10. Submit form
11. Verify loading state
12. Verify confirmation modal
13. Check GHL for lead record
14. Verify all fields populated
15. Verify attribution fields present
```

### 7.3 Device/Browser Matrix

| Device | Browser | Status |
|--------|---------|--------|
| iPhone 14 | Safari | ☐ |
| iPhone SE | Safari | ☐ |
| Pixel 7 | Chrome | ☐ |
| Samsung S23 | Samsung Browser | ☐ |
| iPad | Safari | ☐ |
| MacBook | Chrome | ☐ |
| MacBook | Safari | ☐ |
| MacBook | Firefox | ☐ |
| Windows | Chrome | ☐ |
| Windows | Edge | ☐ |

---

## 8. Internal-Only Fields Policy

**These fields exist in data but MUST NOT appear in public UX:**

| Field | Reason | Internal Use |
|-------|--------|--------------|
| `owner_name` | Privacy | Ops contact |
| `owner_email` | Privacy | Ops contact |
| `owner_whatsapp` | Privacy | Ops routing |
| `source_folder_url` | Internal | Asset management |
| `instagram` | No outbound | Social reference |
| `external_airbnb_url` | No outbound | Booking sync |
| `erentals_listing_link` | Internal | Admin reference |

**Policy:** All public journeys stay inside ERentals. No links to Instagram, Airbnb, or partner sites.

---

## 9. Availability Display Rules

### 9.1 Villa/Hotel (Calendar-Aware)

```
IF iCal exists:
  → Show calendar with blocked dates
  → "Select your dates"
  → Blocked dates are grayed out
  → Tooltip: "Not available"

IF iCal missing:
  → Show calendar (no blocks)
  → "Request your preferred dates"
  → Subtext: "Our team will confirm availability"
```

### 9.2 Yacht/Transport (Request-First)

```
→ Show single date picker + time selector
→ "Select preferred date and time"
→ Subtext: "Availability confirmed within 4 hours"
→ Do NOT show "Available" or "Confirmed" unless real-time integration exists
```

---

## 10. Next Steps

1. **Immediate:** Fix BLOCKER bugs (BUG-001, BUG-002, BUG-003)
2. **This Week:** Complete Phase 1 stabilization
3. **Next Week:** Implement category-aware search fields
4. **Ongoing:** Track GHL lead creation success rate

---

**Document Owner:** CTO Team
**Review Cycle:** Weekly during active development
**Last Updated:** January 3, 2026
