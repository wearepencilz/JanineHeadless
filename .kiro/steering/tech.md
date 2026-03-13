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

**CRITICAL**: All CMS components MUST follow Untitled UI design patterns (https://github.com/untitleduico).

**ALWAYS Use Untitled UI React Components First**: Before building any UI component, check if an appropriate Untitled UI React component exists:
- Browse the full component library: https://www.untitledui.com/react/application-ui
- Common components:
  - Date Pickers: https://www.untitledui.com/react/components/date-pickers
  - Form Inputs: https://www.untitledui.com/react/components/inputs
  - Buttons: https://www.untitledui.com/react/components/buttons
  - Selects: https://www.untitledui.com/react/components/selects
  - Modals: https://www.untitledui.com/react/components/modals
  - Tables: https://www.untitledui.com/react/components/tables

**Adding Untitled UI Components**:
```bash
# Add a specific component (interactive CLI)
npx untitledui@latest add [component-name]

# Example: Add date range picker
npx untitledui@latest add date-range-picker

# When prompted, specify: app/admin/components/ui
```

**Implementation Approach**:
1. **ALWAYS** check Untitled UI React components library first at https://www.untitledui.com/react/application-ui
2. Use `npx untitledui@latest add [component-name]` to add the component
3. Components will be added to `app/admin/components/ui/` directory
4. Import and use the component throughout the CMS for consistency
5. Components are already adapted for Next.js and React 18
6. Only build custom components if no suitable Untitled UI component exists

**Available via CLI**:
- `date-picker` - Single date selection
- `date-range-picker` - Date range selection with calendar
- `input` - Text input with variants
- `textarea` - Multi-line text input
- `select` - Dropdown select
- `button` - Button with variants
- `modal` - Dialog/modal component
- `table` - Data table component
- And many more at https://www.untitledui.com/react/application-ui

Reference `.kiro/steering/untitled-ui-reference.md` for:
- Component structure and styling patterns
- Color system and semantic tokens
- Typography scale and spacing
- Accessibility requirements
- Form and input patterns

Customize design tokens in `tailwind.config.js`:
- Colors: `theme.extend.colors`
- Typography: `theme.extend.fontFamily` and `theme.fontSize`
- Border radius: `theme.extend.borderRadius`

**Design Consistency Rules**:
- Use Tailwind utility classes exclusively (no custom CSS)
- Follow existing component patterns from flavours, ingredients, formats pages
- Maintain consistent spacing, colors, and typography across all admin pages
- Use blue-600 for primary actions, gray tones for secondary elements
- Apply hover states and focus rings consistently
- Keep form styling uniform (border-gray-300, focus:border-blue-500, focus:ring-blue-500)

## File Upload Configuration

### Development
- Storage: `public/uploads/` directory
- Naming: Timestamp prefix for uniqueness

### Production
- Storage: Vercel Blob
- Allowed types: JPEG, PNG, GIF, WebP, SVG
- API: `/api/upload` (authentication required)
