# Flavour Form Simplification - Option 1 Complete

## Implementation Summary

Successfully implemented Option 1 (Minimal Changes) for flavour form simplification with all requested features.

## Changes Made

### 1. Key Notes → Flavour Tags (Taxonomy-Connected)

**Before:** Manual text input with Enter key to add tags
**After:** TaxonomyMultiSelect component connected to settings

- Added `keyNotes` taxonomy to `public/data/settings.json`
- Default tags: sweet, smoky, summer, nutty, floral, fruity, creamy, tangy, rich, refreshing
- Users can select from existing tags or create new ones
- Tags are managed centrally in Settings → Taxonomies
- Consistent tag usage across all flavours

### 2. Base Style Simplification

**Before:** Separate card with large radio tiles (5 options)
**After:** Simple dropdown inline with other fields

- Converted from `BaseStyleSelector` component to native `<select>`
- Removed "fruit" option (redundant with sorbet type)
- Options: Dairy, Non-Dairy, Cheese, Other
- Conditional rendering: Only shows for `type === 'gelato'` or `type === 'special'`
- Significantly reduced visual weight

### 3. Advanced Options Collapsible Section

**Before:** All fields visible in main form
**After:** Collapsible `<details>` section

Moved to Advanced Options:
- Colour (color picker + hex input)
- Archive Note (formerly "Story")
- Sort Order (number input)
- Featured (checkbox)

### 4. Label Updates (No Data Changes)

| Old Label | New Label | Location |
|-----------|-----------|----------|
| Short Description | Short Notes | Main form |
| Key Notes | Flavour Tags | Main form (now taxonomy) |
| Story | Archive Note | Advanced section |

### 5. Field Ordering

**New structure:**
1. Name *
2. Type * / Status *
3. Short Notes *
4. Description *
5. Base (conditional - only gelato/special)
6. Flavour Tags (taxonomy)
7. Tasting Notes
8. **Advanced Options** (collapsed)
   - Colour
   - Archive Note
   - Sort Order
   - Featured

### 6. Kept As Requested

- **Tasting Notes field** - Kept separate as requested
- **All existing data** - No data model changes
- **All functionality** - Everything still works

## Files Modified

1. `public/data/settings.json` - Added keyNotes taxonomy
2. `app/admin/flavours/create/page.tsx` - Updated form structure
3. `app/admin/flavours/[id]/page.tsx` - Updated form structure

## Code Removed

- `BaseStyleSelector` component imports (no longer needed)
- Manual `handleKeyNoteAdd()` and `handleKeyNoteRemove()` functions
- Large radio tile UI for base styles

## Benefits

### User Experience
- Cleaner, less cluttered interface
- Consistent tag usage across flavours
- Advanced options hidden by default
- Base field only shows when relevant
- Faster form completion

### Maintainability
- Centralized tag management via taxonomy
- Reusable TaxonomyMultiSelect component
- Less custom code to maintain
- Easier to add new tags globally

### Data Quality
- Standardized flavour tags
- No duplicate tags with different spellings
- Easier to filter/search by tags
- Better reporting capabilities

## Testing Checklist

- [x] Create new flavour with gelato type (base field shows)
- [x] Create new flavour with sorbet type (base field hidden)
- [x] Select flavour tags from taxonomy
- [x] Create new flavour tag via taxonomy
- [x] Expand/collapse Advanced Options
- [x] Edit existing flavour (all fields populate correctly)
- [x] Save flavour (all data persists)
- [x] No TypeScript errors
- [x] No runtime errors

## Next Steps (Optional)

If you want to proceed with Option 3 (Architectural Refactor):

1. Design Launch pairing/context data structure
2. Move "Archive Note" from Flavour to Launch model
3. Update Launch form to include flavour context
4. Refactor archive views to be launch-centric
5. Create migration for existing archive notes

This would properly separate:
- **Flavour** = intrinsic properties (what it is, tastes like, made from)
- **Launch** = contextual properties (when, with what, seasonal notes)

## Commit Details

```
feat: simplify flavour form (Option 1)

- Add keyNotes taxonomy to settings with default tags
- Replace manual key notes input with TaxonomyMultiSelect
- Convert Base Style from radio tiles to dropdown
- Add conditional rendering for Base field
- Create collapsible Advanced Options section
- Update labels (no data model changes)
- Keep Tasting Notes field as requested
```

Branch: `feature/taxonomy-management`
Commit: `6939b8c`
