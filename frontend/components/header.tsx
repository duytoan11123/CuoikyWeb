'use client'
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { showSuccess, showError } from './notification';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [accountName, setAccountName] = useState<string>('');

  useEffect(() => {
    async function fetchAccount() {
      try {
        const res = await fetch('http://localhost:4000/api/account/getAccountName', { credentials: 'include' });
        const data = await res.json();
        if (data.status === 'success') setAccountName(data.name);
        console.log(accountName);
      } catch {
        setAccountName('');
      }
    }
    fetchAccount();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/auth/logout', {
        credentials: 'include',
        method: 'POST',
      });
      if (res.ok) {
        showSuccess('Đăng xuất thành công!');
        router.push('/login');
      } else {
        showError('Đăng xuất thất bại!');
      }
    } catch (err) {
      showError('Lỗi khi đăng xuất!');
    }
  };

  return (
    <header className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-2xl rounded-b-3xl px-6 py-4 border-b border-indigo-900">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center space-x-3">
          <Image src="/logo1.png" alt="Logo" width={40} height={40} />
          <span className="text-2xl font-bold tracking-wide hidden sm:block text-white drop-shadow-lg" style={{ fontFamily: 'Times New Roman' }}>Demo App</span>
        </div>

        {/* Center: Navigation */}
        <nav className="hidden md:flex space-x-6">
          <NavItem href="/news" label="Tin tức" active={pathname === '/news'} />
          <NavItem href="/practice" label="Luyện tập" active={pathname === '/practice'} />
          <NavItem href="/notebook" label="Sổ tay" active={pathname === '/notebook'} />
          <NavItem href="/conversation" label="Hội thoại" active={pathname === '/conversation'} />
          <NavItem href="/account" label="Tài khoản" active={pathname === '/account'} />
        </nav>

        {/* Right: User Info */}
        <div className="flex items-center space-x-4">
          <span className="text-base text-white font-medium hidden sm:block" style={{ fontFamily: 'Times New Roman' }}>
            👋 Xin chào, <span className="font-bold text-yellow-200">{accountName}</span>
          </span>
          <button
            onClick={handleLogout}
            title="Đăng xuất"
            className="w-11 h-11 rounded-full border-2 border-pink-400 hover:border-indigo-500 overflow-hidden shadow-lg transition duration-200 bg-gradient-to-tr from-pink-100 to-indigo-100"
          >
            <Image
              src="/avatar/avatar1.jpg"
              alt="User Avatar"
              width={44}
              height={44}
              className="object-cover w-full h-full"
            />
          </button>
          <button
            onClick={handleLogout}
            className="ml-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-400 to-indigo-400 text-white font-semibold shadow hover:from-indigo-500 hover:to-pink-500 transition text-sm border-2 border-pink-200 hover:border-indigo-400"
            title="Đăng xuất"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
}

function NavItem({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <a
      href={href}
      className={`relative font-semibold px-4 py-2 rounded-xl transition-all duration-200 ${
        active
          ? 'bg-white/20 text-white shadow-md'
          : 'text-white hover:bg-white/10 hover:text-yellow-200'
      }`}
    >
      {label}
    </a>
  );
}
