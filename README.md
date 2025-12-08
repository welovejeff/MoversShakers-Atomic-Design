# Movers+Shakers Atomic Design System v2.0

A complete component library and design system built with HTML, CSS, and vanilla JavaScript. Features interactive components, dark mode support, and follows the **Atomic Design methodology**.

![Made with Love](https://img.shields.io/badge/Made%20with-❤️-yellow)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

---

## 📁 Project Structure

```
├── index.html              # Main design system reference (~5200 lines)
├── demo.html               # Interactive components demo page
├── atoms.html              # Atoms index page
├── molecules.html          # Molecules index page  
├── organisms.html          # Organisms index page
├── interfaces.html         # Web Application Interfaces hub page
│
├── atoms/                  # Individual atom component files
│   ├── typography.html     # Headings, paragraphs, text styles
│   ├── buttons.html        # Button variants and states
│   ├── forms.html          # Form inputs, selects, checkboxes
│   ├── badges.html         # Tags, labels, status indicators
│   ├── avatars.html        # User avatars and placeholders
│   └── loaders.html        # Spinners and loading states
│
├── molecules/              # Molecule component files ✓
│   ├── cards.html          # Content cards, pricing, profile cards
│   ├── alerts.html         # Notifications, toasts, banners
│   ├── navigation.html     # Breadcrumbs, tabs, pagination, steppers
│   ├── modals.html         # Dialog boxes and overlays
│   ├── dropdowns.html      # Menu dropdowns, context menus
│   └── tables.html         # Data tables with sorting/selection
│
├── organisms/              # Organism component files ✓
│   ├── navigation-bars.html # Primary, light, search, overlay navs
│   ├── hero-sections.html  # Centered, split, full-width heroes
│   ├── feature-sections.html # Feature grid, stats, testimonials
│   ├── footer.html         # Full, simple, CTA footers
│   ├── sidebar.html        # App sidebar, mobile drawer
│   ├── forms.html          # Contact, login, registration forms
│   ├── empty-states.html   # No data, error, upload states
│   └── error-pages.html    # 404, 500, maintenance pages
│
├── interfaces/             # Web Application Interface patterns ✓
│   ├── ai-generation/      # Chat, image generation, multi-modal input
│   ├── project-management/ # Kanban, list, timeline, calendar views
│   ├── masonry-grid/       # Pinterest-style layouts, galleries
│   ├── whiteboard/         # FigJam-style infinite canvas
│   ├── strategic-research/ # AI-powered research interfaces
│   └── shared-utilities/   # Cross-interface utility components
│       ├── index.html      # Shared utilities overview
│       ├── command-palette.html  # ⌘K quick actions
│       ├── context-menu.html     # Right-click menus
│       ├── drag-drop.html        # Drag-and-drop utilities
│       ├── toasts.html           # Toast notifications
│       ├── modals.html           # Modal dialogs
│       └── presence.html         # User presence indicators
│
├── tokens/                 # Design tokens (CSS custom properties)
│   ├── index.css           # Main import file
│   ├── colors.css          # Brand & semantic colors
│   ├── typography.css      # Font scales & base styles
│   ├── spacing.css         # Spacing scale
│   ├── shadows.css         # Brand shadow utilities
│   ├── borders.css         # Border radius tokens
│   ├── z-index.css         # Z-index scale
│   ├── transitions.css     # Transition timing
│   ├── patterns.css        # Decorative patterns
│   ├── dark-mode.css       # Dark mode tokens & utilities
│   └── tokens.json         # JSON export for tooling
│
├── packages/               # Framework component libraries ✓
│   ├── react/              # React + TypeScript + Vite library
│   │   ├── src/atoms/      # Button, Badge, Avatar, Loader, Input, Typography
│   │   ├── src/molecules/  # Card, Alert, Modal, Dropdown, Tabs, Table
│   │   ├── src/organisms/  # Navbar, Hero, Footer, Sidebar, EmptyState
│   │   ├── src/hooks/      # useTheme, useToast
│   │   └── dist/           # Built output
│   └── web-components/     # Lit-based Web Components
│       ├── src/            # ms-button, ms-badge, ms-avatar, ms-card, ms-alert, ms-modal
│       └── dist/           # Built output
│
├── js/
│   └── components.js       # Interactive component library (~1050 lines)
│
├── docs/
│   └── index.html          # Component documentation
│
├── .firebase/              # Firebase hosting cache
├── .github/                # GitHub workflows
├── firebase.json           # Firebase configuration
└── CLAUDE.md               # AI assistant guidance
```

---

## 🚀 Quick Start

No build process required! Simply open any HTML file:

```bash
# Open the main design system
open index.html

# Or start a local server
npx serve .
```

### Dependencies (CDN)

- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- [Lucide Icons](https://lucide.dev) - Beautiful icons
- [Google Fonts](https://fonts.google.com) - Oswald & Inter

---

## 🎨 Design Tokens

### Core Brand Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-brand-yellow` | `#FFF000` | Primary brand color |
| `--color-brand-black` | `#111111` | Text, backgrounds |
| `--color-brand-white` | `#FFFFFF` | Light backgrounds |

### Theme-Aware Variables

```css
/* Background colors */
--color-bg-primary
--color-bg-secondary
--color-bg-tertiary

/* Text colors */
--color-text-primary
--color-text-secondary
--color-text-tertiary

/* Surface colors */
--color-surface-card
--color-surface-elevated
```

### Utility Classes

```html
<!-- Brand colors -->
<div class="bg-brand-yellow text-brand-black">
<div class="border-brand-yellow">

<!-- Brand shadows -->
<div class="shadow-brand-md">
<div class="shadow-brand-yellow-lg">

<!-- Theme-aware -->
<div class="bg-theme-primary text-theme-primary">
```

---

## 🧩 JavaScript Components

Interactive components accessible via `window.MSDesignSystem`:

| Component | Data Attributes | Description |
|-----------|-----------------|-------------|
| **Modal** | `data-modal`, `data-modal-trigger`, `data-modal-close` | Dialog with ESC close |
| **Dropdown** | `data-dropdown`, `data-dropdown-trigger` | Menu with keyboard nav |
| **Tabs** | `data-tabs`, `data-tab`, `data-tab-panel` | Tab switching |
| **Accordion** | `data-accordion`, `data-accordion-trigger` | Collapsible panels |
| **Toast** | Programmatic API | Notification system |
| **Tooltip** | `data-tooltip`, `data-tooltip-position` | Hover tooltips |
| **DarkMode** | `data-theme-toggle` | Theme switching |

### Dark Mode Toggle

```html
<button data-theme-toggle>
    <i data-lucide="sun" data-theme-icon="light"></i>
    <i data-lucide="moon" data-theme-icon="dark" class="hidden"></i>
</button>
```

```javascript
MSDesignSystem.DarkMode.toggle();
MSDesignSystem.DarkMode.setTheme('dark');
MSDesignSystem.DarkMode.isDark(); // returns boolean
```

### Toast Notifications

```javascript
MSDesignSystem.Toast.success('Operation completed!');
MSDesignSystem.Toast.error('Something went wrong');
MSDesignSystem.Toast.warning('Please check your input');
MSDesignSystem.Toast.info('Did you know?');
```

---

## 📐 Atomic Design Structure

### Atoms (Foundational)
Typography, Buttons, Form Elements, Badges, Avatars, Loaders, Icons, Dividers

### Molecules (Simple Components)
Cards, Alerts, Navigation, Modals, Dropdowns, Tooltips, Tables, Accordions

### Organisms (Complex Components)
Navigation Bars, Hero Sections, Feature Sections, Footers, Sidebars, Forms

---

## 🗺️ Roadmap

### ~~Phase 1: Molecule Component Extraction~~ ✅ Complete

Created individual HTML files in `molecules/` directory:

| File | Components |
|------|------------|
| `cards.html` | Content containers, pricing cards, profile cards |
| `alerts.html` | Success, warning, error, info notifications |
| `navigation.html` | Breadcrumbs, tabs, pagination, steppers |
| `modals.html` | Dialog boxes with code examples |
| `dropdowns.html` | Menu dropdowns with code examples |
| `tables.html` | Data tables with sorting, selection states |

---

### ~~Phase 2: Organism Component Extraction~~ ✅ Complete

Created individual HTML files in `organisms/` directory:

| File | Components |
|------|------------|
| `navigation-bars.html` | Primary header, secondary nav, mobile nav |
| `hero-sections.html` | Various hero layouts and CTAs |
| `feature-sections.html` | Feature grids, stats blocks, testimonials |
| `footer.html` | Site footers with link columns, CTAs |
| `sidebar.html` | Application sidebars, drawer navigation |
| `forms.html` | Complete form layouts (contact, login, signup) |
| `empty-states.html` | No data, no results, first-time user states |
| `error-pages.html` | 404, 500, maintenance pages |

---

### ~~Phase 3: Web Application Interfaces~~ ✅ Complete

Created complete interface patterns in `interfaces/` directory:

| Interface | Directory | Description |
|-----------|-----------|-------------|
| **AI Generation** | `interfaces/ai-generation/` | Chat interfaces, image generation grids, multi-modal input |
| **Project Management** | `interfaces/project-management/` | Kanban boards, list views, timelines, calendars |
| **Masonry Grid** | `interfaces/masonry-grid/` | Pinterest-style layouts, justified galleries |
| **Whiteboard** | `interfaces/whiteboard/` | FigJam-style infinite canvas, collaboration tools |
| **Strategic Research** | `interfaces/strategic-research/` | AI-powered research, competitive audits, trends |
| **Shared Utilities** | `interfaces/shared-utilities/` | Cross-interface utility components |

---

#### Shared Utilities ✅ Complete

Created individual HTML files in `interfaces/shared-utilities/`:

| File | Components |
|------|------------|
| `command-palette.html` | ⌘K quick actions, keyboard navigation, fuzzy search |
| `context-menu.html` | Right-click menus, nested submenus, keyboard shortcuts |
| `drag-drop.html` | Reusable DnD utilities, drop zones, sortable lists |
| `toasts.html` | Toast notifications, success/error/warning/info variants |
| `modals.html` | Confirmation dialogs, action confirmations, modal overlays |
| `presence.html` | Real-time user presence indicators, collaborative cursors |

---

### ~~Phase 4: Framework Integration~~ ✅ Complete

Created framework-specific component libraries in `packages/`:

#### React + TypeScript + Vite (`packages/react/`)

| Category | Components |
|----------|------------|
| **Atoms** | Button, Badge, Avatar, Loader, Input, Typography |
| **Molecules** | Card, Alert, Modal, Dropdown, Tabs, Table |
| **Organisms** | Navbar, Hero, Footer, Sidebar, EmptyState |
| **Hooks** | useTheme, useToast |

```bash
# Build the React library
cd packages/react && npm run build
```

---

#### Web Components with Lit (`packages/web-components/`)

| Element | Description |
|---------|-------------|
| `<ms-button>` | Button with variants, sizes, loading state |
| `<ms-badge>` | Status badges with semantic variants |
| `<ms-avatar>` | User avatars with image/initials fallback |
| `<ms-card>` | Content cards with slots |
| `<ms-alert>` | Alert messages with dismiss |
| `<ms-modal>` | Modal dialogs |

```bash
# Build the Web Components library
cd packages/web-components && npm run build
```

---

## 🛠️ Development

```bash
# Start local server
npx serve . -p 3000

# Open in browser
open http://localhost:3000

# Initialize icons after page load
lucide.createIcons()
```

---

## 📚 Documentation

- `index.html` - Full design system reference
- `demo.html` - Interactive component demos
- `docs/index.html` - Component documentation
- `CLAUDE.md` - AI assistant guidance

---

## 🔥 Deployment

This project is configured for Firebase Hosting:

```bash
# Deploy to Firebase
firebase deploy
```

---

## 📄 License

© Movers+Shakers. All rights reserved.
