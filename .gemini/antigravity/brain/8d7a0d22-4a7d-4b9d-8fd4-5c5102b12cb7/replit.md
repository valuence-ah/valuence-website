# Valuence VC - Venture Capital Website

## Overview

Valuence VC is a deeptech venture capital firm focused on cleantech and techbio investments. This is a full-stack web application built as a modern marketing and information platform to showcase the firm's investment thesis, portfolio companies, team members, and enable contact with potential founders and partners.

The application serves as the primary digital presence for the VC firm, featuring a sophisticated design system inspired by leading venture firms (Sequoia, a16z, Greylock) while maintaining its own unique identity focused on planetary and human health through deeptech innovation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR and optimized production builds
- Wouter for lightweight client-side routing (SPA architecture)
- TanStack Query (React Query) for server state management and data fetching

**UI Component System**
- Radix UI primitives for accessible, unstyled component foundations
- shadcn/ui component library configured with "new-york" style preset
- Tailwind CSS for utility-first styling with custom design tokens
- Framer Motion for animations and transitions
- Custom design system based on professional VC firm aesthetics

**Styling Approach**
- CSS custom properties for theme variables (supports light/dark modes)
- Tailwind configuration with extended color palette and spacing system
- Typography system using Inter/DM Sans (sans-serif) and Playfair Display (serif)
- Component-level styling with class-variance-authority (CVA) for variant management

**State Management**
- React Query for async/server state
- React hooks (useState, useEffect) for local component state
- No global state management library needed - architecture favors composition

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and routing
- Node.js runtime with ES modules (type: "module")
- TypeScript for type safety across backend code

**API Design**
- RESTful endpoints under `/api` prefix
- JSON request/response format
- Form submission endpoints: `/api/contact` and `/api/newsletter`
- Schema validation using Zod before database operations

**Data Storage Strategy**
- In-memory storage implementation (`MemStorage` class) for development
- Designed for easy migration to PostgreSQL via Drizzle ORM
- Data models: Users, TeamMembers, PortfolioCompanies, ContactSubmissions, NewsletterSignups
- UUID-based primary keys for all entities

**Build & Deployment**
- Separate client and server build processes
- Client built with Vite to `dist/public`
- Server bundled with esbuild to `dist/index.cjs`
- Static file serving in production mode
- Development mode with Vite middleware and HMR

### Database Schema Design

**Schema Definition**
- Drizzle ORM with PostgreSQL dialect configuration
- Schema location: `shared/schema.ts` for isomorphic types
- Tables: `team_members`, `portfolio_companies`, `contact_submissions`, `newsletter_signups`, `site_pages`, `content_sections`, `navigation_links`, `global_settings`, `media_uploads`

**Data Models**
- TeamMember: Categorized by role (general_partners, investment_committee, apac_advisors)
- PortfolioCompany: Categorized by sector (cleantech, techbio)
- ContactSubmission: Captures founder/partner inquiries
- NewsletterSignup: Email list management with duplicate prevention
- SitePage: Page metadata (id, title, slug, description, metaTitle, metaDescription)
- ContentSection: Page section content with JSONB data field (pageId, sectionType, title, data, order, status)
- NavigationLink: Header/footer navigation links (label, url, location, order, isActive)
- GlobalSetting: Site-wide settings (id, key, category, value)
- MediaUpload: Track uploaded media files with metadata (filename, originalName, mimeType, url)

### Content Management System (CMS)

**Architecture**
- Normalized page/section model with JSONB flexibility for structured content
- Section types defined in SECTION_TYPES registry with form field definitions
- All pages consume content from `/api/sections/:pageId` endpoint
- Field-level defaults prevent blank UI when sections are missing

**Section Types**
- hero: Title, highlight, subtitle, background image/video
- focus_intro: Label, title, highlight, description
- focus_cards: Array of cards with icon, title, description
- team_intro: Title, highlight, points array with icon/prefix/text
- team_grid: Show categories toggle
- portfolio_grid: Filters toggle, layout option
- text_block: Label, title, content fields
- contact_form: Title, description, submit button text

**Content Hook Pattern**
- `usePageContent(pageId)` hook fetches sections with caching
- `getSectionData<T>(sectionType)` extracts typed data from sections
- Components use safe icon mapping (ICON_MAP) to prevent render crashes

### Admin Panel

**Access**
- URL: `/admin`
- Authentication: Replit Auth (only works on deployed/published apps, not in development preview)
- Protected routes: All admin mutating endpoints require authentication

**Features**
1. **Pages Tab**: Edit content sections for all pages (Home, Focus, Team, Portfolio, Contact)
2. **Team Tab**: Add, edit, delete team members with categories (GP, IC, APAC)
3. **Portfolio Tab**: Add, edit, delete portfolio companies with sectors (Cleantech, Techbio)
4. **Navigation Tab**: Manage header and footer navigation links
5. **Settings Tab**: Edit global settings (branding, footer, social links, newsletter text)
6. **Media Tab**: Upload and manage images/media files via Replit Object Storage

**Object Storage Integration**
- Uses Replit Object Storage for file uploads
- Upload flow: Get presigned URL → Upload to GCS → Finalize (set ACL) → Save metadata
- Files accessible at `/objects/{path}` endpoint
- Environment variables: `PRIVATE_OBJECT_DIR`, `PUBLIC_OBJECT_SEARCH_PATHS`

**Type Safety**
- Drizzle-zod integration for runtime schema validation
- Shared TypeScript types between client and server
- Insert schemas auto-generated from table definitions

### Content API Endpoints
- GET /api/sections/:pageId - Get all sections for a page
- POST /api/sections - Create new section (authenticated)
- PATCH /api/sections/:id - Update section (authenticated)
- DELETE /api/sections/:id - Delete section (authenticated)
- GET /api/navigation - Get all navigation links
- POST /api/navigation - Create navigation link (authenticated)
- PATCH /api/navigation/:id - Update navigation link (authenticated)
- DELETE /api/navigation/:id - Delete navigation link (authenticated)
- GET /api/settings - Get all global settings
- PATCH /api/settings/batch - Update multiple settings (authenticated)

### Development Workflow

**Hot Module Replacement**
- Vite dev server with middleware mode integrated into Express
- Template reloading on every request during development
- Replit-specific plugins for error overlay and dev tools

**Path Aliases**
- `@/` maps to `client/src/`
- `@shared/` maps to `shared/`
- `@assets/` maps to `attached_assets/`
- Configured across TypeScript, Vite, and bundler

**Code Organization**
- `client/`: React frontend application
- `server/`: Express backend and API routes
- `shared/`: Isomorphic code (schemas, types)
- `script/`: Build and deployment scripts

## External Dependencies

### UI & Styling
- **Radix UI**: Comprehensive set of accessible component primitives (@radix-ui/react-*)
- **Tailwind CSS**: Utility-first CSS framework with PostCSS
- **Framer Motion**: Animation library for React
- **class-variance-authority**: Type-safe variant styling
- **cmdk**: Command palette component
- **embla-carousel-react**: Carousel component

### Data Management
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Form validation integration
- **zod**: Runtime type validation and schema definition
- **drizzle-zod**: Zod schema generation from Drizzle tables

### Database & ORM
- **Drizzle ORM**: Type-safe SQL query builder
- **@neondatabase/serverless**: PostgreSQL driver for serverless environments
- **drizzle-kit**: CLI for migrations and schema management

### Routing & Navigation
- **wouter**: Lightweight routing library for React (client-side SPA)

### Development Tools
- **Vite**: Next-generation frontend build tool
- **tsx**: TypeScript execution for Node.js
- **esbuild**: JavaScript bundler for server code
- **@replit/vite-plugin-***: Replit-specific development enhancements

### Date & Utility
- **date-fns**: Modern date utility library
- **nanoid**: Unique ID generation
- **clsx / tailwind-merge**: Conditional className utilities

### Fonts (Google Fonts)
- Inter: Primary sans-serif
- DM Sans: Alternative sans-serif
- Playfair Display: Serif for headlines

### Design Assets
- Background images hosted on Wix static CDN
- Team member and portfolio company images from external sources
- Favicon and brand assets in public directory