---
title: Janine Testing Strategy
inclusion: auto
---

# Janine Testing Strategy

## Testing Philosophy

All CMS operations must be tested to ensure:
- Data integrity
- Relationship consistency
- Shopify sync reliability
- User experience quality

## CMS Testing Requirements

### 1. Save Patterns

Test all CRUD operations for each content type.

#### Ingredients
```typescript
describe('Ingredient CRUD', () => {
  test('Create ingredient with all fields')
  test('Create ingredient with minimal fields')
  test('Update ingredient details')
  test('Update ingredient images')
  test('Delete ingredient (check flavour relationships)')
  test('Prevent delete if used in active flavours')
})
```

#### Flavours
```typescript
describe('Flavour CRUD', () => {
  test('Create flavour with ingredient relationships')
  test('Update flavour status (active → archived)')
  test('Link flavour to Shopify product')
  test('Add batch to flavour')
  test('Update ingredient list')
  test('Delete flavour (cascade to batches)')
})
```

#### Batches
```typescript
describe('Batch CRUD', () => {
  test('Create batch with ingredient ratios')
  test('Update batch notes and decision')
  test('Link batch to flavour')
  test('Upload process photos')
  test('Delete batch')
})
```

#### Stories
```typescript
describe('Story CRUD', () => {
  test('Create story with rich text content')
  test('Link story to flavours and ingredients')
  test('Upload featured image and gallery')
  test('Publish and unpublish story')
  test('Update story content')
  test('Delete story')
})
```

### 2. Relationship Testing

Test all entity relationships.

#### Ingredient → Flavour
```typescript
describe('Ingredient-Flavour Relationships', () => {
  test('Link ingredient to flavour')
  test('Remove ingredient from flavour')
  test('View all flavours using ingredient')
  test('Update ingredient affects all linked flavours')
  test('Cannot delete ingredient used in active flavours')
})
```

#### Flavour → Shopify Product
```typescript
describe('Flavour-Shopify Relationships', () => {
  test('Link flavour to Shopify product by ID')
  test('Link flavour to Shopify product by handle')
  test('Sync Shopify product data to flavour')
  test('Update Shopify product reflects in flavour')
  test('Handle deleted Shopify products gracefully')
  test('One flavour can link to multiple products (pint, soft serve)')
})
```

#### Flavour → Batch
```typescript
describe('Flavour-Batch Relationships', () => {
  test('Create batch for flavour')
  test('View all batches for flavour')
  test('Set current batch for flavour')
  test('Batch history tracking')
  test('Delete flavour cascades to batches')
})
```

#### Story → Flavour/Ingredient
```typescript
describe('Story Relationships', () => {
  test('Link story to multiple flavours')
  test('Link story to multiple ingredients')
  test('View all stories for flavour')
  test('View all stories for ingredient')
  test('Remove relationship without deleting entities')
})
```

### 3. Shopify Integration Testing

Test Shopify ↔ CMS synchronization.

```typescript
describe('Shopify Sync', () => {
  test('Fetch products from Shopify')
  test('Create flavour from Shopify product')
  test('Update flavour when Shopify product changes')
  test('Handle Shopify product deletion')
  test('Sync product images')
  test('Sync product variants')
  test('Map Shopify collections to flavour categories')
})
```

### 4. Data Validation Testing

Test required fields and formats.

```typescript
describe('Data Validation', () => {
  // Ingredients
  test('Ingredient requires name')
  test('Ingredient origin is required')
  test('Ingredient category must be valid enum')
  
  // Flavours
  test('Flavour requires name and description')
  test('Flavour must have at least one ingredient')
  test('Flavour status must be valid enum')
  test('Batch ID follows format (e.g., SC-BOCD-1007A)')
  
  // Batches
  test('Batch requires flavour ID')
  test('Batch requires date')
  test('Batch decision must be valid enum')
  
  // Stories
  test('Story requires title and content')
  test('Story category must be valid enum')
  test('Story slug is unique')
})
```

### 5. Image Upload Testing

Test media handling.

```typescript
describe('Image Uploads', () => {
  test('Upload ingredient image')
  test('Upload flavour product photo')
  test('Upload "in the making" process photos')
  test('Upload story featured image')
  test('Upload batch documentation photos')
  test('Validate image formats (JPEG, PNG, WebP)')
  test('Validate image size limits')
  test('Generate thumbnails')
  test('Delete image removes from storage')
})
```

### 6. QR Code Testing

Test QR code generation and scanning.

```typescript
describe('QR Code System', () => {
  test('Generate QR for flavour')
  test('Generate QR for ingredient')
  test('Generate QR for story')
  test('QR code links to correct page')
  test('Download QR as PNG')
  test('Download QR as SVG')
  test('QR code is scannable')
  test('QR code redirects correctly')
})
```

## Integration Testing

### Golden Spoon System
```typescript
describe('Golden Spoon Integration', () => {
  test('User earns points on purchase')
  test('User earns points on rating')
  test('User earns points on referral')
  test('User redeems points for product')
  test('Referral code generation')
  test('Referral tracking')
  test('Early access to drops')
  test('Member-exclusive products visibility')
})
```

### Flavour Rating System
```typescript
describe('Flavour Ratings', () => {
  test('User rates flavour')
  test('User updates rating')
  test('Calculate average rating')
  test('Track total ratings count')
  test('User can view their ratings')
  test('User can mark favourites')
  test('Track flavours tried')
})
```

### Click & Collect
```typescript
describe('Click & Collect', () => {
  test('User selects pickup time')
  test('User places order')
  test('Order appears in admin')
  test('Order status updates')
  test('User receives confirmation')
  test('User can view order in account')
})
```

## E2E Testing

### Shop Flow
```typescript
describe('Shop E2E', () => {
  test('Browse products')
  test('View product details with flavour info')
  test('Add to cart')
  test('Update cart quantity')
  test('Checkout')
  test('Order confirmation')
})
```

### Archive Browsing
```typescript
describe('Archive E2E', () => {
  test('Browse all flavours')
  test('Filter by season')
  test('Filter by ingredient')
  test('Search flavours')
  test('View flavour detail page')
  test('View ingredient detail page')
  test('Navigate to related flavours')
})
```

### Account Management
```typescript
describe('Account E2E', () => {
  test('User registration')
  test('User login')
  test('View profile')
  test('View order history')
  test('View saved flavours')
  test('View loyalty points')
  test('Update preferences')
})
```

## Performance Testing

### Load Testing
- Test CMS with 1000+ flavours
- Test ingredient directory with 500+ ingredients
- Test batch tracking with 5000+ batches
- Test concurrent admin users

### API Performance
- Test Shopify API response times
- Test CMS API query performance
- Test image upload speeds
- Test QR code generation speed

## Accessibility Testing

### WCAG Compliance
- Keyboard navigation
- Screen reader compatibility
- Color contrast ratios
- Alt text for images
- Form labels and errors
- Focus indicators

## Security Testing

### Authentication
- Test admin login
- Test session management
- Test password requirements
- Test unauthorized access prevention

### Data Protection
- Test input sanitization
- Test XSS prevention
- Test CSRF protection
- Test API rate limiting

## Test Data

### Seed Data Requirements
- 50+ ingredients with full details
- 100+ flavours with relationships
- 200+ batches with iterations
- 20+ stories with links
- 10+ collaborators
- Sample Shopify products

### Test Scenarios
- New seasonal flavour launch
- Archived flavour return
- Ingredient substitution
- Batch iteration workflow
- Golden Spoon member journey
- Click & Collect order flow

## Continuous Testing

### Pre-commit Hooks
- Run unit tests
- Run linting
- Check TypeScript types

### CI/CD Pipeline
- Run all unit tests
- Run integration tests
- Run E2E tests (critical paths)
- Check test coverage (target: 80%+)
- Deploy to staging
- Run smoke tests

### Monitoring
- Track API error rates
- Monitor Shopify sync failures
- Track image upload failures
- Monitor QR code generation
- Track user rating submissions
