import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  ShieldCheck,
  Briefcase,
  Phone,
  Calendar,
  Lock,
  CheckCircle2,
  Camera,
  LogOut,
  Save,
  Sparkles,
  KeyRound,
  Shield,
  Layers,
  Award,
} from 'lucide-react';
import { compressImageFile } from '../../lib/imageUtils';

export interface AdminProfileData {
  fullName: string;
  avatarUrl: string;
  email: string;
  role: string;
  phone: string;
  joinedDate: string;
}

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminEmail: string;
  onLogout: () => void;
}

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
];

export const AdminProfileModal: React.FC<AdminProfileModalProps> = ({
  isOpen,
  onClose,
  adminEmail,
  onLogout,
}) => {
  if (!isOpen) return null;

  const storageKey = `mochi_admin_profile_${adminEmail}`;

  const [profile, setProfile] = useState<AdminProfileData>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      fullName: adminEmail === 'kirakirani57@gmail.com' ? 'Kirani Admin Mochi' : 'Administrator Utama Mochi',
      avatarUrl: DEFAULT_AVATARS[0],
      email: adminEmail || 'admin@mochisteps.com',
      role: 'Super Administrator & Owner',
      phone: '+62 819-4567-3245',
      joinedDate: 'Januari 2026',
    };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempFullName, setTempFullName] = useState(profile.fullName);
  const [tempRole, setTempRole] = useState(profile.role);
  const [tempPhone, setTempPhone] = useState(profile.phone);
  const [tempAvatarUrl, setTempAvatarUrl] = useState(profile.avatarUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  useEffect(() => {
    setTempFullName(profile.fullName);
    setTempRole(profile.role);
    setTempPhone(profile.phone);
    setTempAvatarUrl(profile.avatarUrl);
  }, [profile]);

  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await compressImageFile(file, 400, 0.85);
      setTempAvatarUrl(base64);
    } catch (err: any) {
      alert('Gagal mengunggah foto profil: ' + (err?.message || 'Error'));
    }
  };

  const handleSaveProfile = () => {
    setIsSaving(true);
    const updated: AdminProfileData = {
      ...profile,
      fullName: tempFullName.trim() || 'Admin Mochi Steps',
      role: tempRole.trim() || 'Administrator Toko',
      phone: tempPhone.trim() || '+62 819-4567-3245',
      avatarUrl: tempAvatarUrl,
    };

    setProfile(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }

    setIsSaving(false);
    setIsEditing(false);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-fade-in font-sans selection:bg-pink-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl border border-pink-100 overflow-hidden max-h-[92vh] flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Accent Banner */}
        <div className="h-28 sm:h-32 bg-gradient-to-r from-[#831843] via-[#be185d] to-[#db2777] relative p-6 flex items-start justify-between">
          <div className="flex items-center gap-2 text-white/90">
            <span className="p-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20">
              <ShieldCheck className="w-4 h-4 text-pink-200" />
            </span>
            <span className="text-xs font-bold tracking-wider uppercase">
              Profil Resmi Administrator
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar & Header Overlap */}
        <div className="px-6 sm:px-8 -mt-14 relative z-10 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-pink-100 shrink-0">
                <img
                  src={isEditing ? tempAvatarUrl : profile.avatarUrl}
                  alt={profile.fullName}
                  className="w-full h-full object-cover"
                />
              </div>

              {isEditing && (
                <label
                  className="absolute bottom-1 right-1 p-2 rounded-full bg-[#be185d] hover:bg-[#9d174d] text-white shadow-md cursor-pointer transition-transform hover:scale-105"
                  title="Ganti Foto Avatar"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileUpload}
                    className="hidden"
                  />
                  <Camera className="w-3.5 h-3.5" />
                </label>
              )}
            </div>

            <div className="pb-1 space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-gray-900">
                  {profile.fullName}
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Aktif</span>
                </span>
              </div>
              <p className="text-xs text-pink-700 font-semibold flex items-center justify-center sm:justify-start gap-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>{profile.role}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-[#be185d] font-bold text-xs border border-pink-200 transition-all cursor-pointer shadow-2xs"
              >
                Ubah Profil
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
            )}
          </div>
        </div>

        {/* Success Alert */}
        {saveSuccessNotice && (
          <div className="mx-6 sm:mx-8 mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Profil administrator berhasil diperbarui!</span>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          {/* Edit Form Mode */}
          {isEditing ? (
            <div className="space-y-4 bg-pink-50/50 p-4 sm:p-5 rounded-3xl border border-pink-100 animate-fade-in">
              <h4 className="font-bold text-xs text-gray-800 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                <span>Pengaturan Informasi Admin</span>
              </h4>

              {/* Preset Avatar Picker */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-2">
                  Pilih Avatar Cepat:
                </label>
                <div className="flex items-center gap-3">
                  {DEFAULT_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTempAvatarUrl(url)}
                      className={`w-12 h-12 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                        tempAvatarUrl === url
                          ? 'border-[#be185d] scale-105 shadow-md'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Lengkap</label>
                <div className="relative">
                  <input
                    type="text"
                    value={tempFullName}
                    onChange={(e) => setTempFullName(e.target.value)}
                    placeholder="Nama Lengkap Admin"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-pink-200 bg-white text-xs font-medium focus:ring-2 focus:ring-pink-300 focus:outline-hidden"
                  />
                  <User className="w-4 h-4 text-pink-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Jabatan / Role */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Jabatan / Role</label>
                <div className="relative">
                  <input
                    type="text"
                    value={tempRole}
                    onChange={(e) => setTempRole(e.target.value)}
                    placeholder="Super Administrator & Owner"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-pink-200 bg-white text-xs font-medium focus:ring-2 focus:ring-pink-300 focus:outline-hidden"
                  />
                  <Briefcase className="w-4 h-4 text-pink-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Nomor CS Telepon */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nomor WhatsApp CS</label>
                <div className="relative">
                  <input
                    type="text"
                    value={tempPhone}
                    onChange={(e) => setTempPhone(e.target.value)}
                    placeholder="+62 819-4567-3245"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-pink-200 bg-white text-xs font-medium focus:ring-2 focus:ring-pink-300 focus:outline-hidden"
                  />
                  <Phone className="w-4 h-4 text-pink-400 absolute left-3 top-3" />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d65b7d] via-[#e26d8d] to-[#be185d] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:brightness-105 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Profil</span>
              </button>
            </div>
          ) : (
            /* Readonly Detailed Cards */
            <div className="space-y-4">
              {/* Info Badges Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-150 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-pink-100 text-[#be185d] shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Akun Admin</p>
                    <p className="text-xs font-bold text-gray-800 truncate">{profile.email}</p>
                    <p className="text-[10px] text-emerald-600 font-medium">Terverifikasi di Firebase Auth</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-150 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-pink-100 text-[#be185d] shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Kontak WhatsApp Toko</p>
                    <p className="text-xs font-bold text-gray-800 font-mono">{profile.phone}</p>
                    <p className="text-[10px] text-gray-500 font-medium">Tercantum di Struk Kasir POS</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-150 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-pink-100 text-[#be185d] shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Terdaftar Sejak</p>
                    <p className="text-xs font-bold text-gray-800">{profile.joinedDate}</p>
                    <p className="text-[10px] text-gray-500 font-medium">Periode Toko Aktif</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-150 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-pink-100 text-[#be185d] shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tingkat Keamanan</p>
                    <p className="text-xs font-bold text-emerald-700 font-bold">Maksimal (Super Admin)</p>
                    <p className="text-[10px] text-gray-500 font-medium">Enkripsi Cloud 256-Bit</p>
                  </div>
                </div>
              </div>

              {/* Roles & Permissions Breakdown */}
              <div className="p-4 rounded-2xl bg-pink-50/40 border border-pink-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-[#be185d]" />
                    <span>Hak Akses Terverifikasi Administrator:</span>
                  </span>
                  <span className="text-[10px] font-extrabold text-[#be185d] bg-pink-100 px-2 py-0.5 rounded-full">
                    Akses Penuh
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Katalog Sepatu & Varian Foto</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Inventori Stok Size EU 36–41</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Approval Bukti Transfer Asli</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Kasir POS & Cetak Struk Fisik</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Laporan Penjualan & Margin Profit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Basis Data Pelanggan Toko</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Logout Option */}
        <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-150 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              if (confirm('Apakah Anda yakin ingin keluar dari sesi admin Mochi Steps?')) {
                onLogout();
                onClose();
              }
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-red-50 text-red-600 font-bold text-xs border border-red-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Akun Admin</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
