// Komponen Chatbot: Menyediakan antarmuka obrolan interaktif dengan tombol toggle dan jendela pesan
const Chatbot = () => {
    // State untuk menyimpan daftar pesan (user dan bot), input pengguna, status jendela (terbuka/tutup), dan status loading
    const [messages, setMessages] = React.useState([]);
    const [input, setInput] = React.useState('');
    const [isOpen, setIsOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    // Fungsi untuk mengirim pesan pengguna ke server dan menampilkan respons bot
    const handleSend = async () => {
        // Cek jika input kosong, langsung keluar dari fungsi
        if (!input.trim()) return;

        // Tambahkan pesan pengguna ke state messages
        const userMessage = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true); // Aktifkan indikator loading
        setInput(''); // Kosongkan input setelah pengiriman

        try {
            // Kirim permintaan POST ke endpoint /api/chat dengan pesan pengguna
            const response = await axios.post('/api/chat', { message: input });
            // Tambahkan respons bot ke state messages
            const botMessage = { text: response.data.text, sender: 'bot' };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            // Tangani error: tampilkan pesan error dan log ke konsol
            const botMessage = { text: 'Gagal terhubung ke server. Silakan coba lagi.', sender: 'bot' };
            setMessages(prev => [...prev, botMessage]);
            console.error('Error saat mengirim pesan:', error);
        } finally {
            // Matikan indikator loading setelah selesai
            setIsLoading(false);
        }
    };

    return (
        // Kontainer utama: Posisi fixed di kanan bawah untuk tombol toggle chatbot
        <div className="fixed bottom-4 right-4 z-50">
            {/* Tombol toggle untuk membuka/tutup jendela chatbot dengan efek hover */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 focus:outline-none shadow-lg"
            >
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16h6" />
                </svg>
            </button>
            {/* Jendela chatbot: Hanya ditampilkan jika isOpen true, dengan animasi fadeIn */}
            {isOpen && (
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md mt-2 animate-[fadeIn_0.3s_ease-out] border border-gray-100 backdrop-blur-sm bg-opacity-90">
                    {/* Area pesan: Scrollable, menampilkan pesan user dan bot */}
                    <div className="h-64 sm:h-80 overflow-y-auto mb-4 border border-gray-200 rounded-lg p-3 bg-gray-50">
                        {messages.map((msg, index) => (
                            // Pesan: Styling berbeda untuk user (kanan, biru) dan bot (kiri, abu-abu)
                            <div key={index} className={`mb-3 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                <span className={`inline-block p-3 rounded-lg text-sm sm:text-base ${msg.sender === 'user' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                    {msg.text}
                                </span>
                            </div>
                        ))}
                        {/* Indikator loading: Muncul saat menunggu respons server */}
                        {isLoading && (
                            <div className="text-left mb-3">
                                <span className="inline-block p-3 rounded-lg bg-gray-200 text-gray-800 text-sm sm:text-base">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </span>
                            </div>
                        )}
                    </div>
                    {/* Area input: Input teks dan tombol kirim */}
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            className="flex-1 p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm sm:text-base bg-white placeholder-gray-400 transition-all duration-200"
                            placeholder="Ketik pesan Anda..."
                        />
                        {/* Tombol kirim: Dinonaktifkan saat loading dengan efek hover */}
                        <button
                            onClick={handleSend}
                            disabled={isLoading}
                            className={`bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 sm:py-3 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 text-sm sm:text-base font-medium ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Mengirim...' : 'Kirim'}
                        </button>
                    </div>
                    {/* Tombol tutup: Menutup jendela chatbot */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="mt-3 text-red-500 hover:text-red-600 text-sm sm:text-base font-medium transition-colors duration-200"
                    >
                        Tutup
                    </button>
                </div>
            )}
        </div>
    );
};

// Ekspor komponen untuk digunakan di aplikasi
window.Chatbot = Chatbot;