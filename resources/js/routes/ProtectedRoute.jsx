import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const ProtectedRoute = ({ allowedPositions = [] }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={styles.loadingWrapper}>
                <div style={styles.spinner} />
                <p style={styles.loadingText}>Đang tải...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedPositions.length > 0 && !allowedPositions.includes(user.position)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

const styles = {
    loadingWrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        gap: '16px',
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '4px solid #e0e0e0',
        borderTop: '4px solid #1877f2',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
    loadingText: {
        color: '#888',
        fontSize: '14px',
    },
};

// Inject keyframe animation cho spinner
const styleTag = document.createElement('style');
styleTag.innerHTML = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(styleTag);

export default ProtectedRoute;