import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
        marginBottom: '24px',
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
    filterTabs: {
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
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
    },
    filterTabActive: {
        backgroundColor: '#1877f2',
        color: 'white',
        borderColor: '#1877f2',
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
        cursor: 'pointer',
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
    actionButtons: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        marginTop: '8px',
        borderTop: '1px solid #eaeef2',
        paddingTop: '12px',
    },
    cancelBtn: {
        padding: '6px 16px',
        backgroundColor: 'white',
        color: '#c62828',
        border: '1px solid #ffcdd2',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    assignBtn: {
        padding: '6px 16px',
        backgroundColor: '#1877f2',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    adjustBtn: {
        padding: '6px 16px',
        backgroundColor: '#9c27b0',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    currentHolder: {
        marginTop: '8px',
        fontSize: '16px',
        color: '#333',
        fontWeight: '500',
        cursor: 'pointer',
        textDecorationColor: '#333',
        textUnderlineOffset: '2px',
        display: 'inline-block',
        ':hover': {
            color: '#1877f2',
            textDecorationColor: '#1877f2',
        }
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
};

const FILTERS = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: 'Chờ phân công', status: 2 },
    { key: 'in_progress', label: 'Đang thực hiện', status: 1 },
    { key: 'completed', label: 'Hoàn thành', status: 3 },
    { key: 'adjust', label: 'Điều chỉnh', status: 4 },
    { key: 'cancelled', label: 'Hủy', status: 0 },
];

const DepartmentBooks = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusMap, setStatusMap] = useState({});
    const [colorMap, setColorMap] = useState({});
    const [textColorMap, setTextColorMap] = useState({});
    const [departmentInfo, setDepartmentInfo] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');

    useEffect(() => {
        if (user?.employee?.department) {
            fetchBooks();
        } else {
            setError('Không tìm thấy thông tin phòng ban');
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (books.length > 0) {
            filterBooks();
        }
    }, [activeFilter, books]);

    const fetchBooks = async () => {
        const departmentName = user?.employee?.department;

        try {
            setLoading(true);
            const encodedName = encodeURIComponent(departmentName);
            const response = await api.get(`/books/department/name/${encodedName}`);

            if (response.data.success) {
                const booksData = response.data.data.books || [];

                console.log('=== RAW BOOKS DATA ===', booksData);
                booksData.forEach(book => {
                    console.log(`Book: ${book.name} | project_status: ${book.project_status} | transfer_count: ${book.transfer_count}`);
                });

                setBooks(booksData);
                setStatusMap(response.data.data.status_map || {});
                setColorMap(response.data.data.color_map || {});
                setTextColorMap(response.data.data.text_color_map || {});
                setDepartmentInfo(response.data.data.department);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const filterBooks = () => {
        if (activeFilter === 'all') {
            const sorted = [...books].sort((a, b) => {
                if (a.project_status === 0) return 1;
                if (b.project_status === 0) return -1;
                return 0;
            });
            setFilteredBooks(sorted);
        } else {
            const filter = FILTERS.find(f => f.key === activeFilter);
            const filtered = books.filter(book => book.project_status === filter.status);
            setFilteredBooks(filtered);
        }
    };

    const handleCancelProject = async (projectId, e) => {
        e.stopPropagation();

        if (!window.confirm('Bạn có chắc chắn muốn hủy dự án này?')) {
            return;
        }

        try {
            const response = await api.patch(`/books/projects/${projectId}/cancel`);

            if (response.data.success) {
                fetchBooks();
                alert('Hủy dự án thành công');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleCardClick = (book) => {
        navigate(`/books/${book.id}/transfers`);
    };

    const handleViewTransferDetail = (bookId, e) => {
        e.stopPropagation();
        navigate(`/books/${bookId}/transfers`);
    };

    const handleAssignClick = (projectId, bookId, e) => {
        e.stopPropagation();
        navigate(`/allocation/${projectId}`, {
            state: { bookId: bookId }
        });
    };

    const handleAdjustClick = (projectId, e) => {
        e.stopPropagation();
        alert('Tính năng điều chỉnh đang phát triển');
    };

    const getStatusStyle = (status) => ({
        backgroundColor: colorMap[status] || '#e0e0e0',
        color: textColorMap[status] || '#333',
    });

    const getStatusText = (status) => statusMap[status] || 'Không xác định';

    const calculateProgress = (book) => {
        if (!book.page || book.page === 0) return 0;
        return Math.round((book.current_page || 0) / book.page * 100);
    };

    const renderActionButtons = (book) => {
        if (book.project_status === 3 || book.project_status === 0) {
            return null;
        }

        if (book.project_status === 4) {
            return (
                <div style={styles.actionButtons}>
                    <button
                        style={styles.adjustBtn}
                        onClick={(e) => handleAdjustClick(book.project_id, e)}
                    >
                        Điều chỉnh
                    </button>
                </div>
            );
        }

        if (book.project_status === 2 || book.project_status === 1) {
            return (
                <div style={styles.actionButtons}>
                    {book.project_status === 2 && (
                        <button
                            style={styles.cancelBtn}
                            onClick={(e) => handleCancelProject(book.project_id, e)}
                        >
                            Hủy
                        </button>
                    )}
                    <button
                        style={styles.assignBtn}
                        onClick={(e) => handleAssignClick(book.project_id, book.id, e)}
                    >
                        Phân công
                    </button>
                </div>
            );
        }

        return null;
    };

    if (loading) {
        return <div style={styles.loading}>Đang tải danh sách sách...</div>;
    }

    if (error) {
        return <div style={{ ...styles.loading, color: '#c62828' }}>{error}</div>;
    }

    return (
        <div style={styles.wrapper}>
            <div style={styles.header}>
                <h1 style={styles.title}>Sách cần xử lý</h1>
                <div style={styles.deptInfo}>
                    {departmentInfo?.name || user?.employee?.department}
                </div>
            </div>

            {/* Filter tabs */}
            <div style={styles.filterTabs}>
                {FILTERS.map(filter => (
                    <button
                        key={filter.key}
                        style={{
                            ...styles.filterTab,
                            ...(activeFilter === filter.key ? styles.filterTabActive : {})
                        }}
                        onClick={() => setActiveFilter(filter.key)}
                    >
                        {filter.label} {filter.key !== 'all' && (
                            <span style={{ marginLeft: '4px', opacity: 0.8 }}>
                                ({books.filter(b => b.project_status === filter.status).length})
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Book grid */}
            {filteredBooks.length === 0 ? (
                <div style={styles.empty}>
                    Không có sách nào trong danh mục này
                </div>
            ) : (
                <div style={styles.bookGrid}>
                    {filteredBooks.map((book) => (
                        <div
                            key={book.id}
                            style={styles.card}
                            onClick={() => handleCardClick(book)}
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
                                {book.bookCode && (
                                    <span style={styles.bookCode}>#{book.bookCode}</span>
                                )}
                                <span style={{
                                    ...styles.statusBadge,
                                    ...getStatusStyle(book.project_status)
                                }}>
                                    {getStatusText(book.project_status)}
                                    {book.transfer_count >= 2 && book.project_status !== 3 && (
                                        <span style={{ marginLeft: '4px' }}>(Lần {book.transfer_count})</span>
                                    )}
                                </span>
                            </div>

                            <h3 style={styles.bookName}>{book.name}</h3>

                            <div style={styles.infoRow}>
                                <span style={styles.infoLabel}>Số trang:</span>
                                <span style={styles.infoValue}>{book.page || '—'}</span>
                            </div>

                            <div style={styles.infoRow}>
                                <span style={styles.infoLabel}>Khổ giấy:</span>
                                <span style={styles.infoValue}>{book.paper?.paperSize || '—'}</span>
                            </div>

                            {book.assignedEmployee && (
                                <div style={styles.infoRow}>
                                    <span style={styles.infoLabel}>Người phụ trách:</span>
                                    <span style={styles.infoValue}>{book.assignedEmployee.name}</span>
                                </div>
                            )}

                            {book.categories && book.categories.length > 0 && (
                                <div style={styles.infoRow}>
                                    <span style={styles.infoLabel}>Danh mục:</span>
                                    <span style={styles.infoValue}>
                                        {book.categories.map(c => c.name).join(', ')}
                                    </span>
                                </div>
                            )}

                            {book.page > 0 && (
                                <>
                                    <div style={styles.progressBar}>
                                        <div style={{
                                            ...styles.progressFill,
                                            width: `${calculateProgress(book)}%`
                                        }} />
                                    </div>
                                    <div style={styles.progressText}>
                                        Tiến độ: {book.current_page || 0}/{book.page} trang ({calculateProgress(book)}%)
                                    </div>
                                </>
                            )}

                            {/* Dòng "Đang xử lý ở" - click vào cũng vào BookTransferDetail */}
                            {book.current_holder_department && (
                                <div
                                    style={styles.currentHolder}
                                    onClick={(e) => handleViewTransferDetail(book.id, e)}
                                >
                                    Đang xử lý ở: {book.current_holder_department}
                                </div>
                            )}

                            {renderActionButtons(book)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DepartmentBooks;