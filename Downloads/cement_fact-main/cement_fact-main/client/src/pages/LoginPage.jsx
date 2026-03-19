import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../state/AuthContext';

export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', contactNo: '', place: '', address: '', state: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // handle token+user returned from OAuth redirect
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userParam = params.get('user');
    if (token && userParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(userParam));
        login(token, parsed);
        // clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate('/');
      } catch (e) {
        // ignore parse errors
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : form;
      const { data } = await api.post(endpoint, payload);
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    // open backend OAuth start route in a new window/tab
    const base = api.defaults?.baseURL || '';
    // ensure no double slash
    const url = `${base.replace(/\/$/, '')}/auth/google`;
    window.location.href = url;
  };

  return (
    <div className="login-container">
      <div className="login-background"></div>
      <div className="card auth-card">
        <h2>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
        <p>Access your dashboard to manage products and orders.</p>
      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <>
            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              placeholder="Contact Number"
              value={form.contactNo}
              onChange={(e) => setForm({ ...form, contactNo: e.target.value })}
            />
            <input
              placeholder="Place"
              value={form.place}
              onChange={(e) => setForm({ ...form, place: e.target.value })}
            />
            <input
              placeholder="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
            <input
              placeholder="State"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            />
          </>
        )}
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        {error && <p style={{ color: '#ef4444' }}>{error}</p>}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Sign up'}
        </button>
      </form>
      <div style={{ marginTop: 12 }}>
        <button className="btn btn-google" onClick={handleGoogleAuth}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 533.5 544.3" aria-hidden="true"><path fill="#4285F4" d="M533.5 278.4c0-17.6-1.6-35-4.7-51.8H272v98.1h147.1c-6.3 34-25 62.8-53.3 82v68.1h85.9c50.3-46.3 79.8-114.6 79.8-196.4z"/><path fill="#34A853" d="M272 544.3c72.7 0 133.7-24 178.3-65.1l-85.9-68.1c-24 16.1-54.7 25.7-92.4 25.7-71 0-131.2-47.8-152.7-112.1H32.9v70.5C77.1 486.9 168.6 544.3 272 544.3z"/><path fill="#FBBC05" d="M119.3 324.7c-10.2-30.6-10.2-63.6 0-94.2V160H32.9c-39.4 78.9-39.4 172.5 0 251.4l86.4-86.7z"/><path fill="#EA4335" d="M272 107.7c39.5 0 75 13.6 103 40.6l77.1-77.1C405.9 23.2 345 0 272 0 168.6 0 77.1 57.4 32.9 144l86.4 86.7C140.8 155.5 201 107.7 272 107.7z"/></svg>
          <span>Continue with Google</span>
        </button>
      </div>
      <button
        className="btn btn-secondary"
        onClick={() => {
          setMode(mode === 'login' ? 'register' : 'login');
          setError('');
        }}
      >
        {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Login'}
      </button>
      </div>
    </div>
    </div>
  );
}
