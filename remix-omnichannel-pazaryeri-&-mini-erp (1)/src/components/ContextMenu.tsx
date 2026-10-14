import React, { useEffect, useRef, useState } from 'react';
import { MarketplaceChannel } from '../types';
import { 
  Send, 
  ChevronRight, 
  CheckCircle, 
  Tag, 
  ExternalLink, 
  Copy, 
  Sparkles, 
  Layers, 
  Info, 
  ShoppingBag
} from 'lucide-react';
import { CHANNEL_METADATA } from '../data/initialData';

interface ContextMenuProps {
  x: number;
  y: number;
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  targetProductTitle?: string;
  onDispatch: (channel: MarketplaceChannel | 'all') => void;
  onOpenDetails: () => void;
  onOpenReadiness: () => void;
  onOpenCategoryBrandMapping: () => void;
  onOpenCloneListing?: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  isOpen,
  onClose,
  selectedCount,
  targetProductTitle,
  onDispatch,
  onOpenDetails,
  onOpenReadiness,
  onOpenCategoryBrandMapping,
  onOpenCloneListing
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [adjustedPos, setAdjustedPos] = useState({ x, y });

  // Reposition if menu overflows screen
  useEffect(() => {
    if (!isOpen) return;

    const menuWidth = 240;
    const menuHeight = 280;
    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;

    let posX = x;
    let posY = y;

    if (x + menuWidth > winWidth) {
      posX = winWidth - menuWidth - 10;
    }
    if (y + menuHeight > winHeight) {
      posY = winHeight - menuHeight - 10;
    }

    setAdjustedPos({ x: Math.max(10, posX), y: Math.max(10, posY) });
  }, [x, y, isOpen]);

  // Click outside and ESC listener
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      style={{ left: `${adjustedPos.x}px`, top: `${adjustedPos.y}px` }}
      className="fixed z-50 w-64 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl py-1.5 text-xs text-slate-200 select-none animate-in fade-in duration-100 font-sans"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header Info */}
      <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="font-semibold text-white">
          {selectedCount > 1 ? `${selectedCount} Ürün Seçildi` : 'Seçili Ürün'}
        </span>
        <span className="font-mono text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
          Sağ Tık Menüsü
        </span>
      </div>

      {targetProductTitle && selectedCount === 1 && (
        <div className="px-3 py-1 text-[11px] text-slate-400 truncate max-w-full italic border-b border-slate-800/60">
          "{targetProductTitle}"
        </div>
      )}

      {/* Item 1: Dispatch to Marketplaces (With Submenu) */}
      <div 
        className="relative"
        onMouseEnter={() => setShowSubMenu(true)}
        onMouseLeave={() => setShowSubMenu(false)}
      >
        <button
          onClick={() => {
            onDispatch('trendyol');
            onClose();
          }}
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-blue-600 hover:text-white transition-colors group text-left"
        >
          <div className="flex items-center gap-2 font-medium">
            <Send className="w-4 h-4 text-sky-400 group-hover:text-white" />
            <span>Pazaryerine Aktar...</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
        </button>

        {/* Submenu */}
        {showSubMenu && (
          <div className="absolute left-full top-0 ml-1 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 text-xs text-slate-200 z-50">
            <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800">
              Kanal Seçiniz
            </div>

            <button
              onClick={() => {
                onDispatch('trendyol');
                onClose();
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-orange-600 hover:text-white transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              <span className="font-semibold">Trendyol'a Gönder</span>
            </button>

            <button
              onClick={() => {
                onDispatch('hepsiburada');
                onClose();
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-orange-600 hover:text-white transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-orange-400"></span>
              <span className="font-semibold">Hepsiburada'ya Gönder</span>
            </button>

            <button
              onClick={() => {
                onDispatch('n11');
                onClose();
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-purple-600 hover:text-white transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span className="font-semibold">N11'e Gönder</span>
            </button>

            <div className="my-1 border-t border-slate-800"></div>

            <button
              onClick={() => {
                onDispatch('all');
                onClose();
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-emerald-600 hover:text-white transition-colors font-bold text-emerald-400 group"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white" />
              <span>Tüm Pazaryerlerine Gönder</span>
            </button>
          </div>
        )}
      </div>

      {/* Item 2: Readiness check */}
      <button
        onClick={() => {
          onOpenReadiness();
          onClose();
        }}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 transition-colors text-left"
      >
        <CheckCircle className="w-4 h-4 text-emerald-400" />
        <span>Yayınlanabilirlik Denetimi (Skor)</span>
      </button>

      {/* Item 3: Category & Brand Mapping */}
      <button
        onClick={() => {
          onOpenCategoryBrandMapping();
          onClose();
        }}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 transition-colors text-left"
      >
        <Layers className="w-4 h-4 text-indigo-400" />
        <span>Kategori & Marka Eşlemesi</span>
      </button>

      {onOpenCloneListing && selectedCount === 1 && (
        <button
          onClick={() => {
            onOpenCloneListing();
            onClose();
          }}
          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 transition-colors text-left text-purple-300"
        >
          <Copy className="w-4 h-4 text-purple-400" />
          <span>Klon / Sahte Barkodlu İlan Aç</span>
        </button>
      )}

      <div className="my-1 border-t border-slate-800"></div>

      {/* Item 4: Open Single Details */}
      <button
        onClick={() => {
          onOpenDetails();
          onClose();
        }}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 transition-colors text-left text-slate-300"
      >
        <Info className="w-4 h-4 text-blue-400" />
        <span>Ürün Detayını & Ek Nitelikleri Gör</span>
      </button>
    </div>
  );
};
