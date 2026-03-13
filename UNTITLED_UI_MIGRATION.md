# Untitled UI Component Migration Guide

## Overview

The Janine CMS is being migrated to use Untitled UI React components for consistency, accessibility, and maintainability. This document outlines the migration strategy and component usage.

## Setup Complete

✅ Untitled UI has been initialized in the project:
- PostCSS configuration added
- Global styles configured in `src/styles/`
- Layout updated to import Untitled UI styles
- Infrastructure ready for component usage

## Adding Components

### Using the CLI (Recommended)

```bash
# Add a specific component
npx untitledui@latest add [component-name]

# When prompted for directory, enter:
app/admin/components/ui

# Example: Add date range picker
npx untitledui@latest add date-range-picker
```

### Available Components

Full list: https://www.untitledui.com/react/components

**Priority Components for CMS:**
- `date-range-picker` - For launch date ranges, availability scheduling
- `date-picker` - For single date fields (batch dates, news dates)
- `input` - Replace all text inputs
- `textarea` - Replace all textareas
- `select` - Replace all select dropdowns
- `button` - Standardize all buttons
- `modal` - Replace custom modals
- `table` - Improve data tables
- `badge` - For status indicators
- `checkbox` - For boolean fields
- `radio-group` - For single-choice options

## Migration Priority

### Phase 1: Date Inputs (High Priority)
Current date inputs need immediate replacement with DateRangePicker:

**Files to Update:**
1. `app/admin/launches/new/page.tsx` - Active start/end dates
2. `app/admin/launches/[id]/page.tsx` - Active start/end dates
3. `app/admin/batches/create/page.tsx` - Batch date
4. `app/admin/news/[id]/page.tsx` - News date
5. `app/admin/components/AvailabilityScheduler.tsx` - Availability dates
6. `app/admin/components/InventoryPanel.tsx` - Restock date

**Current Pattern:**
```tsx
<input
  type="date"
  value={formData.activeStart}
  onChange={(e) => setFormData({ ...formData, activeStart: e.target.value })}
  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
/>
```

**Replace With:**
```tsx
import { DateRangePicker } from '@/app/admin/components/ui/DateRangePicker';

<DateRangePicker
  value={{
    start: formData.activeStart,
    end: formData.activeEnd
  }}
  onChange={(range) => setFormData({
    ...formData,
    activeStart: range.start,
    activeEnd: range.end
  })}
/>
```

### Phase 2: Form Inputs (Medium Priority)
Replace all text inputs, textareas, and selects:

**Files to Update:**
- All pages in `app/admin/launches/`
- All pages in `app/admin/modifiers/`
- All pages in `app/admin/products/`
- All pages in `app/admin/flavours/`
- All pages in `app/admin/ingredients/`
- All pages in `app/admin/formats/`

### Phase 3: Buttons & Actions (Medium Priority)
Standardize all buttons using Untitled UI Button component:

**Current Patterns:**
```tsx
// Primary button
<button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
  Save
</button>

// Secondary button
<button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
  Cancel
</button>
```

**Replace With:**
```tsx
import { Button } from '@/app/admin/components/ui/Button';

<Button variant="primary">Save</Button>
<Button variant="secondary">Cancel</Button>
```

### Phase 4: Tables & Lists (Low Priority)
Improve data tables in list pages:

**Files to Update:**
- `app/admin/launches/page.tsx`
- `app/admin/modifiers/page.tsx`
- `app/admin/products/page.tsx`
- `app/admin/flavours/page.tsx`
- `app/admin/ingredients/page.tsx`

## Component Usage Examples

### DateRangePicker

```tsx
import { DateRangePicker } from '@/app/admin/components/ui/DateRangePicker';

function LaunchForm() {
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  return (
    <DateRangePicker
      value={dateRange}
      onChange={setDateRange}
      label="Active Period"
      description="When this launch will be active"
    />
  );
}
```

### Input

```tsx
import { Input } from '@/app/admin/components/ui/Input';

<Input
  label="Title"
  value={formData.title}
  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
  placeholder="Enter title"
  required
/>
```

### Select

```tsx
import { Select } from '@/app/admin/components/ui/Select';

<Select
  label="Status"
  value={formData.status}
  onChange={(value) => setFormData({ ...formData, status: value })}
  options={[
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Draft' },
    { value: 'archived', label: 'Archived' }
  ]}
/>
```

### Button

```tsx
import { Button } from '@/app/admin/components/ui/Button';

<div className="flex gap-3">
  <Button variant="secondary" onClick={handleCancel}>
    Cancel
  </Button>
  <Button variant="primary" type="submit" loading={saving}>
    Save Changes
  </Button>
</div>
```

## Benefits

1. **Consistency**: All components follow the same design patterns
2. **Accessibility**: Built with React Aria for WCAG compliance
3. **Maintainability**: Single source of truth for component behavior
4. **Type Safety**: Full TypeScript support
5. **Customization**: Easy to theme and extend
6. **Documentation**: Well-documented at untitledui.com

## Next Steps

1. Add DateRangePicker component: `npx untitledui@latest add date-range-picker`
2. Update launch pages to use DateRangePicker
3. Add Input component: `npx untitledui@latest add input`
4. Progressively migrate form inputs
5. Add Button component: `npx untitledui@latest add button`
6. Standardize all buttons

## Resources

- Component Library: https://www.untitledui.com/react/components
- Documentation: https://www.untitledui.com/react/docs
- GitHub: https://github.com/untitleduico/react
- Steering Guide: `.kiro/steering/untitled-ui-reference.md`
