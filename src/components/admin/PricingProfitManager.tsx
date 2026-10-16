import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Percent,
  Sparkles,
  Edit2,
  Check,
  X,
  Search,
  AlertCircle,
  HelpCircle,
  Save,
  CheckCircle2,
  RefreshCw,
  Layers,
  Calculator,
  ArrowRight,
} from 'lucide-react';
import { Product } from '../../types';
import {
  calculateProfitRatio,
  autoCalculateSellingPrice,
  updateProductPricing,
  bulkUpdateProductMarkup,
} from '../../lib/firestoreService';
import { FlatshoeImage } from '../FlatshoeImage';

interface PricingProfitManagerProps {
  products: Product[];
}

export const PricingProfitManager: React.FC<PricingProfitManagerProps> = ({
  products,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Profit Simulator Calculator State
  const [simCostPrice, setSimCostPrice] = useState<number>(95000); // Modal HPP
  const [simMarkupPct, setSimMarkupPct] = useState<number>(35); // Target Markup %

  // Bulk Markup Feature State
  const [bulkScope, setBulkScope] = useState<'all' | string>('all');
  const [bulkMarkupPct, setBulkMarkupPct] = useState<number>(35);
  const [bulkPreviewList, setBulkPreviewList] = useState<
    Array<{
      id: string;
      name: string;
      category: string;
      costPrice: number;
      oldPrice: number;
      newPrice: number;
      profitPerUnit: number;
      marginPct: number;
      diffPrice: number;
    }> | null
  >(null);
  const [isSavingBulk, setIsSavingBulk] = useState(false);
  const [bulkNotification, setBulkNotification] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Single Product Edit Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editCostPrice, setEditCostPrice] = useState<number>(0);
  const [editMarkupPct, setEditMarkupPct] = useState<number>(35);
  const [isSavingSingle, setIsSavingSingle] = useState(false);
  const [singleNotification, setSingleNotification] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Preset Markups
  const markupPresets = [15, 25, 35, 50, 75, 100];

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Formula: Harga Jual = Harga Beli * (1 + Markup/100) rounded to nearest 1.000
  const calculateSellingPriceFromMarkup = (cost: number, markup: number) => {
    if (cost <= 0) return 0;
    const raw = cost * (1 + markup / 100);
    return Math.ceil(raw / 1000) * 1000;
  };

  // Simulator Calculations
  const simRecommendedPrice = useMemo(() => {
    return calculateSellingPriceFromMarkup(simCostPrice, simMarkupPct);
  }, [simCostPrice, simMarkupPct]);

  const simGrossProfit = useMemo(() => {
    return Math.max(0, simRecommendedPrice - simCostPrice);
  }, [simRecommendedPrice, simCostPrice]);

  const simMarginPct = useMemo(() => {
    return simRecommendedPrice > 0 ? (simGrossProfit / simRecommendedPrice) * 100 : 0;
  }, [simGrossProfit, simRecommendedPrice]);

  // Overall Financial Metrics
  const metrics = useMemo(() => {
    let totalStock = 0;
    let totalCostInventory = 0;
    let totalRetailInventory = 0;
    let totalNominalProfit = 0;

    products.forEach((p) => {
      const cost = p.costPrice || Math.round(p.price * 0.55);
      const stock = p.stock || 0;
      totalStock += stock;
      totalCostInventory += cost * stock;
      totalRetailInventory += p.price * stock;
      totalNominalProfit += (p.price - cost) * stock;
    });

    const avgMarginPct =
      totalRetailInventory > 0
        ? (totalNominalProfit / totalRetailInventory) * 100
        : 0;

    return {
      totalStock,
      totalCostInventory,
      totalRetailInventory,
      totalNominalProfit,
      avgMarginPct: Math.round(avgMarginPct * 10) / 10,
    };
  }, [products]);

  // Filtered Products Table
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.color.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Trigger Bulk Markup Preview
  const handleGenerateBulkPreview = () => {
    const targetProducts = products.filter(
      (p) => bulkScope === 'all' || p.category === bulkScope
    );

    const preview = targetProducts.map((p) => {
      const cost = p.costPrice || Math.round(p.price * 0.55);
      const newPrice = calculateSellingPriceFromMarkup(cost, bulkMarkupPct);
      const profitPerUnit = newPrice - cost;
      const marginPct = newPrice > 0 ? (profitPerUnit / newPrice) * 100 : 0;
      const diffPrice = newPrice - p.price;

      return {
        id: p.id,
        name: p.name,
        category: p.category,
        costPrice: cost,
        oldPrice: p.price,
        newPrice,
        profitPerUnit,
        marginPct: Math.round(marginPct * 10) / 10,
        diffPrice,
      };
    });

    setBulkPreviewList(preview);
    setBulkNotification(null);
  };

  // Save Bulk Markup to Firestore
  const handleSaveBulkMarkup = async () => {
    if (!bulkPreviewList || bulkPreviewList.length === 0) return;
    setIsSavingBulk(true);
    setBulkNotification(null);

    try {
      const updates = bulkPreviewList.map((item) => ({
        id: item.id,
        price: item.newPrice,
        costPrice: item.costPrice,
      }));

      const count = await bulkUpdateProductMarkup(updates);
      setBulkNotification({
        type: 'success',
        text: `Berhasil memperbarui harga jual & margin profit untuk ${count} produk ke Firestore! Transaksi lama tetap aman.`,
      });
      setBulkPreviewList(null);
    } catch (err: any) {
      console.error('Bulk markup error:', err);
      setBulkNotification({
        type: 'error',
        text: err.message || 'Gagal menyimpan pembaruan harga massal ke Firestore.',
      });
    } finally {
      setIsSavingBulk(false);
    }
  };

  // Open Edit Modal for a Product
  const handleOpenEdit = (p: Product) => {
    const cost = p.costPrice || Math.round(p.price * 0.55);
    setEditingProduct(p);
    setEditCostPrice(cost);
    setEditPrice(p.price);
    const initialMarkup = cost > 0 ? Math.round(((p.price - cost) / cost) * 100) : 35;
    setEditMarkupPct(initialMarkup);
    setSingleNotification(null);
  };

  // Save Single Product Pricing Changes to Firestore
  const handleSaveSinglePricing = async () => {
    if (!editingProduct) return;
    setIsSavingSingle(true);
    setSingleNotification(null);

    try {
      await updateProductPricing(editingProduct.id, editPrice, editCostPrice);
      setSingleNotification({
        type: 'success',
        text: `Harga jual & HPP untuk "${editingProduct.name}" berhasil disimpan ke Firestore!`,
      });
      setTimeout(() => {
        setEditingProduct(null);
        setSingleNotification(null);
      }, 1300);
    } catch (err: any) {
      console.error(err);
      setSingleNotification({
        type: 'error',
        text: err.message || 'Gagal memperbarui harga di Firestore.',
      });
    } finally {
      setIsSavingSingle(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-pink-50 via-white to-pink-50 p-5 rounded-3xl border border-pink-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#d65b7d] to-[#be185d] text-white flex items-center justify-center shadow-xs">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-gray-900 text-lg flex items-center gap-2">
              <span>Pengaturan Harga & Auto Ratio Profit</span>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-pink-100 text-[#be185d] border border-pink-200">
                Kalkulator Formula
              </span>
            </h2>
            <p className="text-xs text-gray-500">
              Rumus: <b>Harga Jual = Harga Beli × (1 + Markup/100)</b>. Fitur markup massal dengan penyimpanan aman ke Firestore.
            </p>
          </div>
        </div>

        {/* 4 Financial Metric Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 shadow-2xs">
            <span className="text-gray-400 text-[10px] block">Total Nilai HPP</span>
            <span className="font-extrabold text-gray-900 font-mono">
              {formatRupiah(metrics.totalCostInventory)}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white border border-pink-200 shadow-2xs">
            <span className="text-[#be185d] text-[10px] block">Total Nilai Retail</span>
            <span className="font-extrabold text-[#be185d] font-mono">
              {formatRupiah(metrics.totalRetailInventory)}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white border border-emerald-200 shadow-2xs">
            <span className="text-emerald-600 text-[10px] block">Potensi Margin</span>
            <span className="font-extrabold text-emerald-700 font-mono">
              ~{metrics.avgMarginPct}%
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: KALKULATOR PROFIT PROFESIONAL */}
      <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-2xs space-y-6">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <Sparkles className="w-5 h-5 text-[#be185d]" />
          <div>
            <h3 className="font-heading font-extrabold text-gray-900 text-sm">
              Kalkulator Simulasi Rasio Profit & Markup
            </h3>
            <p className="text-xs text-gray-500">
              Gunakan simulasi ini untuk merancang struktur harga sebelum diterapkan ke produk.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Input: Cost & Markup (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Harga Beli / Modal Pengrajin (HPP)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-xs font-bold text-gray-400">Rp</span>
                <input
                  type="number"
                  min="10000"
                  step="5000"
                  value={simCostPrice}
                  onChange={(e) => setSimCostPrice(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 bg-gray-50/50 font-mono font-bold text-sm text-gray-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-300"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-700">
                  Target Persentase Markup
                </label>
                <span className="font-mono font-extrabold text-sm text-[#be185d]">
                  +{simMarkupPct}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="150"
                step="5"
                value={simMarkupPct}
                onChange={(e) => setSimMarkupPct(parseInt(e.target.value) || 10)}
                className="w-full accent-pink-600 cursor-pointer"
              />

              {/* Preset Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] text-gray-400 font-bold mr-1">Preset:</span>
                {markupPresets.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setSimMarkupPct(pct)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      simMarkupPct === pct
                        ? 'bg-[#be185d] text-white shadow-2xs'
                        : 'bg-gray-100 hover:bg-pink-100 text-gray-700'
                    }`}
                  >
                    +{pct}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Output: Professional Metric Cards (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Rekomendasi Harga Jual */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-500 to-[#be185d] text-white shadow-xs flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-pink-100">
                Rekomendasi Harga Jual
              </span>
              <div className="my-2">
                <span className="text-xl font-heading font-extrabold block">
                  {formatRupiah(simRecommendedPrice)}
                </span>
                <span className="text-[10px] text-pink-100">
                  HPP + {simMarkupPct}% Markup
                </span>
              </div>
              <div className="text-[10px] bg-white/20 px-2 py-0.5 rounded-lg w-fit">
                Bulat ke 1.000
              </div>
            </div>

            {/* Keuntungan Kotor Per Unit */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Keuntungan Kotor / Unit
              </span>
              <div className="my-2">
                <span className="text-xl font-heading font-extrabold text-emerald-700 block">
                  +{formatRupiah(simGrossProfit)}
                </span>
                <span className="text-[10px] text-emerald-600">
                  Margin Laba: {simMarginPct.toFixed(1)}%
                </span>
              </div>
              <div className="text-[10px] text-emerald-800 font-semibold">
                Laba per pasang sepatu
              </div>
            </div>

            {/* Margin Profit % */}
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
                Margin Profit
              </span>
              <div className="my-2">
                <span className="text-2xl font-mono font-extrabold text-purple-700 block">
                  {simMarginPct.toFixed(1)}%
                </span>
                <span className="text-[10px] text-purple-600">
                  (Laba Kotor / Harga Jual)
                </span>
              </div>
              <div className="text-[10px] text-purple-800 font-semibold">
                Status: Sehat & Kompetitif
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: TERAPKAN MARKUP MASSAL */}
      <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#be185d]" />
            <div>
              <h3 className="font-heading font-extrabold text-gray-900 text-sm">
                Terapkan Markup Massal ke Database
              </h3>
              <p className="text-xs text-gray-500">
                Pilih cakupan kategori atau seluruh produk, lalu simpan perubahan harga sekaligus ke Firestore.
              </p>
            </div>
          </div>
        </div>

        {/* Global Feedback Alert */}
        {bulkNotification && (
          <div
            className={`p-3.5 rounded-2xl flex items-center justify-between text-xs font-semibold ${
              bulkNotification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {bulkNotification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{bulkNotification.text}</span>
            </div>
            <button
              onClick={() => setBulkNotification(null)}
              className="text-gray-400 hover:text-gray-700 font-bold px-2 py-0.5"
            >
              ✕
            </button>
          </div>
        )}

        {/* Bulk Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-pink-50/40 border border-pink-100">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Cakupan Produk
            </label>
            <select
              value={bulkScope}
              onChange={(e) => setBulkScope(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white font-semibold"
            >
              <option value="all">Semua Produk ({products.length} model)</option>
              <option value="Flat Shoes Klasik">Kategori: Flat Shoes Klasik</option>
              <option value="Pointed Elegant">Kategori: Pointed Elegant</option>
              <option value="Loafers & Slip-on">Kategori: Loafers & Slip-on</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Persentase Markup (% dari HPP)
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="5"
                max="200"
                value={bulkMarkupPct}
                onChange={(e) => setBulkMarkupPct(Math.max(5, parseInt(e.target.value) || 5))}
                className="w-24 px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white font-mono font-bold text-center"
              />
              <div className="flex gap-1">
                {[25, 35, 50].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setBulkMarkupPct(p)}
                    className="px-2 py-1 text-[11px] font-bold rounded-lg bg-gray-100 hover:bg-pink-100 text-gray-700 cursor-pointer"
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleGenerateBulkPreview}
              className="w-full py-2.5 px-4 rounded-xl bg-pink-100 hover:bg-pink-200 text-[#be185d] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-pink-200"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>1. Terapkan Preview</span>
            </button>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              disabled={!bulkPreviewList || isSavingBulk}
              onClick={handleSaveBulkMarkup}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#d65b7d] to-[#be185d] hover:brightness-105 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-40"
            >
              {isSavingBulk ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>2. Simpan Perubahan</span>
            </button>
          </div>
        </div>

        {/* Bulk Preview Table */}
        {bulkPreviewList && (
          <div className="space-y-3 animate-fade-in border border-pink-200 rounded-2xl p-4 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800">
                Pratinjau {bulkPreviewList.length} Produk (Markup +{bulkMarkupPct}%)
              </span>
              <button
                onClick={() => setBulkPreviewList(null)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Batal Preview
              </button>
            </div>

            <div className="overflow-x-auto max-h-64">
              <table className="w-full text-left text-xs">
                <thead className="bg-pink-50 text-gray-700 font-bold uppercase text-[10px] tracking-wider sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Produk</th>
                    <th className="py-2.5 px-3">HPP (Modal)</th>
                    <th className="py-2.5 px-3">Harga Sekarang</th>
                    <th className="py-2.5 px-3 text-[#be185d]">Harga Rekomendasi</th>
                    <th className="py-2.5 px-3 text-emerald-700">Laba / Unit</th>
                    <th className="py-2.5 px-3">Selisih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bulkPreviewList.map((row) => (
                    <tr key={row.id} className="hover:bg-pink-50/30">
                      <td className="py-2.5 px-3 font-semibold text-gray-900">{row.name}</td>
                      <td className="py-2.5 px-3 font-mono text-gray-600">{formatRupiah(row.costPrice)}</td>
                      <td className="py-2.5 px-3 font-mono text-gray-500">{formatRupiah(row.oldPrice)}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#be185d]">
                        {formatRupiah(row.newPrice)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-emerald-600">
                        +{formatRupiah(row.profitPerUnit)} ({row.marginPct}%)
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold">
                        {row.diffPrice === 0 ? (
                          <span className="text-gray-400">0</span>
                        ) : row.diffPrice > 0 ? (
                          <span className="text-emerald-600">+{formatRupiah(row.diffPrice)}</span>
                        ) : (
                          <span className="text-red-500">{formatRupiah(row.diffPrice)}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={isSavingBulk}
                onClick={handleSaveBulkMarkup}
                className="py-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSavingBulk ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Simpan Perubahan ke Database</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: DAFTAR DETAIL SEMUA PRODUK DENGAN RASIO PROFIT */}
      <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h3 className="font-heading font-extrabold text-gray-900 text-sm flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#be185d]" />
              <span>Daftar Harga Beli (HPP) & Margin Produk</span>
            </h3>
            <p className="text-xs text-gray-500">
              Ubah harga atau HPP per produk secara individu sesuai kesepakatan pengrajin.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <input
                type="text"
                placeholder="Cari model sepatu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-hidden"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-gray-50 border border-gray-200"
            >
              <option value="all">Semua Kategori</option>
              <option value="Flat Shoes Klasik">Flat Shoes Klasik</option>
              <option value="Pointed Elegant">Pointed Elegant</option>
              <option value="Loafers & Slip-on">Loafers & Slip-on</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-pink-50/60 text-gray-700 font-bold uppercase text-[10px] tracking-wider border-b border-pink-100">
              <tr>
                <th className="py-3 px-3">Produk Sepatu</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-3">Harga Beli / HPP</th>
                <th className="py-3 px-3">Harga Jual Retail</th>
                <th className="py-3 px-3">Markup</th>
                <th className="py-3 px-3">Laba Kotor</th>
                <th className="py-3 px-3">Margin %</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((p) => {
                const cost = p.costPrice || Math.round(p.price * 0.55);
                const profitNominal = p.price - cost;
                const markup = cost > 0 ? Math.round((profitNominal / cost) * 100) : 0;
                const margin = p.price > 0 ? Math.round((profitNominal / p.price) * 1000) / 10 : 0;

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
                          <div className="text-[10px] text-gray-500">{p.color}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-gray-600">{p.category}</td>

                    <td className="py-3 px-3 font-mono font-bold text-gray-700">
                      {formatRupiah(cost)}
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-[#be185d]">
                      {formatRupiah(p.price)}
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-pink-100 text-[#be185d]">
                        +{markup}%
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono text-emerald-600 font-bold">
                      +{formatRupiah(profitNominal)}
                    </td>

                    <td className="py-3 px-3 font-mono text-purple-700 font-extrabold">
                      {margin}%
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(p)}
                        className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-pink-100 text-gray-700 hover:text-[#be185d] font-bold text-xs transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5 inline mr-1" />
                        <span>Edit Harga</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: EDIT HARGA & HPP SATUAN */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-pink-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-heading font-extrabold text-gray-900 text-sm">
                  Edit Harga & HPP Produk
                </h3>
                <p className="text-xs text-gray-500 truncate max-w-xs">{editingProduct.name}</p>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {singleNotification && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  singleNotification.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'bg-red-50 text-red-800'
                }`}
              >
                {singleNotification.text}
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Harga Beli / HPP Modal (Rp)</label>
                <input
                  type="number"
                  step="1000"
                  value={editCostPrice}
                  onChange={(e) => {
                    const cost = Math.max(0, parseInt(e.target.value) || 0);
                    setEditCostPrice(cost);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-mono font-bold"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-gray-700">Terapkan Preset Markup Cepat</label>
                  <span className="font-mono text-pink-600 font-extrabold">+{editMarkupPct}%</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {markupPresets.map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        setEditMarkupPct(pct);
                        const autoP = calculateSellingPriceFromMarkup(editCostPrice, pct);
                        setEditPrice(autoP);
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-pink-50 hover:bg-pink-100 text-[#be185d] border border-pink-200 cursor-pointer"
                    >
                      +{pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Harga Jual Retail (Rp)</label>
                <input
                  type="number"
                  step="1000"
                  value={editPrice}
                  onChange={(e) => setEditPrice(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-pink-300 font-mono font-bold text-[#be185d]"
                />
              </div>

              {/* Live Preview Ratio */}
              <div className="p-3 bg-pink-50/60 rounded-xl border border-pink-100 flex items-center justify-between font-mono">
                <div>
                  <span className="text-[10px] text-gray-500 block">Laba Kotor</span>
                  <span className="font-bold text-emerald-700">
                    +{formatRupiah(Math.max(0, editPrice - editCostPrice))}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 block">Margin Bersih</span>
                  <span className="font-bold text-purple-700">
                    {editPrice > 0
                      ? Math.round(((editPrice - editCostPrice) / editPrice) * 1000) / 10
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSavingSingle}
                onClick={handleSaveSinglePricing}
                className="px-4 py-2 rounded-xl bg-[#be185d] hover:bg-[#9d174d] text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSavingSingle ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
