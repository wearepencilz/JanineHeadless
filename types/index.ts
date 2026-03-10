// Core type definitions for Janine CMS

// ============================================================================
// Ingredient Types
// ============================================================================

export const ingredientCategoryOptions = [
  "Dairy",
  "Egg",
  "Fruit",
  "Vegetable",
  "Herb",
  "Spice",
  "Aromatic",
  "Floral",
  "Nut",
  "Seed",
  "Grain",
  "Sweetener",
  "Salt",
  "Fat",
  "Liquid",
  "Chocolate / Cocoa",
  "Coffee / Tea",
  "Fermented",
  "Savoury",
  "Condiment",
  "Baked Good",
  "Preserve",
  "Sauce",
  "Confection",
  "Alcohol",
  "Botanical",
  "Regional Specialty",
  "Other"
] as const;

export const ingredientRoleOptions = [
  "Base",
  "Primary Flavour",
  "Supporting Flavour",
  "Mix-in",
  "Inclusion",
  "Swirl",
  "Sauce",
  "Topping",
  "Garnish",
  "Coating",
  "Filling",
  "Pairing",
  "Optional Add-on",
  "Combo Component",
  "Retail Component",
  "Other"
] as const;

export const ingredientDescriptorTags = [
  "Local",
  "Imported",
  "Seasonal",
  "Foraged",
  "Fresh",
  "Dried",
  "Roasted",
  "Toasted",
  "Grilled",
  "Browned",
  "Caramelized",
  "Fermented",
  "Infused",
  "Candied",
  "Citrus",
  "Acidic",
  "Floral",
  "Herbal",
  "Earthy",
  "Smoky",
  "Savoury",
  "Sweet",
  "Bitter",
  "Spicy",
  "Crunchy",
  "Creamy"
] as const;

export type IngredientCategory = typeof ingredientCategoryOptions[number];
export type IngredientRole = typeof ingredientRoleOptions[number];
export type IngredientDescriptor = typeof ingredientDescriptorTags[number];

export type Allergen = 
  | 'dairy' 
  | 'eggs' 
  | 'nuts' 
  | 'soy' 
  | 'gluten' 
  | 'sesame';

export type DietaryFlag = 
  | 'vegan' 
  | 'vegetarian' 
  | 'gluten-free' 
  | 'dairy-free' 
  | 'nut-free';

export interface Ingredient {
  id: string;                       // UUID
  name: string;                     // Display name (unique)
  latinName?: string;               // Scientific name (optional)
  category: IngredientCategory;     // Primary category (single select)
  roles: IngredientRole[];          // Usage roles (multi-select)
  descriptors: IngredientDescriptor[]; // Descriptor tags (optional multi-select)
  origin: string;                   // Source/origin location
  allergens: Allergen[];            // Allergen tags
  dietaryFlags: DietaryFlag[];      // Dietary compatibility
  seasonal: boolean;                // Seasonal availability
  image?: string;                   // Image URL (Vercel Blob or local)
  description?: string;             // Additional information
  createdAt: string;                // ISO 8601 timestamp
  updatedAt: string;                // ISO 8601 timestamp
}

// ============================================================================
// Flavour Types
// ============================================================================

export type SyncStatus = 
  | 'synced'      // Successfully synced
  | 'pending'     // Queued for sync
  | 'failed'      // Sync failed
  | 'not_linked'; // No Shopify product linked

export type FlavourType = 
  | 'gelato'              // Dairy-based ice cream
  | 'sorbet'              // Fruit-based, dairy-free
  | 'special'             // Unique preparations
  | 'tasting-component';  // For tasting experiences

export type BaseStyle = 
  | 'dairy'      // Milk/cream base
  | 'non-dairy'  // Alternative milk
  | 'fruit'      // Fruit base
  | 'cheese'     // Cheese-based
  | 'other';     // Unique bases

export type Status = 
  | 'active'     // Currently available
  | 'upcoming'   // Coming soon
  | 'archived';  // No longer available

// Legacy type alias for backward compatibility
export type AvailabilityStatus = Status;

export interface FlavourIngredient {
  ingredientId: string;          // Reference to Ingredient.id
  quantity?: string;             // e.g., "30%", "2 cups", "to taste"
  displayOrder: number;          // Sort order (0-indexed)
  notes?: string;                // Special preparation notes
}

export interface Flavour {
  id: string;                    // UUID
  name: string;                  // Flavour name
  slug: string;                  // URL-friendly identifier
  type: FlavourType;             // Classification
  baseStyle: BaseStyle;          // Base category
  description: string;           // Full description
  shortDescription: string;      // Card copy
  story?: string;                // Flavour story/narrative
  tastingNotes?: string;         // Tasting notes
  ingredients: FlavourIngredient[]; // Ordered ingredient list
  keyNotes: string[];            // Flavor notes (e.g., "nutty", "floral")
  
  // Allergens & Dietary (calculated from ingredients)
  allergens: Allergen[];         // Auto-calculated
  dietaryTags: DietaryFlag[];    // Auto-calculated
  
  // Display
  colour: string;                // Hex color code
  image?: string;                // Flavour image URL
  
  // Availability
  season?: string;               // e.g., "Spring", "Summer"
  status: Status;                // Current availability status
  
  // Format eligibility flags
  canBeUsedInTwist: boolean;     // Eligible for twist combinations
  canBeSoldAsPint: boolean;      // Available as packaged pint
  canBeUsedInSandwich: boolean;  // Suitable for sandwich filling
  
  // Admin
  sortOrder: number;             // Display order
  featured: boolean;             // Highlight in admin
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Format Types (Three-Layer Architecture)
// ============================================================================

export type FormatCategory = 
  | 'frozen'      // Ice cream, sorbet, soft serve
  | 'food'        // Sandwiches, focaccia
  | 'experience'  // Tastings, pairings
  | 'bundle';     // Combos, multi-item

export type ServingStyle = 
  | 'scoop'       // Hand-scooped
  | 'soft-serve'  // Soft serve machine
  | 'packaged'    // Pints, take-home
  | 'plated';     // Plated experience

export interface Format {
  id: string;                    // UUID
  name: string;                  // Display name (e.g., "Soft Serve", "Twist")
  slug: string;                  // URL-friendly identifier
  category: FormatCategory;      // Classification
  description: string;           // Admin description
  
  // Flavour requirements
  requiresFlavours: boolean;     // Does this format need flavours?
  minFlavours: number;           // Minimum flavour count (0 if not required)
  maxFlavours: number;           // Maximum flavour count
  allowMixedTypes: boolean;      // Can mix gelato + sorbet?
  
  // Configuration
  canIncludeAddOns: boolean;     // Supports toppings/add-ons?
  defaultSizes: string[];        // e.g., ["small", "medium", "large"]
  servingStyle: ServingStyle;    // How it's served
  menuSection: string;           // Where it appears on menu
  
  // Display
  image?: string;                // Format image URL
  icon?: string;                 // Icon for admin UI
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Offering Types (Three-Layer Architecture)
// ============================================================================

export type OfferingStatus = 
  | 'draft'       // Not published
  | 'scheduled'   // Scheduled for future
  | 'active'      // Currently available
  | 'sold-out'    // Temporarily unavailable
  | 'archived';   // No longer offered

export interface Offering {
  id: string;                    // UUID
  internalName: string;          // Admin reference name
  publicName: string;            // Customer-facing name
  slug: string;                  // URL-friendly identifier
  status: OfferingStatus;        // Publication status
  
  // Relationships
  formatId: string;              // Reference to Format.id
  primaryFlavourIds: string[];   // Main flavour(s) - array for flexibility
  secondaryFlavourIds?: string[]; // Optional additional flavours
  componentIds?: string[];       // Optional components (for sandwiches, tastings)
  
  // Content
  description: string;           // Full description
  shortCardCopy: string;         // Brief card text
  image?: string;                // Offering-specific image (overrides flavour image)
  
  // Pricing
  price: number;                 // Base price in cents
  compareAtPrice?: number;       // Original price (for sales)
  
  // Availability
  availabilityStart?: string;    // ISO 8601 date
  availabilityEnd?: string;      // ISO 8601 date
  location?: string;             // Specific location if relevant
  
  // Tags & Classification
  tags: string[];                // e.g., ["seasonal", "weekly", "featured", "limited", "collab"]
  
  // Shopify Integration
  shopifyProductId?: string;     // Linked Shopify product GID
  shopifyProductHandle?: string; // Product handle for URLs
  shopifySKU?: string;           // SKU for inventory
  posMapping?: string;           // POS system identifier
  
  // Sync status
  syncStatus?: SyncStatus;       // Current sync state
  lastSyncedAt?: string;         // Last successful sync timestamp
  syncError?: string;            // Error message if failed
  
  // Inventory (for packaged products like pints)
  inventoryTracked: boolean;     // Track inventory?
  inventoryQuantity?: number;    // Current stock
  batchCode?: string;            // Batch identifier
  restockDate?: string;          // Expected restock date
  shelfLifeNotes?: string;       // Storage/shelf life info
  
  // Ordering
  onlineOrderable: boolean;      // Available for online orders?
  pickupOnly: boolean;           // Pickup only (no delivery)?
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Bundle Types (Three-Layer Architecture)
// ============================================================================

export interface BundleItem {
  type: 'offering' | 'component'; // What kind of item
  id: string;                     // Reference to offering or component
  quantity: number;               // How many included
  required: boolean;              // Must be included?
}

export interface ChoiceRule {
  componentType: string;          // e.g., "soft-serve", "focaccia"
  minChoices: number;             // Minimum selections
  maxChoices: number;             // Maximum selections
  allowedTypes: string[];         // Allowed flavour types (e.g., ["gelato", "sorbet"])
  allowTwist: boolean;            // Allow twist combinations?
  premiumSurcharge?: number;      // Extra charge for premium options
}

export interface Bundle {
  id: string;                    // UUID
  name: string;                  // Bundle name
  slug: string;                  // URL-friendly identifier
  description: string;           // Bundle description
  
  // Structure
  includedItems: BundleItem[];   // Items in the bundle
  choiceRules: ChoiceRule[];     // Customer choice constraints
  
  // Pricing
  bundlePrice: number;           // Bundle price in cents
  individualPriceSum?: number;   // Sum of individual prices (for comparison)
  
  // Availability
  availabilityStart?: string;    // ISO 8601 date
  availabilityEnd?: string;      // ISO 8601 date
  
  // Content
  upsellCopy?: string;           // Marketing copy
  image?: string;                // Bundle image
  
  // Integration
  shopifyProductId?: string;     // Linked Shopify product
  posMapping?: string;           // POS system identifier
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Component Types (Three-Layer Architecture)
// ============================================================================

export type ComponentType = 
  | 'bread'      // Focaccia, brioche
  | 'cheese'     // Goat cheese, ricotta
  | 'topping'    // Crumbs, sprinkles
  | 'sauce'      // Jam, honey, olive oil
  | 'pairing';   // Wine, coffee, etc.

export interface Component {
  id: string;                    // UUID
  name: string;                  // Component name
  slug: string;                  // URL-friendly identifier
  type: ComponentType;           // Classification
  description: string;           // Description
  
  // Allergens & Dietary
  allergens: Allergen[];         // Allergen tags
  dietaryTags: DietaryFlag[];    // Dietary flags
  
  // Pricing
  price?: number;                // Price if sold separately
  
  // Display
  image?: string;                // Component image
  
  // Availability
  status: Status;                // Current availability status
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Seasonal Collection Types (Three-Layer Architecture)
// ============================================================================

export interface SeasonalCollection {
  id: string;                    // UUID
  name: string;                  // Collection name
  slug: string;                  // URL-friendly identifier
  description: string;           // Collection description
  
  // Content
  heroImage?: string;            // Hero image for collection page
  
  // Relationships
  offeringIds: string[];         // Offerings in this collection
  
  // Availability
  availabilityStart?: string;    // ISO 8601 date
  availabilityEnd?: string;      // ISO 8601 date
  
  // Display
  featured: boolean;             // Show on homepage?
  sortOrder: number;             // Display order
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Shopify Types
// ============================================================================

export interface ShopifyProduct {
  id: string;              // GID (e.g., "gid://shopify/Product/123")
  handle: string;          // URL handle
  title: string;           // Product title
  featuredImage?: {
    url: string;
    altText?: string;
  };
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
}

export interface ProductMetafield {
  namespace: string;
  key: string;
  value: string;
  type: string;
}

export interface ProductMetafields {
  'custom.flavour_id': string;              // CMS flavour ID
  'custom.ingredient_ids': string[];        // Array of ingredient IDs
  'custom.allergens': Allergen[];           // Calculated allergen list
  'custom.dietary_tags': DietaryFlag[];     // vegan, gluten-free, etc.
  'custom.seasonal_ingredients': boolean;   // Has seasonal items
}

// ============================================================================
// Sync Types
// ============================================================================

export type SyncJobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface SyncJob {
  id: string;                    // Job ID
  flavourId: string;             // Flavour to sync
  productId: string;             // Shopify product GID
  status: SyncJobStatus;
  attempts: number;              // Retry count
  maxAttempts: number;           // Max retry limit (default: 3)
  error?: string;                // Error message
  createdAt: string;
  processedAt?: string;
  completedAt?: string;
}

export type SyncAction = 'create' | 'update' | 'delete';
export type SyncLogStatus = 'success' | 'failure';

export interface SyncLog {
  id: string;
  flavourId: string;
  productId: string;
  action: SyncAction;
  status: SyncLogStatus;
  error?: string;
  timestamp: string;
  duration: number;              // Milliseconds
}

// ============================================================================
// API Response Types
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ErrorResponse {
  error: string;           // Human-readable error message
  code?: string;           // Machine-readable error code
  details?: any;           // Additional error details
  timestamp: string;       // ISO 8601 timestamp
  requestId?: string;      // For tracking and debugging
}

// ============================================================================
// Helper Types
// ============================================================================

export interface IngredientWithDetails extends Ingredient {
  quantity?: string;
  displayOrder: number;
  notes?: string;
}

export interface FlavourWithSyncStatus extends Flavour {
  syncStatusLabel: string;
  canResync: boolean;
}

// Three-Layer Architecture Helper Types
export interface OfferingFull extends Offering {
  format: Format;
  primaryFlavours: Flavour[];
  secondaryFlavours?: Flavour[];
  components?: Component[];
}

export interface FlavourWithUsage extends Flavour {
  usageCount: number;
  usedInOfferings: {
    id: string;
    name: string;
    formatName: string;
    status: OfferingStatus;
  }[];
}

export interface FormatWithUsage extends Format {
  usageCount: number;
  activeOfferingsCount: number;
}

export interface CollectionFull extends SeasonalCollection {
  offerings: OfferingFull[];
}

// ============================================================================
// Validation Types
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
