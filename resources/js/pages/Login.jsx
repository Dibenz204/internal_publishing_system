import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await api.post('/login', {
                username,
                password
            }, {
                headers: {
                    'X-CSRF-TOKEN': token
                }
            });

            if (response.data.success) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div style={styles.container}>
            <div style={styles.loginBox}>
                <h2 style={styles.title}>ĐĂNG NHẬP HỆ THỐNG</h2>

                {error && (
                    <div style={styles.errorAlert}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Tên đăng nhập:</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={styles.input}
                            required
                            disabled={loading}
                            placeholder="Nhập username"
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Mật khẩu:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            required
                            disabled={loading}
                            placeholder="Nhập mật khẩu"
                        />
                    </div>

                    <button
                        type="submit"
                        style={styles.button}
                        disabled={loading}
                    >
                        {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5'
    },
    loginBox: {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
    },
    title: {
        textAlign: 'center',
        marginBottom: '30px',
        color: '#1a1a1a',
        fontSize: '24px'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    label: {
        fontWeight: '500',
        color: '#555'
    },
    input: {
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '16px',
        outline: 'none',
        transition: 'border-color 0.3s'
    },
    button: {
        padding: '12px',
        backgroundColor: '#1877f2',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        marginTop: '10px'
    },
    errorAlert: {
        backgroundColor: '#ffebee',
        color: '#c62828',
        padding: '12px',
        borderRadius: '4px',
        marginBottom: '20px',
        textAlign: 'center',
        border: '1px solid #ffcdd2'
    }
};

export default Login;