import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CAN_MANAGE = ['Admin', 'Thư kí biên tập'];

const STATUS_OPTIONS = [
    { value: '', label: 'Tất cả' },
    { value: '1', label: 'Đang thực hiện' },
    { value: '2', label: 'Đợi phân công' },
    { value: '3', label: 'Hoàn thành' },
    { value: '0', label: 'Đã hủy' },
    { value: '4', label: 'Chỉnh sửa' },
];

const STATUS_MAP = {
    0: { label: 'Đã hủy', bg: '#fce8e6', color: '#c62828' },
    1: { label: 'Đang thực hiện', bg: '#e3f2fd', color: '#1565c0' },
    2: { label: 'Đợi phân công', bg: '#fff8e1', color: '#f57f17' },
    3: { label: 'Hoàn thành', bg: '#e6f4ea', color: '#2e7d32' },
    4: { label: 'Chỉnh sửa', bg: '#f3e5f5', color: '#6a1b9a' },
};


const BookModal = ({ onClose, onSuccess, book = null, currentUser }) => {
    const isEdit = !!book;
    const [papers, setPapers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        name: book?.name ?? '',
        bookCode: book?.bookCode ?? '',
        page: book?.page ?? '',
        note: book?.note ?? '',
        paper_id: String(book?.paper_id ?? ''),
        assigned_by: currentUser?.employee?.id ?? '',
        categories: book?.categories?.map(c => c.id) ?? [],
    });

    useEffect(() => {
        Promise.all([
            api.get('/papers/active'),
            api.get('/book-categories/active'),
        ]).then(([paperRes, catRes]) => {
            if (paperRes.data.success) setPapers(paperRes.data.data);
            if (catRes.data.success) setCategories(catRes.data.data);
        }).catch(() => setError('Không thể tải dữ liệu'));
    }, []);

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const toggleCategory = (id) => {
        setForm(prev => ({
            ...prev,
            categories: prev.categories.includes(id)
                ? prev.categories.filter(c => c !== id)
                : [...prev.categories, id],
        }));
    };

    const handleSubmit = async () => {
        if (!form.name.trim()) return setError('Tên sách không được để trống');
        setSubmitting(true);
        setError('');
        try {
            const payload = {
                name: form.name.trim(),
                bookCode: form.bookCode.trim() || null,
                page: form.page ? parseInt(form.page) : null,
                note: form.note.trim() || null,
                paper_id: form.paper_id ? parseInt(form.paper_id) : null,
                assigned_by: form.assigned_by ? parseInt(form.assigned_by) : null,
                categories: form.categories,
            };
            if (isEdit) await api.put(`/books/${book.id}`, payload);
            else await api.post('/books', payload);
            onSuccess();
        } catch (err) {
            const errs = err.response?.data?.errors;
            setError(errs
                ? Object.values(errs).flat().join(' | ')
                : err.response?.data?.message || 'Thao tác thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={modal.overlay}>
            <div style={modal.box} onClick={e => e.stopPropagation()}>
                <div style={modal.header}>
                    <h3 style={modal.title}>{isEdit ? `Cập nhật: ${book.name}` : 'Thêm sách mới'}</h3>
                    <button style={modal.closeBtn} onClick={onClose}>✕</button>
                </div>

                {error && <div style={modal.error}>{error}</div>}

                <div style={modal.body}>

                    <div style={modal.field}>
                        <label style={modal.label}>Tên sách <span style={modal.req}>*</span></label>
                        <input name="name" value={form.name} onChange={handleChange}
                            style={modal.input} placeholder="Nhập tên sách" />
                    </div>

                    <div style={modal.row}>
                        <div style={modal.field}>
                            <label style={modal.label}>Mã sách</label>
                            <input name="bookCode" value={form.bookCode} onChange={handleChange}
                                style={modal.input} placeholder="Có thể để trống" />
                        </div>
                        <div style={modal.field}>
                            <label style={modal.label}>Số trang ước tính</label>
                            <input name="page" type="number" min="1" value={form.page}
                                onChange={handleChange} style={modal.input} placeholder="Có thể để trống" />
                        </div>
                    </div>

                    <div style={modal.row}>
                        <div style={modal.field}>
                            <label style={modal.label}>Loại giấy</label>
                            <select name="paper_id" value={form.paper_id} onChange={handleChange} style={modal.input}>
                                <option value="">-- Chọn loại giấy --</option>
                                {papers.map(p => (
                                    <option key={p.id} value={p.id}>{p.paperSize}</option>
                                ))}
                            </select>
                        </div>
                        <div style={modal.field}>
                            <label style={modal.label}>Người phụ trách</label>
                            <input
                                style={{ ...modal.input, backgroundColor: '#f5f5f5', color: '#888' }}
                                value={currentUser?.employee?.name ?? `Employee ID: ${form.assigned_by}`}
                                disabled
                            />
                        </div>
                    </div>

                    <div style={modal.field}>
                        <label style={modal.label}>Danh mục</label>
                        <div style={modal.catBox}>
                            {categories.length === 0
                                ? <span style={{ fontSize: '13px', color: '#aaa' }}>Không có danh mục</span>
                                : categories.map(c => (
                                    <label key={c.id} style={modal.catItem}>
                                        <input
                                            type="checkbox"
                                            checked={form.categories.includes(c.id)}
                                            onChange={() => toggleCategory(c.id)}
                                            style={{ marginRight: '7px', cursor: 'pointer' }}
                                        />
                                        {c.name}
                                    </label>
                                ))
                            }
                        </div>
                    </div>

                    {/* Ghi chú */}
                    <div style={modal.field}>
                        <label style={modal.label}>Ghi chú</label>
                        <textarea name="note" value={form.note} onChange={handleChange}
                            style={{ ...modal.input, height: '80px', resize: 'vertical' }}
                            placeholder="Có thể để trống" />
                    </div>
                </div>

                <div style={modal.footer}>
                    <button style={modal.cancelBtn} onClick={onClose} disabled={submitting}>Hủy</button>
                    <button style={modal.submitBtn} onClick={handleSubmit} disabled={submitting}>
                        {submitting ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Thêm sách'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Trang chính Books
const Books = () => {
    const { user } = useAuth();
    const canManage = CAN_MANAGE.includes(user?.position);

    const [books, setBooks] = useState([]);
    const [allBooks, setAllBooks] = useState([]);
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [editBook, setEditBook] = useState(null);

    const [keyword, setKeyword] = useState('');
    const [paperFilter, setPaperFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState(null);

    const PER_PAGE = 15;

    useEffect(() => {
        api.get('/papers/active').then(res => {
            if (res.data.success) setPapers(res.data.data);
        }).catch(() => { });

        api.get('/books').then(res => {
            if (res.data.success) setAllBooks(res.data.data);
        }).catch(() => { });
    }, []);

    const filtersRef = useRef({ keyword, paperFilter, statusFilter });
    useEffect(() => { filtersRef.current = { keyword, paperFilter, statusFilter }; });

    const fetchBooks = async (p = 1, overrideStatus = null) => {
        setLoading(true);
        setError('');
        try {
            const currentStatus = overrideStatus !== null ? overrideStatus : filtersRef.current.statusFilter;
            const { keyword, paperFilter } = filtersRef.current;

            const params = new URLSearchParams();
            if (keyword) params.set('name', keyword);
            if (paperFilter) params.set('paperSize', paperFilter);
            if (currentStatus !== '') params.set('status', currentStatus);
            params.set('per_page', PER_PAGE);
            params.set('page', p);

            const res = await api.get(`/books/search?${params.toString()}`);
            if (res.data.success) {
                const raw = res.data.data;
                if (raw && Array.isArray(raw.data)) {
                    setBooks(raw.data);
                    setMeta(raw.meta ?? res.data.meta ?? { last_page: raw.last_page, current_page: raw.current_page } ?? null);
                } else if (Array.isArray(raw)) {
                    setBooks(raw);
                    setMeta(res.data.meta ?? null);
                } else {
                    setBooks([]);
                }
                setPage(p);
            }
        } catch {
            setError('Không thể tải danh sách sách');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBooks(1, statusFilter); }, [statusFilter]);

    const handleSuccess = () => {
        setShowAdd(false);
        setEditBook(null);
        fetchBooks(page);
        api.get('/books').then(res => {
            if (res.data.success) setAllBooks(res.data.data);
        });
    };

    const activeCount = allBooks.filter(b => b.status === 1).length;

    return (
        <div style={styles.wrapper}>

            <div style={styles.pageHeader}>
                <div>
                    <div style={styles.titleRow}>
                        <h2 style={styles.title}>Quản lý sách</h2>
                        <span style={styles.count}>{activeCount} đang thực hiện</span>
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
                            placeholder="Tìm tên sách / mã sách"
                            value={keyword}
                            onChange={e => setKeyword(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && fetchBooks(1)}
                        />
                        <select
                            style={styles.selectInput}
                            value={paperFilter}
                            onChange={e => setPaperFilter(e.target.value)}
                        >
                            <option value="">Tất cả loại giấy</option>
                            {papers.map(p => (
                                <option key={p.id} value={p.paperSize}>{p.paperSize}</option>
                            ))}
                        </select>
                        <button style={styles.searchBtn} onClick={() => fetchBooks(1)}>
                            Tìm kiếm
                        </button>
                    </div>

                    <div style={{ width: '1px', height: '32px', backgroundColor: '#e0e0e0', margin: '0 8px' }} />

                    {canManage && (
                        <button style={styles.addBtn} onClick={() => setShowAdd(true)}>
                            + Thêm sách
                        </button>
                    )}
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
                                <th style={styles.th}>Tên sách</th>
                                <th style={styles.th}>Mã sách</th>
                                <th style={styles.th}>Số trang</th>
                                <th style={styles.th}>Loại giấy</th>
                                <th style={styles.th}>Danh mục</th>
                                <th style={styles.th}>Trạng thái</th>
                                <th style={styles.th}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {books.length === 0 ? (
                                <tr><td colSpan={8} style={styles.empty}>Không có sách nào</td></tr>
                            ) : books.map((book, index) => {
                                const statusInfo = STATUS_MAP[book.status];
                                return (
                                    <tr key={book.id} style={index % 2 === 0 ? styles.trEven : styles.trOdd}>
                                        <td style={styles.td}>{(page - 1) * PER_PAGE + index + 1}</td>
                                        <td style={{ ...styles.td, fontWeight: '600' }}>{book.name}</td>
                                        <td style={styles.td}>{book.bookCode || '—'}</td>
                                        <td style={styles.td}>{book.page || '—'}</td>
                                        <td style={styles.td}>{book.paper?.paperSize || '—'}</td>
                                        <td style={styles.td}>
                                            {book.categories?.length > 0
                                                ? book.categories.map(c => c.name).join(', ')
                                                : '—'
                                            }
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '3px 10px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                backgroundColor: statusInfo?.bg ?? '#f5f5f5',
                                                color: statusInfo?.color ?? '#333',
                                            }}>
                                                {statusInfo?.label ?? `Status ${book.status}`}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            {canManage && (
                                                <button style={styles.editBtn} onClick={() => setEditBook(book)}>
                                                    Cập nhật
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {meta && meta.last_page > 1 && (
                        <div style={styles.pagination}>
                            <button style={styles.pageBtn} disabled={page <= 1} onClick={() => fetchBooks(page - 1)}>←</button>
                            <span style={styles.pageInfo}>Trang {page} / {meta.last_page}</span>
                            <button style={styles.pageBtn} disabled={page >= meta.last_page} onClick={() => fetchBooks(page + 1)}>→</button>
                        </div>
                    )}
                </div>
            )}

            {showAdd && (
                <BookModal
                    onClose={() => setShowAdd(false)}
                    onSuccess={handleSuccess}
                    currentUser={user}
                />
            )}
            {editBook && (
                <BookModal
                    book={editBook}
                    onClose={() => setEditBook(null)}
                    onSuccess={handleSuccess}
                    currentUser={user}
                />
            )}
        </div>
    );
};


const styles = {
    wrapper: { display: 'flex', flexDirection: 'column', gap: '16px' },
    pageHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' },
    titleRow: { display: 'flex', alignItems: 'center', gap: '10px' },
    title: { fontSize: '22px', fontWeight: '700', color: '#1a1a1a', margin: 0 },
    count: { fontSize: '18px', color: '#555', backgroundColor: '#f0f0f0', padding: '2px 10px', borderRadius: '10px', fontWeight: '500' },
    statusRow: { display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' },
    statusBtn: { padding: '5px 14px', backgroundColor: '#fff', color: '#555', border: '1px solid #d0d0d0', borderRadius: '20px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
    statusBtnActive: { padding: '5px 14px', backgroundColor: '#1877f2', color: '#fff', border: '1px solid #1877f2', borderRadius: '20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    actions: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginLeft: 'auto' },
    searchGroup: { display: 'flex', gap: '8px', alignItems: 'center' },
    searchInput: { padding: '9px 14px', border: '1px solid #d0d0d0', borderRadius: '8px', fontSize: '14px', outline: 'none', width: '200px' },
    selectInput: { padding: '9px 14px', border: '1px solid #d0d0d0', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' },
    searchBtn: { padding: '9px 16px', backgroundColor: '#f5f5f5', color: '#333', border: '1px solid #d0d0d0', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
    addBtn: { padding: '9px 18px', backgroundColor: '#1877f2', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' },
    editBtn: { padding: '5px 12px', backgroundColor: '#f5f5f5', color: '#333', border: '1px solid #d0d0d0', borderRadius: '6px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
    tableWrapper: { backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
    thead: { backgroundColor: '#f5f7fa' },
    th: { padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#555', borderBottom: '1px solid #e8e8e8', whiteSpace: 'nowrap' },
    td: { padding: '12px 16px', color: '#333', borderBottom: '1px solid #f0f0f0' },
    trEven: { backgroundColor: '#ffffff' },
    trOdd: { backgroundColor: '#fafafa' },
    empty: { textAlign: 'center', padding: '40px', color: '#aaa' },
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
    catBox: {
        border: '1px solid #ddd', borderRadius: '6px', padding: '10px 12px',
        display: 'flex', flexWrap: 'wrap', gap: '8px',
        maxHeight: '120px', overflowY: 'auto',
    },
    catItem: {
        display: 'flex', alignItems: 'center', fontSize: '13px', color: '#333',
        cursor: 'pointer', padding: '3px 8px', borderRadius: '4px',
        backgroundColor: '#f5f5f5', userSelect: 'none',
    },
};

export default Books;