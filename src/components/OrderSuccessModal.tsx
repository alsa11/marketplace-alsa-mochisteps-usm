import React, { useState } from 'react';
import { CheckCircle2, Copy, Check, MessageCircle, ArrowRight } from 'lucide-react';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  onTrackOrder: (orderNum: string) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  onClose,
  orderNumber,
  onTrackOrder,
}) => {
  if (!isOpen) return null;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappMessage = encodeURIComponent(
    `Halo Mochi Steps Official, saya telah membuat pesanan flatshoes dengan Nomor Pesanan: ${orderNumber}. Mohon bantuan konfirmasi dan proses pengirimannya ya, terima kasih!`
  );
  const whatsappUrl = `https://wa.me/6281934424901?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-pink-100 p-6 sm:p-8 text-center space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Check Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-2xl font-extrabold font-heading text-gray-900">
            Pesanan Berhasil Dibuat!
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
            Terima kasih telah berbelanja di Mochi Steps. Pesananmu telah tersimpan aman di database Firestore kami.
          </p>
        </div>

        {/* Order Number Box */}
        <div className="p-4 rounded-2xl bg-[#fff4f7] border border-pink-200/80 flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
              Nomor Pesanan Anda
            </span>
            <p className="font-mono font-extrabold text-base sm:text-lg text-[#be185d]">
              {orderNumber}
            </p>
          </div>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl bg-white text-[#be185d] border border-pink-200 text-xs font-bold hover:bg-pink-50 transition-colors flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Disalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin</span>
              </>
            )}
          </button>
        </div>

        {/* Buttons */}
        <div className="space-y-2.5 pt-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3.5 px-4 rounded-2xl font-bold text-xs tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Konfirmasi Cepat via WhatsApp</span>
          </a>

          <button
            onClick={() => onTrackOrder(orderNumber)}
            className="w-full py-3 px-4 rounded-2xl font-bold text-xs tracking-wider bg-pink-50 text-[#be185d] hover:bg-pink-100 transition-colors flex items-center justify-center gap-2"
          >
            <span>Lihat Status Pesanan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-gray-600 pt-1 font-medium"
          >
            Kembali ke Toko
          </button>
        </div>
      </div>
    </div>
  );
};
