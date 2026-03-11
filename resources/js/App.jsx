import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/Protectedroute';
import Layout from './components/Layout/Layout';

import Login from './pages/Login';
import Profile from './pages/Profile';
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



                            <Route path="/profile" element={<Profile />} />

                            <Route path="/books" element={<Books />} />

                            {/* <Route path="/profile" element={<Profile />} /> */}


                            {<Route element={<ProtectedRoute allowedPositions={['Admin']} />}>
                                <Route path="/departments/:id" element={<DepartmentDetail />} />
                            </Route>}


                            {<Route element={<ProtectedRoute allowedPositions={['Admin', 'HR']} />}>
                                <Route path="/departments" element={<Departments />} />
                                <Route path="/users" element={<Users />} />
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