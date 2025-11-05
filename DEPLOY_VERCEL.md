# 🚀 Cara Deploy ke Vercel

## Langkah-Langkah Deploy

### 1️⃣ Install Dependencies Baru

Jalankan di terminal:

```bash
npm install
```

Ini akan menginstall `@astrojs/vercel` yang diperlukan untuk deploy ke Vercel.

---

### 2️⃣ Test Build Lokal

Sebelum deploy, pastikan build berhasil:

```bash
npm run build
```

Jika berhasil, akan muncul folder `dist/` dengan file build.

---

### 3️⃣ Setup Environment Variables di Vercel

Sebelum deploy, Anda **HARUS** set environment variables di Vercel:

1. Buka dashboard Vercel
2. Pilih project Anda
3. Klik **Settings** → **Environment Variables**
4. Tambahkan variable ini:

```
PUBLIC_SUPABASE_URL=https://ezxhazoknvjeytyibdyu.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6eGhhem9rbnZqZXl0eWliZHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4OTcxMTIsImV4cCI6MjA3NzQ3MzExMn0.xWd0oxVG_8Xlw65rGwfcJxt_0LrDvBSBqHJb6dXVyVM
```

⚠️ **PENTING**: Tanpa environment variables, dashboard tidak bisa connect ke Supabase!

---

### 4️⃣ Deploy ke Vercel

#### Opsi A: Via Vercel CLI (Recommended)

```bash
# Install Vercel CLI jika belum
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy production
vercel --prod
```

#### Opsi B: Via Git (Push to GitHub)

1. Push code ke GitHub repository
2. Import project di Vercel dashboard
3. Vercel akan auto-detect Astro project
4. Pastikan environment variables sudah diset
5. Klik **Deploy**

#### Opsi C: Via Vercel Dashboard (Drag & Drop)

1. Build dulu: `npm run build`
2. Buka Vercel dashboard
3. Upload folder `dist/` atau seluruh project
4. Set environment variables
5. Deploy

---

### 5️⃣ Verifikasi Deployment

Setelah deploy berhasil:

1. Buka URL Vercel (contoh: `https://nutriscan-dashboard.vercel.app`)
2. Test login dengan akun admin
3. Pastikan:
   - ✅ Login berhasil
   - ✅ Dashboard bisa load data
   - ✅ Navigasi menu berfungsi
   - ✅ Cookies tersimpan (session persist)

---

## 🔧 Troubleshooting

### ❌ Error 404 setelah deploy

**Penyebab**: Adapter salah atau routing tidak dikenali

**Solusi**:
```bash
# Pastikan sudah install adapter Vercel
npm install @astrojs/vercel

# Rebuild
npm run build

# Deploy ulang
vercel --prod
```

---

### ❌ Error "Missing environment variables"

**Penyebab**: Environment variables belum diset di Vercel

**Solusi**:
1. Buka Vercel Dashboard → Settings → Environment Variables
2. Tambahkan `PUBLIC_SUPABASE_URL` dan `PUBLIC_SUPABASE_ANON_KEY`
3. Redeploy

---

### ❌ Login tidak berfungsi / Session hilang

**Penyebab**: Cookies tidak tersimpan di Vercel

**Solusi**:
1. Pastikan `output: 'server'` di `astro.config.mjs`
2. Pastikan adapter Vercel sudah terpasang
3. Cek domain di Supabase → Authentication → URL Configuration
4. Tambahkan domain Vercel ke **Site URL** dan **Redirect URLs**

---

### ❌ Supabase connection error

**Penyebab**: Environment variables tidak terbaca

**Solusi**:
```javascript
// Cek di browser console apakah env terbaca
console.log(import.meta.env.PUBLIC_SUPABASE_URL);
```

Jika `undefined`, berarti env variables tidak diset dengan benar di Vercel.

---

## 📋 Checklist Sebelum Deploy

- [ ] `npm install` berhasil
- [ ] `npm run build` berhasil tanpa error
- [ ] File `.env` ada (untuk local dev)
- [ ] Environment variables sudah diset di Vercel
- [ ] Adapter `@astrojs/vercel` sudah terinstall
- [ ] `astro.config.mjs` sudah menggunakan Vercel adapter
- [ ] Domain Vercel sudah ditambahkan di Supabase Auth settings

---

## 🎯 Hasil Akhir

Setelah deploy berhasil, Anda akan punya:

- ✅ Dashboard live di URL Vercel
- ✅ SSR (Server-Side Rendering) aktif
- ✅ Authentication dengan Supabase berfungsi
- ✅ Session management dengan cookies
- ✅ Auto-deploy setiap kali push ke GitHub

---

## 💡 Tips Tambahan

1. **Custom Domain**: Bisa tambahkan custom domain di Vercel settings
2. **Auto Deploy**: Connect ke GitHub untuk auto-deploy on push
3. **Analytics**: Vercel Web Analytics sudah enabled di config
4. **Logs**: Cek Vercel logs jika ada error

---

## 🆘 Butuh Bantuan?

Jika masih error, cek:
1. Vercel deployment logs
2. Browser console untuk error JavaScript
3. Network tab untuk failed requests

Atau kirim screenshot error untuk troubleshooting lebih lanjut! 🚀
