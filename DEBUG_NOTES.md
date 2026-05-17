# DEBUG_NOTES.md

# Debugging & Troubleshooting Notes

This document captures real technical issues encountered during development and how they were diagnosed and resolved.

The goal of this document is to demonstrate:

* debugging ability
* root-cause analysis
* practical engineering decisions
* stability-focused problem solving

---

# 1. React Flow `nodeTypes` Warning

## Issue

During frontend development, React Flow continuously displayed the warning:

```text
[React Flow]: It looks like you've created a new nodeTypes or edgeTypes object.
```

The warning appeared repeatedly during development and hot reload sessions.

---

## Root Cause

The `nodeTypes` object was initially being recreated during component renders, which caused React Flow to detect unstable references and re-register node definitions internally.

Additionally, React Strict Mode + Vite HMR (Hot Module Replacement) behavior in development mode caused React Flow to aggressively re-check object references even after optimization attempts.

---

## Debugging Process

### Initial Attempts

The following fixes were tested:

* moving `nodeTypes` into `useMemo`
* extracting constants outside the component
* stabilizing handlers using `useCallback`
* wrapping the Dashboard component with `React.memo`

While these changes reduced unnecessary rerenders, the warning still occasionally appeared during development hot reload cycles.

---

## Final Observation

After testing the optimized production build using:

```bash
npm run build
npm run preview
```

the warning disappeared completely.

This confirmed the issue was primarily:

* development-mode behavior
* React Strict Mode/HMR related
* non-production impacting

---

## Final Resolution

The final implementation keeps:

* stable top-level `NODE_TYPES`
* memoized handlers
* simplified React Flow configuration

The warning no longer appears in production preview builds, confirming the application behavior is stable in production environments.

---

# 2. MongoDB Seeder Disconnection Issue

## Issue

Running:

```bash
npm run seed
```

successfully inserted data but sometimes printed:

```text
MongoDB disconnected
```

or caused the process to hang unexpectedly.

---

## Root Cause

The seeding script exited before Mongoose had fully closed the database connection pool.

`process.exit(0)` was being triggered too early.

---

## Debugging Process

Observed that:

* data insertion completed correctly
* MongoDB listeners still remained active
* disconnection events fired after process termination started

This created inconsistent shutdown behavior.

---

## Final Fix

Updated the seeding flow to:

```js
await mongoose.disconnect();
```

before process termination.

This ensured:

* clean database shutdown
* proper pool cleanup
* predictable CLI behavior

---

# 3. Recommendation Route ObjectId Crash

## Issue

Accessing:

```text
/api/users/:id/recommendations
```

literally (without replacing `:id`) caused:

```text
CastError: Cast to ObjectId failed
```

---

## Root Cause

The route parameter string `:id` was passed directly into a MongoDB ObjectId query.

MongoDB attempted to cast the literal string `:id` into a valid ObjectId and failed.

---

## Debugging Process

Initially appeared to be:

* recommendation engine issue
* MongoDB corruption
* route mismatch

After inspecting logs carefully, the real issue was identified as an invalid route parameter being sent from the client.

---

## Final Fix

The frontend/API usage was corrected to:

* replace `:id` with actual user IDs
* fallback to authenticated user ID where appropriate

Example logic:

```js
req.params.id || req.user._id
```

This prevented invalid ObjectId casting during normal usage.

---

# 4. MongoDB SRV Connection Failure

## Issue

The backend failed to connect to MongoDB Atlas in some environments and returned:

```text
querySrv ECONNREFUSED
```

or authentication-related connection failures.

---

## Root Cause

The MongoDB connection string contained special characters in the password that were not URL encoded properly.

---

## Debugging Process

The issue was difficult to identify initially because:

* Node.js logs were inconsistent
* Atlas logs were vague
* local environments behaved differently

The connection string was tested directly in MongoDB Compass, which exposed the actual authentication issue.

---

## Final Fix

Environment documentation was updated to clarify:

* special characters in passwords must be URL encoded
* Atlas IP/network access must be configured correctly

This resolved the connection instability.

---

# 5. Fake/Invalid Hobby Seed Data

## Issue

Initial seeded data generated unrealistic hobby relationships and weak recommendation quality.

Examples:

* meaningless hobby overlap
* unrelated recommendation matches
* visually poor graph relationships

---

## Root Cause

The first seeder implementation relied too heavily on random/faker-generated hobby assignments.

This produced technically valid but semantically weak recommendation data.

---

## Debugging Process

Frontend testing revealed:

* recommendation explanations looked random
* graph relationships felt artificial
* recommendation scoring lacked realism

The issue was identified as a data-quality problem rather than a scoring-engine problem.

---

## Final Fix

The seed dataset was redesigned using curated hobby categories such as:

* Backend Development
* React
* Anime
* Cooking
* Gaming
* Machine Learning
* Docker

This significantly improved:

* recommendation realism
* graph readability
* demo quality
* explainable scoring behavior

---

# 6. Frontend/Backend Response Shape Mismatch

## Issue

Some frontend components initially failed because API responses were being accessed incorrectly.

Examples:

* `response.data`
  vs
* `response.data.data`

---

## Root Cause

The backend used a standardized API response wrapper:

```json
{
  "success": true,
  "data": {}
}
```

while some frontend integrations initially assumed raw payload structures.

---

## Debugging Process

Browser network inspection revealed:

* requests succeeded
* frontend rendering failed silently
* undefined values propagated into React state

---
# 7. Production Cookie Authentication Failure

## Issue

Authentication worked correctly in local development but failed partially after deployment.

Symptoms:

* login worked
* some protected APIs worked
* unlink operation returned:

```text
Please login to access this resource
```

despite the user being authenticated.

---

## Root Cause

The frontend and backend were deployed on different domains:

* Frontend → Vercel
* Backend → Render

The authentication cookie used:

```js
sameSite: 'lax'
```

which prevented the browser from consistently sending cookies during cross-origin requests (especially `DELETE` requests).

Localhost testing masked the issue because browsers apply less strict cookie policies on local development environments.

---

## Debugging Process

The issue initially appeared to be:

* broken middleware
* axios configuration issue
* JWT verification issue
* ownership middleware failure

The following areas were inspected:

* auth middleware logs
* axios configuration
* request headers
* browser network tab
* cookie presence during requests

After comparing local vs production behavior, the issue was isolated to cross-origin cookie policy restrictions.

---

## Final Fix

Updated cookie configuration:

```js
sameSite:
  process.env.NODE_ENV === 'production'
    ? 'none'
    : 'lax'
```

along with:

```js
secure: process.env.NODE_ENV === 'production'
```

This allowed authentication cookies to work correctly across frontend/backend domains in production.

After clearing browser cookies and re-authenticating, all protected APIs worked correctly.

---

# 8. Vercel SPA Routing 404 Issue

## Issue

Refreshing frontend routes or directly opening routes such as:

```text
/login
/dashboard
```

returned:

```text
404: NOT_FOUND
```

on Vercel deployment.

---

## Root Cause

The frontend uses React Router in SPA (Single Page Application) mode.

Vercel attempted to resolve routes like `/login` as physical server files instead of forwarding them to `index.html`.

---

## Debugging Process

The issue appeared only:

* after refreshing pages
* after logout redirects
* when directly accessing nested routes

Internal React navigation worked correctly, which indicated:

* frontend routing itself was fine
* deployment rewrite configuration was missing

---

## Final Fix

Added:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

inside:

```text
vercel.json
```

This correctly redirected all frontend routes to React Router.

After redeployment:

* refresh worked
* logout redirects worked
* direct URL access worked
* nested routes worked correctly

---

# 9. Render Deployment Failure — Missing Compression Dependency

## Issue

Backend deployment on Render failed immediately during startup with:

```text
Error: Cannot find module 'compression'
```

---

## Root Cause

The `compression` middleware import still existed in `app.js` while the package had been removed from `package.json`.

The issue was hidden locally because old dependencies still existed inside local `node_modules`.

Render performed a fresh dependency installation, exposing the missing package correctly.

---

## Debugging Process

The deployment logs were inspected carefully to identify:

* exact missing dependency
* require stack
* startup failure location

This revealed stale local dependencies masking the real issue during local development.

---

## Final Fix

Removed unused:

```js
require('compression')
```

and:

```js
app.use(compression())
```

from the backend.

After redeployment, the server started successfully.

---

# 10. Full Production Workflow Validation

## Final Deployment Verification

After all deployment-related fixes, the following workflows were tested successfully on live production deployment:

* register
* login
* session persistence
* refresh handling
* graph rendering
* recommendations
* link
* unlink
* logout
* re-login

This validated:

* frontend/backend integration
* cross-origin authentication
* SPA routing behavior
* protected API workflows
* production-ready deployment stability

## Final Fix

Frontend API handling was standardized across the project using:

* centralized API helpers
* consistent response destructuring
* reusable package hooks

This removed inconsistent payload handling across components.

---

# Final Notes

Most issues encountered during development were related to:

* integration consistency
* frontend/backend synchronization
* state management stability
* realistic data modeling
* development-mode tooling behavior

The debugging process focused on:

* root-cause analysis
* minimizing unnecessary complexity
* preserving project stability
* improving maintainability

rather than applying heavy architectural changes prematurely.
