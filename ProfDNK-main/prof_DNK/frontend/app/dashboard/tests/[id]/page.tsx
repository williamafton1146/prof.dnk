'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { format } from 'date-fns';

export default function TestDetails() {
  const { id } = useParams();
  const [sessions, setSessions] = useState<any[]>([]);
  const [test, setTest] = useState<any>(null);

  useEffect(() => {
    if (id) {
      api.get(`/api/tests/${id}`).then(res => setTest(res.data));
      api.get(`/api/sessions/test/${id}`).then(res => setSessions(res.data));
    }
  }, [id]);

  const generateReport = (sessionId: number, type: 'client' | 'psychologist', format: 'docx' | 'html') => {
    const url = `/api/reports/session/${sessionId}/${type}.${format}`;
    if (format === 'docx') {
      window.open(url, '_blank');
    } else {
      window.open(url, '_blank');
    }
  };

  if (!test) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{test.title}</h1>
      <table className="w-full mt-4 border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Клиент</th>
            <th className="p-2 text-left">Дата заполнения</th>
            <th className="p-2 text-left">Отчеты</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(session => (
            <tr key={session.id} className="border-b">
              <td className="p-2">{session.client_name}</td>
              <td className="p-2">{format(new Date(session.completed_at), 'dd.MM.yyyy HH:mm')}</td>
              <td className="p-2">
                <button onClick={() => generateReport(session.id, 'client', 'docx')} className="bg-blue-500 text-white px-2 py-1 rounded mr-2">
                  Клиент DOCX
                </button>
                <button onClick={() => generateReport(session.id, 'client', 'html')} className="bg-blue-500 text-white px-2 py-1 rounded mr-2">
                  Клиент HTML
                </button>
                <button onClick={() => generateReport(session.id, 'psychologist', 'docx')} className="bg-green-500 text-white px-2 py-1 rounded mr-2">
                  Психолог DOCX
                </button>
                <button onClick={() => generateReport(session.id, 'psychologist', 'html')} className="bg-green-500 text-white px-2 py-1 rounded">
                  Психолог HTML
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}