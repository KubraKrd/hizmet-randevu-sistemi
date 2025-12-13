const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { run, get, all } = require('./config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const PORT = 5001; // Different port to avoid conflict with previous app (5000)
const JWT_SECRET = 'randevu_gizli_anahtar_123';

app.use(cors());
app.use(express.json());

// --- AUTH ROUTES ---

// Register
app.post('/api/auth/register', async (req, res) => {
    const { username, password, role, full_name, category, bio } = req.body;
    try {
        const existing = await get("SELECT * FROM users WHERE username = ?", [username]);
        if (existing) return res.status(400).json({ message: 'Bu kullanıcı adı zaten alınmış.' });

        const hashedPassword = await bcrypt.hash(password, 10);

        await run(
            "INSERT INTO users (username, password, role, full_name, category, bio) VALUES (?, ?, ?, ?, ?, ?)",
            [username, hashedPassword, role, full_name, category || null, bio || null]
        );

        res.status(201).json({ message: 'Kayıt başarılı! Giriş yapabilirsiniz.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await get("SELECT * FROM users WHERE username = ?", [username]);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Hatalı kullanıcı adı veya şifre.' });
        }

        const token = jwt.sign({ id: user.id, role: user.role, name: user.full_name }, JWT_SECRET, { expiresIn: '7d' });

        // Remove password
        delete user.password;
        res.json({ token, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- DATA ROUTES ---

// Get Providers (Category filter optional)
app.get('/api/providers', async (req, res) => {
    const { category } = req.query;
    try {
        let sql = "SELECT id, full_name, category, bio FROM users WHERE role = 'provider'";
        const params = [];
        if (category && category !== 'Tümü') {
            sql += " AND category = ?";
            params.push(category);
        }
        const providers = await all(sql, params);
        res.json(providers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create Appointment
app.post('/api/appointments', async (req, res) => {
    const { provider_id, customer_id, date, time } = req.body;
    try {
        // Simple overlap check
        const existing = await get(
            "SELECT * FROM appointments WHERE provider_id = ? AND date = ? AND time = ? AND status != 'cancelled'",
            [provider_id, date, time]
        );

        if (existing) {
            return res.status(400).json({ message: 'Bu saat maalesef dolu.' });
        }

        await run(
            "INSERT INTO appointments (provider_id, customer_id, date, time, status) VALUES (?, ?, ?, ?, 'pending')",
            [provider_id, customer_id, date, time]
        );

        res.json({ message: 'Randevu talebi oluşturuldu! Onay bekleniyor.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get User's Appointments
app.get('/api/appointments/:userId', async (req, res) => {
    const { role } = req.query; // 'provider' or 'customer'
    try {
        let sql = `
            SELECT a.*, 
                   u_prov.full_name as provider_name, u_prov.category,
                   u_cust.full_name as customer_name
            FROM appointments a
            LEFT JOIN users u_prov ON a.provider_id = u_prov.id
            LEFT JOIN users u_cust ON a.customer_id = u_cust.id
        `;

        if (role === 'provider') {
            sql += " WHERE a.provider_id = ?";
        } else if (role === 'customer') {
            sql += " WHERE a.customer_id = ?";
        } else {
            // Admin sees all
            return res.json(await all(sql));
        }

        sql += " ORDER BY a.date DESC, a.time ASC";
        const appointments = await all(sql, [req.params.userId]);
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update Appointment Status
app.put('/api/appointments/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
        await run("UPDATE appointments SET status = ? WHERE id = ?", [status, req.params.id]);
        res.json({ message: `Randevu ${status} olarak güncellendi.` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Dashboard Stats (Admin)
app.get('/api/admin/stats', async (req, res) => {
    try {
        const totalUsers = await get("SELECT count(*) as count FROM users");
        const totalAppointments = await get("SELECT count(*) as count FROM appointments");
        const categoryDist = await all("SELECT category, count(*) as count FROM users WHERE role='provider' GROUP BY category");
        const popularProviders = await all(`
            SELECT u.full_name, count(a.id) as count 
            FROM appointments a 
            JOIN users u ON a.provider_id = u.id 
            GROUP BY u.id 
            ORDER BY count DESC LIMIT 5
        `);

        res.json({
            users: totalUsers.count,
            appointments: totalAppointments.count,
            categories: categoryDist,
            popular: popularProviders
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`Randevu Sistemi Sunucusu çalışıyor: http://localhost:${PORT}`);
});
