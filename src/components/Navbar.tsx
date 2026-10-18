import React, { useState } from 'react';
import { ShoppingBag, ShieldCheck, Menu, X, Truck, Sparkles, Home, Grid, BookOpen, Heart } from 'lucide-react';
import { MochiLogo } from './MochiLogo';
import { StoreSettings } from '../types';

interface NavbarProps {
  cartCount: number;
  wishlistCount?: number;
  onOpenCart: () => void;
  onOpenWishlist?: () => void;
  onOpenInsoleGuide: () => void;
  onOpenOrderTracking: () => void;
  onLogoAdminTrigger: () => void;
  onNavigateHome: () => void;
  onNavigateKategori: () => void;
  onNavigateKatalog: () => void;
  isFirestoreConnected: boolean;
  storeSettings?: StoreSettings;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  wishlistCount = 0,
  onOpenCart,
  onOpenWishlist,
  onOpenInsoleGuide,
  onOpenOrderTracking,
  onLogoAdminTrigger,
  onNavigateHome,
  onNavigateKategori,
  onNavigateKatalog,
  isFirestoreConnected,
  storeSettings,
}) => {
  const [clickCount, setClickCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Logo triple click triggers secret admin login
  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 3) {
      setClickCount(0);
      onLogoAdminTrigger();
    } else {
      setTimeout(() => setClickCount(0), 1200);
    }
  };

  const navMenuItems = [
    {
      id: 'beranda',
      label: 'Beranda',
      icon: Home,
      onClick: () => {
        onNavigateHome();
        setMobileMenuOpen(false);
      },
    },
    {
      id: 'katalog',
      label: 'Katalog',
      icon: BookOpen,
      onClick: () => {
        onNavigateKatalog();
        setMobileMenuOpen(false);
      },
    },
    {
      id: 'lacak-pesanan',
      label: 'Lacak Pesanan',
      icon: Truck,
      onClick: () => {
        onOpenOrderTracking();
        setMobileMenuOpen(false);
      },
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-pink-100 shadow-xs transition-all">
      {/* Top Banner with Firestore Live Sync Badge */}
      <div className="bg-gradient-to-r from-[#ffeef2] via-[#fff4f6] to-[#ffeef2] px-4 py-1.5 text-xs text-[#8d2a45] flex items-center justify-between border-b border-pink-100/60">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="inline-block w-2 h-2 rounded-full bg-pink-500 animate-ping shrink-0" />
          <span className="font-medium text-[11px] sm:text-xs">
            {storeSettings?.announcementBanner || '🌸 Busa Mochi 8mm — Sensasi Melangkah Empuk & Ringan Sepanjang Hari'}
          </span>
        </div>

        {/* Live Firestore Connection Status Badge */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide transition-all shadow-xs ${
              isFirestoreConnected
                ? 'bg-emerald-600 text-white border border-emerald-700'
                : 'bg-amber-500 text-white border border-amber-600'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isFirestoreConnected ? 'bg-white animate-pulse ring-2 ring-emerald-300' : 'bg-white'
              }`}
            />
            <span>{isFirestoreConnected ? 'Database Firebase: Terhubung' : 'Menghubungkan Firebase...'}</span>
          </div>
        </div>
      </div>

      {/* Main Navbar: Logo di kiri | Menu di tengah | Keranjang icon & Admin MochiSteps di kanan */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo MochiSteps di kiri */}
          <div className="flex items-center gap-4">
            <MochiLogo
              variant="full"
              size="md"
              onClick={handleLogoClick}
              className="cursor-pointer"
            />
          </div>

          {/* Menu di tengah: Beranda | Kategori | Katalog | Lacak Pesanan */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navMenuItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className="px-3.5 py-2 rounded-full text-xs lg:text-sm font-semibold text-[#6b3d4a] hover:text-[#be185d] hover:bg-pink-50 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Pojok kanan: Icon Keranjang saja & Admin MochiSteps */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Icon Wishlist Favorit */}
            <button
              type="button"
              onClick={onOpenWishlist}
              className="relative p-2.5 rounded-full text-[#6b3d4a] hover:text-[#be185d] hover:bg-pink-50 transition-all cursor-pointer flex items-center justify-center border border-pink-100/60"
              aria-label="Wishlist Sepatu"
              title="Buka Wishlist Sepatu Favorit"
            >
              <Heart className="w-5 h-5 text-[#8d2a45]" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#be185d] text-white font-extrabold text-[11px] flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Icon Keranjang Saja */}
            <button
              type="button"
              onClick={onOpenCart}
              className="relative p-2.5 rounded-full text-[#6b3d4a] hover:text-[#be185d] hover:bg-pink-50 transition-all cursor-pointer flex items-center justify-center border border-pink-100/60"
              aria-label="Keranjang Belanja"
              title="Buka Keranjang Belanja"
            >
              <ShoppingBag className="w-5 h-5 text-[#8d2a45]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#be185d] text-white font-extrabold text-[11px] flex items-center justify-center shadow-xs animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Admin MochiSteps sebagai akses admin */}
            <button
              type="button"
              onClick={onLogoAdminTrigger}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-[#be185d] bg-pink-50 hover:bg-pink-100 hover:text-[#9d174d] transition-all border border-pink-200/90 shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
              title="Akses Admin Mochi Steps"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#be185d]" />
              <span className="hidden sm:inline">Admin MochiSteps</span>
              <span className="sm:hidden">Admin</span>
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-pink-50 cursor-pointer"
              aria-label="Buka Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-pink-100 space-y-2 animate-fade-in">
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.onClick}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-pink-50 hover:text-[#be185d] rounded-xl transition-colors cursor-pointer text-left"
                >
                  <Icon className="w-4 h-4 text-[#d65b7d]" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-2 border-t border-pink-100/60 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  onOpenInsoleGuide();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-pink-50 rounded-xl cursor-pointer text-left"
              >
                <Sparkles className="w-4 h-4 text-[#d65b7d]" />
                <span>Panduan Insole Busa Mochi 8mm</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onLogoAdminTrigger();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold text-[#be185d] bg-pink-100/90 hover:bg-pink-200 rounded-xl border border-pink-200 transition-all cursor-pointer mt-1"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#be185d]" />
                  <span>Admin MochiSteps</span>
                </div>
                <span className="text-[10px] bg-white text-[#be185d] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                  Masuk
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
