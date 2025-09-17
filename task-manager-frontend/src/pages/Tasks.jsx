import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const res = await api.get('/tasks');
    setTasks(res.data);
  };

  const addTask = async (e) => {
    e.preventDefault();
    await api.post('/tasks', { title });
    setTitle('');
    loadTasks();
  };

  return (
    <div>
      <h2>Tasks</h2>
      <form onSubmit={addTask}>
        <input
          type="text"
          placeholder="New Task"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <button type="submit">Add</button>
      </form>
      <ul>
        {tasks.map((t) => (
          <li key={t.id}>{t.title} - {t.status}</li>
        ))}
      </ul>
    </div>
  );
}

export default Tasks;
