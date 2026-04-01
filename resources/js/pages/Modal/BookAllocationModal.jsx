import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { modal } from './booksConstants';

const BookAllocationModal = ({ book, onClose }) => {
    console.log('Book received:', book);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        api.get(`/books/${book.id}/allocations-report`)
            .then(r => {
                if (r.data.success) setData(r.data.data);
                else setError(r.data.message ?? 'Không thể tải dữ liệu');
            })
            .catch(() => setError('Lỗi khi tải dữ liệu'))
            .finally(() => setLoading(false));
    }, [book.id]);

    const handleExport = async () => {
        setExporting(true);
        try {
            const r = await api.get(
                `/reports/books/${book.id}/allocations-report/export`,
                { responseType: 'blob' }
            );
            const url = URL.createObjectURL(new Blob([r.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = `allocation-${book.id}-${book.name}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        } catch {
            setError('Xuất PDF thất bại');
        } finally {
            setExporting(false);
        }
    };

    const allocations = data?.allocations ?? [];

    return (
        <div style={modal.overlay} onClick={onClose}>
            <div style={{ ...modal.box, maxWidth: '780px', width: '95vw' }} onClick={e => e.stopPropagation()}>

                {/* header */}
                <div style={modal.header}>
                    <div>
                        <h3 style={modal.title}>Danh sách thực hiện</h3>
                        {data?.book && (
                            <p style={{ margin: 0, fontSize: 13, color: '#888', marginTop: 3 }}>
                                {data.book.name}
                                {data.book.bookCode ? ` — #${data.book.bookCode}` : ''}
                                {data.book.paper ? ` — Khổ ${data.book.paper}` : ''}
                            </p>
                        )}
                    </div>
                    <button style={modal.closeBtn} onClick={onClose}>✕</button>
                </div>

                {error && <div style={modal.error}>{error}</div>}

                {/* body */}
                <div style={{ overflowY: 'auto', maxHeight: '60vh' }}>
                    {loading ? (
                        <div style={s.center}>Đang tải...</div>
                    ) : allocations.length === 0 ? (
                        <div style={s.center}>Không có dữ liệu</div>
                    ) : (
                        <table style={s.table}>
                            <thead>
                                <tr>
                                    {['#', 'Tên nhân viên', 'Phòng ban', 'Chức vụ', 'Số trang HT', 'Công việc'].map(h => (
                                        <th key={h} style={s.th}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {allocations.map((row, i) => (
                                    <tr key={i} style={i % 2 === 0 ? s.trEven : s.trOdd}>
                                        <td style={s.tdCenter}>{i + 1}</td>
                                        <td style={s.tdLeft}>{row.employee_name ?? '—'}</td>
                                        <td style={s.tdCenter}>{row.department ?? '—'}</td>
                                        <td style={s.tdCenter}>{row.position ?? '—'}</td>
                                        <td style={s.tdCenter}>{row.completed_page ?? 0}</td>
                                        <td style={s.tdLeft}>
                                            {row.jobs?.length > 0
                                                ? row.jobs.map((job, j) => (
                                                    <span key={j} style={s.jobTag}>{job}</span>
                                                ))
                                                : '—'
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr style={s.tfootRow}>
                                    <td colSpan={4} style={{ ...s.tdCenter, fontWeight: 700 }}>Tổng</td>
                                    <td style={{ ...s.tdCenter, fontWeight: 700, color: '#1877f2' }}>
                                        {allocations.reduce((sum, r) => sum + (r.completed_page ?? 0), 0)}
                                    </td>
                                    <td />
                                </tr>
                            </tfoot>
                        </table>
                    )}
                </div>

                {/* footer */}
                <div style={{ ...modal.footer, justifyContent: 'space-between' }}>
                    <button style={modal.cancelBtn} onClick={onClose}>Đóng</button>
                    {!loading && allocations.length > 0 && (
                        <button style={s.exportBtn} onClick={handleExport} disabled={exporting}>
                            {exporting ? 'Đang xuất...' : '⬇  Xuất PDF'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const s = {
    center: { textAlign: 'center', padding: '40px', color: '#aaa' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
    th: {
        padding: '10px 12px', background: '#1a3a6b', color: '#fff',
        fontWeight: 700, fontSize: 12, textAlign: 'center',
        whiteSpace: 'nowrap', position: 'sticky', top: 0,
    },
    trEven: { background: '#fff' },
    trOdd: { background: '#f7f9fc' },
    tdCenter: { padding: '9px 10px', textAlign: 'center', borderBottom: '1px solid #f0f2f5', color: '#333' },
    tdLeft: { padding: '9px 12px', textAlign: 'left', borderBottom: '1px solid #f0f2f5', color: '#1a1a1a' },
    tfootRow: { background: '#f0f2f7' },
    // jobTag: {
    //     display: 'inline-block', padding: '2px 8px', margin: '2px 3px 2px 0',
    //     background: '#e8f0fe', color: '#1877f2', borderRadius: 4,
    //     fontSize: 11, fontWeight: 600,
    // },
    jobTag: {
        display: 'inline-block',
        padding: '2px 8px',
        margin: '2px 3px 2px 0',
        fontSize: 11,
        fontWeight: 'normal',
        color: '#333',
        background: 'transparent',
    },

    exportBtn: {
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '9px 20px', background: '#1877f2', color: '#fff',
        border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer',
        boxShadow: '0 3px 10px rgba(24,119,242,.3)',
    },
};

export default BookAllocationModal;