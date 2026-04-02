import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { modal, detail_s, STATUS_MAP, fmtDate } from './booksConstants';
import BookAllocationModal from './BookAllocationModal';

const BookDetailModal = ({ book, onClose, onSuccess, canManage }) => {
    const [detail, setDetail] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [papers, setPapers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [actioning, setActioning] = useState(false);
    const [error, setError] = useState('');
    const [confirmAction, setConfirmAction] = useState(null);
    const [showAllocation, setShowAllocation] = useState(false);

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

    const canEdit = canManage && bookData.status !== 3 && bookData.status !== 0;

    const canFinish = canManage && bookData.status === 1;

    const canCancel = canManage && bookData.status !== 3 && bookData.status !== 0;

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

    const handleAction = async (type) => {
        setActioning(true); setError('');
        try {
            if (type === 'finish') {
                await api.patch(`/books/${bookData.id}/finish`);
            } else {
                await api.patch(`/books/${bookData.id}/cancel`);
            }
            onSuccess?.();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Thao tác thất bại');
            setConfirmAction(null);
        } finally {
            setActioning(false);
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
                        {canManage && bookData.status === 0 && (
                            <span style={{ fontSize: '11px', padding: '2px 8px', backgroundColor: '#fce8e6', color: '#c62828', borderRadius: '6px', fontWeight: '600' }}>
                                Đã hủy — không thể sửa
                            </span>
                        )}
                    </div>
                    <button style={modal.closeBtn} onClick={onClose}>✕</button>
                </div>

                {error && <div style={modal.error}>{error}</div>}


                {confirmAction && (
                    <div style={{
                        margin: '0 24px 4px',
                        padding: '14px 16px',
                        backgroundColor: confirmAction === 'finish' ? '#e6f4ea' : '#fff8f8',
                        border: `1px solid ${confirmAction === 'finish' ? '#a5d6a7' : '#ffcdd2'}`,
                        borderRadius: '8px',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                    }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: confirmAction === 'finish' ? '#2e7d32' : '#c62828' }}>
                            {confirmAction === 'finish'
                                ? 'Xác nhận hoàn thành sách này?'
                                : 'Xác nhận hủy sách này? Hành động không thể hoàn tác.'}
                        </span>
                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                            <button
                                style={{ padding: '6px 14px', backgroundColor: '#f5f5f5', color: '#333', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}
                                onClick={() => setConfirmAction(null)}
                                disabled={actioning}
                            >
                                Không
                            </button>
                            <button
                                style={{
                                    padding: '6px 14px',
                                    backgroundColor: confirmAction === 'finish' ? '#2e7d32' : '#c62828',
                                    color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px',
                                    fontWeight: '600', cursor: 'pointer'
                                }}
                                onClick={() => handleAction(confirmAction)}
                                disabled={actioning}
                            >
                                {actioning ? 'Đang xử lý...' : 'Xác nhận'}
                            </button>
                        </div>
                    </div>
                )}

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
                            <label style={modal.label}>Khổ giấy</label>
                            <select name="paper_id" value={form.paper_id} onChange={handleChange} style={modal.input}>
                                <option value="">-- Chọn khổ giấy --</option>
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
                            <span style={{
                                padding: '4px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: '600',
                                whiteSpace: 'nowrap', flexShrink: 0,
                                backgroundColor: statusInfo?.bg ?? '#f5f5f5', color: statusInfo?.color ?? '#333'
                            }}>
                                {statusInfo?.label ?? `Status ${bookData.status}`}
                            </span>
                        </div>
                        <div style={detail_s.grid}>
                            {[
                                ['Số trang', bookData.page ?? '—'],
                                ['Khổ giấy', bookData.paper?.paperSize ?? '—'],
                                ['Ngày bắt đầu', fmtDate(bookData.start_time)],
                                ['Ngày kết thúc', fmtDate(bookData.end_time)],
                                ['Tổng ngày thực hiện', totalDays != null ? `${totalDays} ngày` : '—', true],
                                ['Người phụ trách', bookData.assigned_employee?.name ?? '—'],
                            ].map(([label, value, highlight]) => (
                                <div key={label} style={detail_s.item}>
                                    <span style={detail_s.itemLabel}>{label}</span>
                                    <span style={{ ...detail_s.itemValue, ...(highlight ? { color: '#1877f2', fontWeight: '700', fontSize: '16px' } : {}) }}>
                                        {value}
                                    </span>
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
                                                <span style={{ fontWeight: '600', fontSize: '14px' }}>
                                                    {p.department?.name ?? `Phòng ban #${p.department_id}`}
                                                </span>
                                                <span style={{
                                                    padding: '2px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: '600',
                                                    backgroundColor: pStatus?.bg ?? '#f5f5f5', color: pStatus?.color ?? '#333'
                                                }}>
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

                <div style={{ ...modal.footer, justifyContent: 'space-between' }}>
                    {/* Left: Finish / Cancel actions */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {!isEditing && canFinish && !confirmAction && (
                            <button
                                style={modal.finishBtn}
                                onClick={() => setConfirmAction('finish')}
                                disabled={actioning}
                            >
                                Hoàn thành
                            </button>
                        )}
                        {!isEditing && canCancel && !confirmAction && (
                            <button
                                style={modal.cancelActionBtn}
                                onClick={() => setConfirmAction('cancel')}
                                disabled={actioning}
                            >
                                Hủy sách
                            </button>
                        )}

                        {/* Dùng để xuất báo cáo theo sách*/}
                        {!isEditing && bookData.status === 3 && (
                            <button
                                style={{ padding: '7px 16px', background: '#e8f0fe', color: '#1877f2', border: '1px solid #c5d8fc', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                                onClick={() => setShowAllocation(true)}
                            >
                                Xem thực hiện
                            </button>
                        )}
                    </div>

                    {/* Right: Edit / Close */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {isEditing ? (
                            <>
                                <button style={modal.cancelBtn} onClick={() => { setIsEditing(false); setError(''); }} disabled={submitting}>
                                    Huỷ sửa
                                </button>
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
            {showAllocation && (
                console.log('Opening modal with bookData:', bookData),
                <BookAllocationModal book={bookData} onClose={() => setShowAllocation(false)} />
            )}
        </div>
    );
};

export default BookDetailModal;