# Taxonomy Management Updates

## Overview

This document outlines the updates needed to implement CMS-managed taxonomies with reusable component patterns, based on the design review.

## Key Changes

### 1. Settings Data Model (Added to design.md)

```typescript
interface Settings {
  taxonomies: TaxonomySettings
  formatEligibilityRules: FormatEligibilityRule[]
  createdAt: string
  updatedAt: string
}

interface TaxonomyValue {
  id: string
  label: string                 // Display label (e.g., "Gelato")
  value: string                 // Internal value (e.g., "gelato")
  description?: string
  sortOrder: number
  archived: boolean
  createdAt: string
  updatedAt: string
}
```

### 2. File Structure Updates

**Development:**
- Add `public/data/settings.json` with default taxonomies

**Production:**
- Add Vercel KV key: `settings:taxonomies`

### 3. Dynamic Format Eligibility

**Before (Hardcoded):**
```typescript
const ELIGIBILITY_RULES: Record<FlavourType, FormatCategory[]> = {
  'gelato': ['scoop', 'take-home', 'twist', 'sandwich'],
  // ...
}
```

**After (Dynamic):**
```typescript
async function getFormatEligibility(flavourType: string): Promise<string[]> {
  const settings = await getSettings()
  const rule = settings.formatEligibilityRules.find(r => r.flavourType === flavourType)
  return rule?.eligibleFormatCategories || []
}
```

### 4. Reusable CMS Components

Following existing patterns from `BaseStyleSelector`, `FlavourIngredientSelector`, and `FormatEligibilitySelector`:

#### TaxonomySelect Component

**Location:** `app/admin/components/TaxonomySelect.tsx`

**Features:**
- Load taxonomy values from settings API
- Filter out archived values by default
- Show "Add New" option at bottom of dropdown
- Inline creation form
- Auto-refresh after adding new value
- Support for single-select and multi-select modes

**Props:**
```typescript
interface TaxonomySelectProps {
  category: TaxonomyCategory
  value: string | string[]
  onChange: (value: string | string[]) => void
  multiple?: boolean
  required?: boolean
  placeholder?: string
  showArchived?: boolean
  className?: string
}
```

**Usage Example:**
```typescript
<TaxonomySelect
  category="flavourTypes"
  value={formData.type}
  onChange={(value) => setFormData({ ...formData, type: value as string })}
  required
  placeholder="Select flavour type"
/>
```

#### TaxonomyMultiSelect Component

**Location:** `app/admin/components/TaxonomyMultiSelect.tsx`

**Features:**
- Checkbox-based multi-select
- Visual tags for selected values
- Same inline creation as TaxonomySelect
- Follows pattern from FlavourIngredientSelector

**Usage Example:**
```typescript
<TaxonomyMultiSelect
  category="allergens"
  values={formData.allergens}
  onChange={(values) => setFormData({ ...formData, allergens: values })}
  label="Allergens"
/>
```

#### TaxonomyManager Component

**Location:** `app/admin/settings/taxonomies/page.tsx`

**Features:**
- Tab-based interface for each taxonomy category
- Drag-and-drop reordering
- Archive/unarchive toggle
- Add new value form
- Delete with usage validation
- Follows pattern from existing admin pages

### 5. API Endpoints

#### GET /api/settings/taxonomies
Returns all taxonomy categories and values

#### GET /api/settings/taxonomies/[category]
Returns values for specific category

#### POST /api/settings/taxonomies/[category]
Add new taxonomy value with uniqueness validation

#### PUT /api/settings/taxonomies/[category]/[id]
Update taxonomy value (label, description, sortOrder, archived)

#### DELETE /api/settings/taxonomies/[category]/[id]
Delete taxonomy value with usage validation

### 6. Database Functions

**Add to lib/db.js:**
```typescript
export async function getSettings()
export async function saveSettings(settings)
export async function getTaxonomyValues(category)
export async function addTaxonomyValue(category, value)
export async function updateTaxonomyValue(category, id, updates)
export async function deleteTaxonomyValue(category, id)
export async function checkTaxonomyValueUsage(category, value)
```

### 7. Validation Functions

**Add to lib/validation.ts:**
```typescript
export async function validateTaxonomyUniqueness(category: string, value: string): Promise<boolean>
export async function validateTaxonomyDeletion(category: string, id: string): Promise<ValidationResult>
export async function checkTaxonomyValueInUse(category: string, value: string): Promise<string[]>
```

## Migration Impact

### Phase 1: Preparation
- Create settings.json with default taxonomies
- Add new database functions
- Create TaxonomySelect components

### Phase 2: Component Replacement
- Replace hardcoded dropdowns with TaxonomySelect
- Update all forms (ingredients, flavours, modifiers, etc.)
- Test inline creation workflow

### Phase 3: Settings UI
- Build taxonomy management interface
- Add reordering functionality
- Implement archive/delete with validation

### Phase 4: Dynamic Eligibility
- Update format-eligibility.ts to load from settings
- Remove hardcoded ELIGIBILITY_RULES constant
- Test format filtering with dynamic rules

## Component Replacement Checklist

### Forms to Update

- [ ] `app/admin/ingredients/create/page.tsx` - category dropdown
- [ ] `app/admin/ingredients/[id]/page.tsx` - category dropdown
- [ ] `app/admin/flavours/create/page.tsx` - type dropdown, status dropdown
- [ ] `app/admin/flavours/[id]/page.tsx` - type dropdown, status dropdown
- [ ] `app/admin/modifiers/new/page.tsx` - type dropdown
- [ ] `app/admin/modifiers/[id]/page.tsx` - type dropdown
- [ ] `app/admin/formats/create/page.tsx` - category dropdown
- [ ] `app/admin/formats/[id]/page.tsx` - category dropdown
- [ ] `app/admin/launches/new/page.tsx` - status dropdown
- [ ] `app/admin/launches/[id]/page.tsx` - status dropdown

### Multi-Select to Update

- [ ] Ingredient roles (ingredients forms)
- [ ] Allergens (ingredients, modifiers forms)
- [ ] Dietary flags (ingredients forms)
- [ ] Seasons (flavours forms)

## Testing Requirements

### Unit Tests
- Taxonomy uniqueness validation
- Usage checking before deletion
- Inline creation workflow

### Integration Tests
- Settings API endpoints
- Taxonomy CRUD operations
- Component integration with forms

### Property Tests
- **Property 21: Taxonomy Value Uniqueness** - No duplicate values within category
- **Property 22: Taxonomy Deletion Safety** - Cannot delete values in use

## Benefits

1. **No Code Deployments**: Add new categories without code changes
2. **Consistent UX**: Reusable components across all forms
3. **Data Integrity**: Validation prevents orphaned references
4. **Flexibility**: Archive instead of delete preserves history
5. **Scalability**: Easy to add new taxonomy categories
6. **Maintainability**: Single source of truth for all taxonomies
