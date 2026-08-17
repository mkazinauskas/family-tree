# 🌳 Family Tree Studio

> **High-Precision Genealogy Editor & Interactive Family Lineage Visualizer**

Family Tree Studio is a modern, responsive web application built with **React**, **TypeScript**, and **Vite** that lets you create, edit, visualize, analyze, and export complex genealogical family trees with an intuitive, dynamic canvas interface.

---

## ✨ Features

- **Interactive Dynamic Canvas**:
  - Smooth pan, drag, and zoom navigation with zoom controls and auto-fit.
  - Multi-generational relationship lines and family grouping.
  - Generational level indicator badges and visual depth cues.
- **Rich Biographical Profiles**:
  - Complete biographical data: birth & death dates/places, occupation, notes, tags, and portrait photos.
  - Living vs. deceased status indicators.
- **Effortless Relationship Management**:
  - Add parents, spouses, partners, children, and siblings with automatic bidirectional connection linking.
- **Tree Analytics & Insights**:
  - Instant demographic stats: total persons, generations depth, gender breakdown, average lifespan, and oldest ancestors.
- **Curated Starter Templates & Samples**:
  - Preloaded historical lineage datasets and starter templates for quick testing.
- **Search & Outliner Sidebar**:
  - Real-time search by name, birthplace, or occupation.
  - Collapsible family branch explorer.
- **Themes & Visual Customization**:
  - Switch between curated aesthetic color themes (Heritage Gold, Royal Blue, Forest Emerald, Vintage Parchment, and Dark Mode).
- **Import & Export**:
  - Export tree visualizations to **PNG** and **SVG**.
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
├── public/                # Static assets (favicons, icons)
├── src/
│   ├── components/        # React UI components
│   │   ├── AddRelativeModal.tsx    # Modal to attach parents/children/spouses
│   │   ├── AnalyticsModal.tsx      # Demographic & lineage statistics
│   │   ├── Canvas.tsx              # Interactive tree canvas & SVG links
│   │   ├── ExportModal.tsx         # PNG, SVG, JSON export dialog
│   │   ├── Header.tsx              # App navigation & main action toolbar
│   │   ├── OutlinerSidebar.tsx     # Tree search & hierarchy branch list
│   │   ├── PersonCard.tsx          # Individual node card rendering
│   │   ├── PersonInspector.tsx     # Person details & edit sidebar/modal
│   │   ├── TemplatePickerModal.tsx # Pre-made lineage templates
│   │   └── TreeMetadataModal.tsx   # Tree settings, themes & metadata
│   ├── data/              # Default datasets and template lineages
│   │   ├── tamosiusTreeData.ts
│   │   └── templates.ts
│   ├── engine/            # Layout calculation and lineage graph algorithms
│   ├── types/             # TypeScript type definitions for persons & trees
│   ├── App.tsx            # Main application root state & layout
│   ├── index.css          # Design system, CSS variables, and layout styles
│   └── main.tsx           # React DOM entry point
├── index.html             # Application HTML shell
├── package.json           # Project dependencies and npm scripts
├── tsconfig.json          # TypeScript compiler configuration
└── vite.config.ts         # Vite build configuration
```

---

## 🧰 Tech Stack

- **Framework**: [React 18](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Visuals & Effects**: Canvas Confetti, Vanilla CSS variables & responsive layout
