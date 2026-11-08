import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'YankesTree - Dokumen Arsip Bidang Pelayanan Kesehatan',
  description: 'Portal satu tautan untuk membagikan dan mengarsipkan dokumen resmi Yankes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
