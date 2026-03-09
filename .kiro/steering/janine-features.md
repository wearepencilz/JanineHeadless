---
title: Janine Feature Specifications
inclusion: auto
---

# Janine Feature Specifications

## Priority Levels

### High Priority (MVP)
Must have for launch.

### Medium Priority
Important but can follow MVP.

### Future
Nice to have, longer-term vision.

---

## 1. Shop (Commerce Engine)

**Priority:** High

### Features
- Product catalogue (ice cream, chocolate, merch, pantry, gift sets)
- Product types: soft serve, pints, chocolate bars, bundles
- Subscriptions support
- Build-your-box functionality
- Seasonal drops and limited releases
- Golden Spoon exclusive products

### Product Page Requirements
- Product photography
- Ingredient list (linked to ingredient pages)
- Flavour notes
- Allergen information
- Availability status
- Related flavours
- Customer ratings

### Special Commerce Flows

#### Click & Collect / Skip the Line
- Order ahead
- Select pickup time
- Pay online
- Pick up in store
- Order status tracking

---

## 2. Flavour Archive

**Priority:** High

### Core Feature
Central pillar of the brand - document the history of flavours and experiments.

### Flavour Page Structure
Each flavour contains:
- Flavour name
- Description
- Ingredients (linked)
- Flavour categories
- Tasting notes
- Season released
- Batch numbers
- Availability status
- Collaborators (chef/artist/farm)
- Images (product + making process)
- Community ratings
- Related stories

### Example
```
Blood Orange & Cardamom Twist
Spring 2026

Ingredients:
→ Blood Orange (Sicily)
→ Green Cardamom (Kerala)
→ Jersey Milk (Local)

Batch Notes:
Batch 04 – increased cardamom infusion

Tasting Notes:
• Bright citrus
• Warm spice
• Creamy finish

Rating: 4.8/5 (127 ratings)
```

### Archive Features
- Search by ingredient
- Filter by season
- Filter by status (active/archived/seasonal)
- Filter by category
- Sort by rating, date, popularity
- View batch history

---

## 3. Ingredient Directory

**Priority:** High

### Inspiration
- Ffern
- Noma Projects
- Flamingo Estate

### Ingredient Page Structure
- Name
- Latin name (optional)
- Origin (with map?)
- Tasting notes
- Ingredient category
- Story and provenance
- Supplier/farm information
- Used in flavours (linked)
- Images (ingredient + sourcing + processing)
- Seasonal availability

### Example
```
Blood Orange
Citrus × sinensis

Origin: Sicily
Notes: citrus, floral, bittersweet

Story:
Sourced from a family farm in Sicily...

Used in:
→ Blood Orange & Cardamom Twist
→ Winter Citrus Sorbet
→ Sicilian Sunrise
```

### Directory Features
- Browse by category
- Search by name
- Filter by season
- Filter by allergen
- View sourcing map

---

## 4. Stories

**Priority:** High

### Editorial Layer
Brand storytelling and content.

### Story Categories
- **Founders** - Origin story and philosophy
- **Ethos** - Values and approach
- **Collaborations** - Artist and chef partnerships
- **Journal** - Regular updates and musings
- **Events & Tastings** - Event coverage
- **Test Kitchen** - Behind-the-scenes experimentation
- **Heritage** - Tradition and craft

### Story Page Structure
- Title
- Featured image
- Content (rich text)
- Related flavours
- Related ingredients
- Collaborators
- Gallery
- Publication date

---

## 5. Locations

**Priority:** High

### Features
- Store locations with map
- Hours of operation
- Click & collect availability
- Event booking
- Private event inquiry
- FAQ per location
- Available products per location

---

## 6. Golden Spoon (Loyalty)

**Priority:** High

### Membership System

#### Features
- Membership overview
- Benefits list
- Points tracker
- Points history
- Referral system
- Referral code sharing
- Early access to drops
- Exclusive tasting events
- Member-exclusive products

#### Points System
- Earn points on purchases
- Earn points on referrals
- Earn points on ratings
- Redeem for products
- Redeem for experiences

---

## 7. Account Area

**Priority:** High

### User Dashboard
- Profile management
- Order history
- Saved flavours
- Flavour ratings
- Loyalty points
- Subscriptions management
- Click & collect orders
- Preferences

---

## 8. Flavour Rating System

**Priority:** Medium

### Features
Users can:
- Rate flavours (1-5 stars)
- Mark favourites
- Track flavours tried
- Write tasting notes (optional)
- See their rating history

### Data Usage
Ratings feed:
- Flavour recommendations
- Seasonal return decisions
- Popular flavour tracking
- Golden Spoon personalization

---

## 9. QR Code System

**Priority:** High

### QR Code Placement
- Shop menus
- Cones and cups
- Packaging
- Event materials
- In-store signage

### Scanning Opens
- Flavour page with full details
- Ingredient provenance page
- Ordering page
- Related stories

### QR Generator (Admin)
- Generate QR for any flavour
- Generate QR for any ingredient
- Generate QR for stories
- Download as PNG/SVG
- Print-ready formats

---

## 10. Test Kitchen & Batch Tracking

**Priority:** Medium

### Internal Tool
For experimentation and documentation.

### Batch Tracking Fields
- Batch ID (e.g., SC-BOCD-1007A)
- Flavour name
- Date
- Ingredients with ratios
- Processing notes
- Temperature and technique
- Tasting notes
- Rating (internal)
- Final decision (approved/needs adjustment/rejected)
- Adjustments needed
- Photos (process documentation)

### Example
```
Batch: SC-BOCD-1007A
Flavour: Soft Serve Blood Orange Cardamom
Date: Oct 7, 2024

Cardamom infusion too light
→ Increase by 20%

Decision: Needs adjustment
Next batch: SC-BOCD-1014A
```

### Features
- Create new batch
- Link to flavour
- Track iterations
- Compare batches
- Approve for production
- Export batch history

---

## 11. Media System

**Priority:** High

### Image Categories
- Product photography
- Ingredient photography
- Process photos ("in the making")
- Farm photography
- Archival flavour photos
- Event photography
- Team and collaborator photos

### Image Requirements
- High resolution
- Multiple formats (web, print)
- Alt text for accessibility
- Organized by category
- Searchable
- Taggable

### "In the Making" Process Photos
Should appear as:
- Step images
- Technique illustrations
- Test kitchen documentation
- Behind-the-scenes content

Used in:
- Flavour pages
- Stories
- Batch documentation
- Social media

---

## Future Features

### Flavour Recommendation Engine
- Based on ratings
- Based on flavours tried
- Based on ingredient preferences
- Personalized suggestions

### AI Flavour Generator
- Suggest new combinations
- Based on seasonal ingredients
- Based on trending flavours

### Community Voting
- Vote on next seasonal flavour
- Vote on archived flavour returns
- Suggest new flavours

### Mobile App
- Enhanced loyalty features
- Push notifications for drops
- In-store ordering
- Augmented reality experiences
