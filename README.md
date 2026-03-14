# EireID — Frontend Repository

---

## Table of Contents

- [Project Structure](#project-structure)
- [Design System — `common.css`](#design-system--commoncss)
  - [CSS Variables (Design Tokens)](#css-variables-design-tokens)
  - [Reset & Base Styles](#reset--base-styles)
  - [Layout Utility: `.container`](#layout-utility-container)
  - [Brand Utilities: `.logo-box` & `.logo-box--glass`](#brand-utilities-logo-box--logo-boxglass)
  - [`.pulse-animation`](#pulse-animation)
  - [Keyframe Animations](#keyframe-animations)
  - [Using Variables — Example](#using-variables--example)
- [Git Workflow for the Team](#git-workflow-for-the-team)

---

## Project Structure

```
EireId/
├── index.html
├── pages/
│   ├── resident.html
│   ├── business.html
│   └── investor.html
├── css/
│   ├── common.css        ← Design system base (start here)
│   └── styles.css        ← Page & component styles
├── js/
│   └── scripts.js
└── assets/
    ├── logo/
    ├── img/
    └── services_logo/
```

---

## Design System — `common.css`

`common.css` is the **single source of truth** for the EireID visual identity. Every other stylesheet should import or follow the tokens defined here. It contains:

1. CSS custom properties (variables / design tokens)
2. A universal box-model reset
3. Global `html` and `body` base styles (including the animated brand gradient)
4. The `.container` layout wrapper
5. Reusable brand utility classes (`.logo-box`, `.logo-box--glass`, `.pulse-animation`)
6. All shared `@keyframes` animations

**Always link `common.css` before any other stylesheet:**

```html
<link rel="stylesheet" href="css/common.css">
<link rel="stylesheet" href="css/styles.css">
```

---

### CSS Variables (Design Tokens)

All variables are declared on `:root` so they are globally available. There are six token groups:

---

#### Colors

| Variable | Value | Usage |
|---|---|---|
| `--color-bg-primary` | `#a4e5b7` | Brand green — highlights, accents, active states |
| `--color-text-heading` | `#000000` | Headings, strong UI labels |
| `--color-text-body` | `#1a1a1a` | Paragraph and body text |
| `--color-text-muted` | `#333333` | Captions, secondary text, placeholders |
| `--color-border` | `#000000` | Hard borders |
| `--color-btn-primary` | `#000000` | Primary button background |
| `--color-btn-hover` | `#1a1a1a` | Primary button hover state |

---

#### Typography

| Variable | Value | Notes |
|---|---|---|
| `--font-family-base` | `'Lato', sans-serif` | Applied to `body` — never override at component level unless essential |
| `--font-size-xs` | `0.75rem` | 12px — tiny labels |
| `--font-size-sm` | `0.875rem` | 14px — captions, nav links |
| `--font-size-base` | `1rem` | 16px — default body text |
| `--font-size-lg` | `1.125rem` | 18px — slightly elevated body |
| `--font-size-xl` | `1.25rem` | 20px — subtitles |
| `--font-size-2xl` | `1.5rem` | 24px — tile headers |
| `--font-size-3xl` | `2rem` | 32px — section titles |
| `--font-size-4xl` | `3rem` | 48px — stat numbers |
| `--font-size-hero` | `clamp(2rem, 3.5vw, 3.25rem)` | Fluid hero heading — scales with viewport |

---

#### Spacing

All spacing tokens follow a linear scale. Use these instead of raw `px` or `rem` values.

| Variable | Value | Approx. px |
|---|---|---|
| `--space-xs` | `0.25rem` | 4px |
| `--space-sm` | `0.5rem` | 8px |
| `--space-md` | `1rem` | 16px |
| `--space-lg` | `1.5rem` | 24px |
| `--space-xl` | `2.5rem` | 40px |
| `--space-2xl` | `3rem` | 48px |
| `--space-3xl` | `4rem` | 64px |
| `--space-section` | `clamp(3rem, 8vw, 6rem)` | Fluid section gap |

---

#### Layout

| Variable | Value | Usage |
|---|---|---|
| `--container-max` | `1280px` | Maximum width of the `.container` wrapper |
| `--container-padding` | `clamp(1rem, 5vw, 2rem)` | Fluid horizontal padding on `.container` |

---

#### Border Radius

| Variable | Value | Typical use |
|---|---|---|
| `--radius-sm` | `6px` | Buttons, small chips |
| `--radius-md` | `12px` | Cards, dropdowns, input fields |
| `--radius-lg` | `24px` | Section containers, large tiles |
| `--radius-full` | `9999px` | Pill shapes, circles |

---

#### Shadows

| Variable | Value | When to use |
|---|---|---|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.08)` | Subtle depth — small elements |
| `--shadow-md` | `0 4px 16px rgba(0,0,0,0.12)` | Default card elevation |
| `--shadow-lg` | `0 12px 32px rgba(0,0,0,0.16)` | Modals, overlays |
| `--shadow-hover` | `0 16px 40px rgba(0,0,0,0.20)` | Applied on `:hover` for lift effect |

---

#### Transitions

| Variable | Value | Usage |
|---|---|---|
| `--transition-fast` | `150ms ease` | Colour/opacity changes |
| `--transition-base` | `250ms ease` | Most interactive elements |
| `--transition-slow` | `400ms ease` | Entrance animations, large state changes |

---

### Reset & Base Styles

```css
/* Universal box model reset */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Smooth anchor scrolling */
html { scroll-behavior: smooth; }
```

`body` is also styled globally with:

- `font-family` set to `--font-family-base`
- `color` set to `--color-text-body`
- `overflow-x: hidden` to prevent horizontal scroll on mobile
- The animated mesh-gradient background that defines the EireID look
- A full-page Irish harp SVG watermark via `body::before` (opacity `0.02` — purely decorative)

---

### Layout Utility: `.container`

The `.container` class is the root layout shell for every page. It centres content, enforces the max-width, and adds fluid horizontal padding.

```html
<div class="container">
  <!-- All page content goes here -->
</div>
```

Do not nest `.container` inside another `.container`.

---

### Brand Utilities: `.logo-box` & `.logo-box--glass`

#### `.logo-box`

A square icon tile used for logo badges and interactive cards. Comes with hover lift, focus ring, and staggered float animation for the first two children.

```html
<button class="logo-box logo-box--glass" aria-label="EireID Logo">
  <img src="assets/logo/logo(transparent).png" alt="EireID Logo">
</button>
```

#### `.logo-box--glass`

The **glassmorphism modifier** — the most widely reused class in the project. It can be applied to any surface that needs to float above the green brand gradient: tiles, nav dropdowns, modals, orbit items, cards, and more.

```html
<!-- Standalone glass card -->
<div class="logo-box--glass">
  <p>Some content</p>
</div>

<!-- Combined with a tile -->
<article class="about__tile logo-box--glass">
  …
</article>
```

Properties applied by `.logo-box--glass`:

| Property | Value |
|---|---|
| `background` | `rgba(255,255,255,0.35)` |
| `border` | `1px solid rgba(255,255,255,0.18)` |
| `backdrop-filter` | `blur(2.9px)` |
| `box-shadow` | `0 4px 30px rgba(0,0,0,0.10)` |
| `border-radius` | `16px` |

---

### `.pulse-animation`

Adds a looping glow pulse. Currently used on the orbit centre logo in the Service Hub tile.

```html
<div class="orbit-center logo-box--glass pulse-animation">
  <img src="assets/logo/logo(color).png" alt="EireID">
</div>
```

---

### Keyframe Animations

| Name | Effect | Used on |
|---|---|---|
| `fadeIn` | Fades element in | Header, AI modal |
| `translateYFadeIn` | Slides up + fades in | Hero section |
| `float` | Gentle vertical bob | Logo boxes, action chips |
| `gradientShift` | Slowly shifts background position | `body` mesh gradient |
| `scrollWheel` | Scroll-dot bounce loop | Scroll indicator in hero CTA |
| `orbitRotate` | Full 360° clockwise rotation | Service hub orbit ring |
| `orbitCounterRotate` | Counter-rotates icons to keep them upright | Individual orbit items |
| `pulseLogo` | Expanding glow ring | `.pulse-animation` class |

---

### Using Variables — Example

Here is a practical example of building a new page section using only design tokens. No raw values needed.

```html
<!-- new-section.html -->
<section class="feature-banner logo-box--glass">
  <h2 class="feature-banner__title">Coming Soon</h2>
  <p class="feature-banner__body">New features are on the way.</p>
  <button class="feature-banner__cta">Get Notified</button>
</section>
```

```css
/* feature-banner.css — uses only tokens from common.css */

.feature-banner {
  padding: var(--space-xl) var(--space-lg);       /* 40px 24px */
  border-radius: var(--radius-lg);               /* 24px */
  margin-top: var(--space-section);              /* fluid section gap */
  display: flex;
  flex-direction: column;
  gap: var(--space-md);                          /* 16px */
}

.feature-banner__title {
  font-size: var(--font-size-3xl);               /* 32px */
  font-weight: 700;
  color: var(--color-text-heading);              /* #000 */
}

.feature-banner__body {
  font-size: var(--font-size-base);              /* 16px */
  color: var(--color-text-muted);               /* #333 */
}

.feature-banner__cta {
  background: var(--color-btn-primary);          /* #000 */
  color: #fff;
  border: none;
  border-radius: var(--radius-full);             /* pill */
  padding: var(--space-sm) var(--space-xl);      /* 8px 40px */
  font-family: var(--font-family-base);
  font-size: var(--font-size-sm);                /* 14px */
  cursor: pointer;
  transition: background var(--transition-fast); /* 150ms ease */
  box-shadow: var(--shadow-md);
}

.feature-banner__cta:hover {
  background: var(--color-btn-hover);            /* #1a1a1a */
  box-shadow: var(--shadow-hover);
}
```

The result is a section that is automatically consistent with the rest of EireID. If a token value ever changes (for example, the brand green shifts), every component updates at once.

---

## Git Workflow for the Team

Follow these steps every time you make changes. Always work from a **feature branch** — never commit directly to `main`.

### 1. Before you start — pull the latest changes

```bash
git pull origin main
```

This syncs your local copy with whatever the team has pushed. Always do this first to avoid conflicts.

---

### 2. Create (or switch to) your feature branch

```bash
# Create a new branch and switch to it
git checkout -b your-name/feature-name

# Examples:
git checkout -b ivan/hero-section
git checkout -b trinabh/market-section
```

---

### 3. Stage your changes

`git add` tells Git which files to include in the next commit.

```bash
# Add a specific file
git add css/styles.css

# Add multiple files
git add index.html css/styles.css

# Add everything you changed (use carefully — review first)
git add .
```

To review what you are about to stage:

```bash
git status
```

---

### 4. Commit your changes

`git commit` saves a snapshot of your staged files with a message describing what you did.

```bash
git commit -m "Add hero section layout and CTA buttons"
```

**Write clear, specific commit messages.** Avoid vague messages like `"update"` or `"fix stuff"`.

Good examples:
- `"Add about section tile grid — mobile layout"`
- `"Fix nav dropdown z-index on mobile"`
- `"Add common.css design tokens and README"`

---

### 5. Push to GitHub

`git push` uploads your branch to the remote repository so teammates can see it.

```bash
git push origin your-name/feature-name
```

If it's your first push on this branch, Git may ask you to set the upstream. Just run the command it suggests, or use:

```bash
git push --set-upstream origin your-name/feature-name
```

---

### 6. Open a Pull Request on GitHub

Go to the repository on GitHub. You will see a banner prompting you to open a **Pull Request** from your branch into `main`. Add a short description of what you changed and request a review from Ivan (or whoever is consolidating).

---

### Quick Reference Card

| Command | What it does |
|---|---|
| `git pull origin main` | Download the latest team changes |
| `git checkout -b branch-name` | Create and switch to a new branch |
| `git status` | See which files have changed |
| `git add <file>` | Stage a file for commit |
| `git add .` | Stage all changed files |
| `git commit -m "message"` | Save a snapshot with a description |
| `git push origin branch-name` | Upload your branch to GitHub |

---

> **Questions?** Ping Ivan on the group chat or check [Git's official docs](https://git-scm.com/doc).
