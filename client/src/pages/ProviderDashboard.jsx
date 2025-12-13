import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, Check, X, User } from 'lucide-react';

const ProviderDashboard = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        try {
            // "role=provider" ensures we ONLY fetch appointments assigned to THIS provider
            const { data } = await axios.get(`/api/appointments/${user.id}?role=provider`);
            setAppointments(data);
        } catch (error) { console.error(error); }
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.put(`/api/appointments/${id}/status`, { status });
            toast.success(`Randevu ${status === 'approved' ? 'ONAYLANDI' : 'REDDEDİLDİ'}. (Müşteriye SMS gitti)`);
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
                <div>
                    <div className="card" style={{ padding: '10px 20px', textAlign: 'center' }}>
                        <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                            {appointments.filter(a => a.status === 'pending').length}
                        </span>
                        <span style={{ fontSize: '0.8rem' }}>Bekleyen İstek</span>
                    </div>
                </div>
            </div>

            <div className="card">
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '15px' }}>Randevu Talepleri & Geçmişi</h3>

                {appointments.length === 0 ? (
                    <p style={{ padding: '20px', color: 'gray' }}>Henüz randevu talebi yok.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', color: 'var(--text-muted)' }}>
                                <th style={{ padding: '10px' }}>Müşteri</th>
                                <th style={{ padding: '10px' }}>Tarih</th>
                                <th style={{ padding: '10px' }}>Saat</th>
                                <th style={{ padding: '10px' }}>Durum</th>
                                <th style={{ padding: '10px' }}>İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map(app => (
                                <tr key={app.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '15px', fontWeight: '500' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <User size={16} />
                                            </div>
                                            {app.customer_name}
                                        </div>
                                    </td>
                                    <td style={{ padding: '15px' }}><span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={14} /> {app.date}</span></td>
                                    <td style={{ padding: '15px' }}><span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={14} /> {app.time}</span></td>
                                    <td style={{ padding: '15px' }}>
                                        <span className={`badge ${app.status === 'approved' ? 'bg-approved' : app.status === 'rejected' ? 'bg-pending' : ''}`}
                                            style={{ background: app.status === 'pending' ? '#fff7ed' : undefined, color: app.status === 'pending' ? '#c2410c' : undefined }}>
                                            {app.status === 'pending' ? 'BEKLİYOR' : app.status === 'approved' ? 'ONAYLI' : 'İPTAL'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        {app.status === 'pending' && (
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                <button className="btn btn-success" style={{ padding: '5px 10px' }} onClick={() => updateStatus(app.id, 'approved')}>
                                                    <Check size={16} /> Onayla
                                                </button>
                                                <button className="btn btn-danger" style={{ padding: '5px 10px' }} onClick={() => updateStatus(app.id, 'rejected')}>
                                                    <X size={16} /> Red
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ProviderDashboard;
