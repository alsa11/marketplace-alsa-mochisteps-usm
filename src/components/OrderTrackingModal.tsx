import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Truck,
  Clock,
  CheckCircle2,
  PackageCheck,
  AlertCircle,
  Phone,
  Package,
  ShieldCheck,
  Copy,
  Check,
  MessageCircle,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Eye,
  Star,
  Undo2,
  Calendar,
} from 'lucide-react';
import { Order, OrderStatus, OrderItem } from '../types';
import { FlatshoeImage } from './FlatshoeImage';
import { cancelCustomerOrder, updateOrderPaymentProof, addCustomerReview, createOrderReturn } from '../lib/firestoreService';
import { compressImageFile } from '../lib/imageUtils';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  initialSearch?: string;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  orders,
  initialSearch = '',
}) => {
  const [orderNumberInput, setOrderNumberInput] = useState(initialSearch);
  const [phoneInput, setPhoneInput] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [matchedOrder, setMatchedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedResi, setCopiedResi] = useState(false);
  const [isCancellingOrder, setIsCancellingOrder] = useState(false);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [proofUploadSuccess, setProofUploadSuccess] = useState<string | null>(null);
  const [previewProofModal, setPreviewProofModal] = useState<string | null>(null);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState<OrderItem | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewPhoto, setReviewPhoto] = useState<string | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessNotice, setReviewSuccessNotice] = useState<string | null>(null);

  // Return & Size Exchange Modal State
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnType, setReturnType] = useState<'Tukar Ukuran' | 'Pengembalian Dana (Refund)'>('Tukar Ukuran');
  const [returnRequestedSize, setReturnRequestedSize] = useState<number>(39);
  const [returnReason, setReturnReason] = useState<string>('');
  const [returnPhoto, setReturnPhoto] = useState<string | null>(null);
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
  const [returnSuccessNotice, setReturnSuccessNotice] = useState<string | null>(null);

  const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !matchedOrder) return;
    try {
      setIsUploadingProof(true);
      setProofUploadSuccess(null);
      const compressedDataUrl = await compressImageFile(file);
      await updateOrderPaymentProof(matchedOrder.id, compressedDataUrl);
      setMatchedOrder({
        ...matchedOrder,
        paymentProofUrl: compressedDataUrl,
      });
      setProofUploadSuccess('Bukti transfer berhasil diunggah! Tim Admin kami akan segera memverifikasinya.');
      setTimeout(() => setProofUploadSuccess(null), 5000);
    } catch (err: any) {
      alert('Gagal mengunggah foto bukti: ' + (err?.message || 'Error'));
    } finally {
      setIsUploadingProof(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!matchedOrder || !selectedReviewItem) return;
    if (!reviewComment.trim()) {
      alert('Silakan tuliskan ulasan komentar Anda.');
      return;
    }

    try {
      setIsSubmittingReview(true);
      await addCustomerReview({
        productId: selectedReviewItem.productId,
        productName: selectedReviewItem.name,
        orderId: matchedOrder.id,
        orderNumber: matchedOrder.orderNumber,
        customerName: matchedOrder.customerName,
        rating: reviewRating,
        comment: reviewComment.trim(),
        photoUrl: reviewPhoto || undefined,
        size: selectedReviewItem.size,
      });

      setReviewSuccessNotice('Terima kasih! Ulasan bintang Anda telah berhasil dikirim dan tersimpan.');
      setTimeout(() => {
        setReviewSuccessNotice(null);
        setReviewModalOpen(false);
        setSelectedReviewItem(null);
        setReviewComment('');
        setReviewPhoto(null);
      }, 2500);
    } catch (e: any) {
      alert('Gagal mengirim ulasan: ' + (e?.message || 'Error'));
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleSubmitReturn = async () => {
    if (!matchedOrder) return;
    if (!returnReason.trim()) {
      alert('Silakan tuliskan alasan retur atau penukaran ukuran.');
      return;
    }

    try {
      setIsSubmittingReturn(true);
      await createOrderReturn({
        orderId: matchedOrder.id,
        orderNumber: matchedOrder.orderNumber,
        customerName: matchedOrder.customerName,
        customerPhone: matchedOrder.customerPhone,
        items: matchedOrder.items,
        reason: returnReason.trim(),
        photoUrl: returnPhoto || undefined,
        returnType,
        requestedSize: returnType === 'Tukar Ukuran' ? returnRequestedSize : undefined,
      });

      setReturnSuccessNotice('Pengajuan retur / tukar ukuran Anda berhasil dikirim ke Admin. Tim kami akan segera meninjau.');
      setTimeout(() => {
        setReturnSuccessNotice(null);
        setReturnModalOpen(false);
        setReturnReason('');
        setReturnPhoto(null);
      }, 3000);
    } catch (e: any) {
      alert('Gagal mengirim pengajuan retur: ' + (e?.message || 'Error'));
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  useEffect(() => {
    if (initialSearch) {
      setOrderNumberInput(initialSearch);
    }
  }, [initialSearch]);

  // Real-time synchronization: keep matchedOrder synced with live Firestore stream
  useEffect(() => {
    if (matchedOrder) {
      const liveOrder = orders.find(
        (o) => o.id === matchedOrder.id || o.orderNumber.toLowerCase() === matchedOrder.orderNumber.toLowerCase()
      );
      if (liveOrder) {
        setMatchedOrder(liveOrder);
      }
    }
  }, [orders, matchedOrder?.id, matchedOrder?.orderNumber]);

  if (!isOpen) return null;

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const cleanPhone = (val: string) => {
    let digits = val.replace(/[^0-9]/g, '');
    if (digits.startsWith('62')) {
      digits = '0' + digits.slice(2);
    }
    return digits;
  };

  const handleVerifyAndTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOrderNum = orderNumberInput.trim().toLowerCase();
    const cleanUserPhone = cleanPhone(phoneInput.trim());

    if (!cleanOrderNum || !cleanUserPhone) {
      setErrorMessage('Harap isi Nomor Pesanan dan Nomor WhatsApp Anda.');
      setMatchedOrder(null);
      setHasSearched(true);
      return;
    }

    // Secure Verification: Both Order Number AND Phone Number must match!
    const found = orders.find((o) => {
      const matchNumber =
        o.orderNumber.toLowerCase() === cleanOrderNum ||
        o.id.toLowerCase() === cleanOrderNum ||
        (o.receiptNumber && o.receiptNumber.toLowerCase() === cleanOrderNum);

      const oPhoneClean = cleanPhone(o.customerPhone);
      const matchPhone =
        oPhoneClean.length >= 6 &&
        cleanUserPhone.length >= 6 &&
        (oPhoneClean === cleanUserPhone ||
          oPhoneClean.endsWith(cleanUserPhone) ||
          cleanUserPhone.endsWith(oPhoneClean));

      return matchNumber && matchPhone;
    });

    if (found) {
      setMatchedOrder(found);
      setErrorMessage(null);
    } else {
      setMatchedOrder(null);
      setErrorMessage(
        'Nomor pesanan dan nomor WhatsApp tidak cocok atau belum terdaftar di database toko. Mohon periksa kembali data pesanan Anda.'
      );
    }
    setHasSearched(true);
  };

  // Status mapping into step sequence
  // Menunggu Pembayaran -> Dibayar -> Diproses -> Dikemas -> Dikirim -> Selesai
  const getStepIndex = (status: OrderStatus, paymentStatus: string) => {
    if (status === 'Ditolak' || status === 'Dibatalkan') return -1;
    if (status === 'Selesai') return 5;
    if (status === 'Dikirim') return 4;
    if (status === 'Dikemas') return 3;
    if (status === 'Diproses' || status === 'Disetujui') return 2;
    if (paymentStatus === 'Lunas' || status === 'Dibayar') return 1;
    return 0; // Menunggu Pembayaran / Verifikasi
  };

  const currentStep = matchedOrder
    ? getStepIndex(matchedOrder.orderStatus, matchedOrder.paymentStatus)
    : 0;

  const stepsList = [
    { title: 'Menunggu Bayar', desc: 'Pesanan Dibuat' },
    { title: 'Dibayar', desc: 'Pembayaran Lunas' },
    { title: 'Diproses', desc: 'Verifikasi Tim' },
    { title: 'Dikemas', desc: 'Quality Check' },
    { title: 'Dikirim', desc: 'Diserahkan Kurir' },
    { title: 'Selesai', desc: 'Diterima Pelanggan' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-pink-100 p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-pink-50 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 border-b border-pink-100/80 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#fbcfe8] to-[#fce7f3] flex items-center justify-center text-[#be185d] shadow-2xs">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-gray-900">
              Lacak Pesanan Flatshoes
            </h2>
            <p className="text-xs text-gray-500">
              Cek status live pesanan Anda secara aman tanpa login menggunakan Nomor Pesanan & Nomor HP.
            </p>
          </div>
        </div>

        {/* Two-Field Verification Form */}
        <form onSubmit={handleVerifyAndTrack} className="space-y-3 bg-pink-50/50 p-4 rounded-2xl border border-pink-200/60">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                1. Nomor Pesanan
              </label>
              <input
                type="text"
                placeholder="Contoh: MCS-2026-1029..."
                value={orderNumberInput}
                onChange={(e) => setOrderNumberInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 bg-white text-xs font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-pink-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                2. Nomor WhatsApp / HP Pembeli
              </label>
              <input
                type="tel"
                placeholder="Contoh: 0819456732451"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 bg-white text-xs font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-pink-300"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-gray-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verifikasi privasi pesanan terjaga</span>
            </span>

            <button
              type="submit"
              className="py-2 px-5 rounded-xl bg-gradient-to-r from-[#d65b7d] to-[#be185d] text-white font-bold text-xs shadow-xs hover:brightness-105 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Verifikasi & Lacak Pesanan</span>
            </button>
          </div>
        </form>

        {/* Error / Not Found Alert */}
        {errorMessage && hasSearched && (
          <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-800 flex items-start gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Pesanan Tidak Ditemukan</p>
              <p className="text-[11px] text-red-700 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Matched Order Details */}
        {matchedOrder && (
          <div className="space-y-5 animate-fade-in">
            {/* Header Status Bar */}
            <div className="p-4 bg-[#fffbfc] rounded-2xl border border-pink-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Nomor Pesanan</span>
                <span className="font-mono font-extrabold text-base text-[#be185d]">
                  {matchedOrder.orderNumber}
                </span>
                <p className="text-[11px] text-gray-500">
                  Dipesan pada: {new Date(matchedOrder.createdAt).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Status Pesanan</span>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    matchedOrder.orderStatus === 'Dibatalkan' || matchedOrder.orderStatus === 'Ditolak'
                      ? 'bg-red-100 text-red-800'
                      : matchedOrder.orderStatus === 'Selesai'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-pink-100 text-[#be185d]'
                  }`}
                >
                  {matchedOrder.orderStatus}
                </span>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="bg-pink-50/40 p-4 rounded-2xl border border-pink-100 space-y-3">
              <span className="text-xs font-bold text-gray-700 block">Alur Status Live Pesanan:</span>
              
              {matchedOrder.orderStatus === 'Dibatalkan' || matchedOrder.orderStatus === 'Ditolak' ? (
                <div className="p-4 bg-red-50 text-red-900 rounded-2xl border border-red-200 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-red-800">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Status Pesanan: {matchedOrder.orderStatus}</span>
                  </div>
                  <p className="text-red-700 text-xs">
                    <span className="font-semibold">Alasan:</span>{' '}
                    <span>{matchedOrder.rejectionReason || 'Dibatalkan / Pembayaran tidak terkonfirmasi'}</span>
                  </p>
                  <p className="text-[10px] text-gray-500 pt-1">
                    Stok sepatu telah otomatis dipulihkan ke stok toko. Anda dapat melakukan pemesanan ulang kapan saja.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-6 gap-1 text-center">
                  {stepsList.map((st, idx) => {
                    const isPassed = currentStep >= idx;
                    const isCurrent = currentStep === idx;
                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isCurrent
                              ? 'bg-[#be185d] text-white ring-4 ring-pink-200 animate-pulse'
                              : isPassed
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          {isPassed && !isCurrent ? '✓' : idx + 1}
                        </div>
                        <span
                          className={`text-[10px] font-bold mt-1.5 leading-tight ${
                            isCurrent
                              ? 'text-[#be185d]'
                              : isPassed
                              ? 'text-gray-900'
                              : 'text-gray-400'
                          }`}
                        >
                          {st.title}
                        </span>
                        <span className="text-[8px] text-gray-400 hidden sm:block">
                          {st.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Courier & Tracking Number Card with Shipping Date */}
            <div className="p-4 bg-white rounded-2xl border border-pink-100 shadow-2xs space-y-2 text-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-gray-500 block">Jasa Ekspedisi:</span>
                  <span className="font-bold text-gray-900">{matchedOrder.courier || 'Kurir Reguler Toko'}</span>
                </div>

                {matchedOrder.shippingDate && (
                  <div>
                    <span className="text-gray-500 block">Tanggal Pengiriman:</span>
                    <span className="font-bold text-gray-800 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-pink-600" />
                      <span>{matchedOrder.shippingDate}</span>
                    </span>
                  </div>
                )}

                <div>
                  <span className="text-gray-500 block">Nomor Resi Pengiriman:</span>
                  {matchedOrder.trackingNumber ? (
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-sm text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded-lg border border-gray-200">
                        {matchedOrder.trackingNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(matchedOrder.trackingNumber || '');
                          setCopiedResi(true);
                          setTimeout(() => setCopiedResi(false), 2000);
                        }}
                        className="p-1 text-gray-500 hover:text-[#be185d] cursor-pointer"
                        title="Salin Resi"
                      >
                        {copiedResi ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">Sedang disiapkan oleh tim gudang</span>
                  )}
                </div>
              </div>
            </div>

            {/* Riwayat Perubahan Status Pesanan (Audit Trail History) */}
            {matchedOrder.statusHistory && matchedOrder.statusHistory.length > 0 && (
              <div className="p-4 bg-white rounded-2xl border border-pink-100 shadow-2xs space-y-2.5 text-xs">
                <span className="font-bold text-gray-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#be185d]" />
                  <span>Riwayat Perjalanan & Status Pesanan:</span>
                </span>
                <div className="space-y-3 border-l-2 border-pink-200 pl-3.5 ml-2 pt-1">
                  {matchedOrder.statusHistory.map((hist, idx) => (
                    <div key={idx} className="relative space-y-0.5">
                      <div className="absolute -left-[20px] top-1 w-2.5 h-2.5 rounded-full bg-[#be185d] border-2 border-white ring-2 ring-pink-200" />
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-gray-900 text-xs">{hist.status}</span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {new Date(hist.timestamp).toLocaleString('id-ID')}
                        </span>
                      </div>
                      {hist.notes && (
                        <p className="text-[11px] text-gray-600 leading-relaxed font-sans">{hist.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Product Items Details with Photos */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-gray-700 block">
                Detail Produk yang Dipesan:
              </span>
              <div className="space-y-2">
                {matchedOrder.items.map((it, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50/60 rounded-2xl border border-gray-200/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-white shrink-0 border border-pink-200">
                        <FlatshoeImage
                          src={it.imageUrl}
                          alt={it.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{it.name}</h4>
                        <p className="text-[11px] text-gray-500">
                          Ukuran: <b className="text-pink-700 font-mono">EU {it.size}</b> • {it.color}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {it.quantity} pasang × {formatRupiah(it.price)}
                        </p>
                      </div>
                    </div>

                    <div className="font-mono font-bold text-sm text-gray-900">
                      {formatRupiah(it.price * it.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary & Payment Info */}
            <div className="p-4 bg-pink-50/40 rounded-2xl border border-pink-100 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal Produk:</span>
                <span>{formatRupiah(matchedOrder.subtotal)}</span>
              </div>
              {matchedOrder.discountAmount ? (
                <div className="flex justify-between text-emerald-600">
                  <span>Diskon:</span>
                  <span>-{formatRupiah(matchedOrder.discountAmount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-gray-600">
                <span>Ongkos Kirim:</span>
                <span>{formatRupiah(matchedOrder.shippingCost)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-gray-900 pt-1.5 border-t border-pink-200">
                <span>Total Tagihan:</span>
                <span className="text-[#be185d]">{formatRupiah(matchedOrder.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-gray-500 pt-1">
                <span>Metode Pembayaran:</span>
                <span className="font-semibold text-gray-700">{matchedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-[11px] text-gray-500">
                <span>Status Pembayaran:</span>
                <span
                  className={`font-bold ${
                    matchedOrder.paymentStatus === 'Lunas' ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {matchedOrder.paymentStatus}
                </span>
              </div>
            </div>

            {/* BUKTI PEMBAYARAN PELANGGAN (UNTUK TRANSFER BANK & QRIS) */}
            {!matchedOrder.paymentMethod.includes('COD') && (
              <div className="p-4 bg-white rounded-2xl border border-pink-200 shadow-2xs space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800 flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-[#be185d]" />
                    <span>Bukti Pembayaran / Slip Transfer:</span>
                  </span>
                  {matchedOrder.paymentProofUrl ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ Sudah Diunggah
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Belum Ada Bukti
                    </span>
                  )}
                </div>

                {proofUploadSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-1.5 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{proofUploadSuccess}</span>
                  </div>
                )}

                {matchedOrder.paymentProofUrl ? (
                  <div className="p-3 bg-pink-50/50 rounded-xl border border-pink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-white border border-pink-200 shrink-0 shadow-2xs">
                        <img
                          src={matchedOrder.paymentProofUrl}
                          alt="Bukti Transfer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Foto Bukti Transfer Asli</p>
                        <p className="text-[10px] text-gray-500">Tersimpan aman & telah diterima tim Admin Mochi Steps</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewProofModal(matchedOrder.paymentProofUrl || null)}
                        className="px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-[#be185d] font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-pink-200"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Foto</span>
                      </button>

                      {matchedOrder.paymentStatus !== 'Lunas' && matchedOrder.orderStatus !== 'Ditolak' && matchedOrder.orderStatus !== 'Dibatalkan' && (
                        <label className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-gray-200 shadow-2xs">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleUploadProof}
                            disabled={isUploadingProof}
                            className="hidden"
                          />
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isUploadingProof ? 'Mengunggah...' : 'Ganti Foto'}</span>
                        </label>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-2">
                    <p className="text-[11px] text-amber-900 font-medium leading-relaxed">
                      Bukti pembayaran belum tersedia untuk pesanan ini. Jika Anda sudah melakukan pembayaran via transfer bank atau QRIS, silakan unggah foto struk agar pesanan segera diverifikasi.
                    </p>

                    {matchedOrder.paymentStatus !== 'Lunas' && matchedOrder.orderStatus !== 'Ditolak' && matchedOrder.orderStatus !== 'Dibatalkan' && (
                      <label className="w-full py-2.5 px-4 rounded-xl bg-[#be185d] hover:bg-[#a2134e] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-all">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadProof}
                          disabled={isUploadingProof}
                          className="hidden"
                        />
                        {isUploadingProof ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Sedang Mengunggah Foto Bukti...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>Unggah Bukti Transfer Sekarang (JPG/PNG)</span>
                          </>
                        )}
                      </label>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Self Cancellation for Unpaid Orders with Automatic Stock Restoration */}
            {matchedOrder.paymentStatus !== 'Lunas' &&
              matchedOrder.orderStatus !== 'Dibatalkan' &&
              matchedOrder.orderStatus !== 'Ditolak' && (
                <div className="p-4 bg-amber-50/90 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-amber-900 block">Ingin Membatalkan Pesanan Ini?</span>
                    <span className="text-[11px] text-amber-700">
                      Anda dapat membatalkan pesanan ini sebelum diverifikasi. Stok sepatu akan langsung dipulihkan ke etalase toko secara otomatis.
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={isCancellingOrder}
                    onClick={async () => {
                      if (
                        confirm(
                          `Apakah Anda yakin ingin membatalkan pesanan #${matchedOrder.orderNumber}? Stok ukuran sepatu akan otomatis dipulihkan ke sistem.`
                        )
                      ) {
                        setIsCancellingOrder(true);
                        try {
                          await cancelCustomerOrder(matchedOrder, 'Dibatalkan oleh Pelanggan Mandiri di Halaman Lacak');
                          alert('Pesanan berhasil dibatalkan dan stok telah otomatis dipulihkan ke etalase toko!');
                        } catch (err: any) {
                          alert('Gagal membatalkan pesanan: ' + (err?.message || 'Error'));
                        } finally {
                          setIsCancellingOrder(false);
                        }
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-red-50 text-red-600 hover:text-red-700 font-bold border border-red-200 text-xs transition-colors cursor-pointer shrink-0 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isCancellingOrder ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Memulihkan Stok...</span>
                      </>
                    ) : (
                      <span>Batalkan Pesanan Ini</span>
                    )}
                  </button>
                </div>
              )}

            {/* Action Box for Completed Orders: Reviews & Returns */}
            {matchedOrder.orderStatus === 'Selesai' && (
              <div className="p-4 bg-gradient-to-r from-pink-50 to-pink-100/60 rounded-2xl border border-pink-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 text-xs">Pesanan Telah Selesai Diterima!</h4>
                    <p className="text-[11px] text-gray-600">Bagaimana kenyamanan flatshoes Mochi Steps Anda?</p>
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                    Garansi Aktif
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedReviewItem(matchedOrder.items[0]);
                      setReviewModalOpen(true);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-[#be185d] hover:bg-[#9d174d] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                    <span>Beri Ulasan Produk</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setReturnModalOpen(true);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-white hover:bg-pink-50 text-[#be185d] font-bold text-xs border border-pink-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Undo2 className="w-4 h-4" />
                    <span>Ajukan Retur / Tukar Ukuran</span>
                  </button>
                </div>
              </div>
            )}

            {/* Direct WhatsApp Contact Button */}
            <div className="flex justify-end gap-2 pt-2">
              <a
                href={`https://wa.me/62819456732451?text=${encodeURIComponent(
                  `Halo Admin Mochi Steps, saya ingin bertanya tentang status pesanan #${matchedOrder.orderNumber} atas nama ${matchedOrder.customerName}. Terima kasih!`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Hubungi CS WhatsApp Toko</span>
              </a>
            </div>
          </div>
        )}

        {/* Modal Zoom Bukti Pembayaran Pelanggan */}
        {previewProofModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md bg-white rounded-3xl p-5 space-y-3 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-pink-100 pb-2">
                <h3 className="font-bold text-sm text-gray-900">Bukti Transfer Pembayaran</h3>
                <button
                  type="button"
                  onClick={() => setPreviewProofModal(null)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden bg-gray-50 border border-gray-200 flex items-center justify-center p-2 min-h-[220px]">
                <img
                  src={previewProofModal}
                  alt="Bukti Transfer Pelanggan"
                  className="max-h-[60vh] w-auto max-w-full rounded-xl object-contain shadow-xs"
                />
              </div>

              <button
                type="button"
                onClick={() => setPreviewProofModal(null)}
                className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        )}
        {/* Modal Beri Ulasan Produk Pembeli */}
        {reviewModalOpen && matchedOrder && selectedReviewItem && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
            <div className="relative w-full max-w-md bg-white rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-pink-100">
              <div className="flex items-center justify-between border-b border-pink-100 pb-3">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <h3 className="font-heading font-extrabold text-base text-gray-900">
                    Beri Ulasan Produk
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Product preview */}
              <div className="p-3 bg-pink-50/50 rounded-2xl border border-pink-100 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-pink-200 shrink-0">
                  <FlatshoeImage src={selectedReviewItem.imageUrl} alt={selectedReviewItem.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-900">{selectedReviewItem.name}</h4>
                  <p className="text-[10px] text-gray-500">
                    Ukuran EU {selectedReviewItem.size} • {selectedReviewItem.color}
                  </p>
                </div>
              </div>

              {reviewSuccessNotice && (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{reviewSuccessNotice}</span>
                </div>
              )}

              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Rating Bintang:
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setReviewRating(st)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          st <= reviewRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-600 ml-2">
                    {reviewRating} dari 5 Bintang
                  </span>
                </div>
              </div>

              {/* Comment text */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Ulasan & Pengalaman Pemakaian:
                </label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Ceritakan seberapa empuk bantalan CloudMochi 8mm dan kenyamanan ukuran sepatu Anda..."
                  className="w-full p-3 rounded-2xl border border-pink-200 text-xs focus:ring-2 focus:ring-pink-300 focus:outline-hidden"
                />
              </div>

              {/* Optional Photo Attachment */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Foto Pemakaian (Opsional):
                </label>
                {reviewPhoto ? (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-pink-200">
                    <img src={reviewPhoto} alt="Foto ulasan" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setReviewPhoto(null)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="py-2.5 px-3 rounded-xl border border-dashed border-pink-300 bg-pink-50/50 hover:bg-pink-50 text-[#be185d] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const base64 = await compressImageFile(file, 600, 0.8);
                          setReviewPhoto(base64);
                        }
                      }}
                      className="hidden"
                    />
                    <Upload className="w-4 h-4" />
                    <span>Unggah Foto Sepatu</span>
                  </label>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReview}
                  disabled={isSubmittingReview}
                  className="px-5 py-2.5 rounded-xl bg-[#be185d] hover:bg-[#9d174d] text-white font-bold text-xs shadow-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Ajukan Retur / Tukar Ukuran */}
        {returnModalOpen && matchedOrder && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
            <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-pink-100">
              <div className="flex items-center justify-between border-b border-pink-100 pb-3">
                <div className="flex items-center gap-2">
                  <Undo2 className="w-5 h-5 text-[#be185d]" />
                  <h3 className="font-heading font-extrabold text-base text-gray-900">
                    Pengajuan Retur / Tukar Ukuran
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setReturnModalOpen(false)}
                  className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 bg-pink-50/60 rounded-2xl text-xs space-y-1 border border-pink-100">
                <p className="font-bold text-gray-900">Pesanan #{matchedOrder.orderNumber}</p>
                <p className="text-gray-600">Pelanggan: {matchedOrder.customerName} ({matchedOrder.customerPhone})</p>
                <p className="text-[11px] text-pink-700 font-medium">
                  {matchedOrder.items.map((it) => `${it.name} (EU ${it.size})`).join(', ')}
                </p>
              </div>

              {returnSuccessNotice && (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{returnSuccessNotice}</span>
                </div>
              )}

              {/* Pilihan Solusi: Tukar Ukuran atau Refund */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700">Pilih Solusi Retur:</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Tukar Ukuran', 'Pengembalian Dana (Refund)'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setReturnType(type)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        returnType === type
                          ? 'border-[#be185d] bg-pink-50 text-[#be185d] shadow-2xs'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ukuran Pengganti jika Tukar Ukuran */}
              {returnType === 'Tukar Ukuran' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Pilih Ukuran Baru yang Diinginkan (EU):
                  </label>
                  <select
                    value={returnRequestedSize}
                    onChange={(e) => setReturnRequestedSize(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-pink-200 text-xs font-bold text-gray-800 bg-white focus:ring-2 focus:ring-pink-300 focus:outline-hidden"
                  >
                    {[36, 37, 38, 39, 40, 41].map((s) => (
                      <option key={s} value={s}>
                        Ukuran EU {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Alasan Retur */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Alasan Retur / Penukaran:
                </label>
                <textarea
                  rows={3}
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="Contoh: Sepatu agak sempit di bagian jari kaki, ingin tukar naik 1 nomor ke EU 39..."
                  className="w-full p-3 rounded-2xl border border-pink-200 text-xs focus:ring-2 focus:ring-pink-300 focus:outline-hidden"
                />
              </div>

              {/* Foto Kondisi Sepatu */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Foto Kondisi Sepatu & Sol (Wajib):
                </label>
                {returnPhoto ? (
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-pink-200">
                    <img src={returnPhoto} alt="Kondisi barang retur" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setReturnPhoto(null)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="py-3 px-3 rounded-xl border border-dashed border-pink-300 bg-pink-50/50 hover:bg-pink-50 text-[#be185d] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const base64 = await compressImageFile(file, 600, 0.8);
                          setReturnPhoto(base64);
                        }
                      }}
                      className="hidden"
                    />
                    <Upload className="w-4 h-4" />
                    <span>Unggah Foto Sepatu & Dus</span>
                  </label>
                )}
              </div>

              {/* Kebijakan Retur Callout */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 leading-relaxed">
                <strong>Kebijakan Retur Mochi Steps:</strong> Sepatu harus dalam kondisi belum dipakai ke luar ruangan dan sol tetap bersih. Stok barang pengganti akan diverifikasi dan disetujui setelah barang fisik retur diterima oleh tim toko.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReturnModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReturn}
                  disabled={isSubmittingReturn}
                  className="px-5 py-2.5 rounded-xl bg-[#be185d] hover:bg-[#9d174d] text-white font-bold text-xs shadow-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingReturn ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan Retur'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
