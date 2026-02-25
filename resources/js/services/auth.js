import api from './api';

const AuthService = {
    async getCsrfCookie() {
        await api.get('/sanctum/csrf-cookie');
    },

    async login(username, password) {
        try {
            // Bước 1: Lấy CSRF cookie
            await this.getCsrfCookie();

            // Bước 2: Gửi request login
            const response = await api.post('/login', {
                username,
                password
            });

            if (response.data.success) {
                // Lưu thông tin user
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