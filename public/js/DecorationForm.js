// File: DecorationForm.js
// Komponen untuk mencatat dekorasi baru
const DecorationForm = ({ products, fetchDecorations, fetchProducts }) => {
    const [productId, setProductId] = React.useState('');
    const [quantity, setQuantity] = React.useState('');
    const [purchaseDate, setPurchaseDate] = React.useState('');

    // Fungsi untuk menangani pengiriman data dekorasi
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validasi: memastikan semua kolom terisi
        if (!productId || !quantity || !purchaseDate) {
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
            // Mengirim data dekorasi ke API
            await axios.post('/api/decorations', { productId: parseInt(productId), quantity: parseInt(quantity), purchaseDate });
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Dekorasi berhasil dicatat!',
                showConfirmButton: true,
                confirmButtonColor: '#2563eb',
                animation: true,
                showClass: { popup: 'animate__animated animate__bounceIn' },
                hideClass: { popup: 'animate__animated animate__bounceOut' }
            });
            setProductId('');
            setQuantity('');
            setPurchaseDate('');
            fetchDecorations();
            fetchProducts(); // Memperbarui stok produk
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Gagal mencatat dekorasi: ' + error.message,
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
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Catat Dekorasi</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Produk</label>
                    <select
                        value={productId}
                        onChange={(e) => setProductId(e.target.value)}
                        className="mt-1 p-2 sm:p-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        required
                    >
                        <option value="">Pilih Produk</option>
                        {products.map(product => (
                            <option key={product.id} value={product.id}>{product.name} (Stok: {product.quantity})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Jumlah</label>
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="mt-1 p-2 sm:p-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tanggal Pembelian</label>
                    <input
                        type="date"
                        value={purchaseDate}
                        onChange={(e) => setPurchaseDate(e.target.value)}
                        className="mt-1 p-2 sm:p-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        required
                    />
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                        onClick={handleSubmit}
                        className="flex-1 bg-blue-600 text-white py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                    >
                        Catat Dekorasi
                    </button>
                    <button
                        onClick={() => { setProductId(''); setQuantity(''); setPurchaseDate(''); }}
                        className="flex-1 bg-gray-200 py-2 sm:py-3 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base"
                    >
                        Bersihkan
                    </button>
                </div>
            </div>
        </div>
    );
};

window.DecorationForm = DecorationForm;