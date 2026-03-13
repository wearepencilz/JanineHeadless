# Design Document: Untitled UI CMS Migration

## Overview

This design document outlines the technical approach for migrating the Janine CMS admin interface from custom Tailwind components to Untitled UI React components. The migration will establish a consistent design system foundation, improve accessibility compliance, and reduce maintenance overhead across 14 admin sections.

### Current State

The CMS currently uses:
- Custom components with hardcoded Tailwind classes (e.g., `bg-blue-600`, `hover:bg-blue-700`)
- Inconsistent styling patterns across different pages
- Mixed component approaches (some custom, some partially standardized)
- Limited accessibility features
- No centralized design token system

### Target State

After migration, the CMS will have:
- Untitled UI React components throughout all admin sections
- Centralized design token system in Tailwind configuration
- WCAG 2.1 Level AA accessibility compliance
- Consistent visual language and interaction patterns
- Maintainable component library in `app/admin/components/ui/`

### Migration Scope

The migration covers 14 admin sections:
1. Launches (`/admin/launches`)
2. Products (`/admin/products`)
3. Ingredients (`/admin/ingredients`)
4. Modifiers (`/admin/modifiers`)
5. Formats (`/admin/formats`)
6. Taxonomies (`/admin/settings/taxonomies`)
7. News (`/admin/news`)
8. Settings (`/admin/settings`)
9. Batches (`/admin/batches`)
10. Flavours (`/admin/flavours`)
11. Games (`/admin/games`)
12. Sprites (`/admin/sprites`)
13. Pages (`/admin/pages`)
14. Shared components (navigation, layout, utilities)

## Architecture

### Component Library Structure

```
app/admin/components/ui/
├── buttons/
│   └── button.tsx              # Untitled UI Button component
├── inputs/
│   ├── input.tsx               # Text input
│   ├── textarea.tsx            # Multi-line text input
│   └── select.tsx              # Dropdown select
├── date-picker/
│   ├── date-picker.tsx         # Single date picker
│   └── date-range-picker.tsx  # Date range picker
├── modals/
│   └── modal.tsx               # Dialog/modal component
├── tables/
│   └── table.tsx               # Data table component
├── badges/
│   └── badge.tsx               # Status badges and tags
├── toast/
│   └── toast.tsx               # Notification toasts
└── utils/
    ├── cn.ts                   # Class name utility (tailwind-merge)
    └── types.ts                # Shared TypeScript types
```

### Design Token Architecture

Design tokens will be defined in Tailwind configuration using semantic naming:

```javascript
// Tailwind config structure
theme: {
  extend: {
    colors: {
      // Semantic color tokens
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        // ... blue scale for primary actions
        600: '#2563eb',
        700: '#1d4ed8',
      },
      secondary: {
        // ... gray scale for secondary actions
      },
      success: {
        // ... green scale for success states
      },
      error: {
        // ... red scale for error states
      },
      warning: {
        // ... yellow scale for warning states
      },
      info: {
        // ... blue scale for info states
      }
    },
    spacing: {
      // Consistent spacing scale
    },
    borderRadius: {
      // Consistent border radius tokens
    },
    fontSize: {
      // Typography scale
    }
  }
}
```

### Integration with Existing System

The migration will:
- Use Next.js 14.2 App Router architecture (no changes)
- Maintain React 18.3 and TypeScript 5.9 (no changes)
- Leverage existing Tailwind CSS 4.2.1 configuration
- Integrate with React Aria for accessibility (already in dependencies)
- Use `tailwind-merge` for class name composition (already in dependencies)
- Maintain existing API routes and data flow (no backend changes)

### Untitled UI Component Addition Process

Components are added via CLI:

```bash
# Add a specific component
npx untitledui@latest add [component-name]

# Example: Add date range picker
npx untitledui@latest add date-range-picker

# When prompted, specify: app/admin/components/ui
```

This approach:
- Copies component source code into the project (not npm package)
- Allows full customization of components
- Provides TypeScript definitions
- Includes React Aria integration for accessibility

## Components and Interfaces

### Component Inventory and Migration Mapping

#### High Priority Components (Phase 1)

| Custom Component | Untitled UI Replacement | Usage Count | Complexity |
|-----------------|------------------------|-------------|------------|
| Custom buttons (hardcoded classes) | `Button` | ~200+ instances | Low |
| Custom text inputs | `Input` | ~150+ instances | Low |
| `TaxonomySelect` | `Select` | ~50 instances | Medium |
| `TaxonomyMultiSelect` | `MultiSelect` | ~30 instances | Medium |
| `Toast` | `Toast` | 1 component, ~50 call sites | Low |

#### Medium Priority Components (Phase 2)

| Custom Component | Untitled UI Replacement | Usage Count | Complexity |
|-----------------|------------------------|-------------|------------|
| `LaunchDateRangePicker` | `DateRangePicker` | ~10 instances | Medium |
| Native date inputs | `DatePicker` | ~20 instances | Low |
| `ConfirmModal` | `Modal` | 1 component, ~30 call sites | Medium |
| `DeleteModal` | `Modal` | 1 component, ~20 call sites | Medium |
| `FormatSelectionModal` | `Modal` | 1 component, ~5 call sites | High |

#### Lower Priority Components (Phase 3)

| Custom Component | Untitled UI Replacement | Usage Count | Complexity |
|-----------------|------------------------|-------------|------------|
| `DataTable` | `Table` | 1 component, ~14 page instances | High |
| Status badges (hardcoded classes) | `Badge` | ~100+ instances | Low |
| `TaxonomyTagSelect` | `MultiSelect` + `Badge` | ~10 instances | Medium |

### Button Component Interface

```typescript
// app/admin/components/ui/buttons/button.tsx
import { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) {
  // Implementation uses design tokens
  // e.g., bg-primary-600 hover:bg-primary-700
}
```

### Input Component Interface

```typescript
// app/admin/components/ui/inputs/input.tsx
import { InputHTMLAttributes, ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  warning?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  helperText?: string;
}

export function Input({
  label,
  description,
  error,
  success,
  warning,
  prefix,
  suffix,
  helperText,
  required,
  disabled,
  className,
  ...props
}: InputProps) {
  // Implementation with validation states
}
```

### Select Component Interface

```typescript
// app/admin/components/ui/inputs/select.tsx
import { ReactNode } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  description?: string;
  error?: string;
  placeholder?: string;
  searchable?: boolean;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Select({
  options,
  value,
  onChange,
  label,
  description,
  error,
  placeholder = 'Select an option',
  searchable = false,
  required = false,
  disabled = false,
  className,
}: SelectProps) {
  // Implementation with React Aria for accessibility
}
```

### Modal Component Interface

```typescript
// app/admin/components/ui/modals/modal.tsx
import { ReactNode } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'full';
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  size = 'md',
  title,
  description,
  children,
  footer,
  closeOnBackdropClick = true,
  closeOnEscape = true,
}: ModalProps) {
  // Implementation with focus trap and body scroll lock
}
```

### Table Component Interface

```typescript
// app/admin/components/ui/tables/table.tsx
import { ReactNode } from 'react';

export interface TableColumn<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface TableAction<T> {
  label: string;
  onClick?: (item: T) => void;
  href?: (item: T) => string;
  variant?: 'default' | 'danger';
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  loading?: boolean;
  emptyMessage?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

export function Table<T>({
  data,
  columns,
  actions,
  keyExtractor,
  onRowClick,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  sortColumn,
  sortDirection,
  onSort,
  loading = false,
  emptyMessage = 'No items found',
  pagination,
}: TableProps<T>) {
  // Implementation with sorting, selection, pagination
}
```

### Toast Component Interface

```typescript
// app/admin/components/ui/toast/toast.tsx
import { ReactNode } from 'react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose: (id: string) => void;
}

export function Toast({
  id,
  variant,
  title,
  message,
  duration = 5000,
  action,
  onClose,
}: ToastProps) {
  // Implementation with auto-dismiss and stacking
}
```

### Badge Component Interface

```typescript
// app/admin/components/ui/badges/badge.tsx
import { ReactNode } from 'react';

export interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Badge({
  variant = 'default',
  size = 'md',
  icon,
  children,
  className,
}: BadgeProps) {
  // Implementation using design tokens
}
```

## Data Models

### Design Token Configuration

```typescript
// Design token types
interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

interface DesignTokens {
  colors: {
    primary: ColorScale;
    secondary: ColorScale;
    success: ColorScale;
    error: ColorScale;
    warning: ColorScale;
    info: ColorScale;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  fontSize: Record<string, [string, { lineHeight: string; letterSpacing?: string }]>;
}
```

### Component Migration Tracking

```typescript
// Migration progress tracking
interface ComponentMigrationStatus {
  componentName: string;
  customImplementation: string; // File path
  untitledUIReplacement: string; // Component name
  usageCount: number;
  phase: 1 | 2 | 3;
  status: 'not_started' | 'in_progress' | 'completed' | 'verified';
  migratedInstances: number;
  testsCoverage: number; // Percentage
  accessibilityScore: number; // axe-core score
}
```

### Migration Phase Plan

```typescript
interface MigrationPhase {
  phase: number;
  name: string;
  components: string[];
  estimatedEffort: string; // e.g., "2 weeks"
  dependencies: number[]; // Previous phases that must complete
  successCriteria: string[];
  rollbackStrategy: string;
}

const migrationPhases: MigrationPhase[] = [
  {
    phase: 1,
    name: 'Foundation: Buttons, Inputs, Toasts',
    components: ['Button', 'Input', 'Textarea', 'Toast'],
    estimatedEffort: '1 week',
    dependencies: [],
    successCriteria: [
      'All buttons use Button component',
      'All text inputs use Input/Textarea components',
      'Toast notifications use Toast component',
      'Design tokens configured in Tailwind',
      'Accessibility tests pass',
      'Visual regression tests pass'
    ],
    rollbackStrategy: 'Revert to previous commit, custom components still available'
  },
  {
    phase: 2,
    name: 'Forms: Selects, Date Pickers, Modals',
    components: ['Select', 'MultiSelect', 'DatePicker', 'DateRangePicker', 'Modal'],
    estimatedEffort: '2 weeks',
    dependencies: [1],
    successCriteria: [
      'All select dropdowns use Select/MultiSelect',
      'All date inputs use DatePicker/DateRangePicker',
      'All modals use Modal component',
      'Form validation works correctly',
      'Keyboard navigation works',
      'Screen reader compatibility verified'
    ],
    rollbackStrategy: 'Revert phase 2 changes, phase 1 components remain'
  },
  {
    phase: 3,
    name: 'Data Display: Tables, Badges',
    components: ['Table', 'Badge'],
    estimatedEffort: '2 weeks',
    dependencies: [1, 2],
    successCriteria: [
      'All data tables use Table component',
      'All status indicators use Badge component',
      'Sorting and pagination work correctly',
      'Row selection works correctly',
      'Empty states display properly',
      'Loading states display properly'
    ],
    rollbackStrategy: 'Revert phase 3 changes, phases 1-2 components remain'
  }
];
```


## Migration Strategy

### Incremental Migration Approach

The migration follows an incremental strategy to minimize risk and allow continuous delivery:

1. **Coexistence Period**: Old and new components coexist during migration
2. **Page-by-Page Migration**: Migrate complete pages rather than partial updates
3. **High-Traffic First**: Prioritize frequently used pages (launches, products, ingredients)
4. **Backward Compatibility**: Maintain existing APIs and data structures
5. **Feature Flags**: Use environment variables to toggle new components if needed

### Migration Workflow Per Component

```
1. Add Untitled UI component via CLI
   └─> npx untitledui@latest add [component-name]

2. Customize component for Janine CMS needs
   └─> Adjust styling, add required props, integrate with existing patterns

3. Create migration adapter (if needed)
   └─> Wrapper component to match existing API

4. Write tests
   └─> Unit tests, accessibility tests, visual regression tests

5. Migrate one page/section
   └─> Replace custom component with Untitled UI component

6. Test thoroughly
   └─> Manual testing, automated tests, accessibility audit

7. Deploy to staging
   └─> Verify in staging environment

8. Deploy to production
   └─> Monitor for issues

9. Remove old component (after verification period)
   └─> Clean up unused code
```

### Rollback Strategy

Each phase has a defined rollback strategy:

**Phase 1 Rollback**:
- Revert Git commits for phase 1
- Custom button/input classes still exist in codebase
- No data loss (no backend changes)
- Estimated rollback time: 15 minutes

**Phase 2 Rollback**:
- Revert Git commits for phase 2
- Phase 1 components (buttons, inputs) remain migrated
- Custom select/modal components still exist
- Estimated rollback time: 15 minutes

**Phase 3 Rollback**:
- Revert Git commits for phase 3
- Phases 1-2 components remain migrated
- Custom DataTable component still exists
- Estimated rollback time: 15 minutes

### Design Token Migration

Hardcoded color classes will be replaced with semantic tokens:

**Before**:
```tsx
<button className="bg-blue-600 hover:bg-blue-700 text-white">
  Save
</button>
```

**After**:
```tsx
<Button variant="primary">
  Save
</Button>
```

**Token Mapping**:
- `bg-blue-600` → `bg-primary-600` (via Button component)
- `bg-gray-600` → `bg-secondary-600` (via Button component)
- `bg-red-600` → `bg-error-600` (via Button component)
- `bg-green-600` → `bg-success-600` (via Button component)
- `bg-yellow-600` → `bg-warning-600` (via Button component)

### Accessibility Migration

Each component migration includes accessibility improvements:

1. **Keyboard Navigation**:
   - All interactive elements accessible via Tab/Shift+Tab
   - Arrow keys for dropdowns and date pickers
   - Enter/Space for activation
   - Escape for closing modals/dropdowns

2. **Screen Reader Support**:
   - Proper ARIA labels and roles
   - Live regions for dynamic content
   - Descriptive error messages
   - State announcements (loading, success, error)

3. **Focus Management**:
   - Visible focus indicators (2px outline)
   - Focus trap in modals
   - Focus restoration after modal close
   - Skip links for navigation

4. **Color Contrast**:
   - Minimum 4.5:1 for normal text
   - Minimum 3:1 for large text
   - Minimum 3:1 for UI components
   - Verified with automated tools (axe-core)

### Performance Considerations

1. **Code Splitting**:
   - Lazy load modal components
   - Lazy load date picker components
   - Lazy load table components for large datasets

2. **Bundle Size Optimization**:
   - Import only used Untitled UI components
   - Tree-shake unused code
   - Minimize CSS bundle size

3. **Rendering Optimization**:
   - Memoize expensive computations
   - Use React.memo for pure components
   - Virtualize large tables (if needed)
   - Debounce search inputs

4. **Performance Targets**:
   - Page load time: < 2 seconds
   - Interaction response time: < 100ms
   - First Contentful Paint: < 1.5 seconds
   - Time to Interactive: < 3 seconds

## Component-Specific Migration Details

### TaxonomySelect Migration

**Current Implementation**: Custom dropdown with search, create-new functionality, and API integration

**Migration Approach**:
1. Use Untitled UI `Select` component as base
2. Add search functionality (built into Select)
3. Add "Create New" option in dropdown footer
4. Maintain existing API integration
5. Preserve keyboard shortcuts (Enter to create, Escape to cancel)

**Key Differences**:
- Untitled UI Select uses React Aria for accessibility
- Better keyboard navigation out of the box
- Improved screen reader support
- Consistent styling with other components

**Migration Complexity**: Medium (requires custom footer for "Create New")

### TaxonomyMultiSelect Migration

**Current Implementation**: Custom multi-select with tag display and removal

**Migration Approach**:
1. Use Untitled UI `MultiSelect` component
2. Display selected items as removable tags
3. Maintain search/filter functionality
4. Preserve existing API integration

**Key Differences**:
- Better tag management UI
- Improved keyboard navigation (Backspace to remove last tag)
- Better screen reader announcements

**Migration Complexity**: Medium (requires tag rendering customization)

### DataTable Migration

**Current Implementation**: Custom table with header, filters, actions, empty state, loading state

**Migration Approach**:
1. Use Untitled UI `Table` component as base
2. Add custom header section (title, description, buttons)
3. Add custom filter section
4. Implement row actions
5. Implement empty state
6. Implement loading state with skeleton loaders

**Key Differences**:
- Sortable columns out of the box
- Row selection with checkboxes
- Pagination support
- Better accessibility (proper table semantics)

**Migration Complexity**: High (most complex component, used on 14 pages)

**Migration Strategy for DataTable**:
- Migrate one page at a time
- Start with simplest table (Settings > Taxonomies)
- Progress to more complex tables (Launches, Products)
- Verify sorting, filtering, actions work correctly
- Test with large datasets (100+ rows)

### FormatSelectionModal Migration

**Current Implementation**: Custom modal with format selection, eligibility logic, and confirmation

**Migration Approach**:
1. Use Untitled UI `Modal` component for dialog
2. Keep custom content (format selection logic)
3. Use Untitled UI `Checkbox` for format selection
4. Use Untitled UI `Badge` for format metadata display
5. Maintain existing eligibility logic

**Key Differences**:
- Better focus management
- Improved keyboard navigation
- Better screen reader support
- Consistent modal styling

**Migration Complexity**: High (complex business logic, must preserve exactly)

### Toast Migration

**Current Implementation**: Custom toast with variants, auto-dismiss, and stacking

**Migration Approach**:
1. Use Untitled UI `Toast` component
2. Maintain existing ToastContainer for stacking
3. Preserve auto-dismiss functionality
4. Keep existing variant styling (success, error, warning, info)

**Key Differences**:
- Better animation support
- Improved accessibility (ARIA live regions)
- Consistent styling with other components

**Migration Complexity**: Low (straightforward replacement)

### LaunchDateRangePicker Migration

**Current Implementation**: Custom date range picker with calendar UI

**Migration Approach**:
1. Use Untitled UI `DateRangePicker` component
2. Maintain ISO 8601 date format
3. Preserve existing validation logic
4. Keep existing label and error display

**Key Differences**:
- Better calendar UI
- Improved keyboard navigation
- Better screen reader support
- Consistent styling

**Migration Complexity**: Medium (requires date format handling)

## Testing Strategy

### Dual Testing Approach

The migration will use both unit tests and property-based tests for comprehensive coverage:

**Unit Tests**: Verify specific examples, edge cases, and error conditions
- Component rendering with different props
- User interactions (clicks, keyboard events)
- Form validation
- API integration
- Error handling

**Property-Based Tests**: Verify universal properties across all inputs
- Component behavior with random valid inputs
- Accessibility properties hold for all states
- Design token consistency across all components
- Keyboard navigation works for all interactive elements

### Testing Layers

#### 1. Unit Tests (Vitest + React Testing Library)

```typescript
// Example: Button component unit tests
describe('Button', () => {
  it('renders with primary variant', () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary-600');
  });

  it('shows loading spinner when loading', () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

#### 2. Accessibility Tests (axe-core)

```typescript
// Example: Accessibility tests for all components
describe('Button Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('is keyboard accessible', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button');
    button.focus();
    expect(button).toHaveFocus();
  });

  it('has proper ARIA attributes', () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });
});
```

#### 3. Integration Tests

```typescript
// Example: Form submission integration test
describe('Launch Form Integration', () => {
  it('submits form with valid data', async () => {
    render(<LaunchForm />);
    
    // Fill in form fields
    await userEvent.type(screen.getByLabelText('Name'), 'Summer 2024');
    await userEvent.click(screen.getByLabelText('Start Date'));
    await userEvent.click(screen.getByText('15')); // Select date
    
    // Submit form
    await userEvent.click(screen.getByRole('button', { name: 'Create Launch' }));
    
    // Verify API call
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/launches', {
        method: 'POST',
        body: expect.stringContaining('Summer 2024')
      });
    });
  });
});
```

#### 4. Visual Regression Tests (Optional)

```typescript
// Example: Visual regression test with Playwright
test('Button variants match snapshots', async ({ page }) => {
  await page.goto('/admin/components/button-showcase');
  
  // Take screenshot of all button variants
  await expect(page.locator('.button-showcase')).toHaveScreenshot('buttons.png');
});
```

### Property-Based Testing Configuration

Property-based tests will use `fast-check` library (already in dependencies):

```typescript
// Example: Property-based test for Button component
import fc from 'fast-check';

describe('Button Properties', () => {
  it('Property: Button is always clickable when not disabled or loading', () => {
    fc.assert(
      fc.property(
        fc.record({
          variant: fc.constantFrom('primary', 'secondary', 'tertiary', 'danger', 'ghost'),
          size: fc.constantFrom('sm', 'md', 'lg'),
          children: fc.string(),
        }),
        (props) => {
          const { container } = render(<Button {...props} />);
          const button = container.querySelector('button');
          expect(button).not.toBeDisabled();
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Test Coverage Requirements

- **Unit Test Coverage**: Minimum 80% code coverage
- **Accessibility Test Coverage**: 100% of interactive components
- **Integration Test Coverage**: All critical user flows (form submission, data operations)
- **Property Test Coverage**: All correctness properties from design document

### Testing Checklist Per Component

For each migrated component, verify:

- [ ] Renders correctly with all prop combinations
- [ ] Handles user interactions (click, keyboard, focus)
- [ ] Displays validation states (error, success, warning)
- [ ] Shows loading states appropriately
- [ ] Handles edge cases (empty data, long text, special characters)
- [ ] Passes accessibility audit (axe-core)
- [ ] Supports keyboard navigation
- [ ] Works with screen readers
- [ ] Maintains focus correctly
- [ ] Has proper ARIA attributes
- [ ] Meets color contrast requirements
- [ ] Matches visual design
- [ ] Performs well (no unnecessary re-renders)

