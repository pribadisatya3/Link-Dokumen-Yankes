import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'YankesTree - Layanan Dokumen & Profil',
  description: 'Portal Layanan Resmi Yankes',
  icons: {
    icon: '/logo.png', // path relatif ke folder public
    shortcut: '/logo.png',
    apple: '/logo.png', // jika ingin ikon saat di-bookmark di iOS/Safari
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
