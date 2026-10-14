import React, { useState } from 'react';
import { 
  Order, 
  OrderStatus, 
  OrderItem,
  MarketplaceChannel
} from '../types';
import { CHANNEL_METADATA } from '../data/initialData';
import { 
  X, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Truck, 
  Package, 
  Calendar, 
  CreditCard, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Layers, 
  Box, 
  Edit3, 
  Save, 
  Printer, 
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Code
} from 'lucide-react';
import { RawJsonViewer } from './RawJsonViewer';

interface OrderDetailModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  onUpdateItemNote: (orderId: string, itemId: string, noteText: string) => void;
  onPrintLabel?: (order: Order) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  onUpdateItemNote,
  onPrintLabel
}) => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<string>('');
  const [activeModalTab, setActiveModalTab] = useState<'overview' | 'raw_json'>('overview');

  if (!isOpen) return null;

  const channelMeta = CHANNEL_METADATA[order.channel] || {
    name: order.channel,
    badgeBg: 'bg-slate-700',
    badgeText: 'text-white',
    logoText: order.channel.toUpperCase()
  };

  const isLocalFleet = order.deliveryCityType === 'istanbul_own_fleet' || order.city.toLowerCase() === 'istanbul';

  const handleStartEditNote = (item: OrderItem) => {
    setEditingItemId(item.id);
    setNoteDraft(item.itemNote || '');
  };

  const handleSaveNote = (itemId: string) => {
    onUpdateItemNote(order.id, itemId, noteDraft.trim());
    setEditingItemId(null);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Created':
        return <span className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-medium">Yeni Sipariş</span>;
      case 'Approved':
        return <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-medium">Onaylandı</span>;
      case 'Picking':
        return <span className="px-2.5 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-medium">Hazırlanıyor</span>;
      case 'Invoiced':
        return <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-medium">Faturalandı</span>;
      case 'Shipped':
        return <span className="px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs font-medium">Kargoda</span>;
      case 'Delivered':
        return <span className="px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-medium">Teslim Edildi</span>;
      case 'Completed':
        return <span className="px-2.5 py-1 rounded bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium">Tamamlandı</span>;
      case 'Cancelled':
        return <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-medium font-semibold">İptal Edildi</span>;
      case 'Returned':
        return <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-medium">İade</span>;
      case 'Problematic':
        return <span className="px-2.5 py-1 rounded bg-red-600/20 text-red-400 border border-red-500/40 text-xs font-medium font-semibold">Sorunlu Sipariş</span>;
      default:
        return <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs">{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded text-xs font-bold ${channelMeta.badgeBg} ${channelMeta.badgeText}`}>
              {channelMeta.name}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Sipariş No: <span className="font-mono text-blue-400">{order.channelOrderNumber}</span>
                </h2>
                {getStatusBadge(order.status)}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {new Date(order.orderDateUtc).toLocaleString('tr-TR')}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">ERP: {order.erpFicheNo || 'Fatura Kesilmedi'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onPrintLabel && (
              <button
                onClick={() => onPrintLabel(order)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-blue-400" />
                <span>Kargo Barkodu Bas</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="px-6 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveModalTab('overview')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeModalTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Sipariş Özeti & Kalemler</span>
            </button>
            <button
              onClick={() => setActiveModalTab('raw_json')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeModalTab === 'raw_json'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-sky-400" />
              <span>Pazaryeri Ham Verisi (Raw JSON)</span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-sky-300">
                {order.rawPayloadJson ? `${Math.max(1, Math.round(new Blob([order.rawPayloadJson]).size / 1024))} KB` : 'JSON'}
              </span>
            </button>
          </div>
          <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
            {order.channel.toUpperCase()} · API Response
          </span>
        </div>

        {/* Modal Scrollable Body */}
        {activeModalTab === 'raw_json' ? (
          <div className="flex-1 overflow-y-auto p-6">
            <RawJsonViewer
              rawJsonString={order.rawPayloadJson}
              rawPayload={order.rawPayload}
              title={`${channelMeta.name} Orijinal Sipariş Yanıtı`}
              sourceChannel={order.channel}
              entityType="Order"
              identifier={order.channelOrderNumber}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Alarmlar ve Özel Bildirimler */}
            <div className="space-y-3">
              {/* 1. Müşteri Mesajı */}
              {order.customerMessage && (
                <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/60 flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider">Müşteri Notu / Özel Mesajı</h4>
                    <p className="text-sm text-slate-200 mt-0.5 italic">"{order.customerMessage}"</p>
                  </div>
                </div>
              )}

            {/* 2. Aynı Müşteriye Ait Çoklu Sipariş Uyarısı */}
            {order.hasMultipleOrdersForCustomer && (
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Aynı Müşteriye Ait 2 Ayrı Sipariş Mevcut (Ayrı Kargo Barkodu Uyarısı!)
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Bu müşterinin sistemde ilişkili diğer siparişi:{' '}
                    <span className="font-mono font-semibold text-white">
                      {order.relatedOrderNumbers?.join(', ') || 'TY-849102945'}
                    </span>
                    . Pazaryeri kargo takip entegrasyonu gereği paketleri tek kolide birleştirmeyiniz, her biri kendi ayrı kargo barkodu ile teslim edilmelidir.
                  </p>
                </div>
              </div>
            )}

            {/* 3. Sevkiyat Öncesi İptal / Sorun Uyarısı */}
            {order.issueType && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                    {order.issueType === 'pre_shipment_cancel' && 'ACİL DURDURMA: Müşteri Kargolamadan İptal Etti!'}
                    {order.issueType === 'return_requested' && 'İADE VE TAZMİN İTİRAZ TAKİBİ'}
                    {order.issueType === 'supply_shortage' && 'TEDARİK / STOK TEMİN KARANTİNASI'}
                    {order.issueType === 'delivery_failed' && 'TESLİMAT BAŞARISIZ / ADRESTE BULUNAMADI'}
                  </h4>
                  <p className="text-xs text-rose-200 mt-0.5 font-medium">
                    {order.issueNotes || 'Operatör kontrolü ve itiraz aksiyonu bekleniyor.'}
                  </p>
                  {order.issueDisputeDeadline && (
                    <p className="text-[11px] text-amber-300 mt-1 font-mono">
                      Pazaryeri İtiraz Süresi: {order.issueDisputeDeadline}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 3 Kolonlu Bilgi Özeti Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Kolon 1: Müşteri & İletişim */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800/80 pb-2">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>Müşteri Bilgileri</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <p className="text-sm font-bold text-white">{order.customerName}</p>
                <p className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-mono">{order.customerPhone}</span>
                </p>
                <p className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{order.customerEmail}</span>
                </p>
                {order.customerTaxNoOrId && (
                  <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                    TCKN / VKN: <span className="font-mono text-slate-300">{order.customerTaxNoOrId}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Kolon 2: Sevkiyat ve Adres */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Teslimat Adresi</span>
                </div>
                {isLocalFleet ? (
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                    Kendi Dağıtımımız (İstanbul)
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-medium">Şehir Dışı / Kargo</span>
                )}
              </div>
              <div className="space-y-1 text-xs text-slate-300">
                <p className="font-semibold text-white">
                  {order.district} / <span className="text-blue-300 uppercase">{order.city}</span>
                </p>
                <p className="text-slate-400 leading-relaxed text-[11px]">{order.shippingAddress}</p>
                {order.billingAddress !== order.shippingAddress && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Fatura Adresi:</span>
                    <p className="text-[11px] text-slate-400 truncate">{order.billingAddress}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Kolon 3: Lojistik & Kargo Bilgileri */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800/80 pb-2">
                <Truck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Kargo & Lojistik</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Taşıyıcı Firma:</span>
                  <span className="font-bold text-white">{order.cargoProvider}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Kargo Barkodu:</span>
                  <span className="font-mono text-blue-400 font-semibold">{order.cargoBarcode}</span>
                </div>
                {order.cargoTrackingNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Takip Numarası:</span>
                    <span className="font-mono text-slate-300">{order.cargoTrackingNumber}</span>
                  </div>
                )}
                {order.cargoSnapshot && (
                  <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Dondurulan Desi / Barem:</span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      {order.cargoSnapshot.estimatedDesi.toFixed(2)} d · {order.cargoSnapshot.estimatedCargoFee.toFixed(2)} TL
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sipariş Kalemleri ve Bileşen Reçetesi (BOM Snapshot) Bölümü */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Sipariş Kalemleri & Dondurulmuş Ürün Reçetesi (BOM)
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Toplam <span className="font-mono font-bold text-white">{order.items.length}</span> Kalem
              </span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {order.items.map((item, idx) => (
                <div key={item.id} className="p-4 space-y-3 hover:bg-slate-900/30 transition-colors">
                  {/* Kalem Ana Satırı */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-12 h-12 rounded-lg object-cover border border-slate-700 bg-slate-800 shrink-0" 
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 shrink-0">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-semibold text-white leading-snug">{item.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                          <span>SKU: <span className="font-mono text-slate-300">{item.productCode}</span></span>
                          <span aria-hidden="true">·</span>
                          <span>Barkod: <span className="font-mono text-slate-300">{item.barcode}</span></span>
                          {item.itemDesi && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>Birim Desi: <span className="font-mono text-slate-300">{item.itemDesi.toFixed(2)} d</span></span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs text-slate-400">
                        <span className="font-mono font-bold text-white text-sm">x{item.quantity}</span> adet
                      </div>
                      <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
                        {item.lineTotal.toFixed(2)} TL
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        (Birim: {item.unitPrice.toFixed(2)} TL + %{item.vatRate} KDV)
                      </div>
                    </div>
                  </div>

                  {/* Kalem Düzeyinde Alt Bilgi Notu (Inline Note) */}
                  <div className="bg-slate-900/90 border border-slate-800/90 rounded-lg p-2.5">
                    {editingItemId === item.id ? (
                      <div className="space-y-2">
                        <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                          <Edit3 className="w-3 h-3 text-blue-400" />
                          <span>Kalem Notunu Düzenle (Tedarik, Kargo, İade vb.):</span>
                        </label>
                        <textarea
                          value={noteDraft}
                          onChange={(e) => setNoteDraft(e.target.value)}
                          placeholder="Bu kaleme ait özel not giriniz (Örn: Depodan 2. parti ürün tahsis edildi)..."
                          className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 resize-none h-16"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingItemId(null)}
                            className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                          >
                            Vazgeç
                          </button>
                          <button
                            onClick={() => handleSaveNote(item.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold transition-colors"
                          >
                            <Save className="w-3 h-3" />
                            <span>Kaydet</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/50">
                            Kalem Notu:
                          </span>
                          <span className="text-slate-300 italic">
                            {item.itemNote || 'Bu kaleme henüz not girilmemiş.'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleStartEditNote(item)}
                          className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium px-2 py-0.5 rounded hover:bg-slate-800 transition-colors"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>{item.itemNote ? 'Notu Düzenle' : 'Not Ekle'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Kaleme Bağlı Dondurulmuş Reçete Bileşenleri (BOM Snapshot) */}
                  {item.snapshots && item.snapshots.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/60 pl-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Sipariş Anında Dondurulan Reçete Bileşenleri (Depo Düşüşü)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {item.snapshots.map((snap) => (
                          <div 
                            key={snap.id} 
                            className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between text-xs"
                          >
                            <div className="space-y-0.5">
                              <p className="font-semibold text-slate-200">{snap.componentTitle}</p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                Kod: {snap.componentProductCode} · Barkod: {snap.componentBarcode}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-mono font-bold text-blue-400">
                                -{snap.totalQuantityDeducted} Adet
                              </span>
                              <p className="text-[10px] text-slate-500 font-mono">
                                Alış: {snap.frozenBuyingCost.toFixed(2)} TL
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Sipariş Toplam Barı */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Sipariş Genel Toplamı:
              </span>
              <div className="text-right">
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {order.totalAmount.toFixed(2)} TL
                </span>
                <p className="text-[10px] text-slate-500">Tahsilat Tipi: {order.paymentType}</p>
              </div>
            </div>
          </div>

          {/* Dondurulmuş Kargo Mutabakat Kartı */}
          {order.cargoSnapshot && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Dondurulmuş Kargo Barem ve Mutabakat Özeti
                  </h4>
                </div>
                {order.cargoSnapshot.hasDiscrepancy ? (
                  <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 text-xs font-bold font-mono animate-pulse">
                    Fatura Sapması: +{order.cargoSnapshot.discrepancyDesi?.toFixed(2)} Desi · +{order.cargoSnapshot.discrepancyFee?.toFixed(2)} TL
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-semibold">
                    Mutabakat Tam (Desi ve Navlun Uyumlu)
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Tahmini Desi:</span>
                  <p className="text-sm font-mono font-bold text-white mt-0.5">
                    {order.cargoSnapshot.estimatedDesi.toFixed(2)} Desi
                  </p>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Tahmini Kargo:</span>
                  <p className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
                    {order.cargoSnapshot.estimatedCargoFee.toFixed(2)} TL
                  </p>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Fatura Edilen Desi:</span>
                  <p className="text-sm font-mono font-bold text-white mt-0.5">
                    {order.cargoSnapshot.actualInvoicedDesi?.toFixed(2) || 'Henüz Kesilmedi'} Desi
                  </p>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Fatura Edilen Navlun:</span>
                  <p className="text-sm font-mono font-bold text-white mt-0.5">
                    {order.cargoSnapshot.actualInvoicedFee ? `${order.cargoSnapshot.actualInvoicedFee.toFixed(2)} TL` : 'Bekleniyor'}
                  </p>
                </div>
              </div>

              {order.cargoSnapshot.wasProviderOverridden && (
                <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200">
                  <span className="font-bold">Operatör Kargo Firma Değişikliği:</span>{' '}
                  {order.cargoSnapshot.originalProvider} firması yerine {order.cargoSnapshot.selectedCargoProvider} seçildi.{' '}
                  <span className="italic">Gerekçe: "{order.cargoSnapshot.overriddenReason}"</span>
                </div>
              )}
            </div>
          )}
          </div>
        )}

        {/* Modal Alt Aksiyon Barı (Durum İlerletme Butonları) */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Siparişi İlerlet:</span>
            <span className="font-semibold text-slate-200">{order.status}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {order.status === 'Created' && (
              <button
                onClick={() => onUpdateStatus(order.id, 'Approved')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                Siparişi Onayla
              </button>
            )}

            {(order.status === 'Created' || order.status === 'Approved' || order.status === 'Picking') && (
              <button
                onClick={() => onUpdateStatus(order.id, 'Invoiced')}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                Faturalandır (ERP'ye Aktar)
              </button>
            )}

            {order.status === 'Invoiced' && (
              <button
                onClick={() => onUpdateStatus(order.id, 'Shipped')}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                Kargoya Ver (Sevk Et)
              </button>
            )}

            {order.status === 'Shipped' && (
              <button
                onClick={() => onUpdateStatus(order.id, 'Delivered')}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                Teslim Edildi Olarak İşaretle
              </button>
            )}

            {order.status === 'Delivered' && (
              <button
                onClick={() => onUpdateStatus(order.id, 'Completed')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                Siparişi Tamamla
              </button>
            )}

            {order.status !== 'Cancelled' && order.status !== 'Returned' && order.status !== 'Problematic' && (
              <button
                onClick={() => onUpdateStatus(order.id, 'Problematic')}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-red-950 hover:text-red-300 text-slate-300 rounded-lg text-xs border border-slate-700 transition-colors"
              >
                Sorunluya Al
              </button>
            )}

            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
