import React, { useState } from 'react';
import api from '../api/client';
import { useAuth } from '../state/AuthContext';

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    contactNo: user?.contactNo || '',
    place: user?.place || '',
    address: user?.address || '',
    state: user?.state || '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const updateData = { ...form };
      if (!updateData.password) {
        delete updateData.password;
      }
      const { data } = await api.put('/auth/profile', updateData);
      updateProfile(data.user);
      setSuccess('Profile updated successfully');
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.errors && errorData.errors.length > 0) {
        setError(errorData.errors[0].msg);
      } else {
        setError(errorData?.message || 'Unable to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>User Profile</h1>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
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
          <input
            placeholder="New Password (leave blank to keep current)"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {error && <p style={{ color: '#ef4444' }}>{error}</p>}
          {success && <p style={{ color: '#10b981' }}>{success}</p>}
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Updating…' : 'Update Profile'}
          </button>
          <button
            className="btn btn-danger"
            type="button"
            style={{ marginLeft: 12 }}
            onClick={() => {
              logout();
              window.location.href = '/';
            }}
          >
            Logout
          </button>
        </form>
      </div>
    </div>
  );
}