# Taxonomy Management Implementation Tasks

## Overview

These tasks implement CMS-managed taxonomies with reusable component patterns. Add these to the main tasks.md file or execute them as a follow-up phase.

## Tasks

### Phase 1: Settings & Database Layer

- [ ] T1. Settings Data Model & Storage
  - [ ] T1.1 Create public/data/settings.json with default taxonomies
    - Add all 9 taxonomy categories with default values
    - Include format eligibility rules
    - Set proper IDs, labels, values, sortOrder, archived flags
    - _Requirements: 0.1, 0.2, 0.15_
  
  - [ ] T1.2 Update lib/db.js with settings functions
    - Add getSettings() and saveSettings(settings)
    - Add getTaxonomyValues(category) helper
    - Add addTaxonomyValue(category, value) helper
    - Add updateTaxonomyValue(category, id, updates) helper
    - Add deleteTaxonomyValue(category, id) helper
    - _Requirements: 0.11, 0.12, 0.13, 0.14_
  
  - [ ] T1.3 Write unit tests for settings functions
    - Test settings CRUD operations
    - Test taxonomy value operations
    - Test data persistence
    - _Requirements: 0.11_

### Phase 2: Validation Layer

- [ ] T2. Taxonomy Validation Functions
  - [ ] T2.1 Add validation functions to lib/validation.ts
    - Implement validateTaxonomyUniqueness(category, value)
    - Implement validateTaxonomyDeletion(category, id)
    - Implement checkTaxonomyValueInUse(category, value)
    - _Requirements: 0.9, 0.10_
  
  - [ ] T2.2 Write property test for taxonomy uniqueness
    - **Property 21: Taxonomy Value Uniqueness**
    - **Validates: Requirements 0.9**
    - Test no duplicate values within category
    - _Requirements: 0.9_
  
  - [ ] T2.3 Write property test for taxonomy deletion safety
    - **Property 22: Taxonomy Deletion Safety**
    - **Validates: Requirements 0.10**
    - Test cannot delete values in use
    - _Requirements: 0.10_

### Phase 3: API Endpoints

- [ ] T3. Settings & Taxonomy API Endpoints
  - [ ] T3.1 Create app/api/settings/taxonomies/route.ts
    - Implement GET handler returning all taxonomies
    - Implement PUT handler for bulk taxonomy updates
    - _Requirements: 0.11_
  
  - [ ] T3.2 Create app/api/settings/taxonomies/[category]/route.ts
    - Implement GET handler for specific category
    - Implement POST handler for adding taxonomy value
    - Implement validation for uniqueness
    - Support inline "Add New" workflow
    - _Requirements: 0.12, 0.13, 0.4, 0.5, 0.9_
  
  - [ ] T3.3 Create app/api/settings/taxonomies/[category]/[id]/route.ts
    - Implement PUT handler for updating taxonomy value
    - Implement DELETE handler with usage checking
    - Return list of dependent records if in use
    - _Requirements: 0.14, 0.10_
  
  - [ ] T3.4 Write integration tests for taxonomy endpoints
    - Test GET all taxonomies
    - Test GET specific category
    - Test POST add new value
    - Test PUT update value
    - Test DELETE with usage check
    - _Requirements: 0.11, 0.12, 0.13, 0.14_

### Phase 4: Reusable CMS Components

- [ ] T4. TaxonomySelect Component (Single-Select)
  - [ ] T4.1 Create app/admin/components/TaxonomySelect.tsx
    - Load taxonomy values from settings API
    - Filter out archived values by default
    - Show "Add New" option at bottom
    - Display inline creation form when selected
    - Auto-refresh after adding new value
    - Follow BaseStyleSelector pattern
    - _Requirements: 0.3, 0.4, 0.5, 0.6, 0.17, 0.18, 0.19, 0.20_
  
  - [ ] T4.2 Add TypeScript interfaces for component props
    - Define TaxonomySelectProps interface
    - Define TaxonomyCategory type
    - Add proper type safety
    - _Requirements: 0.17_
  
  - [ ] T4.3 Write unit tests for TaxonomySelect
    - Test loading taxonomy values
    - Test filtering archived values
    - Test inline creation workflow
    - Test value selection and onChange
    - _Requirements: 0.18_

- [ ] T5. TaxonomyMultiSelect Component (Multi-Select)
  - [ ] T5.1 Create app/admin/components/TaxonomyMultiSelect.tsx
    - Checkbox-based multi-select interface
    - Visual tags for selected values
    - Same inline creation as TaxonomySelect
    - Follow FlavourIngredientSelector pattern
    - _Requirements: 0.3, 0.4, 0.5, 0.6, 0.17, 0.18, 0.20_
  
  - [ ] T5.2 Write unit tests for TaxonomyMultiSelect
    - Test multi-select functionality
    - Test tag display and removal
    - Test inline creation
    - _Requirements: 0.18_

### Phase 5: Replace Hardcoded Dropdowns

- [ ] T6. Update Ingredient Forms
  - [ ] T6.1 Replace category dropdown in app/admin/ingredients/create/page.tsx
    - Use TaxonomySelect with category="ingredientCategories"
    - Remove hardcoded category options
    - _Requirements: 0.3, 0.17_
  
  - [ ] T6.2 Replace category dropdown in app/admin/ingredients/[id]/page.tsx
    - Use TaxonomySelect with category="ingredientCategories"
    - _Requirements: 0.3, 0.17_
  
  - [ ] T6.3 Replace roles multi-select in ingredient forms
    - Use TaxonomyMultiSelect with category="ingredientRoles"
    - _Requirements: 0.3, 0.17_
  
  - [ ] T6.4 Replace allergens multi-select in ingredient forms
    - Use TaxonomyMultiSelect with category="allergens"
    - _Requirements: 0.3, 0.17_
  
  - [ ] T6.5 Replace dietary flags multi-select in ingredient forms
    - Use TaxonomyMultiSelect with category="dietaryFlags"
    - _Requirements: 0.3, 0.17_

- [ ] T7. Update Flavour Forms
  - [ ] T7.1 Replace type dropdown in app/admin/flavours/create/page.tsx
    - Use TaxonomySelect with category="flavourTypes"
    - Show format eligibility description
    - _Requirements: 0.3, 0.17_
  
  - [ ] T7.2 Replace type dropdown in app/admin/flavours/[id]/page.tsx
    - Use TaxonomySelect with category="flavourTypes"
    - _Requirements: 0.3, 0.17_
  
  - [ ] T7.3 Replace season multi-select in flavour forms
    - Use TaxonomyMultiSelect with category="seasons"
    - _Requirements: 0.3, 0.17_

- [ ] T8. Update Modifier Forms
  - [ ] T8.1 Replace type dropdown in app/admin/modifiers/new/page.tsx
    - Use TaxonomySelect with category="modifierTypes"
    - _Requirements: 0.3, 0.17_
  
  - [ ] T8.2 Replace type dropdown in app/admin/modifiers/[id]/page.tsx
    - Use TaxonomySelect with category="modifierTypes"
    - _Requirements: 0.3, 0.17_
  
  - [ ] T8.3 Replace allergens multi-select in modifier forms
    - Use TaxonomyMultiSelect with category="allergens"
    - _Requirements: 0.3, 0.17_

- [ ] T9. Update Format Forms
  - [ ] T9.1 Replace category dropdown in app/admin/formats/create/page.tsx
    - Use TaxonomySelect with category="formatCategories"
    - _Requirements: 0.3, 0.17_
  
  - [ ] T9.2 Replace category dropdown in app/admin/formats/[id]/page.tsx
    - Use TaxonomySelect with category="formatCategories"
    - _Requirements: 0.3, 0.17_

- [ ] T10. Update Launch Forms
  - [ ] T10.1 Replace content block type selection in launch forms
    - Use TaxonomySelect with category="contentBlockTypes"
    - _Requirements: 0.3, 0.17_

### Phase 6: Dynamic Format Eligibility

- [ ] T11. Update Format Eligibility Logic
  - [ ] T11.1 Refactor lib/format-eligibility.ts to load from settings
    - Remove hardcoded ELIGIBILITY_RULES constant
    - Implement async getFormatEligibility(flavourType) loading from settings
    - Update isEligibleForFormat() to use dynamic rules
    - Update filterEligibleFlavours() to use dynamic rules
    - _Requirements: 0.16_
  
  - [ ] T11.2 Update all callers to handle async eligibility
    - Update API endpoints using format eligibility
    - Update validation functions
    - Update CMS components
    - _Requirements: 0.16_
  
  - [ ] T11.3 Write integration tests for dynamic eligibility
    - Test loading rules from settings
    - Test updating rules affects validation
    - Test backward compatibility
    - _Requirements: 0.16_

### Phase 7: Taxonomy Management UI

- [ ] T12. Settings Taxonomy Management Interface
  - [ ] T12.1 Create app/admin/settings/taxonomies/page.tsx
    - Tab-based interface for each taxonomy category
    - Display all values with sortOrder and archived status
    - Add "Add Value" button for each category
    - Show value count and usage statistics
    - _Requirements: 0.1, 0.2_
  
  - [ ] T12.2 Implement drag-and-drop reordering
    - Use react-beautiful-dnd or similar
    - Update sortOrder on drop
    - Save changes to settings
    - _Requirements: 0.7_
  
  - [ ] T12.3 Implement archive/unarchive toggle
    - Toggle archived flag
    - Show archived values in separate section
    - Preserve archived values in existing content
    - _Requirements: 0.8, 0.19_
  
  - [ ] T12.4 Implement delete with validation
    - Check usage before allowing delete
    - Show modal with list of dependent records
    - Prevent deletion if in use
    - _Requirements: 0.10_
  
  - [ ] T12.5 Implement add new value form
    - Inline form for each category
    - Validate uniqueness
    - Auto-generate ID and set sortOrder
    - _Requirements: 0.4, 0.5, 0.6, 0.9_
  
  - [ ] T12.6 Add format eligibility rules editor
    - Visual editor for flavourType → formatCategories mapping
    - Drag-and-drop or checkbox interface
    - Save to settings.formatEligibilityRules
    - _Requirements: 0.16_

### Phase 8: Testing & Documentation

- [ ] T13. Comprehensive Testing
  - [ ] T13.1 Write E2E tests for taxonomy management
    - Test full workflow: add → use → archive → delete
    - Test inline creation from forms
    - Test validation prevents duplicates and unsafe deletes
    - _Requirements: 0.4, 0.5, 0.6, 0.9, 0.10_
  
  - [ ] T13.2 Write E2E tests for component replacement
    - Test all forms use TaxonomySelect
    - Test inline creation works in all forms
    - Test archived values don't appear
    - _Requirements: 0.3, 0.17, 0.18, 0.19_
  
  - [ ] T13.3 Write E2E tests for dynamic eligibility
    - Test changing eligibility rules affects validation
    - Test adding new flavour type works end-to-end
    - _Requirements: 0.16_

- [ ] T14. Documentation
  - [ ] T14.1 Create taxonomy management user guide
    - Document how to add new categories
    - Document inline creation workflow
    - Document archiving vs deleting
    - _Requirements: 0.1, 0.2, 0.7, 0.8_
  
  - [ ] T14.2 Update developer documentation
    - Document TaxonomySelect component API
    - Document settings data model
    - Document migration from hardcoded to dynamic
    - _Requirements: 0.17, 0.20_

### Phase 9: Migration & Rollout

- [ ] T15. Data Migration
  - [ ] T15.1 Create migration script for existing data
    - Ensure all existing category/type values are in settings.json
    - Validate no data loss
    - Create backup before migration
    - _Requirements: 0.1, 0.2, 0.15_
  
  - [ ] T15.2 Test migration in development
    - Run migration on dev data
    - Verify all forms still work
    - Verify all existing data displays correctly
    - _Requirements: 0.15_
  
  - [ ] T15.3 Deploy to production
    - Run migration script
    - Monitor for errors
    - Verify taxonomy management works
    - _Requirements: 0.15_

## Checkpoint Tasks

- [ ] Checkpoint 1: After Phase 3 (API Complete)
  - Verify all API endpoints work
  - Verify validation prevents bad data
  - Run all integration tests

- [ ] Checkpoint 2: After Phase 5 (Components Replaced)
  - Verify all forms use TaxonomySelect
  - Verify inline creation works everywhere
  - Test with real data

- [ ] Checkpoint 3: After Phase 7 (Management UI Complete)
  - Verify taxonomy management interface works
  - Test reordering, archiving, deleting
  - Verify usage validation works

- [ ] Checkpoint 4: After Phase 9 (Migration Complete)
  - Verify no data loss
  - Verify all features work with dynamic taxonomies
  - Run full test suite

## Notes

- Follow existing component patterns (BaseStyleSelector, FlavourIngredientSelector)
- Use consistent styling with Tailwind CSS
- Maintain backward compatibility during transition
- Test thoroughly before deploying to production
- Document all changes for future maintainers

## Estimated Effort

- Phase 1-3 (Foundation): 2-3 days
- Phase 4-5 (Components): 3-4 days
- Phase 6 (Dynamic Eligibility): 1-2 days
- Phase 7 (Management UI): 2-3 days
- Phase 8-9 (Testing & Migration): 2-3 days

**Total: 10-15 days**


---

## Phase 10: Quick-Create Products from Launch

### Overview

Implement the quick-create products feature that allows admins to efficiently create multiple products from a launch's featured flavours without manually creating each one.

### Tasks

- [ ] T16. Quick-Create API Endpoint
  - [ ] T16.1 Create app/api/launches/[id]/quick-create-products/route.ts
    - Implement POST handler
    - Accept flavourIds, formatIds, commonFields
    - Validate flavour type compatibility with formats
    - Generate product combinations (flavour × format)
    - Create products using same logic as POST /api/products
    - Auto-generate internalName and publicName
    - Set all products to "draft" status by default
    - Add created product IDs to launch.featuredProductIds
    - Update launch via PUT /api/launches/[id]
    - Return createdProducts, updatedLaunch, and any errors
    - _Requirements: 22.1, 22.4, 22.5, 22.6, 22.7, 22.8, 22.9, 22.10, 22.11, 22.14_
  
  - [ ] T16.2 Write integration tests for quick-create endpoint
    - Test creating products from single flavour + multiple formats
    - Test creating products from multiple flavours + single format
    - Test creating products from multiple flavours + multiple formats
    - Test validation rejects incompatible flavour types
    - Test auto-generated names are correct
    - Test products are added to launch.featuredProductIds
    - Test all products have "draft" status
    - _Requirements: 22.14_

- [ ] T17. Quick-Create Modal Component
  - [ ] T17.1 Create app/admin/components/QuickCreateProductsModal.tsx
    - Modal triggered by "Quick Create Products" button
    - Step 1: Flavour selection (checkboxes for launch.featuredFlavourIds)
    - Step 2: Format selection (reuse FormatSelector component)
    - Step 3: Preview grid showing all combinations
    - Step 4: Bulk details form (status, price, tags, location, etc.)
    - Step 5: Creation progress and success message
    - Allow removing individual combinations from preview
    - Show validation errors inline
    - Display success modal with links to edit products
    - _Requirements: 22.2, 22.3, 22.4, 22.6, 22.12, 22.13, 22.15_
  
  - [ ] T17.2 Implement flavour type compatibility filtering
    - Filter formats based on selected flavour types
    - Show only formats compatible with ALL selected flavours
    - Display warning if no compatible formats available
    - _Requirements: 22.5_
  
  - [ ] T17.3 Implement preview grid
    - Display format + flavour combinations
    - Show auto-generated product names
    - Allow removing individual combinations
    - Show validation status for each combination
    - _Requirements: 22.6, 22.8, 22.9_
  
  - [ ] T17.4 Implement bulk details form
    - Form fields: status, price, tags, location, onlineOrderable, pickupOnly
    - Default status to "draft"
    - Apply same values to all products
    - _Requirements: 22.10, 22.13_

- [ ] T18. Launch Edit Page Integration
  - [ ] T18.1 Add "Quick Create Products" button to app/admin/launches/[id]/page.tsx
    - Display button in featured products section
    - Only show if launch has featuredFlavourIds
    - Open QuickCreateProductsModal on click
    - _Requirements: 22.1_
  
  - [ ] T18.2 Refresh launch data after quick-create completes
    - Reload launch.featuredProductIds
    - Display newly created products in featured products list
    - Show success toast notification
    - _Requirements: 22.11, 22.12_

- [ ] T19. Name Generation Logic
  - [ ] T19.1 Add generateProductName function to lib/validation.ts
    - Generate internalName: "{format.name} - {flavour.name}"
    - Generate publicName: "{flavour.name} {format.name}"
    - Handle twist format: "{flavour1.name} + {flavour2.name} Twist"
    - Handle sandwich format: "{filling.name} {cookie.name} Sandwich"
    - _Requirements: 22.8, 22.9_
  
  - [ ] T19.2 Write unit tests for name generation
    - Test single flavour + format
    - Test twist format with two flavours
    - Test sandwich format with filling + components
    - Test special characters and edge cases
    - _Requirements: 22.8, 22.9_

- [ ] T20. Bulk Edit Products Feature (Optional Enhancement)
  - [ ] T20.1 Add bulk edit modal for quick-created products
    - Select multiple products from success modal
    - Edit common fields (price, status, tags)
    - Apply changes to all selected products
    - _Requirements: 22.13_
  
  - [ ] T20.2 Write integration tests for bulk edit
    - Test editing multiple products at once
    - Test validation for bulk updates
    - _Requirements: 22.13_

- [ ] T21. Testing & Documentation
  - [ ] T21.1 Write E2E tests for quick-create workflow
    - Test full workflow: select flavours → select formats → preview → create
    - Test validation prevents invalid combinations
    - Test products are created with correct data
    - Test products are added to launch
    - _Requirements: 22.14, 22.15_
  
  - [ ] T21.2 Write user documentation
    - Document quick-create workflow
    - Document name generation rules
    - Document validation rules
    - Add screenshots and examples
    - _Requirements: 22.15_

### Checkpoint: After Phase 10

- [ ] Verify "Quick Create Products" button appears on launch edit page
- [ ] Verify modal workflow works end-to-end
- [ ] Verify products are created with correct data
- [ ] Verify products are added to launch.featuredProductIds
- [ ] Verify validation prevents invalid combinations
- [ ] Run all integration and E2E tests

### Updated Estimated Effort

- Phase 1-3 (Foundation): 2-3 days
- Phase 4-5 (Components): 3-4 days
- Phase 6 (Dynamic Eligibility): 1-2 days
- Phase 7 (Management UI): 2-3 days
- Phase 8-9 (Testing & Migration): 2-3 days
- Phase 10 (Quick-Create Products): 2-3 days

**Total: 12-18 days**
