'use client';

import { useState } from 'react';
import LoginForm from '../../../components/LoginForm';

const LoginPage = () => {
  const [msg, setMsg] = useState('');

  const handleLogin = async (email: string, password: string) => {
    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setMsg(data.message);
    } catch (error) {
      console.error('Login error:', error);
      setMsg('Có lỗi xảy ra khi đăng nhập');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Redirect to Google OAuth
      window.location.href = 'http://localhost:4000/api/auth/google';
    } catch (error) {
      console.error('Google login error:', error);
      setMsg('Có lỗi xảy ra khi đăng nhập bằng Google');
    }
  };

  return (
    <div>
      <LoginForm onSubmit={handleLogin} onClick={handleGoogleLogin} />
      <p>{msg}</p>
    </div>
  );
};

export default LoginPage;