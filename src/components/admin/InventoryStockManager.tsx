import React, { useState, useMemo } from 'react';
import {
  Boxes,
  ClipboardCheck,
  History,
  Package,
  Plus,
  Minus,
  RefreshCw,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { Product, StockMutation, StockMutationType } from '../../types';
import {
  recordManualStockMutation,
  recordStockOpname,
  restockProduct,
  updateProductMinStock,
} from '../../lib/firestoreService';
import { FlatshoeImage } from '../FlatshoeImage';

interface InventoryStockManagerProps {
  products: Product[];
  mutations: StockMutation[];
  adminEmail: string;
}

export const InventoryStockManager: React.FC<InventoryStockManagerProps> = ({
  products,
  mutations,
  adminEmail,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'management' | 'opname' | 'history' | 'products'
  >('management');

  // Quick Action Form State (Manajemen Stok)
  const [actionType, setActionType] = useState<'IN' | 'OUT'>('IN');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(10);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Min Stock Settings State
  const [editingMinStockProd, setEditingMinStockProd] = useState<Product | null>(null);
  const [newMinStockVal, setNewMinStockVal] = useState<number>(5);

  // Opname Tab State
  const [opnameInputs, setOpnameInputs] = useState<Record<string, { physical: number; notes: string }>>({});
  const [opnameFilterCategory, setOpnameFilterCategory] = useState<string>('all');
  const [opnameSearch, setOpnameSearch] = useState<string>('');
  const [isSavingOpname, setIsSavingOpname] = useState<string | null>(null);

  // History Tab Filter State
  const [historySearch, setHistorySearch] = useState<string>('');
  const [historyTypeFilter, setHistoryTypeFilter] = useState<string>('all');

  // Products Tab Filter State
  const [productSearch, setProductSearch] = useState<string>('');
  const [productStockStatusFilter, setProductStockStatusFilter] = useState<'all' | 'safe' | 'low' | 'out'>('all');

  // Selected product object
  const currentProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) || products[0],
    [products, selectedProductId]
  );

  // Summary Metrics
  const metrics = useMemo(() => {
    let totalStock = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach((p) => {
      const stock = p.stock || 0;
      const min = p.minStock !== undefined ? p.minStock : 5;
      totalStock += stock;
      if (stock === 0) {
        outOfStockCount++;
      } else if (stock <= min) {
        lowStockCount++;
      }
    });

    return {
      totalStock,
      lowStockCount,
      outOfStockCount,
      totalSKU: products.length,
      totalMutations: mutations.length,
    };
  }, [products, mutations]);

  // Handle Quick Stock Mutation (In / Out)
  const handleQuickMutation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || quantity <= 0) {
      setFeedbackMessage({ type: 'error', text: 'Pilih produk dan masukkan jumlah lebih dari 0.' });
      return;
    }

    if (actionType === 'OUT' && currentProduct && currentProduct.stock < quantity) {
      setFeedbackMessage({
        type: 'error',
        text: `Stok saat ini hanya ${currentProduct.stock} pasang, tidak dapat mengurangi ${quantity} pasang.`,
      });
      return;
    }

    setIsSubmitting(true);
    setFeedbackMessage(null);

    try {
      if (actionType === 'IN') {
        await restockProduct(
          selectedProductId,
          quantity,
          notes.trim() || 'Restock Workshop Pengrajin Solo',
          `Admin (${adminEmail})`
        );
      } else {
        await recordManualStockMutation(
          selectedProductId,
          'OUT',
          quantity,
          notes.trim() || 'Pengurangan / Penyesuaian Stok Gudang',
          `Admin (${adminEmail})`
        );
      }

      setFeedbackMessage({
        type: 'success',
        text: `Berhasil ${actionType === 'IN' ? 'menambah' : 'mengurangi'} ${quantity} pasang stok "${currentProduct?.name}".`,
      });
      setNotes('');
    } catch (err: any) {
      console.error(err);
      setFeedbackMessage({ type: 'error', text: err.message || 'Gagal memperbarui stok.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Save Min Stock
  const handleSaveMinStock = async () => {
    if (!editingMinStockProd) return;
    try {
      await updateProductMinStock(editingMinStockProd.id, newMinStockVal);
      setEditingMinStockProd(null);
      setFeedbackMessage({ type: 'success', text: `Batas minimum stok diperbarui menjadi ${newMinStockVal} pasang.` });
    } catch (err) {
      console.error(err);
      setFeedbackMessage({ type: 'error', text: 'Gagal memperbarui batas minimum stok.' });
    }
  };

  // Handle Submit Opname Single Item
  const handleSaveOpnameItem = async (prod: Product) => {
    const input = opnameInputs[prod.id] || { physical: prod.stock, notes: '' };
    setIsSavingOpname(prod.id);
    try {
      const res = await recordStockOpname({
        productId: prod.id,
        physicalStock: input.physical,
        notes: input.notes || 'Hasil Opname Fisik Rutin',
        actor: `Admin (${adminEmail})`,
      });
      setFeedbackMessage({
        type: 'success',
        text: `Opname "${prod.name}" berhasil disimpan. Stok fisik baru: ${res.newStock} pasang (Selisih: ${res.diff >= 0 ? '+' : ''}${res.diff}).`,
      });
    } catch (err: any) {
      console.error(err);
      setFeedbackMessage({ type: 'error', text: err.message || 'Gagal menyimpan opname.' });
    } finally {
      setIsSavingOpname(null);
    }
  };

  // Filtered History
  const filteredMutations = useMemo(() => {
    return mutations.filter((m) => {
      const matchesSearch =
        m.productName.toLowerCase().includes(historySearch.toLowerCase()) ||
        m.actor.toLowerCase().includes(historySearch.toLowerCase()) ||
        (m.notes && m.notes.toLowerCase().includes(historySearch.toLowerCase()));

      const matchesType =
        historyTypeFilter === 'all' || m.type === historyTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [mutations, historySearch, historyTypeFilter]);

  // Filtered Products for Status Tab
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.color.toLowerCase().includes(productSearch.toLowerCase());

      const min = p.minStock !== undefined ? p.minStock : 5;
      let matchesStatus = true;
      if (productStockStatusFilter === 'safe') {
        matchesStatus = p.stock > min;
      } else if (productStockStatusFilter === 'low') {
        matchesStatus = p.stock > 0 && p.stock <= min;
      } else if (productStockStatusFilter === 'out') {
        matchesStatus = p.stock === 0;
      }

      return matchesSearch && matchesStatus;
    });
  }, [products, productSearch, productStockStatusFilter]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-pink-50 via-white to-pink-50 p-5 rounded-3xl border border-pink-200/80 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#d65b7d] to-[#be185d] text-white flex items-center justify-center shadow-xs">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-heading font-extrabold text-gray-900 flex items-center gap-2">
              <span>Inventory & Stok Terpadu</span>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-pink-100 text-[#be185d] border border-pink-200">
                Live Mutasi
              </span>
            </h2>
            <p className="text-xs text-gray-500">
              Pengelolaan stok fisik toko, opname berkala, audit log mutasi (POS & Webstore), dan pencegahan stok negatif.
            </p>
          </div>
        </div>

        {/* 4 Quick Stat Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 shadow-2xs">
            <span className="text-gray-400 text-[10px] block">Total Fisik</span>
            <span className="font-extrabold text-gray-900 font-mono">{metrics.totalStock} Pasang</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white border border-amber-200 shadow-2xs">
            <span className="text-amber-500 text-[10px] block">Stok Menipis</span>
            <span className="font-extrabold text-amber-700 font-mono">{metrics.lowStockCount} Model</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white border border-red-200 shadow-2xs">
            <span className="text-red-500 text-[10px] block">Stok Habis</span>
            <span className="font-extrabold text-red-700 font-mono">{metrics.outOfStockCount} Model</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white border border-pink-200 shadow-2xs">
            <span className="text-[#be185d] text-[10px] block">Total Mutasi</span>
            <span className="font-extrabold text-[#be185d] font-mono">{metrics.totalMutations} Log</span>
          </div>
        </div>
      </div>

      {/* Global Feedback Alert */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-2xl flex items-center justify-between text-xs font-semibold ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-gray-400 hover:text-gray-700 text-xs cursor-pointer font-bold px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* 4 Tabs Navigation */}
      <div className="flex space-x-1 sm:space-x-2 border-b border-pink-100 pb-2 overflow-x-auto">
        {[
          { id: 'management', label: '1. Manajemen Stok', icon: Boxes, desc: 'Restock & Koreksi' },
          { id: 'opname', label: '2. Opname Stok', icon: ClipboardCheck, desc: 'Fisik vs Sistem' },
          { id: 'history', label: '3. Riwayat Mutasi', icon: History, count: mutations.length, desc: 'Audit Log' },
          { id: 'products', label: '4. Status Produk', icon: Package, count: products.length, desc: 'Katalog Stok' },
        ].map((tab) => {
          const active = activeSubTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                active
                  ? 'bg-[#be185d] text-white shadow-xs'
                  : 'bg-white hover:bg-pink-50 text-gray-700 border border-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    active ? 'bg-white/20 text-white' : 'bg-pink-100 text-[#be185d]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: MANAJEMEN STOK */}
      {activeSubTab === 'management' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Quick In/Out Mutation Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-pink-100 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-heading font-extrabold text-gray-900 text-sm">
                  Form Mutasi Stok Cepat
                </h3>
                <p className="text-xs text-gray-500">
                  Catat penambahan barang masuk dari pengrajin Solo atau pengurangan fisik gudang.
                </p>
              </div>

              {/* Action Type Toggle */}
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActionType('IN')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    actionType === 'IN'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>Stok Masuk (IN)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActionType('OUT')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    actionType === 'OUT'
                      ? 'bg-red-600 text-white shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Stok Keluar (OUT)</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleQuickMutation} className="space-y-4">
              {/* Product Select */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Pilih Produk Flatshoes
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 bg-gray-50/50 text-xs font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-300 transition-all"
                >
                  {products.map((p) => {
                    const min = p.minStock !== undefined ? p.minStock : 5;
                    return (
                      <option key={p.id} value={p.id}>
                        {p.name} — Stok Sekarang: {p.stock} pasang {p.stock <= min ? '(⚠️ Menipis)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Selected Product Card Preview */}
              {currentProduct && (
                <div className="p-3.5 rounded-2xl bg-pink-50/50 border border-pink-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white shrink-0 border border-pink-200">
                      <FlatshoeImage
                        src={currentProduct.imageUrl}
                        alt={currentProduct.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-900">{currentProduct.name}</h4>
                      <p className="text-[11px] text-gray-500">
                        {currentProduct.category} • {currentProduct.color}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-gray-500 block">Stok Sistem Saat Ini</span>
                    <span
                      className={`font-mono font-extrabold text-sm ${
                        currentProduct.stock <= (currentProduct.minStock || 5)
                          ? 'text-amber-600'
                          : 'text-emerald-700'
                      }`}
                    >
                      {currentProduct.stock} Pasang
                    </span>
                  </div>
                </div>
              )}

              {/* Quantity and Presets */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Jumlah Pasang ({actionType === 'IN' ? 'Ditambahkan' : 'Dikurangkan'})
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max={actionType === 'OUT' ? currentProduct?.stock || 999 : 9999}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-32 px-3.5 py-2.5 rounded-2xl border border-gray-200 bg-white font-mono font-bold text-sm text-center focus:outline-hidden focus:ring-2 focus:ring-pink-300"
                  />
                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-1.5">
                    {[5, 10, 20, 50].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setQuantity(preset)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          quantity === preset
                            ? 'bg-pink-100 text-[#be185d] border-pink-300'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200'
                        }`}
                      >
                        +{preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Keterangan / Sumber Mutasi
                </label>
                <input
                  type="text"
                  placeholder={
                    actionType === 'IN'
                      ? 'Contoh: Restock Workshop Solo Batch 24'
                      : 'Contoh: Display toko / Retur cacat pengrajin'
                  }
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 bg-white text-xs focus:outline-hidden focus:ring-2 focus:ring-pink-300"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-2xl font-bold text-xs text-white shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  actionType === 'IN'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50`}
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : actionType === 'IN' ? (
                  <Plus className="w-4 h-4" />
                ) : (
                  <Minus className="w-4 h-4" />
                )}
                <span>
                  {actionType === 'IN' ? 'Simpan Penambahan Stok Masuk' : 'Simpan Pengurangan Stok Keluar'}
                </span>
              </button>
            </form>
          </div>

          {/* Right: Minimum Stock Alert Configuration */}
          <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-2xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sliders className="w-4 h-4 text-[#be185d]" />
                <h3 className="font-heading font-extrabold text-gray-900 text-sm">
                  Pengaturan Batas Stok Minimum
                </h3>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Tentukan batas alarm ketika stok sepatu menipis agar segera diorder ke pengrajin Solo.
              </p>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {products.map((p) => {
                  const min = p.minStock !== undefined ? p.minStock : 5;
                  const isLow = p.stock <= min;
                  return (
                    <div
                      key={p.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                        isLow
                          ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                          : 'bg-gray-50/60 border-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="overflow-hidden pr-2">
                        <div className="font-bold truncate">{p.name}</div>
                        <div className="text-[10px] text-gray-500">
                          Stok: <b className="font-mono">{p.stock}</b> • Min Alert: <b className="font-mono">{min}</b>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingMinStockProd(p);
                          setNewMinStockVal(min);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-white border border-gray-200 hover:border-pink-300 text-[11px] font-bold text-gray-700 transition-colors shrink-0 cursor-pointer shadow-2xs"
                      >
                        Ubah Min
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Edit Min Stock */}
            {editingMinStockProd && (
              <div className="p-3.5 bg-pink-50 rounded-2xl border border-pink-200 space-y-2 animate-fade-in">
                <div className="flex justify-between items-center text-xs font-bold text-gray-900">
                  <span>Atur Min: {editingMinStockProd.name}</span>
                  <button onClick={() => setEditingMinStockProd(null)} className="text-gray-400">✕</button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newMinStockVal}
                    onChange={(e) => setNewMinStockVal(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 px-2.5 py-1.5 rounded-xl border border-pink-300 bg-white font-mono font-bold text-xs"
                  />
                  <button
                    onClick={handleSaveMinStock}
                    className="flex-1 py-1.5 rounded-xl bg-[#be185d] text-white font-bold text-xs shadow-2xs cursor-pointer"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: OPNAME STOK */}
      {activeSubTab === 'opname' && (
        <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-heading font-extrabold text-gray-900 text-sm flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-[#be185d]" />
                <span>Stock Opname Fisik vs Sistem</span>
              </h3>
              <p className="text-xs text-gray-500">
                Hitung jumlah fisik riil di gudang / display. Sistem akan menghitung selisih dan membuat mutasi penyesuaian secara otomatis.
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Cari model sepatu..."
                value={opnameSearch}
                onChange={(e) => setOpnameSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-300"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-pink-50/60 text-gray-700 font-bold uppercase text-[10px] tracking-wider border-b border-pink-100">
                <tr>
                  <th className="py-3 px-3">Produk Sepatu</th>
                  <th className="py-3 px-3 text-center">Stok Sistem</th>
                  <th className="py-3 px-3 text-center">Stok Fisik Riil</th>
                  <th className="py-3 px-3 text-center">Selisih</th>
                  <th className="py-3 px-3">Catatan Opname</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products
                  .filter((p) => p.name.toLowerCase().includes(opnameSearch.toLowerCase()))
                  .map((p) => {
                    const currentInput = opnameInputs[p.id] || { physical: p.stock, notes: '' };
                    const diff = currentInput.physical - p.stock;
                    const isSaving = isSavingOpname === p.id;

                    return (
                      <tr key={p.id} className="hover:bg-pink-50/30 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                              <FlatshoeImage
                                src={p.imageUrl}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">{p.name}</div>
                              <div className="text-[10px] text-gray-500">{p.category}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-center font-mono font-bold text-gray-700">
                          {p.stock}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <input
                            type="number"
                            min="0"
                            value={currentInput.physical}
                            onChange={(e) => {
                              const val = Math.max(0, parseInt(e.target.value) || 0);
                              setOpnameInputs((prev) => ({
                                ...prev,
                                [p.id]: { ...currentInput, physical: val },
                              }));
                            }}
                            className="w-20 px-2 py-1.5 text-center font-mono font-extrabold rounded-xl border border-gray-300 focus:border-pink-500 focus:outline-hidden"
                          />
                        </td>

                        <td className="py-3 px-3 text-center font-mono font-extrabold">
                          {diff === 0 ? (
                            <span className="text-gray-400">0 (Sesuai)</span>
                          ) : diff > 0 ? (
                            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                              +{diff} Pasang
                            </span>
                          ) : (
                            <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                              {diff} Pasang
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <input
                            type="text"
                            placeholder="Catatan opname (opsional)"
                            value={currentInput.notes}
                            onChange={(e) => {
                              const noteVal = e.target.value;
                              setOpnameInputs((prev) => ({
                                ...prev,
                                [p.id]: { ...currentInput, notes: noteVal },
                              }));
                            }}
                            className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-hidden"
                          />
                        </td>

                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => handleSaveOpnameItem(p)}
                            className="px-3 py-1.5 rounded-xl bg-pink-100 hover:bg-[#be185d] text-[#be185d] hover:text-white font-bold text-xs transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                          >
                            {isSaving ? 'Menyimpan...' : 'Simpan Opname'}
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

      {/* TAB 3: RIWAYAT MUTASI LENGKAP */}
      {activeSubTab === 'history' && (
        <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-heading font-extrabold text-gray-900 text-sm flex items-center gap-2">
                <History className="w-5 h-5 text-[#be185d]" />
                <span>Log Audit Riwayat Mutasi Stok</span>
              </h3>
              <p className="text-xs text-gray-500">
                Pencatatan real-time perubahan stok dari Kasir POS, Webstore Online, Opname, dan Restock Pengrajin.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <input
                  type="text"
                  placeholder="Cari produk / keterangan..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-hidden"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              </div>

              <select
                value={historyTypeFilter}
                onChange={(e) => setHistoryTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-gray-50 border border-gray-200"
              >
                <option value="all">Semua Tipe</option>
                <option value="IN">Stok Masuk (IN)</option>
                <option value="OUT">Stok Keluar (OUT)</option>
                <option value="ADJUSTMENT">Penyesuaian (ADJ)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-pink-50/60 text-gray-700 font-bold uppercase text-[10px] tracking-wider border-b border-pink-100">
                <tr>
                  <th className="py-3 px-3">Waktu & Tanggal</th>
                  <th className="py-3 px-3">Produk</th>
                  <th className="py-3 px-3 text-center">Tipe Mutasi</th>
                  <th className="py-3 px-3 text-center">Jumlah</th>
                  <th className="py-3 px-3 text-center">Stok Awal → Akhir</th>
                  <th className="py-3 px-3">Keterangan / Sumber</th>
                  <th className="py-3 px-3">Aktor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMutations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-gray-400 text-xs">
                      Tidak ada riwayat mutasi stok yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredMutations.map((m) => (
                    <tr key={m.id} className="hover:bg-pink-50/30 transition-colors">
                      <td className="py-3 px-3 text-gray-500 font-mono text-[11px] whitespace-nowrap">
                        {new Date(m.timestamp).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3 px-3 font-bold text-gray-900">
                        {m.productName}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            m.type === 'IN'
                              ? 'bg-emerald-100 text-emerald-800'
                              : m.type === 'OUT'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {m.type === 'IN' ? '↓ MASUK' : m.type === 'OUT' ? '↑ KELUAR' : '⇄ PENYESUAIAN'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-extrabold text-sm">
                        {m.type === 'IN' ? `+${m.quantity}` : `-${m.quantity}`}
                      </td>

                      <td className="py-3 px-3 text-center font-mono text-gray-600">
                        <span>{m.previousStock}</span>
                        <span className="text-gray-400 mx-1.5">→</span>
                        <span className="font-bold text-gray-900">{m.newStock}</span>
                      </td>

                      <td className="py-3 px-3 text-gray-600 max-w-xs truncate" title={m.notes}>
                        {m.notes || '-'}
                      </td>

                      <td className="py-3 px-3 text-gray-500 text-[11px] whitespace-nowrap">
                        {m.actor || 'Admin'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: STATUS STOK PRODUK */}
      {activeSubTab === 'products' && (
        <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-heading font-extrabold text-gray-900 text-sm flex items-center gap-2">
                <Package className="w-5 h-5 text-[#be185d]" />
                <span>Katalog Status & Tingkat Ketersediaan Stok</span>
              </h3>
              <p className="text-xs text-gray-500">
                Peringatan otomatis stok menipis dan akses cepat penambahan inventaris per model.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-48 sm:w-56">
                <input
                  type="text"
                  placeholder="Cari model..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-hidden"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              </div>

              <select
                value={productStockStatusFilter}
                onChange={(e) => setProductStockStatusFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-gray-50 border border-gray-200"
              >
                <option value="all">Semua Status</option>
                <option value="safe">Stok Aman</option>
                <option value="low">Stok Menipis</option>
                <option value="out">Stok Habis</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((p) => {
              const min = p.minStock !== undefined ? p.minStock : 5;
              const isOut = p.stock === 0;
              const isLow = !isOut && p.stock <= min;

              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isOut
                      ? 'bg-red-50/40 border-red-200'
                      : isLow
                      ? 'bg-amber-50/40 border-amber-200'
                      : 'bg-white border-pink-100 hover:border-pink-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-white shrink-0 border border-pink-200">
                      <FlatshoeImage
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-xs text-gray-900 truncate">{p.name}</h4>
                      <p className="text-[10px] text-gray-500">{p.category}</p>
                      <span
                        className={`inline-block mt-1 px-2 py-0.2 rounded-full text-[9px] font-extrabold ${
                          isOut
                            ? 'bg-red-500 text-white'
                            : isLow
                            ? 'bg-amber-500 text-white'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isOut ? 'Habis (0)' : isLow ? `Menipis (${p.stock} ps)` : `Aman (${p.stock} ps)`}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 block">Batas Min</span>
                      <span className="font-mono font-bold text-gray-700">{min} pasang</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProductId(p.id);
                        setActionType('IN');
                        setActiveSubTab('management');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-pink-100 hover:bg-[#be185d] text-[#be185d] hover:text-white font-bold text-xs transition-all cursor-pointer shadow-2xs"
                    >
                      + Restock Cepat
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
