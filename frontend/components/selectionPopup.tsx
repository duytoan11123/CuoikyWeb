'use client';
import { useEffect, useState } from 'react';
import {showSuccess, showError, showWarning, showInfo} from './notification';

type PopupData = {
  x: number;
  y: number;
  text: string;
  translatedText: string;
};  

 const addWWord = async (userId:any, word:any)=>{
  try {
    const res = await fetch('http://localhost:4000/api/vocabulary/addWord', {
      method: 'POST',
      credentials: 'include',
      headers: {
      'Content-Type': 'application/json',
      },
      body: JSON.stringify({userId,word})
    });
    const data = await res.json();
    if (data.status == 'success'){
      showSuccess(data.message);
    }
    if (data.status == 'failed'){
      showError(data.message);
    }
  } catch (error) {
    showError('Lỗi khi thêm từ:'+ error);
  }
  
};

export default function SelectionPopup() {
  const [popup, setPopup] = useState<PopupData | null>(null);
  const [user, setUser] = useState<any>({});
  const [selectedText, setSelectedText] = useState<string>('');
  // Hàm phát âm từ
  const handleSpeak = (text: string) => {
    const speechSynthesis = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const getUser = async() => {
      try{
        const resUser = await fetch('http://localhost:4000/api/account/getUserId', {
          credentials: 'include',
        });
        const userData = await resUser.json();
        setUser(userData);
      }catch(err){
        showError("Lỗi khi lấy thông tin người dùng: " + err);
      }
    }


    const handleMouseUp = async () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();
      if (!selectedText) {
        setPopup(null);
        return;
      }
      setSelectedText(selectedText);
      try {
        let allMeanings = '';
        if (selectedText.split(/\s+/).length === 1) {
          const res = await fetch(`http://localhost:4000/api/translate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ word: selectedText }),
          });
          const translated = await res.json();
          const results = translated.results; //object gôm partOfSpeech và Meaning
          allMeanings =
            results && results.length
              ? results
                  .map((item: { partOfSpeech: string; meaning: string }) => {
                    return `<div><span class="text-blue-400 font-semibold">${item.partOfSpeech}:</span> ${item.meaning}</div>`;
                  })
                  .join('')
              : 'Không tìm thấy nghĩa.';
        } else {
          const res = await fetch(`http://localhost:4000/api/translateP`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: selectedText }),
          });
          const translated = await res.json();
          allMeanings = translated.translated || 'Không tìm thấy bản dịch.';
        }
        
        let rect = null;
        if (selection != null && selection.rangeCount > 0) {
          rect = selection.getRangeAt(0).getBoundingClientRect();
          // Lấy vị trí cuộn của cửa sổ
          const offsetX = window.scrollX;
          const offsetY = window.scrollY;

          // Kích thước popup dự kiến
          const popupWidth = 380;
          const popupHeight = 180;

          // Tính toán vị trí chính giữa đoạn text bôi đen
          let xPos = rect.left + rect.width / 2 + offsetX;
          let yPos = rect.top + offsetY - popupHeight - 8; // Hiển thị phía trên text, cách 8px

          // Nếu không đủ chỗ phía trên, hiển thị phía dưới
          if (yPos < window.scrollY) {
            yPos = rect.bottom + offsetY + 8;
          }

          // Đảm bảo popup không bị tràn ra ngoài đỉnh hoặc đáy viewport
          if (yPos < window.scrollY + 8) {
            yPos = window.scrollY + 8;
          }
          if (yPos + popupHeight > window.scrollY + window.innerHeight - 8) {
            yPos = window.scrollY + window.innerHeight - popupHeight - 8;
          }

          // Điều chỉnh xPos để popup không bị tràn ra ngoài màn hình trái/phải
          if (xPos - popupWidth / 2 < 8) {
            xPos = popupWidth / 2 + 8;
          }
          if (xPos + popupWidth / 2 > window.innerWidth - 8) {
            xPos = window.innerWidth - popupWidth / 2 - 8;
          }

          setPopup({
            x: xPos,
            y: yPos,
            text: selectedText,
            translatedText: allMeanings,
          });
        }
      } catch (err) {
        console.error('Lỗi khi gọi API:', err);
        setPopup(null);
      }
    };
    getUser();
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);
  if (!popup) return null;
  if (!user?.userId) {
    return <div>Đang tải thông tin người dùng...</div>;
  }
  return (
    <div
      className="fixed z-50 px-6 py-5 bg-gradient-to-br from-indigo-900/90 via-indigo-700/80 to-pink-800/90 text-white rounded-2xl shadow-2xl border-2 border-pink-400 backdrop-blur-md"
      style={{
        top: popup.y,
        left: popup.x,
        transform: 'translate(-50%, 0)',
        minWidth: 320,
        width: 380,
        maxWidth: '98vw',
      }}
    >
      {/* Từ được chọn */}
      <div className="text-lg font-bold mb-2 text-yellow-300 tracking-wide drop-shadow-lg">
        {popup.text}
      </div>

      {/* Nghĩa của từ */}
      <div
        className="text-base mb-4 whitespace-pre-line leading-relaxed font-medium text-indigo-100"
        dangerouslySetInnerHTML={{ __html: popup.translatedText }}
      ></div>

      <div className="flex flex-wrap gap-3 justify-between">
        {/* Nút thêm từ */}
        <button
          onClick={() => addWWord(user.userId, selectedText)}
          className=" flex items-center gap-1 bg-gradient-to-r from-pink-500 to-indigo-500 hover:from-indigo-500 hover:to-pink-500 text-white text-xs px-2.5 py-1.5 rounded-full shadow-md transition font-semibold min-w-fit"
          hidden={!popup.translatedText.includes('div')}
        >
          <span className="text-base">＋</span> Thêm từ
        </button>

        {/* Nút phát âm */}
        <button
          onClick={() => handleSpeak(popup.text)}
          className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-700 hover:to-green-500 text-white text-xs px-2.5 py-1.5 rounded-full shadow-md transition font-semibold min-w-fit"
        >
          <span className="text-base">🎤</span> Phát âm
        </button>

        {/* Nút chi tiết */}
        <button
          onClick={() => window.open(`https://vdict.com/${selectedText},1,0,0.html`, '_blank')}
          className="flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-pink-500 hover:to-yellow-500 text-white text-xs px-2.5 py-1.5 rounded-full shadow-md transition font-semibold min-w-fit"
        >
          <span className="text-base">🔎</span> Chi tiết
        </button>
      </div>
    </div>
  );
}

