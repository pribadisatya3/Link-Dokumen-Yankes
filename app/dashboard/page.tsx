'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, ExternalLink, LogOut, Save, Link as LinkIcon } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>({ display_name: '', bio: '', username: '', avatar_url: '' });
  const [links, setLinks] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (prof) {
        setProfile(prof);
      }

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
      order_index: links.length,
      is_active: true,
    });

    if (!error) {
      setTitle('');
      setUrl('');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              Dashboard Pengaturan
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Kelola data profil dan daftar tautan aktif Anda</p>
          </div>
          <div className="flex items-center gap-2.5">
            {profile.username && (
              <a
                href={`/${profile.username}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Kunjungi Bio Page <ExternalLink size={14} />
              </a>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-rose-900/40 hover:text-rose-400 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
            >
              <LogOut size={14} /> Keluar
            </button>
          </div>
        </div>

        {/* Edit Profil Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Informasi Profil</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Nama Tampilan</label>
              <input
                type="text"
                value={profile.display_name || ''}
                onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Username (URL Path)</label>
              <input
                type="text"
                disabled
                value={profile.username || ''}
                className="w-full bg-slate-950/40 border border-slate-800/80 rounded-lg px-3 py-2 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-slate-400 mb-1 block">URL Foto Avatar (Opsional)</label>
              <input
                type="text"
                placeholder="https://domain.com/avatar.jpg"
                value={profile.avatar_url || ''}
                onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-slate-400 mb-1 block">Bio / Deskripsi Singkat</label>
              <textarea
                rows={2}
                value={profile.bio || ''}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-50"
          >
            <Save size={14} /> {savingProfile ? 'Menyimpan...' : 'Perbarui Profil'}
          </button>
        </div>

        {/* Tambah Link Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Tambah Tautan Baru</h2>
          <form onSubmit={handleAddLink} className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="Label Tautan (Contoh: WhatsApp / Website)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              <Plus size={16} /> Tambahkan
            </button>
          </form>
        </div>

        {/* List Tautan */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Daftar Tautan ({links.length})</h2>
          <div className="space-y-3">
            {links.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-slate-950 border border-slate-800/80 p-3.5 rounded-xl hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3 overflow-hidden pr-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-emerald-400 flex-shrink-0">
                    <LinkIcon size={16} />
                  </div>
                  <div className="truncate">
                    <h3 className="font-semibold text-sm text-slate-200">{item.title}</h3>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-slate-500 hover:text-slate-300 truncate block max-w-sm"
                    >
                      {item.url}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(item.id, item.is_active)}
                    className={`text-xs px-2.5 py-1 rounded-md font-semibold border transition-colors ${
                      item.is_active
                        ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400'
                    }`}
                  >
                    {item.is_active ? 'Aktif' : 'Nonaktif'}
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
              <p className="text-center text-xs text-slate-500 py-6">Belum ada tautan ditambahkan.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
