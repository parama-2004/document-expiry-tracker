
import React, { useEffect, useState } from 'react';
import './AlertsPage.css';

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch('http://localhost:5000/alerts', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await res.json();
        setAlerts(data);
      } catch (err) {
        console.error('Failed to load alerts');
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  return (
    <div className="alerts-container">
      <h2>Upcoming Document Expiry Alerts</h2>
      {loading ? (
        <p>Loading...</p>
      ) : alerts.length === 0 ? (
        <p>No documents expiring within the next 7 days.</p>
      ) : (
        <table className="alerts-table">
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Expiry Date</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((doc) => (
              <tr key={doc.id}>
                <td>{doc.name}</td>
                <td>{doc.expiry_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AlertsPage;