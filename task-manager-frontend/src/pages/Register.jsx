import { useState } from 'react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';


function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setMessage('Error: Passwords do not match.');
      return;
    }
    try {
  await api.post('/api/auth/register', {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone
      });
      setMessage('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1200);
    } catch {
      setMessage('Error registering user.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: 32, borderRadius: 18, boxShadow: '0 6px 32px #b0e0ff55', background: 'linear-gradient(120deg, #f8fbff 60%, #e3f0ff 100%)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24, color: '#007bff', fontWeight: 700, letterSpacing: 1 }}>Register for TaskFlow</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={form.fullName}
          onChange={handleChange}
          required
          style={{ width: '100%', marginBottom: 16, padding: 10, borderRadius: 6, border: '1px solid #b0e0ff', fontSize: 16, background: '#f8fbff' }}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          style={{ width: '100%', marginBottom: 16, padding: 10, borderRadius: 6, border: '1px solid #b0e0ff', fontSize: 16, background: '#f8fbff' }}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          style={{ width: '100%', marginBottom: 16, padding: 10, borderRadius: 6, border: '1px solid #b0e0ff', fontSize: 16, background: '#f8fbff' }}
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
          style={{ width: '100%', marginBottom: 16, padding: 10, borderRadius: 6, border: '1px solid #b0e0ff', fontSize: 16, background: '#f8fbff' }}
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
          required
          style={{ width: '100%', marginBottom: 16, padding: 10, borderRadius: 6, border: '1px solid #b0e0ff', fontSize: 16, background: '#f8fbff' }}
        />
        <button type="submit" style={{ width: '100%', padding: 12, borderRadius: 6, background: '#007bff', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: 18, boxShadow: '0 2px 8px #b0e0ff', transition: 'all 0.2s' }}>Register</button>
      </form>
      {message && <p style={{ marginTop: 16, textAlign: 'center', color: message.startsWith('Error') ? 'red' : 'green' }}>{message}</p>}
    </div>
  );
}

export default Register;
