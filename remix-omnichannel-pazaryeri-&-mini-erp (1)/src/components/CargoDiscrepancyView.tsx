import React, { useState } from 'react';
import { Order, OrderCargoSnapshot, MarketplaceChannel } from '../types';
import { CHANNEL_METADATA } from '../data/initialData';
import { ErpExporter } from '../services/erpExporter';
import { 
  AlertTriangle, 
  CheckCircle2, 
  FileSpreadsheet, 
  Download, 
  Search, 
  Filter, 
  Truck, 
  Clock, 
  ShieldAlert, 
  ArrowUpRight, 
  FileText, 
  Layers, 
  Info,
  Send,
  Check,
  XCircle,
  HelpCircle,
  TrendingDown
} from 'lucide-react';

interface CargoDiscrepancyViewProps {
  orders: Order[];
  onUpdateClaimStatus: (orderId: string, newStatus: 'PendingClaim' | 'ClaimSubmitted' | 'Resolved' | 'Rejected') => void;
  onOpenOrderDetails?: (orderId: string) => void;
}

export const CargoDiscrepancyView: React.FC<CargoDiscrepancyViewProps> = ({
  orders,
  onUpdateClaimStatus,
  onOpenOrderDetails
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'discrepancyOnly' | 'claimsOnly' | 'resolvedOnly'>('discrepancyOnly');
  const [selectedClaimOrderId, setSelectedClaimOrderId] = useState<string | null>(null);

  // Extract orders with cargo snapshots
  const ordersWithSnapshots = orders.filter(o => !!o.cargoSnapshot);

  // KPI Calculations
  const disputedOrders = ordersWithSnapshots.filter(o => o.cargoSnapshot?.hasDiscrepancy);
  const totalDiscrepancyAmount = disputedOrders.reduce((sum, o) => sum + (o.cargoSnapshot?.discrepancyFee || 0), 0);
  const pendingClaimsCount = ordersWithSnapshots.filter(o => o.cargoSnapshot?.claimStatus === 'PendingClaim').length;
  const submittedClaimsCount = ordersWithSnapshots.filter(o => o.cargoSnapshot?.claimStatus === 'ClaimSubmitted').length;
  const resolvedClaimsCount = ordersWithSnapshots.filter(o => o.cargoSnapshot?.claimStatus === 'Resolved').length;

  // Filter table
  const filteredOrders = ordersWithSnapshots.filter(order => {
    const snap = order.cargoSnapshot!;
    const matchesSearch = 
      order.channelOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.cargoTrackingNumber && order.cargoTrackingNumber.includes(searchTerm));

    const matchesChannel = selectedChannel === 'all' || order.channel === selectedChannel;

    let matchesFilter = true;
    if (filterType === 'discrepancyOnly') {
      matchesFilter = snap.hasDiscrepancy;
    } else if (filterType === 'claimsOnly') {
      matchesFilter = snap.claimStatus === 'ClaimSubmitted' || snap.claimStatus === 'PendingClaim';
    } else if (filterType === 'resolvedOnly') {
      matchesFilter = snap.claimStatus === 'Resolved';
    }

    return matchesSearch && matchesChannel && matchesFilter;
  });

  // Export claims to Excel
  const handleExportClaimsCsv = () => {
    const csv = ErpExporter.generateCargoDiscrepancyClaimCsv(orders);
    ErpExporter.downloadFile(
      csv, 
      `Pazaryeri_Kargo_Uyuşmazlık_Itiraz_Dökümü_${new Date().toISOString().slice(0, 10)}.csv`, 
      'text/csv;charset=utf-8'
    );
  };

  const selectedOrderForModal = orders.find(o => o.id === selectedClaimOrderId);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-red-500/10 text-red-400 rounded-lg">
            <ShieldAlert className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Kargo Fatura Mutabakatı & Desi Uyuşmazlık Masası
              {disputedOrders.length > 0 && (
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                  {disputedOrders.length} Uyuşmazlık Tespit Edildi
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Sipariş anında dondurulan koli desisi ve tahmini kargo ücreti ile kargo şubesinin faturalandırdığı reel tutarlar arasındaki sapma analizi.
            </p>
          </div>
        </div>

        {/* Action Button: Download Dispute File */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleExportClaimsCsv}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-2 shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Pazaryeri İtiraz Excel Dosyası İndir
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-slate-900/50 border border-slate-800 p-3.5 rounded-lg">
          <span className="text-[11px] text-slate-400 block">Denetlenen Sipariş</span>
          <span className="text-xl font-bold text-slate-100 font-mono">{ordersWithSnapshots.length} Sipariş</span>
        </div>

        <div className="bg-slate-900/50 border border-red-900/40 p-3.5 rounded-lg bg-red-950/10">
          <span className="text-[11px] text-red-400 block font-medium flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Haksız Kargo Kesintisi
          </span>
          <span className="text-xl font-bold text-red-400 font-mono">
            +{totalDiscrepancyAmount.toFixed(2)} TL
          </span>
        </div>

        <div className="bg-slate-900/50 border border-amber-900/40 p-3.5 rounded-lg">
          <span className="text-[11px] text-amber-400 block font-medium">İtiraz Bekleyenler</span>
          <span className="text-xl font-bold text-amber-400 font-mono">{pendingClaimsCount} Adet</span>
        </div>

        <div className="bg-slate-900/50 border border-blue-900/40 p-3.5 rounded-lg">
          <span className="text-[11px] text-blue-400 block font-medium">İtiraz Gönderilen</span>
          <span className="text-xl font-bold text-blue-400 font-mono">{submittedClaimsCount} Adet</span>
        </div>

        <div className="bg-slate-900/50 border border-emerald-900/40 p-3.5 rounded-lg">
          <span className="text-[11px] text-emerald-400 block font-medium">Çözülen / İade Alınan</span>
          <span className="text-xl font-bold text-emerald-400 font-mono">{resolvedClaimsCount} Sipariş</span>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/70 p-3 rounded-lg border border-slate-800">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Sipariş no, müşteri veya kargo ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Channel Filter */}
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tüm Pazaryerleri</option>
            <option value="trendyol">Trendyol</option>
            <option value="hepsiburada">Hepsiburada</option>
            <option value="n11">N11</option>
          </select>

          {/* Discrepancy Status Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800 text-[11px]">
            <button
              onClick={() => setFilterType('discrepancyOnly')}
              className={`px-2 py-1 rounded transition-colors ${
                filterType === 'discrepancyOnly' 
                  ? 'bg-red-600 text-white font-medium' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Uyuşmazlıklar ({disputedOrders.length})
            </button>
            <button
              onClick={() => setFilterType('claimsOnly')}
              className={`px-2 py-1 rounded transition-colors ${
                filterType === 'claimsOnly' 
                  ? 'bg-blue-600 text-white font-medium' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              İtiraz Sürecindekiler
            </button>
            <button
              onClick={() => setFilterType('all')}
              className={`px-2 py-1 rounded transition-colors ${
                filterType === 'all' 
                  ? 'bg-slate-800 text-white font-medium' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tümü ({ordersWithSnapshots.length})
            </button>
          </div>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          {filteredOrders.length} sipariş listeleniyor
        </span>
      </div>

      {/* Main Discrepancy Comparison Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Sipariş Bilgisi</th>
                <th className="py-3 px-4">Kargo Firması</th>
                <th className="py-3 px-4 text-center">Hesaplanan Koli Desisi</th>
                <th className="py-3 px-4 text-center">Şubenin Ölçtüğü Desi</th>
                <th className="py-3 px-4 text-center">Desi Farkı (Δ Desi)</th>
                <th className="py-3 px-4 text-right">Öngörülen Kargo Bedeli</th>
                <th className="py-3 px-4 text-right">Kesilen Fatura Tutarı</th>
                <th className="py-3 px-4 text-right">Fatura Farkı (Δ Tutar)</th>
                <th className="py-3 px-4 text-center">İtiraz Durumu</th>
                <th className="py-3 px-4 text-center">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredOrders.map((order) => {
                const snap = order.cargoSnapshot!;
                const channelMeta = CHANNEL_METADATA[order.channel];
                const hasDiscrepancy = snap.hasDiscrepancy;

                return (
                  <tr 
                    key={order.id} 
                    className={`transition-colors ${
                      hasDiscrepancy 
                        ? 'hover:bg-red-950/20 bg-red-950/5' 
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Sipariş No & Müşteri */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-100 flex items-center gap-1.5">
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${hasDiscrepancy ? 'bg-red-400' : 'bg-emerald-400'}`} />
                        {order.channelOrderNumber}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {order.customerName} · {order.city}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {new Date(order.orderDateUtc).toLocaleDateString('tr-TR')} · {channelMeta?.name}
                      </div>
                    </td>

                    {/* Kargo Firması */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-blue-400" />
                        {snap.selectedCargoProvider || order.cargoProvider}
                      </div>
                      {snap.wasProviderOverridden && (
                        <div className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 mt-1 inline-block" title={snap.overriddenReason}>
                          Operatör Değiştirdi ({snap.originalProvider} $\rightarrow$ {snap.selectedCargoProvider})
                        </div>
                      )}
                      {order.cargoTrackingNumber && (
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Takip: {order.cargoTrackingNumber}
                        </div>
                      )}
                    </td>

                    {/* Hesaplanan Desi */}
                    <td className="py-3 px-4 text-center font-mono text-slate-300">
                      {snap.estimatedDesi.toFixed(2)} Desi
                      <span className="block text-[10px] text-slate-500">{snap.appliedBaremCode}</span>
                    </td>

                    {/* Şubenin Ölçtüğü Desi */}
                    <td className="py-3 px-4 text-center font-mono">
                      {snap.actualInvoicedDesi !== undefined ? (
                        <span className={snap.actualInvoicedDesi > snap.estimatedDesi ? 'text-amber-400 font-semibold' : 'text-slate-300'}>
                          {snap.actualInvoicedDesi.toFixed(2)} Desi
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">Henüz dönmedi</span>
                      )}
                    </td>

                    {/* Desi Sapması */}
                    <td className="py-3 px-4 text-center font-mono">
                      {snap.discrepancyDesi > 0 ? (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                          +{snap.discrepancyDesi.toFixed(2)} Desi
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-medium">0.00 (Tam Eşleşme)</span>
                      )}
                    </td>

                    {/* Öngörülen Tahmini Ücret */}
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      {snap.estimatedCargoFee.toFixed(2)} TL
                    </td>

                    {/* Kesilen Fatura Tutarı */}
                    <td className="py-3 px-4 text-right font-mono">
                      {snap.actualInvoicedFee !== undefined ? (
                        <span className={snap.actualInvoicedFee > snap.estimatedCargoFee ? 'text-red-400 font-bold' : 'text-slate-300'}>
                          {snap.actualInvoicedFee.toFixed(2)} TL
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">-</span>
                      )}
                    </td>

                    {/* Fatura Farkı */}
                    <td className="py-3 px-4 text-right font-mono">
                      {snap.discrepancyFee > 0 ? (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                          +{snap.discrepancyFee.toFixed(2)} TL
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-medium text-[11px]">0.00 TL</span>
                      )}
                    </td>

                    {/* İtiraz Durumu */}
                    <td className="py-3 px-4 text-center">
                      {snap.claimStatus === 'PendingClaim' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          İtiraz Bekliyor
                        </span>
                      )}
                      {snap.claimStatus === 'ClaimSubmitted' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> İtiraz Edildi
                        </span>
                      )}
                      {snap.claimStatus === 'Resolved' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center gap-1">
                          <Check className="w-2.5 h-2.5" /> İade Alındı
                        </span>
                      )}
                      {snap.claimStatus === 'Rejected' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400">
                          Reddedildi
                        </span>
                      )}
                      {!snap.claimStatus && !snap.hasDiscrepancy && (
                        <span className="text-slate-500 text-[11px]">Mutabık</span>
                      )}
                    </td>

                    {/* Aksiyon */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedClaimOrderId(order.id)}
                        className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-slate-800 rounded transition-colors text-xs font-medium inline-flex items-center gap-1"
                        title="İtiraz ve uyuşmazlık detayını incele"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Detay
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500 text-xs">
                    Seçili filtrelere uygun kargo uyuşmazlık kaydı bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DETAY VE İTİRAZ YÖNETİM MODALI */}
      {/* ========================================================================= */}
      {selectedOrderForModal && selectedOrderForModal.cargoSnapshot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  Kargo Uyuşmazlık Detayı: {selectedOrderForModal.channelOrderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedClaimOrderId(null)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Müşteri ve Sipariş Özeti */}
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Pazaryeri Kanalı:</span>
                <span className="text-slate-200 font-medium">{selectedOrderForModal.channel.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Müşteri & Adres:</span>
                <span className="text-slate-200 font-medium">
                  {selectedOrderForModal.customerName} ({selectedOrderForModal.city} / {selectedOrderForModal.district})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Kargo Takip No:</span>
                <span className="text-slate-200 font-mono">{selectedOrderForModal.cargoTrackingNumber || selectedOrderForModal.cargoBarcode}</span>
              </div>
            </div>

            {/* Karşılaştırma Matrisi */}
            <div className="grid grid-cols-2 gap-3">
              {/* Beyan Edilen / Dondurulan */}
              <div className="bg-blue-950/20 border border-blue-900/40 p-3 rounded-lg text-xs space-y-1.5">
                <span className="text-[11px] text-blue-300 font-semibold uppercase block">
                  1. Depomuzun Ölçümü (Dondurulan)
                </span>
                <div className="text-slate-300">
                  Koli Desisi: <strong className="text-white font-mono">{selectedOrderForModal.cargoSnapshot.estimatedDesi.toFixed(2)} Desi</strong>
                </div>
                <div className="text-slate-300">
                  Öngörülen Barem: <strong className="text-emerald-400 font-mono">{selectedOrderForModal.cargoSnapshot.estimatedCargoFee.toFixed(2)} TL</strong>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Barem Kodu: {selectedOrderForModal.cargoSnapshot.appliedBaremCode}
                </div>
              </div>

              {/* Kargo Şubesinin Kestiği */}
              <div className="bg-red-950/20 border border-red-900/40 p-3 rounded-lg text-xs space-y-1.5">
                <span className="text-[11px] text-red-300 font-semibold uppercase block">
                  2. Kargo Faturası (Pazaryeri Dönüşü)
                </span>
                <div className="text-slate-300">
                  Şube Desisi: <strong className="text-red-300 font-mono">{selectedOrderForModal.cargoSnapshot.actualInvoicedDesi?.toFixed(2) || '-'} Desi</strong>
                </div>
                <div className="text-slate-300">
                  Kesilen Tutar: <strong className="text-red-400 font-mono">{selectedOrderForModal.cargoSnapshot.actualInvoicedFee?.toFixed(2) || '-'} TL</strong>
                </div>
                <div className="text-[10px] text-red-400 font-bold">
                  Haksız Kesinti: +{selectedOrderForModal.cargoSnapshot.discrepancyFee.toFixed(2)} TL
                </div>
              </div>
            </div>

            {/* Operatör Değişikliği Logu */}
            {selectedOrderForModal.cargoSnapshot.wasProviderOverridden && (
              <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-lg text-xs text-amber-300 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  Operatör Tarafından Kargo Değişikliği Yapılmış:
                </div>
                <p className="text-[11px] text-amber-200/90">
                  İlk Kargo: <strong>{selectedOrderForModal.cargoSnapshot.originalProvider}</strong> $\rightarrow$ Seçilen Kargo: <strong>{selectedOrderForModal.cargoSnapshot.selectedCargoProvider}</strong>
                </p>
                <p className="text-[11px] text-slate-400 italic">
                  Gerekçe: "{selectedOrderForModal.cargoSnapshot.overriddenReason || 'Belirtilmedi'}"
                </p>
              </div>
            )}

            {/* İtiraz Durumu Güncelleme Butonları */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400 font-medium block">
                İtiraz ve Çözüm Durumunu Güncelle:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    onUpdateClaimStatus(selectedOrderForModal.id, 'ClaimSubmitted');
                    setSelectedClaimOrderId(null);
                  }}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3 h-3" />
                  İtiraz Gönderildi
                </button>
                <button
                  onClick={() => {
                    onUpdateClaimStatus(selectedOrderForModal.id, 'Resolved');
                    setSelectedClaimOrderId(null);
                  }}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3 h-3" />
                  Kabul Edildi / İade Alındı
                </button>
                <button
                  onClick={() => {
                    onUpdateClaimStatus(selectedOrderForModal.id, 'Rejected');
                    setSelectedClaimOrderId(null);
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium transition-colors"
                >
                  Reddedildi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
