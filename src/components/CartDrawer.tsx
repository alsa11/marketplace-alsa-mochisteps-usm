import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { CartItem } from '../types';
import { FlatshoeImage } from './FlatshoeImage';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, size: number, newQty: number) => void;
  onRemoveItem: (productId: string, size: number) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-pink-100">
          
          {/* Header */}
          <div className="p-5 border-b border-pink-100 flex items-center justify-between bg-gradient-to-r from-[#fff3f6] to-[#fffafc]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-pink-100 text-[#be185d]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-gray-900">
                  Keranjang Belanja
                </h3>
                <p className="text-xs text-gray-500">
                  {items.length} jenis flatshoes dipilih
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-3">
                <div className="w-20 h-20 rounded-full bg-pink-50 flex items-center justify-center text-pink-300 text-3xl">
                  🥿
                </div>
                <h4 className="font-heading font-bold text-gray-800 text-base">
                  Keranjangmu Masih Kosong
                </h4>
                <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                  Yuk temukan flatshoes empuk selembut mochi favoritmu di katalog kami!
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedSize}`}
                  className="flex gap-3.5 p-3 rounded-2xl border border-pink-100 bg-[#fffbfc] hover:border-pink-200 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-[#fdf2f4]">
                    <FlatshoeImage
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      shoeName={item.product.name}
                      color={item.product.color}
                      category={item.product.category}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-heading font-bold text-xs text-gray-900 truncate">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.product.id, item.selectedSize)}
                          className="text-gray-400 hover:text-red-500 p-0.5 transition-colors"
                          title="Hapus item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500">
                        <span className="font-bold text-[#be185d] bg-pink-50 px-1.5 py-0.2 rounded border border-pink-100">
                          EU {item.selectedSize}
                        </span>
                        <span>•</span>
                        <span className="truncate">{item.product.color}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-pink-50">
                      <span className="font-heading font-bold text-xs text-[#be185d]">
                        {formatRupiah(item.product.price * item.quantity)}
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-pink-200 rounded-lg bg-white overflow-hidden text-xs">
                        <button
                          onClick={() =>
                            onUpdateQuantity(
                              item.product.id,
                              item.selectedSize,
                              item.quantity - 1
                            )
                          }
                          className="px-2 py-0.5 text-gray-600 hover:bg-pink-50 font-bold"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-0.5 font-bold text-gray-800 min-w-6 text-center text-xs">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            onUpdateQuantity(
                              item.product.id,
                              item.selectedSize,
                              item.quantity + 1
                            )
                          }
                          disabled={item.quantity >= item.product.stock}
                          className="px-2 py-0.5 text-gray-600 hover:bg-pink-50 font-bold disabled:text-gray-300"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-pink-100 bg-[#fffcfd] space-y-3.5">
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-gray-500">
                  <span>Subtotal Produk</span>
                  <span className="font-semibold text-gray-800">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-500">
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <Sparkles className="w-3 h-3" />
                    Promo Ongkir Spesial
                  </span>
                  <span className="font-semibold text-emerald-600">Gratis (Rp 0)</span>
                </div>
                <div className="pt-2 border-t border-pink-100 flex items-center justify-between">
                  <span className="font-heading font-bold text-sm text-gray-900">Total Pembayaran</span>
                  <span className="font-heading font-extrabold text-lg text-[#be185d]">
                    {formatRupiah(subtotal)}
                  </span>
                </div>
              </div>

              <button
                onClick={onProceedToCheckout}
                className="w-full py-3.5 px-4 rounded-2xl font-bold text-xs tracking-wider bg-gradient-to-r from-[#d65b7d] via-[#e26d8d] to-[#be185d] text-white shadow-md hover:shadow-lg hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Lanjut ke Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[10px] text-center text-gray-400">
                🔒 Transaksi aman real-time terhubung langsung ke database resmi Mochi Steps
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
