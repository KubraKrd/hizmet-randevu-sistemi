import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, Star, MapPin, User, Search, Info, X } from 'lucide-react';

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

    const isDayValid = (dateString, providerWorkDaysJson) => {
        if (!providerWorkDaysJson) return true; // Eğer kısıtlama yoksa her gün açık
        try {
            const workDays = JSON.parse(providerWorkDaysJson);
            if (!Array.isArray(workDays) || workDays.length === 0) return true;

            const date = new Date(dateString);
            const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
            const dayName = days[date.getDay()];

            return workDays.includes(dayName);
        } catch (e) {
            return true;
        }
    };

    const handleBook = async () => {
        if (!bookingData.date || !bookingData.time) return toast.warning('Lütfen tarih ve saat seçin.');

        // Validate Working Day
        if (!isDayValid(bookingData.date, selectedProvider.working_days)) {
            return toast.error(`Bu hizmet veren seçilen tarihte (${new Date(bookingData.date).toLocaleDateString('tr-TR', { weekday: 'long' })}) çalışmıyor.`);
        }

        try {
            await axios.post('/api/appointments', {
                provider_id: selectedProvider.id,
                customer_id: user.id,
                ...bookingData
            });
            toast.success('Randevu talebi iletildi!');
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
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                        {appointments.map(app => (
                            <div key={app.id} className="card" style={{
                                borderLeft: `5px solid ${app.status === 'approved' ? 'var(--success)' : app.status === 'rejected' ? 'var(--danger)' : 'var(--warning)'}`
                            }}>
                                <h4 style={{ fontSize: '1.2rem' }}>{app.provider_name}</h4>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{app.category}</span>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '15px', color: '#e2e8f0' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={16} color="var(--primary)" /> {app.date}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={16} color="var(--primary)" /> {app.time}</span>
                                </div>
                                <div style={{ marginTop: '15px' }}>
                                    <span className={`badge ${app.status === 'approved' ? 'bg-approved' : app.status === 'rejected' ? 'bg-rejected' : 'bg-pending'}`}>
                                        {app.status === 'approved' ? 'ONAYLANDI' : app.status === 'rejected' ? 'İPTAL EDİLDİ' : 'ONAY BEKLİYOR'}
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
                    <p style={{ color: 'var(--text-muted)' }}>Müsait uzmanlardan randevu al.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {categories.map(cat => (
                        <button key={cat}
                            className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setSelectedCategory(cat)}
                            style={{ borderRadius: '20px', padding: '0.5rem 1.25rem' }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid-3">
                {filteredProviders.map(provider => (
                    <div key={provider.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                                <h3 style={{ fontSize: '1.4rem' }}>{provider.full_name}</h3>
                                <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', marginTop: '5px', display: 'inline-block' }}>
                                    {provider.category}
                                </span>
                            </div>
                            <div style={{ background: 'var(--primary)', padding: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <User size={24} color="#fff" />
                            </div>
                        </div>

                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '15px 0', flexGrow: 1 }}>
                            {provider.bio || 'Bu uzman henüz bir açıklama eklememiş.'}
                        </p>

                        {provider.working_days && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', gap: '5px', alignItems: 'center' }} translate="no">
                                <Info size={14} />
                                <span>Günler: {JSON.parse(provider.working_days).slice(0, 3).join(', ')}{JSON.parse(provider.working_days).length > 3 ? '...' : ''}</span>
                            </div>
                        )}

                        <div style={{ marginTop: 'auto' }}>
                            <button className="btn btn-outline" style={{ width: '100%', borderColor: 'var(--primary)', color: 'var(--primary)', cursor: 'pointer' }}
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
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="card" style={{ width: '90%', maxWidth: '450px', border: '1px solid var(--primary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3>Randevu Oluştur</h3>
                            <button onClick={() => setSelectedProvider(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X /></button>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Hizmet Veren:</span>
                            <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{selectedProvider.full_name}</div>
                            {selectedProvider.working_days && (
                                <div style={{ fontSize: '0.85rem', color: 'var(--warning)', marginTop: '5px' }}>
                                    Çalışma Günleri: {JSON.parse(selectedProvider.working_days).join(', ')}
                                </div>
                            )}
                        </div>

                        <div className="input-group">
                            <label className="input-label">Tarih</label>
                            <input type="date"
                                onChange={e => setBookingData({ ...bookingData, date: e.target.value })}
                                style={{ colorScheme: 'dark' }}
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Saat</label>
                            <input type="time"
                                onChange={e => setBookingData({ ...bookingData, time: e.target.value })}
                                style={{ colorScheme: 'dark' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleBook}>Randevuyu Onayla</button>
                            <button className="btn btn-danger" style={{ flex: 1, background: 'transparent' }} onClick={() => setSelectedProvider(null)}>Vazgeç</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerDashboard;
