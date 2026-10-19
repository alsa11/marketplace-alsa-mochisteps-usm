import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Star, Eye, Check, Heart } from 'lucide-react';
import { Product } from '../types';
import { FlatshoeImage } from './FlatshoeImage';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, size: number) => void;
  onOpenDetail: (product: Product) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onOpenDetail,
  isWishlisted = false,
  onToggleWishlist,
}) => {
  const [selectedSize, setSelectedSize] = useState<number>(38);
  const [isAdded, setIsAdded] = useState(false);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    onAddToCart(product, selectedSize);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1600);
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      onClick={() => onOpenDetail(product)}
      className="group bg-white rounded-2xl sm:rounded-3xl p-2.5 sm:p-5 border border-pink-100/90 shadow-xs hover:shadow-xl hover:shadow-pink-200/40 transition-all flex flex-col justify-between cursor-pointer relative h-full"
    >
      {/* Top badges & Image */}
      <div className="relative rounded-xl sm:rounded-2xl overflow-hidden aspect-4/3 bg-[#fdf2f4]">
        <FlatshoeImage
          src={product.imageUrl}
          alt={product.name}
          shoeName={product.name}
          color={product.color}
          category={product.category}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badge status */}
        <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 flex flex-col gap-1 z-10">
          {product.badge && (
            <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[8.5px] sm:text-[10px] font-bold tracking-wide uppercase bg-white/95 text-[#be185d] shadow-xs border border-pink-100">
              {product.badge}
            </span>
          )}
          {isOutOfStock && (
            <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[8.5px] sm:text-[10px] font-bold tracking-wide uppercase bg-red-500 text-white shadow-xs">
              Stok Habis
            </span>
          )}
        </div>

        {/* Wishlist Heart Button in Top Right (44px touch area) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist?.(product.id);
          }}
          className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/95 hover:bg-white text-gray-400 hover:text-[#be185d] shadow-xs z-10 transition-transform active:scale-90 cursor-pointer flex items-center justify-center border border-pink-100/50"
          title={isWishlisted ? 'Hapus dari Wishlist' : 'Simpan ke Wishlist'}
          aria-label="Wishlist"
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${isWishlisted ? 'fill-[#be185d] text-[#be185d]' : 'text-gray-400'}`} />
        </button>

        {/* Quick View Overlay Button (Desktop only) */}
        <div className="hidden sm:flex absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail(product);
            }}
            className="p-3 rounded-full bg-white text-gray-800 shadow-md hover:scale-110 active:scale-95 transition-transform"
            aria-label="Lihat Detail"
          >
            <Eye className="w-4 h-4 text-[#be185d]" />
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="pt-2 sm:pt-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[9px] sm:text-[11px] font-semibold text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded-md truncate max-w-[85px] sm:max-w-none">
              {product.category}
            </span>
            <div className="flex items-center gap-0.5 sm:gap-1 text-amber-500 font-semibold text-[9.5px] sm:text-xs shrink-0">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-gray-400 text-[8.5px] sm:text-[10px]">({product.reviewCount})</span>
            </div>
          </div>

          {/* Name */}
          <h3 className="font-heading font-bold text-xs sm:text-base text-gray-900 group-hover:text-[#be185d] transition-colors line-clamp-1 leading-snug">
            {product.name}
          </h3>

          {/* Color & Material snippet */}
          <p className="text-[9.5px] sm:text-xs text-gray-500 line-clamp-1 mt-0.5">
            Warna: <span className="font-medium text-gray-700">{product.color}</span>
          </p>

          {/* Price & Stock info */}
          <div className="mt-1 sm:mt-2.5 flex items-baseline justify-between flex-wrap gap-1">
            <span className="font-heading font-extrabold text-xs sm:text-lg text-[#be185d]">
              {formatRupiah(product.price)}
            </span>
            <span
              className={`text-[8.5px] sm:text-[11px] font-medium ${
                product.stock < 5 ? 'text-amber-600 font-bold' : 'text-gray-400'
              }`}
            >
              {product.stock > 0 ? `Sisa ${product.stock}` : 'Habis'}
            </span>
          </div>

          {/* Size Pills Selector */}
          <div className="mt-1.5 sm:mt-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-0.5 sm:mb-1">
              <span className="text-[8.5px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Size:
              </span>
              <span className="text-[8.5px] sm:text-[10px] font-semibold text-pink-600">
                EU {selectedSize}
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSize(s)}
                  disabled={isOutOfStock}
                  className={`w-5.5 h-5.5 sm:w-7 sm:h-7 rounded-md sm:rounded-lg text-[9px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                    selectedSize === s
                      ? 'bg-[#be185d] text-white shadow-xs scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-pink-100 hover:text-pink-800'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Add to Cart Button */}
        <div className="mt-2.5 sm:mt-4 pt-1.5 sm:pt-3 border-t border-pink-50">
          <button
            type="button"
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`w-full py-1.5 sm:py-2.5 px-1.5 sm:px-4 rounded-xl sm:rounded-2xl font-bold text-[10px] sm:text-xs tracking-wide flex items-center justify-center gap-1 transition-all min-h-[34px] sm:min-h-[42px] cursor-pointer ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isAdded
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-gradient-to-r from-[#d65b7d] to-[#be185d] text-white hover:brightness-105 shadow-xs hover:shadow-md active:scale-98'
            }`}
          >
            {isOutOfStock ? (
              <span>Habis Terjual</span>
            ) : isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span className="truncate">Masuk Keranjang ✓</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="truncate">+ Keranjang</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
