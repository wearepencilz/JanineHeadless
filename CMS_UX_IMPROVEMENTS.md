# CMS UX Improvements Needed

## Issues to Fix

1. **ESC key should close modals and cancel operations**
2. **Delete functionality needed everywhere:**
   - Delete button on table/card views
   - Delete button on edit pages
   - Should work for all CMS items (flavours, formats, modifiers, launches, products)
3. **Clicking table items/cards should open edit page** (not just "Edit" button)
4. **Taxonomy data was reset** - need to restore from git or recreate
5. **Modifiers data was overwritten** - need to restore
6. **Standardize image upload fields** - all should use the same component as ingredients

## Implementation Plan

### 1. ESC Key Handler (Global)
- Add keyboard event listener to all modals
- Close on ESC key press

### 2. Delete Buttons
- Add delete button to all list pages (flavours, formats, modifiers, launches, products)
- Keep delete button on edit pages
- Implement proper referential integrity checks

### 3. Clickable Cards/Rows
- Make entire card/row clickable to open edit page
- Keep explicit "Edit" button for clarity

### 4. Restore Data
- Check git history for taxonomy and modifiers data
- Restore from previous commits if available

### 5. Standardize Image Upload
- Create reusable ImageUpload component
- Use across all CMS pages (ingredients, flavours, formats, modifiers, launches)
