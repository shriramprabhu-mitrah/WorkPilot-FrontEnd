# 🚀 WorkPilot

> A modern project management and collaboration platform inspired by Jira, Linear, and ClickUp.

WorkPilot helps organizations efficiently manage projects, sprints, tasks, teams, and reports through a clean and intuitive interface. It supports role-based access control, Kanban boards, sprint management, dashboards, and project analytics.

---

## 📌 Features

### Authentication

- User Registration
- Secure Login
- Remember Me
- Forgot Password


### Organization Management

- Create Organization
- Organization Onboarding
- Organization Settings
- Member Management
- Role Management

### Project Management

- Create Projects
- Edit/Delete Projects
- Project Dashboard
- Project Members
- Project Analytics

### Task Management

- Parent Tasks
- Child Tasks
- Task Assignment
- Story Points
- Priority Levels
- Due Dates
- Labels
- Attachments
- Comments
- Activity Timeline

### Sprint Management

- Create Sprint
- Start Sprint
- Complete Sprint
- Sprint Backlog
- Sprint Reports
- Burndown Charts

### Kanban Board

- Drag & Drop Tasks
- Custom Workflow Columns
- Task Filtering
- Search
- Quick Actions

### Reports & Dashboard

- Project Overview
- Task Status
- Team Workload
- Sprint Velocity
- Burndown Charts
- Recent Activities

### Role-Based Access Control

- Super Admin
- Organization Admin
- Project Manager
- Developer
- Viewer

---

# 🛠️ Tech Stack

## Frontend

- React.js
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Redux Toolkit
- TanStack Query
- React Hook Form
- Zod
- Axios

## UI

- Shadcn UI
- Lucide Icons
- Framer Motion

## Development

- ESLint
- Prettier
- Husky
- lint-staged

---

# 📂 Folder Structure

```text
src/
│
├── app/
├── components/
├── features/
├── hooks/
├── services/
├── store/
├── utils/
├── types/
├── constants/
├── assets/
└── styles/
```

---

# ⚙️ Prerequisites

Before running the project, ensure you have installed:

- Node.js (v20 or later)
- npm or yarn
- Git

Check versions:

```bash
node -v
npm -v
git --version
```

---

# 📥 Installation

Clone the repository

```bash
git clone https://github.com/<your-username>/WorkPilot-FrontEnd.git
```

Navigate to the project

```bash
cd WorkPilot-FrontEnd
```

Install dependencies

```bash
npm install
```

---

# 🔑 Environment Variables

Create a `.env.local` file in the project root.

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

> Replace the values with your own configuration.

---

# ▶️ Running the Application

Start the development server

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

# 🏗️ Build for Production

```bash
npm run build
```

Run production build

```bash
npm start
```

---

# 🧹 Lint

```bash
npm run lint
```

---

# 🎨 Formatting

```bash
npm run format
```

---

# 🌿 Git Workflow

Create a new feature branch

```bash
git checkout develop

git pull origin develop

git checkout -b feature/<feature-name>
```

Example

```bash
git checkout -b feature/login-page
```

Commit your changes

```bash
git add .

git commit -m "feat: add login page"
```

Push

```bash
git push origin feature/login-page
```

Create a Pull Request into the `develop` branch.

---

# 🔐 Branch Strategy

```
main
│
├── Production

develop
│
├── Development

feature/*
│
├── New Features

bugfix/*
│
├── Bug Fixes

release/*
│
├── Release Preparation

hotfix/*
│
└── Production Fixes
```

---

# 👥 User Roles

| Role               | Description                               |
| ------------------ | ----------------------------------------- |
| Super Admin        | Platform-wide administrator               |
| Organization Admin | Manages organization, users, and projects |
| Project Manager    | Manages projects, sprints, and tasks      |
| Developer          | Works on assigned tasks                   |
| Viewer             | Read-only access                          |

---

# 📸 Screens

- Login
- Registration
- Organization Onboarding
- Dashboard
- Projects
- Kanban Board
- Sprint
- Reports
- Settings
- User Profile

---

# 🚀 Future Enhancements

- Notifications
- Calendar Integration
- Time Tracking
- Chat
- AI Task Suggestions
- File Management
- Mobile Application
- Dark Mode

---

# 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push the branch
5. Open a Pull Request

---

# 📄 License

This project is intended for learning and demonstration purposes.

---

# 👨‍💻 Developed By

**WorkPilot Team**

A modern project management platform built to simplify collaboration, sprint planning, and project delivery.
