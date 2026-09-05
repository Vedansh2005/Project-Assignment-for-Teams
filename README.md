# TeamFlow (PAFT 2.0) 🚀
### Next-Generation Project Assignment for Teams & Smart Skill Matching

TeamFlow is a collaborative team management and intelligent project allocation platform. It features an algorithmic skill-matching matrix, interactive Kanban workflows, real-time workload balancing, and a glassmorphic design system.

---

## ✨ Key Features

1. **Intelligent Skill-Matching Engine**:
   - Compares candidate technical proficiencies against project required competencies.
   - Generates weighted **Fit Scores (0–100%)** factoring in skill overlap, experience level, and remaining workload capacity.
   - Includes **1-Click Auto-Form Ideal Team** to instantly assemble the highest-matching team.

2. **Interactive Kanban Board**:
   - Visual 4-column agile workflow: **Backlog**, **In Progress**, **Code Review**, and **Completed**.
   - Filter by Project, Priority Level, and Assignee (including "Assigned to Me").
   - Drag-and-drop or 1-click status transitions with celebratory confetti when completing tasks.

3. **Executive & Contributor Command Center**:
   - Live KPI metric cards (Active Projects, Completion Velocity, Engineering Capacity, Skill Coverage).
   - Real-time system activity stream tracking project events, task movements, and team assignments.

4. **Engineering Roster & Skill Matrix**:
   - Detailed developer profiles with verified competency chips (Beginner, Intermediate, Advanced, Expert).
   - Real-time workload capacity allocation gauges (e.g., 32h / 40h used).
   - Interactive modal to customize and save individual skill portfolios.

5. **Instant Perspective Switcher**:
   - Switch seamlessly between **Alex Vance (VP / Admin)**, **Sophia Chen (Senior Frontend)**, **Marcus Brody (Cloud Architect)**, and other team members to experience the platform from both management and contributor perspectives.

6. **Design System**:
   - Built with modern Vanilla CSS (zero heavy utility framework lock-in).
   - High-contrast Dark (Midnight Cyber Glass) and Crisp Light themes with seamless toggle.
   - Modern typography using Google Fonts `Outfit` and `Plus Jakarta Sans`.

---

## 🛠️ Modern Technology Stack

- **Frontend Core**: React 19, TypeScript, Vite 8
- **Styling**: Vanilla CSS Design Tokens, Glassmorphism, CSS Custom Properties
- **Icons**: Lucide React
- **Animations**: Canvas Confetti, Spring CSS transitions
- **State & Storage**: Reactive React Context with localStorage persistence
- **Zero Heavy External Dependencies**: No XAMPP, Apache, or separate SQL servers required! Runs instantly with Node.js.

---

## 🚀 Quick Start

### 1. Start Development Server
```bash
npm run dev
```
Open your browser at **http://localhost:3000** (or http://localhost:5173).

### 2. Build for Production
```bash
npm run build
```

---

## 📁 Project Structure

```
paft/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx             # Sticky header with role switcher & theme toggle
│   │   ├── OverviewDashboard.tsx  # Executive KPIs, active projects & live feed
│   │   ├── SmartMatcher.tsx       # Algorithmic candidate scoring & auto-assign
│   │   ├── KanbanBoard.tsx        # 4-column drag-and-drop task workflow
│   │   ├── ProjectsView.tsx       # Project directory, progress velocity & actions
│   │   ├── TeamRosterView.tsx     # Developer profiles & skill matrix
│   │   ├── NewProjectModal.tsx    # Modal to create projects with skill tags
│   │   ├── NewTaskModal.tsx       # Modal to create tasks with priority & estimate
│   │   ├── EditSkillsModal.tsx    # Modal to edit member skill portfolio
│   │   └── ToastContainer.tsx     # Animated glass toast notifications
│   ├── context/
│   │   └── AppContext.tsx         # Central state store with local persistence
│   ├── data/
│   │   └── mockData.ts            # Seed dataset & algorithmic match calculation
│   ├── types/
│   │   └── index.ts               # TypeScript data interfaces
│   ├── App.tsx                    # Main layout and tab orchestrator
│   ├── index.css                  # Modern glassmorphic CSS design system
│   └── main.tsx                   # React 19 entry point
├── legacy_php/                    # Original PHP/MySQL code preserved intact
├── package.json
└── vite.config.ts
```

---

## 🔒 Legacy PHP Archive
The previous PHP and MySQL implementation has been safely preserved in the [`legacy_php/`](./legacy_php/) directory for reference.
