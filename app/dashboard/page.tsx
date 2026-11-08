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
  Sparkles,
  Users,
  ChevronDown,
  FolderPlus,
  FolderOpen,
  FileText
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>({
    id: '',
    display_name: 'DOKUMEN ARSIP BIDANG YANKES',
    bio: 'Menyimpan Semua Dokumen Bidang Yankes',
    username: '',
    avatar_url: ''
  });
  const [links, setLinks] = useState<any[]>([]);
  
  // Form Tambah Link
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [parentId, setParentId] = useState<string>(''); // Jika diisi, menjadi sub-dokumen dari link ini
  
  // Modal / Form Tambah Profil Baru (Multi-User)
  const [showAddProfileModal, setShowAddProfileModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [addingProfile, setAddingProfile] = useState(false);

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

      // Ambil semua profil milik pengguna ini (baik akun utama maupun sub-profil)
      let { data: profilesList } = await supabase
        .from('profiles')
        .select('*')
        .or(`id.eq.${session.user.id},owner_id.eq.${session.user.id}`);

      // Jika belum ada profil sama sekali, buatkan profil awal
      if (!profilesList || profilesList.length === 0) {
        const fallbackUsername = session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'yankes';
        const { data: newProf } = await supabase
          .from('profiles')
          .insert({
            id: session.user.id,
            owner_id: session.user.id,
            username: fallbackUsername,
            display_name: session.user.user_metadata?.display_name || 'DOKUMEN ARSIP BIDANG YANKES',
            bio: 'Menyimpan Semua Dokumen Bidang Yankes',
          })
          .select()
          .single();

        if (newProf) {
          profilesList = [newProf];
        }
      }

      if (profilesList && profilesList.length > 0) {
        setAllProfiles(profilesList);
        const activeProf = profilesList[0];
        setProfile(activeProf);
        await loadLinks(activeProf.id);
      }

      setLoading(false);
    }
    init();
  }, [router]);

  async function loadLinks(profileId: string) {
    const { data } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', profileId)
      .order('order_index', { ascending: true });
    if (data) setLinks(data);
  }

  // Beralih profil aktif
  async function handleSwitchProfile(selectedProfileId: string) {
    const selected = allProfiles.find((p) => p.id === selectedProfileId);
    if (selected) {
      setProfile(selected);
      await loadLinks(selected.id);
    }
  }

  // Tambah User / Profil Baru dalam 1 Dashboard
  async function handleCreateNewProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!newUsername || !user) return;
    setAddingProfile(true);

    const cleanUsername = newUsername.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');

    const { data: created, error } = await supabase
      .from('profiles')
      .insert({
        owner_id: user.id,
        username: cleanUsername,
        display_name: newDisplayName || cleanUsername,
        bio: 'Menyimpan Semua Dokumen Bidang Yankes',
      })
      .select()
      .single();

    if (!error && created) {
      const updatedList = [...allProfiles, created];
      setAllProfiles(updatedList);
      setProfile(created);
      await loadLinks(created.id);
      setNewUsername('');
      setNewDisplayName('');
      setShowAddProfileModal(false);
    } else if (error) {
      alert('Gagal menambah profil: ' + error.message);
    }
    setAddingProfile(false);
  }

  // Tambah Link Baru (Bisa dokumen utama atau sub-dokumen)
  async function handleAddLink(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !url || !profile.id) return;

    const formattedUrl = url.startsWith('http://') || url.startsWith('https://')
      ? url
      : `https://${url}`;

    const { error } = await supabase.from('links').insert({
      user_id: profile.id,
      parent_id: parentId.trim() ? parentId : null,
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
      setParentId('');
      loadLinks(profile.id);
    } else {
      alert('Gagal menyimpan link: ' + error.message);
    }
  }

  async function handleDeleteLink(id: string) {
    await supabase.from('links').delete().eq('id', id);
    loadLinks(profile.id);
  }

  async function handleToggleStatus(id: string, currentStatus: boolean) {
    await supabase.from('links').update({ is_active: !currentStatus }).eq('id', id);
    loadLinks(profile.id);
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
      .eq('id', profile.id);
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

  // Daftar dokumen utama (bukan sub-link) untuk dropdown parent
  const parentLinks = links.filter((l) => !l.parent_id);

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
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              YankesTree Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Kelola dokumen arsip berjenjang dan multi-profil</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end">
            {/* MULTI-USER PROFILE SWITCHER */}
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5">
              <Users size={14} className="text-indigo-400" />
              <select
                value={profile.id}
                onChange={(e) => handleSwitchProfile(e.target.value)}
                className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
              >
                {allProfiles.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    @{p.username} ({p.display_name})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowAddProfileModal(true)}
                title="Tambah Profil/User Baru"
                className="ml-1 p-1 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 rounded-md transition-colors"
              >
                <Plus size={12} />
              </button>
            </div>

            <button
              onClick={copyShareLink}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-950 transition-all"
            >
              {copied ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
              {copied ? 'Link Tersalin!' : 'Salin Share Link'}
            </button>

            {profile.username && (
              <a
                href={`/${profile.username}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
              >
                <Eye size={14} /> Lihat Publik <ExternalLink size={12} />
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

        {/* MODAL POPUP TAMBAH USER / PROFIL BARU */}
        {showAddProfileModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Users size={18} className="text-indigo-400" /> Tambah User / Profil Cabang Baru
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Buat profil atau sub-bagian baru yang memiliki link dan halaman URL tersendiri tanpa perlu membuat email baru.
              </p>
              <form onSubmit={handleCreateNewProfile} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1 block">Username URL</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500 text-sm">@</span>
                    <input
                      type="text"
                      required
                      placeholder="yankes-rujukan"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1 block">Nama Tampilan</label>
                  <input
                    type="text"
                    required
                    placeholder="ARSIP YANKES RUJUKAN"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddProfileModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={addingProfile}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
                  >
                    {addingProfile ? 'Menambahkan...' : 'Buat Profil'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Share Link Banner */}
        <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-800/40 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
              <Share2 size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-indigo-300">Share Link Khusus Profil: @{profile.username}</p>
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
          {/* KOLOM KIRI: Form Pengaturan */}
          <div className="lg:col-span-7 space-y-6">
            {/* Box Profil */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
                <span>1.</span> Informasi Profil Aktif
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
                    placeholder="https://supabase.com/dashboard/project/caovzitfguftnuukhipr/storage/files/buckets/LOGO?preview=lambang-badung.png"
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

            {/* Box Tambah Link & Sub-Dokumen */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
                <span>2.</span> Tambah Dokumen / Tautan Baru
              </h2>
              <form onSubmit={handleAddLink} className="space-y-3">
                {/* Opsi Jadikan Sub-Dokumen */}
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1 block">
                    Penempatan Dokumen (Pilih Induk jika ini adalah Sub-Dokumen):
                  </label>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Dokumen Utama (Folder / Kartu Terluar) --</option>
                    {parentLinks.map((pl) => (
                      <option key={pl.id} value={pl.id}>
                        Di dalam: {pl.title}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  type="text"
                  placeholder="Judul Dokumen (Misal: ARSIP DOKUMEN YANKES 2026 atau Sub-SK 01)"
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
                  placeholder="URL Gambar Thumbnail Kotak (Opsional, logo/cover)"
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

            {/* Box Daftar Link Berjenjang */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center justify-between">
                <span>Daftar Dokumen (@{profile.username})</span>
                <span className="text-xs font-normal text-slate-400">{links.length} Tautan</span>
              </h2>

              <div className="space-y-3">
                {parentLinks.map((parent) => {
                  const subItems = links.filter((l) => l.parent_id === parent.id);
                  return (
                    <div key={parent.id} className="space-y-2">
                      {/* Kartu Utama */}
                      <div className="flex items-center justify-between bg-slate-950 border border-slate-800/80 p-3.5 rounded-xl hover:border-slate-700 transition-all">
                        <div className="flex items-center gap-3 overflow-hidden pr-2">
                          <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {parent.thumbnail_url ? (
                              <img src={parent.thumbnail_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <FolderOpen size={18} className="text-indigo-400" />
                            )}
                          </div>
                          <div className="truncate">
                            <h3 className="font-semibold text-sm text-slate-200 flex items-center gap-2">
                              {parent.title}
                              {subItems.length > 0 && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                                  {subItems.length} sub-dokumen
                                </span>
                              )}
                            </h3>
                            <a
                              href={parent.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-slate-500 hover:text-indigo-400 truncate block max-w-sm"
                            >
                              {parent.url}
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleToggleStatus(parent.id, parent.is_active)}
                            className={`text-xs px-2.5 py-1 rounded-md font-semibold border transition-colors ${
                              parent.is_active
                                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400'
                                : 'bg-slate-800/50 border-slate-700 text-slate-400'
                            }`}
                          >
                            {parent.is_active ? 'Aktif' : 'Draft'}
                          </button>
                          <button
                            onClick={() => handleDeleteLink(parent.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Sub-Items di Bawah Kartu Utama */}
                      {subItems.length > 0 && (
                        <div className="ml-8 pl-4 border-l-2 border-indigo-900/60 space-y-2">
                          {subItems.map((sub) => (
                            <div
                              key={sub.id}
                              className="flex items-center justify-between bg-slate-900/80 border border-slate-800/60 p-2.5 rounded-lg"
                            >
                              <div className="flex items-center gap-2 overflow-hidden pr-2">
                                <FileText size={14} className="text-emerald-400 flex-shrink-0" />
                                <div className="truncate">
                                  <p className="text-xs font-medium text-slate-300">{sub.title}</p>
                                  <a
                                    href={sub.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] text-slate-500 hover:text-indigo-300 truncate block max-w-xs"
                                  >
                                    {sub.url}
                                  </a>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                  onClick={() => handleToggleStatus(sub.id, sub.is_active)}
                                  className={`text-[10px] px-2 py-0.5 rounded border ${
                                    sub.is_active
                                      ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400'
                                      : 'bg-slate-800/50 border-slate-700 text-slate-400'
                                  }`}
                                >
                                  {sub.is_active ? 'Aktif' : 'Draft'}
                                </button>
                                <button
                                  onClick={() => handleDeleteLink(sub.id)}
                                  className="p-1 text-slate-500 hover:text-rose-400"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {links.length === 0 && (
                  <p className="text-center text-xs text-slate-500 py-6">Belum ada tautan arsip ditambahkan.</p>
                )}
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: LIVE PREVIEW MOCKUP SMARTPHONE (DENGAN ACCORDION SUB-LINK) */}
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
                      <img src={profile.avatar_url} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow">
                        {profile.display_name?.charAt(0) || 'Y'}
                      </div>
                    )}
                  </div>

                  <h3 className="text-center font-black text-xs text-white uppercase tracking-tight px-2 leading-tight">
                    {profile.display_name || 'DOKUMEN ARSIP BIDANG YANKES'}
                  </h3>
                  <p className="text-[10px] text-white/90 text-center font-medium mt-1 mb-5 px-2">
                    {profile.bio || 'Menyimpan Semua Dokumen Bidang Yankes'}
                  </p>

                  {/* Daftar Tombol Kartu Putih & Sub-Links */}
                  <div className="w-full space-y-2.5 pb-6">
                    {parentLinks.filter((l) => l.is_active).map((link) => {
                      const subLinks = links.filter((l) => l.parent_id === link.id && l.is_active);
                      return (
                        <div key={link.id} className="space-y-1">
                          <div className="w-full bg-white text-slate-800 rounded-xl p-1.5 flex items-center shadow-md">
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

                          {/* Preview Sub-dokumen di dalam kartu */}
                          {subLinks.length > 0 && (
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1.5 space-y-1">
                              {subLinks.map((sub) => (
                                <div
                                  key={sub.id}
                                  className="w-full bg-white/90 rounded-md py-1 px-2 flex items-center justify-between text-[9px] text-slate-800 font-medium"
                                >
                                  <span className="truncate">{sub.title}</span>
                                  <FileText size={10} className="text-slate-500" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {parentLinks.filter((l) => l.is_active).length === 0 && (
                      <div className="w-full bg-white/10 rounded-xl p-4 text-center text-white/70 text-[10px]">
                        Tautan yang aktif akan muncul di sini.
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-24 h-1 bg-white/40 rounded-full mx-auto mt-2 z-20 flex-shrink-0"></div>
              </div>

              <p className="text-center text-[11px] text-slate-400 mt-3">
                Simulasi tampilan real-time sesuai layar HP pengunjung.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
