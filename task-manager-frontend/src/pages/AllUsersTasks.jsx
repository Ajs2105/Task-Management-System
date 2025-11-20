import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

function AllUsersTasks({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = user && user.roles && (user.roles.includes('ROLE_ADMIN') || user.roles.includes('ROLE_SUPER_ADMIN'));

  useEffect(() => {
    if (isAdmin) {
      api.get('/users/with-tasks').then(res => {
        setUsers(res.data);
        setLoading(false);
      });
    }
  }, [isAdmin]);

  if (!isAdmin) return null;
  if (loading) return <div>Loading users and tasks...</div>;

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 24, background: '#f8fbff', borderRadius: 12, boxShadow: '0 2px 12px #b0e0ff55' }}>
      <h2>All Users & Their Tasks</h2>
      {users.map(u => (
        <div key={u.id} style={{ marginBottom: 32, padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #e0e0e0' }}>
          <div style={{ fontWeight: 'bold', fontSize: 18 }}>{u.fullName} ({u.email})</div>
          <div style={{ fontSize: 15, color: '#555', marginBottom: 8 }}>Roles: {u.roles.map(r => r.name).join(', ')}</div>
          <div style={{ display: 'flex', gap: 32 }}>
            <div>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>Assigned Tasks:</div>
              <ul>
                {u.assignedTasks.length === 0 && <li style={{ color: '#aaa' }}>None</li>}
                {u.assignedTasks.map(t => (
                  <li key={t.id}>{t.title} - {t.status}</li>
                ))}
              </ul>
            </div>
            <div>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>Created Tasks:</div>
              <ul>
                {u.createdTasks.length === 0 && <li style={{ color: '#aaa' }}>None</li>}
                {u.createdTasks.map(t => (
                  <li key={t.id}>{t.title} - {t.status}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AllUsersTasks;
