# Technical Documentation - Task Manager System

## System Overview

A full-stack role-based task management system with JWT authentication.

### Technology Stack
- **Frontend**: React 19 + Vite 7 + Axios
- **Backend**: Spring Boot 3.2.6 + Spring Security + JWT
- **Database**: PostgreSQL 14+
- **Build**: Maven (backend), npm (frontend)
- **Runtime**: Java 17+, Node.js 16+

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (Client)                         │
│                   http://localhost:5173                     │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  React App (SPA)                                    │  │
│  │  ├─ App.jsx (Router)                                │  │
│  │  ├─ Login.jsx                                       │  │
│  │  ├─ Register.jsx                                    │  │
│  │  ├─ Tasks.jsx                                       │  │
│  │  ├─ UserManagement.jsx                              │  │
│  │  ├─ AllUsersTasks.jsx                               │  │
│  │  └─ api/axiosConfig.js (HTTP Client)                │  │
│  └─────────────────────────────────────────────────────┘  │
└──────────────────────────┬─────────────────────────────────┘
                           │
                    HTTP/CORS Request
                   JWT in Authorization Header
                           │
                           ↓
┌──────────────────────────────────────────────────────────────┐
│              Spring Boot Backend API                         │
│            http://localhost:8081/api                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  SecurityConfig                                       │ │
│  │  ├─ CORS Filter (allows localhost:5173)              │ │
│  │  ├─ JWT Filter (AuthTokenFilter)                      │ │
│  │  └─ @PreAuthorize annotations                         │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Controllers                                          │ │
│  │  ├─ AuthController (/api/auth/*)                      │ │
│  │  ├─ TaskController (/api/tasks/*)                     │ │
│  │  └─ UserController (/api/users/*)                     │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Services                                             │ │
│  │  ├─ AuthService (login, register, JWT generation)    │ │
│  │  ├─ TaskService (CRUD operations)                    │ │
│  │  ├─ UserService (user management)                    │ │
│  │  └─ UserDetailsServiceImpl (Spring Security)          │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Repositories (JPA)                                   │ │
│  │  ├─ UserRepository                                    │ │
│  │  ├─ TaskRepository                                    │ │
│  │  └─ RoleRepository                                    │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────┬───────────────────────────────────┘
                           │
                      SQL Queries
                           │
                           ↓
        ┌──────────────────────────────────┐
        │   PostgreSQL Database            │
        │   localhost:5432/taskdb          │
        │  ┌────────────────────────────┐  │
        │  │ Tables:                    │  │
        │  │ ├─ users                   │  │
        │  │ ├─ roles                   │  │
        │  │ ├─ user_roles (M2M)        │  │
        │  │ ├─ tasks                   │  │
        │  │ └─ Indexes & Constraints   │  │
        │  └────────────────────────────┘  │
        └──────────────────────────────────┘
```

---

## JWT Authentication Flow

```
1. USER LOGS IN
   ├─ Browser → POST /api/auth/login
   ├─ Frontend sends: { email, password }
   │
2. BACKEND VALIDATES
   ├─ AuthService checks credentials
   ├─ UserDetailsServiceImpl loads user
   ├─ Password match → generate JWT
   │
3. RESPONSE
   ├─ Backend returns: { token, id, email, fullName, roles }
   ├─ Frontend stores token in localStorage["jwt"]
   │
4. SUBSEQUENT REQUESTS
   ├─ Axios interceptor adds header:
   │  Authorization: Bearer <JWT_TOKEN>
   │
5. BACKEND VALIDATES JWT
   ├─ AuthTokenFilter extracts token from header
   ├─ JwtUtils validates signature
   ├─ UserDetailsServiceImpl loads user
   ├─ Security context set with user details
   │
6. REQUEST AUTHORIZED
   ├─ Controller method checks @PreAuthorize
   ├─ Access granted/denied based on roles
```

---

## Database Schema

```sql
-- Users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Roles table
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255)
);

-- User-Role junction table (M2M)
CREATE TABLE user_roles (
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Tasks table
CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    priority VARCHAR(50) DEFAULT 'MEDIUM',
    assignee_id BIGINT REFERENCES users(id),
    creator_id BIGINT REFERENCES users(id),
    due_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_task_assignee ON tasks(assignee_id);
CREATE INDEX idx_task_creator ON tasks(creator_id);
```

---

## API Response Examples

### Login Request
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response (200):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "id": 1,
  "email": "user@example.com",
  "fullName": "John Doe",
  "roles": ["ROLE_USER"]
}
```

### Get User's Tasks
```
GET /api/users/1/tasks
Authorization: Bearer <JWT_TOKEN>

Response (200):
[
  {
    "id": 101,
    "title": "Complete project",
    "status": "PENDING",
    "priority": "HIGH",
    "assignee": { "id": 1, "fullName": "John Doe" },
    "creator": { "id": 2, "fullName": "Admin User" },
    "dueDate": "2025-12-31"
  }
]
```

### Get All Users with Tasks (Admin/SuperAdmin)
```
GET /api/users/with-tasks
Authorization: Bearer <JWT_TOKEN>

Response (200):
[
  {
    "id": 1,
    "fullName": "John Doe",
    "email": "user@example.com",
    "roles": [ { "id": 1, "name": "ROLE_USER" } ],
    "assignedTasks": [ ... ],
    "createdTasks": [ ... ]
  }
]
```

---

## Role-Based Access Control (RBAC)

### Annotation Usage in Controllers
```java
@PreAuthorize("permitAll")                    // Public endpoint
public ResponseEntity<?> login() { ... }

@PreAuthorize("hasRole('USER')")              // Only users
public ResponseEntity<?> myTasks() { ... }

@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")  // Admin or SuperAdmin
public ResponseEntity<?> allTasks() { ... }

@PreAuthorize("hasRole('SUPER_ADMIN')")       // SuperAdmin only
public ResponseEntity<?> manageUsers() { ... }

// Dynamic role check with path variable
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN') or #id == principal.id")
public ResponseEntity<?> getUserTasks(@PathVariable Long id) { ... }
```

### Roles in Database
```
ROLE_USER       → Can create/view own tasks
ROLE_ADMIN      → Can view all users, assign tasks
ROLE_SUPER_ADMIN→ Can manage users (add/delete/update)
```

---

## Configuration Files

### application.properties (Backend)
```properties
server.port=8081
spring.datasource.url=jdbc:postgresql://localhost:5432/taskdb
spring.datasource.username=postgres
spring.datasource.password=@shwin21
spring.jpa.hibernate.ddl-auto=update
app.jwtSecret=ReplaceThisWithAStrongRandomStringChangeMe123!
app.jwtExpirationMs=3600000  # 1 hour
```

### axiosConfig.js (Frontend)
```javascript
const api = axios.create({
  baseURL: "http://localhost:8081/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("jwt");
      window.location.reload();
    }
    return Promise.reject(error);
  }
);
```

---

## Security Features

1. **JWT Authentication**
   - Tokens signed with HS256 algorithm
   - Expires in 1 hour
   - Verified on every request

2. **Password Security**
   - BCrypt encryption
   - Minimum complexity required
   - Never stored in plain text

3. **CORS Configuration**
   - Allows only localhost:5173 (frontend dev server)
   - Credentials enabled for cookies/JWT
   - Specific headers allowed

4. **Method-Level Security**
   - @PreAuthorize annotations on controllers
   - Role-based access control
   - Principal-based dynamic authorization

5. **SQL Injection Prevention**
   - JPA PreparedStatements
   - No concatenated SQL queries

6. **HTTPS Recommendation**
   - Use HTTPS in production
   - Set secure cookie flags
   - Use strong JWT secret (min 32 chars)

---

## Error Handling

### Common HTTP Status Codes
- `200 OK` - Success
- `201 Created` - Resource created
- `204 No Content` - Success with no response body
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Invalid/missing JWT
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource doesn't exist
- `500 Internal Server Error` - Backend error

### Frontend Error Handling
```javascript
// Axios automatically catches and logs errors
api.get('/tasks').catch(error => {
  if (error.response?.status === 401) {
    // Auto-logout handled by interceptor
  } else if (error.response?.status === 403) {
    // Show "Access Denied"
  } else {
    // Show generic error
  }
});
```

---

## Performance Optimizations

1. **Database Indexes**
   - User email indexed (fast login)
   - Task assignee/creator indexed

2. **JWT Caching**
   - Validated once per request
   - No repeated DB queries for same user

3. **Lazy Loading**
   - Roles loaded on demand
   - Tasks fetched per user

4. **Frontend Optimizations**
   - Component memoization
   - Efficient re-renders
   - localStorage for JWT (no re-auth)

---

## Deployment Checklist

- [ ] Change JWT secret to secure random string
- [ ] Update database credentials
- [ ] Enable HTTPS
- [ ] Set CORS to production domain
- [ ] Configure environment variables
- [ ] Build frontend: `npm run build`
- [ ] Package backend: `mvnw clean package`
- [ ] Use production database
- [ ] Enable logging levels: INFO/WARN
- [ ] Setup CI/CD pipeline
- [ ] Monitor application logs
- [ ] Setup database backups

---

## Troubleshooting Guide

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Expired JWT | Clear localStorage, re-login |
| 403 Forbidden | Insufficient role | Check user role in database |
| Cannot connect to DB | DB not running | Start PostgreSQL service |
| CORS error | Wrong origin | Add frontend URL to CORS config |
| Password login fails | DB not seeded | Check if users exist in database |
| JWT invalid | Secret mismatch | Verify `app.jwtSecret` value |

