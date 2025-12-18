import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, Check, X, User, Settings, Save } from 'lucide-react';

const ProviderDashboard = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [workingDays, setWorkingDays] = useState([]);

    const daysOfWeek = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

    useEffect(() => {
        loadAppointments();
        loadSchedule();
    }, []);

    const loadAppointments = async () => {
        try {
            const { data } = await axios.get(`/api/appointments/${user.id}?role=provider`);
            setAppointments(data);
        } catch (error) { console.error(error); }
    };

    const loadSchedule = async () => {
        // In a real app we might fetch this from a specific endpoint, 
        // but for now let's assume it comes with the user or we fetch user details again
        // For simplicity, we will just use a local state or fetch properly if needed.
        // Actually, let's fetch the provider details to get the current working_days
        try {
            const { data } = await axios.get('/api/providers'); // This returns all, inefficient but works for small demo
            const me = data.find(u => u.id === user.id);
            if (me && me.working_days) {
                setWorkingDays(JSON.parse(me.working_days));
            }
        } catch (e) {
            console.log("Schedule load error", e);
        }
    };

    const saveSchedule = async () => {
        try {
            await axios.put('/api/provider/schedule', { userId: user.id, workingDays });
            toast.success('Çalışma günleri güncellendi!');
        } catch (error) {
            toast.error('Güncelleme başarısız');
        }
    };

    const toggleDay = (day) => {
        if (workingDays.includes(day)) {
            setWorkingDays(workingDays.filter(d => d !== day));
        } else {
            setWorkingDays([...workingDays, day]);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.put(`/api/appointments/${id}/status`, { status });
            toast.success(`Randevu ${status === 'approved' ? 'ONAYLANDI' : 'REDDEDİLDİ'}.`);
            loadAppointments();
        } catch (error) {
            toast.error('İşlem başarısız');
        }
    };

    return (
        <div className="container">
            <div className="header">
                <div>
                    <h1>{user.category} Paneli</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Hoş geldin, {user.full_name}</p>
                </div>
                <button onClick={saveSchedule} className="btn btn-primary">
                    <Save size={18} /> Ayarları Kaydet
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>

                {/* Sol Taraf: Ayarlar & Özet */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                            <Settings size={20} color="var(--primary)" />
                            <h3>Çalışma Günleri</h3>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Hizmet verebileceğiniz günleri seçiniz.
                        </p>
                        <div className="checkbox-group">
                            {daysOfWeek.map(day => (
                                <div
                                    key={day}
                                    className={`checkbox-btn ${workingDays.includes(day) ? 'active' : ''}`}
                                    onClick={() => {
                                        const newDays = workingDays.includes(day)
                                            ? workingDays.filter(d => d !== day)
                                            : [...workingDays, day];
                                        // Sort days based on original daysOfWeek array index
                                        newDays.sort((a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b));
                                        setWorkingDays(newDays);
                                    }}
                                    translate="no"
                                    style={{ fontSize: '0.85rem' }}
                                >
                                    {day}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h3>Bekleyenler</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Onay bekleyen randevular</p>
                        </div>
                        <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--warning)' }}>
                            {appointments.filter(a => a.status === 'pending').length}
                        </span>
                    </div>
                </div>

                {/* Sağ Taraf: Randevular */}
                <div className="card">
                    <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                        Randevu Yönetimi
                    </h3>

                    {appointments.length === 0 ? (
                        <p style={{ padding: '1rem', color: 'var(--text-muted)' }}>Henüz randevu talebi yok.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {appointments.map(app => (
                                <div key={app.id} style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    padding: '1.2rem',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderLeft: `4px solid ${app.status === 'approved' ? 'var(--success)' : app.status === 'rejected' ? 'var(--danger)' : 'var(--warning)'}`
                                }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{app.customer_name}</span>
                                            <span className={`badge ${app.status === 'approved' ? 'bg-approved' : app.status === 'rejected' ? 'bg-rejected' : 'bg-pending'}`}>
                                                {app.status === 'approved' ? 'ONAYLI' : app.status === 'rejected' ? 'İPTAL' : 'BEKLİYOR'}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {app.date}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {app.time}</span>
                                        </div>
                                    </div>

                                    {app.status === 'pending' && (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn btn-success" style={{ padding: '0.5rem' }} onClick={() => updateStatus(app.id, 'approved')} title="Onayla">
                                                <Check size={20} />
                                            </button>
                                            <button className="btn btn-danger" style={{ padding: '0.5rem' }} onClick={() => updateStatus(app.id, 'rejected')} title="Reddet">
                                                <X size={20} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProviderDashboard;
