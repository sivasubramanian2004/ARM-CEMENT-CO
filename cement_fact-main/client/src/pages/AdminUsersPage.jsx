import React, { useEffect, useState } from 'react';
import api, { fetchUsers, deleteUser } from '../api/client';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const getUsers = async () => {
      setLoading(true);
      setMessage('');
      try {
        const data = await fetchUsers();
        setUsers(data);
        setCurrentPage(1);
      } catch (err) {
        setMessage('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    getUsers();
  }, []);

  const handleDelete = async (id) => {
    await deleteUser(id);
    setUsers(users.filter((user) => user._id !== id));
  };

  const exportUsersCSV = async () => {
    setMessage('');
    try {
      const { data } = await api.get('/auth/users');
      const rows = [];
      rows.push(['User #', 'Name', 'Email', 'Contact', 'Account Created']);
      data.forEach((u, idx) => {
        rows.push([
          `#${u._id.slice(-6)}`,
          u.name || '',
          u.email || '',
          u.contactNo || 'N/A',
          new Date(u.createdAt).toLocaleString()
        ]);
      });

      const csv = rows.map((r) => r.map((c) => {
        if (c === null || c === undefined) return '';
        const s = String(c).replace(/"/g, '""');
        return `"${s}"`;
      }).join(',')).join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      a.href = url;
      a.download = `users-${ts}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setMessage('Failed to download data');
    }
  };

  return (
    <div className="admin-users">
      <div className="heading" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1>Manage Users</h1>
          <p>All users.</p>
        </div>
        <button className="btn btn-danger" onClick={exportUsersCSV} disabled={loading}>Get Data</button>
      </div>

      {message && <div className="card">{message}</div>}

      {loading ? (
        <div className="card">Loading…</div>
      ) : users.length === 0 ? (
        <div className="card">No users yet.</div>
      ) : (
        <div className="card">
          <table className="styled-table">
            <thead>
              <tr>
                <th>User #</th>
                <th>Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Account Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const start = (currentPage - 1) * itemsPerPage;
                const paginated = users.slice(start, start + itemsPerPage);
                return paginated.map((user, idx) => (
                  <tr key={user._id}>
                    <td>#{start + idx + 1}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.contactNo || 'N/A'}</td>
                    <td>{new Date(user.createdAt).toLocaleString()}</td>
                    <td>
                      <button className="delete-btn" onClick={() => handleDelete(user._id)}>Remove</button>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>

          {Math.ceil(users.length / itemsPerPage) > 1 && (
            <div className="pagination">
              {Array.from({ length: Math.ceil(users.length / itemsPerPage) }).map((_, idx) => (
                <button
                  key={idx}
                  className={`page-btn ${currentPage === idx + 1 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(idx + 1)}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;