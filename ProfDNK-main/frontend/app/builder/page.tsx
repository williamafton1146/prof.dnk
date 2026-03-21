'use client';

import { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { 
  Plus, Trash2, GripVertical, Type, ListChecks, 
  Sliders, Table, Save, Eye, Sparkles 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

type QuestionType = 'text' | 'choice' | 'scale' | 'matrix';

interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: { [key: number]: string };
  required: boolean;
}

export default function SurveyBuilder() {
  const [surveyTitle, setSurveyTitle] = useState('');
  const [surveyDescription, setSurveyDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedType, setSelectedType] = useState<QuestionType>('text');

  const questionTypes = [
    { value: 'text' as QuestionType, label: 'Текстовый ответ', icon: <Type className="w-5 h-5" /> },
    { value: 'choice' as QuestionType, label: 'Выбор варианта', icon: <ListChecks className="w-5 h-5" /> },
    { value: 'scale' as QuestionType, label: 'Шкала оценки', icon: <Sliders className="w-5 h-5" /> },
    { value: 'matrix' as QuestionType, label: 'Матрица', icon: <Table className="w-5 h-5" /> },
  ];

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      type: selectedType,
      question: '',
      required: true,
      ...(selectedType === 'choice' && { options: ['Вариант 1', 'Вариант 2'] }),
      ...(selectedType === 'scale' && { 
        scaleMin: 1, 
        scaleMax: 10,
        scaleLabels: { 1: 'Совсем не согласен', 10: 'Полностью согласен' }
      }),
    };
    setQuestions([...questions, newQuestion]);
    toast.success('Вопрос добавлен');
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
    toast.success('Вопрос удален');
  };

  const saveSurvey = async () => {
    if (!surveyTitle || questions.length === 0) {
      toast.error('Заполните название и добавьте хотя бы один вопрос');
      return;
    }

    const surveyData = {
      title: surveyTitle,
      description: surveyDescription,
      blocks: questions.map(q => ({
        id: q.id,
        type: q.type,
        question: q.question,
        options: q.options,
        scale_min: q.scaleMin,
        scale_max: q.scaleMax,
        scale_labels: q.scaleLabels,
        required: q.required
      }))
    };

    try {
      const response = await fetch('http://localhost:8000/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(surveyData)
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success('Опросник сохранен!');
        navigator.clipboard.writeText(data.share_link);
        toast.success('Ссылка скопирована в буфер обмена');
      }
    } catch (error) {
      toast.error('Ошибка сохранения');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-2 flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            Конструктор опросников
          </motion.h1>
          <p className="text-slate-300">Создайте валидную диагностическую методику за минуты</p>
        </div>

        {/* Survey Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 mb-8"
        >
          <input
            type="text"
            value={surveyTitle}
            onChange={(e) => setSurveyTitle(e.target.value)}
            placeholder="Название опросника"
            className="w-full bg-transparent border-b border-white/20 text-2xl font-bold pb-2 mb-4 focus:outline-none focus:border-green-400 transition-colors"
          />
          <textarea
            value={surveyDescription}
            onChange={(e) => setSurveyDescription(e.target.value)}
            placeholder="Описание опросника"
            rows={3}
            className="w-full bg-transparent border border-white/20 rounded-xl p-4 focus:outline-none focus:border-green-400 transition-colors resize-none"
          />
        </motion.div>

        {/* Question Type Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 mb-8"
        >
          <h3 className="text-lg font-semibold mb-4">Добавить вопрос</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {questionTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
                  selectedType === type.value
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {type.icon}
                <span className="text-sm">{type.label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={addQuestion}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg hover:shadow-green-500/50 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Добавить вопрос
          </button>
        </motion.div>

        {/* Questions List */}
        <Reorder.Group axis="y" values={questions} onReorder={setQuestions}>
          {questions.map((question, index) => (
            <Reorder.Item key={question.id} value={question}>
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 mb-4"
              >
                <div className="flex items-start gap-4">
                  <div className="cursor-grab active:cursor-grabbing mt-2">
                    <GripVertical className="w-6 h-6 text-slate-400" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">
                        {questionTypes.find(t => t.value === question.type)?.label}
                      </span>
                      <span className="text-slate-400">Вопрос {index + 1}</span>
                    </div>

                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                      placeholder="Введите вопрос"
                      className="w-full bg-transparent border-b border-white/20 text-lg pb-2 mb-4 focus:outline-none focus:border-green-400 transition-colors"
                    />

                    {/* Question-specific options */}
                    {question.type === 'choice' && (
                      <div className="space-y-2">
                        {question.options?.map((option, optIndex) => (
                          <div key={optIndex} className="flex gap-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...(question.options || [])];
                                newOptions[optIndex] = e.target.value;
                                updateQuestion(question.id, { options: newOptions });
                              }}
                              className="flex-1 bg-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <button
                              onClick={() => {
                                const newOptions = question.options?.filter((_, i) => i !== optIndex);
                                updateQuestion(question.id, { options: newOptions });
                              }}
                              className="px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const newOptions = [...(question.options || []), `Вариант ${(question.options?.length || 0) + 1}`];
                            updateQuestion(question.id, { options: newOptions });
                          }}
                          className="text-sm text-green-400 hover:text-green-300 flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Добавить вариант
                        </button>
                      </div>
                    )}

                    {question.type === 'scale' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-slate-400 mb-1 block">Минимум</label>
                          <input
                            type="number"
                            value={question.scaleMin}
                            onChange={(e) => updateQuestion(question.id, { scaleMin: parseInt(e.target.value) })}
                            className="w-full bg-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-slate-400 mb-1 block">Максимум</label>
                          <input
                            type="number"
                            value={question.scaleMax}
                            onChange={(e) => updateQuestion(question.id, { scaleMax: parseInt(e.target.value) })}
                            className="w-full bg-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => deleteQuestion(question.id)}
                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            </Reorder.Item>
          ))}
        </Reorder.Group>

        {questions.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-lg">Добавьте первый вопрос, чтобы начать</p>
          </div>
        )}

        {/* Action Buttons */}
        {questions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 sticky bottom-8"
          >
            <button
              onClick={saveSurvey}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-2xl hover:shadow-green-500/50 transition-all flex items-center justify-center gap-2 text-lg font-semibold"
            >
              <Save className="w-6 h-6" />
              Сохранить и получить ссылку
            </button>
            <button className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all flex items-center gap-2">
              <Eye className="w-6 h-6" />
              Предпросмотр
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
