# ERentals - QA Bug List & Fix Plan
**Created:** 2026-01-02
**Goal:** Ship production-quality luxury booking experience

---

## CRITICAL BUGS FOUND

### 🔴 SEARCH BAR (HOME PAGE)

**BUG 1: Giant Black "Clear" Bar**
- **Location:** `components/search-bar.tsx:263-268`
- **Issue:** Separate black button BELOW search pill shows "Clear" - looks like broken UI
- **Impact:** Makes homepage look unprofessional, "AI-built vibe"
- **Fix:** Remove external Clear button, add inline X button inside pill (top-right or next to values)

**BUG 2: Search Pill Alignment/Spacing**
- **Location:** `components/search-bar.tsx` - mobile styles
- **Issue:** Fields feel cramped, misaligned, not pixel-perfect
- **Impact:** Doesn't feel Apple-level intentional
- **Fix:** Rebuild using strict 8pt grid system, consistent touch targets (56px min)

**BUG 3: "Guests 2" Visual Segmentation**
- **Location:** Guest field in search bar
- **Issue:** "Guests" label and "2" value don't feel visually distinct
- **Impact:** Hard to scan/read
- **Fix:** Stronger typography hierarchy - label smaller/muted, value larger/bold

---

### 🔴 "WHERE TO?" MODAL

**BUG 4: Popular Destinations Not Clickable**
- **Location:** `components/search-bar.tsx:295-320` - FlatList inside BottomSheet
- **Issue:** User reports can't click on popular destinations
- **Root Cause:** BottomSheet with `scrollEnabled={true}` (default) wraps destinations in ScrollView
- **Impact:** Completely breaks destination selection
- **Fix:** Keep `scrollEnabled={true}` for destination modal (it needs scrolling for long lists)
- **Additional Fix Needed:** Ensure FlatList has `scrollEnabled={false}` and BottomSheet handles scrolling

**BUG 5: Empty State - "No destinations found"**
- **Location:** `components/search-bar.tsx:311-316`
- **Issue:** When typing "pari" returns "No destinations found" - bad UX
- **Root Cause:** Limited destination data, no fallback
- **Impact:** Dead-end, feels broken
- **Fix:**
  - Add graceful empty state with "Message concierge" CTA
  - Allow "Search anyway" to proceed with typed query
  - Expand destinations list or pull from Google Sheet

**BUG 6: Input Focus/Visibility Issues**
- **Issue:** User reports sometimes modal opens without visible input
- **Root Cause:** Unclear - may be autoFocus failing or input rendering issue
- **Fix:** Ensure input is ALWAYS visible, properly styled, with consistent focus state

---

### 🔴 DATE PICKER

**BUG 7: Calendar Days Not Selectable (HOME PAGE)**
- **Location:** DatePicker in search bar on home page
- **Issue:** User specifically says "calendar picker does not work on search bar HOME"
- **Root Cause:** Likely same scrollEnabled issue - date picker inside BottomSheet with scroll
- **Fix:** Already set `scrollEnabled={false}` for date picker modal - verify it's working on home page

**BUG 8: iOS Tap Reliability**
- **Issue:** Date picker needs to be unbreakable on iOS Safari
- **Current Status:** Using custom DatePicker component with scroll lock fixes
- **Fix:** Test and verify, potentially replace with battle-tested library if issues persist

---

### 🔴 LISTING PAGE (property/[id])

**BUG 9: Too Much Whitespace**
- **Location:** `app/property/[id].tsx` - section spacing
- **Issue:** "AI spacing" - too much vertical padding
- **Current Status:** Already reduced 30-40% but may need more
- **Fix:** Review ALL spacing, enforce 8pt grid strictly

**BUG 10: Black/Empty Hero Images**
- **Location:** PropertyGallery component
- **Issue:** Sometimes hero shows black screen
- **Current Status:** Added error handling, but may still have data mapping issues
- **Fix:** Verify image URLs are valid, add proper skeleton fallback

**BUG 11: Price Text Duplication**
- **Location:** BookingCard, BookingBottomBar
- **Issue:** Shows "per night / night" duplication
- **Current Status:** Added regex cleanup - verify it works
- **Fix:** Test actual price rendering

**BUG 12: Header Shows "property/[id]"**
- **Location:** Property page header
- **Issue:** Shows URL path instead of property name - looks unpolished
- **Fix:** Use proper page title from property data

---

### 🔴 BOOKING FLOW

**BUG 13: No Real Booking Flow**
- **Issue:** "Request to Book" doesn't actually do anything
- **Impact:** App is a demo, not a real product
- **Fix:** Build complete flow:
  1. Request to Book form (name, email, phone, WhatsApp, notes)
  2. POST to /api/lead with all data
  3. Forward to GoHighLevel webhook
  4. Redirect to confirmation page with WhatsApp CTA

**BUG 14: No Availability Check**
- **Issue:** Can't check if dates are available
- **Fix:** Build iCal integration:
  1. GET /api/availability endpoint
  2. Fetch iCal from Google Sheet mapping
  3. Parse with node-ical
  4. Return availability + blocked ranges
  5. Cache results

---

## FIX ORDER (PHASES)

### ✅ PHASE 1: QA SWEEP (CURRENT)
- Document all bugs ✅
- Create fix priority order

### 🔥 PHASE 2: SEARCH PILL REBUILD (NEXT)
**Priority: CRITICAL**
- Remove giant "Clear" bar
- Add subtle inline clear control
- Fix alignment/spacing (strict 8pt grid)
- Fix typography hierarchy
- Ensure 56px minimum touch targets on mobile
- Test on iOS Safari + desktop Chrome

### 🔥 PHASE 3: "WHERE TO?" MODAL FIX
**Priority: CRITICAL**
- Fix destination clicking (scroll issue)
- Improve empty state
- Add "Message concierge" fallback
- Ensure input always visible
- Add "Search anyway" option

### 🔥 PHASE 4: DATE PICKER FIX
**Priority: CRITICAL**
- Verify calendar works on home page
- Test iOS tap reliability
- Add proper Apply/Clear flow
- Ensure visual range highlight

### 🟡 PHASE 5: LISTING PAGE POLISH
**Priority: HIGH**
- Fix all spacing issues
- Fix hero image fallbacks
- Fix header title
- Verify price text cleanup
- Implement luxury layout structure

### 🟢 PHASE 6: BOOKING FLOW
**Priority: MEDIUM** (but required for production)
- Build lead form
- Create /api/lead endpoint
- Integrate GoHighLevel
- Build confirmation page

### 🟢 PHASE 7: iCAL AVAILABILITY
**Priority: MEDIUM**
- Build availability endpoint
- Integrate iCal parsing
- Add caching layer
- Build front-end integration

---

## QUALITY BAR

**Non-Negotiable:**
- 8pt spacing system (8/12/16/24/32/48)
- Consistent typography scale
- No random gaps or misalignments
- Works perfectly on iOS Safari + desktop Chrome
- No "AI vibe" - looks intentional and luxury
- Every fix is verified before moving to next

**Testing Protocol:**
- Test on iPhone viewport (375x667 minimum)
- Test on desktop (1440px+ preferred)
- No micro-glitches allowed
- If fix breaks something else, keep iterating until perfect

---

## CURRENT STATUS
- [x] Phase 1 complete - bug list documented
- [ ] Starting Phase 2 - Search Pill Rebuild

**Next Action:** Rebuild search pill component with pixel-perfect layout
