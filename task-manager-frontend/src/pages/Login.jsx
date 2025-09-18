import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';


// Animation keyframes
const fadeIn = {
  animation: 'fadeIn 1.2s',
};

const keyframes = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-30px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

function Login({ onLogin }) {
  const [selectedRole, setSelectedRole] = useState('USER');

  // Only set selected role, do not autofill credentials
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setEmail('');
    setPassword('');
  };
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPassword, setForgotPassword] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [registerData, setRegisterData] = useState({ fullName: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [registerError, setRegisterError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
  const res = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('jwt', res.data.token);
      onLogin({
        token: res.data.token,
        id: res.data.id,
        email: res.data.email,
        fullName: res.data.fullName,
        roles: res.data.roles
      });
      navigate('/tasks');
    } catch {
      setError('Invalid email or password');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError('Passwords do not match');
      return;
    }
    try {
  await api.post('/api/auth/register', {
        fullName: registerData.fullName,
        email: registerData.email,
        password: registerData.password,
        phone: registerData.phone
      });
      setIsRegister(false);
      setEmail(registerData.email);
      setPassword('');
      setRegisterData({ fullName: '', email: '', password: '', confirmPassword: '', phone: '' });
      navigate('/login');
    } catch {
      setRegisterError('Registration failed. Try a different email.');
    }
  };

  return (
    <>
      <style>{keyframes}</style>
      {/* Role selection buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
        <button
          style={{
            background: selectedRole === 'USER' ? '#007bff' : '#f0f0f0',
            color: selectedRole === 'USER' ? '#fff' : '#333',
            border: 'none',
            borderRadius: '8px 0 0 8px',
            padding: '8px 18px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: 16,
            boxShadow: selectedRole === 'USER' ? '0 2px 8px #b0e0ff' : 'none',
            transition: 'all 0.2s'
          }}
          onClick={() => handleRoleSelect('USER')}
        >
          User
        </button>
        <button
          style={{
            background: selectedRole === 'ADMIN' ? '#007bff' : '#f0f0f0',
            color: selectedRole === 'ADMIN' ? '#fff' : '#333',
            border: 'none',
            borderRadius: 0,
            padding: '8px 18px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: 16,
            boxShadow: selectedRole === 'ADMIN' ? '0 2px 8px #b0e0ff' : 'none',
            transition: 'all 0.2s'
          }}
          onClick={() => handleRoleSelect('ADMIN')}
        >
          Admin
        </button>
        <button
          style={{
            background: selectedRole === 'SUPER_ADMIN' ? '#007bff' : '#f0f0f0',
            color: selectedRole === 'SUPER_ADMIN' ? '#fff' : '#333',
            border: 'none',
            borderRadius: '0 8px 8px 0',
            padding: '8px 18px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: 16,
            boxShadow: selectedRole === 'SUPER_ADMIN' ? '0 2px 8px #b0e0ff' : 'none',
            transition: 'all 0.2s'
          }}
          onClick={() => handleRoleSelect('SUPER_ADMIN')}
        >
          Super Admin
        </button>
      </div>
      <div style={{
        maxWidth: 400,
        margin: '60px auto',
        padding: 32,
        border: 'none',
        borderRadius: 18,
        boxShadow: '0 6px 32px #b0e0ff55',
        background: 'linear-gradient(120deg, #f8fbff 60%, #e3f0ff 100%)',
        ...fadeIn
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <button
            style={{
              background: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '8px 0 0 8px',
              padding: '10px 24px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: 18,
              boxShadow: '0 2px 8px #b0e0ff',
              transition: 'all 0.2s',
              opacity: 1
            }}
            onClick={() => { setIsRegister(false); setShowForgot(false); }}
            disabled
          >
            Login
          </button>
          {selectedRole === 'USER' && (
            <button
              style={{
                background: isRegister ? '#007bff' : '#f0f0f0',
                color: isRegister ? '#fff' : '#333',
                border: 'none',
                borderRadius: '0 8px 8px 0',
                padding: '10px 24px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: 18,
                boxShadow: isRegister ? '0 2px 8px #b0e0ff' : 'none',
                transition: 'all 0.2s'
              }}
              onClick={() => { setIsRegister(true); setShowForgot(false); }}
            >
              Register
            </button>
          )}
        </div>

  {!isRegister && !showForgot ? (
          <>
            <h2 style={{ textAlign: 'center', marginBottom: 24, color: '#007bff', fontWeight: 700, letterSpacing: 1 }}>Login to TaskFlow</h2>
            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', marginBottom: 16, padding: 10, borderRadius: 6, border: '1px solid #b0e0ff', fontSize: 16, background: '#f8fbff' }}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', marginBottom: 16, padding: 10, borderRadius: 6, border: '1px solid #b0e0ff', fontSize: 16, background: '#f8fbff' }}
              />
              <button type="submit" style={{ width: '100%', padding: 12, borderRadius: 6, background: '#007bff', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: 18, boxShadow: '0 2px 8px #b0e0ff', transition: 'all 0.2s' }}>Login</button>
            </form>
            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <button type="button" style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline', fontSize: 15 }} onClick={() => setShowForgot(true)}>
                Forgot Password?
              </button>
            </div>
            {error && <p style={{ color: 'red', marginTop: 14, textAlign: 'center' }}>{error}</p>}
          </>
  ) : showForgot ? (
          <>
            <h2 style={{ textAlign: 'center', marginBottom: 24, color: '#007bff', fontWeight: 700, letterSpacing: 1 }}>Reset Password</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setForgotMsg('');
              try {
                const res = await api.post('/auth/forgot-password', { email: forgotEmail, newPassword: forgotPassword });
                setForgotMsg(res.data || 'Password reset successful!');
                setTimeout(() => { setShowForgot(false); setForgotEmail(''); setForgotPassword(''); }, 1500);
              } catch (err) {
                setForgotMsg('Error resetting password.');
              }
            }}>
              <input
                type="email"
                placeholder="Email"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                required
                style={{ width: '100%', marginBottom: 16, padding: 10, borderRadius: 6, border: '1px solid #b0e0ff', fontSize: 16, background: '#f8fbff' }}
              />
              <input
                type="password"
                placeholder="New Password"
                value={forgotPassword}
                onChange={e => setForgotPassword(e.target.value)}
                required
                style={{ width: '100%', marginBottom: 16, padding: 10, borderRadius: 6, border: '1px solid #b0e0ff', fontSize: 16, background: '#f8fbff' }}
              />
              <button type="submit" style={{ width: '100%', padding: 12, borderRadius: 6, background: '#007bff', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: 18, boxShadow: '0 2px 8px #b0e0ff', transition: 'all 0.2s' }}>Reset Password</button>
            </form>
            {forgotMsg && <p style={{ color: forgotMsg.startsWith('Error') ? 'red' : 'green', marginTop: 14, textAlign: 'center' }}>{forgotMsg}</p>}
            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <button type="button" style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline', fontSize: 15 }} onClick={() => setShowForgot(false)}>
                Back to Login
              </button>
            </div>
          </>
  ) : (selectedRole === 'USER' ? (
          <>
            <h2 style={{ textAlign: 'center', marginBottom: 24, color: '#007bff', fontWeight: 700, letterSpacing: 1 }}>Register for TaskFlow</h2>
            <form onSubmit={handleRegister}>
              <input
                type="text"
                placeholder="Full Name"
                value={registerData.fullName}
                onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                required
                style={{ width: '100%', marginBottom: 16, padding: 10, borderRadius: 6, border: '1px solid #b0e0ff', fontSize: 16, background: '#f8fbff' }}
              />
              <input
                type="email"
                placeholder="Email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                required
                style={{ width: '100%', marginBottom: 16, padding: 10, borderRadius: 6, border: '1px solid #b0e0ff', fontSize: 16, background: '#f8fbff' }}
              />
              <input
                type="password"
                placeholder="Password"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                required
                style={{ width: '100%', marginBottom: 16, padding: 10, borderRadius: 6, border: '1px solid #b0e0ff', fontSize: 16, background: '#f8fbff' }}
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                required
                style={{ width: '100%', marginBottom: 16, padding: 10, borderRadius: 6, border: '1px solid #b0e0ff', fontSize: 16, background: '#f8fbff' }}
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={registerData.phone}
                onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                required
                style={{ width: '100%', marginBottom: 16, padding: 10, borderRadius: 6, border: '1px solid #b0e0ff', fontSize: 16, background: '#f8fbff' }}
              />
              <button type="submit" style={{ width: '100%', padding: 12, borderRadius: 6, background: '#007bff', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: 18, boxShadow: '0 2px 8px #b0e0ff', transition: 'all 0.2s' }}>Register</button>
            </form>
            {registerError && <p style={{ color: 'red', marginTop: 14, textAlign: 'center' }}>{registerError}</p>}
          </>
  ) : null)}
      </div>
    </>
  );
}

export default Login;
