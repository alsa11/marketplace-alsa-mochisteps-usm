# Perbaikan Bug Blank Layar Print & Penambahan Riwayat Transaksi POS Mochi Steps

Rencana implementasi ini menyelesaikan tuntas masalah layar blank putih saat transaksi kasir, menambahkan tab terintegrasi Riwayat Transaksi langsung di POS Kasir dengan data real-time Firestore, serta menyempurnakan alur cetak struk thermal yang aman dan bebas blank screen.

### User Review & Critical Decisions

> [!IMPORTANT]
> Berdasarkan konfirmasi pertanyaan pada Tahap 1, keputusan desain dan alur yang telah disepakati:
> - **Penempatan Riwayat Transaksi**: Tab terintegrasi langsung di dalam POS Kasir (berdampingan antara menu *Terminal Kasir* dan *Riwayat Transaksi*).
> - **Alur Cetak Struk**: Setelah pembayaran selesai, sistem membuka modal struk thermal terlebih dahulu untuk preview detail, kemudian kasir menekan tombol "Cetak Struk" (58mm / 80mm). Alur ini mencegah browser/iframe AI Studio terkunci dalam status blank print otomatis.

---

### 1. Overview & Core Concept

- **Akar Penyebab Layar Blank Putih**:
  1. *Eksekusi Otomatis `window.print()` di Lingkungan iFrame*: Pemanggilan print dialog otomatis seketika setelah checkout memicu pembatasan security sandbox pada iframe preview AI Studio, menyebabkan browser menahan rendering `#root` dan menampilkan halaman putih kosong.
  2. *CSS `@media print` yang Terlalu Agresif*: Rule `#root { display: none !important; }` yang tereksekusi saat print trigger dapat tertinggal jika event `afterprint` diblokir oleh browser di dalam iframe.
  3. *Ketiadaan Proteksi Keranjang Kosong (Rp 0)*: Tombol menampilkan "Bayar & Cetak Struk (Rp 0)" tanpa validasi interaktif yang memandu kasir untuk memilih produk terlebih dahulu jika keranjang masih kosong.
  4. *Ketiadaan Riwayat Transaksi di POS*: Kasir tidak dapat memverifikasi apakah transaksi yang baru saja diproses sudah masuk ke database atau belum.

- **Solusi yang Diterapkan**:
  1. **Tab Terintegrasi "Riwayat Transaksi POS"**: Menghadirkan tampilan riwayat transaksi penjualan kasir offline toko Solo secara real-time dari Firestore, lengkap dengan filter pencarian, ringkasan omzet kasir hari ini, dan tombol 1-klik untuk cetak ulang struk.
  2. **Alur Struk Berbasis Preview & Safe-Print**: Setelah bayar berhasil, struk transaksi langsung muncul di modal dialog yang rapi dan terisolasi. Tombol cetak struk didesain khusus agar print preview browser hanya menampilkan struk thermal tanpa mematikan atau mengosongkan layar aplikasi utama.
  3. **Validasi Interaktif Keranjang Kasir**: Memberikan peringatan visual yang jelas jika kasir belum memasukkan produk (mencegah klik pada transaksi kosong/Rp 0).

---

### 2. User Experience & Visual Design

- **Navigasi Tab Segmented di Header POS**:
  - `[🛒 Terminal Kasir]` dan `[📋 Riwayat Transaksi (Live)]`.
  - Dilengkapi badge jumlah transaksi hari ini dan indikator aktif yang kontras.
- **Tampilan Riwayat Transaksi POS**:
  - **Statistik Cepat Penjualan Kasir**: Kartu ringkas total transaksi kasir hari ini, total omzet POS, dan rata-rata transaksi.
  - **Fitur Pencarian & Filter**: Pencarian cepat berdasarkan nomor struk (`RCP-...`), nomor order (`POS-...`), nama pelanggan, atau nama kasir.
  - **Tabel Transaksi Interaktif**:
    - Nomor struk, tanggal & jam, nama pelanggan, kasir bertugas.
    - Daftar sepatu yang dibeli (nama model, ukuran, qty).
    - Metode pembayaran (Tunai, QRIS, Debit EDC) dengan badge warna yang jelas.
    - Total bayar dan kembalian.
  - **Aksi Cepat pada Setiap Baris**:
    - Tombol `[🖨️ Cetak Ulang Struk]`: Membuka modal cetak thermal 58mm/80mm instan.
    - Tombol `[📲 Kirim WhatsApp]`: Membagikan rincian struk ke nomor WhatsApp pelanggan.
- **Modal Struk Thermal Bebas Blank**:
  - Menampilkan struk fisik bergaya monospaced (`Courier New`) yang tajam.
  - Ukuran kertas thermal 58mm Compact dan 80mm Standar yang dapat dialihkan dengan tanda centang aktif.
  - Tombol aksi jelas: `Cetak Struk`, `Salin Teks Struk`, `Kirim WA`, dan `+ Transaksi Baru`.

---

### 3. Key Product Decisions & Trade-Offs

- **Keputusan 1: Tab Terintegrasi vs Modal Terpisah**:
  - *Pendekatan*: Menambahkan tab navigasi langsung di dalam POS Kasir.
  - *Alasan*: Kasir di toko fisik memerlukan akses cepat bolak-balik antara melayani antrean pembeli baru dan mengecek transaksi yang baru saja lewat tanpa harus bolak-balik ke dashboard admin utama.
- **Keputusan 2: Modal Preview Dulu vs Auto-Print**:
  - *Pendekatan*: Buka modal struk dulu, kasir menekan tombol "Cetak Struk".
  - *Alasan*: Mencegah dialog browser memblokir atau membekukan iframe preview AI Studio menjadi blank screen. Memberi kasir kesempatan memilih ukuran kertas (58mm/80mm) atau langsung membagikan via WhatsApp tanpa wajib mencetak fisik.
- **Keputusan 3: Safe-Print Isolation**:
  - *Pendekatan*: Menjaga `#root` tetap stabil dan hanya mengisolasi cetakan pada saat dialog print aktif, dengan timeout fallback yang langsung mengembalikan tampilan website jika browser print ditutup.

---

### 4. Technical Architecture & Data Strategy

```
┌──────────────────────────────────────────────────────────────┐
│                    POS KASIR COMPONENT                       │
│                                                              │
│  Header: [🛒 Terminal Kasir]  |  [📋 Riwayat Transaksi (N)]  │
└──────────────┬───────────────────────────────┬───────────────┘
               │                               │
        (Active Tab: POS)             (Active Tab: History)
               │                               │
┌──────────────▼───────────────┐┌──────────────▼───────────────┐
│     TERMINAL TRANSAKSI       ││      RIWAYAT TRANSAKSI       │
│ - Katalog & Quick Size Picker││ - Ringkasan Omzet Hari Ini   │
│ - Keranjang Kasir & Diskon   ││ - Filter Search & Tanggal    │
│ - Pilihan Metode Bayar Aktif ││ - List Order POS Firestore   │
│ - [Bayar & Cetak Struk]      ││ - [Cetak Ulang] / [Kirim WA] │
└──────────────┬───────────────┘└──────────────┬───────────────┘
               │                               │
               └───────────────┬───────────────┘
                               │
                ┌──────────────▼──────────────┐
                │   MODAL PREVIEW STRUK POS   │
                │ - Kertas 58mm / 80mm Switch │
                │ - Monospace Thermal Layout  │
                │ - Tombol [Cetak Struk]      │
                └──────────────┬──────────────┘
                               │ (Safe Print Trigger)
                ┌──────────────▼──────────────┐
                │   #thermal-print-container  │
                │  (Hanya Struk yang Tercetak)│
                └─────────────────────────────┘
```

- **Sinkronisasi Data Real-Time**:
  - Menggunakan data `orders` dari Firestore (filter `channel === 'pos'` atau semua transaksi POS).
  - Saat transaksi kasir baru berhasil dibuat (`createPosTransaction`), riwayat transaksi otomatis ter-update seketika tanpa refresh.
- **Penanganan Cetak Aman (Safe Thermal Printing)**:
  - Validasi bahwa data transaksi terisi lengkap sebelum dialog cetak dipanggil.
  - Penghapusan class printing otomatis sehingga seluruh antarmuka kembali normal segera setelah jendela cetak selesai.
