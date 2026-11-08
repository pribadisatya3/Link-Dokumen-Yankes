'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Link2, AlertCircle } from 'lucide-react';

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';

  const [mode, setMode] = useState<'login' | 'register'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      if (mode === 'register') {
        const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
        if (!cleanUsername) {
          throw new Error('Username wajib diisi dengan huruf/angka tanpa spasi.');
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: cleanUsername,
              display_name: displayName || cleanUsername,
            },
          },
        });

        if (signUpError) throw signUpError;
        router.push('/dashboard');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        router.push('/dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kendala saat autentikasi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
      <div className="flex items-center justify-center gap-2 font-bold text-2xl text-emerald-400 mb-6">
        <Link2 className="w-7 h-7" />
        <span>YankesTree</span>
      </div>

      <div className="flex border-b border-slate-800 mb-6">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`flex-1 pb-3 text-sm font-semibold transition-colors border-b-2 ${
            mode === 'login'
              ? 'border-emerald-500 text-white'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          Masuk
        </button>
        <button
          type="button"
          onClick={() => setMode('register')}
          className={`flex-1 pb-3 text-sm font-semibold transition-colors border-b-2 ${
            mode === 'register'
              ? 'border-emerald-500 text-white'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          Daftar Akun
        </button>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-4">
        {mode === 'register' && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Username Unik</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 text-sm">@</span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="yankes-badung"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Nama Tampilan</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="DOKUMEN ARSIP BIDANG YANKES"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@yankes.id"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Kata Sandi</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 6 karakter"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors disabled:opacity-50 mt-2"
        >
          {loading ? 'Memproses...' : mode === 'login' ? 'Masuk ke Dashboard' : 'Buat Akun'}
        </button>
      </form>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-slate-400 text-sm">Memuat formulir...</div>}>
        <AuthForm />
      </Suspense>
    </div>
  );
}
