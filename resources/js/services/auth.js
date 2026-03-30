import axios from 'axios';
import api from './api';

const AuthService = {
    // async getCsrfCookie() {
    //     await axios.get('/sanctum/csrf-cookie', {
    //         withCredentials: true,
    //     });
    // },
    async getCsrfCookie() {
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '')
            || window.location.origin;

        await axios.get(`${baseUrl}/sanctum/csrf-cookie`, {
            withCredentials: true,
        });
    },

    async login(username, password) {
        try {
            await this.getCsrfCookie(); // Lấy XSRF-TOKEN cookie trước

            const response = await api.post('/login', { username, password });

            if (response.data.success) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Đăng nhập thất bại');
            }
            throw new Error('Không thể kết nối đến server');
        }
    },

    async logout() {
        try {
            await api.post('/logout');
            localStorage.removeItem('user');
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout error:', error);

            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    },

    async checkAuth() {
        try {
            const response = await api.get('/check-auth');

            if (response.data.authenticated && response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            return response.data;
        } catch (error) {
            return { authenticated: false };
        }
    },

    getUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    isAuthenticated() {
        return !!this.getUser();
    },

    hasPosition(allowedPositions) {
        const user = this.getUser();
        if (!user || !allowedPositions || allowedPositions.length === 0) {
            return false;
        }
        return allowedPositions.includes(user.position);
    }
};

export default AuthService;