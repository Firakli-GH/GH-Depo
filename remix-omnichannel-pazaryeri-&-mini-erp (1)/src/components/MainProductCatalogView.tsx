import React, { useState } from 'react';
import { 
  MainProduct, 
  ErpInventoryProduct, 
  ChannelListingProduct, 
  ProductKind, 
  MarketplaceChannel,
  StoreAccount 
} from '../types';
import { CHANNEL_METADATA } from '../data/initialData';
import { ErpExporter } from '../services/erpExporter';
import { ProductService } from '../services/productService';
import { 
  Search, 
  Layers, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  Package, 
  Box, 
  Boxes, 
  Tag, 
  Sparkles, 
  Edit3, 
  Trash2, 
  Download, 
  Upload, 
  Scale, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  ExternalLink,
  X,
  Code,
  Send,
  CheckSquare,
  Square
} from 'lucide-react';
import { RawJsonViewer } from './RawJsonViewer';
import { ContextMenu } from './ContextMenu';
import { ProductDispatchModal } from './ProductDispatchModal';
import { CategoryMarketplaceMapping, BrandMarketplaceMapping } from '../types';
import { 
  INITIAL_CATEGORY_MAPPINGS, 
  INITIAL_BRAND_MAPPINGS,
  INITIAL_MASTER_CATEGORIES,
  INITIAL_MASTER_BRANDS 
} from '../data/categoryBrandData';

interface MainProductCatalogViewProps {
  mainProducts: MainProduct[];
  inventoryList: ErpInventoryProduct[];
  stores: StoreAccount[];
  categoryMappings?: CategoryMarketplaceMapping[];
  brandMappings?: BrandMarketplaceMapping[];
  onUpdateMainProduct: (updated: MainProduct) => void;
  onAddCloneListing: (mainProductId: string, listing: ChannelListingProduct) => void;
  onDeleteListing: (mainProductId: string, listingId: string) => void;
  onOpenMappingView?: () => void;
  onBatchDispatchSuccess?: (updatedProducts: MainProduct[], batchId: string) => void;
}

export const MainProductCatalogView: React.FC<MainProductCatalogViewProps> = ({
  mainProducts,
  inventoryList,
  stores,
  categoryMappings = INITIAL_CATEGORY_MAPPINGS,
  brandMappings = INITIAL_BRAND_MAPPINGS,
  onUpdateMainProduct,
  onAddCloneListing,
  onDeleteListing,
  onOpenMappingView,
  onBatchDispatchSuccess
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [kindFilter, setKindFilter] = useState<string>('all');
  const [expandedProductId, setExpandedProductId] = useState<string | null>(mainProducts[1]?.id || null);

  // Multi-Selection State for Right-Click / Batch Dispatch
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    isOpen: boolean;
    targetProduct?: MainProduct;
  } | null>(null);

  // Dispatch Modal State
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [dispatchTargetProducts, setDispatchTargetProducts] = useState<MainProduct[]>([]);
  const [dispatchInitialChannel, setDispatchInitialChannel] = useState<MarketplaceChannel | 'all'>('trendyol');

  // BOM Edit Modal state
  const [bomModalProduct, setBomModalProduct] = useState<MainProduct | null>(null);
  const [viewRawListing, setViewRawListing] = useState<ChannelListingProduct | null>(null);

  // Add Clone Listing Modal state
  const [cloneModalProduct, setCloneModalProduct] = useState<MainProduct | null>(null);
  const [cloneChannel, setCloneChannel] = useState<MarketplaceChannel>('trendyol');
  const [cloneStoreId, setCloneStoreId] = useState<string>(stores[0]?.id || '');
  const [cloneBarcode, setCloneBarcode] = useState('');
  const [cloneTitle, setCloneTitle] = useState('');
  const [cloneDesc, setCloneDesc] = useState('');
  const [clonePrice, setClonePrice] = useState<number>(100);

  // Filter
  const filteredProducts = mainProducts.filter((p) => {
    const matchesSearch = 
      p.masterProductCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.masterBarcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.listings.some(l => l.listingBarcode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesKind = kindFilter === 'all' || p.kind === kindFilter;
    return matchesSearch && matchesKind;
  });

  // Handle open Clone Modal
  const handleOpenCloneModal = (prod: MainProduct) => {
    setCloneModalProduct(prod);
    setCloneChannel('trendyol');
    setCloneStoreId(stores[0]?.id || '');
    setCloneBarcode(`TY-FAK-${Math.floor(100000 + Math.random() * 900000)}`);
    setCloneTitle(`${prod.title} (Özel Kampanya Paketi)`);
    setCloneDesc(prod.description);
    setClonePrice(Math.round(prod.calculatedTotalCost * 1.5));
  };

  // Submit Clone Listing
  const handleSaveCloneListing = () => {
    if (!cloneModalProduct || !cloneBarcode.trim() || !cloneTitle.trim()) return;

    const newListing: ChannelListingProduct = {
      id: `list-${Date.now()}`,
      mainProductId: cloneModalProduct.id,
      storeAccountId: cloneStoreId,
      channel: cloneChannel,
      listingBarcode: cloneBarcode.trim(),
      listingSku: `SKU-${cloneBarcode.trim()}`,
      channelListingTitle: cloneTitle.trim(),
      channelListingDescription: cloneDesc.trim(),
      salePrice: clonePrice,
      commissionRate: 18.0,
      isActive: true,
      syncStatus: 'Synced',
      lastSyncUtc: new Date().toISOString()
    };

    onAddCloneListing(cloneModalProduct.id, newListing);
    setCloneModalProduct(null);
  };

  // Export CSV
  const handleExportCsv = () => {
    const csv = ErpExporter.generateMainProductsCsv(filteredProducts);
    ErpExporter.downloadFile(csv, `Ana_Urunler_Paketler_${Date.now()}.csv`, 'text/csv;charset=utf-8');
  };

  // Multi-selection Handlers
  const handleToggleSelectProduct = (productId: string) => {
    setSelectedProductIds(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map(p => p.id));
    }
  };

  // Context Menu Trigger (Sağ Tık)
  const handleContextMenu = (prod: MainProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedProductIds.includes(prod.id)) {
      setSelectedProductIds([prod.id]);
    }
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      isOpen: true,
      targetProduct: prod
    });
  };

  // Open Dispatch Modal
  const handleOpenDispatchModal = (products: MainProduct[], channel: MarketplaceChannel | 'all' = 'trendyol') => {
    if (products.length === 0) return;
    setDispatchTargetProducts(products);
    setDispatchInitialChannel(channel);
    setDispatchModalOpen(true);
  };

  const selectedProducts = mainProducts.filter(p => selectedProductIds.includes(p.id));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Boxes className="w-5 h-5 text-blue-400" />
            <span>Ana Ürünler & Paket Reçeteleri (BOM Masası)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tekli ürünler, adetli paketler ve karma setler. 1 Ana Ürün $\longrightarrow$ N Pazaryeri İlanı (Sahte / Çoklu Klon Barkod desteği).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenMappingView && (
            <button
              onClick={onOpenMappingView}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-800/60 rounded-lg text-xs font-semibold transition-colors shadow-sm"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Kategori & Marka Eşleme Masası</span>
            </button>
          )}

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Katalog & Paket Listesini İndir (.csv)</span>
          </button>
        </div>
      </div>

      {/* Batch Action and Context Menu Desktop Shortcut Strip */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 px-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleToggleSelectAll}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold border border-slate-700 transition-colors"
          >
            {selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-blue-400" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>{selectedProductIds.length > 0 ? `Seçimi Kaldır (${selectedProductIds.length})` : 'Tümünü Seç'}</span>
          </button>

          {selectedProductIds.length > 0 ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 font-semibold px-2.5 py-1 rounded-lg">
                {selectedProductIds.length} ürün seçildi
              </span>
              <button
                onClick={() => handleOpenDispatchModal(selectedProducts, 'trendyol')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Pazaryerine Gönder ({selectedProductIds.length})</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-slate-400 text-[11px]">
                Kutucukları işaretleyebilir veya satıra <span className="text-amber-400 font-semibold">Sağ Tıklayarak</span> doğrudan Trendyol / Hepsiburada'ya gönderebilirsiniz.
              </span>
              <button
                onClick={() => {
                  const toSelect = filteredProducts.length > 0 ? filteredProducts : mainProducts;
                  setSelectedProductIds(toSelect.map(p => p.id));
                  handleOpenDispatchModal(toSelect, 'trendyol');
                }}
                className="flex items-center gap-1.5 px-3 py-1 bg-blue-600/15 hover:bg-blue-600/25 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm"
                title="Tüm ürünleri seçerek pazaryeri ürün açma motorunu açar"
              >
                <Send className="w-3.5 h-3.5 text-blue-400" />
                <span>Pazaryerine Ürün Aç (Tümü)</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-slate-300 text-[11px] bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Masaüstü ERP Deneyimi: Satıra <strong>Sağ Tık</strong> $\rightarrow$ Pazaryerine Gönder</span>
        </div>
      </div>

      {/* Filter and Kind Segmented Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative min-w-[260px] flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Ana Kod, Master Barkod, İlan Barkodu, Başlık..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Kind Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setKindFilter('all')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              kindFilter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tümü ({mainProducts.length})
          </button>
          <button
            onClick={() => setKindFilter('Single')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              kindFilter === 'Single' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tekil ({mainProducts.filter(p => p.kind === 'Single').length})
          </button>
          <button
            onClick={() => setKindFilter('MultiUnitBundle')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              kindFilter === 'MultiUnitBundle' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Adetli Paket ({mainProducts.filter(p => p.kind === 'MultiUnitBundle').length})
          </button>
          <button
            onClick={() => setKindFilter('CompositeKit')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              kindFilter === 'CompositeKit' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Karma Set ({mainProducts.filter(p => p.kind === 'CompositeKit').length})
          </button>
        </div>
      </div>

      {/* Main Products List with Nested 1:N Listings Accordion */}
      <div className="space-y-3">
        {filteredProducts.map((prod) => {
          const isExpanded = expandedProductId === prod.id;
          const isSelected = selectedProductIds.includes(prod.id);
          const masterCat = INITIAL_MASTER_CATEGORIES.find(c => c.id === prod.masterCategoryId);
          const masterBrd = INITIAL_MASTER_BRANDS.find(b => b.id === prod.masterBrandId);

          return (
            <div
              key={prod.id}
              onContextMenu={(e) => handleContextMenu(prod, e)}
              className={`bg-slate-900 border rounded-xl overflow-hidden transition-all shadow-sm ${
                isSelected
                  ? 'border-blue-500/80 bg-blue-950/20 ring-1 ring-blue-500/30'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Main Product Card Header Strip */}
              <div 
                className="p-4 cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90"
                onClick={() => setExpandedProductId(isExpanded ? null : prod.id)}
              >
                {/* Left identity & Title */}
                <div className="flex items-start gap-3">
                  {/* Row Checkbox for Multi-Select */}
                  <div 
                    className="pt-1 cursor-pointer shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleSelectProduct(prod.id);
                    }}
                    title="Çoklu işlem için seç"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                  </div>

                  <div className="mt-0.5 text-slate-400">
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-blue-400" /> : <ChevronRight className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        prod.kind === 'Single' ? 'bg-slate-800 text-slate-300' :
                        prod.kind === 'MultiUnitBundle' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}>
                        {prod.kind === 'Single' && 'Tekil Ürün'}
                        {prod.kind === 'MultiUnitBundle' && 'Adetli Paket'}
                        {prod.kind === 'CompositeKit' && 'Karma Çoklu Set'}
                      </span>

                      <span className="font-mono text-xs font-bold text-white">{prod.masterProductCode}</span>
                      <span className="text-slate-500 text-xs">·</span>
                      <span className="font-mono text-xs text-slate-400">Master Barkod: {prod.masterBarcode}</span>

                      {/* Master Category Badge */}
                      {masterCat && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded font-medium">
                          <Layers className="w-3 h-3 text-indigo-400" />
                          <span>{masterCat.name}</span>
                        </span>
                      )}

                      {/* Master Brand Badge */}
                      {masterBrd && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded font-medium">
                          <Tag className="w-3 h-3 text-amber-400" />
                          <span>{masterBrd.name}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-white hover:text-blue-400 transition-colors">
                      {prod.title}
                    </h3>

                    {/* BOM Components Preview */}
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 flex-wrap">
                      <span className="font-medium text-slate-500">Reçete:</span>
                      {prod.recipeItems.map((rec, idx) => (
                        <span key={idx} className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px] font-mono text-slate-300">
                          {rec.quantity}x {rec.componentCode || rec.componentTitle}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Operational Metrics (Cost, Virtual Stock, Desi, Lead Time, Listing Count, Quick Dispatch) */}
                <div className="flex items-center gap-4 flex-wrap text-xs font-mono justify-end">
                  {/* Total Cost */}
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 font-sans uppercase">Toplam Maliyet</div>
                    <div className="font-bold text-white tabular-nums">{prod.calculatedTotalCost.toFixed(2)} TL</div>
                  </div>

                  {/* Calculated Virtual Stock */}
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 font-sans uppercase">Sanal Stok</div>
                    <div className="font-bold text-emerald-400 tabular-nums text-sm">
                      {prod.calculatedVirtualStock} <span className="text-[10px] text-slate-400 font-sans">paket</span>
                    </div>
                  </div>

                  {/* Desi Metrics */}
                  <div className="text-right border-l border-slate-800 pl-3">
                    <div className="text-[10px] text-slate-500 font-sans uppercase">Desi (Hesap/Girilen)</div>
                    <div className="text-slate-300 tabular-nums">
                      <span className="text-slate-400">{prod.calculatedDesi.toFixed(2)}</span>
                      <span className="text-slate-500 mx-1">/</span>
                      <span className="text-amber-400 font-bold">{prod.manualDesi.toFixed(2)} d</span>
                    </div>
                  </div>

                  {/* Termin Days */}
                  <div className="text-right border-l border-slate-800 pl-3">
                    <div className="text-[10px] text-slate-500 font-sans uppercase">Termin (Hesap/Girilen)</div>
                    <div className="text-slate-300 tabular-nums">
                      <span>{prod.calculatedLeadTimeDays}g</span>
                      <span className="text-slate-500 mx-1">/</span>
                      <span className="text-blue-400 font-bold">{prod.manualLeadTimeDays} gün</span>
                    </div>
                  </div>

                  {/* Listings Count Badge */}
                  <div className="text-right border-l border-slate-800 pl-3">
                    <div className="text-[10px] text-slate-500 font-sans uppercase">Pazaryeri İlanı</div>
                    <div className="font-bold text-purple-400 tabular-nums">
                      {prod.listings.length} kanal ilanı
                    </div>
                  </div>

                  {/* Quick Dispatch Action Button */}
                  <div className="border-l border-slate-800 pl-3 font-sans">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDispatchModal([prod], 'trendyol');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                      title="Bu ürünü Trendyol veya Hepsiburada'ya aktar (Sağ tıkla da yapabilirsiniz)"
                    >
                      <Send className="w-3.5 h-3.5 text-blue-400" />
                      <span>Pazaryerine Aç</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* EXPANDED CONTENT: Reçete & Pazaryeri Çoklu İlanları (Multi-Listing) */}
              {isExpanded && (
                <div className="border-t border-slate-800 bg-slate-950/60 p-5 space-y-5">
                  {/* 1. Reçete & Desi/Termin Düzenleme Barı */}
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Box className="w-4 h-4 text-blue-400" />
                        <span>Reçete & Sevk Konfigürasyonu</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Bu ana ürün satıldığında depodan çıkacak fiziki stok adetleri ve kargo parametreleri.
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      {/* Manual Desi input */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-sans text-[11px]">Koli Sevk Desisi:</span>
                        <input
                          type="number"
                          step="0.1"
                          value={prod.manualDesi}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            onUpdateMainProduct({ ...prod, manualDesi: val });
                          }}
                          className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-center text-slate-200"
                        />
                      </div>

                      {/* Manual Lead Time input */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-sans text-[11px]">Termin (Gün):</span>
                        <input
                          type="number"
                          value={prod.manualLeadTimeDays}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            onUpdateMainProduct({ ...prod, manualLeadTimeDays: val });
                          }}
                          className="w-14 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-center text-slate-200"
                        />
                      </div>

                      <button
                        onClick={() => setBomModalProduct(prod)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-sans font-medium transition-colors"
                      >
                        Reçeteyi Düzenle (BOM)
                      </button>
                    </div>
                  </div>

                  {/* 2. Pazaryeri Çoklu İlanları (1:N Listings & Sahte Barkodlar) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Tag className="w-4 h-4 text-purple-400" />
                          <span>Pazaryerlerinde Yayınlanan İlanlar ({prod.listings.length} adet)</span>
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Farklı başlıklar, farklı açıklamalar ve sahte/özel barkodlar ile birden fazla kez listelenen ilanlar.
                        </p>
                      </div>

                      <button
                        onClick={() => handleOpenCloneModal(prod)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Yeni Klon / Sahte Barkodlu İlan Aç</span>
                      </button>
                    </div>

                    {/* Listings Table */}
                    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                            <th className="py-2.5 px-3">Kanal</th>
                            <th className="py-2.5 px-3">İlan Barkodu (Özel/Sahte)</th>
                            <th className="py-2.5 px-3">Kanala Özel Başlık</th>
                            <th className="py-2.5 px-3 text-right">Satış Fiyatı</th>
                            <th className="py-2.5 px-3 text-right">Komisyon</th>
                            <th className="py-2.5 px-3 text-center">Durum</th>
                            <th className="py-2.5 px-3 text-center">İşlem</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-sans">
                          {prod.listings.map((listing) => {
                            const chMeta = CHANNEL_METADATA[listing.channel];

                            return (
                              <tr key={listing.id} className="hover:bg-slate-800/40 transition-colors">
                                {/* Channel */}
                                <td className="py-2.5 px-3 whitespace-nowrap">
                                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${chMeta?.badgeBg}`}>
                                    {chMeta?.name || listing.channel}
                                  </span>
                                </td>

                                {/* Barcode */}
                                <td className="py-2.5 px-3 font-mono text-slate-200 font-semibold whitespace-nowrap">
                                  {listing.listingBarcode}
                                  {listing.listingBarcode !== prod.masterBarcode && (
                                    <span className="ml-1.5 text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 py-0.2 rounded font-sans">
                                      Klon/Sahte
                                    </span>
                                  )}
                                </td>

                                {/* Title */}
                                <td className="py-2.5 px-3">
                                  <div className="font-medium text-white max-w-md truncate" title={listing.channelListingTitle}>
                                    {listing.channelListingTitle}
                                  </div>
                                  <div className="text-[10px] text-slate-400 truncate max-w-md">
                                    {listing.channelListingDescription}
                                  </div>
                                </td>

                                {/* Price */}
                                <td className="py-2.5 px-3 text-right font-mono font-bold text-white tabular-nums">
                                  {listing.salePrice.toFixed(2)} TL
                                </td>

                                {/* Commission */}
                                <td className="py-2.5 px-3 text-right font-mono text-slate-400 tabular-nums">
                                  %{listing.commissionRate}
                                </td>

                                {/* Status */}
                                <td className="py-2.5 px-3 text-center">
                                  <span className="text-[11px] text-emerald-400 font-medium">
                                    {listing.syncStatus}
                                  </span>
                                </td>

                                {/* Actions */}
                                <td className="py-2.5 px-3 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      onClick={() => setViewRawListing(listing)}
                                      className="text-slate-400 hover:text-sky-300 p-1 rounded hover:bg-slate-800 transition-colors"
                                      title="Pazaryeri Katalog Ham JSON Yanıtını Görüntüle"
                                    >
                                      <Code className="w-3.5 h-3.5" />
                                    </button>
                                    {prod.listings.length > 1 && (
                                      <button
                                        onClick={() => onDeleteListing(prod.id, listing.id)}
                                        className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                                        title="İlanı Kaldır"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 3. Pazaryeri Kategori Eşleme & Zorunlu Ek Nitelikler (Attributes) Durumu */}
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-indigo-400" />
                          <span>Pazaryeri Kategori Eşleşmeleri ve Ek Nitelikler (Attributes)</span>
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Trendyol ve Hepsiburada'ya ürün açarken API'nin zorunlu beklediği teknik nitelikler ve eşleşen düğümler.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {onOpenMappingView && (
                          <button
                            onClick={onOpenMappingView}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded text-xs font-medium transition-colors flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Eşleme Masasını Aç</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenDispatchModal([prod], 'trendyol')}
                          className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                        >
                          <Send className="w-3 h-3" />
                          <span>Pazaryerine Gönder / Nitelikleri Doldur</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Trendyol Card */}
                      {(() => {
                        const tyCatMap = categoryMappings.find(m => m.masterCategoryId === prod.masterCategoryId && m.channel === 'trendyol');
                        const tyAttrs = prod.marketplaceAttributes?.trendyol || {};
                        return (
                          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/80 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-orange-400 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
                                Trendyol Kategori & Nitelik Eşlemesi
                              </span>
                              {tyCatMap ? (
                                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono">
                                  ID: {tyCatMap.remoteCategoryId} · Eşleşti
                                </span>
                              ) : (
                                <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded">
                                  Eşleşme Yok
                                </span>
                              )}
                            </div>

                            {tyCatMap && (
                              <div className="text-[11px] text-slate-400 font-mono truncate">
                                Yol: {tyCatMap.remoteCategoryPath}
                              </div>
                            )}

                            {/* Ek Nitelikler Özeti */}
                            <div className="bg-slate-900/60 rounded p-2.5 space-y-1.5 border border-slate-800/40">
                              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                Tanımlı Trendyol Nitelikleri:
                              </div>
                              {Object.keys(tyAttrs).length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                  {Object.entries(tyAttrs).map(([k, v]) => (
                                    <span key={k} className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px] font-mono text-slate-300">
                                      <span className="text-slate-400">{k}:</span> {String(v)}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[11px] text-amber-400 italic">
                                  Henüz ek nitelik tanımlanmadı (Ürün açma sihirbazında zorunlu alanlar doldurulabilir)
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Hepsiburada Card */}
                      {(() => {
                        const hbCatMap = categoryMappings.find(m => m.masterCategoryId === prod.masterCategoryId && m.channel === 'hepsiburada');
                        const hbAttrs = prod.marketplaceAttributes?.hepsiburada || {};
                        return (
                          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/80 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                                Hepsiburada Kategori & Nitelik Eşlemesi
                              </span>
                              {hbCatMap ? (
                                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono">
                                  ID: {hbCatMap.remoteCategoryId} · Eşleşti
                                </span>
                              ) : (
                                <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded">
                                  Eşleşme Yok
                                </span>
                              )}
                            </div>

                            {hbCatMap && (
                              <div className="text-[11px] text-slate-400 font-mono truncate">
                                Yol: {hbCatMap.remoteCategoryPath}
                              </div>
                            )}

                            {/* Ek Nitelikler Özeti */}
                            <div className="bg-slate-900/60 rounded p-2.5 space-y-1.5 border border-slate-800/40">
                              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                Tanımlı Hepsiburada Nitelikleri:
                              </div>
                              {Object.keys(hbAttrs).length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                  {Object.entries(hbAttrs).map(([k, v]) => (
                                    <span key={k} className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px] font-mono text-slate-300">
                                      <span className="text-slate-400">{k}:</span> {String(v)}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[11px] text-amber-400 italic">
                                  Henüz ek nitelik tanımlanmadı (Ürün açma sihirbazında zorunlu alanlar doldurulabilir)
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL 1: BOM Reçete Düzenleme */}
      {bomModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 text-slate-100 shadow-2xl relative space-y-4">
            <button
              onClick={() => setBomModalProduct(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Paket Reçetesi (BOM): {bomModalProduct.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Depodaki fiziki stok kartlarını bu pakete bileşen olarak ekleyin veya miktarlarını değiştirin.
              </p>
            </div>

            {/* Current Components */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300">Mevcut Reçete Bileşenleri:</span>
              <div className="max-h-56 overflow-y-auto space-y-1.5">
                {bomModalProduct.recipeItems.map((rec) => {
                  const inv = inventoryList.find(i => i.id === rec.erpInventoryProductId);

                  return (
                    <div 
                      key={rec.id}
                      className="bg-slate-950 border border-slate-800 rounded p-2.5 flex items-center justify-between text-xs font-mono"
                    >
                      <div className="font-sans">
                        <div className="font-semibold text-slate-200">{rec.componentTitle || inv?.title}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Stok Kodu: {rec.componentCode || inv?.productCode} · Depo Stoğu: {inv?.physicalStockQuantity} adet
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400 text-xs font-sans">Miktar:</span>
                          <input
                            type="number"
                            min="1"
                            value={rec.quantity}
                            onChange={(e) => {
                              const qty = parseInt(e.target.value) || 1;
                              const updatedRecipes = bomModalProduct.recipeItems.map(r => r.id === rec.id ? { ...r, quantity: qty } : r);
                              const updated = ProductService.calculateMainProductMetrics({ ...bomModalProduct, recipeItems: updatedRecipes }, inventoryList);
                              setBomModalProduct(updated);
                            }}
                            className="w-14 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-center text-white font-bold"
                          />
                        </div>

                        {bomModalProduct.recipeItems.length > 1 && (
                          <button
                            onClick={() => {
                              const updatedRecipes = bomModalProduct.recipeItems.filter(r => r.id !== rec.id);
                              const updated = ProductService.calculateMainProductMetrics({ ...bomModalProduct, recipeItems: updatedRecipes }, inventoryList);
                              setBomModalProduct(updated);
                            }}
                            className="text-slate-500 hover:text-red-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Add from Inventory */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-300">Depodan Yeni Bileşen Ekle:</span>
              <div className="flex items-center gap-2">
                <select
                  id="add-inv-select"
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 flex-1 focus:outline-none"
                >
                  {inventoryList.map(i => (
                    <option key={i.id} value={i.id}>{i.productCode} - {i.title} (Alış: {i.buyingPrice} TL)</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    const sel = (document.getElementById('add-inv-select') as HTMLSelectElement).value;
                    const inv = inventoryList.find(i => i.id === sel);
                    if (inv) {
                      const newRec = {
                        id: `rec-${Date.now()}`,
                        mainProductId: bomModalProduct.id,
                        erpInventoryProductId: inv.id,
                        quantity: 1,
                        componentTitle: inv.title,
                        componentCode: inv.productCode,
                        componentBarcode: inv.barcode,
                        unitBuyingPrice: inv.buyingPrice,
                        unitDesi: inv.unitDesi
                      };
                      const updated = ProductService.calculateMainProductMetrics({
                        ...bomModalProduct,
                        recipeItems: [...bomModalProduct.recipeItems, newRec]
                      }, inventoryList);
                      setBomModalProduct(updated);
                    }
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
                >
                  Ekle
                </button>
              </div>
            </div>

            {/* Calculated Preview */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center text-xs font-mono">
              <div>
                <span className="text-slate-400 font-sans">Hesaplanan Maliyet: </span>
                <span className="font-bold text-white">{bomModalProduct.calculatedTotalCost} TL</span>
              </div>
              <div>
                <span className="text-slate-400 font-sans">Sanal Stok: </span>
                <span className="font-bold text-emerald-400">{bomModalProduct.calculatedVirtualStock} paket</span>
              </div>
              <div>
                <span className="text-slate-400 font-sans">Hesaplanan Desi: </span>
                <span className="font-bold text-amber-400">{bomModalProduct.calculatedDesi} desi</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setBomModalProduct(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg"
              >
                Vazgeç
              </button>
              <button
                onClick={() => {
                  onUpdateMainProduct(bomModalProduct);
                  setBomModalProduct(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md"
              >
                Reçeteyi Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Yeni Klon / Sahte Barkodlu İlan Açma */}
      {cloneModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative space-y-4">
            <button
              onClick={() => setCloneModalProduct(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Yeni Klon / Sahte Barkodlu İlan Aç</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Bağlı Ana Ürün: <span className="text-slate-200 font-semibold">{cloneModalProduct.title}</span>
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Hedef Pazaryeri & Mağaza</label>
                <select
                  value={cloneStoreId}
                  onChange={(e) => {
                    const st = stores.find(s => s.id === e.target.value);
                    if (st) {
                      setCloneStoreId(st.id);
                      setCloneChannel(st.channel);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  {stores.map(s => (
                    <option key={s.id} value={s.id}>{s.storeName} ({s.channel.toUpperCase()})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">İlan Barkodu (Özel / Sahte Barkod)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={cloneBarcode}
                    onChange={(e) => setCloneBarcode(e.target.value)}
                    placeholder="Örn: TY-FAK-4KOL-02"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => setCloneBarcode(`${cloneChannel.toUpperCase()}-ALT-${Math.floor(100000 + Math.random() * 900000)}`)}
                    className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
                  >
                    Üret
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Farklılaştırılmış İlan Başlığı (SEO Uyumlu)</label>
                <input
                  type="text"
                  value={cloneTitle}
                  onChange={(e) => setCloneTitle(e.target.value)}
                  placeholder="Arama sonuçlarında öne çıkacak alternatif başlık"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Satış Fiyatı (TL)</label>
                <input
                  type="number"
                  step="0.01"
                  value={clonePrice}
                  onChange={(e) => setClonePrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Reçete Maliyeti: {cloneModalProduct.calculatedTotalCost} TL · Sanal Stok: {cloneModalProduct.calculatedVirtualStock} paket
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setCloneModalProduct(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg"
              >
                Vazgeç
              </button>
              <button
                onClick={handleSaveCloneListing}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg shadow-md"
              >
                İlanı Oluştur & Bağla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: View Raw Listing Catalog JSON */}
      {viewRawListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full p-6 text-slate-100 shadow-2xl relative space-y-4">
            <button
              onClick={() => setViewRawListing(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-sky-400" />
                <span>Pazaryeri Katalog & İlan Ham Verisi (Raw JSON)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                İlan Barkodu: <span className="font-mono text-white font-semibold">{viewRawListing.listingBarcode}</span> · Kanal: <span className="text-sky-300 font-semibold uppercase">{viewRawListing.channel}</span>
              </p>
            </div>
            <RawJsonViewer
              rawJsonString={viewRawListing.rawPayloadJson}
              rawPayload={viewRawListing.rawPayload}
              title={`${CHANNEL_METADATA[viewRawListing.channel]?.name || viewRawListing.channel} Katalog Payload`}
              sourceChannel={viewRawListing.channel}
              entityType="Listing"
              identifier={viewRawListing.listingBarcode}
            />
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewRawListing(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sağ Tık (Context Menu) Masaüstü ERP Bağlam Menüsü */}
      <ContextMenu
        x={contextMenu?.x || 0}
        y={contextMenu?.y || 0}
        isOpen={!!contextMenu?.isOpen}
        onClose={() => setContextMenu(null)}
        selectedCount={selectedProductIds.length > 0 ? selectedProductIds.length : 1}
        targetProductTitle={contextMenu?.targetProduct?.title}
        onDispatch={(channel) => {
          const targets = selectedProductIds.length > 0 && contextMenu?.targetProduct && selectedProductIds.includes(contextMenu.targetProduct.id)
            ? mainProducts.filter(p => selectedProductIds.includes(p.id))
            : contextMenu?.targetProduct ? [contextMenu.targetProduct] : [];
          setContextMenu(null);
          handleOpenDispatchModal(targets, channel);
        }}
        onOpenDetails={() => {
          if (contextMenu?.targetProduct) {
            setExpandedProductId(contextMenu.targetProduct.id);
          }
          setContextMenu(null);
        }}
        onOpenReadiness={() => {
          if (contextMenu?.targetProduct) {
            handleOpenDispatchModal([contextMenu.targetProduct], 'all');
          }
          setContextMenu(null);
        }}
        onOpenCategoryBrandMapping={() => {
          setContextMenu(null);
          if (onOpenMappingView) onOpenMappingView();
        }}
        onOpenCloneListing={() => {
          if (contextMenu?.targetProduct) {
            handleOpenCloneModal(contextMenu.targetProduct);
          }
          setContextMenu(null);
        }}
      />

      {/* Pazaryerine Ürün Açma Motoru & Zorunlu Nitelik Sihirbazı Modalı */}
      <ProductDispatchModal
        isOpen={dispatchModalOpen}
        onClose={() => setDispatchModalOpen(false)}
        products={dispatchTargetProducts}
        stores={stores}
        categoryMappings={categoryMappings}
        brandMappings={brandMappings}
        initialChannel={dispatchInitialChannel}
        onNavigateToMapping={onOpenMappingView}
        onDispatchSuccess={(updatedProducts, batchId) => {
          if (onBatchDispatchSuccess) {
            onBatchDispatchSuccess(updatedProducts, batchId);
          } else {
            updatedProducts.forEach(upd => onUpdateMainProduct(upd));
          }
          setSelectedProductIds([]);
        }}
      />
    </div>
  );
};
