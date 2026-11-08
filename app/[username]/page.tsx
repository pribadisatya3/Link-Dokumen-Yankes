'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Share2, MoreVertical, Sparkles, Check, ExternalLink } from 'lucide-react';

interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
}

interface LinkItem {
  id: string;
  title: string;
  url: string;
  thumbnail_url?: string;
  is_active: boolean;
  order_index: number;
}

export default function PublicBioPage() {
  const params = useParams();
  const username = params.username as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!username) return;

      const { data: profData } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (profData) {
        setProfile(profData);

        const { data: linkData } = await supabase
          .from('links')
          .select('*')
          .eq('user_id', profData.id)
          .eq('is_active', true)
          .order('order_index', { ascending: true });

        if (linkData) setLinks(linkData);
      }
      setLoading(false);
    }

    loadData();
  }, [username]);

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: profile?.display_name || 'YankesTree',
          text: profile?.bio || 'Kunjungi link ini',
          url: shareUrl,
        });
        return;
      } catch (err) {
        // Fallback jika dibatalkan
      }
    }

    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-indigo-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Profil Tidak Ditemukan</h1>
        <p className="text-sm text-slate-400">Pengguna @{username} belum terdaftar di YankesTree.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full relative flex flex-col items-center justify-between p-4 md:p-8 bg-[#2e3170] overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Graphic Patterns aesthetic Linktree inspired */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-24 -left-20 w-96 h-96 bg-[#216d47] rounded-full blur-[2px] opacity-85 rotate-12"></div>
        <div className="absolute top-1/4 -right-24 w-[380px] h-[380px] bg-[#22295a] rounded-full blur-[1px]"></div>
        <div className="absolute top-10 left-1/3 w-80 h-80 bg-[#d991a7] rounded-full mix-blend-multiply opacity-70"></div>
        <div className="absolute bottom-1/4 -left-28 w-[420px] h-[420px] bg-[#298358] rounded-full opacity-80"></div>
        <div className="absolute -bottom-20 right-10 w-[360px] h-[360px] bg-[#6885c5] rounded-full opacity-70"></div>
      </div>

      {/* Floating Notification Toast */}
      {copied && (
        <div className="fixed top-5 z-50 flex items-center gap-2 bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-2xl animate-bounce">
          <Check size={16} /> Link berhasil disalin ke clipboard!
        </div>
      )}

      {/* Konten Utama */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Top Floating Action Bar */}
        <div className="w-full flex justify-between items-center mb-6 pt-2">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-md cursor-pointer hover:bg-white/30 transition-colors">
            <Sparkles size={18} />
          </div>

          <button
            onClick={handleShare}
            aria-label="Bagikan profil"
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-md hover:bg-white/30 hover:scale-105 active:scale-95 transition-all"
          >
            <Share2 size={18} />
          </button>
        </div>

        {/* Profil Header */}
        <div className="flex flex-col items-center mb-8 text-center px-2">
          {/* Logo / Lambang */}
          <div className="w-24 h-24 mb-4 flex items-center justify-center drop-shadow-2xl transition-transform hover:scale-105 duration-300">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg border-2 border-white/40">
                {profile.display_name?.charAt(0) || 'Y'}
              </div>
            )}
          </div>

          {/* Judul Besar & Subjudul */}
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase drop-shadow-md leading-snug">
            {profile.display_name || 'DOKUMEN ARSIP BIDANG YANKES'}
          </h1>
          <p className="text-sm font-medium text-white/90 mt-1 drop-shadow">
            {profile.bio || 'Menyimpan Semua Dokumen Bidang Yankes'}
          </p>
        </div>

        {/* Kartu Daftar Tautan */}
        <div className="w-full space-y-3.5 mb-14">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group w-full bg-white text-slate-800 hover:bg-slate-50 transition-all duration-200 rounded-2xl p-2.5 flex items-center shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {/* Thumbnail Kotak Kiri */}
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700/40 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
                {link.thumbnail_url ? (
                  <img
                    src={link.thumbnail_url}
                    alt={link.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-white font-bold bg-gradient-to-br from-slate-800 to-slate-950 p-1 text-center leading-tight">
                    <span>YANKES</span>
                  </div>
                )}
              </div>

              {/* Teks Judul di Tengah */}
              <div className="flex-1 text-center px-3">
                <span className="font-extrabold text-[13px] sm:text-sm text-slate-800 tracking-wide uppercase line-clamp-2 group-hover:text-indigo-900 transition-colors">
                  {link.title}
                </span>
              </div>

              {/* Opsi Titik Tiga di Kanan */}
              <div className="w-9 h-9 flex items-center justify-center text-slate-400 group-hover:text-slate-600 flex-shrink-0">
                <MoreVertical size={18} />
              </div>
            </a>
          ))}

          {links.length === 0 && (
            <div className="w-full bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center text-white/70 text-xs">
              Belum ada dokumen atau tautan arsip yang dipublikasikan.
            </div>
          )}
        </div>

        {/* Footer Brand */}
        <footer className="w-full flex flex-col items-center pb-6 text-center text-white/60 text-[11px] space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-white text-sm">
            <span>YankesTree</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-[10px] text-white/60">
            <span>Dinas Kesehatan</span> &bull; <span>Bidang Pelayanan Kesehatan</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
