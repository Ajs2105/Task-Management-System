# 🚀 Admin Task Assignment - Complete Troubleshooting & Testing Guide

**Status**: ✅ Code Fixed | 🔍 Ready for Debugging | ⚡ Enhanced Logging Added

---

## **Issue Summary**

❌ **Problem**: When admin creates a task and selects a user from dropdown, the task is assigned to **admin instead of the selected user**.

✅ **Root Cause**: (1) `selectedUser` may be empty, or (2) `/users` endpoint call fails so dropdown has no options.

✅ **Solution Applied**: Added comprehensive logging and error handling to identify exactly where the issue occurs.

---

## **Quick Test (5 minutes)**

### Step 1: Start Backend (if not running)
```powershell
cd "c:\Users\ashwi\OneDrive\Desktop\Task Managmenht system\task-manager-backend"
.\mvnw.cmd spring-boot:run
```
✓ Wait for: `Tomcat started on port 8081`

### Step 2: Start Frontend (if not running)
```powershell
cd "c:\Users\ashwi\OneDrive\Desktop\Task Managmenht system\task-manager-frontend"
npm run dev
```
✓ Wait for: `VITE v7.1.5 ready in XXXms` and note the URL (e.g., `http://localhost:5173/` or `http://localhost:5174/`)

### Step 3: Open Browser Console
- **Windows**: Press `F12` → Click **Console** tab
- **Mac**: Press `Cmd+Option+I` → **Console** tab
- **Chrome DevTools**: Network tab also recommended

### Step 4: Login as Admin
- **URL**: Your frontend URL from Step 2
- **Email**: `admin1@gmail.com`
- **Password**: `Admin21`
- ✓ Check console for: `[Tasks] Loading users list (admin dropdown)...`

### Step 5: Verify Users Load
**In Console** (F12), look for:
```
[Tasks] Users list loaded. Count: 2
[Tasks] Users set. Default selected user ID: 2
```

❌ **If you see errors instead**: Go to **Troubleshooting** section below.

### Step 6: Create a Task
1. Type task title: `Test Task from Admin`
2. **Important**: Check dropdown shows users like `John Doe (john@example.com)`
3. **Click "Add" button**
4. Check console for:
```
[Tasks] Creating task (admin) with payload: {title: 'Test Task from Admin', assigneeId: 2}
[Tasks] Task created successfully: {...}
```

### Step 7: Verify Task Assignment
- **As Admin**: You should see the task in your list
- **As Selected User**:
  1. Logout from admin
  2. Login as the selected user (dropdown user)
  3. Check if task appears in their task list
  4. ✓ **Expected**: Task IS visible with status TODO

- ✗ **If NOT visible**: See **Troubleshooting** → **Task Not Appearing for User**

---

## **Detailed Logging Explanation**

### When Loading Users:
```javascript
[Tasks] Loading users list (admin dropdown)...
[Tasks] Users list loaded. Count: 3
[Tasks] Users: [
  {id: 1, fullName: 'John Doe', email: 'john@example.com'},
  {id: 2, fullName: 'Jane Smith', email: 'jane@example.com'},
  {id: 3, fullName: 'Bob Wilson', email: 'bob@example.com'}
]
[Tasks] Users set. Default selected user ID: 1
```

✓ **What's good**:
- Users loaded successfully
- IDs are numbers (not strings)
- `selectedUser` state is set to first ID

### When Creating Task:
```javascript
[Tasks] Creating task (admin) with payload: {
  title: 'Review Report', 
  assigneeId: 2
}
[Tasks] Task created successfully: {
  id: 5,
  title: 'Review Report',
  creator: {id: 1, fullName: 'Admin', email: 'admin1@gmail.com'},
  assignee: {id: 2, fullName: 'Jane Smith', email: 'jane@example.com'},
  status: 'TODO'
}
```

✓ **What's good**:
- `assigneeId` is a **number** (not string)
- Response shows correct `assignee` object with ID 2
- Creator is admin (ID 1), assignee is user (ID 2)

---

## **🔴 Troubleshooting**

### **Issue 1: Users Dropdown is Empty**

**Symptom**: 
- Dropdown shows no options
- Or console shows: `[Tasks] No users available. Admin cannot assign tasks.`

**Root Cause**: Either `/users` API failed OR admin doesn't have permission.

**Check in Console (F12)**:
```
[Tasks] Failed to load users: 401 Unauthorized
```
or
```
[Tasks] Failed to load users: 403 Forbidden
```

**Solution**:
1. **Check if user is actually admin**:
   - Login → Open DevTools (F12) → **Console**
   - Paste: `console.log('Current user roles:', JSON.parse(localStorage.getItem('user'))?.roles)`
   - Expected output: `['ROLE_ADMIN']` or `['ROLE_SUPERADMIN']`
   - ❌ If you see `['ROLE_USER']`, you're not an admin!

2. **Check backend is returning users**:
   - Open new browser tab
   - Go to: `http://localhost:8081/api/users`
   - ❌ If "404 Not Found" or error, backend `/users` endpoint may not exist

3. **Check JWT token is being sent**:
   - Console should show: `[Axios] Authorization header set: Bearer eyJhbG...`
   - ❌ If you see `[Axios] No JWT found in localStorage`, you're not logged in!

---

### **Issue 2: Task Created but Assigned to Wrong User**

**Symptom**:
- Console shows task created with correct `assigneeId`
- But selected user doesn't see the task

**Check in Console**:
```
[Tasks] Task created successfully: {
  assignee: {id: 1, fullName: 'Admin'},  ← WRONG! Should be ID 2
  ...
}
```

**Solution**:
1. **Verify dropdown value**:
   - Open DevTools → **Console**
   - Paste: `console.log('Current selectedUser:', selectedUser)`
   - ✓ Should show a **number** like `2`
   - ❌ If shows `''` (empty) or `'2'` (string), dropdown logic is broken

2. **Verify form submits correct data**:
   - Create a task
   - In Console, look for: `[Tasks] Creating task (admin) with payload:`
   - Check `assigneeId` is a **number**, not string
   - ❌ If you see `assigneeId: "2"` (with quotes), type conversion is wrong

3. **Check backend received correct value**:
   - Open backend terminal (where `spring-boot:run` is running)
   - Look for: `[TaskController] create() - incoming DTO: assigneeId=2`
   - ✓ If you see correct ID, backend received it
   - ❌ If you see `assigneeId=null`, payload wasn't sent correctly

---

### **Issue 3: Task Appears for Admin but NOT for Selected User**

**Symptom**:
- Admin sees task in their list
- But when you login as selected user, task is NOT visible

**Root Cause**: Backend `/tasks` endpoint filters tasks incorrectly for non-admins.

**Check in Console** (as selected user):
```
[Tasks] Tasks loaded. Count: 0
```

**Expected**: Should show the task you created.

**Solution**:
1. **Verify user is logged in correctly**:
   - Paste in Console: `console.log(localStorage.getItem('jwt')?.substring(0, 20))`
   - ✓ Should show JWT token start like `eyJhbGciOiJIUzI1NiIsI`
   - ❌ If undefined/null, you're not actually logged in

2. **Check backend task retrieval**:
   - Go to browser Console
   - Paste:
     ```javascript
     fetch('/api/tasks', {
       headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt')}` }
     }).then(r => r.json()).then(d => console.log('Tasks for user:', d))
     ```
   - ✓ Should show the task with correct `assignee` info
   - ❌ If empty array, either task wasn't created or backend filtering is wrong

3. **Check database directly** (advanced):
   - Connect to PostgreSQL:
   ```sql
   SELECT id, title, creator_id, assignee_id FROM tasks ORDER BY id DESC LIMIT 5;
   ```
   - ✓ Look for your task with correct `creator_id` (admin) and `assignee_id` (user)

---

### **Issue 4: "Please select a user to assign the task to" Error**

**Symptom**:
- Click "Add" button
- Alert pops up: "Please select a user to assign the task to."

**Root Cause**: Dropdown value is empty or not set.

**Solution**:
1. **Check dropdown has options**:
   - Right-click dropdown → Inspect
   - Look for `<option>` tags
   - ✓ Should see multiple options
   - ❌ If only one `<option>` or none, users list is empty

2. **Check dropdown value**:
   - In DevTools Console:
   ```javascript
   document.querySelector('select')?.value
   ```
   - ✓ Should show a number like `1` or `2`
   - ❌ If shows `''` (empty string), value wasn't set

3. **Force refresh dropdown**:
   - Reload page (F5)
   - Wait for console log: `[Tasks] Users set. Default selected user ID: X`
   - Try creating task again

---

### **Issue 5: Backend Logs Show Wrong `assigneeId`**

**Symptom**:
- Backend terminal shows: `[TaskController] create() - incoming DTO: assigneeId=null`
- But frontend console shows `assigneeId: 2`

**Root Cause**: JSON payload wasn't sent correctly OR backend didn't parse it.

**Solution**:

1. **Check frontend sends correct JSON**:
   - Open DevTools → **Network** tab
   - Create a task
   - Find `POST` request to `/api/tasks`
   - Click on it → **Request** tab
   - Look for `Request Body`:
   ```json
   {
     "title": "Test",
     "assigneeId": 2
   }
   ```
   - ✓ `assigneeId` should be a **number**, not `"2"`

2. **Check backend receives it**:
   - Look at backend terminal for the log line
   - If not there, add more logging in TaskController

3. **Verify Task model has field**:
   - Backend: Check `Task.java` has `private User assignee;` field
   - Check `TaskDto.java` has `private Long assigneeId;` field

---

## **Advanced Debugging: Enable SQL Logging**

To see exactly what's saved to database, add to `application.properties`:

```properties
# Enable SQL logging
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
logging.level.org.hibernate.SQL=DEBUG
```

Then restart backend and create a task. You'll see SQL in terminal:
```sql
INSERT INTO tasks (title, creator_id, assignee_id, status, ...) 
VALUES ('Test', 1, 2, 'TODO', ...)
```

✓ **What's good**: `creator_id=1` (admin), `assignee_id=2` (user)
❌ **What's wrong**: `creator_id=1`, `assignee_id=NULL`

---

## **Test Checklist**

- [ ] Backend running on `http://localhost:8081`
- [ ] Frontend running on `http://localhost:5173` or `5174`
- [ ] DevTools (F12) Console open
- [ ] Logged in as admin (`admin1@gmail.com` / `Admin21`)
- [ ] Users dropdown shows multiple users
- [ ] Selected user appears in dropdown (not empty)
- [ ] Created task appears in admin's list
- [ ] Logout and login as selected user
- [ ] Task appears in selected user's list
- [ ] Console shows no errors (red lines in console)
- [ ] All logs follow expected format from **Detailed Logging** section

---

## **Common Error Messages & Fixes**

| Error | Cause | Fix |
|-------|-------|-----|
| `401 Unauthorized` | JWT invalid or expired | Logout, login again |
| `403 Forbidden` | User not admin | Use `admin1@gmail.com` account |
| `404 Not Found` | Endpoint doesn't exist | Check backend URL and endpoint |
| `500 Internal Server Error` | Backend error | Check backend terminal for stack trace |
| `Dropdown empty` | No users loaded | Check console for load users error |
| `Task not visible` | Database mismatch | Verify `assignee_id` in database |

---

## **Still Not Working?**

1. **Take a screenshot** of:
   - Browser Console (F12)
   - Backend terminal logs
   - Database query result (if possible)

2. **Share these details**:
   - Frontend error message (from console)
   - Backend error message (from terminal)
   - Steps you took to reproduce
   - Expected vs actual result

3. **Check file contents**:
   - `src/pages/Tasks.jsx` line 46 should have:
   ```javascript
   assigneeId: parseInt(selectedUser)
   ```
   - NOT `userId: selectedUser`

---

## **Success Indicators** ✅

When everything is working:

1. **Frontend Console** shows:
   ```
   [Tasks] Users list loaded. Count: 2
   [Tasks] Creating task (admin) with payload: {title: 'X', assigneeId: 2}
   [Tasks] Task created successfully: {... assignee: {id: 2, ...}}
   ```

2. **Admin sees** task in their list

3. **Selected user** logs in and sees the task

4. **Browser Network tab** shows `POST /tasks` with `assigneeId` (number)

5. **No errors** in browser console (no red X icons)

6. **Database** shows correct `creator_id` and `assignee_id` for task

---

## **Need Help?**

Provide console logs showing:
- Admin user roles verification
- Users list loading (success or error)
- Task creation payload
- Task response from backend
- Backend terminal logs when task is created

