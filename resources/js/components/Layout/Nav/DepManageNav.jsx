import React from 'react';
import { NavLink } from 'react-router-dom';


const DEPMANAGE_MENU = [
    { path: '/profile', label: 'Cá nhân' },
    { path: '/books', label: 'Sách' },
    { path: '/departmentbook', label: 'Công việc' },
    { path: '/departments', label: 'Phòng ban' },

];

const DepManageNav = () => {
    return (
        <nav style={styles.nav}>
            {DEPMANAGE_MENU.map((item) => (
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

export default DepManageNav;