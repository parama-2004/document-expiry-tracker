import React, { useEffect, useState } from 'react';
import AdminDashboard from '../components/Dashboard/AdminDashboard';
import UserDashboard from '../components/Dashboard/UserDashboard';

const DashboardPage = () => {
    const [role, setRole] = useState(null);

    useEffect(() => {
        const fetchRole = async () => {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/get-role', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setRole(data.role);
        };
        fetchRole();
    }, []);

    if (!role) return <p>Loading...</p>;

    return role === 'admin' ? <AdminDashboard /> : <UserDashboard />;
};

export default DashboardPage;