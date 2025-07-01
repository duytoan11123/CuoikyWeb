'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../components/header';
import Footer from '../../../components/footer';
import { showSuccess, showError } from '../../../components/notification';
export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentName, setCurrentName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isChangingName, setIsChangingName] = useState(false);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const resUserId = await fetch('http://localhost:4000/api/account/getUserId', {
          credentials: 'include',
        });
        const userId = await resUserId.json();
        const resAccountName = await fetch('http://localhost:4000/api/account/getAccountName', {
          credentials: 'include',
        });
        const accountName = await resAccountName.json();
        if (userId.status === 'success' && accountName.status === 'success') {
          setUser({
            userId: userId.userId,
            name: accountName.name,
            email: accountName.email,
          });
          setNewName(accountName.name || '');
        } else {
          router.push('/');
        }
      } catch (error) {
        console.log('Lỗi khi lấy thông tin người dùng:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    }
    fetchUserData();
  }, [router]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showError('Mật khẩu xác nhận không khớp!');
      return;
    }
    if (newPassword.length < 6) {
      showError('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch('http://localhost:4000/api/account/changePassword', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        showSuccess('Đổi mật khẩu thành công!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showError(data.message || 'Đổi mật khẩu thất bại!');
      }
    } catch (error) {
      showError('Lỗi kết nối!');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleChangeName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      showError('Tên không được để trống!');
      return;
    }

    setIsChangingName(true);
    try {
      const res = await fetch('http://localhost:4000/api/account/updateAccountName', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newName.trim(),
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        showSuccess('Đổi tên thành công!');
        setUser((prev: typeof user) => ({
          ...prev,
          name: newName.trim()
        }));
      } else {
        showError(data.message || 'Đổi tên thất bại!');
      }
    } catch (error) {
      showError('Lỗi kết nối!');
    } finally {
      setIsChangingName(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-pink-100 flex items-center justify-center">
        <div className="text-indigo-700 text-xl font-semibold">Đang tải...</div>
      </div>
    );
  }

  if (!user?.userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-pink-100 flex items-center justify-center">
        <div className="text-indigo-700 text-xl font-semibold">Vui lòng đăng nhập!</div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-pink-100 py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-extrabold text-center text-indigo-700 mb-8 tracking-wide drop-shadow-lg" style={{ fontFamily: 'Times New Roman' }}>
            Tài Khoản Cá Nhân
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Thông tin cá nhân */}
            <div className="bg-white rounded-3xl shadow-2xl border border-indigo-100 p-8">
              <h2 className="text-2xl font-bold text-indigo-700 mb-6" style={{ fontFamily: 'Times New Roman' }}>
                Thông Tin Cá Nhân
              </h2>
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-indigo-50 rounded-xl">
                  <span className="text-indigo-600 font-semibold w-24">Email:</span>
                  <span className="text-indigo-800 ml-4">{user.email}</span>
                </div>
                <div className="flex items-center p-4 bg-indigo-50 rounded-xl">
                  <span className="text-indigo-600 font-semibold w-24">Tên:</span>
                  <span className="text-indigo-800 ml-4">{user.name}</span>
                </div>
                <div className="flex items-center p-4 bg-indigo-50 rounded-xl">
                  <span className="text-indigo-600 font-semibold w-24">ID:</span>
                  <span className="text-indigo-800 ml-4">{user.userId}</span>
                </div>
              </div>
            </div>

            {/* Đổi tên */}
            <div className="bg-white rounded-3xl shadow-2xl border border-indigo-100 p-8">
              <h2 className="text-2xl font-bold text-indigo-700 mb-6" style={{ fontFamily: 'Times New Roman' }}>
                Đổi Tên
              </h2>
              <form onSubmit={handleChangeName} className="space-y-4">
                <div>
                  <label className="block text-indigo-700 font-semibold mb-2">Tên hiện tại:</label>
                  <input
                    type="text"
                    value={user.name || ''}
                    disabled
                    className="w-full p-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600"
                    placeholder={currentName ?? ''}
                  />
                </div>
                <div>
                  <label className="block text-indigo-700 font-semibold mb-2">Tên mới:</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nhập tên mới..."
                    className="w-full p-3 border-2 border-indigo-300 rounded-xl focus:border-pink-400 outline-none transition"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isChangingName}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-200 to-pink-200 text-indigo-800 font-semibold shadow hover:from-pink-300 hover:to-indigo-300 transition disabled:opacity-50"
                >
                  {isChangingName ? 'Đang cập nhật...' : 'Cập Nhật Tên'}
                </button>
              </form>
            </div>

            {/* Đổi mật khẩu */}
            <div className="bg-white rounded-3xl shadow-2xl border border-indigo-100 p-8 lg:col-span-2">
              <h2 className="text-2xl font-bold text-indigo-700 mb-6" style={{ fontFamily: 'Times New Roman' }}>
                Đổi Mật Khẩu
              </h2>
              <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-indigo-700 font-semibold mb-2">Mật khẩu hiện tại:</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại..."
                    className="w-full p-3 border-2 border-indigo-300 rounded-xl focus:border-pink-400 outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-indigo-700 font-semibold mb-2">Mật khẩu mới:</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới..."
                    className="w-full p-3 border-2 border-indigo-300 rounded-xl focus:border-pink-400 outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-indigo-700 font-semibold mb-2">Xác nhận mật khẩu:</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới..."
                    className="w-full p-3 border-2 border-indigo-300 rounded-xl focus:border-pink-400 outline-none transition"
                    required
                  />
                </div>
                <div className="md:col-span-3">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-green-200 to-green-400 text-green-900 font-semibold shadow hover:from-green-300 hover:to-green-500 transition disabled:opacity-50"
                  >
                    {isChangingPassword ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
