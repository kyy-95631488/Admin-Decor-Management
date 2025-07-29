// File: DecorationList.js
// Komponen untuk menampilkan daftar riwayat dekorasi
const DecorationList = ({ decorations, products }) => {
    return (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg w-full mx-auto animate-[fadeIn_0.8s] max-w-4xl">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Riwayat Dekorasi</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm sm:text-base">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 sm:p-4">Nama Produk</th>
                            <th className="p-2 sm:p-4">Jumlah</th>
                            <th className="p-2 sm:p-4">Tanggal Pembelian</th>
                        </tr>
                    </thead>
                    <tbody>
                        {decorations.map(decoration => {
                            // Mencocokkan ID produk dengan nama produk
                            const product = products.find(p => p.id === decoration.product_id);
                            return (
                                <tr key={decoration.id} className="border-b hover:bg-gray-50">
                                    <td className="p-2 sm:p-4">{product ? product.name : 'Tidak Diketahui'}</td>
                                    <td className="p-2 sm:p-4">{decoration.quantity}</td>
                                    <td className="p-2 sm:p-4">{new Date(decoration.purchase_date).toLocaleDateString()}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

window.DecorationList = DecorationList;