import React from 'react';
import { 
  Order, 
  Product, 
  CustomerQuestion, 
  StoreAccount, 
  SyncLog,
  MarketplaceChannel
} from '../types';
import { CHANNEL_METADATA } from '../data/initialData';
import { 
  TrendingUp, 
  ShoppingBag, 
  AlertTriangle, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Truck, 
  ShieldAlert, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Package, 
  ExternalLink,
  Flame,
  FileSpreadsheet,
  Monitor
} from 'lucide-react';

interface DashboardViewProps {
  orders: Order[];
  products: Product[];
  questions: CustomerQuestion[];
  stores: StoreAccount[];
  syncLogs: SyncLog[];
  onNavigate: (tab: string) => void;
  onFilterByChannel: (channel: MarketplaceChannel) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  products,
  questions,
  stores,
  syncLogs,
  onNavigate,
  onFilterByChannel
}) => {
  // Tarih ve Zaman Hesaplamaları
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 3600 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 3600 * 1000);

  // 1. Günlük Metrikler (Bugün / Son 24 Saat)
  const todayOrders = orders.filter(o => new Date(o.orderDateUtc) >= oneDayAgo);
  const todayRevenue = todayOrders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const todayOrderCount = todayOrders.length;

  // 2. Aylık Metrikler (Son 30 Gün)
  const monthOrders = orders.filter(o => new Date(o.orderDateUtc) >= thirtyDaysAgo);
  const monthRevenue = monthOrders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const monthOrderCount = monthOrders.length;

  // 3. Operasyonel Göstergeler
  const waitingQuestions = questions.filter(q => q.status === 'WaitingAnswer');
  
  // Sevkiyat öncesi iptal edilenler (Acil Kargo Durdurma Alarmı)
  const preShipmentCancelledOrders = orders.filter(
    o => o.status === 'Cancelled' && (o.issueType === 'pre_shipment_cancel' || o.channelStatusRaw.includes('Cancelled'))
  );

  // Kargo desi ve navlun sapması olanlar
  const cargoDiscrepancies = orders.filter(o => o.cargoSnapshot?.hasDiscrepancy);

  // Gecikme riski olan veya acil kargolanması gerekenler (Created, Approved veya Picking olanlar)
  const pendingShipmentOrders = orders.filter(
    o => o.status === 'Created' || o.status === 'Approved' || o.status === 'Picking'
  );

  // İstanbul yerel dağıtım siparişleri
  const istanbulLocalOrders = orders.filter(
    o => o.deliveryCityType === 'istanbul_own_fleet' || o.city.toLowerCase() === 'istanbul'
  );

  // Kanal bazlı ciro ve sipariş dağılımı
  const channelStats = Object.keys(CHANNEL_METADATA).map(key => {
    const ch = key as MarketplaceChannel;
    const chStores = stores.filter(s => s.channel === ch);
    const chOrders = orders.filter(o => o.channel === ch);
    const chRevenue = chOrders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const meta = CHANNEL_METADATA[ch];
    return {
      channel: ch,
      meta,
      storesCount: chStores.length,
      ordersCount: chOrders.length,
      revenue: chRevenue
    };
  });

  return (
    <div className="space-y-6">
      {/* 1. ÜST BİLGİ & KARŞILAMA ŞERİDİ */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Operatör Karar Destek Kokpiti</h2>
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[11px] font-mono">
                Canlı Entegrasyon
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Günlük sipariş akışı, SLA soru takipleri, kargo çıkış kontrolleri ve desi mutabakat göstergeleri.
            </p>
          </div>

          {/* Hızlı Kısayol Butonları */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onNavigate('orders')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Siparişleri Yönet ({orders.length})</span>
            </button>
            <button
              onClick={() => onNavigate('cargo-tariffs')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Truck className="w-3.5 h-3.5 text-blue-400" />
              <span>Kargo Barem Masası</span>
            </button>
            <button
              onClick={() => onNavigate('main-catalog')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ana Ürün & BOM</span>
            </button>
            <button
              onClick={() => onNavigate('wpf-studio')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg text-xs font-semibold border border-purple-500/30 transition-colors shadow-sm"
              title="Tüm ekranların modern WPF XAML ve C# kodlarını incele"
            >
              <Monitor className="w-3.5 h-3.5 text-purple-400" />
              <span>WPF Ekran Stüdyosu (.xaml)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Özel WPF & C# Kodları Hızlı Erişim Kartı */}
      <div className="bg-gradient-to-r from-blue-950/90 via-slate-900 to-indigo-950/90 border border-blue-500/40 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">🖥️ WPF (XAML & C# MVVM) Ekran Kodları & Canlı Simülatör</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">Windows 11 Fluent</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Tüm ERP ekranlarının <strong>.xaml</strong> ve <strong>ViewModel.cs</strong> kodları, bağımsız <strong>C# simülasyon motoru</strong> ve tek tıkla proje indirme paketi hazırlandı.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('wpf-studio')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Monitor className="w-4 h-4" />
            <span>WPF Ekran & XAML Kodlarını Aç →</span>
          </button>
        </div>
      </div>

      {/* 2. GÜNLÜK & AYLIK SİPARİŞ VE CİRO KARTLARI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Kart 1: Bugünün Cirosu */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Bugünkü Brüt Ciro</span>
            <div className="p-1.5 bg-emerald-950/60 text-emerald-400 rounded-lg border border-emerald-800/40">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">
            {todayRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-2">
            <Calendar className="w-3 h-3 text-slate-500" />
            <span>Bugün gelen <strong className="text-white font-mono">{todayOrderCount}</strong> sipariş</span>
          </div>
        </div>

        {/* Kart 2: Aylık Toplam Ciro */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Aylık Brüt Ciro (30 Gün)</span>
            <div className="p-1.5 bg-blue-950/60 text-blue-400 rounded-lg border border-blue-800/40">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-blue-400 tracking-tight">
            {monthRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-2">
            <Calendar className="w-3 h-3 text-slate-500" />
            <span>Son 30 günde <strong className="text-white font-mono">{monthOrderCount}</strong> sipariş</span>
          </div>
        </div>

        {/* Kart 3: Kargolanmayı Bekleyen Acil Siparişler */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Hazırlanan / Sevk Bekleyen</span>
            <div className="p-1.5 bg-amber-950/60 text-amber-400 rounded-lg border border-amber-800/40">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 tracking-tight">
            {pendingShipmentOrders.length} Sipariş
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-2">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>Kargoya verilecek termin listesi</span>
          </div>
        </div>

        {/* Kart 4: İstanbul Kendi Dağıtım Filomuz */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">İstanbul Yerel Rota</span>
            <div className="p-1.5 bg-emerald-950/60 text-emerald-400 rounded-lg border border-emerald-800/40">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {istanbulLocalOrders.length} Adres
          </div>
          <div className="flex items-center gap-2 text-[11px] text-emerald-400 mt-2 font-medium">
            <span>Kendi aracımızla götürülecek paketler</span>
          </div>
        </div>
      </div>

      {/* 3. KRİTİK OPERATÖR EYLEM MERKEZİ (4 ÖZEL AKSİYON KUTUSU) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* KUTU 1: CEVAP BEKLEYEN MÜŞTERİ SORULARI (SLA ALARMI) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Cevap Bekleyen Müşteri Soruları ({waitingQuestions.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigate('questions')}
              className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
            >
              <span>Tümünü Gör</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {waitingQuestions.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">Cevap bekleyen soru bulunmuyor.</p>
            ) : (
              waitingQuestions.slice(0, 2).map((q) => {
                const chMeta = CHANNEL_METADATA[q.channel] || { name: q.channel, badgeBg: 'bg-slate-700', badgeText: 'text-white' };
                return (
                  <div key={q.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800/90 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${chMeta.badgeBg} ${chMeta.badgeText}`}>
                          {chMeta.name}
                        </span>
                        <span className="font-semibold text-white">{q.customerDisplayName}</span>
                      </div>
                      <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1 font-bold">
                        <Clock className="w-3 h-3" />
                        SLA Süresi İşliyor
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] line-clamp-2 italic">"{q.questionText}"</p>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] text-slate-400">
                      <span className="truncate max-w-[200px]">{q.productTitle}</span>
                      <button
                        onClick={() => onNavigate('questions')}
                        className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-semibold"
                      >
                        Hemen Yanıtla
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* KUTU 2: SEVKİYAT ÖNCESİ İPTAL YAKALAMA (KIRMIZI KARGO DURDURMA ALARMI) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Sevkiyat Öncesi İptal Alarmı (Kargoyu Durdur!)
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold font-mono">
              {preShipmentCancelledOrders.length} Alarm
            </span>
          </div>

          <div className="space-y-2">
            {preShipmentCancelledOrders.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">İptal edilen sevkiyat alarmı yok.</p>
            ) : (
              preShipmentCancelledOrders.slice(0, 2).map((ord) => (
                <div key={ord.id} className="bg-rose-950/20 border border-rose-800/70 p-3 rounded-lg text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white text-xs">{ord.channelOrderNumber}</span>
                    <span className="px-1.5 py-0.2 rounded bg-rose-900 text-white text-[10px] font-bold uppercase tracking-wider">
                      DURDUR: Kuryeye Verme!
                    </span>
                  </div>
                  <p className="text-rose-200 text-[11px]">
                    {ord.issueNotes || 'Müşteri kargoya verilmeden önce iptal talebi oluşturdu.'}
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-rose-800/40 text-[10px] text-slate-400">
                    <span>Barkod: <strong className="font-mono text-slate-200">{ord.cargoBarcode}</strong></span>
                    <button
                      onClick={() => onNavigate('orders')}
                      className="px-2 py-0.5 bg-rose-700 hover:bg-rose-600 text-white rounded text-[10px] font-semibold"
                    >
                      Siparişi Aç
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* KUTU 3: GECİKEN VEYA ACİL ÇIKIŞ BEKLEYEN SİPARİŞLER */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Acil Çıkış Bekleyen Siparişler ({pendingShipmentOrders.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigate('orders')}
              className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
            >
              <span>Siparişler Tablosuna Git</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {pendingShipmentOrders.slice(0, 2).map((ord) => {
              const chMeta = CHANNEL_METADATA[ord.channel] || { name: ord.channel, badgeBg: 'bg-slate-700', badgeText: 'text-white' };
              return (
                <div key={ord.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${chMeta.badgeBg} ${chMeta.badgeText}`}>
                        {chMeta.name}
                      </span>
                      <span className="font-mono font-bold text-white">{ord.channelOrderNumber}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] font-medium">{ord.customerName} · {ord.city}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Taşıyıcı: {ord.cargoProvider} ({ord.cargoBarcode})
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-emerald-400 text-xs block">
                      {ord.totalAmount.toFixed(2)} TL
                    </span>
                    <button
                      onClick={() => onNavigate('orders')}
                      className="mt-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[10px] font-semibold"
                    >
                      Faturalandır
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* KUTU 4: KARGO DESİ & NAVLUN SAPMALARI (MUTABAKAT İTİRAZLARI) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Kargo Desi & Navlun Sapmaları ({cargoDiscrepancies.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigate('cargo-discrepancy')}
              className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
            >
              <span>İtiraz Masasına Git</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {cargoDiscrepancies.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">Fatura sapması olan kargo bulunmuyor.</p>
            ) : (
              cargoDiscrepancies.slice(0, 2).map((ord) => {
                const snap = ord.cargoSnapshot!;
                return (
                  <div key={ord.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{ord.channelOrderNumber}</span>
                        <span className="text-slate-400 text-[10px]">({snap.selectedCargoProvider})</span>
                      </div>
                      <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold font-mono">
                        +{snap.discrepancyDesi?.toFixed(2)} Desi · +{snap.discrepancyFee?.toFixed(2)} TL
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Tahmini: <strong className="text-slate-300">{snap.estimatedDesi.toFixed(2)} d ({snap.estimatedCargoFee.toFixed(2)} TL)</strong></span>
                      <span>Fatura: <strong className="text-rose-400">{snap.actualInvoicedDesi?.toFixed(2)} d ({snap.actualInvoicedFee?.toFixed(2)} TL)</strong></span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 4. PAZARYERİ KANALLARINA GÖRE DAĞILIM VE CİROLAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Pazaryeri Kanallarına Göre Sipariş & Ciro Dağılımı
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {channelStats.map((st) => (
            <div 
              key={st.channel}
              onClick={() => {
                onFilterByChannel(st.channel);
                onNavigate('orders');
              }}
              className="bg-slate-950 p-3 rounded-lg border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${st.meta.badgeBg} ${st.meta.badgeText}`}>
                  {st.meta.name}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{st.ordersCount} Sipariş</span>
              </div>
              <div className="text-sm font-bold font-mono text-emerald-400">
                {st.revenue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
