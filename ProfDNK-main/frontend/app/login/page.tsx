'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, BrainCircuit } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success(`Добро пожаловать, ${data.user.full_name}!`);
        router.push('/dashboard');
      } else {
        toast.error('Неверные учетные данные');
      }
    } catch (error) {
      toast.error('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center rotate-12">
              <BrainCircuit className="w-8 h-8 -rotate-12 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center mb-2 text-white">
            Вход в систему
          </h1>
          <p className="text-center text-slate-300 mb-8">
            ПрофДНК Platform
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Username
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-green-400 transition-colors"
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-green-400 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg hover:shadow-green-500/50 transition-all flex items-center justify-center gap-2 text-white font-semibold disabled:opacity-50"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Войти
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Нет аккаунта?{' '}
              <a href="/register" className="text-green-400 hover:text-green-300 transition-colors">
                Зарегистрироваться
              </a>
            </p>
          </div>

          <div className="mt-8 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
            <p className="text-sm text-green-400 font-medium mb-2">Демо доступ:</p>
            <p className="text-xs text-slate-300">
              Username: <code className="bg-white/10 px-2 py-1 rounded">admin</code>
              <br />
              Password: <code className="bg-white/10 px-2 py-1 rounded">admin123</code>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <a href="/" className="text-slate-400 hover:text-white transition-colors text-sm">
            ← Вернуться на главную
          </a>
        </div>
      </motion.div>
    </div>
  );
}
