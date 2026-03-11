import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Departments = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/departments').then(res => {
            if (res.data.success) setDepartments(res.data.data);
        }).catch(() => {
            setError('Không thể tải danh sách phòng ban');
        }).finally(() => setLoading(false));
    }, []);

    if (loading) return <div style={styles.center}>Đang tải...</div>;
    if (error) return <div style={styles.errorMsg}>{error}</div>;

    return (
        <div style={styles.wrapper}>
            <div style={styles.pageHeader}>
                <div>
                    <h2 style={styles.title}>Phòng ban & Nhân sự</h2>
                    <span style={styles.count}>{departments.length} phòng ban</span>
                </div>
            </div>

            <div style={styles.grid}>
                {departments.map(dept => (
                    <div
                        key={dept.id}
                        style={styles.card}
                        onClick={() => navigate(`/departments/${dept.id}`)}
                    >
                        <div style={styles.cardTop}>
                            <span style={styles.deptName}>{dept.name}</span>
                            <span style={dept.status ? styles.badgeActive : styles.badgeInactive}>
                                {dept.status ? 'Hoạt động' : 'Ngừng'}
                            </span>
                        </div>
                        <div style={styles.cardBottom}>
                            <span style={styles.category}>{dept.category || 'Chưa phân loại'}</span>
                            <span style={styles.empCount}>{dept.employees_count} nhân viên</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    wrapper: { display: 'flex', flexDirection: 'column', gap: '20px' },
    pageHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' },
    title: { fontSize: '22px', fontWeight: '700', color: '#1a1a1a', margin: 0 },
    count: { fontSize: '14px', color: '#888' },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '16px',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        cursor: 'pointer',
        border: '1px solid #f0f0f0',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'box-shadow 0.2s',
    },
    cardTop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '8px',
    },
    deptName: { fontSize: '16px', fontWeight: '700', color: '#111' },
    cardBottom: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    category: { fontSize: '13px', color: '#888' },
    empCount: {
        fontSize: '13px', fontWeight: '600', color: '#1877f2',
        backgroundColor: '#e8f0fe', padding: '2px 10px', borderRadius: '10px',
    },
    badgeActive: {
        padding: '2px 8px', borderRadius: '10px', fontSize: '11px',
        fontWeight: '600', backgroundColor: '#e6f4ea', color: '#2e7d32',
        whiteSpace: 'nowrap',
    },
    badgeInactive: {
        padding: '2px 8px', borderRadius: '10px', fontSize: '11px',
        fontWeight: '600', backgroundColor: '#fce8e6', color: '#c62828',
        whiteSpace: 'nowrap',
    },
    center: { textAlign: 'center', padding: '60px', color: '#888' },
    errorMsg: { textAlign: 'center', padding: '60px', color: '#c62828' },
};

export default Departments;