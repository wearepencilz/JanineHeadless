# Shopify Sync Strategy for Headless Architecture

## Overview

Janine uses a **headless CMS architecture** where the CMS is the source of truth for all product data, and Shopify is used purely for checkout and order management. This document outlines what data is synced to Shopify and what remains in the CMS.

## Core Principle

**Store minimal data in Shopify, compute everything else from CMS data.**

The CMS maintains rich relational data (flavours, ingredients, formats, modifiers), while Shopify stores only what's necessary for checkout and basic product display.

---

## What Gets Synced to Shopify

### 1. Basic Product Information
- **Title**: Auto-generated from flavours and format (e.g., "Vanilla & Chocolate - Twist")
- **Description HTML**: Rich description including flavour details
- **Price**: Base price in dollars
- **Compare At Price**: Original price for sales/discounts
- **Status**: ACTIVE or DRAFT
- **Product Type**: Format category (e.g., "frozen", "food")
- **Vendor**: "Janine"

### 2. Variants
- **Price**: Variant-specific pricing
- **SKU**: Product slug or ID for inventory tracking
- **Inventory**: Quantity and location (if tracked)

### 3. Images
- **Featured Image**: Product or flavour image
- **Alt Text**: Accessibility description

### 4. Tags (for Shopify search/filtering)
- Format name (e.g., "Twist", "Scoop", "Sandwich")
- Flavour types (e.g., "gelato", "sorbet")
- Allergens (e.g., "dairy", "gluten", "tree-nuts")
- Dietary claims (e.g., "vegan", "gluten-free")
- Custom tags from CMS (e.g., "seasonal", "limited", "collab")

### 5. Metafields (CMS References)

Metafields link Shopify products back to CMS data:

```typescript
{
  namespace: 'janine',
  key: 'product_id',
  value: 'uuid-123',
  type: 'single_line_text_field'
}

{
  namespace: 'janine',
  key: 'format_id',
  value: 'format-uuid',
  type: 'single_line_text_field'
}

{
  namespace: 'janine',
  key: 'flavour_ids',
  value: '["flavour-1", "flavour-2"]',
  type: 'json'
}

{
  namespace: 'janine',
  key: 'modifier_ids',
  value: '["modifier-1", "modifier-2"]',
  type: 'json'
}
```

---

## What Stays in the CMS

### 1. Relational Data
- **Flavour → Ingredient relationships**: Which ingredients are in each flavour
- **Ingredient details**: Origin, provenance, supplier, farm, tasting notes
- **Format rules**: Eligibility rules, min/max flavours, serving style
- **Modifier availability**: Which modifiers work with which formats

### 2. Computed Data
- **Allergens**: Computed from ingredients and modifiers
- **Dietary claims**: Computed from ingredient facts (animalDerived, vegetarian)
- **Seasonal availability**: Based on ingredient availability months
- **Ingredient provenance**: Stories, farms, suppliers

### 3. Editorial Content
- **Flavour stories**: Narrative content about flavour creation
- **Ingredient stories**: Provenance and sourcing stories
- **Tasting notes**: Detailed flavour profiles
- **Collaborator credits**: Chef/artist partnerships

### 4. Admin Metadata
- **Internal names**: Admin reference names
- **Sort orders**: Display ordering in CMS
- **Featured flags**: Admin highlighting
- **Batch tracking**: Test kitchen iterations

---

## Sync Workflow

### Creating a New Shopify Product

1. **User clicks "Create New Shopify Product"** in CMS
2. **CMS validates** product has:
   - Valid price > $0
   - Format assigned
   - At least one flavour
3. **CMS computes** allergens and dietary claims from ingredients
4. **CMS generates** product title, description, and tags
5. **CMS calls Shopify API** to create product with:
   - Basic info (title, description, price)
   - Computed tags (allergens, dietary, format)
   - Metafields (CMS references)
6. **Shopify returns** product ID and handle
7. **CMS stores** Shopify ID and handle for future syncs
8. **Sync status** set to "synced"

### Updating an Existing Shopify Product

When product data changes in CMS:

1. **User saves changes** in CMS
2. **CMS detects** product is linked to Shopify
3. **CMS recomputes** allergens, dietary claims, tags
4. **CMS calls Shopify API** to update:
   - Title (if flavours changed)
   - Description (if content changed)
   - Price (if price changed)
   - Tags (if allergens/dietary changed)
   - Images (if image changed)
5. **Sync status** updated to "synced" or "failed"

### Unlinking a Product

1. **User clicks "Unlink"** in CMS
2. **CMS removes** Shopify ID and handle
3. **Shopify product remains** in Shopify (not deleted)
4. **Product can be re-linked** later if needed

---

## Data Flow Examples

### Example 1: Twist Product

**CMS Data:**
```json
{
  "id": "product-123",
  "formatId": "format-twist",
  "primaryFlavourIds": ["vanilla-gelato", "chocolate-gelato"],
  "price": 700
}
```

**Computed in CMS:**
- Allergens: ["dairy", "egg"] (from ingredients)
- Dietary claims: ["vegetarian", "gluten-free"]
- Title: "Vanilla & Chocolate - Twist"

**Synced to Shopify:**
```json
{
  "title": "Vanilla & Chocolate - Twist",
  "descriptionHtml": "<h2>Vanilla & Chocolate - Twist</h2>...",
  "productType": "frozen",
  "vendor": "Janine",
  "tags": ["Twist", "gelato", "dairy", "egg", "vegetarian", "gluten-free"],
  "variants": [{ "price": "7.00", "sku": "product-123" }],
  "metafields": [
    { "namespace": "janine", "key": "product_id", "value": "product-123" },
    { "namespace": "janine", "key": "format_id", "value": "format-twist" },
    { "namespace": "janine", "key": "flavour_ids", "value": "[\"vanilla-gelato\",\"chocolate-gelato\"]" }
  ]
}
```

**Displayed on Storefront:**
- Fetch product from Shopify (for checkout)
- Fetch rich data from CMS using metafields
- Display ingredient provenance, allergen details, flavour stories from CMS
- Use Shopify for "Add to Cart" and checkout

### Example 2: Sandwich with Modifiers

**CMS Data:**
```json
{
  "id": "product-456",
  "formatId": "format-sandwich",
  "primaryFlavourIds": ["pistachio-gelato"],
  "toppingIds": ["hot-fudge", "sprinkles"],
  "price": 1200
}
```

**Computed in CMS:**
- Allergens: ["dairy", "tree-nuts", "soy"] (from gelato + modifiers)
- Dietary claims: ["vegetarian"]
- Title: "Pistachio - Sandwich"

**Synced to Shopify:**
```json
{
  "title": "Pistachio - Sandwich",
  "tags": ["Sandwich", "gelato", "dairy", "tree-nuts", "soy", "vegetarian"],
  "metafields": [
    { "namespace": "janine", "key": "product_id", "value": "product-456" },
    { "namespace": "janine", "key": "modifier_ids", "value": "[\"hot-fudge\",\"sprinkles\"]" }
  ]
}
```

---

## Benefits of This Approach

### 1. Single Source of Truth
- CMS owns all product data
- Shopify is just a checkout layer
- No data duplication or sync conflicts

### 2. Rich Relational Data
- Maintain complex ingredient relationships
- Track provenance and sourcing
- Compute allergens dynamically

### 3. Flexibility
- Change ingredients without touching Shopify
- Update allergen rules in one place
- Add new dietary claims without migration

### 4. Performance
- Shopify handles checkout and payments
- CMS handles product display and filtering
- Metafields enable fast lookups

### 5. Minimal Shopify Dependency
- Can switch commerce platforms easily
- CMS data is portable
- Shopify is just an ID reference

---

## Implementation Status

### ✅ Completed
- Product creation with Shopify sync
- Metafield storage for CMS references
- Allergen computation from ingredients
- Dietary claim computation
- Product composition display in CMS

### 🚧 In Progress
- Modifier allergen computation
- Sync status indicators
- Update sync (when product changes)

### 📋 TODO
- Automatic sync on product save
- Sync queue for batch updates
- Webhook handling for Shopify changes
- Image sync to Shopify
- Variant management for sizes/options

---

## API Endpoints

### Create Shopify Product
```
POST /api/products/{id}/create-shopify-product
```

Creates a new Shopify product from CMS data.

**Response:**
```json
{
  "success": true,
  "shopifyProduct": {
    "id": "gid://shopify/Product/123",
    "handle": "vanilla-chocolate-twist",
    "title": "Vanilla & Chocolate - Twist"
  },
  "offering": { /* updated offering with Shopify IDs */ }
}
```

### Update Shopify Product (TODO)
```
PUT /api/products/{id}/sync-to-shopify
```

Updates an existing Shopify product with latest CMS data.

### Unlink Shopify Product
```
DELETE /api/products/{id}/shopify-link
```

Removes Shopify link from CMS (doesn't delete from Shopify).

---

## Best Practices

### 1. Always Compute, Never Store
- Don't store allergens in Shopify metafields
- Compute from ingredients on every sync
- Ensures data is always accurate

### 2. Use Metafields for References Only
- Store IDs, not full objects
- Fetch full data from CMS when needed
- Keeps Shopify data minimal

### 3. Sync Strategically
- Sync on product creation
- Sync on major changes (price, flavours)
- Don't sync on every edit (too many API calls)

### 4. Handle Sync Failures Gracefully
- Store sync status and error messages
- Allow manual retry
- Don't block CMS edits if sync fails

### 5. Keep Shopify Simple
- Use Shopify for what it's good at (checkout)
- Use CMS for what it's good at (content)
- Don't try to replicate CMS in Shopify

---

## Future Enhancements

### 1. Automatic Sync
- Sync on product save (with debouncing)
- Background job queue for reliability
- Webhook handling for Shopify → CMS updates

### 2. Image Management
- Upload images to Shopify on sync
- Sync flavour images as product images
- Handle multiple images per product

### 3. Variant Management
- Support size variants (small, medium, large)
- Sync modifier options as variants
- Handle variant-specific pricing

### 4. Inventory Sync
- Two-way inventory sync
- Real-time stock updates
- Low stock alerts in CMS

### 5. Order Integration
- Fetch orders from Shopify
- Display in CMS for fulfillment
- Track which products are selling

---

## Conclusion

This headless architecture gives us the best of both worlds:
- **Shopify**: Reliable checkout, payments, and order management
- **CMS**: Rich product data, relationships, and editorial control

By keeping Shopify minimal and computing everything from CMS data, we maintain flexibility and avoid data duplication while still leveraging Shopify's powerful commerce features.
