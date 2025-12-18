import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import ProviderDashboard from './pages/ProviderDashboard';

const PrivateRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Yükleniyor...</div>;
    if (!user) return <Navigate to="/login" />;

    // Basic redirect based on role if logged in but wrong path?
    // For simplicity, we trust the component logic, but we can enforce:
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" />;
    }
    return children;
};

const HomeRedirect = () => {
    const { user, loading } = useAuth();
    if (loading) return <div>Yükleniyor...</div>;
    if (!user) return <Navigate to="/login" />;
    if (user.role === 'provider') return <ProviderDashboard />;
    if (user.role === 'customer') return <CustomerDashboard />;
    if (user.role === 'admin') return <div className="container"><h1>Admin Paneli (Hazırlanıyor)</h1></div>;
    return <div>Role not recognized</div>;
};

const Navbar = () => {
    const { user, logout } = useAuth();
    if (!user) return null;
    return (
        <nav className="navbar">
            <div className="container nav-content">
                <a href="/" className="logo">Randevu<b>Sistemi</b></a>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span>👤 {user.full_name} ({user.role === 'provider' ? 'Uzman' : 'Müşteri'})</span>
                    <button className="btn btn-outline" style={{ padding: '5px 15px', fontSize: '0.8rem' }} onClick={logout} translate="no">Çıkış Yap</button>
                </div>
            </div>
        </nav>
    );
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Navbar />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<HomeRedirect />} />
                </Routes>
                <ToastContainer position="bottom-right" theme="colored" />
            </AuthProvider>
        </Router>
    )
}

export default App;
