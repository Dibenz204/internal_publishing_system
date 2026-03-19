import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// ─── helpers ────────────────────────────────────────────────────────────────
const THIS_YEAR = new Date().getFullYear();
const THIS_MONTH = new Date().getMonth() + 1;
const YEARS = Array.from({ length: 6 }, (_, i) => THIS_YEAR - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

const fmt = (n) =>
    n != null ? Number(n).toLocaleString('vi-VN') + ' ₫' : '—';

const ADMIN_POSITIONS = ['Admin', 'Kế toán'];

// ─── Select component dùng options array, tránh children key warning ─────────
const Select = ({ label, value, onChange, options = [], placeholder, disabled }) => (
    <label style={ui.fieldWrap}>
        <span style={ui.fieldLabel}>{label}</span>
        <div style={ui.selectWrap}>
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                disabled={disabled}
                style={{ ...ui.select, ...(disabled ? { background: '#f4f6f9', cursor: 'not-allowed' } : {}) }}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
            <span style={ui.chevron}>▾</span>
        </div>
    </label>
);

const Tag = ({ children, color = '#1877f2' }) => (
    <span style={{ ...ui.tag, background: color + '18', color }}>{children}</span>
);

// ─── main ────────────────────────────────────────────────────────────────────
export default function ReportPage() {
    const { user } = useAuth();
    const isAdmin = ADMIN_POSITIONS.includes(user?.position);

    // filter state
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [deptId, setDeptId] = useState('');
    const [empId, setEmpId] = useState('');
    const [month, setMonth] = useState(String(THIS_MONTH));
    const [year, setYear] = useState(String(THIS_YEAR));

    // data state
    const [rows, setRows] = useState([]);
    const [totalSalary, setTotalSalary] = useState(0);
    const [generatedAt, setGeneratedAt] = useState('');
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [fetched, setFetched] = useState(false);
    const [error, setError] = useState('');

    // load departments (admin only)
    useEffect(() => {
        if (isAdmin) {
            api.get('/departments').then(r => {
                if (r.data.success) setDepartments(r.data.data);
            });
        } else {
            setDeptId(String(user?.employee?.department_id ?? ''));
        }
    }, [isAdmin]);

    // load employees when dept changes
    useEffect(() => {
        setEmpId('');
        setEmployees([]);
        if (!deptId) return;
        api.get(`/departments/${deptId}/employees`).then(r => {
            const raw = r.data.data ?? r.data ?? [];
            const list = Array.isArray(raw) ? raw : Object.values(raw);
            console.log('employees raw:', list);
            setEmployees(list);
        }).catch(() => { setEmployees([]); });
    }, [deptId]);

    const buildFromDate = () => `${year}-${String(month).padStart(2, '0')}-01`;
    const buildToDate = () => {
        const d = new Date(year, month, 0);
        return `${year}-${String(month).padStart(2, '0')}-${d.getDate()}`;
    };

    const effectiveDeptId = isAdmin ? deptId : (user?.employee?.department_id ?? '');

    const handleFetch = async () => {
        if (!effectiveDeptId) { setError('Vui lòng chọn phòng ban'); return; }
        setError(''); setLoading(true); setFetched(false);
        try {
            const params = new URLSearchParams({
                from_date: buildFromDate(),
                to_date: buildToDate(),
                ...(empId ? { employee_id: empId } : {})
            });
            const r = await api.get(`/reports/department/${effectiveDeptId}?${params}`);
            const d = r.data.data;
            setRows(d.projects ?? []);
            setTotalSalary(d.total_salary ?? 0);
            setGeneratedAt(d.generated_at ?? '');
            setFetched(true);
        } catch (e) {
            setError(e.response?.data?.message ?? 'Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        if (!effectiveDeptId) return;
        setExporting(true);
        try {
            const params = new URLSearchParams({
                from_date: buildFromDate(),
                to_date: buildToDate(),
                ...(empId ? { employee_id: empId } : {})
            });
            const r = await api.get(
                `/reports/department/${effectiveDeptId}/export?${params}`,
                { responseType: 'blob' }
            );
            const url = URL.createObjectURL(new Blob([r.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = `bao-cao-${effectiveDeptId}-thang${month}-${year}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        } catch {
            setError('Xuất PDF thất bại');
        } finally {
            setExporting(false);
        }
    };

    // options cho Select
    const deptOptions = departments
        .filter(d => d.status === 1)
        .map(d => ({ value: String(d.id), label: d.name }));

    const empOptions = employees.map(e => ({ value: String(e.id), label: e.name }));

    const monthOptions = MONTHS.map(m => ({ value: String(m), label: `Tháng ${m}` }));
    const yearOptions = YEARS.map(y => ({ value: String(y), label: String(y) }));

    const selectedDeptName = isAdmin
        ? departments.find(d => String(d.id) === String(deptId))?.name ?? ''
        : user?.employee?.department ?? '';

    const selectedEmpName = employees.find(e => String(e.id) === String(empId))?.name ?? '';

    // ── render ────────────────────────────────────────────────────────────────
    return (
        <div style={pg.root}>

            {/* ── header strip ── */}
            <div style={pg.hero}>
                <div style={pg.heroInner}>
                    <div>
                        <p style={pg.heroEyebrow}>Quyết toán năng suất</p>
                        <h1 style={pg.heroTitle}>Báo cáo khối lượng biên tập</h1>
                    </div>
                    <div style={pg.heroMeta}>
                        <span style={pg.heroUser}>{user?.employee?.name ?? user?.username}</span>
                        <Tag color={isAdmin ? '#e53935' : '#1877f2'}>
                            {user?.position}
                        </Tag>
                    </div>
                </div>
            </div>

            {/* ── filter card ── */}
            <div style={pg.body}>
                <div style={pg.filterCard}>
                    <p style={pg.cardLabel}>Bộ lọc</p>
                    <div style={pg.filterGrid}>

                        {/* dept */}
                        {isAdmin ? (
                            <Select
                                label="Phòng ban"
                                value={deptId}
                                onChange={setDeptId}
                                options={deptOptions}
                                placeholder="— Chọn phòng ban —"
                            />
                        ) : (
                            <label style={ui.fieldWrap}>
                                <span style={ui.fieldLabel}>Phòng ban</span>
                                <div style={{ ...ui.select, background: '#f4f6f9', color: '#555', display: 'flex', alignItems: 'center' }}>
                                    {selectedDeptName || '—'}
                                </div>
                            </label>
                        )}

                        {/* employee */}
                        <Select
                            label="Nhân viên"
                            value={empId}
                            onChange={setEmpId}
                            options={empOptions}
                            placeholder="— Tất cả nhân viên —"
                            disabled={isAdmin && !deptId}
                        />

                        {/* month */}
                        <Select
                            label="Tháng"
                            value={month}
                            onChange={setMonth}
                            options={monthOptions}
                        />

                        {/* year */}
                        <Select
                            label="Năm"
                            value={year}
                            onChange={setYear}
                            options={yearOptions}
                        />
                    </div>

                    {error && <div style={pg.errorBanner}>{error}</div>}

                    <div style={pg.filterActions}>
                        <button onClick={handleFetch} disabled={loading} style={pg.btnPrimary}>
                            {loading
                                ? <><span style={pg.spinner} /> Đang tải...</>
                                : 'Xem báo cáo'
                            }
                        </button>
                        {fetched && rows.length > 0 && (
                            <button onClick={handleExport} disabled={exporting} style={pg.btnOutline}>
                                {exporting ? 'Đang xuất...' : 'Xuất PDF'}
                            </button>
                        )}
                    </div>
                </div>

                {/* ── result ── */}
                {fetched && (
                    <div style={pg.resultBlock}>

                        {/* summary bar */}
                        <div style={pg.summaryBar}>
                            <div style={pg.summaryItem}>
                                <span style={pg.summaryKey}>Phòng ban</span>
                                <span style={pg.summaryVal}>{selectedDeptName || '—'}</span>
                            </div>
                            {selectedEmpName && (
                                <div style={pg.summaryItem}>
                                    <span style={pg.summaryKey}>Nhân viên</span>
                                    <span style={pg.summaryVal}>{selectedEmpName}</span>
                                </div>
                            )}
                            <div style={pg.summaryItem}>
                                <span style={pg.summaryKey}>Kỳ</span>
                                <span style={pg.summaryVal}>Tháng {month}/{year}</span>
                            </div>
                            <div style={{ ...pg.summaryItem, marginLeft: 'auto', borderRight: 'none' }}>
                                <span style={pg.summaryKey}>Tổng lương</span>
                                <span style={{ ...pg.summaryVal, color: '#e53935', fontWeight: 700 }}>
                                    {fmt(totalSalary)}
                                </span>
                            </div>
                        </div>

                        {rows.length === 0 ? (
                            <div style={pg.empty}>Không có dữ liệu trong kỳ này.</div>
                        ) : (
                            <div style={pg.tableWrap}>
                                <table style={pg.table}>
                                    <thead>
                                        <tr>
                                            {['TT', 'Tên sách', 'Số trang', 'Khổ', 'HS khổ', 'Trang QĐ',
                                                'BT', 'ĐC', 'SB', 'Trang BT', 'Trang ĐC', 'Trang SB',
                                                'Trang quyết định', 'Phòng ban', 'Số tiền', 'Người TH'
                                            ].map(h => (
                                                <th key={h} style={pg.th}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((row, i) => (
                                            <tr key={i} style={i % 2 === 0 ? pg.trEven : pg.trOdd}>
                                                <td style={pg.tdCenter}>{row.index}</td>
                                                <td style={pg.tdLeft}>{row.book_name ?? '—'}</td>
                                                <td style={pg.tdCenter}>{row.completed_page}</td>
                                                <td style={pg.tdCenter}>{row.paper_size ?? '—'}</td>
                                                <td style={pg.tdCenter}>{row.paper_coefficient}</td>
                                                <td style={pg.tdCenter}>{row.conversion_page}</td>
                                                <td style={pg.tdCenter}>{row.editing_coefficient}</td>
                                                <td style={pg.tdCenter}>{row.proofreading_coefficient}</td>
                                                <td style={pg.tdCenter}>{row.correction_coefficient}</td>
                                                <td style={pg.tdCenter}>{row.editing_page}</td>
                                                <td style={pg.tdCenter}>{row.proofreading_page}</td>
                                                <td style={pg.tdCenter}>{row.correction_page}</td>
                                                <td style={pg.tdCenter}>{row.decision_page}</td>
                                                <td style={pg.tdCenter}>{row.department ?? '—'}</td>
                                                <td style={pg.tdRight}>{fmt(row.salary)}</td>
                                                <td style={pg.tdCenter}>{row.employee_name ?? '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr style={pg.tfootRow}>
                                            <td colSpan={14} style={{ ...pg.tdRight, fontWeight: 700 }}>Tổng cộng</td>
                                            <td style={{ ...pg.tdRight, color: '#e53935', fontWeight: 700 }}>
                                                {fmt(totalSalary)}
                                            </td>
                                            <td />
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}

                        <p style={pg.genAt}>Tạo lúc: {generatedAt}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── styles ──────────────────────────────────────────────────────────────────
const pg = {
    root: { minHeight: '100vh', background: '#f0f2f7', fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif" },

    hero: { background: 'linear-gradient(135deg,#1a3a6b 0%,#1877f2 100%)', padding: '32px 0 28px' },
    heroInner: { maxWidth: 1200, margin: '0 auto', padding: '0 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 },
    heroEyebrow: { margin: 0, fontSize: 12, fontWeight: 600, letterSpacing: 2, color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', marginBottom: 6 },
    heroTitle: { margin: 0, fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' },
    heroMeta: { display: 'flex', alignItems: 'center', gap: 10 },
    heroUser: { fontSize: 14, color: 'rgba(255,255,255,.85)', fontWeight: 600 },

    body: { maxWidth: 1200, margin: '0 auto', padding: '28px 32px 60px' },

    filterCard: { background: '#fff', borderRadius: 14, padding: '24px 28px', boxShadow: '0 2px 12px rgba(0,0,0,.07)', marginBottom: 24 },
    cardLabel: { margin: '0 0 16px', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: '#aaa', textTransform: 'uppercase' },
    filterGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 16 },
    filterActions: { display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' },

    btnPrimary: {
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '10px 24px', background: '#1877f2', color: '#fff',
        border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer',
        boxShadow: '0 3px 10px rgba(24,119,242,.35)',
    },
    btnOutline: {
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '10px 24px', background: '#fff', color: '#1877f2',
        border: '1.5px solid #1877f2', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer',
    },
    spinner: {
        display: 'inline-block', width: 14, height: 14,
        border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff',
        borderRadius: '50%', animation: 'spin .6s linear infinite',
    },

    errorBanner: { marginTop: 14, padding: '10px 14px', background: '#ffebee', color: '#c62828', borderRadius: 7, fontSize: 13 },

    resultBlock: {},
    summaryBar: { display: 'flex', flexWrap: 'wrap', gap: 0, background: '#fff', borderRadius: 12, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)', overflow: 'hidden' },
    summaryItem: { padding: '14px 24px', borderRight: '1px solid #f0f2f5', display: 'flex', flexDirection: 'column', gap: 3, minWidth: 140 },
    summaryKey: { fontSize: 11, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1 },
    summaryVal: { fontSize: 15, fontWeight: 600, color: '#1a1a1a' },

    tableWrap: { overflowX: 'auto', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,.07)' },
    table: { width: '100%', borderCollapse: 'collapse', background: '#fff', fontSize: 13 },
    th: { padding: '11px 12px', background: '#1a3a6b', color: '#fff', fontWeight: 700, fontSize: 12, textAlign: 'center', whiteSpace: 'nowrap' },
    trEven: { background: '#fff' },
    trOdd: { background: '#f7f9fc' },
    tdCenter: { padding: '9px 10px', textAlign: 'center', borderBottom: '1px solid #f0f2f5', color: '#333', whiteSpace: 'nowrap' },
    tdLeft: { padding: '9px 12px', textAlign: 'left', borderBottom: '1px solid #f0f2f5', color: '#1a1a1a', fontWeight: 600, minWidth: 160 },
    tdRight: { padding: '9px 12px', textAlign: 'right', borderBottom: '1px solid #f0f2f5', color: '#333', whiteSpace: 'nowrap' },
    tfootRow: { background: '#f0f2f7' },

    empty: { textAlign: 'center', padding: '48px', color: '#aaa', background: '#fff', borderRadius: 12 },
    genAt: { textAlign: 'right', fontSize: 11, color: '#bbb', marginTop: 10, fontStyle: 'italic' },
};

const ui = {
    fieldWrap: { display: 'flex', flexDirection: 'column', gap: 6 },
    fieldLabel: { fontSize: 12, fontWeight: 700, color: '#555', letterSpacing: .3 },
    selectWrap: { position: 'relative' },
    select: {
        width: '100%', padding: '9px 32px 9px 12px', appearance: 'none',
        border: '1.5px solid #e0e4ea', borderRadius: 8, fontSize: 13, color: '#1a1a1a',
        background: '#fff', cursor: 'pointer', outline: 'none',
    },
    chevron: { position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#888', pointerEvents: 'none' },
    tag: { padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 },
};

if (typeof document !== 'undefined' && !document.getElementById('__report_kf')) {
    const s = document.createElement('style');
    s.id = '__report_kf';
    s.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
    document.head.appendChild(s);
}