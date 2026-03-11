import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const DepartmentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [dept, setDept] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get(`/departments/${id}`).then(res => {
            if (res.data.success) setDept(res.data.data);
        }).catch(() => {
            setError('Không thể tải thông tin phòng ban');
        }).finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div style={styles.center}>Đang tải...</div>;
    if (error) return <div style={styles.errorMsg}>{error}</div>;
    if (!dept) return null;

    const employees = dept.employees ?? [];

    return (
        <div style={styles.wrapper}>
            {/* Back + Header */}
            <div style={styles.pageHeader}>
                <div style={styles.headerLeft}>
                    <button style={styles.backBtn} onClick={() => navigate('/departments')}>
                        ← Quay lại
                    </button>
                    <div>
                        <h2 style={styles.title}>
                            {dept.name}
                            <span style={styles.empCount}>{employees.length} nhân viên</span>
                        </h2>
                        <span style={styles.category}>{dept.category || 'Chưa phân loại'}</span>
                    </div>
                </div>
                <span style={dept.status ? styles.badgeActive : styles.badgeInactive}>
                    {dept.status ? 'Hoạt động' : 'Ngừng hoạt động'}
                </span>
            </div>

            {/* Bảng nhân viên */}
            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.thead}>
                            <th style={styles.th}>#</th>
                            <th style={styles.th}>Họ tên</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Số điện thoại</th>
                            <th style={styles.th}>Chức vụ</th>
                            <th style={styles.th}>Giới tính</th>
                            <th style={styles.th}>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={styles.empty}>
                                    Phòng ban chưa có nhân viên
                                </td>
                            </tr>
                        ) : employees.map((emp, index) => (
                            <tr key={emp.id} style={index % 2 === 0 ? styles.trEven : styles.trOdd}>
                                <td style={styles.td}>{index + 1}</td>
                                <td style={{ ...styles.td, fontWeight: '600' }}>{emp.name}</td>
                                <td style={styles.td}>{emp.email || '—'}</td>
                                <td style={styles.td}>{emp.phone || '—'}</td>
                                <td style={styles.td}>{emp.position?.name || '—'}</td>
                                <td style={styles.td}>{emp.sex ? 'Nam' : 'Nữ'}</td>
                                <td style={styles.td}>
                                    <span style={emp.status ? styles.empActive : styles.empInactive}>
                                        {emp.status ? 'Đang làm việc' : 'Nghỉ làm'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const styles = {
    wrapper: { display: 'flex', flexDirection: 'column', gap: '20px' },
    pageHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' },
    headerLeft: { display: 'flex', alignItems: 'flex-start', gap: '16px' },
    backBtn: {
        padding: '8px 14px', backgroundColor: '#fff', border: '1px solid #d0d0d0',
        borderRadius: '8px', fontSize: '14px', fontWeight: '600',
        cursor: 'pointer', color: '#333', whiteSpace: 'nowrap', marginTop: '4px',
    },
    title: {
        fontSize: '22px', fontWeight: '700', color: '#1a1a1a',
        margin: 0, display: 'flex', alignItems: 'center', gap: '10px',
    },
    empCount: {
        fontSize: '14px', fontWeight: '500', color: '#888',
        backgroundColor: '#f5f5f5', padding: '2px 10px',
        borderRadius: '10px',
    },
    category: { fontSize: '13px', color: '#888', marginTop: '4px', display: 'block' },
    badgeActive: {
        padding: '4px 12px', borderRadius: '12px', fontSize: '13px',
        fontWeight: '600', backgroundColor: '#e6f4ea', color: '#2e7d32',
    },
    badgeInactive: {
        padding: '4px 12px', borderRadius: '12px', fontSize: '13px',
        fontWeight: '600', backgroundColor: '#fce8e6', color: '#c62828',
    },
    tableWrapper: {
        backgroundColor: 'white', borderRadius: '8px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'auto',
    },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
    thead: { backgroundColor: '#f5f7fa' },
    th: { padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#555', borderBottom: '1px solid #e8e8e8', whiteSpace: 'nowrap' },
    td: { padding: '12px 16px', color: '#333', borderBottom: '1px solid #f0f0f0' },
    trEven: { backgroundColor: '#ffffff' },
    trOdd: { backgroundColor: '#fafafa' },
    empty: { textAlign: 'center', padding: '40px', color: '#aaa' },
    empActive: {
        display: 'inline-block', padding: '3px 10px', borderRadius: '12px',
        fontSize: '12px', fontWeight: '600', backgroundColor: '#e6f4ea', color: '#2e7d32',
    },
    empInactive: {
        display: 'inline-block', padding: '3px 10px', borderRadius: '12px',
        fontSize: '12px', fontWeight: '600', backgroundColor: '#fce8e6', color: '#c62828',
    },
    center: { textAlign: 'center', padding: '60px', color: '#888' },
    errorMsg: { textAlign: 'center', padding: '60px', color: '#c62828' },
};

export default DepartmentDetail;