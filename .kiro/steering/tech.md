# Tech Stack

## Frontend
- **Next.js 14.2** - React framework with App Router
- **React 18.3** - UI framework
- **TypeScript 5.9** - Type safety
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **PostCSS + Autoprefixer** - CSS processing
- **Framer Motion 11** - Animation library
- **React Hook Form 7.50** - Form management

## Backend
- **Next.js API Routes** - RESTful API endpoints
- **NextAuth** - Authentication
- **Shopify Storefront API** - Product catalog and checkout
- **Headless CMS** - Content management (Sanity/Contentful/Strapi recommended)
- **Vercel Blob** - Image storage
- **Vercel KV** - Session and cache storage
- **Node.js with ES modules** - Runtime environment

## CMS (New!)
- **Admin Panel**: `/admin` - Full content management system
- **Authentication**: NextAuth with credentials (admin/admin123)
- **Content Types**: 
  - Ingredients (library with provenance)
  - Flavours (archive with relationships)
  - Batches (test kitchen tracking)
  - Stories (editorial content)
  - Launch Events (marketing campaigns)
  - Settings (global configuration)
- **Image Uploads**: Vercel Blob (production) or local files (dev)
- **Relationships**: Shopify products linked to CMS flavours and ingredients
- **QR Code Generator**: Generate codes for flavours, ingredients, stories

## Recommended CMS Architecture

**Headless CMS** (Sanity, Contentful, or Strapi) for:
- Richer relational data modeling
- Flavour archive independent of commerce lifecycle
- Editorial flexibility
- Test kitchen workflow

**Next.js API Routes** for:
- Shopify ↔ CMS relationship mapping
- Golden Spoon membership logic
- Flavour ratings aggregation
- QR code generation

## Development Setup

**Single server** - Next.js handles everything:

```bash
# Start Next.js dev server (includes API routes and CMS)
npm run dev

# Access:
# - Shopify Store: http://localhost:3001
# - CMS Admin: http://localhost:3001/admin/login
```

## Common Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Deploy to Vercel
npm run deploy
```

## Build Configuration

- **Module type**: ES modules (`"type": "module"` in package.json)
- **Next.js**: App Router with TypeScript
- **Tailwind**: Scans all JSX/TSX files in src, app, and index.html
- **PostCSS**: Configured for Tailwind processing

## Design System

Customize design tokens in `tailwind.config.js`:
- Colors: `theme.extend.colors`
- Typography: `theme.extend.fontFamily` and `theme.fontSize`
- Border radius: `theme.extend.borderRadius`

Reference Untitled UI patterns for component design (see `.kiro/steering/untitled-ui-reference.md`)

## File Upload Configuration

### Development
- Storage: `public/uploads/` directory
- Naming: Timestamp prefix for uniqueness

### Production
- Storage: Vercel Blob
- Allowed types: JPEG, PNG, GIF, WebP, SVG
- API: `/api/upload` (authentication required)
