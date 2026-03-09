---
title: Janine Technical Architecture
inclusion: auto
---

# Janine Technical Architecture

## System Architecture

### Hybrid Approach: Shopify + Headless CMS

**Shopify** handles:
- Products (ice cream, chocolate, merch, pantry)
- Inventory management
- Checkout and payments
- Bundles and subscriptions
- Pricing and variants
- Order fulfillment

**Headless CMS** handles:
- Ingredients library
- Flavour archive
- Batch tracking
- Stories and editorial
- Team members and collaborators
- Farms and suppliers
- Tasting notes
- Golden Spoon content

### Why This Split?

- **Richer relational data** - CMS allows complex relationships between flavours, ingredients, batches, collaborators
- **Easier archive management** - Flavour history isn't tied to commerce lifecycle
- **Editorial flexibility** - Stories and content independent of product catalog
- **Experimentation workflow** - Test kitchen and batch tracking separate from live products

## Data Model

### Core Entities

#### Ingredient
```typescript
interface Ingredient {
  id: string;
  name: string;
  latinName?: string;
  origin: string; // e.g., "Sicily", "Jersey"
  category: "base" | "flavor" | "mix-in" | "topping" | "spice";
  
  // Storytelling
  story: string;
  tastingNotes: string[];
  
  // Sourcing
  supplier?: string;
  farm?: string;
  seasonal: boolean;
  availableMonths?: number[];
  
  // Media
  images: string[];
  processingPhotos?: string[]; // "in the making" photos
  
  // Allergens
  allergens: string[];
  
  // Relationships
  usedInFlavours: string[]; // Flavour IDs
  relatedStories: string[]; // Story IDs
}
```

#### Flavour
```typescript
interface Flavour {
  id: string;
  name: string;
  description: string;
  
  // Ingredients
  coreIngredients: string[]; // 2-3 main ingredient IDs
  allIngredients: string[]; // Complete ingredient list IDs
  
  // Classification
  categories: string[]; // e.g., "citrus", "chocolate", "floral"
  tastingNotes: string[];
  
  // Timeline
  seasonReleased: string; // e.g., "Spring 2026"
  releaseDate: Date;
  
  // Availability
  status: "active" | "seasonal" | "archived" | "test-kitchen" | "coming-soon";
  availableAs: ("soft-serve" | "pint" | "affogato")[];
  
  // Collaboration
  collaborators?: {
    type: "chef" | "artist" | "farm" | "restaurant";
    name: string;
    id: string;
  }[];
  
  // Batches
  batches: string[]; // Batch IDs
  currentBatch?: string;
  
  // Shopify Link
  shopifyProductId?: string;
  shopifyHandle?: string;
  
  // Media
  images: string[];
  makingPhotos?: string[];
  
  // Community
  averageRating?: number;
  totalRatings: number;
  
  // Relationships
  relatedStories: string[];
}
```

#### Batch
```typescript
interface Batch {
  id: string; // e.g., "SC-BOCD-1007A"
  flavourId: string;
  
  // Metadata
  date: Date;
  batchNumber: string;
  type: "soft-serve" | "pint" | "test";
  
  // Recipe
  ingredients: {
    ingredientId: string;
    amount: string;
    ratio?: string;
  }[];
  
  // Process
  notes: string;
  processingNotes?: string;
  temperature?: string;
  technique?: string;
  
  // Evaluation
  rating?: number;
  tastingNotes?: string[];
  finalDecision: "approved" | "needs-adjustment" | "rejected" | "testing";
  adjustments?: string;
  
  // Team
  createdBy: string;
  testedBy?: string[];
  
  // Media
  photos?: string[];
}
```

#### Story
```typescript
interface Story {
  id: string;
  title: string;
  slug: string;
  
  // Content
  content: string; // Rich text
  excerpt: string;
  
  // Classification
  category: "founders" | "ethos" | "collaboration" | "journal" | "event" | "test-kitchen" | "heritage";
  
  // Relationships
  relatedFlavours: string[];
  relatedIngredients: string[];
  collaborators?: string[];
  
  // Media
  featuredImage: string;
  gallery?: string[];
  
  // Publishing
  publishedAt: Date;
  author: string;
}
```

#### Golden Spoon Member
```typescript
interface GoldenSpoonMember {
  userId: string;
  
  // Membership
  tier: "standard" | "premium";
  joinedAt: Date;
  expiresAt?: Date;
  
  // Points
  points: number;
  lifetimePoints: number;
  
  // Benefits
  benefits: string[];
  earlyAccess: boolean;
  
  // Activity
  flavoursTried: string[];
  favouriteFlavours: string[];
  ratings: {
    flavourId: string;
    rating: number;
    date: Date;
  }[];
  
  // Referrals
  referralCode: string;
  referredBy?: string;
  referrals: string[];
}
```

#### Location
```typescript
interface Location {
  id: string;
  name: string;
  address: string;
  
  // Hours
  hours: {
    day: string;
    open: string;
    close: string;
  }[];
  
  // Features
  hasClickAndCollect: boolean;
  hasEvents: boolean;
  hasPrivateEvents: boolean;
  
  // Products
  availableProducts: ("soft-serve" | "pint" | "chocolate" | "coffee" | "merch")[];
  
  // Contact
  phone?: string;
  email?: string;
}
```

## Data Relationships

### Ingredient → Flavour
- One ingredient used in many flavours
- Track which flavours feature each ingredient

### Flavour → Batch
- One flavour has many batches
- Track evolution and iterations

### Flavour → Shopify Product
- One-to-one or one-to-many relationship
- A flavour might have multiple Shopify products (pint, soft serve kit, etc.)

### Story → Flavour/Ingredient
- Many-to-many relationships
- Stories can feature multiple flavours and ingredients

### Collaborator → Flavour
- Many-to-many relationships
- Track all collaborations

## CMS Recommendation

### Suggested: Sanity.io

**Why Sanity:**
- Excellent relational data modeling
- Real-time collaboration
- Flexible content modeling
- Great image handling
- Portable Text for rich content
- GraphQL API
- Good TypeScript support

**Alternative: Contentful**
- More enterprise-focused
- Strong API
- Good for larger teams

**Alternative: Strapi**
- Open source
- Self-hosted option
- Full control

## API Architecture

### Shopify Storefront API
- Product catalog
- Cart management
- Checkout
- Customer accounts

### CMS API (GraphQL)
- Flavour archive queries
- Ingredient directory
- Stories and editorial
- Batch tracking (internal)

### Custom Next.js API Routes
- Golden Spoon membership logic
- Flavour ratings aggregation
- QR code generation
- Shopify ↔ CMS relationship mapping
- Click & Collect scheduling

## Testing Requirements

### CMS Testing
- **Save patterns** - Test create, update, delete operations
- **Relationships** - Test linking flavours to ingredients
- **Shopify sync** - Test product relationship mapping
- **Data validation** - Test required fields and formats
- **Image uploads** - Test media handling

### Integration Testing
- **Shopify ↔ CMS** - Test product-flavour relationships
- **QR code flow** - Test scanning to flavour page
- **Rating system** - Test user ratings and aggregation
- **Golden Spoon** - Test points and benefits

### E2E Testing
- **Shop flow** - Browse, add to cart, checkout
- **Archive browsing** - Search flavours and ingredients
- **Click & Collect** - Order ahead workflow
- **Account management** - Profile, orders, favourites
