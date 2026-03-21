'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import QRCode from 'react-qr-code';
import ReactMarkdown from 'react-markdown';

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [bio, setBio] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    api.get('/api/users/me').then(res => {
      setProfile(res.data);
      setBio(res.data.bio || '');
    });
  }, []);

  const updateProfile = async () => {
    let photoBase64 = profile.photo;
    if (photo) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        photoBase64 = reader.result as string;
        await api.put('/api/users/me', { bio, photo: photoBase64 });
        setProfile({ ...profile, bio, photo: photoBase64 });
      };
      reader.readAsDataURL(photo);
    } else {
      await api.put('/api/users/me', { bio });
      setProfile({ ...profile, bio });
    }
  };

  const businessCardUrl = `${window.location.origin}/public/psychologist/${profile?.id}`;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Личный кабинет</h1>
      {profile && (
        <div className="bg-white p-6 rounded shadow">
          <div className="flex items-center gap-6 mb-4">
            {profile.photo ? (
              <img src={profile.photo} alt="avatar" className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">Фото</div>
            )}
            <div>
              <h2 className="text-xl">{profile.full_name}</h2>
              <p>{profile.email}</p>
              <p>{profile.phone}</p>
              <p>Доступ до: {profile.access_until ? new Date(profile.access_until).toLocaleDateString() : 'бессрочно'}</p>
            </div>
          </div>
          <div className="mb-4">
            <label className="block font-medium">О себе (Markdown)</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full border rounded p-2 h-32"
            />
            <div className="mt-2 text-sm text-gray-500">
              Поддерживается Markdown: **жирный**, *курсив*, [ссылки](url)
            </div>
          </div>
          <div className="mb-4">
            <label className="block font-medium">Фото</label>
            <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] || null)} />
          </div>
          <button onClick={updateProfile} className="bg-blue-600 text-white px-4 py-2 rounded">
            Сохранить
          </button>
          <div className="mt-6">
            <button onClick={() => setShowQR(!showQR)} className="text-blue-600 underline">
              Показать визитку
            </button>
            {showQR && (
              <div className="mt-4 p-4 border rounded">
                <QRCode value={businessCardUrl} size={200} />
                <p className="mt-2">Ссылка: {businessCardUrl}</p>
                <div className="mt-4">
                  <ReactMarkdown>{bio}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}