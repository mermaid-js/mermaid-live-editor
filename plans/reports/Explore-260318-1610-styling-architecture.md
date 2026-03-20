# Exploration Report: Mermaid Live Editor Styling & Diagram Rendering Architecture

**Date:** 2026-03-18  
**CWD:** /Users/trung.hoang/Desktop/mermaid-live-editor-beauty  
**Focus:** CSS/SCSS styling, mermaid configuration, SVG rendering, fonts, design tokens

---

## 1. CSS & Styling Architecture

### 1.1 Global Styles

**File:** `/src/app.css` (184 lines)  
**Key imports & structure:**

- Lines 1-3: Font & Tailwind imports
  - `@import '@fontsource-variable/recursive/crsv.css'` – loads Recursive Variable font
  - `@import 'tailwindcss'` – Tailwind CSS v4 via plugin
  - `@import 'tw-animate-css'` – animation utilities
- Lines 5: Custom dark mode variant `@custom-variant dark (&:is(.dark *))`
- Lines 7-76: Design token CSS variables (light & dark modes)
  - Light mode: `:root` (lines 18-47)
  - Dark mode: `.dark` class (lines 48-75)
  - Gradient variables (dark only): `--gradient-start`, `--gradient-end`
  - Sidebar variables (defined but used in theme config)
- Lines 78-124: Tailwind theme inline config
  - Radius scales: `--radius-sm` through `--radius-xl`
  - Color mappings for Tailwind utility generation
- Lines 126-139: Base layer styling
  - All elements: border-color defaults to CSS variable
  - Body: full-screen, overflow-hidden, background & foreground colors
  - Dark mode: linear gradient background (diagonal, start→end)
- Lines 141-147: Font family stack
  - `'Recursive Variable', system-ui, -apple-system, sans-serif`
- Lines 149-179: Scrollbar styling
  - Ultra-thin scrollbars (6px width/height)
  - Light mode: gray transparent (rgba(128,128,128,0.25))
  - Dark mode: white semi-transparent (rgba(255,255,255,0.1))
- Line 182-183: Debug class `.d` with red border

### 1.2 Tailwind Configuration

**Method:** Vite plugin (no separate config file)  
**File:** `/vite.config.js` line 22

- Integrated via `@tailwindcss/vite` v4.1.18
- Theme scales auto-generated from `/src/app.css` inline `@theme` block
- No custom `tailwind.config.ts` – all configuration in CSS

### 1.3 Color Palette (SotaTek Design)

**Test file:** `/src/lib/util/sotatek-colors.test.ts` (contains design definitions)

**Light mode palette (lines 41-50):**

- Primary: `hsl(214 100% 40%)` (#0052CC)
- Primary-light: `hsl(211 100% 50%)` (#007BFF)
- Accent/Info: `hsl(191 100% 43%)` (#00B4DB)
- Success: `hsl(134 61% 41%)` (#28A745)
- Background: `hsl(0 0% 100%)` (white)
- Foreground: `hsl(0 0% 10%)` (dark text)

**Dark mode palette (lines 55-63):**

- Primary: `hsl(214 100% 30%)` (#003399)
- Accent: `hsl(340 100% 44%)` (magenta) – **PLANNED CHANGE:** replace with `hsl(173 50% 45%)` (teal)
- Gradient-start: `hsl(214 100% 28%)` (#00358E)
- Gradient-end: `hsl(214 100% 50%)` (#0066FF)
- Background: `hsl(214 100% 28%)` (bright blue) – **PLANNED CHANGE:** replace with `hsl(222 47% 11%)` (deep navy)

---

## 2. Mermaid Configuration & Theme

### 2.1 Mermaid Initialization

**File:** `/src/lib/util/mermaid.ts` (64 lines)

- Line 6: `import mermaid from 'mermaid'` (v11.13.0)
- Lines 8-9: Register external layout loaders & diagram types
  - ELK layouts (`@mermaid-js/layout-elk`)
  - Tidy tree layouts (`@mermaid-js/layout-tidy-tree`)
  - ZenUML (`@mermaid-js/mermaid-zenuml`)
- Line 19: `mermaid.initialize(config)` called with MermaidConfig from state
- Line 20: `mermaid.render(id, code)` returns SVG

### 2.2 State-Managed Mermaid Config

**File:** `/src/lib/util/state.ts`

- Lines 25-27: Default state mermaid config
  - `theme: 'default'`
  - Stored as JSON string in state
- Lines 226-234: `toggleDarkTheme()` function
  - Updates config theme: dark → 'dark', light → 'default'
  - Preserves custom theme if already set
- Line 78: Config validated as JSON before state update
- **No themeVariables or themeCSS set** – uses mermaid's default theme only

### 2.3 Mermaid Config Type

**File:** `/src/lib/types.d.ts` line 10

- `import type { MermaidConfig } from 'mermaid'`
- Used in View component (line 10) and state processing

---

## 3. SVG Rendering Pipeline

### 3.1 Diagram Rendering & Display

**File:** `/src/lib/components/View.svelte` (179 lines)

**Rendering flow (lines 44-138):**

1. Line 85: Call `renderDiagram(config, code, viewID)` → returns `{svg, bindFunctions, diagramType}`
2. Lines 87-89: Inject SVG HTML into `#container` div
3. Lines 90-93: Query rendered SVG by ID
4. **If rough mode enabled (lines 94-110):**
   - Create `Svg2Roughjs` instance from svg2roughjs v3.2.1
   - Call `await svg2roughjs.sketch()` to hand-draw effect
   - Rewrite ID to 'graph-div', set height/width 100%, viewBox from original
5. **If rough mode disabled (lines 111-117):**
   - Set SVG height 100%, maxWidth 100%
   - Call `bindFunctions(graphDiv)` if present (for interactive elements)
6. Lines 118-120: If panZoom enabled, call `handlePanZoom()` with state

**Grid styling (lines 164-177):**

- Class `.grid-bg-light`: `linear-gradient` (24px grid, gray lines)
- Class `.grid-bg-dark`: `linear-gradient` (24px grid, white semi-transparent)
- Conditionally applied: `grid-bg-${$mode}` where `$mode` is from `mode-watcher`

### 3.2 Rough.js Hand-Drawn Mode

**File:** `/src/lib/components/View.svelte` line 13

- Import: `import { Svg2Roughjs } from 'svg2roughjs'`
- Dependency: `svg2roughjs: ^3.2.1`

**File:** `/src/lib/components/Actions.svelte` (243 lines)

- Lines 31-34: Fix for text clipping in rough mode
  - svg2roughjs copies `foreignObject` elements with insufficient height
  - Solution: expand height by 1.5x, center HTML content
  - Applied before exporting SVG
- Lines 83-85: Check `$stateStore.rough` before text clipping fix
- Line 109: Toggle `$inputStateStore.panZoom = false` during export

**State toggle:**

- `/src/lib/util/state.ts` line 29: `rough: false` (default)
- `/src/lib/components/SyncRoughToolbar.svelte`: Toggle switch to enable rough mode

---

## 4. Pan/Zoom Implementation

### 4.1 SVG Pan-Zoom Library

**File:** `/src/lib/util/panZoom.ts` (158 lines)

**Dependency:** `svg-pan-zoom: 3.6.2`  
**Integration:**

- Line 4: `import panzoom from 'svg-pan-zoom'`
- Lines 30-99: Configure with options
  - `center: true, controlIconsEnabled: false, fit: true`
  - `minZoom: 0.2, maxZoom: 12`
  - Custom event handler using HammerJS for touch gestures
  - Hammer for pan/pinch zoom on touch devices
  - Lines 52: `hammer.get('pinch').set({ enable: true })`
  - Lines 70-72: Prevent default touch movement
- Lines 81-96: onPan/onZoom callbacks update state
- Line 154: Reset zoom to 0.875 to avoid toolbar overlap

**Touch gestures:**

- Pan: Hammer `panstart`, `panmove`
- Pinch: Hammer `pinchstart`, `pinchmove`
- Wheel: HammerJS events via customEventsHandler

**File:** `/src/lib/components/PanZoomToolbar.svelte`

- Buttons to manually: reset(), zoomIn(), zoomOut()
- Part of floating toolbar with glassmorphism styling

---

## 5. Font Management

### 5.1 Recursive Variable Font

**Source:** `@fontsource-variable/recursive: ^5.2.5`  
**Import:** `/src/app.css` line 1: `@import '@fontsource-variable/recursive/crsv.css'`  
**Usage:** `/src/app.css` lines 141-146

```css
body {
  font-family:
    'Recursive Variable',
    system-ui,
    -apple-system,
    sans-serif;
}
```

### 5.2 Code Editor Fonts

**Monaco Editor** (desktop):

- `/src/lib/components/DesktopEditor.svelte` line 10
- Import: `import * as monaco from 'monaco-editor'`
- No custom font set – uses Monaco defaults

**CodeMirror** (mobile):

- `/src/lib/components/MobileEditor.svelte` lines 1-12
- No custom font configuration visible

### 5.3 Icon Fonts

**FontAwesome:**

- `/src/lib/components/FontAwesome.svelte`
- `/src/lib/components/Actions.svelte` line 16: `import { version as FAVersion } from '@fortawesome/fontawesome-free/package.json'`
- Version injected into exported SVG URL (line 23): `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/${FAVersion}/css/all.min.css`

**Iconify collections:**

- `@iconify-json/material-symbols: ^1.2.20`
- `@iconify-json/mdi: ^1.2.3`
- Used via `unplugin-icons` in Vite config

---

## 6. Dark Mode Implementation

### 6.1 Mode Watcher Integration

**Library:** `mode-watcher: ^0.5.1`  
**Usage across project:**

- `/src/lib/components/MainMenu.svelte` lines 9, 129-130
  - `import { mode, setMode } from 'mode-watcher'`
  - Switch component calls `setMode(dark ? 'dark' : 'light')`
- `/src/lib/components/View.svelte` line 11
  - `import { mode } from 'mode-watcher'`
  - Used in line 158: `grid-bg-${$mode}` class binding
- `/src/lib/components/DesktopEditor.svelte` line 9
- `/src/lib/components/MobileEditor.svelte` line 13
- `/src/lib/components/ThemeIcon.svelte`
- `/src/lib/components/ui/sonner/sonner.svelte`

### 6.2 CSS Variable Switching

- Light mode: `:root` variables (lines 18-47 in app.css)
- Dark mode: `.dark` class variables (lines 48-75 in app.css)
- Applied via HTML element class toggle (managed by mode-watcher)

---

## 7. Editor & Code Mirror Themes

### 7.1 Mobile Editor (CodeMirror)

**File:** `/src/lib/components/MobileEditor.svelte`

- Line 10: `import { vsCodeDark } from '@fsegurai/codemirror-theme-vscode-dark'`
- Line 11: `import { vsCodeLight } from '@fsegurai/codemirror-theme-vscode-light'`
- Lines 59-62: Theme switches via compartment based on `mode` store
  ```typescript
  editorView?.dispatch({
    effects: themeCompartment.reconfigure(mode === 'dark' ? vsCodeDark : vsCodeLight)
  });
  ```

### 7.2 Desktop Editor (Monaco)

**File:** `/src/lib/components/DesktopEditor.svelte`

- No theme configuration visible
- Monaco uses default editor themes
- **Note:** Theme setup may be in monacoExtra.ts but not visible in current code

---

## 8. Component Styling Examples

### 8.1 FloatingToolbar

**File:** `/src/lib/components/FloatingToolbar.svelte` (15 lines)

```html
<div
  class="border-glass-border bg-glass-bg flex h-12 items-center justify-between gap-2 rounded-2xl border p-3 shadow-lg backdrop-blur-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]"></div>
```

- Glassmorphism: `bg-glass-bg` (hsl(0 0% 100% / 0.7) light, rgba(255,255,255,0.04) dark)
- Blur: `backdrop-blur-xl`
- Border: `border-glass-border`

### 8.2 View Container Grid

**File:** `/src/lib/components/View.svelte` lines 153-162

```html
<div
  id="view"
  class="grid-bg-${$mode} ${error && 'opacity-50'} h-full w-full transition-[background-image] duration-300">
  <div id="container" class="h-full overflow-auto"></div>
</div>
```

- Dynamic grid background class
- Smooth transition on mode change
- Error opacity feedback

### 8.3 Canvas Sizing

- SVG set to `height: 100%`, `maxWidth: 100%`
- Container: `overflow-auto`
- Viewbox preserved for rough mode dimension handling

---

## 9. Build & Deployment

### 9.1 Vite Build

**File:** `/vite.config.js`

- Plugin stack: `@tailwindcss/vite`, `@sveltejs/kit/vite`, unplugin-icons, custom HMR plugin
- Output: `/docs` directory (for static deployment)
- Test setup: vitest with jsdom environment
- Coverage: v8 coverage tracking

### 9.2 Static Adapter

**File:** `/svelte.config.js` lines 13-15

```javascript
adapter: adapter({
  pages: 'docs',
  fallback: '404.html'
});
```

- Static site generation (no SSR)
- Serves from `/docs` for GitHub Pages

---

## 10. Dependency Summary (Rendering & Styling)

| Category                | Package                                 | Version  | Purpose                            |
| ----------------------- | --------------------------------------- | -------- | ---------------------------------- |
| **Diagram Rendering**   | mermaid                                 | ^11.13.0 | Core diagram engine                |
|                         | @mermaid-js/layout-elk                  | ^0.1.9   | ELK layout algorithm               |
|                         | @mermaid-js/layout-tidy-tree            | ^0.2.1   | Tree layout algorithm              |
|                         | @mermaid-js/mermaid-zenuml              | ^0.2.2   | Sequence diagram variant           |
| **SVG Post-Processing** | svg2roughjs                             | ^3.2.1   | Hand-drawn SVG effect              |
| **Pan/Zoom**            | svg-pan-zoom                            | 3.6.2    | SVG viewport control               |
|                         | hammerjs                                | ^2.0.8   | Touch gesture detection            |
| **Styling**             | tailwindcss                             | ^4.1.18  | Utility CSS framework              |
|                         | @tailwindcss/vite                       | ^4.1.18  | Vite integration                   |
|                         | @tailwindcss/typography                 | ^0.5.19  | Typography plugin (unused visibly) |
| **Fonts**               | @fontsource-variable/recursive          | ^5.2.5   | Recursive Variable font            |
| **Code Editors**        | monaco-editor                           | 0.52.2   | Desktop code editor                |
|                         | codemirror                              | ^6.0.1   | Mobile code editor                 |
|                         | @fsegurai/codemirror-theme-vscode-dark  | ^6.1.4   | Dark theme for CM6                 |
|                         | @fsegurai/codemirror-theme-vscode-light | ^6.1.4   | Light theme for CM6                |
| **Dark Mode**           | mode-watcher                            | ^0.5.1   | Theme switching utility            |
| **Icons**               | unplugin-icons                          | ^22.2.0  | Icon loading framework             |
|                         | @iconify-json/material-symbols          | ^1.2.20  | Material symbols icons             |
|                         | @iconify-json/mdi                       | ^1.2.3   | Material Design icons              |
|                         | @fortawesome/fontawesome-free           | ^6.7.2   | FontAwesome icon set               |

---

## 11. Rendering Flow Summary

```
User Input (Code/Config)
     ↓
mermaid.initialize(config)  [theme: 'default' or 'dark']
     ↓
mermaid.render(id, code)  → SVG HTML string
     ↓
Inject into #container
     ↓
Query SVG element
     ↓
┌─ If rough mode:
│  └─ Svg2Roughjs.sketch()  → hand-drawn effect
│
└─ If normal mode:
   └─ bindFunctions(svg)  → interactive elements
     ↓
┌─ If panZoom enabled:
│  └─ panzoom(svg, options)  → touch & mouse controls
│
└─ Render complete

CSS Variables (Light/Dark):
  → Grid background styling
  → Container colors
  → Border/text colors
  → From mode-watcher toggle
```

---

## 12. Key Files for Styling Architecture

| File                                         | Lines | Purpose                                              |
| -------------------------------------------- | ----- | ---------------------------------------------------- |
| `/src/app.css`                               | 184   | Global styles, design tokens, Tailwind config        |
| `/src/lib/util/mermaid.ts`                   | 64    | Mermaid initialization & rendering                   |
| `/src/lib/util/state.ts`                     | 257   | State management, theme toggle, config serialization |
| `/src/lib/util/sotatek-colors.test.ts`       | 400+  | SotaTek palette definitions & contrast tests         |
| `/src/lib/components/View.svelte`            | 179   | SVG rendering, rough mode, grid background           |
| `/src/lib/components/DesktopEditor.svelte`   | 150+  | Monaco editor setup                                  |
| `/src/lib/components/MobileEditor.svelte`    | 100+  | CodeMirror with VS Code themes                       |
| `/src/lib/util/panZoom.ts`                   | 158   | svg-pan-zoom integration with Hammer.js              |
| `/src/lib/components/FloatingToolbar.svelte` | 15    | Glassmorphic toolbar styling                         |
| `/vite.config.js`                            | 55    | Build config with Tailwind v4                        |

---

## 13. Unresolved Questions

1. **Monaco editor theme:** Does DesktopEditor use default Monaco themes or custom config in monacoExtra.ts?
2. **Tailwind content paths:** Where does Tailwind look for template files? (Default to src/ ?).
3. **Mermaid themeVariables:** Are any custom theme variables defined, or only theme name?
4. **Post-processing transforms:** Any other SVG transforms beyond svg2roughjs (e.g., aspect ratio, clipping)?
5. **Canvas wrapper styling:** What padding/margins are applied to the rendered diagram container?
6. **Responsive grid:** Does grid size change on mobile/small screens?
7. **Export background:** How is background color determined in Actions.svelte export? (uses CSS var)
