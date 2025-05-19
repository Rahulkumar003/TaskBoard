# TaskBoard - React Kanban Board

A modern, responsive task management application built with React, TypeScript, and Vite. This Kanban-style board helps users organize tasks across different stages of completion with a beautiful, intuitive interface.

## 🚀 Features

- **Drag and Drop Interface**: Intuitive task management using @hello-pangea/dnd
- **Column Organization**: Tasks organized in three columns (To Do, In Progress, Done)
- **CRUD Operations**: Create, Read, Update, and Delete tasks with real-time updates
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **Dark Mode**: Eye-friendly dark theme with modern aesthetics
- **Keyboard Accessibility**: Full keyboard navigation and screen reader support
- **Local Storage**: Tasks persist between sessions
- **Real-time Updates**: Immediate UI feedback for all actions

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety and better developer experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **@hello-pangea/dnd** - Drag and drop functionality
- **Lucide React** - Modern icon system

### Backend
- **Node.js** with Express (or your backend choice)
- **RESTful API** architecture
- **MongoDB** (or your database choice)

## 📦 Installation

1. **Clone the repository**
```bash
git clone 
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env


4. **Start the development server**
```bash
npm run dev
```

5. **Build for production**
```bash
npm run build
```

## 📝 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/tasks | GET | Fetch all tasks |
| /api/tasks | POST | Create new task |
| /api/tasks/:id | PUT | Update task |
| /api/tasks/:id | DELETE | Delete task |

## 🎯 Project Structure

```
taskboard/
├── src/
│   ├── components/
│   ├── App.tsx
│   ├── main.tsx
│   └── ...
├── public/
├── package.json
└── README.md
```
