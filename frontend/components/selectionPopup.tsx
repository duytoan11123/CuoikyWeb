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
    const res = await fetch('http://localhost:4000/vocabulary/addWord', {
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
        const resUser = await fetch('http://localhost:4000/api/me',{
                    credentials: 'include',
                });
        const userData = await resUser.json();
        setUser(userData);
        console.log(userData.user.userInfo.userId);
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
        const res = await fetch(`http://localhost:4000/api/translate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ word: selectedText }),
        });

        const translated = await res.json();
        const results = translated.results;
        const allMeanings =
          results.length
            ? results
                .map((item: { partOfSpeech: string; meaning: string }) => {
                  return `<div><span class="text-blue-400 font-semibold">${item.partOfSpeech}:</span> ${item.meaning}</div>`;
                })
                .join('')
            : 'Không tìm thấy nghĩa.';
        
        let rect = null;
        if (selection != null) {
          // Tính toán vị trí của vùng chọn
          rect = selection.getRangeAt(0).getBoundingClientRect();
          
          // Lấy vị trí cuộn của cửa sổ
          const offsetX = window.scrollX;
          const offsetY = window.scrollY;

          // Điều chỉnh popup sao cho nó luôn hiển thị trong phạm vi cửa sổ trình duyệt
          let xPos = rect.left + offsetX;
          let yPos = rect.top + offsetY - 40; // Giảm 40px để không bị che khuất văn bản

          // Kiểm tra các trường hợp popup bị lệch:
          const popupWidth = 300;
          const popupHeight = 150;

          // Điều chỉnh xPos nếu popup ra ngoài bên phải cửa sổ
          if (xPos + popupWidth > window.innerWidth) {
            xPos = window.innerWidth - popupWidth - 10; // Thêm khoảng cách để không chạm mép
          }

          // Điều chỉnh yPos nếu popup ra ngoài dưới đáy cửa sổ
          if (yPos + popupHeight > window.innerHeight) {
            yPos = window.innerHeight - popupHeight - 500; // Thêm khoảng cách để không chạm mép
          }

          // Cập nhật vị trí popup
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
  if (!user?.user?.userInfo?.userId) {
    return <div>Đang tải thông tin người dùng...</div>;}
  return (
    <div
      className="fixed z-50 px-4 py-3 bg-black text-white rounded-lg shadow-lg max-w-sm border border-gray-700"
      style={{
        top: popup.y,
        left: popup.x,
        transform: 'translate(-50%, 0)', // Căn giữa popup theo vị trí x
      }}
    >
      {/* Từ được chọn */}
      <div className="text-base font-semibold mb-2 text-yellow-400">
        {popup.text}
      </div>

      {/* Nghĩa của từ */}
      <div
        className="text-sm mb-3 whitespace-pre-line leading-relaxed"
        dangerouslySetInnerHTML={{ __html: popup.translatedText }}
      ></div>

      {/* Nút thêm từ */}
      <button
        onClick={() => addWWord(user.user.userInfo.userId,selectedText)}
        className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded transition pointer"
      >
        + Thêm từ
      </button>

      {/* Nút phát âm */}
      <button
        onClick={() => handleSpeak(popup.text)}
        className="cursor-pointer bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded transition mt-2"
      >
        🎤 Phát âm
      </button>
      <button
         onClick={() => window.open(`https://vdict.com/${selectedText},1,0,0.html`, '_blank')}
        className="cursor-pointer bg-red-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded transition mt-2"
      >
        Chi tiết
      </button>
    </div>
  );
}

