# 🚀 TaskFlow Pro - Enterprise Team Task Manager

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

TaskFlow Pro is a full-stack, real-time project management platform built to handle enterprise-level task delegation. It features live WebSocket updates, an Analytics Command Center, and strict Role-Based Access Control (RBAC).

🔗 **Live Demo:** [taskmanager.spdwivedi.me](https://taskmanager.spdwivedi.me)

---

## ✨ Key Features

* **Real-Time Collaboration:** Powered by `Socket.io`, task updates, status changes, and remarks are instantly pushed to all connected clients without needing a page refresh.
* **Blazing Fast Optimistic UI:** The frontend leverages Optimistic UI patterns to update the DOM instantly upon user interaction, masking database latency for a buttery-smooth UX.
* **Role-Based Access Control (RBAC):** * **Admins:** Full CRUD privileges (Create, Read, Update, Delete) for projects and tasks.
  * **Members:** Can view projects, update statuses of their assigned tasks, and add timeline remarks.
* **Analytics Dashboard:** Visual task distribution using `Recharts`, tracking completion rates, active issues, and automatically flagged **Overdue Tasks**.
* **Kanban Task Board:** Tasks are organized into dynamic columns (Pending, In Progress, Needs Review, Blocked, Completed) with tag filtering.
* **Global Activity Timeline:** Every action (creating a project, flagging an issue) is logged and broadcasted to a slide-out global notification panel.

---

## 🛠️ Tech Stack

**Frontend:**
* React.js (Vite)
* Tailwind CSS (Custom Animations & Layouts)
* Recharts (Data Visualization)
* Lucide React (Iconography)

**Backend:**
* Node.js & Express.js
* MongoDB Atlas & Mongoose
* Socket.io (WebSockets)
* JSON Web Tokens (JWT) for Authentication

**Deployment:**
* Railway (Frontend and Backend Hosting)

---

## 🚀 Local Development Setup

Want to run this locally? Follow these steps:

### 1. Clone the repository
```bash
git clone [https://github.com/spdwivedi/taskmanager.git](https://github.com/spdwivedi/taskmanager.git)
cd taskmanager
