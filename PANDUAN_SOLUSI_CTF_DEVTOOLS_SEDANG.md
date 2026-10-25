# 🚩 Panduan Solusi & Pembahasan Lengkap: CTF DevTools Medium (5 Tab)

Dokumen ini berisi materi latar belakang, analisis kelemahan, panduan langkah demi langkah (*writeup*), serta solusi mitigasi (*defensive coding*) untuk **Lab 03 - CTF DevTools 5-Tab Mastery** (`03_lab_ctf_devtools_medium.html`).

---

## 📌 DAFTAR ISI
1. [Struktur Lab & Cara Menjalankan](#1-struktur-lab--cara-menjalankan)
2. [Tabel Ringkasan 5 Tantangan CTF](#2-tabel-ringkasan-5-tantangan-ctf)
3. [Writeup Tantangan 1: Tab Elements (DOM Mutation & Shield Bypass)](#3-writeup-tantangan-1-tab-elements-dom-mutation--shield-bypass)
4. [Writeup Tantangan 2: Tab Console (Memory Hooking & Prototype Monkey-Patching)](#4-writeup-tantangan-2-tab-console-memory-hooking--prototype-monkey-patching)
5. [Writeup Tantangan 3: Tab Sources (Breakpoint Sniping & Scope Capture)](#5-writeup-tantangan-3-tab-sources-breakpoint-sniping--scope-capture)
6. [Writeup Tantangan 4: Tab Network (Multi-Stage API Reconnaissance)](#6-writeup-tantangan-4-tab-network-multi-stage-api-reconnaissance)
7. [Writeup Tantangan 5: Tab Application (JWT 'None' Algorithm & Session Forgery)](#7-writeup-tantangan-5-tab-application-jwt-none-algorithm--session-forgery)
8. [Prinsip Pertahanan: Mitigasi Sisi Server (Backend Remediation)](#8-prinsip-pertahanan-mitigasi-sisi-server-backend-remediation)

---

## 1. Struktur Lab & Cara Menjalankan

Lab ini terdiri dari file-file berikut:
* [03_lab_ctf_devtools_medium.html](file:///d:/Cybersecurity_Labs/pilar3_web_exploit/03_lab_ctf_devtools_medium.html): Dashboard utama CTF dengan 5 tab interaktif dan scoreboard.
* [challenge_sources_vault.js](file:///d:/Cybersecurity_Labs/pilar3_web_exploit/challenge_sources_vault.js): Skrip eksternal untuk tantangan Tab Sources (Breakpoint).
* [api_telemetry_report.json](file:///d:/Cybersecurity_Labs/pilar3_web_exploit/api_telemetry_report.json): Mock respon telemetri publik (Stage 1 Network).
* [api_stage2_privilege.json](file:///d:/Cybersecurity_Labs/pilar3_web_exploit/api_stage2_privilege.json): Endpoint rahasia supervisor (Stage 2 Network).

### Cara Menjalankan:
Karena Tantangan 4 menggunakan API `fetch()`, browser menerapkan kebijakan CORS jika dibuka langsung via protokol `file://`. Jalankan melalui local web server:
* **VS Code / Cursor**: Klik kanan file `03_lab_ctf_devtools_medium.html` $\rightarrow$ **Open with Live Server** (`http://127.0.0.1:5500/03_lab_ctf_devtools_medium.html`).
* **Python**: Jalankan di terminal:
  ```bash
  python -m http.server 8000
  ```
  Lalu buka `http://localhost:8000/03_lab_ctf_devtools_medium.html`.

---

## 2. Tabel Ringkasan 5 Tantangan CTF

| No | Tab DevTools | Nama Misi | Konsep Kerentanan | Flag Jawaban |
|:---|:---|:---|:---|:---|
| **1** | **Elements** | Invisible Shield & DOM Integrity | Overlay element trap, custom data attributes tampering, hidden template. | `FLAG{DOM_MUT4T10N_D3V_3L3M3NT5_8819}` |
| **2** | **Console** | Memory Hooking & Monkey-Patching | Obfuscated memory logic, runtime method overriding, hex decoding. | `FLAG{C0NS0L3_M0NK3Y_P4TCH_PR0T0_3371}` |
| **3** | **Sources** | The Ephemeral Race (Breakpoint) | Fast-destructing memory routine (50ms lifetime), Scope inspection. | `FLAG{S0URC3S_BR34KP01NT_SC0P3_C4PTUR3_5521}` |
| **4** | **Network** | Multi-Stage API Recon | Information disclosure in raw HTTP response, hidden internal routing. | `FLAG{N3TW0RK_TR4FF1C_4P1_D1SC0V3RY_7742}` |
| **5** | **Application**| JWT 'None' Algorithm & Forgery | Insecure client-side session storage, algorithmic downgrade attack. | `FLAG{JWT_N0N3_4LG_ST0R4G3_F0RG3RY_9904}` |

---

## 3. Writeup Tantangan 1: Tab Elements (DOM Mutation & Shield Bypass)

### Analisis Masalah:
Sistem brankas *Citadel-Zero* mencoba mencegah klik menggunakan 3 lapis perlindungan DOM:
1. Elemen pembungkus transparan `#citadel-overlay-blocker` di atas tombol dengan `cursor: not-allowed` dan `z-index: 50`.
2. Atribut tombol `disabled=""`.
3. Validasi JavaScript memeriksa integritas atribut HTML:
   ```javascript
   btn.getAttribute('data-clearance') === '1337'
   btn.getAttribute('data-auth-hash') === 'SUPERVISOR_BYPASS'
   ```
4. Bagian salt flag berada di tag template: `<template id="citadel-secrets" data-salt="D3V_3L3M3NT5_8819">`.

### Langkah Eksploitasi:
1. Buka DevTools (`F12`), pilih tab **Elements** (atau tekan `Ctrl + Shift + C` lalu klik area tombol).
2. Cari elemen:
   ```html
   <div id="citadel-overlay-blocker">...</div>
   ```
   Klik kanan $\rightarrow$ **Delete element** (atau tekan tombol `Delete` di keyboard).
3. Cari tag tombol di bawahnya:
   ```html
   <button id="btn-citadel-claim" class="btn btn-primary" disabled data-clearance="0" data-auth-hash="unverified" ...>
   ```
4. Lakukan 3 perubahan pada tag button tersebut:
   * Hapus kata `disabled`.
   * Ubah `data-clearance="0"` menjadi `data-clearance="1337"`.
   * Ubah `data-auth-hash="unverified"` menjadi `data-auth-hash="SUPERVISOR_BYPASS"`.
5. Klik tombol yang sekarang aktif.
6. **Flag didapatkan**: `FLAG{DOM_MUT4T10N_D3V_3L3M3NT5_8819}`. Salin dan submit ke form input flag.

---

## 4. Writeup Tantangan 2: Tab Console (Memory Hooking & Prototype Monkey-Patching)

### Analisis Masalah:
Objek `window.CryptoShield` dimuat di memori browser. Ketika fungsi `deobfuscateVault()` dipanggil, fungsi tersebut terlebih dahulu memeriksa:
```javascript
if (!this.isMasterKeyValid()) {
  return "DENIED";
}
```
Karena `isMasterKeyValid()` dibuat *hardcoded* mengembalikan `false`, panggilan normal akan selalu ditolak. String flag disimpan dalam bentuk hex di `_entropyPool`.

### Langkah Eksploitasi (Metode Monkey-Patching):
1. Buka tab **Console** di DevTools (`F12` $\rightarrow$ Console).
2. Periksa objek `CryptoShield` dengan mengetik:
   ```javascript
   CryptoShield
   ```
3. Lakukan **Monkey-Patching** (menimpa fungsi di memori saat runtime):
   ```javascript
   CryptoShield.isMasterKeyValid = function() { return true; };
   ```
4. Panggil metode dekripsi:
   ```javascript
   CryptoShield.deobfuscateVault();
   ```
   *(Atau klik tombol "Jalankan Validasi Memori" pada tampilan web).*
5. Konsol akan mencetak pesan sukses dan memunculkan flag.
6. **Flag didapatkan**: `FLAG{C0NS0L3_M0NK3Y_P4TCH_PR0T0_3371}`.

---

## 5. Writeup Tantangan 3: Tab Sources (Breakpoint Sniping & Scope Capture)

### Analisis Masalah:
Di dunia nyata, banyak skrip keamanan atau malware yang menggunakan teknik *anti-tampering* berupa *self-destructing variables*. Pada file `challenge_sources_vault.js`:
```javascript
let ephemeralClearanceFlag = `FLAG{...}`;
setTimeout(() => {
  ephemeralClearanceFlag = null; // Dihapus dalam 50 milidetik!
}, 50);
```
Mencoba membaca nilai setelah tombol ditekan akan selalu menghasilkan `null`.

### Langkah Eksploitasi (Breakpoint):
1. Buka tab **Sources** (`F12` $\rightarrow$ Sources).
2. Pada panel navigasi file di sebelah kiri (di bawah folder domain atau halaman), klik file [challenge_sources_vault.js](file:///d:/Cybersecurity_Labs/pilar3_web_exploit/challenge_sources_vault.js).
3. Cari baris ke-24:
   ```javascript
   let ephemeralClearanceFlag = `FLAG{${seedA}_${seedB}_${seedC}_${seedD}}`;
   ```
4. Klik pada nomor baris **24** atau **25** (sebelum `setTimeout`) untuk membuat tanda **Breakpoint** berwarna biru.
5. Kembali ke halaman browser, lalu klik tombol **"⏱️ Generate Key di Memori"**.
6. Browser akan seketika membeku dengan status **"Paused in debugger"**.
7. Lihat panel kanan pada accordion **Scope $\rightarrow$ Local**:
   * Amati variabel `ephemeralClearanceFlag`.
   * Atau arahkan kursor mouse ke teks variabel tersebut.
   * Atau buka tab **Console** (saat paused) dan ketik `ephemeralClearanceFlag`.
8. Tekan tombol **Resume** (`F8` / panah biru) untuk melanjutkan eksekusi browser.
9. **Flag didapatkan**: `FLAG{S0URC3S_BR34KP01NT_SC0P3_C4PTUR3_5521}`.

---

## 6. Writeup Tantangan 4: Tab Network (Multi-Stage API Reconnaissance)

### Analisis Masalah:
Aplikasi frontend sering kali melakukan panggilan AJAX/Fetch ke backend. Banyak pengembang berasumsi: *"Jika data tidak ditampilkan di UI HTML, pengguna tidak akan tahu."* Ini adalah asumsi keliru yang sering menyebabkan kebocoran informasi (*Information Disclosure*).

### Langkah Eksploitasi:
1. Buka tab **Network** (`F12` $\rightarrow$ Network).
2. Pastikan tombol rekam (lingkaran merah di kiri atas tab Network) aktif.
3. Klik tombol **"📡 Tarik Data Telemetri Server (Stage 1)"**.
4. Di daftar log Network, muncul request bernama `api_telemetry_report.json`.
5. Klik nama request tersebut, lalu pilih sub-tab **Response** (atau **Preview**).
6. Perhatikan isi JSON:
   ```json
   "diagnostics": {
     "notice": "Normal users only see basic telemetry...",
     "internal_routing_hint": "Endpoint berikutnya untuk otorisasi supervisor ada di:",
     "next_stage_url": "./api_stage2_privilege.json"
   }
   ```
7. Ambil nilai rute rahasia: `./api_stage2_privilege.json`.
8. Masukkan ke dalam kolom *"Masukkan Rute Endpoint Rahasia"* pada halaman lab, lalu klik **Kirim Request**.
   *(Atau buka langsung file tersebut di browser).*
9. Amati respon file tahap kedua yang membocorkan payload supervisor:
   ```json
   "privileged_payload": {
     "ctf_flag": "FLAG{N3TW0RK_TR4FF1C_4P1_D1SC0V3RY_7742}"
   }
   ```
10. **Flag didapatkan**: `FLAG{N3TW0RK_TR4FF1C_4P1_D1SC0V3RY_7742}`.

---

## 7. Writeup Tantangan 5: Tab Application (JWT 'None' Algorithm & Session Forgery)

### Analisis Masalah:
Aplikasi menyimpan token otentikasi di `sessionStorage` dengan nama `auth_bearer_token`. Format token adalah JSON Web Token (JWT) yang terdiri dari 3 bagian:
`Header.Payload.Signature`

Kelemahan kritis: Parser JWT client-side memiliki kerentanan klasik **Algoritma 'none' (CVE-2015-9235 pattern)** di mana jika header disetel ke `"alg": "none"`, sistem tidak memverifikasi tanda tangan kriptografis (*signature*) sama sekali!

### Langkah Eksploitasi:
1. Buka tab **Application** (`F12` $\rightarrow$ Application $\rightarrow$ Storage $\rightarrow$ **Session Storage** $\rightarrow$ pilih URL web).
2. Temukan key `auth_bearer_token`. Nilai default:
   ```text
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiZ3Vlc3RfdXNlciIsInJvbGUiOiJndWVzdCIsImlhdCI6MTY5ODIwMDAwMH0.dummy_signature_hash_secure
   ```
3. Dekode bagian Header dan Payload:
   * Header: `{"alg":"HS256","typ":"JWT"}`
   * Payload: `{"user":"guest_user","role":"guest","iat":1698200000}`
4. Modifikasi kedua objek tersebut:
   * Ubah header menjadi algoritma none:
     ```json
     {"alg":"none","typ":"JWT"}
     ```
   * Ubah role menjadi admin:
     ```json
     {"user":"guest_user","role":"admin","iat":1698200000}
     ```
5. Encode kembali ke Base64 (dapat dijalankan langsung di tab Console):
   ```javascript
   const newHeader = btoa(JSON.stringify({"alg":"none","typ":"JWT"}));
   const newPayload = btoa(JSON.stringify({"user":"guest_user","role":"admin","iat":1698200000}));
   const forgedToken = `${newHeader}.${newPayload}.`;
   console.log(forgedToken);
   // Hasil: eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VyIjoiZ3Vlc3RfdXNlciIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY5ODIwMDAwMH0.
   ```
   *(Catatan: Token tanpa signature diakhiri dengan tanda titik `.`)*
6. Di tab **Application**, klik dua kali pada nilai `auth_bearer_token` dan paste token baru tersebut.
7. Kembali ke halaman lab dan klik tombol **"🔑 Verifikasi Tiket Sesi JWT"**.
8. **Flag didapatkan**: `FLAG{JWT_N0N3_4LG_ST0R4G3_F0RG3RY_9904}`.

---

## 8. Prinsip Pertahanan: Mitigasi Sisi Server (Backend Remediation)

Bagaimana cara tim keamanan mencegah kelima celah ini di lingkungan produksi?

```mermaid
flowchart TD
    subgraph ClientSide ["❌ Sisi Client (Tidak Dapat Dipercaya)"]
        C1["DOM Atribut: data-clearance"]
        C2["Memori JS: isMasterKeyValid()"]
        C3["SessionStorage: auth_bearer_token"]
    end

    subgraph ServerSide ["✅ Sisi Server (Pertahanan Mutlak)"]
        S1["Validasi Database / Session Server"]
        S2["Tolak JWT Algoritma 'none' Secara Tegas"]
        S3["Kriptografi HMAC SHA256 / RSA dengan Secret Key"]
        S4["Data Filtering: Kirim Hanya Data yang Dibutuhkan UI"]
    end

    ClientSide -- "Kirim Request" --> ServerSide
```

1. **Anti DOM Tampering (Tantangan 1)**:
   * Jangan simpan level hak akses (`data-clearance`) di atribut HTML frontend.
   * Hak akses pengguna harus divalidasi langsung oleh server dari sesi database pengguna di backend.
2. **Anti Memory Tampering (Tantangan 2 & 3)**:
   * Logika otorisasi penting tidak boleh dihitung di JavaScript browser.
   * Semua keputusan krusial (seperti validasi lisensi atau pembayaran) wajib terjadi via API call ke backend.
3. **Anti Information Disclosure (Tantangan 4)**:
   * Terapkan prinsip *Data Minimization*: serialiser API hanya boleh mengembalikan properti yang diizinkan untuk role pengguna saat itu.
   * Pisahkan endpoint diagnostik/admin ke jaringan internal atau lindungi dengan middleware autentikasi ketat.
4. **Anti JWT Forgery (Tantangan 5)**:
   * Konfigurasikan library JWT server untuk **menolak secara mutlak** algoritma `"none"`.
   * Simpan token sensitif dalam cookie bertanda `HttpOnly`, `Secure`, dan `SameSite=Strict` agar tidak dapat diakses atau dimodifikasi oleh skrip client.
