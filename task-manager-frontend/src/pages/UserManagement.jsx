import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

function UserManagement({ user }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'ROLE_USER' });
  const [message, setMessage] = useState('');

  const isSuperAdmin = user && user.roles && user.roles.includes('ROLE_SUPER_ADMIN');

  useEffect(() => {
    if (isSuperAdmin) loadUsers();
  }, [isSuperAdmin]);

  const loadUsers = async () => {
    const res = await api.get('/users');
    setUsers(res.data);
  };

  const handleDelete = async (id) => {
    await api.delete(`/users/${id}`);
    setMessage('User deleted');
    loadUsers();
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users?role=' + form.role, form);
      setMessage('User added');
      setForm({ fullName: '', email: '', password: '', role: 'ROLE_USER' });
      loadUsers();
    } catch (err) {
      setMessage('Error: ' + (err.response?.data || 'Could not add user'));
    }
  };

  if (!isSuperAdmin) return null;

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, background: '#f8fbff', borderRadius: 12, boxShadow: '0 2px 12px #b0e0ff55' }}>
      <h2>User Management</h2>
      <form onSubmit={handleAdd} style={{ marginBottom: 24 }}>
        <input type="text" placeholder="Full Name" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required style={{ width: '100%', marginBottom: 8, padding: 8 }} />
        <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={{ width: '100%', marginBottom: 8, padding: 8 }} />
        <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required style={{ width: '100%', marginBottom: 8, padding: 8 }} />
        <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={{ width: '100%', marginBottom: 8, padding: 8 }}>
          <option value="ROLE_USER">User</option>
          <option value="ROLE_ADMIN">Admin</option>
          <option value="ROLE_SUPER_ADMIN">Super Admin</option>
        </select>
        <button type="submit" style={{ width: '100%', padding: 10, background: '#007bff', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 'bold' }}>Add User</button>
      </form>
      {message && <div style={{ color: message.startsWith('Error') ? 'red' : 'green', marginBottom: 12 }}>{message}</div>}
      <ul>
        {users.map(u => (
          <li key={u.id} style={{ marginBottom: 8 }}>
            {u.fullName} ({u.email}) - {u.roles.map(r => r.name).join(', ')}
            <button onClick={() => handleDelete(u.id)} style={{ marginLeft: 12, color: '#fff', background: '#dc3545', border: 'none', borderRadius: 4, padding: '2px 10px', cursor: 'pointer' }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserManagement;
