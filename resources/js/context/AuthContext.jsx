import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const data = await AuthService.checkAuth();
                if (data.authenticated) {
                    setUser(data.user);
                } else {
                    setUser(null);
                    localStorage.removeItem('user');
                }
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (username, password) => {
        const data = await AuthService.login(username, password);
        if (data.success) {
            setUser(data.user);
        }
        return data;
    };

    const logout = async () => {
        await AuthService.logout();
        setUser(null);
    };

    const hasPosition = (allowedPositions = []) => {
        if (!user) return false;
        if (allowedPositions.length === 0) return true;
        return allowedPositions.includes(user.position);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, hasPosition }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth phải dùng trong AuthProvider');
    }
    return context;
};

export default AuthContext;