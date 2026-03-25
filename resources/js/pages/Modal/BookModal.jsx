import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { modal, detail_s } from './booksConstants';

const BookModal = ({ onClose, onSuccess, currentUser }) => {
    const [papers, setPapers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [allDepts, setAllDepts] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [createdBook, setCreatedBook] = useState(null);
    const [selectedDeptIds, setSelectedDeptIds] = useState([]);
    const [description, setDescription] = useState('');
    const [assigning, setAssigning] = useState(false);
    const [assignError, setAssignError] = useState('');
    const [assignedDepts, setAssignedDepts] = useState([]);

    const [form, setForm] = useState({
        name: '',
        bookCode: '',
        page: '',
        note: '',
        paper_id: '',
        assigned_by: currentUser?.employee?.id ?? '',
        categories: [],
    });

    useEffect(() => {
        Promise.all([
            api.get('/papers/active'),
            api.get('/book-categories/active'),
            api.get('/departments').catch(() => ({ data: { data: [] } })),
        ]).then(([paperRes, catRes, deptRes]) => {
            if (paperRes.data.success) setPapers(paperRes.data.data);
            if (catRes.data.success) setCategories(catRes.data.data);
            const d = (deptRes.data?.data ?? []).filter(dep => dep.status === 1);
            setAllDepts(Array.isArray(d) ? d : []);
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
            const res = await api.post('/books', payload);
            const newBook = res.data?.data ?? res.data;
            setCreatedBook(newBook);
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

    return (
        <div style={modal.overlay}>
            <div style={{ ...modal.box, maxWidth: '820px', width: '95vw' }} onClick={e => e.stopPropagation()}>
                <div style={modal.header}>
                    <h3 style={modal.title}>Thêm sách mới</h3>
                    <button style={modal.closeBtn} onClick={onClose}>✕</button>
                </div>
                {error && <div style={modal.error}>{error}</div>}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1, overflowY: 'auto', minHeight: 0 }}>
                    {/* Left: Book info */}
                    <div style={{ padding: '20px 24px', borderRight: '1px solid #f0f0f0', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={modal.field}>
                                <label style={modal.label}>Tên sách <span style={modal.req}>*</span></label>
                                <input name="name" value={form.name} onChange={handleChange}
                                    style={modal.input} placeholder="Nhập tên sách" disabled={!!createdBook} />
                            </div>
                            <div style={modal.row}>
                                <div style={modal.field}>
                                    <label style={modal.label}>Mã sách</label>
                                    <input name="bookCode" value={form.bookCode} onChange={handleChange}
                                        style={modal.input} placeholder="Có thể để trống" disabled={!!createdBook} />
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
                                    <label style={modal.label}>Khổ giấy</label>
                                    <select name="paper_id" value={form.paper_id} onChange={handleChange}
                                        style={modal.input} disabled={!!createdBook}>
                                        <option value="">-- Chọn khổ giấy --</option>
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
                            {createdBook && (
                                <div style={{ padding: '10px 12px', backgroundColor: '#e6f4ea', borderRadius: '6px', fontSize: '13px', color: '#2e7d32', fontWeight: '600' }}>
                                    ✓ Đã tạo sách thành công! Phân công phòng ban bên phải hoặc đóng để kết thúc.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Department assignment */}
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
                </div>

                <div style={modal.footer}>
                    <button style={modal.cancelBtn} onClick={() => { onSuccess(); onClose(); }}>
                        {createdBook ? 'Hoàn tất' : 'Hủy'}
                    </button>
                    {!createdBook && (
                        <button style={modal.submitBtn} onClick={handleSubmit} disabled={submitting}>
                            {submitting ? 'Đang lưu...' : 'Tạo sách'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookModal;