import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';


const styles = {
    wrapper: {
        padding: '24px',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    title: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1a1a1a',
        margin: 0,
    },
    deptInfo: {
        padding: '8px 16px',
        backgroundColor: '#e8f0fe',
        borderRadius: '20px',
        color: '#1877f2',
        fontWeight: '600',
        fontSize: '14px',
    },
    controlRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
        flexWrap: 'wrap',
    },
    searchBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flex: 1,
        minWidth: '220px',
    },
    searchInputWrap: {
        position: 'relative',
        flex: 1,
        display: 'flex',
        alignItems: 'center',
    },
    searchIcon: {
        position: 'absolute',
        left: '12px',
        color: '#aaa',
        fontSize: '14px',
        pointerEvents: 'none',
    },
    searchInput: {
        width: '100%',
        padding: '9px 12px 9px 36px',
        border: '1px solid #e0e0e0',
        borderRadius: '20px',
        fontSize: '14px',
        outline: 'none',
        backgroundColor: 'white',
        color: '#1a1a1a',
        boxSizing: 'border-box',
    },
    searchBtn: {
        padding: '9px 18px',
        backgroundColor: '#1877f2',
        color: 'white',
        border: 'none',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
    },
    filterTabs: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
    },
    filterTab: {
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        border: '1px solid #e0e0e0',
        backgroundColor: 'white',
        color: '#555',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
    },
    filterTabActive: {
        backgroundColor: '#1877f2',
        color: 'white',
        border: '1px solid #1877f2',
    },
    bookGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        padding: '16px',
        transition: 'transform 0.2s, box-shadow 0.2s',
        border: '1px solid #eaeef2',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        position: 'relative',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    bookCode: {
        fontSize: '12px',
        color: '#888',
        fontWeight: '500',
    },
    statusBadge: {
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: '600',
    },
    bookName: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#1a1a1a',
        margin: '8px 0 4px',
        lineHeight: '1.3',
    },
    infoRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13px',
        color: '#666',
        margin: '4px 0',
    },
    infoLabel: {
        minWidth: '80px',
        color: '#888',
        fontWeight: '500',
    },
    infoValue: {
        color: '#333',
        fontWeight: '600',
    },
    currentHolder: {
        fontSize: '13px',
        color: '#555',
        fontWeight: '500',
        marginTop: '2px',
    },
    progressBar: {
        width: '100%',
        height: '6px',
        backgroundColor: '#eef2f6',
        borderRadius: '3px',
        margin: '8px 0',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#1877f2',
        borderRadius: '3px',
    },
    progressText: {
        fontSize: '12px',
        color: '#666',
        textAlign: 'right',
    },
    myJobTag: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        marginTop: '4px',
    },
    jobChip: {
        padding: '3px 10px',
        backgroundColor: '#f0f7ff',
        color: '#1877f2',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        border: '1px solid #d0e4ff',
    },
    actionButtons: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '8px',
        borderTop: '1px solid #eaeef2',
        paddingTop: '12px',
    },
    workBtn: {
        padding: '6px 16px',
        backgroundColor: '#1877f2',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '13px',
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

    overlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '96%',
        maxWidth: '1100px',
        maxHeight: '92vh',
        overflow: 'auto',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        display: 'flex',
        flexDirection: 'column',
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
        fontSize: '22px',
        cursor: 'pointer',
        color: '#888',
        lineHeight: 1,
    },
    projectInfoBar: {
        padding: '16px 24px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #eaeef2',
        display: 'flex',
        gap: '24px',
        flexWrap: 'wrap',
    },
    piItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
    },
    piLabel: {
        fontSize: '11px',
        color: '#888',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    piValue: {
        fontSize: '15px',
        color: '#333',
        fontWeight: '600',
    },
    modalBody: {
        padding: '20px 24px',
        flex: 1,
        overflow: 'auto',
    },
    tableContainer: {
        backgroundColor: 'white',
        borderRadius: '10px',
        border: '1px solid #eaeef2',
        overflow: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        minWidth: '800px',
    },
    th: {
        padding: '14px 16px',
        textAlign: 'left',
        backgroundColor: '#f8f9fa',
        borderBottom: '2px solid #e0e0e0',
        fontSize: '13px',
        fontWeight: '700',
        color: '#555',
    },
    td: {
        padding: '14px 16px',
        borderBottom: '1px solid #eaeef2',
        fontSize: '14px',
        color: '#333',
        verticalAlign: 'middle',
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
    memberBadge: {
        padding: '4px 10px',
        backgroundColor: '#f3f4f6',
        color: '#555',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-block',
    },
    pageBtn: {
        padding: '6px 14px',
        backgroundColor: '#1877f2',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
    },
    completeBtn: {
        padding: '6px 14px',
        backgroundColor: '#2e7d32',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
    },
    reopenBtn: {
        padding: '6px 14px',
        backgroundColor: '#f57f17',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
    },
    notMyJobText: {
        fontSize: '12px',
        color: '#aaa',
        fontStyle: 'italic',
    },

    miniOverlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
    },
    miniModal: {
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '24px',
        width: '340px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    },
    miniTitle: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: '16px',
    },
    miniInput: {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '15px',
        outline: 'none',
        boxSizing: 'border-box',
        marginBottom: '16px',
    },
    miniFooter: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
    },
    miniCancel: {
        padding: '8px 16px',
        backgroundColor: '#f5f5f5',
        color: '#333',
        border: '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '13px',
        cursor: 'pointer',
    },
    miniSave: {
        padding: '8px 20px',
        backgroundColor: '#1877f2',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    miniError: {
        backgroundColor: '#ffebee',
        color: '#c62828',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '13px',
        marginBottom: '12px',
    },
};


const STATUS_MAP = { 0: 'Hủy', 1: 'Đang thực hiện', 2: 'Chờ phân công', 3: 'Hoàn thành', 4: 'Điều chỉnh' };
const COLOR_MAP = { 0: '#ffebee', 1: '#e3f2fd', 2: '#fff8e1', 3: '#e8f5e9', 4: '#f3e5f5' };
const TEXT_COLOR_MAP = { 0: '#c62828', 1: '#1565c0', 2: '#f57f17', 3: '#2e7d32', 4: '#6a1b9a' };

const FILTERS = [
    { key: 'all', label: 'Tất cả' },
    { key: '1', label: 'Đang thực hiện' },
    { key: '2', label: 'Hoàn thành' },
];


const groupByBook = (allocations) => {
    const map = {};
    allocations.forEach((alloc) => {
        const bookId = alloc.project.book.id;
        if (!map[bookId]) {
            map[bookId] = {
                bookId,
                book: alloc.project.book,
                project: alloc.project,
                department: alloc.project.department,
                allocations: [],
            };
        }
        map[bookId].allocations.push(alloc);
    });
    return Object.values(map);
};

const getGroupAllocationStatus = (group) => {
    const hasInProgress = group.allocations.some((a) => a.status === 1);
    return hasInProgress ? 1 : 2;
};

const calculateProgress = (book) => {
    if (!book.page || book.page === 0) return 0;
    return Math.round(((book.current_page || 0) / book.page) * 100);
};


const PageInputModal = ({ allocation, onClose, onSaved }) => {
    const [value, setValue] = useState(allocation.completed_page ?? '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        const page = parseInt(value, 10);
        if (isNaN(page) || page < 0) {
            setError('Vui lòng nhập số trang hợp lệ (số nguyên không âm)');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const res = await api.patch(`/allocations/${allocation.id}/completed-page`, { completed_page: page });
            if (res.data.success) { onSaved(); onClose(); }
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={styles.miniOverlay} onClick={onClose}>
            <div style={styles.miniModal} onClick={(e) => e.stopPropagation()}>
                <div style={styles.miniTitle}>Đánh số trang hoàn thành</div>
                {error && <div style={styles.miniError}>{error}</div>}
                <input
                    style={styles.miniInput}
                    type="number"
                    min="0"
                    placeholder="Nhập số trang..."
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    autoFocus
                />
                <div style={styles.miniFooter}>
                    <button style={styles.miniCancel} onClick={onClose}>Hủy</button>
                    <button style={styles.miniSave} onClick={handleSave} disabled={saving}>
                        {saving ? 'Đang lưu...' : 'Lưu'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const AllocationDetailModal = ({ group, currentUserId, onClose, onRefresh }) => {
    const { book, project, department } = group;

    const [allocations, setAllocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pageTarget, setPageTarget] = useState(null);

    useEffect(() => { fetchAllocations(); }, [project.id]);

    const fetchAllocations = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get(`/projects/${project.id}/allocations`);
            if (res.data.success) setAllocations(res.data.data.allocations || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handlePageSaved = () => { fetchAllocations(); onRefresh(); };

    const handleComplete = async (allocationId) => {
        try {
            const res = await api.patch(`/allocations/complete/${allocationId}`);
            if (res.data.success) { fetchAllocations(); onRefresh(); }
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleReopen = async (allocationId) => {
        try {
            const res = await api.patch(`/allocations/reopen/${allocationId}`);
            if (res.data.success) { fetchAllocations(); onRefresh(); }
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const getLevelBadge = (level) =>
        level === 2
            ? <span style={styles.leaderBadge}>Trưởng nhóm</span>
            : <span style={styles.memberBadge}>Thành viên</span>;

    const getStatusBadge = (status) => {
        const active = status === 1;
        return (
            <span style={{
                padding: '4px 10px',
                backgroundColor: active ? '#e3f2fd' : '#e8f5e9',
                color: active ? '#1565c0' : '#2e7d32',
                borderRadius: '20px', fontSize: '12px', fontWeight: '600',
            }}>
                {active ? 'Đang làm' : 'Hoàn thành'}
            </span>
        );
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <h3 style={styles.modalTitle}>Chi tiết công việc</h3>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div style={styles.projectInfoBar}>
                    <div style={styles.piItem}>
                        <span style={styles.piLabel}>Tên sách</span>
                        <span style={styles.piValue}>{book.name}</span>
                    </div>
                    <div style={styles.piItem}>
                        <span style={styles.piLabel}>Phòng ban</span>
                        <span style={styles.piValue}>{department.name}</span>
                    </div>
                    {project.description && (
                        <div style={styles.piItem}>
                            <span style={styles.piLabel}>Mô tả</span>
                            <span style={styles.piValue}>{project.description}</span>
                        </div>
                    )}
                </div>

                <div style={styles.modalBody}>
                    {loading ? (
                        <div style={styles.loading}>Đang tải...</div>
                    ) : error ? (
                        <div style={{ ...styles.loading, color: '#c62828' }}>{error}</div>
                    ) : (
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
                                            <td colSpan="8" style={{ ...styles.td, textAlign: 'center', color: '#888' }}>
                                                Chưa có phân công nào
                                            </td>
                                        </tr>
                                    ) : allocations.map((item) => {
                                        const isMe = item.employee.id === currentUserId;
                                        return (
                                            <tr key={item.id} style={{ backgroundColor: isMe ? '#f0f7ff' : 'white' }}>
                                                <td style={styles.td}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <strong>{item.employee.name}</strong>
                                                        {isMe && (
                                                            <span style={{
                                                                fontSize: '10px', backgroundColor: '#1877f2',
                                                                color: 'white', padding: '1px 6px',
                                                                borderRadius: '8px', fontWeight: '600',
                                                            }}>Bạn</span>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#888' }}>{item.employee.email}</div>
                                                </td>
                                                <td style={styles.td}>{item.job.name}</td>
                                                <td style={styles.td}>{item.job.category}</td>
                                                <td style={styles.td}>{item.job.work_coefficient}</td>
                                                <td style={styles.td}>{item.completed_page}</td>
                                                <td style={styles.td}>{getLevelBadge(item.level)}</td>
                                                <td style={styles.td}>{getStatusBadge(item.status)}</td>
                                                <td style={styles.td}>
                                                    {isMe ? (
                                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                            <button style={styles.pageBtn} onClick={() => setPageTarget(item)}>
                                                                Đánh số trang
                                                            </button>
                                                            {item.status === 1 ? (
                                                                <button style={styles.completeBtn} onClick={() => handleComplete(item.id)}>
                                                                    Hoàn thành
                                                                </button>
                                                            ) : (
                                                                <button style={styles.reopenBtn} onClick={() => handleReopen(item.id)}>
                                                                    Mở tiến độ
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span style={styles.notMyJobText}>Bạn không thuộc việc này</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {pageTarget && (
                <PageInputModal
                    allocation={pageTarget}
                    onClose={() => setPageTarget(null)}
                    onSaved={handlePageSaved}
                />
            )}
        </div>
    );
};


const MyAllocation = () => {
    const { user } = useAuth();

    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');

    const [inputValue, setInputValue] = useState('');
    const [appliedQuery, setAppliedQuery] = useState('');

    const currentUserId = user?.employee?.id;

    useEffect(() => { fetchMyAllocations(); }, []);

    const fetchMyAllocations = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/allocations/my-allocations');
            if (res.data.success) {
                setGroups(groupByBook(res.data.data || []));
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setAppliedQuery(inputValue.trim());
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    const countForFilter = (key) => {
        if (key === 'all') return groups.length;
        const targetStatus = parseInt(key, 10);
        return groups.filter((g) => getGroupAllocationStatus(g) === targetStatus).length;
    };

    const displayedGroups = useMemo(() => {
        let result = groups;

        if (activeFilter !== 'all') {
            const targetStatus = parseInt(activeFilter, 10);
            result = result.filter((g) => getGroupAllocationStatus(g) === targetStatus);
        }

        if (appliedQuery) {
            const q = appliedQuery.toLowerCase();
            result = result.filter((g) => g.book.name.toLowerCase().includes(q));
        }

        return result;
    }, [groups, activeFilter, appliedQuery]);

    const getStatusStyle = (status) => ({
        backgroundColor: COLOR_MAP[status] ?? '#e0e0e0',
        color: TEXT_COLOR_MAP[status] ?? '#333',
    });

    const getMyJobs = (group) =>
        group.allocations.filter((a) => a.employee_id === currentUserId);

    if (loading) return <div style={styles.loading}>Đang tải công việc của bạn...</div>;
    if (error) return <div style={{ ...styles.loading, color: '#c62828' }}>{error}</div>;

    return (
        <div style={styles.wrapper}>
            <div style={styles.header}>
                <h1 style={styles.title}>Công việc của tôi</h1>
                <div style={styles.deptInfo}>{user?.employee?.department}</div>
            </div>

            <div style={styles.controlRow}>

                <div style={styles.searchBox}>
                    <div style={styles.searchInputWrap}>
                        <span style={styles.searchIcon}>🔍</span>
                        <input
                            style={styles.searchInput}
                            type="text"
                            placeholder="Tìm theo tên sách..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                        />
                    </div>
                    <button style={styles.searchBtn} onClick={handleSearch}>
                        Tìm kiếm
                    </button>
                </div>


                <div style={styles.filterTabs}>
                    {FILTERS.map((f) => (
                        <button
                            key={f.key}
                            style={{
                                ...styles.filterTab,
                                ...(activeFilter === f.key ? styles.filterTabActive : {}),
                            }}
                            onClick={() => setActiveFilter(f.key)}
                        >
                            {f.label}
                            <span style={{ marginLeft: '5px', opacity: 0.8 }}>
                                ({countForFilter(f.key)})
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {displayedGroups.length === 0 ? (
                <div style={styles.empty}>
                    {appliedQuery || activeFilter !== 'all'
                        ? 'Không tìm thấy kết quả phù hợp'
                        : 'Bạn chưa được phân công công việc nào'}
                </div>
            ) : (
                <div style={styles.bookGrid}>
                    {displayedGroups.map((group) => {
                        const { book, project, department } = group;
                        const progress = calculateProgress(book);
                        const myJobs = getMyJobs(group);

                        return (
                            <div
                                key={group.bookId}
                                style={styles.card}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                                }}
                            >
                                <div style={styles.cardHeader}>
                                    {book.bookCode && <span style={styles.bookCode}>#{book.bookCode}</span>}
                                    <span style={{ ...styles.statusBadge, ...getStatusStyle(project.status) }}>
                                        {STATUS_MAP[project.status] ?? 'Không xác định'}
                                    </span>
                                </div>

                                <h3 style={styles.bookName}>{book.name}</h3>

                                <div style={styles.infoRow}>
                                    <span style={styles.infoLabel}>Số trang:</span>
                                    <span style={styles.infoValue}>{book.page || '—'}</span>
                                </div>

                                <div style={styles.infoRow}>
                                    <span style={styles.infoLabel}>Phòng ban:</span>
                                    <span style={styles.infoValue}>{department.name}</span>
                                </div>

                                {book.current_holder_department && (
                                    <div style={styles.currentHolder}>
                                        Đang xử lý ở: {book.current_holder_department}
                                    </div>
                                )}

                                {myJobs.length > 0 && (
                                    <div>
                                        <div style={{ ...styles.infoLabel, marginBottom: '6px' }}>Việc của bạn:</div>
                                        <div style={styles.myJobTag}>
                                            {myJobs.map((a) => (
                                                <span key={a.id} style={styles.jobChip}>
                                                    {a.job_category.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {book.page > 0 && (
                                    <>
                                        <div style={styles.progressBar}>
                                            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
                                        </div>
                                        <div style={styles.progressText}>
                                            Tiến độ: {book.current_page || 0}/{book.page} trang ({progress}%)
                                        </div>
                                    </>
                                )}

                                <div style={styles.actionButtons}>
                                    <button style={styles.workBtn} onClick={() => setSelectedGroup(group)}>
                                        Công việc
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {selectedGroup && (
                <AllocationDetailModal
                    group={selectedGroup}
                    currentUserId={currentUserId}
                    onClose={() => setSelectedGroup(null)}
                    onRefresh={fetchMyAllocations}
                />
            )}
        </div>
    );
};

export default MyAllocation;