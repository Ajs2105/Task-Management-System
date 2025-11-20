# 🎯 Task Manager - Visual Quick Reference

## One-Page Setup Guide

```
┌─────────────────────────────────────────────────────────────────────┐
│                     TASK MANAGER SETUP                              │
└─────────────────────────────────────────────────────────────────────┘

STEP 1: Prerequisites Check
├─ PostgreSQL running? (localhost:5432)
├─ Database 'taskdb' exists?
├─ Java 17+ installed?
└─ Node.js 16+ installed?

STEP 2: Start Backend (1st Terminal)
├─ cd task-manager-backend
└─ mvnw.cmd spring-boot:run
   ↓ Wait for: "Tomcat started on port 8081"

STEP 3: Start Frontend (2nd Terminal)
├─ cd task-manager-frontend
├─ npm install
└─ npm run dev
   ↓ Wait for: "http://localhost:5173"

STEP 4: Open Browser
├─ Go to: http://localhost:5173
├─ Select Role: User / Admin / SuperAdmin
├─ Enter Email & Password
└─ Click Login → Success! ✓
```

---

## API Request Flow (Diagram)

```
FRONTEND                          BACKEND                    DATABASE
──────────────────────────────────────────────────────────────────────

User enters
credentials
    │
    ├─→ POST /auth/login ───────→ AuthController
    │   (email, password)          │
    │                              ├─→ Check password
    │                              ├─→ Generate JWT
    │                              └─→ Load user roles
    │
    │                    ← JWT Token + User Info ←
    │
Store JWT
in localStorage
    │
    ├─→ GET /users/with-tasks ──→ UserController
    │   Auth: Bearer <JWT>        │
    │   (AuthTokenFilter validates JWT)
    │                              ├─→ Check user role
    │                              ├─→ Query users & tasks
    │                              └─→ Return DTO
    │
    │                    ← JSON response ←
    │
Render UI
with data
```

---

## File Locations & What They Do

```
Task Manager Root
│
├─── task-manager-backend/          Backend (Spring Boot)
│    ├─ src/main/java/com/taskmanager/
│    │  ├─ controller/
│    │  │  ├─ AuthController.java    Login/Register/Get Me
│    │  │  ├─ TaskController.java    Task CRUD
│    │  │  └─ UserController.java    User Management
│    │  ├─ security/
│    │  │  ├─ SecurityConfig.java    CORS, Filters
│    │  │  ├─ AuthTokenFilter.java   JWT Validation
│    │  │  └─ JwtUtils.java          Token Generation
│    │  ├─ service/
│    │  │  ├─ AuthService.java
│    │  │  ├─ TaskService.java
│    │  │  └─ UserDetailsServiceImpl.java
│    │  ├─ repo/
│    │  │  ├─ UserRepository.java
│    │  │  ├─ TaskRepository.java
│    │  │  └─ RoleRepository.java
│    │  ├─ model/
│    │  │  ├─ User.java
│    │  │  ├─ Task.java
│    │  │  └─ Role.java
│    │  └─ dto/
│    │     ├─ LoginRequest.java
│    │     ├─ JwtResponse.java
│    │     └─ UserWithTasksDto.java
│    ├─ pom.xml                      Maven dependencies
│    ├─ mvnw.cmd                     Maven wrapper
│    └─ src/main/resources/
│       └─ application.properties    Database config
│
├─── task-manager-frontend/          Frontend (React + Vite)
│    ├─ src/
│    │  ├─ pages/
│    │  │  ├─ Login.jsx              ✅ FIXED (API paths)
│    │  │  ├─ Register.jsx           ✅ FIXED (API paths)
│    │  │  ├─ Tasks.jsx              Task list & create
│    │  │  ├─ UserManagement.jsx     Add/delete users (SuperAdmin)
│    │  │  └─ AllUsersTasks.jsx      All users & tasks
│    │  ├─ api/
│    │  │  └─ axiosConfig.js         ✅ FIXED (JWT + 401 handler)
│    │  ├─ App.jsx                   Router & layout
│    │  └─ main.jsx                  Entry point
│    ├─ package.json                 NPM dependencies
│    ├─ vite.config.js               Build config
│    └─ index.html                   HTML entry
│
├─── SETUP_INSTRUCTIONS.md           Full setup guide
├─── QUICK_START.md                  5-minute setup
├─── README_FIXES.md                 What was fixed
├─── TECHNICAL_DOCS.md               Architecture & API
├─── FIX_SUMMARY.md                  Detailed fixes
├─── INDEX.md                        Documentation index
└─── start.bat                       Auto-start script
```

---

## Role Permissions Matrix

```
┌──────────────────┬──────────┬─────────┬──────────────┐
│ Feature          │ User     │ Admin   │ Super Admin  │
├──────────────────┼──────────┼─────────┼──────────────┤
│ Register         │ ✅ Yes   │ ❌ No   │ ❌ No        │
│ Login            │ ✅ Yes   │ ✅ Yes  │ ✅ Yes       │
│ View Own Tasks   │ ✅ Yes   │ ✅ Yes  │ ✅ Yes       │
│ Create Task      │ ✅ Yes   │ ✅ Yes  │ ✅ Yes       │
│ Update Task      │ ✅ Own   │ ✅ Any  │ ✅ Any       │
│ Delete Task      │ ✅ Own   │ ✅ Any  │ ✅ Any       │
│ View All Tasks   │ ❌ No    │ ✅ Yes  │ ✅ Yes       │
│ View All Users   │ ❌ No    │ ✅ Yes  │ ✅ Yes       │
│ Assign Tasks     │ ❌ No    │ ✅ Yes  │ ✅ Yes       │
│ Add User         │ ❌ No    │ ❌ No   │ ✅ Yes       │
│ Delete User      │ ❌ No    │ ❌ No   │ ✅ Yes*      │
│ Manage Roles     │ ❌ No    │ ❌ No   │ ✅ Yes       │
└──────────────────┴──────────┴─────────┴──────────────┘
*Cannot delete self
```

---

## Common Error Messages & Fixes

```
ERROR: 401 Unauthorized
  ├─ Cause: JWT expired or missing
  └─ Fix: Clear localStorage → Log in again

ERROR: Cannot connect to backend
  ├─ Cause: Backend not running or wrong port
  └─ Fix: Start backend with mvnw.cmd spring-boot:run

ERROR: Database connection failed
  ├─ Cause: PostgreSQL not running
  └─ Fix: Start PostgreSQL service

ERROR: Port 8081 already in use
  ├─ Cause: Another process using port
  └─ Fix: Kill process or restart computer

ERROR: node_modules not found
  ├─ Cause: Dependencies not installed
  └─ Fix: Run npm install in frontend

ERROR: API returns 404
  ├─ Cause: Wrong API path (/api/api/...)
  └─ Fix: Already fixed! (was the main bug)

SUCCESS: Redirect to /tasks
  ├─ Message: "Welcome, [Name]! (ROLE_USER)"
  └─ Status: ✓ Project is working!
```

---

## Data Flow Example (Login)

```
USER INTERFACE                FRONTEND CODE           BACKEND API
──────────────────────────────────────────────────────────────────

User fills form:
- Email: user@example.com
- Password: password123
        │
        ├─→ handleLogin()
        │   (JavaScript)
        │
        ├─→ api.post('/auth/login', {
        │      email,
        │      password
        │   })
        │                            ────────→ Spring Boot receives
        │                                       POST /api/auth/login
        │                                       │
        │                                       ├─→ AuthService.authenticate()
        │                                       │
        │                                       ├─→ UserDetailsService.loadUser()
        │                                       │
        │                                       ├─→ Check password (BCrypt)
        │                                       │
        │                                       ├─→ JwtUtils.generateToken()
        │                                       │
        │                                       └─→ Return JSON:
        │                                           {
        │                                             token: "eyJ...",
        │                                             id: 1,
        │                                             email: "user@...",
        │                                             fullName: "John",
        │                                             roles: ["ROLE_USER"]
        │                                           }
        │
        ├─← Response received
        │
        ├─→ localStorage.setItem('jwt', token)
        │
        ├─→ onLogin(userObj)
        │   (Update React state)
        │
        └─→ navigate('/tasks')
            (Redirect to tasks page)

Task page loads:
        ├─→ useEffect(() => {
        │     api.get('/users/1/tasks')
        │   })
        │                            ────────→ Request header:
        │                                      Authorization: Bearer token
        │                                      │
        │                                      ├─→ AuthTokenFilter validates JWT
        │                                      │
        │                                      ├─→ JwtUtils.validateJwt(token)
        │                                      │
        │                                      ├─→ SecurityContext.setAuth()
        │                                      │
        │                                      ├─→ UserController.getTasks()
        │                                      │
        │                                      └─→ TaskRepository.findByUserId()
        │
        ├─← [Task list returned]
        │
        └─→ setTasks(data)
            (Render task list)
```

---

## Keyboard Shortcuts & Quick Commands

```
BACKEND DEVELOPMENT:
├─ Start:    cd task-manager-backend && mvnw.cmd spring-boot:run
├─ Build:    mvnw.cmd clean package
├─ Test:     mvnw.cmd test
└─ Logs:     Check console output

FRONTEND DEVELOPMENT:
├─ Start:    cd task-manager-frontend && npm run dev
├─ Build:    npm run build
├─ Lint:     npm run lint
└─ Preview:  npm run preview

DATABASE:
├─ Connect:  psql -h localhost -U postgres -d taskdb
├─ List DBs: \l
├─ List Schemas: \dt
└─ Exit:     \q

SYSTEM:
├─ Check Port: netstat -ano | findstr :8081 (or :5173)
├─ Kill Port: taskkill /PID <pid> /F
├─ Check DB: pg_isready -h localhost
└─ Open Browser: start http://localhost:5173
```

---

## Success Indicators ✓

When everything is working, you should see:

```
BACKEND:
├─ ✓ Tomcat started on port 8081
├─ ✓ Starting SQL update queries
├─ ✓ [AuthTokenFilter] JWT from header: eyJ...
├─ ✓ [AuthTokenFilter] JWT valid: true
└─ ✓ Database connection successful

FRONTEND:
├─ ✓ Local: http://localhost:5173
├─ ✓ [Axios] JWT from localStorage: eyJ...
├─ ✓ [Axios] Authorization header set: Bearer eyJ...
├─ ✓ Login successful → redirect to /tasks
└─ ✓ Tasks loaded → display task list

BROWSER:
├─ ✓ Page loads at http://localhost:5173
├─ ✓ Can enter email/password
├─ ✓ Login button submits form
├─ ✓ Redirects to /tasks page
├─ ✓ See "Welcome, [Name]!" header
└─ ✓ Task list displays (or empty list for new user)
```

---

## 🎉 Ready to Go!

All issues are **FIXED** and **DOCUMENTED**.

Your project is ready to:
1. ✅ Run locally for development
2. ✅ Test all features
3. ✅ Deploy to production
4. ✅ Scale and maintain

**Next Step**: Read **QUICK_START.md** and run `start.bat`

