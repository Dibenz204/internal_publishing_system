import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/Protectedroute';
import Layout from './components/Layout/Layout';

import Login from './pages/Login';
import Dashboard from './pages/dashboard';
import Users from './pages/Users';
import Books from './pages/Books'
import Departments from './pages/Departments';
import DepartmentDetail from './pages/DepartmentDetail';


function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route element={<ProtectedRoute />}>
                        <Route element={<Layout />}>



                            <Route path="/dashboard" element={<Dashboard />} />

                            <Route path="/books" element={<Books />} />

                            {/* <Route path="/profile" element={<Profile />} /> */}

                            {/* Chỉ Admin */}
                            {<Route element={<ProtectedRoute allowedPositions={['Admin']} />}>
                                <Route path="/users" element={<Users />} />
                                <Route path="/departments" element={<Departments />} />
                                <Route path="/departments/:id" element={<DepartmentDetail />} />
                            </Route>}

                            <Route path="/" element={<Navigate to="/login" replace />} />

                            <Route path="*" element={<Navigate to="/login" replace />} />

                        </Route>

                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider >
    );
}

export default App;