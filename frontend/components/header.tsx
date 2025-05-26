<nav className=" flex justify-between w-[70%] items-center"></nav>
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [accountName, setAccountName] = useState<string>('');

  useEffect(() => {
    async function fetchAccount() {
      try {
        const res = await fetch('http://localhost:4000/api/account', { credentials: 'include' });
        const data = await res.json();
        if (data.status === 'success') setAccountName(data.name || data.email || '');
      } catch (e) { setAccountName(''); }
    }
    fetchAccount();
  }, []);

  return (
    <header className="bg-zinc-900 bg-slate-800/90 backdrop-blur px-6 py-2 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <Image src="/logo1.png" alt="Mochi Logo" width={90} height={20} />

      </div>

      {/* Navigation */}
      <nav className=" flex justify-between w-[70%]">
        <NavItem src="/news" icon="/icons/news.svg" label="Tin tức" isActive={pathname === '/news'} />
        <NavItem src="/#" icon="/icons/study.svg" label="Luyện Tập" isActive={pathname === '/study'} />
        <NavItem src="/notebook" icon="/icons/notebook.svg" label="Sổ tay" isActive={pathname === '/notebook'}  />
        <NavItem src="/#" icon="/icons/user.svg" label="Tài khoản" isActive={pathname === '/account'}  />
      </nav>

      {/* User Avatar */}
              <span className="text-yellow-400 font-extrabold text-xl">Xin Chào {accountName}</span>
      <div className="w-10 h-10 rounded-full border-2 border-green-500 overflow-hidden"  onClick={() => {fetch('http://localhost:4000/api/auth/logout',{
        credentials:'include',
        method: 'POST'
      })
      router.refresh();
    }
      }>
        <Image src="/avatar/avatar1.jpg" alt="User Avatar" width={40} height={40} />
      </div>
    </header>
  );
}

// Component cho mỗi item trong nav
function NavItem({ icon, label, isActive, src }: { icon: string; label: string; isActive?: boolean; src: string }) {
  return (
    <a 
      href={src} 
      className={`w-[20%] flex flex-col items-center text-sm p-2 rounded-lg transition-all duration-300 ${
        isActive 
          ? 'text-white font-bold bg-indigo-800 border-indigo-500' 
          : 'text-2xl font-semibold text-white hover:bg-indigo-700'
      }`}
    >
      <Image src={icon} alt={label} width={24} height={24} />
      <span>{label}</span>
    </a>
  );
}
