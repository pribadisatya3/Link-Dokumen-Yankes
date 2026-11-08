# YankesTree App (Next.js + Supabase + Tailwind CSS)

Portal arsip bio-link multi-profil dan sub-dokumen berjenjang untuk Bidang Pelayanan Kesehatan (Dinas Kesehatan).

## ✨ Fitur Terbaru:
1. **Multi-User / Profile Switcher:** 1 akun admin dapat membuat dan beralih ke banyak profil URL berbeda langsung di dashboard.
2. **Sub-Dokumen dalam 1 Kartu:** Dokumen utama dapat menampung banyak sub-dokumen arsip (dropdown accordion di halaman publik).
3. **Live Smartphone Mockup:** Preview langsung tampilan HP pengunjung di sisi kanan dashboard editor.
4. **Share Link Khusus:** Salin tautan bio unik akun dengan sekali klik.

## 🚀 Cara Menjalankan:
1. Ekstrak file zip ini.
2. Jalankan skrip `supabase-schema.sql` di SQL Editor Supabase.
3. Pasang environment variables `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` di file `.env.local` dan di Vercel.
4. Jalankan `npm install` lalu `npm run dev`.
