import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const styles = {
    wrapper: { padding: '24px', maxWidth: '1400px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    title: { fontSize: '24px', fontWeight: '700', color: '#1a1a1a', margin: 0 },
    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' },
    statCard: { backgroundColor: '#f8f9fa', borderRadius: '10px', padding: '14px 18px' },
    statLabel: { fontSize: '12px', color: '#888', marginBottom: '4px' },
    statValue: { fontSize: '22px', fontWeight: '700', color: '#1a1a1a' },
    filterCard: { backgroundColor: 'white', borderRadius: '12px', border: '1px solid #eaeef2', padding: '16px 20px', marginBottom: '16px' },
    filterGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' },
    filterGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
    filterLabel: { fontSize: '12px', color: '#888', fontWeight: '600' },
    input: { padding: '8px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', outline: 'none', width: '100%' },
    select: { padding: '8px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', outline: 'none', width: '100%', backgroundColor: 'white' },
    tableCard: { backgroundColor: 'white', borderRadius: '12px', border: '1px solid #eaeef2', overflow: 'hidden' },
    tableWrap: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
    th: { padding: '11px 14px', textAlign: 'left', backgroundColor: '#f8f9fa', borderBottom: '2px solid #e0e0e0', fontSize: '12px', fontWeight: '700', color: '#555', whiteSpace: 'nowrap' },
    td: { padding: '11px 14px', borderBottom: '1px solid #eaeef2', color: '#333', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    pagination: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #eaeef2' },
    pagInfo: { fontSize: '13px', color: '#888' },
    pagBtns: { display: 'flex', gap: '6px' },
    pagBtn: { padding: '5px 11px', fontSize: '12px', borderRadius: '6px', cursor: 'pointer', border: '1px solid #ddd', backgroundColor: 'white', color: '#333' },
    pagBtnActive: { backgroundColor: '#1877f2', color: 'white', borderColor: '#1877f2' },
    pagBtnDisabled: { opacity: 0.4, cursor: 'default' },
    btn: { padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', border: '1px solid #ddd', backgroundColor: 'white', color: '#333' },
    btnDanger: { backgroundColor: '#ffebee', color: '#c62828', borderColor: '#ffcdd2' },
    resetBtn: { padding: '7px 14px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', border: '1px solid #ddd', backgroundColor: 'white', color: '#555' },
    overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { backgroundColor: 'white', borderRadius: '12px', width: '90%', maxWidth: '520px', maxHeight: '85vh', overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' },
    modalHeader: { padding: '16px 20px', borderBottom: '1px solid #eaeef2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10 },
    modalTitle: { fontSize: '16px', fontWeight: '700', margin: 0 },
    closeBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' },
    modalBody: { padding: '16px 20px' },
    detailRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid #eaeef2', gap: '12px' },
    detailKey: { fontSize: '12px', color: '#888', minWidth: '110px', paddingTop: '1px' },
    detailVal: { fontSize: '13px', color: '#333', textAlign: 'right', wordBreak: 'break-word', maxWidth: '280px' },
    jsonBlock: { backgroundColor: '#f8f9fa', borderRadius: '6px', padding: '10px 12px', fontSize: '12px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginTop: '6px', maxHeight: '160px', overflowY: 'auto', color: '#333' },
    sectionTitle: { fontSize: '11px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '14px 0 6px' },
    loading: { textAlign: 'center', padding: '48px', color: '#888', fontSize: '14px' },
    errorMsg: { backgroundColor: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' },
};

const ACTION_COLORS = {
    create: { bg: '#e6f4ea', color: '#2e7d32' },
    update: { bg: '#e3f2fd', color: '#1565c0' },
    delete: { bg: '#ffebee', color: '#c62828' },
    login: { bg: '#ede7f6', color: '#4527a0' },
    logout: { bg: '#f5f5f5', color: '#555' },
    login_failed: { bg: '#fff3e0', color: '#e65100' },
    login_blocked: { bg: '#fce4ec', color: '#880e4f' },
};

const METHOD_COLORS = {
    GET: { bg: '#e6f4ea', color: '#2e7d32' },
    POST: { bg: '#e3f2fd', color: '#1565c0' },
    PATCH: { bg: '#fff3e0', color: '#e65100' },
    PUT: { bg: '#ede7f6', color: '#4527a0' },
    DELETE: { bg: '#ffebee', color: '#c62828' },
};

const Badge = ({ text, colorMap }) => {
    const c = colorMap?.[text] || { bg: '#f5f5f5', color: '#555' };
    return (
        <span style={{ display: 'inline-block', padding: '2px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', backgroundColor: c.bg, color: c.color }}>
            {text || '—'}
        </span>
    );
};

const AuditLog = () => {
    const [logs, setLogs] = useState([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 15 });
    const [stats, setStats] = useState({ total: 0, today: 0, users: 0, failed: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [filters, setFilters] = useState({
        search: '', module: '', action: '', from_date: '', to_date: ''
    });

    const [appliedFilters, setAppliedFilters] = useState({
        search: '', module: '', action: '', from_date: '', to_date: ''
    });

    const [modules, setModules] = useState([]);
    const [actions, setActions] = useState([]);

    const [detailLog, setDetailLog] = useState(null);
    const [showCleanModal, setShowCleanModal] = useState(false);
    const [cleanDays, setCleanDays] = useState(90);
    const [cleaning, setCleaning] = useState(false);

    useEffect(() => {
        fetchMeta();
    }, []);

    useEffect(() => {
        fetchLogs(1);
    }, [appliedFilters]);

    const fetchMeta = async () => {
        try {
            const [modRes, actRes, statsRes] = await Promise.all([
                api.get('/audit-logs/modules'),
                api.get('/audit-logs/actions'),
                api.get('/audit-logs/stats'),
            ]);
            if (modRes.data.success) setModules(modRes.data.data);
            if (actRes.data.success) setActions(actRes.data.data);
            if (statsRes.data.success) {
                const d = statsRes.data.data;
                const today = new Date().toISOString().slice(0, 10);
                const todayCount = d.by_date?.find(x => x.date === today)?.total || 0;
                const failedCount = d.by_action?.find(x => x.action === 'login_failed')?.total || 0;
                setStats({
                    total: d.total || 0,
                    today: todayCount,
                    users: 0,
                    failed: failedCount,
                });
            }
        } catch (err) {
            console.error('Lỗi fetch meta:', err);
        }
    };

    const fetchLogs = useCallback(async (page = 1) => {
        setLoading(true);
        setError('');
        try {
            const params = { ...appliedFilters, page, per_page: 15 };
            if (params.search) { params.user_name = params.search; }
            delete params.search;

            const res = await api.get('/audit-logs', { params });
            if (res.data.success) {
                setLogs(res.data.data);
                setMeta(res.data.meta);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    }, [appliedFilters]);

    const handleSearch = () => {
        setAppliedFilters({ ...filters });
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const resetFilters = () => {
        const empty = { search: '', module: '', action: '', from_date: '', to_date: '' };
        setFilters(empty);
        setAppliedFilters(empty);
    };

    const handleClean = async () => {
        setCleaning(true);
        try {
            const res = await api.delete('/audit-logs/clean', { params: { days: cleanDays } });
            if (res.data.success) {
                alert(res.data.message);
                setShowCleanModal(false);
                fetchLogs(1);
                fetchMeta();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setCleaning(false);
        }
    };

    const fmtDate = (dt) => {
        if (!dt) return '—';
        return new Date(dt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const renderPageBtns = () => {
        const { current_page, last_page } = meta;
        const btns = [];

        btns.push(
            <button key="prev" style={{ ...styles.pagBtn, ...(current_page === 1 ? styles.pagBtnDisabled : {}) }}
                onClick={() => fetchLogs(current_page - 1)} disabled={current_page === 1}>‹</button>
        );

        for (let i = 1; i <= last_page; i++) {
            if (last_page <= 5 || Math.abs(i - current_page) <= 1 || i === 1 || i === last_page) {
                btns.push(
                    <button key={i} style={{ ...styles.pagBtn, ...(i === current_page ? styles.pagBtnActive : {}) }}
                        onClick={() => fetchLogs(i)}>{i}</button>
                );
            } else if (Math.abs(i - current_page) === 2) {
                btns.push(<span key={`e${i}`} style={{ padding: '5px 4px', color: '#aaa', fontSize: '12px' }}>…</span>);
            }
        }

        btns.push(
            <button key="next" style={{ ...styles.pagBtn, ...(current_page === last_page ? styles.pagBtnDisabled : {}) }}
                onClick={() => fetchLogs(current_page + 1)} disabled={current_page === last_page}>›</button>
        );

        return btns;
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.header}>
                <h1 style={styles.title}>Nhật ký hoạt động</h1>
                <button style={{ ...styles.btn, ...styles.btnDanger }} onClick={() => setShowCleanModal(true)}>
                    Dọn log cũ
                </button>
            </div>

            {/* Stats */}
            <div style={styles.statsRow}>
                {[
                    { label: 'Tổng log', value: stats.total.toLocaleString() },
                    { label: 'Hôm nay', value: stats.today.toLocaleString() },
                    { label: 'Lỗi đăng nhập', value: stats.failed.toLocaleString() },
                ].map((s, i) => (
                    <div key={i} style={styles.statCard}>
                        <div style={styles.statLabel}>{s.label}</div>
                        <div style={styles.statValue}>{s.value}</div>
                    </div>
                ))}
            </div>

            <div style={styles.filterCard}>
                <div style={styles.filterGrid}>
                    <div style={styles.filterGroup}>
                        <span style={styles.filterLabel}>Tìm nhân viên</span>
                        <input
                            style={styles.input}
                            placeholder="Tên hoặc username..."
                            value={filters.search}
                            onChange={e => handleFilterChange('search', e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}  // ✅ thêm Enter
                        />
                    </div>
                    <div style={styles.filterGroup}>
                        <span style={styles.filterLabel}>Module</span>
                        <select style={styles.select} value={filters.module}
                            onChange={e => handleFilterChange('module', e.target.value)}>
                            <option value="">Tất cả module</option>
                            {modules.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div style={styles.filterGroup}>
                        <span style={styles.filterLabel}>Hành động</span>
                        <select style={styles.select} value={filters.action}
                            onChange={e => handleFilterChange('action', e.target.value)}>
                            <option value="">Tất cả hành động</option>
                            {actions.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>

                    <div style={styles.filterGroup}>
                        <span style={styles.filterLabel}>Từ ngày</span>
                        <input type="date" style={styles.input} value={filters.from_date}
                            onChange={e => handleFilterChange('from_date', e.target.value)} />
                    </div>
                    <div style={styles.filterGroup}>
                        <span style={styles.filterLabel}>Đến ngày</span>
                        <input type="date" style={styles.input} value={filters.to_date}
                            onChange={e => handleFilterChange('to_date', e.target.value)} />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={styles.resetBtn} onClick={resetFilters}>
                        Xóa bộ lọc
                    </button>
                    <button
                        style={{ ...styles.btn, backgroundColor: '#1877f2', color: 'white', borderColor: '#1877f2' }}
                        onClick={handleSearch}
                    >
                        Tìm kiếm
                    </button>
                </div>
            </div>


            {/* Table */}
            <div style={styles.tableCard}>
                {error && <div style={{ ...styles.errorMsg, margin: '16px' }}>{error}</div>}
                <div style={styles.tableWrap}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Thời gian</th>
                                <th style={styles.th}>Nhân viên</th>
                                <th style={styles.th}>Module</th>
                                <th style={styles.th}>Hành động</th>
                                <th style={styles.th}>Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={styles.loading}>Đang tải...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan="5" style={{ ...styles.td, textAlign: 'center', color: '#888', padding: '40px' }}>Không có dữ liệu</td></tr>
                            ) : logs.map(log => (
                                <tr key={log.id}>
                                    <td style={{ ...styles.td, fontSize: '12px', color: '#888' }}>{fmtDate(log.created_at)}</td>
                                    <td style={styles.td}>
                                        <div style={{ fontWeight: '600' }}>{log.user_name || '—'}</div>
                                        {log.user_position && <div style={{ fontSize: '11px', color: '#aaa' }}>{log.user_position}</div>}
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#666' }}>{log.module || '—'}</span>
                                    </td>
                                    <td style={styles.td}>
                                        <Badge text={log.action} colorMap={ACTION_COLORS} />
                                    </td>

                                    <td style={styles.td}>
                                        <button
                                            style={{ padding: '3px 10px', fontSize: '11px', borderRadius: '6px', cursor: 'pointer', border: '1px solid #ddd', backgroundColor: 'white', color: '#555' }}
                                            onClick={() => setDetailLog(log)}
                                        >
                                            Xem
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div style={styles.pagination}>
                    <span style={styles.pagInfo}>
                        {meta.total > 0
                            ? `${((meta.current_page - 1) * meta.per_page) + 1}–${Math.min(meta.current_page * meta.per_page, meta.total)} / ${meta.total} bản ghi`
                            : '0 bản ghi'}
                    </span>
                    <div style={styles.pagBtns}>{renderPageBtns()}</div>
                </div>
            </div>

            {/* Detail Modal */}
            {detailLog && (
                <div style={styles.overlay} onClick={() => setDetailLog(null)}>
                    <div style={styles.modal} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>Chi tiết log #{detailLog.id}</h3>
                            <button style={styles.closeBtn} onClick={() => setDetailLog(null)}>✕</button>
                        </div>
                        <div style={styles.modalBody}>
                            {[
                                ['Thời gian', fmtDate(detailLog.created_at)],
                                ['Nhân viên', detailLog.user_name],
                                ['Chức vụ', detailLog.user_position],
                                ['Module', detailLog.module],
                                ['Record ID', detailLog.record_id],
                                ['IP', detailLog.ip_address],
                                ['URL', detailLog.url],
                            ].map(([k, v]) => (
                                <div key={k} style={styles.detailRow}>
                                    <span style={styles.detailKey}>{k}</span>
                                    <span style={{ ...styles.detailVal, fontFamily: k === 'URL' ? 'monospace' : 'inherit', fontSize: k === 'URL' ? '11px' : '13px' }}>
                                        {v || '—'}
                                    </span>
                                </div>
                            ))}
                            <div style={styles.detailRow}>
                                <span style={styles.detailKey}>Hành động</span>
                                <Badge text={detailLog.action} colorMap={ACTION_COLORS} />
                            </div>
                            {detailLog.old_data && (
                                <>
                                    <div style={styles.sectionTitle}>Dữ liệu cũ</div>
                                    <div style={styles.jsonBlock}>{JSON.stringify(detailLog.old_data, null, 2)}</div>
                                </>
                            )}
                            {detailLog.new_data && (
                                <>
                                    <div style={styles.sectionTitle}>Dữ liệu mới</div>
                                    <div style={styles.jsonBlock}>{JSON.stringify(detailLog.new_data, null, 2)}</div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Clean Modal */}
            {showCleanModal && (
                <div style={styles.overlay} onClick={() => setShowCleanModal(false)}>
                    <div style={{ ...styles.modal, maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>Dọn log cũ</h3>
                            <button style={styles.closeBtn} onClick={() => setShowCleanModal(false)}>✕</button>
                        </div>
                        <div style={styles.modalBody}>
                            <div style={styles.filterGroup}>
                                <span style={styles.filterLabel}>Xóa log cũ hơn (ngày)</span>
                                <input type="number" style={{ ...styles.input, marginTop: '6px' }}
                                    value={cleanDays} min={1}
                                    onChange={e => setCleanDays(e.target.value)} />
                            </div>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
                                <button style={styles.btn} onClick={() => setShowCleanModal(false)}>Hủy</button>
                                <button style={{ ...styles.btn, ...styles.btnDanger }} onClick={handleClean} disabled={cleaning}>
                                    {cleaning ? 'Đang xóa...' : 'Xác nhận xóa'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLog;