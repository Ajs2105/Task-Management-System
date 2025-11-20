# QUICK START GUIDE - Task Manager

## What Was Wrong?

Your project had **API path issues** in the frontend:

### ❌ Problems Found & Fixed:
1. **Login.jsx** - Used `/api/auth/login` but axios baseURL already has `/api`
2. **Register.jsx** - Used `/api/auth/register` but axios baseURL already has `/api`
3. **axiosConfig.js** - Had typo `editAuthorization` instead of `Authorization`

### ✅ What I Fixed:
1. Updated `Login.jsx` - Changed `/api/auth/login` → `/auth/login`
2. Updated `Register.jsx` - Changed `/api/auth/register` → `/auth/register`
3. Fixed `axiosConfig.js` - JWT header now correctly set for all requests
4. Added global 401 error handling - Auto-logout on token expiry
5. Backend `/api/auth/me` endpoint - Verify current user from JWT

---

## How to Run (Windows)

### Option 1: Automated Startup Script
```bash
cd "C:\Users\ashwi\OneDrive\Desktop\Task Managmenht system"
start.bat
```
This will:
- Check PostgreSQL is running
- Start Backend (port 8081) in new terminal
- Start Frontend (port 5173) in new terminal

### Option 2: Manual Startup

**Terminal 1 - Backend:**
```bash
cd "C:\Users\ashwi\OneDrive\Desktop\Task Managmenht system\task-manager-backend"
mvnw.cmd spring-boot:run
```
Wait for: `Tomcat started on port 8081`

**Terminal 2 - Frontend:**
```bash
cd "C:\Users\ashwi\OneDrive\Desktop\Task Managmenht system\task-manager-frontend"
npm install
npm run dev
```
Wait for: `Local: http://localhost:5173`

---

## Test Login

### 1. Open browser: http://localhost:5173

### 2. Login with any of these (if seeded):
| Role | Email | Password |
|------|-------|----------|
| User | user@example.com | password |
| Admin | admin@example.com | password |
| Super Admin | superadmin@example.com | password |

### 3. Features:
- **User**: My Tasks page
- **Admin**: All Users Tasks + Task Assignment
- **Super Admin**: User Management + All Users Tasks

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "401 Unauthorized" | Log out → Clear localStorage → Log in again |
| Backend won't start | Ensure PostgreSQL is running on localhost:5432 with taskdb database |
| Frontend shows errors | Run `npm install` then `npm run dev` |
| Can't connect to backend | Check backend running on http://localhost:8081 |
| Cannot register | Only Users can register; Admins/SuperAdmins login only |

---

## Key Changes Made

### Frontend Files Updated:
- ✅ `src/api/axiosConfig.js` - JWT header fix + 401 handler
- ✅ `src/pages/Login.jsx` - API path fix
- ✅ `src/pages/Register.jsx` - API path fix

### Backend Files Updated:
- ✅ `src/main/java/com/taskmanager/security/AuthTokenFilter.java` - Debug logging
- ✅ `src/main/java/com/taskmanager/controller/AuthController.java` - `/auth/me` endpoint
- ✅ `src/main/java/com/taskmanager/dto/UserWithTasksDto.java` - Clean DTO

---

## Now Running ✓

✓ Backend: `http://localhost:8081/api`
✓ Frontend: `http://localhost:5173`
✓ JWT Authentication: Active
✓ Role-Based Access: Active
✓ CORS: Enabled for localhost:5173

Enjoy! 🚀

