import React, { useState, useEffect } from 'react';
import {
  Store,
  Phone,
  Mail,
  MapPin,
  Clock,
  Building2,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Truck,
  Sparkles,
} from 'lucide-react';
import { StoreSettings, BankAccountInfo } from '../../types';
import { updateStoreSettings, DEFAULT_STORE_SETTINGS } from '../../lib/firestoreService';

interface StoreSettingsManagerProps {
  settings?: StoreSettings;
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

export const StoreSettingsManager: React.FC<StoreSettingsManagerProps> = ({
  settings,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<StoreSettings>(settings || DEFAULT_STORE_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'banks' | 'policies' | 'shipping'>('general');

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateStoreSettings(formData);
      onShowToast('Pengaturan toko berhasil diperbarui dan tersinkronkan ke Webstore!', 'success');
    } catch (err: any) {
      onShowToast('Gagal menyimpan pengaturan: ' + (err?.message || 'Error'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddBank = () => {
    const newBank: BankAccountInfo = {
      bankName: 'Bank BCA',
      accountNumber: '',
      accountHolder: formData.storeName || 'Mochi Steps Indonesia',
      instructions: 'Transfer sesuai nominal tagihan pesanan Anda.',
    };
    setFormData({
      ...formData,
      bankAccounts: [...(formData.bankAccounts || []), newBank],
    });
  };

  const handleRemoveBank = (index: number) => {
    const updated = [...(formData.bankAccounts || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, bankAccounts: updated });
  };

  const handleBankChange = (index: number, field: keyof BankAccountInfo, value: string) => {
    const updated = [...(formData.bankAccounts || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, bankAccounts: updated });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-pink-100 text-[#be185d]">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-xl text-gray-900">
              Pengaturan Toko & Kebijakan
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Kelola identitas brand, kontak CS WhatsApp, rekening pembayaran, dan kebijakan retur yang otomatis tampil di Webstore.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d65b7d] via-[#e26d8d] to-[#be185d] text-white font-bold text-xs flex items-center gap-2 shadow-md hover:brightness-105 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Menyimpan...' : 'Simpan Semua Pengaturan'}</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        {[
          { id: 'general', label: '1. Identitas & Kontak', icon: Store },
          { id: 'banks', label: '2. Rekening Pembayaran', icon: Building2 },
          { id: 'shipping', label: '3. Ongkir & Pengiriman', icon: Truck },
          { id: 'policies', label: '4. Syarat, Privasi & Retur', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                active
                  ? 'bg-pink-100 text-[#be185d] shadow-2xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* SUBTAB 1: IDENTITAS & KONTAK */}
        {activeSubTab === 'general' && (
          <div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-xs space-y-4 animate-fade-in">
            <h3 className="font-heading font-bold text-sm text-gray-900 border-b border-gray-100 pb-2">
              Identitas Toko & Kontak Operasional
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Toko</label>
                <input
                  type="text"
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-xs font-medium focus:ring-2 focus:ring-pink-300 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tagline Slogan</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-xs font-medium focus:ring-2 focus:ring-pink-300 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nomor WhatsApp CS (Untuk Link Chat)</label>
                <input
                  type="text"
                  value={formData.whatsappNumber}
                  placeholder="6281945673245"
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-xs font-mono focus:ring-2 focus:ring-pink-300 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Resmi Toko</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-xs focus:ring-2 focus:ring-pink-300 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Jam Operasional Toko</label>
                <input
                  type="text"
                  value={formData.operationalHours}
                  placeholder="Senin - Minggu: 08.00 - 21.00 WIB"
                  onChange={(e) => setFormData({ ...formData, operationalHours: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-xs focus:ring-2 focus:ring-pink-300 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Kota / Lokasi</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-xs focus:ring-2 focus:ring-pink-300 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Alamat Lengkap Toko Fisik</label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-3 rounded-xl border border-pink-200 text-xs focus:ring-2 focus:ring-pink-300 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Teks Banner Pengumuman Promo (Paling Atas Webstore)</label>
              <input
                type="text"
                value={formData.announcementBanner}
                onChange={(e) => setFormData({ ...formData, announcementBanner: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-xs focus:ring-2 focus:ring-pink-300 focus:outline-hidden"
              />
            </div>
          </div>
        )}

        {/* SUBTAB 2: REKENING PEMBAYARAN */}
        {activeSubTab === 'banks' && (
          <div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-xs space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div>
                <h3 className="font-heading font-bold text-sm text-gray-900">
                  Daftar Rekening Bank Toko
                </h3>
                <p className="text-[11px] text-gray-500">
                  Rekening yang tampil pada pilihan Bank Transfer pelanggan saat checkout.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddBank}
                className="px-3 py-1.5 rounded-xl bg-pink-100 hover:bg-pink-200 text-[#be185d] font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Bank</span>
              </button>
            </div>

            <div className="space-y-4">
              {(formData.bankAccounts || []).map((bank, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-gray-800">Rekening #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBank(idx)}
                      className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                      title="Hapus Rekening"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Nama Bank</label>
                      <input
                        type="text"
                        value={bank.bankName}
                        placeholder="Contoh: Bank Central Asia (BCA)"
                        onChange={(e) => handleBankChange(idx, 'bankName', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Nomor Rekening</label>
                      <input
                        type="text"
                        value={bank.accountNumber}
                        placeholder="Contoh: 8720-4912-33"
                        onChange={(e) => handleBankChange(idx, 'accountNumber', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Atas Nama Pemilik</label>
                      <input
                        type="text"
                        value={bank.accountHolder}
                        placeholder="PT MOCHI STEPS INDONESIA"
                        onChange={(e) => handleBankChange(idx, 'accountHolder', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Instruksi Pembayaran</label>
                    <input
                      type="text"
                      value={bank.instructions || ''}
                      placeholder="Transfer tepat sesuai nominal tagihan hingga 3 digit terakhir."
                      onChange={(e) => handleBankChange(idx, 'instructions', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBTAB 3: PENGIRIMAN & ONGKIR */}
        {activeSubTab === 'shipping' && (
          <div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-xs space-y-4 animate-fade-in">
            <h3 className="font-heading font-bold text-sm text-gray-900 border-b border-gray-100 pb-2">
              Aturan Ongkos Kirim & Pengiriman
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Ongkos Kirim Default / Standar (Rp)
                </label>
                <input
                  type="number"
                  value={formData.defaultShippingCost}
                  onChange={(e) => setFormData({ ...formData, defaultShippingCost: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-xs font-mono font-bold focus:ring-2 focus:ring-pink-300 focus:outline-hidden"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Biaya pengiriman jika total belanja belum mencapai batas gratis ongkir.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Ambang Batas Gratis Ongkir (Rp)
                </label>
                <input
                  type="number"
                  value={formData.freeShippingThreshold}
                  onChange={(e) => setFormData({ ...formData, freeShippingThreshold: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-xs font-mono font-bold focus:ring-2 focus:ring-pink-300 focus:outline-hidden"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Belanja di atas nominal ini akan otomatis mendapatkan diskon ongkos kirim Rp 0 (Gratis Ongkir).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 4: SYARAT, PRIVASI & KEBIJAKAN RETUR */}
        {activeSubTab === 'policies' && (
          <div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-xs space-y-4 animate-fade-in">
            <h3 className="font-heading font-bold text-sm text-gray-900 border-b border-gray-100 pb-2">
              Kebijakan Toko & Garansi
            </h3>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Kebijakan Retur & Tukar Ukuran</label>
              <textarea
                rows={3}
                value={formData.returnPolicy}
                onChange={(e) => setFormData({ ...formData, returnPolicy: e.target.value })}
                className="w-full p-3 rounded-xl border border-pink-200 text-xs focus:ring-2 focus:ring-pink-300 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Kebijakan Privasi Pelanggan</label>
              <textarea
                rows={3}
                value={formData.privacyPolicy}
                onChange={(e) => setFormData({ ...formData, privacyPolicy: e.target.value })}
                className="w-full p-3 rounded-xl border border-pink-200 text-xs focus:ring-2 focus:ring-pink-300 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Syarat & Ketentuan Layanan</label>
              <textarea
                rows={3}
                value={formData.termsAndConditions}
                onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                className="w-full p-3 rounded-xl border border-pink-200 text-xs focus:ring-2 focus:ring-pink-300 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Catatan Panduan Ukuran & Insole</label>
              <textarea
                rows={2}
                value={formData.sizeGuideNote}
                onChange={(e) => setFormData({ ...formData, sizeGuideNote: e.target.value })}
                className="w-full p-3 rounded-xl border border-pink-200 text-xs focus:ring-2 focus:ring-pink-300 focus:outline-hidden"
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
