'use client'
import Header from '../../../../components/header'
import Footer from '../../../../components/footer'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import axios from 'axios'

interface DialogueItem {
  speaker: string;
  text: string;
  translation: string;
  highlight?: string | null;
  quiz?: {
    word: string;
    options: string[];
    correctIndex: number;
    meaning: string;
  } | null;
}

const topicMeta: Record<string, { title: string; description: string; image: string }> = {
  advertising: {
    title: 'Advertising',
    description: 'Thảo luận về quảng cáo, thương hiệu, chiến dịch marketing...',
    image: '/icons/communication.png',
  },
  travel: {
    title: 'Travel',
    description: 'Trò chuyện về du lịch, điểm đến, trải nghiệm mới...',
    image: '/icons/globe.svg',
  },
  technology: {
    title: 'Technology',
    description: 'Công nghệ, phát minh mới, xu hướng số hóa...',
    image: '/icons/study.svg',
  },
  food: {
    title: 'Food',
    description: 'Ẩm thực, món ăn yêu thích, văn hóa ẩm thực...',
    image: '/icons/notebook.svg',
  },
  education: {
    title: 'Education',
    description: 'Giáo dục, học tập, phương pháp học hiệu quả...',
    image: '/icons/user.svg',
  },
  sports: {
    title: 'Sports',
    description: 'Thể thao, sức khỏe, các môn thể thao phổ biến...',
    image: '/icons/news.svg',
  },
  environment: {
    title: 'Environment',
    description: 'Môi trường, bảo vệ thiên nhiên, biến đổi khí hậu...',
    image: '/icons/window.svg',
  },
};

export default function ConversationDetail() {
  const { url } = useParams();
  const router = useRouter();
  const [dialogue, setDialogue] = useState<DialogueItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null);
  const [step, setStep] = useState<'quiz' | 'input' | 'done' | 'idle'>('idle');
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [showTranslations, setShowTranslations] = useState<{[idx: number]: boolean}>({});
  const [inputTries, setInputTries] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [learnedVocab, setLearnedVocab] = useState<string[]>([]);
  const [hideHighlight, setHideHighlight] = useState(false);
  const [cacheKey, setCacheKey] = useState<string | null>(null);
  const [idx, setIdx] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [done, setDone] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const fetchedRef = useRef(false);

  const LOGO_URL = "https://same-assets.com/fruit/mochi.png";
  const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1503676382389-4809596d5290?w=400';

  // Ensure topic is always a string
  const topic = Array.isArray(url) ? url[0] : (url || '');

  useEffect(() => {
    async function fetchUser() {
      try {
        const resUser = await fetch('http://localhost:4000/api/me', { credentials: 'include' });
        if (!resUser.ok) throw new Error('Failed to fetch user');
        const userData = await resUser.json();
        if (!userData.loggedIn || !userData.userId) {
          router.push('/login');
          return;
        }
        setUser(userData);
      } catch (e) {
        const error = e as Error;
        setError('Lỗi khi tải thông tin người dùng: ' + (error.message || 'Không xác định'));
        router.push('/login');
      } finally {
        setUserLoading(false);
      }
    }
    fetchUser();
  }, [router]);

  useEffect(() => {
    if (userLoading || !user?.userId) return;

    async function fetchFirstQuizDialogue(startIdx = 0, cacheKeyParam = null, retries = 0) {
      const MAX_RETRIES = 5;
      if (retries >= MAX_RETRIES) {
        setError('Không tìm thấy câu có quiz sau nhiều lần thử');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        let urlApi = `http://localhost:4000/api/conversation/${topic}`;
        if (cacheKeyParam) {
          urlApi += `?cacheKey=${cacheKeyParam}&idx=${startIdx}`;
        }
        const response = await axios.get(urlApi);
        const { dialogue, cacheKey: newCacheKey, total, idx, done: isDone } = response.data;

        if (!Array.isArray(dialogue) || !dialogue.length || typeof total !== 'number' || typeof idx !== 'number') {
          throw new Error('Dữ liệu API không hợp lệ');
        }

        if (isDone) {
          setDone(true);
          setDialogue([]);
          return;
        }

        if (!dialogue[0]?.quiz) {
          await fetchFirstQuizDialogue(idx + 1, cacheKeyParam || newCacheKey, retries + 1);
          return;
        }

        setDialogue(dialogue);
        setCacheKey(cacheKeyParam || newCacheKey);
        setIdx(idx);
        setTotal(total);
        setImage(topicMeta[topic]?.image || PLACEHOLDER_IMAGE);
        setDone(false);
      } catch (err) {
        const error = err as Error;
        setError(error instanceof Error ? error.message : `Lỗi khi tải hội thoại`);
      } finally {
        setLoading(false);
      }
    }

    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchFirstQuizDialogue();
    }
  }, [topic, userLoading, user]);

  useEffect(() => {
    if (!dialogue.length || userLoading || !user?.userId) {
      if (!dialogue.length && !loading) {
        setError('Không có dữ liệu hội thoại');
      }
      return;
    }

    const isValidDialogue = dialogue.every(item => 
      item.speaker && item.text && item.translation && 
      (!item.quiz || (item.quiz.word && Array.isArray(item.quiz.options) && item.quiz.correctIndex >= 0))
    );

    if (!isValidDialogue) {
      setError('Dữ liệu hội thoại không hợp lệ');
      setDialogue([]);
      return;
    }

    if (dialogue[currentIdx]?.quiz) {
      setStep('quiz');
      setQuizSelected(null);
      setQuizCorrect(null);
      setInputValue('');
      setInputError('');
      setShowAnswer(false);
      setInputTries(0);
      setHideHighlight(false);
    } else {
      setStep('idle');
    }
  }, [currentIdx, dialogue, userLoading, user]);

  useEffect(() => {
    if (learnedVocab.length >= 5) {
      setDone(true);
      setDialogue([]);
      alert('Chúc mừng! Bạn đã học đủ 5 từ vựng mới!');
    }
  }, [learnedVocab]);

  const fetchNextDialogue = async (nextIdx: number) => {
    if (!cacheKey || isTransitioning) return;
    setLoading(true);
    try {
      let nextDialogueFetched = false;
      let currentIdx = nextIdx;
      while (!nextDialogueFetched) {
        if (learnedVocab.length >= 5) {
          setDone(true);
          setDialogue([]);
          return;
        }
        const response = await axios.get(`http://localhost:4000/api/conversation/${topic}?cacheKey=${cacheKey}&idx=${currentIdx}`);
        if (response.data.done) {
          setDone(true);
          setDialogue([]);
          return;
        }
        if (response.data.dialogue[0]?.quiz) {
          setDialogue(response.data.dialogue);
          setIdx(response.data.idx);
          setTotal(response.data.total);
          nextDialogueFetched = true;
        } else {
          currentIdx++;
        }
      }
    } catch (err) {
      const error = err as Error;
      setError(error instanceof Error ? error.message : `Lỗi khi tải hội thoại`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuiz = async (optionIdx: number) => {
    if (!dialogue[0].quiz || isTransitioning) return;
    setQuizSelected(optionIdx);
    const correct = optionIdx === dialogue[0].quiz.correctIndex;
    setQuizCorrect(correct);
    if (correct) {
      setStep('input');
      setHideHighlight(true);
      setInputValue('');
      setInputError('');
      setShowAnswer(false);
      setInputTries(0);
      const word = dialogue[0].quiz?.word;
      if (word && !learnedVocab.includes(word)) {
        try {
          await axios.post('http://localhost:4000/api/conversation/result', {
            userId: user.userId,
            topic,
            vocab: word,
            isCorrect: true,
          });
          setLearnedVocab(prev => [...prev, word]);
        } catch (err) {
          console.error('Failed to save result:', err);
        }
      }
    } else {
      setTimeout(() => {
        setQuizSelected(null);
        setQuizCorrect(null);
      }, 800);
    }
  };

  const handleInput = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isTransitioning || !dialogue[0].quiz) return;
    setIsTransitioning(true);
    const word = dialogue[0].quiz?.word || '';
    if (inputValue.trim().toLowerCase() === word.toLowerCase()) {
      setStep('done');
      setTimeout(() => {
        if (learnedVocab.length + 1 >= 5) {
          setDone(true);
          setDialogue([]);
          setIsTransitioning(false);
          return;
        }
        fetchNextDialogue(idx + 1);
        setStep('quiz');
        setQuizSelected(null);
        setQuizCorrect(null);
        setInputValue('');
        setInputError('');
        setShowAnswer(false);
        setInputTries(0);
        setHideHighlight(false);
        setIsTransitioning(false);
      }, 500);
    } else {
      setInputError('Sai chính tả, hãy thử lại!');
      setInputTries(t => {
        const newTries = t + 1;
        if (newTries >= 3) setShowAnswer(true);
        return newTries;
      });
      setIsTransitioning(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Speech synthesis not supported');
    }
  };

  if (userLoading) return <div className="p-8 text-center">Đang tải thông tin người dùng...</div>;
  if (loading) return <div className=" residence-8 text-center">Đang tải dữ liệu...</div>;
  if (done) return (
    <div className="p-8 text-center text-green-600 font-bold text-2xl">
      Bạn đã hoàn thành hội thoại!
      <div className="mt-4">
        <button
          className="bg-blue-500 text-white px-6 py-2 rounded"
          onClick={() => router.push('/conversation')}
        >
          Bắt đầu hội thoại khác
        </button>
      </div>
    </div>
  );
  if (error || !dialogue.length) return <div className="p-8 text-center text-red-600">{error || 'Không tìm thấy hội thoại'}</div>;

  const currentQuiz = dialogue[0]?.quiz;
  const highlightWord = dialogue[0]?.highlight || '';
  const sentence = (step === 'quiz' && !hideHighlight && highlightWord)
    ? dialogue[0]?.text?.replace(
        highlightWord,
        `<u class='text-blue-700 font-bold underline'>${highlightWord}</u>`
      )
    : dialogue[0]?.text;

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col relative">
      <Header />
      <div className="flex flex-col flex-1 max-w-4xl mx-auto w-full pt-8 pb-44 min-h-0">
        <div className="flex flex-col items-center gap-2 mb-2">
          <div className="flex items-center gap-2 text-gray-700">
            <img src={topicMeta[topic]?.image || PLACEHOLDER_IMAGE} alt="icon" className="w-10 h-10 mr-2" />
            <span className="text-2xl font-bold">{topicMeta[topic]?.title || topic}</span>
          </div>
          <div className="text-gray-500 text-center mb-2">{topicMeta[topic]?.description}</div>
          <img src={image ?? PLACEHOLDER_IMAGE} alt="minh hoạ" className="w-48 h-36 object-cover rounded-xl shadow border" />
          <div className="text-gray-600">Từ vựng đã học: {learnedVocab.length}/5</div>
        </div>
        <div className="flex flex-col items-center mt-6">
          <div className="w-full max-w-xl">
            <div className="rounded-xl px-5 py-3 bg-white border border-gray-200 shadow-lg flex items-center min-w-[150px] mb-4">
              <button onClick={() => speakText(dialogue[0].text)} className="text-orange-400 mr-2" disabled={isTransitioning}>
                <span aria-label="Đọc" role="img">🔊</span>
              </button>
              <div className="flex flex-col">
                <span className="text-xl text-black" dangerouslySetInnerHTML={{ __html: sentence }} />
                <button
                  className="text-blue-600 underline text-sm mt-1 w-fit"
                  onClick={() => setShowTranslations(prev => ({ ...prev, [currentIdx]: !prev[currentIdx] }))}
                  type="button"
                  disabled={isTransitioning}
                >
                  {showTranslations[currentIdx] ? 'Ẩn dịch' : 'Dịch'}
                </button>
                {showTranslations[currentIdx] && (
                  <span className="text-lg text-black">{dialogue[0].translation}</span>
                )}
              </div>
            </div>
            {step === 'quiz' && currentQuiz && Array.isArray(currentQuiz.options) && currentQuiz.options.length >= 2 && (
              <div className="mb-4">
                <div className="font-semibold mb-2 text-center text-black">Chọn nghĩa đúng của từ <u>{highlightWord}</u>:</div>
                <div className="grid grid-cols-2 gap-4">
                  {currentQuiz.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuiz(idx)}
                      disabled={quizSelected !== null || isTransitioning}
                      className={`rounded-lg px-5 py-2 border text-base font-bold bg-white transition border-gray-300 text-green-700 disabled:opacity-60
                        ${quizSelected !== null
                          ? idx === currentQuiz.correctIndex
                            ? '!bg-green-100 !border-green-700 !text-green-700'
                            : idx === quizSelected
                              ? '!bg-red-100 !border-red-700 !text-red-700'
                              : ''
                          : 'hover:bg-green-100'
                        }`}
                    >{String.fromCharCode(65 + idx)}. {opt}</button>
                  ))}
                </div>
                {quizSelected !== null && !quizCorrect && (
                  <div className="mt-2 text-red-600 font-semibold">Sai rồi! Hãy chọn lại.</div>
                )}
                {quizSelected !== null && quizCorrect && (
                  <div className="mt-2 text-green-700 font-semibold">Chính xác! Hãy nhập lại từ tiếng Anh.</div>
                )}
              </div>
            )}
            {step === 'input' && (
              <form onSubmit={handleInput} className="flex items-center gap-4 mt-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  className="border px-3 py-2 rounded w-48 text-black outline-green-600"
                  autoFocus
                  placeholder="Nhập lại từ tiếng Anh..."
                  disabled={isTransitioning}
                />
                <button type="submit" className="bg-white text-green-700 px-6 py-2 rounded font-bold" disabled={isTransitioning}>
                  Kiểm tra
                </button>
                {inputError && <div className="ml-4 text-red-600">{inputError}</div>}
                {showAnswer && <div className="ml-4 text-yellow-600">Gợi ý: <b>{currentQuiz?.word}</b></div>}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}