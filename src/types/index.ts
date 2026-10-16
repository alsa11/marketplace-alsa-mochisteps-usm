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
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  channel?: 'webstore' | 'pos';
  cashierName?: string;
  cashReceived?: number;
  cashChange?: number;
  discountAmount?: number;
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
