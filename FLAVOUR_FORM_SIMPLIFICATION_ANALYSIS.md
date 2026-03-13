# Flavour Form Simplification Analysis

## Current State vs. Proposed Changes

### Current Form Structure

**Basic Information Card:**
1. Name * (text input)
2. Type * (dropdown - taxonomy)
3. Status * (dropdown: active/upcoming/archived)
4. Short Description * (text input)
5. Description * (textarea)
6. Colour (color picker + hex input)
7. Key Notes (tag input with chips)
8. Tasting Notes (textarea)
9. Story (textarea)
10. Sort Order (number input)
11. Featured (checkbox)

**Base Style Card:**
- Large radio tile selector with 5 options (dairy, non-dairy, fruit, cheese, other)

**Ingredients Card:**
- Linked ingredient selector

**Usage Tracking Card** (edit only):
- Shows products using this flavour

**Shopify Integration Card** (edit only):
- Link to Shopify product

---

## Proposed Simplification

### Your "Essential Fields" Version

**Core Fields (always visible):**
1. Name *
2. Status * (dropdown)
3. Type * (dropdown)
4. Base (dropdown - only if Type = Gelato or Special)
5. Short Notes * (renamed from "Short Description")
6. Description *
7. Ingredients (linked)
8. Flavour Tags (renamed from "Key Notes")
9. Colour (optional)

**Optional/Advanced Fields (collapsed):**
10. Archive Note (renamed from "Story")
11. Featured (checkbox)
12. Sort Order (number)

**Removed Entirely:**
- Tasting Notes (merged into Short Notes)

---

## What Would Change

### 1. Field Renaming

| Current | Proposed | Rationale |
|---------|----------|-----------|
| Short Description | Short Notes | More concise, merchandisable language |
| Key Notes | Flavour Tags | Clearer purpose (smoky, sweet, summer) |
| Story | Archive Note | Better reflects actual use case |
| Tasting Notes | (merged into Short Notes) | Reduce redundancy |

### 2. Base Style Visibility Logic

**Current:** Always visible as a separate card with large radio tiles

**Proposed:** 
- Only show if `type === 'gelato'` or `type === 'special'`
- Convert from large radio tiles to simple dropdown
- Remove "fruit" option (redundant with sorbet type)

**Implementation:**
```tsx
{(formData.type === 'gelato' || formData.type === 'special') && (
  <div>
    <label>Base</label>
    <select value={formData.baseStyle} onChange={...}>
      <option value="dairy">Dairy</option>
      <option value="non-dairy">Non-Dairy</option>
      <option value="cheese">Cheese</option>
      <option value="other">Other</option>
    </select>
  </div>
)}
```

### 3. Advanced Section (Collapsible)

**Fields to move into collapsible "Advanced" section:**
- Colour
- Featured
- Sort Order
- Archive Note (formerly Story)

**Implementation:**
```tsx
<details className="bg-white rounded-lg border border-gray-200 p-6">
  <summary className="cursor-pointer font-medium text-gray-900">
    Advanced Options
  </summary>
  <div className="mt-4 space-y-4">
    {/* Colour, Featured, Sort Order, Archive Note */}
  </div>
</details>
```

### 4. Remove Tasting Notes Field

**Current:** Separate textarea for "Sweet, creamy, hints of vanilla..."

**Proposed:** Merge this content into "Short Notes"

**Rationale:** 
- Tasting notes and short description serve similar purposes
- One merchandisable field is cleaner
- Example: "Browned butter, grilled corn, honey" captures both

### 5. UI Component Changes

**BaseStyleSelector Component:**
- Convert from radio tiles to dropdown
- Remove visual weight
- Only render conditionally

**Before:**
```tsx
<div className="bg-white rounded-lg border border-gray-200 p-6">
  <BaseStyleSelector value={...} onChange={...} />
</div>
```

**After:**
```tsx
{(formData.type === 'gelato' || formData.type === 'special') && (
  <div>
    <label>Base</label>
    <select>...</select>
  </div>
)}
```

---

## Data Model Changes

### Type Definition Updates

**Current `Flavour` interface:**
```typescript
interface Flavour {
  name: string;
  description: string;
  shortDescription: string;
  tastingNotes?: string;
  story?: string;
  keyNotes?: string[];
  // ...
}
```

**Proposed `Flavour` interface:**
```typescript
interface Flavour {
  name: string;
  description: string;
  shortNotes: string;  // renamed from shortDescription
  archiveNote?: string;  // renamed from story
  flavourTags?: string[];  // renamed from keyNotes
  // tastingNotes removed (merged into shortNotes)
  // ...
}
```

### Migration Required

If implementing field renames, you'd need a migration:

```typescript
// Migration: Rename fields
flavours.forEach(flavour => {
  flavour.shortNotes = flavour.shortDescription;
  flavour.archiveNote = flavour.story;
  flavour.flavourTags = flavour.keyNotes;
  
  // Optionally merge tasting notes into short notes
  if (flavour.tastingNotes && !flavour.shortNotes.includes(flavour.tastingNotes)) {
    flavour.shortNotes = `${flavour.shortNotes}. ${flavour.tastingNotes}`;
  }
  
  delete flavour.shortDescription;
  delete flavour.story;
  delete flavour.keyNotes;
  delete flavour.tastingNotes;
});
```

---

## Your Stronger Opinion: Architectural Change

### Current Problem

Flavour records carry launch history:
- "Served alongside Wild Tomatoes" is in the flavour's `story` field
- Launch context is embedded in flavour data
- Creates confusion about what belongs where

### Proposed Solution

**Separate concerns:**

**Flavour Record (intrinsic properties):**
- What the flavour is
- What it tastes like
- What it's made from
- Merchandising copy

**Launch Record (contextual properties):**
- When it was launched
- What it was paired with
- Associated products
- Seasonal context
- Archive notes

**Product Record (offering properties):**
- Format + Flavour combination
- Price
- Availability
- Shopify link

### Implementation Impact

**Flavour becomes simpler:**
```typescript
interface Flavour {
  // Identity
  name: string;
  type: FlavourType;
  status: Status;
  
  // Merchandising
  shortNotes: string;
  description: string;
  flavourTags: string[];
  
  // Composition
  baseStyle?: BaseStyle;
  ingredients: FlavourIngredient[];
  
  // Optional
  colour?: string;
  featured?: boolean;
  sortOrder?: number;
}
```

**Launch carries context:**
```typescript
interface Launch {
  name: string;
  date: string;
  flavours: string[];  // flavour IDs
  pairings: {
    flavourId: string;
    pairedWith: string[];
    archiveNote?: string;  // "Served alongside Wild Tomatoes"
  }[];
  products: string[];  // product IDs
}
```

**Benefits:**
1. Flavour form becomes much simpler
2. Launch history is properly contextualized
3. Same flavour can have different notes in different launches
4. Archive becomes launch-centric, not flavour-centric

---

## Implementation Recommendations

### Option 1: Minimal Changes (Quick Win)

**Changes:**
1. Convert BaseStyleSelector from radio tiles to dropdown
2. Add conditional rendering for Base field (only gelato/special)
3. Move Colour, Featured, Sort Order into collapsible "Advanced" section
4. Rename labels only (no data model changes):
   - "Short Description" → "Short Notes"
   - "Key Notes" → "Flavour Tags"
   - "Story" → "Archive Note"

**Effort:** 2-3 hours
**Impact:** Immediate UX improvement, no migration needed

### Option 2: Field Consolidation (Medium)

**Changes:**
- All from Option 1, plus:
- Remove Tasting Notes field
- Rename fields in data model (requires migration)
- Update all references throughout codebase

**Effort:** 1 day
**Impact:** Cleaner data model, requires testing

### Option 3: Architectural Refactor (Major)

**Changes:**
- All from Option 2, plus:
- Move archive notes to Launch model
- Update Launch form to include flavour pairings and context
- Refactor archive views to be launch-centric
- Update all queries and relationships

**Effort:** 3-5 days
**Impact:** Proper separation of concerns, better long-term architecture

---

## Specific File Changes Required

### Option 1 (Minimal)

**Files to modify:**
1. `app/admin/components/BaseStyleSelector.tsx` - Convert to dropdown
2. `app/admin/flavours/create/page.tsx` - Add conditional rendering, collapsible section
3. `app/admin/flavours/[id]/page.tsx` - Same changes as create page

**No data model changes, no migration needed**

### Option 2 (Field Consolidation)

**Additional files:**
4. `types/index.ts` - Update Flavour interface
5. `lib/db.ts` - Add migration function
6. `app/api/flavours/route.ts` - Handle both old and new field names during transition
7. All components that display flavour data

### Option 3 (Architectural)

**Additional files:**
8. `types/index.ts` - Update Launch interface with pairings
9. `app/admin/launches/[id]/page.tsx` - Add pairing/context section
10. Archive views - Refactor to show launches, not just flavours
11. All queries that join flavours and launches

---

## Recommendation

**Start with Option 1** for immediate improvement:
- Reduces visual clutter (dropdown instead of radio tiles)
- Hides advanced fields by default
- No breaking changes
- Can be done in a single session

**Then consider Option 3** as a separate project:
- Your "stronger opinion" is architecturally correct
- Launch-centric archive makes more sense
- But it's a bigger refactor that should be planned separately
- Requires rethinking how archive/history works

**Skip Option 2** unless you really want the field renames:
- Renaming fields requires migration
- Doesn't provide as much value as Option 1 or 3
- Can cause confusion during transition period

---

## Next Steps

If you want to proceed with Option 1:

1. Create new `BaseStyleDropdown` component (or modify existing)
2. Update flavour create/edit pages with:
   - Conditional base field rendering
   - Collapsible advanced section
   - Label updates (no data changes)
3. Test thoroughly
4. Deploy

If you want to proceed with Option 3:

1. Design Launch pairing/context data structure
2. Update Launch form UI
3. Create migration for existing data
4. Update archive views
5. Test extensively
6. Deploy with rollback plan

Let me know which direction you'd like to take!
