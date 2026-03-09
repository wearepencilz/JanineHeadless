---
title: CMS Architecture
inclusion: auto
---

# CMS Architecture

## Overview

The CMS is now fully integrated into the Next.js application using modern patterns:

- **Next.js App Router** - Server-side rendering and routing
- **NextAuth** - Secure authentication
- **Next.js API Routes** - RESTful API endpoints
- **Vercel KV/Redis** - Production data storage (with file fallback for dev)
- **Vercel Blob** - Image uploads and storage

## Structure

```
app/
├── admin/                    # CMS admin interface
│   ├── components/          # Admin-specific components
│   │   └── AdminNav.tsx    # Navigation bar
│   ├── login/              # Login page
│   ├── projects/           # Project management
│   ├── news/               # News management
│   ├── pages/              # Page content management
│   ├── settings/           # Site settings
│   ├── layout.tsx          # Admin layout with auth
│   └── page.tsx            # Dashboard
├── api/                     # API routes
│   ├── auth/               # NextAuth endpoints
│   ├── projects/           # Project CRUD
│   ├── news/               # News CRUD
│   ├── settings/           # Settings
│   ├── pages/              # Page content
│   └── upload/             # Image upload
lib/
├── auth.ts                  # NextAuth configuration
└── db.js                    # Database adapter (KV/Redis/File)
middleware.ts                # Route protection
```

## Authentication

- **Provider**: NextAuth with Credentials
- **Default credentials**: admin / admin123
- **Protected routes**: All `/admin/*` routes except `/admin/login`
- **Session management**: JWT-based sessions

## API Routes

All API routes are in `app/api/`:

- `GET /api/ingredients` - List all ingredients
- `POST /api/ingredients` - Create ingredient (auth required)
- `PUT /api/ingredients/[id]` - Update ingredient (auth required)
- `DELETE /api/ingredients/[id]` - Delete ingredient (auth required)
- `GET /api/products` - List products with metadata
- `GET /api/products/[id]` - Get product with full ingredient details
- `PUT /api/products/[id]` - Update product metadata & relationships (auth required)
- `POST /api/products/sync` - Sync from Shopify (auth required)
- `GET /api/launch-events` - List all launch events
- `POST /api/launch-events` - Create launch event (auth required)
- `PUT /api/launch-events/[id]` - Update launch event (auth required)
- `DELETE /api/launch-events/[id]` - Delete launch event (auth required)
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings (auth required)
- `POST /api/upload` - Upload image (auth required)

## Data Storage

### Development
- JSON files in `/public/data/`
- Local file system for images

### Production (Vercel)
- Vercel KV or Upstash Redis for data
- Vercel Blob for images
- Automatic fallback to file system if not configured

## Admin Pages

### Dashboard (`/admin`)
- Overview cards linking to each section
- Quick access to all management areas

### Ingredients (`/admin/ingredients`)
- List view with images and categories
- Create/Edit/Delete functionality
- Allergen management
- Category tagging (base, flavor, mix-in, topping)

### Products (`/admin/products`)
- List view with status badges
- Link to Shopify products
- Manage ingredient relationships (core + all)
- Set product status (active, featured, archived, coming-soon)
- Flavour of the week toggle
- Seasonal availability settings
- Launch event association

### Launch Events (`/admin/launch-events`)
- List view with dates and status
- Create/Edit/Delete functionality
- Link multiple products to events
- Image upload support
- Status tracking (upcoming, active, past)

### Settings (`/admin/settings`)
- Company information
- Logo upload
- Featured products selection
- Current flavour of the week
- Social media links

## Development

```bash
# Start Next.js dev server (includes API routes)
npm run dev

# Access CMS
http://localhost:3001/admin/login
```

## Production Deployment

1. Set environment variables:
   - `AUTH_SECRET` - Generate with `openssl rand -base64 32`
   - `BLOB_READ_WRITE_TOKEN` - From Vercel Blob setup
   - `KV_REST_API_URL` - From Vercel KV setup (optional)
   - `KV_REST_API_TOKEN` - From Vercel KV setup (optional)

2. Deploy to Vercel:
   ```bash
   npm run deploy
   ```

## Migration Notes

The old architecture (Express + Vite) has been replaced with:
- Express server → Next.js API Routes
- Multer uploads → Vercel Blob
- React Router → Next.js App Router
- AuthContext → NextAuth
- Separate servers → Single Next.js app

The `src/cms/` directory contains legacy components that can be referenced but are no longer used.
