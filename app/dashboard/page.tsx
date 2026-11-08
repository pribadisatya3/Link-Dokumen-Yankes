'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Plus,
  Trash2,
  ExternalLink,
  LogOut,
  Save,
  Link as LinkIcon,
  Share2,
  Copy,
  Check,
  Smartphone,
  Eye,
  MoreVertical,
  Sparkles
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>({
    display_name: 'DOKUMEN ARSIP BIDANG YANKES',
    bio: 'Menyimpan Semua Dokumen Bidang Yankes',
    username: '',
    avatar_url: ''
  });
  const [links, setLinks] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);

      // Ambil Profil
      let { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      // Buatkan profil jika belum ada
      if (!prof) {
        const fallbackUsername = session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'yankes';
        const { data: newProf } = await supabase
          .from('profiles')
          .insert({
            id: session.user.id,
            username: fallbackUsername,
            display_name: session.user.user_metadata?.display_name || 'DOKUMEN ARSIP BIDANG YANKES',
            bio: 'Menyimpan Semua Dokumen Bidang Yankes',
          })
          .select()
          .single();
        prof = newProf;
      }

      if (prof) setProfile(prof);

      await loadLinks(session.user.id);
      setLoading(false);
    }
    init();
  }, [router]);

  async function loadLinks(userId: string) {
    const { data } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', userId)
      .order('order_index', { ascending: true });
    if (data) setLinks(data);
  }

  async function handleAddLink(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !url || !user) return;

    const formattedUrl = url.startsWith('http://') || url.startsWith('https://')
      ? url
      : `https://${url}`;

    const { error } = await supabase.from('links').insert({
      user_id: user.id,
      title,
      url: formattedUrl,
      thumbnail_url: thumbnailUrl.trim() || null,
      order_index: links.length,
      is_active: true,
    });

    if (!error) {
      setTitle('');
      setUrl('');
      setThumbnailUrl('');
      loadLinks(user.id);
    }
  }

  async function handleDeleteLink(id: string) {
    await supabase.from('links').delete().eq('id', id);
    loadLinks(user.id);
  }

  async function handleToggleStatus(id: string, currentStatus: boolean) {
    await supabase.from('links').update({ is_active: !currentStatus }).eq('id', id);
    loadLinks(user.id);
  }

  async function handleSaveProfile() {
    setSavingProfile(true);
    await supabase
      .from('profiles')
      .update({
        display_name: profile.display_name,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
      })
      .eq('id', user.id);
    setSavingProfile(false);
  }

  const getShareLink = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/${profile.username}`;
  };

  const copyShareLink = () => {
    const link = getShareLink();
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Navbar */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              YankesTree Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Kelola dokumen, link arsip, dan tampilan bio link Anda</p>
          </div>

          {/* Tombol Share Khusus & Aksi Header */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={copyShareLink}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-950 transition-all"
            >
              {copied ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
              {copied ? 'Link Tersalin!' : 'Salin Share Link'}
            </button>

            {profile.username && (
              <a
                href={`/${profile.username}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
              >
                <Eye size={14} /> Buka Halaman Publik <ExternalLink size={12} />
              </a>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-rose-950/40 hover:text-rose-400 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              <LogOut size={14} /> Keluar
            </button>
          </div>
        </header>

        {/* Share Link Banner Card */}
        <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-800/40 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
              <Share2 size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-indigo-300">Share Link Khusus Akun Anda</p>
              <p className="text-xs text-slate-400 font-mono select-all truncate max-w-sm md:max-w-md">
                {getShareLink()}
              </p>
            </div>
          </div>
          <button
            onClick={copyShareLink}
            className="w-full sm:w-auto text-xs px-4 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/30 text-indigo-200 rounded-lg font-medium transition-all"
          >
            {copied ? 'Berhasil Disalin ✓' : 'Salin Tautan'}
          </button>
        </div>

        {/* GRID UTAMA: EDITOR DI KIRI & CONTOH TAMPILAN DI KANAN */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* KOLOM KIRI: Form Pengaturan (Lebar 7 Kolom) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Box Profil */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
                <span>1.</span> Informasi Profil Dokumen
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-slate-400 mb-1 block">Judul Halaman (Display Name)</label>
                  <input
                    type="text"
                    value={profile.display_name || ''}
                    placeholder="DOKUMEN ARSIP BIDANG YANKES"
                    onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1 block">Username / URL Slug</label>
                  <input
                    type="text"
                    disabled
                    value={profile.username || ''}
                    className="w-full bg-slate-950/40 border border-slate-800/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1 block">URL Logo / Lambang (PNG)</label>
                  <input
                    type="text"
                    placeholder="https://.../lambang-badung.png"
                    value={profile.avatar_url || ''}
                    onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-slate-400 mb-1 block">Subjudul / Deskripsi Singkat</label>
                  <textarea
                    rows={2}
                    value={profile.bio || ''}
                    placeholder="Menyimpan Semua Dokumen Bidang Yankes"
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold text-white transition-colors disabled:opacity-50"
              >
                <Save size={14} /> {savingProfile ? 'Menyimpan...' : 'Simpan Profil'}
              </button>
            </div>

            {/* Box Tambah Link Arsip */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
                <span>2.</span> Tambah Dokumen / Tautan Baru
              </h2>
              <form onSubmit={handleAddLink} className="space-y-3">
                <input
                  type="text"
                  placeholder="Judul Dokumen (Misal: ARSIP DOKUMEN YANKES 2026)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="URL Target / Google Drive (Misal: https://drive.google.com/...)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="URL Gambar Thumbnail Kotak (Opsional, contoh logo/ikon arsip)"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  <Plus size={16} /> Tambahkan ke Daftar
                </button>
              </form>
            </div>

            {/* Box Daftar Link */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center justify-between">
                <span>Daftar Dokumen Arsip ({links.length})</span>
                <span className="text-xs font-normal text-slate-400">Tersinkronisasi otomatis</span>
              </h2>

              <div className="space-y-3">
                {links.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-slate-950 border border-slate-800/80 p-3.5 rounded-xl hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-3 overflow-hidden pr-2">
                      <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {item.thumbnail_url ? (
                          <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <LinkIcon size={16} className="text-indigo-400" />
                        )}
                      </div>
                      <div className="truncate">
                        <h3 className="font-semibold text-sm text-slate-200">{item.title}</h3>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-slate-500 hover:text-indigo-400 truncate block max-w-sm"
                        >
                          {item.url}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleToggleStatus(item.id, item.is_active)}
                        className={`text-xs px-2.5 py-1 rounded-md font-semibold border transition-colors ${
                          item.is_active
                            ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400'
                            : 'bg-slate-800/50 border-slate-700 text-slate-400'
                        }`}
                      >
                        {item.is_active ? 'Aktif' : 'Draft'}
                      </button>
                      <button
                        onClick={() => handleDeleteLink(item.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {links.length === 0 && (
                  <p className="text-center text-xs text-slate-500 py-6">Belum ada tautan arsip ditambahkan.</p>
                )}
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: CONTOH TAMPILAN DI SEBELAH NYA (LIVE PREVIEW MOCKUP SMARTPHONE) */}
          <div className="lg:col-span-5 sticky top-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col items-center">
              <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Smartphone size={16} className="text-indigo-400" /> Contoh Tampilan Live
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  Real-time Preview
                </span>
              </div>

              {/* Bingkai Smartphone */}
              <div className="w-[325px] h-[630px] bg-[#2e3170] border-[8px] border-slate-800 rounded-[44px] shadow-2xl relative overflow-hidden flex flex-col p-4">
                {/* Speaker HP & Kamera Depan */}
                <div className="w-28 h-3.5 bg-slate-800 rounded-full mx-auto mb-4 z-20 flex-shrink-0"></div>

                {/* Background Pattern Mockup */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                  <div className="absolute -top-16 -left-14 w-64 h-64 bg-[#216d47] rounded-full opacity-80"></div>
                  <div className="absolute top-1/4 -right-16 w-60 h-60 bg-[#22295a] rounded-full"></div>
                  <div className="absolute top-12 left-1/4 w-52 h-52 bg-[#d991a7] rounded-full mix-blend-multiply opacity-70"></div>
                  <div className="absolute bottom-1/4 -left-16 w-64 h-64 bg-[#298358] rounded-full opacity-80"></div>
                  <div className="absolute -bottom-14 right-4 w-60 h-60 bg-[#6885c5] rounded-full opacity-70"></div>
                </div>

                {/* Konten Live Mockup Scrollable */}
                <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar flex flex-col items-center">
                  {/* Action Icons */}
                  <div className="w-full flex justify-between items-center mb-4 px-1">
                    <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                      <Sparkles size={13} />
                    </div>
                    <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                      <Share2 size={13} />
                    </div>
                  </div>

                  {/* Avatar / Lambang */}
                  <div className="w-16 h-16 mb-2.5 flex items-center justify-center drop-shadow-xl">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Logo"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow">
                        {profile.display_name?.charAt(0) || 'Y'}
                      </div>
                    )}
                  </div>

                  {/* Judul & Bio */}
                  <h3 className="text-center font-black text-xs text-white uppercase tracking-tight px-2 leading-tight">
                    {profile.display_name || 'DOKUMEN ARSIP BIDANG YANKES'}
                  </h3>
                  <p className="text-[10px] text-white/90 text-center font-medium mt-1 mb-5 px-2">
                    {profile.bio || 'Menyimpan Semua Dokumen Bidang Yankes'}
                  </p>

                  {/* Daftar Tombol Kartu Putih */}
                  <div className="w-full space-y-2.5 pb-6">
                    {links.filter((l) => l.is_active).map((link) => (
                      <div
                        key={link.id}
                        className="w-full bg-white text-slate-800 rounded-xl p-1.5 flex items-center shadow-md"
                      >
                        <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {link.thumbnail_url ? (
                            <img src={link.thumbnail_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-[8px] text-white font-bold text-center leading-none">
                              YANKES
                            </div>
                          )}
                        </div>
                        <div className="flex-1 text-center px-1.5">
                          <p className="text-[10px] font-black uppercase text-slate-800 line-clamp-1">
                            {link.title}
                          </p>
                        </div>
                        <div className="w-6 h-6 flex items-center justify-center text-slate-400 flex-shrink-0">
                          <MoreVertical size={13} />
                        </div>
                      </div>
                    ))}

                    {links.filter((l) => l.is_active).length === 0 && (
                      <div className="w-full bg-white/10 rounded-xl p-4 text-center text-white/70 text-[10px]">
                        Tautan yang aktif akan muncul di sini.
                      </div>
                    )}
                  </div>
                </div>

                {/* Home Indicator Bar */}
                <div className="w-24 h-1 bg-white/40 rounded-full mx-auto mt-2 z-20 flex-shrink-0"></div>
              </div>

              <p className="text-center text-[11px] text-slate-400 mt-3">
                Tampilan di atas adalah simulasi persis tampilan di layar HP pengunjung.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
