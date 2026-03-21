import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
    <body>
        <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
    </body>
    </html>
  );
}