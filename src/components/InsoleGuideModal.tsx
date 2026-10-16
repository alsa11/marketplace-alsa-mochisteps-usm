import React from 'react';
import { X, Ruler, Scissors, Sparkles, Heart, CheckCircle2 } from 'lucide-react';

interface InsoleGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InsoleGuideModal: React.FC<InsoleGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const sizeTable = [
    { size: 36, footLength: '22.5 - 23.0 cm', insoleLength: '23.5 cm', note: 'Ideal untuk kaki ramping' },
    { size: 37, footLength: '23.0 - 23.5 cm', insoleLength: '24.0 cm', note: 'Ukuran standar wanita Indonesia' },
    { size: 38, footLength: '23.5 - 24.0 cm', insoleLength: '24.5 cm', note: 'Ukuran paling populer' },
    { size: 39, footLength: '24.0 - 24.5 cm', insoleLength: '25.0 cm', note: 'Bila kaki lebar disarankan naik 1 size' },
    { size: 40, footLength: '24.5 - 25.0 cm', insoleLength: '25.5 cm', note: 'Ruang ekstra pada area jemari' },
    { size: 41, footLength: '25.0 - 25.5 cm', insoleLength: '26.0 cm', note: 'Leluasa dan nyaman sepanjang hari' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-pink-100 p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-pink-50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#fbcfe8] to-[#fce7f3] flex items-center justify-center text-[#be185d] shadow-sm">
            <Ruler className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-widest uppercase text-[#be185d] bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-200">
                Official Guide
              </span>
            </div>
            <h2 className="text-2xl font-bold font-heading text-gray-900">
              Panduan Ukuran & Insole Mochi Steps
            </h2>
            <p className="text-sm text-gray-500">
              Pastikan langkahmu pas dan selembut memijak mochi di setiap kesempatan.
            </p>
          </div>
        </div>

        {/* Tabel Ukuran */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2 font-heading">
            <Sparkles className="w-4 h-4 text-[#d65b7d]" />
            Tabel Ukuran Sepatu (EU 36 - 41)
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-pink-100 shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#fff0f4] text-[#862744] font-semibold border-b border-pink-200/60">
                <tr>
                  <th className="px-4 py-3 text-center">Ukuran (EU)</th>
                  <th className="px-4 py-3">Panjang Kaki (cm)</th>
                  <th className="px-4 py-3">Panjang Insole (cm)</th>
                  <th className="px-4 py-3">Catatan Fit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50">
                {sizeTable.map((row) => (
                  <tr key={row.size} className="hover:bg-pink-50/50 transition-colors">
                    <td className="px-4 py-3 text-center font-bold text-[#be185d]">
                      {row.size}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-700">{row.footLength}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{row.insoleLength}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2 italic">
            * Tips: Panjang insole selalu lebih panjang 0.5 - 1.0 cm dari panjang kaki untuk kenyamanan gerak jari.
          </p>
        </div>

        {/* 3 Langkah Mengukur Kaki */}
        <div className="mb-8 bg-gradient-to-br from-[#fff7f9] to-[#fdf2f4] rounded-2xl p-5 border border-pink-100">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2 font-heading">
            <Ruler className="w-4 h-4 text-[#d65b7d]" />
            Cara Mengukur Panjang Kaki yang Akurat
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-pink-100/70 shadow-2xs">
              <div className="w-7 h-7 rounded-full bg-pink-100 text-[#be185d] font-bold text-sm flex items-center justify-center mb-2">
                1
              </div>
              <h4 className="font-semibold text-gray-900 text-sm mb-1">Siapkan Kertas</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Letakkan selembar kertas HVS di atas lantai datar, lalu injak dengan tumit menempel pada dinding.
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-pink-100/70 shadow-2xs">
              <div className="w-7 h-7 rounded-full bg-pink-100 text-[#be185d] font-bold text-sm flex items-center justify-center mb-2">
                2
              </div>
              <h4 className="font-semibold text-gray-900 text-sm mb-1">Tandai Ujung Jari</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Tarik garis pensil di ujung jari kaki yang paling panjang (bisa jempol atau telunjuk).
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-pink-100/70 shadow-2xs">
              <div className="w-7 h-7 rounded-full bg-pink-100 text-[#be185d] font-bold text-sm flex items-center justify-center mb-2">
                3
              </div>
              <h4 className="font-semibold text-gray-900 text-sm mb-1">Ukur dengan Penggaris</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Ukur jarak tegak lurus dari tepi kertas ke tanda garis dalam satuan sentimeter (cm), lalu cocokkan ke tabel.
              </p>
            </div>
          </div>
        </div>

        {/* Memotong Insole & Perawatan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cara Memilih & Memotong Insole */}
          <div className="p-5 rounded-2xl bg-white border border-pink-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-pink-50 text-[#be185d]">
                <Scissors className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm font-heading">
                Memotong & Menyesuaikan Insole
              </h3>
            </div>
            <ul className="space-y-2 text-xs text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#d65b7d] shrink-0 mt-0.5" />
                <span>Gunakan insole bawaan flatshoes lama Anda sebagai mal/cetakan garis potong.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#d65b7d] shrink-0 mt-0.5" />
                <span>Potong perlahan hanya di bagian ujung jemari kaki, <b>jangan</b> memotong bagian tumit atau arch busa.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#d65b7d] shrink-0 mt-0.5" />
                <span>Gunting dengan gunting tajam bersudut 45 derajat agar tepian insole tetap rapi dan tidak mengganjal.</span>
              </li>
            </ul>
          </div>

          {/* Tips Perawatan Flatshoes */}
          <div className="p-5 rounded-2xl bg-white border border-pink-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-pink-50 text-[#be185d]">
                <Heart className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm font-heading">
                Tips Perawatan Mochi Cushion
              </h3>
            </div>
            <ul className="space-y-2 text-xs text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#d65b7d] shrink-0 mt-0.5" />
                <span>Bersihkan noda luar cukup dengan kain microfiber lembap atau tisu basah non-alkohol.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#d65b7d] shrink-0 mt-0.5" />
                <span>Angin-anginkan di tempat teduh bersirkulasi baik jika basah. Jangan dijemur di bawah terik matahari langsung.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#d65b7d] shrink-0 mt-0.5" />
                <span>Simpan dengan shoe tree atau gumpalan kertas agar bentuk lekukan flatshoes tetap cantik elegan.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Masih ragu memilih ukuran? Tim Mochi Steps siap bantu via WhatsApp!
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#d65b7d] to-[#be185d] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
