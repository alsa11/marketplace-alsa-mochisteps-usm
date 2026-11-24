import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  runTransaction,
  writeBatch,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  Product,
  Order,
  StockMutation,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  StoreSettings,
  Voucher,
  ProductReview,
  OrderReturn,
  OrderStatusHistoryItem,
  ShipmentCheckpoint,
  ShipmentCheckpointStatus,
  LookbookItem,
} from '../types';
import lookbookOfficeImg from '../assets/images/lookbook_office_classic_1795515787484.jpg';
import lookbookCasualImg from '../assets/images/lookbook_casual_hangout_1795515788109.jpg';
import lookbookCampusImg from '../assets/images/lookbook_campus_maryjane_1795515788484.jpg';
import lookbookEveningImg from '../assets/images/lookbook_evening_pointed_1795515788253.jpg';
import reviewBallerinaImg from '../assets/images/review_buyer_ballerina_1795516496857.jpg';
import reviewPointedImg from '../assets/images/review_buyer_pointed_1795516498006.jpg';
import reviewLoafersImg from '../assets/images/review_buyer_loafers_1795516499158.jpg';
import reviewSliponImg from '../assets/images/review_buyer_pastel_slipon_1795516499062.jpg';

export const INITIAL_PRODUCTS: Omit<Product, 'id'>[] = [
  {
    name: 'Mochi Peach Puff Ribbon',
    category: 'Flat Shoes Klasik',
    price: 189000,
    stock: 24,
    sizes: [36, 37, 38, 39, 40, 41],
    description: 'Flatshoes klasik bernuansa peach manis dengan pita ganda empuk dan bantalan CloudMochi 8mm selembut marshmallow. Ringan dan menggemaskan untuk hangout.',
    imageUrl: '/shoes/mochi-flat-01.jpg',
    color: 'Pastel Peach Puff',
    badge: 'Best Seller',
    rating: 4.9,
    reviewCount: 142,
    material: 'Microfiber Velvet Leather + Mochi Cushion 8mm',
    heelHeight: '1 cm Flat',
  },
  {
    name: 'Daisy Cloud Butter Flats',
    category: 'Flat Shoes Klasik',
    price: 199000,
    stock: 20,
    sizes: [36, 37, 38, 39, 40, 41],
    description: 'Flatshoes warna butter cream lembut dengan hiasan bunga daisy manis di ujung sepatu. Dilapisi busa tumit anti-lecet yang ekstra empuk.',
    imageUrl: '/shoes/mochi-flat-02.jpg',
    color: 'Vanilla Butter & Daisy',
    badge: 'Best Seller',
    rating: 4.8,
    reviewCount: 98,
    material: 'Ultra-soft Matte Vegan Leather',
    heelHeight: '1 cm Flat',
  },
  {
    name: 'Strawberry Pearl Mary Jane',
    category: 'Flat Shoes Klasik',
    price: 209000,
    stock: 18,
    sizes: [36, 37, 38, 39, 40, 41],
    description: 'Model Mary Jane manis warna susu stroberi dengan strap mutiara berkilau dan insole empuk berkontur. Bikin langkah kaki tampak imut dan feminin.',
    imageUrl: '/shoes/mochi-flat-03.jpg',
    color: 'Strawberry Milk Pink',
    badge: 'Favorit Harian',
    rating: 4.9,
    reviewCount: 112,
    material: 'Quilted Lambskin Faux Leather',
    heelHeight: '1.2 cm Flat',
  },
  {
    name: 'Caramel Bear Cloud Ballerina',
    category: 'Flat Shoes Klasik',
    price: 219000,
    stock: 15,
    sizes: [36, 37, 38, 39, 40, 41],
    description: 'Nuansa caramel nude hangat dengan detail aksen siluet teddy bear imut. Cushion ganda busa mochi meredam capek berdiri seharian.',
    imageUrl: '/shoes/mochi-flat-04.jpg',
    color: 'Caramel Teddy Nude',
    badge: 'Signature Mochi',
    rating: 5.0,
    reviewCount: 86,
    material: 'Premium Vegan Nubuck + Dual Insole Cushion',
    heelHeight: '1 cm Flat',
  },
  {
    name: 'Sakura Blossom Pointed',
    category: 'Pointed Elegant',
    price: 229000,
    stock: 22,
    sizes: [36, 37, 38, 39, 40, 41],
    description: 'Ujung pointed meruncing anggun berhias bros kelopak sakura kristal. Potongan ergonomis membuat jari kaki tetap leluasa tanpa terjepit.',
    imageUrl: '/shoes/mochi-flat-05.jpg',
    color: 'Sakura Petal Pink',
    badge: 'New Arrival',
    rating: 4.9,
    reviewCount: 64,
    material: 'Soft Supple PU Leather',
    heelHeight: '1.5 cm Low Flat',
  },
  {
    name: 'Lilac Fairy Star Pointed',
    category: 'Pointed Elegant',
    price: 239000,
    stock: 16,
    sizes: [36, 37, 38, 39, 40, 41],
    description: 'Warna pastel lilac berkilau lembut dengan buckle bintang kristal bak negeri dongeng. Bahan vegan microfiber halus dan tahan cipratan air.',
    imageUrl: '/shoes/mochi-flat-06.jpg',
    color: 'Dreamy Lilac Mist',
    badge: 'Limited Edition',
    rating: 4.8,
    reviewCount: 52,
    material: 'Smooth Microfiber Soft Finish',
    heelHeight: '1.5 cm Low Flat',
  },
  {
    name: 'Boba Pearl Milk Tea Pointed',
    category: 'Pointed Elegant',
    price: 249000,
    stock: 14,
    sizes: [36, 37, 38, 39, 40, 41],
    description: 'Warna krem teh susu kekinian dengan deretan mutiara manis berjejer di vamp. Cocok untuk ngantor formal maupun hangout santai.',
    imageUrl: '/shoes/mochi-flat-07.jpg',
    color: 'Milk Tea Cream',
    badge: 'Elegan & Gemas',
    rating: 5.0,
    reviewCount: 78,
    material: 'Silk Sheen Satin Leather + Latex Pad',
    heelHeight: '1.5 cm Low Flat',
  },
  {
    name: 'Matcha Sweet Pistachio Pointed',
    category: 'Pointed Elegant',
    price: 219000,
    stock: 19,
    sizes: [36, 37, 38, 39, 40, 41],
    description: 'Nuansa hijau matcha pastel segar dengan aksen buckle daun emas mini. Outsole karet fleksibel bisa ditekuk 180 derajat tanpa retak.',
    imageUrl: '/shoes/mochi-flat-08.jpg',
    color: 'Pastel Matcha Mint',
    badge: 'Warna Pastel Unik',
    rating: 4.7,
    reviewCount: 91,
    material: 'Flexible Vegan Calfskin',
    heelHeight: '1 cm Flat',
  },
  {
    name: 'Choco Marshmallow Penny Loafers',
    category: 'Loafers & Slip-on',
    price: 249000,
    stock: 25,
    sizes: [36, 37, 38, 39, 40, 41],
    description: 'Loafer kulit cokelat susu klasik dengan bantalan CloudMochi selembut marshmallow. Desain penny loafer timeless yang super empuk dan nyaman seharian.',
    imageUrl: '/shoes/mochi-flat-09.jpg',
    color: 'Milk Chocolate & Marshmallow Cushion',
    badge: 'Paling Empuk',
    rating: 4.9,
    reviewCount: 134,
    material: 'Buttery Soft Nappa PU + Cloud Cushion',
    heelHeight: '1.5 cm Flat',
  },
  {
    name: 'Vanilla Cream Bow Loafers',
    category: 'Loafers & Slip-on',
    price: 259000,
    stock: 17,
    sizes: [36, 37, 38, 39, 40, 41],
    description: 'Slip-on flat loafer warna krim vanilla manis dengan aksen simpul pita kulit manis di bagian depan. Bantalan tumit anti-lecet bertekstur empuk.',
    imageUrl: '/shoes/mochi-flat-10.jpg',
    color: 'Warm Vanilla Cream & Dainty Bow',
    badge: 'Signature Loafer',
    rating: 4.9,
    reviewCount: 88,
    material: 'Handcrafted Vegan Nappa Leather',
    heelHeight: '1.2 cm Flat',
  },
  {
    name: 'Taro Velvet Cloud Slip-on',
    category: 'Loafers & Slip-on',
    price: 229000,
    stock: 21,
    sizes: [36, 37, 38, 39, 40, 41],
    description: 'Slip-on beludru taro ungu pastel lembut dengan quilting empuk bagai awan. Sol karet antislip fleksibel yang sangat ringan dipakai jalan santai.',
    imageUrl: '/shoes/mochi-flat-11.jpg',
    color: 'Pastel Taro Velvet Purple',
    badge: 'Super Nyaman',
    rating: 4.8,
    reviewCount: 71,
    material: 'Soft Quilted Velvet + Latex Cushion',
    heelHeight: '1.2 cm Flat',
  },
  {
    name: 'Cotton Candy Pastel Loafers',
    category: 'Loafers & Slip-on',
    price: 249000,
    stock: 23,
    sizes: [36, 37, 38, 39, 40, 41],
    description: 'Kombinasi warna dua nada baby pink dan baby blue manis seperti permen kapas. Insole berbusa mochi empuk ganda yang membuat kaki tidak cepat pegal.',
    imageUrl: '/shoes/mochi-flat-12.jpg',
    color: 'Cotton Candy Pink & Blue',
    badge: 'Best Seller',
    rating: 4.9,
    reviewCount: 104,
    material: 'Supple Microfiber Suede + Mochi Cushion',
    heelHeight: '1.5 cm Flat',
  },
];

// Helper to seed 12 products if empty or sync cute AI product catalog
export async function seedProductsIfEmpty(): Promise<boolean> {
  const collectionRef = collection(db, 'products');
  try {
    const snapshot = await getDocs(collectionRef);
    const now = new Date().toISOString();

    // If empty, write all 12 initial products
    if (snapshot.empty) {
      console.log('Seeding 12 cute Mochi Steps flatshoes products to Firestore...');
      for (let i = 0; i < INITIAL_PRODUCTS.length; i++) {
        const p = INITIAL_PRODUCTS[i];
        const docId = `mochi-flat-${String(i + 1).padStart(2, '0')}`;
        const productDocRef = doc(db, 'products', docId);

        await setDoc(productDocRef, {
          ...p,
          id: docId,
          createdAt: now,
          updatedAt: now,
        });

        const mutationRef = doc(collection(db, 'stock_mutations'));
        await setDoc(mutationRef, {
          id: mutationRef.id,
          productId: docId,
          productName: p.name,
          type: 'IN',
          quantity: p.stock,
          notes: 'Stok Awal Gudang Mochi Steps (Batch Perdana)',
          previousStock: 0,
          newStock: p.stock,
          timestamp: now,
          actor: 'Sistem Inisialisasi Mochi Steps',
        });
      }
      return true;
    }

    // Force sync AI images and cute names to Firestore docs
    console.log('Syncing high-quality AI flatshoes images and cute names to Firestore...');
    for (let i = 0; i < INITIAL_PRODUCTS.length; i++) {
      const p = INITIAL_PRODUCTS[i];
      const docId = `mochi-flat-${String(i + 1).padStart(2, '0')}`;
      const productDocRef = doc(db, 'products', docId);
      await setDoc(
        productDocRef,
        {
          ...p,
          id: docId,
          updatedAt: now,
        },
        { merge: true }
      );
    }

    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'products');
    return false;
  }
}

// Default size array for Mochi Steps flatshoes
export const DEFAULT_SIZES = [36, 37, 38, 39, 40, 41];

// Helper: Calculate total stock from sizeStock map
export function calculateTotalFromSizeStock(sizeStock: Record<number, number>): number {
  return DEFAULT_SIZES.reduce((sum, s) => sum + (Number(sizeStock[s]) || 0), 0);
}

// Helper: Retrieve or generate sizeStock with guaranteed sizes 36-41 matching total stock
export function getProductSizeStock(product: { stock?: number; sizeStock?: Record<number, number> }): Record<number, number> {
  const result: Record<number, number> = { 36: 0, 37: 0, 38: 0, 39: 0, 40: 0, 41: 0 };
  if (product.sizeStock && typeof product.sizeStock === 'object') {
    let hasAny = false;
    for (const s of DEFAULT_SIZES) {
      if (product.sizeStock[s] !== undefined) {
        result[s] = Math.max(0, Number(product.sizeStock[s]) || 0);
        hasAny = true;
      }
    }
    if (hasAny) {
      return result;
    }
  }

  // Fallback: distribute current stock evenly across sizes 36-41
  const total = Math.max(0, Number(product.stock) || 0);
  const base = Math.floor(total / 6);
  let rem = total % 6;
  for (const s of DEFAULT_SIZES) {
    result[s] = base + (rem > 0 ? 1 : 0);
    if (rem > 0) rem--;
  }
  return result;
}

// Real-time subscription to Products
export function subscribeToProducts(
  onData: (products: Product[]) => void,
  onError?: (err: Error) => void
) {
  const collectionRef = collection(db, 'products');
  return onSnapshot(
    collectionRef,
    (snapshot) => {
      const products: Product[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const rawStock = Number(data.stock) || 0;
        const sizeStock = getProductSizeStock(data as any);
        // Ensure total stock always equals sum of sizeStock
        const calculatedStock = calculateTotalFromSizeStock(sizeStock);
        const finalStock = calculatedStock > 0 ? calculatedStock : rawStock;

        products.push({
          id: docSnap.id,
          name: data.name || '',
          category: data.category || 'Flat Shoes Klasik',
          price: Number(data.price) || 0,
          costPrice: data.costPrice !== undefined ? Number(data.costPrice) : Math.round((Number(data.price) || 199000) * 0.5),
          stock: finalStock,
          sizes: data.sizes || DEFAULT_SIZES,
          sizeStock,
          description: data.description || '',
          imageUrl: data.imageUrl || '',
          color: data.color || 'Pink Pastel',
          badge: data.badge || undefined,
          rating: Number(data.rating) || 4.9,
          reviewCount: Number(data.reviewCount) || 50,
          material: data.material || 'Microfiber Leather',
          heelHeight: data.heelHeight || '1 cm Flat',
          minStock: data.minStock !== undefined ? Number(data.minStock) : 5,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });
      // Sort alphabetically by id
      products.sort((a, b) => a.id.localeCompare(b.id));
      onData(products);
    },
    (error) => {
      console.warn('Realtime products subscription error:', error);
      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  );
}

// Real-time subscription to Orders
export function subscribeToOrders(
  onData: (orders: Order[]) => void,
  onError?: (err: Error) => void
) {
  const ordersRef = collection(db, 'orders');
  return onSnapshot(
    ordersRef,
    (snapshot) => {
      const orders: Order[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        orders.push({
          id: docSnap.id,
          orderNumber: d.orderNumber || docSnap.id,
          customerName: d.customerName || '',
          customerPhone: d.customerPhone || '',
          customerAddress: d.customerAddress || '',
          district: d.district || '',
          city: d.city || '',
          postalCode: d.postalCode || '',
          specialNotes: d.specialNotes || '',
          courier: d.courier || 'J&T Express',
          paymentMethod: d.paymentMethod || 'QRIS',
          paymentStatus: d.paymentStatus || 'Menunggu Pembayaran',
          orderStatus: d.orderStatus || 'Menunggu Verifikasi',
          items: d.items || [],
          subtotal: Number(d.subtotal) || 0,
          shippingCost: Number(d.shippingCost) || 0,
          totalAmount: Number(d.totalAmount) || 0,
          channel: d.channel || 'webstore',
          cashierName: d.cashierName || undefined,
          cashReceived: d.cashReceived !== undefined ? Number(d.cashReceived) : undefined,
          cashChange: d.cashChange !== undefined ? Number(d.cashChange) : undefined,
          discountAmount: d.discountAmount !== undefined ? Number(d.discountAmount) : 0,
          receiptNumber: d.receiptNumber || undefined,
          trackingNumber: d.trackingNumber || undefined,
          shippingDate: d.shippingDate || undefined,
          estimatedDelivery: d.estimatedDelivery || undefined,
          shipmentCheckpoints: Array.isArray(d.shipmentCheckpoints) ? d.shipmentCheckpoints : undefined,
          statusHistory: Array.isArray(d.statusHistory) ? d.statusHistory : undefined,
          paymentProofUrl: d.paymentProofUrl || undefined,
          stockRestored: !!d.stockRestored,
          rejectionReason: d.rejectionReason || undefined,
          createdAt: d.createdAt || new Date().toISOString(),
          updatedAt: d.updatedAt || new Date().toISOString(),
        });
      });
      // Sort orders descending by createdAt
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(orders);
    },
    (error) => {
      console.warn('Realtime orders subscription error:', error);
      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  );
}

// Real-time subscription to Stock Mutations
export function subscribeToStockMutations(
  onData: (mutations: StockMutation[]) => void,
  onError?: (err: Error) => void
) {
  const mutationsRef = collection(db, 'stock_mutations');
  return onSnapshot(
    mutationsRef,
    (snapshot) => {
      const mutations: StockMutation[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        mutations.push({
          id: docSnap.id,
          productId: d.productId || '',
          productName: d.productName || '',
          size: d.size ? Number(d.size) : undefined,
          orderNumber: d.orderNumber || undefined,
          type: d.type || 'IN',
          quantity: Number(d.quantity) || 0,
          notes: d.notes || '',
          previousStock: Number(d.previousStock) || 0,
          newStock: Number(d.newStock) || 0,
          timestamp: d.timestamp || new Date().toISOString(),
          actor: d.actor || 'Admin',
        });
      });
      // Sort mutations descending by timestamp
      mutations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      onData(mutations);
    },
    (error) => {
      console.warn('Realtime stock_mutations subscription error:', error);
      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  );
}

// Create new customer order with atomic stock per size update & mutation logging
export async function createCustomerOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const now = new Date().toISOString();
  const orderDocRef = doc(collection(db, 'orders'));

  try {
    await runTransaction(db, async (transaction) => {
      // 1. Verify and read all product stocks first (ALL READS FIRST)
      const productDocs: {
        ref: any;
        id: string;
        name: string;
        currentStock: number;
        currentSizeStock: Record<number, number>;
        newSizeStock: Record<number, number>;
        newStock: number;
        items: typeof orderData.items;
      }[] = [];

      for (const item of orderData.items) {
        const pRef = doc(db, 'products', item.productId);
        const pSnap = await transaction.get(pRef);
        if (!pSnap.exists()) {
          throw new Error(`Produk "${item.name}" tidak ditemukan di database.`);
        }
        const pData = pSnap.data();
        const currentTotal = Number(pData.stock) || 0;
        const currentSizeStock = getProductSizeStock(pData as any);
        const itemSize = Number(item.size);
        const availableInSize = currentSizeStock[itemSize] !== undefined ? currentSizeStock[itemSize] : currentTotal;

        if (availableInSize < item.quantity) {
          throw new Error(
            `Maaf, stok sepatu "${item.name}" ukuran ${itemSize} tersisa ${availableInSize} pasang, tidak mencukupi untuk pesanan ${item.quantity} pasang.`
          );
        }

        const newSizeStock = { ...currentSizeStock };
        newSizeStock[itemSize] = Math.max(0, (newSizeStock[itemSize] || 0) - item.quantity);
        const newStock = calculateTotalFromSizeStock(newSizeStock);

        productDocs.push({
          ref: pRef,
          id: item.productId,
          name: item.name,
          currentStock: currentTotal,
          currentSizeStock,
          newSizeStock,
          newStock,
          items: [item],
        });
      }

      // 2. ALL WRITES AFTER READS
      // Decrement sizeStock and total stock for each product
      for (const p of productDocs) {
        transaction.update(p.ref, {
          sizeStock: p.newSizeStock,
          stock: p.newStock,
          updatedAt: now,
        });

        for (const item of p.items) {
          const mutationRef = doc(collection(db, 'stock_mutations'));
          transaction.set(mutationRef, {
            id: mutationRef.id,
            productId: p.id,
            productName: p.name,
            size: Number(item.size),
            orderNumber: orderData.orderNumber,
            type: 'OUT',
            quantity: item.quantity,
            notes: `Pesanan Baru #${orderData.orderNumber} (Ukuran ${item.size} x${item.quantity}) - ${orderData.customerName}`,
            previousStock: p.currentStock,
            newStock: p.newStock,
            timestamp: now,
            actor: 'Pelanggan (Checkout Webstore)',
          });
        }
      }

      // 3. Write Order document with stockRestored: false and initial status history
      const initialHistory: OrderStatusHistoryItem = {
        status: orderData.orderStatus,
        timestamp: now,
        notes: `Pesanan dibuat via ${orderData.channel === 'pos' ? 'Kasir POS' : 'Webstore'} (${orderData.paymentMethod})`,
        actor: orderData.channel === 'pos' ? (orderData.cashierName || 'Kasir') : 'Pelanggan',
      };

      transaction.set(orderDocRef, {
        ...orderData,
        id: orderDocRef.id,
        stockRestored: false,
        statusHistory: orderData.statusHistory?.length ? orderData.statusHistory : [initialHistory],
        createdAt: now,
        updatedAt: now,
      });

      // 4. Upsert Customer in customers collection
      const cleanPhone = orderData.customerPhone.replace(/[^0-9]/g, '') || orderDocRef.id;
      const customerDocRef = doc(db, 'customers', cleanPhone);
      transaction.set(
        customerDocRef,
        {
          name: orderData.customerName,
          phone: orderData.customerPhone,
          address: orderData.customerAddress,
          district: orderData.district,
          city: orderData.city,
          postalCode: orderData.postalCode,
          lastOrderDate: now,
          updatedAt: now,
        },
        { merge: true }
      );
    });

    return orderDocRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'orders');
    throw error;
  }
}

// Approve payment: marks as Lunas and Disetujui
// Stock stays decremented and is NEVER deducted again
export async function approvePayment(order: Order, adminEmail: string = 'Admin'): Promise<void> {
  const now = new Date().toISOString();
  const orderRef = doc(db, 'orders', order.id);

  try {
    await setDoc(
      orderRef,
      {
        paymentStatus: 'Lunas',
        orderStatus: 'Disetujui',
        updatedAt: now,
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${order.id}`);
    throw error;
  }
}

// Reject payment: marks as Ditolak and restores size-specific stock atomically (Idempotent: only 1x)
export async function rejectPayment(order: Order, reason: string = 'Bukti/Pembayaran tidak valid'): Promise<void> {
  const now = new Date().toISOString();
  const orderRef = doc(db, 'orders', order.id);

  try {
    await runTransaction(db, async (transaction) => {
      // 1. ALL READS FIRST
      const oSnap = await transaction.get(orderRef);
      const oData = oSnap.exists() ? oSnap.data() : order;

      // Idempotency: if already restored or already rejected, do not restore stock again!
      if (oData.stockRestored === true) {
        console.warn(`Order #${order.orderNumber} stock has already been restored.`);
        transaction.update(orderRef, {
          paymentStatus: 'Ditolak',
          orderStatus: 'Ditolak',
          rejectionReason: reason,
          updatedAt: now,
        });
        return;
      }

      const productDocs: {
        ref: any;
        currentStock: number;
        newSizeStock: Record<number, number>;
        restoredStock: number;
        item: any;
      }[] = [];

      const itemsList = order.items || [];
      for (const item of itemsList) {
        if (!item?.productId) continue;
        const pRef = doc(db, 'products', item.productId);
        const pSnap = await transaction.get(pRef);
        if (pSnap.exists()) {
          const pData = pSnap.data();
          const currentStock = Number(pData.stock) || 0;
          const currentSizeStock = getProductSizeStock(pData as any);
          const itemSize = Number(item.size);
          const itemQty = Number(item.quantity) || 1;

          const newSizeStock = { ...currentSizeStock };
          newSizeStock[itemSize] = (newSizeStock[itemSize] || 0) + itemQty;
          const restoredStock = calculateTotalFromSizeStock(newSizeStock);

          productDocs.push({
            ref: pRef,
            currentStock,
            newSizeStock,
            restoredStock,
            item,
          });
        }
      }

      // 2. ALL WRITES AFTER READS
      for (const p of productDocs) {
        transaction.update(p.ref, {
          sizeStock: p.newSizeStock,
          stock: p.restoredStock,
          updatedAt: now,
        });

        const mutationRef = doc(collection(db, 'stock_mutations'));
        transaction.set(mutationRef, {
          id: mutationRef.id,
          productId: p.item.productId,
          productName: p.item.name || 'Flatshoes Mochi Steps',
          size: Number(p.item.size),
          orderNumber: order.orderNumber,
          type: 'IN',
          quantity: p.item.quantity || 1,
          notes: `Restorasi Stok: Pembayaran Ditolak #${order.orderNumber} (Ukuran ${p.item.size} - ${reason})`,
          previousStock: p.currentStock,
          newStock: p.restoredStock,
          timestamp: now,
          actor: 'Admin Approval (Reject)',
        });
      }

      const noteSuffix = `Ditolak: ${reason}`;
      const updatedNotes = order.specialNotes ? `${order.specialNotes} | ${noteSuffix}` : noteSuffix;

      transaction.set(
        orderRef,
        {
          ...order,
          paymentStatus: 'Ditolak',
          orderStatus: 'Ditolak',
          rejectionReason: reason,
          stockRestored: true,
          specialNotes: updatedNotes,
          updatedAt: now,
        },
        { merge: true }
      );
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${order.id}`);
    throw error;
  }
}

// Cancel Order (by Customer or Admin): restores size-specific stock once (Idempotent)
export async function cancelCustomerOrder(order: Order, reason: string = 'Dibatalkan oleh Pelanggan'): Promise<void> {
  const now = new Date().toISOString();
  const orderRef = doc(db, 'orders', order.id);

  try {
    await runTransaction(db, async (transaction) => {
      const oSnap = await transaction.get(orderRef);
      const oData = oSnap.exists() ? oSnap.data() : order;

      // Idempotency: only restore stock once
      if (oData.stockRestored === true) {
        transaction.update(orderRef, {
          orderStatus: 'Dibatalkan',
          updatedAt: now,
        });
        return;
      }

      const productDocs: {
        ref: any;
        currentStock: number;
        newSizeStock: Record<number, number>;
        restoredStock: number;
        item: any;
      }[] = [];

      for (const item of (order.items || [])) {
        if (!item?.productId) continue;
        const pRef = doc(db, 'products', item.productId);
        const pSnap = await transaction.get(pRef);
        if (pSnap.exists()) {
          const pData = pSnap.data();
          const currentStock = Number(pData.stock) || 0;
          const currentSizeStock = getProductSizeStock(pData as any);
          const itemSize = Number(item.size);
          const itemQty = Number(item.quantity) || 1;

          const newSizeStock = { ...currentSizeStock };
          newSizeStock[itemSize] = (newSizeStock[itemSize] || 0) + itemQty;
          const restoredStock = calculateTotalFromSizeStock(newSizeStock);

          productDocs.push({
            ref: pRef,
            currentStock,
            newSizeStock,
            restoredStock,
            item,
          });
        }
      }

      for (const p of productDocs) {
        transaction.update(p.ref, {
          sizeStock: p.newSizeStock,
          stock: p.restoredStock,
          updatedAt: now,
        });

        const mutationRef = doc(collection(db, 'stock_mutations'));
        transaction.set(mutationRef, {
          id: mutationRef.id,
          productId: p.item.productId,
          productName: p.item.name || 'Flatshoes Mochi Steps',
          size: Number(p.item.size),
          orderNumber: order.orderNumber,
          type: 'IN',
          quantity: p.item.quantity || 1,
          notes: `Restorasi Stok: Pesanan Dibatalkan #${order.orderNumber} (${reason})`,
          previousStock: p.currentStock,
          newStock: p.restoredStock,
          timestamp: now,
          actor: 'Sistem Pembatalan Pesanan',
        });
      }

      transaction.set(
        orderRef,
        {
          ...order,
          orderStatus: 'Dibatalkan',
          stockRestored: true,
          rejectionReason: reason,
          updatedAt: now,
        },
        { merge: true }
      );
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${order.id}`);
    throw error;
  }
}

// Update sizeStock directly from Admin "Edit Stok" Modal
// Total physical stock is automatically calculated from sum(size 36..41)
export async function updateProductSizeStock(
  productId: string,
  newSizeStock: Record<number, number>,
  actor: string = 'Admin'
): Promise<number> {
  const now = new Date().toISOString();
  const productRef = doc(db, 'products', productId);

  let newTotal = 0;
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(productRef);
    if (!snap.exists()) {
      throw new Error(`Produk dengan ID ${productId} tidak ditemukan.`);
    }
    const currentData = snap.data();
    const prevStock = Number(currentData.stock) || 0;
    newTotal = calculateTotalFromSizeStock(newSizeStock);

    transaction.update(productRef, {
      sizeStock: newSizeStock,
      stock: newTotal,
      updatedAt: now,
    });

    const mutationRef = doc(collection(db, 'stock_mutations'));
    transaction.set(mutationRef, {
      id: mutationRef.id,
      productId,
      productName: currentData.name || 'Flatshoes Mochi Steps',
      type: 'ADJUSTMENT',
      quantity: Math.abs(newTotal - prevStock),
      notes: `Penyesuaian Manual Stok per Ukuran 36–41 (Total: ${prevStock} → ${newTotal} pasang)`,
      previousStock: prevStock,
      newStock: newTotal,
      timestamp: now,
      actor: actor,
    });
  });

  return newTotal;
}

// Update order status (e.g. to 'Dikirim' or 'Selesai')
export async function updateOrderStatus(orderId: string, orderStatus: OrderStatus): Promise<void> {
  const now = new Date().toISOString();
  const orderRef = doc(db, 'orders', orderId);
  try {
    const snap = await getDoc(orderRef);
    const orderData = snap.data() as Order | undefined;
    const currentHistory = Array.isArray(orderData?.statusHistory) ? orderData!.statusHistory! : [];
    const currentCheckpoints = Array.isArray(orderData?.shipmentCheckpoints)
      ? orderData!.shipmentCheckpoints!
      : [];

    const newHistoryItem: OrderStatusHistoryItem = {
      status: orderStatus,
      timestamp: now,
      notes: `Status pesanan diperbarui menjadi ${orderStatus}`,
      actor: 'Admin',
    };

    const payload: Record<string, any> = {
      orderStatus,
      updatedAt: now,
      statusHistory: [...currentHistory, newHistoryItem],
    };

    if (orderStatus === 'Selesai') {
      const hasDelivered = currentCheckpoints.some((cp) => cp.statusCode === 'delivered');
      if (!hasDelivered) {
        const destCity = orderData?.city || 'Alamat Tujuan';
        const deliveredCheckpoint: ShipmentCheckpoint = {
          id: `cp-${Date.now()}`,
          title: 'Paket Telah Diterima Pelanggan',
          location: destCity,
          description: 'Pengiriman selesai dan paket telah diterima di alamat tujuan.',
          timestamp: now,
          statusCode: 'delivered',
        };
        payload.shipmentCheckpoints = [...currentCheckpoints, deliveredCheckpoint];
      }
    }

    await updateDoc(orderRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
  }
}

// Update payment proof URL uploaded by customer for specific order
export async function updateOrderPaymentProof(orderId: string, paymentProofUrl: string): Promise<void> {
  const now = new Date().toISOString();
  const orderRef = doc(db, 'orders', orderId);
  try {
    await updateDoc(orderRef, {
      paymentProofUrl,
      updatedAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
  }
}

// Add manual stock mutation (Restock / Barang Masuk or Manual Out)
export async function recordManualStockMutation(
  productId: string,
  type: 'IN' | 'OUT' | 'ADJUSTMENT',
  quantity: number,
  notes: string,
  actor: string = 'Admin'
): Promise<void> {
  const now = new Date().toISOString();
  const pRef = doc(db, 'products', productId);

  try {
    await runTransaction(db, async (transaction) => {
      const pSnap = await transaction.get(pRef);
      if (!pSnap.exists()) throw new Error('Produk tidak ditemukan');

      const data = pSnap.data();
      const currentStock = Number(data.stock) || 0;
      let newStock = currentStock;

      if (type === 'IN') {
        newStock = currentStock + quantity;
      } else if (type === 'OUT') {
        if (currentStock < quantity) {
          throw new Error(`Stok saat ini (${currentStock}) tidak cukup untuk dikurangi ${quantity}`);
        }
        newStock = currentStock - quantity;
      } else if (type === 'ADJUSTMENT') {
        newStock = quantity; // Absolute adjustment
      }

      transaction.update(pRef, {
        stock: newStock,
        updatedAt: now,
      });

      const mutationRef = doc(collection(db, 'stock_mutations'));
      transaction.set(mutationRef, {
        id: mutationRef.id,
        productId,
        productName: data.name,
        type,
        quantity,
        notes,
        previousStock: currentStock,
        newStock,
        timestamp: now,
        actor,
      });
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'stock_mutations');
  }
}

// Add new product
export async function addNewProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const now = new Date().toISOString();
  const pRef = doc(collection(db, 'products'));

  try {
    await setDoc(pRef, {
      ...productData,
      id: pRef.id,
      createdAt: now,
      updatedAt: now,
    });

    // Record initial mutation
    if (productData.stock > 0) {
      const mutRef = doc(collection(db, 'stock_mutations'));
      await setDoc(mutRef, {
        id: mutRef.id,
        productId: pRef.id,
        productName: productData.name,
        type: 'IN',
        quantity: productData.stock,
        notes: 'Stok Awal Produk Baru',
        previousStock: 0,
        newStock: productData.stock,
        timestamp: now,
        actor: 'Admin Tambah Produk',
      });
    }

    return pRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'products');
    throw error;
  }
}

// Update existing product
export async function updateProductDetails(productId: string, updates: Partial<Product>): Promise<void> {
  const now = new Date().toISOString();
  const pRef = doc(db, 'products', productId);
  try {
    await updateDoc(pRef, {
      ...updates,
      updatedAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `products/${productId}`);
  }
}

// Delete product
export async function deleteProduct(productId: string): Promise<void> {
  const pRef = doc(db, 'products', productId);
  try {
    await deleteDoc(pRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `products/${productId}`);
  }
}

// -------------------------------------------------------------
// POS KASIR & AUTO RATIO PROFIT / INVENTORY METHODS
// -------------------------------------------------------------

export interface PosTransactionInput {
  items: {
    productId: string;
    name: string;
    price: number;
    size: number;
    quantity: number;
    imageUrl: string;
    color: string;
  }[];
  customerName?: string;
  customerPhone?: string;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  cashChange?: number;
  discountAmount?: number;
  cashierName?: string;
  notes?: string;
}

// Atomic POS Transaction: verifies stock, creates order, records OUT mutation, updates customer
export async function createPosTransaction(input: PosTransactionInput): Promise<Order> {
  const now = new Date().toISOString();
  const orderDocRef = doc(collection(db, 'orders'));
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `POS-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${randomSuffix}`;
  const receiptNumber = `RCP-${randomSuffix}`;

  const subtotal = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = Math.max(0, input.discountAmount || 0);
  const totalAmount = Math.max(0, subtotal - discount);

  const customerName = input.customerName?.trim() || 'Pelanggan Toko (Walk-in)';
  const customerPhone = input.customerPhone?.trim() || '-';

  const orderRecord: Order = {
    id: orderDocRef.id,
    orderNumber,
    customerName,
    customerPhone,
    customerAddress: 'Toko Offline Mochi Steps (Walk-in)',
    district: 'Banjarsari',
    city: 'Surakarta (Solo)',
    postalCode: '57139',
    specialNotes: input.notes || 'Transaksi Kasir POS Toko Mochi Steps',
    courier: 'Ambil di Toko / Langsung Kasir',
    paymentMethod: input.paymentMethod,
    paymentStatus: 'Lunas',
    orderStatus: 'Selesai',
    items: input.items,
    subtotal,
    shippingCost: 0,
    totalAmount,
    channel: 'pos',
    cashierName: input.cashierName || 'Kasir Mochi Steps',
    cashReceived: input.cashReceived,
    cashChange: input.cashChange,
    discountAmount: discount,
    receiptNumber,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await runTransaction(db, async (transaction) => {
      // 1. Verify and read all product stocks first (ALL READS MUST BE FIRST)
      const productDocs: {
        ref: any;
        currentStock: number;
        currentSizeStock: Record<number, number>;
        newSizeStock: Record<number, number>;
        newStock: number;
        id: string;
        name: string;
        size: number;
        qty: number;
      }[] = [];

      for (const item of input.items) {
        const pRef = doc(db, 'products', item.productId);
        const pSnap = await transaction.get(pRef);
        if (!pSnap.exists()) {
          throw new Error(`Produk "${item.name}" tidak ditemukan di database.`);
        }
        const pData = pSnap.data();
        const currentTotal = Number(pData.stock) || 0;
        const currentSizeStock = getProductSizeStock(pData as any);
        const itemSize = Number(item.size);
        const availableInSize = currentSizeStock[itemSize] !== undefined ? currentSizeStock[itemSize] : currentTotal;

        if (availableInSize < item.quantity) {
          throw new Error(`Stok produk "${item.name}" ukuran ${itemSize} tersisa ${availableInSize} pasang, tidak cukup untuk pembelian ${item.quantity} pasang.`);
        }

        const newSizeStock = { ...currentSizeStock };
        newSizeStock[itemSize] = Math.max(0, (newSizeStock[itemSize] || 0) - item.quantity);
        const newStock = calculateTotalFromSizeStock(newSizeStock);

        productDocs.push({
          ref: pRef,
          currentStock: currentTotal,
          currentSizeStock,
          newSizeStock,
          newStock,
          id: item.productId,
          name: item.name,
          size: itemSize,
          qty: item.quantity,
        });
      }

      // 2. Read customer doc if phone provided (BEFORE ANY WRITES)
      const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
      let customerSnap: any = null;
      let customerDocRef: any = null;
      if (cleanPhone.length >= 8) {
        customerDocRef = doc(db, 'customers', cleanPhone);
        customerSnap = await transaction.get(customerDocRef);
      }

      // ==========================================
      // ALL WRITES BELOW (NO MORE READS PERMITTED)
      // ==========================================

      // 3. Decrement sizeStock and total stock for each product and record OUT mutation
      for (const p of productDocs) {
        transaction.update(p.ref, {
          sizeStock: p.newSizeStock,
          stock: p.newStock,
          updatedAt: now,
        });

        const mutationRef = doc(collection(db, 'stock_mutations'));
        transaction.set(mutationRef, {
          id: mutationRef.id,
          productId: p.id,
          productName: p.name,
          size: p.size,
          orderNumber,
          type: 'OUT',
          quantity: p.qty,
          notes: `Transaksi Kasir POS #${orderNumber} (Ukuran ${p.size} x${p.qty}) - ${customerName}`,
          previousStock: p.currentStock,
          newStock: p.newStock,
          timestamp: now,
          actor: input.cashierName || 'Kasir POS Mochi Steps',
        });
      }

      // 4. Write Order document
      transaction.set(orderDocRef, orderRecord);

      // 5. Upsert Customer in customers collection if phone provided
      if (cleanPhone.length >= 8 && customerDocRef) {
        if (customerSnap && customerSnap.exists()) {
          const current = customerSnap.data();
          const prevOrders = Array.isArray(current.orders) ? current.orders : [];
          transaction.update(customerDocRef, {
            name: customerName,
            totalOrders: (Number(current.totalOrders) || 0) + 1,
            totalSpent: (Number(current.totalSpent) || 0) + totalAmount,
            lastOrderDate: now,
            orders: [orderRecord, ...prevOrders.slice(0, 19)],
          });
        } else {
          transaction.set(customerDocRef, {
            phone: cleanPhone,
            name: customerName,
            address: 'Toko Offline Mochi Steps (Walk-in)',
            district: 'Banjarsari',
            city: 'Surakarta (Solo)',
            postalCode: '57139',
            totalOrders: 1,
            totalSpent: totalAmount,
            lastOrderDate: now,
            orders: [orderRecord],
          });
        }
      }
    });

    return orderRecord;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'orders/pos');
    throw error;
  }
}

// Quick Restock Product (Barang Masuk dari Pengrajin Solo)
export async function restockProduct(
  productId: string,
  quantityToAdd: number,
  notes: string = 'Restock Masuk Workshop Solo',
  actor: string = 'Admin Inventory'
): Promise<void> {
  const now = new Date().toISOString();
  const pRef = doc(db, 'products', productId);

  try {
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(pRef);
      if (!snap.exists()) {
        throw new Error('Produk tidak ditemukan di database');
      }
      const data = snap.data();
      const currentStock = Number(data.stock) || 0;
      const newStock = currentStock + quantityToAdd;

      transaction.update(pRef, {
        stock: newStock,
        updatedAt: now,
      });

      const mutRef = doc(collection(db, 'stock_mutations'));
      transaction.set(mutRef, {
        id: mutRef.id,
        productId,
        productName: data.name || '',
        type: 'IN',
        quantity: quantityToAdd,
        notes: notes.trim() || 'Restock Masuk Workshop Solo',
        previousStock: currentStock,
        newStock,
        timestamp: now,
        actor,
      });
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `products/${productId}/restock`);
    throw error;
  }
}

// Update Pricing & Cost Price (HPP)
export async function updateProductPricing(
  productId: string,
  price: number,
  costPrice: number
): Promise<void> {
  const now = new Date().toISOString();
  const pRef = doc(db, 'products', productId);
  try {
    await updateDoc(pRef, {
      price: Math.max(0, price),
      costPrice: Math.max(0, costPrice),
      updatedAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `products/${productId}/pricing`);
    throw error;
  }
}

// Financial Ratio Calculations Helper
export function calculateProfitRatio(sellingPrice: number, costPrice: number) {
  const validCost = Math.max(0, Number(costPrice) || 0);
  const validSelling = Math.max(0, Number(sellingPrice) || 0);
  const profitNominal = validSelling - validCost;
  const profitMarginPct = validSelling > 0 ? (profitNominal / validSelling) * 100 : 0;
  const markupPct = validCost > 0 ? (profitNominal / validCost) * 100 : 0;

  return {
    sellingPrice: validSelling,
    costPrice: validCost,
    profitNominal,
    profitMarginPct: Math.round(profitMarginPct * 10) / 10,
    markupPct: Math.round(markupPct * 10) / 10,
  };
}

// Auto Calculate Selling Price based on target margin % or markup %
export function autoCalculateSellingPrice(
  costPrice: number,
  mode: 'margin' | 'markup',
  percentage: number
): number {
  if (costPrice <= 0) return 0;
  let rawPrice = 0;
  if (mode === 'margin') {
    // Price = Cost / (1 - Margin/100)
    const marginRatio = Math.min(0.95, Math.max(0.05, percentage / 100));
    rawPrice = costPrice / (1 - marginRatio);
  } else {
    // Markup: Price = Cost * (1 + Markup/100)
    rawPrice = costPrice * (1 + percentage / 100);
  }
  // Round to nearest 1.000 for standard Indonesian retail pricing
  return Math.ceil(rawPrice / 1000) * 1000;
}

// Bulk update markup for multiple products
export async function bulkUpdateProductMarkup(
  updates: Array<{ id: string; price: number; costPrice: number }>
): Promise<number> {
  if (!updates.length) return 0;
  const now = new Date().toISOString();
  const batch = writeBatch(db);

  try {
    updates.forEach((item) => {
      const pRef = doc(db, 'products', item.id);
      batch.update(pRef, {
        price: Math.max(0, item.price),
        costPrice: Math.max(0, item.costPrice),
        updatedAt: now,
      });
    });

    await batch.commit();
    return updates.length;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'products/bulk_markup');
    throw error;
  }
}

// Record Physical Stock Opname with automatic difference and mutation log
export async function recordStockOpname(params: {
  productId: string;
  physicalStock: number;
  notes: string;
  actor: string;
}): Promise<{ diff: number; previousStock: number; newStock: number }> {
  const now = new Date().toISOString();
  const pRef = doc(db, 'products', params.productId);

  try {
    return await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(pRef);
      if (!snap.exists()) {
        throw new Error('Produk tidak ditemukan di database.');
      }
      const data = snap.data();
      const previousStock = Number(data.stock) || 0;
      const newStock = Math.max(0, params.physicalStock);
      const diff = newStock - previousStock;

      transaction.update(pRef, {
        stock: newStock,
        updatedAt: now,
      });

      const mutRef = doc(collection(db, 'stock_mutations'));
      transaction.set(mutRef, {
        id: mutRef.id,
        productId: params.productId,
        productName: data.name || '',
        type: diff >= 0 ? 'ADJUSTMENT' : 'ADJUSTMENT',
        quantity: Math.abs(diff),
        notes: `[Opname Fisik] ${params.notes.trim() || (diff === 0 ? 'Stok fisik sesuai sistem' : diff > 0 ? `Selisih lebih +${diff} pasang` : `Selisih kurang ${diff} pasang`)}`,
        previousStock,
        newStock,
        timestamp: now,
        actor: params.actor || 'Admin Opname Gudang',
        source: 'ADMIN_OPNAME',
      });

      return { diff, previousStock, newStock };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `products/${params.productId}/opname`);
    throw error;
  }
}

// Update Order Tracking Details & Status with Courier, Shipping Date, and ETA
export async function updateOrderTracking(
  orderId: string,
  trackingNumber: string,
  courier?: string,
  shippingDate?: string,
  status?: OrderStatus,
  actor: string = 'Admin Logistik',
  estimatedDelivery?: string
): Promise<void> {
  const now = new Date().toISOString();
  const orderRef = doc(db, 'orders', orderId);

  try {
    const snap = await getDoc(orderRef);
    const orderData = snap.data() as Order | undefined;
    const currentHistory = Array.isArray(orderData?.statusHistory) ? orderData!.statusHistory! : [];
    const currentCheckpoints = Array.isArray(orderData?.shipmentCheckpoints)
      ? orderData!.shipmentCheckpoints!
      : [];

    const cleanResi = trackingNumber.trim();
    const resolvedCourier = (courier && courier.trim()) || orderData?.courier || 'Kurir Toko';
    const resolvedShippingDate = shippingDate || orderData?.shippingDate || now.slice(0, 10);

    const newHistoryItem: OrderStatusHistoryItem = {
      status: status || orderData?.orderStatus || 'Dikirim',
      timestamp: now,
      notes: `Resi ${cleanResi} via ${resolvedCourier}${resolvedShippingDate ? ` (${resolvedShippingDate})` : ''}`,
      actor,
    };

    const newCheckpoint: ShipmentCheckpoint = {
      id: `cp-${Date.now()}`,
      title: cleanResi
        ? `Paket Diserahkan ke ${resolvedCourier}`
        : 'Nomor Resi & Pengiriman Diperbarui',
      location: 'Gudang Mochi Steps (Jakarta)',
      description: cleanResi
        ? `Nomor resi ${cleanResi} diterbitkan. Paket dipickup oleh kurir ${resolvedCourier}.`
        : `Kurir ${resolvedCourier} ditetapkan untuk pengiriman.`,
      timestamp: now,
      statusCode: 'pickup',
    };

    const updatePayload: Record<string, any> = {
      trackingNumber: cleanResi,
      courier: resolvedCourier,
      shippingDate: resolvedShippingDate,
      updatedAt: now,
      statusHistory: [...currentHistory, newHistoryItem],
      shipmentCheckpoints: [...currentCheckpoints, newCheckpoint],
    };

    if (status) updatePayload.orderStatus = status;
    if (estimatedDelivery !== undefined && estimatedDelivery.trim()) {
      updatePayload.estimatedDelivery = estimatedDelivery.trim();
    }

    await updateDoc(orderRef, updatePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}/tracking`);
    throw error;
  }
}

// Add a Courier Location Checkpoint to an Order's Shipment Timeline
export async function addShipmentCheckpoint(
  orderId: string,
  checkpoint: {
    title: string;
    location: string;
    description: string;
    statusCode: ShipmentCheckpointStatus;
  },
  options?: {
    estimatedDelivery?: string;
    orderStatus?: OrderStatus;
    actor?: string;
  }
): Promise<ShipmentCheckpoint> {
  const now = new Date().toISOString();
  const orderRef = doc(db, 'orders', orderId);

  try {
    const snap = await getDoc(orderRef);
    const orderData = snap.data() as Order | undefined;
    const currentCheckpoints = Array.isArray(orderData?.shipmentCheckpoints)
      ? orderData!.shipmentCheckpoints!
      : [];
    const currentHistory = Array.isArray(orderData?.statusHistory) ? orderData!.statusHistory! : [];

    const newCheckpoint: ShipmentCheckpoint = {
      id: `cp-${Date.now()}`,
      title: checkpoint.title.trim(),
      location: checkpoint.location.trim(),
      description: checkpoint.description.trim(),
      timestamp: now,
      statusCode: checkpoint.statusCode,
    };

    const updatePayload: Record<string, any> = {
      shipmentCheckpoints: [...currentCheckpoints, newCheckpoint],
      updatedAt: now,
    };

    if (options?.estimatedDelivery && options.estimatedDelivery.trim()) {
      updatePayload.estimatedDelivery = options.estimatedDelivery.trim();
    }

    if (options?.orderStatus) {
      updatePayload.orderStatus = options.orderStatus;
      updatePayload.statusHistory = [
        ...currentHistory,
        {
          status: options.orderStatus,
          timestamp: now,
          notes: `${newCheckpoint.title} (${newCheckpoint.location})`,
          actor: options.actor || 'Admin Logistik',
        },
      ];
    }

    await updateDoc(orderRef, updatePayload);
    return newCheckpoint;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}/checkpoint`);
    throw error;
  }
}

// Update Order Custom Status and optionally Payment Status
export async function updateOrderCustomStatus(
  orderId: string,
  orderStatus: OrderStatus,
  paymentStatus?: PaymentStatus,
  notes?: string,
  actor: string = 'Admin'
): Promise<void> {
  const now = new Date().toISOString();
  const orderRef = doc(db, 'orders', orderId);

  try {
    const snap = await getDoc(orderRef);
    const orderData = snap.data() as Order | undefined;
    const currentHistory = orderData?.statusHistory || [];

    const newHistoryItem: OrderStatusHistoryItem = {
      status: orderStatus,
      timestamp: now,
      notes: notes || `Status diubah menjadi ${orderStatus}`,
      actor,
    };

    const payload: Record<string, any> = {
      orderStatus,
      updatedAt: now,
      statusHistory: [...currentHistory, newHistoryItem],
    };

    if (paymentStatus) {
      payload.paymentStatus = paymentStatus;
    }

    await updateDoc(orderRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}/status`);
    throw error;
  }
}

// Update minimum stock alert threshold
export async function updateProductMinStock(
  productId: string,
  minStock: number
): Promise<void> {
  const now = new Date().toISOString();
  const pRef = doc(db, 'products', productId);
  try {
    await updateDoc(pRef, {
      minStock: Math.max(0, minStock),
      updatedAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `products/${productId}/minStock`);
    throw error;
  }
}

// ==========================================
// 1. PENGATURAN TOKO (STORE SETTINGS) LIVE SYNC
// ==========================================
export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'Mochi Steps',
  tagline: 'Your Everyday Steps, Your Style',
  description: 'Toko flatshoes wanita premium dengan bantalan CloudMochi 8mm selembut marshmallow. Nyaman melangkah seharian tanpa lecet.',
  announcementBanner: '🌸 PROMO SPESIAL: Diskon s/d 20% & Garansi Bebas Tukar Ukuran 3 Hari! Gunakan voucher MOCHICERIA',
  isAnnouncementActive: true,
  phone: '081945673245',
  whatsappNumber: '6281945673245',
  email: 'halo@mochisteps.com',
  address: 'Jl. Kemang Raya No. 42B, Mampang Prapatan',
  city: 'Jakarta Selatan, DKI Jakarta 12730',
  operationalHours: 'Senin - Minggu: 08.00 - 21.00 WIB',
  defaultShippingCost: 15000,
  freeShippingThreshold: 350000,
  bankAccounts: [
    {
      bankName: 'Bank Central Asia (BCA)',
      accountNumber: '8720-4912-33',
      accountHolder: 'PT MOCHI STEPS INDONESIA',
      instructions: 'Transfer tepat sesuai nominal tagihan hingga 3 digit terakhir untuk kemudahan verifikasi.',
    },
    {
      bankName: 'Bank Mandiri',
      accountNumber: '137-00-9821456-2',
      accountHolder: 'PT MOCHI STEPS INDONESIA',
      instructions: 'Cantumkan nomor pesanan Anda pada berita transfer bank.',
    },
    {
      bankName: 'Bank BRI',
      accountNumber: '0341-01-002348-50-9',
      accountHolder: 'PT MOCHI STEPS INDONESIA',
      instructions: 'Transfer dapat dilakukan via ATM, BRImo, atau teller cabang.',
    },
  ],
  termsAndConditions: 'Semua produk Mochi Steps bergaransi keaslian 100%. Pesanan diproses setelah pembayaran terverifikasi oleh tim admin.',
  privacyPolicy: 'Kami menghargai privasi Anda. Nomor telepon, alamat kirim, dan data pesanan Anda terenkripsi dan tidak akan dibagikan ke pihak ketiga.',
  returnPolicy: 'Garansi tukar ukuran berlaku maksimal 3 hari sejak barang diterima kurir. Sepatu harus dalam kondisi belum dipakai ke luar rumah, sol bersih, dan dus lengkap.',
  sizeGuideNote: 'Ukuran sepatu Mochi Steps adalah true-to-size standar EU 36-41. Bila punggung kaki gemuk atau lebar, sangat disarankan memilih 1 ukuran lebih besar.',
};

export function subscribeToStoreSettings(callback: (settings: StoreSettings) => void) {
  const settingsDocRef = doc(db, 'settings', 'store');
  return onSnapshot(
    settingsDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback({ ...DEFAULT_STORE_SETTINGS, ...snapshot.data() } as StoreSettings);
      } else {
        setDoc(settingsDocRef, DEFAULT_STORE_SETTINGS).catch((e) => console.warn('Seed settings note:', e));
        callback(DEFAULT_STORE_SETTINGS);
      }
    },
    (error) => {
      console.warn('Store settings subscription error, falling back to default:', error);
      callback(DEFAULT_STORE_SETTINGS);
    }
  );
}

export async function updateStoreSettings(newSettings: Partial<StoreSettings>): Promise<void> {
  const settingsDocRef = doc(db, 'settings', 'store');
  const now = new Date().toISOString();
  try {
    await setDoc(settingsDocRef, { ...newSettings, updatedAt: now }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'settings/store');
    throw error;
  }
}

// ==========================================
// 2. VOUCHER & PROMOSI (VOUCHERS & DISCOUNTS)
// ==========================================
export const DEFAULT_VOUCHERS: Omit<Voucher, 'id'>[] = [
  {
    code: 'MOCHICERIA',
    discountType: 'percentage',
    discountValue: 15,
    minSpend: 150000,
    maxDiscount: 35000,
    validUntil: '2026-12-31',
    usageLimit: 1000,
    usageCount: 42,
    isActive: true,
    description: 'Diskon 15% Spesial Koleksi Flatshoes Mochi Steps (Min. Belanja Rp 150.000)',
  },
  {
    code: 'STEPS20K',
    discountType: 'nominal',
    discountValue: 20000,
    minSpend: 200000,
    validUntil: '2026-12-31',
    usageLimit: 500,
    usageCount: 18,
    isActive: true,
    description: 'Potongan Langsung Rp 20.000 untuk Semua Model Sepatu',
  },
];

export function subscribeToVouchers(callback: (vouchers: Voucher[]) => void) {
  const vouchersCol = collection(db, 'vouchers');
  return onSnapshot(
    vouchersCol,
    (snapshot) => {
      if (snapshot.empty) {
        // Seed default vouchers if empty
        DEFAULT_VOUCHERS.forEach((v) => {
          addDoc(vouchersCol, { ...v, createdAt: new Date().toISOString() }).catch(() => {});
        });
        callback(DEFAULT_VOUCHERS.map((v, i) => ({ id: `default-${i}`, ...v })));
      } else {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Voucher));
        callback(list);
      }
    },
    (error) => {
      console.warn('Vouchers subscription note:', error);
      callback(DEFAULT_VOUCHERS.map((v, i) => ({ id: `default-${i}`, ...v })));
    }
  );
}

export async function addVoucher(data: Omit<Voucher, 'id'>): Promise<string> {
  const now = new Date().toISOString();
  const vRef = doc(collection(db, 'vouchers'));
  try {
    await setDoc(vRef, {
      ...data,
      id: vRef.id,
      code: data.code.trim().toUpperCase(),
      createdAt: now,
    });
    return vRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'vouchers');
    throw error;
  }
}

export async function updateVoucher(id: string, data: Partial<Voucher>): Promise<void> {
  const vRef = doc(db, 'vouchers', id);
  try {
    await updateDoc(vRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `vouchers/${id}`);
    throw error;
  }
}

export async function deleteVoucher(id: string): Promise<void> {
  const vRef = doc(db, 'vouchers', id);
  try {
    await deleteDoc(vRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `vouchers/${id}`);
    throw error;
  }
}

// ==========================================
// 3. ULASAN PEMBELI (VERIFIED BUYER REVIEWS)
// ==========================================
export const INITIAL_SEED_REVIEWS: ProductReview[] = [
  {
    id: 'seed-rev-01-a',
    productId: 'mochi-flat-01',
    productName: 'Mochi Peach Puff Ribbon',
    orderId: 'seed-ord-01a',
    orderNumber: 'MCS-2026-8801',
    customerName: 'Nadia Putri',
    rating: 5,
    comment: 'Warnanya peach pastel lembut persis di foto, pita depannya rapi banget dan empuk dipakai jalan dari stasiun ke kantor tanpa lecet.',
    photoUrl: lookbookOfficeImg,
    size: 38,
    fitFeedback: 'Pas di Kaki',
    featuredInGallery: true,
    isApproved: true,
    createdAt: '2026-11-18T09:30:00.000Z',
  },
  {
    id: 'seed-rev-01-b',
    productId: 'mochi-flat-01',
    productName: 'Mochi Peach Puff Ribbon',
    orderId: 'seed-ord-01b',
    orderNumber: 'MCS-2026-8802',
    customerName: 'Rani Kusuma',
    rating: 5,
    comment: 'Busa CloudMochi-nya benar-benar berasa empuk di tumit. Kaki saya 23.5 cm ambil size 37 langsung pas nyaman.',
    photoUrl: '/shoes/mochi-flat-01.jpg',
    size: 37,
    fitFeedback: 'Pas di Kaki',
    featuredInGallery: false,
    isApproved: true,
    createdAt: '2026-11-15T14:20:00.000Z',
  },
  {
    id: 'seed-rev-02-a',
    productId: 'mochi-flat-02',
    productName: 'Daisy Cloud Butter Flats',
    orderId: 'seed-ord-02a',
    orderNumber: 'MCS-2026-8803',
    customerName: 'Clarissa Amanda',
    rating: 5,
    comment: 'Dipakai nongkrong seharian ke kafe sama rok denim manis banget. Ringan dan nggak bikin kaki berkeringat.',
    photoUrl: lookbookCasualImg,
    size: 37,
    fitFeedback: 'Pas di Kaki',
    featuredInGallery: true,
    isApproved: true,
    createdAt: '2026-11-19T11:10:00.000Z',
  },
  {
    id: 'seed-rev-02-b',
    productId: 'mochi-flat-02',
    productName: 'Daisy Cloud Butter Flats',
    orderId: 'seed-ord-02b',
    orderNumber: 'MCS-2026-8804',
    customerName: 'Siti Aulia',
    rating: 4,
    comment: 'Warna vanilla butter-nya netral masuk ke semua baju. Untuk kaki punggung agak tinggi, naik ke 39 lebih lega.',
    photoUrl: '/shoes/mochi-flat-02.jpg',
    size: 39,
    fitFeedback: 'Agak Sempit (Naik 1 Size)',
    featuredInGallery: false,
    isApproved: true,
    createdAt: '2026-11-14T16:45:00.000Z',
  },
  {
    id: 'seed-rev-03-a',
    productId: 'mochi-flat-03',
    productName: 'Strawberry Pearl Mary Jane',
    orderId: 'seed-ord-03a',
    orderNumber: 'MCS-2026-8805',
    customerName: 'Firda Rahmawati',
    rating: 5,
    comment: 'Strap mutiaranya bikin tampil super gemas ala kuliah! Saya pakai ukuran 39 sama kaus kaki tipis masih pas.',
    photoUrl: lookbookCampusImg,
    size: 39,
    fitFeedback: 'Pas di Kaki',
    featuredInGallery: true,
    isApproved: true,
    createdAt: '2026-11-20T08:15:00.000Z',
  },
  {
    id: 'seed-rev-03-b',
    productId: 'mochi-flat-03',
    productName: 'Strawberry Pearl Mary Jane',
    orderId: 'seed-ord-03b',
    orderNumber: 'MCS-2026-8806',
    customerName: 'Keisha Wijaya',
    rating: 5,
    comment: 'Cocok buat kaki mungil yang sering copot pakai flatshoes biasa karena ada tali Mary Jane-nya. Empuk banget!',
    photoUrl: '/shoes/mochi-flat-03.jpg',
    size: 36,
    fitFeedback: 'Pas di Kaki',
    featuredInGallery: false,
    isApproved: true,
    createdAt: '2026-11-12T13:00:00.000Z',
  },
  {
    id: 'seed-rev-04-a',
    productId: 'mochi-flat-04',
    productName: 'Caramel Bear Cloud Ballerina',
    orderId: 'seed-ord-04a',
    orderNumber: 'MCS-2026-8807',
    customerName: 'Dinda Permata',
    rating: 5,
    comment: 'Warna karamelnya kalem dan gampang dipaduin dengan celana krem. Bantalan belakangnya lembut nggak bikin tumit sakit.',
    photoUrl: reviewBallerinaImg,
    size: 38,
    fitFeedback: 'Pas di Kaki',
    featuredInGallery: true,
    isApproved: true,
    createdAt: '2026-11-21T10:25:00.000Z',
  },
  {
    id: 'seed-rev-04-b',
    productId: 'mochi-flat-04',
    productName: 'Caramel Bear Cloud Ballerina',
    orderId: 'seed-ord-04b',
    orderNumber: 'MCS-2026-8808',
    customerName: 'Mega Pratiwi',
    rating: 5,
    comment: 'Kaki saya ukuran 40 lebar, kulit vegan-nya lentur mengikuti bentuk kaki jadi tetap nyaman dipakai nyetir maupun jalan.',
    photoUrl: '/shoes/mochi-flat-04.jpg',
    size: 40,
    fitFeedback: 'Pas di Kaki',
    featuredInGallery: false,
    isApproved: true,
    createdAt: '2026-11-11T17:10:00.000Z',
  },
  {
    id: 'seed-rev-05-a',
    productId: 'mochi-flat-05',
    productName: 'Sakura Blossom Pointed',
    orderId: 'seed-ord-05a',
    orderNumber: 'MCS-2026-8809',
    customerName: 'Tania Oktaviani',
    rating: 5,
    comment: 'Dipakai ke acara kondangan malam kelihatan mewah tapi kaki bebas pegal! Bros sakuranya berkilau halus.',
    photoUrl: lookbookEveningImg,
    size: 38,
    fitFeedback: 'Pas di Kaki',
    featuredInGallery: true,
    isApproved: true,
    createdAt: '2026-11-22T12:05:00.000Z',
  },
  {
    id: 'seed-rev-05-b',
    productId: 'mochi-flat-05',
    productName: 'Sakura Blossom Pointed',
    orderId: 'seed-ord-05b',
    orderNumber: 'MCS-2026-8810',
    customerName: 'Bella Maharani',
    rating: 4,
    comment: 'Model pointed-nya bikin kaki terlihat jenjang. Kaki saya agak lebar jadi pesan 40 dan pas banget di jari.',
    photoUrl: '/shoes/mochi-flat-05.jpg',
    size: 40,
    fitFeedback: 'Agak Sempit (Naik 1 Size)',
    featuredInGallery: false,
    isApproved: true,
    createdAt: '2026-11-10T15:30:00.000Z',
  },
  {
    id: 'seed-rev-06-a',
    productId: 'mochi-flat-06',
    productName: 'Lilac Fairy Star Pointed',
    orderId: 'seed-ord-06a',
    orderNumber: 'MCS-2026-8811',
    customerName: 'Vina Anggraini',
    rating: 5,
    comment: 'Warna lilac pastelnya manis banget buat ke kantor, kena cahaya ruangan kelihatan elegan dan tetap sopan.',
    photoUrl: reviewPointedImg,
    size: 38,
    fitFeedback: 'Pas di Kaki',
    featuredInGallery: true,
    isApproved: true,
    createdAt: '2026-11-21T15:40:00.000Z',
  },
  {
    id: 'seed-rev-06-b',
    productId: 'mochi-flat-06',
    productName: 'Lilac Fairy Star Pointed',
    orderId: 'seed-ord-06b',
    orderNumber: 'MCS-2026-8812',
    customerName: 'Larasati Dewi',
    rating: 5,
    comment: 'Sudah kena gerimis tipis tetap gampang dilap karena bahannya halus. Ukuran 37 pas di kaki ramping saya.',
    photoUrl: '/shoes/mochi-flat-06.jpg',
    size: 37,
    fitFeedback: 'Pas di Kaki',
    featuredInGallery: false,
    isApproved: true,
    createdAt: '2026-11-09T11:20:00.000Z',
  },
  {
    id: 'seed-rev-07-a',
    productId: 'mochi-flat-07',
    productName: 'Boba Pearl Milk Tea Pointed',
    orderId: 'seed-ord-07a',
    orderNumber: 'MCS-2026-8813',
    customerName: 'Shinta Kartika',
    rating: 5,
    comment: 'Warna milk tea cream-nya bikin kulit kaki cerah! Mutiara di depannya terjahit kuat, aman dipakai meeting seharian.',
    photoUrl: '/shoes/mochi-flat-07.jpg',
    size: 39,
    fitFeedback: 'Pas di Kaki',
    featuredInGallery: false,
    isApproved: true,
    createdAt: '2026-11-17T09:50:00.000Z',
  },
  {
    id: 'seed-rev-07-b',
    productId: 'mochi-flat-07',
    productName: 'Boba Pearl Milk Tea Pointed',
    orderId: 'seed-ord-07b',
    orderNumber: 'MCS-2026-8814',
    customerName: 'Intan Lestari',
    rating: 5,
    comment: 'Suka banget sama insole latex-nya yang membal. Size 41 tersedia dan muat nyaman untuk kaki panjang 25.5 cm.',
    photoUrl: '/shoes/mochi-flat-07.jpg',
    size: 41,
    fitFeedback: 'Pas di Kaki',
    featuredInGallery: false,
    isApproved: true,
    createdAt: '2026-11-08T18:10:00.000Z',
  },
  {
    id: 'seed-rev-08-a',
    productId: 'mochi-flat-08',
    productName: 'Matcha Sweet Pistachio Pointed',
    orderId: 'seed-ord-08a',
    orderNumber: 'MCS-2026-8815',
    customerName: 'Hana Safira',
    rating: 5,
    comment: 'Warna hijau matcha-nya unik dan fresh banget! Solnya lentur ditekuk tidak kaku sama sekali.',
    photoUrl: '/shoes/mochi-flat-08.jpg',
    size: 38,
    fitFeedback: 'Pas di Kaki',
    featuredInGallery: false,
    isApproved: true,
    createdAt: '2026-11-16T14:00:00.000Z',
  },
  {
    id: 'seed-rev-08-b',
    productId: 'mochi-flat-08',
    productName: 'Matcha Sweet Pistachio Pointed',
    orderId: 'seed-ord-08b',
    orderNumber: 'MCS-2026-8816',
    customerName: 'Mutiara Zahra',
    rating: 4,
    comment: 'Warnanya pastel lembut sesuai ekspektasi. Bagian ujung agak meruncing jadi saran saya naik 1 size kalau kaki lebar.',
    photoUrl: '/shoes/mochi-flat-08.jpg',
    size: 39,
    fitFeedback: 'Agak Sempit (Naik 1 Size)',
    featuredInGallery: false,
    isApproved: true,
    createdAt: '2026-11-07T10:40:00.000Z',
  },
  {
    id: 'seed-rev-09-a',
    productId: 'mochi-flat-09',
    productName: 'Choco Marshmallow Penny Loafers',
    orderId: 'seed-ord-09a',
    orderNumber: 'MCS-2026-8817',
    customerName: 'Ayu Wulandari',
    rating: 5,
    comment: 'Loafer favorit saya buat kerja! Dipakai sama jeans maupun celana bahan keren, kulitnya lembut dan bantalannya empuk banget.',
    photoUrl: reviewLoafersImg,
    size: 39,
    fitFeedback: 'Pas di Kaki',
    featuredInGallery: true,
    isApproved: true,
    createdAt: '2026-11-22T09:15:00.000Z',
  },
  {
    id: 'seed-rev-09-b',
    productId: 'mochi-flat-09',
    productName: 'Choco Marshmallow Penny Loafers',
    orderId: 'seed-ord-09b',
    orderNumber: 'MCS-2026-8818',
    customerName: 'Niken Laras',
    rating: 5,
    comment: 'Modelnya klasik rapi tapi nggak kaku kayak loafer kulit biasa. Size 38 pas dan nggak sakit di punggung kaki.',
    photoUrl: '/shoes/mochi-flat-09.jpg',
    size: 38,
    fitFeedback: 'Pas di Kaki',
    featuredInGallery: false,
    isApproved: true,
    createdAt: '2026-11-06T16:00:00.000Z',
  },
  {
    id: 'seed-rev-10-a',
    productId: 'mochi-flat-10',
    productName: 'Vanilla Cream Bow Loafers',
    orderId: 'seed-ord-10a',
    orderNumber: 'MCS-2026-8819',
    customerName: 'Gita Amelia',
    rating: 5,
    comment: 'Pita simpulnya bikin loafer terlihat lebih feminin. Bantalan tumit velvet-nya bikin jalan jauh tetap adem.',
    photoUrl: '/shoes/mochi-flat-10.jpg',
    size: 37,
    fitFeedback: 'Pas di Kaki',
    featuredInGallery: false,
    isApproved: true,
    createdAt: '2026-11-15T11:30:00.000Z',
  },
  {
    id: 'seed-rev-10-b',
    productId: 'mochi-flat-10',
    productName: 'Vanilla Cream Bow Loafers',
    orderId: 'seed-ord-10b',
    orderNumber: 'MCS-2026-8820',
    customerName: 'Putri Melati',
    rating: 5,
    comment: 'Ringan banget buat dibawa traveling. Kalau tanpa kaus kaki terasa sedikit lega di saya, enak ditambah heel pad tipis.',
    photoUrl: '/shoes/mochi-flat-10.jpg',
    size: 40,
    fitFeedback: 'Agak Longgar',
    featuredInGallery: false,
    isApproved: true,
    createdAt: '2026-11-05T13:45:00.000Z',
  },
  {
    id: 'seed-rev-11-a',
    productId: 'mochi-flat-11',
    productName: 'Taro Velvet Cloud Slip-on',
    orderId: 'seed-ord-11a',
    orderNumber: 'MCS-2026-8821',
    customerName: 'Yuni Kartika',
    rating: 5,
    comment: 'Tinggal slup langsung jalan! Quilting taro-nya lembut banget di punggung kaki dan sol karetnya nggak licin.',
    photoUrl: reviewSliponImg,
    size: 38,
    fitFeedback: 'Pas di Kaki',
    featuredInGallery: true,
    isApproved: true,
    createdAt: '2026-11-23T08:40:00.000Z',
  },
  {
    id: 'seed-rev-11-b',
    productId: 'mochi-flat-11',
    productName: 'Taro Velvet Cloud Slip-on',
    orderId: 'seed-ord-11b',
    orderNumber: 'MCS-2026-8822',
    customerName: 'Citra Kirana',
    rating: 5,
    comment: 'Belikan buat ibu ukuran 41 dan langsung dipakai jalan pagi karena empuk dan ringan sekali.',
    photoUrl: '/shoes/mochi-flat-11.jpg',
    size: 41,
    fitFeedback: 'Pas di Kaki',
    featuredInGallery: false,
    isApproved: true,
    createdAt: '2026-11-04T09:20:00.000Z',
  },
  {
    id: 'seed-rev-12-a',
    productId: 'mochi-flat-12',
    productName: 'Cotton Candy Pastel Loafers',
    orderId: 'seed-ord-12a',
    orderNumber: 'MCS-2026-8823',
    customerName: 'Elsa Veronica',
    rating: 5,
    comment: 'Perpaduan pastel pink & biru lembutnya lucu banget! Sudah dipakai ngajar di kelas seharian kaki tetap nyaman.',
    photoUrl: '/shoes/mochi-flat-12.jpg',
    size: 36,
    fitFeedback: 'Pas di Kaki',
    featuredInGallery: false,
    isApproved: true,
    createdAt: '2026-11-18T17:25:00.000Z',
  },
  {
    id: 'seed-rev-12-b',
    productId: 'mochi-flat-12',
    productName: 'Cotton Candy Pastel Loafers',
    orderId: 'seed-ord-12b',
    orderNumber: 'MCS-2026-8824',
    customerName: 'Nabila Hasanah',
    rating: 5,
    comment: 'Bahan suede microfiber-nya halus dan jahitannya rapi. Size 39 sesuai panduan insole 24.5 cm.',
    photoUrl: '/shoes/mochi-flat-12.jpg',
    size: 39,
    fitFeedback: 'Pas di Kaki',
    featuredInGallery: false,
    isApproved: true,
    createdAt: '2026-11-03T15:15:00.000Z',
  },
];

export async function seedReviewsIfEmpty(products: Product[] = []): Promise<void> {
  const reviewsCol = collection(db, 'reviews');
  try {
    const seededFlag =
      typeof window !== 'undefined' ? localStorage.getItem('mochi_reviews_seeded_v1') : null;
    if (seededFlag) return;

    let resolvedProducts = products;
    if (resolvedProducts.length === 0) {
      const prodsSnap = await getDocs(collection(db, 'products'));
      resolvedProducts = prodsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
    }

    const snapshot = await getDocs(reviewsCol);
    const existingProductIds = new Set<string>();
    const existingProductNames = new Set<string>();
    const existingDocIds = new Set<string>();

    snapshot.docs.forEach((d) => {
      existingDocIds.add(d.id);
      const data = d.data() as Partial<ProductReview>;
      if (data.productId) existingProductIds.add(data.productId);
      if (data.productName) existingProductNames.add(data.productName.toLowerCase());
    });

    const batch = writeBatch(db);
    let pendingWrites = 0;

    for (const seed of INITIAL_SEED_REVIEWS) {
      const matchedProd =
        resolvedProducts.find((p) => p.id === seed.productId) ||
        resolvedProducts.find((p) => p.name.toLowerCase() === seed.productName.toLowerCase());
      const resolvedProductId = matchedProd ? matchedProd.id : seed.productId;
      const resolvedProductName = matchedProd ? matchedProd.name : seed.productName;

      const alreadyHasProductReview =
        existingProductIds.has(resolvedProductId) ||
        existingProductNames.has(resolvedProductName.toLowerCase());

      if (!alreadyHasProductReview && !existingDocIds.has(seed.id)) {
        const revRef = doc(db, 'reviews', seed.id);
        batch.set(revRef, {
          ...seed,
          productId: resolvedProductId,
          productName: resolvedProductName,
        });
        pendingWrites++;
      }
    }

    if (pendingWrites > 0) {
      await batch.commit();
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('mochi_reviews_seeded_v1', '1');
    }
  } catch (error) {
    console.warn('Reviews seeding note:', error);
  }
}

export function subscribeToReviews(callback: (reviews: ProductReview[]) => void) {
  const reviewsCol = collection(db, 'reviews');
  return onSnapshot(
    reviewsCol,
    (snapshot) => {
      const seededFlag =
        typeof window !== 'undefined' ? localStorage.getItem('mochi_reviews_seeded_v1') : null;
      if (snapshot.empty && !seededFlag) {
        callback(INITIAL_SEED_REVIEWS);
        return;
      }
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ProductReview));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(list);
    },
    (error) => {
      console.warn('Reviews subscription note:', error);
      callback(INITIAL_SEED_REVIEWS);
    }
  );
}

export async function addCustomerReview(
  data: Omit<ProductReview, 'id' | 'createdAt' | 'isApproved'>
): Promise<string> {
  const now = new Date().toISOString();
  const rRef = doc(collection(db, 'reviews'));
  try {
    const payload: Record<string, any> = {
      ...data,
      id: rRef.id,
      featuredInGallery: Boolean(data.featuredInGallery),
      isApproved: true,
      createdAt: now,
    };
    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined) delete payload[k];
    });
    await setDoc(rRef, payload);
    return rRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'reviews');
    throw error;
  }
}

export async function moderateReview(reviewId: string, isApproved: boolean): Promise<void> {
  const rRef = doc(db, 'reviews', reviewId);
  try {
    await updateDoc(rRef, { isApproved });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `reviews/${reviewId}`);
    throw error;
  }
}

export async function toggleReviewFeatured(reviewId: string, featuredInGallery: boolean): Promise<void> {
  const rRef = doc(db, 'reviews', reviewId);
  try {
    await updateDoc(rRef, { featuredInGallery });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `reviews/${reviewId}`);
    throw error;
  }
}

export async function deleteReview(reviewId: string): Promise<void> {
  const rRef = doc(db, 'reviews', reviewId);
  try {
    await deleteDoc(rRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `reviews/${reviewId}`);
    throw error;
  }
}

// ==========================================
// 4. RETUR & TUKAR UKURAN (RETURN / EXCHANGE)
// ==========================================
export function subscribeToReturns(callback: (returns: OrderReturn[]) => void) {
  const returnsCol = collection(db, 'returns');
  return onSnapshot(
    returnsCol,
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as OrderReturn));
      callback(list);
    },
    (error) => {
      console.warn('Returns subscription note:', error);
      callback([]);
    }
  );
}

export async function createOrderReturn(
  data: Omit<OrderReturn, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'stockRestored'>
): Promise<string> {
  const now = new Date().toISOString();
  const retRef = doc(collection(db, 'returns'));
  try {
    await setDoc(retRef, {
      ...data,
      id: retRef.id,
      status: 'Menunggu Pemeriksaan',
      stockRestored: false,
      createdAt: now,
      updatedAt: now,
    });
    return retRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'returns');
    throw error;
  }
}

export async function updateReturnStatusAndRestoreStock(
  returnItem: OrderReturn,
  newStatus: OrderReturn['status'],
  adminNotes?: string,
  actor: string = 'Admin Retur'
): Promise<void> {
  const now = new Date().toISOString();
  const retRef = doc(db, 'returns', returnItem.id);

  // User confirmed constraint: "Hanya setelah barang retur diterima dan disetujui admin"
  const shouldRestoreStock =
    newStatus === 'Barang Diterima & Selesai' && !returnItem.stockRestored;

  if (shouldRestoreStock) {
    await runTransaction(db, async (transaction) => {
      for (const item of returnItem.items) {
        const prodRef = doc(db, 'products', item.productId);
        const prodSnap = await transaction.get(prodRef);
        if (prodSnap.exists()) {
          const prodData = prodSnap.data() as Product;
          const currentSizeStock = getProductSizeStock(prodData);
          const currentSizeQty = Number(currentSizeStock[item.size]) || 0;
          const newSizeQty = currentSizeQty + item.quantity;
          const updatedSizeStock = { ...currentSizeStock, [item.size]: newSizeQty };
          const newTotalStock = calculateTotalFromSizeStock(updatedSizeStock);

          transaction.update(prodRef, {
            sizeStock: updatedSizeStock,
            stock: newTotalStock,
            updatedAt: now,
          });

          const mutRef = doc(collection(db, 'stock_mutations'));
          transaction.set(mutRef, {
            id: mutRef.id,
            productId: item.productId,
            productName: item.name,
            size: item.size,
            orderNumber: returnItem.orderNumber,
            type: 'IN',
            quantity: item.quantity,
            notes: `[Retur Diterima] Barang fisik diterima & disetujui admin untuk pesanan #${returnItem.orderNumber} (Size ${item.size} +${item.quantity})`,
            previousStock: prodData.stock || 0,
            newStock: newTotalStock,
            timestamp: now,
            actor,
            source: 'WEBSTORE',
          });
        }
      }

      transaction.update(retRef, {
        status: newStatus,
        stockRestored: true,
        adminNotes: adminNotes || returnItem.adminNotes || 'Barang fisik telah diperiksa & stok berhasil dipulihkan.',
        updatedAt: now,
      });
    });
  } else {
    const payload: Record<string, any> = {
      status: newStatus,
      updatedAt: now,
    };
    if (adminNotes !== undefined) payload.adminNotes = adminNotes;
    await updateDoc(retRef, payload);
  }
}

// ==========================================
// 5. GALERI LOOKBOOK GAYA (CURATED STYLING)
// ==========================================
export const DEFAULT_LOOKBOOK_ITEMS: Omit<LookbookItem, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Smart Office Beige & Peach Ribbon',
    occasion: 'Kantor & Formal',
    imageUrl: lookbookOfficeImg,
    productId: 'mochi-flat-01',
    productName: 'Mochi Peach Puff Ribbon',
    wornSize: 38,
    fitNote: 'Pas di kaki standar (Panjang kaki 24.0 cm)',
    stylingTip: 'Padukan celana ankle beige dengan Mochi Peach Puff Ribbon untuk tampilan rapi yang tetap empuk berdiri seharian.',
    isActive: true,
  },
  {
    title: 'Weekend Cafe Denim & Butter Flats',
    occasion: 'Santai & Hangout',
    imageUrl: lookbookCasualImg,
    productId: 'mochi-flat-02',
    productName: 'Daisy Cloud Butter Flats',
    wornSize: 37,
    fitNote: 'Pas di kaki ramping (Panjang kaki 23.4 cm)',
    stylingTip: 'Rok midi denim kasual makin manis dipasangkan dengan siluet ballerina warna vanilla butter yang ringan.',
    isActive: true,
  },
  {
    title: 'Campus Preppy Mary Jane Pearl',
    occasion: 'Kuliah & Harian',
    imageUrl: lookbookCampusImg,
    productId: 'mochi-flat-03',
    productName: 'Strawberry Pearl Mary Jane',
    wornSize: 39,
    fitNote: 'Naik 1 size jika dipakai bersama kaus kaki tipis',
    stylingTip: 'Tampil feminin ala mahasiswi dengan rok lipit krem, kaus kaki sheer, dan strap mutiara Mary Jane yang aman anti-lepas.',
    isActive: true,
  },
  {
    title: 'Golden Hour Silk & Sakura Pointed',
    occasion: 'Acara Spesial',
    imageUrl: lookbookEveningImg,
    productId: 'mochi-flat-05',
    productName: 'Sakura Blossom Pointed',
    wornSize: 38,
    fitNote: 'Ujung pointed lega, pas di ukuran normal',
    stylingTip: 'Cocok untuk kondangan atau makan malam resmi tanpa pegal hak tinggi berkat bantalan CloudMochi 8mm.',
    isActive: true,
  },
];

export function subscribeToLookbook(callback: (items: LookbookItem[]) => void) {
  const lbCol = collection(db, 'lookbook_items');
  return onSnapshot(
    lbCol,
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as LookbookItem));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(list);
    },
    (error) => {
      console.warn('Lookbook subscription note:', error);
      const now = new Date().toISOString();
      callback(
        DEFAULT_LOOKBOOK_ITEMS.map((item, idx) => ({
          ...item,
          id: `default-lb-${idx + 1}`,
          createdAt: now,
          updatedAt: now,
        }))
      );
    }
  );
}

export async function seedLookbookIfEmpty(products: Product[] = []): Promise<void> {
  const lbCol = collection(db, 'lookbook_items');
  try {
    const seededFlag = typeof window !== 'undefined' ? localStorage.getItem('mochi_lookbook_seeded_v1') : null;
    if (seededFlag) return;

    const snapshot = await getDocs(lbCol);
    if (!snapshot.empty) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('mochi_lookbook_seeded_v1', '1');
      }
      return;
    }

    const now = new Date().toISOString();
    for (let i = 0; i < DEFAULT_LOOKBOOK_ITEMS.length; i++) {
      const item = DEFAULT_LOOKBOOK_ITEMS[i];
      const matchedProd =
        products.find((p) => p.id === item.productId) ||
        products.find((p) => p.name.toLowerCase() === item.productName.toLowerCase());
      const docId = `lookbook-${String(i + 1).padStart(2, '0')}`;
      const lbRef = doc(db, 'lookbook_items', docId);
      await setDoc(lbRef, {
        ...item,
        productId: matchedProd ? matchedProd.id : item.productId,
        productName: matchedProd ? matchedProd.name : item.productName,
        id: docId,
        createdAt: now,
        updatedAt: now,
      });
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('mochi_lookbook_seeded_v1', '1');
    }
  } catch (error) {
    console.warn('Lookbook seeding note:', error);
  }
}

export async function addLookbookItem(
  data: Omit<LookbookItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const now = new Date().toISOString();
  const lbRef = doc(collection(db, 'lookbook_items'));
  try {
    await setDoc(lbRef, {
      ...data,
      id: lbRef.id,
      createdAt: now,
      updatedAt: now,
    });
    return lbRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'lookbook_items');
    throw error;
  }
}

export async function updateLookbookItem(
  id: string,
  data: Partial<Omit<LookbookItem, 'id' | 'createdAt'>>
): Promise<void> {
  const now = new Date().toISOString();
  const lbRef = doc(db, 'lookbook_items', id);
  try {
    await updateDoc(lbRef, {
      ...data,
      updatedAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `lookbook_items/${id}`);
    throw error;
  }
}

export async function deleteLookbookItem(id: string): Promise<void> {
  const lbRef = doc(db, 'lookbook_items', id);
  try {
    await deleteDoc(lbRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `lookbook_items/${id}`);
    throw error;
  }
}

// ==========================================
// 6. BACKUP & PEMELIHARAAN DATABASE (JSON EXPORT)
// ==========================================
export async function exportDatabaseBackup(): Promise<string> {
  const [prodsSnap, ordersSnap, settingsSnap, vouchersSnap, reviewsSnap, returnsSnap, mutationsSnap, lookbookSnap] =
    await Promise.all([
      getDocs(collection(db, 'products')),
      getDocs(collection(db, 'orders')),
      getDocs(collection(db, 'settings')),
      getDocs(collection(db, 'vouchers')),
      getDocs(collection(db, 'reviews')),
      getDocs(collection(db, 'returns')),
      getDocs(collection(db, 'stock_mutations')),
      getDocs(collection(db, 'lookbook_items')),
    ]);

  const backupData = {
    backupDate: new Date().toISOString(),
    storeName: 'Mochi Steps',
    stats: {
      productsCount: prodsSnap.size,
      ordersCount: ordersSnap.size,
      vouchersCount: vouchersSnap.size,
      reviewsCount: reviewsSnap.size,
      returnsCount: returnsSnap.size,
      mutationsCount: mutationsSnap.size,
      lookbookCount: lookbookSnap.size,
    },
    products: prodsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    orders: ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    settings: settingsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    vouchers: vouchersSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    reviews: reviewsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    returns: returnsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    mutations: mutationsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    lookbook_items: lookbookSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
  };

  return JSON.stringify(backupData, null, 2);
}
