'use client';
import { useRouter } from 'next/navigation';
import LoginForm from '../../../components/LoginForm';
import Footer from '../../../components/footer';
import { showSuccess, showError } from '../../../components/notification';
import { useEffect } from 'react';
const LoginPage = () => {
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {
    try {
        const res = await fetch('http://localhost:4000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include'
        });
        const data = await res.json();
        if (data.status == 'success'){
          showSuccess(data.message);
          router.push('/news');
        }else{
          showError(data.message);
        }
      } catch (error) {
        console.error('Login error:', error);
        showError('Có lỗi xảy ra khi đăng nhập');
      }
  };
  const handleGoogleLogin = async () => {
    try {
      // Redirect to Google OAuth
      window.location.href = 'http://localhost:4000/api/auth/google';
    } catch (error) {
      console.error('Google login error:', error);
      showError('Có lỗi xảy ra khi đăng nhập bằng Google');
    }
  };

  return (
    <div>  
      
      <LoginForm onSubmit={handleLogin} onClick={handleGoogleLogin} />
      <Footer/>
    </div>
  );
};

export default LoginPage;