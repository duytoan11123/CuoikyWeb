'use client';

import { useEffect, useState } from 'react';
import Header from '../../../../components/header';
import SelectionPopup from '../../../../components/selectionPopup';
export default function ArticleClient({ url }: { url: string }) {
  const [html, setHtml] = useState('');
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
        console.log(data.html)
      } catch (error) {
        console.error('fetch Html data error: ', error);
      }
    }
    fetchData();
  }, [url]);

  return (
    <>
    <Header />
    <SelectionPopup/>
    <main className="max-w-3xl mx-auto px-4 py-10 text-lg leading-relaxed text-gray-800 bg-white shadow-md rounded-xl">
      <div className="[&>p]:mb-4 [&>h1]:text-3xl [&>h2]:text-2xl [&>h3]:text-xl [&>h1,h2,h3]:font-semibold [&>ul]:list-disc [&>ul]:pl-6 [&>blockquote]:italic" 
           dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  </>
  );
}
