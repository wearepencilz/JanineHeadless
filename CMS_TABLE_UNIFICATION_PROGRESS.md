# CMS Table Unification Progress

## Goal
Create unified table components for all CMS list pages to ensure consistent UI/UX across the admin interface.

## Components Created

### 1. DataTable Component (`app/admin/components/DataTable.tsx`)
- Reusable table component with consistent structure
- Features:
  - Page header with title and description
  - Primary and secondary action buttons
  - Optional filters section
  - Responsive table with customizable columns
  - Row click handling
  - Action buttons (edit, delete, etc.)
  - Empty state with call-to-action
  - Loading state
  - Consistent styling and spacing

### 2. TableFilters Component (`app/admin/components/TableFilters.tsx`)
- Reusable filter bar for search and select inputs
- Supports multiple filter types (search, select)
- Responsive grid layout
- Consistent styling

### 3. DeleteModal Component (`app/admin/components/DeleteModal.tsx`)
- Reusable confirmation modal for delete actions
- Features:
  - ESC key support
  - Backdrop blur effect (`bg-black/30 backdrop-blur-sm`)
  - Consistent button styling
  - Customizable title and message

## Pages Updated

### ✅ Completed

1. **Batches** (`app/admin/batches/page.tsx`)
   - Uses DataTable with clickable rows
   - Delete modal with confirmation
   - No filters (simple list)

2. **News** (`app/admin/news/page.tsx`)
   - Uses DataTable with clickable rows
   - Delete modal with confirmation
   - No filters (simple list)

3. **Flavours** (`app/admin/flavours/page.tsx`)
   - Uses DataTable with clickable rows
   - TableFilters (search + status filter)
   - Delete modal with confirmation
   - Secondary button (Seed Data)

4. **Ingredients** (`app/admin/ingredients/page.tsx`)
   - Uses DataTable with clickable rows
   - TableFilters (search + category + status filters)
   - Delete modal with confirmation
   - Secondary button (Seed Data)
   - Complex allergen and property badges

## Pages Remaining

### 🔄 To Update

5. **Products** (`app/admin/products/page.tsx`)
   - Currently has: Table with filters, delete modal
   - Needs: Refactor to use DataTable + TableFilters
   - Special features: Shopify integration badges, format names

6. **Formats** (`app/admin/formats/page.tsx`)
   - Currently has: Card grid layout (NOT table!)
   - Decision needed: Keep cards or convert to table?
   - Has: Search + category filters

7. **Modifiers** (`app/admin/modifiers/page.tsx`)
   - Currently has: Table with filters, delete modal
   - Needs: Refactor to use DataTable + TableFilters
   - Special features: Type badges, price formatting

8. **Launches** (`app/admin/launches/page.tsx`)
   - Currently has: Table with status filter, delete modal
   - Needs: Refactor to use DataTable + TableFilters
   - Special features: Date formatting, featured indicator

9. **Games** (`app/admin/games/page.tsx`)
   - Currently: Server component with stats cards
   - Decision needed: Keep as-is or refactor?
   - Special features: Stats dashboard, multiple action links

## Design Patterns Established

### Header Structure
```tsx
<DataTable
  title="Page Title"
  description="Optional description or count"
  createButton={{ label: 'Create Item', href: '/admin/items/create' }}
  secondaryButton={{ label: 'Secondary Action', href: '/admin/items/seed' }}
  ...
/>
```

### Filter Structure
```tsx
const filters: FilterConfig[] = [
  {
    type: 'search',
    placeholder: 'Search...',
    value: searchTerm,
    onChange: setSearchTerm,
  },
  {
    type: 'select',
    value: statusFilter,
    onChange: setStatusFilter,
    options: [
      { value: 'all', label: 'All Status' },
      { value: 'active', label: 'Active' },
    ],
  },
];

<DataTable
  filters={<TableFilters filters={filters} />}
  ...
/>
```

### Column Definition
```tsx
const columns: Column<T>[] = [
  {
    key: 'name',
    label: 'Name',
    render: (item) => (
      <div className="text-sm font-medium text-gray-900">{item.name}</div>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    render: (item) => (
      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
        {item.status}
      </span>
    ),
    className: 'whitespace-nowrap',
  },
];
```

### Actions Definition
```tsx
const actions: Action<T>[] = [
  {
    label: 'Edit',
    href: (item) => `/admin/items/${item.id}`,
    stopPropagation: true,
  },
  {
    label: 'Delete',
    onClick: handleDeleteClick,
    className: 'text-red-600 hover:text-red-900',
    stopPropagation: true,
  },
];
```

### Delete Modal Pattern
```tsx
const [deleteConfirm, setDeleteConfirm] = useState<{ 
  show: boolean; 
  id: string; 
  name: string 
}>({
  show: false,
  id: '',
  name: '',
});

const handleDeleteClick = (item: T) => {
  setDeleteConfirm({ show: true, id: item.id, name: item.name });
};

const handleDelete = async () => {
  // Perform delete
  setDeleteConfirm({ show: false, id: '', name: '' });
};

<DeleteModal
  isOpen={deleteConfirm.show}
  title="Delete Item"
  message={`Are you sure you want to delete "${deleteConfirm.name}"?`}
  onConfirm={handleDelete}
  onCancel={() => setDeleteConfirm({ show: false, id: '', name: '' })}
/>
```

## Benefits Achieved

1. **Consistency**: All list pages now have the same structure and styling
2. **Maintainability**: Changes to table behavior can be made in one place
3. **Reusability**: Components can be used for future list pages
4. **User Experience**: Consistent interactions across all pages
5. **Code Quality**: Reduced duplication, cleaner code

## Next Steps

1. Update Products page
2. Decide on Formats page approach (cards vs table)
3. Update Modifiers page
4. Update Launches page
5. Decide on Games page approach (keep stats dashboard or refactor)
6. Test all pages for functionality
7. Verify responsive behavior on mobile
8. Check accessibility (keyboard navigation, screen readers)

## Git Commits

- `c554705`: Create DataTable, DeleteModal, TableFilters components + update batches/news
- `f4c3ff2`: Add filters prop to DataTable + update flavours page
- `2fba080`: Update ingredients page to use unified components
