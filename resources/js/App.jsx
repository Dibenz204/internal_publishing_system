import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/Protectedroute';
import Layout from './components/Layout/Layout';

import Login from './pages/Login';
import Profile from './pages/Profile';
import Users from './pages/Users';
import Books from './pages/Books';
import BookTransferDetail from './pages/BookTransferDetail';

import Departments from './pages/Departments';
import DepartmentDetail from './pages/DepartmentDetail';
import Settings from './pages/Setting';
import DepartmentBooks from './pages/DepartmentBook';


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
                            <Route path="/books/:id/transfers" element={<BookTransferDetail />} />

                            {<Route element={<ProtectedRoute allowedPositions={['Admin', 'HR', 'Trưởng phòng']} />}>
                                <Route path="/departments/:id" element={<DepartmentDetail />} />
                            </Route>}

                            <Route path="/departmentbook" element={<DepartmentBooks />} />


                            {<Route element={<ProtectedRoute allowedPositions={['Admin', 'HR', 'Thư kí biên tập', 'Trưởng phòng']} />}>
                                <Route path="/departments" element={<Departments />} />
                                <Route path="/users" element={<Users />} />
                            </Route>}

                            {<Route element={<ProtectedRoute allowedPositions={['Admin', 'Thư kí biên tập', 'Kế toán']} />}>
                                <Route path="/settings" element={<Settings />} />
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