import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { modal, detail_s, STATUS_MAP, fmtDate } from './booksConstants';

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
        api.get(`/books/${book.id}/projects`).then(res => {
            const d = res.data?.data ?? [];
            setProjects(Array.isArray(d) ? d : []);
        });

    useEffect(() => {
        Promise.all([
            api.get(`/books/${book.id}/projects`),
            api.get('/departments').catch(() => ({ data: { data: [] } })),
        ]).then(([projRes, deptRes]) => {
            const d = projRes.data?.data ?? [];
            setProjects(Array.isArray(d) ? d : []);
            const depts = (deptRes.data?.data ?? []).filter(dep => dep.status === 1);
            setAllDepts(Array.isArray(depts) ? depts : []);
        }).catch(() => setError('Không thể tải dữ liệu'))
            .finally(() => setLoading(false));
    }, [book.id]);

    const assignedDeptIds = projects.map(p => p.department_id);
    const availableDepts = allDepts.filter(d => !assignedDeptIds.includes(d.id));
    const selectedDepts = allDepts.filter(d => selectedDeptIds.includes(d.id));

    const toggleDept = (id) => setSelectedDeptIds(prev =>
        prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );

    const handleAssign = async () => {
        if (selectedDeptIds.length === 0) return setError('Chọn ít nhất 1 phòng ban');
        setSubmitting(true); setError('');
        try {
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

    return (
        <div style={modal.overlay}>
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
                        {/* Left: Book info */}
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
                                    ['Khổ giấy', book.paper?.paperSize ?? '—'],
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

                        {/* Right: Assignment */}
                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
                            {/* Existing departments */}
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
                                                    <span style={{ fontWeight: '600', fontSize: '14px' }}>
                                                        {p.department?.name ?? `Phòng ban #${p.department_id}`}
                                                    </span>
                                                    <span style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: '600', backgroundColor: pStatus?.bg ?? '#f5f5f5', color: pStatus?.color ?? '#333' }}>
                                                        {pStatus?.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Add new departments */}
                            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div style={{ fontSize: '11px', fontWeight: '700', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Thêm phòng ban</div>

                                <div style={modal.field}>
                                    <label style={modal.label}>Chọn phòng ban <span style={modal.req}>*</span></label>
                                    <div style={{ position: 'relative' }}>
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
                                    <input value={description} onChange={e => setDescription(e.target.value)}
                                        style={modal.input} placeholder="Có thể để trống" />
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

export default AssignModal;