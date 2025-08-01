import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const AdminDashboard = () => {
  const [docs, setDocs] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, expired: 0 });
  const [role, setRole] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      try {
        const res = await fetch('http://localhost:5000/dashboard-data', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Unauthorized or failed to load data');
        const data = await res.json();
        setDocs(data.documents);
        setStats(data.stats);
        setRole(data.role);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const toggleVisibility = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/documents/${id}/toggle-visibility`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to toggle visibility');
      setDocs(prev => prev.map(doc => doc.id === id ? { ...doc, visible: !doc.visible } : doc));
    } catch (err) {
      alert(err.message);
    }
  };
  const markAsCompleted = async (id) => {
  try {
    const res = await fetch(`http://localhost:5000/documents/${id}/complete`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!res.ok) throw new Error('Failed to mark as completed');

    setDocs(prev => prev.filter(doc => doc.id !== id));
  } catch (err) {
    alert(err.message);
  }
};


  const filteredDocs = docs.filter(doc => {
    const nameMatch = doc.name.toLowerCase().includes(search.toLowerCase());
    const statusMatch = statusFilter === 'all' || doc.status === statusFilter;
    return nameMatch && statusMatch;
  });

  if (loading) return <div className="loading">Loading Dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>

      {role === 'admin' && (
        <div className="summary-cards">
          <div className="card total"><span>Total</span><strong>{stats.total}</strong></div>
          <div className="card active"><span>Active</span><strong>{stats.active}</strong></div>
          <div className="card expired"><span>Expired</span><strong>{stats.expired}</strong></div>
        </div>
      )}

      <div className="filter-section">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {filteredDocs.length > 0 ? (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Expiry Date</th>
              <th>Status</th>
              <th>Visible</th>
              {role === 'admin' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredDocs.map(doc => (
              <tr key={doc.id}>
                <td>{doc.name}</td>
                <td>{new Date(doc.expiry_date).toLocaleDateString()}</td>
                <td><span className={`status-badge ${doc.status}`}>{doc.status.toUpperCase()}</span></td>
                <td>{doc.visible ? 'Yes' : 'No'}</td>
               {role === 'admin' && (
  <td className="dashboard-actions">
    <button onClick={() => toggleVisibility(doc.id)}>
      {doc.visible ? 'Hide' : 'Show'}
    </button>
    <button className="complete-btn" onClick={() => markAsCompleted(doc.id)}>
      Mark as Completed
    </button>
  </td>
)}

              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-results">No matching documents.</div>
      )}
    </div>
  );
};

export default AdminDashboard;
