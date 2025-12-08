# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Movers+Shakers Atomic Design System v2.0** - a complete component library and design system with interactive JavaScript components and dark mode support.

## File Structure

```
├── index.html          # Main design system reference (~5200 lines)
├── demo.html           # Interactive components demo page
├── atoms.html          # Atoms index page
├── molecules.html      # Molecules index page
├── organisms.html      # Organisms index page
├── atoms/              # Individual atom component files
│   ├── typography.html
│   ├── buttons.html
│   ├── forms.html
│   ├── badges.html
│   ├── avatars.html
│   └── loaders.html
├── tokens/             # Design tokens (CSS custom properties)
│   ├── index.css       # Main import file
│   ├── colors.css      # Brand & semantic colors
│   ├── typography.css  # Font scales & base styles
│   ├── spacing.css     # Spacing scale
│   ├── shadows.css     # Brand shadow utilities
│   ├── borders.css     # Border radius tokens
│   ├── z-index.css     # Z-index scale
│   ├── transitions.css # Transition timing
│   ├── patterns.css    # Decorative patterns
│   ├── dark-mode.css   # Dark mode tokens & utilities
│   └── tokens.json     # JSON export for tooling
├── js/
│   └── components.js   # Interactive component library (~1050 lines)
├── docs/
│   └── index.html      # Component documentation
├── molecules/          # (placeholder for component extraction)
└── organisms/          # (placeholder for component extraction)
```

## Technology Stack

- **HTML5** with CSS custom properties
- **Tailwind CSS** via CDN (`https://cdn.tailwindcss.com`)
- **Lucide Icons** via unpkg CDN
- **Google Fonts**: Oswald (headings) and Inter (body text)
- **Vanilla JavaScript** for interactive components

## JavaScript Components (`js/components.js`)

Interactive components accessible via `window.MSDesignSystem`:

| Component | Data Attributes | Description |
|-----------|-----------------|-------------|
| Modal | `data-modal`, `data-modal-trigger`, `data-modal-close` | Dialog with backdrop, ESC close, focus trap |
| Dropdown | `data-dropdown`, `data-dropdown-trigger`, `data-dropdown-item` | Menu with keyboard nav (arrows) |
| Tabs | `data-tabs`, `data-tab`, `data-tab-panel` | Tab switching with arrow key nav |
| Accordion | `data-accordion`, `data-accordion-trigger`, `data-accordion-panel` | Collapsible panels, single/multi mode |
| Toast | Programmatic: `MSDesignSystem.Toast.success(msg)` | Notification system with auto-dismiss |
| FormValidator | `data-validate`, `data-rules`, `data-field` | Real-time validation |
| MobileMenu | `data-mobile-menu`, `data-mobile-menu-trigger` | Responsive menu toggle |
| Tooltip | `data-tooltip`, `data-tooltip-position` | Hover tooltips (top/bottom/left/right) |
| PasswordToggle | `data-password-toggle` | Show/hide password field |
| DarkMode | `data-theme-toggle`, `data-theme-icon` | Theme switching with persistence |

### Dark Mode

```html
<!-- Toggle button -->
<button data-theme-toggle>
    <i data-lucide="sun" data-theme-icon="light"></i>
    <i data-lucide="moon" data-theme-icon="dark" class="hidden"></i>
</button>
```

```javascript
// JavaScript API
MSDesignSystem.DarkMode.toggle();
MSDesignSystem.DarkMode.setTheme('dark');
MSDesignSystem.DarkMode.isDark(); // returns boolean
```

### Validation Rules

Use `data-rules` attribute with pipe-separated rules:
- `required` - Field must have value
- `email` - Valid email format
- `minLength:n` - Minimum n characters
- `maxLength:n` - Maximum n characters
- `pattern:regex` - Match regex pattern
- `match:fieldId` - Match another field's value

Example: `data-rules="required|email"` or `data-rules="required|minLength:8"`

## Design Tokens

### Core Colors
- `--color-brand-yellow: #FFF000` (primary brand color)
- `--color-brand-black: #111111`
- `--color-brand-white: #FFFFFF`

### Theme-Aware Variables (for dark mode)
- `--color-bg-primary` / `--color-bg-secondary` / `--color-bg-tertiary`
- `--color-text-primary` / `--color-text-secondary` / `--color-text-tertiary`
- `--color-border-primary` / `--color-border-secondary`
- `--color-surface-card` / `--color-surface-elevated`

### Brand Shadows (distinctive offset style)
- `--shadow-sm/md/lg/xl`: Black offset shadows
- `--shadow-yellow-sm/md/lg`: Yellow accent shadows

### Utility Classes
- `.bg-brand-yellow`, `.text-brand-yellow`, `.border-brand-yellow`
- `.shadow-brand-sm/md/lg/xl`, `.shadow-brand-yellow-sm/md/lg`
- `.brand-font` (applies Oswald uppercase heading style)
- `.bg-theme-primary`, `.text-theme-primary` (theme-aware)

## Development

- Open `index.html` for full design system reference
- Open `demo.html` for interactive component demos
- Open `docs/index.html` for component documentation
- Open individual atom files in `atoms/` for isolated components
- No build process required

Initialize icons after page load: `lucide.createIcons()`

## Architecture

The design system follows **Atomic Design methodology**:

### 01 — Atoms (index.html line ~404)
Typography, Buttons, Form Elements, Badges/Tags, Avatars, Loaders/Spinners, Icons, Dividers

### 02 — Molecules (index.html line ~1986)
Cards, Alerts/Notifications, Navigation Components, Modals/Dialogs, Dropdowns/Menus, Tooltips/Popovers, Tables, Accordions, List Groups

### 03 — Organisms (index.html line ~3794)
Navigation Bars, Hero Sections, Feature Sections, Footer, Sidebar/Drawer, Complete Forms, Empty States, Error Pages
