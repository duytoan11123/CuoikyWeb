'use client'
import { useEffect, useState } from 'react';
import Header from '../../../components/header';
import Footer from '../../../components/footer';
import { useRouter } from 'next/navigation';
import SelectionPopup from '../../../components/selectionPopup';

export default function NewsPage() {
    const router = useRouter();
    const [expandedArticles, setExpandedArticles] = useState<Record<string, boolean>>({});
    const [data, setData] = useState<any[]>([]);
    const [user, setUser] = useState<any>({});
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 3;

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

                const resUser = await fetch('http://localhost:4000/api/me',{
                    credentials: 'include',
                });
                const userData = await resUser.json();
                setUser(userData);
                if (!userData.loggedIn){
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
    if (!user?.user?.userInfo?.userId) {
        return <div>Đang tải thông tin người dùng...</div>;
    }

    if (!Array.isArray(data)) {
        return <div>Loading...</div>;
    }

    const totalPages = Math.ceil(data.length / pageSize);
    const paginatedData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div>
            <SelectionPopup/>
            <Header/>
            <div className="max-w-7xl mx-auto p-6 bg-gray-50">
                <h1 className="text-4xl font-bold text-center text-gray-800 mb-10">Danh sách Bài Báo</h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedData.map((article: any) => (
                        
                        <div key={article.link} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <a href={`news/${encodeURIComponent(article.link)}`} rel="noopener noreferrer">
                                <img src={article.thumbnail} alt={article.title} className="w-full h-64 object-cover rounded-md mb-4" />
                            </a>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{article.title}</h2>
                            <div className="text-sm text-gray-600 mb-4">
                                <span className="font-medium text-gray-800">Ngày đăng:</span> {new Date(article.pubDate).toLocaleDateString()}
                            </div>
                            <p
                            className={`text-gray-600 mb-2 overflow-hidden transition-all duration-300 ${
                                expandedArticles[article.link] ? '' : 'line-clamp-3'
                            }`}
                            >
                                {article.description}
                            </p>
                            <button
                            onClick={() => toggleExpanded(article.link)}
                            className="text-sm font-bold text-gray-900 hover:underline"
                            >
                                {expandedArticles[article.link] ? 'Thu gọn ▲' : 'Xem thêm ▼'}
                            </button>

                            <br></br>
                            <a
                                href={`news/${encodeURIComponent(article.link)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                Đọc Tất Cả
                            </a>
                        </div>
                    ))}
                </div>

                {/* Phân trang */}
                <div className="flex justify-center mt-10 space-x-4">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-indigo-300 text-white rounded hover:bg-indigo-800 disabled:opacity-50 cursor-pointer"
                    >
                        ← Trước
                    </button>
                    <span className="px-4 py-2 text-gray-700">Trang {currentPage} / {totalPages}</span>
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-indigo-300 text-white rounded hover:bg-indigo-800 disabled:opacity-50 cursor-pointer"
                    >
                        Tiếp →
                    </button>
                </div>
            </div>
            <Footer />
        </div>
    )
}
