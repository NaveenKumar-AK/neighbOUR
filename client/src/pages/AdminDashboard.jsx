import React, { useState, useEffect } from 'react';
import api from '../utils/api';

function AdminDashboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      alert('Error fetching users (Admin only!)');
    }
  };

  const toggleStatus = async (id) => {
    try {
      await api.patch(`/users/${id}/toggle-status`);
      fetchUsers(); // Refresh
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem'}}>Manage platform users.</p>

      <div className="card">
        <h3 className="card-title">All Users</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '1rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)'}}>
              <th style={{ padding: '0.75rem 0' }}>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} style={{ borderBottom: '1px solid var(--border)', padding: '0.75rem 0'}}>
                <td style={{ padding: '0.75rem 0' }}>{u.name}</td>
                <td>{u.email}</td>
                <td><span className="badge">{u.role}</span></td>
                <td>
                  <span className={`badge ${u.isActive ? 'status-completed' : 'status-danger'}`} style={{ color: u.isActive ? 'var(--success)' : 'var(--danger)'}}>
                    {u.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td>
                  {u.role !== 'admin' && (
                    <button 
                      className={`btn ${u.isActive ? 'btn-danger' : 'btn-success'}`} 
                      onClick={() => toggleStatus(u._id)}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem'}}
                    >
                      {u.isActive ? 'Disable' : 'Enable'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;
