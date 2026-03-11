import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';


const CAN_CREATE = ['Admin', 'Thư kí biên tập'];


const AddBookModal = ({ onClose, onSuccess, currentUser }) => {
    const [papers, setPapers] = useState([]);
    const [form, setForm] = useState({
        name: '',
        bookCode: '',
        page: '',
        note: '',
        paper_id: '',
        assigned_by: currentUser?.employee?.id ?? '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/papers').then(res => {
            if (res.data.success) setPapers(res.data.data);
        }).catch(() => { });
    }, []);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async () => {
        if (!form.name.trim()) {
            setError('Tên sách không được để trống');
            return;
        }
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
            };
            await api.post('/books', payload);
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Tạo sách thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={modal.overlay} onClick={onClose}>
            <div style={modal.box} onClick={e => e.stopPropagation()}>
                <div style={modal.header}>
                    <h3 style={modal.title}>Tạo sách mới</h3>
                    <button style={modal.closeBtn} onClick={onClose}>✕</button>
                </div>

                {error && <div style={modal.error}>{error}</div>}

                <div style={modal.body}>
                    <div style={modal.field}>
                        <label style={modal.label}>Tên sách <span style={modal.required}>*</span></label>
                        <input name="name" value={form.name} onChange={handleChange}
                            style={modal.input} placeholder="Nhập tên sách" />
                    </div>

                    <div style={modal.field}>
                        <label style={modal.label}>Mã sách</label>
                        <input name="bookCode" value={form.bookCode} onChange={handleChange}
                            style={modal.input} placeholder="Có thể để trống" />
                    </div>

                    <div style={modal.field}>
                        <label style={modal.label}>Số trang ước tính</label>
                        <input name="page" type="number" value={form.page} onChange={handleChange}
                            style={modal.input} placeholder="Có thể để trống" min="1" />
                    </div>

                    <div style={modal.field}>
                        <label style={modal.label}>Loại giấy (Paper)</label>
                        <select name="paper_id" value={form.paper_id} onChange={handleChange} style={modal.input}>
                            <option value="">-- Chọn loại giấy --</option>
                            {papers.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.paperSize} (ID: {p.id})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Assigned by - lấy tự động từ session */}
                    <div style={modal.field}>
                        <label style={modal.label}>Người phụ trách</label>
                        <input
                            style={{ ...modal.input, backgroundColor: '#f5f5f5', color: '#888' }}
                            value={currentUser?.employee?.name ?? `Employee ID: ${form.assigned_by}`}
                            disabled
                        />
                    </div>

                    <div style={modal.field}>
                        <label style={modal.label}>Ghi chú</label>
                        <textarea name="note" value={form.note} onChange={handleChange}
                            style={{ ...modal.input, height: '80px', resize: 'vertical' }}
                            placeholder="Có thể để trống" />
                    </div>
                </div>

                <div style={modal.footer}>
                    <button style={modal.cancelBtn} onClick={onClose} disabled={submitting}>
                        Hủy
                    </button>
                    <button style={modal.submitBtn} onClick={handleSubmit} disabled={submitting}>
                        {submitting ? 'Đang lưu...' : 'Tạo sách'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const Books = () => {
    const { user } = useAuth();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);

    const canCreate = CAN_CREATE.includes(user?.position);

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const res = await api.get('/books');
            if (res.data.success) setBooks(res.data.data);
        } catch {
            setError('Không thể tải danh sách sách');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBooks(); }, []);

    const handleSuccess = () => {
        setShowModal(false);
        fetchBooks();
    };

    if (loading) return <div style={styles.center}>Đang tải...</div>;
    if (error) return <div style={styles.errorMsg}>{error}</div>;

    return (
        <div style={styles.wrapper}>
            {/* Header trang */}
            <div style={styles.pageHeader}>
                <div>
                    <h2 style={styles.title}>Quản lý sách</h2>
                    <span style={styles.count}>{books.length} cuốn sách</span>
                </div>
                {canCreate && (
                    <button style={styles.addBtn} onClick={() => setShowModal(true)}>
                        + Thêm sách
                    </button>
                )}
            </div>

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
                        </tr>
                    </thead>
                    <tbody>
                        {books.length === 0 ? (
                            <tr>
                                <td colSpan={8} style={styles.empty}>Chưa có sách nào</td>
                            </tr>
                        ) : books.map((book, index) => (
                            <tr key={book.id} style={index % 2 === 0 ? styles.trEven : styles.trOdd}>
                                <td style={styles.td}>{index + 1}</td>
                                <td style={{ ...styles.td, fontWeight: '600' }}>{book.name}</td>
                                <td style={styles.td}>{book.bookCode || '—'}</td>
                                <td style={styles.td}>{book.page || '—'}</td>
                                <td style={styles.td}>{book.paper?.paperSize || '—'}</td>
                                <td style={styles.td}>
                                    {book.categormies?.length > 0
                                        ? book.categories.map(c => (
                                            <span key={c.id} style={styles.tag}>{c.name}</span>
                                        ))
                                        : '—'
                                    }
                                </td>
                                {/* <td style={styles.td}>{book.assigned_employee?.name || '—'}</td>
                                <td style={styles.td}>
                                    <span style={getStatusBadge(book.status)}>
                                        {getStatusLabel(book.status)}
                                    </span>
                                </td> */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>


            {showModal && (
                <AddBookModal
                    onClose={() => setShowModal(false)}
                    onSuccess={handleSuccess}
                    currentUser={user}
                />
            )}
        </div>
    );
};



const STATUS_MAP = {
    0: { label: 'Đã hủy', bg: '#fff3e0', color: '#e65100' },
    1: { label: 'Đang thực hiện', bg: '#e3f2fd', color: '#1565c0' },
    2: { label: 'Chờ xử lý', bg: '#e8f5e9', color: '#2e7d32' },
    3: { label: 'Đã hủy', bg: '#fce8e6', color: '#c62828' },
};

const getStatusLabel = (s) => STATUS_MAP[s]?.label ?? `Status ${s}`;
const getStatusBadge = (s) => ({
    display: 'inline-block', padding: '3px 10px', borderRadius: '12px',
    fontSize: '12px', fontWeight: '600',
    backgroundColor: STATUS_MAP[s]?.bg ?? '#f5f5f5',
    color: STATUS_MAP[s]?.color ?? '#333',
});

const styles = {
    wrapper: { display: 'flex', flexDirection: 'column', gap: '16px' },
    pageHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' },
    title: { fontSize: '22px', fontWeight: '700', color: '#1a1a1a', margin: 0 },
    count: { fontSize: '14px', color: '#888' },
    addBtn: {
        padding: '9px 20px', backgroundColor: '#1877f2', color: 'white',
        border: 'none', borderRadius: '6px', fontSize: '14px',
        fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap',
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
    tag: { display: 'inline-block', padding: '2px 8px', backgroundColor: '#e8f0fe', color: '#1a73e8', borderRadius: '10px', fontSize: '12px', marginRight: '4px' },
    center: { textAlign: 'center', padding: '60px', color: '#888' },
    errorMsg: { textAlign: 'center', padding: '60px', color: '#c62828' },
    empty: { textAlign: 'center', padding: '40px', color: '#aaa' },
};

const modal = {
    overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
    box: { backgroundColor: 'white', borderRadius: '10px', width: '100%', maxWidth: '480px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 16px', borderBottom: '1px solid #f0f0f0' },
    title: { fontSize: '18px', fontWeight: '700', color: '#1a1a1a', margin: 0 },
    closeBtn: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#888', padding: '4px 8px' },
    body: { padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' },
    footer: { padding: '16px 24px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' },
    field: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '13px', fontWeight: '600', color: '#555' },
    required: { color: '#e53935' },
    input: { padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' },
    error: { margin: '0 24px 4px', padding: '10px 12px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '6px', fontSize: '13px' },
    cancelBtn: { padding: '9px 20px', backgroundColor: '#f5f5f5', color: '#333', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' },
    submitBtn: { padding: '9px 20px', backgroundColor: '#1877f2', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
};

export default Books;