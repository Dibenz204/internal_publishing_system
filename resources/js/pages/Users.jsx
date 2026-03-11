import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';


const EmployeeModal = ({ onClose, onSuccess, employee = null }) => {
    const isEdit = !!employee;
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        name: employee?.name ?? '',
        email: employee?.email ?? '',
        phone: employee?.phone ?? '',
        birthday: employee?.birthday ?? '',
        sex: String(employee?.sex ?? '1'),
        status: String(employee?.status ?? '1'),
        department_id: String(employee?.department_id ?? ''),
        position_id: String(employee?.position_id ?? ''),
    });

    useEffect(() => {
        Promise.all([api.get('/departments'), api.get('/positions')])
            .then(([deptRes, posRes]) => {
                if (deptRes.data.success) setDepartments(deptRes.data.data.filter(d => d.status === 1));
                if (posRes.data.success) setPositions(posRes.data.data.filter(p => p.status === 1));
            }).catch(() => setError('Không thể tải dữ liệu'));
    }, []);

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async () => {
        if (!form.name.trim()) return setError('Tên không được để trống');
        if (!form.email.trim()) return setError('Email không được để trống');
        if (!form.birthday) return setError('Ngày sinh không được để trống');
        if (!form.department_id) return setError('Vui lòng chọn phòng ban');
        if (!form.position_id) return setError('Vui lòng chọn chức vụ');

        setSubmitting(true);
        setError('');
        try {
            const payload = {
                name: form.name.trim(), email: form.email.trim(),
                phone: form.phone.trim() || null, birthday: form.birthday,
                sex: parseInt(form.sex), status: parseInt(form.status),
                department_id: parseInt(form.department_id),
                position_id: parseInt(form.position_id),
            };
            if (isEdit) await api.put(`/employees/${employee.id}`, payload);
            else await api.post('/employees', payload);
            onSuccess();
        } catch (err) {
            const errs = err.response?.data?.errors;
            setError(errs ? Object.values(errs).flat().join(' | ') : err.response?.data?.message || 'Thao tác thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={modal.overlay}>
            <div style={modal.box} onClick={e => e.stopPropagation()}>
                <div style={modal.header}>
                    <h3 style={modal.title}>{isEdit ? `Cập nhật: ${employee.name}` : 'Thêm nhân viên'}</h3>
                    <button style={modal.closeBtn} onClick={onClose}>✕</button>
                </div>
                {error && <div style={modal.error}>{error}</div>}
                <div style={modal.body}>
                    <div style={modal.row}>
                        <div style={modal.field}>
                            <label style={modal.label}>Họ tên <span style={modal.req}>*</span></label>
                            <input name="name" value={form.name} onChange={handleChange} style={modal.input} placeholder="Nguyễn Văn A" />
                        </div>
                        <div style={modal.field}>
                            <label style={modal.label}>Email <span style={modal.req}>*</span></label>
                            <input name="email" type="email" value={form.email} onChange={handleChange} style={modal.input} placeholder="email@example.com" />
                        </div>
                    </div>
                    <div style={modal.row}>
                        <div style={modal.field}>
                            <label style={modal.label}>Số điện thoại</label>
                            <input name="phone" value={form.phone} onChange={handleChange} style={modal.input} placeholder="0901234567" />
                        </div>
                        <div style={modal.field}>
                            <label style={modal.label}>Ngày sinh <span style={modal.req}>*</span></label>
                            <input name="birthday" type="date" value={form.birthday} onChange={handleChange} style={modal.input} />
                        </div>
                    </div>
                    <div style={modal.row}>
                        <div style={modal.field}>
                            <label style={modal.label}>Giới tính</label>
                            <select name="sex" value={form.sex} onChange={handleChange} style={modal.input}>
                                <option value="1">Nam</option>
                                <option value="0">Nữ</option>
                            </select>
                        </div>
                        <div style={modal.field}>
                            <label style={modal.label}>Trạng thái</label>
                            <select name="status" value={form.status} onChange={handleChange} style={modal.input}>
                                <option value="1">Đang làm việc</option>
                                <option value="0">Nghỉ làm</option>
                            </select>
                        </div>
                    </div>
                    <div style={modal.row}>
                        <div style={modal.field}>
                            <label style={modal.label}>Phòng ban <span style={modal.req}>*</span></label>
                            <select name="department_id" value={form.department_id} onChange={handleChange} style={modal.input}>
                                <option value="">-- Chọn phòng ban --</option>
                                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div style={modal.field}>
                            <label style={modal.label}>Chức vụ <span style={modal.req}>*</span></label>
                            <select name="position_id" value={form.position_id} onChange={handleChange} style={modal.input}>
                                <option value="">-- Chọn chức vụ --</option>
                                {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
                <div style={modal.footer}>
                    <button style={modal.cancelBtn} onClick={onClose} disabled={submitting}>Hủy</button>
                    <button style={modal.submitBtn} onClick={handleSubmit} disabled={submitting}>
                        {submitting ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Thêm nhân viên'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const STATUS_OPTIONS = [
    { value: '1', label: 'Đang làm việc' },
    { value: '0', label: 'Đã nghỉ' },
    { value: '', label: 'Tất cả' },
];

const Users = () => {
    const [employees, setEmployees] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [editEmployee, setEditEmployee] = useState(null);


    const [keyword, setKeyword] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('1');
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        api.get('/departments').then(res => {
            if (res.data.success) setDepartments(res.data.data.filter(d => d.status === 1));
        });

        api.get('/employees').then(res => {
            if (res.data.success) setAllEmployees(res.data.data);
        });
    }, []);

    const filtersRef = useRef({ keyword, deptFilter, statusFilter });
    useEffect(() => { filtersRef.current = { keyword, deptFilter, statusFilter }; });

    const fetchEmployees = async (p = 1, overrideStatus = null) => {
        setLoading(true);
        setError('');
        try {
            const currentStatus = overrideStatus !== null ? overrideStatus : filtersRef.current.statusFilter;
            const { keyword, deptFilter } = filtersRef.current;
            const params = new URLSearchParams();
            if (keyword) params.set('keyword', keyword);
            if (deptFilter) params.set('department_id', deptFilter);
            if (currentStatus !== '') params.set('status', currentStatus);
            params.set('per_page', 10);
            params.set('page', p);

            const res = await api.get(`/employees/search?${params.toString()}`);
            if (res.data.success) {
                setEmployees(res.data.data);
                setMeta(res.data.meta);
                setPage(p);
            }
        } catch {
            setError('Không thể tải danh sách nhân viên');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEmployees(1); }, []);

    useEffect(() => { fetchEmployees(1, statusFilter); }, [statusFilter]);

    const handleSuccess = () => {
        setShowAdd(false);
        setEditEmployee(null);
        fetchEmployees(page);

        api.get('/employees').then(res => {
            if (res.data.success) setAllEmployees(res.data.data);
        });
    };

    const activeCount = allEmployees.filter(e => e.status === 1).length;

    return (
        <div style={styles.wrapper}>

            <div style={styles.pageHeader}>
                <div>
                    <div style={styles.titleRow}>
                        <h2 style={styles.title}>Quản lý nhân viên</h2>
                        <span style={styles.count}>{activeCount} đang làm việc</span>
                    </div>

                    <div style={styles.statusRow}>
                        {STATUS_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                style={statusFilter === opt.value ? styles.statusBtnActive : styles.statusBtn}
                                onClick={() => setStatusFilter(opt.value)}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={styles.actions}>

                    <div style={styles.searchGroup}>
                        <input
                            style={styles.searchInput}
                            placeholder="Tìm tên, số điện thoại/ chức vụ"
                            value={keyword}
                            onChange={e => setKeyword(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && fetchEmployees(1)}
                        />
                        <select
                            style={styles.selectInput}
                            value={deptFilter}
                            onChange={e => setDeptFilter(e.target.value)}
                        >
                            <option value="">Tất cả phòng ban</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                        <button style={styles.searchBtn} onClick={() => fetchEmployees(1)}>
                            Tìm kiếm
                        </button>
                    </div>

                    <div style={{ width: '1px', height: '32px', backgroundColor: '#e0e0e0', margin: '0 8px' }} />

                    <button style={styles.addBtn} onClick={() => setShowAdd(true)}>
                        Thêm nhân viên
                    </button>
                    <button style={styles.deptBtn} onClick={() => navigate('/departments')}>
                        Nhân sự phòng ban →
                    </button>
                </div>
            </div>


            {loading ? (
                <div style={styles.center}>Đang tải...</div>
            ) : error ? (
                <div style={styles.errorMsg}>{error}</div>
            ) : (
                <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.thead}>
                                <th style={styles.th}>#</th>
                                <th style={styles.th}>Họ tên</th>
                                <th style={styles.th}>Email</th>
                                <th style={styles.th}>Số điện thoại</th>
                                <th style={styles.th}>Phòng ban</th>
                                <th style={styles.th}>Chức vụ</th>
                                <th style={styles.th}>Giới tính</th>
                                <th style={styles.th}>Trạng thái</th>
                                <th style={styles.th}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.length === 0 ? (
                                <tr><td colSpan={9} style={styles.empty}>Không có nhân viên nào</td></tr>
                            ) : employees.map((emp, index) => (
                                <tr key={emp.id} style={index % 2 === 0 ? styles.trEven : styles.trOdd}>
                                    <td style={styles.td}>{(page - 1) * 10 + index + 1}</td>
                                    <td style={{ ...styles.td, fontWeight: '600' }}>{emp.name}</td>
                                    <td style={styles.td}>{emp.email || '—'}</td>
                                    <td style={styles.td}>{emp.phone || '—'}</td>
                                    <td style={styles.td}>{emp.department?.name || '—'}</td>
                                    <td style={styles.td}>{emp.position?.name || '—'}</td>
                                    <td style={styles.td}>{emp.sex ? 'Nam' : 'Nữ'}</td>
                                    <td style={styles.td}>
                                        <span style={emp.status ? styles.badgeActive : styles.badgeInactive}>
                                            {emp.status ? 'Đang làm việc' : 'Nghỉ làm'}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        <button style={styles.editBtn} onClick={() => setEditEmployee(emp)}>
                                            Cập nhật
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>


                    {meta && meta.last_page > 1 && (
                        <div style={styles.pagination}>
                            <button style={styles.pageBtn} disabled={page <= 1} onClick={() => fetchEmployees(page - 1)}>←</button>
                            <span style={styles.pageInfo}>Trang {page} / {meta.last_page}</span>
                            <button style={styles.pageBtn} disabled={page >= meta.last_page} onClick={() => fetchEmployees(page + 1)}>→</button>
                        </div>
                    )}
                </div>
            )}

            {showAdd && <EmployeeModal onClose={() => setShowAdd(false)} onSuccess={handleSuccess} />}
            {editEmployee && <EmployeeModal employee={editEmployee} onClose={() => setEditEmployee(null)} onSuccess={handleSuccess} />}
        </div>
    );
};


const styles = {
    wrapper: { display: 'flex', flexDirection: 'column', gap: '16px' },
    pageHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' },
    titleRow: { display: 'flex', alignItems: 'center', gap: '10px' },
    title: { fontSize: '22px', fontWeight: '700', color: '#1a1a1a', margin: 0 },
    count: { fontSize: '18px', color: '#555', backgroundColor: '#f0f0f0', padding: '2px 10px', borderRadius: '10px', fontWeight: '500' },
    statusRow: { display: 'flex', gap: '6px', marginTop: '10px' },
    statusBtn: {
        padding: '5px 14px', backgroundColor: '#fff', color: '#555',
        border: '1px solid #d0d0d0', borderRadius: '20px', fontSize: '13px',
        fontWeight: '500', cursor: 'pointer',
    },
    statusBtnActive: {
        padding: '5px 14px', backgroundColor: '#1877f2', color: '#fff',
        border: '1px solid #1877f2', borderRadius: '20px', fontSize: '13px',
        fontWeight: '600', cursor: 'pointer',
    },
    actions: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginLeft: 'auto' },
    searchGroup: { display: 'flex', gap: '8px', alignItems: 'center' },
    searchInput: { padding: '9px 14px', border: '1px solid #d0d0d0', borderRadius: '8px', fontSize: '14px', outline: 'none', width: '200px' },
    selectInput: { padding: '9px 14px', border: '1px solid #d0d0d0', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' },
    searchBtn: { padding: '9px 16px', backgroundColor: '#f5f5f5', color: '#333', border: '1px solid #d0d0d0', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
    addBtn: { padding: '9px 18px', backgroundColor: '#1877f2', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' },
    deptBtn: { padding: '9px 18px', backgroundColor: '#fff', color: '#333', border: '1px solid #d0d0d0', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' },
    editBtn: { padding: '5px 12px', backgroundColor: '#f5f5f5', color: '#333', border: '1px solid #d0d0d0', borderRadius: '6px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
    tableWrapper: { backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
    thead: { backgroundColor: '#f5f7fa' },
    th: { padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#555', borderBottom: '1px solid #e8e8e8', whiteSpace: 'nowrap' },
    td: { padding: '12px 16px', color: '#333', borderBottom: '1px solid #f0f0f0' },
    trEven: { backgroundColor: '#ffffff' },
    trOdd: { backgroundColor: '#fafafa' },
    empty: { textAlign: 'center', padding: '40px', color: '#aaa' },
    badgeActive: { display: 'inline-block', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', backgroundColor: '#e6f4ea', color: '#2e7d32' },
    badgeInactive: { display: 'inline-block', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', backgroundColor: '#fce8e6', color: '#c62828' },
    pagination: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px' },
    pageBtn: { padding: '6px 14px', border: '1px solid #d0d0d0', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px' },
    pageInfo: { fontSize: '14px', color: '#555' },
    center: { textAlign: 'center', padding: '60px', color: '#888' },
    errorMsg: { textAlign: 'center', padding: '60px', color: '#c62828' },
};

const modal = {
    overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
    box: { backgroundColor: 'white', borderRadius: '10px', width: '100%', maxWidth: '560px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 16px', borderBottom: '1px solid #f0f0f0' },
    title: { fontSize: '18px', fontWeight: '700', color: '#1a1a1a', margin: 0 },
    closeBtn: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#888', padding: '4px 8px' },
    body: { padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' },
    footer: { padding: '16px 24px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
    field: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '13px', fontWeight: '600', color: '#555' },
    req: { color: '#e53935' },
    input: { padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' },
    error: { margin: '0 24px 4px', padding: '10px 12px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '6px', fontSize: '13px' },
    cancelBtn: { padding: '9px 20px', backgroundColor: '#f5f5f5', color: '#333', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' },
    submitBtn: { padding: '9px 20px', backgroundColor: '#1877f2', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
};

export default Users;