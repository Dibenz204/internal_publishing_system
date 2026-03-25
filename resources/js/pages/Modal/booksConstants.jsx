export const CAN_MANAGE = ['Admin', 'Thư kí biên tập'];
export const CAN_VIEW_ALL = [];

export const STATUS_OPTIONS = [
    { value: '', label: 'Tất cả' },
    { value: '1', label: 'Đang thực hiện' },
    { value: '2', label: 'Đợi phân công' },
    { value: '3', label: 'Hoàn thành' },
    { value: '0', label: 'Đã hủy' },
    { value: '4', label: 'Chỉnh sửa' },
];

export const STATUS_MAP = {
    0: { label: 'Đã hủy', bg: '#fce8e6', color: '#c62828' },
    1: { label: 'Đang thực hiện', bg: '#e3f2fd', color: '#1565c0' },
    2: { label: 'Đợi phân công', bg: '#fff8e1', color: '#f57f17' },
    3: { label: 'Hoàn thành', bg: '#e6f4ea', color: '#2e7d32' },
    4: { label: 'Chỉnh sửa', bg: '#f3e5f5', color: '#6a1b9a' },
};

export const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';


export const styles = {
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
    td: { padding: '12px 16px', color: '#333', borderBottom: '1px solid #f0f0f0', maxWidth: '250px' },
    trEven: { backgroundColor: '#ffffff' },
    trOdd: { backgroundColor: '#fafafa' },
    empty: { textAlign: 'center', padding: '40px', color: '#aaa' },
    pagination: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px' },
    pageBtn: { padding: '6px 14px', border: '1px solid #d0d0d0', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px' },
    pageInfo: { fontSize: '14px', color: '#555' },
    center: { textAlign: 'center', padding: '60px', color: '#888' },
    errorMsg: { textAlign: 'center', padding: '60px', color: '#c62828' },
};

export const modal = {
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
    finishBtn: { padding: '9px 20px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
    cancelActionBtn: { padding: '9px 20px', backgroundColor: '#fff', color: '#c62828', border: '1px solid #c62828', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
    catBox: { border: '1px solid #ddd', borderRadius: '6px', padding: '10px 12px', display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '120px', overflowY: 'auto' },
    catItem: { display: 'flex', alignItems: 'center', fontSize: '13px', color: '#333', cursor: 'pointer', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#f5f5f5', userSelect: 'none' },
};

export const detail_s = {
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
    item: { display: 'flex', flexDirection: 'column', gap: '3px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '8px' },
    itemLabel: { fontSize: '11px', color: '#aaa', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.4px' },
    itemValue: { fontSize: '15px', color: '#333', fontWeight: '500' },
    deptRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#f9f9f9', borderRadius: '6px', border: '1px solid #f0f0f0' },
};