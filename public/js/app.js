const { useState, useEffect } = React;

const App = () => {
    const [activeSection, setActiveSection] = useState('products');
    const [products, setProducts] = useState([]);
    const [decorations, setDecorations] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('/api/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error.message);
        }
    };

    const fetchDecorations = async () => {
        try {
            const response = await axios.get('/api/decorations');
            setDecorations(response.data);
        } catch (error) {
            console.error('Error fetching decorations:', error.message);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchDecorations();
    }, []);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-white shadow-sm p-4 flex items-center justify-between lg:hidden">
                <h1 className="text-lg sm:text-xl font-bold">Admin Dashboard</h1>
                <button onClick={toggleSidebar} className="text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </header>
            <div className="flex flex-1">
                <Sidebar setActiveSection={setActiveSection} isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                <div className={`flex-1 p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen transition-all ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
                    <div className="max-w-7xl mx-auto">
                        {activeSection === 'products' && (
                            <div className="flex flex-col space-y-6">
                                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg w-full max-w-md mx-auto">
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="p-2 sm:p-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                                    />
                                </div>
                                <ProductForm fetchProducts={fetchProducts} />
                                <ProductList 
                                    products={products} 
                                    searchTerm={searchTerm}
                                    currentPage={currentPage}
                                    setCurrentPage={setCurrentPage}
                                />
                            </div>
                        )}
                        {activeSection === 'decorations' && (
                            <div className="flex flex-col space-y-6">
                                <DecorationForm products={products} fetchDecorations={fetchDecorations} fetchProducts={fetchProducts} />
                                <DecorationList decorations={decorations} products={products} />
                            </div>
                        )}
                        {activeSection === 'canceled' && (
                            <div className="flex flex-col space-y-6">
                                <CancelForm decorations={decorations} fetchDecorations={fetchDecorations} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Chatbot /> {/* Moved Chatbot to float independently */}
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));