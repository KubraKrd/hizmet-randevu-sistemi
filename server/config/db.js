const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.resolve(__dirname, '../../randevu_sistemi.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Veritabanı bağlantı hatası:', err.message);
    } else {
        console.log('SQLite veritabanına bağlanıldı.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Users Table (Admins, Providers, Customers)
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('admin', 'provider', 'customer')),
            full_name TEXT NOT NULL,
            category TEXT, -- Only for providers (e.g. Kuaför, Berber)
            bio TEXT, -- Only for providers
            phone TEXT,
            working_days TEXT, -- JSON array string e.g. ["Pazartesi", "Salı"]
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Migration for existing tables: Add working_days if not exists
        db.run("ALTER TABLE users ADD COLUMN working_days TEXT", (err) => {
            // Ignore error if column already exists
        });

        // Appointments Table
        db.run(`CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            provider_id INTEGER NOT NULL,
            customer_id INTEGER NOT NULL,
            date TEXT NOT NULL, -- YYYY-MM-DD
            time TEXT NOT NULL, -- HH:MM
            status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
            rating INTEGER,
            comment TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (provider_id) REFERENCES users(id),
            FOREIGN KEY (customer_id) REFERENCES users(id)
        )`);

        console.log('Tablolar hazır.');

        // SEED DATA (Örnek Veriler)
        db.get("SELECT count(*) as count FROM users", [], async (err, row) => {
            if (err) return;
            if (row.count === 0) {
                console.log("Örnek veriler ekleniyor...");
                const salt = await bcrypt.genSalt(10);
                const pass = await bcrypt.hash('123456', salt);

                // 1. Admin
                db.run("INSERT INTO users (username, password, role, full_name) VALUES (?, ?, ?, ?)",
                    ['admin', pass, 'admin', 'Sistem Yöneticisi']);

                // 2. Provider: Kuaför Ahmet
                db.run("INSERT INTO users (username, password, role, full_name, category, bio) VALUES (?, ?, ?, ?, ?, ?)",
                    ['kuafor_ahmet', pass, 'provider', 'Ahmet Makas', 'Kuaför', 'Saç kesimi ve boya konusunda 10 yıllık deneyim.']);

                // 3. Provider: Diyetisyen Ayşe
                db.run("INSERT INTO users (username, password, role, full_name, category, bio) VALUES (?, ?, ?, ?, ?, ?)",
                    ['diyetisyen_ayse', pass, 'provider', 'Ayşe Sağlık', 'Diyetisyen', 'Kişiye özel beslenme programları.']);

                // 4. Provider: Berber Kemal
                db.run("INSERT INTO users (username, password, role, full_name, category, bio) VALUES (?, ?, ?, ?, ?, ?)",
                    ['berber_kemal', pass, 'provider', 'Kemal Traş', 'Berber', 'Damat traşı ve cilt bakımı uzmanı.']);

                // 5. Provider: Antrenör Burak
                db.run("INSERT INTO users (username, password, role, full_name, category, bio) VALUES (?, ?, ?, ?, ?, ?)",
                    ['antrenor_burak', pass, 'provider', 'Burak Fit', 'Antrenör', 'Profesyonel fitness ve vücut geliştirme koçu.']);

                // 6. Customer: Müşteri Mehmet
                db.run("INSERT INTO users (username, password, role, full_name) VALUES (?, ?, ?, ?)",
                    ['musteri1', pass, 'customer', 'Mehmet Yılmaz']);

                console.log("Örnek kullanıcılar ve Antrenör Burak eklendi! Şifreleri: 123456");
            }
        });
    });
}

// Promise Wrappers
const run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, changes: this.changes });
        });
    });
};

const get = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

const all = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

module.exports = { db, run, get, all };
