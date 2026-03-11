import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';


const ChangePasswordModal = ({ userId, onClose }) => {
    const [form, setForm] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async () => {
        setError('');
        setSuccess('');
        if (!form.current_password) return setError('Vui lòng nhập mật khẩu hiện tại');
        if (!form.new_password) return setError('Vui lòng nhập mật khẩu mới');
        if (form.new_password.length < 6) return setError('Mật khẩu mới phải có ít nhất 6 ký tự');
        if (form.new_password !== form.confirm_password) return setError('Mật khẩu xác nhận không khớp');

        setSubmitting(true);
        try {
            await api.put(`/users/${userId}/change-password`, {
                current_password: form.current_password,
                new_password: form.new_password,
            });
            setSuccess('Đổi mật khẩu thành công!');
            setForm({ current_password: '', new_password: '', confirm_password: '' });
        } catch (err) {
            const errs = err.response?.data?.errors;
            setError(errs
                ? Object.values(errs).flat().join(' | ')
                : err.response?.data?.message || 'Đổi mật khẩu thất bại'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={modal.overlay}>
            <div style={modal.box} onClick={e => e.stopPropagation()}>
                <div style={modal.header}>
                    <h3 style={modal.title}>Đổi mật khẩu</h3>
                    <button style={modal.closeBtn} onClick={onClose}>✕</button>
                </div>

                {error && <div style={modal.error}>{error}</div>}
                {success && <div style={modal.success}>{success}</div>}

                <div style={modal.body}>
                    <div style={modal.field}>
                        <label style={modal.label}>Mật khẩu hiện tại</label>
                        <input name="current_password" type="password"
                            value={form.current_password} onChange={handleChange}
                            style={modal.input} placeholder="Nhập mật khẩu hiện tại" />
                    </div>
                    <div style={modal.field}>
                        <label style={modal.label}>Mật khẩu mới</label>
                        <input name="new_password" type="password"
                            value={form.new_password} onChange={handleChange}
                            style={modal.input} placeholder="Ít nhất 6 ký tự" />
                    </div>
                    <div style={modal.field}>
                        <label style={modal.label}>Xác nhận mật khẩu mới</label>
                        <input name="confirm_password" type="password"
                            value={form.confirm_password} onChange={handleChange}
                            style={modal.input} placeholder="Nhập lại mật khẩu mới" />
                    </div>
                </div>

                <div style={modal.footer}>
                    <button style={modal.cancelBtn} onClick={onClose} disabled={submitting}>Hủy</button>
                    <button style={modal.submitBtn} onClick={handleSubmit} disabled={submitting}>
                        {submitting ? 'Đang lưu...' : 'Xác nhận'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Profile = () => {
    const { user } = useAuth();
    const [showPwModal, setShowPwModal] = useState(false);

    const emp = user?.employee;

    const rows = [
        { label: 'Họ tên', value: emp?.name },
        { label: 'Email', value: emp?.email },
        { label: 'Số điện thoại', value: emp?.phone },
        { label: 'Ngày sinh', value: emp?.birthday },
        { label: 'Giới tính', value: emp?.sex },
        { label: 'Phòng ban', value: emp?.department },
        { label: 'Chức vụ', value: emp?.position },
        { label: 'Trạng thái', value: emp?.status },
    ];

    return (
        <div style={styles.wrapper}>
            {/* Header */}
            <div style={styles.pageHeader}>
                <div>
                    <h2 style={styles.title}>Hồ sơ cá nhân</h2>
                    <span style={styles.subtitle}>Thông tin tài khoản của bạn</span>
                </div>
                <button style={styles.pwBtn} onClick={() => setShowPwModal(true)}>
                    🔒 Đổi mật khẩu
                </button>
            </div>

            <div style={styles.content}>
                {/* Avatar + tên */}
                <div style={styles.avatarCard}>
                    <div style={styles.avatar}>
                        {(emp?.name || user?.username || '?')[0].toUpperCase()}
                    </div>
                    <div>
                        <div style={styles.avatarName}>{emp?.name || user?.username}</div>
                        <div style={styles.avatarRole}>{user?.position}</div>
                        <div style={styles.avatarUsername}>@{user?.username}</div>
                    </div>
                </div>

                <div style={styles.infoCard}>
                    <h3 style={styles.sectionTitle}>Thông tin chi tiết</h3>
                    <div style={styles.table}>
                        {rows.map(({ label, value }) => (
                            <div key={label} style={styles.row}>
                                <span style={styles.rowLabel}>{label}</span>
                                <span style={styles.rowValue}>
                                    {renderValue(label, value)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showPwModal && (
                <ChangePasswordModal
                    userId={user?.id}
                    onClose={() => setShowPwModal(false)}
                />
            )}
        </div>
    );
};

// ─── Helper render từng loại giá trị ─────────────────────────────────────────
const renderValue = (label, value) => {
    if (value === null || value === undefined || value === '') return <span style={{ color: '#aaa' }}>—</span>;

    if (label === 'Trạng thái') {
        const active = value === 'Đang làm việc' || value === 1 || value === true;
        return (
            <span style={active ? badge.active : badge.inactive}>
                {active ? 'Đang làm việc' : 'Nghỉ làm'}
            </span>
        );
    }
    if (label === 'Giới tính') {
        return value === 'Nam' || value === 1 || value === true ? 'Nam' : 'Nữ';
    }
    return String(value);
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = {
    wrapper: { display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' },
    pageHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', maxWidth: '640px', width: '100%' },
    title: { fontSize: '22px', fontWeight: '700', color: '#1a1a1a', margin: 0 },
    subtitle: { fontSize: '13px', color: '#888', marginTop: '4px', display: 'block' },
    pwBtn: {
        padding: '9px 18px', backgroundColor: '#fff', color: '#333',
        border: '1px solid #d0d0d0', borderRadius: '8px', fontSize: '14px',
        fontWeight: '600', cursor: 'pointer',
    },
    content: { display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '640px', margin: '0 auto', width: '100%' },
    avatarCard: {
        backgroundColor: '#fff', borderRadius: '10px', padding: '24px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex',
        alignItems: 'center', gap: '20px',
    },
    avatar: {
        width: '64px', height: '64px', borderRadius: '50%',
        backgroundColor: '#1877f2', color: '#fff',
        fontSize: '28px', fontWeight: '700',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
    },
    avatarName: { fontSize: '20px', fontWeight: '700', color: '#111' },
    avatarRole: { fontSize: '14px', color: '#555', marginTop: '2px' },
    avatarUsername: { fontSize: '13px', color: '#aaa', marginTop: '2px' },
    infoCard: {
        backgroundColor: '#fff', borderRadius: '10px', padding: '24px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    },
    sectionTitle: { fontSize: '15px', fontWeight: '700', color: '#333', margin: '0 0 16px 0' },
    table: { display: 'flex', flexDirection: 'column' },
    row: {
        display: 'grid', gridTemplateColumns: '160px 1fr',
        padding: '12px 0', borderBottom: '1px solid #f5f5f5',
        alignItems: 'center',
    },
    rowLabel: { fontSize: '13px', color: '#888', fontWeight: '500' },
    rowValue: { fontSize: '14px', color: '#111', fontWeight: '500' },
};

const badge = {
    active: {
        display: 'inline-block', padding: '3px 10px', borderRadius: '12px',
        fontSize: '12px', fontWeight: '600', backgroundColor: '#e6f4ea', color: '#2e7d32',
    },
    inactive: {
        display: 'inline-block', padding: '3px 10px', borderRadius: '12px',
        fontSize: '12px', fontWeight: '600', backgroundColor: '#fce8e6', color: '#c62828',
    },
};

const modal = {
    overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
    box: { backgroundColor: 'white', borderRadius: '10px', width: '100%', maxWidth: '400px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 16px', borderBottom: '1px solid #f0f0f0' },
    title: { fontSize: '18px', fontWeight: '700', color: '#1a1a1a', margin: 0 },
    closeBtn: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#888' },
    body: { padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' },
    footer: { padding: '16px 24px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' },
    field: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '13px', fontWeight: '600', color: '#555' },
    input: { padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', outline: 'none' },
    error: { margin: '0 24px 4px', padding: '10px 12px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '6px', fontSize: '13px' },
    success: { margin: '0 24px 4px', padding: '10px 12px', backgroundColor: '#e8f5e9', color: '#2e7d32', borderRadius: '6px', fontSize: '13px' },
    cancelBtn: { padding: '9px 20px', backgroundColor: '#f5f5f5', color: '#333', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' },
    submitBtn: { padding: '9px 20px', backgroundColor: '#1877f2', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
};

export default Profile;