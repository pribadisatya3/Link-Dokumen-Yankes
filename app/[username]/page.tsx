'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ExternalLink, Globe, Instagram, Send, Youtube, Twitter } from 'lucide-react';

interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  social_links?: {
    instagram?: string;
    whatsapp?: string;
    youtube?: string;
    twitter?: string;
  };
}

interface LinkItem {
  id: string;
  title: string;
  url: string;
  is_active: boolean;
  order_index: number;
}

export default function PublicBioPage() {
  const params = useParams();
  const username = params.username as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadPublicData() {
      if (!username) return;

      const { data: profData, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (profError || !profData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProfile(profData);

      const { data: linkData } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', profData.id)
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (linkData) setLinks(linkData);
      setLoading(false);
    }

    loadPublicData();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-2">Halaman Tidak Ditemukan</h1>
        <p className="text-sm text-slate-400">Pengguna @{username} belum terdaftar di platform ini.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full ring-4 ring-emerald-500/20 overflow-hidden mb-4 bg-slate-800 shadow-xl">
          <img
            src={
              profile.avatar_url && profile.avatar_url.trim() !== ''
                ? profile.avatar_url
                : `https://api.dicebear.com/7.x/identicon/svg?seed=${profile.username}`
            }
            alt={profile.display_name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Identitas */}
        <h1 className="text-xl font-bold text-slate-100">{profile.display_name}</h1>
        <p className="text-xs text-emerald-400 font-medium mb-3">@{profile.username}</p>
        {profile.bio && (
          <p className="text-sm text-slate-400 text-center mb-6 px-4">{profile.bio}</p>
        )}

        {/* Ikon Media Sosial */}
        {profile.social_links && (
          <div className="flex gap-4 mb-6">
            {profile.social_links.instagram && (
              <a href={profile.social_links.instagram} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-pink-500 transition-colors">
                <Instagram size={20} />
              </a>
            )}
            {profile.social_links.whatsapp && (
              <a href={`https://wa.me/${profile.social_links.whatsapp}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-green-500 transition-colors">
                <Send size={20} />
              </a>
            )}
            {profile.social_links.youtube && (
              <a href={profile.social_links.youtube} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-red-500 transition-colors">
                <Youtube size={20} />
              </a>
            )}
            {profile.social_links.twitter && (
              <a href={profile.social_links.twitter} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-sky-400 transition-colors">
                <Twitter size={20} />
              </a>
            )}
          </div>
        )}

        {/* Daftar Tautan Publik */}
        <div className="w-full flex flex-col gap-3">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 p-4 rounded-xl flex items-center justify-between transition-all transform hover:-translate-y-0.5 shadow-md group"
            >
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-slate-200 text-sm">{link.title}</span>
              </div>
              <ExternalLink size={16} className="text-slate-500 group-hover:text-slate-300" />
            </a>
          ))}

          {links.length === 0 && (
            <p className="text-center text-xs text-slate-500 mt-4">Belum ada tautan aktif.</p>
          )}
        </div>

        {/* Footer Bio */}
        <footer className="mt-14 text-xs text-slate-600">
          Dibuat dengan <span className="font-bold text-slate-400">BioTree</span>
        </footer>
      </div>
    </div>
  );
}
