import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';


const ADMIN_ONLY = ['Admin'];
const ACCOUNTANT_ONLY = ['Kế toán'];
const EDITOR_TABS = ['book-categories', 'papers'];
const ACCOUNTANT_TABS = ['salary', 'job-categories'];
const ADMIN_TABS = ['salary', 'book-categories', 'job-categories', 'positions', 'papers'];

const TAB_LIST = [
    { key: 'salary', label: 'Lương' },
    { key: 'book-categories', label: 'Danh mục' },
    { key: 'job-categories', label: 'Công việc' },
    { key: 'positions', label: 'Chức vụ' },
    { key: 'papers', label: 'Loại giấy' },
];

const STATUS_OPTIONS = [
    { value: '1', label: 'Hoạt động' },
    { value: '0', label: 'Đã dừng' },
    { value: '', label: 'Tất cả' },
];


const Badge = ({ status }) => (
    <span style={{
        display: 'inline-block', padding: '3px 10px', borderRadius: '12px',
        fontSize: '12px', fontWeight: '600',
        backgroundColor: status ? '#e6f4ea' : '#fce8e6',
        color: status ? '#2e7d32' : '#c62828',
    }}>
        {status ? 'Hoạt động' : 'Đã dừng'}
    </span>
);

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';



const SalaryModal = ({ onClose, onSuccess }) => {
    const [form, setForm] = useState({ year: new Date().getFullYear(), salary_per_paper: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async () => {
        if (!form.salary_per_paper) return setError('Vui lòng nhập lương mỗi trang');
        setSubmitting(true); setError('');
        try {
            await api.post('/salary-coefficients', { year: parseInt(form.year), salary_per_paper: parseFloat(form.salary_per_paper) });
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Thao tác thất bại');
        } finally { setSubmitting(false); }
    };

    return (
        <div style={modal.overlay}>
            <div style={modal.box} onClick={e => e.stopPropagation()}>
                <div style={modal.header}>
                    <h3 style={modal.title}>Thêm hệ số lương</h3>
                    <button style={modal.closeBtn} onClick={onClose}>✕</button>
                </div>
                {error && <div style={modal.error}>{error}</div>}
                <div style={modal.body}>
                    <div style={modal.field}>
                        <label style={modal.label}>Năm <span style={modal.req}>*</span></label>
                        <input name="year" type="number" value={form.year} onChange={handleChange} style={modal.input} />
                    </div>
                    <div style={modal.field}>
                        <label style={modal.label}>Lương mỗi trang <span style={modal.req}>*</span></label>
                        <input name="salary_per_paper" type="number" min="0" step="any" value={form.salary_per_paper} onChange={handleChange} style={modal.input} placeholder="VD: 5000" />
                    </div>
                </div>
                <div style={modal.footer}>
                    <button style={modal.cancelBtn} onClick={onClose} disabled={submitting}>Hủy</button>
                    <button style={modal.submitBtn} onClick={handleSubmit} disabled={submitting}>
                        {submitting ? 'Đang lưu...' : 'Tạo mới'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const GenericModal = ({ tabKey, item, onClose, onSuccess }) => {
    const isEdit = !!item;
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const getInitialForm = () => {
        switch (tabKey) {
            case 'book-categories': return {
                name: item?.name ?? '',
                description: item?.description ?? '',
                status: String(item?.status ?? 1)
            };
            case 'job-categories': return {
                name: item?.name ?? '',
                work_coefficient: item?.work_coefficient ?? '',
                category: item?.category ?? '',
                status: String(item?.status ?? 1)
            };
            case 'positions': return {
                name: item?.name ?? '',
                status: String(item?.status ?? 1)
            };
            case 'papers': return {
                paperSize: item?.paperSize ?? '',
                paper_coefficient: item?.paper_coefficient ?? '',
                status: String(item?.status ?? 1)
            };
            default: return {};
        }
    };

    const [form, setForm] = useState(getInitialForm);
    const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const getTitle = () => {
        const labels = { 'book-categories': 'Danh mục', 'job-categories': 'Công việc', 'positions': 'Chức vụ', 'papers': 'Loại giấy' };
        return isEdit ? `Cập nhật: ${item?.name || item?.paperSize}` : `Thêm ${labels[tabKey]}`;
    };

    const handleSubmit = async () => {
        setSubmitting(true); setError('');
        try {
            const statusInt = parseInt(form.status);

            if (tabKey === 'book-categories') {
                if (!form.name.trim()) return setError('Tên không được để trống');
                if (isEdit) {
                    await api.put(`/book-categories/${item.id}`, {
                        name: form.name.trim(),
                        description: form.description
                    });
                    if (statusInt !== item.status) {
                        await api.patch(`/book-categories/${item.id}/${statusInt ? 'activate' : 'deactivate'}`);
                    }
                } else {
                    await api.post('/book-categories', {
                        name: form.name.trim(),
                        description: form.description
                    });
                }
            }

            else if (tabKey === 'job-categories') {
                if (!form.name.trim()) return setError('Tên không được để trống');
                if (isEdit) {
                    await api.patch(`/job-categories/${item.id}/update`, {
                        work_coefficient: parseFloat(form.work_coefficient),
                        category: form.category.trim()
                    });
                } else {
                    await api.post('/job-categories', {
                        name: form.name.trim(),
                        category: form.category.trim(),
                        work_coefficient: parseFloat(form.work_coefficient)
                    });
                }
            }

            else if (tabKey === 'positions') {
                if (!form.name.trim()) return setError('Tên không được để trống');
                if (isEdit) {
                    await api.patch(`/positions/${item.id}`, { name: form.name.trim() });
                    if (statusInt !== item.status) {
                        await api.patch(`/positions/${item.id}/${statusInt ? 'activate' : 'deactivate'}`);
                    }
                } else {
                    await api.post('/positions', { name: form.name.trim() });
                }
            }

            else if (tabKey === 'papers') {
                if (!form.paperSize.trim()) return setError('Tên loại giấy không được để trống');
                if (isEdit) {
                    await api.put(`/papers/${item.id}`, { paperSize: form.paperSize.trim(), paper_coefficient: parseFloat(form.paper_coefficient) });
                    if (statusInt !== item.status) {
                        await api.patch(`/papers/${item.id}/${statusInt ? 'activate' : 'deactivate'}`);
                    }
                } else {
                    await api.post('/papers', { paperSize: form.paperSize.trim(), paper_coefficient: parseFloat(form.paper_coefficient) });
                }
            }

            onSuccess();
        } catch (err) {
            const errs = err.response?.data?.errors;
            setError(errs ? Object.values(errs).flat().join(' | ') : err.response?.data?.message || 'Thao tác thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={modal.overlay}>
            <div style={modal.box} onClick={e => e.stopPropagation()}>
                <div style={modal.header}>
                    <h3 style={modal.title}>{getTitle()}</h3>
                    <button style={modal.closeBtn} onClick={onClose}>✕</button>
                </div>
                {error && <div style={modal.error}>{error}</div>}
                <div style={modal.body}>

                    {tabKey === 'book-categories' && <>
                        <div style={modal.field}>
                            <label style={modal.label}>Tên danh mục <span style={modal.req}>*</span></label>
                            <input name="name" value={form.name} onChange={handleChange} style={modal.input} placeholder="Nhập tên danh mục" />
                        </div>

                        <div style={modal.field}>
                            <label style={modal.label}>Mô tả</label>
                            <textarea
                                name="description"
                                value={form.description || ''}
                                onChange={handleChange}
                                style={{ ...modal.input, minHeight: 80, resize: 'vertical' }}
                                placeholder="Nhập mô tả danh mục"
                            />
                        </div>
                        {isEdit && (
                            <div style={modal.field}>
                                <label style={modal.label}>Trạng thái</label>
                                <select name="status" value={form.status} onChange={handleChange} style={modal.input}>
                                    <option value="1">Hoạt động</option>
                                    <option value="0">Đã dừng</option>
                                </select>
                            </div>
                        )}
                    </>}

                    {tabKey === 'job-categories' && <>
                        {!isEdit && (
                            <div style={modal.field}>
                                <label style={modal.label}>Tên công việc <span style={modal.req}>*</span></label>
                                <input name="name" value={form.name} onChange={handleChange} style={modal.input} placeholder="Nhập tên công việc" />
                            </div>
                        )}

                        <div style={modal.field}>
                            <label style={modal.label}>
                                Loại công việc <span style={modal.req}>*</span>
                            </label>

                            <select
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                style={modal.input}
                                required
                            >
                                <option value=""> --- Chọn loại ---</option>
                                <option value="Biên tập">Biên tập</option>
                                <option value="Dịch thuật">Chế bản</option>
                                <option value="Kiểm duyệt">Sửa đính chính</option>
                            </select>
                        </div>

                        <div style={modal.field}>
                            <label style={modal.label}>Hệ số công việc <span style={modal.req}>*</span></label>
                            <input name="work_coefficient" type="number" min="0" step="any" value={form.work_coefficient} onChange={handleChange} style={modal.input} placeholder="VD: 1.5" />
                        </div>
                    </>}

                    {tabKey === 'positions' && <>
                        <div style={modal.field}>
                            <label style={modal.label}>Tên chức vụ <span style={modal.req}>*</span></label>
                            <input name="name" value={form.name} onChange={handleChange} style={modal.input} placeholder="Nhập tên chức vụ" />
                        </div>
                        {isEdit && (
                            <div style={modal.field}>
                                <label style={modal.label}>Trạng thái</label>
                                <select name="status" value={form.status} onChange={handleChange} style={modal.input}>
                                    <option value="1">Hoạt động</option>
                                    <option value="0">Đã dừng</option>
                                </select>
                            </div>
                        )}
                    </>}

                    {tabKey === 'papers' && <>
                        <div style={modal.field}>
                            <label style={modal.label}>Tên loại giấy <span style={modal.req}>*</span></label>
                            <input name="paperSize" value={form.paperSize} onChange={handleChange} style={modal.input} placeholder="VD: A4, A5..." />
                        </div>
                        <div style={modal.field}>
                            <label style={modal.label}>Hệ số giấy <span style={modal.req}>*</span></label>
                            <input name="paper_coefficient" type="number" min="0" step="any" value={form.paper_coefficient} onChange={handleChange} style={modal.input} placeholder="VD: 1.2" />
                        </div>
                        {isEdit && (
                            <div style={modal.field}>
                                <label style={modal.label}>Trạng thái</label>
                                <select name="status" value={form.status} onChange={handleChange} style={modal.input}>
                                    <option value="1">Hoạt động</option>
                                    <option value="0">Đã dừng</option>
                                </select>
                            </div>
                        )}
                    </>}
                </div>
                <div style={modal.footer}>
                    <button style={modal.cancelBtn} onClick={onClose} disabled={submitting}>Hủy</button>
                    <button style={modal.submitBtn} onClick={handleSubmit} disabled={submitting}>
                        {submitting ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Thêm mới'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Panel = ({ tabKey, isAdmin, isAccountant }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('1');
    const [showAdd, setShowAdd] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const TAB_CONFIG = {
        salary: { label: 'Lương', url: '/salary-coefficients', canEdit: false, canAdd: isAdmin || isAccountant },
        'book-categories': { label: 'Danh mục', url: '/book-categories', canEdit: true, canAdd: true },
        'job-categories': { label: 'Công việc', url: '/job-categories', canEdit: isAdmin || isAccountant, canAdd: isAdmin || isAccountant },
        'positions': { label: 'Chức vụ', url: '/positions', canEdit: isAdmin, canAdd: isAdmin },
        'papers': { label: 'Loại giấy', url: '/papers', canEdit: true, canAdd: true },
    };

    const config = TAB_CONFIG[tabKey];

    const fetchData = async () => {
        setLoading(true); setError('');
        try {
            const res = await api.get(config.url);
            if (res.data.success) setData(res.data.data);
        } catch {
            setError('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [tabKey]);

    const filtered = data.filter(item => {
        if (statusFilter === '') return true;
        return String(item.status) === statusFilter;
    });

    const handleSuccess = () => {
        setShowAdd(false);
        setEditItem(null);
        fetchData();
    };


    const renderHead = () => {
        switch (tabKey) {
            case 'salary':
                return <>
                    <th style={s.th}>#</th>
                    <th style={s.th}>Năm</th>
                    <th style={s.th}>Lương/trang</th>
                    <th style={s.th}>Ngày tạo</th>
                    <th style={s.th}>Trạng thái</th>
                </>;
            case 'book-categories':
                return <>
                    <th style={s.th}>#</th>
                    <th style={s.th}>Tên</th>
                    <th style={s.th}>Mô tả</th>
                    <th style={s.th}>Trạng thái</th>
                    <th style={s.th}>Điều chỉnh</th>
                </>;
            case 'positions':
                return <>
                    <th style={s.th}>#</th>
                    <th style={s.th}>Tên</th>
                    <th style={s.th}>Trạng thái</th>
                    <th style={s.th}>Điều chỉnh</th>
                </>;
            case 'job-categories':
                return <>
                    <th style={s.th}>#</th>
                    <th style={s.th}>Tên</th>
                    <th style={s.th}>Hệ số</th>
                    <th style={s.th}>Loại</th>
                    <th style={s.th}>Ngày triển khai</th>
                    <th style={s.th}>Ngày kết thúc</th>
                    <th style={s.th}>Trạng thái</th>
                    <th style={s.th}>Điều chỉnh</th>
                </>;
            case 'papers':
                return <>
                    <th style={s.th}>#</th>
                    <th style={s.th}>Loại giấy</th>
                    <th style={s.th}>Hệ số</th>
                    <th style={s.th}>Trạng thái</th>
                    <th style={s.th}>Điều chỉnh</th>
                </>;
            default: return null;
        }
    };

    const renderRow = (item, index) => {
        const trStyle = index % 2 === 0 ? s.trEven : s.trOdd;
        switch (tabKey) {
            case 'salary':
                return (
                    <tr key={item.id} style={trStyle}>
                        <td style={s.td}>{index + 1}</td>
                        <td style={{ ...s.td, fontWeight: '600' }}>{item.year}</td>
                        <td style={s.td}>{Number(item.salary_per_paper).toLocaleString('vi-VN')} </td>
                        <td style={s.td}>{fmtDate(item.created_at)}</td>
                        <td style={s.td}><Badge status={item.status} /></td>
                    </tr>
                );
            case 'book-categories':
                return (
                    <tr key={item.id} style={trStyle}>
                        <td style={s.td}>{index + 1}</td>
                        <td style={{ ...s.td, fontWeight: '600' }}>{item.name}</td>
                        <td style={s.td}>{item.description || '—'}</td>
                        <td style={s.td}><Badge status={item.status} /></td>
                        <td style={s.td}>
                            {config.canEdit && (
                                <button style={s.editBtn} onClick={() => setEditItem(item)}>
                                    Cập nhật
                                </button>
                            )}
                        </td>
                    </tr>
                );
            case 'positions':
                return (
                    <tr key={item.id} style={trStyle}>
                        <td style={s.td}>{index + 1}</td>
                        <td style={{ ...s.td, fontWeight: '600' }}>{item.name}</td>
                        <td style={s.td}><Badge status={item.status} /></td>
                        <td style={s.td}>
                            {config.canEdit && (
                                <button style={s.editBtn} onClick={() => setEditItem(item)}>Cập nhật</button>
                            )}
                        </td>
                    </tr>
                );
            case 'job-categories':
                return (
                    <tr key={item.id} style={trStyle}>
                        <td style={s.td}>{index + 1}</td>
                        <td style={{ ...s.td, fontWeight: '600' }}>{item.name}</td>
                        <td style={s.td}>{item.work_coefficient}</td>
                        <td style={s.td}>
                            {item.category || '—'}
                        </td>
                        <td style={s.td}>
                            {fmtDate(item.created_at)}
                        </td>

                        <td style={s.td}>
                            {fmtDate(item.expired_at)}
                        </td>
                        <td style={s.td}><Badge status={item.status} /></td>
                        <td style={s.td}>
                            {config.canEdit && (
                                <button style={s.editBtn} onClick={() => setEditItem(item)}>Cập nhật</button>
                            )}
                        </td>
                    </tr>
                );
            case 'papers':
                return (
                    <tr key={item.id} style={trStyle}>
                        <td style={s.td}>{index + 1}</td>
                        <td style={{ ...s.td, fontWeight: '600' }}>{item.paperSize}</td>
                        <td style={s.td}>{item.paper_coefficient}</td>
                        <td style={s.td}><Badge status={item.status} /></td>
                        <td style={s.td}>
                            {config.canEdit && (
                                <button style={s.editBtn} onClick={() => setEditItem(item)}>Cập nhật</button>
                            )}
                        </td>
                    </tr>
                );
            default: return null;
        }
    };

    return (
        <div style={s.panel}>
            <div style={s.panelHeader}>
                <div style={s.statusRow}>
                    {STATUS_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            style={statusFilter === opt.value ? s.statusBtnActive : s.statusBtn}
                            onClick={() => setStatusFilter(opt.value)}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
                {config.canAdd && (
                    <button style={s.addBtn} onClick={() => setShowAdd(true)}>
                        + Thêm {config.label.toLowerCase()}
                    </button>
                )}
            </div>

            {loading ? (
                <div style={s.center}>Đang tải...</div>
            ) : error ? (
                <div style={s.errorMsg}>{error}</div>
            ) : (
                <div style={s.tableWrapper}>
                    <table style={s.table}>
                        <thead><tr style={s.thead}>{renderHead()}</tr></thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={6} style={s.empty}>Không có dữ liệu</td></tr>
                            ) : filtered.map((item, index) => renderRow(item, index))}
                        </tbody>
                    </table>
                </div>
            )}

            {showAdd && tabKey === 'salary' && (
                <SalaryModal onClose={() => setShowAdd(false)} onSuccess={handleSuccess} />
            )}
            {showAdd && tabKey !== 'salary' && (
                <GenericModal tabKey={tabKey} onClose={() => setShowAdd(false)} onSuccess={handleSuccess} />
            )}
            {editItem && (
                <GenericModal tabKey={tabKey} item={editItem} onClose={() => setEditItem(null)} onSuccess={handleSuccess} />
            )}
        </div>
    );
};

const Settings = () => {
    const { user } = useAuth();
    const isAdmin = ADMIN_ONLY.includes(user?.position);
    const isAccountant = ACCOUNTANT_ONLY.includes(user?.position);
    const allowedTabs = isAdmin ? ADMIN_TABS : isAccountant ? ACCOUNTANT_TABS : EDITOR_TABS;
    const [activeTab, setActiveTab] = useState(allowedTabs[0]);

    const visibleTabs = TAB_LIST.filter(t => allowedTabs.includes(t.key));

    return (
        <div style={styles.wrapper}>
            <div style={styles.pageHeader}>
                <h2 style={styles.title}>Thông số</h2>
            </div>

            <div style={styles.layout}>
                <div style={styles.sidebar}>
                    {visibleTabs.map(tab => (
                        <button
                            key={tab.key}
                            style={activeTab === tab.key ? styles.tabBtnActive : styles.tabBtn}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div style={styles.content}>
                    <Panel key={activeTab} tabKey={activeTab} isAdmin={isAdmin} isAccountant={isAccountant} />
                </div>
            </div>
        </div>
    );
};

const styles = {
    wrapper: { display: 'flex', flexDirection: 'column', gap: '16px' },
    pageHeader: { display: 'flex', alignItems: 'center' },
    title: { fontSize: '22px', fontWeight: '700', color: '#1a1a1a', margin: 0 },
    layout: { display: 'flex', gap: '16px', alignItems: 'flex-start' },
    sidebar: {
        width: '220px', flexShrink: 0,
        backgroundColor: 'white', borderRadius: '8px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
    },
    tabBtn: {
        padding: '14px 20px', textAlign: 'left', background: 'none',
        borderTop: 'none', borderRight: 'none', borderBottom: '1px solid #f0f0f0', borderLeft: '3px solid transparent',
        fontSize: '14px', fontWeight: '500', color: '#555', cursor: 'pointer',
    },
    tabBtnActive: {
        padding: '14px 20px', textAlign: 'left',
        background: '#e8f0fe',
        borderTop: 'none', borderRight: 'none', borderBottom: '1px solid #f0f0f0', borderLeft: '3px solid #1877f2',
        fontSize: '14px', fontWeight: '700', color: '#1877f2', cursor: 'pointer',
    },
    content: { flex: 1, minWidth: 0 },
};

const s = {
    panel: { display: 'flex', flexDirection: 'column', gap: '12px' },
    panelHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    statusRow: { display: 'flex', gap: '6px' },
    statusBtn: {
        padding: '5px 14px', backgroundColor: '#fff', color: '#555',
        border: '1px solid #d0d0d0', borderRadius: '20px', fontSize: '13px',
        fontWeight: '500', cursor: 'pointer',
    },
    statusBtnActive: {
        padding: '5px 14px', backgroundColor: '#1877f2', color: '#fff',
        border: '1px solid #1877f2', borderRadius: '20px', fontSize: '13px',
        fontWeight: '600', cursor: 'pointer',
    },
    addBtn: {
        padding: '9px 18px', backgroundColor: '#1877f2', color: '#fff',
        border: 'none', borderRadius: '8px', fontSize: '14px',
        fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap',
    },
    tableWrapper: { backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
    thead: { backgroundColor: '#f5f7fa' },
    th: { padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#555', borderBottom: '1px solid #e8e8e8', whiteSpace: 'nowrap' },
    td: { padding: '12px 16px', color: '#333', borderBottom: '1px solid #f0f0f0' },
    trEven: { backgroundColor: '#ffffff' },
    trOdd: { backgroundColor: '#fafafa' },
    empty: { textAlign: 'center', padding: '40px', color: '#aaa' },
    editBtn: { padding: '5px 12px', backgroundColor: '#f5f5f5', color: '#333', border: '1px solid #d0d0d0', borderRadius: '6px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
    center: { textAlign: 'center', padding: '60px', color: '#888' },
    errorMsg: { textAlign: 'center', padding: '60px', color: '#c62828' },
};

const modal = {
    overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
    box: { backgroundColor: 'white', borderRadius: '10px', width: '100%', maxWidth: '440px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 16px', borderBottom: '1px solid #f0f0f0' },
    title: { fontSize: '18px', fontWeight: '700', color: '#1a1a1a', margin: 0 },
    closeBtn: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#888', padding: '4px 8px' },
    body: { padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' },
    footer: { padding: '16px 24px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' },
    field: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '13px', fontWeight: '600', color: '#555' },
    req: { color: '#e53935' },
    input: { padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' },
    error: { margin: '0 24px 4px', padding: '10px 12px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '6px', fontSize: '13px' },
    cancelBtn: { padding: '9px 20px', backgroundColor: '#f5f5f5', color: '#333', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' },
    submitBtn: { padding: '9px 20px', backgroundColor: '#1877f2', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
};

export default Settings;