import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

function Tasks({ user }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    loadTasks();
    if (canAdmin) {
      loadUsers();
    }
    // eslint-disable-next-line
  }, []);

  const loadTasks = async () => {
    const res = await api.get('/tasks');
    setTasks(res.data);
  };

  const loadUsers = async () => {
    const res = await api.get('/users');
    setUsers(res.data);
    if (res.data.length > 0) setSelectedUser(res.data[0].id);
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (canAdmin && selectedUser) {
      await api.post('/tasks', { title, userId: selectedUser });
    } else {
      await api.post('/tasks', { title });
    }
    setTitle('');
    loadTasks();
  };

  const canAdmin = user && user.roles && (user.roles.includes('ROLE_ADMIN') || user.roles.includes('ROLE_SUPER_ADMIN'));

  const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}`);
    loadTasks();
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
        <form onSubmit={addTask} style={{ marginBottom: 16 }}>
          <input
            type="text"
            placeholder="New Task"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ marginRight: 8 }}
          />
          <button type="submit">Add</button>
        </form>
      )}
      <ul>
        {tasks.map((t) => (
          <li key={t.id} style={{ marginBottom: 8 }}>
            {t.title} - {t.status}
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
