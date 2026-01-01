# Property Data Import Script

## Overview

This folder contains a script to auto-generate the `property-data.ts` file from your Google Sheets data.

## How to Use

### Step 1: Export Your Google Sheet

1. Open your Google Sheet: [Website Collection MASTER](https://docs.google.com/spreadsheets/d/1nRZMSUgxX2o9nxpE-D1YtLhUqzwBKvG8m5aj9A8kJS8/edit?gid=1541249486#gid=1541249486)
2. Go to **File** → **Download** → **Tab-separated values (.tsv)**
3. Save the file as `property-data-import.csv` in this `scripts/` folder

### Step 2: Run the Import Script

```bash
cd /Users/cameronelder/Codebase/ERentals
npx ts-node scripts/import-property-data.ts
```

### Step 3: Verify the Output

The script will:
- Read your CSV/TSV file
- Parse all property data
- Generate `/data/property-data.ts` with all properties
- Show a summary of what was imported

## CSV Format Expected

The script expects these columns (tab-separated):

| Column | Description |
|--------|-------------|
| `asset_name` | Property name |
| `asset_slug` | URL-friendly slug |
| `category` | villa, yacht, transport, property, or hotel |
| `country` | Country name |
| `region` | Region/state |
| `city` | City name |
| `guest_max` | Maximum guests (number or NA) |
| `bedrooms` | Number of bedrooms (number or NA) |
| `bathrooms` | Number of bathrooms (number or NA) |
| `overview_100w` | Short description (~100 words) |
| `display_from_price_usd` | Display price (e.g., "From $500 USD per night") |
| `rate_notes` | Additional pricing notes (optional) |
| `min_stay_nights` | Minimum stay requirement |
| `amenities_list` | Semicolon-separated amenities |
| `iCal` | iCal URL for availability (optional) |

## Troubleshooting

**Error: CSV file not found**
- Make sure you saved the Google Sheets export as `property-data-import.csv` in the `scripts/` folder

**Missing data for some properties**
- Check that your CSV has all required columns
- Make sure data is tab-separated (TSV format)

**Properties not showing in app**
- The `asset_slug` must match the WordPress post slug
- Run the app and check console for any errors

## Future Updates

Whenever you update your Google Sheet:
1. Export it again as TSV
2. Run this script
3. The `property-data.ts` file will be regenerated with latest data
4. Restart your app to see changes
