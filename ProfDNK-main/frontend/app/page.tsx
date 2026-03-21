'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, Users, FileText, BarChart3, 
  Sparkles, Rocket, Shield, Zap 
} from 'lucide-react';

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: <BrainCircuit className="w-8 h-8" />,
      title: "AI-анализ ответов",
      description: "Искусственный интеллект выявляет скрытые паттерны и эмоциональный тон",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Real-time прогресс",
      description: "WebSocket отслеживание прохождения теста в реальном времени",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Умные отчеты",
      description: "Автоматическая генерация DOCX и HTML отчетов с инсайтами",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Глубокая аналитика",
      description: "Визуализация данных и статистика по всем клиентам",
      color: "from-blue-500 to-cyan-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 opacity-30">
        <motion.div
          className="absolute w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"
          animate={{
            x: mousePosition.x - 200,
            y: mousePosition.y - 200,
          }}
          transition={{ type: "spring", damping: 30 }}
        />
        <motion.div
          className="absolute right-0 bottom-0 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl"
          animate={{
            x: -(mousePosition.x / 10),
            y: -(mousePosition.y / 10),
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-6 py-8">
          <nav className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center rotate-12">
                <BrainCircuit className="w-7 h-7 -rotate-12" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                ПрофДНК
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-4"
            >
              <a href="/login">
                <button className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all">
                  Войти
                </button>
              </a>
              <a href="/register">
                <button className="px-6 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg hover:shadow-green-500/50 transition-all">
                  Регистрация
                </button>
              </a>
            </motion.div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 mb-6">
              <Sparkles className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">Powered by AI</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-7xl font-bold mb-6 bg-gradient-to-r from-white via-green-200 to-emerald-400 bg-clip-text text-transparent"
          >
            Платформа нового поколения
            <br />
            для профориентологов
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-slate-300 max-w-2xl mx-auto mb-12"
          >
            Создавайте валидные методики, анализируйте с помощью AI,
            получайте глубокие инсайты в режиме реального времени
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex gap-4 justify-center"
          >
            <a href="/demo">
              <button className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-2xl hover:shadow-green-500/50 transition-all flex items-center gap-2">
                <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Попробовать демо
              </button>
            </a>
            <a href="/about">
              <button className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all">
                Узнать больше
              </button>
            </a>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-6 py-20">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-16"
          >
            Что делает нас <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">уникальными</span>
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all"
              >
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { number: "50K+", label: "Тестов проведено" },
              { number: "99.9%", label: "Точность AI-анализа" },
              { number: "<2s", label: "Генерация отчетов" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-12 rounded-3xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 text-center"
          >
            <Shield className="w-16 h-16 mx-auto mb-6 text-green-400" />
            <h2 className="text-4xl font-bold mb-4">
              Готовы начать?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Присоединяйтесь к сообществу профориентологов, использующих передовые технологии
            </p>
            <a href="/register">
              <button className="px-10 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-2xl hover:shadow-green-500/50 transition-all text-lg font-semibold">
                Создать аккаунт бесплатно
              </button>
            </a>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-12 border-t border-white/10">
          <div className="text-center text-slate-400">
            <p>© 2026 ПрофДНК Platform. Создано для хакатона ДГТУ TitanIT.</p>
            <p className="mt-2">Все права защищены.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
