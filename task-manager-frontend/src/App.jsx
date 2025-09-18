import React, { useState } from 'react';
import { Link, BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Tasks from './pages/Tasks';
import UserManagement from './pages/UserManagement';
function Header({ user, onLogout }) {
  const isSuperAdmin = user && user.roles && (user.roles.includes('ROLE_SUPER_ADMIN') || user.roles.includes('SUPER_ADMIN'));
  return (
    <header style={{
      width: '100%',
      background: 'linear-gradient(90deg, #007bff 0%, #00c6ff 100%)',
      color: '#fff',
      padding: '18px 0',
      marginBottom: 32,
      boxShadow: '0 2px 8px #e0e0e0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{ fontWeight: 'bold', fontSize: 28, marginLeft: 32, letterSpacing: 1 }}>
        <span style={{ color: '#fff', textShadow: '1px 1px 4px #007bff' }}>TaskFlow</span>
      </div>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 18, marginRight: 32 }}>
        {!user && <>
          <Link to="/login" style={{ color: '#fff', textDecoration: 'none', fontWeight: 500, fontSize: 18 }}>Login</Link>
          <Link to="/register" style={{ color: '#fff', textDecoration: 'none', fontWeight: 500, fontSize: 18 }}>Register</Link>
        </>}
        {user && <>
          <Link to="/tasks" style={{ color: '#fff', textDecoration: 'none', fontWeight: 500, fontSize: 18 }}>Tasks</Link>
          {isSuperAdmin && (
            <Link to="/users" style={{ color: '#fff', textDecoration: 'none', fontWeight: 500, fontSize: 18 }}>User Management</Link>
          )}
          <span style={{ fontWeight: 500, fontSize: 16, marginLeft: 10 }}>
            Welcome, {user.fullName || user.email}!
          </span>
          <span style={{ fontSize: 15, marginLeft: 8, opacity: 0.85 }}>
            ({user.roles && user.roles.length > 0 ? user.roles.join(', ') : 'User'})
          </span>
          <button onClick={onLogout} style={{ marginLeft: 18, padding: '6px 18px', borderRadius: 6, border: 'none', background: '#fff', color: '#007bff', fontWeight: 600, fontSize: 16, cursor: 'pointer', boxShadow: '0 1px 4px #b0e0ff' }}>Logout</button>
        </>}
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer style={{
      width: '100%',
      background: '#f8f8f8',
      color: '#888',
      textAlign: 'center',
      padding: '18px 0',
      marginTop: 40,
      fontSize: 15,
      borderTop: '1px solid #e0e0e0',
      letterSpacing: 1
    }}>
      &copy; {new Date().getFullYear()} TaskFlow. All rights reserved.
    </footer>
  );
}

function App() {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('jwt');
  };

  return (
    <Router>
      <Header user={user} onLogout={handleLogout} />
      <div style={{ minHeight: '80vh' }}>
        <Routes>
          <Route path="/login" element={<Login onLogin={setUser} />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/tasks"
            element={
              user ? <Tasks user={user} /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/users"
            element={
              user && user.roles && (user.roles.includes('ROLE_SUPER_ADMIN') || user.roles.includes('SUPER_ADMIN'))
                ? <UserManagement user={user} />
                : <Navigate to="/login" />
            }
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
