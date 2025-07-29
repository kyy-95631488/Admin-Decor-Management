// File: ProductList.js
// Komponen untuk menampilkan daftar produk dengan fitur pencarian dan paginasi
const ProductList = ({ products, searchTerm, currentPage, setCurrentPage }) => {
    const itemsPerPage = 8; // Jumlah item per halaman
    // Memfilter produk berdasarkan kata kunci pencarian
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg w-full mx-auto animate-[fadeIn_0.8s] max-w-4xl">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Daftar Produk</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm sm:text-base">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 sm:p-4">Nama Produk</th>
                            <th className="p-2 sm:p-4">Stok</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentProducts.map(product => (
                            <tr key={product.id} className="border-b hover:bg-gray-50">
                                <td className="p-2 sm:p-4">{product.name}</td>
                                <td className="p-2 sm:p-4">{product.quantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Paginasi jika jumlah halaman lebih dari satu */}
            {totalPages > 1 && (
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => setCurrentPage(index + 1)}
                            className={`px-3 sm:px-4 py-1 sm:py-2 rounded-lg text-sm sm:text-base ${currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};