import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('randevu_user');
        if (stored) setUser(JSON.parse(stored));
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const { data } = await axios.post('/api/auth/login', { username, password });
            setUser(data.user);
            localStorage.setItem('randevu_user', JSON.stringify(data.user));
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Giriş hatası' };
        }
    };

    const register = async (userData) => {
        try {
            await axios.post('/api/auth/register', userData);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Kayıt hatası' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('randevu_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
