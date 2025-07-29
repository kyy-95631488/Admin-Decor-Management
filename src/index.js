// Mengimpor library Express untuk membuat server dan mysql2 untuk koneksi ke database MySQL
const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000; // Port tempat server akan berjalan

// Mengatur middleware untuk memproses data JSON, URL-encoded, dan menyajikan file statis dari folder 'public'
app.use(express.json()); // Mengizinkan server memproses data dalam format JSON
app.use(express.urlencoded({ extended: true })); // Mengizinkan server memproses data dari form URL-encoded
app.use(express.static('public')); // Menyajikan file statis seperti HTML, CSS, atau JS dari folder 'public'

// Konfigurasi koneksi ke database MySQL
const db = mysql.createConnection({
    host: 'localhost', // Lokasi server database
    user: 'root', // Username untuk akses database
    password: '', // Password untuk akses database (kosong dalam contoh ini)
    database: 'decoration_db' // Nama database yang digunakan
});

// Menghubungkan ke database MySQL dan membuat tabel jika belum ada
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err); // Menampilkan error jika koneksi gagal
        throw err; // Hentikan eksekusi jika gagal
    }
    console.log('Connected to MySQL Server!'); // Konfirmasi koneksi berhasil

    // Membuat tabel Produk jika belum ada
    db.query(`
        CREATE TABLE IF NOT EXISTS Produk (
            id INT AUTO_INCREMENT PRIMARY KEY, -- ID unik untuk setiap produk, otomatis bertambah
            name VARCHAR(255) NOT NULL -- Nama produk, wajib diisi
        )`, (err) => {
        if (err) console.error('Error creating Produk table:', err); // Menampilkan error jika tabel gagal dibuat
    });

    // Membuat tabel Stock untuk menyimpan jumlah stok produk
    db.query(`
        CREATE TABLE IF NOT EXISTS Stock (
            id INT AUTO_INCREMENT PRIMARY KEY, -- ID unik untuk setiap entri stok
            product_id INT, -- ID produk yang terkait
            quantity INT, -- Jumlah stok
            FOREIGN KEY (product_id) REFERENCES Produk(id) -- Kunci asing untuk menghubungkan ke tabel Produk
        )`, (err) => {
        if (err) console.error('Error creating Stock table:', err); // Menampilkan error jika tabel gagal dibuat
    });

    // Membuat tabel Pembelian untuk mencatat transaksi pembelian
    db.query(`
        CREATE TABLE IF NOT EXISTS Pembelian (
            id INT AUTO_INCREMENT PRIMARY KEY, -- ID unik untuk setiap pembelian
            product_id INT, -- ID produk yang dibeli
            quantity INT, -- Jumlah yang dibeli
            purchase_date DATE, -- Tanggal pembelian
            FOREIGN KEY (product_id) REFERENCES Produk(id) -- Kunci asing untuk menghubungkan ke tabel Produk
        )`, (err) => {
        if (err) console.error('Error creating Pembelian table:', err); // Menampilkan error jika tabel gagal dibuat
    });
});

// Endpoint POST untuk menambahkan produk baru dan stoknya
app.post('/api/products', (req, res) => {
    const { productName, stock } = req.body; // Mengambil nama produk dan jumlah stok dari body request

    // Memeriksa apakah data yang diperlukan ada
    if (!productName || !stock) {
        return res.status(400).send('Missing required fields'); // Mengembalikan error jika data kurang
    }

    // Menyisipkan produk baru ke tabel Produk, hanya jika belum ada produk dengan nama yang sama
    db.query('INSERT INTO Produk (name) SELECT ? WHERE NOT EXISTS (SELECT 1 FROM Produk WHERE name = ?)',
        [productName, productName], (err, result) => {
            if (err) {
                console.error('Error inserting product:', err); // Menampilkan error jika gagal menyisipkan produk
                return res.status(500).send('Error inserting product');
            }

            // Mengambil ID produk berdasarkan nama produk
            db.query('SELECT id FROM Produk WHERE name = ?', [productName], (err, rows) => {
                if (err) {
                    console.error('Error fetching product ID:', err); // Menampilkan error jika gagal mengambil ID
                    return res.status(500).send('Error fetching product ID');
                }

                const productId = rows[0]?.id; // Mendapatkan ID produk
                if (!productId) {
                    return res.status(500).send('Product not found'); // Mengembalikan error jika produk tidak ditemukan
                }

                // Menyisipkan atau memperbarui stok produk di tabel Stock
                db.query('INSERT INTO Stock (product_id, quantity) VALUES (?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?',
                    [productId, stock, stock], (err) => {
                        if (err) {
                            console.error('Error inserting/updating stock:', err); // Menampilkan error jika gagal
                            return res.status(500).send('Error inserting/updating stock');
                        }
                        res.send('Success'); // Mengembalikan respons sukses
                    });
            });
        });
});

// Endpoint POST untuk mencatat pembelian dekorasi
app.post('/api/decorations', (req, res) => {
    const { productId, quantity, purchaseDate } = req.body; // Mengambil data dari body request

    // Memeriksa apakah data yang diperlukan ada
    if (!productId || !quantity || !purchaseDate) {
        return res.status(400).send('Missing required fields'); // Mengembalikan error jika data kurang
    }

    // Memeriksa stok produk yang tersedia
    db.query('SELECT quantity FROM Stock WHERE product_id = ?', [productId], (err, rows) => {
        if (err) {
            console.error('Error checking stock:', err); // Menampilkan error jika gagal memeriksa stok
            return res.status(500).send('Error checking stock');
        }

        const currentStock = rows[0]?.quantity || 0; // Mendapatkan jumlah stok saat ini
        if (currentStock < quantity) {
            return res.status(400).send('Insufficient stock'); // Mengembalikan error jika stok tidak cukup
        }

        // Memulai transaksi untuk memastikan konsistensi data
        db.beginTransaction((err) => {
            if (err) {
                console.error('Error starting transaction:', err); // Menampilkan error jika transaksi gagal dimulai
                return res.status(500).send('Error starting transaction');
            }

            // Menyisipkan data pembelian ke tabel Pembelian
            db.query('INSERT INTO Pembelian (product_id, quantity, purchase_date) VALUES (?, ?, ?)',
                [productId, quantity, purchaseDate], (err) => {
                    if (err) {
                        return db.rollback(() => { // Membatalkan transaksi jika gagal
                            console.error('Error inserting decoration:', err);
                            res.status(500).send('Error inserting decoration');
                        });
                    }

                    // Mengurangi stok di tabel Stock
                    db.query('UPDATE Stock SET quantity = quantity - ? WHERE product_id = ?',
                        [quantity, productId], (err) => {
                            if (err) {
                                return db.rollback(() => { // Membatalkan transaksi jika gagal
                                    console.error('Error updating stock:', err);
                                    res.status(500).send('Error updating stock');
                                });
                            }

                            // Menyelesaikan transaksi
                            db.commit((err) => {
                                if (err) {
                                    return db.rollback(() => { // Membatalkan transaksi jika gagal
                                        console.error('Error committing transaction:', err);
                                        res.status(500).send('Error committing transaction');
                                    });
                                }
                                res.send('Success'); // Mengembalikan respons sukses
                            });
                        });
                });
        });
    });
});

// Endpoint DELETE untuk menghapus pembelian berdasarkan ID
app.delete('/api/decorations/:id', (req, res) => {
    const { id } = req.params; // Mengambil ID pembelian dari parameter URL

    // Mengambil data pembelian berdasarkan ID
    db.query('SELECT product_id, quantity FROM Pembelian WHERE id = ?', [id], (err, rows) => {
        if (err) {
            console.error('Error fetching decoration:', err); // Menampilkan error jika gagal mengambil data
            return res.status(500).send('Error fetching decoration');
        }

        if (rows.length === 0) {
            return res.status(404).send('Decoration not found'); // Mengembalikan error jika pembelian tidak ditemukan
        }

        const { product_id, quantity } = rows[0]; // Mendapatkan ID produk dan jumlah
        db.beginTransaction((err) => {
            if (err) {
                console.error('Error starting transaction:', err); // Menampilkan error jika transaksi gagal dimulai
                return res.status(500).send('Error starting transaction');
            }

            // Menghapus data pembelian dari tabel Pembelian
            db.query('DELETE FROM Pembelian WHERE id = ?', [id], (err) => {
                if (err) {
                    return db.rollback(() => { // Membatalkan transaksi jika gagal
                        console.error('Error deleting decoration:', err);
                        res.status(500).send('Error deleting decoration');
                    });
                }

                // Menambah kembali stok ke tabel Stock
                db.query('UPDATE Stock SET quantity = quantity + ? WHERE product_id = ?', [quantity, product_id], (err) => {
                    if (err) {
                        return db.rollback(() => { // Membatalkan transaksi jika gagal
                            console.error('Error updating stock:', err);
                            res.status(500).send('Error updating stock');
                        });
                    }

                    // Menyelesaikan transaksi
                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => { // Membatalkan transaksi jika gagal
                                console.error('Error committing transaction:', err);
                                res.status(500).send('Error committing transaction');
                            });
                        }
                        res.send('Success'); // Mengembalikan respons sukses
                    });
                });
            });
        });
    });
});

// Endpoint GET untuk mengambil daftar semua produk beserta stoknya
app.get('/api/products', (req, res) => {
    db.query(`
        SELECT p.id, p.name, COALESCE(s.quantity, 0) AS quantity
        FROM Produk p
        LEFT JOIN Stock s ON p.id = s.product_id
    `, (err, results) => {
        if (err) {
            console.error('Error fetching products:', err); // Menampilkan error jika gagal mengambil data
            return res.status(500).send('Error fetching products');
        }
        res.json(results); // Mengembalikan daftar produk dalam format JSON
    });
});

// Endpoint GET untuk mengambil daftar semua pembelian
app.get('/api/decorations', (req, res) => {
    db.query(`
        SELECT p.id, p.product_id, p.quantity, p.purchase_date, pr.name AS product_name
        FROM Pembelian p
        JOIN Produk pr ON p.product_id = pr.id
    `, (err, results) => {
        if (err) {
            console.error('Error fetching decorations:', err); // Menampilkan error jika gagal mengambil data
            return res.status(500).send('Error fetching decorations');
        }
        res.json(results); // Mengembalikan daftar pembelian dalam format JSON
    });
});

// Menjalankan server pada port yang ditentukan
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`); // Konfirmasi server berjalan
});