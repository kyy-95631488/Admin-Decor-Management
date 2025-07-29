// Mengimpor library yang diperlukan
const express = require('express');
const mysql = require('mysql2');
require('dotenv').config(); // Mengimpor dotenv untuk membaca variabel lingkungan dari file .env
const app = express();
const port = 3000;

// Middleware untuk memproses JSON, URL-encoded, dan menyajikan file statis
app.use(express.json()); // Memproses data JSON dari request
app.use(express.urlencoded({ extended: true })); // Memproses data form URL-encoded
app.use(express.static('public')); // Menyajikan file statis dari folder 'public'

// Konfigurasi koneksi ke database MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'decoration_db'
});

// Menghubungkan ke database dan membuat tabel jika belum ada
db.connect((err) => {
    if (err) {
        console.error('Error koneksi ke MySQL:', err);
        throw err;
    }
    console.log('Berhasil terhubung ke MySQL!');

    // Membuat tabel Produk
    db.query(`
        CREATE TABLE IF NOT EXISTS Produk (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL
        )`, (err) => {
        if (err) console.error('Error membuat tabel Produk:', err);
    });

    // Membuat tabel Stock
    db.query(`
        CREATE TABLE IF NOT EXISTS Stock (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT,
            quantity INT,
            FOREIGN KEY (product_id) REFERENCES Produk(id)
        )`, (err) => {
        if (err) console.error('Error membuat tabel Stock:', err);
    });

    // Membuat tabel Pembelian
    db.query(`
        CREATE TABLE IF NOT EXISTS Pembelian (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT,
            quantity INT,
            purchase_date DATE,
            FOREIGN KEY (product_id) REFERENCES Produk(id)
        )`, (err) => {
        if (err) console.error('Error membuat tabel Pembelian:', err);
    });
});

// Mengambil kunci API Gemini dari variabel lingkungan
const geminiApiKey = process.env.GEMINI_API_KEY;

// Endpoint POST untuk menangani permintaan obrolan ke Gemini API
app.post('/api/chat', async (req, res) => {
    const { message } = req.body; // Mengambil pesan dari body request
    if (!message) {
        return res.status(400).json({ text: 'Pesan tidak boleh kosong' });
    }

    if (!geminiApiKey) {
        return res.status(500).json({ text: 'Kunci API Gemini tidak ditemukan' });
    }

    try {
        // Mengirim permintaan ke Gemini API
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': geminiApiKey,
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }],
            }),
        });

        if (!response.ok) {
            throw new Error(`Gagal mengambil respons dari Gemini API: ${response.statusText}`);
        }

        const data = await response.json();
        // Memeriksa apakah respons memiliki kandidat yang valid
        if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
            throw new Error('Format respons dari Gemini API tidak valid');
        }

        res.json({ text: data.candidates[0].content.parts[0].text });
    } catch (error) {
        console.error('Error saat menghubungi Gemini API:', error.message);
        res.status(500).json({ text: 'Gagal memproses permintaan ke Gemini API. Silakan coba lagi.' });
    }
});

// Endpoint POST untuk menambahkan produk baru
app.post('/api/products', (req, res) => {
    const { productName, stock } = req.body;
    if (!productName || !stock) {
        return res.status(400).send('Nama produk dan stok wajib diisi');
    }

    db.query('INSERT INTO Produk (name) SELECT ? WHERE NOT EXISTS (SELECT 1 FROM Produk WHERE name = ?)',
        [productName, productName], (err, result) => {
            if (err) {
                console.error('Error menyisipkan produk:', err);
                return res.status(500).send('Gagal menyisipkan produk');
            }

            db.query('SELECT id FROM Produk WHERE name = ?', [productName], (err, rows) => {
                if (err) {
                    console.error('Error mengambil ID produk:', err);
                    return res.status(500).send('Gagal mengambil ID produk');
                }

                const productId = rows[0]?.id;
                if (!productId) {
                    return res.status(500).send('Produk tidak ditemukan');
                }

                db.query('INSERT INTO Stock (product_id, quantity) VALUES (?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?',
                    [productId, stock, stock], (err) => {
                        if (err) {
                            console.error('Error menyisipkan/memperbarui stok:', err);
                            return res.status(500).send('Gagal menyisipkan/memperbarui stok');
                        }
                        res.send('Sukses');
                    });
            });
        });
});

// Endpoint POST untuk mencatat pembelian
app.post('/api/decorations', (req, res) => {
    const { productId, quantity, purchaseDate } = req.body;
    if (!productId || !quantity || !purchaseDate) {
        return res.status(400).send('ID produk, jumlah, dan tanggal pembelian wajib diisi');
    }

    db.query('SELECT quantity FROM Stock WHERE product_id = ?', [productId], (err, rows) => {
        if (err) {
            console.error('Error memeriksa stok:', err);
            return res.status(500).send('Gagal memeriksa stok');
        }

        const currentStock = rows[0]?.quantity || 0;
        if (currentStock < quantity) {
            return res.status(400).send('Stok tidak cukup');
        }

        db.beginTransaction((err) => {
            if (err) {
                console.error('Error memulai transaksi:', err);
                return res.status(500).send('Gagal memulai transaksi');
            }

            db.query('INSERT INTO Pembelian (product_id, quantity, purchase_date) VALUES (?, ?, ?)',
                [productId, quantity, purchaseDate], (err) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error('Error menyisipkan pembelian:', err);
                            res.status(500).send('Gagal menyisipkan pembelian');
                        });
                    }

                    db.query('UPDATE Stock SET quantity = quantity - ? WHERE product_id = ?',
                        [quantity, productId], (err) => {
                            if (err) {
                                return db.rollback(() => {
                                    console.error('Error memperbarui stok:', err);
                                    res.status(500).send('Gagal memperbarui stok');
                                });
                            }

                            db.commit((err) => {
                                if (err) {
                                    return db.rollback(() => {
                                        console.error('Error menyelesaikan transaksi:', err);
                                        res.status(500).send('Gagal menyelesaikan transaksi');
                                    });
                                }
                                res.send('Sukses');
                            });
                        });
                });
        });
    });
});

// Endpoint DELETE untuk menghapus pembelian
app.delete('/api/decorations/:id', (req, res) => {
    const { id } = req.params;

    db.query('SELECT product_id, quantity FROM Pembelian WHERE id = ?', [id], (err, rows) => {
        if (err) {
            console.error('Error mengambil pembelian:', err);
            return res.status(500).send('Gagal mengambil pembelian');
        }

        if (rows.length === 0) {
            return res.status(404).send('Pembelian tidak ditemukan');
        }

        const { product_id, quantity } = rows[0];
        db.beginTransaction((err) => {
            if (err) {
                console.error('Error memulai transaksi:', err);
                return res.status(500).send('Gagal memulai transaksi');
            }

            db.query('DELETE FROM Pembelian WHERE id = ?', [id], (err) => {
                if (err) {
                    return db.rollback(() => {
                        console.error('Error menghapus pembelian:', err);
                        res.status(500).send('Gagal menghapus pembelian');
                    });
                }

                db.query('UPDATE Stock SET quantity = quantity + ? WHERE product_id = ?', [quantity, product_id], (err) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error('Error memperbarui stok:', err);
                            res.status(500).send('Gagal memperbarui stok');
                        });
                    }

                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error('Error menyelesaikan transaksi:', err);
                                res.status(500).send('Gagal menyelesaikan transaksi');
                            });
                        }
                        res.send('Sukses');
                    });
                });
            });
        });
    });
});

// Endpoint GET untuk mengambil daftar produk
app.get('/api/products', (req, res) => {
    db.query(`
        SELECT p.id, p.name, COALESCE(s.quantity, 0) AS quantity
        FROM Produk p
        LEFT JOIN Stock s ON p.id = s.product_id
    `, (err, results) => {
        if (err) {
            console.error('Error mengambil produk:', err);
            return res.status(500).send('Gagal mengambil produk');
        }
        res.json(results);
    });
});

// Endpoint GET untuk mengambil daftar pembelian
app.get('/api/decorations', (req, res) => {
    db.query(`
        SELECT p.id, p.product_id, p.quantity, p.purchase_date, pr.name AS product_name
        FROM Pembelian p
        JOIN Produk pr ON p.product_id = pr.id
    `, (err, results) => {
        if (err) {
            console.error('Error mengambil pembelian:', err);
            return res.status(500).send('Gagal mengambil pembelian');
        }
        res.json(results);
    });
});

// Menjalankan server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});