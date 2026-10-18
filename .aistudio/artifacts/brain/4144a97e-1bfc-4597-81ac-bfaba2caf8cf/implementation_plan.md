# Cetak Biru Pengembangan E-Commerce Mochi Steps Siap Bisnis Jangka Panjang

Rencana komprehensif ini mentransformasikan toko online Mochi Steps menjadi platform e-commerce siap pakai untuk bisnis nyata dan dapat dipelihara dalam jangka panjang, mencakup 12 pilar utama mulai dari verifikasi pembayaran asli, sinkronisasi stok varian, manajemen kurir/resi, pengaturan toko live Firestore, voucher promosi, wishlist persisten, ulasan terverifikasi, retur beraturan aman, hingga dashboard analitik margin profit riil.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Keputusan arsitektur dan bisnis telah dikonfirmasi melalui klarifikasi:

- **Cakupan & Prioritas**: Menjalankan seluruh pengembangan modul secara bertahap dan menyeluruh (*all modules ready for long-term production*).
- **Pengaturan Toko & Kebijakan**: Disimpan pada dokumen Firestore khusus (`settings/store`) yang disinkronkan secara real-time ke antarmuka webstore pelanggan (nama toko, kontak CS WhatsApp, banner promo, rekening bank, ongkir, syarat & ketentuan, serta kebijakan privasi & retur).
- **Integritas Pengembalian Stok pada Retur**: Stok varian sepatu **hanya akan dipulihkan ke etalase toko setelah barang fisik retur diterima dan diverifikasi/disetujui oleh admin**, mencegah manipulasi stok atau barang fiktif.
- **Pemberian Ulasan Produk**: Dibatasi hanya untuk pelanggan yang memiliki pesanan selesai (*Selesai*), mencegah review palsu/dummy.
- **Perhitungan Finansial Nyata**: Membedakan secara tegas antara Omzet Kotor (GMV), Pendapatan Bersih (Net Revenue), HPP Modal Sepatu (COGS), Biaya Pengiriman, Diskon Promosi, dan Laba Bersih (Net Profit).

---

## 1. Overview & Core Concept

- **Tujuan Utama**: Meningkatkan kapabilitas teknis dan operasional toko Mochi Steps dari prototipe fungsional menjadi sistem e-commerce enterprise yang kokoh, terhindar dari bug race-condition, aman dari manipulasi data sisi klien, dan mudah dikelola sehari-hari oleh tim admin maupun kasir toko fisik.
- **Target Persona**:
  1. *Pelanggan*: Pengalaman belanja mulus, katalog transparan per ukuran, keranjang & wishlist tersimpan, pelacakan pengiriman jelas, instruksi pembayaran rapi, dan fasilitas retur terstruktur.
  2. *Administrator & Toko*: Dashboard kendali terpusat untuk approval transfer asli, cetak resi kurir, konfigurasi voucher, moderasi ulasan, pengaturan identitas toko, dan laporan laba bersih berbasis data aktual.
- **Nilai Bisnis**: Operasi bebas selisih stok (zero stock discrepancy), pencatatan audit trail yang lengkap, dan kepatuhan penuh terhadap standar e-commerce Indonesia.

---

## 2. User Experience & Visual Design

### A. Alur Antarmuka Pelanggan (Customer Experience)
1. **Katalog & Detail Produk Berbasis Varian**:
   - Pilihan ukuran (EU 36–41) menampilkan ketersediaan stok riil secara dinamis; ukuran habis ditandai dengan jelas dan tidak dapat dipilih.
   - Tombol Wishlist (ikon hati) memungkinkan pelanggan menyimpan produk favorit dengan status tersimpan persisten di browser/akun.
   - Bagian Ulasan Pembeli menyajikan rating bintang, ulasan tekstual, tanggal, dan foto pemakaian dari pembeli yang telah terverifikasi.
2. **Keranjang Belanja & Checkout Aman**:
   - Keranjang otomatis tersimpan di `localStorage` dan tervalidasi ulang sebelum checkout dibuka.
   - Kolom Kode Voucher dengan validasi langsung (potongan harga transparan, batas minimal belanja, dan masa berlaku).
   - Opsi pembayaran transfer bank & QRIS dilengkapi instruksi jelas, nomor rekening resmi toko, dan form unggah foto slip transfer asli.
3. **Pelacakan Pesanan & Pengajuan Retur Mandiri**:
   - Tab status pesanan menunjukkan riwayat pergerakan pesanan (*Menunggu Pembayaran* $\to$ *Disetujui* $\to$ *Dikemas* $\to$ *Dikirim [No. Resi & Kurir]* $\to$ *Selesai*).
   - Pada pesanan yang berstatus *Selesai*, muncul tombol **Ajukan Retur / Tukar Ukuran** dengan formulir alasan, foto barang fisik, dan pilihan solusi (ganti ukuran / pengembalian dana).

### B. Alur Antarmuka Administrator (Admin Panel Suite)
1. **Tab 1: Dashboard Analitik**:
   - Metrik utama: Total Omzet, Total Laba Bersih, Pesanan Menunggu Approval, Produk Terlaris, dan Peringatan Stok Menipis ($\le 5$ pasang).
   - Grafik riil tren penjualan harian dan bulanan dengan pemisah biaya modal (HPP) vs margin profit.
2. **Tab 2: Katalog Produk & Manajemen Varian**:
   - Pengaturan SKU, harga jual, harga modal (HPP), dan pembagian stok presisi per ukuran 36–41.
3. **Tab 3: Approval Pembayaran Asli**:
   - Pratinjau foto bukti pembayaran yang diunggah pelanggan, nominal transfer, rekening tujuan, dan opsi: **Setujui** atau **Tolak (dengan pilihan alasan valid)**.
4. **Tab 4: Manajemen Pesanan & Pengiriman Kurir**:
   - Input kurir (J&T, SiCepat, JNE, POS, GoSend), nomor resi pengiriman, ongkos kirim aktual, dan tanggal pengiriman.
5. **Tab 5: Pengaturan Toko Live**:
   - Formulir pengubahan profil toko, jam operasional, alamat fisik, kontak CS, nomor rekening bank, dan teks kebijakan retur/privasi yang langsung tersinkron ke webstore.
6. **Tab 6: Manajemen Voucher & Promosi**:
   - Pembuatan kode voucher (diskon % atau nominal Rp), masa berlaku, minimal transaksi, dan kuota pemakaian.
7. **Tab 7: Moderasi Ulasan & Pengajuan Retur**:
   - Panel persetujuan ulasan pembeli dan audit pengajuan retur/tukar ukuran (status: *Menunggu Pemeriksaan*, *Barang Diterima*, *Disetujui & Stok Dipulihkan*, atau *Ditolak*).
8. **Tab 8: Backup & Pemeliharaan Database**:
   - Tombol ekspor data transaksi (JSON/CSV) untuk arsip cadangan berkala pemilik toko.

---

## 3. Key Product Decisions & Trade-Offs

- **Keputusan 1: Penyimpanan Pengaturan Toko di Koleksi Firestore `settings/store`**
  - *Pendekatan*: Dokumen tunggal di Firestore yang dimuat saat webstore diinisialisasi dan di-*cache* secara lokal.
  - *Alasan*: Perubahan nomor rekening, promo banner, atau kebijakan toko langsung terlihat oleh seluruh pelanggan secara real-time tanpa perlu deployment ulang kode.
  - *Alternatif*: Hardcoded di komponen React ditolak karena tidak fleksibel bagi pemilik toko.
- **Keputusan 2: Validasi Transaksi & Stok dengan Firestore Transaction Locking**
  - *Pendekatan*: Seluruh pengurangan stok saat checkout menggunakan `runTransaction` Firestore sehingga transaksi bersifat atomik.
  - *Alasan*: Menjamin tidak ada *race condition* jika dua pelanggan memesan ukuran sepatu terakhir secara bersamaan.
- **Keputusan 3: Penanganan Retur Dua Tahap (*Two-Phase Return Approval*)**
  - *Pendekatan*: Pelanggan mengajukan retur $\to$ status berubah menjadi `Menunggu Pengiriman Fisik` $\to$ Admin menerima barang fisik $\to$ Admin menekan `Terima & Pulihkan Stok`.
  - *Alasan*: Melindungi modal toko dari manipulasi di mana stok bertambah padahal barang fisik belum kembali.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                         STORE DATA ARCHITECTURE                        │
└────────────────────────────────────────────────────────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│  Firestore DB    │       │  Firestore DB    │       │  Firestore DB    │
│  /products       │       │  /orders         │       │  /settings/store │
│  - sizeStock     │       │  - paymentProof  │       │  - bankAccounts  │
│  - costPrice     │       │  - trackingInfo  │       │  - shippingRules │
│  - minStock      │       │  - voucherCode   │       │  - policies      │
└────────┬─────────┘       └────────┬─────────┘       └────────┬─────────┘
         │                          │                          │
         ▼                          ▼                          ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│  Firestore DB    │       │  Firestore DB    │       │  Firestore DB    │
│  /vouchers       │       │  /reviews        │       │  /returns        │
│  - discountType  │       │  - orderId       │       │  - originalOrder │
│  - minSpend      │       │  - rating & photo│       │  - physicalStatus│
│  - usageLimit    │       │  - isApproved    │       │  - stockRestored │
└──────────────────┘       └──────────────────┘       └──────────────────┘
```

### Rincian Eksekusi Modul (Task Breakdown):
1. **Audit & Hardening Verifikasi Pembayaran & Stok**:
   - Memastikan bukti bayar tersimpan sebagai URL valid di Firestore.
   - Menambahkan audit log admin pada setiap persetujuan/penolakan pembayaran.
2. **Modul Pengaturan Toko Live**:
   - Membuat model data `StoreSettings` di `src/types/index.ts`.
   - Menambahkan fungsi `subscribeToStoreSettings` dan `updateStoreSettings` di `src/lib/firestoreService.ts`.
   - Mengintegrasikan form konfigurasi toko di Admin Panel dan menyambungkannya ke komponen Navbar, Footer, CheckoutModal, dan InsoleGuideModal.
3. **Modul Voucher & Diskon**:
   - Menambahkan struktur data voucher di Firestore (`vouchers`).
   - Implementasi input voucher di `CheckoutModal.tsx` dengan kalkulasi diskon otomatis dan validasi batas pemakaian.
   - Manajemen pembuatan voucher di Admin Portal.
4. **Modul Pengiriman & Riwayat Status**:
   - Menambahkan input kurir, nomor resi pengiriman, dan tanggal pengiriman pada modal detail pesanan Admin.
   - Timeline pelacakan pesanan di `OrderTrackingModal.tsx` berbasis nomor resi riil.
5. **Modul Wishlist & Keranjang Persisten**:
   - Tombol toggle wishlist di kartu produk dan modal detail produk dengan penyimpanan `localStorage`.
   - Drawer khusus daftar Wishlist untuk memudahkan pelanggan memindahkan produk favorit ke keranjang belanja.
6. **Modul Ulasan Produk (Verified Buyer Reviews)**:
   - Form ulasan berbintang di modal pelacakan pesanan untuk pesanan yang telah selesai.
   - Tab moderasi ulasan di Admin Portal sebelum ulasan tampil di halaman produk.
7. **Modul Retur & Tukar Ukuran**:
   - Form pengajuan retur di halaman detail pesanan pelanggan.
   - Tab manajemen retur di Admin Panel dengan mekanisme pemulihan stok hanya setelah verifikasi fisik.
8. **Dashboard Analitik Finansial Riil**:
   - Grafik analitik komparasi Omzet Kotor vs HPP Modal vs Laba Bersih.
   - Peringatan stok kritis ($\le 5$ pasang) dan tabel produk terlaris.
   - Tombol backup & ekspor data transaksi ke format JSON/CSV.
9. **Verifikasi & Build**:
   - Menjalankan `compile_applet` dan `lint_applet` untuk menjamin stabilitas aplikasi.
