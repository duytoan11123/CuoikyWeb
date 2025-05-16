'use client'
import { useEffect, useState } from 'react';
import Header from '../../../components/header';
import Footer from '../../../components/footer';
import { useRouter } from 'next/navigation';
import { redirect } from 'next/dist/server/api-utils';

export default function NewsPage() {
    const router = useRouter();
    const [data, setData] = useState<any>([]);
    const [user, setUser] = useState<any>({});

    useEffect(() => {
        async function fetchData() {
            try{
                const cachedData = localStorage.getItem('newsData');
                const cachedTime = localStorage.getItem('newsTime');
                if (cachedData && cachedTime && (Date.now() - parseInt(cachedTime)) < 10) {
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
    if (!user?.user?.userInfo?.userId) {
    return <div>Đang tải thông tin người dùng...</div>;
}
    if (!Array.isArray(data)) {
        return <div>Loading...</div>; // Hoặc có thể hiển thị một thông báo lỗi tùy theo nhu cầu
    }
    return (
        <div>
            <Header/>
            <div className="max-w-7xl mx-auto p-6 bg-gray-50">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-10">Danh sách Bài Báo</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((article: any) => (
            <div key={article.link} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                {/* Hiển thị hình ảnh */}
                <a href={`news/${encodeURIComponent(article.link)}`} rel="noopener noreferrer">
                    <img src={article.thumbnail} alt={article.title} className="w-full h-64 object-cover rounded-md mb-4" />
                </a>
                
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">{article.title}</h2>

                <div className="text-sm text-gray-600 mb-4">
                <span className="font-medium text-gray-800">Ngày đăng:</span> {new Date(article.pubDate).toLocaleDateString()}
                </div>

                <p className="text-gray-600 mb-4">{article.description}</p>

                <a
                href={`news/${encodeURIComponent(article.link)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
                >
                Đọc thêm
                </a>
                
                <div className="mt-4 text-gray-600">
                </div>
            </div>
            ))}
        </div>
        </div>
            <Footer />
        </div>
    )
}