# DevDocs Hub — Platform Penyedia Dokumentasi Program & API

Aplikasi website fullstack modern untuk penyedia dan pengelola dokumentasi program perangkat lunak, SDK, dan REST API. Dibangun dengan estetika **GitHub / Developer Dashboard utilitarian** (bersih, berfokus pada konten dan kode, bebas dari tampilan generik AI).

---

## Fitur Utama

1. **Dashboard Repositori Dokumentasi (GitHub Aesthetic)**:
   - Manajemen multi-proyek/program dalam satu portal terpusat.
   - Status badge (*Public*, *Internal*, *Beta*), versi (*v2.4.1*), branch (*main*), commit hash, dan statistik.
   - Pencarian dan filter cepat berdasarkan nama program atau tag teknologi.

2. **Modern Documentation Viewer**:
   - **Tree View File Explorer**: Navigasi hierarki folder/kategori dan file artikel dengan badge HTTP method (GET, POST, PUT, DELETE).
   - **GitHub Flavored Markdown**: Tipografi bersih, pemformatan tabel rapi, serta dukungan alert banner resmi GitHub (`[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, `[!CAUTION]`).
   - **Code Blocks Canggih**: Syntax highlighting via PrismJS, nomor baris, header tab file, dan tombol *Copy to Clipboard* dengan konfirmasi instan.
   - **Table of Contents (On this page)**: Navigasi cepat ke judul H2/H3 dengan smooth scrolling.
   - **Navigasi Paginated**: Tombol *Previous* dan *Next* antar artikel.
   - **Feedback Widget**: Umpan balik *"Was this documentation helpful?"*.

3. **Interactive API Playground ("Try It Out")**:
   - Konsol pengujian endpoint API interaktif langsung di halaman dokumentasi.
   - Pengaturan variabel URL path, query parameter, dan HTTP headers secara visual.
   - Editor payload JSON dengan validasi format.
   - Tombol **"Send Request"** yang menjalankan request ke **Mock API Engine bawaan** dan menampilkan status code HTTP (misal `200 OK`), waktu respon (*latency* dalam ms), dan hasil respon JSON terformat.
   - **Multi-Language Code Generator**: Otomatis menghasilkan kode pemanggilan dalam **cURL**, **JavaScript (Fetch)**, **Python (Requests)**, **Go (net/http)**, dan **PHP**.

4. **Documentation Studio (CMS Editor)**:
   - Buat proyek baru atau pilih proyek yang ada.
   - Editor dokumen dua panel (Markdown editor di kiri, *Live Rendered Preview* di kanan).
   - Form builder visual untuk API Endpoint (konfigurasi method, path, headers, query params, request body, dan sample mock response).
   - Simpan perubahan langsung ke database PostgreSQL Neon.
   - Tombol *Reset to Factory Data* untuk mengembalikan data sampel bawaan kapan saja.

5. **Pencarian Global (`Ctrl + K`)**:
   - Dialog pencarian instan lintas seluruh program, panduan teknis, dan rute API.
   - Navigasi penuh menggunakan keyboard (panah atas/bawah, Enter untuk memilih, Esc untuk menutup).

6. **Dark & Light Mode**:
   - Tema gelap berstandar GitHub Dark (`#0d1117`, `#161b22`, border `#30363d`) dan tema terang GitHub Light.

---

## Proyek Dokumentasi Bawaan (Pre-Seeded Showcase)

Aplikasi telah dilengkapi dengan 3 dokumentasi program nyata:
- **PayNusantara Gateway API**: Dokumentasi integrasi pembayaran (QRIS, Virtual Account, Credit Card), autentikasi HMAC SHA256, pembuatan charge, status, refund, dan webhook.
- **NeuroFlow AI Engine SDK**: Panduan integrasi SDK Python & TypeScript untuk model AI, streaming completions, pembuatan dense embeddings, dan vector search index.
- **StoreGrid Warehouse Core**: Arsitektur microservices logistik & pergudangan terdistribusi, pengecekan stok SKU, dan reservasi stok atomik via Redis Redlock.

---

## Menjalankan Aplikasi

Aplikasi berjalan secara fullstack (Frontend Vite di port 3000 dan Backend Express di port 3001) dengan satu perintah:

```bash
# 1. Masuk ke direktori
cd Aplikasi-die

# 2. Salin .env.example menjadi .env, lalu isi DATABASE_URL Neon dan GROQ_API_KEY

# 3. Jalankan server (Frontend + Backend bersamaan)
npm run dev
```

Buka peramban di: **`http://localhost:3000`**

Setelah tes API dijalankan, klik **Jelaskan dengan AI** pada Response Console untuk mendapat kesimpulan dan penjelasan status/response. Fitur ini menggunakan model `openai/gpt-oss-120b` melalui Groq. Isi response akan dikirim ke Groq hanya saat tombol tersebut diklik; jangan analisis response yang memuat data sensitif. API key disimpan di `.env` lokal dan tidak boleh dimasukkan ke kode frontend atau repository.

### Deploy ke Neon dan Vercel

1. Buat database di Neon, lalu salin pooled connection string dari tombol **Connect** ke `DATABASE_URL` di `.env` lokal.
2. Jika ingin membawa data lokal, jalankan `npm run migrate:neon` sebelum aplikasi pertama kali mengakses database. Migrasi hanya berjalan jika database Neon masih kosong. Tanpa migrasi, aplikasi akan mengisi database baru dengan data sampel bawaan.
3. Import repository ke Vercel. Konfigurasi [vercel.json](./vercel.json) membuild frontend Vite, dan `api/index.ts` meneruskan request API ke Express sebagai satu Vercel Function.
4. Di **Vercel Project Settings → Environment Variables**, tambahkan `DATABASE_URL` (pooled connection string Neon) dan `GROQ_API_KEY`. Deploy ulang setelah mengatur environment variables.

Jangan commit `.env` atau connection string. Endpoint CMS, reset data, dan proxy tes saat ini belum memiliki autentikasi; aktifkan proteksi akses Vercel sebelum membuka deployment ke publik.

### Perintah Lainnya:
- `npm run build`: Kompilasi TypeScript dan build produksi Vite.
- `npm run migrate:neon`: Migrasikan isi `server/data/db.json` ke database Neon yang masih kosong.
- `npm run preview`: Pratinjau hasil build produksi.
- `npm run server`: Menjalankan backend API Express saja (port 3001).
- `npm run client`: Menjalankan frontend Vite dev server saja (port 3000).

---

## Struktur Folder

```
Aplikasi-die/
├── server/
│   ├── app.ts            # Express API app, dipakai lokal dan Vercel
│   ├── index.ts          # Local Express server entry point
│   ├── db.ts             # Neon PostgreSQL persistence
│   ├── seed-data.ts      # Data sampel lengkap 3 program dokumentasi
│   └── data/
│       └── db.json       # Sumber migrasi data lokal ke Neon
├── api/
│   └── index.ts          # Vercel Function untuk endpoint API
├── scripts/
│   └── migrate-json-to-neon.ts # Migrasi database lokal ke Neon
├── src/
│   ├── types/
│   │   └── doc.ts        # Definisi TypeScript interface
│   ├── lib/
│   │   └── code-generator.ts # Generator kode cURL, JS, Python, Go, PHP
│   ├── components/
│   │   ├── ThemeContext.tsx      # Dark / Light theme provider
│   │   ├── Navbar.tsx            # Header GitHub style & project selector
│   │   ├── Sidebar.tsx           # Tree view file explorer navigasi
│   │   ├── DocContent.tsx        # Renderer Markdown & GitHub alerts
│   │   ├── CodeBlock.tsx         # Syntax highlighter & copy button
│   │   ├── ApiPlayground.tsx     # Interactive API console & runner
│   │   ├── TableOfContents.tsx   # TOC On this page scroll-spy
│   │   ├── GlobalSearchModal.tsx # Pencarian cepat Ctrl + K
│   │   └── StudioEditor.tsx      # CMS / Studio editor
│   ├── pages/
│   │   └── DashboardPage.tsx     # Dashboard repositori dokumentasi
│   ├── App.tsx                   # Routing & state utama
│   ├── index.css                 # GitHub styling & Tailwind layers
│   └── main.tsx                  # React entry point
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```
