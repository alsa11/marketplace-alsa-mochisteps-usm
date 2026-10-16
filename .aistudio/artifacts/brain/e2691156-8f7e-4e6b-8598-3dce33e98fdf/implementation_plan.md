# Rencana Implementasi: Penyempurnaan POS Kasir, Inventory & Stok, Pengaturan Harga, dan Lacak Pesanan MOCHI STEPS

Rencana kerja ini merinci perbaikan dan penyempurnaan menyeluruh aplikasi MOCHI STEPS menjadi platform ritel alas kaki wanita yang profesional, stabil, dan terintegrasi penuh dengan Firebase Firestore tanpa menggunakan data tiruan atau mengubah konfigurasi inti yang telah berjalan.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Keputusan Kunci yang Telah Dikonfirmasi Pengguna:**
> - **Format Cetak Struk POS Kasir**: Format *thermal receipt* 58mm / 80mm compact dengan teknik isolasi cetak print-frame murni agar tidak pernah terjadi layar putih (*blank page*), dilengkapi opsi unduh slip struk digital dan bagikan ke WhatsApp pelanggan.
> - **Akses Lacak Pesanan Pelanggan**: Diletakkan secara elegan di **Navbar Atas** (dan didukung di menu drawer mobile), memungkinkan pelanggan melacak progres pesanan secara mandiri hanya dengan verifikasi kombinasi **Nomor Pesanan** dan **Nomor WhatsApp/HP** tanpa perlu login atau mengekspos data pembeli lain.

---

## 1. Overview & Core Concept

- **Apa yang Dibangun & Disempurnakan**:
  1. **POS Kasir Khusus & Perbaikan Cetak Struk Anti-Blank**:
     - Membuka halaman kasir khusus berlayar penuh (*dedicated fullscreen workspace*) yang dapat diakses melalui tombol khusus di bagian atas Admin Panel (berdampingan dengan tombol 'Kembali ke Webstore' dan 'Logout').
     - Menyediakan pencarian cepat produk, filter kategori, pemilihan ukuran flatshoes instan, keranjang kasir, diskon, kalkulator uang tunai dan kembalian otomatis, dukungan QRIS/Transfer/Tunai, serta nomor transaksi otomatis (`MCS-POS-YYYYMMDD-XXXX`).
     - Mengatasi masalah layar putih saat cetak struk dengan mengimplementasikan mekanisme cetak berbasis elemen terisolasi khusus CSS print (`@media print`) dan utilitas cetak thermal dokumen mandiri yang hanya merender struk 58mm/80mm tanpa merusak DOM aplikasi. Struk juga dapat dibuka dan dicetak ulang kapan saja langsung dari Riwayat Order di Admin Panel.
  2. **Restrukturisasi 8 Menu Admin Panel**:
     - Menata urutan navigasi menu Admin Panel sesuai instruksi pengguna:
       1. Dashboard
       2. Data Produk & Stok
       3. Data Order & Riwayat (dilengkapi tombol buka struk & filter channel Webstore/POS)
       4. Data Pelanggan (daftar pelanggan, riwayat belanja, akumulasi total)
       5. Approval Bukti Pembayaran (verifikasi mutasi transfer/QRIS webstore)
       6. Laporan Sales (omzet berkala, filter harian/mingguan/bulanan, laba kotor berdasarkan HPP/modal)
       7. Inventory & Stok (4 Sub-Tab: *Manajemen Stok*, *Opname Stok*, *Riwayat Mutasi*, dan *Katalog Produk*)
       8. Pengaturan Harga & Profit (Kalkulator profit interaktif, markup per produk & markup massal)
  3. **Modul Inventory & Stok Terpadu**:
     - 4 tab fungsional: **Manajemen Stok**, **Opname Stok** (dengan kalkulasi otomatis selisih sistem vs fisik), **Riwayat Mutasi** (IN, OUT, ADJUSTMENT, OPNAME), dan **Katalog Produk**.
     - Pencatatan mutasi stok otomatis untuk setiap penjualan POS, penjualan online Webstore, retur, penyesuaian, dan restock dengan pencatatan waktu, user/kasir, stok sebelum, stok sesudah, dan referensi transaksi.
     - Perlindungan terhadap stok negatif dan transaksi ganda.
  4. **Modul Pengaturan Harga & Profit Markup Massal**:
     - Kalkulator simulasi profit: Harga Beli / HPP Modal, Persentase Markup, Preset Markup (25%, 35%, 50%, 75%, 100%), Rekomendasi Harga Jual dengan rumus $\text{Harga Jual} = \text{Harga Beli} \times (1 + \text{Markup}/100)$, Estimasi Laba Kotor per Unit, dan Margin Profit.
     - Fitur **Terapkan Markup Massal** untuk semua produk atau kategori tertentu dengan validasi, konfirmasi, penyimpanan langsung ke Firestore, dan notifikasi sukses/gagal. Transaksi lama mempertahankan harga snapshot historis tanpa terpengaruh perubahan harga baru.
  5. **Lacak Pesanan Pelanggan Mandiri Tanpa Login**:
     - Form verifikasi ganda: Nomor Pesanan (misal: `MCS-2026-XXXX`) + Nomor HP/WhatsApp pemesan untuk mencegah kebocoran privasi pelanggan lain.
     - Menampilkan visual linimasa status resmi: *Menunggu Pembayaran* $\rightarrow$ *Dibayar* $\rightarrow$ *Diproses* $\rightarrow$ *Dikemas* $\rightarrow$ *Dikirim* $\rightarrow$ *Selesai* (atau *Dibatalkan*).
     - Menampilkan rincian pesanan, foto produk, variasi ukuran, subtotal, kurir, dan nomor resi pengiriman real-time dari Firestore.

---

## 2. User Experience & Visual Design

- **Aesthetic Direction & Brand Consistency**:
  - Mempertahankan identitas visual khas Mochi Steps: nuansa feminin, elegan, dan bersih dengan palet warna rose/pink lembut (`#be185d`, `#ec4899`, `#fdf2f8`), teks slate gelap kontras tinggi (`#0f172a`), dan aksen hijau emerald untuk status sukses/profit.
  - Mematuhi kaidah anti-AI slop: tidak menggunakan pill-badge berlapis, status dot berdenyut tanpa data riil, atau teks berulang tak fungsional.
  - Tipografi rapi menggunakan angka tabular (`font-mono tabular-nums`) pada seluruh tabel stok, harga, kalkulator profit, dan struk POS.
- **Solusi Masalah Cetak Struk POS (Mengapa Terjadi Layar Putih dan Solusinya)**:
  - *Akar Masalah*: Pemanggilan `window.print()` standar di dalam container modal dengan Tailwind CSS backdrop/fixed position menyebabkan browser merender seluruh pohon DOM yang tersembunyi (*overflow hidden* atau opacity/backdrop filter), memicu render kosong (*blank page*) atau cetakan halaman buram.
  - *Solusi Tepat*:
    1. Membuat elemen struk khusus dengan ID `#thermal-receipt-print-target` yang memiliki stylesheet cetak `@media print` ketat: menyembunyikan seluruh body elemen di luar struk (`body * { visibility: hidden; }`), memposisikan struk di kiri atas dengan lebar tepat 58mm atau 80mm, kontras hitam-putih monokrom tajam tanpa bayangan abu-abu, dan `page-break-inside: avoid`.
    2. Menyediakan fungsi cetak alternatif melalui pembuatan jendela cetak mini terisolasi (*dedicated print window/iframe*) sebagai pelindung mutlak sehingga jika `window.print()` pada iframe utama diblokir oleh lingkungan sandbox, struk tetap tercetak dengan sempurna tanpa layar putih.
    3. Menyediakan tombol "Buka & Cetak Struk" pada setiap baris transaksi di tab *Data Order & Riwayat* Admin Panel.

---

## 3. Key Product Decisions & Trade-Offs

- **Struktur Transaksi & Snapshot Data**:
  - Setiap pesanan POS dan pesanan Webstore menyimpan *snapshot* lengkap saat transaksi terjadi: `costPrice` (HPP saat itu), `price` (harga jual saat itu), ukuran, diskon, nama produk, dan foto. Jika di masa mendatang admin mengubah harga jual atau HPP di modul Pengaturan Harga, catatan laporan keuangan masa lalu tetap 100% akurat.
- **Pengurangan Stok Atomik**:
  - Menggunakan Firestore Transaction (`runTransaction`) untuk setiap transaksi kasir POS dan perubahan status order Webstore menjadi *Dibayar* agar kuantitas stok produk berkurang secara atomik, aman dari *race condition*, dan mencegah angka stok menjadi negatif.
- **Verifikasi Lacak Pesanan**:
  - Pelanggan tidak dipaksa mendaftar akun atau login. Namun, untuk menjamin privasi sesuai regulasi perlindungan data pribadi konsumen, sistem mewajibkan pencocokan Nomor Pesanan bersama Nomor Telepon/WhatsApp yang terdaftar pada pesanan tersebut.

---

## 4. Technical Architecture & Data Strategy

### Diagram Alur Data & Komponen

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MOCHI STEPS STOREFRONT                          │
│                                                                        │
│   ┌────────────────┐   ┌─────────────────┐   ┌─────────────────────┐   │
│   │   Navbar Atas  │   │   Hero & Cards  │   │ Lacak Pesanan Modal │   │
│   │ [Lacak Pesanan]│   │  (Catalog PDP)  │   │ (No Order + No HP)  │   │
│   └───────┬────────┘   └────────┬────────┘   └──────────┬──────────┘   │
└───────────┼─────────────────────┼───────────────────────┼──────────────┘
            │                     │                       │
            ▼                     ▼                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FIREBASE FIRESTORE DB                           │
│  Collections:                                                          │
│  • /products           (id, name, price, costPrice, stock, sizes...)   │
│  • /orders             (id, orderNumber, channel, status, items...)    │
│  • /stock_mutations    (id, productId, type, quantity, channel...)     │
│  • /customers          (id, name, phone, totalOrders, totalSpent...)   │
└────────────────────────────────────────────────────────────────────────┘
            ▲                     ▲                       ▲
            │                     │                       │
┌───────────┼─────────────────────┼───────────────────────┼──────────────┐
│           │                     │                       │              │
│   ┌───────┴────────┐   ┌────────┴────────┐   ┌──────────┴──────────┐   │
│   │   POS Kasir    │   │ Inventory/Stok  │   │  Harga & Profit     │   │
│   │  Dedicated Full│   │ Opname & Mutasi │   │  Markup Massal      │   │
│   │ Thermal Receipt│   │ Stock In/Out    │   │  HPP Calculator     │   │
│   └────────────────┘   └─────────────────┘   └─────────────────────┘   │
│                                                                        │
│                    ADMIN PORTAL (8 MENUS HARMONIS)                     │
│  1. Dashboard               5. Approval Bukti Bayar                    │
│  2. Data Produk & Stok      6. Laporan Sales                           │
│  3. Data Order & Riwayat    7. Inventory & Stok (4 Sub-tab)            │
│  4. Data Pelanggan          8. Pengaturan Harga & Profit               │
└────────────────────────────────────────────────────────────────────────┘
```

### Tahapan Eksekusi Pembangunan

1. **Sinkronisasi Navigasi & Struktur Admin Panel (`AdminPortal.tsx`)**:
   - Menata ulang 8 menu utama sesuai urutan yang diminta tanpa menu duplikat.
   - Menempatkan tombol utama **POS Kasir** di area header atas Admin Panel di samping tombol 'Kembali ke Toko' dan 'Logout'.
   - Mengintegrasikan view layar penuh POS Kasir dengan tombol 'Kembali ke Admin Panel'.
2. **Penyempurnaan POS Kasir & Cetak Struk Anti-Blank (`PosKasir.tsx` & CSS Print)**:
   - Memperbaiki handler cetak struk agar mengisolasi elemen cetak ke target khusus thermal 58mm/80mm tanpa memicu layar putih.
   - Menambahkan preview struk instan pasca-transaksi dan riwayat struk di Data Order.
3. **Penyempurnaan Modul Inventory & Stok Terpadu (`InventoryStockManager.tsx`)**:
   - Tab 1: Manajemen Stok (penambahan stok/restock cepat, pengurangan stok, peringatan stok menipis).
   - Tab 2: Opname Stok (perhitungan otomatis selisih fisik vs sistem, catatan alasan selisih).
   - Tab 3: Riwayat Mutasi (tabel real-time mutasi masuk, keluar, penjualan POS, webstore, penyesuaian).
   - Tab 4: Katalog Produk & Ukuran (pantauan stok detail per nomor sepatu 36-41).
4. **Modul Pengaturan Harga & Profit (`PricingProfitManager.tsx`)**:
   - Kalkulator simulasi markup otomatis dengan preset persentase.
   - Fitur terapkan markup massal ke semua produk atau per kategori terpilih.
   - Tombol simpan perubahan langsung ke Firestore dengan feedback notifikasi.
5. **Penyempurnaan Lacak Pesanan di Navbar (`Navbar.tsx` & `OrderTrackingModal.tsx`)**:
   - Menambahkan tombol "Lacak Pesanan" yang jelas dan elegan di Navbar Atas.
   - Memperbarui modal pelacakan dengan verifikasi ganda (No Pesanan + No HP) dan tampilan progresif 6 tahapan status.
6. **Verifikasi & Uji Kompilasi**:
   - Menjalankan `compile_applet` untuk memastikan seluruh tipe data TypeScript, komponen, dan relasi Firestore berfungsi sempurna tanpa eror.
