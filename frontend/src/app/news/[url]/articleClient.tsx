'use client';

import { useEffect, useState } from 'react';
import Header from '../../../../components/header';
import SelectionPopup from '../../../../components/selectionPopup';
export default function ArticleClient({ url }: { url: string }) {
  const [html, setHtml] = useState('');
  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const decodeUrl = decodeURIComponent(url);
        const res = await fetch('http://localhost:4000/api/get/fetchHtmlFromUrl', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ decodeUrl })
        });
        const data = await res.json();
        setHtml(data.html);
        // Chia html thành các trang 1200 ký tự, không cắt giữa thẻ HTML
        const htmlString = data.html || '';
        const pageSize = 4000;
        let pagesArr: string[] = [];
        let idx = 0;
        // Tách theo ký tự nhưng cố gắng không cắt giữa thẻ HTML
        while (idx < htmlString.length) {
          let end = idx + pageSize;
          if (end < htmlString.length) {
            // Lùi lại đến dấu > gần nhất để không cắt giữa thẻ
            let lastClose = htmlString.lastIndexOf('>', end);
            if (lastClose > idx) {
              end = lastClose + 1;
            }
          }
          pagesArr.push(htmlString.slice(idx, end));
          idx = end;
        }
        setPages(pagesArr);
        setCurrentPage(0);
      } catch (error) {
        console.error('fetch Html data error: ', error);
      }
    }
    fetchData();
  }, [url]);

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-pink-100">
      <Header />
      <SelectionPopup/>
      <main className="max-w-3xl mx-auto px-6 py-12 text-lg leading-relaxed text-gray-800 bg-white shadow-2xl rounded-3xl mt-10 mb-10 border border-indigo-100 flex flex-col items-center">
        {pages.length > 0 ? (
          <>
            <div
              className="w-full [&>p]:mb-4 [&>h1]:text-4xl [&>h2]:text-2xl [&>h3]:text-xl [&>h1,h2,h3]:font-bold [&>h1]:text-indigo-700 [&>h2]:text-indigo-600 [&>h3]:text-indigo-500 [&>ul]:list-disc [&>ul]:pl-6 [&>blockquote]:italic font-[Times_New_Roman]"
              style={{ fontFamily: 'Times New Roman', fontSize: '1.15rem', minHeight: '400px', overflowY: 'auto' }}
              dangerouslySetInnerHTML={{ __html: pages[currentPage] }}
            />
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
                disabled={currentPage === 0}
                className="px-4 py-2 rounded-lg bg-indigo-200 text-indigo-800 font-semibold disabled:opacity-50 hover:bg-indigo-400 transition"
              >
                ← Trang trước
              </button>
              <span className="px-4 py-2 text-gray-700 font-medium">
                Trang {currentPage + 1} / {pages.length}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, pages.length - 1))}
                disabled={currentPage === pages.length - 1}
                className="px-4 py-2 rounded-lg bg-indigo-200 text-indigo-800 font-semibold disabled:opacity-50 hover:bg-indigo-400 transition"
              >
                Trang sau →
              </button>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500">Đang tải nội dung...</div>
        )}
      </main>
    </div>
  </>
  );
}
