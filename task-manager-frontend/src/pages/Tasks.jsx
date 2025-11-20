import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

function Tasks({ user }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

  // ✅ Define canAdmin BEFORE useEffect
  const canAdmin = user && user.roles && (user.roles.includes('ROLE_ADMIN') || user.roles.includes('ROLE_SUPERADMIN'));

  useEffect(() => {
    loadTasks();
    if (canAdmin) {
      loadUsers();
    }
    // eslint-disable-next-line
  }, []);

  const loadTasks = async () => {
    try {
      console.log('[Tasks] Loading tasks...');
      // ✅ Use single endpoint - backend already filters by user/admin
      const res = await api.get('/tasks');
      console.log('[Tasks] Tasks loaded. Count:', res.data?.length || 0, 'Tasks:', res.data);
      setTasks(res.data);
    } catch (error) {
      console.error('[Tasks] Failed to load tasks:', error.response?.data || error.message);
      setTasks([]);
    }
  };

  const loadUsers = async () => {
    try {
      console.log('[Tasks] Loading users list (admin dropdown)...');
      const res = await api.get('/users');
      console.log('[Tasks] Users list loaded. Count:', res.data?.length || 0, 'Users:', res.data);
      if (res.data && res.data.length > 0) {
        setUsers(res.data);
        // Set first user as default
        const firstUserId = res.data[0].id;
        setSelectedUser(firstUserId);
        console.log('[Tasks] Users set. Default selected user ID:', firstUserId);
      } else {
        console.warn('[Tasks] No users available. Admin cannot assign tasks.');
        setUsers([]);
        setSelectedUser('');
      }
    } catch (error) {
      console.error('[Tasks] Failed to load users:', error.response?.data || error.message);
      console.error('[Tasks] Full error:', error);
      alert('Failed to load users list: ' + (error.response?.data?.message || error.message));
      setUsers([]);
      setSelectedUser('');
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    try {
      if (canAdmin) {
        if (!selectedUser) {
          console.warn('[Tasks] Admin: no user selected. Cannot create task without assignee.');
          alert('Please select a user to assign the task to.');
          return;
        }
        // ✅ FIXED: Send assigneeId (not userId) to match backend DTO
        const assigneeId = parseInt(selectedUser);
        if (isNaN(assigneeId)) {
          console.error('[Tasks] Invalid assigneeId:', selectedUser);
          alert('Invalid user selection. Please try again.');
          return;
        }
        const payload = { title, assigneeId };
        console.log('[Tasks] Creating task (admin) with payload:', payload, 'for user ID:', assigneeId);
        const res = await api.post('/tasks', payload);
        console.log('[Tasks] Task created successfully:', res.data);
        alert(`Task "${title}" assigned to user (ID: ${assigneeId})`);
        setTitle('');
        loadTasks();
      } else {
        // Regular user creates task for themselves
        const payload = { title };
        console.log('[Tasks] Creating task (regular user) with payload:', payload);
        const res = await api.post('/tasks', payload);
        console.log('[Tasks] Task created successfully:', res.data);
        alert(`Task "${title}" created`);
        setTitle('');
        loadTasks();
      }
    } catch (error) {
      console.error('[Tasks] Failed to add task:', error.response?.data || error.message);
      alert('Failed to create task: ' + (error.response?.data?.message || error.message));
    }
  };

  const deleteTask = async (id) => {
    try {
      console.log('[Tasks] Deleting task ID:', id);
      await api.delete(`/tasks/${id}`);
      console.log('[Tasks] Task deleted successfully');
      loadTasks();
    } catch (error) {
      console.error('[Tasks] Failed to delete task:', error.response?.data || error.message);
      alert('Failed to delete task: ' + (error.response?.data?.message || error.message));
    }
  };

  // Helper: can the user update status?
  const canUpdateStatus = (t) => {
    if (!user || !user.roles) return false; 
    if (user.roles.includes('ROLE_ADMIN') || user.roles.includes('ROLE_SUPERADMIN')) return false;
    // User can update if they are assignee or creator
    return (t.assignee && t.assignee.id === user.id) || (t.creator && t.creator.id === user.id);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      console.log('[Tasks] Updating task ID:', taskId, 'to status:', newStatus);
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      console.log('[Tasks] Task status updated successfully');
      loadTasks();
    } catch (error) {
      console.error('[Tasks] Failed to update task status:', error.response?.data || error.message);
      alert('Failed to update status: ' + (error.response?.data?.message || error.message));
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
