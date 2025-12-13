import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, Star, MapPin, User, Search } from 'lucide-react';

const CustomerDashboard = () => {
    const { user } = useAuth();
    const [providers, setProviders] = useState([]);
    const [filteredProviders, setFilteredProviders] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('Tümü');
    const [appointments, setAppointments] = useState([]);

    // Booking Modal
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [bookingData, setBookingData] = useState({ date: '', time: '' });

    useEffect(() => {
        loadProviders();
        loadMyAppointments();
    }, []);

    useEffect(() => {
        if (selectedCategory === 'Tümü') {
            setFilteredProviders(providers);
        } else {
            setFilteredProviders(providers.filter(p => p.category === selectedCategory));
        }
    }, [selectedCategory, providers]);

    const loadProviders = async () => {
        try {
            const { data } = await axios.get('/api/providers');
            setProviders(data);
            setFilteredProviders(data);
        } catch (error) { console.error(error); }
    };

    const loadMyAppointments = async () => {
        try {
            const { data } = await axios.get(`/api/appointments/${user.id}?role=customer`);
            setAppointments(data);
        } catch (error) { console.error(error); }
    };

    const handleBook = async () => {
        if (!bookingData.date || !bookingData.time) return toast.warning('Lütfen tarih ve saat seçin.');

        try {
            await axios.post('/api/appointments', {
                provider_id: selectedProvider.id,
                customer_id: user.id,
                ...bookingData
            });
            toast.success(`Randevu talebi iletildi! (Simüle edilen SMS: ${selectedProvider.full_name} kişisine onay kodu gitti.)`);
            setSelectedProvider(null);
            loadMyAppointments();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Hata oluştu');
        }
    };

    const categories = ['Tümü', 'Kuaför', 'Berber', 'Antrenör', 'Diyetisyen'];

    return (
        <div className="container">
            <h1 style={{ marginBottom: '20px' }}>Merhaba, {user.full_name} 👋</h1>

            {/* --- RANDEVULARIM --- */}
            {appointments.length > 0 && (
                <div style={{ marginBottom: '40px' }}>
                    <h3>📅 Randevularım</h3>
                    <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
                        {appointments.map(app => (
                            <div key={app.id} className="card" style={{ minWidth: '300px', borderLeft: `5px solid ${app.status === 'approved' ? 'var(--success)' : 'orange'}` }}>
                                <h4>{app.provider_name} ({app.category})</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}>
                                    <Calendar size={16} /> {app.date} <Clock size={16} style={{ marginLeft: '10px' }} /> {app.time}
                                </div>
                                <div style={{ marginTop: '10px' }}>
                                    <span className={`badge ${app.status === 'approved' ? 'bg-approved' : 'bg-pending'}`}>
                                        {app.status === 'approved' ? 'ONAYLANDI' : 'ONAY BEKLİYOR'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- HİZMET BUL --- */}
            <div className="header">
                <div>
                    <h2>Hizmet Bul</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Uzmanlardan randevu al.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {categories.map(cat => (
                        <button key={cat}
                            className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setSelectedCategory(cat)}
                            style={{ padding: '5px 15px', borderRadius: '20px' }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid-3">
                {filteredProviders.map(provider => (
                    <div key={provider.id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h3>{provider.full_name}</h3>
                            <span className="badge" style={{ background: '#f1f5f9' }}>{provider.category}</span>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '10px 0' }}>
                            {provider.bio || 'Henüz bir açıklama yok.'}
                        </p>
                        <div style={{ marginTop: '15px' }}>
                            <button className="btn btn-primary" style={{ width: '100%' }}
                                onClick={() => setSelectedProvider(provider)}>
                                Randevu Al
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL */}
            {selectedProvider && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="card" style={{ width: '400px' }}>
                        <h3>{selectedProvider.full_name} ile Randevu</h3>
                        <p>Lütfen tarih ve saat seçin.</p>
                        <br />
                        <div className="input-group">
                            <label>Tarih</label>
                            <input type="date" className="input-field"
                                onChange={e => setBookingData({ ...bookingData, date: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Saat</label>
                            <input type="time" className="input-field"
                                onChange={e => setBookingData({ ...bookingData, time: e.target.value })} />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleBook}>Onayla</button>
                            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setSelectedProvider(null)}>İptal</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerDashboard;
