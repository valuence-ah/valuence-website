# Venture Capital Firm Website Design Guidelines

## Design Approach: Reference-Based
Drawing inspiration from leading VC firms (Sequoia, a16z, Greylock) while maintaining originality. Focus on establishing trust, showcasing expertise, and highlighting portfolio success through bold typography, clean layouts, and data-driven storytelling.

## Typography System
**Primary Font**: Inter or DM Sans (Google Fonts) - professional, modern sans-serif  
**Secondary Font**: Playfair Display or Crimson Pro - sophisticated serif for headlines

**Hierarchy**:
- Hero Headlines: 4xl to 6xl, bold weight (700-800)
- Section Headers: 3xl to 4xl, semibold (600)
- Subsections: xl to 2xl, medium (500)
- Body Text: base to lg, regular (400)
- Captions/Labels: sm, medium (500)

## Layout System
**Spacing Primitives**: Tailwind units of 4, 6, 8, 12, 16, 20, 24, 32
- Section padding: py-20 md:py-32
- Component gaps: gap-8 to gap-12
- Card padding: p-6 to p-8
- Container: max-w-7xl with px-6

## Core Components

**Navigation**
- Sticky header with transparent-to-solid scroll transition
- Logo left, main nav center, CTA button right
- Links: Thesis, Team, Portfolio, Contact

**Hero Section (80vh)**
- Full-width background image with gradient overlay
- Large headline + supporting text (max-w-3xl centered)
- Primary CTA with blurred background (backdrop-blur-md)
- Scroll indicator at bottom

**Investment Thesis**
- Two-column layout (md:grid-cols-2)
- Left: Narrative text with mission statement
- Right: Key metrics cards (3-4 cards in grid)
- Bottom: Stage/sector focus badges or tags

**Portfolio Showcase**
- Masonry or grid layout (grid-cols-2 md:grid-cols-3 lg:grid-cols-4)
- Company cards with logo, name, category, funding round
- Hover effect reveals metrics (valuation, growth stats)
- Filter tags by sector/stage above grid

**Team Section**
- Grid layout (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Professional headshots (rounded or square, consistent)
- Name, title, bio preview
- LinkedIn icons, expand-to-modal for full bios

**Newsletter/Notifications**
- Sticky notification bar (top or bottom) for updates
- Newsletter signup: email input + subscribe button with confirmation message
- Contact form with fields: name, email, company, message
- Success states with email confirmation reminders

**Footer**
- Three-column layout: About/Links, Contact Info, Social
- Newsletter signup embedded
- Trust indicators (years established, # of investments)

## Component Specifications

**Cards**
- Rounded corners (rounded-lg to rounded-xl)
- Subtle shadows (shadow-md hover:shadow-lg transition)
- White/light backgrounds with borders

**Buttons**
- Primary: Solid with medium weight text, px-8 py-3
- Secondary: Outline style, same padding
- On images: backdrop-blur-md with semi-transparent background

**Form Inputs**
- Consistent height (h-12)
- Border with focus states
- Labels above inputs (text-sm font-medium)

**Icons**
- Use Heroicons via CDN
- Consistent size (w-6 h-6 for inline, w-12 h-12 for feature icons)

## Images

**Hero Image**: Full-width background image showing modern office space, team collaboration, or abstract tech visualization. Dark overlay (40-50% opacity) ensures text readability.

**Team Photos**: Professional headshots, consistent dimensions (square 400x400px), uniform lighting/background treatment.

**Portfolio Logos**: Company logos on white/transparent backgrounds, displayed at consistent sizes within cards.

**Thesis Section**: Abstract data visualization or strategic planning imagery supporting the narrative.

## Animations
Minimal and purposeful:
- Scroll-triggered fade-ins for sections (intersection observer)
- Smooth scroll between sections
- Hover scale on portfolio cards (scale-105)
- Header background transition on scroll

## Accessibility
- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus states on all interactive elements
- Alt text for all images