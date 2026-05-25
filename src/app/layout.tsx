import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sistema de Horarios - UNT',
  description: 'Sistema de Gestión de Horarios - Escuela de Ingeniería de Sistemas - Universidad Nacional de Trujillo',
  authors: [{ name: 'Universidad Nacional de Trujillo' }],
  keywords: ['horarios', 'universidad', 'UNT', 'sistemas'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
