"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { showSuccess, showError } from "../../../components/notification";
import Header from "../../../components/header";


interface WordDetail {
  vocabularyId: number,
  meaning: string;
  phonetic: string;
  exampleSentence: string;
  audio: string | undefined;
}

const Practice: React.FC = () => {
  const [currentWord, setCurrentWord] = useState("");
  const [wordDetails, setWordDetails] = useState<WordDetail>({
    vocabularyId: 0,
    meaning: "",
    phonetic: "",
    exampleSentence: "",
    audio: undefined,
  });
  const [inputValues, setInputValues] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [user, setUser] = useState<any>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalLearned, setTotalLearned] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  // Lấy thông tin người dùng
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
  }, [router]);

  // Lấy từ vựng theo index
  const fetchWordByIndex = async (index: number) => {
    if (!user.userId) {
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
        setWordDetails({
          vocabularyId: result.data.vocabularyId,
          meaning: result.data.meaning,
          phonetic: result.data.phonetic,
          exampleSentence: result.data.exampleSentence,
          audio: result.data.audio || undefined,
        });
        setInputValues(Array(result.data.word.length).fill(""));
        setShowAnswer(false);
        setTotalLearned(index + 1);
      } else if (result.status === "done") {
        setCurrentWord("");
        setWordDetails({
          vocabularyId: 0,
          meaning: "",
          phonetic: "",
          exampleSentence: "",
          audio: undefined,
        });
        setInputValues([]);
        setShowAnswer(false);
        setIsLoading(false);
        setShowResult(true);
        return;
      } else {
        setCurrentWord("");
        setWordDetails({
          vocabularyId: 0,
          meaning: "",
          phonetic: "",
          exampleSentence: "",
          audio: undefined,
        });
        setInputValues([]);
        setShowAnswer(false);
      }
    } catch (error) {
      console.error("Lỗi khi lấy từ vựng:", error);
      setCurrentWord("");
      setWordDetails({
        vocabularyId: 0,
        meaning: "",
        phonetic: "",
        exampleSentence: "",
        audio: undefined,
      });
      setInputValues([]);
      setShowAnswer(false);
    }
    setIsLoading(false);
  };

  // Gọi fetchWordByIndex khi userId hoặc currentIndex thay đổi
  useEffect(() => {
    if (user.userId) {
      fetchWordByIndex(currentIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.userId, currentIndex]);

  const checkAnswer = () => {
    const userAnswer = inputValues.join("").toLowerCase();
    const correct = userAnswer === currentWord.toLowerCase();
    setIsCorrect(correct);
    setShowAnswer(true);
  };

  const handleInputChange = (index: number, value: string) => {
    if (/^[a-zA-Z]?$/.test(value)) {
      const newInputValues = [...inputValues];
      newInputValues[index] = value;
      setInputValues(newInputValues);
      if (value && index < inputValues.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !inputValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleNextWord = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  const handleDeleteWord = async () => {
    const vocabularyId = wordDetails.vocabularyId;
    try {
      const res = await fetch("http://localhost:4000/api/vocabulary/delete", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ vocabularyId }),
      });
      const checkDelete = await res.json();
      if (res.ok && checkDelete.status === "success") {
        showSuccess("CONGRATS! YOU'VE LEARNED A NEW WORD 🎉");
        handleNextWord();
      } else {
        showError("Không thể xóa từ. Vui lòng thử lại.");
        console.error("Lỗi xóa từ:", checkDelete.message);
      }
    } catch (error) {
      console.error("Lỗi kết nối tới API:", error);
      showError("Lỗi hệ thống. Vui lòng thử lại sau.");
    }
  };

  if (!user.userId) {
    return <div>Đang tải thông tin người dùng...</div>;
  }
  if (showResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-yellow-100">
        <div className="bg-white rounded-3xl shadow-lg p-10 flex flex-col items-center animate-fade-in">
          <span style={{ fontSize: 60, marginBottom: 12 }}>🎉</span>
          <h2 className="text-3xl font-extrabold text-pink-600 mb-3 drop-shadow">
            Bạn đã học hết từ ở sổ tay
          </h2>
          <p className="text-lg text-blue-700 mb-4 font-semibold">
            Số câu đã học được:{" "}
            <span className="text-pink-500 font-bold">{totalLearned}</span>
          </p>
          <button
            className="bg-gradient-to-r from-pink-400 to-blue-400 text-white px-8 py-3 rounded-xl mb-3 shadow hover:scale-105 hover:from-pink-500 hover:to-blue-500 transition-all duration-200 font-bold text-lg"
            onClick={() => router.push("/news")}
          >
            <span role="img" aria-label="home">
              🏠
            </span>{" "}
            Quay lại trang chủ
          </button>
          <p className="text-yellow-600 mt-2 text-base italic flex items-center gap-2">
            <span role="img" aria-label="search">
              🔎
            </span>{" "}
            Tiếp tục đi săn từ mới thôi
          </p>
        </div>
      </div>
    );
  }
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-pink-100 flex flex-col items-center justify-start py-10">
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-indigo-100 px-8 py-8 flex flex-col items-center">
          <h2
            className="text-3xl font-extrabold text-indigo-700 mb-6 tracking-wide drop-shadow-lg"
            style={{ fontFamily: "Times New Roman" }}
          >
            Ôn tập từ vựng
          </h2>
          {isLoading ? (
            <p className="text-black text-lg">Đang tải...</p>
          ) : !currentWord ? (
            <p className="text-black text-lg">Không có từ để ôn tập</p>
          ) : (
            <>
              <div className="w-full mb-6">
                <p className="text-base font-semibold text-indigo-700 mb-2">
                  Nghĩa Tiếng Việt:
                </p>
                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 text-black min-h-[48px]">
                  {wordDetails.meaning
                    ? wordDetails.meaning.split("\n").map((line, index) => (
                        <span key={index}>
                          {line}
                          <br />
                        </span>
                      ))
                    : "Đang tải..."}
                </div>
              </div>
              <div className="flex justify-center mb-8 gap-1 md:gap-2 w-full">
                {inputValues.map((value, index) => (
                  <input
                    key={index}
                    type="text"
                    value={value}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    maxLength={1}
                    className="w-10 md:w-14 h-12 text-2xl text-center rounded-xl border-2 border-indigo-300 focus:border-pink-400 outline-none bg-indigo-50 font-bold mx-[2px] md:mx-1 transition-all duration-200 shadow-sm text-black"
                  />
                ))}
              </div>
              <div className="flex justify-center gap-4 mb-6">
                <button
                  onClick={checkAnswer}
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-indigo-200 to-pink-200 text-indigo-800 font-semibold shadow hover:from-pink-300 hover:to-indigo-300 transition"
                >
                  Kiểm tra
                </button>
                <button
                  onClick={handleNextWord}
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-yellow-200 to-orange-200 text-yellow-900 font-semibold shadow hover:from-orange-300 hover:to-yellow-300 transition"
                >
                  Từ tiếp theo
                </button>
                <button
                  onClick={handleDeleteWord}
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-green-200 to-green-400 text-green-900 font-semibold shadow hover:from-green-300 hover:to-green-500 transition"
                >
                  Đã Nhớ
                </button>
              </div>
              {showAnswer && (
                <div
                  className={`w-full max-w-md mx-auto mt-6 p-6 rounded-2xl shadow-lg border-2 ${
                    isCorrect
                      ? "bg-green-50 border-green-400"
                      : "bg-red-50 border-red-400"
                  }`}
                >
                  <p
                    className={`font-bold text-lg mb-3 ${
                      isCorrect ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isCorrect
                      ? "🎉 Chúc mừng! Đáp án đúng"
                      : "❌ Sai rồi! Hãy thử lại"}
                  </p>
                  <p className="text-base font-semibold text-indigo-700 mb-2">
                    Từ tiếng Anh:{" "}
                    <span className="font-bold">{currentWord}</span>
                  </p>
                  <p className="text-base mb-2 text-indigo-700">
                    Nghĩa:
                    <br />
                    <span className="text-black">
                      {wordDetails.meaning
                        ? wordDetails.meaning.split("\n").map((line, index) => (
                            <span key={index}>
                              {line}
                              <br />
                            </span>
                          ))
                        : "Không có thông tin"}
                    </span>
                  </p>
                  <p className="text-base mb-2 text-indigo-700">
                    Phát âm:{" "}
                    <span className="text-black">
                      {wordDetails.phonetic || "Không có thông tin"}
                    </span>
                  </p>
                  <p className="text-base text-indigo-700">
                    Ví dụ:
                    <br />
                    <span className="text-black">
                      {wordDetails.exampleSentence
                        ? wordDetails.exampleSentence
                            .split("\n")
                            .map((line, index) => (
                              <span key={index}>
                                {line}
                                <br />
                              </span>
                            ))
                        : "Không có thông tin"}
                    </span>
                  </p>
                  <button
                    onClick={() => new Audio(wordDetails.audio).play()}
                    className="ml-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-200 to-green-400 text-green-900 text-base shadow hover:from-green-300 hover:to-green-500 transition mt-4"
                  >
                    Phát âm
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Practice;
