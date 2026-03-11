import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminNav from './AdminNav';
import StaffNav from './StaffNav';
import HRNav from './HRNav';

const renderNav = (position) => {
    switch (position) {
        case 'Admin':
            return <AdminNav />;
        case 'HR':
            return <HRNav />;
        default:
            return <StaffNav />;
    }
};

const Header = () => {
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header style={styles.header}>
            <div style={styles.left}>
                <div style={styles.menuWrapper} ref={menuRef}>
                    <button
                        style={styles.menuTrigger}
                        onClick={() => setMenuOpen(prev => !prev)}
                    >
                        Menu
                        <span style={{
                            ...styles.chevron,
                            transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}>▾</span>
                    </button>

                    {menuOpen && (
                        <div style={styles.dropdown} onClick={() => setMenuOpen(false)}>
                            {renderNav(user?.position)}
                        </div>
                    )}
                </div>

                <span style={styles.brand}>HỆ THỐNG NỘI BỘ</span>
            </div>

            <div style={styles.userSection}>
                <div style={styles.userInfo}>
                    <span style={styles.userName}>
                        {user?.employee?.name || user?.username}
                    </span>
                    <span style={styles.userPosition}>
                        {user?.position}
                    </span>
                </div>
                <button style={styles.logoutBtn} onClick={logout}>
                    Đăng xuất
                </button>
            </div>
        </header>
    );
};

const styles = {
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        height: '64px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e0e0e0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
    },
    left: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
    },
    brand: {
        fontSize: '18px',
        fontWeight: '800',
        color: '#111111',
        letterSpacing: '0.3px',
        whiteSpace: 'nowrap',
    },
    menuWrapper: {
        position: 'relative',
    },
    menuTrigger: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        backgroundColor: '#f5f5f5',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '600',
        color: '#222',
        cursor: 'pointer',
    },
    chevron: {
        fontSize: '13px',
        transition: 'transform 0.2s',
        display: 'inline-block',
    },
    dropdown: {
        position: 'absolute',
        top: 'calc(100% + 8px)',
        left: 0,
        backgroundColor: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '10px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
        padding: '8px',
        minWidth: '180px',
        zIndex: 2000,
    },
    userSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
    },
    userInfo: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    userName: {
        color: '#111',
        fontSize: '15px',
        fontWeight: '700',
        lineHeight: '1.3',
    },
    userPosition: {
        color: '#888',
        fontSize: '12px',
        lineHeight: '1.3',
    },
    logoutBtn: {
        padding: '8px 16px',
        backgroundColor: '#ffffff',
        color: '#333',
        border: '1px solid #d0d0d0',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
    },
};

export default Header;