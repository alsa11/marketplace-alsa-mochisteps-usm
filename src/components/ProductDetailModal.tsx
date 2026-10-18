import React, { useState } from 'react';
import {
  X,
  Star,
  Ruler,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RefreshCw,
  Check,
  Sparkles,
  Heart,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';
import { Product, ProductReview } from '../types';
import { FlatshoeImage } from './FlatshoeImage';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, size: number, quantity: number) => void;
  onBuyNow: (product: Product, size: number, quantity: number) => void;
  onOpenInsoleGuide: () => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
  reviews?: ProductReview[];
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  onOpenInsoleGuide,
  isWishlisted = false,
  onToggleWishlist,
  reviews = [],
}) => {
  if (!product) return null;

  const [selectedSize, setSelectedSize] = useState<number>(() => {
    // Pick first size that has stock > 0
    if (product.sizeStock) {
      const available = product.sizes.find((s) => (product.sizeStock?.[s] || 0) > 0);
      if (available) return available;
    }
    return product.sizes[2] || 38;
  });
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState(false);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleAddToCart = () => {
    if (product.stock <= 0) return;
    onAddToCart(product, selectedSize, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleDirectBuy = () => {
    if (product.stock <= 0) return;
    onBuyNow(product, selectedSize, quantity);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-pink-100 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-pink-50 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Left: Product Image */}
          <div className="space-y-4">
            <div className="relative rounded-3xl overflow-hidden aspect-4/3 bg-[#fdf2f4] border border-pink-100 shadow-sm">
              <FlatshoeImage
                src={product.imageUrl}
                alt={product.name}
                shoeName={product.name}
                color={product.color}
                category={product.category}
                className="w-full h-full object-cover"
              />
              {product.badge && (
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/95 text-[#be185d] font-bold text-xs shadow-xs border border-pink-100">
                  {product.badge}
                </div>
              )}
            </div>

            {/* Mochi Cushion Guarantee Pill */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#fff3f6] to-[#fef0f4] border border-pink-200/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-100 text-[#be185d] flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-gray-900">Bantalan CloudMochi 8mm Asli</p>
                <p className="text-gray-500">Meredam getaran langkah & mencegah tumit melepuh.</p>
              </div>
            </div>
          </div>

          {/* Right: Specifications & Purchasing */}
          <div className="space-y-5">
            <div>
              <span className="text-xs font-bold text-pink-600 uppercase tracking-widest bg-pink-50 px-2.5 py-1 rounded-md">
                {product.category}
              </span>

              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold font-heading text-gray-900 leading-snug">
                {product.name}
              </h2>

              <div className="mt-2 flex items-center gap-3">
                <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{product.rating}</span>
                </div>
                <span className="text-gray-300">•</span>
                <span className="text-xs text-gray-500 font-medium">
                  {product.reviewCount} ulasan pembeli
                </span>
                <span className="text-gray-300">•</span>
                <span
                  className={`text-xs font-semibold ${
                    product.stock > 0 ? 'text-emerald-600' : 'text-red-500'
                  }`}
                >
                  {product.stock > 0 ? `Stok Siap Kirim (${product.stock})` : 'Stok Kosong'}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="pb-4 border-b border-gray-100">
              <span className="font-heading font-extrabold text-3xl text-[#be185d]">
                {formatRupiah(product.price)}
              </span>
              <p className="text-xs text-gray-400 mt-1">
                Termasuk garansi retur tukar size 7 hari bebas repot.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-1.5 text-xs sm:text-sm text-gray-600 leading-relaxed">
              <p className="font-semibold text-gray-800">Deskripsi Flatshoes:</p>
              <p>{product.description}</p>
            </div>

            {/* Material & Heel Details */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
              <div>
                <span className="text-gray-400 block text-[11px]">Material Luar:</span>
                <span className="font-medium text-gray-800">{product.material}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Tinggi Sol / Hak:</span>
                <span className="font-medium text-gray-800">{product.heelHeight}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Warna Tersedia:</span>
                <span className="font-medium text-gray-800">{product.color}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Sensasi Insole:</span>
                <span className="font-medium text-[#be185d]">Busa Mochi Kenyal 8mm</span>
              </div>
            </div>

            {/* Size Selector with real variant stock per size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">
                  PILIH UKURAN (EU):
                </span>
                <button
                  onClick={onOpenInsoleGuide}
                  className="inline-flex items-center gap-1 text-xs text-[#be185d] font-semibold hover:underline cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Lihat Panduan Ukuran & Insole</span>
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {product.sizes.map((s) => {
                  const sizeStockQty = product.sizeStock ? (product.sizeStock[s] ?? 0) : product.stock;
                  const isSizeUnavailable = sizeStockQty <= 0;

                  return (
                    <button
                      key={s}
                      disabled={isSizeUnavailable}
                      onClick={() => setSelectedSize(s)}
                      className={`relative w-12 h-12 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                        selectedSize === s
                          ? 'bg-[#be185d] text-white shadow-md scale-105 ring-2 ring-pink-300'
                          : isSizeUnavailable
                          ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-60 line-through'
                          : 'bg-pink-50/60 text-gray-700 hover:bg-pink-100 hover:text-pink-900 border border-pink-200/60'
                      }`}
                    >
                      <span>{s}</span>
                      <span className={`text-[9px] font-normal ${selectedSize === s ? 'text-pink-100' : 'text-gray-400'}`}>
                        {isSizeUnavailable ? '0' : sizeStockQty}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-gray-500 text-[11px]">
                  Stok Ukuran {selectedSize}:{' '}
                  <strong className="text-[#be185d]">
                    {product.sizeStock ? (product.sizeStock[selectedSize] ?? 0) : product.stock} pasang
                  </strong>
                </span>
                {product.sku && (
                  <span className="text-gray-400 font-mono text-[10px]">
                    SKU: {product.sku}
                  </span>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-gray-800">JUMLAH:</span>
              <div className="flex items-center border border-pink-200 rounded-xl bg-white shadow-2xs overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-1.5 text-gray-600 hover:bg-pink-50 font-bold cursor-pointer"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-xs font-bold text-gray-800 min-w-8 text-center font-mono">
                  {quantity}
                </span>
                <button
                  onClick={() => {
                    const currentMax = product.sizeStock ? (product.sizeStock[selectedSize] ?? product.stock) : product.stock;
                    setQuantity(Math.min(currentMax, quantity + 1));
                  }}
                  disabled={quantity >= (product.sizeStock ? (product.sizeStock[selectedSize] ?? product.stock) : product.stock)}
                  className="px-3.5 py-1.5 text-gray-600 hover:bg-pink-50 font-bold disabled:text-gray-300 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons + Wishlist */}
            <div className="pt-3 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <button
                type="button"
                onClick={() => onToggleWishlist?.(product.id)}
                className={`sm:col-span-2 py-3.5 px-3 rounded-2xl font-bold text-xs flex items-center justify-center border transition-all cursor-pointer ${
                  isWishlisted
                    ? 'bg-pink-100/90 text-[#be185d] border-pink-300'
                    : 'bg-white hover:bg-pink-50 text-gray-500 border-gray-200'
                }`}
                title={isWishlisted ? 'Hapus dari Wishlist' : 'Simpan ke Wishlist'}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#be185d] text-[#be185d]' : 'text-gray-400'}`} />
              </button>

              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`sm:col-span-5 py-3.5 px-4 rounded-2xl font-bold text-xs tracking-wide flex items-center justify-center gap-2 border border-pink-300 transition-all cursor-pointer disabled:opacity-50 ${
                  isAdded
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-400'
                    : 'bg-pink-50 text-[#be185d] hover:bg-pink-100 shadow-2xs'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Masuk Keranjang!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>+ Keranjang</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDirectBuy}
                disabled={product.stock <= 0}
                className="sm:col-span-5 py-3.5 px-4 rounded-2xl font-bold text-xs tracking-wide bg-gradient-to-r from-[#d65b7d] via-[#e26d8d] to-[#be185d] text-white shadow-md hover:shadow-lg hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>Beli Sekarang</span>
              </button>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-8 pt-6 border-t border-pink-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <h3 className="font-heading font-extrabold text-base text-gray-900">
                Ulasan Pembeli Terverifikasi
              </h3>
              <span className="text-xs font-semibold text-gray-500">
                ({reviews.filter((r) => r.productId === product.id && r.isApproved).length})
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-amber-600 font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Pembelian Nyata</span>
            </div>
          </div>

          {reviews.filter((r) => r.productId === product.id && r.isApproved).length === 0 ? (
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 text-center space-y-1">
              <p className="font-bold text-xs text-gray-700">Belum ada ulasan untuk model sepatu ini</p>
              <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
                Setelah pesanan Anda selesai dan sepatu diterima, Anda dapat memberikan rating bintang dan foto pemakaian di menu Lacak Pesanan.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {reviews
                .filter((r) => r.productId === product.id && r.isApproved)
                .map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-pink-50/40 border border-pink-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-pink-200 text-[#be185d] font-bold text-xs flex items-center justify-center">
                          {rev.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-gray-900">{rev.customerName}</p>
                          <p className="text-[10px] text-gray-400">
                            {new Date(rev.createdAt).toLocaleDateString('id-ID')}
                            {rev.size ? ` • Ukuran EU ${rev.size}` : ''}
                          </p>
                        </div>
                      </div>

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
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed font-sans">{rev.comment}</p>

                    {rev.photoUrl && (
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-pink-200 bg-white">
                        <img src={rev.photoUrl} alt="Foto ulasan pembeli" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
