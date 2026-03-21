'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import { 
  ChevronRight, ChevronLeft, Check, Sparkles, 
  Brain, Zap, TrendingUp 
} from 'lucide-react';
import Confetti from 'react-confetti';
import { toast } from 'react-hot-toast';

interface Question {
  id: string;
  type: string;
  question: string;
  options?: string[];
  scale_min?: number;
  scale_max?: number;
  scale_labels?: { [key: number]: string };
  required: boolean;
}

export default function TakeSurvey() {
  const params = useParams();
  const surveyId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [survey, setSurvey] = useState<any>(null);
  const [sessionToken, setSessionToken] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [progress, setProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [completed, setCompleted] = useState(false);
  
  // Client info step
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAge, setClientAge] = useState('');

  useEffect(() => {
    loadSurvey();
  }, [surveyId]);

  const loadSurvey = async () => {
    try {
      const response = await fetch(`http://localhost:8000/surveys/${surveyId}`);
      const data = await response.json();
      setSurvey(data);
      setLoading(false);
    } catch (error) {
      toast.error('Не удалось загрузить опросник');
    }
  };

  const startSession = async () => {
    if (!clientName) {
      toast.error('Введите ваше имя');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/test/${surveyId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: clientName,
          client_email: clientEmail || null,
          client_age: clientAge ? parseInt(clientAge) : null
        })
      });
      
      const data = await response.json();
      setSessionToken(data.session_token);
      setCurrentStep(1);
      
      // Connect WebSocket for real-time progress
      connectWebSocket(data.session_token);
    } catch (error) {
      toast.error('Ошибка запуска теста');
    }
  };

  const connectWebSocket = (token: string) => {
    const ws = new WebSocket(`ws://localhost:8000/ws/${token}`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'progress') {
        setProgress(data.progress);
      }
    };
  };

  const submitAnswer = async (questionId: string, answer: any) => {
    setAnswers({ ...answers, [questionId]: answer });
    
    try {
      await fetch(`http://localhost:8000/test/${sessionToken}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: questionId,
          answer: answer
        })
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const completeTest = async () => {
    try {
      const response = await fetch(`http://localhost:8000/test/${sessionToken}/complete`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setCompleted(true);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    } catch (error) {
      toast.error('Ошибка завершения теста');
    }
  };

  const nextQuestion = () => {
    const currentQuestion = survey.structure.blocks[currentStep - 1];
    if (currentQuestion && !answers[currentQuestion.id] && currentQuestion.required) {
      toast.error('Пожалуйста, ответьте на вопрос');
      return;
    }

    if (currentStep === survey.structure.blocks.length) {
      completeTest();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevQuestion = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Опросник не найден</h1>
          <p className="text-slate-300">Проверьте правильность ссылки</p>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center text-white overflow-hidden">
        {showConfetti && <Confetti />}
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-2xl mx-auto p-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center"
          >
            <Check className="w-16 h-16" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
          >
            Тест завершен!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-slate-300 mb-8"
          >
            Спасибо за участие! Ваши ответы обрабатываются с помощью AI.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-3 gap-6 mb-8"
          >
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <Brain className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <div className="text-sm text-slate-400">AI-анализ</div>
              <div className="text-2xl font-bold text-green-400">99.9%</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <div className="text-sm text-slate-400">Ответов</div>
              <div className="text-2xl font-bold text-green-400">{Object.keys(answers).length}</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <div className="text-sm text-slate-400">Инсайтов</div>
              <div className="text-2xl font-bold text-green-400">12+</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <a href={`http://localhost:8000/reports/${sessionToken}/client`}>
              <button className="px-8 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-2xl hover:shadow-green-500/50 transition-all text-lg font-semibold">
                Скачать отчет
              </button>
            </a>
            <p className="mt-4 text-sm text-slate-400">
              Также отчет отправлен на email {clientEmail}
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Welcome screen
  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center text-white p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full"
        >
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-8 h-8 text-green-400" />
              <h1 className="text-4xl font-bold">{survey.title}</h1>
            </div>
            
            <p className="text-xl text-slate-300 mb-8">{survey.description}</p>

            <div className="space-y-4 mb-8">
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ваше имя *"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 focus:outline-none focus:border-green-400 transition-colors"
              />
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="Email (необязательно)"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 focus:outline-none focus:border-green-400 transition-colors"
              />
              <input
                type="number"
                value={clientAge}
                onChange={(e) => setClientAge(e.target.value)}
                placeholder="Возраст (необязательно)"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 focus:outline-none focus:border-green-400 transition-colors"
              />
            </div>

            <button
              onClick={startSession}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-2xl hover:shadow-green-500/50 transition-all flex items-center justify-center gap-2 text-lg font-semibold"
            >
              Начать тестирование
              <ChevronRight className="w-6 h-6" />
            </button>

            <p className="text-center text-sm text-slate-400 mt-6">
              Вопросов: {survey.structure.blocks.length} • Время: ~{Math.ceil(survey.structure.blocks.length * 1.5)} мин
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Question screen
  const currentQuestion: Question = survey.structure.blocks[currentStep - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-2 bg-white/10">
        <motion.div
          className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / survey.structure.blocks.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="max-w-3xl mx-auto pt-8">
        <div className="text-center mb-4">
          <span className="text-slate-400">
            Вопрос {currentStep} из {survey.structure.blocks.length}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12"
          >
            <h2 className="text-3xl font-bold mb-8">{currentQuestion.question}</h2>

            {/* Text input */}
            {currentQuestion.type === 'text' && (
              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => submitAnswer(currentQuestion.id, e.target.value)}
                placeholder="Введите ваш ответ..."
                rows={6}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 focus:outline-none focus:border-green-400 transition-colors resize-none"
              />
            )}

            {/* Choice */}
            {currentQuestion.type === 'choice' && (
              <div className="space-y-3">
                {currentQuestion.options?.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => submitAnswer(currentQuestion.id, option)}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      answers[currentQuestion.id] === option
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {/* Scale */}
            {currentQuestion.type === 'scale' && (
              <div>
                <div className="flex justify-between mb-4">
                  {Array.from(
                    { length: (currentQuestion.scale_max || 10) - (currentQuestion.scale_min || 1) + 1 },
                    (_, i) => i + (currentQuestion.scale_min || 1)
                  ).map((value) => (
                    <button
                      key={value}
                      onClick={() => submitAnswer(currentQuestion.id, value)}
                      className={`w-12 h-12 rounded-full transition-all ${
                        answers[currentQuestion.id] === value
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600 scale-110 shadow-lg'
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>{currentQuestion.scale_labels?.[currentQuestion.scale_min || 1]}</span>
                  <span>{currentQuestion.scale_labels?.[currentQuestion.scale_max || 10]}</span>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={prevQuestion}
            disabled={currentStep === 1}
            className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Назад
          </button>
          <button
            onClick={nextQuestion}
            className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-2xl hover:shadow-green-500/50 transition-all flex items-center justify-center gap-2 text-lg font-semibold"
          >
            {currentStep === survey.structure.blocks.length ? 'Завершить' : 'Далее'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
