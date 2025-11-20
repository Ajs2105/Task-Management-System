# Task Manager Setup Instructions

## Prerequisites
- **Java 17+** installed
- **Node.js 16+** and npm installed
- **PostgreSQL** running on `localhost:5432`
- Database created: `taskdb`
- Database user: `postgres` with password `@shwin21`

## Step 1: Setup PostgreSQL Database

```sql
CREATE DATABASE taskdb;
-- User 'postgres' with password '@shwin21' should already exist
```

The Spring Boot app will auto-create tables using Hibernate when you first run it.

---

## Step 2: Run the Backend (Spring Boot)

### Navigate to backend directory:
```bash
cd "task-manager-backend"
```

### Build and start the backend:
```bash
# On Windows with Maven wrapper:
mvnw.cmd spring-boot:run

# Or if Maven is installed:
mvn spring-boot:run
```

The backend will start on **http://localhost:8081**

You should see:
- `Tomcat started on port 8081`
- Database connection logs
- Security filter chain initialized

### Seed default users (optional):
Check `src/main/java/com/taskmanager/TaskManagerBackendApplication.java` for default user seeding on startup.

---

## Step 3: Run the Frontend (React + Vite)

### In a new terminal, navigate to frontend directory:
```bash
cd "task-manager-frontend"
```

### Install dependencies:
```bash
npm install
```

### Start the dev server:
```bash
npm run dev
```

The frontend will start on **http://localhost:5173**

---

## Step 4: Test the Application

### 1. Open browser to: http://localhost:5173

### 2. Default Test Users (if seeded):
- **User**: `user@example.com` / `password`
- **Admin**: `admin@example.com` / `password`
- **Super Admin**: `superadmin@example.com` / `password`

### 3. Login Steps:
1. Select role (User, Admin, Super Admin)
2. Enter email and password
3. Click "Login"
4. JWT token will be stored in localStorage
5. Redirect to Tasks page

### 4. Features:
- **Users**: Can see their own tasks, mark as done/pending
- **Admins**: Can see all users and their tasks, assign tasks
- **Super Admins**: Can manage users (add/delete), view all tasks

---

## Troubleshooting

### 401 Unauthorized Errors
**Solution**: 
1. Clear localStorage: Open DevTools → Application → LocalStorage → Clear
2. Log out and log in again
3. Check backend logs for JWT validation errors

### Cannot connect to backend
**Solution**:
1. Ensure backend is running on port 8081: `http://localhost:8081`
2. Check CORS is enabled in `SecurityConfig.java` (allows localhost:5173)
3. Check firewall isn't blocking port 8081

### Database connection fails
**Solution**:
1. Ensure PostgreSQL is running
2. Verify database `taskdb` exists
3. Check credentials in `application.properties`:
   - URL: `jdbc:postgresql://localhost:5432/taskdb`
   - Username: `postgres`
   - Password: `@shwin21`

### Frontend shows "No JWT found in localStorage"
**Solution**:
1. Log out first
2. Log in again with correct credentials
3. Check browser console for errors

### Cannot register
**Solution**:
1. Only Users can register via frontend
2. Admins and Super Admins can only log in (created by Super Admin)
3. Register is only available to Users in the role selection

---

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user (users only)
- `POST /api/auth/forgot-password` - Reset password
- `GET /api/auth/me` - Get current user info

### Tasks
- `GET /api/tasks` - List all tasks (admin/super admin)
- `GET /api/users/{id}/tasks` - Get user's tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

### Users
- `GET /api/users` - List all users (admin/super admin)
- `GET /api/users/with-tasks` - All users with their tasks (admin/super admin)
- `POST /api/users` - Create user (super admin)
- `DELETE /api/users/{id}` - Delete user (super admin)

---

## Key Files Modified for Bug Fixes

✅ **Frontend**:
- `src/api/axiosConfig.js` - Fixed JWT header (`Authorization` instead of `editAuthorization`), added `/api` to baseURL
- `src/pages/Login.jsx` - Fixed API paths (removed duplicate `/api`)
- `src/pages/Register.jsx` - Fixed API paths (removed duplicate `/api`)
- Added global 401 error handler for automatic logout

✅ **Backend**:
- `src/main/java/com/taskmanager/security/AuthTokenFilter.java` - Added JWT debug logging
- `src/main/java/com/taskmanager/controller/AuthController.java` - Added `/api/auth/me` endpoint
- `src/main/java/com/taskmanager/dto/UserWithTasksDto.java` - Added DTO for clean API responses

---

## Build for Production

### Frontend:
```bash
cd task-manager-frontend
npm run build
# Output in: dist/
```

### Backend:
```bash
cd task-manager-backend
mvnw.cmd clean package
# JAR file in: target/task-manager-0.0.1-SNAPSHOT.jar
```

---

## Notes
- JWT expires in 1 hour (3600000 ms)
- All passwords are bcrypt encrypted
- CORS allows `localhost:3000` and `localhost:5173`
- WebSocket enabled for real-time updates
- Roles: `ROLE_USER`, `ROLE_ADMIN`, `ROLE_SUPER_ADMIN`

