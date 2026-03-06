import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/auth';

const Dashboard = () => {
    const navigate = useNavigate();
    const user = AuthService.getUser();

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, []);

    const handleLogout = async () => {
        await AuthService.logout();
        navigate('/login');
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>Dashboard</h1>
                <button onClick={handleLogout} style={styles.logoutBtn}>
                    Đăng xuất
                </button>
            </div>

            <div style={styles.content}>
                <h2>Xin chào, {user.employee?.name || user.username}!</h2>
                <p>Chức vụ: {user.position}</p>

                <div style={styles.card}>
                    <h3>Thông tin người dùng</h3>
                    <pre style={styles.pre}>
                        {JSON.stringify(user, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
    },
    header: {
        backgroundColor: '#fff',
        padding: '1rem 2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    logoutBtn: {
        padding: '0.5rem 1rem',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    content: {
        padding: '2rem'
    },
    card: {
        backgroundColor: '#fff',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginTop: '1rem'
    },
    pre: {
        backgroundColor: '#f8f9fa',
        padding: '1rem',
        borderRadius: '4px',
        overflow: 'auto'
    }
};

export default Dashboard;