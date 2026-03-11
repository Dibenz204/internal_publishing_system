import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const Layout = () => {
    return (
        <div style={styles.wrapper}>
            <Header />
            <main style={styles.main}>
                <Outlet />
            </main>
        </div>
    );
};

const styles = {
    wrapper: {
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        display: 'flex',
        flexDirection: 'column',
    },
    main: {
        flex: 1,
        padding: '24px',
    },
};

export default Layout;