import React, { useState } from 'react';
import { 
  MasterCategory, 
  MasterBrand, 
  CategoryMarketplaceMapping, 
  BrandMarketplaceMapping,
  MarketplaceChannel
} from '../types';
import { CHANNEL_METADATA } from '../data/initialData';
import { 
  Layers, 
  Tag, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FolderOpen, 
  Plus, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  Edit2,
  Save,
  Check
} from 'lucide-react';

interface CategoryBrandMappingViewProps {
  categories: MasterCategory[];
  brands: MasterBrand[];
  categoryMappings: CategoryMarketplaceMapping[];
  brandMappings: BrandMarketplaceMapping[];
  onUpdateCategoryMapping: (updated: CategoryMarketplaceMapping) => void;
  onUpdateBrandMapping: (updated: BrandMarketplaceMapping) => void;
}

export const CategoryBrandMappingView: React.FC<CategoryBrandMappingViewProps> = ({
  categories,
  brands,
  categoryMappings,
  brandMappings,
  onUpdateCategoryMapping,
  onUpdateBrandMapping
}) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'brands' | 'attributes'>('categories');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories.find(c => c.level === 2)?.id || 'cat-kolonya');
  const [categorySearch, setCategorySearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['cat-kozmetik', 'cat-gida', 'cat-elektronik', 'cat-ev-yasam']));

  // Tree nodes
  const rootCategories = categories.filter(c => c.parentId === null);
  const getChildren = (parentId: string) => categories.filter(c => c.parentId === parentId);

  const toggleExpand = (id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedCategory = categories.find(c => c.id === selectedCategoryId) || categories[0];
  const selectedCatMappings = categoryMappings.filter(m => m.masterCategoryId === selectedCategoryId);

  // Filtered brands
  const filteredBrands = brands.filter(b => 
    b.name.toLowerCase().includes(brandSearch.toLowerCase()) ||
    b.code.toLowerCase().includes(brandSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Pazaryeri Kategori & Marka Eşleme Masası</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ürün kataloğumuzdaki kategorileri ve üretici markaları Trendyol, Hepsiburada ve N11 karşılıkları ile birebir eşleştirin.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Master Kategori</span>
            <span className="font-mono text-sm font-bold text-white">{categories.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Aktif Marka</span>
            <span className="font-mono text-sm font-bold text-white">{brands.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center">
            <span className="text-[10px] text-emerald-400 block uppercase font-semibold">Eşleme Oranı</span>
            <span className="font-mono text-sm font-bold text-emerald-300">%100</span>
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Master Category Tree (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Merkezi Kategori Ağacı</h3>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">{categories.length} Dal</span>
          </div>

          {/* Search Category */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              placeholder="Kategori ağacında ara..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Tree View */}
          <div className="space-y-1 max-h-[500px] overflow-y-auto">
            {rootCategories.map((root) => {
              const children = getChildren(root.id);
              const isExpanded = expandedNodes.has(root.id);
              const isSelected = selectedCategoryId === root.id;

              return (
                <div key={root.id} className="space-y-0.5">
                  {/* Root Node */}
                  <div
                    onClick={() => {
                      toggleExpand(root.id);
                      setSelectedCategoryId(root.id);
                    }}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-blue-600 text-white font-semibold' 
                        : 'hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </span>
                      <Folder className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-medium">{root.name}</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-850 text-slate-400">
                      {root.productCount}
                    </span>
                  </div>

                  {/* Children Nodes */}
                  {isExpanded && children.length > 0 && (
                    <div className="ml-5 border-l border-slate-800/80 pl-2 space-y-0.5">
                      {children.map((child) => {
                        const isChildSelected = selectedCategoryId === child.id;

                        return (
                          <div
                            key={child.id}
                            onClick={() => setSelectedCategoryId(child.id)}
                            className={`flex items-center justify-between p-1.5 rounded-md cursor-pointer transition-colors ${
                              isChildSelected 
                                ? 'bg-blue-600 text-white font-semibold shadow-sm' 
                                : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
                              <span className="text-xs truncate">{child.name}</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500">
                              {child.productCount} ürün
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Mapping Desk (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
          {/* Top Tabs */}
          <div className="px-5 py-3 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('categories')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'categories'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                Pazaryeri Kategori Eşleme ({selectedCatMappings.length})
              </button>
              <button
                onClick={() => setActiveTab('brands')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'brands'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                Marka Eşleme Matrisi ({brands.length})
              </button>
              <button
                onClick={() => setActiveTab('attributes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'attributes'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                Zorunlu Nitelikler (Attributes)
              </button>
            </div>

            <span className="text-xs font-semibold text-slate-300 hidden sm:inline">
              Seçili: <strong className="text-white">{selectedCategory?.name}</strong>
            </span>
          </div>

          <div className="p-6">
            {/* TAB 1: Category Mapping Matrix */}
            {activeTab === 'categories' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white">Hedefli Kategori Eşleme Aktif</h4>
                    <p className="text-slate-300 mt-0.5">
                      "<strong>{selectedCategory?.name}</strong>" kategorisi altındaki tüm ürünler gönderilirken aşağıdaki resmi pazaryeri kategori kimlikleri ve komisyon oranları baz alınacaktır.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {(['trendyol', 'hepsiburada', 'n11'] as MarketplaceChannel[]).map((ch) => {
                    const meta = CHANNEL_METADATA[ch];
                    const map = selectedCatMappings.find(m => m.channel === ch);

                    return (
                      <div 
                        key={ch}
                        className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <span className={`px-2.5 py-1 rounded text-xs font-bold ${meta?.badgeBg}`}>
                            {meta?.name || ch}
                          </span>
                          <div>
                            {map ? (
                              <>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white text-sm">{map.remoteCategoryName}</span>
                                  <span className="font-mono text-xs text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                                    ID: {map.remoteCategoryId}
                                  </span>
                                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5" /> Doğrulandı
                                  </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1 font-mono">
                                  {map.remoteCategoryPath}
                                </p>
                                <div className="text-[11px] text-slate-500 mt-1">
                                  Komisyon: <strong className="text-slate-300">%{map.commissionRate}</strong> · {map.mandatoryAttributes.length} Zorunlu Nitelik
                                </div>
                              </>
                            ) : (
                              <div className="text-xs text-amber-400 flex items-center gap-1.5">
                                <AlertCircle className="w-4 h-4" />
                                <span>Bu kanal için henüz kategori eşleşmesi yapılmadı.</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            // Dummy edit/toggle
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors self-start sm:self-center shrink-0"
                        >
                          Eşlemeyi Düzenle
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: Brand Mapping Matrix */}
            {activeTab === 'brands' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                      placeholder="Üretici markalarda ara..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{filteredBrands.length} Marka</span>
                </div>

                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Bizim Markamız</th>
                        <th className="py-2.5 px-3">Menşei</th>
                        <th className="py-2.5 px-3">Trendyol Karşılığı</th>
                        <th className="py-2.5 px-3">Hepsiburada Karşılığı</th>
                        <th className="py-2.5 px-3">N11 Karşılığı</th>
                        <th className="py-2.5 px-3 text-right">Durum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {filteredBrands.map((b) => {
                        const tyMap = brandMappings.find(m => m.masterBrandId === b.id && m.channel === 'trendyol');
                        const hbMap = brandMappings.find(m => m.masterBrandId === b.id && m.channel === 'hepsiburada');
                        const n11Map = brandMappings.find(m => m.masterBrandId === b.id && m.channel === 'n11');

                        return (
                          <tr key={b.id} className="hover:bg-slate-950/40 transition-colors">
                            <td className="py-2.5 px-3 font-semibold text-white font-sans">
                              {b.name} <span className="text-slate-500 text-[11px] font-mono">({b.code})</span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-400 font-sans">
                              {b.originCountry}
                            </td>
                            <td className="py-2.5 px-3 text-orange-400">
                              {tyMap ? `${tyMap.remoteBrandName} (${tyMap.remoteBrandId})` : '-'}
                            </td>
                            <td className="py-2.5 px-3 text-orange-300">
                              {hbMap ? `${hbMap.remoteBrandName} (${hbMap.remoteBrandId})` : '-'}
                            </td>
                            <td className="py-2.5 px-3 text-purple-400">
                              {n11Map ? `${n11Map.remoteBrandName} (${n11Map.remoteBrandId})` : '-'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-sans">
                              <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                                <Check className="w-3.5 h-3.5" /> Eşleşti
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: Attributes Specification */}
            {activeTab === 'attributes' && (
              <div className="space-y-4">
                <div className="border border-slate-800 rounded-xl p-4 bg-slate-950 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>{selectedCategory?.name} Kategorisi Pazaryeri Nitelik Şeması</span>
                    </h4>
                    <span className="text-xs text-slate-400 font-mono">Kategori ID: {selectedCategory?.code}</span>
                  </div>

                  {selectedCatMappings.map((map) => (
                    <div key={map.id} className="space-y-2">
                      <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${CHANNEL_METADATA[map.channel]?.badgeBg}`}>
                          {CHANNEL_METADATA[map.channel]?.name}
                        </span>
                        <span>İstenen Zorunlu Alanlar ({map.mandatoryAttributes.length} Adet)</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {map.mandatoryAttributes.map((attr) => (
                          <div key={attr.attributeId} className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-white text-xs">{attr.name}</span>
                              <span className="text-[10px] text-rose-400 font-bold">ZORUNLU</span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              Kod: {attr.code} · ID: {attr.attributeId}
                            </div>
                            {attr.values && (
                              <div className="text-[11px] text-slate-500 truncate" title={attr.values.map(v => v.name).join(', ')}>
                                Değerler: {attr.values.map(v => v.name).join(', ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
