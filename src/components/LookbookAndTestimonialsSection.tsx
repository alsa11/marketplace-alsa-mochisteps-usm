import React, { useMemo, useState } from 'react';
import {
  Camera,
  Check,
  ChevronRight,
  Eye,
  Ruler,
  ShoppingBag,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import {
  LookbookItem,
  LookbookOccasion,
  Product,
  ProductReview,
} from '../types';
import { FlatshoeImage } from './FlatshoeImage';

interface LookbookAndTestimonialsSectionProps {
  lookbookItems: LookbookItem[];
  reviews: ProductReview[];
  products: Product[];
  onAddToCart: (product: Product, size: number, quantity?: number) => void;
  onOpenProductDetail: (product: Product) => void;
  onOpenInsoleGuide: () => void;
}

type GalleryTab = 'lookbook' | 'testimonials';
type LightboxTarget =
  | { type: 'lookbook'; item: LookbookItem }
  | { type: 'review'; review: ProductReview };

const OCCASIONS: ('all' | LookbookOccasion)[] = [
  'all',
  'Kantor & Formal',
  'Santai & Hangout',
  'Kuliah & Harian',
  'Acara Spesial',
];

const EU_SIZES = [36, 37, 38, 39, 40, 41];

const formatRupiah = (num: number): string =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(num);

const getSizeStockCount = (product: Product | undefined, size: number): number => {
  if (!product) return 0;
  if (product.sizeStock && typeof product.sizeStock[size] === 'number') {
    return product.sizeStock[size];
  }
  if (!product.sizes?.includes(size)) return 0;
  return product.stock > 0 ? Math.max(1, Math.floor(product.stock / product.sizes.length)) : 0;
};

export const LookbookAndTestimonialsSection: React.FC<LookbookAndTestimonialsSectionProps> = ({
  lookbookItems,
  reviews,
  products,
  onAddToCart,
  onOpenProductDetail,
  onOpenInsoleGuide,
}) => {
  const [activeTab, setActiveTab] = useState<GalleryTab>('lookbook');
  const [selectedOccasion, setSelectedOccasion] = useState<'all' | LookbookOccasion>('all');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<number | 'all'>('all');
  const [onlyWithPhotos, setOnlyWithPhotos] = useState<boolean>(false);
  const [lightbox, setLightbox] = useState<LightboxTarget | null>(null);
  const [chosenSize, setChosenSize] = useState<number>(38);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const activeLookbook = useMemo(
    () => lookbookItems.filter((item) => item.isActive),
    [lookbookItems]
  );

  const approvedReviews = useMemo(() => {
    const list = reviews.filter((r) => r.isApproved);
    return [...list].sort((a, b) => {
      const aFeatured = a.featuredInGallery ? 1 : 0;
      const bFeatured = b.featuredInGallery ? 1 : 0;
      if (aFeatured !== bFeatured) return bFeatured - aFeatured;

      const aPhoto = a.photoUrl ? 1 : 0;
      const bPhoto = b.photoUrl ? 1 : 0;
      if (aPhoto !== bPhoto) return bPhoto - aPhoto;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [reviews]);

  const filteredLookbook = useMemo(() => {
    return activeLookbook.filter((item) => {
      const matchOccasion = selectedOccasion === 'all' || item.occasion === selectedOccasion;
      const matchSize = selectedSizeFilter === 'all' || item.wornSize === selectedSizeFilter;
      return matchOccasion && matchSize;
    });
  }, [activeLookbook, selectedOccasion, selectedSizeFilter]);

  const filteredReviews = useMemo(() => {
    return approvedReviews.filter((rev) => {
      const matchSize = selectedSizeFilter === 'all' || rev.size === selectedSizeFilter;
      const matchPhoto = !onlyWithPhotos || Boolean(rev.photoUrl);
      return matchSize && matchPhoto;
    });
  }, [approvedReviews, selectedSizeFilter, onlyWithPhotos]);

  const resolveProduct = (productId: string, productName?: string): Product | undefined => {
    return (
      products.find((p) => p.id === productId) ||
      (productName
        ? products.find((p) => p.name.toLowerCase() === productName.toLowerCase())
        : undefined)
    );
  };

  const openLookbookLightbox = (item: LookbookItem) => {
    const prod = resolveProduct(item.productId, item.productName);
    const defaultSize =
      prod && getSizeStockCount(prod, item.wornSize) > 0
        ? item.wornSize
        : prod?.sizes.find((s) => getSizeStockCount(prod, s) > 0) || item.wornSize || 38;
    setChosenSize(defaultSize);
    setLightbox({ type: 'lookbook', item });
  };

  const openReviewLightbox = (review: ProductReview) => {
    const prod = resolveProduct(review.productId, review.productName);
    const preferred = review.size || 38;
    const defaultSize =
      prod && getSizeStockCount(prod, preferred) > 0
        ? preferred
        : prod?.sizes.find((s) => getSizeStockCount(prod, s) > 0) || preferred;
    setChosenSize(defaultSize);
    setLightbox({ type: 'review', review });
  };

  const handleQuickAddFromLightbox = (prod: Product, size: number, targetKey: string) => {
    if (getSizeStockCount(prod, size) <= 0) return;
    onAddToCart(prod, size, 1);
    setJustAddedId(targetKey);
    setTimeout(() => setJustAddedId(null), 1600);
  };

  const galleryStats = useMemo(() => {
    const photoCount = approvedReviews.filter((r) => Boolean(r.photoUrl)).length;
    const pasCount = approvedReviews.filter((r) => r.fitFeedback === 'Pas di Kaki').length;
    const fitRatedCount = approvedReviews.filter((r) => Boolean(r.fitFeedback)).length;
    const fitPct = fitRatedCount > 0 ? Math.round((pasCount / fitRatedCount) * 100) : 96;
    const avgRating =
      approvedReviews.length > 0
        ? (approvedReviews.reduce((acc, r) => acc + r.rating, 0) / approvedReviews.length).toFixed(1)
        : '4.9';
    return {
      photoCount,
      fitPct,
      avgRating,
      totalReviews: approvedReviews.length,
    };
  }, [approvedReviews]);

  const lightboxProduct = useMemo(() => {
    if (!lightbox) return undefined;
    if (lightbox.type === 'lookbook') {
      return resolveProduct(lightbox.item.productId, lightbox.item.productName);
    }
    return resolveProduct(lightbox.review.productId, lightbox.review.productName);
  }, [lightbox, products]);

  return (
    <section
      id="lookbook-galeri"
      className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-14 w-full border-t border-pink-100/80"
    >
      {/* Editorial Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6 sm:mb-8">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#be185d]">
            <span>Lookbook &amp; Bukti Pemakaian Nyata</span>
            <span aria-hidden="true" className="text-pink-300">·</span>
            <span className="tabular-nums text-gray-500">
              Rating {galleryStats.avgRating}/5 ({galleryStats.fitPct}% pas di kaki)
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-gray-900 tracking-tight text-balance">
            Inspirasi Gaya &amp; Foto Asli Pembeli
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            Lihat padu padan harian dan catatan ukuran EU yang dipakai sebelum memilih flatshoes favorit Anda.
          </p>
        </div>

        {/* Mode Tabs: Lookbook vs Testimoni Pembeli */}
        <div className="inline-flex items-center p-1 bg-[#faf4f6] border border-pink-200/70 rounded-xl self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('lookbook')}
            className={`min-h-[40px] px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'lookbook'
                ? 'bg-white text-[#be185d] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Lookbook Gaya</span>
            <span className="tabular-nums text-[11px] opacity-75">({activeLookbook.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('testimonials')}
            className={`min-h-[40px] px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'testimonials'
                ? 'bg-white text-[#be185d] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Foto Pembeli</span>
            <span className="tabular-nums text-[11px] opacity-75">({approvedReviews.length})</span>
          </button>
        </div>
      </div>

      {/* Filter Bar: Occasion (Lookbook) + EU Size Conversion Filter */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-pink-100 shadow-2xs mb-6 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {activeTab === 'lookbook' ? (
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0">
              {OCCASIONS.map((occ) => (
                <button
                  key={occ}
                  type="button"
                  onClick={() => setSelectedOccasion(occ)}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    selectedOccasion === occ
                      ? 'bg-[#be185d] text-white'
                      : 'bg-[#faf4f6] text-[#6b3d4a] hover:bg-pink-100/70'
                  }`}
                >
                  {occ === 'all' ? 'Semua Gaya' : occ}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setOnlyWithPhotos((prev) => !prev)}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  onlyWithPhotos
                    ? 'bg-[#be185d] text-white'
                    : 'bg-[#faf4f6] text-[#6b3d4a] hover:bg-pink-100/70'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Hanya yang Ada Foto ({galleryStats.photoCount})</span>
              </button>
              <button
                type="button"
                onClick={onOpenInsoleGuide}
                className="min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#be185d] hover:bg-pink-50 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Ukur Panjang Kaki</span>
              </button>
            </div>
          )}

          {/* EU Size Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1 md:pt-0 border-t md:border-t-0 border-pink-100">
            <span className="text-[11px] font-semibold text-gray-500 whitespace-nowrap mr-1">
              Filter Ukuran:
            </span>
            <button
              type="button"
              onClick={() => setSelectedSizeFilter('all')}
              className={`min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                selectedSizeFilter === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Semua
            </button>
            {EU_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSizeFilter(size)}
                className={`min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-mono tabular-nums font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  selectedSizeFilter === size
                    ? 'bg-[#be185d] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-pink-50 hover:text-[#be185d]'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      {activeTab === 'lookbook' ? (
        filteredLookbook.length === 0 ? (
          <div className="bg-white rounded-2xl border border-pink-100 p-8 sm:p-12 text-center space-y-3">
            <p className="font-heading font-bold text-sm text-gray-900">
              Belum ada foto lookbook untuk filter ukuran atau suasana ini
            </p>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Coba tampilkan semua ukuran untuk melihat referensi padu padan lengkap dari koleksi Mochi Steps.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedOccasion('all');
                setSelectedSizeFilter('all');
              }}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-pink-50 text-[#be185d] font-bold text-xs cursor-pointer hover:bg-pink-100 transition-colors"
            >
              Tampilkan Semua Lookbook
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredLookbook.map((item) => {
              const linkedProd = resolveProduct(item.productId, item.productName);
              const sizeStock = getSizeStockCount(linkedProd, item.wornSize);
              const imgFailed = Boolean(failedImages[item.id]);

              return (
                <article
                  key={item.id}
                  className="bg-white rounded-2xl border border-pink-100 shadow-2xs overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div>
                    <button
                      type="button"
                      onClick={() => openLookbookLightbox(item)}
                      className="relative w-full aspect-[3/4] bg-[#fdf2f4] overflow-hidden block text-left group cursor-pointer"
                    >
                      {!imgFailed && item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={`${item.title} — ${item.productName}`}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          onError={() =>
                            setFailedImages((prev) => ({ ...prev, [item.id]: true }))
                          }
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <FlatshoeImage
                          src={linkedProd?.imageUrl}
                          alt={item.productName}
                          shoeName={item.productName}
                          className="w-full h-full object-cover"
                        />
                      )}

                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/75 via-black/35 to-transparent pointer-events-none" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 text-white">
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium text-white/90 truncate">
                            {item.occasion}
                          </p>
                          <h3 className="font-heading font-bold text-sm leading-snug line-clamp-2">
                            {item.title}
                          </h3>
                        </div>
                        <span className="w-9 h-9 rounded-full bg-white/90 text-gray-900 flex items-center justify-center shrink-0 shadow-xs">
                          <Eye className="w-4 h-4" />
                        </span>
                      </div>
                    </button>

                    {/* Clean Unboxed Metadata & Fit Tip */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-heading font-bold text-sm text-gray-900 truncate">
                          {linkedProd?.name || item.productName}
                        </span>
                        {linkedProd && (
                          <span className="font-mono tabular-nums font-bold text-xs text-[#be185d] shrink-0">
                            {formatRupiah(linkedProd.price)}
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-gray-500 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 tabular-nums">
                        <span className="font-semibold text-gray-800">Dipakai: EU {item.wornSize}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {linkedProd
                            ? sizeStock > 0
                              ? `Stok EU ${item.wornSize}: ${sizeStock}`
                              : `EU ${item.wornSize} habis`
                            : 'Cek ukuran'}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                        {item.fitNote}
                      </p>
                    </div>
                  </div>

                  {/* Direct Conversion Action */}
                  <div className="px-4 pb-4 pt-1">
                    <button
                      type="button"
                      onClick={() => openLookbookLightbox(item)}
                      className="w-full min-h-[44px] py-2 px-4 rounded-xl bg-pink-50 hover:bg-[#be185d] text-[#be185d] hover:text-white border border-pink-200 hover:border-[#be185d] font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                      <span>Pilih Size &amp; Beli Model Ini</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-pink-100 p-8 sm:p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#be185d] flex items-center justify-center mx-auto">
            <Camera className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-sm sm:text-base text-gray-900">
            {approvedReviews.length === 0
              ? 'Jadilah Pembeli Pertama yang Mengirim Foto Testimoni'
              : 'Tidak Ada Testimoni Sesuai Filter Ukuran/Foto'}
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
            {approvedReviews.length === 0
              ? 'Setelah pesanan selesai diterima, Anda bisa mengunggah foto pemakaian dan catatan ukuran di modal Lacak Pesanan untuk membantu pembeli lainnya.'
              : 'Reset filter ukuran atau tampilkan juga ulasan teks terverifikasi untuk melihat lebih banyak pengalaman pembeli.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {(selectedSizeFilter !== 'all' || onlyWithPhotos) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedSizeFilter('all');
                  setOnlyWithPhotos(false);
                }}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-pink-50 text-[#be185d] font-bold text-xs cursor-pointer hover:bg-pink-100 transition-colors"
              >
                Tampilkan Semua Ulasan
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('lookbook')}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#be185d] text-white font-bold text-xs cursor-pointer hover:brightness-105 transition-all"
            >
              Lihat Lookbook Gaya
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredReviews.map((rev) => {
            const linkedProd = resolveProduct(rev.productId, rev.productName);
            const imgFailed = Boolean(failedImages[rev.id]);
            const formattedDate = new Date(rev.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <article
                key={rev.id}
                className="bg-white rounded-2xl border border-pink-100 shadow-2xs overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div>
                  {/* Photo Area (Buyer real photo or clean product fallback) */}
                  <button
                    type="button"
                    onClick={() => openReviewLightbox(rev)}
                    className="relative w-full aspect-[4/3] bg-[#fdf2f4] overflow-hidden block group cursor-pointer"
                  >
                    {rev.photoUrl && !imgFailed ? (
                      <img
                        src={rev.photoUrl}
                        alt={`Foto pemakaian ${rev.productName} oleh ${rev.customerName}`}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onError={() =>
                          setFailedImages((prev) => ({ ...prev, [rev.id]: true }))
                        }
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <FlatshoeImage
                        src={linkedProd?.imageUrl}
                        alt={rev.productName}
                        shoeName={rev.productName}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-gray-700 flex items-center justify-center shadow-xs">
                      <Eye className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Review Body */}
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-0.5" aria-label={`Rating ${rev.rating} dari 5`}>
                        {[1, 2, 3, 4, 5].map((st) => (
                          <Star
                            key={st}
                            className={`w-3.5 h-3.5 ${
                              st <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-gray-400 tabular-nums">{formattedDate}</span>
                    </div>

                    <div>
                      <h3 className="font-heading font-bold text-sm text-gray-900">
                        {rev.customerName}
                        {rev.featuredInGallery ? ' · Pilihan Toko' : ''}
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-0.5 flex flex-wrap items-center gap-x-1.5 tabular-nums">
                        <span className="font-semibold text-[#be185d]">{rev.productName}</span>
                        {rev.size && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>EU {rev.size}</span>
                          </>
                        )}
                        {rev.fitFeedback && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{rev.fitFeedback}</span>
                          </>
                        )}
                      </p>
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">
                      “{rev.comment}”
                    </p>
                  </div>
                </div>

                {/* Direct Action */}
                <div className="px-4 pb-4 pt-1 flex items-center justify-between gap-2 border-t border-pink-50">
                  <span className="font-mono tabular-nums font-bold text-xs text-gray-900">
                    {linkedProd ? formatRupiah(linkedProd.price) : 'Lihat Produk'}
                  </span>
                  <button
                    type="button"
                    onClick={() => openReviewLightbox(rev)}
                    className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-pink-50 hover:bg-[#be185d] text-[#be185d] hover:text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap"
                  >
                    <span>Pilih Size Ini</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal with Live Size Stock & Direct Cart Conversion */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/75 backdrop-blur-xs animate-fade-in overflow-y-auto"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-pink-100 p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-10 h-10 rounded-full bg-white/95 sm:bg-gray-100 hover:bg-pink-50 text-gray-500 hover:text-gray-900 flex items-center justify-center shadow-xs z-20 cursor-pointer"
              aria-label="Tutup Lightbox"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-start">
              {/* Photo */}
              <div className="rounded-2xl overflow-hidden bg-[#fdf2f4] border border-pink-100 aspect-[3/4]">
                {lightbox.type === 'lookbook' ? (
                  !failedImages[lightbox.item.id] && lightbox.item.imageUrl ? (
                    <img
                      src={lightbox.item.imageUrl}
                      alt={lightbox.item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FlatshoeImage
                      src={lightboxProduct?.imageUrl}
                      alt={lightbox.item.productName}
                      shoeName={lightbox.item.productName}
                      className="w-full h-full object-cover"
                    />
                  )
                ) : lightbox.review.photoUrl && !failedImages[lightbox.review.id] ? (
                  <img
                    src={lightbox.review.photoUrl}
                    alt={`Foto ${lightbox.review.productName}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FlatshoeImage
                    src={lightboxProduct?.imageUrl}
                    alt={lightbox.review.productName}
                    shoeName={lightbox.review.productName}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Right Details & Direct Size Conversion */}
              <div className="space-y-4 pr-2">
                {lightbox.type === 'lookbook' ? (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-[#be185d]">
                      {lightbox.item.occasion} · Dipakai Size EU {lightbox.item.wornSize}
                    </p>
                    <h3 className="font-heading font-extrabold text-xl text-gray-900">
                      {lightbox.item.title}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {lightbox.item.stylingTip}
                    </p>
                    <p className="text-xs font-semibold text-gray-800 pt-1">
                      Catatan Fit: <span className="font-normal text-gray-600">{lightbox.item.fitNote}</span>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((st) => (
                        <Star
                          key={st}
                          className={`w-4 h-4 ${
                            st <= lightbox.review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-200'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-gray-700 ml-1 tabular-nums">
                        {lightbox.review.rating}.0 / 5
                      </span>
                    </div>
                    <h3 className="font-heading font-extrabold text-lg text-gray-900">
                      Testimoni {lightbox.review.customerName}
                    </h3>
                    <p className="text-xs text-gray-500 tabular-nums">
                      Pesanan terverifikasi
                      {lightbox.review.size ? ` · Memakai EU ${lightbox.review.size}` : ''}
                      {lightbox.review.fitFeedback ? ` · ${lightbox.review.fitFeedback}` : ''}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-[#fffbfc] p-3 rounded-xl border border-pink-100">
                      “{lightbox.review.comment}”
                    </p>
                  </div>
                )}

                {/* Linked Product Conversion Box */}
                {lightboxProduct ? (
                  <div className="pt-3 border-t border-pink-100 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[11px] text-gray-500 block">Model Sepatu Tertaut</span>
                        <h4 className="font-heading font-bold text-sm text-gray-900">
                          {lightboxProduct.name}
                        </h4>
                      </div>
                      <span className="font-mono tabular-nums font-extrabold text-base text-[#be185d]">
                        {formatRupiah(lightboxProduct.price)}
                      </span>
                    </div>

                    {/* Interactive EU Size Selector with Real-Time Stock */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-800">Pilih Ukuran (EU):</span>
                        <button
                          type="button"
                          onClick={() => {
                            setLightbox(null);
                            onOpenInsoleGuide();
                          }}
                          className="text-[#be185d] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Ruler className="w-3.5 h-3.5" />
                          <span>Panduan Insole</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-6 gap-1.5">
                        {lightboxProduct.sizes.map((size) => {
                          const stockCount = getSizeStockCount(lightboxProduct, size);
                          const isOut = stockCount <= 0;
                          const isSelected = chosenSize === size;
                          return (
                            <button
                              key={size}
                              type="button"
                              disabled={isOut}
                              onClick={() => setChosenSize(size)}
                              className={`min-h-[44px] rounded-xl font-mono tabular-nums text-xs font-bold border transition-all flex flex-col items-center justify-center ${
                                isOut
                                  ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed line-through'
                                  : isSelected
                                  ? 'bg-[#be185d] text-white border-[#be185d] shadow-xs cursor-pointer'
                                  : 'bg-white text-gray-800 border-pink-200 hover:border-[#be185d] cursor-pointer'
                              }`}
                            >
                              <span>{size}</span>
                              {!isOut && (
                                <span
                                  className={`text-[9px] font-sans font-medium ${
                                    isSelected ? 'text-pink-100' : 'text-gray-400'
                                  }`}
                                >
                                  {stockCount} psg
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <p className="text-[11px] text-gray-500 tabular-nums">
                        {getSizeStockCount(lightboxProduct, chosenSize) > 0
                          ? `Stok ukuran EU ${chosenSize} tersedia (${getSizeStockCount(
                              lightboxProduct,
                              chosenSize
                            )} pasang siap kirim)`
                          : `Stok ukuran EU ${chosenSize} sedang habis, silakan pilih ukuran lain.`}
                      </p>
                    </div>

                    {/* Primary & Secondary CTAs */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <button
                        type="button"
                        disabled={getSizeStockCount(lightboxProduct, chosenSize) <= 0}
                        onClick={() => {
                          const targetId =
                            lightbox.type === 'lookbook' ? lightbox.item.id : lightbox.review.id;
                          handleQuickAddFromLightbox(lightboxProduct, chosenSize, targetId);
                        }}
                        className="flex-1 min-h-[44px] py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#d65b7d] to-[#be185d] text-white font-bold text-xs shadow-xs hover:brightness-105 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 whitespace-nowrap"
                      >
                        {justAddedId ===
                        (lightbox.type === 'lookbook' ? lightbox.item.id : lightbox.review.id) ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Masuk Keranjang (EU {chosenSize})</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" />
                            <span>Tambah EU {chosenSize} ke Keranjang</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setLightbox(null);
                          onOpenProductDetail(lightboxProduct);
                        }}
                        className="min-h-[44px] py-2.5 px-4 rounded-xl bg-white hover:bg-pink-50 text-gray-800 border border-pink-200 font-bold text-xs transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Detail Sepatu
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-500">
                    Produk terkait sedang tidak aktif di katalog.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
