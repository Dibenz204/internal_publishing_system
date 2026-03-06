import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import AuthService from '../services/auth';

const ProtectedRoute = ({ children, allowedPositions = [] }) => {
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const result = await AuthService.checkAuth();
        setIsAuthenticated(result.authenticated);
        setIsChecking(false);
    };

    if (isChecking) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.loadingSpinner}>Đang tải...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }


    //Kiểm tra position
    if (allowedPositions.length > 0) {
        const user = AuthService.getUser();
        if (!user || !allowedPositions.includes(user.position)) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return children;
};

const styles = {
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
    },
    loadingSpinner: {
        fontSize: '1.2rem',
        color: '#666'
    }
};

export default ProtectedRoute;