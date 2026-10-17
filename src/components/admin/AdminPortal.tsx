import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Users,
  CheckCircle,
  TrendingUp,
  Boxes,
  Package,
  Search,
  Filter,
  LogOut,
  MessageCircle,
  ExternalLink,
  Plus,
  RefreshCw,
  Clock,
  Truck,
  Check,
  X,
  AlertTriangle,
  AlertCircle,
  Eye,
  Edit2,
  Trash2,
  Sparkles,
  ShieldCheck,
  Receipt,
  DollarSign,
  Calculator,
  Printer,
  Copy,
  ArrowRight,
  LayoutDashboard,
  FileText,
  Share2,
  CheckCircle2,
  Image as ImageIcon,
  Sliders,
} from 'lucide-react';
import {
  Order,
  Product,
  StockMutation,
  CustomerSummary,
  OrderStatus,
  PaymentStatus,
} from '../../types';
import {
  approvePayment,
  rejectPayment,
  cancelCustomerOrder,
  updateOrderStatus,
  updateOrderCustomStatus,
  updateOrderTracking,
  updateProductDetails,
  updateProductSizeStock,
  getProductSizeStock,
  calculateTotalFromSizeStock,
  DEFAULT_SIZES,
  addNewProduct,
  deleteProduct,
} from '../../lib/firestoreService';
import { printThermalReceipt, formatReceiptText } from '../../lib/receiptPrinter';
import { MochiLogo } from '../MochiLogo';
import { FlatshoeImage } from '../FlatshoeImage';
import { PosKasir } from './PosKasir';
import { PricingProfitManager } from './PricingProfitManager';
import { InventoryStockManager } from './InventoryStockManager';

interface AdminPortalProps {
  adminEmail: string;
  onLogout: () => void;
  products: Product[];
  orders: Order[];
  mutations: StockMutation[];
  isFirestoreConnected: boolean;
}

export type AdminTab =
  | 'dashboard'
  | 'products'
  | 'orders'
  | 'customers'
  | 'approval'
  | 'sales'
  | 'inventory'
  | 'pricing';

export const AdminPortal: React.FC<AdminPortalProps> = ({
  adminEmail,
  onLogout,
  products,
  orders,
  mutations,
  isFirestoreConnected,
}) => {
  // Navigation State - Default to Dashboard
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isPosOpen, setIsPosOpen] = useState<boolean>(false);

  // Search and Filter States for Orders
  const [orderSearch, setOrderSearch] = useState('');
  const [orderPaymentStatusFilter, setOrderPaymentStatusFilter] = useState<string>('all');
  const [orderPaymentMethodFilter, setOrderPaymentMethodFilter] = useState<string>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<Order | null>(null);
  const [modalTrackingInput, setModalTrackingInput] = useState<string>('');
  const [isUpdatingTracking, setIsUpdatingTracking] = useState<boolean>(false);
  const [copiedReceiptModal, setCopiedReceiptModal] = useState<boolean>(false);

  // Receipt viewing modal state in Admin Portal (View, reprint, copy, share receipt)
  const [viewingReceiptOrder, setViewingReceiptOrder] = useState<Order | null>(null);
  const [receiptPaperWidth, setReceiptPaperWidth] = useState<'58mm' | '80mm'>('58mm');
  const [copiedReceiptText, setCopiedReceiptText] = useState<boolean>(false);
  const [receiptPrintToast, setReceiptPrintToast] = useState<string | null>(null);

  // Search States for Customers
  const [customerSearch, setCustomerSearch] = useState('');

  // Search and Filter States for Approval & Riwayat Approval
  const [approvalSearch, setApprovalSearch] = useState('');
  const [approvalSubTab, setApprovalSubTab] = useState<'pending' | 'history'>('pending');
  const [approvalHistoryStatusFilter, setApprovalHistoryStatusFilter] = useState<'all' | 'Disetujui' | 'Ditolak'>('all');
  const [rejectingOrder, setRejectingOrder] = useState<Order | null>(null);
  const [rejectReasonType, setRejectReasonType] = useState<string>('Nominal transfer tidak sesuai pesanan');
  const [customRejectReason, setCustomRejectReason] = useState<string>('');
  const [isSubmittingReject, setIsSubmittingReject] = useState<boolean>(false);
  const [approvingOrderId, setApprovingOrderId] = useState<string | null>(null);
  const [approvalToast, setApprovalToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [zoomedProofImage, setZoomedProofImage] = useState<{ url?: string; orderNumber: string; customerName: string; amount?: number; method?: string } | null>(null);

  const showApprovalToast = (message: string, type: 'success' | 'error' = 'success') => {
    setApprovalToast({ message, type });
    setTimeout(() => setApprovalToast(null), 4000);
  };

  // Product Edit Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingSizeStockProduct, setEditingSizeStockProduct] = useState<Product | null>(null);
  const [tempSizeStock, setTempSizeStock] = useState<Record<number, number>>({ 36: 0, 37: 0, 38: 0, 39: 0, 40: 0, 41: 0 });
  const [isSavingSizeStock, setIsSavingSizeStock] = useState<boolean>(false);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<
    'Flat Shoes Klasik' | 'Pointed Elegant' | 'Loafers & Slip-on'
  >('Flat Shoes Klasik');
  const [newProdPrice, setNewProdPrice] = useState<number>(199000);
  const [newProdCostPrice, setNewProdCostPrice] = useState<number>(115000);
  const [newProdStock, setNewProdStock] = useState<number>(20);
  const [newProdColor, setNewProdColor] = useState('Blush Pink');
  const [newProdDesc, setNewProdDesc] = useState('Flatshoes berbusa mochi 8mm yang empuk anti capek.');
  const [newProdImage, setNewProdImage] = useState(
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80'
  );

  const formatRupiah = (num?: number | null) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(Number(num) || 0);
  };

  const formatDateSafe = (dateVal: any): string => {
    if (!dateVal) return '-';
    try {
      let d: Date;
      if (typeof dateVal === 'string' || typeof dateVal === 'number') {
        d = new Date(dateVal);
      } else if (dateVal.toDate && typeof dateVal.toDate === 'function') {
        d = dateVal.toDate();
      } else if (dateVal.seconds) {
        d = new Date(dateVal.seconds * 1000);
      } else {
        d = new Date(dateVal);
      }
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  const getTimeSafe = (val: any): number => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    if (val.seconds) return val.seconds * 1000;
    if (val.toDate && typeof val.toDate === 'function') return val.toDate().getTime();
    const t = new Date(val).getTime();
    return isNaN(t) ? 0 : t;
  };

  // Compile unique Customers list (Safely handles undefined/null fields)
  const customersList: CustomerSummary[] = useMemo(() => {
    const map = new Map<string, CustomerSummary>();

    (orders || []).forEach((ord) => {
      if (!ord) return;
      const cleanPhone = (ord.customerPhone || '').trim();
      if (!cleanPhone || cleanPhone === '-') return;

      const existing = map.get(cleanPhone);
      if (existing) {
        existing.totalOrders += 1;
        existing.totalSpent += Number(ord.totalAmount) || 0;
        existing.orders.push(ord);
        if (new Date(ord.createdAt || 0) > new Date(existing.lastOrderDate || 0)) {
          existing.lastOrderDate = ord.createdAt || new Date().toISOString();
          existing.name = ord.customerName || existing.name;
          existing.address = ord.customerAddress || existing.address;
          existing.district = ord.district || existing.district;
          existing.city = ord.city || existing.city;
          existing.postalCode = ord.postalCode || existing.postalCode;
        }
      } else {
        map.set(cleanPhone, {
          phone: cleanPhone,
          name: ord.customerName || 'Pelanggan',
          address: ord.customerAddress || '-',
          district: ord.district || '-',
          city: ord.city || '-',
          postalCode: ord.postalCode || '-',
          totalOrders: 1,
          totalSpent: Number(ord.totalAmount) || 0,
          lastOrderDate: ord.createdAt || new Date().toISOString(),
          orders: [ord],
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  // Filtered Orders (Exclusively Webstore orders; POS orders belong strictly in POS Kasir Riwayat)
  const filteredOrders = useMemo(() => {
    return (orders || []).filter((o) => {
      if (!o) return false;
      // Exclude POS transactions to keep Webstore and POS completely separate
      if (o.channel === 'pos' || (o.orderNumber && o.orderNumber.startsWith('POS-'))) {
        return false;
      }

      const q = (orderSearch || '').toLowerCase().trim();
      const matchesSearch =
        !q ||
        (o.orderNumber || '').toLowerCase().includes(q) ||
        (o.customerName || '').toLowerCase().includes(q) ||
        (o.customerPhone || '').includes(q);

      const matchesPaymentStatus =
        orderPaymentStatusFilter === 'all' || o.paymentStatus === orderPaymentStatusFilter;

      const matchesPaymentMethod =
        orderPaymentMethodFilter === 'all' || o.paymentMethod === orderPaymentMethodFilter;

      const matchesOrderStatus =
        orderStatusFilter === 'all' || o.orderStatus === orderStatusFilter;

      return (
        matchesSearch && matchesPaymentStatus && matchesPaymentMethod && matchesOrderStatus
      );
    });
  }, [orders, orderSearch, orderPaymentStatusFilter, orderPaymentMethodFilter, orderStatusFilter]);

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    const q = (customerSearch || '').toLowerCase().trim();
    if (!q) return customersList;
    return customersList.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.phone || '').includes(q) ||
        (c.city || '').toLowerCase().includes(q) ||
        (c.district || '').toLowerCase().includes(q)
    );
  }, [customersList, customerSearch]);

  // Filtered Approval Orders: Pending list
  const pendingApprovalOrders = useMemo(() => {
    return (orders || [])
      .filter((o) => {
        if (!o) return false;
        const isPending =
          (o.orderStatus === 'Menunggu Verifikasi' ||
            o.paymentStatus === 'Menunggu Pembayaran' ||
            o.orderStatus === 'Menunggu Pembayaran') &&
          o.paymentStatus !== 'Lunas' &&
          o.paymentStatus !== 'Ditolak';
        if (!isPending) return false;
        if (!approvalSearch.trim()) return true;
        const q = approvalSearch.toLowerCase().trim();
        return (
          (o.orderNumber || '').toLowerCase().includes(q) ||
          (o.customerName || '').toLowerCase().includes(q) ||
          (o.customerPhone || '').includes(q) ||
          (o.paymentMethod || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => getTimeSafe(b.createdAt) - getTimeSafe(a.createdAt));
  }, [orders, approvalSearch]);

  // Filtered Approval Orders: History list (Approved and Rejected)
  const historyApprovalOrders = useMemo(() => {
    return (orders || [])
      .filter((o) => {
        if (!o) return false;
        const isVerified =
          o.orderStatus === 'Disetujui' ||
          o.orderStatus === 'Ditolak' ||
          o.orderStatus === 'Dikirim' ||
          o.orderStatus === 'Selesai' ||
          o.paymentStatus === 'Lunas' ||
          o.paymentStatus === 'Ditolak';
        if (!isVerified) return false;

        const matchesStatus =
          approvalHistoryStatusFilter === 'all'
            ? true
            : approvalHistoryStatusFilter === 'Disetujui'
            ? o.paymentStatus === 'Lunas' || o.orderStatus === 'Disetujui'
            : o.paymentStatus === 'Ditolak' || o.orderStatus === 'Ditolak';

        if (!matchesStatus) return false;
        if (!approvalSearch.trim()) return true;
        const q = approvalSearch.toLowerCase().trim();
        return (
          (o.orderNumber || '').toLowerCase().includes(q) ||
          (o.customerName || '').toLowerCase().includes(q) ||
          (o.customerPhone || '').includes(q) ||
          (o.paymentMethod || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => getTimeSafe(b.updatedAt || b.createdAt) - getTimeSafe(a.updatedAt || a.createdAt));
  }, [orders, approvalSearch, approvalHistoryStatusFilter]);

  // Approval Metrics
  const approvalMetrics = useMemo(() => {
    const list = orders || [];
    const pending = list.filter(
      (o) =>
        o &&
        (o.orderStatus === 'Menunggu Verifikasi' ||
          o.paymentStatus === 'Menunggu Pembayaran' ||
          o.orderStatus === 'Menunggu Pembayaran') &&
        o.paymentStatus !== 'Lunas' &&
        o.paymentStatus !== 'Ditolak'
    );
    const approved = list.filter((o) => o && (o.paymentStatus === 'Lunas' || o.orderStatus === 'Disetujui'));
    const rejected = list.filter((o) => o && (o.paymentStatus === 'Ditolak' || o.orderStatus === 'Ditolak'));
    const approvedTotalAmount = approved.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    return {
      pendingCount: pending.length,
      approvedCount: approved.length,
      rejectedCount: rejected.length,
      approvedTotalAmount,
    };
  }, [orders]);

  // Sales and Profit Analytics
  const salesMetrics = useMemo(() => {
    const paidOrders = orders.filter((o) => o.paymentStatus === 'Lunas');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrdersCount = orders.length;
    const aov = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

    let totalUnitsSold = 0;
    let totalGrossProfit = 0;
    const productSoldMap = new Map<string, { name: string; units: number; revenue: number }>();
    const categoryRevenueMap = new Map<string, number>();

    // Create cost lookup
    const costMap = new Map<string, number>();
    products.forEach((p) => {
      costMap.set(p.id, p.costPrice || Math.round(p.price * 0.55));
    });

    paidOrders.forEach((o) => {
      if (Array.isArray(o.items)) {
        o.items.forEach((item) => {
          totalUnitsSold += item.quantity;
          const cost = costMap.get(item.productId) || Math.round(item.price * 0.55);
          totalGrossProfit += (item.price - cost) * item.quantity;

          const existing = productSoldMap.get(item.productId);
          if (existing) {
            existing.units += item.quantity;
            existing.revenue += item.price * item.quantity;
          } else {
            productSoldMap.set(item.productId, {
              name: item.name,
              units: item.quantity,
              revenue: item.price * item.quantity,
            });
          }

          const prod = products.find((p) => p.id === item.productId);
          const cat = prod?.category || 'Flat Shoes Klasik';
          categoryRevenueMap.set(cat, (categoryRevenueMap.get(cat) || 0) + item.price * item.quantity);
        });
      }
    });

    const topSellingProducts = Array.from(productSoldMap.values())
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);

    // Daily Sales (last 7 days aggregation)
    const dailyMap = new Map<string, number>();
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      days.push(key);
      dailyMap.set(key, 0);
    }

    paidOrders.forEach((o) => {
      const d = new Date(o.createdAt);
      const key = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      if (dailyMap.has(key)) {
        dailyMap.set(key, (dailyMap.get(key) || 0) + o.totalAmount);
      }
    });

    const dailySalesChart = days.map((day) => ({
      day,
      revenue: dailyMap.get(day) || 0,
    }));

    return {
      totalRevenue,
      totalOrdersCount,
      paidOrdersCount: paidOrders.length,
      aov,
      totalUnitsSold,
      totalGrossProfit,
      topSellingProducts,
      categoryRevenueMap,
      dailySalesChart,
    };
  }, [orders, products]);

  // Print Thermal Receipt for any order
  const handlePrintOrderReceipt = (order: Order, paperWidth: '58mm' | '80mm' = '58mm') => {
    printThermalReceipt({
      orderNumber: order.orderNumber,
      receiptNumber: order.receiptNumber,
      createdAt: order.createdAt,
      cashierName: order.cashierName || 'Kasir Mochi Steps',
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      items: order.items,
      subtotal: order.subtotal,
      discountAmount: order.discountAmount,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      cashReceived: order.cashReceived,
      cashChange: order.cashChange,
      notes: order.specialNotes,
      paperWidth,
    });
  };

  // Copy receipt text from order detail modal
  const handleCopyModalReceiptText = (order: Order) => {
    const text = formatReceiptText({
      orderNumber: order.orderNumber,
      receiptNumber: order.receiptNumber,
      createdAt: order.createdAt,
      cashierName: order.cashierName || 'Kasir Mochi Steps',
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      items: order.items,
      subtotal: order.subtotal,
      discountAmount: order.discountAmount,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      cashReceived: order.cashReceived,
      cashChange: order.cashChange,
      notes: order.specialNotes,
    });

    navigator.clipboard.writeText(text);
    setCopiedReceiptModal(true);
    setTimeout(() => setCopiedReceiptModal(false), 2000);
  };

  // Update Tracking Number from Modal
  const handleSaveModalTracking = async () => {
    if (!selectedOrderDetail) return;
    setIsUpdatingTracking(true);
    try {
      await updateOrderTracking(selectedOrderDetail.id, modalTrackingInput, 'Dikirim');
      setSelectedOrderDetail({
        ...selectedOrderDetail,
        trackingNumber: modalTrackingInput,
        orderStatus: 'Dikirim',
      });
      alert('Nomor resi berhasil diperbarui dan status diubah menjadi "Dikirim"!');
    } catch (e: any) {
      alert('Gagal memperbarui nomor resi.');
    } finally {
      setIsUpdatingTracking(false);
    }
  };

  // Handle Add New Product Submit
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    try {
      await addNewProduct({
        name: newProdName.trim(),
        category: newProdCategory,
        price: Number(newProdPrice),
        costPrice: Number(newProdCostPrice),
        stock: Number(newProdStock),
        minStock: 5,
        sizes: [36, 37, 38, 39, 40, 41],
        description: newProdDesc.trim(),
        imageUrl: newProdImage.trim(),
        color: newProdColor.trim(),
        badge: 'New Arrival',
        rating: 5.0,
        reviewCount: 1,
        material: 'Premium Microfiber Leather',
        heelHeight: '1 cm Flat',
      });
      setIsNewProductModalOpen(false);
      setNewProdName('');
      alert('Produk baru berhasil ditambahkan ke Firestore!');
    } catch (err) {
      console.error(err);
      alert('Gagal menambah produk.');
    }
  };

  // IF FULL POS MODE IS OPEN
  if (isPosOpen) {
    return (
      <div className="min-h-screen bg-[#faf6f7] p-4 sm:p-6 font-sans">
        <div className="max-w-7xl mx-auto">
          <PosKasir
            products={products}
            adminEmail={adminEmail}
            orders={orders}
            onBackToAdmin={() => setIsPosOpen(false)}
          />
        </div>
      </div>
    );
  }

  // Exact 8 Menu Navigation definition
  const adminMenuItems = [
    { id: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard },
    { id: 'products', label: '2. Data Produk & Stok', icon: Package, count: products.length },
    { id: 'orders', label: '3. Data Order & Riwayat', icon: ShoppingBag, count: orders.length },
    { id: 'customers', label: '4. Data Pelanggan', icon: Users, count: customersList.length },
    {
      id: 'approval',
      label: '5. Approval Bukti Pembayaran',
      icon: CheckCircle,
      count: orders.filter((o) => o.orderStatus === 'Menunggu Verifikasi').length,
      badgeColor: 'bg-amber-500 text-white',
    },
    { id: 'sales', label: '6. Laporan Sales', icon: TrendingUp },
    { id: 'inventory', label: '7. Inventory & Stok', icon: Boxes, count: mutations.length },
    { id: 'pricing', label: '8. Pengaturan Harga & Profit', icon: DollarSign, tag: 'Formula' },
  ];

  return (
    <div className="min-h-screen bg-[#faf6f7] text-[#2d2226] flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-pink-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <MochiLogo variant="compact" size="md" />
              <div className="h-6 w-px bg-pink-200" />
              <div>
                <span className="font-heading font-bold text-sm tracking-wide text-gray-800 bg-pink-50 px-2.5 py-1 rounded-lg border border-pink-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#be185d]" />
                  <span>Portal Admin Mochi Steps</span>
                </span>
              </div>
            </div>

            {/* Top Bar Actions: POS Kasir button, Live Firestore, Webstore button & Logout */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* POS Kasir Dedicated Button */}
              <button
                type="button"
                onClick={() => setIsPosOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:brightness-105 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                title="Buka Halaman Kasir POS Toko Offline Mochi Steps"
              >
                <Receipt className="w-4 h-4" />
                <span>POS Kasir</span>
              </button>

              {/* Firestore Indicator */}
              <div
                className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  isFirestoreConnected
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isFirestoreConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                <span className="hidden md:inline">Firestore:</span>
                <span>{isFirestoreConnected ? 'Terhubung' : 'Offline'}</span>
              </div>

              {/* Back to Webstore Button */}
              <button
                type="button"
                onClick={onLogout}
                className="px-3 py-2 rounded-xl bg-pink-100/80 hover:bg-pink-200/90 text-[#be185d] border border-pink-200 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                title="Buka Halaman Depan Webstore Toko"
              >
                <span>🌸 Webstore</span>
              </button>

              <div className="text-right hidden lg:block">
                <p className="text-xs font-bold text-gray-800 truncate max-w-[140px]">{adminEmail}</p>
                <p className="text-[10px] text-pink-600 font-medium">Administrator</p>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={onLogout}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                title="Keluar dari Portal Admin"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs - Exactly 8 Menus in requested order */}
          <nav className="flex space-x-1 sm:space-x-1.5 overflow-x-auto py-2 scrollbar-none border-t border-gray-100">
            {adminMenuItems.map((tab: any) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-[#d65b7d] to-[#be185d] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.tag && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${
                        active ? 'bg-white/20 text-white' : 'bg-pink-100 text-[#be185d]'
                      }`}
                    >
                      {tab.tag}
                    </span>
                  )}
                  {tab.count !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                        active
                          ? 'bg-white/20 text-white'
                          : tab.badgeColor || 'bg-pink-100 text-[#be185d]'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* ================= 1. DASHBOARD ================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Top Greeting & Fast Actions */}
            <div className="bg-gradient-to-r from-pink-50 via-white to-pink-50 p-5 rounded-3xl border border-pink-200/80 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-heading font-extrabold text-gray-900">
                  Ringkasan Toko Mochi Steps Solo 🌸
                </h2>
                <p className="text-xs text-gray-500">
                  Selamat datang di panel utama pengelolaan toko. Semua transaksi tersimpan aman di database Firestore.
                </p>
              </div>

              {/* Fast Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPosOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Buka POS Kasir</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('pricing')}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Atur Markup & Harga</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('inventory')}
                  className="px-3.5 py-2 rounded-xl bg-[#be185d] hover:bg-[#9d174d] text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Boxes className="w-3.5 h-3.5" />
                  <span>Opname & Stok</span>
                </button>
              </div>
            </div>

            {/* 4 KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-pink-100 shadow-2xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">Total Omzet Lunas</span>
                <p className="text-2xl font-mono font-extrabold text-[#be185d]">
                  {formatRupiah(salesMetrics.totalRevenue)}
                </p>
                <p className="text-[11px] text-gray-500">
                  {salesMetrics.paidOrdersCount} transaksi terverifikasi
                </p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-2xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-600">Estimasi Laba Kotor</span>
                <p className="text-2xl font-mono font-extrabold text-emerald-700">
                  +{formatRupiah(salesMetrics.totalGrossProfit)}
                </p>
                <p className="text-[11px] text-emerald-600 font-semibold">
                  Berdasarkan HPP modal produk
                </p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-blue-100 shadow-2xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-blue-600">Total Unit Terjual</span>
                <p className="text-2xl font-mono font-extrabold text-blue-700">
                  {salesMetrics.totalUnitsSold} Pasang
                </p>
                <p className="text-[11px] text-gray-500">AOV: {formatRupiah(salesMetrics.aov)}</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-2xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-600">Verifikasi Pembayaran</span>
                <p className="text-2xl font-mono font-extrabold text-amber-700">
                  {orders.filter((o) => o.orderStatus === 'Menunggu Verifikasi').length} Menunggu
                </p>
                <button
                  onClick={() => setActiveTab('approval')}
                  className="text-[11px] font-bold text-pink-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Proses Approval</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 7-day Sales Chart & Top Selling */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily Sales Bar Preview */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-pink-100 shadow-2xs space-y-4">
                <h3 className="font-heading font-extrabold text-gray-900 text-sm">
                  Tren Penjualan 7 Hari Terakhir
                </h3>
                <div className="h-44 flex items-end justify-between gap-2 pt-6">
                  {salesMetrics.dailySalesChart.map((d, i) => {
                    const maxRev = Math.max(...salesMetrics.dailySalesChart.map((x) => x.revenue), 1000000);
                    const pct = Math.max(10, Math.round((d.revenue / maxRev) * 100));
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <span className="text-[9px] font-mono text-gray-500 font-bold">
                          {d.revenue > 0 ? (d.revenue / 1000).toFixed(0) + 'k' : '-'}
                        </span>
                        <div className="w-full max-w-[42px] bg-pink-100 rounded-t-xl overflow-hidden h-28 flex items-end">
                          <div
                            style={{ height: `${pct}%` }}
                            className="w-full bg-gradient-to-t from-[#be185d] to-[#d65b7d] rounded-t-xl transition-all"
                          />
                        </div>
                        <span className="text-[10px] text-gray-600 font-medium">{d.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top 5 Best Sellers */}
              <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-2xs space-y-3">
                <h3 className="font-heading font-extrabold text-gray-900 text-sm">
                  Model Paling Diminati
                </h3>
                <div className="space-y-2.5">
                  {salesMetrics.topSellingProducts.length === 0 ? (
                    <p className="text-xs text-gray-400 py-6 text-center">Belum ada data penjualan lunas.</p>
                  ) : (
                    salesMetrics.topSellingProducts.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-pink-50/50 border border-pink-100 flex items-center justify-between text-xs"
                      >
                        <div className="truncate pr-2">
                          <span className="font-bold text-gray-900">{p.name}</span>
                          <span className="text-[10px] text-gray-500 block">
                            Omzet: {formatRupiah(p.revenue)}
                          </span>
                        </div>
                        <span className="px-2 py-1 rounded-lg bg-pink-100 text-[#be185d] font-mono font-extrabold shrink-0">
                          {p.units} ps
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-extrabold text-gray-900 text-sm">
                  Pesanan & Transaksi Terbaru
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-pink-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Lihat Semua Order</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-pink-50/60 text-gray-700 font-bold uppercase text-[10px] tracking-wider border-b border-pink-100">
                    <tr>
                      <th className="py-2.5 px-3">No. Transaksi</th>
                      <th className="py-2.5 px-3">Waktu</th>
                      <th className="py-2.5 px-3">Pelanggan</th>
                      <th className="py-2.5 px-3">Kanal</th>
                      <th className="py-2.5 px-3">Total</th>
                      <th className="py-2.5 px-3">Pembayaran</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.slice(0, 5).map((o) => (
                      <tr key={o.id} className="hover:bg-pink-50/30">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#be185d]">{o.orderNumber}</td>
                        <td className="py-2.5 px-3 text-gray-500 font-mono text-[11px]">
                          {new Date(o.createdAt).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-gray-900">{o.customerName}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                              o.channel === 'pos'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-pink-100 text-[#be185d]'
                            }`}
                          >
                            {o.channel === 'pos' ? 'POS KASIR' : 'WEBSTORE'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold">{formatRupiah(o.totalAmount)}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              o.paymentStatus === 'Lunas'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {o.paymentStatus}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-gray-700">{o.orderStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= 2. DATA PRODUK & STOK ================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-heading text-gray-900">
                  Data Produk & Stok Sepatu
                </h2>
                <p className="text-xs text-gray-500">
                  Kelola katalog flatshoes, harga ritel, batas stok minimum, dan detail visual sepatu.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsNewProductModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#d65b7d] to-[#be185d] text-white font-bold text-xs flex items-center gap-2 shadow-xs hover:brightness-105 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Sepatu Baru</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#fff2f5] text-[#862744] font-bold border-b border-pink-100">
                    <tr>
                      <th className="px-4 py-3.5">Foto & Nama Sepatu</th>
                      <th className="px-4 py-3.5">Kategori</th>
                      <th className="px-4 py-3.5">HPP (Modal)</th>
                      <th className="px-4 py-3.5">Harga Jual</th>
                      <th className="px-4 py-3.5 text-center">Rincian Stok (EU 36–41)</th>
                      <th className="px-4 py-3.5 text-center">Total Fisik</th>
                      <th className="px-4 py-3.5 text-center">Status Toko</th>
                      <th className="px-4 py-3.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-50">
                    {products.map((p) => {
                      const sizeMap = getProductSizeStock(p);
                      const totalPhysical = calculateTotalFromSizeStock(sizeMap);
                      const min = p.minStock !== undefined ? p.minStock : 5;
                      const isLow = totalPhysical <= min;
                      const isOut = totalPhysical === 0;
                      const cost = p.costPrice || Math.round(p.price * 0.55);

                      return (
                        <tr key={p.id} className="hover:bg-pink-50/40 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-pink-100 border border-pink-200">
                                <FlatshoeImage
                                  src={p.imageUrl}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-xs">{p.name}</p>
                                <p className="text-[10px] text-gray-500">{p.color}</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5 text-gray-600">{p.category}</td>
                          <td className="px-4 py-3.5 font-mono text-gray-600">{formatRupiah(cost)}</td>
                          <td className="px-4 py-3.5 font-mono font-bold text-[#be185d]">
                            {formatRupiah(p.price)}
                          </td>

                          {/* Rincian Stok per Ukuran 36-41 */}
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1 flex-wrap max-w-xs mx-auto">
                              {DEFAULT_SIZES.map((sz) => {
                                const q = sizeMap[sz] || 0;
                                return (
                                  <span
                                    key={sz}
                                    className={`px-1.5 py-0.5 rounded-md font-mono text-[10px] font-bold border ${
                                      q === 0
                                        ? 'bg-gray-100 text-gray-400 border-gray-200'
                                        : q <= 2
                                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                                        : 'bg-pink-50 text-[#be185d] border-pink-200'
                                    }`}
                                    title={`Ukuran EU ${sz}: ${q} pasang`}
                                  >
                                    {sz}:{q}
                                  </span>
                                );
                              })}
                            </div>
                          </td>

                          {/* Total Fisik Otomatis dari Penjumlahan Ukuran */}
                          <td className="px-4 py-3.5 text-center font-mono font-extrabold text-xs text-gray-900 whitespace-nowrap">
                            <span className="bg-pink-50 text-[#be185d] px-2.5 py-1 rounded-xl border border-pink-200 inline-block font-bold">
                              {totalPhysical} pasang
                            </span>
                          </td>

                          {/* Status Toko */}
                          <td className="px-4 py-3.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                isOut
                                  ? 'bg-red-500 text-white'
                                  : isLow
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {isOut ? 'Habis' : isLow ? 'Stok Menipis' : 'Stok Aman'}
                            </span>
                          </td>

                          {/* Tombol Edit Stok & Aksi */}
                          <td className="px-4 py-3.5 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingSizeStockProduct(p);
                                  setTempSizeStock(getProductSizeStock(p));
                                }}
                                className="px-3 py-1.5 rounded-xl bg-pink-100 hover:bg-[#be185d] text-[#be185d] hover:text-white font-bold text-[11px] transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                                title="Ubah rincian stok ukuran 36-41 dan hitung total fisik otomatis"
                              >
                                <Sliders className="w-3.5 h-3.5" />
                                <span>Edit Stok</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingProduct(p)}
                                className="p-1.5 rounded-xl bg-gray-100 hover:bg-pink-50 text-gray-700 hover:text-[#be185d] font-bold text-[11px] transition-colors cursor-pointer"
                                title="Edit Detail Sepatu"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (confirm(`Hapus produk "${p.name}" dari katalog?`)) {
                                    await deleteProduct(p.id);
                                  }
                                }}
                                className="p-1.5 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
                                title="Hapus Produk"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= 3. DATA ORDER & RIWAYAT (WEBSTORE ONLINE) ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-heading text-gray-900">
                  Data Order & Riwayat Pesanan Webstore
                </h2>
                <p className="text-xs text-gray-500">
                  Daftar transaksi pesanan online dari webstore Mochi Steps. Kelola detail pengiriman dan ubah status pesanan.
                </p>
              </div>

              {/* Order Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari no. order, pelanggan, no. HP..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full sm:w-72 pl-9 pr-3 py-2 text-xs rounded-xl border border-pink-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-300"
                />
                <Search className="w-4 h-4 text-pink-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-gray-600 mr-1">Status Bayar:</span>
              {['all', 'Lunas', 'Menunggu Pembayaran', 'Ditolak'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setOrderPaymentStatusFilter(st)}
                  className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                    orderPaymentStatusFilter === st
                      ? 'bg-[#be185d] text-white shadow-2xs'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {st === 'all' ? 'Semua' : st}
                </button>
              ))}
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#fff2f5] text-[#862744] font-bold border-b border-pink-100">
                    <tr>
                      <th className="px-4 py-3.5">No. Order</th>
                      <th className="px-4 py-3.5">Waktu</th>
                      <th className="px-4 py-3.5">Pelanggan</th>
                      <th className="px-4 py-3.5">Total Bayar</th>
                      <th className="px-4 py-3.5">Pembayaran</th>
                      <th className="px-4 py-3.5">Status Pesanan</th>
                      <th className="px-4 py-3.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-50">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                          Tidak ada pesanan webstore yang sesuai filter.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-pink-50/40 transition-colors">
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="font-mono font-bold text-xs text-[#be185d] block">
                              {ord.orderNumber}
                            </span>
                            <span className="text-[10px] text-pink-600 font-semibold">
                              Webstore Online
                            </span>
                          </td>

                          <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap font-mono text-[11px]">
                            {new Date(ord.createdAt).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <p className="font-bold text-gray-900">{ord.customerName}</p>
                            <p className="text-[11px] text-gray-500">{ord.customerPhone}</p>
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <p className="font-heading font-extrabold text-[#be185d]">
                              {formatRupiah(ord.totalAmount)}
                            </p>
                            <span className="text-[10px] text-gray-500">{ord.paymentMethod}</span>
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                ord.paymentStatus === 'Lunas'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {ord.paymentStatus}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap font-semibold">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                ord.orderStatus === 'Selesai'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : ord.orderStatus === 'Dikirim'
                                  ? 'bg-purple-100 text-purple-800'
                                  : ord.orderStatus === 'Diproses'
                                  ? 'bg-blue-100 text-blue-800'
                                  : ord.orderStatus === 'Dibatalkan'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {ord.orderStatus}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOrderDetail(ord);
                                setModalTrackingInput(ord.trackingNumber || '');
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-pink-50 hover:bg-[#be185d] text-[#be185d] hover:text-white font-bold text-[11px] transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs border border-pink-200"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Lihat Detail & Ubah Status</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= 4. DATA PELANGGAN ================= */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-heading text-gray-900">
                  Data Pelanggan Mochi Steps
                </h2>
                <p className="text-xs text-gray-500">
                  Daftar pembeli setia dengan tombol direct chat WhatsApp otomatis.
                </p>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari nama, no. WA, kota..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full sm:w-72 pl-9 pr-3 py-2 text-xs rounded-xl border border-pink-200 bg-white focus:outline-hidden"
                />
                <Search className="w-4 h-4 text-pink-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#fff2f5] text-[#862744] font-bold border-b border-pink-100">
                    <tr>
                      <th className="px-4 py-3.5">Nama Lengkap</th>
                      <th className="px-4 py-3.5">Nomor WhatsApp</th>
                      <th className="px-4 py-3.5">Alamat Lengkap</th>
                      <th className="px-4 py-3.5">Kecamatan & Kota</th>
                      <th className="px-4 py-3.5 text-center">Jumlah Order</th>
                      <th className="px-4 py-3.5">Total Belanja</th>
                      <th className="px-4 py-3.5 text-center">Aksi Langsung</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-50">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                          Belum ada data pelanggan yang cocok.
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((cust) => {
                        let waNum = cust.phone.replace(/[^0-9]/g, '');
                        if (waNum.startsWith('0')) waNum = '62' + waNum.slice(1);
                        else if (!waNum.startsWith('62')) waNum = '62' + waNum;
                        const greeting = encodeURIComponent(
                          `Halo Kak ${cust.name}, terima kasih telah berbelanja flatshoes di Mochi Steps! Ada yang bisa kami bantu?`
                        );
                        const waUrl = `https://wa.me/${waNum}?text=${greeting}`;

                        return (
                          <tr key={cust.phone} className="hover:bg-pink-50/40 transition-colors">
                            <td className="px-4 py-3.5 font-bold text-gray-900">{cust.name}</td>
                            <td className="px-4 py-3.5 font-mono text-gray-700">{cust.phone}</td>
                            <td className="px-4 py-3.5 text-gray-600 max-w-xs truncate">{cust.address}</td>
                            <td className="px-4 py-3.5 text-gray-600">
                              {cust.district}, {cust.city}
                            </td>
                            <td className="px-4 py-3.5 text-center font-bold text-gray-800">
                              {cust.totalOrders} order
                            </td>
                            <td className="px-4 py-3.5 font-mono font-bold text-[#be185d]">
                              {formatRupiah(cust.totalSpent)}
                            </td>
                            <td className="px-4 py-3.5 text-center whitespace-nowrap">
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-2xs"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>Hubungi WA</span>
                              </a>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= 5. APPROVAL BUKTI PEMBAYARAN ================= */}
        {activeTab === 'approval' && (
          <div className="space-y-6">
            {/* Header & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-bold font-heading text-gray-900">
                    Approval Bukti Pembayaran
                  </h2>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Real-Time Sync</span>
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Verifikasi transfer bank (BCA, Mandiri, BRI, dll) & QRIS pelanggan. Stok otomatis dikembalikan jika pesanan ditolak.
                </p>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari order, pelanggan, metode..."
                  value={approvalSearch}
                  onChange={(e) => setApprovalSearch(e.target.value)}
                  className="w-full sm:w-72 pl-9 pr-3 py-2 text-xs rounded-xl border border-pink-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-300"
                />
                <Search className="w-4 h-4 text-pink-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* 4 Summary KPI Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Menunggu Verifikasi</span>
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-mono font-extrabold text-amber-800 mt-2">
                  {approvalMetrics.pendingCount} <span className="text-xs font-normal text-amber-600">order</span>
                </p>
                <p className="text-[10px] text-gray-500 mt-1">Perlu tindakan verifikasi admin</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Disetujui (Lunas)</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-mono font-extrabold text-emerald-800 mt-2">
                  {approvalMetrics.approvedCount} <span className="text-xs font-normal text-emerald-600">order</span>
                </p>
                <p className="text-[10px] text-gray-500 mt-1">Pembayaran valid & siap dikirim</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-red-200/80 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider">Ditolak</span>
                  <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                    <X className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-mono font-extrabold text-red-800 mt-2">
                  {approvalMetrics.rejectedCount} <span className="text-xs font-normal text-red-600">order</span>
                </p>
                <p className="text-[10px] text-gray-500 mt-1">Stok produk otomatis pulih</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-pink-200/80 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#be185d] uppercase tracking-wider">Total Disetujui</span>
                  <div className="w-7 h-7 rounded-lg bg-pink-50 text-[#be185d] flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-mono font-extrabold text-[#be185d] mt-2 truncate">
                  {formatRupiah(approvalMetrics.approvedTotalAmount)}
                </p>
                <p className="text-[10px] text-gray-500 mt-1">Nominal dana masuk tervalidasi</p>
              </div>
            </div>

            {/* Sub-tab Switcher: Menunggu Persetujuan vs Riwayat Approval */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-pink-100 shadow-2xs">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setApprovalSubTab('pending')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    approvalSubTab === 'pending'
                      ? 'bg-[#be185d] text-white shadow-2xs'
                      : 'bg-gray-100 hover:bg-pink-50 text-gray-700'
                  }`}
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Menunggu Persetujuan</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      approvalSubTab === 'pending'
                        ? 'bg-white text-[#be185d]'
                        : 'bg-pink-100 text-pink-800'
                    }`}
                  >
                    {pendingApprovalOrders.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setApprovalSubTab('history')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    approvalSubTab === 'history'
                      ? 'bg-[#be185d] text-white shadow-2xs'
                      : 'bg-gray-100 hover:bg-pink-50 text-gray-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Riwayat Approval</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      approvalSubTab === 'history'
                        ? 'bg-white text-[#be185d]'
                        : 'bg-pink-100 text-pink-800'
                    }`}
                  >
                    {historyApprovalOrders.length}
                  </span>
                </button>
              </div>

              {approvalSubTab === 'history' && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[11px] font-semibold text-gray-500 mr-1">Filter Status:</span>
                  {(['all', 'Disetujui', 'Ditolak'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setApprovalHistoryStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                        approvalHistoryStatusFilter === st
                          ? 'bg-[#be185d] text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      {st === 'all' ? 'Semua' : st}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* TAB 1: MENUNGGU PERSETUJUAN */}
            {approvalSubTab === 'pending' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingApprovalOrders.length === 0 ? (
                  <div className="col-span-full py-16 text-center text-gray-400 bg-white rounded-3xl border border-pink-100 space-y-2">
                    <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
                    <p className="font-bold text-gray-800 text-sm">Semua Pembayaran Sudah Terverifikasi!</p>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                      Tidak ada pesanan yang menunggu verifikasi saat ini. Setiap pesanan baru yang masuk dari Webstore akan langsung tampil di sini secara real-time.
                    </p>
                  </div>
                ) : (
                  pendingApprovalOrders.map((ord) => {
                    const cleanPhone = (ord.customerPhone || '').replace(/[^0-9]/g, '');
                    const waNum = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone.startsWith('62') ? cleanPhone : '62' + cleanPhone;
                    const waText = encodeURIComponent(
                      `Halo Kak ${ord.customerName || 'Kak'}, kami dari Admin Mochi Steps mengonfirmasi pembayaran untuk pesanan #${ord.orderNumber} senilai ${formatRupiah(ord.totalAmount)}. Terima kasih!`
                    );
                    const waUrl = cleanPhone.length >= 8 ? `https://wa.me/${waNum}?text=${waText}` : null;
                    const isApproving = approvingOrderId === ord.id;

                    return (
                      <div
                        key={ord.id}
                        className="bg-white rounded-3xl p-5 border border-pink-200 shadow-sm space-y-3.5 flex flex-col justify-between hover:border-pink-300 transition-all"
                      >
                        <div className="space-y-3">
                          {/* Order Header */}
                          <div className="flex justify-between items-start border-b border-gray-100 pb-2.5">
                            <div>
                              <span className="font-mono font-extrabold text-xs text-[#be185d]">
                                {ord.orderNumber}
                              </span>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {formatDateSafe(ord.createdAt)}
                              </p>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>{ord.paymentStatus || 'Menunggu Verifikasi'}</span>
                            </span>
                          </div>

                          {/* Customer & Total */}
                          <div className="bg-pink-50/50 p-3 rounded-2xl text-xs space-y-1.5 border border-pink-100/60">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-bold text-gray-900">{ord.customerName || 'Pelanggan Toko'}</p>
                                <p className="text-[11px] font-mono text-gray-500">{ord.customerPhone || '-'}</p>
                              </div>
                              {waUrl && (
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] inline-flex items-center gap-1 shadow-2xs"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                  <span>WhatsApp</span>
                                </a>
                              )}
                            </div>

                            <div className="pt-1.5 border-t border-pink-100 flex justify-between items-baseline">
                              <span className="text-[11px] text-gray-600">Nominal Transfer:</span>
                              <span className="font-heading font-extrabold text-base text-[#be185d]">
                                {formatRupiah(ord.totalAmount)}
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-[11px] text-gray-600">
                              <span>Metode Bayar:</span>
                              <span className="font-bold text-gray-800 bg-white px-2 py-0.5 rounded-md border border-pink-100">
                                {ord.paymentMethod || 'Transfer Bank'}
                              </span>
                            </div>
                          </div>

                          {/* Bukti Transfer Box */}
                          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-gray-700 text-[11px] flex items-center gap-1">
                                <Receipt className="w-3.5 h-3.5 text-pink-600" />
                                <span>Bukti Pembayaran / Slip Transfer:</span>
                              </span>
                              {ord.paymentProofUrl ? (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  ✓ Foto Asli Diunggah
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                  Belum Ada Foto
                                </span>
                              )}
                            </div>

                            {ord.paymentProofUrl ? (
                              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-emerald-200 text-[11px] gap-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div
                                    onClick={() => {
                                      setZoomedProofImage({
                                        url: ord.paymentProofUrl,
                                        orderNumber: ord.orderNumber,
                                        customerName: ord.customerName,
                                        amount: ord.totalAmount,
                                        method: ord.paymentMethod,
                                      });
                                    }}
                                    className="w-12 h-12 rounded-xl overflow-hidden border border-emerald-300 bg-white shrink-0 shadow-2xs cursor-pointer hover:opacity-90 transition-opacity"
                                    title="Klik untuk zoom foto bukti"
                                  >
                                    <img
                                      src={ord.paymentProofUrl}
                                      alt="Bukti Transfer Asli"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">
                                      {ord.paymentMethod?.includes('QRIS') ? 'QRIS Indonesia' : `${ord.paymentMethod || 'Bank Transfer'}`}
                                    </p>
                                    <p className="text-[10px] text-emerald-700 font-medium">
                                      Foto bukti transfer asli pelanggan
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setZoomedProofImage({
                                      url: ord.paymentProofUrl,
                                      orderNumber: ord.orderNumber,
                                      customerName: ord.customerName,
                                      amount: ord.totalAmount,
                                      method: ord.paymentMethod,
                                    });
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-pink-50 hover:bg-pink-100 text-[#be185d] font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors shrink-0 border border-pink-200"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Lihat Bukti Foto Asli</span>
                                </button>
                              </div>
                            ) : (
                              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                  <div>
                                    <p className="font-bold text-[11px] leading-tight">Bukti pembayaran belum tersedia</p>
                                    <p className="text-[10px] text-amber-700 leading-tight mt-0.5">
                                      Pelanggan belum mengunggah foto struk transfer
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setZoomedProofImage({
                                      url: undefined,
                                      orderNumber: ord.orderNumber,
                                      customerName: ord.customerName,
                                      amount: ord.totalAmount,
                                      method: ord.paymentMethod,
                                    });
                                  }}
                                  className="px-2 py-1 rounded-lg bg-white hover:bg-amber-100 text-amber-800 font-bold text-[10px] border border-amber-300 transition-colors shrink-0 cursor-pointer"
                                >
                                  Cek Status
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Items Preview */}
                          <div className="text-[11px] space-y-1 text-gray-600 border-t border-gray-100 pt-2">
                            <span className="font-bold text-gray-700 block text-[10px] uppercase tracking-wider mb-1">
                              Produk ({((ord.items || []).reduce((s, it) => s + (Number(it?.quantity) || 1), 0))} pasang):
                            </span>
                            {(ord.items || []).map((it, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs">
                                <span className="truncate pr-2">
                                  {it?.name || 'Flatshoes Mochi'} (EU {it?.size || '-'}) x{it?.quantity || 1}
                                </span>
                                <span className="font-mono font-semibold text-gray-800 shrink-0">
                                  {formatRupiah((Number(it?.price) || 0) * (Number(it?.quantity) || 1))}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons: Setujui & Tolak */}
                        <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            disabled={isApproving}
                            onClick={async () => {
                              setApprovingOrderId(ord.id);
                              try {
                                await approvePayment(ord, adminEmail);
                                showApprovalToast(
                                  `Pembayaran #${ord.orderNumber} (${ord.customerName}) berhasil disetujui! Status pesanan kini Lunas & Disetujui.`,
                                  'success'
                                );
                              } catch (e: any) {
                                console.error('Approve error:', e);
                                showApprovalToast(`Gagal menyetujui pembayaran: ${e?.message || 'Error'}`, 'error');
                              } finally {
                                setApprovingOrderId(null);
                              }
                            }}
                            className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            {isApproving ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Memproses...</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4 stroke-[2.5]" />
                                <span>Setujui (Lunas)</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setRejectingOrder(ord);
                              setRejectReasonType('Nominal transfer tidak sesuai pesanan');
                              setCustomRejectReason('');
                            }}
                            className="py-2.5 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <X className="w-4 h-4" />
                            <span>Tolak & Pulihkan Stok</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 2: RIWAYAT APPROVAL */}
            {approvalSubTab === 'history' && (
              <div className="space-y-3">
                {historyApprovalOrders.length === 0 ? (
                  <div className="py-16 text-center text-gray-400 bg-white rounded-3xl border border-pink-100 space-y-1">
                    <p className="font-bold text-gray-700">Belum ada riwayat approval yang sesuai filter.</p>
                    <p className="text-xs text-gray-400">Seluruh pesanan yang telah disetujui atau ditolak akan tercatat di sini.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#fff2f5] text-[#862744] font-bold border-b border-pink-100">
                          <tr>
                            <th className="px-4 py-3.5">No. Order</th>
                            <th className="px-4 py-3.5">Waktu Verifikasi</th>
                            <th className="px-4 py-3.5">Pelanggan</th>
                            <th className="px-4 py-3.5">Metode & Nominal</th>
                            <th className="px-4 py-3.5">Hasil Approval</th>
                            <th className="px-4 py-3.5">Status Pesanan</th>
                            <th className="px-4 py-3.5 text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-pink-50">
                          {historyApprovalOrders.map((ord) => {
                            const isApproved = ord.paymentStatus === 'Lunas' || ord.orderStatus === 'Disetujui';
                            return (
                              <tr key={ord.id} className="hover:bg-pink-50/40 transition-colors">
                                <td className="px-4 py-3.5 whitespace-nowrap">
                                  <span className="font-mono font-bold text-xs text-[#be185d] block">
                                    {ord.orderNumber}
                                  </span>
                                  <span className="text-[10px] text-gray-400">
                                    {ord.channel === 'pos' ? 'POS Kasir' : 'Webstore Online'}
                                  </span>
                                </td>

                                <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap font-mono text-[11px]">
                                  {formatDateSafe(ord.updatedAt || ord.createdAt)}
                                </td>

                                <td className="px-4 py-3.5 whitespace-nowrap">
                                  <p className="font-bold text-gray-900">{ord.customerName || 'Pelanggan'}</p>
                                  <p className="text-[11px] text-gray-500 font-mono">{ord.customerPhone || '-'}</p>
                                </td>

                                <td className="px-4 py-3.5 whitespace-nowrap">
                                  <p className="font-heading font-extrabold text-[#be185d]">
                                    {formatRupiah(ord.totalAmount)}
                                  </p>
                                  <span className="text-[10px] text-gray-500">{ord.paymentMethod}</span>
                                </td>

                                <td className="px-4 py-3.5 whitespace-nowrap">
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit ${
                                      isApproved
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                        : 'bg-red-100 text-red-800 border border-red-300'
                                    }`}
                                  >
                                    {isApproved ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                                        <span>Disetujui (Lunas)</span>
                                      </>
                                    ) : (
                                      <>
                                        <X className="w-3 h-3 text-red-600 stroke-[3]" />
                                        <span>Ditolak</span>
                                      </>
                                    )}
                                  </span>
                                  {(ord.rejectionReason || (typeof ord.specialNotes === 'string' && ord.specialNotes.includes('Ditolak:'))) && (
                                    <p className="text-[10px] text-red-600 mt-1 max-w-[180px] truncate" title={ord.rejectionReason || ord.specialNotes}>
                                      {ord.rejectionReason || (ord.specialNotes && ord.specialNotes.split('Ditolak:')[1]?.trim()) || 'Ditolak Admin'}
                                    </p>
                                  )}
                                </td>

                                <td className="px-4 py-3.5 whitespace-nowrap font-semibold text-gray-800">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      ord.orderStatus === 'Selesai'
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : ord.orderStatus === 'Dikirim'
                                        ? 'bg-purple-50 text-purple-700'
                                        : ord.orderStatus === 'Ditolak'
                                        ? 'bg-red-50 text-red-700'
                                        : 'bg-blue-50 text-blue-700'
                                    }`}
                                  >
                                    {ord.orderStatus}
                                  </span>
                                </td>

                                <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedOrderDetail(ord);
                                      setModalTrackingInput(ord.trackingNumber || '');
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-[#be185d] text-[#be185d] hover:text-white font-bold text-[11px] transition-colors inline-flex items-center gap-1 cursor-pointer border border-pink-200"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Detail</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= 6. LAPORAN SALES ================= */}
        {activeTab === 'sales' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-gray-900">
                Laporan Sales & Profitabilitas
              </h2>
              <p className="text-xs text-gray-500">
                Analisis omzet riil dan kalkulasi keuntungan kotor berdasarkan data HPP modal sepatu.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-pink-100 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-gray-400">Total Omzet Penjualan</span>
                <p className="text-2xl font-mono font-extrabold text-[#be185d]">
                  {formatRupiah(salesMetrics.totalRevenue)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Dari {salesMetrics.paidOrdersCount} pesanan lunas
                </p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-emerald-600">Total Laba Kotor (Gross Profit)</span>
                <p className="text-2xl font-mono font-extrabold text-emerald-700">
                  +{formatRupiah(salesMetrics.totalGrossProfit)}
                </p>
                <p className="text-xs text-emerald-600 mt-1">
                  Margin: {salesMetrics.totalRevenue > 0 ? ((salesMetrics.totalGrossProfit / salesMetrics.totalRevenue) * 100).toFixed(1) : 0}%
                </p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-purple-100 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-purple-600">Total Sepatu Terjual</span>
                <p className="text-2xl font-mono font-extrabold text-purple-700">
                  {salesMetrics.totalUnitsSold} Pasang
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Rata-rata transaksi: {formatRupiah(salesMetrics.aov)}
                </p>
              </div>
            </div>

            {/* Category Revenue Breakdown */}
            <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-2xs space-y-3">
              <h3 className="font-heading font-extrabold text-gray-900 text-sm">
                Distribusi Pendapatan per Kategori
              </h3>
              <div className="space-y-3">
                {Array.from(salesMetrics.categoryRevenueMap.entries()).map(([cat, rev]) => {
                  const pct = salesMetrics.totalRevenue > 0 ? Math.round((rev / salesMetrics.totalRevenue) * 100) : 0;
                  return (
                    <div key={cat} className="space-y-1 text-xs">
                      <div className="flex justify-between font-bold">
                        <span>{cat}</span>
                        <span>{formatRupiah(rev)} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className="bg-gradient-to-r from-pink-500 to-[#be185d] h-full rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= 7. INVENTORY & STOK (UNIFIED MODULE) ================= */}
        {activeTab === 'inventory' && (
          <InventoryStockManager
            products={products}
            mutations={mutations}
            adminEmail={adminEmail}
          />
        )}

        {/* ================= 8. PENGATURAN HARGA & PROFIT ================= */}
        {activeTab === 'pricing' && <PricingProfitManager products={products} />}
      </main>

      {/* ================= MODAL: DETAIL PESANAN & CETAK STRUK ================= */}
      {selectedOrderDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-pink-100 p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrderDetail(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-pink-50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="font-mono font-bold text-sm text-[#be185d]">
                  {selectedOrderDetail.orderNumber}
                </span>
                <p className="text-xs text-gray-500">
                  {new Date(selectedOrderDetail.createdAt).toLocaleString('id-ID')}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-pink-100 text-[#be185d]">
                {selectedOrderDetail.channel === 'pos' ? 'POS KASIR' : 'WEBSTORE'}
              </span>
            </div>

            {/* Customer Details */}
            <div className="bg-pink-50/50 p-3.5 rounded-2xl text-xs space-y-1">
              <p className="font-bold text-gray-900">{selectedOrderDetail.customerName}</p>
              <p className="text-gray-600 font-mono">{selectedOrderDetail.customerPhone}</p>
              <p className="text-gray-600">{selectedOrderDetail.customerAddress}</p>
              <p className="text-gray-500">
                {selectedOrderDetail.district}, {selectedOrderDetail.city} ({selectedOrderDetail.postalCode})
              </p>
            </div>

            {/* Items */}
            <div className="space-y-2 border-b border-gray-100 pb-3 text-xs">
              <span className="font-bold text-gray-700 block">Daftar Sepatu:</span>
              {selectedOrderDetail.items.map((it, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded-xl">
                  <div>
                    <span className="font-bold text-gray-900">{it.name}</span>
                    <span className="text-[10px] text-gray-500 block">
                      Ukuran EU {it.size} • {it.color}
                    </span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold">{formatRupiah(it.price * it.quantity)}</span>
                    <span className="text-[10px] text-gray-400 block">{it.quantity} pasang</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="text-xs space-y-1 border-b border-gray-100 pb-3 font-mono">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatRupiah(selectedOrderDetail.subtotal)}</span>
              </div>
              {selectedOrderDetail.discountAmount ? (
                <div className="flex justify-between text-emerald-600">
                  <span>Diskon:</span>
                  <span>-{formatRupiah(selectedOrderDetail.discountAmount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span>Ongkir:</span>
                <span>{formatRupiah(selectedOrderDetail.shippingCost)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#be185d] pt-1 border-t border-gray-100">
                <span>TOTAL:</span>
                <span>{formatRupiah(selectedOrderDetail.totalAmount)}</span>
              </div>
            </div>

            {/* Bukti Pembayaran / Struk Transfer Pelanggan */}
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800 text-[11px] flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-[#be185d]" />
                  <span>Bukti Pembayaran / Slip Transfer:</span>
                </span>
                {selectedOrderDetail.paymentProofUrl ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ✓ Foto Asli Diunggah
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Belum Ada Foto
                  </span>
                )}
              </div>

              {selectedOrderDetail.paymentProofUrl ? (
                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-emerald-200 gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      onClick={() => {
                        setZoomedProofImage({
                          url: selectedOrderDetail.paymentProofUrl,
                          orderNumber: selectedOrderDetail.orderNumber,
                          customerName: selectedOrderDetail.customerName,
                          amount: selectedOrderDetail.totalAmount,
                          method: selectedOrderDetail.paymentMethod,
                        });
                      }}
                      className="w-12 h-12 rounded-xl overflow-hidden border border-emerald-300 bg-gray-100 shrink-0 cursor-pointer shadow-2xs hover:opacity-90 transition-opacity"
                      title="Klik untuk zoom"
                    >
                      <img
                        src={selectedOrderDetail.paymentProofUrl}
                        alt="Bukti Transfer Asli"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{selectedOrderDetail.paymentMethod}</p>
                      <p className="text-[10px] text-emerald-700">Foto bukti transfer asli milik pesanan ini</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setZoomedProofImage({
                        url: selectedOrderDetail.paymentProofUrl,
                        orderNumber: selectedOrderDetail.orderNumber,
                        customerName: selectedOrderDetail.customerName,
                        amount: selectedOrderDetail.totalAmount,
                        method: selectedOrderDetail.paymentMethod,
                      });
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-pink-50 hover:bg-pink-100 text-[#be185d] font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors shrink-0 border border-pink-200"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Lihat Bukti Foto Asli</span>
                  </button>
                </div>
              ) : (
                <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <p className="font-bold">Bukti pembayaran belum tersedia</p>
                    <p className="text-[10px] text-amber-700">Pelanggan belum mengunggah foto struk transfer.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Tracking Resi Input & Courier */}
            <div className="bg-gray-50 p-3.5 rounded-2xl text-xs space-y-2">
              <span className="font-bold text-gray-800 block">Kurir & Nomor Resi Pengiriman:</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Contoh: JNT-88291024 / Resi Kurir..."
                  value={modalTrackingInput}
                  onChange={(e) => setModalTrackingInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-white font-mono text-xs focus:outline-hidden"
                />
                <button
                  type="button"
                  disabled={isUpdatingTracking}
                  onClick={handleSaveModalTracking}
                  className="px-3 py-2 rounded-xl bg-pink-100 hover:bg-[#be185d] text-[#be185d] hover:text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingTracking ? 'Menyimpan...' : 'Update Resi'}
                </button>
              </div>
            </div>

            {/* Ubah Status Pesanan Webstore */}
            <div className="bg-pink-50/70 p-4 rounded-2xl text-xs space-y-2 border border-pink-100">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800">Ubah Status Pesanan:</span>
                <span className="font-bold text-[11px] px-2.5 py-0.5 rounded-full bg-pink-100 text-[#be185d]">
                  Status saat ini: {selectedOrderDetail.orderStatus}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1">
                {(['Pending', 'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan'] as OrderStatus[]).map((status) => {
                  const isActive = selectedOrderDetail.orderStatus === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={async () => {
                        try {
                          if (status === 'Dibatalkan') {
                            if (confirm(`Batalkan pesanan #${selectedOrderDetail.orderNumber}? Stok ukuran sepatu akan otomatis dipulihkan ke database.`)) {
                              await cancelCustomerOrder(selectedOrderDetail, 'Dibatalkan oleh Admin');
                              setSelectedOrderDetail({
                                ...selectedOrderDetail,
                                orderStatus: 'Dibatalkan',
                                stockRestored: true,
                              });
                              showApprovalToast(`Pesanan #${selectedOrderDetail.orderNumber} dibatalkan & stok telah dipulihkan.`, 'success');
                            }
                          } else {
                            await updateOrderStatus(selectedOrderDetail.id, status);
                            setSelectedOrderDetail({
                              ...selectedOrderDetail,
                              orderStatus: status,
                            });
                            showApprovalToast(`Status pesanan diperbarui menjadi ${status}`, 'success');
                          }
                        } catch (err: any) {
                          console.error(err);
                          showApprovalToast(`Gagal memperbarui status: ${err?.message || 'Error'}`, 'error');
                        }
                      }}
                      className={`py-2 px-2 rounded-xl font-bold text-xs transition-all cursor-pointer text-center ${
                        isActive
                          ? 'bg-[#be185d] text-white shadow-2xs ring-2 ring-pink-300 scale-102'
                          : 'bg-white hover:bg-pink-100 text-gray-700 border border-pink-200'
                      }`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Close Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrderDetail(null)}
                className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition-colors cursor-pointer"
              >
                Tutup Detail Pesanan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT PRODUCT DETAILS ================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-pink-100 p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingProduct(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-pink-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-heading font-bold text-lg text-gray-900">
              Edit Produk: {editingProduct.name}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nama Sepatu:</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-pink-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Harga Jual (Rp):</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, price: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-pink-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Stok Fisik:</label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-pink-200 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">URL Foto Asli:</label>
                <input
                  type="text"
                  value={editingProduct.imageUrl}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, imageUrl: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-pink-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Deskripsi:</label>
                <textarea
                  rows={2}
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-pink-200"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-bold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await updateProductDetails(editingProduct.id, {
                      name: editingProduct.name,
                      price: editingProduct.price,
                      stock: editingProduct.stock,
                      imageUrl: editingProduct.imageUrl,
                      description: editingProduct.description,
                    });
                    setEditingProduct(null);
                    alert('Perubahan produk berhasil disimpan!');
                  }}
                  className="px-5 py-2 rounded-xl bg-[#be185d] text-white font-bold cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT RINCIAN STOK UKURAN 36–41 (TOTAL FISIK OTOMATIS) ================= */}
      {editingSizeStockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-pink-100 p-6 sm:p-7 space-y-5">
            <button
              onClick={() => setEditingSizeStockProduct(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-pink-50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 border-b border-pink-100 pb-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-pink-50 border border-pink-200 shrink-0">
                <FlatshoeImage
                  src={editingSizeStockProduct.imageUrl}
                  alt={editingSizeStockProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md">
                  Pengelolaan Stok Ukuran
                </span>
                <h3 className="font-heading font-extrabold text-base text-gray-900 mt-0.5">
                  {editingSizeStockProduct.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {editingSizeStockProduct.category} • {editingSizeStockProduct.color}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Live Physical Total Box */}
              <div className="flex items-center justify-between bg-gradient-to-r from-pink-50 to-pink-100/60 p-4 rounded-2xl border border-pink-200">
                <div>
                  <span className="text-xs font-bold text-gray-800 block">
                    Total Fisik Otomatis (Penjumlahan Ukuran):
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Otomatis sinkron ke katalog & sistem kasir real-time
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-extrabold text-2xl text-[#be185d]">
                    {calculateTotalFromSizeStock(tempSizeStock)}
                  </span>
                  <span className="text-xs font-bold text-gray-600 ml-1">pasang</span>
                </div>
              </div>

              {/* Grid 6 Sizes (36, 37, 38, 39, 40, 41) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {DEFAULT_SIZES.map((size) => {
                  const val = tempSizeStock[size] !== undefined ? tempSizeStock[size] : 0;
                  return (
                    <div
                      key={size}
                      className="bg-gray-50/80 p-3 rounded-2xl border border-gray-200/90 space-y-1.5 focus-within:border-pink-300 focus-within:bg-pink-50/20 transition-all"
                    >
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-gray-800">Ukuran EU {size}</span>
                        <span className="text-[10px] text-gray-400">pasang</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setTempSizeStock((prev) => ({
                              ...prev,
                              [size]: Math.max(0, (prev[size] || 0) - 1),
                            }));
                          }}
                          className="w-8 h-8 rounded-xl bg-white hover:bg-pink-100 text-gray-700 font-bold border border-gray-200 flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={val}
                          onChange={(e) => {
                            const n = Math.max(0, parseInt(e.target.value) || 0);
                            setTempSizeStock((prev) => ({
                              ...prev,
                              [size]: n,
                            }));
                          }}
                          className="w-full text-center font-mono font-extrabold text-sm py-1.5 rounded-xl bg-white border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-pink-300 shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setTempSizeStock((prev) => ({
                              ...prev,
                              [size]: (prev[size] || 0) + 1,
                            }));
                          }}
                          className="w-8 h-8 rounded-xl bg-white hover:bg-pink-100 text-gray-700 font-bold border border-gray-200 flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isSavingSizeStock}
                onClick={() => setEditingSizeStockProduct(null)}
                className="py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSavingSizeStock}
                onClick={async () => {
                  if (!editingSizeStockProduct) return;
                  setIsSavingSizeStock(true);
                  try {
                    const newTotal = await updateProductSizeStock(
                      editingSizeStockProduct.id,
                      tempSizeStock,
                      `Admin (${adminEmail})`
                    );
                    showApprovalToast(
                      `Stok "${editingSizeStockProduct.name}" berhasil diperbarui! Total fisik kini ${newTotal} pasang.`,
                      'success'
                    );
                    setEditingSizeStockProduct(null);
                  } catch (err: any) {
                    console.error('Save sizeStock error:', err);
                    showApprovalToast(`Gagal menyimpan stok: ${err?.message || 'Error'}`, 'error');
                  } finally {
                    setIsSavingSizeStock(false);
                  }
                }}
                className="py-2.5 rounded-xl bg-gradient-to-r from-[#d65b7d] to-[#be185d] hover:brightness-105 text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isSavingSizeStock ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan ke Database...</span>
                  </>
                ) : (
                  <span>Simpan Perubahan Stok</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD PRODUCT ================= */}
      {isNewProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-pink-100 p-6 sm:p-8 space-y-4">
            <button
              onClick={() => setIsNewProductModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-pink-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-heading font-bold text-lg text-gray-900">
              Tambah Sepatu Flatshoes Baru
            </h3>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nama Sepatu:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Daisy Pastel Ballerina"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-pink-200 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Kategori:</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-pink-200 bg-white"
                  >
                    <option value="Flat Shoes Klasik">Flat Shoes Klasik</option>
                    <option value="Pointed Elegant">Pointed Elegant</option>
                    <option value="Loafers & Slip-on">Loafers & Slip-on</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Warna:</label>
                  <input
                    type="text"
                    value={newProdColor}
                    onChange={(e) => setNewProdColor(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-pink-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">HPP Modal (Rp):</label>
                  <input
                    type="number"
                    value={newProdCostPrice}
                    onChange={(e) => setNewProdCostPrice(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl border border-pink-200 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Harga Jual (Rp):</label>
                  <input
                    type="number"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl border border-pink-200 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Stok Awal:</label>
                <input
                  type="number"
                  value={newProdStock}
                  onChange={(e) => setNewProdStock(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 rounded-xl border border-pink-200 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">URL Foto Flatshoes:</label>
                <input
                  type="text"
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-pink-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Deskripsi:</label>
                <textarea
                  rows={2}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-pink-200"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#d65b7d] to-[#be185d] text-white font-bold shadow-xs hover:brightness-105"
                >
                  Tambah ke Katalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: TOLAK PEMBAYARAN ================= */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-pink-100 p-6 space-y-4">
            <button
              onClick={() => setRejectingOrder(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-pink-50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-heading font-bold text-base text-gray-900">
                Tolak Bukti Pembayaran
              </h3>
            </div>

            <p className="text-xs text-gray-500">
              Tolak pembayaran untuk pesanan <strong className="font-mono text-gray-800">#{rejectingOrder.orderNumber}</strong> ({rejectingOrder.customerName}). Stok barang yang sebelumnya dipesan akan <span className="font-bold text-emerald-600">otomatis dikembalikan ke stok produk</span> secara real-time.
            </p>

            <div className="space-y-2 text-xs">
              <label className="block font-bold text-gray-700">Pilih Alasan Penolakan:</label>
              {[
                'Nominal transfer tidak sesuai pesanan',
                'Bukti transfer buram / tidak terbaca',
                'Nama pengirim rekening berbeda tanpa konfirmasi',
                'Mutasi rekening bank belum masuk',
                'Lainnya (alasan custom)',
              ].map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                    rejectReasonType === reason
                      ? 'border-[#be185d] bg-pink-50/70 font-bold text-[#be185d]'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="rejectReason"
                    checked={rejectReasonType === reason}
                    onChange={() => setRejectReasonType(reason)}
                    className="accent-[#be185d]"
                  />
                  <span>{reason}</span>
                </label>
              ))}

              {rejectReasonType.startsWith('Lainnya') && (
                <div className="pt-1">
                  <input
                    type="text"
                    placeholder="Tuliskan alasan penolakan..."
                    value={customRejectReason}
                    onChange={(e) => setCustomRejectReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-pink-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-pink-300"
                  />
                </div>
              )}
            </div>

            <div className="pt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isSubmittingReject}
                onClick={() => setRejectingOrder(null)}
                className="py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmittingReject}
                onClick={async () => {
                  if (!rejectingOrder) return;
                  const finalReason = rejectReasonType.startsWith('Lainnya')
                    ? customRejectReason.trim() || 'Bukti transfer tidak valid'
                    : rejectReasonType;
                  setIsSubmittingReject(true);
                  try {
                    await rejectPayment(rejectingOrder, finalReason);
                    showApprovalToast(
                      `Pesanan #${rejectingOrder.orderNumber} berhasil ditolak. Stok telah otomatis dipulihkan ke database secara real-time!`,
                      'success'
                    );
                    setRejectingOrder(null);
                  } catch (err: any) {
                    console.error('Reject error:', err);
                    showApprovalToast(`Gagal menolak pesanan: ${err?.message || 'Error'}`, 'error');
                  } finally {
                    setIsSubmittingReject(false);
                  }
                }}
                className="py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isSubmittingReject ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Memproses & Pulihkan Stok...</span>
                  </>
                ) : (
                  <span>Konfirmasi Tolak & Pulihkan Stok</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ZOOM BUKTI PEMBAYARAN ================= */}
      {zoomedProofImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-pink-100 p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setZoomedProofImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-pink-50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#be185d]" />
              <h3 className="font-heading font-bold text-base text-gray-900">
                Detail Bukti Transfer & Pembayaran
              </h3>
            </div>

            <div className="p-3 bg-pink-50/70 rounded-2xl text-xs space-y-1 border border-pink-100">
              <div className="flex justify-between">
                <span className="text-gray-500">Nomor Pesanan:</span>
                <span className="font-mono font-bold text-[#be185d]">#{zoomedProofImage.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pelanggan:</span>
                <span className="font-bold text-gray-900">{zoomedProofImage.customerName}</span>
              </div>
              {zoomedProofImage.amount ? (
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Tagihan:</span>
                  <span className="font-mono font-bold text-gray-900">{formatRupiah(zoomedProofImage.amount)}</span>
                </div>
              ) : null}
              {zoomedProofImage.method ? (
                <div className="flex justify-between">
                  <span className="text-gray-500">Metode:</span>
                  <span className="font-semibold text-gray-800">{zoomedProofImage.method}</span>
                </div>
              ) : null}
            </div>

            {/* TAMPILAN BUKTI TRANSFER ASLI ATAU STATUS BELUM TERSEDIA */}
            {zoomedProofImage.url ? (
              <div className="border border-pink-200 rounded-2xl overflow-hidden bg-gray-950/5 p-2 flex flex-col items-center justify-center min-h-[260px] text-center">
                <img
                  src={zoomedProofImage.url}
                  alt={`Bukti Pembayaran Pesanan #${zoomedProofImage.orderNumber}`}
                  className="max-h-[60vh] w-auto max-w-full rounded-xl object-contain shadow-md"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const errMsg = document.createElement('div');
                      errMsg.className = 'p-6 text-center text-xs text-red-600 font-bold';
                      errMsg.innerText = 'Foto bukti pembayaran gagal dimuat atau format file tidak didukung.';
                      parent.appendChild(errMsg);
                    }
                  }}
                />
                <p className="text-[10px] text-gray-400 mt-2">
                  File bukti transfer asli yang diunggah oleh pelanggan untuk pesanan #{zoomedProofImage.orderNumber}
                </p>
              </div>
            ) : (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                <p className="font-bold text-gray-800 text-sm">Bukti pembayaran belum tersedia</p>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Pelanggan belum mengunggah foto struk transfer untuk pesanan #{zoomedProofImage.orderNumber}. Anda dapat menghubungi pelanggan via WhatsApp untuk meminta bukti transfer jika diperlukan.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setZoomedProofImage(null)}
              className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition-colors cursor-pointer"
            >
              Tutup Bukti
            </button>
          </div>
        </div>
      )}

      {/* ================= FLOATING TOAST NOTIFICATION ================= */}
      {approvalToast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border text-xs font-bold animate-slide-up max-w-md ${
            approvalToast.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-500 shadow-emerald-900/30'
              : 'bg-red-900 text-white border-red-500 shadow-red-900/30'
          }`}
        >
          {approvalToast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span className="leading-snug">{approvalToast.message}</span>
        </div>
      )}
    </div>
  );
};
