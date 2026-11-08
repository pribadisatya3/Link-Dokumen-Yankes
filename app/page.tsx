import Link from 'next/link';
import { ArrowRight, Link2, Sparkles, FolderArchive, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col justify-between p-6 md:p-16 max-w-5xl mx-auto">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold text-xl text-emerald-400">
          <Link2 className="w-6 h-6" />
          <span>YankesTree</span>
        </div>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold px-4 py-2 rounded-lg text-slate-300 hover:text-white transition-colors"
          >
            Masuk
          </Link>
          <Link
            href="/login?tab=register"
            className="text-sm font-semibold px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
          >
            Daftar Sekarang
          </Link>
        </div>
      </header>

      <section className="text-center my-20">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6">
          <Sparkles className="w-4 h-4" /> Portal Layanan Resmi Yankes
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6">
          Kumpulkan semua media sosial & portofolio dalam satu bio page.
        </h1>
        <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto mb-8">
          Buat profil personal, susun dokumen arsip berjenjang, simpan ke database cloud Supabase, dan bagikan alamat unik bio Anda dengan mudah.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/login?tab=register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-white shadow-lg shadow-emerald-900/30 transition-all hover:gap-3"
          >
            Mulai Sekarang <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <footer className="text-center text-xs text-slate-600 border-t border-slate-900 pt-6">
        &copy; {new Date().getFullYear()} YankesTree. Bidang Pelayanan Kesehatan.
      </footer>
    </main>
  );
}
