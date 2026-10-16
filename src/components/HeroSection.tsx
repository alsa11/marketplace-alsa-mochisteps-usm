import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, ShieldCheck, Heart, Footprints, Ruler } from 'lucide-react';
import { FlatshoeImage } from './FlatshoeImage';

interface HeroSectionProps {
  onExploreClick: () => void;
  onOpenInsoleGuide: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreClick,
  onOpenInsoleGuide,
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#fff2f5] via-[#fff9fa] to-white pt-8 pb-16 lg:pt-14 lg:pb-24">
      {/* Decorative Pastel Background Blobs */}
      <div className="absolute top-10 left-1/4 w-72 h-72 rounded-full bg-pink-200/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-purple-100/40 blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-1/3 w-64 h-64 rounded-full bg-amber-100/30 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headings & Copy */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            {/* Top Pill Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-pink-200 shadow-xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#d65b7d] animate-ping" />
              <span className="text-xs font-semibold text-[#a63957] tracking-wide flex items-center gap-1.5 font-heading">
                <Sparkles className="w-3.5 h-3.5 text-[#d65b7d]" />
                Koleksi Baru: CloudMochi Insole 8mm
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-[#2d1c24] leading-[1.15] tracking-tight"
            >
              Langkah Cantik,{' '}
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#d65b7d] via-[#e26d8d] to-[#be185d]">
                Selembut Mochi
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-[#f8b4c4]"
                  viewBox="0 0 200 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 9C50 2 150 2 198 9"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </motion.h1>

            {/* Paragraph Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-base sm:text-lg text-[#6d5660] max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              Sepatu flatshoes wanita modern dengan bantalan memory foam ekstra tebal yang dirancang untuk kaki wanita Indonesia. Bebas pegal dan anti-lecet dari pagi hingga malam.
            </motion.p>

            {/* Micro Feature Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2"
            >
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white border border-pink-100 shadow-2xs text-xs font-semibold text-gray-700">
                <Footprints className="w-4 h-4 text-[#d65b7d]" />
                <span>Busa Mochi 8mm</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white border border-pink-100 shadow-2xs text-xs font-semibold text-gray-700">
                <Heart className="w-4 h-4 text-[#d65b7d]" />
                <span>Tumit Anti Lecet</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white border border-pink-100 shadow-2xs text-xs font-semibold text-gray-700">
                <ShieldCheck className="w-4 h-4 text-[#d65b7d]" />
                <span>Garansi Tukar Size 7 Hari</span>
              </div>
            </motion.div>

            {/* Call To Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-3"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={onExploreClick}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#d65b7d] via-[#e26d8d] to-[#be185d] text-white font-bold text-sm tracking-wide shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/30 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Lihat 12 Koleksi Flatshoes</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenInsoleGuide}
                className="w-full sm:w-auto px-6 py-4 rounded-full bg-white text-[#7d3b4d] font-semibold text-sm border border-pink-200 hover:bg-pink-50/70 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Ruler className="w-4 h-4 text-[#d65b7d]" />
                <span>Panduan Ukuran Kaki</span>
              </motion.button>
            </motion.div>

            {/* Quick Stat Counter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              className="pt-6 grid grid-cols-3 gap-4 border-t border-pink-100/80 max-w-md mx-auto lg:mx-0"
            >
              <div>
                <p className="font-heading font-extrabold text-2xl text-[#8d2a45]">12+</p>
                <p className="text-xs text-gray-500">Model Flatshoes Real</p>
              </div>
              <div>
                <p className="font-heading font-extrabold text-2xl text-[#8d2a45]">4.9/5</p>
                <p className="text-xs text-gray-500">Rating Kepuasan</p>
              </div>
              <div>
                <p className="font-heading font-extrabold text-2xl text-[#8d2a45]">100%</p>
                <p className="text-xs text-gray-500">Foto Asli Real-Life</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Hero Showcase with Floating Shoe */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            
            {/* Ambient Background Circles */}
            <div className="absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-[#fedfe4] via-[#fde2e8] to-[#fcebf0] shadow-inner" />
            <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-pink-300/40 border-dashed animate-spin-slow" />

            {/* Main Floating Shoe Card */}
            <motion.div
              animate={{
                y: [0, -14, 0],
                rotate: [0, 1.5, 0],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative z-10 w-full max-w-sm sm:max-w-md"
            >
              <div className="bg-white/85 backdrop-blur-md rounded-3xl p-5 shadow-2xl shadow-pink-300/30 border border-white/80 group">
                <div className="relative rounded-2xl overflow-hidden aspect-4/3 bg-[#fdf2f4]">
                  <FlatshoeImage
                    src="/shoes/mochi-flat-01.jpg"
                    alt="Mochi Peach Puff Ribbon"
                    shoeName="Mochi Peach Puff Ribbon"
                    color="Pastel Peach Puff"
                    category="Flat Shoes Klasik"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[#be185d] font-bold text-xs shadow-xs border border-pink-200">
                    ⭐ Signature Mochi
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-heading font-bold text-base text-gray-900">
                      Mochi Peach Puff Ribbon
                    </h3>
                    <p className="text-xs text-pink-600 font-medium">
                      Busa CloudMochi 8mm • Pastel Peach Puff
                    </p>
                  </div>
                  <span className="font-heading font-bold text-base text-[#be185d]">
                    Rp 189.000
                  </span>
                </div>
              </div>

              {/* Floating Pill Tag 1 */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -top-4 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-pink-100 flex items-center gap-2"
              >
                <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center text-[#be185d]">
                  🌸
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-medium">Bantalan Busa</p>
                  <p className="text-xs font-bold text-gray-800">Selembut Mochi</p>
                </div>
              </motion.div>

              {/* Floating Pill Tag 2 */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -bottom-4 -right-4 sm:-right-6 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-pink-100 flex items-center gap-2"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">
                  ✓
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-medium">Sol Karet 1cm</p>
                  <p className="text-xs font-bold text-gray-800">Anti Selip & Senyap</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
