# DeskFlow

**Help Desk Ticketing System**

DeskFlow is a web application for creating, organizing, and managing support tickets. It is developed as a team project for the Web Programming course at Ilia State University.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, React Router |
| UI | CSS, Lucide icons |
| Backend | Node.js, Express |
| Database | Relational SQL database |
| Design | Figma |
| Version control | Git and GitHub |

## Features

### Frontend implemented

- Ticket dashboard with search, sorting, and filters
- Create, view, edit, and delete tickets
- Ticket priorities: Low, Medium, High, Urgent
- Ticket status management
- Ticket conversations and replies
- My Requests and Activity views
- Light and dark themes
- Form validation and confirmation dialogs
- Demo data persisted in browser localStorage

### Integration pending

- Connect ticket and comment operations to the Express API
- Persist application data in the SQL database
- Integrate registration, login, and logout
- Integrate server-enforced user permissions

> The frontend currently uses localStorage for demonstration.
> It is not yet connected to the team's SQL backend.

## Repository Structure

```text
deskflow-helpdesk/
├── frontend/     # React application
├── backend/      # Express API
├── database/     # SQL schema and seed data
├── docs/         # Project documentation
└── README.md
```

## Getting Started

### Requirements

- Node.js and npm
- Git

### Run the frontend

```bash
git clone https://github.com/mefrinthearea/deskflow-helpdesk.git
cd deskflow-helpdesk
git switch feature/frontend

cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite.

### Build for production

```bash
cd frontend
npm run build
```

The production files are generated in `frontend/dist/`.

### Backend setup

The backend setup instructions will be finalized after the team confirms its integrated API, environment variables, and database configuration.

## Frontend Architecture

- `components/` — Reusable interface components
- `pages/` — Application screens
- `data/` — Sample ticket data
- `services/` — Ticket storage operations
- `utils/` — Shared helper functions
- `styles/` — Application styling
- `context.jsx` — Shared application state
- `App.jsx` — Application routes
- `main.jsx` — React entry point

## Development Workflow

Feature development takes place on separate Git branches. Changes are reviewed and integrated into `main` when ready.

Commit messages use descriptive prefixes such as:

- `feat:` New functionality
- `fix:` Bug fixes
- `refactor:` Internal code improvements
- `docs:` Documentation changes
- `test:` Test additions or updates

## Project Requirements

The completed university MVP must demonstrate:

- React frontend and Express REST API
- SQL database with keys and relationships
- CRUD operations on at least two main entities
- User registration, login, and logout
- Secure password hashing
- At least two roles enforced by the backend
- Original Figma design
- Contributions from all three team members
- A working live demonstration

## Project Status

The React frontend is implemented and builds successfully. Backend integration, authentication integration, and end-to-end verification remain to be completed.

## Academic Project

Developed for the Web Programming course at Ilia State University, 2026.
