# BioTree App (Next.js + Supabase + Tailwind CSS)

Aplikasi bio-link seperti Linktree yang siap di-deploy ke Vercel dan menggunakan Supabase sebagai database & auth backend.

## 🚀 Cara Menjalankan Secara Lokal

1. **Ekstrak File ZIP** dan buka folder projek di terminal atau VS Code.
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Setup Database Supabase**:
   - Buka SQL Editor di dashboard Supabase Anda.
   - Jalankan seluruh isi file `supabase-schema.sql`.
4. **Setup Environment Variables**:
   - Salin `.env.example` menjadi `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` dengan kredensial Supabase Anda.
5. **Jalankan Mode Pengembangan**:
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3000` di browser Anda.

## 🌐 Deploy ke Vercel

1. Push repository ini ke GitHub.
2. Hubungkan repository di [Vercel](https://vercel.com).
3. Tambahkan environment variables `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` pada pengaturan proyek di Vercel.
4. Klik **Deploy**!
