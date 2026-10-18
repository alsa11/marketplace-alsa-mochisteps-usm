import React, { useState } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  AlertCircle,
  Truck,
  User,
  Phone,
  Image as ImageIcon,
  PackageCheck,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { OrderReturn } from '../../types';
import { updateReturnStatusAndRestoreStock } from '../../lib/firestoreService';

interface ReturnManagerProps {
  returns: OrderReturn[];
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

export const ReturnManager: React.FC<ReturnManagerProps> = ({
  returns,
  onShowToast,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);
  const [rejectModalReturn, setRejectModalReturn] = useState<OrderReturn | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredReturns = returns.filter((r) => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  const handleApproveForShipping = async (ret: OrderReturn) => {
    setIsProcessing(true);
    try {
      await updateReturnStatusAndRestoreStock(
        ret,
        'Disetujui (Kirim Barang)',
        'Pengajuan disetujui. Silakan kirimkan sepatu fisik ke workshop Mochi Steps.',
        'Admin Retur'
      );
      onShowToast(
        `Pengajuan #${ret.orderNumber} disetujui. Pelanggan diinstruksikan mengirimkan sepatu ke workshop.`,
        'success'
      );
    } catch (err: any) {
      onShowToast('Gagal menyetujui retur: ' + (err?.message || 'Error'), 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmItemReceivedAndFinish = async (ret: OrderReturn) => {
    if (
      !confirm(
        `Konfirmasi bahwa barang fisik sepatu dari pesanan #${ret.orderNumber} telah diterima & diperiksa di workshop? Stok sepatu akan otomatis dikembalikan ke etalase toko.`
      )
    ) {
      return;
    }

    setIsProcessing(true);
    try {
      await updateReturnStatusAndRestoreStock(
        ret,
        'Barang Diterima & Selesai',
        'Barang fisik telah diterima dalam kondisi baik di workshop. Proses retur selesai.',
        'Admin Retur'
      );
      onShowToast(
        `Barang retur #${ret.orderNumber} diterima. Stok sepatu berhasil dikembalikan ke etalase & mutasi dicatat!`,
        'success'
      );
    } catch (err: any) {
      onShowToast('Gagal menyelesaikan retur: ' + (err?.message || 'Error'), 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenReject = (ret: OrderReturn) => {
    setRejectModalReturn(ret);
    setRejectionReasonInput('Kondisi sepatu sudah dipakai ke luar ruangan / sol kotor.');
  };

  const handleConfirmReject = async () => {
    if (!rejectModalReturn) return;
    if (!rejectionReasonInput.trim()) {
      alert('Tuliskan alasan penolakan retur.');
      return;
    }

    setIsProcessing(true);
    try {
      await updateReturnStatusAndRestoreStock(
        rejectModalReturn,
        'Ditolak',
        rejectionReasonInput.trim(),
        'Admin Retur'
      );
      onShowToast(
        `Pengajuan retur #${rejectModalReturn.orderNumber} ditolak.`,
        'success'
      );
      setRejectModalReturn(null);
    } catch (err: any) {
      onShowToast('Gagal menolak retur: ' + (err?.message || 'Error'), 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-pink-100 text-[#be185d]">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-xl text-gray-900">
              Pengajuan Retur & Tukar Ukuran
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Kelola permintaan tukar size atau pengembalian produk pelanggan. Stok sepatu baru otomatis dikembalikan hanya setelah barang fisik diterima & disetujui.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-2xl border border-gray-200 overflow-x-auto">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'Menunggu Pemeriksaan', label: 'Menunggu' },
            { id: 'Disetujui (Kirim Barang)', label: 'Dikirim Pembeli' },
            { id: 'Barang Diterima & Selesai', label: 'Selesai' },
            { id: 'Ditolak', label: 'Ditolak' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-white text-[#be185d] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Returns List */}
      {filteredReturns.length === 0 ? (
        <div className="bg-white rounded-3xl border border-pink-100 p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-pink-50 text-pink-300 flex items-center justify-center mx-auto">
            <RotateCcw className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-gray-800 text-sm">Tidak Ada Pengajuan Retur</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Ketika pelanggan mengajukan klaim garansi tukar ukuran dari halaman Lacak Pesanan, data pengajuan akan masuk ke sini.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReturns.map((ret) => (
            <div
              key={ret.id}
              className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all ${
                ret.status === 'Menunggu Pemeriksaan'
                  ? 'border-amber-300 shadow-xs'
                  : ret.status === 'Barang Diterima & Selesai'
                  ? 'border-emerald-200 shadow-2xs'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-extrabold text-sm text-[#be185d]">
                      #{ret.orderNumber}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-100 text-[#be185d]">
                      {ret.returnType}
                    </span>

                    {/* Status Pill */}
                    {ret.status === 'Menunggu Pemeriksaan' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Menunggu Pemeriksaan</span>
                      </span>
                    ) : ret.status === 'Disetujui (Kirim Barang)' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                        <Truck className="w-3.5 h-3.5 text-blue-600" />
                        <span>Disetujui (Kirim Barang)</span>
                      </span>
                    ) : ret.status === 'Barang Diterima & Selesai' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Barang Diterima & Selesai</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                        <span>Ditolak</span>
                      </span>
                    )}

                    {ret.stockRestored && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Stok Dikembalikan ✓
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500">
                    Diajukan pada: {new Date(ret.createdAt).toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <div className="flex items-center gap-1.5 font-medium">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{ret.customerName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a
                      href={`https://wa.me/${ret.customerPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#be185d] hover:underline"
                    >
                      {ret.customerPhone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Items & Reason Body */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 py-4">
                {/* Items in Return */}
                <div className="md:col-span-5 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                    Item Sepatu yang Diretur:
                  </span>
                  {ret.items.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2.5 rounded-2xl bg-gray-50 border border-gray-150">
                      <div className="w-12 h-12 rounded-xl bg-pink-100 overflow-hidden shrink-0">
                        <img src={it.imageUrl} alt={it.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-xs flex-1">
                        <p className="font-bold text-gray-900">{it.name}</p>
                        <p className="text-gray-500">
                          Ukuran Saat Ini: <strong className="text-gray-800">EU {it.size}</strong> ({it.quantity} pasang)
                        </p>
                        {ret.requestedSize && (
                          <p className="text-[#be185d] font-bold mt-0.5">
                            Permintaan Tukar ke: Ukuran EU {ret.requestedSize}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reason & Photo */}
                <div className="md:col-span-7 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                    Alasan dari Pelanggan:
                  </span>
                  <div className="bg-[#fff9fa] p-3.5 rounded-2xl border border-pink-150 text-xs text-gray-800 leading-relaxed font-sans">
                    "{ret.reason}"
                  </div>

                  {ret.photoUrl && (
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => setZoomedPhoto(ret.photoUrl || null)}
                        className="group relative w-16 h-16 rounded-xl overflow-hidden border border-pink-200 cursor-pointer shadow-xs hover:scale-105 transition-transform"
                      >
                        <img src={ret.photoUrl} alt="Foto kondisi sepatu retur" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Eye className="w-4 h-4 text-white" />
                        </div>
                      </button>
                      <span className="text-[11px] text-gray-500">
                        Foto fisik kondisi sol & sepatu yang diunggah pelanggan
                      </span>
                    </div>
                  )}

                  {ret.adminNotes && (
                    <div className="text-[11px] text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-200 mt-2">
                      <strong className="text-gray-800">Catatan Admin:</strong> {ret.adminNotes}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-end gap-2.5">
                {ret.status === 'Menunggu Pemeriksaan' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleOpenReject(ret)}
                      disabled={isProcessing}
                      className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all cursor-pointer"
                    >
                      Tolak Pengajuan
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApproveForShipping(ret)}
                      disabled={isProcessing}
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Setujui (Instruksikan Kirim Barang)</span>
                    </button>
                  </>
                )}

                {ret.status === 'Disetujui (Kirim Barang)' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleOpenReject(ret)}
                      disabled={isProcessing}
                      className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all cursor-pointer"
                    >
                      Batalkan / Tolak
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConfirmItemReceivedAndFinish(ret)}
                      disabled={isProcessing}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-xs font-bold shadow-md hover:brightness-105 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <PackageCheck className="w-4 h-4" />
                      <span>Barang Fisik Diterima & Kembalikan Stok</span>
                    </button>
                  </>
                )}

                {ret.status === 'Barang Diterima & Selesai' && (
                  <div className="text-xs text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Proses Retur Selesai • Stok Berhasil Dikembalikan</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-sans">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-red-100">
            <h3 className="font-heading font-extrabold text-base text-gray-900 mb-2">
              Tolak Pengajuan Retur #{rejectModalReturn.orderNumber}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Tuliskan alasan penolakan agar pelanggan memahami mengapa pengajuan garansi tidak memenuhi syarat.
            </p>

            <textarea
              rows={3}
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder="Misal: Sepatu telah dipakai ke luar ruangan sehingga sol kotor, melewati batas waktu 7 hari, dsb."
              className="w-full p-3 rounded-xl border border-gray-200 text-xs text-gray-800 focus:ring-2 focus:ring-red-300 focus:outline-hidden mb-4"
            />

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setRejectModalReturn(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? 'Menolak...' : 'Konfirmasi Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zoom Modal for Photo */}
      {zoomedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in"
          onClick={() => setZoomedPhoto(null)}
        >
          <div className="relative max-w-xl max-h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl p-2" onClick={(e) => e.stopPropagation()}>
            <img src={zoomedPhoto} alt="Foto kondisi sepatu retur" className="w-full h-auto max-h-[75vh] object-contain rounded-2xl" />
            <button
              type="button"
              onClick={() => setZoomedPhoto(null)}
              className="mt-2 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl"
            >
              Tutup Foto
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
