"use client";
import { useEffect, useState } from "react";
import Header from "../../../components/header";
import Footer from "../../../components/footer";
import { useRouter } from "next/navigation";

interface Flashcard {
  vocabularyId: number,
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
        vocabularyId:0,
        meaning: "",
        phonetic: "",
        exampleSentence: "",
        audio: undefined,
        imglink: ""
    });
    //lấy thông tin người dùng
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
      }, []);
    
    useEffect(()=>{
        if(user?.user?.userInfo?.userId){
            fetchRandomFlashcard();
        }
    },[user?.user?.userInfo?.userId])

    const fetchRandomFlashcard = async () => {
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
            setFlashCard({
            vocabularyId: result.data.vocabularyId,
            meaning: result.data.meaning,
            phonetic: result.data.phonetic,
            exampleSentence: result.data.exampleSentence,
            audio: result.data.audio || undefined,
            imglink: result.data.imglink
            });
        } else {
            setCurrentWord("");
            setFlashCard({
            vocabularyId: 0,
            meaning: "",
            phonetic: "",
            exampleSentence: "",
            audio: undefined,
            imglink:""
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
            imglink: ""
        });
    }
    setIsLoading(false);
  };

    if (isLoading) {
        return <div className="text-white p-10">Đang tải dữ liệu...</div>;
    }
    if (!isLoading && flashcard.vocabularyId == 0) {
        return (
            <div className="text-white p-10">Không có flashcard nào để hiển thị.</div>
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
        <Header/>
        <div
        onClick={handleClick}
        className="w-[300px] h-[400px] cursor-pointer perspective"
        >
        <div className="w-[300px] h-[400px] cursor-pointer [perspective:1000px]">
            <div
            className={`relative w-full h-full duration-700 [transform-style:preserve-3d] ${
                flipped ? "rotate-y-180" : ""
            }`}
            >
            {/* Front */}
            <div className="absolute w-full h-full [backface-visibility:hidden] [-webkit-backface-visibility:hidden] bg-white rounded-xl shadow-lg flex flex-col items-center justify-center p-4">
                {flashcard.imglink && (
                <img
                    src={flashcard.imglink}
                    alt="Hình minh họa"
                    className="h-40 object-cover mb-4 rounded"
                />
                )}
                <p className="text-center text-gray-800 text-lg font-medium">
                {
                flashcard.meaning ? flashcard.meaning.split('\n').map((line, index) => (
                  <span key={index}>
                    {line}
                    <br />
                  </span>
                ))
              : "Không có thông tin"}
                </p>
            </div>

            {/* Back */}
            <div className="absolute w-full h-full [backface-visibility:hidden] [-webkit-backface-visibility:hidden] rotate-y-180 bg-yellow-100 rounded-xl shadow-lg flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-bold mb-2 text-yellow-900">{currentWord}</h2>
                <p className="text-md italic mb-1 text-yellow-800">{flashcard.phonetic}</p>
                <p className="text-md mb-2 text-yellow-900">{
                flashcard.exampleSentence ? flashcard.exampleSentence.split('\n').map((line, index) => (
                  <span key={index}>
                    {line}
                    <br />
                  </span>
                ))
              : "Không có thông tin"}</p>
            </div>
            </div>
        </div>
        </div>
        <Footer/>
        </>
    );
}