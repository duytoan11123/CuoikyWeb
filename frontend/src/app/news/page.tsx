'use client'
import { useEffect, useState } from 'react';
import Header from '../../../components/header';
import Footer from '../../../components/footer';




export default function NewsPage() {
    const [data, setData] = useState<any>([]);
    const [user, setUser] = useState<any>({});

    useEffect(() => {
        async function fetchData() {
            try{
                const cachedData = localStorage.getItem('newsData');
                const cachedTime = localStorage.getItem('newsTime');

                if (cachedData && cachedTime && (Date.now() - parseInt(cachedTime)) < 24*60*60*1000) {
                    setData(JSON.parse(cachedData));
                } else {
                    const res = await fetch('http://localhost:4000/api/news',{
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
            }catch(error){
                console.log(error);
            }
        }

        fetchData();
    }, []);
    console.log(user);
    return (
        <div>
            <Header />
            <div className="max-w-7xl mx-auto p-6 bg-gray-50">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-10">Danh sách Bài Báo</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((article: any) => (
            <div key={article.id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                {/* Hiển thị hình ảnh */}
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                    <img src={article.urlToImage} alt={article.title} className="w-full h-64 object-cover rounded-md mb-4" />
                </a>
                
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">{article.title}</h2>
                
                <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium text-gray-800">Tác giả:</span> {article.author}
                </div>

                <div className="text-sm text-gray-600 mb-4">
                <span className="font-medium text-gray-800">Ngày đăng:</span> {new Date(article.publishedAt).toLocaleDateString()}
                </div>

                <p className="text-gray-600 mb-4">{article.description}</p>

                <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
                >
                Đọc thêm
                </a>
                
                <div className="mt-4 text-gray-600">
                <p className="font-medium text-gray-800">Nội dung:</p>
                <p>{article.content}</p>
                </div>
            </div>
            ))}
        </div>
        </div>
            <Footer />
        </div>
    )
}