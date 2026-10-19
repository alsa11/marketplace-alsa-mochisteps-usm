import React from 'react';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { FlatshoeImage } from './FlatshoeImage';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistIds: string[];
  products: Product[];
  onRemoveFromWishlist: (productId: string) => void;
  onAddToCart: (product: Product, size: number) => void;
  onViewProduct: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistIds,
  products,
  onRemoveFromWishlist,
  onAddToCart,
  onViewProduct,
}) => {
  if (!isOpen) return null;

  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-pink-100 flex items-center justify-between bg-gradient-to-r from-pink-50/80 to-white">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-pink-100 text-[#be185d]">
                <Heart className="w-5 h-5 fill-[#be185d]" />
              </div>
              <div>
                <h2 className="font-heading font-extrabold text-base text-gray-900">
                  Wishlist Saya
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  {wishlistProducts.length} model sepatu tersimpan
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-pink-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List Items */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {wishlistProducts.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-pink-50 text-pink-300 flex items-center justify-center mx-auto">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-gray-800 text-sm">Wishlist Masih Kosong</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                  Belum ada sepatu favorit yang Anda simpan. Klik ikon hati pada katalog sepatu untuk menyimpan model impian Anda.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-[#be185d] text-white font-bold text-xs shadow-md hover:bg-[#9d174d] cursor-pointer transition-all"
                >
                  Jelajahi Katalog
                </button>
              </div>
            ) : (
              wishlistProducts.map((product) => {
                const defaultSize = product.sizes?.[0] || 38;
                const isOutOfStock = (product.stock || 0) <= 0;

                return (
                  <div
                    key={product.id}
                    className="flex gap-3.5 p-3.5 rounded-2xl bg-gray-50/80 hover:bg-pink-50/40 border border-gray-150 transition-all group"
                  >
                    <div
                      onClick={() => {
                        onViewProduct(product);
                        onClose();
                      }}
                      className="w-20 h-20 rounded-xl overflow-hidden bg-white shrink-0 border border-pink-100 cursor-pointer"
                    >
                      <FlatshoeImage
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4
                            onClick={() => {
                              onViewProduct(product);
                              onClose();
                            }}
                            className="font-bold text-xs text-gray-900 truncate hover:text-[#be185d] cursor-pointer"
                          >
                            {product.name}
                          </h4>
                          <button
                            type="button"
                            onClick={() => onRemoveFromWishlist(product.id)}
                            className="text-gray-400 hover:text-red-500 p-0.5 cursor-pointer transition-colors"
                            title="Hapus dari wishlist"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-500">{product.color}</p>
                        <p className="font-mono font-bold text-xs text-[#be185d] mt-1">
                          {formatRupiah(product.price)}
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-bold ${
                            isOutOfStock ? 'text-red-600' : 'text-emerald-700'
                          }`}
                        >
                          {isOutOfStock ? 'Stok Habis' : `Stok: ${product.stock} psg`}
                        </span>

                        <button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => {
                            onAddToCart(product, defaultSize);
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-xl bg-pink-100 hover:bg-[#be185d] text-[#be185d] hover:text-white font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>+ Keranjang</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {wishlistProducts.length > 0 && (
            <div className="p-4 border-t border-gray-100 bg-white">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Lanjut Belanja</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
