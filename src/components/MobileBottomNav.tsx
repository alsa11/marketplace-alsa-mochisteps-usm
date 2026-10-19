import React from 'react';
import { Home, BookOpen, Heart, Truck, ShoppingBag } from 'lucide-react';

interface MobileBottomNavProps {
  currentTab?: string;
  cartCount: number;
  wishlistCount: number;
  onNavigateHome: () => void;
  onNavigateKatalog: () => void;
  onOpenWishlist: () => void;
  onOpenOrderTracking: () => void;
  onOpenCart: () => void;
  isSimulatedMobile?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  cartCount,
  wishlistCount,
  onNavigateHome,
  onNavigateKatalog,
  onOpenWishlist,
  onOpenOrderTracking,
  onOpenCart,
  isSimulatedMobile = false,
}) => {
  return (
    <nav
      aria-label="Navigasi Mobile"
      className={
        isSimulatedMobile
          ? "sticky bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-pink-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] transition-all shrink-0"
          : "fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-pink-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden transition-all"
      }
    >
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around">
        {/* Beranda */}
        <button
          type="button"
          onClick={onNavigateHome}
          className="flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-1.5 rounded-xl text-[#7a4855] hover:text-[#be185d] active:scale-95 transition-all cursor-pointer"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1 tracking-tight">Beranda</span>
        </button>

        {/* Katalog */}
        <button
          type="button"
          onClick={onNavigateKatalog}
          className="flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-1.5 rounded-xl text-[#7a4855] hover:text-[#be185d] active:scale-95 transition-all cursor-pointer"
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1 tracking-tight">Katalog</span>
        </button>

        {/* Wishlist dengan Badge */}
        <button
          type="button"
          onClick={onOpenWishlist}
          className="relative flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-1.5 rounded-xl text-[#7a4855] hover:text-[#be185d] active:scale-95 transition-all cursor-pointer"
        >
          <div className="relative">
            <Heart className="w-5 h-5 text-[#8d2a45]" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-[#be185d] text-white font-extrabold text-[9px] flex items-center justify-center shadow-xs">
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold mt-1 tracking-tight">Wishlist</span>
        </button>

        {/* Lacak Pesanan */}
        <button
          type="button"
          onClick={onOpenOrderTracking}
          className="flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-1.5 rounded-xl text-[#7a4855] hover:text-[#be185d] active:scale-95 transition-all cursor-pointer"
        >
          <Truck className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1 tracking-tight">Lacak</span>
        </button>

        {/* Keranjang dengan Badge */}
        <button
          type="button"
          onClick={onOpenCart}
          className="relative flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-1.5 rounded-xl text-[#7a4855] hover:text-[#be185d] active:scale-95 transition-all cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-[#8d2a45]" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-[#be185d] text-white font-extrabold text-[9px] flex items-center justify-center shadow-xs animate-pulse">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold mt-1 tracking-tight">Keranjang</span>
        </button>
      </div>
    </nav>
  );
};
