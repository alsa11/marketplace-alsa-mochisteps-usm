import React, { useState } from 'react';
import {
  Star,
  CheckCircle2,
  XCircle,
  Trash2,
  Eye,
  MessageSquare,
  ShieldCheck,
  Image as ImageIcon,
  User,
  ShoppingBag,
  Clock,
  Filter,
} from 'lucide-react';
import { ProductReview } from '../../types';
import { moderateReview, deleteReview } from '../../lib/firestoreService';

interface ReviewManagerProps {
  reviews: ProductReview[];
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

export const ReviewManager: React.FC<ReviewManagerProps> = ({
  reviews,
  onShowToast,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const filteredReviews = reviews.filter((r) => {
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'approved' && r.isApproved) ||
      (filterStatus === 'pending' && !r.isApproved);

    const matchesSearch =
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleModerate = async (reviewId: string, approve: boolean, custName: string) => {
    try {
      await moderateReview(reviewId, approve);
      onShowToast(
        `Ulasan dari ${custName} berhasil ${approve ? 'disetujui dan tampil di webstore' : 'disembunyikan'}.`,
        'success'
      );
    } catch (err: any) {
      onShowToast('Gagal memoderasi ulasan: ' + (err?.message || 'Error'), 'error');
    }
  };

  const handleDelete = async (reviewId: string, custName: string) => {
    if (!confirm(`Hapus ulasan dari ${custName} secara permanen?`)) return;
    try {
      await deleteReview(reviewId);
      onShowToast(`Ulasan dari ${custName} berhasil dihapus permanen.`, 'success');
    } catch (err: any) {
      onShowToast('Gagal menghapus ulasan: ' + (err?.message || 'Error'), 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-pink-100 text-[#be185d]">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-xl text-gray-900">
              Moderasi Ulasan Pembeli
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Verifikasi testimoni, rating bintang, dan foto sepatu asli yang dikirim oleh pembeli setelah pesanan selesai.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-200">
          {[
            { id: 'all', label: 'Semua Ulasan' },
            { id: 'pending', label: 'Menunggu Moderasi' },
            { id: 'approved', label: 'Disetujui' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white rounded-3xl border border-pink-100 p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-pink-50 text-pink-300 flex items-center justify-center mx-auto">
            <Star className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-gray-800 text-sm">Tidak Ada Ulasan Sesuai Filter</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Ulasan yang dikirim oleh pelanggan dari halaman Lacak Pesanan akan muncul di sini untuk ditinjau.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className={`bg-white rounded-3xl p-5 border transition-all space-y-3.5 flex flex-col justify-between ${
                rev.isApproved
                  ? 'border-pink-200/90 shadow-2xs'
                  : 'border-amber-300 bg-amber-50/20 shadow-xs'
              }`}
            >
              <div>
                {/* Header: Customer + Rating + Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-pink-100 text-[#be185d] font-bold text-sm flex items-center justify-center shrink-0">
                      {rev.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-900">{rev.customerName}</h4>
                      <p className="text-[10px] text-gray-400">
                        Pesanan #{rev.orderNumber} • {new Date(rev.createdAt).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((st) => (
                        <Star
                          key={st}
                          className={`w-3.5 h-3.5 ${
                            st <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>

                    {rev.isApproved ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        <span>Tampil di Web</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800">
                        <Clock className="w-2.5 h-2.5 text-amber-600" />
                        <span>Menunggu Persetujuan</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Name & Size */}
                <div className="mt-2 text-xs font-semibold text-[#be185d] bg-pink-50/60 px-3 py-1.5 rounded-xl border border-pink-100/80 inline-flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{rev.productName}</span>
                  {rev.size && <span className="text-gray-500 font-normal">• Ukuran {rev.size}</span>}
                </div>

                {/* Review Comment Text */}
                <p className="mt-3 text-xs text-gray-700 leading-relaxed font-sans bg-gray-50/80 p-3 rounded-2xl border border-gray-150">
                  "{rev.comment}"
                </p>

                {/* Photo attached if any */}
                {rev.photoUrl && (
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setZoomedImage(rev.photoUrl || null)}
                      className="group relative w-16 h-16 rounded-xl overflow-hidden border border-pink-200 cursor-pointer shadow-2xs hover:scale-105 transition-transform"
                    >
                      <img src={rev.photoUrl} alt="Foto ulasan pembeli" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                    </button>
                    <span className="text-[11px] text-gray-500">Klik untuk perbesar foto asli pembeli</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleDelete(rev.id, rev.customerName)}
                  className="px-3 py-1.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>

                <div className="flex items-center gap-2">
                  {rev.isApproved ? (
                    <button
                      type="button"
                      onClick={() => handleModerate(rev.id, false, rev.customerName)}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold transition-all cursor-pointer"
                    >
                      Sembunyikan
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleModerate(rev.id, true, rev.customerName)}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-xs font-bold shadow-xs hover:brightness-105 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Setujui Ulasan</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Zoom Modal for Review Photo */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-xl max-h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl p-2" onClick={(e) => e.stopPropagation()}>
            <img src={zoomedImage} alt="Foto ulasan pembeli penuh" className="w-full h-auto max-h-[75vh] object-contain rounded-2xl" />
            <button
              type="button"
              onClick={() => setZoomedImage(null)}
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
