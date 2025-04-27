'use client';

import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 px-6">
      
      {/* Logo */}

      {/* Lời chào */}
      <h1 className="text-4xl font-bold text-gray-100 mb-4 text-center flex items-center">
        Chào mừng bạn đến với
        <div className="mb-8">
        <img src="/logo1.png" alt="Logo" className="w-28 h-28 object-contain rounded-full shadow-md" />
       </div>
      </h1>

      <p className="text-gray-100 text-lg mb-8 text-center">
        Vui lòng <span className="text-yellow-400 font-bold">Đăng nhập</span> để tiếp tục trải nghiệm.
      </p>

      {/* Các nút */}
      <div className="flex flex-col items-center">
        <button
          onClick={() => router.push('/login')}
          className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-2xl shadow-lg transition-transform transform hover:scale-105"
        >
          Đăng nhập
        </button>
        <div className="text-white text-sm">hoặc</div>
        <button
          onClick={() => router.push('/register')}
          className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-8 py-3 rounded-2xl shadow-lg transition-transform transform hover:scale-105"
        >
          Đăng ký
        </button>
      </div>
    </div>
  );
}
