import Link from 'next/link';
import { 
  ArrowRight, 
  Link2, 
  Sparkles, 
  FolderArchive, 
  ShieldCheck, 
  Layers 
} from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: <FolderArchive className="w-5 h-5 text-emerald-400" />,
      title: 'Arsip Berjenjang',
      desc: 'Susun dokumen teknis, SOP, dan portofolio ke dalam kategori folder terstruktur.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      title: 'Aman & Terintegrasi',
      desc: 'Penyimpanan terhubung langsung dengan otentikasi dan database Supabase.',
    },
    {
      icon: <Layers className="w-5 h-5 text-emerald-400" />,
      title: 'Satu URL Bio',
      desc: 'Akses instan untuk publik maupun internal lewat satu link bio yang dipersonalisasi.',
    },
  ];

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Ambient background glow */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full" 
      />

      <main className="relative z-10 min-h-screen flex flex-col justify-between p-6 md:p-12 lg:p-16 max-w-5xl mx-auto">
        {/* Navigation Header */}
        <header className="flex justify-between items-center py-2">
          <div className="flex items-center gap-2.5 font-bold text-xl text-emerald-400">
            <Link2 className="w-6 h-6" />
            <span className="tracking-tight">YankesTree</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold px-4 py-2 rounded-lg text-slate-300 hover:text-white transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/login?tab=register"
              className="text-sm font-semibold px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm shadow-emerald-950"
            >
              Daftar Sekarang
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="text-center my-16 md:my-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6">
            <Sparkles className="w-4 h-4" /> Portal Layanan Resmi Yankes
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Kumpulkan semua media sosial & portofolio dalam satu bio page.
          </h1>

          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Buat profil personal, susun dokumen arsip berjenjang, simpan ke database cloud Supabase, dan bagikan alamat unik bio Anda dengan mudah.
          </p>

          <div className="flex justify-center gap-4">
            <Link
              href="/login?tab=register"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-white shadow-lg shadow-emerald-900/30 transition-all"
            >
              Mulai Sekarang 
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          {features.map((feat, idx) => (
            <div 
              key={idx} 
              className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm hover:border-slate-700 transition-colors"
            >
              <div className="p-2.5 w-fit rounded-lg bg-emerald-500/10 mb-3">
                {feat.icon}
              </div>
              <h3 className="font-semibold text-white text-sm mb-1">{feat.title}</h3>
              <p className="text-xs text-slate-400 leading-normal">{feat.desc}</p>
            </div>
          ))}
        </section>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-500 border-t border-slate-900 pt-6">
          &copy; {new Date().getFullYear()} YankesTree. Bidang Pelayanan Kesehatan.
        </footer>
      </main>
    </div>
  );
}
