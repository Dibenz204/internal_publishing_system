// import React, { useState, useEffect, useRef } from 'react';
// import { useAuth } from '../context/AuthContext';
// import api from '../services/api';

// const CAN_MANAGE = ['Admin', 'Thư kí biên tập'];

// const STATUS_OPTIONS = [
//     { value: '', label: 'Tất cả' },
//     { value: '1', label: 'Đang thực hiện' },
//     { value: '2', label: 'Đợi phân công' },
//     { value: '3', label: 'Hoàn thành' },
//     { value: '0', label: 'Đã hủy' },
//     { value: '4', label: 'Chỉnh sửa' },
// ];

// const STATUS_MAP = {
//     0: { label: 'Đã hủy', bg: '#fce8e6', color: '#c62828' },
//     1: { label: 'Đang thực hiện', bg: '#e3f2fd', color: '#1565c0' },
//     2: { label: 'Đợi phân công', bg: '#fff8e1', color: '#f57f17' },
//     3: { label: 'Hoàn thành', bg: '#e6f4ea', color: '#2e7d32' },
//     4: { label: 'Chỉnh sửa', bg: '#f3e5f5', color: '#6a1b9a' },
// };


// const BookModal = ({ onClose, onSuccess, book = null, currentUser }) => {
//     const isEdit = !!book;
//     const [papers, setPapers] = useState([]);
//     const [categories, setCategories] = useState([]);
//     const [submitting, setSubmitting] = useState(false);
//     const [error, setError] = useState('');
//     const [form, setForm] = useState({
//         name: book?.name ?? '',
//         bookCode: book?.bookCode ?? '',
//         page: book?.page ?? '',
//         note: book?.note ?? '',
//         paper_id: String(book?.paper_id ?? ''),
//         assigned_by: currentUser?.employee?.id ?? '',
//         categories: book?.categories?.map(c => c.id) ?? [],
//     });

//     useEffect(() => {
//         Promise.all([
//             api.get('/papers/active'),
//             api.get('/book-categories/active'),
//         ]).then(([paperRes, catRes]) => {
//             if (paperRes.data.success) setPapers(paperRes.data.data);
//             if (catRes.data.success) setCategories(catRes.data.data);
//         }).catch(() => setError('Không thể tải dữ liệu'));
//     }, []);

//     const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

//     const toggleCategory = (id) => {
//         setForm(prev => ({
//             ...prev,
//             categories: prev.categories.includes(id)
//                 ? prev.categories.filter(c => c !== id)
//                 : [...prev.categories, id],
//         }));
//     };

//     const handleSubmit = async () => {
//         if (!form.name.trim()) return setError('Tên sách không được để trống');
//         setSubmitting(true);
//         setError('');
//         try {
//             const payload = {
//                 name: form.name.trim(),
//                 bookCode: form.bookCode.trim() || null,
//                 page: form.page ? parseInt(form.page) : null,
//                 note: form.note.trim() || null,
//                 paper_id: form.paper_id ? parseInt(form.paper_id) : null,
//                 assigned_by: form.assigned_by ? parseInt(form.assigned_by) : null,
//                 categories: form.categories,
//             };
//             if (isEdit) await api.put(`/books/${book.id}`, payload);
//             else await api.post('/books', payload);
//             onSuccess();
//         } catch (err) {
//             const errs = err.response?.data?.errors;
//             setError(errs
//                 ? Object.values(errs).flat().join(' | ')
//                 : err.response?.data?.message || 'Thao tác thất bại');
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     return (
//         <div style={modal.overlay}>
//             <div style={modal.box} onClick={e => e.stopPropagation()}>
//                 <div style={modal.header}>
//                     <h3 style={modal.title}>{isEdit ? `Cập nhật: ${book.name}` : 'Thêm sách mới'}</h3>
//                     <button style={modal.closeBtn} onClick={onClose}>✕</button>
//                 </div>

//                 {error && <div style={modal.error}>{error}</div>}

//                 <div style={modal.body}>

//                     <div style={modal.field}>
//                         <label style={modal.label}>Tên sách <span style={modal.req}>*</span></label>
//                         <input name="name" value={form.name} onChange={handleChange}
//                             style={modal.input} placeholder="Nhập tên sách" />
//                     </div>

//                     <div style={modal.row}>
//                         <div style={modal.field}>
//                             <label style={modal.label}>Mã sách</label>
//                             <input name="bookCode" value={form.bookCode} onChange={handleChange}
//                                 style={modal.input} placeholder="Có thể để trống" />
//                         </div>
//                         <div style={modal.field}>
//                             <label style={modal.label}>Số trang ước tính</label>
//                             <input name="page" type="number" min="1" value={form.page}
//                                 onChange={handleChange} style={modal.input} placeholder="Có thể để trống" />
//                         </div>
//                     </div>

//                     <div style={modal.row}>
//                         <div style={modal.field}>
//                             <label style={modal.label}>Loại giấy</label>
//                             <select name="paper_id" value={form.paper_id} onChange={handleChange} style={modal.input}>
//                                 <option value="">-- Chọn loại giấy --</option>
//                                 {papers.map(p => (
//                                     <option key={p.id} value={p.id}>{p.paperSize}</option>
//                                 ))}
//                             </select>
//                         </div>
//                         <div style={modal.field}>
//                             <label style={modal.label}>Người phụ trách</label>
//                             <input
//                                 style={{ ...modal.input, backgroundColor: '#f5f5f5', color: '#888' }}
//                                 value={currentUser?.employee?.name ?? `Employee ID: ${form.assigned_by}`}
//                                 disabled
//                             />
//                         </div>
//                     </div>

//                     <div style={modal.field}>
//                         <label style={modal.label}>Danh mục</label>
//                         <div style={modal.catBox}>
//                             {categories.length === 0
//                                 ? <span style={{ fontSize: '13px', color: '#aaa' }}>Không có danh mục</span>
//                                 : categories.map(c => (
//                                     <label key={c.id} style={modal.catItem}>
//                                         <input
//                                             type="checkbox"
//                                             checked={form.categories.includes(c.id)}
//                                             onChange={() => toggleCategory(c.id)}
//                                             style={{ marginRight: '7px', cursor: 'pointer' }}
//                                         />
//                                         {c.name}
//                                     </label>
//                                 ))
//                             }
//                         </div>
//                     </div>

//                     {/* Ghi chú */}
//                     <div style={modal.field}>
//                         <label style={modal.label}>Ghi chú</label>
//                         <textarea name="note" value={form.note} onChange={handleChange}
//                             style={{ ...modal.input, height: '80px', resize: 'vertical' }}
//                             placeholder="Có thể để trống" />
//                     </div>
//                 </div>

//                 <div style={modal.footer}>
//                     <button style={modal.cancelBtn} onClick={onClose} disabled={submitting}>Hủy</button>
//                     <button style={modal.submitBtn} onClick={handleSubmit} disabled={submitting}>
//                         {submitting ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Thêm sách'}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// // Trang chính Books
// const Books = () => {
//     const { user } = useAuth();
//     const canManage = CAN_MANAGE.includes(user?.position);

//     const [books, setBooks] = useState([]);
//     const [allBooks, setAllBooks] = useState([]);
//     const [papers, setPapers] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [showAdd, setShowAdd] = useState(false);
//     const [editBook, setEditBook] = useState(null);

//     const [keyword, setKeyword] = useState('');
//     const [paperFilter, setPaperFilter] = useState('');
//     const [statusFilter, setStatusFilter] = useState('');
//     const [page, setPage] = useState(1);
//     const [meta, setMeta] = useState(null);

//     const PER_PAGE = 15;

//     useEffect(() => {
//         api.get('/papers/active').then(res => {
//             if (res.data.success) setPapers(res.data.data);
//         }).catch(() => { });

//         api.get('/books').then(res => {
//             if (res.data.success) setAllBooks(res.data.data);
//         }).catch(() => { });
//     }, []);

//     const filtersRef = useRef({ keyword, paperFilter, statusFilter });
//     useEffect(() => { filtersRef.current = { keyword, paperFilter, statusFilter }; });

//     const fetchBooks = async (p = 1, overrideStatus = null) => {
//         setLoading(true);
//         setError('');
//         try {
//             const currentStatus = overrideStatus !== null ? overrideStatus : filtersRef.current.statusFilter;
//             const { keyword, paperFilter } = filtersRef.current;

//             const params = new URLSearchParams();
//             if (keyword) params.set('name', keyword);
//             if (paperFilter) params.set('paperSize', paperFilter);
//             if (currentStatus !== '') params.set('status', currentStatus);
//             params.set('per_page', PER_PAGE);
//             params.set('page', p);

//             const res = await api.get(`/books/search?${params.toString()}`);
//             if (res.data.success) {
//                 const raw = res.data.data;
//                 if (raw && Array.isArray(raw.data)) {
//                     setBooks(raw.data);
//                     setMeta(raw.meta ?? res.data.meta ?? { last_page: raw.last_page, current_page: raw.current_page } ?? null);
//                 } else if (Array.isArray(raw)) {
//                     setBooks(raw);
//                     setMeta(res.data.meta ?? null);
//                 } else {
//                     setBooks([]);
//                 }
//                 setPage(p);
//             }
//         } catch {
//             setError('Không thể tải danh sách sách');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => { fetchBooks(1, statusFilter); }, [statusFilter]);

//     const handleSuccess = () => {
//         setShowAdd(false);
//         setEditBook(null);
//         fetchBooks(page);
//         api.get('/books').then(res => {
//             if (res.data.success) setAllBooks(res.data.data);
//         });
//     };

//     const activeCount = allBooks.filter(b => b.status === 1).length;

//     return (
//         <div style={styles.wrapper}>

//             <div style={styles.pageHeader}>
//                 <div>
//                     <div style={styles.titleRow}>
//                         <h2 style={styles.title}>Quản lý sách</h2>
//                         <span style={styles.count}>{activeCount} đang thực hiện</span>
//                     </div>
//                     <div style={styles.statusRow}>
//                         {STATUS_OPTIONS.map(opt => (
//                             <button
//                                 key={opt.value}
//                                 style={statusFilter === opt.value ? styles.statusBtnActive : styles.statusBtn}
//                                 onClick={() => setStatusFilter(opt.value)}
//                             >
//                                 {opt.label}
//                             </button>
//                         ))}
//                     </div>
//                 </div>

//                 <div style={styles.actions}>
//                     <div style={styles.searchGroup}>
//                         <input
//                             style={styles.searchInput}
//                             placeholder="Tìm tên sách / mã sách"
//                             value={keyword}
//                             onChange={e => setKeyword(e.target.value)}
//                             onKeyDown={e => e.key === 'Enter' && fetchBooks(1)}
//                         />
//                         <select
//                             style={styles.selectInput}
//                             value={paperFilter}
//                             onChange={e => setPaperFilter(e.target.value)}
//                         >
//                             <option value="">Tất cả loại giấy</option>
//                             {papers.map(p => (
//                                 <option key={p.id} value={p.paperSize}>{p.paperSize}</option>
//                             ))}
//                         </select>
//                         <button style={styles.searchBtn} onClick={() => fetchBooks(1)}>
//                             Tìm kiếm
//                         </button>
//                     </div>

//                     <div style={{ width: '1px', height: '32px', backgroundColor: '#e0e0e0', margin: '0 8px' }} />

//                     {canManage && (
//                         <button style={styles.addBtn} onClick={() => setShowAdd(true)}>
//                             + Thêm sách
//                         </button>
//                     )}
//                 </div>
//             </div>


//             {loading ? (
//                 <div style={styles.center}>Đang tải...</div>
//             ) : error ? (
//                 <div style={styles.errorMsg}>{error}</div>
//             ) : (
//                 <div style={styles.tableWrapper}>
//                     <table style={styles.table}>
//                         <thead>
//                             <tr style={styles.thead}>
//                                 <th style={styles.th}>#</th>
//                                 <th style={styles.th}>Tên sách</th>
//                                 <th style={styles.th}>Mã sách</th>
//                                 <th style={styles.th}>Số trang</th>
//                                 <th style={styles.th}>Loại giấy</th>
//                                 <th style={styles.th}>Danh mục</th>
//                                 <th style={styles.th}>Trạng thái</th>
//                                 <th style={styles.th}></th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {books.length === 0 ? (
//                                 <tr><td colSpan={8} style={styles.empty}>Không có sách nào</td></tr>
//                             ) : books.map((book, index) => {
//                                 const statusInfo = STATUS_MAP[book.status];
//                                 return (
//                                     <tr key={book.id} style={index % 2 === 0 ? styles.trEven : styles.trOdd}>
//                                         <td style={styles.td}>{(page - 1) * PER_PAGE + index + 1}</td>
//                                         <td style={{ ...styles.td, fontWeight: '600' }}>{book.name}</td>
//                                         <td style={styles.td}>{book.bookCode || '—'}</td>
//                                         <td style={styles.td}>{book.page || '—'}</td>
//                                         <td style={styles.td}>{book.paper?.paperSize || '—'}</td>
//                                         <td style={styles.td}>
//                                             {book.categories?.length > 0
//                                                 ? book.categories.map(c => c.name).join(', ')
//                                                 : '—'
//                                             }
//                                         </td>
//                                         <td style={styles.td}>
//                                             <span style={{
//                                                 display: 'inline-block',
//                                                 padding: '3px 10px',
//                                                 borderRadius: '12px',
//                                                 fontSize: '12px',
//                                                 fontWeight: '600',
//                                                 backgroundColor: statusInfo?.bg ?? '#f5f5f5',
//                                                 color: statusInfo?.color ?? '#333',
//                                             }}>
//                                                 {statusInfo?.label ?? `Status ${book.status}`}
//                                             </span>
//                                         </td>
//                                         <td style={styles.td}>
//                                             {canManage && (
//                                                 <button style={styles.editBtn} onClick={() => setEditBook(book)}>
//                                                     Cập nhật
//                                                 </button>
//                                             )}
//                                         </td>
//                                     </tr>
//                                 );
//                             })}
//                         </tbody>
//                     </table>

//                     {meta && meta.last_page > 1 && (
//                         <div style={styles.pagination}>
//                             <button style={styles.pageBtn} disabled={page <= 1} onClick={() => fetchBooks(page - 1)}>←</button>
//                             <span style={styles.pageInfo}>Trang {page} / {meta.last_page}</span>
//                             <button style={styles.pageBtn} disabled={page >= meta.last_page} onClick={() => fetchBooks(page + 1)}>→</button>
//                         </div>
//                     )}
//                 </div>
//             )}

//             {showAdd && (
//                 <BookModal
//                     onClose={() => setShowAdd(false)}
//                     onSuccess={handleSuccess}
//                     currentUser={user}
//                 />
//             )}
//             {editBook && (
//                 <BookModal
//                     book={editBook}
//                     onClose={() => setEditBook(null)}
//                     onSuccess={handleSuccess}
//                     currentUser={user}
//                 />
//             )}
//         </div>
//     );
// };


// const styles = {
//     wrapper: { display: 'flex', flexDirection: 'column', gap: '16px' },
//     pageHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' },
//     titleRow: { display: 'flex', alignItems: 'center', gap: '10px' },
//     title: { fontSize: '22px', fontWeight: '700', color: '#1a1a1a', margin: 0 },
//     count: { fontSize: '18px', color: '#555', backgroundColor: '#f0f0f0', padding: '2px 10px', borderRadius: '10px', fontWeight: '500' },
//     statusRow: { display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' },
//     statusBtn: { padding: '5px 14px', backgroundColor: '#fff', color: '#555', border: '1px solid #d0d0d0', borderRadius: '20px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
//     statusBtnActive: { padding: '5px 14px', backgroundColor: '#1877f2', color: '#fff', border: '1px solid #1877f2', borderRadius: '20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
//     actions: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginLeft: 'auto' },
//     searchGroup: { display: 'flex', gap: '8px', alignItems: 'center' },
//     searchInput: { padding: '9px 14px', border: '1px solid #d0d0d0', borderRadius: '8px', fontSize: '14px', outline: 'none', width: '200px' },
//     selectInput: { padding: '9px 14px', border: '1px solid #d0d0d0', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' },
//     searchBtn: { padding: '9px 16px', backgroundColor: '#f5f5f5', color: '#333', border: '1px solid #d0d0d0', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
//     addBtn: { padding: '9px 18px', backgroundColor: '#1877f2', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' },
//     editBtn: { padding: '5px 12px', backgroundColor: '#f5f5f5', color: '#333', border: '1px solid #d0d0d0', borderRadius: '6px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
//     tableWrapper: { backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'auto' },
//     table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
//     thead: { backgroundColor: '#f5f7fa' },
//     th: { padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#555', borderBottom: '1px solid #e8e8e8', whiteSpace: 'nowrap' },
//     td: { padding: '12px 16px', color: '#333', borderBottom: '1px solid #f0f0f0' },
//     trEven: { backgroundColor: '#ffffff' },
//     trOdd: { backgroundColor: '#fafafa' },
//     empty: { textAlign: 'center', padding: '40px', color: '#aaa' },
//     pagination: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px' },
//     pageBtn: { padding: '6px 14px', border: '1px solid #d0d0d0', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px' },
//     pageInfo: { fontSize: '14px', color: '#555' },
//     center: { textAlign: 'center', padding: '60px', color: '#888' },
//     errorMsg: { textAlign: 'center', padding: '60px', color: '#c62828' },
// };

// const modal = {
//     overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
//     box: { backgroundColor: 'white', borderRadius: '10px', width: '100%', maxWidth: '560px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' },
//     header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 16px', borderBottom: '1px solid #f0f0f0' },
//     title: { fontSize: '18px', fontWeight: '700', color: '#1a1a1a', margin: 0 },
//     closeBtn: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#888', padding: '4px 8px' },
//     body: { padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' },
//     footer: { padding: '16px 24px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' },
//     row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
//     field: { display: 'flex', flexDirection: 'column', gap: '6px' },
//     label: { fontSize: '13px', fontWeight: '600', color: '#555' },
//     req: { color: '#e53935' },
//     input: { padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' },
//     error: { margin: '0 24px 4px', padding: '10px 12px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '6px', fontSize: '13px' },
//     cancelBtn: { padding: '9px 20px', backgroundColor: '#f5f5f5', color: '#333', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' },
//     submitBtn: { padding: '9px 20px', backgroundColor: '#1877f2', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
//     catBox: {
//         border: '1px solid #ddd', borderRadius: '6px', padding: '10px 12px',
//         display: 'flex', flexWrap: 'wrap', gap: '8px',
//         maxHeight: '120px', overflowY: 'auto',
//     },
//     catItem: {
//         display: 'flex', alignItems: 'center', fontSize: '13px', color: '#333',
//         cursor: 'pointer', padding: '3px 8px', borderRadius: '4px',
//         backgroundColor: '#f5f5f5', userSelect: 'none',
//     },
// };

// export default Books;

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// ─────────────────────────────────────────────
// PHÂN QUYỀN
// CAN_MANAGE: xem tất cả status + Cập nhật / Phân công / Theo dõi
// CAN_VIEW_ALL: xem tất cả status, chỉ có nút Chi tiết
// TODO: thêm role vào CAN_VIEW_ALL nếu muốn cho xem tất cả nhưng không chỉnh sửa
// Còn lại: chỉ xem status=3, chỉ có nút Chi tiết
// ─────────────────────────────────────────────
const CAN_MANAGE = ['Admin', 'Thư kí biên tập'];
const CAN_VIEW_ALL = [];

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

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';

// ─────────────────────────────────────────────
// MODAL: THÊM / CẬP NHẬT SÁCH
// Khi thêm mới: layout 2 cột — trái form sách, phải phân công phòng ban
// Khi cập nhật: layout 1 cột như cũ
// ─────────────────────────────────────────────
const BookModal = ({ onClose, onSuccess, book = null, currentUser }) => {
    const isEdit = !!book;
    const [papers, setPapers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [allDepts, setAllDepts] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [createdBook, setCreatedBook] = useState(null); // book vừa tạo xong để phân công
    const [selectedDeptIds, setSelectedDeptIds] = useState([]);
    const [description, setDescription] = useState('');
    const [assigning, setAssigning] = useState(false);
    const [assignError, setAssignError] = useState('');
    const [assignedDepts, setAssignedDepts] = useState([]);

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
        const requests = [
            api.get('/papers/active'),
            api.get('/book-categories/active'),
        ];
        if (!isEdit) requests.push(api.get('/departments').catch(() => ({ data: { data: [] } })));

        Promise.all(requests).then(([paperRes, catRes, deptRes]) => {
            if (paperRes.data.success) setPapers(paperRes.data.data);
            if (catRes.data.success) setCategories(catRes.data.data);
            if (deptRes) {
                const d = (deptRes.data?.data ?? []).filter(dep => dep.status === 1);
                setAllDepts(Array.isArray(d) ? d : []);
            }
        }).catch(() => setError('Không thể tải dữ liệu'));
    }, []);

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const toggleCategory = (id) => setForm(prev => ({
        ...prev,
        categories: prev.categories.includes(id)
            ? prev.categories.filter(c => c !== id)
            : [...prev.categories, id],
    }));
    const toggleDept = (id) => setSelectedDeptIds(prev =>
        prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );

    const handleSubmit = async () => {
        if (!form.name.trim()) return setError('Tên sách không được để trống');
        setSubmitting(true); setError('');
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
            if (isEdit) {
                await api.put(`/books/${book.id}`, payload);
                onSuccess();
            } else {
                const res = await api.post('/books', payload);
                // Sau khi tạo xong, chờ phân công phòng ban ở cột phải
                const newBook = res.data?.data ?? res.data;
                setCreatedBook(newBook);
            }
        } catch (err) {
            const errs = err.response?.data?.errors;
            setError(errs ? Object.values(errs).flat().join(' | ') : err.response?.data?.message || 'Thao tác thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAssign = async () => {
        if (selectedDeptIds.length === 0) return setAssignError('Chọn ít nhất 1 phòng ban');
        setAssigning(true); setAssignError('');
        try {
            await api.post(`/projects/books/${createdBook.id}/assign`, {
                department_ids: selectedDeptIds,
                description: description.trim() || null,
            });
            setAssignedDepts(prev => [...prev, ...allDepts.filter(d => selectedDeptIds.includes(d.id))]);
            setSelectedDeptIds([]);
            setDescription('');
        } catch (err) {
            setAssignError(err.response?.data?.message || 'Phân công thất bại');
        } finally {
            setAssigning(false);
        }
    };

    const availableDepts = allDepts.filter(d => !assignedDepts.find(a => a.id === d.id));

    // Layout 2 cột khi thêm mới và đã tạo book xong
    const showTwoCol = !isEdit;

    return (
        <div style={modal.overlay}>
            <div style={{
                ...modal.box,
                maxWidth: showTwoCol ? '820px' : '560px',
                width: '95vw',
            }} onClick={e => e.stopPropagation()}>
                <div style={modal.header}>
                    <h3 style={modal.title}>{isEdit ? `Cập nhật: ${book.name}` : 'Thêm sách mới'}</h3>
                    <button style={modal.closeBtn} onClick={onClose}>✕</button>
                </div>
                {error && <div style={modal.error}>{error}</div>}

                <div style={{ display: showTwoCol ? 'grid' : 'block', gridTemplateColumns: '1fr 1fr', flex: 1, overflowY: 'auto', minHeight: 0 }}>
                    {/* Cột trái / full: Form sách */}
                    <div style={{ padding: '20px 24px', ...(showTwoCol ? { borderRight: '1px solid #f0f0f0', overflowY: 'auto' } : {}) }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={modal.field}>
                                <label style={modal.label}>Tên sách <span style={modal.req}>*</span></label>
                                <input name="name" value={form.name} onChange={handleChange}
                                    style={modal.input} placeholder="Nhập tên sách"
                                    disabled={!!createdBook} />
                            </div>
                            <div style={modal.row}>
                                <div style={modal.field}>
                                    <label style={modal.label}>Mã sách</label>
                                    <input name="bookCode" value={form.bookCode} onChange={handleChange}
                                        style={modal.input} placeholder="Có thể để trống"
                                        disabled={!!createdBook} />
                                </div>
                                <div style={modal.field}>
                                    <label style={modal.label}>Số trang ước tính</label>
                                    <input name="page" type="number" min="1" value={form.page}
                                        onChange={handleChange} style={modal.input} placeholder="Có thể để trống"
                                        disabled={!!createdBook} />
                                </div>
                            </div>
                            <div style={modal.row}>
                                <div style={modal.field}>
                                    <label style={modal.label}>Loại giấy</label>
                                    <select name="paper_id" value={form.paper_id} onChange={handleChange}
                                        style={modal.input} disabled={!!createdBook}>
                                        <option value="">-- Chọn loại giấy --</option>
                                        {papers.map(p => <option key={p.id} value={p.id}>{p.paperSize}</option>)}
                                    </select>
                                </div>
                                <div style={modal.field}>
                                    <label style={modal.label}>Người phụ trách</label>
                                    <input style={{ ...modal.input, backgroundColor: '#f5f5f5', color: '#888' }}
                                        value={currentUser?.employee?.name ?? `Employee ID: ${form.assigned_by}`}
                                        disabled />
                                </div>
                            </div>
                            <div style={modal.field}>
                                <label style={modal.label}>Danh mục</label>
                                <div style={modal.catBox}>
                                    {categories.length === 0
                                        ? <span style={{ fontSize: '13px', color: '#aaa' }}>Không có danh mục</span>
                                        : categories.map(c => (
                                            <label key={c.id} style={modal.catItem}>
                                                <input type="checkbox"
                                                    checked={form.categories.includes(c.id)}
                                                    onChange={() => toggleCategory(c.id)}
                                                    disabled={!!createdBook}
                                                    style={{ marginRight: '7px', cursor: 'pointer' }} />
                                                {c.name}
                                            </label>
                                        ))}
                                </div>
                            </div>
                            <div style={modal.field}>
                                <label style={modal.label}>Ghi chú</label>
                                <textarea name="note" value={form.note} onChange={handleChange}
                                    style={{ ...modal.input, height: '80px', resize: 'vertical' }}
                                    placeholder="Có thể để trống" disabled={!!createdBook} />
                            </div>

                            {/* Trạng thái sau khi tạo */}
                            {createdBook && (
                                <div style={{ padding: '10px 12px', backgroundColor: '#e6f4ea', borderRadius: '6px', fontSize: '13px', color: '#2e7d32', fontWeight: '600' }}>
                                    ✓ Đã tạo sách thành công! Phân công phòng ban bên phải hoặc đóng để kết thúc.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cột phải: Phân công phòng ban (chỉ hiện khi thêm mới) */}
                    {showTwoCol && (
                        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
                            <div style={{ fontSize: '11px', fontWeight: '700', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Phân công phòng ban
                            </div>

                            {!createdBook ? (
                                <div style={{ fontSize: '13px', color: '#aaa', fontStyle: 'italic', padding: '20px 0', textAlign: 'center' }}>
                                    Tạo sách trước để phân công phòng ban
                                </div>
                            ) : (
                                <>
                                    {assignError && (
                                        <div style={{ padding: '8px 12px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '6px', fontSize: '13px' }}>
                                            {assignError}
                                        </div>
                                    )}

                                    {/* Phòng ban đã phân công */}
                                    {assignedDepts.length > 0 && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#555' }}>Đã phân công</div>
                                            {assignedDepts.map(d => (
                                                <div key={d.id} style={detail_s.deptRow}>
                                                    <span style={{ fontSize: '13px', fontWeight: '600' }}>{d.name}</span>
                                                    <span style={{ fontSize: '11px', color: '#2e7d32', fontWeight: '600' }}>✓</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Chọn phòng ban */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#555' }}>Chọn phòng ban</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                                            {availableDepts.length === 0 ? (
                                                <div style={{ fontSize: '13px', color: '#aaa', fontStyle: 'italic' }}>Không còn phòng ban khả dụng</div>
                                            ) : availableDepts.map(d => (
                                                <label key={d.id} style={{
                                                    display: 'flex', alignItems: 'center', gap: '8px',
                                                    padding: '8px 10px', borderRadius: '6px', cursor: 'pointer',
                                                    backgroundColor: selectedDeptIds.includes(d.id) ? '#e8f0fe' : '#f9f9f9',
                                                    border: `1px solid ${selectedDeptIds.includes(d.id) ? '#1877f2' : '#f0f0f0'}`,
                                                    fontSize: '13px', fontWeight: '500',
                                                }}>
                                                    <input type="checkbox"
                                                        checked={selectedDeptIds.includes(d.id)}
                                                        onChange={() => toggleDept(d.id)}
                                                        style={{ cursor: 'pointer' }} />
                                                    {d.name}
                                                </label>
                                            ))}
                                        </div>
                                        <div style={modal.field}>
                                            <label style={modal.label}>Mô tả</label>
                                            <input value={description} onChange={e => setDescription(e.target.value)}
                                                style={modal.input} placeholder="Có thể để trống" />
                                        </div>
                                        <button
                                            style={{ ...modal.submitBtn, opacity: selectedDeptIds.length === 0 ? 0.5 : 1 }}
                                            onClick={handleAssign}
                                            disabled={assigning || selectedDeptIds.length === 0}
                                        >
                                            {assigning ? 'Đang phân công...' : `+ Phân công (${selectedDeptIds.length})`}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div style={modal.footer}>
                    <button style={modal.cancelBtn} onClick={() => { onSuccess(); onClose(); }}>
                        {createdBook ? 'Hoàn tất' : 'Hủy'}
                    </button>
                    {!createdBook && (
                        <button style={modal.submitBtn} onClick={handleSubmit} disabled={submitting}>
                            {submitting ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo sách'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// MODAL: CHI TIẾT + CẬP NHẬT SÁCH
// - Tất cả role: xem chi tiết
// - canManage + status ≠ 3: có nút "Chỉnh sửa"
// - status = 3 (hoàn thành): chỉ xem, không sửa
// ─────────────────────────────────────────────
const BookDetailModal = ({ book, onClose, onSuccess, canManage }) => {
    const [detail, setDetail] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [papers, setPapers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        Promise.all([
            api.get(`/books/${book.id}`),
            api.get(`/books/${book.id}/projects`).catch(() => ({ data: { data: [] } })),
            api.get('/papers/active'),
            api.get('/book-categories/active'),
        ]).then(([detailRes, projRes, paperRes, catRes]) => {
            if (detailRes.data.success) {
                const d = detailRes.data.data;
                setDetail(d);
                const b = d?.book ?? d;
                setForm({
                    name: b.name ?? '',
                    bookCode: b.bookCode ?? '',
                    page: b.page ?? '',
                    note: b.note ?? '',
                    paper_id: String(b.paper_id ?? ''),
                    categories: b.categories?.map(c => c.id) ?? [],
                });
            }
            const proj = projRes.data?.data ?? [];
            setProjects(Array.isArray(proj) ? proj : []);
            if (paperRes.data.success) setPapers(paperRes.data.data);
            if (catRes.data.success) setCategories(catRes.data.data);
        }).catch(() => { }).finally(() => setLoading(false));
    }, [book.id]);

    const bookData = detail?.book ?? book;
    const totalDays = detail?.total_days ?? null;
    const statusInfo = STATUS_MAP[bookData.status];
    const canEdit = canManage && bookData.status !== 3;

    const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    const toggleCategory = (id) => setForm(p => ({
        ...p,
        categories: p.categories.includes(id) ? p.categories.filter(c => c !== id) : [...p.categories, id],
    }));

    const handleSubmit = async () => {
        if (!form.name.trim()) return setError('Tên sách không được để trống');
        setSubmitting(true); setError('');
        try {
            await api.put(`/books/${bookData.id}`, {
                name: form.name.trim(),
                bookCode: form.bookCode.trim() || null,
                page: form.page ? parseInt(form.page) : null,
                note: form.note.trim() || null,
                paper_id: form.paper_id ? parseInt(form.paper_id) : null,
                categories: form.categories,
            });
            onSuccess?.();
            onClose();
        } catch (err) {
            const errs = err.response?.data?.errors;
            setError(errs ? Object.values(errs).flat().join(' | ') : err.response?.data?.message || 'Thao tác thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={modal.overlay}>
            <div style={{ ...modal.box, maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
                <div style={modal.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h3 style={modal.title}>{isEditing ? 'Chỉnh sửa sách' : 'Chi tiết sách'}</h3>
                        {canManage && bookData.status === 3 && (
                            <span style={{ fontSize: '11px', padding: '2px 8px', backgroundColor: '#e6f4ea', color: '#2e7d32', borderRadius: '6px', fontWeight: '600' }}>
                                Đã hoàn thành — không thể sửa
                            </span>
                        )}
                    </div>
                    <button style={modal.closeBtn} onClick={onClose}>✕</button>
                </div>

                {error && <div style={modal.error}>{error}</div>}

                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Đang tải...</div>
                ) : isEditing ? (
                    <div style={modal.body}>
                        <div style={modal.field}>
                            <label style={modal.label}>Tên sách <span style={modal.req}>*</span></label>
                            <input name="name" value={form.name} onChange={handleChange} style={modal.input} />
                        </div>
                        <div style={modal.row}>
                            <div style={modal.field}>
                                <label style={modal.label}>Mã sách</label>
                                <input name="bookCode" value={form.bookCode} onChange={handleChange} style={modal.input} />
                            </div>
                            <div style={modal.field}>
                                <label style={modal.label}>Số trang</label>
                                <input name="page" type="number" min="1" value={form.page} onChange={handleChange} style={modal.input} />
                            </div>
                        </div>
                        <div style={modal.field}>
                            <label style={modal.label}>Loại giấy</label>
                            <select name="paper_id" value={form.paper_id} onChange={handleChange} style={modal.input}>
                                <option value="">-- Chọn loại giấy --</option>
                                {papers.map(p => <option key={p.id} value={p.id}>{p.paperSize}</option>)}
                            </select>
                        </div>
                        <div style={modal.field}>
                            <label style={modal.label}>Danh mục</label>
                            <div style={modal.catBox}>
                                {categories.map(c => (
                                    <label key={c.id} style={modal.catItem}>
                                        <input type="checkbox" checked={form.categories.includes(c.id)}
                                            onChange={() => toggleCategory(c.id)} style={{ marginRight: '7px' }} />
                                        {c.name}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div style={modal.field}>
                            <label style={modal.label}>Ghi chú</label>
                            <textarea name="note" value={form.note} onChange={handleChange}
                                style={{ ...modal.input, height: '80px', resize: 'vertical' }} />
                        </div>
                    </div>
                ) : (
                    <div style={modal.body}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                            <div>
                                <div style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a' }}>{bookData.name}</div>
                                {bookData.bookCode && <div style={{ fontSize: '13px', color: '#888', marginTop: '3px' }}>Mã: {bookData.bookCode}</div>}
                            </div>
                            <span style={{ padding: '4px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', flexShrink: 0, backgroundColor: statusInfo?.bg ?? '#f5f5f5', color: statusInfo?.color ?? '#333' }}>
                                {statusInfo?.label ?? `Status ${bookData.status}`}
                            </span>
                        </div>
                        <div style={detail_s.grid}>
                            {[
                                ['Số trang', bookData.page ?? '—'],
                                ['Loại giấy', bookData.paper?.paperSize ?? '—'],
                                ['Ngày bắt đầu', fmtDate(bookData.start_time)],
                                ['Ngày kết thúc', fmtDate(bookData.end_time)],
                                ['Tổng ngày thực hiện', totalDays != null ? `${totalDays} ngày` : '—', true],
                                ['Người phụ trách', bookData.assigned_employee?.name ?? '—'],
                            ].map(([label, value, highlight]) => (
                                <div key={label} style={detail_s.item}>
                                    <span style={detail_s.itemLabel}>{label}</span>
                                    <span style={{ ...detail_s.itemValue, ...(highlight ? { color: '#1877f2', fontWeight: '700', fontSize: '16px' } : {}) }}>{value}</span>
                                </div>
                            ))}
                        </div>
                        {bookData.categories?.length > 0 && (
                            <div style={modal.field}>
                                <label style={modal.label}>Danh mục</label>
                                <div style={{ fontSize: '14px', color: '#555' }}>{bookData.categories.map(c => c.name).join(', ')}</div>
                            </div>
                        )}
                        <div style={modal.field}>
                            <label style={modal.label}>Phòng ban thực hiện</label>
                            {projects.length === 0 ? (
                                <div style={{ fontSize: '13px', color: '#aaa', fontStyle: 'italic' }}>Chưa phân công phòng ban</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {projects.map(p => {
                                        const pStatus = STATUS_MAP[p.status];
                                        return (
                                            <div key={p.id} style={detail_s.deptRow}>
                                                <span style={{ fontWeight: '600', fontSize: '14px' }}>{p.department?.name ?? `Phòng ban #${p.department_id}`}</span>
                                                <span style={{ padding: '2px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: '600', backgroundColor: pStatus?.bg ?? '#f5f5f5', color: pStatus?.color ?? '#333' }}>
                                                    {pStatus?.label ?? `Status ${p.status}`}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        {bookData.note && (
                            <div style={modal.field}>
                                <label style={modal.label}>Ghi chú</label>
                                <div style={{ fontSize: '14px', color: '#555', padding: '10px 12px', backgroundColor: '#f9f9f9', borderRadius: '6px', lineHeight: '1.6' }}>
                                    {bookData.note}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div style={modal.footer}>
                    {isEditing ? (
                        <>
                            <button style={modal.cancelBtn} onClick={() => { setIsEditing(false); setError(''); }} disabled={submitting}>Huỷ sửa</button>
                            <button style={modal.submitBtn} onClick={handleSubmit} disabled={submitting}>
                                {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </>
                    ) : (
                        <>
                            <button style={modal.cancelBtn} onClick={onClose}>Đóng</button>
                            {canEdit && (
                                <button style={modal.submitBtn} onClick={() => setIsEditing(true)}>Chỉnh sửa</button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};


// ─────────────────────────────────────────────
// MODAL: PHÂN CÔNG — status=1 và status=2
// Chỉ Admin / Thư ký biên tập
// ─────────────────────────────────────────────
const AssignModal = ({ book, onClose, onSuccess }) => {
    const [projects, setProjects] = useState([]);
    const [allDepts, setAllDepts] = useState([]);
    const [selectedDeptIds, setSelectedDeptIds] = useState([]);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const fetchProjects = () =>
        api.get(`/books/${book.id}/projects`)
            .then(res => {
                const d = res.data?.data ?? [];
                setProjects(Array.isArray(d) ? d : []);
            });

    useEffect(() => {
        Promise.all([
            api.get(`/books/${book.id}/projects`),
            // GET /departments — quyền: Admin, Thư kí biên tập
            api.get('/departments').catch(() => ({ data: { data: [] } })),
        ]).then(([projRes, deptRes]) => {
            const d = projRes.data?.data ?? [];
            setProjects(Array.isArray(d) ? d : []);
            // Lọc chỉ lấy phòng ban đang hoạt động (status = 1)
            const depts = (deptRes.data?.data ?? []).filter(dep => dep.status === 1);
            setAllDepts(Array.isArray(depts) ? depts : []);
        }).catch(() => setError('Không thể tải dữ liệu'))
            .finally(() => setLoading(false));
    }, [book.id]);

    const assignedDeptIds = projects.map(p => p.department_id);
    const availableDepts = allDepts.filter(d => !assignedDeptIds.includes(d.id));

    const toggleDept = (id) => setSelectedDeptIds(prev =>
        prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );

    const handleAssign = async () => {
        if (selectedDeptIds.length === 0) return setError('Chọn ít nhất 1 phòng ban');
        setSubmitting(true); setError('');
        try {
            // status=2 (chờ phân công): assign lần đầu → POST /projects/books/{book}/assign
            // status=1 (đang thực hiện): thêm phòng ban → POST /projects/books/{bookId}/add-departments
            const endpoint = book.status === 2
                ? `/projects/books/${book.id}/assign`
                : `/projects/books/${book.id}/add-departments`;
            await api.post(endpoint, {
                department_ids: selectedDeptIds,
                description: description.trim() || null,
            });
            setSelectedDeptIds([]);
            setDescription('');
            setDropdownOpen(false);
            await fetchProjects();
            onSuccess?.();
        } catch (err) {
            setError(err.response?.data?.message || 'Phân công thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    const statusInfo = STATUS_MAP[book.status];
    const selectedDepts = allDepts.filter(d => selectedDeptIds.includes(d.id));

    return (
        <div style={modal.overlay}>
            {/* Khung bự hơn: 920px */}
            <div style={{ ...modal.box, maxWidth: '920px', width: '95vw', maxHeight: '88vh' }} onClick={e => e.stopPropagation()}>
                <div style={modal.header}>
                    <h3 style={modal.title}>Phân công phòng ban</h3>
                    <button style={modal.closeBtn} onClick={onClose}>✕</button>
                </div>
                {error && <div style={modal.error}>{error}</div>}

                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>Đang tải...</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', flex: 1, overflow: 'hidden' }}>

                        {/* Cột trái: Info sách */}
                        <div style={{ padding: '24px', borderRight: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
                            <div style={{ fontSize: '11px', fontWeight: '700', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Thông tin sách</div>
                            <div>
                                <div style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a', lineHeight: '1.3' }}>{book.name}</div>
                                {book.bookCode && <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>#{book.bookCode}</div>}
                            </div>
                            <span style={{ alignSelf: 'flex-start', padding: '4px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: '600', backgroundColor: statusInfo?.bg, color: statusInfo?.color }}>
                                {statusInfo?.label}
                            </span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {[
                                    ['Số trang', book.page ?? '—'],
                                    ['Loại giấy', book.paper?.paperSize ?? '—'],
                                    ['Bắt đầu', fmtDate(book.start_time)],
                                    ['Người phụ trách', book.assigned_employee?.name ?? '—'],
                                ].map(([label, value]) => (
                                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                                        <span style={{ color: '#888' }}>{label}</span>
                                        <span style={{ fontWeight: '600', color: '#333' }}>{value}</span>
                                    </div>
                                ))}
                            </div>
                            {book.categories?.length > 0 && (
                                <div style={{ fontSize: '13px', color: '#555' }}>
                                    <span style={{ color: '#aaa', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Danh mục</span>
                                    {book.categories.map(c => c.name).join(', ')}
                                </div>
                            )}
                            {book.note && (
                                <div>
                                    <span style={{ color: '#aaa', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Ghi chú</span>
                                    <div style={{ fontSize: '13px', color: '#666', padding: '10px 12px', backgroundColor: '#f9f9f9', borderRadius: '6px', lineHeight: '1.5' }}>
                                        {book.note}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Cột phải: Phòng ban */}
                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>

                            {/* Phòng ban đã trong project */}
                            <div>
                                <div style={{ fontSize: '11px', fontWeight: '700', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                                    Phòng ban trong project ({projects.length})
                                </div>
                                {projects.length === 0 ? (
                                    <div style={{ fontSize: '13px', color: '#aaa', fontStyle: 'italic', padding: '12px 0' }}>Chưa có phòng ban nào</div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {projects.map(p => {
                                            const pStatus = STATUS_MAP[p.status];
                                            return (
                                                <div key={p.id} style={detail_s.deptRow}>
                                                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{p.department?.name ?? `Phòng ban #${p.department_id}`}</span>
                                                    <span style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: '600', backgroundColor: pStatus?.bg ?? '#f5f5f5', color: pStatus?.color ?? '#333' }}>
                                                        {pStatus?.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Form thêm phòng ban */}
                            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div style={{ fontSize: '11px', fontWeight: '700', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Thêm phòng ban</div>

                                {/* Multi-select dropdown */}
                                <div style={modal.field}>
                                    <label style={modal.label}>Chọn phòng ban <span style={modal.req}>*</span></label>
                                    <div style={{ position: 'relative' }}>
                                        {/* Trigger */}
                                        <div
                                            onClick={() => setDropdownOpen(o => !o)}
                                            style={{
                                                ...modal.input, cursor: 'pointer', display: 'flex',
                                                alignItems: 'center', justifyContent: 'space-between',
                                                userSelect: 'none', minHeight: '42px',
                                                flexWrap: 'wrap', gap: '4px',
                                            }}
                                        >
                                            {selectedDepts.length === 0 ? (
                                                <span style={{ color: '#aaa' }}>-- Chọn phòng ban --</span>
                                            ) : (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', flex: 1 }}>
                                                    {selectedDepts.map(d => (
                                                        <span key={d.id} style={{
                                                            padding: '2px 8px', backgroundColor: '#e8f0fe',
                                                            color: '#1877f2', borderRadius: '4px', fontSize: '12px', fontWeight: '600',
                                                            display: 'flex', alignItems: 'center', gap: '4px',
                                                        }}>
                                                            {d.name}
                                                            <span
                                                                onClick={e => { e.stopPropagation(); toggleDept(d.id); }}
                                                                style={{ cursor: 'pointer', fontWeight: '700', fontSize: '11px', color: '#1877f2' }}
                                                            >✕</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <span style={{ color: '#aaa', flexShrink: 0, marginLeft: '8px' }}>{dropdownOpen ? '▲' : '▼'}</span>
                                        </div>

                                        {/* Dropdown list */}
                                        {dropdownOpen && (
                                            <div style={{
                                                position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                                                backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '6px',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100,
                                                maxHeight: '220px', overflowY: 'auto',
                                            }}>
                                                {availableDepts.length === 0 ? (
                                                    <div style={{ padding: '12px 16px', fontSize: '13px', color: '#aaa', fontStyle: 'italic' }}>
                                                        Không còn phòng ban khả dụng
                                                    </div>
                                                ) : availableDepts.map(d => (
                                                    <div
                                                        key={d.id}
                                                        onClick={() => toggleDept(d.id)}
                                                        style={{
                                                            padding: '10px 16px', cursor: 'pointer', fontSize: '14px',
                                                            display: 'flex', alignItems: 'center', gap: '10px',
                                                            backgroundColor: selectedDeptIds.includes(d.id) ? '#e8f0fe' : 'white',
                                                            color: selectedDeptIds.includes(d.id) ? '#1877f2' : '#333',
                                                            fontWeight: selectedDeptIds.includes(d.id) ? '600' : '400',
                                                            borderBottom: '1px solid #f5f5f5',
                                                        }}
                                                    >
                                                        <span style={{
                                                            width: '16px', height: '16px', borderRadius: '3px', flexShrink: 0,
                                                            border: `2px solid ${selectedDeptIds.includes(d.id) ? '#1877f2' : '#ccc'}`,
                                                            backgroundColor: selectedDeptIds.includes(d.id) ? '#1877f2' : 'white',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontSize: '10px', color: 'white',
                                                        }}>
                                                            {selectedDeptIds.includes(d.id) ? '✓' : ''}
                                                        </span>
                                                        {d.name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={modal.field}>
                                    <label style={modal.label}>Mô tả</label>
                                    <input value={description} onChange={e => setDescription(e.target.value)} style={modal.input} placeholder="Có thể để trống" />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button
                                        style={{ ...modal.submitBtn, opacity: selectedDeptIds.length === 0 ? 0.5 : 1, minWidth: '160px' }}
                                        onClick={handleAssign}
                                        disabled={submitting || selectedDeptIds.length === 0}
                                    >
                                        {submitting ? 'Đang phân công...' : `+ Phân công${selectedDeptIds.length > 0 ? ` (${selectedDeptIds.length})` : ''}`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div style={modal.footer}>
                    <button style={modal.cancelBtn} onClick={onClose}>Đóng</button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// TRANG CHÍNH: BOOKS
// ─────────────────────────────────────────────
const Books = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const canManage = CAN_MANAGE.includes(user?.position);
    const canViewAll = canManage || CAN_VIEW_ALL.includes(user?.position);

    const [books, setBooks] = useState([]);
    const [allBooks, setAllBooks] = useState([]);
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [detailBook, setDetailBook] = useState(null);
    const [assignBook, setAssignBook] = useState(null);

    const [keyword, setKeyword] = useState('');
    const [paperFilter, setPaperFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState(canViewAll ? '' : '3');
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState(null);
    const PER_PAGE = 15;

    useEffect(() => {
        api.get('/papers/active').then(res => {
            if (res.data.success) setPapers(res.data.data);
        }).catch(() => { });
        if (canViewAll) {
            api.get('/books').then(res => {
                if (res.data.success) setAllBooks(res.data.data);
            }).catch(() => { });
        }
    }, []);

    const filtersRef = useRef({ keyword, paperFilter, statusFilter });
    useEffect(() => { filtersRef.current = { keyword, paperFilter, statusFilter }; });

    const fetchBooks = async (p = 1, overrideStatus = null) => {
        setLoading(true); setError('');
        try {
            const currentStatus = overrideStatus !== null ? overrideStatus : filtersRef.current.statusFilter;
            const { keyword, paperFilter } = filtersRef.current;
            const params = new URLSearchParams();
            if (keyword) params.set('name', keyword);
            if (paperFilter) params.set('paperSize', paperFilter);
            if (!canViewAll) {
                params.set('status', '3');
            } else if (currentStatus !== '') {
                params.set('status', currentStatus);
            }
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
        setDetailBook(null);
        setAssignBook(null);
        fetchBooks(page);
        if (canViewAll) {
            api.get('/books').then(res => {
                if (res.data.success) setAllBooks(res.data.data);
            });
        }
    };

    const activeCount = allBooks.filter(b => b.status === 1).length;

    return (
        <div style={styles.wrapper}>
            <div style={styles.pageHeader}>
                <div>
                    <div style={styles.titleRow}>
                        <h2 style={styles.title}>Quản lý sách</h2>
                        {canViewAll && <span style={styles.count}>{activeCount} đang thực hiện</span>}
                    </div>
                    {canViewAll ? (
                        <div style={styles.statusRow}>
                            {STATUS_OPTIONS.map(opt => (
                                <button key={opt.value}
                                    style={statusFilter === opt.value ? styles.statusBtnActive : styles.statusBtn}
                                    onClick={() => setStatusFilter(opt.value)}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div style={{ marginTop: '8px' }}>
                            <span style={{ ...styles.statusBtnActive, cursor: 'default' }}>Hoàn thành</span>
                        </div>
                    )}
                </div>

                <div style={styles.actions}>
                    <div style={styles.searchGroup}>
                        <input style={styles.searchInput} placeholder="Tìm tên sách / mã sách"
                            value={keyword} onChange={e => setKeyword(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && fetchBooks(1)} />
                        <select style={styles.selectInput} value={paperFilter} onChange={e => setPaperFilter(e.target.value)}>
                            <option value="">Tất cả loại giấy</option>
                            {papers.map(p => <option key={p.id} value={p.paperSize}>{p.paperSize}</option>)}
                        </select>
                        <button style={styles.searchBtn} onClick={() => fetchBooks(1)}>Tìm kiếm</button>
                    </div>
                    <div style={{ width: '1px', height: '32px', backgroundColor: '#e0e0e0', margin: '0 8px' }} />
                    {canManage && (
                        <button style={styles.addBtn} onClick={() => setShowAdd(true)}>+ Thêm sách</button>
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
                                <th style={styles.th}>Điều chỉnh</th>
                            </tr>
                        </thead>
                        <tbody>
                            {books.length === 0 ? (
                                <tr><td colSpan={8} style={styles.empty}>Không có sách nào</td></tr>
                            ) : books.map((book, index) => {
                                const statusInfo = STATUS_MAP[book.status];
                                // Nút Phân công: status=1 hoặc status=2
                                const showAssign = canManage && (book.status === 1 || book.status === 2);
                                // Nút Theo dõi: status=1
                                const showTrack = canManage && book.status === 1;

                                return (
                                    <tr key={book.id} style={index % 2 === 0 ? styles.trEven : styles.trOdd}>
                                        <td style={styles.td}>{(page - 1) * PER_PAGE + index + 1}</td>
                                        <td style={{ ...styles.td, fontWeight: '600' }}>{book.name}</td>
                                        <td style={styles.td}>{book.bookCode || '—'}</td>
                                        <td style={styles.td}>{book.page || '—'}</td>
                                        <td style={styles.td}>{book.paper?.paperSize || '—'}</td>
                                        <td style={styles.td}>
                                            {book.categories?.length > 0 ? book.categories.map(c => c.name).join(', ') : '—'}
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{
                                                display: 'inline-block', padding: '3px 10px', borderRadius: '12px',
                                                fontSize: '12px', fontWeight: '600',
                                                backgroundColor: statusInfo?.bg ?? '#f5f5f5',
                                                color: statusInfo?.color ?? '#333',
                                            }}>{statusInfo?.label ?? `Status ${book.status}`}</span>
                                        </td>
                                        <td style={{ ...styles.td, whiteSpace: 'nowrap' }}>
                                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                {/* Chi tiết: tất cả role — tích hợp sửa nếu canManage + status ≠ 3 */}
                                                <button style={styles.viewBtn} onClick={() => setDetailBook(book)}>
                                                    Chi tiết
                                                </button>
                                                {/* Phân công: status 1 & 2, canManage */}
                                                {showAssign && (
                                                    <button style={styles.assignBtn} onClick={() => setAssignBook(book)}>
                                                        Phân công
                                                    </button>
                                                )}
                                                {/* Theo dõi: status 1, canManage — navigate sang trang riêng */}
                                                {showTrack && (
                                                    <button style={styles.trackBtn} onClick={() => navigate(`/books/${book.id}/transfers`)}>
                                                        Theo dõi
                                                    </button>
                                                )}
                                            </div>
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

            {showAdd && <BookModal onClose={() => setShowAdd(false)} onSuccess={handleSuccess} currentUser={user} />}
            {detailBook && <BookDetailModal book={detailBook} onClose={() => setDetailBook(null)} onSuccess={handleSuccess} canManage={canManage} />}
            {assignBook && <AssignModal book={assignBook} onClose={() => setAssignBook(null)} onSuccess={handleSuccess} />}
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
    viewBtn: { padding: '5px 10px', backgroundColor: '#e8f0fe', color: '#1877f2', border: '1px solid #c5d8fc', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
    editBtn: { padding: '5px 10px', backgroundColor: '#f5f5f5', color: '#333', border: '1px solid #d0d0d0', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
    assignBtn: { padding: '5px 10px', backgroundColor: '#fff8e1', color: '#f57f17', border: '1px solid #ffe082', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
    trackBtn: { padding: '5px 10px', backgroundColor: '#e8f5e9', color: '#2e7d32', border: '1px solid #a5d6a7', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
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
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 16px', borderBottom: '1px solid #f0f0f0', flexShrink: 0 },
    title: { fontSize: '18px', fontWeight: '700', color: '#1a1a1a', margin: 0 },
    closeBtn: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#888', padding: '4px 8px' },
    body: { padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' },
    footer: { padding: '16px 24px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: '10px', flexShrink: 0 },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
    field: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '13px', fontWeight: '600', color: '#555' },
    req: { color: '#e53935' },
    input: { padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' },
    error: { margin: '0 24px 4px', padding: '10px 12px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '6px', fontSize: '13px', flexShrink: 0 },
    cancelBtn: { padding: '9px 20px', backgroundColor: '#f5f5f5', color: '#333', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' },
    submitBtn: { padding: '9px 20px', backgroundColor: '#1877f2', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
    catBox: { border: '1px solid #ddd', borderRadius: '6px', padding: '10px 12px', display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '120px', overflowY: 'auto' },
    catItem: { display: 'flex', alignItems: 'center', fontSize: '13px', color: '#333', cursor: 'pointer', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#f5f5f5', userSelect: 'none' },
};

const detail_s = {
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
    item: { display: 'flex', flexDirection: 'column', gap: '3px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '8px' },
    itemLabel: { fontSize: '11px', color: '#aaa', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.4px' },
    itemValue: { fontSize: '15px', color: '#333', fontWeight: '500' },
    deptRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#f9f9f9', borderRadius: '6px', border: '1px solid #f0f0f0' },
};

export default Books;