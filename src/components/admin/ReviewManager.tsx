import React, { useMemo, useState } from 'react';
import {
  Star,
  CheckCircle2,
  Trash2,
  Eye,
  MessageSquare,
  ShoppingBag,
  Clock,
  Sparkles,
  Plus,
  Edit3,
  Upload,
  Download,
  BarChart3,
  Search,
  Camera,
  X,
  Ruler,
} from 'lucide-react';
import {
  LookbookItem,
  LookbookOccasion,
  Order,
  Product,
  ProductReview,
} from '../../types';
import {
  addLookbookItem,
  deleteLookbookItem,
  deleteReview,
  moderateReview,
  toggleReviewFeatured,
  updateLookbookItem,
} from '../../lib/firestoreService';
import { compressImageFile } from '../../lib/imageUtils';

interface ReviewManagerProps {
  reviews: ProductReview[];
  lookbookItems?: LookbookItem[];
  products?: Product[];
  orders?: Order[];
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

type ManagerSubTab = 'moderation' | 'lookbook' | 'analytics';
type ReviewFilterStatus = 'all' | 'pending' | 'approved' | 'with_photo' | 'featured';

const OCCASIONS: LookbookOccasion[] = [
  'Kantor & Formal',
  'Santai & Hangout',
  'Kuliah & Harian',
  'Acara Spesial',
];

const EU_SIZES = [36, 37, 38, 39, 40, 41];

export const ReviewManager: React.FC<ReviewManagerProps> = ({
  reviews,
  lookbookItems = [],
  products = [],
  orders = [],
  onShowToast,
}) => {
  const [subTab, setSubTab] = useState<ManagerSubTab>('moderation');
  const [filterStatus, setFilterStatus] = useState<ReviewFilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Lookbook CRUD Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLookbook, setEditingLookbook] = useState<LookbookItem | null>(null);
  const [lbTitle, setLbTitle] = useState('');
  const [lbOccasion, setLbOccasion] = useState<LookbookOccasion>('Kantor & Formal');
  const [lbProductId, setLbProductId] = useState('');
  const [lbWornSize, setLbWornSize] = useState<number>(38);
  const [lbFitNote, setLbFitNote] = useState('Pas di kaki standar');
  const [lbStylingTip, setLbStylingTip] = useState('');
  const [lbImageUrl, setLbImageUrl] = useState('');
  const [lbIsActive, setLbIsActive] = useState(true);
  const [isSavingLb, setIsSavingLb] = useState(false);

  // KPI Metrics across Reviews, Lookbook & Orders
  const kpiStats = useMemo(() => {
    const approved = reviews.filter((r) => r.isApproved);
    const avgRating =
      approved.length > 0
        ? (approved.reduce((sum, r) => sum + r.rating, 0) / approved.length).toFixed(1)
        : '0.0';
    const withPhotoCount = reviews.filter((r) => Boolean(r.photoUrl)).length;
    const fitRated = reviews.filter((r) => Boolean(r.fitFeedback));
    const pasCount = fitRated.filter((r) => r.fitFeedback === 'Pas di Kaki').length;
    const fitPasPct = fitRated.length > 0 ? Math.round((pasCount / fitRated.length) * 100) : 100;

    // Determine most popular EU size from orders + reviews
    const sizeDemand: Record<number, number> = {};
    EU_SIZES.forEach((s) => {
      sizeDemand[s] = 0;
    });
    orders
      .filter((o) => o.orderStatus !== 'Dibatalkan' && o.orderStatus !== 'Ditolak')
      .forEach((o) => {
        o.items.forEach((it) => {
          sizeDemand[it.size] = (sizeDemand[it.size] || 0) + it.quantity;
        });
      });
    reviews.forEach((r) => {
      if (r.size) sizeDemand[r.size] = (sizeDemand[r.size] || 0) + 1;
    });

    let topSize = 38;
    let topSizeScore = -1;
    EU_SIZES.forEach((s) => {
      if ((sizeDemand[s] || 0) > topSizeScore) {
        topSizeScore = sizeDemand[s] || 0;
        topSize = s;
      }
    });

    return {
      avgRating,
      totalReviews: reviews.length,
      pendingCount: reviews.filter((r) => !r.isApproved).length,
      withPhotoCount,
      fitPasPct,
      fitRatedCount: fitRated.length,
      topSize,
      topSizeScore: Math.max(0, topSizeScore),
      activeLookbookCount: lookbookItems.filter((l) => l.isActive).length,
    };
  }, [reviews, orders, lookbookItems]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchesFilter =
        filterStatus === 'all' ||
        (filterStatus === 'approved' && r.isApproved) ||
        (filterStatus === 'pending' && !r.isApproved) ||
        (filterStatus === 'with_photo' && Boolean(r.photoUrl)) ||
        (filterStatus === 'featured' && Boolean(r.featuredInGallery));

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        r.customerName.toLowerCase().includes(q) ||
        r.productName.toLowerCase().includes(q) ||
        r.orderNumber.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [reviews, filterStatus, searchQuery]);

  // Size & Fit Analytics Report per Product & per EU Size
  const productFitReport = useMemo(() => {
    const productMap = new Map<
      string,
      {
        productId: string;
        productName: string;
        soldUnits: number;
        reviewCount: number;
        ratingSum: number;
        pasCount: number;
        tightCount: number;
        looseCount: number;
      }
    >();

    products.forEach((p) => {
      productMap.set(p.id, {
        productId: p.id,
        productName: p.name,
        soldUnits: 0,
        reviewCount: 0,
        ratingSum: 0,
        pasCount: 0,
        tightCount: 0,
        looseCount: 0,
      });
    });

    orders
      .filter((o) => o.orderStatus !== 'Dibatalkan' && o.orderStatus !== 'Ditolak')
      .forEach((o) => {
        o.items.forEach((it) => {
          const entry = productMap.get(it.productId) || {
            productId: it.productId,
            productName: it.name,
            soldUnits: 0,
            reviewCount: 0,
            ratingSum: 0,
            pasCount: 0,
            tightCount: 0,
            looseCount: 0,
          };
          entry.soldUnits += it.quantity;
          productMap.set(it.productId, entry);
        });
      });

    reviews.forEach((r) => {
      const entry = productMap.get(r.productId) || {
        productId: r.productId,
        productName: r.productName,
        soldUnits: 0,
        reviewCount: 0,
        ratingSum: 0,
        pasCount: 0,
        tightCount: 0,
        looseCount: 0,
      };
      entry.reviewCount += 1;
      entry.ratingSum += r.rating;
      if (r.fitFeedback === 'Pas di Kaki') entry.pasCount += 1;
      if (r.fitFeedback === 'Agak Sempit (Naik 1 Size)') entry.tightCount += 1;
      if (r.fitFeedback === 'Agak Longgar') entry.looseCount += 1;
      productMap.set(r.productId, entry);
    });

    return Array.from(productMap.values()).sort(
      (a, b) => b.reviewCount + b.soldUnits - (a.reviewCount + a.soldUnits)
    );
  }, [products, orders, reviews]);

  const sizeBreakdownReport = useMemo(() => {
    return EU_SIZES.map((size) => {
      let sold = 0;
      orders
        .filter((o) => o.orderStatus !== 'Dibatalkan' && o.orderStatus !== 'Ditolak')
        .forEach((o) => {
          o.items.forEach((it) => {
            if (it.size === size) sold += it.quantity;
          });
        });

      const sizeReviews = reviews.filter((r) => r.size === size);
      const pas = sizeReviews.filter((r) => r.fitFeedback === 'Pas di Kaki').length;
      const tight = sizeReviews.filter((r) => r.fitFeedback === 'Agak Sempit (Naik 1 Size)').length;
      const loose = sizeReviews.filter((r) => r.fitFeedback === 'Agak Longgar').length;

      return {
        size,
        sold,
        reviewCount: sizeReviews.length,
        pas,
        tight,
        loose,
      };
    });
  }, [orders, reviews]);

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

  const handleToggleFeatured = async (rev: ProductReview) => {
    try {
      const nextVal = !rev.featuredInGallery;
      await toggleReviewFeatured(rev.id, nextVal);
      onShowToast(
        nextVal
          ? `Testimoni ${rev.customerName} dipin sebagai Unggulan Galeri.`
          : `Testimoni ${rev.customerName} dilepas dari Unggulan Galeri.`,
        'success'
      );
    } catch (err: any) {
      onShowToast('Gagal memperbarui status unggulan: ' + (err?.message || 'Error'), 'error');
    }
  };

  const handleDeleteReview = async (reviewId: string, custName: string) => {
    if (!confirm(`Hapus ulasan dari ${custName} secara permanen?`)) return;
    try {
      await deleteReview(reviewId);
      onShowToast(`Ulasan dari ${custName} berhasil dihapus permanen.`, 'success');
    } catch (err: any) {
      onShowToast('Gagal menghapus ulasan: ' + (err?.message || 'Error'), 'error');
    }
  };

  const openNewLookbookForm = () => {
    setEditingLookbook(null);
    setLbTitle('');
    setLbOccasion('Kantor & Formal');
    setLbProductId(products[0]?.id || '');
    setLbWornSize(38);
    setLbFitNote('Pas di kaki standar');
    setLbStylingTip('');
    setLbImageUrl(products[0]?.imageUrl || '');
    setLbIsActive(true);
    setIsFormOpen(true);
  };

  const openEditLookbookForm = (item: LookbookItem) => {
    setEditingLookbook(item);
    setLbTitle(item.title);
    setLbOccasion(item.occasion);
    setLbProductId(item.productId);
    setLbWornSize(item.wornSize);
    setLbFitNote(item.fitNote);
    setLbStylingTip(item.stylingTip);
    setLbImageUrl(item.imageUrl);
    setLbIsActive(item.isActive);
    setIsFormOpen(true);
  };

  const handleSaveLookbook = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedProd = products.find((p) => p.id === lbProductId);
    if (!lbTitle.trim() || !selectedProd) {
      onShowToast('Judul lookbook dan produk tertaut wajib diisi.', 'error');
      return;
    }

    const finalImageUrl = lbImageUrl.trim() || selectedProd.imageUrl;

    try {
      setIsSavingLb(true);
      if (editingLookbook) {
        await updateLookbookItem(editingLookbook.id, {
          title: lbTitle.trim(),
          occasion: lbOccasion,
          productId: selectedProd.id,
          productName: selectedProd.name,
          wornSize: lbWornSize,
          fitNote: lbFitNote.trim() || 'Pas di ukuran normal',
          stylingTip: lbStylingTip.trim(),
          imageUrl: finalImageUrl,
          isActive: lbIsActive,
        });
        onShowToast('Item Lookbook berhasil diperbarui!', 'success');
      } else {
        await addLookbookItem({
          title: lbTitle.trim(),
          occasion: lbOccasion,
          productId: selectedProd.id,
          productName: selectedProd.name,
          wornSize: lbWornSize,
          fitNote: lbFitNote.trim() || 'Pas di ukuran normal',
          stylingTip: lbStylingTip.trim(),
          imageUrl: finalImageUrl,
          isActive: lbIsActive,
        });
        onShowToast('Lookbook gaya baru berhasil ditambahkan ke storefront!', 'success');
      }
      setIsFormOpen(false);
    } catch (err: any) {
      onShowToast('Gagal menyimpan lookbook: ' + (err?.message || 'Error'), 'error');
    } finally {
      setIsSavingLb(false);
    }
  };

  const handleToggleLookbookActive = async (item: LookbookItem) => {
    try {
      await updateLookbookItem(item.id, { isActive: !item.isActive });
      onShowToast(
        `Lookbook "${item.title}" ${!item.isActive ? 'ditampilkan' : 'disembunyikan'} di webstore.`,
        'success'
      );
    } catch (err: any) {
      onShowToast('Gagal mengubah status lookbook: ' + (err?.message || 'Error'), 'error');
    }
  };

  const handleDeleteLookbook = async (item: LookbookItem) => {
    if (!confirm(`Hapus lookbook "${item.title}"?`)) return;
    try {
      await deleteLookbookItem(item.id);
      onShowToast(`Lookbook "${item.title}" telah dihapus.`, 'success');
    } catch (err: any) {
      onShowToast('Gagal menghapus lookbook: ' + (err?.message || 'Error'), 'error');
    }
  };

  const handleExportReportCsv = () => {
    const header = [
      'Produk',
      'Total Terjual (Pasang)',
      'Total Ulasan',
      'Rata-rata Rating',
      'Pas di Kaki',
      'Agak Sempit',
      'Agak Longgar',
    ];
    const rows = productFitReport.map((row) => [
      `"${row.productName.replace(/"/g, '""')}"`,
      row.soldUnits,
      row.reviewCount,
      row.reviewCount > 0 ? (row.ratingSum / row.reviewCount).toFixed(2) : '0.00',
      row.pasCount,
      row.tightCount,
      row.looseCount,
    ]);

    const csvContent =
      '\uFEFF' + [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `laporan-fit-ulasan-mochisteps-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast('Laporan CSV ulasan & kecocokan ukuran berhasil diunduh.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-pink-100 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-pink-100 text-[#be185d] shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-lg sm:text-xl text-gray-900">
              Galeri Testimoni, Lookbook &amp; Analitik Ukuran
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Moderasi foto pembeli, kurasi inspirasi gaya storefront, dan pantau laporan kecocokan ukuran EU.
            </p>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-2xl border border-gray-200 overflow-x-auto scrollbar-none">
          {[
            {
              id: 'moderation' as const,
              label: `Moderasi Testimoni (${reviews.length})`,
              icon: Star,
            },
            {
              id: 'lookbook' as const,
              label: `Lookbook Gaya (${lookbookItems.length})`,
              icon: Sparkles,
            },
            {
              id: 'analytics' as const,
              label: 'Laporan Fit & Ukuran',
              icon: BarChart3,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSubTab(tab.id)}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  subTab === tab.id
                    ? 'bg-white text-[#be185d] shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-gray-500 block">Rata-rata Rating Toko</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold font-heading text-[#be185d] tabular-nums">
              {kpiStats.avgRating}
            </span>
            <span className="text-xs text-gray-400 tabular-nums">/ 5.0</span>
          </div>
          <span className="text-[11px] text-gray-500 block tabular-nums">
            {kpiStats.pendingCount > 0
              ? `${kpiStats.pendingCount} ulasan menunggu persetujuan`
              : 'Semua ulasan sudah ditinjau'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-gray-500 block">Testimoni &amp; Foto Pembeli</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-heading text-gray-900 tabular-nums">
              {kpiStats.totalReviews}
            </span>
            <span className="text-xs font-semibold text-emerald-700 tabular-nums">
              {kpiStats.withPhotoCount} berfoto
            </span>
          </div>
          <span className="text-[11px] text-gray-500 block tabular-nums">
            {kpiStats.activeLookbookCount} lookbook aktif di storefront
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-gray-500 block">Kecocokan “Pas di Kaki”</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold font-heading text-emerald-700 tabular-nums">
              {kpiStats.fitPasPct}%
            </span>
          </div>
          <span className="text-[11px] text-gray-500 block tabular-nums">
            Dari {kpiStats.fitRatedCount} ulasan dengan info fit
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-gray-500 block">Ukuran Paling Diminati</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-heading text-gray-900 font-mono tabular-nums">
              EU {kpiStats.topSize}
            </span>
          </div>
          <span className="text-[11px] text-gray-500 block tabular-nums">
            {kpiStats.topSizeScore} transaksi &amp; ulasan tercatat
          </span>
        </div>
      </div>

      {/* ================= SUB-TAB 1: MODERASI TESTIMONI ================= */}
      {subTab === 'moderation' && (
        <div className="space-y-4">
          {/* Search & Status Filter */}
          <div className="bg-white p-4 rounded-2xl border border-pink-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama pembeli, produk, atau nomor pesanan..."
                className="w-full min-h-[40px] pl-9 pr-3 py-2 rounded-xl border border-pink-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-pink-300"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'pending', label: 'Menunggu' },
                { id: 'approved', label: 'Disetujui' },
                { id: 'with_photo', label: 'Berfoto' },
                { id: 'featured', label: 'Unggulan' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterStatus(tab.id as ReviewFilterStatus)}
                  className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    filterStatus === tab.id
                      ? 'bg-[#be185d] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-pink-50 hover:text-[#be185d]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {filteredReviews.length === 0 ? (
            <div className="bg-white rounded-3xl border border-pink-100 p-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-pink-50 text-pink-300 flex items-center justify-center mx-auto">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-gray-800 text-sm">Tidak Ada Ulasan Sesuai Filter</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Ulasan yang dikirim pelanggan dari modal Pelacak Kiriman akan muncul di sini untuk ditinjau dan dipin ke galeri storefront.
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
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-pink-100 text-[#be185d] font-bold text-sm flex items-center justify-center shrink-0">
                          {rev.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-gray-900">{rev.customerName}</h4>
                          <p className="text-[10px] text-gray-400 tabular-nums">
                            #{rev.orderNumber} · {new Date(rev.createdAt).toLocaleDateString('id-ID')}
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
                        <span
                          className={`text-[10px] font-bold ${
                            rev.isApproved ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {rev.isApproved ? 'Tampil di Web' : 'Menunggu Persetujuan'}
                        </span>
                      </div>
                    </div>

                    {/* Product & Size Fit Metadata */}
                    <div className="mt-2.5 text-xs text-gray-600 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-[#be185d]" />
                      <span className="font-semibold text-[#be185d]">{rev.productName}</span>
                      {rev.size && <span className="tabular-nums">· EU {rev.size}</span>}
                      {rev.fitFeedback && <span>· {rev.fitFeedback}</span>}
                    </div>

                    {/* Comment */}
                    <p className="mt-2.5 text-xs text-gray-700 leading-relaxed bg-gray-50/80 p-3 rounded-2xl border border-gray-100">
                      “{rev.comment}”
                    </p>

                    {/* Photo */}
                    {rev.photoUrl && (
                      <div className="mt-3 flex items-center gap-2.5">
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
                        <span className="text-[11px] text-gray-500">Klik foto untuk memperbesar</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleDeleteReview(rev.id, rev.customerName)}
                      className="min-h-[36px] px-3 py-1.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(rev)}
                        className={`min-h-[36px] px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                          rev.featuredInGallery
                            ? 'bg-pink-50 border-[#be185d] text-[#be185d]'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{rev.featuredInGallery ? 'Unggulan Galeri' : 'Pin Galeri'}</span>
                      </button>

                      {rev.isApproved ? (
                        <button
                          type="button"
                          onClick={() => handleModerate(rev.id, false, rev.customerName)}
                          className="min-h-[36px] px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold transition-all cursor-pointer"
                        >
                          Sembunyikan
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleModerate(rev.id, true, rev.customerName)}
                          className="min-h-[36px] px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-xs font-bold shadow-xs hover:brightness-105 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Setujui</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= SUB-TAB 2: KELOLA LOOKBOOK GAYA ================= */}
      {subTab === 'lookbook' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-pink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-heading font-bold text-sm text-gray-900">
                Kurasi Lookbook Gaya Storefront
              </h3>
              <p className="text-xs text-gray-500">
                Setiap foto lookbook tertaut langsung ke stok ukuran produk di katalog untuk membantu konversi pembeli.
              </p>
            </div>

            <button
              type="button"
              onClick={openNewLookbookForm}
              className="min-h-[42px] px-4 py-2 rounded-xl bg-[#be185d] hover:bg-[#9d174d] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Lookbook Gaya</span>
            </button>
          </div>

          {lookbookItems.length === 0 ? (
            <div className="bg-white rounded-3xl border border-pink-100 p-10 text-center space-y-2">
              <Camera className="w-8 h-8 text-pink-300 mx-auto" />
              <p className="font-bold text-sm text-gray-800">Belum Ada Item Lookbook</p>
              <p className="text-xs text-gray-500">Klik “Tambah Lookbook Gaya” untuk membuat inspirasi outfit pertama.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lookbookItems.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border overflow-hidden flex flex-col justify-between ${
                    item.isActive ? 'border-pink-100' : 'border-gray-200 opacity-75'
                  }`}
                >
                  <div>
                    <div className="relative aspect-[4/3] bg-[#fdf2f4] overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="font-semibold text-[#be185d]">{item.occasion}</span>
                        <span className={item.isActive ? 'text-emerald-700 font-bold' : 'text-gray-400 font-bold'}>
                          {item.isActive ? 'Aktif' : 'Disembunyikan'}
                        </span>
                      </div>
                      <h4 className="font-heading font-bold text-sm text-gray-900">{item.title}</h4>
                      <p className="text-xs text-gray-600 tabular-nums">
                        {item.productName} · Dipakai EU {item.wornSize}
                      </p>
                      <p className="text-[11px] text-gray-500 line-clamp-2">{item.fitNote}</p>
                    </div>
                  </div>

                  <div className="px-4 pb-4 pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleDeleteLookbook(item)}
                      className="min-h-[36px] px-2.5 py-1 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 text-xs font-bold cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleLookbookActive(item)}
                        className="min-h-[36px] px-3 py-1 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                      >
                        {item.isActive ? 'Sembunyikan' : 'Tampilkan'}
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditLookbookForm(item)}
                        className="min-h-[36px] px-3 py-1 rounded-xl bg-pink-50 text-[#be185d] hover:bg-pink-100 text-xs font-bold cursor-pointer flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= SUB-TAB 3: LAPORAN FIT & UKURAN ================= */}
      {subTab === 'analytics' && (
        <div className="space-y-5">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-pink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-heading font-bold text-sm sm:text-base text-gray-900">
                Laporan Kecocokan Ukuran &amp; Kepuasan Pembeli
              </h3>
              <p className="text-xs text-gray-500">
                Pantau apakah suatu model sering dinilai agak sempit atau longgar oleh pembeli untuk memperbarui rekomendasi size.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportReportCsv}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor Laporan CSV</span>
            </button>
          </div>

          {/* Size EU 36-41 Distribution */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-pink-100 space-y-3">
            <h4 className="font-heading font-bold text-sm text-gray-900 flex items-center gap-2">
              <Ruler className="w-4 h-4 text-[#be185d]" />
              <span>Distribusi Permintaan &amp; Kecocokan per Ukuran (EU 36–41)</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {sizeBreakdownReport.map((row) => (
                <div
                  key={row.size}
                  className="p-3 rounded-xl bg-[#fffbfc] border border-pink-100 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono tabular-nums font-extrabold text-sm text-[#be185d]">
                      EU {row.size}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-500 tabular-nums">
                      {row.sold} terjual
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 tabular-nums">
                    {row.reviewCount} ulasan ({row.pas} pas · {row.tight} sempit)
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Per-Product Fit Table */}
          <div className="bg-white rounded-2xl border border-pink-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#fffbfc] border-b border-pink-100 text-gray-500 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Model Flatshoes</th>
                    <th className="py-3 px-3 text-right">Terjual</th>
                    <th className="py-3 px-3 text-right">Ulasan</th>
                    <th className="py-3 px-3 text-right">Rating</th>
                    <th className="py-3 px-3 text-right">Pas</th>
                    <th className="py-3 px-3 text-right">Sempit</th>
                    <th className="py-3 px-3 text-right">Longgar</th>
                    <th className="py-3 px-4">Rekomendasi Fit Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-50">
                  {productFitReport.map((row) => {
                    const avg =
                      row.reviewCount > 0 ? (row.ratingSum / row.reviewCount).toFixed(1) : '-';
                    const fitTotal = row.pasCount + row.tightCount + row.looseCount;
                    const tightRatio = fitTotal > 0 ? row.tightCount / fitTotal : 0;
                    const looseRatio = fitTotal > 0 ? row.looseCount / fitTotal : 0;

                    let advice = 'Normal (True to Size)';
                    let adviceClass = 'text-emerald-700 font-semibold';
                    if (fitTotal === 0) {
                      advice = 'Belum ada feedback fit';
                      adviceClass = 'text-gray-400';
                    } else if (tightRatio >= 0.35) {
                      advice = 'Sarankan Naik 1 Size';
                      adviceClass = 'text-amber-700 font-bold';
                    } else if (looseRatio >= 0.35) {
                      advice = 'Cenderung Longgar';
                      adviceClass = 'text-blue-700 font-bold';
                    }

                    return (
                      <tr key={row.productId} className="hover:bg-pink-50/30">
                        <td className="py-3 px-4 font-bold text-gray-900">{row.productName}</td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums">{row.soldUnits}</td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums">{row.reviewCount}</td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums">{avg}</td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-700">
                          {row.pasCount}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-amber-700">
                          {row.tightCount}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-blue-700">
                          {row.looseCount}
                        </td>
                        <td className={`py-3 px-4 ${adviceClass}`}>{advice}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Tambah/Edit Lookbook */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto"
          onClick={() => setIsFormOpen(false)}
        >
          <div
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl border border-pink-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <h3 className="font-heading font-extrabold text-base text-gray-900">
                {editingLookbook ? 'Edit Item Lookbook Gaya' : 'Tambah Lookbook Gaya Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLookbook} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Judul Gaya / Outfit</label>
                <input
                  type="text"
                  required
                  value={lbTitle}
                  onChange={(e) => setLbTitle(e.target.value)}
                  placeholder="Contoh: Smart Office Beige & Peach Ribbon"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-hidden focus:ring-2 focus:ring-pink-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Suasana / Acara</label>
                  <select
                    value={lbOccasion}
                    onChange={(e) => setLbOccasion(e.target.value as LookbookOccasion)}
                    className="w-full px-3 py-2.5 rounded-xl border border-pink-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-300"
                  >
                    {OCCASIONS.map((occ) => (
                      <option key={occ} value={occ}>
                        {occ}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Ukuran yang Dipakai</label>
                  <select
                    value={lbWornSize}
                    onChange={(e) => setLbWornSize(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-pink-200 bg-white font-mono focus:outline-hidden focus:ring-2 focus:ring-pink-300"
                  >
                    {EU_SIZES.map((s) => (
                      <option key={s} value={s}>
                        EU {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Produk Flatshoes Tertaut</label>
                <select
                  value={lbProductId}
                  onChange={(e) => setLbProductId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-pink-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-300"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Catatan Kecocokan Ukuran (Fit Note)</label>
                <input
                  type="text"
                  value={lbFitNote}
                  onChange={(e) => setLbFitNote(e.target.value)}
                  placeholder="Contoh: Pas di kaki standar 24.0 cm"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-hidden focus:ring-2 focus:ring-pink-300"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Tips Padu Padan Outfit</label>
                <textarea
                  rows={2}
                  value={lbStylingTip}
                  onChange={(e) => setLbStylingTip(e.target.value)}
                  placeholder="Ceritakan inspirasi outfit dan kenyamanan sol mochi..."
                  className="w-full p-3 rounded-xl border border-pink-200 focus:outline-hidden focus:ring-2 focus:ring-pink-300"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-gray-700">Foto Lookbook</label>
                <div className="flex items-center gap-3">
                  {lbImageUrl && (
                    <img
                      src={lbImageUrl}
                      alt="Pratinjau lookbook"
                      className="w-16 h-20 rounded-xl object-cover border border-pink-200 shrink-0"
                    />
                  )}
                  <label className="flex-1 py-2.5 px-3 rounded-xl border border-dashed border-pink-300 bg-pink-50/50 hover:bg-pink-50 text-[#be185d] font-bold flex items-center justify-center gap-2 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const compressed = await compressImageFile(file, 720, 0.8);
                          setLbImageUrl(compressed);
                        }
                      }}
                    />
                    <Upload className="w-4 h-4" />
                    <span>Unggah Foto Gaya (Otomatis Kompres)</span>
                  </label>
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lbIsActive}
                  onChange={(e) => setLbIsActive(e.target.checked)}
                  className="w-4 h-4 accent-[#be185d]"
                />
                <span className="font-semibold text-gray-700">Tampilkan langsung di storefront</span>
              </label>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingLb}
                  className="px-5 py-2.5 rounded-xl bg-[#be185d] hover:bg-[#9d174d] text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {isSavingLb ? 'Menyimpan...' : editingLookbook ? 'Simpan Perubahan' : 'Publikasikan Lookbook'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Zoom Modal for Review Photo */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in"
          onClick={() => setZoomedImage(null)}
        >
          <div
            className="relative max-w-xl max-h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={zoomedImage}
              alt="Foto ulasan pembeli penuh"
              className="w-full h-auto max-h-[75vh] object-contain rounded-2xl"
            />
            <button
              type="button"
              onClick={() => setZoomedImage(null)}
              className="mt-2 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl cursor-pointer"
            >
              Tutup Foto
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
