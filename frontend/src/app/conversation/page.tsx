'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../../../components/header'
import Footer from '../../../components/footer'
import Link from 'next/link'

interface Conversation {
  id: string;
  partnerName: string;
  lastMessageAt: string;
  lastMessageSnippet: string;
}

interface User {
  id: string;
  name: string;
}

const conversationList = [
  {
    id: 'advertising',
    title: 'Advertising',
    description: 'Thảo luận về quảng cáo, thương hiệu, chiến dịch marketing...',
    image: '/icons/communication.png',
    unlocked: true
  },
  {
    id: 'travel',
    title: 'Travel',
    description: 'Trò chuyện về du lịch, điểm đến, trải nghiệm mới...',
    image: '/icons/globe.svg',
    unlocked: true
  },
  {
    id: 'technology',
    title: 'Technology',
    description: 'Công nghệ, phát minh mới, xu hướng số hóa...',
    image: '/icons/study.svg',
    unlocked: true
  },
  {
    id: 'food',
    title: 'Food',
    description: 'Ẩm thực, món ăn yêu thích, văn hóa ẩm thực...',
    image: '/icons/notebook.svg',
    unlocked: true
  },
  {
    id: 'education',
    title: 'Education',
    description: 'Giáo dục, học tập, phương pháp học hiệu quả...',
    image: '/icons/user.svg',
    unlocked: true
  },
  {
    id: 'sports',
    title: 'Sports',
    description: 'Thể thao, sức khỏe, các môn thể thao phổ biến...',
    image: '/icons/news.svg',
    unlocked: false
  },
  {
    id: 'environment',
    title: 'Environment',
    description: 'Môi trường, bảo vệ thiên nhiên, biến đổi khí hậu...',
    image: '/icons/window.svg',
    unlocked: false
  },
];

export default function ConversationPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>({});
  useEffect(() => {
    async function fetchUser() {
      try {
        const resUser = await fetch('http://localhost:4000/api/me', { credentials: 'include' });
        const userData = await resUser.json();
        setUser(userData);
        if (!userData.loggedIn) {
          router.push('/');
        }
      } catch (e) {
        router.push('/');
      }
    }
    fetchUser();
  }, [router]);

  return (
    <div>
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Chủ đề gợi ý */}
        <section className="mb-12">
          <h1 className="text-3xl font-bold mb-6">Chủ đề gợi ý</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {conversationList.map((item) => (
              <div
                key={item.id}
                className={`relative p-4 border rounded-xl shadow-sm hover:shadow-md transition bg-white ${
                  !item.unlocked ? 'opacity-60 pointer-events-none' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <img src={item.image} alt={item.title} className="w-16 h-16 object-contain" />
                  <div>
                    <h2 className="font-semibold text-lg">{item.title}</h2>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
                {item.unlocked ? (
                  <Link
                    href={`/conversation/${item.id}`}
                    className="absolute inset-0"
                  />
                ) : (
                  <div className="absolute top-2 right-2 text-pink-600">🔒</div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
