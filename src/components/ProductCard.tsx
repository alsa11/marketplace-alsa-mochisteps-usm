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
      className="group bg-white rounded-3xl p-4 sm:p-5 border border-pink-100/80 shadow-xs hover:shadow-xl hover:shadow-pink-200/40 transition-all flex flex-col justify-between cursor-pointer relative"
    >
      {/* Top badges */}
      <div className="relative rounded-2xl overflow-hidden aspect-4/3 bg-[#fdf2f4]">
        <FlatshoeImage
          src={product.imageUrl}
          alt={product.name}
          shoeName={product.name}
          color={product.color}
          category={product.category}
          className="w-full h-full object-cover"
        />

        {/* Badge status */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.badge && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-white/95 text-[#be185d] shadow-xs border border-pink-100">
              {product.badge}
            </span>
          )}
          {isOutOfStock && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-red-500 text-white shadow-xs">
              Stok Habis
            </span>
          )}
        </div>

        {/* Wishlist Heart Button in Top Right */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist?.(product.id);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-gray-400 hover:text-[#be185d] shadow-sm z-10 transition-transform active:scale-90 cursor-pointer"
          title={isWishlisted ? 'Hapus dari Wishlist' : 'Simpan ke Wishlist'}
        >
          <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-[#be185d] text-[#be185d]' : 'text-gray-400'}`} />
        </button>

        {/* Quick View Overlay Button */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
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
      <div className="pt-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[11px] font-semibold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-semibold text-xs">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-gray-400 text-[10px]">({product.reviewCount})</span>
            </div>
          </div>

          {/* Name */}
          <h3 className="font-heading font-bold text-base text-gray-900 group-hover:text-[#be185d] transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Color & Material snippet */}
          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
            Warna: <span className="font-medium text-gray-700">{product.color}</span>
          </p>

          {/* Price & Stock info */}
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="font-heading font-extrabold text-lg text-[#be185d]">
              {formatRupiah(product.price)}
            </span>
            <span
              className={`text-[11px] font-medium ${
                product.stock < 5 ? 'text-amber-600 font-bold' : 'text-gray-400'
              }`}
            >
              {product.stock > 0 ? `Sisa ${product.stock} pasang` : 'Habis'}
            </span>
          </div>

          {/* Size Pills Selector */}
          <div className="mt-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Pilih Ukuran:
              </span>
              <span className="text-[10px] font-semibold text-pink-600">
                Size {selectedSize}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  disabled={isOutOfStock}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
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
        <div className="mt-4 pt-3 border-t border-pink-50">
          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`w-full py-2.5 px-4 rounded-2xl font-bold text-xs tracking-wide flex items-center justify-center gap-2 transition-all ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isAdded
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-gradient-to-r from-[#d65b7d] to-[#be185d] text-white hover:brightness-105 shadow-sm hover:shadow-md active:scale-98'
            }`}
          >
            {isOutOfStock ? (
              <span>Habis Terjual</span>
            ) : isAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>Dimasukkan (Size {selectedSize})</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>+ Keranjang (Size {selectedSize})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
