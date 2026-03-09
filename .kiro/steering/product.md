# Product Overview

Janine is a Next.js-based artisan ice cream shop platform that acts as:
1. A digital extension of the shop
2. A living archive of flavours and ingredients
3. A community layer through Golden Spoon membership
4. A test kitchen interface for experimentation

**Brand Philosophy:** Like Flamingo Estate + Noma Projects + Seasonal Gelato Shop

> Commerce is important. But the archive of flavour experimentation becomes the real brand asset.

## User Groups

- **Public visitors**: Explore flavours, ingredients, stories; order ahead; engage with brand
- **Golden Spoon members**: Loyalty benefits, early access, exclusive products, events
- **Administrators**: Manage flavour archive, ingredients, batches, stories, relationships
- **Test Kitchen**: Document experiments, track batches, iterate recipes

## Core Features

### 1. Shop (Shopify-Powered)
- Seasonal products (ice cream, chocolate, merch, pantry)
- Click & Collect / Skip the Line ordering
- Subscriptions and build-your-box
- Gift sets and bundles
- Golden Spoon exclusive products

### 2. Flavour Archive
- Complete flavour history and documentation
- Ingredient relationships (core + all)
- Batch tracking and iterations
- Tasting notes and ratings
- Collaborator credits
- Seasonal and archived flavours
- "In the making" process photos

### 3. Ingredient Directory
- Provenance storytelling (inspired by Ffern, Noma)
- Origin and sourcing details
- Tasting notes and characteristics
- Used in flavours (linked)
- Seasonal availability
- Farm and supplier information

### 4. Stories (Editorial Layer)
- Founders and ethos
- Collaborations (chefs, artists, farms)
- Journal and updates
- Events and tastings
- Test kitchen behind-the-scenes
- Heritage and craft

### 5. Golden Spoon (Loyalty)
- Membership tiers and benefits
- Points tracking and redemption
- Referral system
- Early access to drops
- Exclusive tasting events
- Flavour ratings and favourites

### 6. Test Kitchen & Batch Tracking
- Experiment documentation
- Batch iterations and notes
- Recipe evolution
- Internal decision-making
- Process photography

## Authentication

Default CMS credentials: `admin` / `admin123`

## System Architecture

### Hybrid: Shopify + Headless CMS

**Shopify** handles:
- Products, inventory, checkout
- Bundles and subscriptions
- Order fulfillment

**Headless CMS** (Sanity/Contentful/Strapi) handles:
- Ingredients library
- Flavour archive
- Batch tracking
- Stories and editorial
- Collaborators and farms
- Tasting notes

**Next.js API Routes** handle:
- Shopify ↔ CMS relationship mapping
- Golden Spoon membership logic
- Flavour ratings aggregation
- QR code generation
- Click & Collect scheduling

## Data Storage

### Development
- JSON files in `/public/data/` (CMS fallback)
- Local file uploads in `/public/uploads/`

### Production
- Headless CMS for content
- Vercel KV for session/cache
- Vercel Blob for image uploads
- Shopify for product catalog and e-commerce

## Key Relationships

- **Ingredient → Flavour** - One ingredient used in many flavours
- **Flavour → Batch** - One flavour has many batch iterations
- **Flavour → Shopify Product** - CMS flavour linked to Shopify product(s)
- **Story → Flavour/Ingredient** - Editorial content linked to products
- **Collaborator → Flavour** - Track partnerships and collaborations
