import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'ПрофДНК Platform - Платформа для профориентологов',
  description: 'Создавайте валидные методики, анализируйте с помощью AI, получайте глубокие инсайты',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#fff',
              border: '1px rgba(255,255,255,0.1)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
