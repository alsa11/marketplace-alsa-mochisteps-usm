import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Truck,
  Heart,
  Instagram,
  Check,
  Copy,
  Ruler,
  Clock,
  Send,
  MessageCircle,
} from 'lucide-react';
import { MochiLogo } from './MochiLogo';

interface FooterProps {
  onOpenInsoleGuide?: () => void;
  onFilterCategory?: (category: string) => void;
  onOpenOrderTracking?: () => void;
  onSecretAdminClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenInsoleGuide,
  onFilterCategory,
  onOpenOrderTracking,
  onSecretAdminClick,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Newsletter VIP State
  const [subscriberInput, setSubscriberInput] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [voucherCopied, setVoucherCopied] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscriberInput.trim()) return;
    setIsSubscribed(true);
  };

  const copyVoucher = () => {
    navigator.clipboard.writeText('MOCHIPERTAMA20');
    setVoucherCopied(true);
    setTimeout(() => setVoucherCopied(false), 2500);
  };

  const faqs = [
    {
      q: 'Bagaimana jika ukuran sepatu yang saya terima tidak pas?',
      a: 'Jangan khawatir! Mochi Steps menyediakan layanan Garansi Tukar Ukuran 7 Hari setelah paket diterima jika flatshoes kekecilan atau kebesaran. Hubungi admin via WhatsApp untuk proses tukar yang cepat dan mudah.',
    },
    {
      q: 'Kenapa dinamakan MOCHI STEPS?',
      a: 'Karena setiap pasang sepatu kami dibekali bantalan CloudMochi 8mm berbahan busa memori kenyal berdaya redam tinggi. Sensasi melangkah empuk dan lentur mirip tekstur kue mochi Jepang yang lembut.',
    },
    {
      q: 'Berapa lama estimasi pengiriman?',
      a: 'Pesanan dikirim langsung dari workshop kami di Solo. Estimasi tiba untuk area Pulau Jawa 1-2 hari kerja, dan luar Pulau Jawa sekitar 2-4 hari kerja melalui kurir J&T, SiCepat, JNE, dan Anteraja.',
    },
    {
      q: 'Apakah bisa bayar dengan metode COD (Cash on Delivery)?',
      a: 'Bisa banget! Kami mendukung pembayaran COD di seluruh Indonesia. Anda cukup membayar uang tunai ke kurir saat paket flatshoes sampai di tangan Anda.',
    },
  ];

  return (
    <footer className="bg-[#1f1614] text-[#d6ccc7] border-t border-[#362722]">
      {/* 1. Bar 4 Keunggulan Mochi Steps (Trust Badges Khusus Mochi Steps) */}
      <div className="border-b border-[#362722] bg-[#271d1a]/80 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-[#322420]/40 border border-[#44322b]/50">
            <div className="w-10 h-10 rounded-xl bg-pink-950/70 border border-pink-700/40 flex items-center justify-center shrink-0 text-[#f39cb0]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-xs sm:text-sm text-white tracking-wide">
                Bantalan MochiCloud 8mm
              </h4>
              <p className="text-[11px] text-[#b09f98] mt-0.5 leading-relaxed">
                Busa memori ganda empuk & lentur, bebas pegal seharian.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-[#322420]/40 border border-[#44322b]/50">
            <div className="w-10 h-10 rounded-xl bg-pink-950/70 border border-pink-700/40 flex items-center justify-center shrink-0 text-[#f39cb0]">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-xs sm:text-sm text-white tracking-wide">
                Garansi Tukar Size 7 Hari
              </h4>
              <p className="text-[11px] text-[#b09f98] mt-0.5 leading-relaxed">
                Kekecilan atau kebesaran? Tukar dengan tenang tanpa ribet.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-[#322420]/40 border border-[#44322b]/50">
            <div className="w-10 h-10 rounded-xl bg-pink-950/70 border border-pink-700/40 flex items-center justify-center shrink-0 text-[#f39cb0]">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-xs sm:text-sm text-white tracking-wide">
                Handcrafted Asli Solo
              </h4>
              <p className="text-[11px] text-[#b09f98] mt-0.5 leading-relaxed">
                Dibuat teliti oleh pengrajin sepatu lokal terampil di Solo.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-[#322420]/40 border border-[#44322b]/50">
            <div className="w-10 h-10 rounded-xl bg-pink-950/70 border border-pink-700/40 flex items-center justify-center shrink-0 text-[#f39cb0]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-xs sm:text-sm text-white tracking-wide">
                Bisa COD Seluruh Indonesia
              </h4>
              <p className="text-[11px] text-[#b09f98] mt-0.5 leading-relaxed">
                Bayar aman di tempat saat flatshoes sampai di tangan Anda.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Banner VIP Club / Newsletter Voucher (Fitur Unik Khas Mochi Steps) */}
      <div className="border-b border-[#362722] bg-gradient-to-r from-[#2c1c1b] via-[#352220] to-[#2c1c1b] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-900/40 text-pink-300 text-xs font-semibold border border-pink-700/30">
              <Sparkles className="w-3.5 h-3.5 text-pink-300" />
              <span>Mochi Steps VIP Member Circle</span>
            </div>
            <h3 className="text-lg sm:text-xl font-heading font-extrabold text-white">
              Dapatkan Voucher Diskon Rp 20.000 Pesanan Pertama
            </h3>
            <p className="text-xs text-[#c4b3ac] max-w-xl">
              Daftarkan nomor WhatsApp atau email Anda untuk mendapatkan kode voucher instan dan update katalog flatshoes terbaru.
            </p>
          </div>

          {!isSubscribed ? (
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto"
            >
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Masukkan No. WhatsApp / Email..."
                  value={subscriberInput}
                  onChange={(e) => setSubscriberInput(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-full bg-[#1e1311] border border-[#4d3630] text-xs text-white placeholder-[#87726b] focus:outline-hidden focus:border-[#e28da2] focus:ring-1 focus:ring-[#e28da2] transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-gradient-to-r from-[#d65b7d] to-[#be185d] hover:brightness-110 active:scale-95 text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Klaim Voucher</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#1e1311]/90 border border-pink-500/40 px-5 py-2.5 rounded-2xl animate-fade-in">
              <div className="text-xs text-[#d6ccc7] text-center sm:text-left">
                <p className="font-bold text-white flex items-center justify-center sm:justify-start gap-1.5 text-emerald-400">
                  <Check className="w-4 h-4" />
                  <span>Voucher Diskon Siap Digunakan!</span>
                </p>
                <p className="text-[11px] text-[#b8aaa3]">Gunakan kode saat checkout:</p>
              </div>
              <div className="flex items-center gap-2 bg-[#2d1b1a] px-3 py-1.5 rounded-xl border border-[#523430]">
                <span className="font-mono font-extrabold text-pink-300 text-xs tracking-wider">
                  MOCHIPERTAMA20
                </span>
                <button
                  type="button"
                  onClick={copyVoucher}
                  className="p-1 hover:bg-pink-900/50 rounded text-pink-200 transition-colors"
                  title="Salin Kode Voucher"
                >
                  {voucherCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Kolom Konten Utama Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-[#3c2a23]">
          
          {/* Column 1: Store Brand, Alamat Workshop & Kontak (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <MochiLogo variant="footer" onClick={onSecretAdminClick} />

            <p className="text-xs sm:text-sm text-[#b8aaa3] leading-relaxed pr-2">
              Sepatu flatshoes & loafers wanita modern dengan bantalan selembut mochi untuk menemani langkah anggun Anda di setiap momen formal, kantor, dan santai.
            </p>

            <div className="space-y-2.5 text-xs text-[#d6ccc7] pt-1">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#e28da2] shrink-0 mt-0.5" />
                <span className="leading-tight">
                  <strong className="text-white">Workshop & Pengiriman:</strong> Solo, Jawa Tengah — Pengrajin Sepatu Lokal Indonesia
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#e28da2] shrink-0" />
                <a
                  href="https://wa.me/62819456732451?text=Halo%20Admin%20Mochi%20Steps,%20saya%20ingin%20konsultasi%20ukuran%20dan%20koleksi%20sepatu"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-pink-300 transition-colors font-medium"
                >
                  0819456732451 (WhatsApp CS)
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#e28da2] shrink-0" />
                <a href="mailto:admin@mochisteps.com" className="hover:text-pink-300 transition-colors">
                  admin@mochisteps.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-[#9e8d85]">
                <Clock className="w-4 h-4 text-[#e28da2] shrink-0" />
                <span>Jam Layanan CS: Setiap Hari (08.00 - 21.00 WIB)</span>
              </div>
            </div>

            {/* Social Media Links & Komunitas */}
            <div className="pt-2">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#9e8d85] mb-2.5">
                IKUTI KESERUAN KAMI
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2d1f1c] hover:bg-pink-900/40 text-xs text-[#d6ccc7] hover:text-white border border-[#44322b] transition-all"
                >
                  <Instagram className="w-3.5 h-3.5 text-[#e28da2]" />
                  <span>@mochisteps.id</span>
                </a>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2d1f1c] hover:bg-pink-900/40 text-xs text-[#d6ccc7] hover:text-white border border-[#44322b] transition-all"
                >
                  <svg className="w-3.5 h-3.5 text-[#e28da2] fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.02 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                  <span>@mochisteps</span>
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Kategori Koleksi (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-heading font-bold text-xs tracking-wider text-white uppercase flex items-center gap-1.5">
              <span>KOLEKSI SEPATU</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-[#b8aaa3]">
              <li>
                <button
                  onClick={() => onFilterCategory?.('Flat Shoes Klasik')}
                  className="hover:text-pink-300 transition-colors text-left flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e28da2]" />
                  <span>Flat Shoes Klasik</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onFilterCategory?.('Pointed Elegant')}
                  className="hover:text-pink-300 transition-colors text-left flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e28da2]" />
                  <span>Pointed Elegant</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onFilterCategory?.('Loafers & Slip-on')}
                  className="hover:text-pink-300 transition-colors text-left flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e28da2]" />
                  <span>Loafers & Slip-on</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onFilterCategory?.('all')}
                  className="hover:text-white transition-colors text-left font-semibold text-[#f39cb0] flex items-center gap-1.5 pt-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#f39cb0]" />
                  <span>Lihat Semua Koleksi</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Layanan Pelanggan & Jaminan (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-heading font-bold text-xs tracking-wider text-white uppercase flex items-center gap-1.5">
              <span>BANTUAN & LAYANAN</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-[#b8aaa3]">
              <li>
                <button
                  onClick={onOpenOrderTracking}
                  className="hover:text-white transition-colors text-left flex items-center gap-2 font-medium text-pink-300 bg-[#2f201d] px-3 py-1.5 rounded-xl border border-[#48332c]"
                >
                  <Truck className="w-3.5 h-3.5 text-pink-400" />
                  <span>Lacak Status Pesanan</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenInsoleGuide}
                  className="hover:text-pink-300 text-left transition-colors font-medium flex items-center gap-2"
                >
                  <Ruler className="w-3.5 h-3.5 text-[#e28da2]" />
                  <span>Panduan Ukuran & Insole 8mm</span>
                </button>
              </li>
              <li>
                <span className="flex items-center gap-2 text-[#c2b3ad]">
                  <RotateCcw className="w-3.5 h-3.5 text-[#e28da2]" />
                  <span>Garansi Tukar Ukuran 7 Hari</span>
                </span>
              </li>
              <li>
                <span className="flex items-center gap-2 text-[#c2b3ad]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#e28da2]" />
                  <span>100% Jahitan Rapi Berkualitas</span>
                </span>
              </li>
              <li>
                <a
                  href="https://wa.me/6281934424901?text=Halo%20Admin%20Mochi%20Steps,%20saya%20ingin%20konsultasi%20ukuran%20kaki"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-pink-300 text-left transition-colors font-medium flex items-center gap-2 text-emerald-400"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Konsultasi Ukuran via WA</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Pertanyaan Umum (FAQ) Interaktif (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-heading font-bold text-xs tracking-wider text-white uppercase flex items-center gap-1.5">
              <span>PERTANYAAN UMUM (FAQ)</span>
            </h4>
            <div className="space-y-2">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border-b border-[#3c2a23] pb-2 transition-all"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full text-left flex items-start justify-between gap-2 py-1 text-xs font-medium text-[#e5ddd8] hover:text-white transition-colors"
                    >
                      <span className="leading-snug">{faq.q}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-[#e28da2] shrink-0 transition-transform duration-200 mt-0.5 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="pt-1.5 pb-2 text-[11px] text-[#b8aaa3] leading-relaxed animate-fade-in">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. Mitra Ekspedisi & Pembayaran Resmi */}
        <div className="py-6 border-b border-[#3c2a23] flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Ekspedisi Pengiriman */}
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9e8d85]">
              Ekspedisi Pengiriman:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {['J&T Express', 'SiCepat', 'JNE Express', 'Anteraja', 'GoSend'].map((exp) => (
                <span
                  key={exp}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#291b17] text-[#e8deda] border border-[#443129]"
                >
                  {exp}
                </span>
              ))}
            </div>
          </div>

          {/* Metode Pembayaran Lengkap */}
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9e8d85]">
              Metode Pembayaran:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {['BCA VA', 'Mandiri VA', 'BRI VA', 'QRIS', 'GoPay', 'ShopeePay', 'COD (Bayar di Tempat)'].map((pay) => (
                <span
                  key={pay}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#291b17] text-[#e8deda] border border-[#443129]"
                >
                  {pay}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 5. Bottom Bar: Hak Cipta & Keamanan Transaksi */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#9c8d86]">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center md:text-left">
            <span className="font-medium text-[#b09f98]">
              © 2026 MOCHI STEPS — Your Everyday Steps, Your Style.
            </span>
            <span className="hidden sm:inline text-[#554038]">•</span>
            <span className="text-[11px] text-[#8c7a72]">
              Dibuat dengan Bangga oleh Pengrajin Sepatu Solo, Indonesia.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-[#9c8d86]">
            {/* Terverifikasi Tersimpan di Database Firebase Firestore */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#201511] border border-emerald-500/50 text-emerald-400 font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ring-2 ring-emerald-500/40" />
              <span>Database Terverifikasi: Cloud Firestore (Firebase)</span>
            </div>

            <span className="flex items-center gap-1.5 text-emerald-400/90 pl-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SSL 256-Bit Encrypted</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
