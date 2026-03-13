# CMS Data Protection & Referential Integrity System

## Overview

Implemented a comprehensive system to address three critical issues:
1. **Data Protection** - Prevent accidental data loss
2. **Auto-Generated Slugs** - Classic CMS behavior for all entities
3. **Referential Integrity** - Maintain relationships between entities

## What Was Implemented

### 1. Data Protection System (`lib/data-protection.ts`)

Automatic backup system that creates timestamped backups before destructive operations:

- `createBackup(filename)` - Backup a single data file
- `createFullBackup()` - Backup all data files
- `restoreBackup(backupPath, targetFilename)` - Restore from backup
- `listBackups(filename)` - List available backups
- `cleanupOldBackups(keepCount)` - Keep only N most recent backups

**Backups stored in:** `public/data/backups/`

### 2. Referential Integrity System (`lib/referential-integrity.ts`)

Validates and maintains relationships between entities:

**Check Functions:**
- `checkFormatDeletion(formatId)` - Blocks if products use this format
- `checkFlavourDeletion(flavourId)` - Blocks if products/launches/batches use this flavour
- `checkIngredientDeletion(ingredientId)` - Blocks if flavours use this ingredient
- `checkModifierDeletion(modifierId)` - Blocks if products use this modifier
- `checkProductDeletion(productId)` - Warns if launches feature this product

**Cleanup Functions:**
- `cleanupOrphanedReferences(entityType, deletedId)` - Auto-removes orphaned references
- `validateAllReferences()` - System-wide integrity check

### 3. API Middleware (`lib/api-middleware.ts`)

Wraps API operations with automatic protection:

- `withDeleteProtection()` - Checks integrity + creates backup + cleans up orphans
- `withUpdateProtection()` - Creates backup before updates
- `validateRequired()` - Validates required fields
- `validationError()` - Formats validation errors

### 4. Enhanced Slug System (`lib/slug.ts`)


**Functions:**
- `generateSlug(text)` - Convert text to URL-friendly slug
- `useAutoSlug()` - React hook for auto-generating slugs
- `createSlugState()` - Non-React slug state management
- `updateSlugFromName()` - Update slug when name changes
- `setSlugManually()` - Stop auto-generation when manually edited

**Behavior:**
- Slugs auto-generate as you type the name field
- Once manually edited, auto-generation stops
- Prevents accidental overwrites of custom slugs

## Current Implementation Status

### ✅ Completed
- Data protection system with automatic backups
- Referential integrity validation for all entity types
- API middleware for DELETE and UPDATE operations
- Enhanced slug generation utilities
- Format DELETE endpoint with full protection
- Flavour DELETE endpoint with full protection
- Restored missing format data (5 essential formats)
- Made product edit page resilient to missing format data

### 🚧 In Progress
- Need to add auto-slug to remaining admin pages:
  - Modifiers (new/edit)
  - Products (new/edit)
  - Ingredients (new/edit)
  - Flavours (new/edit)
  - Batches (new/edit)
  
- Need to add protection to remaining DELETE endpoints:
  - Ingredients
  - Modifiers
  - Products
  - Launches

## How It Works

### Example: Deleting a Format

1. User clicks "Delete" on a format
2. `withDeleteProtection()` is called
3. System checks `checkFormatDeletion(formatId)`
4. If products use this format → **BLOCKED** with error message
5. If no products use it:
   - Creates backup: `formats_2026-03-13T12-30-45.json`
   - Performs deletion
   - Cleans up any orphaned references
   - Returns success

### Example: Auto-Generated Slug

1. User types "Soft Serve Twist" in name field
2. Slug auto-updates to "soft-serve-twist"
3. User can edit slug manually if needed
4. Once edited, auto-generation stops
5. Prevents overwriting custom slugs

## Relationships Protected

```
Format
  └─> Products (BLOCKS deletion if in use)

Flavour
  ├─> Products (BLOCKS deletion if in use)
  ├─> Launches (BLOCKS deletion if featured)
  └─> Batches (BLOCKS deletion if referenced)

Ingredient
  └─> Flavours (BLOCKS deletion if in use)

Modifier
  └─> Products (BLOCKS deletion if in use)

Product
  └─> Launches (WARNS, auto-removes from launches)
```

## Next Steps

1. **Add auto-slug to all admin pages** - Ensure consistent UX
2. **Wire up remaining DELETE endpoints** - Complete protection coverage
3. **Add backup restoration UI** - Allow admins to restore from backups
4. **Add integrity validation endpoint** - `/api/admin/validate-integrity`
5. **Add backup management UI** - View/restore/cleanup backups

## Testing

To test the system:

```bash
# Try to delete a format that's in use
# Should see: "Cannot delete: entity is in use"

# Check backups directory
ls -la public/data/backups/

# Validate all references
# (Need to create endpoint for this)
```

## Benefits

1. **No more disappearing data** - Automatic backups before changes
2. **No broken relationships** - System prevents orphaned references
3. **Better UX** - Auto-generated slugs like WordPress/Contentful
4. **Data integrity** - System maintains consistency automatically
5. **Recoverable mistakes** - Can restore from backups if needed
