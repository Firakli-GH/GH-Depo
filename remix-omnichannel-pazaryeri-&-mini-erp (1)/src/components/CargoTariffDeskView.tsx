import React, { useState } from 'react';
import { 
  CargoTierRate, 
  MarketplaceChannel, 
  MainProduct, 
  CargoProviderShare,
  PricingFormulaSimulation
} from '../types';
import { CHANNEL_METADATA } from '../data/initialData';
import { CargoPricingService } from '../services/cargoPricingService';
import { ErpExporter } from '../services/erpExporter';
import { 
  Truck, 
  FileSpreadsheet, 
  Upload, 
  Download, 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  Calculator, 
  Percent, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  ChevronRight,
  TrendingUp,
  Tag,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface CargoTariffDeskViewProps {
  tariffs: CargoTierRate[];
  mainProducts: MainProduct[];
  onAddTariff: (tariff: CargoTierRate) => void;
  onDeleteTariff: (tariffId: string) => void;
  onImportTariffs: (tariffs: CargoTierRate[], overwrite: boolean) => void;
}

export const CargoTariffDeskView: React.FC<CargoTariffDeskViewProps> = ({
  tariffs,
  mainProducts,
  onAddTariff,
  onDeleteTariff,
  onImportTariffs
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'matrix' | 'simulator'>('matrix');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Excel Import Modal
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importCsvText, setImportCsvText] = useState('');
  const [importOverwrite, setImportOverwrite] = useState(false);
  const [importPreview, setImportPreview] = useState<CargoTierRate[] | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // New Tier Rule Modal
  const [newRuleModalOpen, setNewRuleModalOpen] = useState(false);
  const [newRule, setNewRule] = useState<Partial<CargoTierRate>>({
    channel: 'trendyol',
    cargoProvider: 'Trendyol Express',
    tierName: '',
    minCartPrice: 0,
    maxCartPrice: 150,
    minDesi: 0,
    maxDesi: 10,
    sellerCargoFee: 9.00,
    isMarketplaceSubsidized: true
  });

  // Simulator State
  const [selectedSimProduct, setSelectedSimProduct] = useState<string>(mainProducts[0]?.id || '');
  const [simCost, setSimCost] = useState<number>(mainProducts[0]?.calculatedTotalCost || 180);
  const [simProfitRate, setSimProfitRate] = useState<number>(35); // 35%
  const [simCommissionRate, setSimCommissionRate] = useState<number>(19); // 19%
  const [simDesi, setSimDesi] = useState<number>(mainProducts[0]?.manualDesi || 2.0);
  const [simChannel, setSimChannel] = useState<MarketplaceChannel>('trendyol');

  // Multi-cargo weighted selection
  const [cargoShares, setCargoShares] = useState<CargoProviderShare[]>([
    { provider: 'Trendyol Express', sharePercentage: 70, unitFee: 19.00 },
    { provider: 'Aras Kargo', sharePercentage: 30, unitFee: 28.50 }
  ]);

  // Filtered tariffs
  const filteredTariffs = tariffs.filter(t => {
    const matchesChannel = selectedChannel === 'all' || t.channel === selectedChannel;
    const matchesSearch = 
      t.cargoProvider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.tierName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesChannel && matchesSearch;
  });

  // Calculate Weighted Average Freight
  const weightedFreight = CargoPricingService.calculateWeightedCargoFee(cargoShares);

  // Calculate Dynamic Formula Selling Price:
  // (Maliyet * (1 + Kar Orani) + Kargo Bedeli) / (1 - Komisyon Orani)
  const calculatedSalePrice = CargoPricingService.calculateFormulaPrice(
    simCost,
    simProfitRate / 100,
    weightedFreight,
    simCommissionRate / 100
  );

  const costWithProfit = Math.round(simCost * (1 + simProfitRate / 100) * 100) / 100;
  const commissionAmount = Math.round(calculatedSalePrice * (simCommissionRate / 100) * 100) / 100;
  const netEarnings = Math.round((calculatedSalePrice - commissionAmount - weightedFreight - simCost) * 100) / 100;

  // Find matching barem for the calculated price
  const matchedBarem = CargoPricingService.resolveBaremTier(
    tariffs,
    simChannel,
    simDesi,
    calculatedSalePrice,
    cargoShares[0]?.provider
  );

  // Handle product selection in simulator
  const handleSelectSimProduct = (prodId: string) => {
    setSelectedSimProduct(prodId);
    const prod = mainProducts.find(p => p.id === prodId);
    if (prod) {
      setSimCost(prod.calculatedTotalCost);
      setSimProfitRate(prod.targetProfitMargin || 35);
      setSimDesi(prod.manualDesi || prod.calculatedDesi || 2.0);
    }
  };

  // Parse CSV text in modal
  const handlePreviewCsv = () => {
    setImportError(null);
    const res = CargoPricingService.parseTariffCsv(importCsvText);
    if (res.success) {
      setImportPreview(res.tariffs);
    } else {
      setImportError(res.error || 'Geçersiz format');
      setImportPreview(null);
    }
  };

  const handleConfirmImport = () => {
    if (importPreview && importPreview.length > 0) {
      onImportTariffs(importPreview, importOverwrite);
      setImportModalOpen(false);
      setImportCsvText('');
      setImportPreview(null);
    }
  };

  // Export current tariffs to CSV
  const handleExportTariffs = () => {
    const csv = ErpExporter.generateCargoTariffCsv(tariffs);
    ErpExporter.downloadFile(csv, `Kargo_Barem_Tarifeleri_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8');
  };

  // Download template CSV
  const handleDownloadTemplate = () => {
    const csv = CargoPricingService.generateTariffTemplateCsv();
    ErpExporter.downloadFile(csv, `Ornek_Pazaryeri_Kargo_Tarife_Sablonu.csv`, 'text/csv;charset=utf-8');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <Truck className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Pazaryeri Kargo & Barem Masası
                <span className="text-xs font-normal px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  {tariffs.length} Aktif Barem
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Dönemsel kargo fiyat listeleri, sepet tutarı baremleri, ağırlıklı kargo maliyeti ve dinamik satış fiyatı hesaplama motoru.
              </p>
            </div>
          </div>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab('matrix')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              activeSubTab === 'matrix' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Tarife & Barem Tablosu
          </button>
          <button
            onClick={() => setActiveSubTab('simulator')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              activeSubTab === 'simulator' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            Fiyat & Kargo Simülatörü
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TARİFE & BAREM LİSTESİ */}
      {/* ========================================================================= */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-4">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-lg">
              <span className="text-[11px] text-slate-400 block">Kayıtlı Kargo Baremi</span>
              <span className="text-xl font-bold text-slate-100 font-mono">{tariffs.length} Adet</span>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-lg">
              <span className="text-[11px] text-emerald-400 block flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Barem Destekli Kurallar
              </span>
              <span className="text-xl font-bold text-emerald-400 font-mono">
                {tariffs.filter(t => t.isMarketplaceSubsidized).length} Barem
              </span>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-lg">
              <span className="text-[11px] text-orange-400 block">Trendyol En Düşük Barem</span>
              <span className="text-xl font-bold text-orange-400 font-mono">9.00 TL (TEX)</span>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-lg">
              <span className="text-[11px] text-blue-400 block">Hepsiburada En Düşük</span>
              <span className="text-xl font-bold text-blue-400 font-mono">11.00 TL (HJ)</span>
            </div>
          </div>

          {/* Action and Filter Toolbar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/70 p-3 rounded-lg border border-slate-800">
            {/* Search and Channel filter */}
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Kargo firması veya barem ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Channel filter select */}
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-slate-200 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="all">Tüm Kanallar ({tariffs.length})</option>
                <option value="trendyol">Trendyol ({tariffs.filter(t => t.channel === 'trendyol').length})</option>
                <option value="hepsiburada">Hepsiburada ({tariffs.filter(t => t.channel === 'hepsiburada').length})</option>
                <option value="n11">N11 ({tariffs.filter(t => t.channel === 'n11').length})</option>
                <option value="pttavm">PttAVM ({tariffs.filter(t => t.channel === 'pttavm').length})</option>
                <option value="pazarama">Pazarama ({tariffs.filter(t => t.channel === 'pazarama').length})</option>
              </select>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setImportModalOpen(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                Excel'den Tarife Yükle
              </button>

              <button
                onClick={handleDownloadTemplate}
                title="Pazaryeri Excel tarife şablonunu indir"
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                Şablon İndir
              </button>

              <button
                onClick={handleExportTariffs}
                title="Mevcut barem tablosunu CSV olarak indir"
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                Dışa Aktar
              </button>

              <button
                onClick={() => setNewRuleModalOpen(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Barem Ekle
              </button>
            </div>
          </div>

          {/* Tariffs Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Pazaryeri</th>
                    <th className="py-3 px-4">Kargo Firması</th>
                    <th className="py-3 px-4">Barem Tanımı</th>
                    <th className="py-3 px-4">Sepet Tutarı Baremi</th>
                    <th className="py-3 px-4">Desi Aralığı</th>
                    <th className="py-3 px-4 text-right">Satıcı Kargo Ücreti</th>
                    <th className="py-3 px-4 text-center">Barem Desteği</th>
                    <th className="py-3 px-4 text-center">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredTariffs.map((t) => {
                    const channelMeta = CHANNEL_METADATA[t.channel];
                    const isSub150 = t.maxCartPrice <= 150;

                    return (
                      <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                        {/* Kanal */}
                        <td className="py-2.5 px-4 font-medium">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${channelMeta?.badgeBg || 'bg-slate-800 text-slate-300'}`}>
                            {channelMeta?.name || t.channel.toUpperCase()}
                          </span>
                        </td>

                        {/* Kargo Firması */}
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-1.5 font-medium text-slate-200">
                            <Truck className="w-3.5 h-3.5 text-blue-400" />
                            {t.cargoProvider}
                          </div>
                        </td>

                        {/* Barem Adı */}
                        <td className="py-2.5 px-4 text-slate-300 font-medium">
                          {t.tierName}
                        </td>

                        {/* Sepet Tutarı */}
                        <td className="py-2.5 px-4 font-mono text-slate-300">
                          {t.maxCartPrice >= 900000 ? (
                            <span className="text-amber-400 font-semibold">{t.minCartPrice.toFixed(0)} TL ve üzeri</span>
                          ) : (
                            <span>{t.minCartPrice.toFixed(0)} TL – {t.maxCartPrice.toFixed(0)} TL</span>
                          )}
                        </td>

                        {/* Desi Aralığı */}
                        <td className="py-2.5 px-4 font-mono text-slate-300">
                          {t.minDesi} – {t.maxDesi} Desi
                        </td>

                        {/* Satıcı Kargo Ücreti */}
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-400 text-sm">
                          {t.sellerCargoFee.toFixed(2)} TL
                        </td>

                        {/* Destek Rozeti */}
                        <td className="py-2.5 px-4 text-center">
                          {t.isMarketplaceSubsidized ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Destekli
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400">
                              Standart
                            </span>
                          )}
                        </td>

                        {/* İşlem */}
                        <td className="py-2.5 px-4 text-center">
                          <button
                            onClick={() => onDeleteTariff(t.id)}
                            title="Bu baremi sil"
                            className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredTariffs.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                        Arama kriterlerine uygun kargo barem kuralı bulunamadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DİNAMİK FİYAT & KARGO SİMÜLATÖRÜ */}
      {/* ========================================================================= */}
      {activeSubTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sol Kolon: Parametre Girdileri & Formül Konfigürasyonu (7 Kolon) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-blue-400" />
                  <h2 className="text-sm font-bold text-slate-100">Fiyat & Kargo Barem Parametreleri</h2>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                  Dinamik Reçete Motoru
                </span>
              </div>

              {/* Formül Hatırlatıcı / Açıklama Kutusu */}
              <div className="p-3 bg-blue-950/20 border border-blue-900/40 rounded-lg text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-blue-300 font-semibold text-[11px]">
                  <Info className="w-3.5 h-3.5" />
                  Aktif Fiyatlama Formülü:
                </div>
                <div className="font-mono bg-slate-950/60 p-2 rounded text-blue-200 text-xs tracking-wide">
                  Satış Fiyatı = [Maliyet × (1 + Kâr Oranı) + Kargo Bedeli] ÷ (1 - Pazaryeri Komisyonu)
                </div>
              </div>

              {/* Hızlı Ana Ürün Seçimi */}
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">
                  Örnek Ana Ürün Seç (Katalogdan Otomatik Doldur):
                </label>
                <select
                  value={selectedSimProduct}
                  onChange={(e) => handleSelectSimProduct(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                >
                  {mainProducts.map(mp => (
                    <option key={mp.id} value={mp.id}>
                      [{mp.masterProductCode}] {mp.title} (Maliyet: {mp.calculatedTotalCost} TL · Desi: {mp.manualDesi})
                    </option>
                  ))}
                </select>
              </div>

              {/* Grid: Maliyet, Kâr, Komisyon, Desi */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Birim Maliyet (TL)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={simCost}
                    onChange={(e) => setSimCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded px-2.5 py-1.5 text-xs font-mono font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Hedef Kâr (%)</label>
                  <input
                    type="number"
                    step="1"
                    value={simProfitRate}
                    onChange={(e) => setSimProfitRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded px-2.5 py-1.5 text-xs font-mono font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Komisyon (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={simCommissionRate}
                    onChange={(e) => setSimCommissionRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded px-2.5 py-1.5 text-xs font-mono font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Koli Desisi</label>
                  <input
                    type="number"
                    step="0.1"
                    value={simDesi}
                    onChange={(e) => setSimDesi(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded px-2.5 py-1.5 text-xs font-mono font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Pazaryeri Seçimi */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Pazaryeri Kanalı</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['trendyol', 'hepsiburada', 'n11', 'pazarama'] as MarketplaceChannel[]).map((ch) => {
                    const isSelected = simChannel === ch;
                    const meta = CHANNEL_METADATA[ch];
                    return (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => setSimChannel(ch)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all text-center ${
                          isSelected 
                            ? 'bg-blue-600/20 border-blue-500 text-blue-300' 
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {meta?.name || ch}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ağırlıklı Kargo Seçimi (Weighted Average Cargo Selection) */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-orange-400" />
                    Çalışılan Kargo Şirketleri Dağılımı (Ağırlıklı Ortalama):
                  </label>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Ağırlıklı Kargo: {weightedFreight.toFixed(2)} TL
                  </span>
                </div>

                <div className="space-y-2">
                  {cargoShares.map((share, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <input
                        type="text"
                        value={share.provider}
                        onChange={(e) => {
                          const updated = [...cargoShares];
                          updated[idx].provider = e.target.value;
                          setCargoShares(updated);
                        }}
                        className="flex-1 bg-transparent text-xs text-slate-200 font-medium focus:outline-none"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-slate-400">Oran: %</span>
                        <input
                          type="number"
                          value={share.sharePercentage}
                          onChange={(e) => {
                            const updated = [...cargoShares];
                            updated[idx].sharePercentage = parseFloat(e.target.value) || 0;
                            setCargoShares(updated);
                          }}
                          className="w-14 bg-slate-900 border border-slate-700 text-xs font-mono text-center rounded py-0.5"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-slate-400">Barem:</span>
                        <input
                          type="number"
                          step="0.5"
                          value={share.unitFee}
                          onChange={(e) => {
                            const updated = [...cargoShares];
                            updated[idx].unitFee = parseFloat(e.target.value) || 0;
                            setCargoShares(updated);
                          }}
                          className="w-16 bg-slate-900 border border-slate-700 text-xs font-mono text-right rounded py-0.5 pr-1 text-emerald-400"
                        />
                        <span className="text-[10px] text-slate-500">TL</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sağ Kolon: Hesaplanan Satış Fiyatı & Adım Adım Waterfall Sonucu (5 Kolon) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 sticky top-20 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                  Hesaplama Sonucu
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Desi: {simDesi} · %{simCommissionRate} Kom.
                </span>
              </div>

              {/* Nihai Fiyat Hero Box */}
              <div className="p-4 bg-gradient-to-br from-blue-950/60 to-slate-950 border border-blue-500/30 rounded-xl text-center space-y-1">
                <span className="text-xs text-blue-300 font-medium block">Tavsiye Edilen Pazaryeri Satış Fiyatı</span>
                <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
                  {calculatedSalePrice.toFixed(2)} TL
                </div>
                <span className="text-[11px] text-slate-400 block">
                  Net Tahmini Satıcı Kazancı: <strong className="text-emerald-400 font-mono">+{netEarnings.toFixed(2)} TL</strong>
                </span>
              </div>

              {/* Adım Adım Formül Waterfall Kartı */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400">1. Alış Maliyeti</span>
                  <span className="font-mono text-slate-200">{simCost.toFixed(2)} TL</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400">2. Hedef Kârlı Maliyet (+%{simProfitRate})</span>
                  <span className="font-mono text-blue-400 font-semibold">{costWithProfit.toFixed(2)} TL</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400">3. Ağırlıklı Kargo Bedeli</span>
                  <span className="font-mono text-orange-400 font-semibold">+{weightedFreight.toFixed(2)} TL</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400">4. Pazaryeri Komisyon Payı (%{simCommissionRate})</span>
                  <span className="font-mono text-red-400">-{commissionAmount.toFixed(2)} TL</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400">5. Kâr Marjı Gerçekleşmesi</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    %{Math.round((netEarnings / simCost) * 100)} Kâr
                  </span>
                </div>
              </div>

              {/* Eşleşen Kargo Baremi Durumu */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-blue-400" />
                    Uygulanan Pazaryeri Baremi:
                  </span>
                  {matchedBarem?.isMarketplaceSubsidized && (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-medium">
                      Barem Destekli
                    </span>
                  )}
                </div>

                {matchedBarem ? (
                  <div className="text-slate-200">
                    <div className="font-semibold text-blue-300">{matchedBarem.tierName}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {matchedBarem.minCartPrice} - {matchedBarem.maxCartPrice >= 900000 ? '300+ TL' : `${matchedBarem.maxCartPrice} TL`} arası sepetlerde satıcıya {matchedBarem.sellerCargoFee.toFixed(2)} TL yansıtılır.
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500 text-[11px]">
                    Bu fiyata özel barem bulunamadı, standart kargo tarifesi uygulanacaktır.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: EXCEL'DEN TARİFE YÜKLEME MODALI */}
      {/* ========================================================================= */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">Excel'den Kargo Barem Tarifesi Yükle</h3>
              </div>
              <button
                onClick={() => setImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-400 space-y-2">
              <p>
                Pazaryerinin Excel/CSV tablosunu kopyalayıp aşağıdaki alana yapıştırabilir veya CSV dosyanızın içeriğini yükleyebilirsiniz.
              </p>
              <p className="text-[11px] font-mono text-slate-500">
                Kolon Sırası: Kanal; Kargo Firması; Barem Adı; Min Sepet; Max Sepet; Min Desi; Max Desi; Satıcı Ücreti; Destekli mi
              </p>
            </div>

            <textarea
              rows={6}
              value={importCsvText}
              onChange={(e) => setImportCsvText(e.target.value)}
              placeholder="trendyol;Trendyol Express;Barem 1;0;150;0;10;9.00;Evet
trendyol;Aras Kargo;Barem 1;0;150;0;10;20.00;Evet"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-600"
            />

            {/* Error badge */}
            {importError && (
              <div className="p-2.5 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {importError}
              </div>
            )}

            {/* Preview table if parsed */}
            {importPreview && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-medium text-emerald-400">
                  <span>Önizleme: {importPreview.length} adet geçerli tarife kuralı okundu</span>
                  <label className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                    <input
                      type="checkbox"
                      checked={importOverwrite}
                      onChange={(e) => setImportOverwrite(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700"
                    />
                    Mevcut tarifeleri temizle (üzerine yaz)
                  </label>
                </div>
                <div className="max-h-40 overflow-y-auto bg-slate-950 rounded border border-slate-800 p-2 text-[11px] font-mono divide-y divide-slate-800">
                  {importPreview.map((item, idx) => (
                    <div key={idx} className="py-1 flex items-center justify-between">
                      <span className="text-slate-300">
                        {item.channel.toUpperCase()} · {item.cargoProvider} ({item.minDesi}-{item.maxDesi} Desi)
                      </span>
                      <span className="text-emerald-400 font-bold">{item.sellerCargoFee.toFixed(2)} TL</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                Örnek Excel Şablonu İndir
              </button>

              <div className="flex items-center gap-2">
                {!importPreview ? (
                  <button
                    type="button"
                    onClick={handlePreviewCsv}
                    disabled={!importCsvText.trim()}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-md text-xs font-medium transition-colors"
                  >
                    Önizle ve Doğrula
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleConfirmImport}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-medium transition-colors flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Sisteme Yükle ({importPreview.length} Barem)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: YENİ TEKİL BAREM KURALI EKLEME */}
      {/* ========================================================================= */}
      {newRuleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                Yeni Kargo Barem Kuralı Tanımla
              </h3>
              <button
                onClick={() => setNewRuleModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Kanal</label>
                  <select
                    value={newRule.channel}
                    onChange={(e) => setNewRule({ ...newRule, channel: e.target.value as MarketplaceChannel })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                  >
                    <option value="trendyol">Trendyol</option>
                    <option value="hepsiburada">Hepsiburada</option>
                    <option value="n11">N11</option>
                    <option value="pttavm">PttAVM</option>
                    <option value="pazarama">Pazarama</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Kargo Firması</label>
                  <input
                    type="text"
                    value={newRule.cargoProvider}
                    onChange={(e) => setNewRule({ ...newRule, cargoProvider: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                    placeholder="Trendyol Express, Aras vb."
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Barem Adı</label>
                <input
                  type="text"
                  value={newRule.tierName}
                  onChange={(e) => setNewRule({ ...newRule, tierName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                  placeholder="Örn: 10 Desi Altı Barem 1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Min Sepet Tutarı (TL)</label>
                  <input
                    type="number"
                    value={newRule.minCartPrice}
                    onChange={(e) => setNewRule({ ...newRule, minCartPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 font-mono text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Max Sepet Tutarı (TL)</label>
                  <input
                    type="number"
                    value={newRule.maxCartPrice}
                    onChange={(e) => setNewRule({ ...newRule, maxCartPrice: parseFloat(e.target.value) || 999999 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 font-mono text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Min Desi</label>
                  <input
                    type="number"
                    value={newRule.minDesi}
                    onChange={(e) => setNewRule({ ...newRule, minDesi: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 font-mono text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Max Desi</label>
                  <input
                    type="number"
                    value={newRule.maxDesi}
                    onChange={(e) => setNewRule({ ...newRule, maxDesi: parseFloat(e.target.value) || 99 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 font-mono text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Satıcıya Yansıyan Ücret (TL)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newRule.sellerCargoFee}
                    onChange={(e) => setNewRule({ ...newRule, sellerCargoFee: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 font-mono text-emerald-400 font-bold"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="subsidizedCheck"
                    checked={newRule.isMarketplaceSubsidized}
                    onChange={(e) => setNewRule({ ...newRule, isMarketplaceSubsidized: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-700"
                  />
                  <label htmlFor="subsidizedCheck" className="text-slate-300">
                    Pazaryeri Barem Desteği Var
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setNewRuleModalOpen(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => {
                  if (newRule.cargoProvider && newRule.sellerCargoFee !== undefined) {
                    onAddTariff({
                      id: `tier-user-${Date.now()}`,
                      channel: newRule.channel || 'trendyol',
                      cargoProvider: newRule.cargoProvider,
                      tierName: newRule.tierName || `${newRule.cargoProvider} Barem`,
                      minCartPrice: newRule.minCartPrice || 0,
                      maxCartPrice: newRule.maxCartPrice || 999999,
                      minDesi: newRule.minDesi || 0,
                      maxDesi: newRule.maxDesi || 99,
                      sellerCargoFee: newRule.sellerCargoFee,
                      isMarketplaceSubsidized: !!newRule.isMarketplaceSubsidized,
                      validFromUtc: new Date().toISOString()
                    });
                    setNewRuleModalOpen(false);
                  }
                }}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
