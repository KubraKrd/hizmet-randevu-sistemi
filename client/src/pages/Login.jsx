import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await login(formData.username, formData.password);
        if (res.success) {
            toast.success('Giriş başarılı!');
            navigate('/');
        } else {
            toast.error(res.message);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--primary)' }}>Giriş Yap</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Kullanıcı Adı</label>
                        <input className="input-field" type="text"
                            onChange={e => setFormData({ ...formData, username: e.target.value })} />
                    </div>
                    <div className="input-group">
                        <label>Şifre</label>
                        <input className="input-field" type="password"
                            onChange={e => setFormData({ ...formData, password: e.target.value })} />
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%' }}>Giriş Yap</button>
                    <p style={{ textAlign: 'center', marginTop: '15px' }}>
                        Hesabın yok mu? <Link to="/register" style={{ color: 'var(--primary)' }}>Kayıt Ol</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
