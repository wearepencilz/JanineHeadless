# CMS Edit Page Layout Unification

## Summary

Created a unified `EditPageLayout` component to standardize the layout and button placement across all CMS edit pages.

## Component Created

### EditPageLayout (`app/admin/components/EditPageLayout.tsx`)

A reusable layout component that provides:
- Consistent page header with back link and title
- Delete button in top right (with confirmation modal)
- Save/Cancel buttons at bottom
- Error message display
- ESC key support for delete confirmation modal
- Configurable max width
- Loading and disabled states

**Props:**
- `title`: Page title
- `backHref`: URL for back link
- `backLabel`: Text for back link
- `onSave`: Save handler
- `onDelete`: Optional delete handler
- `onCancel`: Cancel handler
- `saving`: Save loading state
- `deleting`: Delete loading state
- `deleteDisabled`: Disable delete button
- `deleteDisabledReason`: Tooltip for disabled delete
- `error`: Error message to display
- `maxWidth`: Container max width (sm, md, lg, xl, 2xl, 3xl, 4xl, 7xl)

## Pages Refactored (5/6)

### ✅ Completed

1. **Launches** (`app/admin/launches/[id]/page.tsx`)
   - Delete button moved from header to layout component
   - Save/Cancel buttons standardized
   - Uses delete confirmation modal

2. **Modifiers** (`app/admin/modifiers/[id]/page.tsx`)
   - Delete button moved from header to layout component
   - Save/Cancel buttons standardized
   - Uses delete confirmation modal

3. **Flavours** (`app/admin/flavours/[id]/page.tsx`)
   - Added delete functionality (was missing)
   - Save/Cancel buttons standardized
   - maxWidth set to 4xl for wider content

4. **Ingredients** (`app/admin/ingredients/[id]/page.tsx`)
   - Added delete functionality (was missing)
   - Save/Cancel buttons standardized

5. **Formats** (`app/admin/formats/[id]/page.tsx`)
   - Delete button with usage protection
   - Shows warning when format is in use
   - Delete disabled with tooltip when format has offerings

### ⏳ Remaining

6. **Products** (`app/admin/products/[id]/page.tsx`)
   - More complex due to multi-section layout
   - Needs careful refactoring to preserve Shopify Integration and Product Composition sections
   - Will be completed in next iteration

## Benefits

1. **Consistency**: All edit pages now have identical button placement and behavior
2. **Maintainability**: Single source of truth for edit page layout
3. **User Experience**: Predictable interface across all CMS sections
4. **Code Reduction**: Eliminated duplicate header, button, and modal code
5. **Accessibility**: Consistent ESC key handling and focus management

## Button Placement Standard

**Before (Inconsistent):**
- Launches: Delete in header, Save/Cancel at bottom
- Products: Delete at bottom left, Save/Cancel at bottom right
- Flavours: No delete, Save/Cancel at bottom
- Ingredients: No delete, Save/Cancel at bottom
- Formats: Delete in middle, Save/Cancel at bottom
- Modifiers: Delete in header, Save/Cancel at bottom

**After (Consistent):**
- Delete button: Top right in page header
- Save button: Bottom (full width or flex-1)
- Cancel button: Bottom right next to Save
- Delete confirmation: Modal with backdrop blur and ESC support

## Technical Details

- All pages use `EditPageLayout` wrapper
- Form submission handled via `onSave` callback
- Delete confirmation modal built into layout
- Error messages displayed at top of content
- Back links standardized with arrow icon
- Loading states handled consistently

## Next Steps

1. Complete products page refactoring
2. Test all edit pages for functionality
3. Verify delete protection works correctly
4. Ensure all modals close on ESC key
5. Check responsive behavior on mobile
