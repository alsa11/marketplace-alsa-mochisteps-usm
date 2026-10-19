# Rencana Solusi & Implementasi: Device Viewport Simulator & Katalog Mobile Compact

Berdasarkan konfirmasi Anda:
1. **Penyebab tampilan terasa belum berubah ("masih gitu"):** Anda sedang melihat preview di layar desktop biasa (resolusi lebar > 1200px). Pada layar desktop, browser secara default menerapkan layout desktop (4 kolom) dan menyembunyikan elemen mobile dock, sehingga perbaikan mobile 2-kolom dan floating bottom bar belum terlihat sebelum layar dipersempit.
2. **Solusi Utama:** 
   - **Fitur Device Viewport Switcher / Simulator:** Menambahkan tombol pengalih tampilan interaktif di bagian atas/floating (📱 HP 390px | 📟 Tablet 768px | 💻 Desktop Penuh) sehingga Anda dapat menguji dan melihat langsung tampilan HP yang sesungguhnya secara instan di dalam layar desktop tanpa perlu membuka inspeksi DevTools browser.
   - **Penyempurnaan Total Katalog Mobile (2 Kolom Compact):** Memastikan ketika mode HP aktif atau dibuka di smartphone nyata, kartu produk tersusun 2 kolom proporsional, foto sepatu tajam dengan rasio seimbang, harga jelas, badge empuk CloudMochi, tombol love wishlist responsif, dan floating bottom bar di bawah layar dapat langsung digunakan.

---

## 1. Rincian Pekerjaan

### A. Fitur Device Viewport Simulator (Floating Quick-Switch)
- Menambahkan bar pengalih ukuran perangkat di sudut atas yang tidak mengganggu:
  - **📱 Mobile (390px - iPhone/Android Modern):** Membungkus tampilan webstore ke dalam frame mobile realistis lengkap dengan scroll mulus, layout 2 kolom compact, dan floating bottom dock bar.
  - **📟 Tablet (768px - iPad/Tablet):** Menampilkan tata letak 3 kolom produk dengan sidebar/drawer proporsional.
  - **💻 Desktop (Responsive Penuh / 100%):** Menampilkan layout desktop standar yang lebar dan elegan.
- Tombol ini memudahkan evaluasi langsung di satu klik bagi siapa saja yang membuka preview di layar laptop/PC.

### B. Polish Katalog Produk 2 Kolom Mobile
- Grid produk: `grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5`.
- Kartu sepatu (`ProductCard`):
  - Ketinggian foto sepatu disesuaikan agar pas di layar 320px–390px tanpa memakan ruang berlebihan (`aspect-[4/3]` atau `aspect-square`).
  - Label kategori tenang tanpa badge bertumpuk (mengikuti konstitusi desain anti-slop).
  - Teks nama sepatu rapi dengan `line-clamp-1` atau `line-clamp-2` proporsional.
  - Tombol aksi cepat (Pilih Ukuran / Detail) mudah ditekan dengan target sentuh aman (≥ 44px).
  - Indikator stok dan harga diskon kontras tinggi dan mudah dibaca.

### C. Floating Bottom Bar & Navigasi Mobile
- Floating Bottom Dock Bar (Beranda, Katalog, Wishlist dengan badge jumlah, Lacak Pesanan, Keranjang dengan badge counter) tetap berada di bagian bawah saat scroll.
- Memberikan safe area padding (`pb-24`) pada container utama agar produk di baris paling bawah tidak tertutup oleh navigasi bawah.

### D. Admin Portal & Modals
- Mempertahankan kartu pesanan mobile dan kartu produk mobile di Admin Panel yang sudah dirancang sebelumnya.
- Seluruh formulir modal (Detail Produk, Checkout, Keranjang, Lacak Pesanan) responsif 100% baik di frame simulasi mobile maupun desktop penuh.

---

## 2. Langkah Eksekusi Setelah Disetujui
1. **Langkah 1:** Tambahkan komponen `DeviceSimulatorBar` ke `src/App.tsx` dengan state mode viewport (`desktop`, `tablet`, `mobile`).
2. **Langkah 2:** Bungkus konten webstore dengan viewport wrapper yang otomatis menyesuaikan lebar saat simulasi dipilih (misal `max-w-[420px]` untuk mobile dengan frame bayangan elegan).
3. **Langkah 3:** Poles padding, font-size, dan gambar `ProductCard` untuk tampilan 2-kolom mobile yang ultra-rapi.
4. **Langkah 4:** Verifikasi build menggunakan `compile_applet` dan pastikan bebas error.

---

Silakan klik tombol **Proceed** di bawah untuk langsung mengeksekusi implementasi ini.
