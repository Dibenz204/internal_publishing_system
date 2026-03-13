import React from 'react';
import { NavLink } from 'react-router-dom';

const STAFF_MENU = [
    { path: '/profile', label: 'Cá nhân' },
    { path: '/books', label: 'Sách' }
];

const StaffNav = () => {
    return (
        <nav style={styles.nav}>
            {STAFF_MENU.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    style={({ isActive }) => ({
                        ...styles.link,
                        ...(isActive ? styles.activeLink : {}),
                    })}
                >
                    {item.label}
                </NavLink>
            ))}
        </nav>
    );
};

const styles = {
    nav: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
    },
    link: {
        display: 'block',
        padding: '10px 14px',
        borderRadius: '6px',
        color: '#222',
        textDecoration: 'none',
        fontSize: '15px',
        fontWeight: '500',
        transition: 'background 0.15s',
        whiteSpace: 'nowrap',
    },
    activeLink: {
        backgroundColor: '#f0f0f0',
        fontWeight: '700',
        color: '#111',
    },
};

export default StaffNav;