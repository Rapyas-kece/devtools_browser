# 🛡️ Cybersecurity Training Ground - Pilar 3: Web Exploitation
## DevTools Mastery & CTF Challenge (Medium Difficulty)

Laboratorium interaktif berbasis web untuk melatih keterampilan investigasi, analisis keamanan front-end, dan pemanfaatan Chrome / Browser DevTools dalam skenario Capture The Flag (CTF).

---

### 🚀 Live Demo & Hosting
Lab ini dioptimalkan untuk di-host secara instan pada **Vercel** atau platform static hosting lainnya.
* Halaman Utama: `index.html` (otomatis merender lab CTF `03_lab_ctf_devtools_medium.html`)
* Konfigurasi Vercel: [`vercel.json`](./vercel.json)

---

### 🎯 Daftar Tantangan CTF (Level Menengah)

| Stage | Tab DevTools | Nama Tantangan | Konsep Pembelajaran |
| :---: | :---: | :--- | :--- |
| **01** | **Elements & Listeners** | Hijacked Event Listener & Shadowed Data | Menganalisis event listeners (`click`, `submit`), dataset attributes, and anti-inspect evasion |
| **02** | **Console & Memory** | Runtime Memory Shield Monkey-Patching | Membongkar objek terenkripsi di memori global (`window.CryptoShield`) & memanipulasi fungsi validasi secara dinamis |
| **03** | **Sources** | Breakpoint & Ephemeral Variable Vault | Menjinakkan variabel yang melakukan *self-destruct* dengan breakpoint baris kode di `challenge_sources_vault.js` |
| **04** | **Network** | Hidden Recon & Multi-Stage API Exploitation | Menganalisis payload respons telemetri dan menemukan endpoint rahasia supervisor (`api_stage2_privilege.json`) |

---

### 📁 Struktur Berkas

```text
pilar3_web_exploit/
├── index.html                           # Entry point utama (CTF Platform)
├── 01_latihan_inspect.html               # Lab Level 1 - Dasar Inspect Element
├── 02_lab_devtools_mastery.html          # Lab Level 2 - DevTools Deep Dive
├── 03_lab_ctf_devtools_medium.html       # Lab Level 3 - Tantangan CTF Menengah
├── challenge_sources_vault.js           # Skrip eksternal untuk Stage 3 Sources Breakpoint
├── api_telemetry_report.json            # Mock API telemetri publik (Stage 4)
├── api_stage2_privilege.json            # Mock API endpoint rahasia supervisor (Stage 4)
├── api_user_data.json                   # Mock data user untuk Network demo
├── vercel.json                          # Routing & rewrites untuk Vercel
├── PANDUAN_SOLUSI_CTF_DEVTOOLS_SEDANG.md# Walkthrough dan write-up lengkap
└── ROADMAP_DAN_CATATAN_BELAJAR.md      # Catatan konsep & referensi belajar
```

---

### 💻 Menjalankan Secara Lokal

Karena Stage 4 (Tab Network) menggunakan pemanggilan `fetch()` ke berkas JSON lokal, browser memblokir protokol `file:///` demi keamanan (CORS policy). Jalankan lab menggunakan web server lokal:

**Menggunakan VS Code / Extension:**
1. Pasang ekstensi **Live Server**.
2. Klik kanan pada `index.html` $\rightarrow$ **Open with Live Server**.

**Menggunakan Python:**
```bash
python -m http.server 8000
# Buka http://localhost:8000 di browser
```

**Menggunakan Node.js:**
```bash
npx serve .
```

---

### ⚖️ Lisensi & Disclaimer
Proyek ini dibuat untuk tujuan edukasi etikal dan pelatihan keamanan siber (CTF). Segala teknik yang dipelajari ditujukan untuk pertahanan dan analisis sistem sendiri.
