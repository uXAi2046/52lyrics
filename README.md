# 52lyrics

52lyrics is a modern, responsive music lyrics website built with React and TypeScript. It features a sleek dark-themed interface, comprehensive artist and album browsing, and a pixel-perfect design system.

## ✨ Features

- **Home Page**: Interactive hero section, popular artists carousel, album grid, and hot songs chart.
- **Browse Artists**: A-Z filtering system, real-time artist search, and organized artist listings.
- **Artist Details**: Rich artist profiles with biography, key stats, and tabbed discography (Albums/Singles).
- **Lyrics View**: Immersive lyrics reading experience with:
  - Sticky song information sidebar
  - Section-formatted lyrics (Intro, Verse, Chorus)
  - One-click copy functionality
  - "More from album" recommendations
- **Top Charts**: Top 100 songs ranking list.
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices.
- **Dark Mode UI**: Custom-designed dark theme with consistent color palette and typography.

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Routing**: [React Router v6](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Context / Props
- **Utils**: clsx, tailwind-merge

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- pnpm (recommended) or npm/yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd 52lyrics
   ```

2. Install dependencies:
   ```bash
   pnpm install
   # or
   npm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## 📂 Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── albums/       # Album-related components
│   ├── artists/      # Artist-related components
│   ├── common/       # Generic components (Buttons, Inputs)
│   ├── layout/       # Layout components (Header, Footer)
│   └── lyrics/       # Lyrics page specific components
├── data/             # Mock data services
├── pages/            # Main page components (views)
├── types/            # TypeScript type definitions
└── App.tsx           # Main application entry
```

## 🎨 Design System

The project implements a custom design system defined in `tailwind.config.js`:

- **Colors**:
  - Background: Very dark navy (`#0F172A`, `#030712`)
  - Primary Accent: Bright Blue (`#3B82F6`)
  - Text: White (Primary), Gray (Secondary)
- **Typography**: Clean sans-serif font stack with carefully calibrated weights and line heights.
- **Spacing**: 8px grid system.

## 📝 License

This project is created for demonstration purposes.
