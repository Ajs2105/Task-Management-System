# 🐛 Tasks Page Not Opening - Bug Analysis & Fixes

## Issues Found

### Issue 1: Frontend Calling Non-Existent Endpoint ❌

**Location:** `src/pages/Tasks.jsx` (Line 18)

**Problem:**
```jsx
const res = await api.get(`/users/${user.id}/tasks`);
```

**Why it fails:**
- Frontend tries to call: `GET /api/users/{userId}/tasks`
- Backend does NOT have this endpoint
- Result: 404 error, page doesn't load

**Backend reality:**
- Only has: `GET /api/tasks` (no user-specific endpoint)

---

### Issue 2: Missing `canAdmin` Definition ❌

**Location:** `src/pages/Tasks.jsx` (Line 7-13)

**Problem:**
```jsx
useEffect(() => {
  loadTasks();
  if (canAdmin) {  // ← canAdmin used here
    loadUsers();
  }
}, []);

// ... but canAdmin defined AFTER (line 46)
const canAdmin = user && user.roles && (...)
```

**Why it fails:**
- `canAdmin` is undefined when used in `useEffect`
- Uses variable before it's defined
- JavaScript hoisting doesn't help with const
- Result: Runtime error

---

### Issue 3: Inconsistent Role Names 🔄

**Frontend:** `Tasks.jsx` checks for:
```jsx
'ROLE_ADMIN' || 'ROLE_SUPER_ADMIN'
```

**Backend:** `TaskController.java` checks for:
```java
'ROLE_ADMIN' || 'ROLE_SUPERADMIN'  // No underscore in SUPER_ADMIN!
```

**Result:** Mismatch causes admin features to not work properly

---

## Solutions

### Fix 1: Remove Non-Existent Endpoint

**File:** `src/pages/Tasks.jsx`

Replace the loadTasks function to use only the existing backend endpoint:

```jsx
const loadTasks = async () => {
  try {
    const res = await api.get('/tasks');  // Use single endpoint
    setTasks(res.data);
  } catch (error) {
    console.error('Failed to load tasks:', error);
    setTasks([]);
  }
};
```

**Why this works:**
- Backend's `GET /api/tasks` already filters:
  - Admins see all tasks
  - Regular users see only their tasks (assigned or created)
- No need for separate endpoint

---

### Fix 2: Move `canAdmin` Before useEffect

**File:** `src/pages/Tasks.jsx`

Define `canAdmin` BEFORE useEffect:

```jsx
function Tasks({ user }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

  // ✅ Define canAdmin HERE - before useEffect
  const canAdmin = user && user.roles && 
    (user.roles.includes('ROLE_ADMIN') || user.roles.includes('ROLE_SUPER_ADMIN'));

  useEffect(() => {
    loadTasks();
    if (canAdmin) {  // Now it's defined!
      loadUsers();
    }
  }, []);

  const loadTasks = async () => {
    // ... rest of code
  };
```

---

### Fix 3: Standardize Role Names

**Option A: Frontend matches Backend (Recommended)**

Change `Tasks.jsx` to use `ROLE_SUPERADMIN` (no underscore):

```jsx
const canAdmin = user && user.roles && 
  (user.roles.includes('ROLE_ADMIN') || user.roles.includes('ROLE_SUPERADMIN'));
```

**Option B: Backend matches Frontend**

Change `TaskController.java` to use `ROLE_SUPER_ADMIN`:

```java
boolean isAdmin = u != null && u.getRoles().stream()
    .anyMatch(r -> "ROLE_ADMIN".equals(r.getName()) || "ROLE_SUPER_ADMIN".equals(r.getName()));
```

**Choose Option A** (frontend change is simpler)

---

## Complete Fixed Tasks.jsx

```jsx
import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

function Tasks({ user }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

  // ✅ Move canAdmin definition HERE
  const canAdmin = user && user.roles && 
    (user.roles.includes('ROLE_ADMIN') || user.roles.includes('ROLE_SUPERADMIN'));

  useEffect(() => {
    loadTasks();
    if (canAdmin) {
      loadUsers();
    }
    // eslint-disable-next-line
  }, []);

  // ✅ Simplified loadTasks - use single backend endpoint
  const loadTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setTasks([]);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
      if (res.data.length > 0) setSelectedUser(res.data[0].id);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    try {
      if (canAdmin && selectedUser) {
        await api.post('/tasks', { title, userId: selectedUser });
      } else {
        await api.post('/tasks', { title });
      }
      setTitle('');
      loadTasks();
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      loadTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  // ✅ Fixed role name: ROLE_SUPERADMIN (no underscore)
  const canUpdateStatus = (t) => {
    if (!user || !user.roles) return false; 
    if (user.roles.includes('ROLE_ADMIN') || user.roles.includes('ROLE_SUPERADMIN')) return false;
    return (t.assignee && t.assignee.id === user.id) || (t.creator && t.creator.id === user.id);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      loadTasks();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  return (
    <div>
      <h2>Tasks</h2>
      {canAdmin && (
        <form onSubmit={addTask} style={{ marginBottom: 16 }}>
          <input
            type="text"
            placeholder="New Task"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ marginRight: 8 }}
          />
          <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} style={{ marginRight: 8 }}>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
            ))}
          </select>
          <button type="submit">Add</button>
        </form>
      )}
      {!canAdmin && (
        <button onClick={loadTasks} style={{ marginBottom: 16, padding: '8px 18px', background: '#007bff', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 'bold', fontSize: 16, cursor: 'pointer' }}>
          Show My Tasks
        </button>
      )}
      <ul>
        {tasks.map((t) => (
          <li key={t.id} style={{ marginBottom: 8 }}>
            {t.title} - 
            {canUpdateStatus(t) ? (
              <select value={t.status} onChange={e => handleStatusChange(t.id, e.target.value)} style={{ marginLeft: 8, marginRight: 8 }}>
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="DONE">DONE</option>
                <option value="BLOCKED">BLOCKED</option>
              </select>
            ) : (
              <span style={{ marginLeft: 8, marginRight: 8 }}>{t.status}</span>
            )}
            {canAdmin && (
              <button onClick={() => deleteTask(t.id)} style={{ marginLeft: 12, color: '#fff', background: '#dc3545', border: 'none', borderRadius: 4, padding: '2px 10px', cursor: 'pointer' }}>Delete</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Tasks;
```

---

## Summary of Changes

| Issue | File | Change | Reason |
|-------|------|--------|--------|
| Non-existent endpoint | `Tasks.jsx` | Remove user-specific logic, use `/tasks` | Backend already filters by user |
| Undefined variable | `Tasks.jsx` | Move `canAdmin` before `useEffect` | Must define before using |
| Role name mismatch | `Tasks.jsx` | Change to `ROLE_SUPERADMIN` | Match backend naming |
| Error handling | `Tasks.jsx` | Add try-catch blocks | Prevent crashes on API errors |

---

## How to Test

1. **Restart frontend:**
   ```bash
   Ctrl+C  # Stop current dev server
   npm run dev
   ```

2. **Log in as regular user:**
   - Email: `user@example.com`
   - Password: `password`
   - Should see: "Show My Tasks" button + list of user's tasks

3. **Log in as admin:**
   - Email: `admin@example.com`
   - Password: `password`
   - Should see: Dropdown to create tasks for other users

4. **Check browser console (F12):**
   - No red errors
   - Should see tasks loading

5. **Verify in DevTools Network tab:**
   - POST `/api/tasks` (create)
   - GET `/api/tasks` (load)
   - PATCH `/api/tasks/{id}/status` (update)
   - DELETE `/api/tasks/{id}` (delete)
   - All should return 200/204 status

---

## Backend Status ✅

Backend is correct:
- ✅ `GET /api/tasks` filters by user/admin
- ✅ `POST /api/tasks` creates for user/admin
- ✅ `PATCH /api/tasks/{id}/status` updates only for assignee/creator
- ✅ `DELETE /api/tasks/{id}` admin only
- ✅ No need for `/users/{id}/tasks` endpoint

Only issue: Role name mismatch between code files (can standardize backend if needed)

