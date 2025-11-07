import type { Metadata } from 'next';
import AuthProvider from '@/components/AuthProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Career Data Admin',
  description: 'Admin interface for managing career data with AI assistance',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="app-container">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
