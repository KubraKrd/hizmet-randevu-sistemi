import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Register = () => {
    const [role, setRole] = useState('customer'); // customer or provider
    const [formData, setFormData] = useState({
        username: '', password: '', full_name: '', category: 'Kuaför', bio: ''
    });

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await register({ ...formData, role });
        if (res.success) {
            toast.success('Kayıt başarılı! Şimdi giriş yapabilirsin.');
            navigate('/login');
        } else {
            toast.error(res.message);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: '0px', paddingBottom: '30px' }}>
            <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
                <h2 style={{ textAlign: 'center', color: 'var(--primary)' }}>Yeni Kayıt</h2>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>
                    <button type="button"
                        onClick={() => setRole('customer')}
                        className={`btn ${role === 'customer' ? 'btn-primary' : 'btn-outline'}`}
                    >
                        Hizmet Alacağım
                    </button>
                    <button type="button"
                        onClick={() => setRole('provider')}
                        className={`btn ${role === 'provider' ? 'btn-primary' : 'btn-outline'}`}
                    >
                        Hizmet Vereceğim
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Ad Soyad</label>
                        <input className="input-field" required onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
                    </div>
                    <div className="input-group">
                        <label>Kullanıcı Adı</label>
                        <input className="input-field" required onChange={e => setFormData({ ...formData, username: e.target.value })} />
                    </div>
                    <div className="input-group">
                        <label>Şifre</label>
                        <input className="input-field" type="password" required onChange={e => setFormData({ ...formData, password: e.target.value })} />
                    </div>

                    {role === 'provider' && (
                        <>
                            <div className="input-group">
                                <label>Uzmanlık Alanı (Kategori)</label>
                                <select className="input-field" onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                    <option value="Kuaför">Kuaför</option>
                                    <option value="Berber">Berber</option>
                                    <option value="Antrenör">Antrenör / Fitness</option>
                                    <option value="Diyetisyen">Diyetisyen</option>
                                    <option value="Özel Ders">Özel Ders</option>
                                    <option value="Tamirat">Tamirat / Tadilat</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Kısa Biyografi (Müşteriler bunu görecek)</label>
                                <textarea className="input-field" rows="3" onChange={e => setFormData({ ...formData, bio: e.target.value })}></textarea>
                            </div>
                        </>
                    )}

                    <button className="btn btn-primary" style={{ width: '100%' }}>Kayıt Ol</button>
                </form>
                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                    <Link to="/login" style={{ fontSize: '0.9rem' }}>Giriş yapmak için tıkla</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
