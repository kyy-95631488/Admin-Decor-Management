// File: CancelForm.js
// Komponen untuk membatalkan dekorasi
const CancelForm = ({ decorations, fetchDecorations }) => {
    const [decorationId, setDecorationId] = React.useState('');

    // Fungsi untuk menangani pembatalan dekorasi
    const handleCancel = async (e) => {
        e.preventDefault();
        // Validasi: memastikan dekorasi dipilih
        if (!decorationId) {
            Swal.fire({
                icon: 'warning',
                title: 'Formulir Tidak Lengkap',
                text: 'Pilih dekorasi yang akan dibatalkan',
                showConfirmButton: true,
                confirmButtonColor: '#2563eb',
                animation: true,
                showClass: { popup: 'animate__animated animate__fadeInDown' },
                hideClass: { popup: 'animate__animated animate__fadeOutUp' }
            });
            return;
        }

        try {
            // Mengirim permintaan DELETE ke API untuk membatalkan dekorasi
            await axios.delete(`/api/decorations/${decorationId}`);
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Dekorasi berhasil dibatalkan!',
                showConfirmButton: true,
                confirmButtonColor: '#2563eb',
                animation: true,
                showClass: { popup: 'animate__animated animate__bounceIn' },
                hideClass: { popup: 'animate__animated animate__bounceOut' }
            });
            setDecorationId('');
            fetchDecorations(); // Memperbarui daftar dekorasi
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Gagal membatalkan dekorasi: ' + error.message,
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
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Batalkan Dekorasi</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Pilih Dekorasi</label>
                    <select
                        value={decorationId}
                        onChange={(e) => setDecorationId(e.target.value)}
                        className="mt-1 p-2 sm:p-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        required
                    >
                        <option value="">Pilih Dekorasi</option>
                        {decorations.map(decoration => (
                            <option key={decoration.id} value={decoration.id}>
                                {decoration.product_name} (Jumlah: {decoration.quantity}, Tanggal: {new Date(decoration.purchase_date).toLocaleDateString()})
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                        onClick={handleCancel}
                        className="flex-1 bg-red-600 text-white py-2 sm:py-3 rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
                    >
                        Batalkan Dekorasi
                    </button>
                    <button
                        onClick={() => setDecorationId('')}
                        className="flex-1 bg-gray-200 py-2 sm:py-3 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base"
                    >
                        Bersihkan
                    </button>
                </div>
            </div>
        </div>
    );
};