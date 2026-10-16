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
import { Product, Order, StockMutation, OrderStatus, PaymentStatus, PaymentMethod } from '../types';

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
        products.push({
          id: docSnap.id,
          name: data.name || '',
          category: data.category || 'Flat Shoes Klasik',
          price: Number(data.price) || 0,
          costPrice: data.costPrice !== undefined ? Number(data.costPrice) : Math.round((Number(data.price) || 199000) * 0.5),
          stock: Number(data.stock) || 0,
          sizes: data.sizes || [36, 37, 38, 39, 40, 41],
          description: data.description || '',
          imageUrl: data.imageUrl || '',
          color: data.color || 'Pink Pastel',
          badge: data.badge || undefined,
          rating: Number(data.rating) || 4.9,
          reviewCount: Number(data.reviewCount) || 50,
          material: data.material || 'Microfiber Leather',
          heelHeight: data.heelHeight || '1 cm Flat',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });
      // Sort alphabetically or by id
      products.sort((a, b) => a.id.localeCompare(b.id));
      onData(products);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'products');
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
          createdAt: d.createdAt || new Date().toISOString(),
          updatedAt: d.updatedAt || new Date().toISOString(),
        });
      });
      // Sort orders descending by createdAt
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(orders);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'orders');
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
      handleFirestoreError(error, OperationType.GET, 'stock_mutations');
      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  );
}

// Create new customer order with atomic stock update & mutation logging
export async function createCustomerOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const now = new Date().toISOString();
  const orderDocRef = doc(collection(db, 'orders'));

  try {
    await runTransaction(db, async (transaction) => {
      // 1. Verify and read all product stocks first
      const productDocs: { ref: any; currentStock: number; id: string; name: string; qty: number }[] = [];

      for (const item of orderData.items) {
        const pRef = doc(db, 'products', item.productId);
        const pSnap = await transaction.get(pRef);
        if (!pSnap.exists()) {
          throw new Error(`Produk "${item.name}" tidak ditemukan di database.`);
        }
        const currentStock = Number(pSnap.data().stock) || 0;
        if (currentStock < item.quantity) {
          throw new Error(`Maaf, stok sepatu "${item.name}" tersisa ${currentStock} pasang, tidak mencukupi untuk ${item.quantity} pasang.`);
        }
        productDocs.push({
          ref: pRef,
          currentStock,
          id: item.productId,
          name: item.name,
          qty: item.quantity,
        });
      }

      // 2. Decrement stock for each product and record mutation
      for (const p of productDocs) {
        const newStock = p.currentStock - p.qty;
        transaction.update(p.ref, {
          stock: newStock,
          updatedAt: now,
        });

        const mutationRef = doc(collection(db, 'stock_mutations'));
        transaction.set(mutationRef, {
          id: mutationRef.id,
          productId: p.id,
          productName: p.name,
          type: 'OUT',
          quantity: p.qty,
          notes: `Pesanan Baru #${orderData.orderNumber} (${orderData.customerName})`,
          previousStock: p.currentStock,
          newStock,
          timestamp: now,
          actor: 'Sistem Checkout Pelanggan',
        });
      }

      // 3. Write Order document
      transaction.set(orderDocRef, {
        ...orderData,
        id: orderDocRef.id,
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
// Approve payment: marks as Lunas and Disetujui
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
  }
}

// Reject payment: marks as Ditolak and restores stock atomically
export async function rejectPayment(order: Order, reason: string = 'Bukti/Pembayaran tidak valid'): Promise<void> {
  const now = new Date().toISOString();
  const orderRef = doc(db, 'orders', order.id);

  try {
    await runTransaction(db, async (transaction) => {
      // 1. ALL READS FIRST (Firestore rule: all reads before any writes)
      const productDocs: { ref: any; currentStock: number; restoredStock: number; item: any }[] = [];
      const itemsList = order.items || [];

      for (const item of itemsList) {
        if (!item?.productId) continue;
        const pRef = doc(db, 'products', item.productId);
        const pSnap = await transaction.get(pRef);
        if (pSnap.exists()) {
          const currentStock = Number(pSnap.data().stock) || 0;
          const restoredStock = currentStock + (Number(item.quantity) || 1);
          productDocs.push({ ref: pRef, currentStock, restoredStock, item });
        }
      }

      // Check order doc exists
      const oSnap = await transaction.get(orderRef);

      // 2. ALL WRITES AFTER ALL READS ARE COMPLETED
      for (const p of productDocs) {
        transaction.update(p.ref, {
          stock: p.restoredStock,
          updatedAt: now,
        });

        const mutationRef = doc(collection(db, 'stock_mutations'));
        transaction.set(mutationRef, {
          id: mutationRef.id,
          productId: p.item.productId,
          productName: p.item.name || 'Flatshoes Mochi Steps',
          type: 'IN',
          quantity: p.item.quantity || 1,
          notes: `Restorasi Stok: Pembatalan/Tolak #${order.orderNumber} (${reason})`,
          previousStock: p.currentStock,
          newStock: p.restoredStock,
          timestamp: now,
          actor: 'Admin Approval (Reject)',
        });
      }

      const noteSuffix = `Ditolak: ${reason}`;
      const updatedNotes = order.specialNotes ? `${order.specialNotes} | ${noteSuffix}` : noteSuffix;

      if (oSnap.exists()) {
        transaction.update(orderRef, {
          paymentStatus: 'Ditolak',
          orderStatus: 'Ditolak',
          specialNotes: updatedNotes,
          updatedAt: now,
        });
      } else {
        transaction.set(
          orderRef,
          {
            ...order,
            paymentStatus: 'Ditolak',
            orderStatus: 'Ditolak',
            specialNotes: updatedNotes,
            updatedAt: now,
          },
          { merge: true }
        );
      }
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${order.id}`);
  }
}

// Update order status (e.g. to 'Dikirim' or 'Selesai')
export async function updateOrderStatus(orderId: string, orderStatus: OrderStatus): Promise<void> {
  const now = new Date().toISOString();
  const orderRef = doc(db, 'orders', orderId);
  try {
    await updateDoc(orderRef, {
      orderStatus,
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
      const productDocs: { ref: any; currentStock: number; id: string; name: string; qty: number }[] = [];

      for (const item of input.items) {
        const pRef = doc(db, 'products', item.productId);
        const pSnap = await transaction.get(pRef);
        if (!pSnap.exists()) {
          throw new Error(`Produk "${item.name}" tidak ditemukan di database.`);
        }
        const currentStock = Number(pSnap.data().stock) || 0;
        if (currentStock < item.quantity) {
          throw new Error(`Stok produk "${item.name}" tersisa ${currentStock} pasang, tidak cukup untuk pembelian ${item.quantity} pasang.`);
        }
        productDocs.push({
          ref: pRef,
          currentStock,
          id: item.productId,
          name: item.name,
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

      // 3. Decrement stock for each product and record OUT mutation
      for (const p of productDocs) {
        const newStock = p.currentStock - p.qty;
        transaction.update(p.ref, {
          stock: newStock,
          updatedAt: now,
        });

        const mutationRef = doc(collection(db, 'stock_mutations'));
        transaction.set(mutationRef, {
          id: mutationRef.id,
          productId: p.id,
          productName: p.name,
          type: 'OUT',
          quantity: p.qty,
          notes: `Transaksi Kasir POS #${orderNumber} (${customerName})`,
          previousStock: p.currentStock,
          newStock,
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

// Update Order Tracking Details & Status
export async function updateOrderTracking(
  orderId: string,
  trackingNumber: string,
  status?: OrderStatus
): Promise<void> {
  const now = new Date().toISOString();
  const orderRef = doc(db, 'orders', orderId);

  const updatePayload: Record<string, any> = {
    trackingNumber: trackingNumber.trim(),
    updatedAt: now,
  };

  if (status) {
    updatePayload.orderStatus = status;
  }

  try {
    await updateDoc(orderRef, updatePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}/tracking`);
    throw error;
  }
}

// Update Order Custom Status and optionally Payment Status
export async function updateOrderCustomStatus(
  orderId: string,
  orderStatus: OrderStatus,
  paymentStatus?: PaymentStatus
): Promise<void> {
  const now = new Date().toISOString();
  const orderRef = doc(db, 'orders', orderId);

  const payload: Record<string, any> = {
    orderStatus,
    updatedAt: now,
  };

  if (paymentStatus) {
    payload.paymentStatus = paymentStatus;
  }

  try {
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
