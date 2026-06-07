---
name: Obsidian Pipeline
colors:
  surface: '#10131a'
  surface-dim: '#10131a'
  surface-bright: '#363940'
  surface-container-lowest: '#0b0e14'
  surface-container-low: '#191c22'
  surface-container: '#1d2026'
  surface-container-high: '#272a31'
  surface-container-highest: '#32353c'
  on-surface: '#e1e2eb'
  on-surface-variant: '#cbc3d7'
  inverse-surface: '#e1e2eb'
  inverse-on-surface: '#2e3037'
  outline: '#958ea0'
  outline-variant: '#494454'
  surface-tint: '#d0bcff'
  primary: '#d0bcff'
  on-primary: '#3c0091'
  primary-container: '#a078ff'
  on-primary-container: '#340080'
  inverse-primary: '#6d3bd7'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#00a572'
  on-tertiary-container: '#00311f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#d0bcff'
  on-primary-fixed: '#23005c'
  on-primary-fixed-variant: '#5516be'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#10131a'
  on-background: '#e1e2eb'
  surface-variant: '#32353c'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style
The design system is engineered for a high-performance, developer-centric environment. It balances the raw, technical efficiency of a Command Line Interface with the sophisticated visual hierarchy of a modern web application. 

The aesthetic is **Cyber-Industrial Minimalism**. It utilizes a deep, obsidian-based dark mode to reduce eye strain during long engineering sessions, punctuated by high-energy neon accents that signify system activity and data flow. The emotional response is one of precision, reliability, and "supercharged" productivity. Visual metaphors lean into terminal emulators and IDEs, using subtle glassmorphism to provide depth without sacrificing the "flat" utility expected by technical users.

## Colors
This design system operates on a primary **Dark Mode** foundation. 

- **Base Canvas:** The core background is a deep charcoal (#0B0E14), providing a high-contrast floor for text.
- **Accents:** Electric Violet (#8B5CF6) is the primary action color, used for CTA buttons and active states. Cyan (#06B6D4) serves as the secondary accent for data visualization, links, and "info" status.
- **System States:** Success states use a vibrant Emerald (#10B981), while errors utilize a high-visibility Red-Orange (#EF4444).
- **Surfaces:** UI containers use a slightly lighter "Surface" tint (#161B22) with semi-transparent overlays to create the glassmorphic effect.

## Typography
The typography system prioritizes legibility and technical context. 

**Inter** is the primary typeface for all UI elements, headings, and instructional text, chosen for its exceptional clarity and modern geometric construction. 

**JetBrains Mono** is reserved for code blocks, terminal outputs, and system labels (e.g., status badges, timestamps). This monospaced font reinforces the engineering-focused nature of the product. 

For large displays, headings should use tight letter spacing to maintain a "compact" and professional look. Small labels in JetBrains Mono should be all-caps with increased letter spacing to maximize readability in dense data environments.

## Layout & Spacing
The layout follows a **Rigid Fluid Grid**. On desktop, a 12-column grid is used with a fixed max-width of 1280px to prevent excessive line lengths. 

- **The Pipeline View:** The central feature uses a 4-column layout (one per stage) that collapses into a single-column vertical stack on mobile devices.
- **Vertical Rhythm:** A base-4 spacing system ensures all elements are mathematically aligned. Use 24px (md) for standard component margins and 64px (xl) for section-level separation.
- **Safe Areas:** Maintain a minimum 24px margin on mobile devices to prevent content from hitting the edge of the glass.

## Elevation & Depth
Elevation is not conveyed through heavy shadows, but through **Tonal Layering** and **Glassmorphism**.

1.  **Level 0 (Base):** #0B0E14 (Solid).
2.  **Level 1 (Cards):** #161B22 with a 1px border (#30363D). Use a subtle backdrop blur (12px) if content is scrolling underneath.
3.  **Level 2 (Modals/Popovers):** #1C2128 with a subtle Cyan (#06B6D4) outer glow (0px 0px 15px 0px) at 10% opacity to suggest "active" focus.

Outer borders on cards should be "Inner" aligned to keep the grid perfectly crisp. Avoid drop shadows on primary buttons; use a solid 2px offset "brutalist-lite" shadow or a subtle glow for hover states instead.

## Shapes
This design system utilizes **Soft edges (0.25rem / 4px)** to maintain a disciplined, "hardware-inspired" aesthetic. 

- **Standard Buttons & Inputs:** 4px border radius.
- **Large Container Cards:** 8px border radius (rounded-lg).
- **Status Indicators:** Fully circular (pill-shaped) for "Live" pulses, but square for "System Stop" icons.

The lack of extreme rounding ensures the UI feels like a professional tool rather than a consumer social app.

## Components

### Buttons
- **Primary:** Electric Violet background, white text. No border. On hover, apply a 20px Cyan glow.
- **Ghost:** Transparent background, 1px Cyan border, Cyan text.
- **Icon Buttons:** Square 1:1 ratio, 4px radius, monochromatic grey text, turning Violet on hover.

### Terminal Containers
Used for process logs. Black (#000000) background, 1px solid #30363D border, JetBrains Mono text. Include a "Header" bar with three window control dots (red, yellow, green) to mimic a CLI window.

### Status Indicators
Small 8px circles. Use an "animate-pulse" effect for active pipeline stages using the Cyan (#06B6D4) color.

### Input Fields
Dark backgrounds (#0B0E14), 1px border. Focus state changes border to Electric Violet with a 0px 0px 0px 2px violet-tinted shadow.

### Cards
Glassmorphic: `background: rgba(22, 27, 34, 0.7)`, `backdrop-filter: blur(10px)`, `border: 1px solid rgba(255, 255, 255, 0.1)`.

### Pipeline Stage Markers
Large numbers (01, 02, etc.) in JetBrains Mono, 40% opacity, placed behind headline text to indicate sequence without cluttering the foreground.