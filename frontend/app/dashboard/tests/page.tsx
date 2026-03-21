'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { format } from 'date-fns';

export default function TestsPage() {
  const [tests, setTests] = useState<any[]>([]);

  useEffect(() => {
    api.get('/api/tests').then(res => setTests(res.data));
  }, []);

  const copyLink = (testId: number) => {
    api.get(`/api/tests/${testId}/link`).then(res => {
      const fullLink = `${window.location.origin}${res.data.link}`;
      navigator.clipboard.writeText(fullLink);
      alert('Ссылка скопирована!');
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Мои опросники</h1>
        <Link href="/dashboard/tests/new" className="bg-green-600 text-white px-4 py-2 rounded">
          + Новый тест
        </Link>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Название</th>
            <th className="p-2 text-left">Заполнили</th>
            <th className="p-2 text-left">Последнее заполнение</th>
            <th className="p-2 text-left">Действия</th>
          </tr>
        </thead>
        <tbody>
          {tests.map(test => (
            <tr key={test.id} className="border-b">
              <td className="p-2">
                <Link href={`/dashboard/tests/${test.id}`} className="text-blue-600 hover:underline">
                  {test.title}
                </Link>
              </td>
              <td className="p-2">{test.sessions_count}</td>
              <td className="p-2">{test.last_session_at ? format(new Date(test.last_session_at), 'dd.MM.yyyy HH:mm') : '-'}</td>
              <td className="p-2">
                <button onClick={() => copyLink(test.id)} className="text-blue-600 mr-2">Скопировать ссылку</button>
                <Link href={`/dashboard/tests/${test.id}/edit`} className="text-yellow-600 mr-2">Редактировать</Link>
                <button onClick={() => {/* delete test */}} className="text-red-600">Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}