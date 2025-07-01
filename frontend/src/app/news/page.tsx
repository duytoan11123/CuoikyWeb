    'use client'
    import { useEffect, useState } from 'react';
    import Header from '../../../components/header';
    import Footer from '../../../components/footer';
    import { useRouter } from 'next/navigation';
    import SelectionPopup from '../../../components/selectionPopup';
    import { motion } from 'framer-motion';

    export default function NewsPage() {
        const router = useRouter();
        const [expandedArticles, setExpandedArticles] = useState<Record<string, boolean>>({});
        const [data, setData] = useState<any[]>([]);
        const [user, setUser] = useState<any>({});
        const [currentPage, setCurrentPage] = useState(1);
        const pageSize = 6;

        useEffect(() => {
            
            async function fetchData() {
                try{
                    const cachedData = localStorage.getItem('newsData');
                    const cachedTime = localStorage.getItem('newsTime');
                    if (cachedData && cachedTime && (Date.now() - parseInt(cachedTime)) < 10 * 60 * 1000) {
                        setData(JSON.parse(cachedData));
                    } else {
                        const res = await fetch('http://localhost:4000/api/get/news',{
                            credentials: 'include'
                        });
                        const newsData = await res.json();
                        setData(newsData);
                        localStorage.setItem('newsData', JSON.stringify(newsData));
                        localStorage.setItem('newsTime', Date.now().toString());
                    }

                    const resUserId = await fetch('http://localhost:4000/api/account/getUserId',{
                        credentials: 'include',
                    });
                    const userId = await resUserId.json();
                    const resUserName = await fetch('http://localhost:4000/api/account/getAccountName',{
                        credentials: 'include',
                    });
                    const userName = await resUserName.json();
                    const userData = {
                        userId: userId.userId,
                        name: userName.name,
                    }
                    setUser(userData);
                    if (!userData.userId){
                        router.push('/');
                    }

                    
                    
                }catch(error){
                    console.log(error);
                }
            }
            fetchData();
        }, []);
        const toggleExpanded = (link: string) => {
            setExpandedArticles(prev => ({
                ...prev,
                [link]: !prev[link]
            }));
        };
        if (!user?.userId) {
            return <div>Đang tải thông tin người dùng...</div>;
        }

        if (!Array.isArray(data)) {
            return <div>Loading...</div>;
        }

        const totalPages = Math.ceil(data.length / pageSize);
        const paginatedData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-pink-100">
                <SelectionPopup />
                <Header />
                <div className="max-w-7xl mx-auto p-6">
                    <h1
                        className="text-5xl text-center text-indigo-700 mb-12 drop-shadow-lg"
                        style={{ fontFamily: 'Times New Roman', fontWeight: 'bold' }}
                    >
                        📰 Tin Tức Mới Nhất
                    </h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        {paginatedData.map((article: any) => (
                            <motion.div
                                key={article.link}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="relative bg-white rounded-3xl shadow-2xl border border-indigo-100 overflow-hidden hover:shadow-indigo-300 transition-all duration-300 group flex flex-col h-full"
                            >
                                <a href={`news/${encodeURIComponent(article.link)}`} rel="noopener noreferrer">
                                    <div className="relative">
                                        <img
                                            src={article.thumbnail}
                                            alt={article.title}
                                            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    </div>
                                </a>
                                <div className="p-6 flex flex-col flex-1">
                                    <h2 className="text-2xl font-bold text-indigo-800 mb-2 line-clamp-2">{article.title}</h2>
                                    <p className="text-xs text-gray-500 mb-3">
                                        📅 {new Date(article.pubDate).toLocaleDateString()}
                                    </p>
                                    <p
                                        className={`text-base text-gray-700 mb-4 transition-all duration-300 ${
                                            expandedArticles[article.link] ? '' : 'line-clamp-3'
                                        }`}
                                    >
                                        {article.description}
                                    </p>
                                    <div className="flex items-center justify-between mt-4">
                                        <button
                                            onClick={() => toggleExpanded(article.link)}
                                            className="text-sm text-indigo-600 hover:underline font-semibold"
                                        >
                                            {expandedArticles[article.link] ? 'Thu gọn ▲' : 'Xem thêm ▼'}
                                        </button>
                                        <a
                                            href={`news/${encodeURIComponent(article.link)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-gradient-to-r from-pink-500 to-indigo-500 text-white text-sm px-5 py-2 rounded-full shadow-lg hover:from-indigo-500 hover:to-pink-500 transition-all font-bold"
                                        >
                                            Đọc tất cả
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Phân trang */}
                    <div className="flex justify-center mt-12 space-x-2">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="w-10 h-10 rounded-full bg-indigo-200 text-indigo-700 font-bold hover:bg-indigo-500 hover:text-white transition disabled:opacity-50"
                        >
                            ←
                        </button>
                        {[...Array(totalPages)].map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentPage(idx + 1)}
                                className={`w-10 h-10 rounded-full font-bold transition ${
                                    currentPage === idx + 1
                                        ? 'bg-indigo-600 text-white shadow-lg'
                                        : 'bg-white text-indigo-700 hover:bg-indigo-100'
                                }`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="w-10 h-10 rounded-full bg-indigo-200 text-indigo-700 font-bold hover:bg-indigo-500 hover:text-white transition disabled:opacity-50"
                        >
                            →
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        )
    }
