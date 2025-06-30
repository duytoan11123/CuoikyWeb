'use client';
import Header from '../../../../components/header';
import Footer from '../../../../components/footer';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const reviewImage = "https://img.freepik.com/premium-vector/cute-cat-reading-book-cartoon-mascot-logo-design-flat-design-style_203040-92.jpg";
const sleepImage = "https://img.freepik.com/free-vector/cute-shiba-inu-dog-sleeping-flower-cartoon-vector-icon-illustration-animal-holiday-isolated-flat_138676-10004.jpg?semt=ais_hybrid&w=740";

export default function NotebookPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>({});
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [reviewWords, setReviewWords] = useState<any[]>([]);
  const [sleepWords, setSleepWords] = useState<any[]>([]);
  const [totalWords, setTotalWords] = useState<number>(0);
  const [currentLevel, setCurrentLevel] = useState<number | null>(null);
  const [levelWords, setLevelWords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  useEffect(() => {
    async function fetchUserAndWords() {
      try {
        const resUser = await fetch('http://localhost:4000/api/me', { credentials: 'include' });
        const userData = await resUser.json();
        setUser(userData);
        if (!userData.loggedIn) {
          router.push('/');
          return;
        }
        const userId = userData.user.userInfo.userId;
        const resTotal = await fetch(`http://localhost:4000/vocabulary/getReviewWords?userId=${userId}`);
        const total = await resTotal.json();
        setTotalWords(total.total || 0);
        const resSleep = await fetch(`http://localhost:4000/vocabulary/getSleepWords?userId=${userId}`);
        setSleepWords(await resSleep.json());
      } catch (error) {
        console.error('Error fetching user and words:', error);
        setError('Không thể tải dữ liệu người dùng.');
      }
    }
    fetchUserAndWords();
  }, [router]);

  const handleSearch = async () => {
    if (!user?.user?.userInfo?.userId || !search) {
      setError('Vui lòng đăng nhập và nhập từ để tìm kiếm.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentLevel(null);
    setSelectedWords([]);
    try {
      const res = await fetch(
        `http://localhost:4000/vocabulary/getWords?userId=${user.user.userInfo.userId}&search=${encodeURIComponent(search)}`,
        { credentials: 'include' }
      );
      if (!res.ok) {
        throw new Error('Không thể lấy dữ liệu từ điển.');
      }
      const results = await res.json();
      setSearchResults(results || []);
      // Tự động thêm các từ có type: 'review' vào selectedWords
      setSelectedWords(results.filter((word: any) => word.type === 'review').map((word: any) => word.word));
      setLevelWords([]);
    } catch (error) {
      console.error('Search error:', error);
      setError('Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLevelClick = async (level: number) => {
    if (!user?.user?.userInfo?.userId) {
      setError('Vui lòng đăng nhập để xem từ theo cấp độ.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentLevel(level);
    setSearch('');
    setSearchResults([]);
    setSelectedWords([]);
    try {
      const res = await fetch(
        `http://localhost:4000/vocabulary/getWordsByLevel?userId=${user.user.userInfo.userId}&level=${level}`,
        { credentials: 'include' }
      );
      if (!res.ok) {
        throw new Error(`Không thể lấy từ vựng cho cấp độ ${level}.`);
      }
      const results = await res.json();
      setLevelWords(results || []);
      // Tự động thêm các từ có type: 'review' vào selectedWords
      setSelectedWords(results.filter((word: any) => word.type === 'review').map((word: any) => word.word));
    } catch (error) {
      console.error(`Error fetching level ${level} words:`, error);
      setError(`Có lỗi xảy ra khi lấy từ vựng cấp độ ${level}. Vui lòng thử lại.`);
      setLevelWords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWordSelection = (word: string) => {
    setSelectedWords(prev =>
      prev.includes(word) ? prev.filter(w => w !== word) : [...prev, word]
    );
  };

  const handleSave = async () => {
    if (!user?.user?.userInfo?.userId) {
      setError('Vui lòng đăng nhập để lưu trạng thái từ.');
      return;
    }

    const currentWords = currentLevel ? levelWords : searchResults;
    const reviewWords = selectedWords;
    const sleepWords = currentWords
      .map(w => w.word)
      .filter(w => !selectedWords.includes(w));

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:4000/vocabulary/updateWordTypes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: user.user.userInfo.userId,
          reviewWords,
          sleepWords,
        }),
      });
      if (!res.ok) {
        throw new Error('Không thể cập nhật trạng thái từ.');
      }
      const result = await res.json();
      setError(null);
      alert(result.message);

      const resReview = await fetch(`http://localhost:4000/vocabulary/getReviewWords?userId=${user.user.userInfo.userId}`);
      const reviewData = await resReview.json();
      setTotalWords(reviewData.total || 0);

      const resSleep = await fetch(`http://localhost:4000/vocabulary/getSleepWords?userId=${user.user.userInfo.userId}`);
      setSleepWords(await resSleep.json());

      // Cập nhật lại danh sách từ để phản ánh trạng thái mới
      if (currentLevel) {
        const res = await fetch(
          `http://localhost:4000/vocabulary/getWordsByLevel?userId=${user.user.userInfo.userId}&level=${currentLevel}`,
          { credentials: 'include' }
        );
        if (res.ok) {
          const results = await res.json();
          setLevelWords(results || []);
          setSelectedWords(results.filter((word: any) => word.type === 'review').map((word: any) => word.word));
        }
      } else if (search) {
        const res = await fetch(
          `http://localhost:4000/vocabulary/getWords?userId=${user.user.userInfo.userId}&search=${encodeURIComponent(search)}`,
          { credentials: 'include' }
        );
        if (res.ok) {
          const results = await res.json();
          setSearchResults(results || []);
          setSelectedWords(results.filter((word: any) => word.type === 'review').map((word: any) => word.word));
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      setError('Có lỗi xảy ra khi lưu trạng thái từ. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user?.user?.userInfo?.userId) {
    return <div>Đang tải thông tin người dùng...</div>;
  }

  return (
    <div style={{ background: '#fafbfc', minHeight: '100vh' }}>
      <Header />
      <div className="w-full relative" style={{ padding: '20px 40px' }}>
        <div className="flex justify-between mb-2">
          {[1, 2, 3, 4, 5].map(level => (
            <div
              key={level}
              className={`text-gray-600 cursor-pointer hover:text-blue-600 ${currentLevel === level ? 'font-bold' : ''}`}
              onClick={() => handleLevelClick(level)}
            >
              Cấp độ {level}
            </div>
          ))}
        </div>
        <div className="flex w-full h-4 rounded-full overflow-hidden">
          <div className="h-full" style={{ width: '20%', background: '#ff6b6b' }}></div>
          <div className="h-full" style={{ width: '20%', background: '#ffd166' }}></div>
          <div className="h-full" style={{ width: '20%', background: '#7cd1f9' }}></div>
          <div className="h-full" style={{ width: '20%', background: '#4da5e3' }}></div>
          <div className="h-full" style={{ width: '20%', background: '#3b5dae' }}></div>
        </div>
        <div className="flex mt-1">
          {[1, 2, 3, 4, 5].map(level => (
            <div key={level} className="flex items-center justify-center" style={{ width: '20%' }}>
              {level === 1 && (
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(dot => (
                    <div key={dot} className="h-2 w-2 rounded-full bg-green-500 mx-0.5"></div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-center w-full mt-2">
        <div className="flex bg-gray-100 rounded-full px-4 py-2 w-full max-w-xl shadow-sm items-center">
          <input
            className="flex-1 bg-transparent outline-none px-2 py-1 text-gray-700 placeholder:text-gray-400 text-base"
            placeholder="Gõ vào đây từ bạn muốn tìm"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
          />
          <button
            type="button"
            className="bg-green-500 hover:bg-green-600 font-semibold text-white rounded-full px-5 py-2 ml-3 transition-all shadow"
            onClick={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
          <button
            type="button"
            className="bg-blue-500 hover:bg-blue-600 font-semibold text-white rounded-full px-5 py-2 ml-3 transition-all shadow"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
        <div className="w-full max-w-xl mt-4 px-4">
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {isLoading && <div className="text-gray-600">Đang tải dữ liệu...</div>}
          {!isLoading && currentLevel && levelWords.length > 0 ? (
            <>
              <h2 className="text-xl font-semibold mb-4">Từ vựng cấp độ {currentLevel}</h2>
              {levelWords.map((word: any, idx: number) => (
                <div key={idx} className="mb-6 flex items-start">
                  <input
                    type="checkbox"
                    checked={selectedWords.includes(word.word)}
                    onChange={() => handleWordSelection(word.word)}
                    className="mr-3 mt-2 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center appearance-none checked:bg-green-500 checked:text-white"
                  />
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-xl font-medium text-gray-800">{word.word}</h3>
                      <div className="text-gray-500 ml-3">{word.phonetic}</div>
                    </div>
                    <div className="mt-1 text-gray-600">({word.partOfSpeech})</div>
                    <div className="mt-2 text-gray-800">{word.meaning}</div>
                  </div>
                </div>
              ))}
            </>
          ) : !isLoading && currentLevel && levelWords.length === 0 ? (
            <div className="text-gray-600">Không có từ vựng nào ở cấp độ {currentLevel}.</div>
          ) : !isLoading && searchResults.length > 0 ? (
            searchResults.map((word: any, idx: number) => (
              <div key={idx} className="mb-6 flex items-start">
                <input
                  type="checkbox"
                  checked={selectedWords.includes(word.word)}
                  onChange={() => handleWordSelection(word.word)}
                  className="mr-3 mt-2 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center appearance-none checked:bg-green-500 checked:text-white"
                />
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
      <Footer />
    </div>
  );
}