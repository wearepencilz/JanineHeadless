# Shopify ↔ CMS Product Linking

## Overview

This document explains how to link Shopify products with your CMS flavours for a seamless integration between commerce and content.

## Architecture

### Current Implementation

**CMS → Shopify (One Direction)**
- Flavours store `shopifyProductHandle` field
- Admin UI allows selecting Shopify products when creating/editing flavours
- API endpoint `/api/shopify/products` fetches available products

### Recommended Full Implementation

**Bidirectional Linking via Metafields**

1. **CMS stores Shopify reference:**
   - `shopifyProductHandle` (string) - Product handle for URL linking
   - `shopifyProductId` (string) - Product GID for API operations

2. **Shopify stores CMS reference (via metafields):**
   - `custom.flavour_id` - Links to CMS flavour ID
   - `custom.batch_ids` - JSON array of batch IDs

## Setup Instructions

### 1. Add Metafield Definitions in Shopify Admin

Navigate to: **Settings → Custom Data → Products**

Add these metafield definitions:

```
Name: Flavour ID
Namespace and key: custom.flavour_id
Type: Single line text
Description: Links this product to a CMS flavour
```

```
Name: Batch IDs
Namespace and key: custom.batch_ids
Type: JSON
Description: Array of test kitchen batch IDs for this flavour
```

### 2. Update Shopify GraphQL Query

Add the new metafields to your product query in `lib/shopify/queries/product.ts`:

```graphql
metafields(identifiers: [
  { namespace: "custom", key: "flavour_id" }
  { namespace: "custom", key: "batch_ids" }
  # ... existing metafields
]) {
  namespace
  key
  value
  type
}
```

### 3. Sync Metafields When Linking

When a flavour is linked to a Shopify product in the CMS, you can optionally sync the metafield back to Shopify using the Admin API.

**Note:** This requires Shopify Admin API access (not Storefront API). You'll need:
- Admin API access token
- `write_products` scope

Example sync function:

```typescript
async function syncFlavourToShopify(flavourId: string, productId: string) {
  const adminApiUrl = `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/graphql.json`;
  
  const mutation = `
    mutation UpdateProductMetafield($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          id
          metafields(first: 10) {
            edges {
              node {
                namespace
                key
                value
              }
            }
          }
        }
      }
    }
  `;

  const variables = {
    input: {
      id: productId,
      metafields: [
        {
          namespace: "custom",
          key: "flavour_id",
          value: flavourId,
          type: "single_line_text_field"
        }
      ]
    }
  };

  const response = await fetch(adminApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_ACCESS_TOKEN!,
    },
    body: JSON.stringify({ query: mutation, variables }),
  });

  return response.json();
}
```

## Usage Patterns

### Display Flavour Archive on Product Pages

```typescript
// app/products/[handle]/page.tsx
import { getProduct } from '@/lib/shopify';

export default async function ProductPage({ params }: { params: { handle: string } }) {
  const product = await getProduct(params.handle);
  
  // Get flavour ID from metafield
  const flavourId = product.metafields?.find(
    (m) => m.key === 'flavour_id'
  )?.value;
  
  // Fetch flavour data from CMS
  const flavour = flavourId 
    ? await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/flavours/${flavourId}`).then(r => r.json())
    : null;
  
  return (
    <div>
      {/* Product info */}
      
      {flavour && (
        <section>
          <h2>About This Flavour</h2>
          <p>{flavour.story}</p>
          <p>Tasting Notes: {flavour.tastingNotes}</p>
          {/* Display ingredients, batches, etc. */}
        </section>
      )}
    </div>
  );
}
```

### Link from Flavour Archive to Shop

```typescript
// Public flavour archive page
export default function FlavourArchivePage() {
  const flavours = await fetch('/api/flavours').then(r => r.json());
  
  return (
    <div>
      {flavours.map((flavour) => (
        <div key={flavour.id}>
          <h3>{flavour.name}</h3>
          <p>{flavour.description}</p>
          
          {flavour.shopifyProductHandle && (
            <Link href={`/products/${flavour.shopifyProductHandle}`}>
              Buy Now
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
```

## Alternative: Shopify App

If you need more advanced integration, you could build a Shopify app that:

1. **Embeds in Shopify Admin** - Add a CMS panel directly in product pages
2. **Webhooks** - Auto-sync when products are created/updated
3. **App Bridge** - Seamless navigation between Shopify and CMS

**Pros:**
- Native Shopify admin experience
- Real-time sync via webhooks
- Better UX for merchants

**Cons:**
- More complex to build and maintain
- Requires app hosting and OAuth flow
- Shopify app review process

**Recommendation:** Start with metafields (current implementation). Build a Shopify app only if you need real-time sync or plan to distribute to other merchants.

## Current Status

✅ CMS can link to Shopify products (one-way)
✅ Admin UI for selecting products
✅ API endpoint to fetch Shopify products
⏳ Shopify metafields (manual setup required)
⏳ Bidirectional sync (optional, requires Admin API)
⏳ Public flavour archive pages
⏳ Product page flavour integration

## Next Steps

1. Add metafield definitions in Shopify admin
2. Update product query to include new metafields
3. Create public flavour archive pages
4. Integrate flavour content into product pages
5. (Optional) Build Admin API sync for automatic metafield updates
