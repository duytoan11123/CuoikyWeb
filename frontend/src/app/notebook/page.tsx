'use client';
import Header from '../../../components/header';
import Footer from '../../../components/footer';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const reviewImage = "https://img.freepik.com/premium-vector/cute-cat-reading-book-cartoon-mascot-logo-design-flat-design-style_203040-92.jpg";
const sleepImage = "https://img.freepik.com/free-vector/cute-shiba-inu-dog-sleeping-flower-cartoon-vector-icon-illustration-animal-holiday-isolated-flat_138676-10004.jpg?semt=ais_hybrid&w=740";

export default function NotebookPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>({});
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sleepWords, setSleepWords] = useState<any[]>([]);
  const [totalWords, setTotalWords] = useState<number>(0);

  useEffect(() => {
    async function fetchUserAndWords() {
      try {
        const resUser = await fetch('http://localhost:4000/api/account/getUserId', { credentials: 'include' });
        const userData = await resUser.json();
        setUser(userData);
        if (!userData.userId) {
          router.push('/');
          return;
        }
        const resTotal = await fetch(`http://localhost:4000/api/vocabulary/getReviewWords`, { credentials: 'include' });
        const total = await resTotal.json();
        setTotalWords(total.total || 0);
        const resSleep = await fetch(`http://localhost:4000/api/vocabulary/getSleepWords`, { credentials: 'include' });
        setSleepWords(await resSleep.json());
      } catch (error) {
        console.log(error);
        setError('Không thể tải dữ liệu người dùng.');
      }
    }
    fetchUserAndWords();
  }, [router]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Trigger search when debouncedSearch changes
  useEffect(() => {
    if (debouncedSearch) {
      handleSearch(debouncedSearch);
    } else {
      setSearchResults([]);
    }
    // eslint-disable-next-line
  }, [debouncedSearch]);

  const handleSearch = async (keyword: string) => {
    if (!user?.userId) {
      setError('Vui lòng đăng nhập và nhập từ để tìm kiếm.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `http://localhost:4000/api/vocabulary/getWords?search=${encodeURIComponent(keyword)}`,
        { credentials: 'include' }
      );
      if (!res.ok) {
        throw new Error('Không thể lấy dữ liệu từ điển.');
      }
      const results = await res.json();
      setSearchResults(results || []);
    } catch (error) {
      setError('Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewClick = () => {
    router.push('/notebook/notebook-active');
  };

  const handleSleepClick = () => {
    router.push('/notebook/notebook-active');
  };

  if (!user?.userId) {
    return <div>Đang tải thông tin người dùng...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <h1 className="text-center font-bold text-2xl md:text-3xl pt-8 pb-4 tracking-wide">SỔ TAY MOCHI CỦA BẠN</h1>
      <div className="flex flex-col items-center w-full mt-2">
        <div className="flex bg-gray-100 rounded-full px-4 py-2 w-full max-w-xl shadow-sm items-center">
          <input
            className="flex-1 bg-transparent outline-none px-2 py-1 text-gray-700 placeholder:text-gray-400 text-base"
            placeholder="Gõ vào đây từ bạn muốn tìm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full max-w-xl mt-4 px-4">
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {isLoading && <div className="text-gray-600">Đang tải dữ liệu...</div>}
          {!isLoading && searchResults.length > 0 ? (
            searchResults.map((word: any, idx: number) => (
              <div key={idx} className="mb-6 flex items-start">
                <div className="mr-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="text-xl font-medium text-gray-800">{word.word}</h3>
                    <div className="text-gray-500 ml-3">{word.phonetic}</div>
                  </div>
                  <div className="mt-1 text-gray-600">({word.partOfSpeech})</div>
                  <div className="mt-2 text-gray-800">{word.meaning}</div>
                </div>
              </div>
            ))
          ) : (
            !isLoading && search && <div className="text-gray-600">Không tìm thấy từ "{search}" trong từ điển của bạn.</div>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-center items-center gap-6 mt-16">
        <div
          className="flex-1 max-w-xs border-2 border-yellow-300 bg-yellow-50 rounded-xl p-8 flex flex-col items-center shadow hover:shadow-lg transition relative min-w-[320px] min-h-[320px]"
          onClick={handleReviewClick}
        >
          <img src={reviewImage} alt="Ôn tập" className="h-36 w-auto mb-4 select-none pointer-events-none" />
          <div className="text-3xl font-bold font-sans mb-2 text-black">{totalWords}</div>
          <div className="text-lg text-gray-600">Ôn tập</div>
        </div>
        <div
          className="flex-1 max-w-xs border-2 border-blue-200 bg-blue-50 rounded-xl p-8 flex flex-col items-center shadow hover:shadow-lg transition relative min-w-[320px] min-h-[320px]"
          onClick={handleSleepClick}
        >
          <img src={sleepImage} alt="Ngủ đông" className="h-36 w-auto mb-4 select-none pointer-events-none" />
          <div className="text-3xl font-bold font-sans mb-2 text-black">{sleepWords.length}</div>
          <div className="text-lg text-gray-600">Từ ngủ đông</div>
        </div>
      </div>
      <Footer />
    </div>
  );
}