'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, BrainCircuit } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    full_name: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Пароли не совпадают');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Пароль должен быть минимум 6 символов');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          full_name: formData.full_name,
          password: formData.password,
          role: 'psychologist'
        })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Регистрация успешна!');
        router.push('/dashboard');
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Ошибка регистрации');
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
            Регистрация
          </h1>
          <p className="text-center text-slate-300 mb-8">
            Создайте аккаунт психолога
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-green-400 transition-colors"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-green-400 transition-colors"
                  placeholder="username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Полное имя
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-green-400 transition-colors"
                  placeholder="Иван Иванов"
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-green-400 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Подтвердите пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-green-400 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg hover:shadow-green-500/50 transition-all flex items-center justify-center gap-2 text-white font-semibold disabled:opacity-50 mt-6"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Создать аккаунт
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Уже есть аккаунт?{' '}
              <a href="/login" className="text-green-400 hover:text-green-300 transition-colors">
                Войти
              </a>
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
