# Changelog: Status Field Consolidation, Inline Ingredient Creation, and Shopify Fix

## Date: 2026-03-09

## Summary

Fixed three critical issues in the CMS:
1. Merged `availabilityStatus` and `status` fields into a single unified `status` field
2. Added inline ingredient creation in the flavour ingredient selector
3. Fixed Shopify product search integration

---

## 1. Status Field Consolidation

### Problem
Flavours had two separate status fields (`status` and `availabilityStatus`) causing confusion and redundancy.

### Solution
- Unified into single `status` field with three values: `active`, `upcoming`, `archived`
- Added backward compatibility type alias: `AvailabilityStatus = Status`
- Updated all UI components and API routes

### Files Changed

**Types:**
- `types/index.ts`
  - Added `Status` type with 3 values
  - Added `AvailabilityStatus` as alias for backward compatibility
  - Updated `Flavour` interface to use `status: Status`
  - Updated `Component` interface to use `status: Status`
  - Removed legacy `status` field from Flavour

**UI Components:**
- `app/admin/flavours/create/page.tsx`
  - Updated imports to use `Status` type
  - Changed form field from "Availability Status" to "Status"
  - Removed legacy status dropdown
  - Updated state management

- `app/admin/flavours/[id]/page.tsx`
  - Updated imports to use `Status` type
  - Changed form field from "Availability Status" to "Status"
  - Removed legacy status dropdown
  - Updated state management

**API Routes:**
- `app/api/flavours/route.ts`
  - Removed `availabilityStatus` filter parameter
  - Updated POST to use unified `status` field
  - Removed legacy status field from new flavour creation

- `app/api/flavours/[id]/route.ts`
  - No changes needed (uses spread operator for updates)

### Migration Notes
- Existing data with `availabilityStatus` will need migration
- Type alias ensures backward compatibility during transition
- Frontend now uses single "Status" field consistently

---

## 2. Inline Ingredient Creation

### Problem
Users had to navigate away from flavour creation to add new ingredients, breaking workflow.

### Solution
Added inline ingredient creation directly in the ingredient selector modal.

### Files Changed

**Component:**
- `app/admin/components/FlavourIngredientSelector.tsx`
  - Added `showCreateForm` state
  - Added `creating` loading state
  - Added `newIngredient` form state
  - Added `createIngredient()` async function
  - Updated modal UI with toggle between search and create modes
  - Added quick create form with name, category, and origin fields
  - Auto-adds created ingredient to flavour immediately

### Features Added
- Toggle button: "← Back to Search" / "+ Create New"
- Quick create form with essential fields:
  - Name (required)
  - Category dropdown (base, flavor, mix-in, topping, spice)
  - Origin (required)
- "Create & Add Ingredient" button
- Automatically adds created ingredient to flavour
- Refreshes ingredient list after creation
- Fallback message when no ingredients found suggests creating new one

### User Flow
1. Click "Add Ingredient" in flavour form
2. Click "+ Create New" in modal
3. Fill in name, category, origin
4. Click "Create & Add Ingredient"
5. Ingredient is created and immediately added to flavour
6. Modal closes, ingredient appears in list

---

## 3. Shopify Product Search Fix

### Problem
Shopify product search was not working - products weren't loading in the picker.

### Solution
Fixed environment variable reference in Shopify admin client.

### Files Changed

**Shopify Client:**
- `lib/shopify/admin.ts`
  - Changed `process.env.SHOPIFY_STORE_DOMAIN` to `process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`
  - Added more descriptive error message with environment variable names
  - Matches the variable name used in `.env.example`

### Root Cause
The admin client was looking for `SHOPIFY_STORE_DOMAIN` but the actual environment variable is `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` (as defined in `.env.example`).

### Testing
To verify the fix works:
1. Ensure `.env.local` has `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` and `SHOPIFY_ADMIN_ACCESS_TOKEN`
2. Go to flavour edit page
3. Click "Link to Shopify Product"
4. Search for a product name
5. Products should now appear in results

---

## Testing Checklist

### Status Field
- [ ] Create new flavour with status "active"
- [ ] Create new flavour with status "upcoming"
- [ ] Create new flavour with status "archived"
- [ ] Edit existing flavour and change status
- [ ] Verify no "Legacy Status" field appears
- [ ] Check API returns correct status values

### Inline Ingredient Creation
- [ ] Open flavour create page
- [ ] Click "Add Ingredient"
- [ ] Click "+ Create New"
- [ ] Fill in ingredient details
- [ ] Click "Create & Add Ingredient"
- [ ] Verify ingredient appears in flavour list
- [ ] Verify ingredient appears in main ingredients list
- [ ] Test with different categories

### Shopify Integration
- [ ] Edit a flavour
- [ ] Click "Link to Shopify Product"
- [ ] Search for a product (e.g., "ice cream")
- [ ] Verify products appear in search results
- [ ] Select a product
- [ ] Verify product is linked correctly
- [ ] Check sync status updates

---

## Breaking Changes

### Status Field
- **Frontend:** Components expecting `availabilityStatus` need to use `status` instead
- **API:** Query parameter `availabilityStatus` removed, use `status` instead
- **Data:** Existing flavours with `availabilityStatus` field need migration

### Migration Script Needed
```typescript
// Pseudo-code for data migration
flavours.forEach(flavour => {
  if (flavour.availabilityStatus && !flavour.status) {
    flavour.status = flavour.availabilityStatus;
    delete flavour.availabilityStatus;
  }
});
```

---

## Environment Variables Required

For Shopify integration to work, ensure these are set:

```bash
# .env.local
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxxxxxxxxxxxx
```

---

## Next Steps

1. **Data Migration:** Run migration script to convert `availabilityStatus` to `status` in existing data
2. **Test Shopify:** Verify Shopify credentials are correct and products load
3. **User Testing:** Test ingredient creation workflow with real users
4. **Documentation:** Update user documentation to reflect new status field naming

---

## Notes

- All TypeScript types compile without errors
- Backward compatibility maintained through type alias
- Inline ingredient creation uses minimal form (can be expanded later)
- Shopify fix is environment variable only, no logic changes
