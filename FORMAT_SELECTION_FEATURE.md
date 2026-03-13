# Format Selection Feature for Product Generation

## Overview

Added a format selection modal to the product generation workflow in launches. Users can now choose which formats to generate products for based on flavour eligibility rules.

## What Changed

### New Component: FormatSelectionModal

**Location**: `app/admin/components/FormatSelectionModal.tsx`

**Features**:
- Displays selected flavours with their types
- Shows only eligible formats based on `eligibleFlavourTypes` field
- Auto-selects all eligible formats by default
- Provides format details (min/max flavours, mixed types allowed, eligible types)
- Supports ESC key to close
- Prevents generation with no formats selected
- Shows loading state during generation

**Eligibility Logic**:
- Formats with no `eligibleFlavourTypes` accept all flavours
- Formats with `eligibleFlavourTypes` only accept matching flavour types
- Multi-flavour formats check `allowMixedTypes` setting
- Only shows formats that can work with selected flavours

### Updated: Launch Edit Page

**Location**: `app/admin/launches/[id]/page.tsx`

**Changes**:
- Added `Format` interface with eligibility fields
- Added `type` field to `Flavour` interface
- Added `formats` state and `fetchFormats()` function
- Added `showFormatModal` state
- Replaced simple confirm dialog with format selection modal
- Updated "Generate Products" button to open modal
- Displays flavour types in flavour list

### Updated: Generate Products API

**Location**: `app/api/launches/[id]/generate-products/route.ts`

**Changes**:
- Accepts optional `formatIds` parameter in request body
- Filters formats by `formatIds` if provided
- Falls back to all active formats if no `formatIds` (backward compatible)
- Returns error if provided `formatIds` don't match any formats

## User Flow

1. User selects flavours in launch edit page (e.g., Basil=gelato, Raspberry=sorbet)
2. User clicks "Generate Products from Flavours" button
3. Modal opens showing:
   - Selected flavours with their types
   - Eligible formats (e.g., Gelato, Sorbet, Twist, Pint, Gallon)
   - Format details and eligibility rules
4. User can select/deselect formats (all eligible formats selected by default)
5. User clicks "Generate Products"
6. API generates products only for selected formats
7. Success message shows how many products were created/skipped

## Example Scenario

**Selected Flavours**:
- Basil (gelato)
- Raspberry (sorbet)

**Eligible Formats**:
- ✅ Gelato (accepts: gelato)
- ✅ Sorbet (accepts: sorbet)
- ✅ Twist (accepts: gelato, sorbet, mixed types allowed)
- ✅ Pint (accepts: gelato, sorbet, mixed types allowed)
- ✅ Gallon (accepts: gelato, sorbet)

**User Selection**:
User unchecks "Gallon" and clicks Generate

**Result**:
- Creates: Gelato-Basil, Sorbet-Raspberry, Twist-Basil-Raspberry, Pint-Basil, Pint-Raspberry
- Skips: Gallon products (not selected)

## Backward Compatibility

The API maintains backward compatibility:
- If `formatIds` is not provided, generates for all active formats (old behavior)
- If `formatIds` is empty array, generates for all active formats
- If `formatIds` is provided, only generates for those formats (new behavior)

## Technical Details

**Modal Styling**:
- Uses `bg-black/30 backdrop-blur-sm` for overlay (Untitled UI pattern)
- Responsive design with max-width and scrolling
- Consistent with other CMS modals

**Keyboard Support**:
- ESC key closes modal
- Focus management for accessibility

**State Management**:
- Modal state managed in parent component
- Format selection state managed in modal
- Auto-selects all eligible formats on open

## Files Modified

1. `app/admin/components/FormatSelectionModal.tsx` (new)
2. `app/admin/launches/[id]/page.tsx` (modified)
3. `app/api/launches/[id]/generate-products/route.ts` (modified)

## Branch

`feature/product-generation-format-selection`

## Commit

```
feat: add format selection modal for product generation

- Created FormatSelectionModal component with format eligibility checking
- Shows selected flavours and their types
- Filters formats based on eligibleFlavourTypes field
- Auto-selects all eligible formats by default
- Displays format details (min/max flavours, mixed types, eligible types)
- Updated launch edit page to use modal instead of simple confirm
- Modified API route to accept formatIds parameter
- Maintains backward compatibility (no formatIds = all formats)
```
