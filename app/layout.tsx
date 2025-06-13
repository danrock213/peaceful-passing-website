import './globals.css';
import { AuthProvider } from '@/lib/authContext';
import Header from '@/components/Header';

export const metadata = {
  title: 'Starlit Passage',
  description: 'Funeral planning made simple',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-blue-50 text-gray-900 min-h-screen font-sans">
        <AuthProvider>
          <Header />
          <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10">{children}</main>
          <footer className="text-center text-gray-500 text-sm py-6 select-none">
            &copy; {new Date().getFullYear()} Peaceful Passing. All rights reserved.
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
