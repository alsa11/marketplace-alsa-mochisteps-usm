export interface Product {
  id: string;
  name: string;
  category: 'Flat Shoes Klasik' | 'Pointed Elegant' | 'Loafers & Slip-on';
  price: number;
  stock: number;
  sizes: number[];
  description: string;
  imageUrl: string;
  color: string;
  badge?: string;
  rating: number;
  reviewCount: number;
  material: string;
  heelHeight: string;
  costPrice?: number; // Harga Beli / HPP Modal Produksi Sepatu (Rp)
  minStock?: number; // Batas Minimum Peringatan Stok Menipis (Default: 5)
  sizeStock?: Record<number, number>; // Rincian stok per ukuran 36-41
  sku?: string; // Kode SKU Produk Sepatu
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  selectedSize: number;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  size: number;
  quantity: number;
  imageUrl: string;
  color: string;
}

export type PaymentMethod = 
  | 'QRIS'
  | 'BCA Virtual Account'
  | 'Mandiri Virtual Account'
  | 'BRI Virtual Account (BRIVA)'
  | 'BNI Virtual Account'
  | 'Permata Virtual Account'
  | 'CIMB Niaga Virtual Account'
  | 'BSI Virtual Account'
  | 'Bank Transfer BCA'
  | 'Bank Transfer Mandiri'
  | 'Bank Transfer BRI'
  | 'Bank Transfer BNI'
  | 'Tunai (Cash)'
  | 'Debit / EDC BCA'
  | 'Debit / EDC Mandiri'
  | 'COD'
  | string;

export type PaymentStatus = 
  | 'Menunggu Pembayaran'
  | 'Lunas'
  | 'Ditolak';

export type OrderStatus = 
  | 'Menunggu Pembayaran'
  | 'Dibayar'
  | 'Diproses'
  | 'Dikemas'
  | 'Dikirim'
  | 'Selesai'
  | 'Dibatalkan'
  | 'Menunggu Verifikasi'
  | 'Disetujui'
  | 'Ditolak';

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  notes?: string;
  actor?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  district: string;
  subdistrict?: string;
  city: string;
  province?: string;
  postalCode: string;
  landmark?: string;
  specialNotes?: string;
  courier: string;
  trackingNumber?: string; // Nomor Resi Pengiriman (J&T, SiCepat, dll)
  shippingDate?: string;
  paymentProofUrl?: string;
  stockRestored?: boolean; // Idempotency flag: prevents multiple stock restorations
  rejectionReason?: string; // Alasan penolakan pembayaran
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  statusHistory?: OrderStatusHistoryItem[];
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discountAmount?: number;
  voucherCode?: string;
  totalAmount: number;
  channel?: 'webstore' | 'pos';
  cashierName?: string;
  cashReceived?: number;
  cashChange?: number;
  receiptNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PosCartItem {
  product: Product;
  selectedSize: number;
  quantity: number;
  customPrice?: number;
}

export interface ProfitMetrics {
  sellingPrice: number;
  costPrice: number;
  profitNominal: number;
  profitMarginPct: number;
  markupPct: number;
}

export type StockMutationType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'OPNAME';

export interface StockMutation {
  id: string;
  productId: string;
  productName: string;
  size?: number; // Ukuran sepatu yang mengalami perubahan stok (36-41)
  orderNumber?: string; // Nomor referensi pesanan
  type: StockMutationType;
  quantity: number;
  notes: string;
  previousStock: number;
  newStock: number;
  timestamp: string;
  actor: string;
  source?: 'POS' | 'WEBSTORE' | 'ADMIN_OPNAME' | 'ADMIN_RESTOCK' | 'MANUAL';
  referenceId?: string;
}

export interface StockOpnameItem {
  productId: string;
  productName: string;
  systemStock: number;
  physicalStock: number;
  difference: number;
  notes?: string;
}

export interface CustomerSummary {
  phone: string;
  name: string;
  address: string;
  district: string;
  city: string;
  postalCode: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  orders: Order[];
}

export interface BankAccountInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  instructions?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  description: string;
  logoUrl?: string;
  announcementBanner: string;
  isAnnouncementActive: boolean;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  city: string;
  operationalHours: string;
  defaultShippingCost: number;
  freeShippingThreshold: number;
  bankAccounts: BankAccountInfo[];
  qrisImageUrl?: string;
  termsAndConditions: string;
  privacyPolicy: string;
  returnPolicy: string;
  sizeGuideNote: string;
  updatedAt?: string;
}

export interface Voucher {
  id: string;
  code: string;
  discountType: 'percentage' | 'nominal';
  discountValue: number;
  minSpend: number;
  maxDiscount?: number;
  validUntil: string;
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
  description?: string;
  createdAt?: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  productName: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  rating: number; // 1-5
  comment: string;
  photoUrl?: string;
  size?: number;
  isApproved: boolean;
  createdAt: string;
}

export interface OrderReturn {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  reason: string;
  photoUrl?: string;
  returnType: 'Tukar Ukuran' | 'Pengembalian Dana (Refund)';
  requestedSize?: number;
  status: 'Menunggu Pemeriksaan' | 'Disetujui (Kirim Barang)' | 'Barang Diterima & Selesai' | 'Ditolak';
  rejectionReason?: string;
  stockRestored?: boolean;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}
