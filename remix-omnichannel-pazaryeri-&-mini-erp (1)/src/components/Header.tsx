import React, { useState, useRef, useEffect } from 'react';
import { 
  StoreAccount, 
  UserSession, 
  UserRole,
  WorkerStatus 
} from '../types';
import { 
  RefreshCw, 
  Layers, 
  ShieldCheck, 
  Store,
  Pause,
  Play,
  ChevronDown,
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Truck,
  AlertTriangle,
  HelpCircle,
  DollarSign,
  Cpu,
  Settings,
  Code,
  Activity,
  Monitor
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  stores: StoreAccount[];
  selectedStoreId: string;
  onSelectStoreId: (storeId: string) => void;
  user: UserSession;
  onChangeUserRole: (role: UserRole) => void;
  workerStatus: WorkerStatus;
  isSyncing: boolean;
  onTriggerSync: () => void;
  onToggleWorkerPause: () => void;
  discrepancyCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  stores,
  selectedStoreId,
  onSelectStoreId,
  user,
  onChangeUserRole,
  workerStatus,
  isSyncing,
  onTriggerSync,
  onToggleWorkerPause,
  discrepancyCount = 0
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Is operator inside Orders or Product management view?
  const isOperatorFocusMode = currentTab === 'orders' || currentTab === 'main-catalog';

  // Primary visible tabs
  const primaryTabs = isOperatorFocusMode
    ? [
        { id: 'orders', label: 'Sipariş Yönetimi', icon: ShoppingCart },
        { id: 'main-catalog', label: 'Ürün Yönetimi & BOM', icon: Boxes },
        { id: 'wpf-studio', label: '🖥️ WPF & XAML Kodları', icon: Monitor, isHighlight: true }
      ]
    : [
        { id: 'dashboard', label: 'Genel Bakış (Kokpit)', icon: LayoutDashboard },
        { id: 'orders', label: 'Sipariş Yönetimi', icon: ShoppingCart },
        { id: 'main-catalog', label: 'Ürün Yönetimi & BOM', icon: Boxes },
        { id: 'wpf-studio', label: '🖥️ WPF & XAML Kodları', icon: Monitor, isHighlight: true }
      ];

  // Secondary grouped modules (in dropdown)
  const secondaryTabs = [
    ...(isOperatorFocusMode ? [{ id: 'dashboard', label: 'Genel Bakış (Kokpit)', icon: LayoutDashboard, desc: 'Günlük ve aylık özetler, SLA ve gecikmeler' }] : []),
    { id: 'inventory', label: 'Depo Stoğu (Mini ERP)', icon: Boxes, desc: 'Fiziki hammadde ve stok rezervleri' },
    { id: 'category-mapping', label: 'Kategori & Marka Eşleme', icon: Layers, desc: 'Pazaryeri kategori, marka ve nitelik eşleme masası' },
    { id: 'cargo-tariffs', label: 'Kargo & Barem Masası', icon: Truck, desc: 'Pazaryeri desi barem matrisi' },
    { 
      id: 'cargo-discrepancy', 
      label: 'Kargo Mutabakatı & Farklar', 
      icon: AlertTriangle, 
      desc: 'Desi ve navlun sapma itirazları',
      badge: discrepancyCount > 0 ? discrepancyCount : undefined 
    },
    { id: 'questions', label: 'Müşteri Soruları (SLA)', icon: HelpCircle, desc: 'Cevap bekleyen sorular ve süreler' },
    { id: 'finance', label: 'Finans & Hak Ediş', icon: DollarSign, desc: 'Pazaryeri komisyon ve kesinti mutabakatı' },
    { id: 'worker', label: 'Senkronizasyon Worker', icon: Cpu, desc: 'Arka plan otomatik veri eşleme motoru' },
    { id: 'stores', label: 'Mağaza Hesapları & API', icon: Settings, desc: 'Kanal API anahtarları ve yetkiler' },
    { id: 'api-diagnostic', label: 'API & Servis Test Masası', icon: Activity, desc: 'Canlı API doğrulaması ve tüm servislerin sağlık testi' },
    { id: 'wpf-studio', label: 'WPF Ekran Stüdyosu (.xaml)', icon: Monitor, desc: 'Windows 11 Fluent modern ekran tasarımları ve XAML üretici' },
    { id: 'architecture', label: 'C# .NET 8 Mimarisi', icon: Code, desc: 'Backend domain servisleri ve EF Core' }
  ];

  // Check if current tab is one of secondary tabs
  const activeSecondary = secondaryTabs.find(t => t.id === currentTab);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Top Utility Strip */}
      <div className="px-6 py-2 border-b border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-300">
            <Store className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-medium">Aktif Mağaza:</span>
            <select
              value={selectedStoreId}
              onChange={(e) => onSelectStoreId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="all">Tüm Mağazalar (8 Kanal · {stores.length} Mağaza)</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.storeName} ({s.channel.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-slate-500">
            <span aria-hidden="true">·</span>
            <span>Çok Kanallı Pazaryeri Entegrasyonu · Kademeli Sipariş & Kargo Yönetimi</span>
          </div>
        </div>

        {/* Right Info: Background Worker Pulse & JWT Role */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px]">
              <span className={`w-1.5 h-1.5 rounded-full ${workerStatus.isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
              <span className="text-slate-300 font-mono">
                Worker: {workerStatus.isPaused ? 'Durduruldu' : 'Aktif (60s)'}
              </span>
              <button
                onClick={onToggleWorkerPause}
                title={workerStatus.isPaused ? 'Servisi Başlat' : 'Servisi Duraklat'}
                className="ml-1 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {workerStatus.isPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3 text-amber-400" />}
              </button>
            </div>
          </div>

          <span aria-hidden="true">·</span>

          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300">{user.fullName}</span>
            <select
              value={user.role}
              onChange={(e) => onChangeUserRole(e.target.value as UserRole)}
              className="bg-slate-900 border border-slate-800 text-slate-300 rounded px-2.5 py-0.5 text-[11px] font-mono focus:outline-none"
            >
              <option value="Admin">Admin</option>
              <option value="Operator">Operatör</option>
              <option value="Finance">Finans</option>
              <option value="CustomerService">Müşteri Hizmetleri</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Top Bar: Brand — Streamlined Navigation — Action */}
      <div className="flex items-center justify-between gap-6 px-6 py-2.5">
        {/* Brand */}
        <div 
          onClick={() => onSelectTab('dashboard')}
          className="cursor-pointer flex items-center gap-2.5 whitespace-nowrap shrink-0 group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 group-hover:bg-blue-500 transition-colors">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white leading-none">
              OmniChannel <span className="text-blue-400">Mini ERP</span>
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5">Pazaryeri & Sipariş Entegrasyonu</p>
          </div>
        </div>

        {/* Streamlined Navigation */}
        <nav className="flex items-center gap-2">
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            const isHighlight = (tab as { isHighlight?: boolean }).isHighlight;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isActive 
                    ? isHighlight
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 font-bold border border-blue-400'
                      : 'bg-blue-600 text-white shadow-sm' 
                    : isHighlight
                      ? 'bg-blue-950/60 text-blue-300 border border-blue-500/40 hover:bg-blue-900/80 hover:text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : isHighlight ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {isHighlight && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                )}
              </button>
            );
          })}

          {/* Diğer Modüller Açılır Menüsü (Tıklanınca Açılır Üst Menü) */}
          <div className="relative" ref={moreMenuRef}>
            <button
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 border ${
                activeSecondary 
                  ? 'bg-slate-800 text-blue-300 border-blue-500/50 shadow-sm' 
                  : isMoreMenuOpen
                    ? 'bg-slate-800 text-white border-slate-700'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900 border-slate-800'
              }`}
            >
              <span>
                {activeSecondary 
                  ? `Modül: ${activeSecondary.label}` 
                  : isOperatorFocusMode 
                    ? 'Diğer Modüller & Menüler' 
                    : 'Diğer Modüller'}
              </span>
              {discrepancyCount > 0 && !activeSecondary && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isMoreMenuOpen ? 'rotate-180 text-white' : ''}`} />
            </button>

            {/* Dropdown Menu Panel */}
            {isMoreMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800/80 mb-1">
                  Operasyon & Yönetim Araçları
                </div>
                <div className="space-y-0.5">
                  {secondaryTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = currentTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          onSelectTab(tab.id);
                          setIsMoreMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          isActive 
                            ? 'bg-blue-600 text-white font-semibold' 
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <div>
                            <div className="leading-tight">{tab.label}</div>
                            <div className={`text-[10px] mt-0.5 ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                              {tab.desc}
                            </div>
                          </div>
                        </div>

                        {tab.badge !== undefined && (
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono ${
                            isActive ? 'bg-white text-blue-700' : 'bg-red-500 text-white animate-pulse'
                          }`}>
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </nav>
        {/* Sync Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onTriggerSync}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all whitespace-nowrap ${
              isSyncing ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Eşleniyor...' : 'Tüm Kanalları Eşle'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
