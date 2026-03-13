# Project Structure

## Directory Organization

```
/
├── app/                    # Next.js App Router
│   ├── admin/             # CMS admin interface (protected)
│   │   ├── components/    # Admin-specific components
│   │   ├── login/         # Login page
│   │   ├── ingredients/   # Ingredient library management
│   │   ├── products/      # Product-Shopify relationship management
│   │   ├── launch-events/ # Launch event management
│   │   ├── settings/      # Settings
│   │   └── layout.tsx     # Admin layout with auth
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth endpoints
│   │   ├── ingredients/   # Ingredient CRUD
│   │   ├── products/      # Product metadata & relationships
│   │   ├── launch-events/ # Launch event CRUD
│   │   ├── settings/      # Settings API
│   │   └── upload/        # Image upload
│   ├── collections/       # Shopify collections
│   ├── products/          # Shopify products
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── lib/                   # Shared utilities
│   ├── auth.ts            # NextAuth configuration
│   ├── db.js              # Database adapter
│   └── shopify/           # Shopify API client
├── components/            # React components (Shopify store)
├── contexts/              # React contexts (Cart, etc.)
├── public/
│   ├── data/              # JSON data storage (dev)
│   │   ├── ingredients.json
│   │   ├── product-metadata.json
│   │   ├── launch-events.json
│   │   └── settings.json
│   └── uploads/           # User-uploaded images (dev)
├── middleware.ts          # Route protection
└── [config files]         # Next.js, Tailwind, PostCSS configs
```

## Architecture Patterns

### Routing Structure
- **Next.js App Router**: File-based routing in `app/` directory
- **Public routes**: Shopify storefront pages (collections, products)
- **Admin routes**: CMS interface at `/admin/*` (protected by middleware)
- **API routes**: RESTful endpoints at `/api/*`

### Component Organization
- **app/**: Next.js pages and layouts (TypeScript)
- **components/**: Shared React components for Shopify store
- **app/admin/**: CMS admin interface components
- **lib/**: Utilities, API clients, and configurations
- **src/**: Legacy components (reference only, not used in production)

### Data Flow
- **API calls**: Next.js API routes at `/api/*`
- **Data storage**: 
  - Development: JSON files in `/public/data/`
  - Production: Vercel KV or Upstash Redis
- **Image uploads**:
  - Development: Local files in `/public/uploads/`
  - Production: Vercel Blob storage
- **Authentication**: NextAuth with JWT sessions

## Code Conventions

### Component Style
- **Next.js pages**: TypeScript with `.tsx` extension
- **Components**: Functional components with hooks
- **Server Components**: Default in Next.js App Router
- **Client Components**: Use `'use client'` directive when needed

### File Naming
- **Pages**: lowercase with hyphens (e.g., `page.tsx`, `[id]/page.tsx`)
- **Components**: PascalCase (e.g., `AdminNav.tsx`, `Button.tsx`)
- **Utilities**: camelCase (e.g., `auth.ts`, `db.js`)
- **API routes**: `route.ts` in appropriate directory

### Styling
- **CRITICAL**: All CMS components MUST follow Untitled UI design patterns (https://github.com/untitleduico)
- Tailwind utility classes for all styling (no custom CSS)
- No CSS modules or styled-components
- Global styles in `src/styles/index.css`
- Design tokens configured in `tailwind.config.js`
- Reference `.kiro/steering/untitled-ui-reference.md` for patterns
- Maintain consistency with existing admin pages (flavours, ingredients, formats)
- Use blue-600 for primary actions, gray tones for secondary elements

### State Management
- **Server state**: React Server Components (default)
- **Client state**: `useState` for local UI state
- **Forms**: React Hook Form for complex forms
- **Auth**: NextAuth with JWT sessions
- **Cart**: React Context (CartContext)

## API Endpoints

All endpoints prefixed with `/api/`:

- **Ingredients**: GET, POST, PUT, DELETE `/api/ingredients`
- **Products**: GET, PUT `/api/products` (metadata & relationships)
- **Launch Events**: GET, POST, PUT, DELETE `/api/launch-events`
- **Settings**: GET, PUT `/api/settings`
- **Upload**: POST `/api/upload` (multipart/form-data)

## Protected Routes

Admin routes are protected by Next.js middleware that checks NextAuth session:
- All `/admin/*` routes require authentication
- Unauthenticated users are redirected to `/admin/login`
- Authentication handled by `middleware.ts`
