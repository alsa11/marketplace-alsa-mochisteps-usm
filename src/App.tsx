import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  testFirestoreConnection,
  auth,
} from './lib/firebase';
import {
  seedProductsIfEmpty,
  subscribeToProducts,
  subscribeToOrders,
  subscribeToStockMutations,
  subscribeToStoreSettings,
  subscribeToVouchers,
  subscribeToReviews,
  subscribeToReturns,
  DEFAULT_STORE_SETTINGS,
} from './lib/firestoreService';
import {
  Product,
  CartItem,
  Order,
  StockMutation,
  StoreSettings,
  Voucher,
  ProductReview,
  OrderReturn,
} from './types';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { InsoleGuideModal } from './components/InsoleGuideModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { Footer } from './components/Footer';
import { AdminPortal } from './components/admin/AdminPortal';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { Sparkles, ShieldCheck, Footprints, RefreshCw, Heart, ArrowRight, Search, Ruler, X } from 'lucide-react';

export default function App() {
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [mutations, setMutations] = useState<StockMutation[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [returns, setReturns] = useState<OrderReturn[]>([]);

  // Cart with localStorage persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('mochi_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist with localStorage persistence
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mochi_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);

  const [isFirestoreConnected, setIsFirestoreConnected] = useState<boolean>(true);
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('mochi_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
  }, [cart]);

  // Sync wishlist to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('mochi_wishlist', JSON.stringify(wishlistIds));
    } catch (e) {
      console.warn('Could not save wishlist to localStorage', e);
    }
  }, [wishlistIds]);

  const handleToggleWishlist = (productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Modals & Navigation
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeProductDetail, setActiveProductDetail] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [completedOrderNumber, setCompletedOrderNumber] = useState<string>('');
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState<boolean>(false);
  const [trackingInitialKey, setTrackingInitialKey] = useState<string>('');
  const [isInsoleGuideOpen, setIsInsoleGuideOpen] = useState<boolean>(false);

  // Admin Portal & Auth
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState<string>('admin@mochisteps.com');
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState<boolean>(false);
  const [currentRoute, setCurrentRoute] = useState<string>('');

  const productSectionRef = useRef<HTMLDivElement>(null);

  // Ensure reload always defaults to Webstore
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      try {
        window.history.replaceState(null, '', window.location.pathname);
      } catch {
        window.location.hash = '';
      }
    }
  }, []);

  // Listen to hash changes only for explicit user actions
  useEffect(() => {
    const handleRouteCheck = () => {
      if (typeof window === 'undefined') return;
      const hash = window.location.hash || '';
      if (hash === '#/masuk' || hash === '#masuk') {
        if (!isAdminLoggedIn) {
          setIsAdminLoginModalOpen(true);
        }
      }
    };
    window.addEventListener('hashchange', handleRouteCheck);
    return () => {
      window.removeEventListener('hashchange', handleRouteCheck);
    };
  }, [isAdminLoggedIn]);

  // Initialize Firestore real-time subscriptions immediately on mount
  useEffect(() => {
    // 1. Immediately subscribe to real-time collections so any order or stock change updates in instant real-time
    const unsubscribeProducts = subscribeToProducts((prods) => {
      setProducts(prods);
      setIsFirestoreConnected(true);
      setIsLoadingInitial(false);
    });

    const unsubscribeOrders = subscribeToOrders((ords) => {
      setOrders(ords);
    });

    const unsubscribeMutations = subscribeToStockMutations((muts) => {
      setMutations(muts);
    });

    const unsubscribeStoreSettings = subscribeToStoreSettings((settings) => {
      setStoreSettings(settings);
    });

    const unsubscribeVouchers = subscribeToVouchers((vouchs) => {
      setVouchers(vouchs);
    });

    const unsubscribeReviews = subscribeToReviews((revs) => {
      setReviews(revs);
    });

    const unsubscribeReturns = subscribeToReturns((rets) => {
      setReturns(rets);
    });

    // 2. Perform seed check and connectivity test asynchronously without blocking the real-time stream
    seedProductsIfEmpty().catch((err) => console.warn('Product seeding note:', err));
    testFirestoreConnection().then(setIsFirestoreConnected).catch(() => {});

    return () => {
      if (unsubscribeProducts) unsubscribeProducts();
      if (unsubscribeOrders) unsubscribeOrders();
      if (unsubscribeMutations) unsubscribeMutations();
      if (unsubscribeStoreSettings) unsubscribeStoreSettings();
      if (unsubscribeVouchers) unsubscribeVouchers();
      if (unsubscribeReviews) unsubscribeReviews();
      if (unsubscribeReturns) unsubscribeReturns();
    };
  }, []);

  // Filtered Products for Catalog
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.color.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Cart operations
  const handleAddToCart = (product: Product, size: number, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex(
        (it) => it.product.id === product.id && it.selectedSize === size
      );
      if (existingIdx > -1) {
        const updated = [...prevCart];
        const newQty = Math.min(product.stock, updated[existingIdx].quantity + quantity);
        updated[existingIdx] = { ...updated[existingIdx], quantity: newQty };
        return updated;
      }
      return [...prevCart, { product, selectedSize: size, quantity }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, size: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(productId, size);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((it) =>
        it.product.id === productId && it.selectedSize === size
          ? { ...it, quantity: Math.min(it.product.stock, newQty) }
          : it
      )
    );
  };

  const handleRemoveCartItem = (productId: string, size: number) => {
    setCart((prevCart) =>
      prevCart.filter(
        (it) => !(it.product.id === productId && it.selectedSize === size)
      )
    );
  };

  const handleBuyNow = (product: Product, size: number, quantity: number) => {
    handleAddToCart(product, size, quantity);
    setActiveProductDetail(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const totalCartCount = useMemo(() => {
    return cart.reduce((sum, it) => sum + it.quantity, 0);
  }, [cart]);

  // Scroll to products
  const scrollToProducts = () => {
    productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  // If Admin is logged in, show Admin Portal
  if (isAdminLoggedIn) {
    return (
      <AdminPortal
        adminEmail={adminEmail}
        onLogout={() => {
          setIsAdminLoggedIn(false);
          window.location.hash = '';
          setCurrentRoute('');
        }}
        products={products}
        orders={orders}
        mutations={mutations}
        isFirestoreConnected={isFirestoreConnected}
        storeSettings={storeSettings}
        vouchers={vouchers}
        reviews={reviews}
        returns={returns}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#fff9fa] text-[#2d2226] flex flex-col font-sans selection:bg-pink-200 selection:text-pink-900">
      
      {/* Navbar */}
      <Navbar
        cartCount={totalCartCount}
        wishlistCount={wishlistIds.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenInsoleGuide={() => setIsInsoleGuideOpen(true)}
        onOpenOrderTracking={() => setIsOrderTrackingOpen(true)}
        onLogoAdminTrigger={() => setIsAdminLoginModalOpen(true)}
        onNavigateHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onNavigateKategori={() => {
          setSelectedCategory('all');
          scrollToProducts();
        }}
        onNavigateKatalog={() => scrollToProducts()}
        isFirestoreConnected={isFirestoreConnected}
        storeSettings={storeSettings}
      />

      {/* Hero Section with Framer Motion */}
      <HeroSection
        onExploreClick={scrollToProducts}
        onOpenInsoleGuide={() => setIsInsoleGuideOpen(true)}
      />

      {/* 3 Keunggulan Mochi Cushion Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-3xl bg-white border border-pink-100/90 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#fdf0f4] text-[#d65b7d] flex items-center justify-center shrink-0">
              <Footprints className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-gray-900">
                Busa CloudMochi 8mm
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Insole memory foam berdaya pantul kenyal seperti kue mochi. Mengurangi tekanan tumit hingga 60%.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-pink-100/90 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#fdf0f4] text-[#d65b7d] flex items-center justify-center shrink-0">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-gray-900">
                Lining Velvet Anti-Lecet
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Kerah tumit dilapisi bantalan bulu halus. Langsung nyaman dipakai jalan seharian tanpa perlu di-break in.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-pink-100/90 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#fdf0f4] text-[#d65b7d] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-gray-900">
                Garansi Tukar Size 7 Hari
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Salah pilih ukuran? Tukar ukuran sepatu baru dengan mudah dan cepat tanpa dipersulit via customer service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Product Catalog Section */}
      <section ref={productSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1">
        
        {/* Section Header */}
        <div className="flex flex-col gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100/80 text-[#be185d] text-xs font-bold font-heading mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>12 Model Eksklusif • 3 Kategori</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-gray-900 tracking-tight">
              Koleksi Flatshoes Mochi Steps
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Foto asli real-life dengan pencahayaan lembut. Sentuh untuk melihat detail busa mochi.
            </p>
          </div>

          {/* Catalog Controls: Semua Sepatu | Klasik | Pointed | Loafers, Search Bar, & Panduan Insole */}
          <div className="bg-white p-3 sm:p-4 rounded-3xl border border-pink-200/80 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Left: Semua Sepatu | Klasik | Pointed | Loafers */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 lg:pb-0">
              {[
                { id: 'all', label: 'Semua Sepatu' },
                { id: 'Flat Shoes Klasik', label: 'Klasik' },
                { id: 'Pointed Elegant', label: 'Pointed' },
                { id: 'Loafers & Slip-on', label: 'Loafers' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-[#d65b7d] to-[#be185d] text-white shadow-xs'
                      : 'bg-[#faf4f6] text-[#6b3d4a] hover:bg-pink-100/70 border border-pink-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Right: Search Bar “Cari flatshoes...” & Panduan Insole */}
            <div className="flex items-center gap-2.5">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  placeholder="Cari flatshoes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-full bg-[#faf4f6] border border-pink-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-300 transition-all text-gray-800 placeholder-pink-400 font-medium"
                />
                <Search className="w-3.5 h-3.5 text-pink-400 absolute left-3 top-2.5" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Panduan Insole Button */}
              <button
                type="button"
                onClick={() => setIsInsoleGuideOpen(true)}
                className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-[#be185d] bg-pink-50 hover:bg-pink-100 transition-colors border border-pink-200 cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                title="Panduan Ukuran Insole Busa Mochi 8mm"
              >
                <Ruler className="w-3.5 h-3.5 text-[#be185d]" />
                <span>Panduan Insole</span>
              </button>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {isLoadingInitial ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#be185d] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-500 font-medium">Memuat katalog flatshoes dari Firestore...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-pink-100 p-8 space-y-3">
            <div className="text-4xl">🔍</div>
            <h3 className="font-heading font-bold text-gray-800 text-base">
              Flatshoes Tidak Ditemukan
            </h3>
            <p className="text-xs text-gray-500">
              Coba kata kunci pencarian lain atau pilih kategori Semua Sepatu.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-xl bg-pink-100 text-[#be185d] font-bold text-xs"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={(p, size) => handleAddToCart(p, size, 1)}
                onOpenDetail={(p) => setActiveProductDetail(p)}
                isWishlisted={wishlistIds.includes(product.id)}
                onToggleWishlist={handleToggleWishlist}
              />
            ))}
          </div>
        )}
      </section>



      {/* Floating Cart Button for Quick Mobile Access */}
      {totalCartCount > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-[#d65b7d] via-[#e26d8d] to-[#be185d] text-white shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group cursor-pointer"
        >
          <span className="font-heading font-extrabold text-xs">
            {totalCartCount} item di keranjang
          </span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      )}

      {/* Footer */}
      <Footer
        onOpenInsoleGuide={() => setIsInsoleGuideOpen(true)}
        onOpenOrderTracking={() => setIsOrderTrackingOpen(true)}
        onFilterCategory={(cat) => {
          setSelectedCategory(cat);
          scrollToProducts();
        }}
        onSecretAdminClick={() => setIsAdminLoginModalOpen(true)}
        storeSettings={storeSettings}
      />

      {/* Product Detail Modal with Reviews and Wishlist */}
      <ProductDetailModal
        product={activeProductDetail}
        onClose={() => setActiveProductDetail(null)}
        onAddToCart={(p, size, qty) => handleAddToCart(p, size, qty)}
        onBuyNow={handleBuyNow}
        onOpenInsoleGuide={() => {
          setActiveProductDetail(null);
          setIsInsoleGuideOpen(true);
        }}
        isWishlisted={activeProductDetail ? wishlistIds.includes(activeProductDetail.id) : false}
        onToggleWishlist={handleToggleWishlist}
        reviews={reviews}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistIds={wishlistIds}
        products={products}
        onRemoveFromWishlist={(id) => handleToggleWishlist(id)}
        onAddToCart={(p, size) => handleAddToCart(p, size, 1)}
        onViewProduct={(p) => {
          setIsWishlistOpen(false);
          setActiveProductDetail(p);
        }}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal with Vouchers and Store Settings */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        onOrderSuccess={(orderId, orderNum) => {
          setIsCheckoutOpen(false);
          setCart([]);
          setCompletedOrderNumber(orderNum);
          setIsSuccessModalOpen(true);
        }}
        vouchers={vouchers}
        storeSettings={storeSettings}
      />

      {/* Order Success Modal */}
      <OrderSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        orderNumber={completedOrderNumber}
        onTrackOrder={(ordNum) => {
          setIsSuccessModalOpen(false);
          setTrackingInitialKey(ordNum);
          setIsOrderTrackingOpen(true);
        }}
      />

      {/* Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={isOrderTrackingOpen}
        onClose={() => setIsOrderTrackingOpen(false)}
        orders={orders}
        initialSearch={trackingInitialKey}
      />

      {/* Insole & Size Guide Modal */}
      <InsoleGuideModal
        isOpen={isInsoleGuideOpen}
        onClose={() => setIsInsoleGuideOpen(false)}
      />

      {/* Secret Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onLoginSuccess={(email) => {
          setAdminEmail(email);
          setIsAdminLoggedIn(true);
          setIsAdminLoginModalOpen(false);
        }}
      />
    </div>
  );
}
