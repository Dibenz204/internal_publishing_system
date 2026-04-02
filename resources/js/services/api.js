import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// const api = axios.create({
//     baseURL: API_URL,
//     withCredentials: true,
//     withXSRFToken: true,
//     headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'X-Requested-With': 'XMLHttpRequest'
//     }
// });



// api.interceptors.response.use(
//     response => response,
//     error => {
//         console.error('API Error:', error.response?.data || error.message);
//         return Promise.reject(error);
//     }
// );

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// api.interceptors.response.use(
//     response => response,
//     error => {
//         console.error('API Error:', error.response?.data || error.message);
//         return Promise.reject(error);
//     }
// );

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401 || error.response?.status === 500) {
            const message = error.response?.data?.message;

            // Chỉ redirect nếu là lỗi auth
            if (message === 'Unauthenticated.' || message?.includes('đăng nhập ở nơi khác')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                if (!window.location.pathname.includes('/login')) {
                    alert('Tài khoản đã được đăng nhập ở nơi khác. Vui lòng đăng nhập lại.');
                    window.location.href = '/login';
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;