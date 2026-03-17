import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CAN_MANAGE = ['Admin', 'Thư kí biên tập'];
const IS_TRUONG_PHONG = ['Trưởng phòng'];

const STATUS_MAP = {
    0: { label: 'Đã hủy', bg: '#fce8e6', color: '#c62828' },
    1: { label: 'Đang thực hiện', bg: '#e3f2fd', color: '#1565c0' },
    2: { label: 'Đợi phân công', bg: '#fff8e1', color: '#f57f17' },
    3: { label: 'Hoàn thành', bg: '#e6f4ea', color: '#2e7d32' },
    4: { label: 'Chỉnh sửa', bg: '#f3e5f5', color: '#6a1b9a' },
};

const fmtDateTime = (d) => d ? new Date(d).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
}) : null;

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';

const s = {
    wrapper: { display: 'flex', flexDirection: 'column', gap: '16px' },
    center: { textAlign: 'center', padding: '80px', color: '#888', fontSize: '15px' },
    topBar: { display: 'flex', alignItems: 'center', gap: '16px' },
    backBtn: { padding: '8px 16px', backgroundColor: '#f5f5f5', color: '#333', border: '1px solid #d0d0d0', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
    pageTitle: { fontSize: '22px', fontWeight: '700', color: '#1a1a1a', margin: 0 },
    layout: { display: 'flex', gap: '16px', alignItems: 'flex-start' },
    sidebar: {
        width: '250px', flexShrink: 0, backgroundColor: 'white',
        borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px',
        position: 'sticky', top: '16px',
    },
    sectionLabel: { fontSize: '11px', fontWeight: '700', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' },
    bookName: { fontSize: '20px', fontWeight: '800', color: '#1a1a1a', lineHeight: '1.3' },
    bookCode: { fontSize: '13px', color: '#888', marginTop: '-8px' },
    totalDaysBox: { padding: '12px', backgroundColor: '#e8f0fe', borderRadius: '10px', textAlign: 'center', border: '1px solid #c5d8fc' },
    totalDaysNum: { fontSize: '28px', fontWeight: '800', color: '#1877f2', lineHeight: '1' },
    totalDaysLabel: { fontSize: '12px', color: '#1877f2', fontWeight: '600', marginTop: '2px' },
    infoList: { display: 'flex', flexDirection: 'column', gap: '8px' },
    infoRow: { display: 'flex', flexDirection: 'column', gap: '1px' },
    infoLabel: { fontSize: '11px', color: '#aaa', fontWeight: '600' },
    infoValue: { fontSize: '14px', color: '#333', fontWeight: '600' },
    noteBox: { fontSize: '13px', color: '#555', padding: '8px 10px', backgroundColor: '#f9f9f9', borderRadius: '6px', lineHeight: '1.5' },
    content: { backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: '20px' },
    flowHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' },
    flowCount: { padding: '2px 10px', backgroundColor: '#f0f0f0', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#555' },
    transferBtn: { marginLeft: 'auto', padding: '6px 14px', backgroundColor: '#1877f2', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    empty: { textAlign: 'center', padding: '24px', color: '#aaa', fontStyle: 'italic', fontSize: '13px' },
    flowScroll: { overflowX: 'auto', paddingBottom: '4px' },
    flowRow: { display: 'flex', flexDirection: 'row', alignItems: 'center', minWidth: 'max-content' },
    arrow: { display: 'flex', alignItems: 'center', padding: '0 6px', flexShrink: 0 },
    arrowLine: { width: '28px', height: '2px', backgroundColor: '#d0d0d0' },
    arrowHead: { fontSize: '11px', color: '#d0d0d0', marginLeft: '-1px', lineHeight: '1' },
    bottomRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    bottomCard: { backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: '20px' },
};

const card = {
    wrapper: { width: '190px', flexShrink: 0, border: '1px solid #e0e0e0', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' },
    header: { display: 'flex', justifyContent: 'flex-end' },
    badge: { padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' },
    row: { display: 'flex', flexDirection: 'column', gap: '2px' },
    label: { fontSize: '10px', color: '#aaa', fontWeight: '700', textTransform: 'uppercase' },
    value: { fontSize: '13px', color: '#333', fontWeight: '500', lineHeight: '1.3' },
};

const bt = {
    row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' },
    deptName: { fontSize: '14px', fontWeight: '600', color: '#333', flexShrink: 0 },
    countRight: { flex: 1, display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' },
    bar: { height: '6px', backgroundColor: '#1877f2', borderRadius: '3px', opacity: 0.3, minWidth: '4px', maxWidth: '80px' },
    countBadge: { fontSize: '13px', fontWeight: '700', color: '#1877f2', whiteSpace: 'nowrap', flexShrink: 0 },
};

const ba = {
    wrapper: { display: 'flex', flexDirection: 'column', gap: '12px' },
    badge: { alignSelf: 'flex-start', padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', backgroundColor: '#e3f2fd', color: '#1565c0' },
    block: { display: 'flex', flexDirection: 'column', gap: '3px' },
    label: { fontSize: '11px', color: '#aaa', fontWeight: '700', textTransform: 'uppercase' },
    value: { fontSize: '16px', fontWeight: '600', color: '#333', lineHeight: '1.3' },
    sub: { fontSize: '13px', color: '#888', fontWeight: '400' },
};

const m = {
    overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
    box: { backgroundColor: 'white', borderRadius: '10px', width: '100%', maxWidth: '440px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px 14px', borderBottom: '1px solid #f0f0f0' },
    title: { fontSize: '17px', fontWeight: '700', color: '#1a1a1a', margin: 0 },
    closeBtn: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#888' },
    body: { padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' },
    footer: { padding: '14px 24px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' },
    error: { margin: '0 24px', padding: '10px 12px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '6px', fontSize: '13px' },
    field: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '13px', fontWeight: '600', color: '#555' },
    input: { padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' },
    infoBox: { padding: '10px 14px', backgroundColor: '#f5f7fa', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '3px' },
    infoLabel: { fontSize: '11px', color: '#aaa', fontWeight: '700', textTransform: 'uppercase' },
    infoValue: { fontSize: '15px', fontWeight: '700', color: '#1a1a1a' },
    cancelBtn: { padding: '9px 20px', backgroundColor: '#f5f5f5', color: '#333', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' },
    submitBtn: { padding: '9px 20px', backgroundColor: '#1877f2', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
};

const TransferCard = ({ transfer, isActive }) => {
    const ownerDept = (transfer.to_employee ?? transfer.toEmployee)?.department?.name ?? '—';
    const statusInfo = transfer.status === 1
        ? { label: 'Đang thực hiện', bg: '#e3f2fd', color: '#1565c0' }
        : { label: 'Đã xong', bg: '#f5f5f5', color: '#aaa' };

    return (
        <div style={{
            ...card.wrapper,
            borderColor: isActive ? '#1877f2' : '#e0e0e0',
            backgroundColor: isActive ? '#f0f6ff' : '#fff',
        }}>
            <div style={card.header}>
                <span style={{ ...card.badge, backgroundColor: statusInfo.bg, color: statusInfo.color }}>
                    {statusInfo.label}
                </span>
            </div>
            <div style={card.row}>
                <span style={card.label}>Người sở hữu</span>
                <span style={card.value}>{ownerDept}</span>
            </div>
            <div style={card.row}>
                <span style={card.label}>Thời gian nhận</span>
                <span style={card.value}>{fmtDateTime(transfer.start_time) ?? '—'}</span>
            </div>
            <div style={card.row}>
                <span style={card.label}>Thời gian kết thúc</span>
                <span style={{ ...card.value, color: transfer.end_time ? '#333' : '#ccc', fontStyle: transfer.end_time ? 'normal' : 'italic' }}>
                    {fmtDateTime(transfer.end_time) ?? 'Chưa kết thúc'}
                </span>
            </div>
            <div style={card.row}>
                <span style={card.label}>Ghi chú</span>
                <span style={{ ...card.value, color: transfer.note ? '#333' : '#ccc', fontStyle: transfer.note ? 'normal' : 'italic' }}>
                    {transfer.note ?? 'Không có'}
                </span>
            </div>
        </div>
    );
};

const BookTransferDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const canManage = CAN_MANAGE.includes(user?.position);
    const isTruongPhong = IS_TRUONG_PHONG.includes(user?.position);

    const [book, setBook] = useState(null);
    const [transfers, setTransfers] = useState([]);
    const [totalDays, setTotalDays] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showTransferModal, setShowTransferModal] = useState(false);

    const [truongPhongList, setTruongPhongList] = useState([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [transferNote, setTransferNote] = useState('');
    const [transferring, setTransferring] = useState(false);
    const [transferError, setTransferError] = useState('');

    const fetchData = () => {
        setLoading(true);
        Promise.all([
            api.get(`/books/${id}`),
            api.get(`/books/${id}/transfers`),
        ]).then(([bookRes, transferRes]) => {
            if (bookRes.data.success) {
                const d = bookRes.data.data;
                setBook(d?.book ?? d);
                setTotalDays(d?.total_days ?? null);
            }
            const t = transferRes.data?.data ?? [];
            setTransfers(Array.isArray(t) ? [...t].reverse() : []);
        }).catch(() => setError('Không thể tải dữ liệu'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, [id]);

    const openTransferModal = async () => {
        setTransferError(''); setSelectedEmployeeId(''); setTransferNote('');
        if (canManage) {
            try {

                const projRes = await api.get(`/books/${id}/projects`);
                const projects = projRes.data?.data ?? [];


                const results = await Promise.all(
                    projects.map(p =>
                        api.get(`/departments/${p.department_id}`)
                            .then(r => ({ dept: r.data?.data, project: p }))
                            .catch(() => null)
                    )
                );


                const list = [];
                results.forEach(r => {
                    if (!r) return;
                    const employees = r.dept?.employees ?? [];
                    const truong = employees.find(e =>
                        e.status === 1 && e.position?.name === 'Trưởng phòng'
                    );
                    if (truong) {
                        list.push({
                            employeeId: truong.id,
                            deptName: r.dept?.name ?? `Phòng ban #${r.project.department_id}`,
                            deptId: r.project.department_id,
                        });
                    }
                });
                setTruongPhongList(list);
            } catch { setTruongPhongList([]); }
        }
        setShowTransferModal(true);
    };

    const handleSendToAssigned = async () => {
        setTransferring(true); setTransferError('');
        try {

            await api.post(`/books/${id}/send-to-assigned`, {
                note: transferNote.trim() || undefined,
            });
            setShowTransferModal(false);
            fetchData();
        } catch (err) {
            const errData = err.response?.data;
            if (errData?.errors) {

                const errorMessages = Object.values(errData.errors).flat();
                setTransferError(errorMessages.join(' | '));
            } else {
                setTransferError(errData?.message || 'Chuyển giao thất bại');
            }
        } finally { setTransferring(false); }
    };

    const handleCreateTransfer = async () => {
        if (!selectedEmployeeId) return setTransferError('Vui lòng chọn phòng ban');
        setTransferring(true); setTransferError('');
        try {

            await api.post(`/books/${id}/transfers`, {
                to_employee_id: parseInt(selectedEmployeeId),
                note: transferNote.trim() || undefined,
            });
            setShowTransferModal(false);
            fetchData();
        } catch (err) {
            const errData = err.response?.data;
            if (errData?.errors) {

                const errorMessages = Object.values(errData.errors).flat();
                setTransferError(errorMessages.join(' | '));
            } else {
                setTransferError(errData?.message || 'Chuyển giao thất bại');
            }
        } finally { setTransferring(false); }
    };

    if (loading) return <div style={s.center}>Đang tải...</div>;
    if (error) return <div style={{ ...s.center, color: '#c62828' }}>{error}</div>;
    if (!book) return null;

    const statusInfo = STATUS_MAP[book.status];

    const deptCountMap = {};
    transfers.forEach(t => {
        const deptName = (t.to_employee ?? t.toEmployee)?.department?.name;
        if (deptName) deptCountMap[deptName] = (deptCountMap[deptName] ?? 0) + 1;
    });
    const deptCounts = Object.entries(deptCountMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    const activeTransfer = transfers.find(t => t.status === 1) ?? null;

    return (
        <>
            <div style={s.wrapper}>
                <div style={s.topBar}>
                    <button style={s.backBtn} onClick={() => navigate(-1)}>← Quay lại</button>
                    <h2 style={s.pageTitle}>Theo dõi vận hành</h2>
                </div>

                <div style={s.layout}>

                    <div style={s.sidebar}>
                        <div style={s.sectionLabel}>Thông tin sách</div>
                        <div style={s.bookName}>{book.name}</div>
                        {book.bookCode && <div style={s.bookCode}>#{book.bookCode}</div>}
                        <span style={{
                            alignSelf: 'flex-start', padding: '4px 12px', borderRadius: '10px',
                            fontSize: '13px', fontWeight: '600',
                            backgroundColor: statusInfo?.bg, color: statusInfo?.color,
                        }}>{statusInfo?.label}</span>

                        {totalDays != null && (
                            <div style={s.totalDaysBox}>
                                <div style={s.totalDaysNum}>{totalDays}</div>
                                <div style={s.totalDaysLabel}>ngày thực hiện</div>
                            </div>
                        )}

                        <div style={s.infoList}>
                            {[
                                ['Số trang', book.page ?? '—'],
                                ['Khổ giấy', book.paper?.paperSize ?? '—'],
                                ['Bắt đầu', fmtDate(book.start_time)],
                                ['Kết thúc', fmtDate(book.end_time)],
                                ['Người phụ trách', book.assigned_employee?.name ?? '—'],
                            ].map(([label, value]) => (
                                <div key={label} style={s.infoRow}>
                                    <span style={s.infoLabel}>{label}</span>
                                    <span style={s.infoValue}>{value}</span>
                                </div>
                            ))}
                        </div>

                        {book.categories?.length > 0 && (
                            <div>
                                <div style={{ ...s.sectionLabel, marginBottom: '4px' }}>Danh mục</div>
                                <div style={{ fontSize: '14px', color: '#555' }}>
                                    {book.categories.map(c => c.name).join(', ')}
                                </div>
                            </div>
                        )}
                        {book.note && (
                            <div>
                                <div style={{ ...s.sectionLabel, marginBottom: '4px' }}>Ghi chú</div>
                                <div style={s.noteBox}>{book.note}</div>
                            </div>
                        )}
                    </div>


                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>


                        <div style={s.content}>
                            <div style={s.flowHeader}>
                                <span style={s.sectionLabel}>Lịch sử vận hành</span>
                                <span style={s.flowCount}>{transfers.length} bước</span>
                                {(canManage || isTruongPhong) && book.status !== 3 && book.status !== 0 && (
                                    <button style={s.transferBtn} onClick={openTransferModal}>
                                        ⇄ Chuyển giao
                                    </button>
                                )}
                            </div>
                            {transfers.length === 0 ? (
                                <div style={s.empty}>Chưa có dữ liệu vận hành</div>
                            ) : (
                                <div style={s.flowScroll}>
                                    <div style={s.flowRow}>
                                        {transfers.map((t, idx) => {
                                            const isLast = idx === transfers.length - 1;
                                            return (
                                                <React.Fragment key={t.id}>
                                                    <TransferCard transfer={t} isActive={t.status === 1} />
                                                    {!isLast && (
                                                        <div style={s.arrow}>
                                                            <div style={s.arrowLine} />
                                                            <span style={s.arrowHead}>▶</span>
                                                        </div>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>


                        <div style={s.bottomRow}>

                            <div style={s.bottomCard}>
                                <div style={{ ...s.sectionLabel, marginBottom: '12px' }}>Số lần xử lý theo phòng ban</div>
                                {deptCounts.length === 0 ? (
                                    <div style={s.empty}>Chưa có dữ liệu</div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {deptCounts.map(({ name, count }) => (
                                            <div key={name} style={bt.row}>
                                                <span style={bt.deptName}>{name}</span>
                                                <div style={bt.countRight}>
                                                    <div style={{
                                                        ...bt.bar,
                                                        width: `${Math.min(count / Math.max(...deptCounts.map(d => d.count)) * 100, 100)}%`,
                                                    }} />
                                                    <span style={bt.countBadge}>{count} lần</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>


                            <div style={s.bottomCard}>
                                <div style={{ ...s.sectionLabel, marginBottom: '12px' }}>Đang thực hiện</div>
                                {!activeTransfer ? (
                                    <div style={s.empty}>Không có transfer đang hoạt động</div>
                                ) : (
                                    <div style={ba.wrapper}>
                                        <span style={ba.badge}>Đang thực hiện</span>
                                        <div style={ba.block}>
                                            <div style={ba.label}>Người sở hữu</div>
                                            <div style={ba.value}>
                                                {(activeTransfer.to_employee ?? activeTransfer.toEmployee)?.department?.name ?? '—'}
                                            </div>
                                        </div>
                                        <div style={ba.block}>
                                            <div style={ba.label}>Được chuyển từ</div>
                                            <div style={ba.value}>
                                                {(activeTransfer.from_employee ?? activeTransfer.fromEmployee)?.name ?? '—'}
                                                {(activeTransfer.from_employee ?? activeTransfer.fromEmployee)?.department?.name && (
                                                    <span style={ba.sub}>
                                                        {' '}· {(activeTransfer.from_employee ?? activeTransfer.fromEmployee)?.department?.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div style={ba.block}>
                                            <div style={ba.label}>Thời gian nhận</div>
                                            <div style={ba.value}>{fmtDateTime(activeTransfer.start_time) ?? '—'}</div>
                                        </div>
                                        <div style={ba.block}>
                                            <div style={ba.label}>Thời gian kết thúc</div>
                                            <div style={{ ...ba.value, color: activeTransfer.end_time ? '#333' : '#aaa', fontStyle: activeTransfer.end_time ? 'normal' : 'italic' }}>
                                                {fmtDateTime(activeTransfer.end_time) ?? 'Chưa kết thúc'}
                                            </div>
                                        </div>
                                        <div style={ba.block}>
                                            <div style={ba.label}>Ghi chú</div>
                                            <div style={{ ...ba.value, color: activeTransfer.note ? '#333' : '#aaa', fontStyle: activeTransfer.note ? 'normal' : 'italic' }}>
                                                {activeTransfer.note ?? 'Không có'}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {showTransferModal && (
                <div style={m.overlay} onClick={() => setShowTransferModal(false)}>
                    <div style={m.box} onClick={e => e.stopPropagation()}>
                        <div style={m.header}>
                            <h3 style={m.title}>Chuyển giao sách</h3>
                            <button style={m.closeBtn} onClick={() => setShowTransferModal(false)}>✕</button>
                        </div>

                        {transferError && <div style={m.error}>{transferError}</div>}

                        <div style={m.body}>
                            {isTruongPhong ? (
                                <>
                                    <div style={m.infoBox}>
                                        <div style={m.infoLabel}>Gửi về</div>
                                        <div style={m.infoValue}>Thư ký biên tập ({book.assigned_employee?.name ?? '—'})</div>
                                    </div>
                                    <div style={m.field}>
                                        <label style={m.label}>Ghi chú</label>
                                        <textarea
                                            value={transferNote}
                                            onChange={e => setTransferNote(e.target.value)}
                                            style={{ ...m.input, height: '80px', resize: 'vertical' }}
                                            placeholder="Có thể để trống"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    {activeTransfer && (
                                        <div style={m.infoBox}>
                                            <div style={m.infoLabel}>Chuyển từ</div>
                                            <div style={m.infoValue}>
                                                {(activeTransfer.to_employee ?? activeTransfer.toEmployee)?.department?.name ?? '—'}
                                            </div>
                                        </div>
                                    )}
                                    <div style={m.field}>
                                        <label style={m.label}>Chọn phòng ban nhận <span style={{ color: '#e53935' }}>*</span></label>
                                        {truongPhongList.length === 0 ? (
                                            <div style={{ fontSize: '13px', color: '#aaa', fontStyle: 'italic', padding: '8px 0' }}>
                                                Không có phòng ban nào có Trưởng phòng đang hoạt động
                                            </div>
                                        ) : (
                                            <select
                                                value={selectedEmployeeId}
                                                onChange={e => setSelectedEmployeeId(e.target.value)}
                                                style={m.input}
                                            >
                                                <option value="">-- Chọn phòng ban --</option>
                                                {truongPhongList.map(item => (
                                                    <option key={item.employeeId} value={item.employeeId}>
                                                        {item.deptName}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                    <div style={m.field}>
                                        <label style={m.label}>Ghi chú</label>
                                        <textarea
                                            value={transferNote}
                                            onChange={e => setTransferNote(e.target.value)}
                                            style={{ ...m.input, height: '80px', resize: 'vertical' }}
                                            placeholder="Có thể để trống"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div style={m.footer}>
                            <button style={m.cancelBtn} onClick={() => setShowTransferModal(false)} disabled={transferring}>
                                Hủy
                            </button>
                            <button
                                style={m.submitBtn}
                                onClick={isTruongPhong ? handleSendToAssigned : handleCreateTransfer}
                                disabled={transferring || (!isTruongPhong && !selectedEmployeeId)}
                            >
                                {transferring ? 'Đang chuyển...' : 'Xác nhận chuyển giao'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BookTransferDetail;