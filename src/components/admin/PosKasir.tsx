import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  DollarSign,
  QrCode,
  CreditCard,
  Printer,
  CheckCircle2,
  AlertCircle,
  Receipt,
  User,
  Phone,
  Sparkles,
  RefreshCw,
  X,
  Share2,
  Copy,
  Check,
  ArrowLeft,
  FileText,
  History,
  Clock,
  Calendar,
  Filter,
  Eye,
  TrendingUp,
} from 'lucide-react';
import { Product, Order, PaymentMethod, PosCartItem } from '../../types';
import { createPosTransaction, PosTransactionInput, subscribeToOrders } from '../../lib/firestoreService';
import { printThermalReceipt, formatReceiptText } from '../../lib/receiptPrinter';
import { FlatshoeImage } from '../FlatshoeImage';

interface PosKasirProps {
  products: Product[];
  adminEmail: string;
  orders?: Order[];
  onOrderCreated?: (order: Order) => void;
  onBackToAdmin?: () => void;
}

export const PosKasir: React.FC<PosKasirProps> = ({
  products,
  adminEmail,
  orders = [],
  onOrderCreated,
  onBackToAdmin,
}) => {
  // Integrated Tab State: Kasir & Riwayat Transaksi
  const [activeTab, setActiveTab] = useState<'pos' | 'history'>('pos');

  // Transactions State with real-time Firestore sync
  const [localOrders, setLocalOrders] = useState<Order[]>(orders);

  useEffect(() => {
    if (orders && orders.length > 0) {
      setLocalOrders(orders);
    }
  }, [orders]);

  useEffect(() => {
    const unsub = subscribeToOrders((liveOrders) => {
      setLocalOrders(liveOrders);
    });
    return () => unsub();
  }, []);

  // History Tab Filters
  const [historySearch, setHistorySearch] = useState('');
  const [historyDateFilter, setHistoryDateFilter] = useState<'today' | '7days' | 'all'>('today');
  const [historyPaymentFilter, setHistoryPaymentFilter] = useState<string>('all');

  // Cashier & Customer Info
  const [cashierName, setCashierName] = useState('Kasir Mochi Steps');
  const [isWalkIn, setIsWalkIn] = useState(true);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Search & Category Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // POS Cart
  const [cart, setCart] = useState<PosCartItem[]>([]);

  // Cart Feedback States (Solves missing indicator when adding to cart)
  const [recentlyAdded, setRecentlyAdded] = useState<{ productId: string; size: number } | null>(null);
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const [toastTimeoutId, setToastTimeoutId] = useState<any>(null);

  // Soft retail chime sound for instant cart confirmation
  const playPosCartChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      // AudioContext might be silent on initial click; safe to ignore
    }
  };

  // Discount
  const [discountType, setDiscountType] = useState<'nominal' | 'percent'>('nominal');
  const [discountValue, setDiscountValue] = useState<number>(0);

  // Payment Method & Cash Details
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Tunai (Cash)');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [edcRef, setEdcRef] = useState('');

  // Loading & Struk Modal
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [showReceipt, setShowReceipt] = useState<boolean>(false);
  const [selectedCardSizes, setSelectedCardSizes] = useState<Record<string, number>>({});

  const receiptPrintRef = useRef<HTMLDivElement>(null);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.color.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Cart Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, it) => sum + it.product.price * it.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (discountType === 'percent') {
      return Math.round((subtotal * Math.min(100, Math.max(0, discountValue))) / 100);
    }
    return Math.min(subtotal, Math.max(0, discountValue));
  }, [subtotal, discountType, discountValue]);

  const totalAmount = Math.max(0, subtotal - discountAmount);

  const cashNum = parseFloat(cashReceived) || 0;
  const cashChange = paymentMethod === 'Tunai (Cash)' ? Math.max(0, cashNum - totalAmount) : 0;
  const isCashInsufficient = paymentMethod === 'Tunai (Cash)' && cashNum < totalAmount && totalAmount > 0;

  // Filter POS Orders (orders with channel === 'pos' or POS order/receipt numbers)
  const posOrders = useMemo(() => {
    return (localOrders || []).filter(
      (o) => o && (o.channel === 'pos' || (o.orderNumber && o.orderNumber.startsWith('POS-')) || Boolean(o.receiptNumber))
    );
  }, [localOrders]);

  // History filtering by date, payment method, and search query
  const filteredHistoryOrders = useMemo(() => {
    return posOrders.filter((o) => {
      if (!o) return false;
      // Search filter: receipt number, order number, customer name, phone, item name
      if (historySearch.trim()) {
        const q = historySearch.toLowerCase().trim();
        const matchNumber = (o.orderNumber || '').toLowerCase().includes(q) || (o.receiptNumber && o.receiptNumber.toLowerCase().includes(q));
        const matchCustomer = (o.customerName || '').toLowerCase().includes(q) || (o.customerPhone || '').includes(q);
        const matchProduct = (o.items || []).some((it) => (it.name || '').toLowerCase().includes(q));
        if (!matchNumber && !matchCustomer && !matchProduct) return false;
      }

      // Date filter
      if (historyDateFilter === 'today') {
        const orderDate = new Date(o.createdAt || 0).toDateString();
        const todayDate = new Date().toDateString();
        if (orderDate !== todayDate) return false;
      } else if (historyDateFilter === '7days') {
        const diffMs = Date.now() - new Date(o.createdAt || 0).getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        if (diffDays > 7) return false;
      }

      // Payment filter
      if (historyPaymentFilter !== 'all') {
        if (!(o.paymentMethod || '').toLowerCase().includes(historyPaymentFilter.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [posOrders, historySearch, historyDateFilter, historyPaymentFilter]);

  // Summary Metrics for POS History
  const historyMetrics = useMemo(() => {
    const totalTransactions = filteredHistoryOrders.length;
    const totalRevenue = filteredHistoryOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
    const cashTotal = filteredHistoryOrders
      .filter((o) => (o.paymentMethod || '').toLowerCase().includes('tunai') || (o.paymentMethod || '').toLowerCase().includes('cash'))
      .reduce((acc, o) => acc + (o.totalAmount || 0), 0);
    const nonCashTotal = totalRevenue - cashTotal;

    return { totalTransactions, totalRevenue, cashTotal, nonCashTotal };
  }, [filteredHistoryOrders]);

  // Add Product with Size to Cart with unmistakable instant feedback
  const handleAddToCart = (product: Product, size: number) => {
    if (product.stock <= 0) return;

    // 1. Play soft audio chime
    playPosCartChime();

    // 2. Trigger size button pulse & checkmark
    setRecentlyAdded({ productId: product.id, size });
    setTimeout(() => {
      setRecentlyAdded(null);
    }, 1200);

    // 3. Show floating toast notification banner
    if (toastTimeoutId) clearTimeout(toastTimeoutId);
    setToastNotice(`✓ "${product.name}" (Size ${size}) berhasil ditambahkan ke keranjang kasir!`);
    const tid = setTimeout(() => {
      setToastNotice(null);
    }, 2800);
    setToastTimeoutId(tid);

    // 4. Update cart state
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (it) => it.product.id === product.id && it.selectedSize === size
      );
      if (existingIdx > -1) {
        const item = prev[existingIdx];
        if (item.quantity >= product.stock) {
          setToastNotice(`⚠️ Stok maksimal untuk ${product.name} adalah ${product.stock} pasang.`);
          return prev;
        }
        const updated = [...prev];
        updated[existingIdx] = { ...item, quantity: item.quantity + 1 };
        return updated;
      } else {
        return [...prev, { product, selectedSize: size, quantity: 1 }];
      }
    });
  };

  const handleUpdateQty = (idx: number, delta: number) => {
    setCart((prev) => {
      const item = prev[idx];
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        return prev.filter((_, i) => i !== idx);
      }
      if (newQty > item.product.stock) {
        alert(`Stok hanya tersisa ${item.product.stock} pasang.`);
        return prev;
      }
      const updated = [...prev];
      updated[idx] = { ...item, quantity: newQty };
      return updated;
    });
  };

  const handleRemoveItem = (idx: number) => {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm('Kosongkan keranjang kasir?')) {
      setCart([]);
      setCashReceived('');
      setDiscountValue(0);
    }
  };

  // Quick Cash Presets
  const setExactCash = () => {
    setCashReceived(totalAmount.toString());
  };

  const addQuickCash = (amount: number) => {
    setCashReceived(amount.toString());
  };

  // Submit POS Transaction
  const handleProcessTransaction = async () => {
    if (cart.length === 0) {
      setErrorMessage('Keranjang kasir masih kosong.');
      return;
    }
    if (isCashInsufficient) {
      setErrorMessage(`Uang tunai yang diterima (Rp ${cashNum.toLocaleString('id-ID')}) kurang dari Total Bayar (Rp ${totalAmount.toLocaleString('id-ID')}).`);
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const input: PosTransactionInput = {
        items: cart.map((it) => ({
          productId: it.product.id,
          name: it.product.name,
          price: it.product.price,
          size: it.selectedSize,
          quantity: it.quantity,
          imageUrl: it.product.imageUrl,
          color: it.product.color,
        })),
        customerName: isWalkIn ? 'Pelanggan Toko (Walk-in)' : (customerName.trim() || 'Pelanggan Toko'),
        customerPhone: isWalkIn ? '-' : (customerPhone.trim() || '-'),
        paymentMethod,
        cashReceived: paymentMethod === 'Tunai (Cash)' ? cashNum : totalAmount,
        cashChange: paymentMethod === 'Tunai (Cash)' ? cashChange : 0,
        discountAmount,
        cashierName: cashierName.trim() || `Admin (${adminEmail})`,
        notes: edcRef ? `EDC Ref: ${edcRef}` : undefined,
      };

      const createdOrder = await createPosTransaction(input);
      setCompletedOrder(createdOrder);
      setShowReceipt(true);
      setLocalOrders((prev) => [createdOrder, ...prev.filter((o) => o.id !== createdOrder.id)]);
      onOrderCreated?.(createdOrder);

      // Reset cart and inputs
      setCart([]);
      setCashReceived('');
      setDiscountValue(0);
      setEdcRef('');
      if (isWalkIn) {
        setCustomerName('');
        setCustomerPhone('');
      }

      // Receipt modal is now opened on screen for cashier to review and click Cetak
    } catch (err: any) {
      console.error('POS Checkout error:', err);
      setShowReceipt(false);
      setErrorMessage(err.message || 'Gagal memproses transaksi kasir.');
    } finally {
      setIsProcessing(false);
    }
  };

  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>('58mm');
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [printNotice, setPrintNotice] = useState<string | null>(null);

  // Print Receipt using isolated thermal container (Anti-blank screen bug fix)
  const handlePrintReceipt = (selectedWidth: '58mm' | '80mm' = paperWidth, targetOrder?: Order | null) => {
    const orderToPrint = targetOrder || completedOrder;
    if (!orderToPrint) return;

    // 1. Immediately ensure receipt modal is open so cashier has visual feedback & preview
    setCompletedOrder(orderToPrint);
    setShowReceipt(true);
    if (selectedWidth) {
      setPaperWidth(selectedWidth);
    }

    setPrintNotice(`Mencetak struk #${orderToPrint.receiptNumber || orderToPrint.orderNumber} (${selectedWidth})...`);
    setTimeout(() => {
      setPrintNotice(null);
    }, 3500);

    // 2. Synchronously trigger isolated thermal print
    printThermalReceipt({
      orderNumber: orderToPrint.orderNumber,
      receiptNumber: orderToPrint.receiptNumber,
      createdAt: orderToPrint.createdAt,
      cashierName: orderToPrint.cashierName,
      customerName: orderToPrint.customerName,
      customerPhone: orderToPrint.customerPhone,
      items: orderToPrint.items,
      subtotal: orderToPrint.subtotal,
      discountAmount: orderToPrint.discountAmount,
      totalAmount: orderToPrint.totalAmount,
      paymentMethod: orderToPrint.paymentMethod,
      cashReceived: orderToPrint.cashReceived,
      cashChange: orderToPrint.cashChange,
      notes: orderToPrint.specialNotes,
      paperWidth: selectedWidth,
    });
  };

  // Copy receipt text to clipboard
  const handleCopyReceiptText = () => {
    if (!completedOrder) return;
    const text = formatReceiptText({
      orderNumber: completedOrder.orderNumber,
      receiptNumber: completedOrder.receiptNumber,
      createdAt: completedOrder.createdAt,
      cashierName: completedOrder.cashierName,
      customerName: completedOrder.customerName,
      customerPhone: completedOrder.customerPhone,
      items: completedOrder.items,
      subtotal: completedOrder.subtotal,
      discountAmount: completedOrder.discountAmount,
      totalAmount: completedOrder.totalAmount,
      paymentMethod: completedOrder.paymentMethod,
      cashReceived: completedOrder.cashReceived,
      cashChange: completedOrder.cashChange,
      notes: completedOrder.specialNotes,
      paperWidth,
    });

    navigator.clipboard.writeText(text);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2000);
  };

  // Share receipt via WhatsApp
  const handleShareReceiptWhatsApp = () => {
    if (!completedOrder) return;
    const phone = completedOrder.customerPhone.replace(/[^0-9]/g, '');
    const itemsList = completedOrder.items
      .map((it, idx) => `${idx + 1}. ${it.name} (Size ${it.size}) x${it.quantity} = Rp ${(it.price * it.quantity).toLocaleString('id-ID')}`)
      .join('%0A');

    const msg = `*STRUK PEMBELIAN MOCHI STEPS*%0A` +
      `No. Struk: ${completedOrder.receiptNumber || completedOrder.orderNumber}%0A` +
      `Tanggal: ${new Date(completedOrder.createdAt).toLocaleString('id-ID')}%0A` +
      `Kasir: ${completedOrder.cashierName || 'Kasir Mochi Steps'}%0A` +
      `Pelanggan: ${completedOrder.customerName}%0A` +
      `--------------------------------%0A` +
      itemsList + `%0A` +
      `--------------------------------%0A` +
      `Subtotal: Rp ${completedOrder.subtotal.toLocaleString('id-ID')}%0A` +
      (completedOrder.discountAmount ? `Diskon: -Rp ${completedOrder.discountAmount.toLocaleString('id-ID')}%0A` : '') +
      `*Total Bayar: Rp ${completedOrder.totalAmount.toLocaleString('id-ID')}*%0A` +
      `Metode: ${completedOrder.paymentMethod}%0A` +
      (completedOrder.cashReceived ? `Uang Diterima: Rp ${completedOrder.cashReceived.toLocaleString('id-ID')}%0A` : '') +
      (completedOrder.cashChange ? `Kembalian: Rp ${completedOrder.cashChange.toLocaleString('id-ID')}%0A` : '') +
      `--------------------------------%0A` +
      `Garansi Tukar Ukuran 7 Hari (Simpan struk ini)%0A` +
      `Terima kasih telah melangkah bersama Mochi Steps! 🌸`;

    const url = phone.length >= 8
      ? `https://wa.me/${phone.startsWith('0') ? '62' + phone.slice(1) : phone}?text=${msg}`
      : `https://wa.me/?text=${msg}`;

    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 relative">
      {/* Floating Animated Toast Notification for Cart Feedback */}
      {toastNotice && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-bounce transition-all">
          <div className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#d65b7d] via-[#be185d] to-[#9d174d] text-white font-bold text-xs sm:text-sm shadow-2xl flex items-center gap-2.5 border-2 border-white/80 backdrop-blur-md">
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
            <span>{toastNotice}</span>
          </div>
        </div>
      )}

      {/* Top Banner & Fast Actions */}
      <div className="bg-gradient-to-r from-pink-50 via-white to-pink-50 p-4 rounded-3xl border border-pink-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          {onBackToAdmin && (
            <button
              type="button"
              onClick={onBackToAdmin}
              className="mr-1 px-3.5 py-2 rounded-2xl bg-white hover:bg-gray-100 text-gray-800 font-bold text-xs flex items-center gap-1.5 border border-gray-200 shadow-2xs transition-all cursor-pointer"
              title="Kembali ke Dashboard Admin Panel"
            >
              <ArrowLeft className="w-4 h-4 text-[#be185d]" />
              <span className="hidden sm:inline">Admin Panel</span>
            </button>
          )}

          <div className="w-10 h-10 rounded-2xl bg-[#be185d] text-white flex items-center justify-center shadow-xs">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-gray-900 text-base flex items-center gap-2">
              <span>Point of Sale (POS) Kasir Toko Mochi Steps</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Live Sinkron Stok
              </span>
            </h2>
            <p className="text-xs text-gray-500">
              Transaksi kasir toko offline Solo, cetak struk thermal 58mm/80mm instan, dan mutasi stok otomatis.
            </p>
          </div>
        </div>

        {/* Cashier Name Switcher */}
        <div className="flex items-center gap-2 text-xs bg-white px-3 py-1.5 rounded-xl border border-pink-200 shadow-2xs">
          <User className="w-3.5 h-3.5 text-pink-600" />
          <span className="text-gray-500 font-medium">Petugas:</span>
          <input
            type="text"
            value={cashierName}
            onChange={(e) => setCashierName(e.target.value)}
            className="font-bold text-gray-800 bg-transparent focus:outline-hidden text-xs w-36"
            placeholder="Nama Kasir"
          />
        </div>
      </div>

      {/* Integrated POS Tabs: Kasir & Riwayat Transaksi */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-pink-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'pos'
                ? 'bg-[#be185d] text-white shadow-md ring-2 ring-pink-300'
                : 'bg-pink-50/70 text-gray-700 hover:text-pink-900 hover:bg-pink-100 border border-pink-100'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Kasir & Transaksi</span>
            {cart.length > 0 && (
              <span
                className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                  activeTab === 'pos' ? 'bg-white text-[#be185d]' : 'bg-[#be185d] text-white'
                }`}
              >
                {cart.reduce((s, it) => s + it.quantity, 0)}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#be185d] text-white shadow-md ring-2 ring-pink-300'
                : 'bg-pink-50/70 text-gray-700 hover:text-pink-900 hover:bg-pink-100 border border-pink-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Riwayat Transaksi</span>
            <span
              className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                activeTab === 'history' ? 'bg-white text-[#be185d]' : 'bg-pink-200 text-pink-800'
              }`}
            >
              {posOrders.length}
            </span>
          </button>
        </div>

        {activeTab === 'pos' && cart.length > 0 && (
          <div className="text-xs font-bold text-pink-800 flex items-center gap-2 pr-2">
            <span>Keranjang:</span>
            <span className="text-sm font-extrabold text-[#be185d]">
              Rp {totalAmount.toLocaleString('id-ID')}
            </span>
          </div>
        )}
      </div>

      {activeTab === 'pos' ? (
        /* Main Grid: Left Catalog & Right Cashier Terminal */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Product Catalog & Fast Size Picker (Col 7) */}
          <div className="lg:col-span-7 space-y-4">
          
          {/* Search & Category Pills */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Cari sepatu flatshoes, loafers, atau kode warna..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-300 transition-all text-gray-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              {[
                { id: 'all', label: 'Semua Produk' },
                { id: 'Flat Shoes Klasik', label: 'Flat Shoes Klasik' },
                { id: 'Pointed Elegant', label: 'Pointed Elegant' },
                { id: 'Loafers & Slip-on', label: 'Loafers & Slip-on' },
              ].map((c) => {
                const isSelected = selectedCategory === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#be185d] text-white shadow-xs ring-2 ring-pink-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Cards Grid with smooth vertical scroll */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[calc(100vh-230px)] min-h-[480px] overflow-y-auto pr-2 pb-6">
            {filteredProducts.map((p) => {
              const isOutOfStock = p.stock <= 0;
              const isLowStock = p.stock > 0 && p.stock <= 5;
              const inCartForThisProduct = cart
                .filter((it) => it.product.id === p.id)
                .reduce((sum, it) => sum + it.quantity, 0);

              // Selected size for this card (defaults to 38 or first available size)
              const currentSelectedSize =
                selectedCardSizes[p.id] || (p.sizes.includes(38) ? 38 : p.sizes[0] || 38);
              const isJustAdded =
                recentlyAdded?.productId === p.id && recentlyAdded?.size === currentSelectedSize;

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    if (!isOutOfStock) {
                      handleAddToCart(p, currentSelectedSize);
                    }
                  }}
                  className={`bg-white rounded-3xl border p-4 flex flex-col justify-between transition-all shadow-xs hover:border-pink-300 hover:shadow-md relative cursor-pointer group ${
                    isOutOfStock ? 'opacity-60 bg-gray-50 border-gray-200' : 'border-pink-100/90'
                  }`}
                >
                  {/* 1. FOTO PRODUK */}
                  <div className="w-full h-32 rounded-2xl overflow-hidden bg-pink-50/70 border border-pink-100 relative shrink-0">
                    <FlatshoeImage
                      src={p.imageUrl}
                      alt={p.name}
                      shoeName={p.name}
                      color={p.color}
                      category={p.category}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Badge Stok di Foto */}
                    <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs ${
                          isOutOfStock
                            ? 'bg-red-500 text-white'
                            : isLowStock
                            ? 'bg-amber-500 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {isOutOfStock ? 'Stok Habis' : `Stok: ${p.stock}`}
                      </span>
                    </div>

                    {/* Indicator jika ada di keranjang */}
                    {inCartForThisProduct > 0 && (
                      <div className="absolute top-2 right-2 bg-[#be185d] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                        <ShoppingCart className="w-3 h-3" />
                        <span>{inCartForThisProduct} di keranjang</span>
                      </div>
                    )}
                  </div>

                  {/* 2. NAMA PRODUK */}
                  <div className="mt-3">
                    <h4 className="font-heading font-bold text-sm text-gray-900 line-clamp-1 group-hover:text-pink-700 transition-colors">
                      {p.name}
                    </h4>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">
                      {p.category} • {p.color}
                    </p>
                  </div>

                  {/* 3. HARGA */}
                  <div className="mt-1.5 flex items-baseline justify-between">
                    <span className="font-heading font-extrabold text-base text-[#be185d]">
                      Rp {p.price.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">per pasang</span>
                  </div>

                  {/* 4. STOK & PILIHAN UKURAN */}
                  <div
                    className="mt-2.5 pt-2.5 border-t border-gray-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-gray-600">
                        Pilih Ukuran (EU):
                      </span>
                      <span className="text-[10px] font-extrabold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-200">
                        Size {currentSelectedSize}
                      </span>
                    </div>

                    <div className="grid grid-cols-6 gap-1">
                      {p.sizes.map((s) => {
                        const isSelected = currentSelectedSize === s;
                        const inCartForSize =
                          cart.find(
                            (it) => it.product.id === p.id && it.selectedSize === s
                          )?.quantity || 0;

                        return (
                          <button
                            key={s}
                            type="button"
                            disabled={isOutOfStock}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCardSizes((prev) => ({ ...prev, [p.id]: s }));
                            }}
                            className={`py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center relative active:scale-95 ${
                              isSelected
                                ? 'bg-[#be185d] text-white shadow-2xs ring-2 ring-pink-300 font-extrabold'
                                : inCartForSize > 0
                                ? 'bg-pink-100 text-pink-900 border border-pink-300 font-bold'
                                : 'bg-gray-100 hover:bg-pink-50 hover:text-pink-700 text-gray-700 border border-gray-200'
                            } disabled:opacity-30 disabled:pointer-events-none`}
                            title={`Pilih ukuran ${s}${inCartForSize > 0 ? ` (${inCartForSize} di keranjang)` : ''}`}
                          >
                            <span>{s}</span>
                            {inCartForSize > 0 && !isSelected && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-600 rounded-full" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 5. TOMBOL "TAMBAH KE KERANJANG" */}
                  <div className="mt-3">
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(p, currentSelectedSize);
                      }}
                      className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer ${
                        isJustAdded
                          ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                          : isOutOfStock
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-[#be185d] hover:bg-[#9d174d] text-white shadow-pink-200/50'
                      }`}
                    >
                      {isJustAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Berhasil Ditambahkan!</span>
                        </>
                      ) : isOutOfStock ? (
                        <span>Stok Habis</span>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tambah ke Keranjang (Size {currentSelectedSize})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Cashier Terminal / Cart & Payment (Col 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 flex flex-col justify-between">
            
            {/* Terminal Header */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-pink-600" />
                  <h3 className="font-heading font-bold text-sm text-gray-900">
                    Keranjang Transaksi ({cart.reduce((s, it) => s + it.quantity, 0)} pasang)
                  </h3>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="text-[11px] text-gray-400 hover:text-red-600 font-medium transition-colors"
                  >
                    Kosongkan
                  </button>
                )}
              </div>

              {/* Customer Mode Selection */}
              <div className="py-3 border-b border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">Tipe Pelanggan:</span>
                  <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl text-xs border border-gray-200">
                    <button
                      type="button"
                      onClick={() => setIsWalkIn(true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isWalkIn
                          ? 'bg-[#be185d] text-white shadow-2xs ring-1 ring-pink-400'
                          : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
                      }`}
                    >
                      {isWalkIn && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      <span>Tamu Toko (Walk-in)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsWalkIn(false)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        !isWalkIn
                          ? 'bg-[#be185d] text-white shadow-2xs ring-1 ring-pink-400'
                          : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
                      }`}
                    >
                      {!isWalkIn && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      <span>Member / Input WA</span>
                    </button>
                  </div>
                </div>

                {!isWalkIn && (
                  <div className="grid grid-cols-2 gap-2 pt-1 animate-fade-in">
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="Nama Pembeli"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full pl-8 pr-2 py-1.5 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-hidden"
                      />
                    </div>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="WhatsApp (08...)"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full pl-8 pr-2 py-1.5 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Cart Items List */}
              <div className="py-3 max-h-56 overflow-y-auto space-y-2 divide-y divide-gray-50">
                {cart.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 space-y-1">
                    <ShoppingCart className="w-8 h-8 mx-auto text-gray-300" />
                    <p className="text-xs font-medium">Belum ada sepatu di keranjang kasir.</p>
                    <p className="text-[10px]">Pilih sepatu dan nomor ukuran di sebelah kiri.</p>
                  </div>
                ) : (
                  cart.map((it, idx) => (
                    <div key={`${it.product.id}-${it.selectedSize}`} className="pt-2 first:pt-0 flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h5 className="font-heading font-bold text-xs text-gray-900 truncate">
                          {it.product.name}
                        </h5>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                          <span className="font-bold text-pink-700 bg-pink-50 px-1.5 py-0.2 rounded border border-pink-200">
                            Size {it.selectedSize}
                          </span>
                          <span>•</span>
                          <span>Rp {it.product.price.toLocaleString('id-ID')}</span>
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateQty(idx, -1)}
                          className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center font-bold text-xs text-gray-800">
                          {it.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQty(idx, 1)}
                          className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="w-6 h-6 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 flex items-center justify-center transition-colors ml-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Discount Section */}
              {cart.length > 0 && (
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-gray-700">Diskon / Potongan:</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-gray-100 p-0.5 rounded-xl border border-gray-200 gap-1">
                      <button
                        type="button"
                        onClick={() => setDiscountType('nominal')}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                          discountType === 'nominal'
                            ? 'bg-[#be185d] text-white shadow-2xs ring-1 ring-pink-400'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                        }`}
                      >
                        {discountType === 'nominal' && <Check className="w-3 h-3 stroke-[3]" />}
                        <span>Rp Nominal</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiscountType('percent')}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                          discountType === 'percent'
                            ? 'bg-[#be185d] text-white shadow-2xs ring-1 ring-pink-400'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                        }`}
                      >
                        {discountType === 'percent' && <Check className="w-3 h-3 stroke-[3]" />}
                        <span>% Persen</span>
                      </button>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={discountValue || ''}
                      onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-24 text-right px-2.5 py-1 text-xs font-bold rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              {/* Subtotal & Total Summary */}
              <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Diskon</span>
                    <span>-Rp {discountAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm font-extrabold text-gray-900 pt-1 border-t border-dashed border-gray-200">
                  <span>Total Bayar</span>
                  <span className="text-lg text-pink-700 font-heading">
                    Rp {totalAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">Metode Pembayaran:</span>
                  <span className="text-[11px] font-bold text-[#be185d] bg-pink-100 px-2 py-0.5 rounded-full">
                    {paymentMethod}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Tunai (Cash)', label: 'Tunai (Cash)', icon: DollarSign },
                    { id: 'QRIS', label: 'QRIS', icon: QrCode },
                    { id: 'Debit EDC / Transfer', label: 'Debit EDC', icon: CreditCard },
                  ].map((m) => {
                    const Icon = m.icon;
                    const active = paymentMethod === m.id;
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`relative p-2.5 rounded-2xl text-xs font-bold flex flex-col items-center justify-between min-h-[76px] transition-all cursor-pointer ${
                          active
                            ? 'bg-gradient-to-b from-pink-100 via-pink-50 to-white border-2 border-[#be185d] text-[#9d174d] shadow-sm ring-2 ring-pink-300/80 scale-[1.02]'
                            : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-pink-300 hover:bg-pink-50/30'
                        }`}
                      >
                        {/* Top-Right Indicator: Checkmark when selected, radio ring when unselected */}
                        <div
                          className={`absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                            active
                              ? 'bg-[#be185d] text-white shadow-2xs'
                              : 'border-2 border-gray-300 bg-white'
                          }`}
                        >
                          {active && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>

                        <div className="flex flex-col items-center gap-1 mt-0.5">
                          <Icon className={`w-5 h-5 ${active ? 'text-[#be185d]' : 'text-gray-500'}`} />
                          <span className={`font-heading font-extrabold text-xs ${active ? 'text-[#9d174d]' : 'text-gray-700'}`}>
                            {m.label}
                          </span>
                        </div>

                        {/* Visible status badge underneath */}
                        <span
                          className={`mt-1.5 text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5 transition-all ${
                            active
                              ? 'bg-[#be185d] text-white shadow-2xs'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {active ? (
                            <>
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                              <span>Dipilih</span>
                            </>
                          ) : (
                            <span>Pilih</span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Cash Calculation & Presets */}
                {paymentMethod === 'Tunai (Cash)' && (
                  <div className="p-3 bg-pink-50/60 rounded-2xl border border-pink-200 space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-gray-700">Uang Diterima:</span>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-xs text-gray-500">Rp</span>
                        <input
                          type="number"
                          value={cashReceived}
                          onChange={(e) => setCashReceived(e.target.value)}
                          placeholder={totalAmount.toString()}
                          className="w-36 pl-8 pr-3 py-1.5 text-xs font-bold text-right rounded-xl bg-white border border-pink-300 focus:outline-hidden focus:ring-2 focus:ring-pink-400"
                        />
                      </div>
                    </div>

                    {/* Quick Amount Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={setExactCash}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          cashNum === totalAmount && totalAmount > 0
                            ? 'bg-[#be185d] text-white border-2 border-[#9d174d] shadow-2xs'
                            : 'bg-white hover:bg-pink-100 text-pink-800 border border-pink-200 shadow-2xs'
                        }`}
                      >
                        {cashNum === totalAmount && totalAmount > 0 && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        <span>Uang Pas</span>
                      </button>
                      {[100000, 200000, 300000, 500000].map((amt) => {
                        const isSelected = cashNum === amt;
                        return (
                          <button
                            type="button"
                            key={amt}
                            onClick={() => addQuickCash(amt)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                              isSelected
                                ? 'bg-[#be185d] text-white border-2 border-[#9d174d] shadow-2xs'
                                : 'bg-white hover:bg-pink-100 text-pink-800 border border-pink-200 shadow-2xs'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            <span>Rp {(amt / 1000).toLocaleString('id-ID')}k</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Change Display */}
                    <div className="flex items-center justify-between pt-1 border-t border-pink-200/60 text-xs">
                      <span className="font-medium text-gray-600">Kembalian:</span>
                      <span
                        className={`font-extrabold text-sm ${
                          isCashInsufficient ? 'text-red-600' : 'text-emerald-700'
                        }`}
                      >
                        {isCashInsufficient
                          ? `Kurang Rp ${(totalAmount - cashNum).toLocaleString('id-ID')}`
                          : `Rp ${cashChange.toLocaleString('id-ID')}`}
                      </span>
                    </div>
                  </div>
                )}

                {/* QRIS Visual Mock */}
                {paymentMethod === 'QRIS' && (
                  <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 text-center space-y-2 animate-fade-in">
                    <div className="w-28 h-28 mx-auto bg-white p-2 rounded-xl border border-gray-300 flex items-center justify-center">
                      <QrCode className="w-20 h-20 text-gray-800" />
                    </div>
                    <p className="text-[11px] text-gray-600 font-medium">
                      Scan QRIS Mochi Steps via BCA, Gopay, ShopeePay, Mandiri, Dana, dll.
                    </p>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Nominal: Rp {totalAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                )}

                {/* EDC Ref */}
                {paymentMethod === 'Debit EDC / Transfer' && (
                  <div className="pt-1">
                    <input
                      type="text"
                      placeholder="No. Referensi EDC / Approval Code (Opsional)"
                      value={edcRef}
                      onChange={(e) => setEdcRef(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-hidden"
                    />
                  </div>
                )}
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* Big Action Checkout Button */}
            <div className="pt-5">
              <button
                disabled={cart.length === 0 || isProcessing || isCashInsufficient}
                onClick={handleProcessTransaction}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700 hover:from-pink-700 hover:to-rose-800 text-white font-heading font-extrabold text-sm shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memproses Transaksi & Potong Stok...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Bayar & Cetak Struk (Rp {totalAmount.toLocaleString('id-ID')})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : (
        /* TAB 2: RIWAYAT TRANSAKSI POS */
        <div className="space-y-5 animate-fade-in">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-100 text-[#be185d] flex items-center justify-center shrink-0">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-gray-500 font-medium">Total Transaksi POS</p>
                <p className="font-heading font-extrabold text-lg text-gray-900">
                  {historyMetrics.totalTransactions}{' '}
                  <span className="text-xs font-normal text-gray-400">struk</span>
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-gray-500 font-medium">Total Omzet Kasir</p>
                <p className="font-heading font-extrabold text-lg text-emerald-700">
                  Rp {historyMetrics.totalRevenue.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-gray-500 font-medium">Pembayaran Tunai</p>
                <p className="font-heading font-extrabold text-base text-blue-800">
                  Rp {historyMetrics.cashTotal.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-gray-500 font-medium">QRIS & Transfer</p>
                <p className="font-heading font-extrabold text-base text-purple-800">
                  Rp {historyMetrics.nonCashTotal.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari No. Struk, Nama Pelanggan, atau Sepatu..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-300 transition-all text-gray-800"
              />
              {historySearch && (
                <button
                  type="button"
                  onClick={() => setHistorySearch('')}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Date Filters */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs">
                {[
                  { id: 'today', label: 'Hari Ini' },
                  { id: '7days', label: '7 Hari' },
                  { id: 'all', label: 'Semua Waktu' },
                ].map((df) => {
                  const isActive = historyDateFilter === df.id;
                  return (
                    <button
                      key={df.id}
                      type="button"
                      onClick={() => setHistoryDateFilter(df.id as any)}
                      className={`px-3 py-1 rounded-lg font-bold text-xs transition-all flex items-center gap-1 cursor-pointer ${
                        isActive
                          ? 'bg-[#be185d] text-white shadow-2xs ring-1 ring-pink-400'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {isActive && <Check className="w-3 h-3 stroke-[3]" />}
                      <span>{df.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Payment Method Filter */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs">
                {[
                  { id: 'all', label: 'Semua Metode' },
                  { id: 'tunai', label: 'Tunai' },
                  { id: 'qris', label: 'QRIS' },
                  { id: 'transfer', label: 'Debit/Transfer' },
                ].map((pm) => {
                  const isActive = historyPaymentFilter === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setHistoryPaymentFilter(pm.id)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all flex items-center gap-1 cursor-pointer ${
                        isActive
                          ? 'bg-[#be185d] text-white shadow-2xs ring-1 ring-pink-400'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {isActive && <Check className="w-3 h-3 stroke-[3]" />}
                      <span>{pm.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Transactions List */}
          {filteredHistoryOrders.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center space-y-3 shadow-2xs">
              <div className="w-14 h-14 rounded-full bg-pink-50 text-[#be185d] flex items-center justify-center mx-auto">
                <Receipt className="w-7 h-7" />
              </div>
              <h4 className="font-heading font-bold text-base text-gray-800">
                Belum Ada Riwayat Transaksi POS
              </h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {historySearch || historyDateFilter !== 'all' || historyPaymentFilter !== 'all'
                  ? 'Tidak ada transaksi kasir yang cocok dengan filter yang dipilih. Coba atur ulang filter Anda.'
                  : 'Belum ada transaksi kasir yang tercatat. Selesaikan transaksi pertama Anda di menu kasir!'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setHistorySearch('');
                  setHistoryDateFilter('all');
                  setHistoryPaymentFilter('all');
                  setActiveTab('pos');
                }}
                className="mt-2 px-5 py-2.5 rounded-xl bg-[#be185d] hover:bg-[#9d174d] text-white font-bold text-xs transition-all cursor-pointer shadow-xs"
              >
                + Buka Kasir & Transaksi Baru
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistoryOrders.map((order) => {
                const isCash =
                  order.paymentMethod.toLowerCase().includes('tunai') ||
                  order.paymentMethod.toLowerCase().includes('cash');
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-gray-200 hover:border-pink-300 p-4 transition-all shadow-2xs space-y-3"
                  >
                    {/* Header info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-pink-100 text-[#be185d] flex items-center justify-center font-bold text-xs shrink-0">
                          <Receipt className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-heading font-bold text-xs text-gray-900">
                              {order.receiptNumber || order.orderNumber}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{order.paymentStatus || 'Lunas'}</span>
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
                              POS Offline
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500">
                            {new Date(order.createdAt).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            • Kasir:{' '}
                            <span className="font-semibold text-gray-700">
                              {order.cashierName || 'Kasir Toko'}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="text-left sm:text-right">
                        <p className="text-xs font-bold text-gray-800 flex sm:justify-end items-center gap-1">
                          <User className="w-3.5 h-3.5 text-pink-600" />
                          <span>{order.customerName}</span>
                        </p>
                        {order.customerPhone && order.customerPhone !== '-' && (
                          <p className="text-[11px] text-gray-500">{order.customerPhone}</p>
                        )}
                      </div>
                    </div>

                    {/* Order items preview */}
                    <div className="space-y-1 text-xs">
                      {order.items.map((it, i) => (
                        <div key={i} className="flex items-center justify-between text-gray-700">
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-bold text-pink-800 bg-pink-50 px-1.5 py-0.2 rounded text-[11px] border border-pink-200">
                              Size {it.size}
                            </span>
                            <span className="truncate">{it.name}</span>
                            <span className="text-gray-400 text-[11px]">x {it.quantity}</span>
                          </div>
                          <span className="font-semibold text-gray-800 shrink-0">
                            Rp {(it.price * it.quantity).toLocaleString('id-ID')}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Footer totals & action buttons */}
                    <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 text-xs flex-wrap">
                        <span className="px-2.5 py-1 rounded-lg bg-gray-100 font-bold text-gray-700 border border-gray-200">
                          Metode: {order.paymentMethod}
                        </span>
                        {isCash && order.cashReceived ? (
                          <span className="text-[11px] text-gray-500">
                            Uang: Rp {order.cashReceived.toLocaleString('id-ID')}{' '}
                            {order.cashChange
                              ? `(Kembali Rp ${order.cashChange.toLocaleString('id-ID')})`
                              : ''}
                          </span>
                        ) : null}
                        {order.discountAmount ? (
                          <span className="text-[11px] text-emerald-600 font-medium">
                            Diskon: -Rp {order.discountAmount.toLocaleString('id-ID')}
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right">
                          <span className="text-[10px] text-gray-500 block">Total Transaksi</span>
                          <span className="font-heading font-extrabold text-sm text-[#be185d]">
                            Rp {order.totalAmount.toLocaleString('id-ID')}
                          </span>
                        </div>

                        {/* Action Buttons: Detail Modal & Cetak Struk */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setCompletedOrder(order);
                              setShowReceipt(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-800 font-bold text-xs flex items-center gap-1.5 border border-pink-200 transition-all cursor-pointer shadow-2xs"
                            title="Buka detail struk belanja"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Detail Struk</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              handlePrintReceipt(paperWidth, order);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-[#be185d] hover:bg-[#9d174d] text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                            title="Cetak struk thermal ke printer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Cetak Struk</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL STRUK KASIR THERMAL RECEIPT (Tahap 1: Tampil di layar, Tahap 2: Klik Cetak -> Print Preview) */}
      {showReceipt && completedOrder && (
        <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-pink-200 overflow-hidden animate-scale-up flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 flex-shrink-0" />
                <div>
                  <h3 className="font-heading font-bold text-sm">
                    {activeTab === 'history'
                      ? `Struk Transaksi #${completedOrder.receiptNumber || completedOrder.orderNumber}`
                      : 'Transaksi Kasir Berhasil!'}
                  </h3>
                  <p className="text-[10px] text-pink-100">
                    {new Date(completedOrder.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })} • Kasir: {completedOrder.cashierName || 'Kasir'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowReceipt(false);
                  setCompletedOrder(null);
                }}
                className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                title="Tutup Modal Struk"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification / Toast Banner if printing */}
            {printNotice && (
              <div className="bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800 border-b border-emerald-200 flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{printNotice}</span>
              </div>
            )}

            {/* Thermal Size Selector */}
            <div className="bg-pink-50/70 px-4 py-2.5 border-b border-pink-100 flex items-center justify-between text-xs">
              <span className="font-bold text-gray-700 flex items-center gap-1.5">
                <Printer className="w-3.5 h-3.5 text-[#be185d]" />
                <span>Format Thermal Printer:</span>
              </span>
              <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-pink-200">
                <button
                  type="button"
                  onClick={() => setPaperWidth('58mm')}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-all flex items-center gap-1 cursor-pointer ${
                    paperWidth === '58mm'
                      ? 'bg-[#be185d] text-white shadow-2xs ring-1 ring-pink-400'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-pink-50'
                  }`}
                >
                  {paperWidth === '58mm' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  <span>58mm Compact</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaperWidth('80mm')}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-all flex items-center gap-1 cursor-pointer ${
                    paperWidth === '80mm'
                      ? 'bg-[#be185d] text-white shadow-2xs ring-1 ring-pink-400'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-pink-50'
                  }`}
                >
                  {paperWidth === '80mm' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  <span>80mm Standar</span>
                </button>
              </div>
            </div>

            {/* Thermal Receipt Paper Content */}
            <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
              <div
                ref={receiptPrintRef}
                className={`bg-white p-5 rounded-2xl border border-gray-300 shadow-xs font-mono text-xs text-gray-800 space-y-3 mx-auto ${
                  paperWidth === '58mm' ? 'max-w-[280px]' : 'max-w-[340px]'
                }`}
              >
                {/* Store Header */}
                <div className="text-center space-y-0.5 border-b border-dashed border-gray-300 pb-3">
                  <h4 className="font-heading font-extrabold text-sm tracking-wider text-pink-700">
                    MOCHI STEPS
                  </h4>
                  <p className="text-[10px] text-gray-500">Your Everyday Steps, Your Style</p>
                  <p className="text-[10px] text-gray-500">Workshop: Solo, Jawa Tengah</p>
                  <p className="text-[10px] text-gray-500">WA CS: 0819456732451</p>
                </div>

                {/* Metadata */}
                <div className="text-[10px] space-y-0.5 border-b border-dashed border-gray-300 pb-2">
                  <div className="flex justify-between">
                    <span>No. Struk</span>
                    <span className="font-bold">{completedOrder.receiptNumber || completedOrder.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tanggal</span>
                    <span>{new Date(completedOrder.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kasir</span>
                    <span>{completedOrder.cashierName || 'Kasir Mochi Steps'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pelanggan</span>
                    <span>{completedOrder.customerName}</span>
                  </div>
                  {completedOrder.customerPhone && completedOrder.customerPhone !== '-' && (
                    <div className="flex justify-between">
                      <span>No Telp</span>
                      <span>{completedOrder.customerPhone}</span>
                    </div>
                  )}
                </div>

                {/* Items */}
                <div className="space-y-1.5 border-b border-dashed border-gray-300 pb-2 text-[11px]">
                  {completedOrder.items.map((it, idx) => (
                    <div key={idx}>
                      <div className="font-semibold text-gray-900">{it.name}</div>
                      <div className="flex justify-between text-gray-600 text-[10px]">
                        <span>Size {it.size} x {it.quantity} @ Rp {it.price.toLocaleString('id-ID')}</span>
                        <span>Rp {(it.price * it.quantity).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-1 text-[11px] border-b border-dashed border-gray-300 pb-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Rp {completedOrder.subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  {completedOrder.discountAmount ? (
                    <div className="flex justify-between text-emerald-600">
                      <span>Diskon</span>
                      <span>-Rp {completedOrder.discountAmount.toLocaleString('id-ID')}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between font-bold text-xs pt-1 text-gray-900 border-t border-gray-200">
                    <span>TOTAL</span>
                    <span>Rp {completedOrder.totalAmount.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* Payment info */}
                <div className="space-y-0.5 text-[10px] text-gray-600 border-b border-dashed border-gray-300 pb-2">
                  <div className="flex justify-between">
                    <span>Metode</span>
                    <span>{completedOrder.paymentMethod}</span>
                  </div>
                  {completedOrder.cashReceived ? (
                    <div className="flex justify-between">
                      <span>Bayar Tunai</span>
                      <span>Rp {completedOrder.cashReceived.toLocaleString('id-ID')}</span>
                    </div>
                  ) : null}
                  {completedOrder.cashChange ? (
                    <div className="flex justify-between font-bold text-gray-900">
                      <span>Kembalian</span>
                      <span>Rp {completedOrder.cashChange.toLocaleString('id-ID')}</span>
                    </div>
                  ) : null}
                </div>

                {/* Footer notes */}
                <div className="text-center text-[10px] text-gray-500 pt-1 space-y-0.5">
                  <p>✨ Garansi Tukar Ukuran 7 Hari ✨</p>
                  <p>Simpan struk fisik ini sbg bukti sah</p>
                  <p>Instagram: @mochisteps.id</p>
                  <p className="font-bold text-gray-700 mt-1">Terima Kasih Telah Belanja! 🌸</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-white border-t border-gray-200 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handlePrintReceipt(paperWidth)}
                className="py-2.5 px-3 rounded-xl bg-[#be185d] hover:bg-[#9d174d] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Struk ({paperWidth})</span>
              </button>

              <button
                type="button"
                onClick={handleCopyReceiptText}
                className="py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedReceipt ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedReceipt ? 'Tersalin!' : 'Salin Teks'}</span>
              </button>

              <button
                type="button"
                onClick={handleShareReceiptWhatsApp}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Kirim WA</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowReceipt(false);
                  setCompletedOrder(null);
                }}
                className="col-span-3 py-2.5 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-900 font-bold text-xs transition-colors cursor-pointer mt-1"
              >
                {activeTab === 'history' ? '✕ Tutup Modal Struk' : '+ Transaksi Kasir Baru'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating notification when print triggered */}
      {printNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-pink-500 animate-slide-up">
          <Printer className="w-5 h-5 text-pink-400 animate-pulse flex-shrink-0" />
          <span className="text-xs font-bold">{printNotice}</span>
        </div>
      )}
    </div>
  );
};
