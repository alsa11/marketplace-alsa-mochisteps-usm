import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Percent,
  DollarSign,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Voucher } from '../../types';
import { addVoucher, updateVoucher, deleteVoucher } from '../../lib/firestoreService';

interface VoucherManagerProps {
  vouchers: Voucher[];
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

export const VoucherManager: React.FC<VoucherManagerProps> = ({
  vouchers,
  onShowToast,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'nominal'>('nominal');
  const [discountValue, setDiscountValue] = useState<number>(20000);
  const [minSpend, setMinSpend] = useState<number>(150000);
  const [maxDiscount, setMaxDiscount] = useState<number>(50000);
  const [validUntil, setValidUntil] = useState<string>('2026-12-31');
  const [usageLimit, setUsageLimit] = useState<number>(100);
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleOpenCreate = () => {
    setEditingVoucher(null);
    setCode('');
    setDiscountType('nominal');
    setDiscountValue(20000);
    setMinSpend(150000);
    setMaxDiscount(50000);
    setValidUntil('2026-12-31');
    setUsageLimit(100);
    setDescription('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: Voucher) => {
    setEditingVoucher(v);
    setCode(v.code);
    setDiscountType(v.discountType);
    setDiscountValue(v.discountValue);
    setMinSpend(v.minSpend);
    setMaxDiscount(v.maxDiscount || 0);
    setValidUntil(v.validUntil ? v.validUntil.slice(0, 10) : '2026-12-31');
    setUsageLimit(v.usageLimit);
    setDescription(v.description || '');
    setIsActive(v.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      onShowToast('Kode voucher tidak boleh kosong.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanCode = code.trim().toUpperCase().replace(/\s+/g, '');
      const payload: Omit<Voucher, 'id'> = {
        code: cleanCode,
        discountType,
        discountValue: Number(discountValue),
        minSpend: Number(minSpend),
        maxDiscount: discountType === 'percentage' && maxDiscount ? Number(maxDiscount) : undefined,
        validUntil,
        usageLimit: Number(usageLimit),
        usageCount: editingVoucher ? editingVoucher.usageCount : 0,
        isActive,
        description: description.trim(),
      };

      if (editingVoucher) {
        await updateVoucher(editingVoucher.id, payload);
        onShowToast(`Voucher ${cleanCode} berhasil diperbarui.`, 'success');
      } else {
        await addVoucher(payload);
        onShowToast(`Voucher ${cleanCode} berhasil dibuat.`, 'success');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      onShowToast('Gagal menyimpan voucher: ' + (err?.message || 'Error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, codeName: string) => {
    if (!confirm(`Hapus voucher ${codeName}? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      await deleteVoucher(id);
      onShowToast(`Voucher ${codeName} berhasil dihapus.`, 'success');
    } catch (err: any) {
      onShowToast('Gagal menghapus voucher: ' + (err?.message || 'Error'), 'error');
    }
  };

  const handleToggleActive = async (v: Voucher) => {
    try {
      await updateVoucher(v.id, { isActive: !v.isActive });
      onShowToast(`Status voucher ${v.code} berhasil diubah.`, 'success');
    } catch (err: any) {
      onShowToast('Gagal memperbarui status: ' + (err?.message || 'Error'), 'error');
    }
  };

  const handleCopyCode = (vCode: string) => {
    navigator.clipboard.writeText(vCode);
    setCopiedCode(vCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-pink-100 text-[#be185d]">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-xl text-gray-900">
              Manajemen Voucher & Promosi
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Buat kode diskon belanja pelanggan, atur nominal/persentase potongan, minimal belanja, dan batas kuota klaim.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d65b7d] via-[#e26d8d] to-[#be185d] text-white font-bold text-xs flex items-center gap-2 shadow-md hover:brightness-105 cursor-pointer transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Voucher Baru</span>
        </button>
      </div>

      {/* Voucher Cards Grid */}
      {vouchers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-pink-100 p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-pink-50 text-pink-400 flex items-center justify-center mx-auto">
            <Tag className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-gray-800 text-sm">Belum Ada Voucher</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Tambahkan kode promo diskon untuk meningkatkan konversi penjualan flatshoes pelanggan Anda.
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-[#be185d] text-white font-bold text-xs hover:bg-[#9d174d] cursor-pointer"
          >
            Buat Voucher Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {vouchers.map((v) => {
            const isExpired = new Date(v.validUntil).getTime() < Date.now();
            const isExhausted = v.usageCount >= v.usageLimit;

            return (
              <div
                key={v.id}
                className={`bg-white rounded-3xl p-5 border transition-all relative overflow-hidden flex flex-col justify-between ${
                  !v.isActive || isExpired || isExhausted
                    ? 'border-gray-200 opacity-75'
                    : 'border-pink-200/90 shadow-xs hover:shadow-md hover:border-pink-300'
                }`}
              >
                {/* Status Badges */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    {v.isActive && !isExpired && !isExhausted ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Aktif</span>
                      </span>
                    ) : isExpired ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3 text-red-600" />
                        <span>Kedaluwarsa</span>
                      </span>
                    ) : isExhausted ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        <span>Habis Terpakai</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                        <span>Nonaktif</span>
                      </span>
                    )}

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-pink-50 text-[#be185d]">
                      {v.discountType === 'percentage' ? `${v.discountValue}% OFF` : `Potongan ${formatRupiah(v.discountValue)}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(v)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                      title="Ubah Voucher"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(v.id, v.code)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Hapus Voucher"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Code Block */}
                <div className="bg-[#fff3f6] border border-dashed border-pink-300 rounded-2xl p-3 flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block">
                      Kode Voucher
                    </span>
                    <span className="font-mono font-extrabold text-base text-[#be185d] tracking-wider">
                      {v.code}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyCode(v.code)}
                    className="p-2 rounded-xl bg-white border border-pink-200 text-pink-700 hover:bg-pink-50 transition-colors cursor-pointer"
                    title="Salin Kode"
                  >
                    {copiedCode === v.code ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Description */}
                {v.description && (
                  <p className="text-xs text-gray-600 leading-relaxed mb-3 line-clamp-2">
                    {v.description}
                  </p>
                )}

                {/* Rules Details */}
                <div className="space-y-1.5 text-[11px] text-gray-500 border-t border-gray-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span>Min. Belanja:</span>
                    <span className="font-semibold text-gray-800">{formatRupiah(v.minSpend)}</span>
                  </div>
                  {v.discountType === 'percentage' && v.maxDiscount && (
                    <div className="flex items-center justify-between">
                      <span>Maks. Potongan:</span>
                      <span className="font-semibold text-gray-800">{formatRupiah(v.maxDiscount)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span>Kuota Penggunaan:</span>
                    <span className="font-semibold text-gray-800">
                      {v.usageCount} / {v.usageLimit} digunakan
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Berlaku Hingga:</span>
                    <span className="font-semibold text-gray-800">
                      {new Date(v.validUntil).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Toggle Active Button */}
                <button
                  type="button"
                  onClick={() => handleToggleActive(v)}
                  className={`mt-4 w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    v.isActive
                      ? 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                      : 'bg-pink-50 hover:bg-pink-100 text-[#be185d] border-pink-200'
                  }`}
                >
                  {v.isActive ? 'Nonaktifkan Sementara' : 'Aktifkan Kembali'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Tambah / Ubah Voucher */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in font-sans">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-pink-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-pink-100 text-[#be185d]">
                  <Tag className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-extrabold text-base text-gray-900">
                  {editingVoucher ? 'Ubah Kode Voucher' : 'Buat Voucher Promo Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Kode Voucher */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  KODE VOUCHER (HURUF KAPITAL & ANGKA) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: MOCHICERIA20, DISKONGAJIAN"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-mono font-bold text-sm tracking-wider uppercase focus:ring-2 focus:ring-pink-300 focus:outline-hidden"
                />
              </div>

              {/* Tipe Diskon & Nilai */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tipe Diskon</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 font-medium focus:ring-2 focus:ring-pink-300 focus:outline-hidden"
                  >
                    <option value="nominal">Nominal Rupiah (Rp)</option>
                    <option value="percentage">Persentase (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {discountType === 'nominal' ? 'Potongan Rupiah (Rp)' : 'Besar Diskon (%)'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 font-bold focus:ring-2 focus:ring-pink-300 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Minimal Belanja & Maksimal Potongan (jika persen) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Min. Belanja (Rp)</label>
                  <input
                    type="number"
                    min={0}
                    value={minSpend}
                    onChange={(e) => setMinSpend(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 font-semibold focus:ring-2 focus:ring-pink-300 focus:outline-hidden"
                  />
                </div>

                {discountType === 'percentage' && (
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Maks. Potongan (Rp)</label>
                    <input
                      type="number"
                      min={0}
                      value={maxDiscount}
                      onChange={(e) => setMaxDiscount(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 font-semibold focus:ring-2 focus:ring-pink-300 focus:outline-hidden"
                    />
                  </div>
                )}
              </div>

              {/* Kuota & Tanggal Berlaku */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Batas Kuota Pemakaian</label>
                  <input
                    type="number"
                    min={1}
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 font-semibold focus:ring-2 focus:ring-pink-300 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Berlaku Sampai Tanggal</label>
                  <input
                    type="date"
                    required
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 font-medium focus:ring-2 focus:ring-pink-300 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Keterangan */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Keterangan / Catatan Promo</label>
                <textarea
                  rows={2}
                  placeholder="Misal: Diskon khusus pengguna baru untuk produk flatshoes semua varian"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-medium focus:ring-2 focus:ring-pink-300 focus:outline-hidden"
                />
              </div>

              {/* Status Aktif */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="voucherActiveCheckbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#be185d] rounded-sm focus:ring-pink-300"
                />
                <label htmlFor="voucherActiveCheckbox" className="font-semibold text-gray-700 cursor-pointer">
                  Aktifkan voucher ini agar dapat langsung digunakan di checkout
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d65b7d] to-[#be185d] text-white font-bold shadow-md hover:brightness-105 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : editingVoucher ? 'Simpan Perubahan' : 'Buat Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
