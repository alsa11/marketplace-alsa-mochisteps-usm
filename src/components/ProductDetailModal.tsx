import React, { useState } from 'react';
import { X, Star, Ruler, ShoppingBag, ShieldCheck, Truck, RefreshCw, Check, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { FlatshoeImage } from './FlatshoeImage';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, size: number, quantity: number) => void;
  onBuyNow: (product: Product, size: number, quantity: number) => void;
  onOpenInsoleGuide: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  onOpenInsoleGuide,
}) => {
  if (!product) return null;

  const [selectedSize, setSelectedSize] = useState<number>(product.sizes[2] || 38);
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

            {/* Size Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">
                  PILIH UKURAN (EU):
                </span>
                <button
                  onClick={onOpenInsoleGuide}
                  className="inline-flex items-center gap-1 text-xs text-[#be185d] font-semibold hover:underline"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Lihat Panduan Ukuran & Insole</span>
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`w-11 h-11 rounded-xl text-sm font-bold transition-all ${
                      selectedSize === s
                        ? 'bg-[#be185d] text-white shadow-md scale-105 ring-2 ring-pink-300'
                        : 'bg-pink-50/60 text-gray-700 hover:bg-pink-100 hover:text-pink-900 border border-pink-200/60'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-gray-800">JUMLAH:</span>
              <div className="flex items-center border border-pink-200 rounded-xl bg-white shadow-2xs overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-1.5 text-gray-600 hover:bg-pink-50 font-bold"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-xs font-bold text-gray-800 min-w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  className="px-3.5 py-1.5 text-gray-600 hover:bg-pink-50 font-bold disabled:text-gray-300"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 grid grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`py-3.5 px-4 rounded-2xl font-bold text-xs tracking-wide flex items-center justify-center gap-2 border border-pink-300 transition-all ${
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
                className="py-3.5 px-4 rounded-2xl font-bold text-xs tracking-wide bg-gradient-to-r from-[#d65b7d] via-[#e26d8d] to-[#be185d] text-white shadow-md hover:shadow-lg hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span>Beli Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
