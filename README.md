# README.md

# Cybernauts — Social Graph & Recommendation System

Cybernauts is a full-stack social graph platform focused on relationship visualization and explainable recommendation systems.

The application allows users to:

* explore interactive social connections
* discover users with shared interests
* visualize relationships through graph rendering
* manage friendships securely
* receive explainable recommendation suggestions

The project was built with a strong focus on:

* frontend/backend integration
* graph interaction
* recommendation explainability
* maintainable architecture
* realistic application workflows

---

# 🚀 Core Features

## Interactive Social Graph

Visualize users and relationships using React Flow with dynamic node interaction.

## Explainable Recommendations

Rule-based recommendation engine powered by:

* shared hobbies
* mutual connections
* category similarity

Every recommendation includes:

* score
* explanation
* source signals

---

## Secure Authentication

* JWT authentication
* httpOnly cookie sessions
* protected routes
* ownership-based access control

Users can only manage:

* their own account
* their own profile
* their own relationships

---

## Relationship Management

Users can:

* link connections
* unlink users
* manage hobbies
* explore extended networks

---

## Responsive Graph UI

* responsive dashboard
* interactive sidebar
* recommendation panels
* custom graph nodes
* onboarding states

---

# 🛠 Tech Stack

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Swagger/OpenAPI
* Jest

---

## Frontend

* React
* Vite
* React Flow
* Tailwind CSS
* devil-frontend package
* Context API

---

# 🏗 Architecture Overview

## Backend Structure

```text
Route → Controller → Service → Database
```

The backend intentionally uses:

* thin controllers
* centralized services
* simplified architecture
* explainable business logic

instead of unnecessary enterprise abstractions.

---

## Recommendation Engine

The recommendation engine uses a weighted rule-based scoring system.

### Recommendation Signals

* shared hobbies
* mutual friends
* category overlap

### Why Rule-Based?

A true ML pipeline was intentionally avoided because:

* assignment scope
* infrastructure overhead
* explainability concerns

The current implementation provides:

* deterministic results
* readable explanations
* easier debugging
* easier live modifications

---

## Graph Visualization

The frontend uses React Flow for:

* node rendering
* edge visualization
* relationship interaction

Custom node variations visually distinguish:

* higher popularity users
* lower popularity users

The graph rendering strategy prioritizes:

* responsiveness
* readability
* stable interaction

---

# 🔐 Authentication Flow

Authentication uses:

* JWT
* httpOnly cookies
* protected routes
* session persistence

Frontend state synchronization is handled through Context + reusable API helpers.

---

# 🚦 Installation & Setup

## Prerequisites

* Node.js v18+
* MongoDB Atlas or local MongoDB

---

# 1. Clone Repository

```bash
git clone <your-repository-url>
cd cybernauts-backend
```

---

# 2. Backend Setup

Install dependencies:

```bash
npm install
```

Create `.env` file using `.env.example`

Run backend:

```bash
npm run dev
```

---

## Important Seeder Note

`npm run seed` is NOT required for normal startup if the existing database already contains data.

Only run:

```bash
npm run seed
```

when:

* using a fresh database
* changing MongoDB database URL
* resetting demo data intentionally

The seeder will:

* clear old demo data
* generate realistic sample users
* create relationships and hobbies

---

# 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

# ⚙️ Environment Variables

## Backend `.env`

```env
PORT=5000
MONGO_URI=
JWT_SECRET=
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

---

## Frontend `.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

# 🧪 API Documentation

Swagger documentation available at:

```text
http://localhost:5000/api-docs
```

Includes:

* authentication routes
* graph APIs
* recommendation APIs
* relationship APIs
* hobby management APIs

---

# ✨ Bonus Features Implemented

## Custom React Flow Node Types

* HighScoreNode
* LowScoreNode
* popularity-based styling

---

## Explainable Recommendation Scoring

Recommendations include:

* readable reason
* score
* source signals

---

## Progressive Graph Rendering

Frontend graph rendering optimized for:

* smoother interaction
* reduced visual overload
* scalable rendering behavior

---

## Responsive Dashboard

* mobile-friendly layout
* adaptive sidebar
* responsive graph workspace

---

## Ownership-Based Access Control

Improved beyond the original assignment scope:

* authenticated user workflows
* protected relationship management
* restricted account ownership actions

---

# 🌍 Deployment

## Backend Deployment (Render/Railway)

### Build Command

```bash
npm install
```

### Start Command

```bash
npm start
```

### Required Environment Variables

```env
MONGO_URI=
JWT_SECRET=
NODE_ENV=production
FRONTEND_URL=
```

---

## Frontend Deployment (Vercel)

### Framework

Vite

### Build Command

```bash
npm run build
```

### Output Directory

```text
dist
```

### Environment Variable

```env
VITE_API_BASE_URL=
```

---

# 🧪 Testing

The project includes:

* API testing
* relationship validation
* protected route testing
* recommendation testing
* frontend/backend integration testing

Critical workflows tested:

* register/login
* token persistence
* graph rendering
* link/unlink
* delete restrictions
* recommendation generation

---

# 📂 Additional Documentation

* `ARCHITECTURE.md`
* `DEBUG_NOTES.md`
* `PROMPT_DISCLOSURE.md`

---

# 🤖 AI Usage Disclosure

AI tools were used as development assistants for:

* scaffolding
* cleanup
* debugging assistance
* frontend generation
* documentation refinement

All major workflows, integrations, debugging, and architectural decisions were manually validated and refined.

See:

```text
PROMPT_DISCLOSURE.md
```

for full details.

---

# 📌 Final Notes

The project intentionally prioritizes:

* practical engineering
* maintainable architecture
* explainable systems
* frontend/backend integration
* interview-friendly implementation

instead of overengineered enterprise complexity.
