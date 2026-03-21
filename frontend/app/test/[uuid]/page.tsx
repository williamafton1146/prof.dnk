'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Question {
  id: string;
  text: string;
  type: string;
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}

export default function TakeTest() {
  const { uuid } = useParams();
  const [test, setTest] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [clientName, setClientName] = useState('');
  const [clientData, setClientData] = useState<Record<string, any>>({});
  const [progress, setProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (uuid) {
      api.get(`/public/test/${uuid}`).then(res => setTest(res.data));
    }
  }, [uuid]);

  const handleAnswer = (qid: string, value: any) => {
    setAnswers(prev => ({ ...prev, [qid]: value }));
    // update progress
    const total = test.config.questions.length;
    const answered = Object.keys({ ...answers, [qid]: value }).length;
    setProgress((answered / total) * 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/public/test/${uuid}`, {
        client_name: clientName,
        client_data: clientData,
        answers,
      });
      setSubmitted(true);
      if (test.config.show_report_to_client) {
        // show report? maybe redirect to report page
        alert('Спасибо! Ваши ответы сохранены.');
        router.push('/');
      } else {
        alert('Спасибо! Ваши ответы сохранены.');
      }
    } catch (err) {
      alert('Ошибка при отправке');
    }
  };

  if (!test) return <div>Loading...</div>;

  const questions: Question[] = test.config.questions;
  const clientFields = test.config.client_fields || [];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">{test.title}</h1>
      <p className="mb-6 text-gray-600">{test.description}</p>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block font-medium">Ваше имя *</label>
          <input
            type="text"
            required
            value={clientName}
            onChange={e => setClientName(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        {clientFields.map(field => (
          <div key={field} className="mb-4">
            <label className="block font-medium">{field}</label>
            <input
              type="text"
              onChange={e => setClientData(prev => ({ ...prev, [field]: e.target.value }))}
              className="w-full border rounded p-2"
            />
          </div>
        ))}
        {questions.map((q, idx) => (
          <div key={q.id} className="mb-6">
            <label className="block font-medium">{q.text} {q.required && '*'}</label>
            {q.type === 'text' && (
              <input type="text" className="w-full border rounded p-2" onChange={e => handleAnswer(q.id, e.target.value)} />
            )}
            {q.type === 'multiline' && (
              <textarea className="w-full border rounded p-2" rows={3} onChange={e => handleAnswer(q.id, e.target.value)} />
            )}
            {q.type === 'single' && q.options && (
              <select className="w-full border rounded p-2" onChange={e => handleAnswer(q.id, e.target.value)}>
                <option value="">Выберите</option>
                {q.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            )}
            {q.type === 'multiple' && q.options && (
              <div className="space-y-2">
                {q.options.map(opt => (
                  <label key={opt} className="block">
                    <input type="checkbox" value={opt} onChange={e => {
                      const current = answers[q.id] || [];
                      if (e.target.checked) handleAnswer(q.id, [...current, opt]);
                      else handleAnswer(q.id, current.filter(v => v !== opt));
                    }} />
                    <span className="ml-2">{opt}</span>
                  </label>
                ))}
              </div>
            )}
            {q.type === 'yesno' && (
              <div>
                <label><input type="radio" name={q.id} value="yes" onChange={() => handleAnswer(q.id, true)} /> Да</label>
                <label className="ml-4"><input type="radio" name={q.id} value="no" onChange={() => handleAnswer(q.id, false)} /> Нет</label>
              </div>
            )}
            {q.type === 'numeric' && (
              <input type="number" min={q.min} max={q.max} step={q.step} className="w-full border rounded p-2"
                     onChange={e => handleAnswer(q.id, parseFloat(e.target.value))} />
            )}
            {q.type === 'slider' && (
              <input type="range" min={q.min || 0} max={q.max || 100} step={q.step || 1}
                     onChange={e => handleAnswer(q.id, parseFloat(e.target.value))} />
            )}
            {q.type === 'rating' && q.options && (
              <div className="flex space-x-2">
                {q.options.map((label, i) => (
                  <label key={i} className="flex flex-col items-center">
                    <input type="radio" name={q.id} value={i+1} onChange={() => handleAnswer(q.id, i+1)} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            )}
            {q.type === 'color_sort' && (
              <div className="border p-4">
                <p>Перетащите цвета в порядке предпочтения (реализуйте drag-and-drop в компоненте)</p>
                {/* Simplified: just show color blocks, we skip full implementation for brevity */}
              </div>
            )}
          </div>
        ))}
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">Отправить</button>
      </form>
    </div>
  );
}