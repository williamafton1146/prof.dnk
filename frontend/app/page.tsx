'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/auth/login', { email, password });
      login(res.data.access_token);
      router.push('/dashboard');
    } catch (err) {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6">Вход в ПрофДНК</h1>
        <input
        type="email"
        placeholder="Email"
        className="w-full p-2 border rounded mb-4"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        />
        <input
        type="password"
        placeholder="Пароль"
        className="w-full p-2 border rounded mb-4"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
        Войти
        </button>
    </form>
    </div>
  );
}