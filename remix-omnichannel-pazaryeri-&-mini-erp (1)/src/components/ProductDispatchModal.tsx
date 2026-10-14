import React, { useState, useMemo, useEffect } from 'react';
import { 
  MainProduct, 
  MarketplaceChannel, 
  StoreAccount,
  CategoryMarketplaceMapping,
  BrandMarketplaceMapping,
  ProductDispatchBatchItem
} from '../types';
import { ProductDispatchService } from '../services/productDispatchService';
import { CHANNEL_METADATA } from '../data/initialData';
import { 
  X, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Layers, 
  Tag, 
  Package, 
  Code, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Check,
  ExternalLink,
  Info,
  Server,
  FileCode
} from 'lucide-react';
import { RawJsonViewer } from './RawJsonViewer';

interface ProductDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: MainProduct[];
  stores: StoreAccount[];
  categoryMappings: CategoryMarketplaceMapping[];
  brandMappings: BrandMarketplaceMapping[];
  initialChannel?: MarketplaceChannel | 'all';
  onDispatchSuccess: (updatedProducts: MainProduct[], batchId: string) => void;
  onNavigateToMapping?: () => void;
}

export const ProductDispatchModal: React.FC<ProductDispatchModalProps> = ({
  isOpen,
  onClose,
  products = [],
  stores = [],
  categoryMappings = [],
  brandMappings = [],
  initialChannel = 'trendyol',
  onDispatchSuccess,
  onNavigateToMapping
}) => {
  const [selectedChannel, setSelectedChannel] = useState<MarketplaceChannel>(
    initialChannel === 'all' ? 'trendyol' : initialChannel
  );
  const [activeModalTab, setActiveModalTab] = useState<'products' | 'payload' | 'protocol'>('products');
  const [attributeOverrides, setAttributeOverrides] = useState<Record<string, Record<string | number, any>>>({});
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchResults, setDispatchResults] = useState<{
    batchId: string;
    items: ProductDispatchBatchItem[];
  } | null>(null);
  const [inspectPayloadProduct, setInspectPayloadProduct] = useState<ProductDispatchBatchItem | null>(null);

  // Sync state whenever modal is opened or target channel changed
  useEffect(() => {
    if (isOpen) {
      setSelectedChannel(initialChannel === 'all' ? 'trendyol' : initialChannel);
      setDispatchResults(null);
      setAttributeOverrides({});
      setActiveModalTab('products');
    }
  }, [isOpen, initialChannel]);

  // If modal is not open, do not render
  if (!isOpen) return null;

  // Graceful empty state if no products are passed
  if (!products || products.length === 0) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 text-slate-100 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Ürün Seçilmedi</span>
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-slate-300">
            Pazaryerine aktarılacak ürün bulunamadı. Lütfen ana ürün tablosundan en az bir ürün seçerek tekrar deneyiniz.
          </p>
          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
            >
              Tamam, Listeye Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active store for selected channel
  const activeStore = stores.find(s => s.channel === selectedChannel) || stores[0] || {
    id: `store-${selectedChannel}-default`,
    storeName: `${selectedChannel.toUpperCase()} Mağazası`,
    channel: selectedChannel,
    sellerId: 'DEFAULT-SELLER',
    apiKey: 'live_key_default',
    apiSecret: 'live_sec_default',
    isActive: true,
    syncIntervalMinutes: 5,
    lastOrderSyncUtc: null,
    lastProductSyncUtc: null,
    lastQuestionSyncUtc: null,
    connectionStatus: 'connected'
  };

  // Calculate readiness for each product
  const readinessReports = products.map(prod => {
    const rep = ProductDispatchService.calculateReadiness(
      prod,
      selectedChannel,
      categoryMappings,
      brandMappings
    );

    const overrides = attributeOverrides[prod.id] || {};
    const remainingMissingAttrs = (rep.missingMandatoryAttributes || []).filter(
      attr => !overrides[attr.attributeId] && !overrides[attr.code]
    );

    // Remaining blocking fields
    const hasCategoryMapping = (categoryMappings || []).some(
      m => m.masterCategoryId === prod.masterCategoryId && m.channel === selectedChannel
    );
    const hasBrandMapping = (brandMappings || []).some(
      m => m.masterBrandId === prod.masterBrandId && m.channel === selectedChannel
    );

    return {
      product: prod,
      report: rep,
      hasCategoryMapping,
      hasBrandMapping,
      remainingMissingAttrs,
      isEffectivelyReady: hasCategoryMapping && hasBrandMapping && remainingMissingAttrs.length === 0
    };
  });

  const readyCount = readinessReports.filter(r => r.isEffectivelyReady).length;
  const allReady = readyCount === products.length;

  const handleAttributeChange = (productId: string, attributeId: string | number, value: any) => {
    setAttributeOverrides(prev => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        [attributeId]: value
      }
    }));
  };

  // Auto-fill all required attributes with default or sample values
  const handleAutoFillAllDefaults = () => {
    const newOverrides: Record<string, Record<string | number, any>> = {};

    readinessReports.forEach(({ product, remainingMissingAttrs }) => {
      newOverrides[product.id] = { ...(attributeOverrides[product.id] || {}) };
      remainingMissingAttrs.forEach(attr => {
        const defaultVal = attr.defaultValue || (attr.values && attr.values[0]?.name) || 'Standart';
        newOverrides[product.id][attr.attributeId] = defaultVal;
      });
    });

    setAttributeOverrides(newOverrides);
  };

  // Execute Batch Dispatch
  const handleExecuteDispatch = async () => {
    if (!activeStore) return;
    setIsDispatching(true);

    try {
      const res = await ProductDispatchService.dispatchBatch(
        products,
        selectedChannel,
        activeStore,
        categoryMappings,
        brandMappings,
        attributeOverrides
      );

      setDispatchResults({
        batchId: res.batchId,
        items: res.items
      });

      // Notify parent to update products state in background
      onDispatchSuccess(res.updatedProducts, res.batchId);
    } catch (err: any) {
      console.error('Dispatch error:', err);
    } finally {
      setIsDispatching(false);
    }
  };

  // Sample outgoing payload for preview tab
  const sampleProduct = products[0];
  const sampleCatMap = categoryMappings.find(
    m => m.masterCategoryId === sampleProduct?.masterCategoryId && m.channel === selectedChannel
  );
  const sampleBrdMap = brandMappings.find(
    m => m.masterBrandId === sampleProduct?.masterBrandId && m.channel === selectedChannel
  );

  const previewPayload = selectedChannel === 'trendyol' ? {
    items: products.map(p => ({
      barcode: p.masterBarcode,
      title: `${p.title} (${activeStore.storeName})`,
      productMainId: `TY-SKU-${p.masterProductCode}`,
      brandId: sampleBrdMap?.remoteBrandId || 10294,
      categoryId: sampleCatMap?.remoteCategoryId || 412,
      quantity: p.calculatedVirtualStock,
      stockCode: `SKU-${p.masterProductCode}`,
      dimensionalWeight: p.manualDesi || p.calculatedDesi,
      description: p.description,
      currencyType: 'TRY',
      listPrice: +(p.calculatedTotalCost * 1.6).toFixed(2),
      salePrice: +(p.calculatedTotalCost * 1.45).toFixed(2),
      vatRate: 20,
      cargoCompanyId: 10,
      deliveryDuration: p.manualLeadTimeDays || 1,
      images: (p.images || []).map(img => ({ url: img?.url || '' })),
      attributes: Object.entries({
        ...(p.marketplaceAttributes?.[selectedChannel] || {}),
        ...(attributeOverrides[p.id] || {})
      }).map(([k, v]) => ({
        attributeId: parseInt(String(k), 10) || 338,
        customAttributeValue: String(v)
      }))
    }))
  } : {
    channel: selectedChannel,
    merchantId: activeStore.sellerId,
    batchTimestamp: new Date().toISOString(),
    items: products.map(p => ({
      barcode: p.masterBarcode,
      sku: `${selectedChannel.toUpperCase()}-${p.masterProductCode}`,
      title: `${p.title} (${activeStore.storeName})`,
      price: +(p.calculatedTotalCost * 1.45).toFixed(2),
      stock: p.calculatedVirtualStock,
      attributes: {
        ...(p.marketplaceAttributes?.[selectedChannel] || {}),
        ...(attributeOverrides[p.id] || {})
      }
    }))
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-inner">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Pazaryerine Ürün Açma & Aktarım Motoru</span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-600/20 text-blue-300 border border-blue-500/30 font-mono">
                  {products.length} Ürün Seçili
                </span>
                {readyCount === products.length ? (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Yayına Hazır (%100)
                  </span>
                ) : (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {products.length - readyCount} Üründe Eksik Var
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Kategori eşlemesi, marka doğrulaması ve pazaryeri API'sinin beklediği zorunlu teknik nitelikler (attributes).
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Nav Bar (Tabs & Channel Selector) */}
        <div className="px-6 py-2.5 border-b border-slate-800/80 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Channel Selector Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Hedef Kanal:
            </span>
            {(['trendyol', 'hepsiburada', 'n11', 'pazarama'] as MarketplaceChannel[]).map((ch) => {
              const meta = CHANNEL_METADATA[ch];
              const isSelected = selectedChannel === ch;

              return (
                <button
                  key={ch}
                  onClick={() => {
                    setSelectedChannel(ch);
                    setDispatchResults(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md ring-1 ring-blue-400'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-slate-500'}`} />
                  <span>{meta?.name || ch}</span>
                </button>
              );
            })}
          </div>

          {/* Modal View Tabs */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveModalTab('products')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                activeModalTab === 'products' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1. Ürünler & Doğrulama ({products.length})
            </button>
            <button
              onClick={() => setActiveModalTab('payload')}
              className={`px-3 py-1 rounded font-medium transition-colors flex items-center gap-1.5 ${
                activeModalTab === 'payload' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Giden API Payload (JSON)</span>
            </button>
            <button
              onClick={() => setActiveModalTab('protocol')}
              className={`px-3 py-1 rounded font-medium transition-colors flex items-center gap-1.5 ${
                activeModalTab === 'protocol' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Canlı Protokol & Headers</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: ÜRÜNLER & DOĞRULAMA */}
          {activeModalTab === 'products' && (
            <>
              {/* Results State (If batch completed) */}
              {dispatchResults ? (
                <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-800/80 space-y-4 shadow-lg animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
                      <div className="p-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <span>Pazaryeri Aktarımı Başarıyla Tamamlandı!</span>
                        <div className="text-xs text-slate-400 font-normal mt-0.5">
                          Pazaryeri API Batch Takip Numarası:
                          <span className="font-mono text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-700 ml-2">
                            {dispatchResults.batchId}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      {dispatchResults.items.length} / {dispatchResults.items.length} Ürün İletildi
                    </span>
                  </div>

                  <div className="space-y-2 pt-2">
                    {dispatchResults.items.map((item, idx) => (
                      <div key={idx} className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-white">{item.channelTitle}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-3">
                            <span>Barkod: <strong className="text-slate-200">{item.listingBarcode}</strong></span>
                            <span>SKU: <strong className="text-slate-200">{item.listingSku}</strong></span>
                            <span>Satış Fiyatı: <strong className="text-emerald-400">{item.salePrice.toFixed(2)} TL</strong></span>
                          </div>
                        </div>
                        <button
                          onClick={() => setInspectPayloadProduct(item)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg text-xs font-mono border border-slate-700 transition-colors"
                        >
                          <Code className="w-3.5 h-3.5" />
                          <span>Giden Ham JSON</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={onClose}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md"
                    >
                      Tamamlandı · Kapat ve Listeyi Güncelle
                    </button>
                  </div>
                </div>
              ) : (
                /* Products List & Readiness Cards */
                <div className="space-y-4">
                  {/* Quick Helper Bar */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        Hedef Mağaza: <strong className="text-white">{activeStore.storeName}</strong> ({selectedChannel.toUpperCase()})
                      </span>
                    </div>

                    {!allReady && (
                      <button
                        onClick={handleAutoFillAllDefaults}
                        className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-semibold transition-colors"
                        title="Tüm zorunlu nitelikleri varsayılan değerlerle anında tamamla"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Zorunlu Alanları Otomatik Doldur</span>
                      </button>
                    )}
                  </div>

                  {/* List of Products */}
                  <div className="space-y-3">
                    {readinessReports.map(({ product, report, hasCategoryMapping, hasBrandMapping, remainingMissingAttrs, isEffectivelyReady }) => {
                      const catMap = categoryMappings.find(
                        m => m.masterCategoryId === product.masterCategoryId && m.channel === selectedChannel
                      );
                      const brdMap = brandMappings.find(
                        m => m.masterBrandId === product.masterBrandId && m.channel === selectedChannel
                      );

                      return (
                        <div 
                          key={product.id}
                          className={`p-4 rounded-xl border transition-all ${
                            isEffectivelyReady 
                              ? 'bg-slate-950/80 border-slate-800' 
                              : 'bg-amber-950/20 border-amber-800/60'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              {product.images && product.images[0] ? (
                                <img 
                                  src={product.images[0].url} 
                                  alt={product.title} 
                                  className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0" 
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 shrink-0">
                                  <Package className="w-6 h-6" />
                                </div>
                              )}
                              <div>
                                <h4 className="text-sm font-bold text-white">{product.title}</h4>
                                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                                  <span>Barkod: <span className="font-mono text-slate-200">{product.masterBarcode}</span></span>
                                  <span aria-hidden="true">·</span>
                                  <span>Stok: <strong className="text-emerald-400">{product.calculatedVirtualStock} adet</strong></span>
                                  <span aria-hidden="true">·</span>
                                  <span>Maliyet: <strong className="text-slate-300">{product.calculatedTotalCost} TL</strong></span>
                                  <span aria-hidden="true">·</span>
                                  <span>Öngörülen Satış: <strong className="text-blue-400">{(product.calculatedTotalCost * 1.45).toFixed(2)} TL</strong></span>
                                </div>
                              </div>
                            </div>

                            {/* Readiness Score Badge */}
                            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                              {isEffectivelyReady ? (
                                <span className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Yayına Hazır (%100)</span>
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>Eksik Alanlar ({remainingMissingAttrs.length + (!hasCategoryMapping ? 1 : 0) + (!hasBrandMapping ? 1 : 0)})</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Mapping Status Strip */}
                          <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-3 text-xs">
                            {/* Category Mapping Badge */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-400">Kategori:</span>
                              {catMap ? (
                                <span className="text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  <span>{catMap.remoteCategoryName} (ID: {catMap.remoteCategoryId})</span>
                                </span>
                              ) : (
                                <span className="text-rose-400 font-medium bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>Kategori Eşleşmedi</span>
                                </span>
                              )}
                            </div>

                            {/* Brand Mapping Badge */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-400">Marka:</span>
                              {brdMap ? (
                                <span className="text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  <span>{brdMap.remoteBrandName} (ID: {brdMap.remoteBrandId})</span>
                                </span>
                              ) : (
                                <span className="text-rose-400 font-medium bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>Marka Eşleşmedi</span>
                                </span>
                              )}
                            </div>

                            {(!hasCategoryMapping || !hasBrandMapping) && onNavigateToMapping && (
                              <button
                                onClick={() => {
                                  onClose();
                                  onNavigateToMapping();
                                }}
                                className="ml-auto text-indigo-400 hover:text-indigo-300 font-semibold text-[11px] flex items-center gap-1"
                              >
                                <span>Eşleme Masasını Aç</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          {/* Mandatory Attributes Filling Form */}
                          {remainingMissingAttrs.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2.5">
                              <div className="text-[11px] font-bold text-amber-300 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                  <span>{selectedChannel.toUpperCase()} için zorunlu ek nitelikleri (Attributes) doldurunuz:</span>
                                </div>
                                <span className="text-slate-400 text-[10px] font-normal">
                                  {remainingMissingAttrs.length} zorunlu nitelik eksik
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {remainingMissingAttrs.map((attr) => {
                                  const currentVal = attributeOverrides[product.id]?.[attr.attributeId] || '';

                                  return (
                                    <div key={attr.attributeId} className="space-y-1">
                                      <label className="block text-[11px] text-slate-300 font-medium">
                                        {attr.name} <span className="text-rose-400">*</span>
                                      </label>
                                      {attr.type === 'select' && attr.values && attr.values.length > 0 ? (
                                        <select
                                          value={currentVal || attr.defaultValue || ''}
                                          onChange={(e) => handleAttributeChange(product.id, attr.attributeId, e.target.value)}
                                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                                        >
                                          <option value="">Seçiniz...</option>
                                          {attr.values.map(v => (
                                            <option key={v.id} value={v.name}>{v.name}</option>
                                          ))}
                                        </select>
                                      ) : (
                                        <input
                                          type="text"
                                          value={currentVal || attr.defaultValue || ''}
                                          onChange={(e) => handleAttributeChange(product.id, attr.attributeId, e.target.value)}
                                          placeholder={attr.placeholder || `${attr.name} giriniz...`}
                                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                                        />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 2: GİDEN API PAYLOAD (JSON) */}
          {activeModalTab === 'payload' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white">Pazaryeri API Batch Gövdesi (Vendor REST JSON):</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Seçilen {products.length} ürün için {selectedChannel.toUpperCase()} resmi ürün açma API'sine gönderilecek tam veri yapısı.
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">
                  {selectedChannel.toUpperCase()} v2 Batch
                </span>
              </div>

              <RawJsonViewer
                rawPayload={previewPayload}
                title={`${selectedChannel.toUpperCase()} Ürün Açma Batch Gövdesi`}
                sourceChannel={selectedChannel}
                entityType="Listing"
                identifier={`batch-${Date.now()}`}
              />
            </div>
          )}

          {/* TAB 3: CANLI PROTOKOL & HEADERS */}
          {activeModalTab === 'protocol' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Server className="w-4 h-4 text-blue-400" />
                  <span>{selectedChannel.toUpperCase()} API Entegrasyon Protokolü</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1.5">
                    <span className="text-[10px] text-slate-500 uppercase block font-sans">Hedef HTTP Endpoint</span>
                    <div className="text-emerald-400 break-all font-semibold">
                      {selectedChannel === 'trendyol'
                        ? `POST https://api.trendyol.com/sapigw/suppliers/${activeStore.sellerId}/v2/products`
                        : selectedChannel === 'hepsiburada'
                        ? `POST https://product-external-sit.hepsiburada.com/products/import`
                        : `POST https://api.${selectedChannel}.com/v1/products/create`}
                    </div>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1.5">
                    <span className="text-[10px] text-slate-500 uppercase block font-sans">Yetkilendirme Başlığı (Auth Header)</span>
                    <div className="text-sky-300 break-all">
                      Authorization: Basic {btoa ? btoa(`${activeStore.apiKey}:${activeStore.apiSecret}`) : 'Token'}
                    </div>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1.5">
                    <span className="text-[10px] text-slate-500 uppercase block font-sans">User-Agent</span>
                    <div className="text-slate-300">
                      User-Agent: {activeStore.sellerId} - SelfIntegration
                    </div>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1.5">
                    <span className="text-[10px] text-slate-500 uppercase block font-sans">Content-Type</span>
                    <div className="text-slate-300">
                      application/json; charset=UTF-8
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-200">
                  <span className="font-bold text-white block">✅ Canlı API Uyum Kontrolü:</span>
                  Pazaryeri satıcı paneli gerçek API anahtarlarınızı girdiğinizde istek bu protokol üzerinden doğrudan pazaryeri REST gateway'ine iletilecektir.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400">
            Aktarım Kanalı: <strong className="text-white capitalize">{selectedChannel}</strong> · Mağaza: <strong className="text-white">{activeStore.storeName}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              {dispatchResults ? 'Kapat' : 'Vazgeç'}
            </button>

            {!dispatchResults && (
              <button
                onClick={handleExecuteDispatch}
                disabled={isDispatching}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                {isDispatching ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Pazaryerine Aktarılıyor...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{products.length} Ürünü {selectedChannel.toUpperCase()}'a Gönder</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Raw Payload Inspector Modal */}
      {inspectPayloadProduct && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-3xl w-full p-6 text-slate-100 shadow-2xl relative space-y-4">
            <button
              onClick={() => setInspectPayloadProduct(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Code className="w-4 h-4 text-sky-400" />
              <span>Giden Pazaryeri JSON Gövdesi: {inspectPayloadProduct.channelTitle}</span>
            </h3>
            <RawJsonViewer
              rawPayload={inspectPayloadProduct.sentPayload}
              title={`${inspectPayloadProduct.channel.toUpperCase()} Giden Batch İlan Gövdesi`}
              sourceChannel={inspectPayloadProduct.channel}
              entityType="Listing"
              identifier={inspectPayloadProduct.listingBarcode}
            />
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectPayloadProduct(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
