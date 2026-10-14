import React, { useState, useMemo } from 'react';
import { 
  Order, 
  OrderStatus, 
  MarketplaceChannel,
  OrderItem
} from '../types';
import { ErpExporter } from '../services/erpExporter';
import { OrderDetailModal } from './OrderDetailModal';
import { 
  Search, 
  FileCode, 
  FileSpreadsheet, 
  Truck, 
  CheckSquare, 
  Square, 
  ExternalLink,
  MessageSquare,
  AlertTriangle,
  MapPin,
  Package,
  Layers,
  Edit3,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Info,
  Calendar,
  Filter,
  Plus,
  Trash2,
  X
} from 'lucide-react';

interface OrdersViewProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onBulkUpdateStatus: (orderIds: string[], newStatus: OrderStatus) => void;
  onAssignErpFicheNo: (orderId: string, ficheNo: string) => void;
  onOverrideCargoProvider?: (orderId: string, newProvider: string, reason: string) => void;
  onUpdateOrderItemNote?: (orderId: string, itemId: string, noteText: string) => void;
}

export type StatusRadioFilter = 
  | 'all' 
  | 'Created' 
  | 'Approved' 
  | 'Invoiced' 
  | 'Shipped' 
  | 'Delivered' 
  | 'Completed' 
  | 'issues';

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onUpdateOrderStatus,
  onBulkUpdateStatus,
  onAssignErpFicheNo,
  onOverrideCargoProvider,
  onUpdateOrderItemNote
}) => {
  // 1. SOL PANEL ARAMA GRUBU STATE'LERİ
  const [orderNoSearch, setOrderNoSearch] = useState('');
  const [invoiceNoSearch, setInvoiceNoSearch] = useState('');
  const [customerNameSearch, setCustomerNameSearch] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 2. SOL PANEL SİPARİŞ DURUMU RADYO BUTONU STATE'İ
  const [statusFilter, setStatusFilter] = useState<StatusRadioFilter>('all');

  // 3. SOL PANEL İL VURGUSU STATE'İ
  const [highlightedCities, setHighlightedCities] = useState<string[]>(['İstanbul']);
  const [onlyHighlightedCities, setOnlyHighlightedCities] = useState<boolean>(false);
  const [customCityInput, setCustomCityInput] = useState('');

  // 4. SEÇİM VE MODALLAR
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [detailModalOrder, setDetailModalOrder] = useState<Order | null>(null);
  const [cargoLabelModalOrder, setCargoLabelModalOrder] = useState<Order | null>(null);
  const [xmlModalOpen, setXmlModalOpen] = useState(false);
  const [xmlContent, setXmlContent] = useState('');
  const [copiedXml, setCopiedXml] = useState(false);
  const [activeCustomerMessageOrder, setActiveCustomerMessageOrder] = useState<Order | null>(null);

  // 5. KALEM DÜZEYİNDE NOT EKLE / DÜZENLE STATE'İ
  const [editingNoteTarget, setEditingNoteTarget] = useState<{ orderId: string; itemId: string } | null>(null);
  const [noteInputText, setNoteInputText] = useState<string>('');

  // Kargo Şirketi Değiştirme (Override)
  const [overrideModalOrder, setOverrideModalOrder] = useState<Order | null>(null);
  const [newSelectedProvider, setNewSelectedProvider] = useState<string>('Aras Kargo');
  const [overrideReasonInput, setOverrideReasonInput] = useState<string>('');

  // SAYAÇLAR (Tüm sipariş havuzu üzerinden radyo butonları için)
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const counts = useMemo(() => {
    return {
      all: orders.length,
      Created: orders.filter(o => o.status === 'Created').length,
      Approved: orders.filter(o => o.status === 'Approved' || o.status === 'Picking').length,
      Invoiced: orders.filter(o => o.status === 'Invoiced').length,
      Shipped: orders.filter(o => o.status === 'Shipped').length,
      Delivered: orders.filter(o => o.status === 'Delivered').length,
      Completed: orders.filter(o => {
        if (o.status !== 'Completed') return false;
        // Varsayılan kural: son 7 gün
        return new Date(o.orderDateUtc) >= sevenDaysAgo;
      }).length,
      CompletedTotal: orders.filter(o => o.status === 'Completed').length,
      issues: orders.filter(o => o.status === 'Problematic' || o.status === 'Cancelled' || o.status === 'Returned' || !!o.issueType).length
    };
  }, [orders, sevenDaysAgo]);

  // AKTİF SİPARİŞLER ARASINDA AYNI MÜŞTERİNİN BAŞKA SİPARİŞİ VAR MI KONTROLÜ (Sadece Yeni ve Onaylılarda!)
  const pendingOrdersByCustomer = useMemo(() => {
    const map = new Map<string, string[]>(); // customerKey -> orderNumbers
    orders.forEach(o => {
      // Sadece yeni ve onaylı siparişler dikkate alınır
      if (o.status === 'Created' || o.status === 'Approved' || o.status === 'Picking') {
        const key = o.customerName.trim().toLowerCase();
        const existing = map.get(key) || [];
        existing.push(o.channelOrderNumber);
        map.set(key, existing);
      }
    });
    return map;
  }, [orders]);

  // FİLTRELEME MANTIĞI
  const isCustomDateApplied = !!(startDate || endDate);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Sipariş Durumu Radyo Filtresi
      if (statusFilter === 'Created' && order.status !== 'Created') return false;
      if (statusFilter === 'Approved' && order.status !== 'Approved' && order.status !== 'Picking') return false;
      if (statusFilter === 'Invoiced' && order.status !== 'Invoiced') return false;
      if (statusFilter === 'Shipped' && order.status !== 'Shipped') return false;
      if (statusFilter === 'Delivered' && order.status !== 'Delivered') return false;
      if (statusFilter === 'Completed' && order.status !== 'Completed') return false;
      if (statusFilter === 'issues') {
        const isIssue = order.status === 'Problematic' || order.status === 'Cancelled' || order.status === 'Returned' || !!order.issueType;
        if (!isIssue) return false;
      }

      // 2. Tamamlanan Siparişler Kuralı:
      // "Siparişler listesinde yeni, onaylı, faturalanmış, kargoda olanların tamamı,
      // tamamlanmış olanların sadece son bir haftaya ait olanları görülmeli.
      // Arama bir tarih aralığı seçimine izin vermeli ve o tarih aralığındaki tüm siparişleri getirebilmeli."
      if (order.status === 'Completed' && !isCustomDateApplied) {
        const orderDate = new Date(order.orderDateUtc);
        if (orderDate < sevenDaysAgo) {
          return false;
        }
      }

      // 3. Sipariş Numarası Araması
      if (orderNoSearch.trim()) {
        const term = orderNoSearch.trim().toLowerCase();
        if (!order.channelOrderNumber.toLowerCase().includes(term)) return false;
      }

      // 4. Fatura / ERP Fiş Numarası Araması
      if (invoiceNoSearch.trim()) {
        const term = invoiceNoSearch.trim().toLowerCase();
        const ficheNo = (order.erpFicheNo || '').toLowerCase();
        if (!ficheNo.includes(term)) return false;
      }

      // 5. Müşteri Adı Araması
      if (customerNameSearch.trim()) {
        const term = customerNameSearch.trim().toLowerCase();
        if (!order.customerName.toLowerCase().includes(term)) return false;
      }

      // 6. Pazaryeri Kanal Filtresi
      if (selectedChannel !== 'all' && order.channel !== selectedChannel) {
        return false;
      }

      // 7. Tarih Aralığı Filtresi
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (new Date(order.orderDateUtc) < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (new Date(order.orderDateUtc) > end) return false;
      }

      // 8. Sadece Vurgulanan İlleri Göster
      if (onlyHighlightedCities) {
        const matchesCity = highlightedCities.some(
          c => c.toLowerCase() === order.city.trim().toLowerCase()
        );
        if (!matchesCity) return false;
      }

      return true;
    });
  }, [
    orders, 
    statusFilter, 
    orderNoSearch, 
    invoiceNoSearch, 
    customerNameSearch, 
    selectedChannel, 
    startDate, 
    endDate, 
    onlyHighlightedCities, 
    highlightedCities,
    isCustomDateApplied,
    sevenDaysAgo
  ]);

  // Seçim işlemleri
  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrderIds(prev => 
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedOrderIds.length === filteredOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map(o => o.id));
    }
  };

  // Kalem Notu Başlat / Kaydet / Temizle
  const handleStartNote = (orderId: string, item: OrderItem) => {
    setEditingNoteTarget({ orderId, itemId: item.id });
    setNoteInputText(item.itemNote || '');
  };

  const handleSaveNote = () => {
    if (!editingNoteTarget) return;
    if (onUpdateOrderItemNote) {
      onUpdateOrderItemNote(editingNoteTarget.orderId, editingNoteTarget.itemId, noteInputText.trim());
    }
    setEditingNoteTarget(null);
    setNoteInputText('');
  };

  const handleDeleteNote = (orderId: string, itemId: string) => {
    if (onUpdateOrderItemNote) {
      onUpdateOrderItemNote(orderId, itemId, '');
    }
    if (editingNoteTarget?.itemId === itemId) {
      setEditingNoteTarget(null);
      setNoteInputText('');
    }
  };

  // Vurgulanacak İl Yönetimi
  const toggleCityHighlight = (city: string) => {
    setHighlightedCities(prev => 
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    );
  };

  const handleAddCustomCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCityInput.trim() && !highlightedCities.includes(customCityInput.trim())) {
      setHighlightedCities(prev => [...prev, customCityInput.trim()]);
      setCustomCityInput('');
    }
  };

  // Filtreleri Sıfırla
  const handleResetFilters = () => {
    setOrderNoSearch('');
    setInvoiceNoSearch('');
    setCustomerNameSearch('');
    setSelectedChannel('all');
    setStartDate('');
    setEndDate('');
    setStatusFilter('all');
    setOnlyHighlightedCities(false);
  };

  // Export İşlemleri
  const handleOpenXmlExport = () => {
    const targetOrders = selectedOrderIds.length > 0 
      ? orders.filter(o => selectedOrderIds.includes(o.id))
      : filteredOrders;
    
    if (targetOrders.length === 0) return;
    const xml = ErpExporter.generateLogoTigerXml(targetOrders);
    setXmlContent(xml);
    setXmlModalOpen(true);
    setCopiedXml(false);
  };

  const handleExportCsv = () => {
    const targetOrders = selectedOrderIds.length > 0 
      ? orders.filter(o => selectedOrderIds.includes(o.id))
      : filteredOrders;
    
    if (targetOrders.length === 0) return;
    const csv = ErpExporter.generateOrdersCsv(targetOrders);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Siparis_Listesi_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 6. İKONLAŞTIRILMIŞ PAZARYERİ VE KARGO ROZETLERİ (Yazılara boğulmayan kompakt ikonlar)
  const renderMarketplaceBadge = (channel: MarketplaceChannel) => {
    switch (channel) {
      case 'trendyol':
        return (
          <div 
            title="Pazaryeri: Trendyol" 
            className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white font-black text-[11px] flex items-center justify-center shadow-sm select-none border border-orange-400/40"
          >
            TY
          </div>
        );
      case 'hepsiburada':
        return (
          <div 
            title="Pazaryeri: Hepsiburada" 
            className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-600 to-amber-700 text-white font-black text-[11px] flex items-center justify-center shadow-sm select-none border border-orange-500/40"
          >
            HB
          </div>
        );
      case 'n11':
        return (
          <div 
            title="Pazaryeri: N11" 
            className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-600 to-rose-700 text-white font-black text-[10px] flex items-center justify-center shadow-sm select-none border border-red-500/40"
          >
            N11
          </div>
        );
      case 'pttavm':
        return (
          <div 
            title="Pazaryeri: PTTAVM" 
            className="w-7 h-7 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-600 text-slate-950 font-black text-[10px] flex items-center justify-center shadow-sm select-none border border-yellow-400/40"
          >
            PTT
          </div>
        );
      case 'pazarama':
        return (
          <div 
            title="Pazaryeri: Pazarama" 
            className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-700 to-indigo-800 text-white font-black text-[10px] flex items-center justify-center shadow-sm select-none border border-blue-500/40"
          >
            PAZ
          </div>
        );
      case 'idefix':
        return (
          <div 
            title="Pazaryeri: İdefix" 
            className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-600 to-emerald-700 text-white font-black text-[10px] flex items-center justify-center shadow-sm select-none border border-teal-500/40"
          >
            IDX
          </div>
        );
      case 'wix':
        return (
          <div 
            title="Pazaryeri: Wix E-Ticaret" 
            className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 text-white font-black text-[10px] flex items-center justify-center shadow-sm select-none border border-slate-600"
          >
            WIX
          </div>
        );
      case 'ticimax':
        return (
          <div 
            title="Pazaryeri: Ticimax E-Ticaret" 
            className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 text-white font-black text-[10px] flex items-center justify-center shadow-sm select-none border border-purple-500/40"
          >
            TCX
          </div>
        );
      default:
        return (
          <div 
            title={`Pazaryeri: ${channel}`} 
            className="w-7 h-7 rounded-lg bg-slate-800 text-slate-200 font-bold text-[10px] flex items-center justify-center border border-slate-700 select-none"
          >
            {(channel as string).slice(0, 3).toUpperCase()}
          </div>
        );
    }
  };

  const renderCargoBadge = (provider: string, barcode: string) => {
    const provLower = provider.toLowerCase();
    let badgeText = 'KRG';
    let badgeBg = 'bg-slate-800 text-slate-200 border-slate-700';

    if (provLower.includes('trendyol express') || provLower.includes('tex')) {
      badgeText = 'TEX';
      badgeBg = 'bg-gradient-to-r from-orange-950 to-slate-900 text-orange-300 border-orange-800/80';
    } else if (provLower.includes('aras')) {
      badgeText = 'ARAS';
      badgeBg = 'bg-gradient-to-r from-red-950 to-blue-950 text-red-300 border-red-800/80';
    } else if (provLower.includes('yurtiçi') || provLower.includes('yurtici')) {
      badgeText = 'YK';
      badgeBg = 'bg-gradient-to-r from-amber-950 to-blue-950 text-amber-300 border-amber-800/80';
    } else if (provLower.includes('hepsijet')) {
      badgeText = 'HJET';
      badgeBg = 'bg-gradient-to-r from-orange-950 to-teal-950 text-amber-300 border-orange-700/80';
    } else if (provLower.includes('mng')) {
      badgeText = 'MNG';
      badgeBg = 'bg-gradient-to-r from-blue-950 to-slate-900 text-blue-300 border-blue-800/80';
    } else if (provLower.includes('sürat') || provLower.includes('surat')) {
      badgeText = 'SRT';
      badgeBg = 'bg-gradient-to-r from-emerald-950 to-slate-900 text-emerald-300 border-emerald-800/80';
    } else if (provLower.includes('ptt')) {
      badgeText = 'PTT';
      badgeBg = 'bg-gradient-to-r from-yellow-950 to-slate-900 text-yellow-300 border-yellow-800/80';
    }

    return (
      <div 
        title={`Kargo: ${provider} | Barkod: ${barcode}`}
        className={`px-2 py-0.5 rounded-md border text-[11px] font-black font-mono tracking-wider flex items-center gap-1 shadow-sm select-none ${badgeBg}`}
      >
        <Truck className="w-3 h-3 shrink-0" />
        <span>{badgeText}</span>
      </div>
    );
  };

  // Durum Rozeti
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Created':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">Yeni</span>;
      case 'Approved':
      case 'Picking':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">Onaylı</span>;
      case 'Invoiced':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">Faturalandı</span>;
      case 'Shipped':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">Kargoda</span>;
      case 'Delivered':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">Teslim Edildi</span>;
      case 'Completed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">Tamamlandı</span>;
      case 'Problematic':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">Sorunlu</span>;
      case 'Cancelled':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950 text-red-300 border border-red-800">İptal</span>;
      case 'Returned':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-950 text-orange-300 border border-orange-800">İade</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">{status}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* 2 SÜTUNLU YAPI: SOL PANEL (GRUP BOXLAR) & SAĞ PANEL (SİPARİŞ LİSTESİ) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* =========================================================================
            SOL PANEL (GRUP BOXLAR: ARAMA, DURUM RADYOLARI, İL VURGUSU - AYRI KAYDIRMA ÇUBUĞU)
            ========================================================================= */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900/50">
          
          {/* GRUP BOX 1: ARAMA & FİLTRELEME */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 text-slate-200 font-bold text-xs">
                <Search className="w-3.5 h-3.5 text-blue-400" />
                <span>Sipariş Arama & Filtre</span>
              </div>
              {(orderNoSearch || invoiceNoSearch || customerNameSearch || startDate || endDate || selectedChannel !== 'all') && (
                <button
                  onClick={handleResetFilters}
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
                >
                  Sıfırla
                </button>
              )}
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Sipariş No */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Sipariş Numarası:
                </label>
                <input
                  type="text"
                  placeholder="Örn: TY-849102941"
                  value={orderNoSearch}
                  onChange={(e) => setOrderNoSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              {/* Fatura / ERP Fiş No */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Fatura / Fiş No:
                </label>
                <input
                  type="text"
                  placeholder="Örn: LOGO-FAT-2026-00481"
                  value={invoiceNoSearch}
                  onChange={(e) => setInvoiceNoSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              {/* Müşteri Adı */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Müşteri Adı:
                </label>
                <input
                  type="text"
                  placeholder="Örn: Ahmet Yılmaz"
                  value={customerNameSearch}
                  onChange={(e) => setCustomerNameSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Tarih Aralığı */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Sipariş Tarih Aralığı:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-blue-500"
                  />
                </div>
                {/* Hızlı Tarih Butonları */}
                <div className="flex items-center gap-1 mt-1.5">
                  <button
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() - 7);
                      setStartDate(d.toISOString().slice(0, 10));
                      setEndDate(new Date().toISOString().slice(0, 10));
                    }}
                    className="flex-1 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-medium"
                  >
                    Son 7 Gün
                  </button>
                  <button
                    onClick={() => {
                      const d = new Date();
                      d.setDate(1);
                      setStartDate(d.toISOString().slice(0, 10));
                      setEndDate(new Date().toISOString().slice(0, 10));
                    }}
                    className="flex-1 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-medium"
                  >
                    Bu Ay
                  </button>
                  <button
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                    }}
                    className="py-0.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded text-[10px]"
                  >
                    Tümü
                  </button>
                </div>
              </div>

              {/* Pazaryeri Kanal Seçimi */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Pazaryeri Kanalı:
                </label>
                <select
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="all">Tüm Pazaryerleri (8 Kanal)</option>
                  <option value="trendyol">Trendyol</option>
                  <option value="hepsiburada">Hepsiburada</option>
                  <option value="amazon">Amazon</option>
                  <option value="n11">N11</option>
                  <option value="ciceksepeti">Çiçeksepeti</option>
                  <option value="pazarama">Pazarama</option>
                  <option value="shopify">Shopify</option>
                  <option value="ticimax">Ticimax</option>
                </select>
              </div>
            </div>
          </div>

          {/* GRUP BOX 2: SİPARİŞ DURUMLARI (RADYO BUTONLARI) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 text-slate-200 font-bold text-xs">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Sipariş Durumu</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {counts.all} toplam
              </span>
            </div>

            {/* Radyo Butonları Listesi */}
            <div className="space-y-1 text-xs">
              {[
                { key: 'all', label: 'Tümü', count: counts.all, dot: 'bg-slate-400' },
                { key: 'Created', label: 'Yeni', count: counts.Created, dot: 'bg-blue-400' },
                { key: 'Approved', label: 'Onaylı', count: counts.Approved, dot: 'bg-amber-400' },
                { key: 'Invoiced', label: 'Faturalanmış', count: counts.Invoiced, dot: 'bg-indigo-400' },
                { key: 'Shipped', label: 'Kargoda', count: counts.Shipped, dot: 'bg-purple-400' },
                { key: 'Delivered', label: 'Teslim Edildi', count: counts.Delivered, dot: 'bg-cyan-400' },
                { 
                  key: 'Completed', 
                  label: isCustomDateApplied ? 'Tamamlandı' : 'Tamamlandı (Son 7 Gün)', 
                  count: isCustomDateApplied ? counts.CompletedTotal : counts.Completed, 
                  dot: 'bg-emerald-400' 
                },
                { key: 'issues', label: 'Sorunlular (İptal/İade/Aksama)', count: counts.issues, dot: 'bg-rose-400' }
              ].map((item) => {
                const isChecked = statusFilter === item.key;
                return (
                  <label
                    key={item.key}
                    onClick={() => setStatusFilter(item.key as StatusRadioFilter)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors border ${
                      isChecked 
                        ? 'bg-blue-950/60 border-blue-600/70 text-white font-semibold shadow-sm' 
                        : 'border-transparent text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="orderStatusFilter"
                        checked={isChecked}
                        onChange={() => setStatusFilter(item.key as StatusRadioFilter)}
                        className="text-blue-600 bg-slate-950 border-slate-700 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                      <span className={`w-2 h-2 rounded-full ${item.dot}`} />
                      <span className="text-xs">{item.label}</span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                      isChecked 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.count}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Bilgilendirme Notu */}
            <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80 text-[10px] text-slate-400 flex items-start gap-1.5 leading-relaxed">
              <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
              <span>
                Yeni, onaylı, faturalanmış ve kargodaki siparişlerin tamamı; tamamlananların ise son 7 güne ait olanları listelenir. Eski tamamlananlar için tarih aralığı seçiniz.
              </span>
            </div>
          </div>

          {/* GRUP BOX 3: İL VE LOKASYON VURGUSU */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 text-slate-200 font-bold text-xs">
                <MapPin className="w-3.5 h-3.5 text-purple-400" />
                <span>İl Vurgulama & Renklendirme</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Seçili illere ait siparişler listede özel renkli etiket ile öne çıkarılır:
              </p>

              {/* Hazır İl Butonları */}
              <div className="flex flex-wrap gap-1.5">
                {['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya'].map((city) => {
                  const isSelected = highlightedCities.includes(city);
                  return (
                    <button
                      key={city}
                      onClick={() => toggleCityHighlight(city)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all border ${
                        isSelected 
                          ? 'bg-purple-950/80 text-purple-200 border-purple-600 shadow-sm' 
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {city}
                    </button>
                  );
                })}
              </div>

              {/* Yeni İl Ekleme Inputu */}
              <form onSubmit={handleAddCustomCity} className="flex gap-1.5 pt-1">
                <input
                  type="text"
                  placeholder="Başka il ekle..."
                  value={customCityInput}
                  onChange={(e) => setCustomCityInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-purple-900/60 hover:bg-purple-800 text-purple-200 rounded text-[11px] font-semibold border border-purple-700/60"
                >
                  Ekle
                </button>
              </form>

              {/* Sadece Vurgulanan İlleri Göster Filtresi */}
              <label className="flex items-center gap-2 pt-1 text-[11px] text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyHighlightedCities}
                  onChange={(e) => setOnlyHighlightedCities(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-purple-600 focus:ring-0 cursor-pointer"
                />
                <span>Sadece vurgulanan illeri listele</span>
              </label>
            </div>
          </div>

        </div>

        {/* =========================================================================
            SAĞ PANEL (SİPARİŞLER HİYERARŞİK LİSTESİ & OPERASYON BARI)
            ========================================================================= */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-3">
          
          {/* SAĞ ÜST İŞLEM VE DIŞA AKTARMA ÇUBUĞU */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleSelectAll}
                className="text-slate-400 hover:text-white flex items-center gap-1.5 text-xs font-medium"
              >
                {selectedOrderIds.length > 0 && selectedOrderIds.length === filteredOrders.length ? (
                  <CheckSquare className="w-4 h-4 text-blue-400" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                <span>Tümünü Seç</span>
              </button>

              <span className="text-slate-600">|</span>

              <span className="text-xs text-slate-300 font-medium">
                Bulunan: <span className="font-mono font-bold text-white">{filteredOrders.length}</span> sipariş
              </span>

              {selectedOrderIds.length > 0 && (
                <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[11px] font-mono font-semibold">
                  {selectedOrderIds.length} seçildi
                </span>
              )}
            </div>

            {/* Aksiyon Butonları */}
            <div className="flex items-center gap-2 flex-wrap">
              {selectedOrderIds.length > 0 && (
                <div className="flex items-center gap-1.5 pr-2 border-r border-slate-800">
                  <button
                    onClick={() => onBulkUpdateStatus(selectedOrderIds, 'Invoiced')}
                    className="px-2.5 py-1 bg-amber-950/70 hover:bg-amber-900 text-amber-300 border border-amber-800 rounded text-xs font-semibold"
                  >
                    Toplu Faturalandır
                  </button>
                  <button
                    onClick={() => onBulkUpdateStatus(selectedOrderIds, 'Shipped')}
                    className="px-2.5 py-1 bg-indigo-950/70 hover:bg-indigo-900 text-indigo-300 border border-indigo-800 rounded text-xs font-semibold"
                  >
                    Toplu Kargola
                  </button>
                </div>
              )}

              <button
                onClick={handleOpenXmlExport}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Logo Tiger XML</span>
              </button>

              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel Dışa Aktar</span>
              </button>
            </div>
          </div>

          {/* SİPARİŞ KARTLARI LİSTESİ */}
          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
                <Package className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <p className="font-semibold text-slate-300">Filtre kriterlerine uygun sipariş bulunamadı.</p>
                <p className="text-xs text-slate-500 mt-1">Sol paneldeki arama terimlerini veya durum radyo seçimini kontrol ediniz.</p>
                <button
                  onClick={handleResetFilters}
                  className="mt-3 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
                >
                  Filtreleri Sıfırla
                </button>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const isSelected = selectedOrderIds.includes(order.id);
                
                // İl Vurgulama Kontrolü (Kullanıcının belirlediği iller renklendirilir)
                const isCityHighlighted = highlightedCities.some(
                  c => c.toLowerCase() === order.city.trim().toLowerCase()
                );

                // Aynı Müşterinin Bekleyen Başka Siparişi Var Mı? (Sadece Yeni ve Onaylılarda Görünür)
                const isOrderActive = order.status === 'Created' || order.status === 'Approved' || order.status === 'Picking';
                const customerActiveOrders = pendingOrdersByCustomer.get(order.customerName.trim().toLowerCase()) || [];
                const hasOtherActiveOrders = isOrderActive && customerActiveOrders.length > 1;
                const otherOrderNos = customerActiveOrders.filter(no => no !== order.channelOrderNumber);

                // Çoklu Kalem Kontrolü
                const totalItemQuantity = order.items.reduce((s, i) => s + i.quantity, 0);
                const hasMultipleItems = order.items.length > 1;

                return (
                  <div 
                    key={order.id}
                    className={`bg-slate-900 border rounded-xl overflow-hidden transition-all shadow-sm ${
                      order.issueType 
                        ? 'border-rose-800/80 bg-rose-950/10' 
                        : isSelected 
                          ? 'border-blue-500/80 bg-blue-950/10' 
                          : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* SİPARİŞ BAŞLIK BANDI */}
                    <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                      
                      {/* Sol Bölüm: Checkbox, İkonlaştırılmış Rozetler, Sipariş No, Tarih, Kargo İkonu, İl ve Durum */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Checkbox */}
                        <button 
                          onClick={() => toggleSelectOrder(order.id)} 
                          className="text-slate-400 hover:text-white"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>

                        {/* İkonlaştırılmış Pazaryeri Rozeti */}
                        {renderMarketplaceBadge(order.channel)}

                        {/* Sipariş Numarası */}
                        <span className="font-mono font-bold text-white text-sm tracking-tight">
                          {order.channelOrderNumber}
                        </span>

                        {/* İkonlaştırılmış Kargo Şirketi Rozeti */}
                        {renderCargoBadge(order.cargoProvider, order.cargoBarcode)}

                        {/* Durum Rozeti */}
                        {getStatusBadge(order.status)}

                        {/* Sipariş Tarihi */}
                        <span className="text-slate-400 text-[11px] font-mono">
                          {new Date(order.orderDateUtc).toLocaleString('tr-TR', { 
                            day: 'numeric', 
                            month: 'short', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>

                        {/* İl / İlçe: Sadece Vurgulanan İller Seçimine Bağlı Renklendirme */}
                        {isCityHighlighted ? (
                          <span 
                            title="Vurgulanan İl Kapsamında"
                            className="px-2 py-0.5 rounded-md bg-purple-950/80 text-purple-200 border border-purple-600/80 text-[11px] font-bold flex items-center gap-1 shadow-sm"
                          >
                            <MapPin className="w-3 h-3 text-purple-300" />
                            <span>{order.city} / {order.district}</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-850 text-slate-400 border border-slate-800 text-[11px] flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            <span>{order.city} / {order.district}</span>
                          </span>
                        )}

                        {/* Çoklu Kalem Bildirim Rozeti */}
                        {hasMultipleItems && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-800 text-[11px] font-bold flex items-center gap-1">
                            <Package className="w-3 h-3 text-blue-400" />
                            <span>{order.items.length} Kalem ({totalItemQuantity} Adet)</span>
                          </span>
                        )}

                        {/* Müşteri Mesajı Varsa İkon */}
                        {order.customerMessage && (
                          <button
                            onClick={() => setActiveCustomerMessageOrder(order)}
                            title={`Müşteri Notu: "${order.customerMessage}"`}
                            className="px-2 py-0.5 rounded-md bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 text-[11px] font-bold flex items-center gap-1 animate-pulse"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Müşteri Notu Var</span>
                          </button>
                        )}
                      </div>

                      {/* Sağ Bölüm: Müşteri Adı, Tutar, Detay Butonu ve Kademeli Durum İlerletme */}
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs text-slate-300 font-semibold block">{order.customerName}</span>
                          <span className="font-mono font-bold text-emerald-400 text-sm">
                            {order.totalAmount.toFixed(2)} TL
                          </span>
                        </div>

                        {/* Detay Butonu */}
                        <button
                          onClick={() => setDetailModalOrder(order)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-700 transition-colors shadow-sm flex items-center gap-1"
                        >
                          <Info className="w-3.5 h-3.5 text-blue-400" />
                          <span>Detay</span>
                        </button>

                        {/* Canlı Kademeli Durum İlerletme Butonları */}
                        {(order.status === 'Created' || order.status === 'Approved' || order.status === 'Picking') && (
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'Invoiced')}
                            className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                          >
                            Faturalandır
                          </button>
                        )}

                        {order.status === 'Invoiced' && (
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'Shipped')}
                            className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                          >
                            Kargola
                          </button>
                        )}

                        {order.status === 'Shipped' && (
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'Delivered')}
                            className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                          >
                            Teslim Et
                          </button>
                        )}

                        {order.status === 'Delivered' && (
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'Completed')}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                          >
                            Tamamla
                          </button>
                        )}
                      </div>
                    </div>

                    {/* AYNI MÜŞTERİNİN BAŞKA SİPARİŞİ VAR UYARISI (Sadece Yeni ve Onaylılarda Görünür) */}
                    {hasOtherActiveOrders && (
                      <div className="px-4 py-2 bg-amber-950/50 border-b border-amber-800/60 flex items-center justify-between text-xs text-amber-200">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                          <span className="font-bold">
                            ⚠️ DİKKAT: Bu müşterinin bekleyen başka bir siparişi daha var! ({otherOrderNos.join(', ')})
                          </span>
                        </div>
                        <span className="text-[11px] text-amber-300/80 font-mono">
                          Ayrı barkod ile sevk edilecektir
                        </span>
                      </div>
                    )}

                    {/* SİPARİŞİN ALT KALEMLERİ LİSTESİ */}
                    <div className="p-3 bg-slate-900/60 divide-y divide-slate-800/60">
                      {order.items.map((item) => {
                        const isEditingThisNote = editingNoteTarget?.orderId === order.id && editingNoteTarget?.itemId === item.id;
                        const hasExistingNote = !!(item.itemNote && item.itemNote.trim().length > 0);

                        return (
                          <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 space-y-2">
                            {/* Kalem Satırı: Thumbnail Görsel, Başlık, Adet, Sanal Stok (Yeni/Onaylıda), Fiyat, '+ Not Ekle' Butonu */}
                            <div className="flex items-center justify-between gap-3 text-xs">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {/* Ürün Thumbnail Görseli */}
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.title}
                                    className="w-10 h-10 rounded-lg object-cover border border-slate-700 bg-slate-800 shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 shrink-0">
                                    <Package className="w-5 h-5" />
                                  </div>
                                )}

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-white text-xs truncate max-w-md">
                                      {item.title}
                                    </span>
                                    <span className="font-mono font-bold text-blue-400 bg-blue-950/60 px-1.5 py-0.2 rounded border border-blue-800/40 text-[11px]">
                                      x{item.quantity} Adet
                                    </span>

                                    {/* YENİ VE ONAYLI SİPARİŞLERDE SANAL STOK GÖSTERİMİ */}
                                    {isOrderActive && item.virtualStock !== undefined && (
                                      item.virtualStock <= 0 ? (
                                        <span className="px-2 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold flex items-center gap-1 animate-pulse">
                                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                                          <span>Sanal Stok YOK (0) - Kritik!</span>
                                        </span>
                                      ) : item.virtualStock <= 5 ? (
                                        <span className="px-2 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold flex items-center gap-1">
                                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                                          <span>Kritik Sanal Stok: {item.virtualStock} Adet</span>
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.2 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 text-[10px] font-medium font-mono">
                                          Sanal Stok: {item.virtualStock} Adet
                                        </span>
                                      )
                                    )}

                                    {/* Eğer not yoksa ve düzenlenmiyorsa: Sadece '+ Not Ekle' butonu görünür */}
                                    {!hasExistingNote && !isEditingThisNote && (
                                      <button
                                        onClick={() => handleStartNote(order.id, item)}
                                        className="text-[11px] text-blue-400 hover:text-blue-300 bg-blue-950/40 hover:bg-blue-900/60 px-2 py-0.5 rounded border border-blue-800/40 font-medium flex items-center gap-1 transition-colors"
                                      >
                                        <Plus className="w-3 h-3" />
                                        <span>Not Ekle</span>
                                      </button>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                                    <span>Barkod: <span className="font-mono text-slate-300">{item.barcode}</span></span>
                                    <span aria-hidden="true">·</span>
                                    <span>SKU: <span className="font-mono text-slate-300">{item.productCode}</span></span>
                                    {item.itemDesi && (
                                      <>
                                        <span aria-hidden="true">·</span>
                                        <span>Desi: <span className="font-mono text-slate-300">{item.itemDesi.toFixed(2)} d</span></span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="font-mono font-bold text-emerald-400 text-xs">
                                  {item.lineTotal.toFixed(2)} TL
                                </span>
                                <span className="text-[10px] text-slate-500 block font-mono">
                                  Birim: {item.unitPrice.toFixed(2)} TL
                                </span>
                              </div>
                            </div>

                            {/* KALEM NOTU ALANI:
                                1. Eğer kalemde not VARSA görüntülenir ve yanında 'Düzenle'/'Sil' butonu olur.
                                2. Düzenleme modundaysa input kutusu açılır.
                                3. Not YOKSA boş alan GÖRÜNMEZ! */}
                            {isEditingThisNote ? (
                              <div className="bg-slate-950 border border-blue-600/60 rounded-lg p-2 flex items-center gap-2">
                                <input
                                  type="text"
                                  value={noteInputText}
                                  onChange={(e) => setNoteInputText(e.target.value)}
                                  placeholder="Kalem notunu yazınız (Tedarik problemi, kargo gecikmesi, iade sebebi vb.)..."
                                  className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                                  autoFocus
                                />
                                <button
                                  onClick={handleSaveNote}
                                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold"
                                >
                                  Kaydet
                                </button>
                                <button
                                  onClick={() => setEditingNoteTarget(null)}
                                  className="px-2 py-1 text-slate-400 hover:text-white text-xs"
                                >
                                  Vazgeç
                                </button>
                              </div>
                            ) : hasExistingNote ? (
                              <div className="bg-slate-950/80 border border-amber-900/40 rounded-lg p-2 text-xs flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-800/50">
                                    Kalem Notu:
                                  </span>
                                  <span className="text-slate-200 italic text-[11px]">
                                    {item.itemNote}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    onClick={() => handleStartNote(order.id, item)}
                                    className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium hover:underline"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    <span>Düzenle</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteNote(order.id, item.id)}
                                    title="Notu Sil"
                                    className="text-slate-500 hover:text-rose-400 transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ) : null}

                          </div>
                        );
                      })}
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

      {/* =========================================================================
          MODALLAR
          ========================================================================= */}
      {/* 1. Detay Modalı (Bileşen Reçetesi ve Tüm Detaylar Burada Yer Alır) */}
      {detailModalOrder && (
        <OrderDetailModal
          order={detailModalOrder}
          isOpen={!!detailModalOrder}
          onClose={() => setDetailModalOrder(null)}
          onUpdateStatus={onUpdateOrderStatus}
          onUpdateItemNote={(orderId, itemId, noteText) => {
            if (onUpdateOrderItemNote) {
              onUpdateOrderItemNote(orderId, itemId, noteText);
            }
          }}
        />
      )}

      {/* 2. Müşteri Mesajı Popup'ı */}
      {activeCustomerMessageOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <MessageSquare className="w-4 h-4" />
                <span>Müşteri Sipariş Mesajı</span>
              </div>
              <button 
                onClick={() => setActiveCustomerMessageOrder(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Sipariş No: <b className="text-white font-mono">{activeCustomerMessageOrder.channelOrderNumber}</b></span>
                <span>Müşteri: <b className="text-white">{activeCustomerMessageOrder.customerName}</b></span>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed p-2 bg-slate-900/60 rounded border border-slate-800/60 italic">
                "{activeCustomerMessageOrder.customerMessage}"
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setActiveCustomerMessageOrder(null)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
              >
                Anladım, Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Logo Tiger XML Modalı */}
      {xmlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <FileCode className="w-4 h-4" />
                <span>Logo Tiger ERP Sipariş Fişi XML Aktarımı</span>
              </div>
              <button 
                onClick={() => setXmlModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 max-h-96 overflow-y-auto">
              <pre>{xmlContent}</pre>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">
                Logo Tiger / Wings ERP aktarım formatı ile tam uyumludur.
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(xmlContent);
                    setCopiedXml(true);
                    setTimeout(() => setCopiedXml(false), 2000);
                  }}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-700"
                >
                  {copiedXml ? 'Kopyalandı!' : 'Metni Kopyala'}
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([xmlContent], { type: 'application/xml' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `LOGO_Orders_${Date.now()}.xml`;
                    link.click();
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
                >
                  XML Dosyasını İndir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
