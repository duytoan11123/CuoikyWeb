"use client";
import { useEffect, useState } from "react";
import Header from "../../../components/header";
import Footer from "../../../components/footer";
import { useRouter } from "next/navigation";

interface Flashcard {
  vocabularyId: number;
  meaning: string;
  phonetic: string;
  exampleSentence: string;
  audio: string | undefined;
  imglink: string;
}

export default function FlashcardPage() {
  const [flipped, setFlipped] = useState(false);
  const [currentWord, setCurrentWord] = useState("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>({});
  const [flashcard, setFlashCard] = useState<Flashcard>({
    vocabularyId: 0,
    meaning: "",
    phonetic: "",
    exampleSentence: "",
    audio: undefined,
    imglink: "",
  });
  const [currentIndex, setCurrentIndex] = useState(0); // chỉ số từ hiện tại
  const [totalLearned, setTotalLearned] = useState(0); // số từ đã học
  const [showResult, setShowResult] = useState(false);
  //lấy thông tin người dùng
  useEffect(() => {
    async function fetchData() {
      try {
        const resUser = await fetch("http://localhost:4000/api/account/getUserId", {
          credentials: "include",
        });
        const userData = await resUser.json();
        setUser(userData);
        if (!userData.userId) {
          router.push("/");
        }
      } catch (error) {
        console.log("Lỗi khi lấy thông tin người dùng:", error);
        router.push("/");
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (user?.userId) {
      fetchFlashcardByIndex(currentIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId, currentIndex]);

  const fetchFlashcardByIndex = async (index: number) => {
    if (!user?.userId) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:4000/api/vocabulary/getRandomWord?index=${index}`,
        { credentials: 'include' }
      );
      const result = await response.json();
      console.log("API Response:", result);

      if (result.status === "success" && result.data) {
        setCurrentWord(result.data.word);
        setFlashCard({
          vocabularyId: result.data.vocabularyId,
          meaning: result.data.meaning,
          phonetic: result.data.phonetic,
          exampleSentence: result.data.exampleSentence,
          audio: result.data.audio || undefined,
          imglink: result.data.imglink,
        });
        setTotalLearned(index + 1); // cập nhật số từ đã học
      } else if (result.status === "done") {
        setCurrentWord("");
        setFlashCard({
          vocabularyId: 0,
          meaning: "",
          phonetic: "",
          exampleSentence: "",
          audio: undefined,
          imglink: "",
        });
        setIsLoading(false);
        setShowResult(true);
        return;
      } else {
        setCurrentWord("");
        setFlashCard({
          vocabularyId: 0,
          meaning: "",
          phonetic: "",
          exampleSentence: "",
          audio: undefined,
          imglink: "",
        });
      }
    } catch (error) {
      console.error("Lỗi khi lấy từ vựng:", error);
      setCurrentWord("");
      setFlashCard({
        vocabularyId: 0,
        meaning: "",
        phonetic: "",
        exampleSentence: "",
        audio: undefined,
        imglink: "",
      });
    }
    setIsLoading(false);
  };
  if (showResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="bg-white rounded-3xl shadow-lg p-10 flex flex-col items-center animate-fade-in w-full max-w-md mx-auto">
          <img
            src="/icons/logo2.jpg"
            alt="cute phone"
            className="w-28 h-28 mb-4"
          />
          <h2 className="text-2xl font-bold text-yellow-500 mb-2">
            Bạn đã học hết từ ở sổ tay
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            Số câu đã học được:{" "}
            <span className="text-pink-500 font-bold">{totalLearned}</span>
          </p>
          <button
            className="bg-green-400 hover:bg-green-500 text-white px-8 py-3 rounded-full mb-3 shadow font-bold text-lg transition-all duration-200"
            onClick={() => router.push("/news")}
          >
            <span role="img" aria-label="home">
              🏠
            </span>{" "}
            Quay lại trang chủ
          </button>
          <p className="text-yellow-600 mt-2 text-base italic flex items-center gap-2">
            <span role="img" aria-label="search">
              ✏️
            </span>{" "}
            Tiếp tục đi săn từ mới thôi
          </p>
        </div>
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-pink-100 flex items-center justify-center">
        <div className="text-indigo-700 text-xl font-semibold">
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }
  if (!isLoading && flashcard.vocabularyId == 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-pink-100 flex items-center justify-center">
        <div className="text-indigo-700 text-xl font-semibold">
          Không có flashcard nào để hiển thị.
        </div>
      </div>
    );
  }
  const handleSpeak = (text: string) => {
    const speechSynthesis = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };
  const handleClick = () => {
    setFlipped(!flipped);
    handleSpeak(currentWord);
  };
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-pink-100 flex flex-col items-center justify-center py-10">
        <div className="w-full max-w-2xl flex flex-col items-center">
          <h1
            className="text-4xl font-extrabold text-indigo-700 mb-8 tracking-wide drop-shadow-lg"
            style={{ fontFamily: "Times New Roman" }}
          >
            Flashcard
          </h1>
          {/* Phần flashcard */}
          <div
            onClick={handleClick}
            className="w-[350px] h-[450px] relative cursor-pointer perspective mb-8"
          >
            <div
              className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d]"
              style={{
                transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              {/* Mặt trước */}
              <div className="absolute w-full h-full backface-hidden bg-white rounded-3xl shadow-2xl border-2 border-indigo-100 p-6 flex flex-col items-center justify-center">
                {flashcard.imglink && (
                  <img
                    src={flashcard.imglink}
                    alt="Ảnh minh họa"
                    className="h-48 w-full object-cover rounded-2xl mb-4 shadow-lg"
                  />
                )}
                <p className="text-indigo-700 text-center text-base leading-relaxed font-medium">
                  {flashcard.exampleSentence
                    ?.split(currentWord)
                    .map((part, index, arr) => (
                      <span key={index}>
                        {part}
                        {index < arr.length - 1 && (
                          <b className="text-pink-600 font-bold">
                            {currentWord}
                          </b>
                        )}
                      </span>
                    )) || "Không có ví dụ"}
                </p>
              </div>

              {/* Mặt sau */}
              <div className="absolute w-full h-full rotate-y-180 backface-hidden bg-gradient-to-br from-indigo-50 to-pink-50 rounded-3xl shadow-2xl border-2 border-indigo-200 p-6 flex flex-col items-center justify-center">
                <h2
                  className="text-4xl font-bold text-indigo-700 mb-4"
                  style={{ fontFamily: "Times New Roman" }}
                >
                  {currentWord}
                </h2>
                <p className="italic text-indigo-600 mb-4 text-lg">
                  {flashcard.phonetic}
                </p>
                <p className="text-indigo-800 text-center text-lg leading-relaxed font-medium">
                  {flashcard.meaning}
                </p>
              </div>
            </div>
          </div>

          {/* Nút tiếp theo và đánh dấu */}
          <div className="flex gap-6">
            <button
              className="px-8 py-3 rounded-full bg-gradient-to-r from-green-200 to-green-400 text-green-900 font-semibold shadow-lg hover:from-green-300 hover:to-green-500 transition text-lg"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex((prev) => prev + 1); // tăng index để lấy từ tiếp theo
                setFlipped(false);
              }}
            >
              Tiếp tục
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
