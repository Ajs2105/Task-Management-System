# 🔧 Tasks Page - Quick Fix Reference

## What Was Broken ❌

```
Regular User Login → Tasks Page → Page crashes/doesn't load
                                   ↓
                            404 error: Can't find /users/{id}/tasks
                                   ↓
                              Frontend bug: Calling non-existent endpoint
```

---

## The 3 Critical Bugs

### Bug #1: Wrong Endpoint
```jsx
❌ WRONG (what was happening):
const res = await api.get(`/users/${user.id}/tasks`);  // 404 - doesn't exist!

✅ CORRECT (after fix):
const res = await api.get('/tasks');  // Backend filters for us!
```

### Bug #2: Variable Used Before Definition
```jsx
❌ WRONG (what was happening):
useEffect(() => {
  if (canAdmin) { }  // canAdmin is undefined here!
}, []);

const canAdmin = ...  // Defined AFTER useEffect

✅ CORRECT (after fix):
const canAdmin = ...  // Defined FIRST

useEffect(() => {
  if (canAdmin) { }  // Now it's defined!
}, []);
```

### Bug #3: Role Name Mismatch
```jsx
❌ WRONG (frontend was checking):
'ROLE_SUPER_ADMIN'  // with underscore

✅ BACKEND RETURNS:
'ROLE_SUPERADMIN'   // without underscore

❌ RESULT: Roles never matched!

✅ FIXED: Changed frontend to 'ROLE_SUPERADMIN'
```

---

## Code Changes Made

### Changed File: `src/pages/Tasks.jsx`

**Line 11: Move canAdmin up**
```jsx
// NOW at the top (BEFORE useEffect)
const canAdmin = user && user.roles && 
  (user.roles.includes('ROLE_ADMIN') || user.roles.includes('ROLE_SUPERADMIN'));
```

**Lines 18-28: Simplify loadTasks**
```jsx
// BEFORE:
const loadTasks = async () => {
  if (canAdmin) {
    const res = await api.get('/tasks');
    setTasks(res.data);
  } else if (user && user.id) {
    const res = await api.get(`/users/${user.id}/tasks`);  // ❌ WRONG
    setTasks(res.data);
  }
};

// AFTER:
const loadTasks = async () => {
  try {
    const res = await api.get('/tasks');  // ✅ Single endpoint
    setTasks(res.data);
  } catch (error) {
    console.error('Failed to load tasks:', error);
    setTasks([]);
  }
};
```

**Lines 33-78: Add error handling everywhere**
```jsx
// BEFORE:
const loadUsers = async () => {
  const res = await api.get('/users');
  setUsers(res.data);
};

// AFTER:
const loadUsers = async () => {
  try {
    const res = await api.get('/users');
    setUsers(res.data);
  } catch (error) {
    console.error('Failed to load users:', error);
  }
};
```

---

## Testing Checklist

### ✅ Test 1: Regular User
```
1. Clear localStorage: F12 → Application → LocalStorage → Clear All
2. Go to http://localhost:5173
3. Log in: user@example.com / password
4. Should see Tasks page with "Show My Tasks" button
5. Click button → See tasks list
6. F12 → Network → Should see "GET /api/tasks" with status 200
```

### ✅ Test 2: Admin User
```
1. Log out and clear localStorage
2. Log in: admin@example.com / password
3. Should see dropdown to select user + Create button
4. Select a user from dropdown
5. Enter task title and click "Add"
6. Task appears in list
7. F12 → Network → Should see "POST /api/tasks" with status 200
```

### ✅ Test 3: Update Status
```
1. (As regular user) Click on task status dropdown
2. Change to IN_PROGRESS → should update
3. F12 → Network → Should see "PATCH /api/tasks/{id}/status"
```

### ✅ Test 4: Delete Task
```
1. (As admin) Click "Delete" button
2. Task disappears
3. F12 → Network → Should see "DELETE /api/tasks/{id}"
```

---

## How to Restart Frontend

```powershell
# Step 1: Stop current server
Ctrl+C

# Step 2: Verify you're in frontend directory
cd task-manager-frontend

# Step 3: Start dev server
npm run dev

# Should see:
# VITE v7.1.5 ready in XXX ms
# Local: http://localhost:5173/
```

---

## If Still Having Issues

### Check 1: Backend Running?
```powershell
# Terminal in backend folder:
cd task-manager-backend
mvnw.cmd spring-boot:run

# Should see:
# Tomcat started on port 8081
```

### Check 2: Database Running?
```bash
psql -h localhost -U postgres -d taskdb -c "SELECT COUNT(*) FROM users;"
# Should return: 1 or more
```

### Check 3: Browser Console
```javascript
// F12 → Console tab - should NOT see red errors
// Only green messages like:
// "[Axios] JWT from localStorage: eyJ..."
```

### Check 4: Network Tab
```
F12 → Network tab → Reload page (F5)
- GET /api/tasks should be 200
- Should NOT see 404 errors
- Should NOT see 401 errors
```

### Check 5: localStorage
```javascript
// F12 → Application → LocalStorage → http://localhost:5173
// Should have:
// Key: "jwt" → Value: "eyJ..." (long string)
// Key: "user" → Value: {...user data...}
```

---

## Backend Endpoints (No Changes Needed)

| Method | Endpoint | What It Does |
|--------|----------|--------------|
| GET | `/api/tasks` | Get all tasks (filtered by role) |
| POST | `/api/tasks` | Create new task |
| PATCH | `/api/tasks/{id}/status` | Update task status |
| DELETE | `/api/tasks/{id}` | Delete task (admin only) |

---

## Role Names (Now Consistent)

**Backend:** `ROLE_SUPERADMIN` (no underscore)
**Frontend:** `ROLE_SUPERADMIN` (no underscore) ✅

---

## Summary

| Issue | Fixed | Impact |
|-------|-------|--------|
| Non-existent endpoint | ✅ Using `/tasks` now | Tasks page loads |
| Undefined variable | ✅ Moved before useEffect | No crashes |
| Role name mismatch | ✅ Using `ROLE_SUPERADMIN` | Admin features work |
| No error handling | ✅ Added try-catch | Better debugging |

**Result:** Tasks page now works for both regular users and admins! ✅

