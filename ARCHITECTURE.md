# ARCHITECTURE.md

# Cybernauts Social Graph & Recommendation System

## Architecture Overview

The application is designed as a full-stack social graph platform focused on:

* relationship visualization
* explainable recommendations
* interactive graph exploration
* scalable frontend rendering
* clean backend service separation

The implementation intentionally prioritizes:

* readability
* maintainability
* interview clarity
* practical engineering tradeoffs

instead of unnecessary enterprise complexity.

---

# System Architecture

## Frontend

### Stack

* React + Vite
* Tailwind CSS
* React Flow
* Context API
* devil-frontend package

### Responsibilities

* graph visualization
* relationship interaction
* recommendation rendering
* authentication state
* optimistic UI updates
* responsive interaction layer

### Key Frontend Modules

| Module         | Responsibility                    |
| -------------- | --------------------------------- |
| GraphContext   | Graph state management            |
| AuthContext    | Session persistence + auth state  |
| SidebarContext | Node interaction state            |
| Dashboard      | Graph rendering and orchestration |
| SocialNode     | Custom React Flow node rendering  |
| Sidebar        | Recommendation and profile panel  |

---

## Backend

### Stack

* Node.js
* Express.js
* MongoDB + Mongoose
* JWT Authentication
* Swagger
* Jest

### Responsibilities

* authentication
* relationship management
* graph generation
* recommendation scoring
* validation
* data integrity enforcement

### Backend Flow

```text
Route → Controller → Service → Database
```

Controllers remain intentionally thin.
Business logic is centralized inside Services for:

* readability
* easier debugging
* interview clarity
* maintainable separation of concerns

---

# Recommendation Engine Design

The recommendation system uses a weighted rule-based scoring engine.

## Signals Used

### Shared Hobbies

Users with overlapping hobbies receive higher recommendation scores.

### Mutual Connections

Users with mutual graph relationships receive additional weight.

### Hobby Categories

Recommendations can also be generated from hobby category similarity.

---

## Why Rule-Based Instead of ML?

A Machine Learning pipeline was intentionally avoided.

### Reasons

* assignment scope
* infrastructure complexity
* lack of training dataset
* explainability concerns
* deployment overhead

The implemented recommendation system provides:

* deterministic results
* explainable scoring
* transparent recommendation reasoning
* easier debugging
* easier live modifications during interviews

Example recommendation explanation:

```text
Recommended because:
- 2 shared hobbies
- 1 mutual friend
- same hobby category
```

This makes the system easier to reason about during debugging and technical evaluation.

---

# Key Design Tradeoffs

## 1. Simplified Service Architecture vs Repository Pattern

### Decision

The initial repository abstraction layer was removed.

### Why?

For this project size, the repository pattern introduced:

* excessive indirection
* repetitive boilerplate
* slower debugging
* reduced readability during interviews

The final structure:

```text
Controller → Service → Mongoose Model
```

was intentionally selected because it:

* keeps business logic centralized
* improves traceability
* reduces abstraction overhead
* makes debugging significantly faster

### Tradeoff

The architecture sacrifices some enterprise-level flexibility in exchange for:

* cleaner implementation
* lower cognitive load
* better development speed
* easier onboarding

---

## 2. Ownership-Based Access Control vs Open CRUD APIs

### Decision

The original assignment-style open CRUD system was replaced with authenticated ownership-based access control.

### Why?

Allowing arbitrary users to:

* delete any account
* edit any profile
* manipulate all relationships

would create unrealistic and insecure application behavior.

The final implementation enforces:

* authenticated sessions
* user-owned profile management
* protected relationship actions

### Result

The platform behaves more like a real social application instead of a public CRUD dashboard.

### Tradeoff

This added:

* authentication complexity
* protected route handling
* session persistence logic

but significantly improved:

* security
* realism
* production-readiness

---

## 3. Cookie-Based JWT Auth vs LocalStorage Tokens

### Decision

JWT tokens are stored in `httpOnly` cookies.

### Why?

Compared to localStorage-based auth:

* cookies reduce XSS exposure
* browser session handling becomes simpler
* automatic token transmission improves DX

This also simplified frontend integration because:

```text
credentials: 'include'
```

handles session persistence automatically.

### Tradeoff

Cookie auth requires:

* proper CORS configuration
* credentials handling
* stricter origin control

but provides a cleaner and safer authentication workflow.

---

# Rejected Alternatives

## 1. Redis-Based Graph Synchronization

### Rejected Due To

Infrastructure complexity vs actual project scale.

### Consideration

Redis caching and worker synchronization were explored for:

* graph caching
* worker synchronization
* distributed state sharing

### Why Rejected?

The current dataset size does not justify:

* distributed cache invalidation
* synchronization overhead
* operational complexity

MongoDB query performance with indexes was already sufficient for assignment-scale datasets.

### Result

The architecture remained intentionally simpler and easier to deploy.

---

## 2. WebSocket Real-Time Synchronization

### Rejected Due To

Low ROI for assignment scope.

### Consideration

A real-time graph sync layer using:

* Socket.IO
* WebSockets
* event broadcasting

was considered.

### Why Rejected?

The majority of graph actions are:

* user-specific
* low-frequency
* interaction-driven

Refreshing graph state after actions provided nearly identical UX with significantly lower complexity.

### Result

The project avoids:

* socket synchronization bugs
* real-time race conditions
* deployment complexity
* additional infrastructure requirements

---

# Performance Optimizations

## Frontend Optimizations

### Progressive Graph Rendering

Graph rendering is intentionally optimized to reduce:

* initial render spikes
* browser main-thread blocking
* React Flow rendering bottlenecks

### Debounced Interactions

Debounced frontend actions reduce:

* unnecessary API requests
* rapid state updates
* redundant recommendation fetches

using reusable hooks from the `devil-frontend` package.

### Lazy Graph Expansion

Graph rendering strategy prioritizes:

* responsive interaction
* staged rendering
* reduced perceived loading time

instead of aggressively rendering every node immediately.

---

## Backend Optimizations

### Thin Controllers

Controllers remain lightweight and delegate logic to services.

Benefits:

* cleaner request flow
* easier debugging
* easier testing

### Recommendation Explainability

Recommendation responses intentionally return:

* score
* reason
* sourceSignals

This improves:

* frontend explainability
* debugging visibility
* interview clarity

### Seeder Isolation

Database seeding is restricted to CLI-only execution:

```bash
npm run seed
```

This avoids exposing destructive reset endpoints publicly.

---

# Scalability Considerations

The application was designed with realistic scalability awareness while intentionally avoiding premature optimization.

Potential future extensions include:

* Redis graph caching
* worker clustering
* websocket synchronization
* graph pagination
* graph virtualization
* recommendation analytics
* edge-weight history tracking
* time-decay recommendation scoring

These were intentionally postponed to preserve:

* project stability
* maintainability
* assignment focus
* implementation clarity

---

# Testing Strategy

The project includes validation/testing for:

* authentication flow
* relationship creation
* unlink restrictions
* duplicate prevention
* self-link prevention
* recommendation generation
* protected routes
* graph rendering integration

The frontend and backend were also manually integration-tested together to validate:

* graph synchronization
* recommendation updates
* auth persistence
* relationship consistency

---

# Final Engineering Philosophy

The project intentionally favors:

* practical engineering
* explainable systems
* maintainable architecture
* clean integrations
* realistic UX

instead of overengineered enterprise abstractions.

The goal was to build a system that:

* feels production-oriented
* remains interview-friendly
* demonstrates backend/frontend integration skill
* supports future scalability
* stays understandable under live technical discussion.
