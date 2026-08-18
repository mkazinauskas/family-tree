# 🌳 Family Tree Studio

> **High-Precision Genealogy Editor & Interactive Family Lineage Visualizer**

Family Tree Studio is a modern, responsive web application built with **React**, **TypeScript**, and **Vite** that lets you create, edit, visualize, analyze, and export complex genealogical family trees with an intuitive, dynamic canvas interface.

---

## ✨ Features

- **Multi-Project Support**:
  - Create, rename, duplicate, and delete unlimited family tree projects.
  - Project explorer for switching between trees, each with its own saved history.
- **Interactive Dynamic Canvas**:
  - Smooth pan, drag, and zoom navigation with zoom controls, minimap, and auto-fit.
  - Multi-generational relationship and marriage connector lines, extra links, and section grouping.
- **Rich Biographical Profiles**:
  - Complete biographical data: birth & death dates/places, occupation, notes, tags, and portrait photos.
  - Living vs. deceased status indicators and per-person card color styling.
- **Effortless Relationship Management**:
  - Add parents, spouses, partners, children, and siblings with automatic bidirectional connection linking.
- **Undo/Redo History**:
  - Full action history per project with a browsable history sidebar and keyboard shortcuts (`Ctrl/Cmd+Z`, `Ctrl/Cmd+Shift+Z`/`Y`).
  - History and project data are persisted to `localStorage` automatically.
- **Tree Analytics & Insights**:
  - Instant demographic stats: total persons, generations depth, gender breakdown, average lifespan, and oldest ancestors.
- **Curated Starter Templates**:
  - Blank canvas, 4-generation, 5-generation, and preloaded historical lineage templates (in Lithuanian and English).
- **Search & Outliner Sidebar**:
  - Real-time search by name, birthplace, or occupation.
  - Collapsible family branch explorer.
- **Internationalization**:
  - Full UI available in Lithuanian and English, with automatic language detection and manual override.
- **Customizable Tree Metadata**:
  - Editable title/subtitle, legend, footnotes, and section styling per tree.
- **Import & Export**:
  - Export tree visualizations to standalone **HTML** and **SVG**.
  - Backup and restore tree data with structured **JSON** import/export.

---

## 🚀 Quick Start — How to Run

### Prerequisites

Ensure you have one of the following installed on your machine:
- **Node.js** (v18.0 or higher recommended) & **npm**
- Or **Bun** / **pnpm** / **Yarn**

---

### Installation & Setup

1. **Clone or navigate to the project directory:**
   ```bash
   cd /path/to/family-tree
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   *(Or if you use Bun: `bun install`, pnpm: `pnpm install`)*

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   *(Or with Bun: `bun dev`)*

4. **Open the application:**
   Navigate to the local URL displayed in your terminal (usually [http://localhost:5173](http://localhost:5173)).

---

## 🛠️ Available Scripts

In the project directory, you can run:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite local development server with Hot Module Replacement (HMR). |
| `npm run build` | Runs TypeScript type checking (`tsc`) and builds the optimized production bundle to `dist/`. |
| `npm run preview` | Locally serves the production build from `dist/` to preview it before deployment. |

---

## 📁 Project Structure

```text
family-tree/
├── src/
│   ├── components/
│   │   ├── Canvas/                 # Interactive tree canvas: pan/zoom, layers, minimap, toolbar
│   │   ├── PersonInspector/        # Person details & edit tabs (general, marriages, notes, style)
│   │   ├── TreeMetadataModal/      # Tree settings tabs (meta, legend, footnotes, sections)
│   │   ├── AddRelativeModal.tsx    # Modal to attach parents/children/spouses
│   │   ├── AnalyticsModal.tsx      # Demographic & lineage statistics
│   │   ├── ExportModal.tsx         # HTML, SVG, JSON export dialog
│   │   ├── Header.tsx              # App navigation & main action toolbar
│   │   ├── HistorySidebar.tsx      # Browsable undo/redo action history
│   │   ├── NewProjectModal.tsx     # Create a new project from a template or blank tree
│   │   ├── OutlinerSidebar.tsx     # Tree search & hierarchy branch list
│   │   ├── PersonCard.tsx          # Individual node card rendering
│   │   ├── ProjectExplorerModal.tsx# Multi-project switcher, rename, duplicate, delete
│   │   └── TreeWorkspace.tsx       # Main workspace: wires canvas, sidebars, and modals together
│   ├── data/
│   │   └── templates/              # Starter templates (blank, 4-gen, 5-gen, historical lineages)
│   ├── engine/                     # Layout calculation, theming, SVG/HTML export, paper formats
│   ├── hooks/                      # Project persistence, undo/redo history, keyboard shortcuts
│   ├── i18n/                       # Lithuanian/English translations & language context
│   ├── types/                      # TypeScript type definitions for persons & trees
│   ├── App.tsx                     # Main application root state & layout
│   ├── index.css                   # Design system, CSS variables, and layout styles
│   └── main.tsx                    # React DOM entry point
├── index.html                      # Application HTML shell
├── package.json                    # Project dependencies and npm scripts
├── tsconfig.json                   # TypeScript compiler configuration
└── vite.config.ts                  # Vite build configuration
```

---

## 🧰 Tech Stack

- **Framework**: [React 18](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Visuals & Effects**: Canvas Confetti, Vanilla CSS variables & responsive layout
