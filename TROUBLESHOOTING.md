# 🔍 Login & Authentication Troubleshooting Guide

## Issues & Solutions

### Issue 1: "Invalid email or password" Error

**Possible Causes:**
1. Wrong credentials entered
2. User doesn't exist in database
3. Backend is not running
4. API endpoint not accessible

**Solutions:**
```
✓ Step 1: Verify backend is running on port 8081
  Command: Check terminal for "Tomcat started on port 8081"

✓ Step 2: Verify user exists in database
  - Connect to PostgreSQL: psql -h localhost -U postgres -d taskdb
  - List users: SELECT * FROM users;
  - If no users, check if seeding ran on startup

✓ Step 3: Check browser console (F12 → Console tab)
  - Look for 401/404/500 errors
  - Check network requests to backend

✓ Step 4: Try default credentials (if seeded):
  Email: user@example.com
  Password: password
```

---

### Issue 2: Login Works But Immediately Redirects to Login

**Status:** ✅ **FIXED** (see LOGIN_FIX.md)

**Cause:** User state was not persisted in localStorage

**Solution:** Already applied in:
- `src/App.jsx` - Loads user on app mount
- `src/pages/Login.jsx` - Stores user data

**How to verify it's fixed:**
1. Refresh frontend: Ctrl+C, then `npm run dev`
2. Log in again
3. You should stay logged in even after page refresh

---

### Issue 3: Login Works But Logout Doesn't Clear Session

**Cause:** localStorage not fully cleared

**Solution:** Already fixed in `src/App.jsx`
```javascript
const handleLogout = () => {
  setUser(null);
  localStorage.removeItem('jwt');
  localStorage.removeItem('user');  // Now removes user data too
};
```

---

### Issue 4: Page Refresh Loses Login Session

**Status:** ✅ **FIXED** 

**Cause:** App didn't restore user from localStorage

**Solution:** Added `useEffect` in `src/App.jsx`
```javascript
useEffect(() => {
  const jwt = localStorage.getItem('jwt');
  const storedUser = localStorage.getItem('user');
  
  if (jwt && storedUser) {
    try {
      api.get('/auth/me');  // Verify JWT is valid
      setUser(JSON.parse(storedUser));
    } catch {
      localStorage.clear();
    }
  }
}, []);
```

---

### Issue 5: 401 Unauthorized Error on API Calls

**Causes:**
1. JWT not being sent in request header
2. JWT has expired
3. JWT signature is invalid

**Solutions:**
```
✓ Check axiosConfig.js has JWT header:
  Authorization: Bearer <token>

✓ Check localStorage has valid JWT:
  Open DevTools → Application → LocalStorage
  Should have "jwt" key with long string

✓ Check backend logs for JWT validation errors:
  Look for: "[AuthTokenFilter] JWT valid: false"

✓ If JWT expired (>1 hour old):
  - Clear localStorage
  - Log in again
```

---

### Issue 6: Can't Access Admin/SuperAdmin Features

**Check User Role:**

```
✓ Step 1: Log in with admin/super admin credentials

✓ Step 2: Open DevTools → Application → LocalStorage
  Key: "user"
  Value should show: "roles": ["ROLE_ADMIN"] or ["ROLE_SUPER_ADMIN"]

✓ Step 3: Backend must have seeded roles:
  Check database: SELECT * FROM roles;
  Should have: ROLE_USER, ROLE_ADMIN, ROLE_SUPER_ADMIN

✓ Step 4: User must have role assigned:
  SELECT u.*, r.name FROM users u
  JOIN user_roles ur ON u.id = ur.user_id
  JOIN roles r ON ur.role_id = r.id;
```

---

## Debugging Steps

### Step 1: Check Backend
```bash
# Terminal 1: Start backend
cd task-manager-backend
mvnw.cmd spring-boot:run

# Check for these log messages:
# ✓ "Tomcat started on port 8081"
# ✓ "HikariPool-1 - Added connection"
# ✓ "Starting Spring Data repository scanning"
```

### Step 2: Check Frontend
```bash
# Terminal 2: Start frontend
cd task-manager-frontend
npm run dev

# Check for these messages:
# ✓ "VITE v7.1.5  ready in XXX ms"
# ✓ "Local:   http://localhost:5173/"
```

### Step 3: Check Database
```bash
# Terminal 3: Connect to database
psql -h localhost -U postgres -d taskdb

# List all users
SELECT id, email, full_name FROM users;

# List all roles
SELECT * FROM roles;

# Check user-role assignments
SELECT u.email, r.name FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id;
```

### Step 4: Check Browser Console
```
Open DevTools (F12)
Go to: Console tab

Look for:
❌ Red errors with 401/404/500
❌ Network failures to http://localhost:8081
❌ localStorage issues

Look for helpful logs:
✓ "[Axios] JWT from localStorage: eyJ..."
✓ "[Axios] Authorization header set: Bearer..."
```

### Step 5: Check Network Requests
```
Open DevTools (F12)
Go to: Network tab

Try login and check:
✓ POST /api/auth/login - Should be 200
✓ Response should have: token, id, email, fullName, roles
✓ Headers should have: Content-Type: application/json
```

---

## Common Error Messages

### Error: "Cannot POST /api/auth/login"
```
❌ Cause: Backend not running or wrong port
✅ Fix: Start backend with mvnw.cmd spring-boot:run
✅ Verify: http://localhost:8081 is accessible
```

### Error: "Failed to parse stored user"
```
❌ Cause: localStorage has corrupted user data
✅ Fix: Clear localStorage: localStorage.clear()
✅ Verify: Log in again
```

### Error: "JWT validation failed"
```
❌ Cause: JWT expired or signature invalid
✅ Fix: Log out and log in again
✅ Verify: App shows "Loading..." briefly then login page
```

### Error: "Cannot fetch /auth/me"
```
❌ Cause: JWT missing or invalid on app load
✅ Fix: Not an error if you're not logged in
✅ Normal: Should see login page, not an error
```

---

## localStorage Keys

After successful login, you should have:

```javascript
// Key: jwt
// Value: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// Key: user
// Value: {
//   "token": "eyJ...",
//   "id": 1,
//   "email": "user@example.com",
//   "fullName": "John Doe",
//   "roles": ["ROLE_USER"]
// }
```

**How to view:**
- Open DevTools (F12)
- Go to Application tab
- Click LocalStorage
- Click localhost:5173
- You should see both keys

---

## How to Clear & Reset

```javascript
// In browser console, clear everything:
localStorage.clear();
location.reload();

// Or clear specific keys:
localStorage.removeItem('jwt');
localStorage.removeItem('user');
location.reload();
```

---

## JWT Token Structure

Your JWT contains:
1. **Header** - Algorithm (HS256)
2. **Payload** - Subject (email), issued at, expiration
3. **Signature** - Verified by backend

Example decoded JWT:
```json
{
  "sub": "user@example.com",
  "iat": 1700000000,
  "exp": 1700003600
}
```

Expires in: **1 hour** (3600 seconds)

---

## Checklist for Full Login Flow

- [ ] Backend running on port 8081
- [ ] Frontend running on port 5173
- [ ] PostgreSQL running with taskdb
- [ ] Users table has records
- [ ] Roles table has 3 roles
- [ ] User has role assigned (user_roles table)
- [ ] Try login with valid credentials
- [ ] No 401/404/500 errors
- [ ] Redirected to /tasks page
- [ ] "Welcome, [Name]!" shows in header
- [ ] localStorage has jwt and user keys
- [ ] Page refresh → stay logged in
- [ ] Logout clears localStorage
- [ ] After logout → redirect to login

**All checked?** → Login is working! ✅

---

## Getting Help

If you're still having issues:

1. **Check the log files**:
   - Backend: Look for `[AuthTokenFilter]` logs
   - Frontend: Check browser console

2. **Run diagnostic commands**:
   ```bash
   # Check backend port
   netstat -ano | findstr :8081
   
   # Check frontend port
   netstat -ano | findstr :5173
   
   # Check database connection
   psql -h localhost -U postgres -d taskdb -c "SELECT 1"
   ```

3. **Read the guides**:
   - LOGIN_FIX.md - Detailed explanation
   - SETUP_INSTRUCTIONS.md - Full setup
   - TECHNICAL_DOCS.md - Architecture

