"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import "./Practice.css";
import { showSuccess, showError } from "./notification";

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
    vocabularyId:0,
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
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  // Lấy thông tin người dùng
  useEffect(() => {
    async function fetchData() {
      try {
        const resUser = await fetch("http://localhost:4000/api/me", {
          credentials: "include",
        });
        const userData = await resUser.json();
        setUser(userData);
        if (!userData.loggedIn) {
          router.push("/");
        }
      } catch (error) {
        console.log("Lỗi khi lấy thông tin người dùng:", error);
        router.push("/");
      }
    }
    fetchData();
  }, [router]);

  // Lấy từ vựng ngẫu nhiên
  const fetchRandomWord = async () => {
    if (!user?.user?.userInfo?.userId) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:4000/vocabulary/getRandomWord/${user.user.userInfo.userId}`
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

  // Gọi fetchRandomWord khi userId có sẵn
  useEffect(() => {
    if (user?.user?.userInfo?.userId) {
      fetchRandomWord();
    }
  }, [user]);

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
    fetchRandomWord();
  };

  const handleDeleteWord = async () => {
  const vocabularyId = wordDetails.vocabularyId;
  try {
    const res = await fetch('http://localhost:4000/vocabulary/delete', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ vocabularyId }),
    });
    const checkDelete = await res.json();
    if (res.ok && checkDelete.status === 'success') {
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
  if (!user?.user?.userInfo?.userId) {
    return <div>Đang tải thông tin người dùng...</div>;
  }

  return (
    <div className="container">
      <h2 style={{ fontWeight: "bold", color: "blue" }}>Ôn tập từ vựng</h2>
      {isLoading ? (
        <p>Đang tải...</p>
      ) : !currentWord ? (
        <p>Không có từ để ôn tập</p>
      ) : (
        <>
          <p className="meaning">
            Nghĩa Tiếng Việt: <br />
            {wordDetails.meaning
              ? wordDetails.meaning.split('\n').map((line, index) => (
                  <span key={index}>
                    {line}
                    <br />
                  </span>
                ))
              : "Đang tải..."}
          </p>
          <div className="word-inputs">
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
              />
            ))}
          </div>
          <div className="button-group">
            <button onClick={checkAnswer}>Kiểm tra</button>
            <button onClick={handleNextWord}>Từ tiếp theo</button>
            <button onClick={handleDeleteWord}>Đã Nhớ</button>
          </div>
          {showAnswer && (
            <div className={`details ${isCorrect ? "correct" : "incorrect"}`}>
              <p className="result">
                {isCorrect ? "Chúc mừng! Đáp án đúng" : "Sai rồi! Hãy thử lại"}
              </p>
              <p className="word-detail">Từ tiếng Anh: {currentWord}</p>
              <p className="word-detail">Nghĩa: 
              {wordDetails.meaning
              ? wordDetails.meaning.split('\n').map((line, index) => (
                  <span key={index}>
                    {line}
                    <br />
                  </span>
                ))
              : "Không có thông tin"}</p>
              <p className="word-detail">
                Phát âm: {wordDetails.phonetic || "Không có thông tin"}
              </p>
              <p className="word-detail">
                Ví dụ: 
              {wordDetails.exampleSentence
              ? wordDetails.exampleSentence.split('\n').map((line, index) => (
                  <span key={index}>
                    {line}
                    <br />
                  </span>
                ))
              : "Không có thông tin"}
              </p>
              {wordDetails.audio && (
                <button
                  onClick={() => new Audio(wordDetails.audio).play()}
                  className="audio-button"
                >
                  Phát âm
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Practice;
