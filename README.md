# Kanban Board Application

A modern, responsive Kanban board application built with React, TypeScript, and Tailwind CSS v4.

![Kanban Board Screenshot](src/assets/kanban_preview.png)

## Features

- **Drag & Drop**: smooth drag-and-drop functionality powered by `@dnd-kit`.
- **Persistent State**: Tasks are stored in a **SQLite database** via a **Hono** server.
- **Modern UI**: Dark-themed, glassmorphism design with Tailwind CSS v4.
- **Task Management**: Create tasks, move them between columns (Tasks, In Progress, Done).
- **Responsive**: Scrollable columns with hidden scrollbars.

## Tech Stack

- **Frontend**: Vite + React + TypeScript
- **Backend**: Hono + Node.js Adapter
- **Database**: SQLite + Drizzle ORM + Better SQLite3
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **DnD**: @dnd-kit/core, @dnd-kit/sortable

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/capebaldie/kanban-board.git
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server (starts both Frontend and Backend):
   ```bash
   npm run dev
   ```
