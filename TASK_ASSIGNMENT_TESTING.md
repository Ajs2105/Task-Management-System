# ✅ Task Assignment - Complete Testing Guide

## What Was Fixed

**Task Assignment Bug**
- ❌ Before: Tasks assigned to admin instead of selected user
- ✅ After: Tasks correctly assigned to selected user

---

## Quick Fix Summary

**File:** `src/pages/Tasks.jsx` (Line 46)

**Change:** 
```javascript
// BEFORE
{ title, userId: selectedUser }

// AFTER
{ title, assigneeId: parseInt(selectedUser) }
```

---

## Testing Checklist

### Pre-Testing Setup
- [ ] Backend running on port 8081
- [ ] Database running on port 5432
- [ ] Frontend restarted: `npm run dev`
- [ ] Browser cleared: F12 → Application → Clear Storage

### Test 1: Admin Assign Task to Regular User

**Setup:**
- [ ] Log in as admin@example.com
- [ ] Make sure "John Doe" user exists in dropdown

**Execute:**
1. [ ] See dropdown with user list
2. [ ] Select "John Doe" from dropdown
3. [ ] Enter task title: "Test Assignment"
4. [ ] Click "Add" button
5. [ ] Task appears in list

**Verify:**
- [ ] Task shows in admin's view
- [ ] Check console (F12): No errors
- [ ] Check network (F12 → Network):
  - [ ] POST /api/tasks returns 201
  - [ ] Response shows "assignee": { "id": 2, "fullName": "John Doe", ... }

**Final Verification:**
- [ ] Log out
- [ ] Log in as john@example.com
- [ ] Go to Tasks page
- [ ] Task "Test Assignment" appears ✅

### Test 2: Admin Assign Task to Another User

**Execute:**
1. [ ] Still logged in as admin
2. [ ] Select "Jane Smith" from dropdown
3. [ ] Enter task title: "Documentation"
4. [ ] Click "Add"

**Verify:**
- [ ] Log out and log in as jane@example.com
- [ ] "Documentation" task appears in their list ✅

### Test 3: Multiple Task Assignments

**Execute:**
1. [ ] As admin, create 3 tasks:
   - [ ] "Task for John" → assign to John Doe
   - [ ] "Task for Jane" → assign to Jane Smith
   - [ ] "Task for Bob" → assign to Bob Jones

**Verify:**
- [ ] Log in as John Doe → see "Task for John" only
- [ ] Log in as Jane Smith → see "Task for Jane" only
- [ ] Log in as Bob Jones → see "Task for Bob" only
- [ ] Log in as admin → see all 3 tasks

### Test 4: Regular User Creating Tasks (Should Stay Same)

**Execute:**
1. [ ] Log out of admin
2. [ ] Log in as john@example.com (regular user)
3. [ ] See "Show My Tasks" button (no dropdown)
4. [ ] Enter task title: "My Task"
5. [ ] Click "Show My Tasks"

**Verify:**
- [ ] Task "My Task" appears in list
- [ ] Task is assigned to John Doe (creator)
- [ ] Task shows correctly

### Test 5: Database Verification (Optional)

**Connect to database:**
```bash
psql -h localhost -U postgres -d taskdb
```

**Check recent tasks:**
```sql
SELECT id, title, creator_id, assignee_id, 
       (SELECT full_name FROM users WHERE id = creator_id) as creator,
       (SELECT full_name FROM users WHERE id = assignee_id) as assignee
FROM tasks 
ORDER BY id DESC 
LIMIT 5;
```

**Expected output for "Test Assignment":**
```
 id | title            | creator_id | assignee_id | creator | assignee
----+------------------+------------+-------------+---------+----------
  5 | Test Assignment  |     1      |      2      | Jane    | John Doe
  4 | Documentation    |     1      |      3      | Jane    | Jane Smith
  3 | My Task          |     2      |      2      | John    | John Doe
```

### Test 6: Error Handling

**Execute:**
1. [ ] Admin creates task without selecting user
   - Result: Should prevent or error gracefully

2. [ ] Log out while creating task
   - Result: 401 Unauthorized (expected)

3. [ ] Create task with very long title
   - Result: Should still assign correctly

### Test 7: Console & Network Verification

**Console Tab (F12 → Console):**
- [ ] No red errors
- [ ] No warning about userId
- [ ] Only info/log messages

**Network Tab (F12 → Network):**
- [ ] POST /api/tasks
  - [ ] Status: 201 Created
  - [ ] Response body contains:
    - [ ] "assignee": { "id": NUMBER, ... }
    - [ ] "creator": { "id": 1, ... }
    - [ ] "title": "Task Name"

---

## Expected Behavior

### Admin Creating Task Flow

```
Admin opens Tasks page
         ↓
Sees form with:
  - Text input for title
  - Dropdown for user selection
  - Add button
         ↓
Admin selects "John Doe"
  - selectedUser = "2" (string from dropdown)
         ↓
Admin enters "Code Review"
  - title = "Code Review"
         ↓
Admin clicks "Add"
         ↓
Frontend sends:
  {
    title: "Code Review",
    assigneeId: 2  ← ✅ CORRECT (was userId before)
  }
         ↓
Backend receives and:
  1. Sets creator = current admin (id 1)
  2. Sets assignee = 2 (John Doe) ✅
  3. Creates task with TODO status
  4. Returns 201 Created
         ↓
Frontend reloads tasks
         ↓
Task appears in admin's view ✅
Task appears in John Doe's view ✅
```

### Regular User Creating Task Flow

```
Regular user opens Tasks page
         ↓
No dropdown shown (not admin)
         ↓
Sees "Show My Tasks" button
         ↓
User creates task (same as before)
         ↓
Frontend sends:
  {
    title: "Task Name"
    (no assigneeId - regular user)
  }
         ↓
Backend sets:
  - creator = current user
  - assignee = creator (defaults to self)
         ↓
Task assigned correctly ✅
```

---

## Common Issues & Solutions

### Issue 1: Task Still Shows Admin as Assignee

**Cause:** Frontend not restarted

**Solution:**
```powershell
# Stop frontend
Ctrl+C

# Restart
npm run dev

# Hard refresh browser
Ctrl+Shift+R
```

### Issue 2: Type Error in Console

**Symptom:** Error about parseInt or NaN

**Cause:** selectedUser is null or undefined

**Solution:**
1. Check dropdown has users loaded
2. Make sure a user is selected before clicking Add
3. Verify loadUsers() ran successfully

### Issue 3: POST Returns Error

**Symptom:** Network shows POST /api/tasks fails

**Check:**
1. Backend running? (Port 8081)
2. Users exist in database?
3. Admin has ROLE_ADMIN?
4. JWT token valid?

### Issue 4: User Doesn't See Task

**Cause:** Task assigned to wrong user

**Debug:**
```bash
# Check in database
psql -h localhost -U postgres -d taskdb

# Find the task
SELECT * FROM tasks WHERE title = 'Your Task Name';

# Check assignee_id
# Compare with user's id
SELECT id, full_name FROM users;
```

---

## Verification Checklist

| Check | Before | After | Status |
|-------|--------|-------|--------|
| Admin assign to user | Assigned to admin | Assigned to user | ✅ FIXED |
| Regular create task | Self-assigned | Self-assigned | ✅ UNCHANGED |
| Frontend sends field | userId | assigneeId | ✅ FIXED |
| Type conversion | None (string) | parseInt() | ✅ ADDED |
| User sees task | No (wrong assignee) | Yes | ✅ FIXED |
| Browser console | No errors | No errors | ✅ OK |
| Network response | Shows admin | Shows correct user | ✅ FIXED |

---

## Success Criteria (All Must Pass)

✅ Admin can create task for selected user
✅ Task appears in user's task list
✅ Task doesn't appear in other users' lists
✅ Selected user can update task status
✅ Admin can see all tasks
✅ No console errors
✅ No network errors
✅ Database shows correct assignee

---

## Full Test Workflow (30 minutes)

```
1. Setup (5 min)
   └─ Start backend, frontend, database

2. Regular User Test (5 min)
   └─ Create task as regular user

3. Admin Assignment Test (10 min)
   └─ Create tasks for different users
   └─ Verify each user sees their tasks

4. Verify Database (5 min)
   └─ Check database directly

5. Final Verification (5 min)
   └─ Check console & network
   └─ Confirm all tests passed
```

---

## Sign-Off

- [ ] All tests passed
- [ ] No console errors
- [ ] Tasks assign correctly
- [ ] Users see their tasks
- [ ] Database shows correct data
- [ ] Ready for production

---

## Need Help?

Check these documents:
- **TASK_ASSIGNMENT_BUG_FIXED.md** - Detailed bug explanation
- **TASK_ASSIGNMENT_SUMMARY.md** - Quick reference
- **TROUBLESHOOTING.md** - Common issues

