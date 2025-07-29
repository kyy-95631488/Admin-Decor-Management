// File: Sidebar.js
// Komponen sidebar untuk navigasi antar bagian dashboard
const Sidebar = ({ setActiveSection, isSidebarOpen, toggleSidebar }) => {
    return (
        <div className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-blue-900 to-blue-700 text-white p-4 sm:p-6 sidebar z-50 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex items-center justify-between mb-6 sm:mb-8">
                <h1 className="text-lg sm:text-xl font-bold">Admin Dashboard</h1>
                <button className="lg:hidden text-white" onClick={toggleSidebar}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <nav>
                <ul className="space-y-2">
                    {[
                        { name: 'Kelola Produk', section: 'products', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8' },
                        { name: 'Kelola Dekorasi', section: 'decorations', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                        { name: 'Dekorasi Dibatalkan', section: 'canceled', icon: 'M6 18L18 6M6 6l12 12' }
                    ].map(item => (
                        <li key={item.section}>
                            <button
                                onClick={() => {
                                    setActiveSection(item.section);
                                    toggleSidebar();
                                }}
                                className="flex items-center w-full text-left py-2 sm:py-3 px-3 sm:px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
                            >
                                <svg className="w-4 h-4 sm:w-5 h-5 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                                </svg>
                                {item.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};