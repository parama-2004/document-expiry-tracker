import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [attemptsLeft, setAttemptsLeft] = useState(5);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

const handleLogin = async (e) => {
    e.preventDefault(); 
    console.log("Form submitted");
    setError('');
    setSuccess('');
    try {
        const response = await fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
         
            console.log('Login successful, token:', data.token);
            console.log("Redirecting to /dashboard...");
            window.location.reload();
            navigate('/dashboard');
        } else {
            setError(data.message || 'Login failed');
            if (data.attemptsLeft !== undefined) {
                setAttemptsLeft(data.attemptsLeft);
            }
        }
    } catch (err) {
        setError('Network error. Please try again.');
        console.error('Login error:', err); 
    }
};

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError("New passwords don't match");
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Password changed successfully!');
                setShowChangePassword(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setError(data.message || 'Password change failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        }
    };

    return (
        <div className="login-container">
            <h2>Login to Document Tracker</h2>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            {attemptsLeft < 5 && (
                <div className="attempts-warning">
                    Attempts left today: {attemptsLeft}
                </div>
            )}

            {!showChangePassword ? (
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Employee ID:</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="login-button">
                        Login
                   </button>
                    <button 
                        type="button" 
                        className="change-password-button"
                        onClick={() => setShowChangePassword(true)}
                    >
                        Change Password
                    </button>
                </form>
            ) : (
                <form onSubmit={handleChangePassword}>
                    <h3>Change Password</h3>
                    <div className="form-group">
                        <label>Current Password:</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>New Password:</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm New Password:</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="login-button">
                        Submit
                    </button>
                    <button 
                        type="button" 
                        className="cancel-button"
                        onClick={() => {
                            setShowChangePassword(false);
                            setError('');
                            setSuccess('');
                        }}
                    >
                        Cancel
                    </button>
                   
                </form>
            )}
        </div>
    );
};

export default Login;
