# Lyrics Depth Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the lyrics experience feel substantially richer by adding deeper song metadata across the catalog and handcrafted detail for a curated set of top tracks.

**Architecture:** Extend the shared `Song` model with optional editorial metadata, generate sensible defaults for the broad catalog in the mock data layer, and override key songs with richer details. Update the lyrics sidebar and lyrics content panel to surface the new metadata without breaking the existing route and album flow.

**Tech Stack:** React, TypeScript, Vite, Tailwind CSS

---

### Task 1: Extend song metadata model

**Files:**
- Modify: `/Users/zql/developer/trae/aipro/52lyrics/src/types/index.ts`
- Modify: `/Users/zql/developer/trae/aipro/52lyrics/src/data/mockData.ts`

**Step 1:** Add optional song detail fields for richer page content.

**Step 2:** Populate default values for all songs during mock data creation.

**Step 3:** Add handcrafted overrides for featured songs so their pages feel meaningfully deeper.

### Task 2: Upgrade lyrics page presentation

**Files:**
- Modify: `/Users/zql/developer/trae/aipro/52lyrics/src/components/lyrics/SongInfo.tsx`
- Modify: `/Users/zql/developer/trae/aipro/52lyrics/src/components/lyrics/LyricsDisplay.tsx`

**Step 1:** Add stronger sidebar metadata blocks, description, and themes.

**Step 2:** Add editorial context, status messaging, and richer credits in the lyrics panel.

**Step 3:** Keep layout responsive and visually consistent with the dark theme.

### Task 3: Validate

**Files:**
- Test by build: project root

**Step 1:** Run diagnostics on edited files.

**Step 2:** Run `pnpm run build`.

**Step 3:** Fix any TypeScript or UI regressions immediately.
