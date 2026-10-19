import React from 'react';
import { Smartphone, Tablet, Monitor, X, ChevronDown, Check } from 'lucide-react';

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

interface DeviceSimulatorBarProps {
  currentMode: DeviceMode;
  onModeChange: (mode: DeviceMode) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const DeviceSimulatorBar: React.FC<DeviceSimulatorBarProps> = ({
  currentMode,
  onModeChange,
  isCollapsed,
  onToggleCollapse,
}) => {
  return (
    <aside
      aria-label="Mode Tampilan Perangkat"
      className="sticky top-0 z-50 bg-[#2d1b24] text-white border-b border-pink-950/60 shadow-md text-xs select-none transition-all"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-1.5 flex items-center justify-between gap-2">
        {/* Left: Indicator & Description */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="font-heading font-bold text-[11px] sm:text-xs text-pink-200 tracking-wide shrink-0">
            Preview Mode:
          </span>
          <span className="text-[11px] text-gray-300 truncate hidden md:inline">
            {currentMode === 'mobile' && '📱 Layar HP 390px (Katalog 2 Kolom Compact + Floating Nav)'}
            {currentMode === 'tablet' && '📟 Layar Tablet 768px (iPad Portrait)'}
            {currentMode === 'desktop' && '💻 Layar Desktop Penuh (100% Responsive)'}
          </span>
        </div>

        {/* Center: Device Switcher Buttons */}
        <div className="flex items-center gap-1 bg-[#1a0f15] p-1 rounded-full border border-pink-900/60 shadow-inner">
          <button
            type="button"
            onClick={() => onModeChange('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
              currentMode === 'mobile'
                ? 'bg-gradient-to-r from-[#d65b7d] to-[#be185d] text-white shadow-xs'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            title="Uji Tampilan Layar HP (390px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>HP (390px)</span>
          </button>

          <button
            type="button"
            onClick={() => onModeChange('tablet')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
              currentMode === 'tablet'
                ? 'bg-gradient-to-r from-[#d65b7d] to-[#be185d] text-white shadow-xs'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            title="Uji Tampilan Layar Tablet (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablet (768px)</span>
            <span className="sm:hidden">Tablet</span>
          </button>

          <button
            type="button"
            onClick={() => onModeChange('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
              currentMode === 'desktop'
                ? 'bg-gradient-to-r from-[#d65b7d] to-[#be185d] text-white shadow-xs'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            title="Tampilan Desktop Penuh (Responsive 100%)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
        </div>

        {/* Right: Quick close / hide toggle */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="text-gray-400 hover:text-pink-200 p-1 rounded-md text-[10px] transition-colors cursor-pointer"
            title="Sembunyikan panel simulator"
          >
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </aside>
  );
};
