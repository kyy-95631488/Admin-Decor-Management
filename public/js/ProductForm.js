// File: ProductForm.js
// Komponen untuk menambahkan produk baru
const ProductForm = ({ fetchProducts }) => {
    const [productName, setProductName] = React.useState('');
    const [stock, setStock] = React.useState('');

    // Fungsi untuk menangani penambahan produk
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validasi: memastikan semua kolom terisi
        if (!productName || !stock) {
            Swal.fire({
                icon: 'warning',
                title: 'Formulir Tidak Lengkap',
                text: 'Lengkapi semua kolom',
                showConfirmButton: true,
                confirmButtonColor: '#2563eb',
                animation: true,
                showClass: { popup: 'animate__animated animate__fadeInDown' },
                hideClass: { popup: 'animate__animated animate__fadeOutUp' }
            });
            return;
        }

        try {
            // Mengirim data produk ke API
            await axios.post('/api/products', { productName, stock: parseInt(stock) });
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Produk berhasil ditambahkan!',
                showConfirmButton: true,
                confirmButtonColor: '#2563eb',
                animation: true,
                showClass: { popup: 'animate__animated animate__bounceIn' },
                hideClass: { popup: 'animate__animated animate__bounceOut' }
            });
            setProductName('');
            setStock('');
            fetchProducts(); // Memperbarui daftar produk
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Gagal menambahkan produk: ' + error.message,
                showConfirmButton: true,
                confirmButtonColor: '#2563eb',
                animation: true,
                showClass: { popup: 'animate__animated animate__shakeX' },
                hideClass: { popup: 'animate__animated animate__fadeOut' }
            });
        }
    };

    return (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg w-full max-w-md mx-auto animate-[fadeIn_0.8s]">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Tambah Produk Baru</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nama Produk</label>
                    <input
                        type="text"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        className="mt-1 p-2 sm:p-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Stok</label>
                    <input
                        type="number"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        className="mt-1 p-2 sm:p-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        required
                    />
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                        onClick={handleSubmit}
                        className="flex-1 bg-blue-600 text-white py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                    >
                        Tambah Produk
                    </button>
                    <button
                        onClick={() => { setProductName(''); setStock(''); }}
                        className="flex-1 bg-gray-200 py-2 sm:py-3 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base"
                    >
                        Bersihkan
                    </button>
                </div>
            </div>
        </div>
    );
};