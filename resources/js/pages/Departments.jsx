import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';


const DepartmentModal = ({ onClose, onSuccess, department = null }) => {
    const isEdit = !!department;
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        name: department?.name ?? '',
        category: department?.category ?? '',
        status: String(department?.status ?? '1'),
    });

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async () => {
        if (!form.name.trim()) return setError('Tên phòng ban không được để trống');
        setSubmitting(true);
        setError('');
        try {
            if (isEdit) {
                await api.patch(`/departments/${department.id}`, {
                    name: form.name.trim(),
                    category: form.category.trim(),
                    status: parseInt(form.status),
                });
            } else {
                await api.post('/departments', {
                    name: form.name.trim(),
                    category: form.category.trim(),
                    status: parseInt(form.status),
                });
            }
            onSuccess();
        } catch (err) {
            const errs = err.response?.data?.errors;
            setError(errs
                ? Object.values(errs).flat().join(' | ')
                : err.response?.data?.message || 'Thao tác thất bại'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={modal.overlay} onClick={onClose}>
            <div style={modal.box} onClick={e => e.stopPropagation()}>
                <div style={modal.header}>
                    <h3 style={modal.title}>
                        {isEdit ? `Cập nhật: ${department.name}` : 'Thêm phòng ban'}
                    </h3>
                    <button style={modal.closeBtn} onClick={onClose}>✕</button>
                </div>

                {error && <div style={modal.error}>{error}</div>}

                <div style={modal.body}>
                    <div style={modal.field}>
                        <label style={modal.label}>Tên phòng ban <span style={modal.req}>*</span></label>
                        <input name="name" value={form.name} onChange={handleChange}
                            style={modal.input} placeholder="VD: Phòng Biên tập" />
                    </div>
                    <div style={modal.field}>
                        <label style={modal.label}>Phân loại</label>
                        <input name="category" value={form.category} onChange={handleChange}
                            style={modal.input} placeholder="VD: Biên tập, Điều phối..." />
                    </div>
                    {isEdit && (
                        <div style={modal.field}>
                            <label style={modal.label}>Trạng thái</label>
                            <select name="status" value={form.status} onChange={handleChange} style={modal.input}>
                                <option value="1">Hoạt động</option>
                                <option value="0">Ngừng</option>
                            </select>
                            <span style={modal.hint}>⚠️ Chỉ có thể ngừng phòng ban khi không còn nhân viên</span>
                        </div>
                    )}
                </div>

                <div style={modal.footer}>
                    <button style={modal.cancelBtn} onClick={onClose} disabled={submitting}>Hủy</button>
                    <button style={modal.submitBtn} onClick={handleSubmit} disabled={submitting}>
                        {submitting ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Thêm phòng ban'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const Departments = () => {
    const { user } = useAuth();
    const isAdmin = user?.position === 'Admin';

    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [editDept, setEditDept] = useState(null);
    const navigate = useNavigate();

    const fetchDepartments = () => {
        setLoading(true);
        api.get('/departments').then(res => {
            if (res.data.success) setDepartments(res.data.data);
        }).catch(() => {
            setError('Không thể tải danh sách phòng ban');
        }).finally(() => setLoading(false));
    };

    useEffect(() => { fetchDepartments(); }, []);

    const handleSuccess = () => {
        setShowAdd(false);
        setEditDept(null);
        fetchDepartments();
    };

    if (loading) return <div style={styles.center}>Đang tải...</div>;
    if (error) return <div style={styles.errorMsg}>{error}</div>;

    return (
        <div style={styles.wrapper}>

            <div style={styles.pageHeader}>
                <div style={styles.titleRow}>
                    <h2 style={styles.title}>Phòng ban & Nhân sự</h2>
                    <span style={styles.count}>
                        ({departments.filter(e => e.status === 1).length} phòng hoạt động)
                    </span>
                </div>
                {isAdmin && (
                    <button style={styles.addBtn} onClick={() => setShowAdd(true)}>
                        + Thêm phòng ban
                    </button>
                )}
            </div>


            <div style={styles.grid}>
                {departments.map(dept => (
                    <div key={dept.id} style={styles.card}>
                        <div style={styles.cardTop}>
                            <span style={styles.deptName}>{dept.name}</span>
                            <div style={styles.cardTopRight}>
                                <span style={dept.status ? styles.badgeActive : styles.badgeInactive}>
                                    {dept.status ? 'Hoạt động' : 'Ngừng'}
                                </span>
                                {isAdmin && (
                                    <button
                                        style={styles.editBtn}
                                        onClick={e => {
                                            e.stopPropagation();
                                            setEditDept(dept);
                                        }}
                                    >
                                        Cập nhật
                                    </button>
                                )}
                            </div>
                        </div>


                        <div
                            style={styles.cardBottom}
                            onClick={() => navigate(`/departments/${dept.id}`)}
                        >
                            <span style={styles.category}>{dept.category || 'Chưa phân loại'}</span>
                            <span style={styles.empCount}>
                                {dept.active_employees_count ?? dept.employees_count ?? 0} nhân viên
                            </span>
                        </div>


                        <div
                            style={styles.cardLink}
                            onClick={() => navigate(`/departments/${dept.id}`)}
                        >

                        </div>
                    </div>
                ))}
            </div>

            {showAdd && (
                <DepartmentModal onClose={() => setShowAdd(false)} onSuccess={handleSuccess} />
            )}
            {editDept && (
                <DepartmentModal
                    department={editDept}
                    onClose={() => setEditDept(null)}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
};


const styles = {
    wrapper: { display: 'flex', flexDirection: 'column', gap: '20px' },
    pageHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    titleRow: { display: 'flex', alignItems: 'center', gap: '10px' },
    title: { fontSize: '22px', fontWeight: '700', color: '#1a1a1a', margin: 0 },
    count: { fontSize: '18px', color: '#888' },
    addBtn: { padding: '9px 18px', backgroundColor: '#1877f2', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
    },
    card: {
        backgroundColor: '#fff', borderRadius: '12px', padding: '20px 20px 16px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0',
        display: 'flex', flexDirection: 'column', gap: '14px',
    },
    cardTop: {
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', gap: '8px',
    },
    cardTopRight: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 },
    deptName: { fontSize: '17px', fontWeight: '700', color: '#111', lineHeight: '1.3' },
    editBtn: {
        padding: '3px 10px', backgroundColor: '#f5f5f5', color: '#333',
        border: '1px solid #d0d0d0', borderRadius: '6px', fontSize: '12px',
        fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap',
    },
    cardBottom: {
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', cursor: 'pointer',
    },
    category: { fontSize: '17px', color: '#888' },
    empCount: { fontSize: '16px', fontWeight: '600', color: '#1877f2', backgroundColor: '#e8f0fe', padding: '3px 10px', borderRadius: '10px' },
    cardLink: { fontSize: '13px', color: '#1877f2', cursor: 'pointer', fontWeight: '500' },
    badgeActive: { padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600', backgroundColor: '#e6f4ea', color: '#2e7d32', whiteSpace: 'nowrap' },
    badgeInactive: { padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600', backgroundColor: '#fce8e6', color: '#c62828', whiteSpace: 'nowrap' },
    center: { textAlign: 'center', padding: '60px', color: '#888' },
    errorMsg: { textAlign: 'center', padding: '60px', color: '#c62828' },
};

const modal = {
    overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
    box: { backgroundColor: 'white', borderRadius: '10px', width: '100%', maxWidth: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 16px', borderBottom: '1px solid #f0f0f0' },
    title: { fontSize: '18px', fontWeight: '700', color: '#1a1a1a', margin: 0 },
    closeBtn: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#888' },
    body: { padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' },
    footer: { padding: '16px 24px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' },
    field: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '13px', fontWeight: '600', color: '#555' },
    req: { color: '#e53935' },
    hint: { fontSize: '12px', color: '#f57c00', marginTop: '4px' },
    input: { padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', outline: 'none' },
    error: { margin: '0 24px 4px', padding: '10px 12px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '6px', fontSize: '13px' },
    cancelBtn: { padding: '9px 20px', backgroundColor: '#f5f5f5', color: '#333', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' },
    submitBtn: { padding: '9px 20px', backgroundColor: '#1877f2', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
};

export default Departments;