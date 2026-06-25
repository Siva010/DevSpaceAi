<div align="center">
  <h1>🚀 DevSpace "Multi-tenant project management"</h1>
  <p><strong>A Modern, High-Performance Workspace & Project Management Tool</strong></p>

  <p>
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
    <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  </p>
</div>

<br />

## 📖 Overview

**DevSpace** is a comprehensive, full-stack workspace collaboration platform inspired by tools like Linear and Notion. It is designed to handle complex project management workflows, robust document versioning, and seamless organization management—all wrapped in a highly responsive, modern user interface.

> **Note:** This project is actively under development. It serves as a showcase of scalable architecture, clean code practices, and modern web technologies.

## ✨ Key Features (Implemented & Vision)

- **🏢 Multi-Tenant Organizations:** Securely manage multiple workspaces with robust role-based access control (RBAC).
- **📋 Agile Project Management:** Kanban-style task tracking with drag-and-drop capabilities (`@dnd-kit`), statuses, priorities, and assignments.
- **📄 Document Management & Versioning:** Notion-like document editing with a built-in history tracking system (`DocumentVersion`).
- **🔐 Enterprise-Grade Security:** JWT-based authentication, password hashing with bcrypt, and secure route protection.
- **⚡ Optimistic UI & Caching:** Lightning-fast frontend experience using `React Query` combined with `Redux Toolkit` and a Redis backend cache.

## 🏗️ Architecture & Tech Stack

This project was built with a strong focus on **scalability**, **maintainability**, and **developer experience (DX)**.

### Frontend 🎨
- **Core:** React 19, TypeScript, Vite
- **State & Data Fetching:** React Query (Server State), Redux Toolkit (Client State)
- **Styling:** Tailwind CSS (v4) with `clsx` and `tailwind-merge` for dynamic classes
- **Forms & Validation:** React Hook Form + Zod for strict, type-safe validation
- **Interactions:** `@dnd-kit` for performant drag-and-drop interfaces

### Backend ⚙️
- **Core:** NestJS (Node.js framework), TypeScript
- **Database:** PostgreSQL (with `uuid-ossp` for secure UUID v4 generation)
- **ORM:** Prisma Client with `@prisma/adapter-pg`
- **Caching:** Redis (containerized via Docker)
- **Authentication:** Passport, JWT strategies

### Infrastructure 🐳
- **Docker Compose:** Seamless local development environment spinning up PostgreSQL and Redis.

# 📊 Database Schema Highlights

The database is designed in 3rd Normal Form (3NF) to ensure data integrity and scalable relationships:

- **Organizations & Memberships:** M:N relationship with Roles (Owner, Admin, Member).
- **Projects & Tasks:** 1:N relationship with custom Project Keys (e.g., `ENG-101`).
- **Tasks & Users:** Tasks have assignees, creators, and support threaded comments.
- **Documents & Versions:** 1:N relationship ensuring every edit is version-controlled and recoverable.

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+)
- Docker & Docker Compose
- npm or yarn

### 1. Start Infrastructure (Database & Cache)
```bash
docker-compose up -d
```

### 2. Backend Setup
```bash
cd backend
npm install
# Set up Prisma & run migrations
npx prisma generate
npx prisma db push
# Start the NestJS development server
npm run start:dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# Start the Vite development server
npm run dev
```

## 🧠 Why This Project? (For Interviewers)

I built **DevSpace** to demonstrate my ability to take a complex product from concept to implementation, focusing on real-world engineering challenges:

1. **System Design:** Moving beyond simple CRUD by implementing multi-tenancy (Organizations) and complex relationships (Document Versioning).
2. **Type Safety End-to-End:** Utilizing TypeScript across the entire stack, sharing types where possible, and using Zod to guarantee runtime type safety at API boundaries.
3. **Performance Optimization:** Leveraging React Query for caching, deduplicating requests, and enabling optimistic updates for a snappy UX.
4. **Clean Code & Architecture:** Utilizing NestJS's modular architecture (Controllers, Providers, Modules) to keep domain logic strictly separated and testable.

---
*Crafted with passion for clean code and great user experiences.*
