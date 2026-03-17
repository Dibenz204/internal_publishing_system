import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const styles = {
    wrapper: {
        padding: '24px',
        maxWidth: '1400px',
        margin: '0 auto',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
    },
    title: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1a1a1a',
        margin: 0,
    },
    backBtn: {
        padding: '8px 16px',
        backgroundColor: '#f5f5f5',
        color: '#333',
        border: '1px solid #d0d0d0',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
    },
    addBtn: {
        padding: '10px 20px',
        backgroundColor: '#1877f2',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    projectInfo: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        display: 'flex',
        gap: '24px',
        flexWrap: 'wrap',
    },
    infoItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    infoLabel: {
        fontSize: '12px',
        color: '#888',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    infoValue: {
        fontSize: '16px',
        color: '#333',
        fontWeight: '600',
    },
    tableContainer: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        overflow: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        minWidth: '1000px',
    },
    th: {
        padding: '16px',
        textAlign: 'left',
        backgroundColor: '#f8f9fa',
        borderBottom: '2px solid #e0e0e0',
        fontSize: '14px',
        fontWeight: '700',
        color: '#555',
    },
    td: {
        padding: '16px',
        borderBottom: '1px solid #eaeef2',
        fontSize: '14px',
        color: '#333',
    },
    leaderBadge: {
        padding: '4px 10px',
        backgroundColor: '#fff3cd',
        color: '#856404',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-block',
    },
    removeBtn: {
        padding: '6px 12px',
        backgroundColor: '#ffebee',
        color: '#c62828',
        border: '1px solid #ffcdd2',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    loading: {
        textAlign: 'center',
        padding: '60px',
        color: '#888',
        fontSize: '15px',
    },
    empty: {
        textAlign: 'center',
        padding: '60px',
        color: '#888',
        fontSize: '15px',
        fontStyle: 'italic',
    },

    // Modal styles
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '1200px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
    },
    modalHeader: {
        padding: '20px 24px',
        borderBottom: '1px solid #eaeef2',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        backgroundColor: 'white',
        zIndex: 10,
    },
    modalTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#1a1a1a',
        margin: 0,
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
        color: '#888',
    },
    modalBody: {
        padding: '24px',
    },
    addTable: {
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '24px',
    },
    addTh: {
        padding: '12px',
        textAlign: 'left',
        backgroundColor: '#f8f9fa',
        borderBottom: '2px solid #e0e0e0',
        fontSize: '13px',
        fontWeight: '700',
        color: '#555',
    },
    addTd: {
        padding: '12px',
        borderBottom: '1px solid #eaeef2',
    },
    select: {
        width: '100%',
        padding: '8px 12px',
        border: '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '13px',
        outline: 'none',
    },
    removeRowBtn: {
        padding: '4px 8px',
        backgroundColor: '#ffebee',
        color: '#c62828',
        border: 'none',
        borderRadius: '4px',
        fontSize: '12px',
        cursor: 'pointer',
    },
    addRowBtn: {
        padding: '8px 16px',
        backgroundColor: '#f0f7ff',
        color: '#1877f2',
        border: '1px dashed #1877f2',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '12px',
    },
    modalFooter: {
        padding: '20px 24px',
        borderTop: '1px solid #eaeef2',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        position: 'sticky',
        bottom: 0,
        backgroundColor: 'white',
    },
    cancelBtn: {
        padding: '10px 20px',
        backgroundColor: '#f5f5f5',
        color: '#333',
        border: '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '14px',
        cursor: 'pointer',
    },
    saveBtn: {
        padding: '10px 24px',
        backgroundColor: '#1877f2',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    errorMsg: {
        backgroundColor: '#ffebee',
        color: '#c62828',
        padding: '12px',
        borderRadius: '6px',
        marginBottom: '16px',
        fontSize: '14px',
    },
};

const Allocation = () => {
    const { projectId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [allocations, setAllocations] = useState([]);
    const [projectInfo, setProjectInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');


    const [showModal, setShowModal] = useState(false);
    const [jobCategories, setJobCategories] = useState({
        BienTap: [],
        DinhChinh: [],
        SuaBai: []
    });
    const [availableEmployees, setAvailableEmployees] = useState([]);
    const [rows, setRows] = useState([
        { employee_id: '', bien_tap_id: '', dinh_chinh_id: '', sua_bai_id: '', level: 1 }
    ]);
    const [saving, setSaving] = useState(false);
    const [modalError, setModalError] = useState('');

    useEffect(() => {
        if (projectId) {
            fetchData();
            fetchJobCategories();
            fetchAvailableEmployees();
        }
    }, [projectId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/projects/${projectId}/allocations`);

            if (response.data.success) {
                setAllocations(response.data.data.allocations || []);
                setProjectInfo(response.data.data.project);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const fetchJobCategories = async () => {
        try {
            const response = await api.get('/job-categories/grouped');
            if (response.data.success) {
                setJobCategories(response.data.data);
            }
        } catch (err) {
            console.error('Lỗi lấy job categories:', err);
        }
    };

    const fetchAvailableEmployees = async () => {
        try {
            const response = await api.get(`/projects/${projectId}/available-employees`);
            if (response.data.success) {
                setAvailableEmployees(response.data.data);
            }
        } catch (err) {
            console.error('Lỗi lấy nhân viên:', err);
        }
    };

    const handleRemoveAllocation = async (allocationId) => {
        if (!window.confirm('Bạn có chắc muốn xóa phân công này?')) {
            return;
        }

        try {
            const response = await api.delete(`/allocations/${allocationId}`);

            if (response.data.success) {
                fetchData();
                fetchAvailableEmployees();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };


    const handleOpenModal = () => {
        setRows([{ employee_id: '', bien_tap_id: '', dinh_chinh_id: '', sua_bai_id: '', level: 1 }]);
        setModalError('');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleAddRow = () => {
        setRows([...rows, { employee_id: '', bien_tap_id: '', dinh_chinh_id: '', sua_bai_id: '', level: 1 }]);
    };

    const handleRemoveRow = (index) => {
        if (rows.length === 1) {
            setModalError('Phải có ít nhất 1 dòng phân công');
            return;
        }
        const newRows = rows.filter((_, i) => i !== index);
        setRows(newRows);
    };

    const handleRowChange = (index, field, value) => {
        const newRows = [...rows];
        newRows[index][field] = value;
        setRows(newRows);
    };

    const validateRows = () => {
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];


            if (!row.employee_id) {
                setModalError(`Dòng ${i + 1}: Chưa chọn nhân viên`);
                return false;
            }


            if (!row.bien_tap_id && !row.dinh_chinh_id && !row.sua_bai_id) {
                setModalError(`Dòng ${i + 1}: Phải chọn ít nhất 1 công việc`);
                return false;
            }
        }
        return true;
    };

    const handleSaveAllocations = async () => {
        if (!validateRows()) return;

        setSaving(true);
        setModalError('');

        try {

            for (const row of rows) {

                if (row.bien_tap_id) {
                    await api.post('/allocations/assign', {
                        project_id: parseInt(projectId),
                        employee_id: parseInt(row.employee_id),
                        job_category_id: parseInt(row.bien_tap_id),
                        level: parseInt(row.level)
                    });
                }


                if (row.dinh_chinh_id) {
                    await api.post('/allocations/assign', {
                        project_id: parseInt(projectId),
                        employee_id: parseInt(row.employee_id),
                        job_category_id: parseInt(row.dinh_chinh_id),
                        level: parseInt(row.level)
                    });
                }


                if (row.sua_bai_id) {
                    await api.post('/allocations/assign', {
                        project_id: parseInt(projectId),
                        employee_id: parseInt(row.employee_id),
                        job_category_id: parseInt(row.sua_bai_id),
                        level: parseInt(row.level)
                    });
                }
            }


            await fetchData();
            await fetchAvailableEmployees();


            setShowModal(false);
            alert('Thêm phân công thành công');
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data?.errors?.employee_id?.[0] || 'Có lỗi xảy ra';
            setModalError(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const getLevelText = (level) => {
        if (level === 2) {
            return <span style={styles.leaderBadge}>Trưởng nhóm</span>;
        }
        return null;
    };

    if (loading) {
        return <div style={styles.loading}>Đang tải dữ liệu...</div>;
    }

    if (error) {
        return <div style={{ ...styles.loading, color: '#c62828' }}>{error}</div>;
    }

    return (
        <div style={styles.wrapper}>

            <div style={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button style={styles.backBtn} onClick={() => navigate(-1)}>
                        ← Quay lại
                    </button>
                    <h1 style={styles.title}>Phân công công việc</h1>
                </div>
                <button style={styles.addBtn} onClick={handleOpenModal}>
                    + Thêm phân công
                </button>
            </div>


            {projectInfo && (
                <div style={styles.projectInfo}>
                    <div style={styles.infoItem}>
                        <span style={styles.infoLabel}>Tên sách</span>
                        <span style={styles.infoValue}>{projectInfo.book_name}</span>
                    </div>
                    <div style={styles.infoItem}>
                        <span style={styles.infoLabel}>Phòng ban</span>
                        <span style={styles.infoValue}>{projectInfo.department_name}</span>
                    </div>
                    <div style={styles.infoItem}>
                        <span style={styles.infoLabel}>Mô tả</span>
                        <span style={styles.infoValue}>{projectInfo.description || '—'}</span>
                    </div>
                </div>
            )}


            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Tên nhân viên</th>
                            <th style={styles.th}>Công việc</th>
                            <th style={styles.th}>Thể loại</th>
                            <th style={styles.th}>Hệ số</th>
                            <th style={styles.th}>Trang hoàn thành</th>
                            <th style={styles.th}>Cấp bậc</th>
                            <th style={styles.th}>Trạng thái</th>
                            <th style={styles.th}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allocations.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ ...styles.td, textAlign: 'center', color: '#888' }}>
                                    Chưa có phân công nào
                                </td>
                            </tr>
                        ) : (
                            allocations.map((item) => (
                                <tr key={item.id}>
                                    <td style={styles.td}>
                                        <div><strong>{item.employee.name}</strong></div>
                                        <div style={{ fontSize: '12px', color: '#888' }}>{item.employee.email}</div>
                                    </td>
                                    <td style={styles.td}>{item.job.name}</td>
                                    <td style={styles.td}>{item.job.category}</td>
                                    <td style={styles.td}>{item.job.work_coefficient}</td>
                                    <td style={styles.td}>{item.completed_page}</td>
                                    <td style={styles.td}>{getLevelText(item.level)}</td>
                                    <td style={styles.td}>
                                        {item.status === 1 ? (
                                            <span style={{
                                                padding: '4px 10px',
                                                backgroundColor: '#e3f2fd',
                                                color: '#1565c0',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                            }}>
                                                Đang làm
                                            </span>
                                        ) : (
                                            <span style={{
                                                padding: '4px 10px',
                                                backgroundColor: '#e6f4ea',
                                                color: '#2e7d32',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                            }}>
                                                Hoàn thành
                                            </span>
                                        )}
                                    </td>
                                    <td style={styles.td}>
                                        <button
                                            style={styles.removeBtn}
                                            onClick={() => handleRemoveAllocation(item.id)}
                                        >
                                            ✕ Loại
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>


            {showModal && (
                <div style={styles.overlay} onClick={handleCloseModal}>
                    <div style={styles.modal} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>Thêm phân công mới</h3>
                            <button style={styles.closeBtn} onClick={handleCloseModal}>✕</button>
                        </div>

                        <div style={styles.modalBody}>
                            {modalError && <div style={styles.errorMsg}>{modalError}</div>}

                            <table style={styles.addTable}>
                                <thead>
                                    <tr>
                                        <th style={styles.addTh}>Nhân viên</th>
                                        <th style={styles.addTh}>Biên tập</th>
                                        <th style={styles.addTh}>Đính chính</th>
                                        <th style={styles.addTh}>Sửa bài</th>
                                        <th style={styles.addTh}>Cấp bậc</th>
                                        <th style={styles.addTh}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, index) => (
                                        <tr key={index}>
                                            <td style={styles.addTd}>
                                                <select
                                                    style={styles.select}
                                                    value={row.employee_id}
                                                    onChange={(e) => handleRowChange(index, 'employee_id', e.target.value)}
                                                >
                                                    <option value="">-- Chọn nhân viên --</option>
                                                    {availableEmployees.map(emp => (
                                                        <option key={emp.id} value={emp.id}>
                                                            {emp.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td style={styles.addTd}>
                                                <select
                                                    style={styles.select}
                                                    value={row.bien_tap_id}
                                                    onChange={(e) => handleRowChange(index, 'bien_tap_id', e.target.value)}
                                                >
                                                    <option value="">-- Chọn --</option>
                                                    {jobCategories.BienTap.map(job => (
                                                        <option key={job.id} value={job.id}>
                                                            {job.name} - {job.work_coefficient}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td style={styles.addTd}>
                                                <select
                                                    style={styles.select}
                                                    value={row.dinh_chinh_id}
                                                    onChange={(e) => handleRowChange(index, 'dinh_chinh_id', e.target.value)}
                                                >
                                                    <option value="">-- Chọn --</option>
                                                    {jobCategories.DinhChinh.map(job => (
                                                        <option key={job.id} value={job.id}>
                                                            {job.name} - {job.work_coefficient}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td style={styles.addTd}>
                                                <select
                                                    style={styles.select}
                                                    value={row.sua_bai_id}
                                                    onChange={(e) => handleRowChange(index, 'sua_bai_id', e.target.value)}
                                                >
                                                    <option value="">-- Chọn --</option>
                                                    {jobCategories.SuaBai.map(job => (
                                                        <option key={job.id} value={job.id}>
                                                            {job.name} - {job.work_coefficient}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td style={styles.addTd}>
                                                <select
                                                    style={styles.select}
                                                    value={row.level}
                                                    onChange={(e) => handleRowChange(index, 'level', e.target.value)}
                                                >
                                                    <option value="1">Thành viên</option>
                                                    <option value="2">Trưởng nhóm</option>
                                                </select>
                                            </td>
                                            <td style={styles.addTd}>
                                                <button
                                                    style={styles.removeRowBtn}
                                                    onClick={() => handleRemoveRow(index)}
                                                >
                                                    ✕
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <button style={styles.addRowBtn} onClick={handleAddRow}>
                                + Thêm dòng
                            </button>
                        </div>

                        <div style={styles.modalFooter}>
                            <button style={styles.cancelBtn} onClick={handleCloseModal}>
                                Hủy
                            </button>
                            <button
                                style={styles.saveBtn}
                                onClick={handleSaveAllocations}
                                disabled={saving}
                            >
                                {saving ? 'Đang lưu...' : 'Lưu phân công'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Allocation;