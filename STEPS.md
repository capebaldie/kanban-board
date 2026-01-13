# Build Process

This document outlines the steps taken to build the Kanban Board application.

## 1. Initialization

- Initialized a new Vite project with React and TypeScript.
- Installed dependencies: `dnd-kit` (core, sortable, modifiers), `lucide-react`, `tailwindcss`, `@tailwindcss/vite`.
- Configured Tailwind CSS v4 and set up global styles.

## 2. Core Implementation

- Defined TypeScript types for `Task` and `Column`.
- Created a `useLocalStorage` hook for state persistence.
- Implemented the main `Board` component to manage state.

## 3. Component Development

- Built `TaskCard` component for individual items.
- Built `Column` component to hold tasks.
- Integrated `dnd-kit` for drag-and-drop interactions.

## 4. Verification & Fixes

- Verified drag-and-drop functionality using browser automation.
- **Bug Fix**: Fixed a critical state mutation bug in drag handlers where moving one item affected others. Switched to immutable state updates.
- **Bug Fix**: Resolved layout issues to ensure full screen height.

## 5. Enhancements

- Added vertical scrolling to columns with hidden scrollbars for a cleaner UI.
- Added `createdAt` timestamp to tasks and displayed creation dates on cards.
- Pushed code to GitHub.

## 6. Persistence Fixes

- **Bug Fix**: Resolved issue where task status updates were not persisting after reload. Refactored `Board.tsx` to handle state updates and API calls atomically in `handleDragEnd`.
