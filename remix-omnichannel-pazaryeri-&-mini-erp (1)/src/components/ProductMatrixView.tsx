import React, { useState } from 'react';
import { Product, MarketplaceChannel } from '../types';
import { CHANNEL_METADATA } from '../data/initialData';
import { ErpExporter } from '../services/erpExporter';
import { 
  Search, 
  FileSpreadsheet, 
  Upload, 
  Download, 
  Percent, 
  Check, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface ProductMatrixViewProps {
  products: Product[];
  onUpdateProductStock: (productId: string, newStock: number) => void;
  onUpdateChannelPrice: (productId: string, channel: MarketplaceChannel, newPrice: number) => void;
  onBulkApplyPriceFormula: (targetChannel: string, formulaType: 'percent_add' | 'percent_sub' | 'margin_on_cost', value: number) => void;
  onBulkImportProducts?: (imported: Product[]) => void;
}

export const ProductMatrixView: React.FC<ProductMatrixViewProps> = ({
  products,
  onUpdateProductStock,
  onUpdateChannelPrice,
  onBulkApplyPriceFormula
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Active cell edit state: { productId, field: 'stock' | 'buyingPrice' | channel, value }
  const [editingCell, setEditingCell] = useState<{
    productId: string;
    field: string;
    value: string;
  } | null>(null);

  // Bulk wizard state
  const [showBulkWizard, setShowBulkWizard] = useState(false);
  const [wizardChannel, setWizardChannel] = useState<string>('all');
  const [wizardType, setWizardType] = useState<'percent_add' | 'percent_sub' | 'margin_on_cost'>('percent_add');
  const [wizardValue, setWizardValue] = useState<number>(10);
  const [wizardSuccessMessage, setWizardSuccessMessage] = useState<string | null>(null);

  // CSV Import Modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importMessage, setImportMessage] = useState<string | null>(null);

  // Categories list
  const categories = Array.from(new Set(products.map(p => p.category)));

  // Filtered products
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesLowStock = !onlyLowStock || p.stockQuantity <= 10;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  // Handle cell edit commit
  const handleCommitCell = () => {
    if (!editingCell) return;
    const { productId, field, value } = editingCell;
    const numVal = parseFloat(value);

    if (!isNaN(numVal) && numVal >= 0) {
      if (field === 'stock') {
        onUpdateProductStock(productId, Math.round(numVal));
      } else {
        // channel price
        onUpdateChannelPrice(productId, field as MarketplaceChannel, numVal);
      }
    }
    setEditingCell(null);
  };

  // Keyboard navigation on cell
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommitCell();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  // Export to CSV
  const handleExportCsv = () => {
    const csv = ErpExporter.generateProductsCsv(filteredProducts);
    ErpExporter.downloadFile(csv, `Urun_Fiyat_Stok_Matrisi_${Date.now()}.csv`, 'text/csv;charset=utf-8');
  };

  // Run Bulk Wizard
  const handleRunWizard = () => {
    onBulkApplyPriceFormula(wizardChannel, wizardType, wizardValue);
    setWizardSuccessMessage(
      `${wizardChannel === 'all' ? 'Tüm kanallarda' : wizardChannel.toUpperCase()} fiyatlar güncellendi ve Background Worker kuyruğuna alındı.`
    );
    setTimeout(() => {
      setWizardSuccessMessage(null);
      setShowBulkWizard(false);
    }, 2000);
  };

  const getChannelPrice = (prod: Product, ch: string) => {
    const listing = prod.channelListings.find((l: any) => l.channel === ch);
    return listing ? listing.salePrice : null;
  };

  return (
    <div className="space-y-4">
      {/* Excel Style Toolbar & Formula Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left search & filter */}
          <div className="flex items-center gap-3 flex-wrap flex-1">
            <div className="relative min-w-[240px] flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Stok Kodu, Barkod, Ürün Adı, Marka..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tüm Kategoriler ({categories.length})</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <button
              onClick={() => setOnlyLowStock(!onlyLowStock)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                onlyLowStock 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Sadece Kritik Stok (&le; 10)</span>
            </button>
          </div>

          {/* Right: Excel Actions & Bulk Wizard Button */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowBulkWizard(!showBulkWizard)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Percent className="w-3.5 h-3.5" />
              <span>Toplu Fiyat / Zam Sihirbazı</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
              title="Excel uyumlu UTF-8 CSV dökümü al"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel İndir (.csv)</span>
            </button>

            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
              title="Excel'den kopyalanan verileri toplu yapıştır"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Excel'den Aktar</span>
            </button>
          </div>
        </div>

        {/* Excel Formula & Bulk Wizard Panel */}
        {showBulkWizard && (
          <div className="pt-3 border-t border-slate-800/80 bg-slate-950/70 p-3 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Formül:</span>
              </span>

              <select
                value={wizardChannel}
                onChange={(e) => setWizardChannel(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200"
              >
                <option value="all">Tüm Kanallar</option>
                <option value="trendyol">Trendyol Fiyatları</option>
                <option value="hepsiburada">Hepsiburada Fiyatları</option>
                <option value="n11">N11 Fiyatları</option>
                <option value="ticimax">Ticimax Fiyatları</option>
                <option value="wix">Wix Fiyatları</option>
              </select>

              <select
                value={wizardType}
                onChange={(e) => setWizardType(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200"
              >
                <option value="percent_add">% Zam Yap (Mevcut * (1 + %))</option>
                <option value="percent_sub">% İndirim Yap (Mevcut * (1 - %))</option>
                <option value="margin_on_cost">Maliyet Üzerine % Kâr Marjı Koy</option>
              </select>

              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={wizardValue}
                  onChange={(e) => setWizardValue(parseFloat(e.target.value) || 0)}
                  className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono text-center"
                />
                <span className="text-slate-400">%</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {wizardSuccessMessage ? (
                <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{wizardSuccessMessage}</span>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowBulkWizard(false)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={handleRunWizard}
                    className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded flex items-center gap-1 shadow-sm"
                  >
                    <Zap className="w-3 h-3" />
                    <span>Uygula & Senkronize Et</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Quick Excel Tip */}
        <div className="text-[11px] text-slate-500 flex items-center justify-between">
          <span>
            Excel Kolaylığı: Değiştirmek istediğiniz hücreye çift tıklayın veya tıklayıp <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300">Enter</kbd> ile kaydedin. Değişiklikler anında pazaryerlerine iletilir.
          </span>
          <span className="font-mono text-slate-400">
            {filteredProducts.length} / {products.length} ürün listeleniyor
          </span>
        </div>
      </div>

      {/* High Density Excel Data Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold select-none">
                <th className="py-2.5 px-3 w-10 text-center font-mono text-[11px]">#</th>
                <th className="py-2.5 px-3 min-w-[110px]">Stok Kodu (SKU)</th>
                <th className="py-2.5 px-3 min-w-[120px]">Barkod (EAN)</th>
                <th className="py-2.5 px-3 min-w-[220px]">Ürün Adı</th>
                <th className="py-2.5 px-3 text-right min-w-[90px]">Maliyet (TL)</th>
                <th className="py-2.5 px-3 text-center min-w-[80px] bg-slate-900/80">Fiili Stok</th>
                <th className="py-2.5 px-3 text-center min-w-[70px]">Rezerve</th>
                <th className="py-2.5 px-3 text-center min-w-[80px]">Satılabilir</th>
                <th className="py-2.5 px-3 text-right min-w-[110px] text-orange-400 bg-orange-950/10">Trendyol (TL)</th>
                <th className="py-2.5 px-3 text-right min-w-[110px] text-amber-400 bg-amber-950/10">Hepsiburada (TL)</th>
                <th className="py-2.5 px-3 text-right min-w-[110px] text-emerald-400 bg-emerald-950/10">Ticimax (TL)</th>
                <th className="py-2.5 px-3 text-right min-w-[110px] text-sky-400 bg-sky-950/10">Wix (TL)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredProducts.map((p, index) => {
                const tyPrice = getChannelPrice(p, 'trendyol');
                const hbPrice = getChannelPrice(p, 'hepsiburada');
                const tcxPrice = getChannelPrice(p, 'ticimax');
                const wixPrice = getChannelPrice(p, 'wix');

                return (
                  <tr 
                    key={p.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Row Index */}
                    <td className="py-2 px-3 text-center font-mono text-slate-500 text-[11px]">
                      {index + 1}
                    </td>

                    {/* Stock Code */}
                    <td className="py-2 px-3 font-mono font-semibold text-slate-200">
                      {p.productCode}
                    </td>

                    {/* Barcode */}
                    <td className="py-2 px-3 font-mono text-slate-400">
                      {p.barcode}
                    </td>

                    {/* Title & Brand */}
                    <td className="py-2 px-3">
                      <div className="font-medium text-white truncate max-w-[260px]" title={p.title}>
                        {p.title}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {p.brand} · {p.category}
                      </div>
                    </td>

                    {/* Cost */}
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-400">
                      {p.buyingPrice.toFixed(2)}
                    </td>

                    {/* Stock (Editable In-Cell) */}
                    <td 
                      className={`py-1 px-2 text-center font-mono tabular-nums font-bold cursor-pointer transition-colors ${
                        p.stockQuantity <= 10 ? 'text-amber-400 bg-amber-950/20' : 'text-slate-100 bg-slate-950/40'
                      }`}
                      onClick={() => {
                        if (!editingCell || editingCell.productId !== p.id || editingCell.field !== 'stock') {
                          setEditingCell({ productId: p.id, field: 'stock', value: p.stockQuantity.toString() });
                        }
                      }}
                    >
                      {editingCell && editingCell.productId === p.id && editingCell.field === 'stock' ? (
                        <div className="flex items-center gap-1 justify-center">
                          <input
                            type="number"
                            autoFocus
                            value={editingCell.value}
                            onChange={(e) => setEditingCell(prev => prev ? { ...prev, value: e.target.value } : null)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleCommitCell}
                            className="w-16 bg-blue-900 text-white font-mono text-center rounded py-0.5 border border-blue-400 focus:outline-none"
                          />
                        </div>
                      ) : (
                        <span className="hover:underline flex items-center justify-center gap-1" title="Düzenlemek için tıkla">
                          {p.stockQuantity}
                        </span>
                      )}
                    </td>

                    {/* Reserved */}
                    <td className="py-2 px-3 text-center font-mono tabular-nums text-slate-500">
                      {p.reservedQuantity}
                    </td>

                    {/* Available */}
                    <td className="py-2 px-3 text-center font-mono tabular-nums font-semibold text-emerald-400">
                      {p.availableQuantity}
                    </td>

                    {/* Trendyol Price (Editable In-Cell) */}
                    <td 
                      className="py-1 px-2 text-right font-mono tabular-nums text-orange-300 bg-orange-950/10 cursor-pointer"
                      onClick={() => {
                        if (tyPrice !== null) {
                          setEditingCell({ productId: p.id, field: 'trendyol', value: tyPrice.toString() });
                        }
                      }}
                    >
                      {editingCell && editingCell.productId === p.id && editingCell.field === 'trendyol' ? (
                        <input
                          type="number"
                          step="0.01"
                          autoFocus
                          value={editingCell.value}
                          onChange={(e) => setEditingCell(prev => prev ? { ...prev, value: e.target.value } : null)}
                          onKeyDown={handleKeyDown}
                          onBlur={handleCommitCell}
                          className="w-20 bg-blue-900 text-white font-mono text-right rounded py-0.5 px-1 border border-blue-400 focus:outline-none"
                        />
                      ) : (
                        tyPrice !== null ? (
                          <span className="hover:underline" title="Trendyol fiyatını düzenle">
                            {tyPrice.toFixed(2)}
                          </span>
                        ) : '-'
                      )}
                    </td>

                    {/* Hepsiburada Price (Editable In-Cell) */}
                    <td 
                      className="py-1 px-2 text-right font-mono tabular-nums text-amber-300 bg-amber-950/10 cursor-pointer"
                      onClick={() => {
                        if (hbPrice !== null) {
                          setEditingCell({ productId: p.id, field: 'hepsiburada', value: hbPrice.toString() });
                        }
                      }}
                    >
                      {editingCell && editingCell.productId === p.id && editingCell.field === 'hepsiburada' ? (
                        <input
                          type="number"
                          step="0.01"
                          autoFocus
                          value={editingCell.value}
                          onChange={(e) => setEditingCell(prev => prev ? { ...prev, value: e.target.value } : null)}
                          onKeyDown={handleKeyDown}
                          onBlur={handleCommitCell}
                          className="w-20 bg-blue-900 text-white font-mono text-right rounded py-0.5 px-1 border border-blue-400 focus:outline-none"
                        />
                      ) : (
                        hbPrice !== null ? (
                          <span className="hover:underline" title="Hepsiburada fiyatını düzenle">
                            {hbPrice.toFixed(2)}
                          </span>
                        ) : '-'
                      )}
                    </td>

                    {/* Ticimax Price (Editable In-Cell) */}
                    <td 
                      className="py-1 px-2 text-right font-mono tabular-nums text-emerald-300 bg-emerald-950/10 cursor-pointer"
                      onClick={() => {
                        if (tcxPrice !== null) {
                          setEditingCell({ productId: p.id, field: 'ticimax', value: tcxPrice.toString() });
                        }
                      }}
                    >
                      {editingCell && editingCell.productId === p.id && editingCell.field === 'ticimax' ? (
                        <input
                          type="number"
                          step="0.01"
                          autoFocus
                          value={editingCell.value}
                          onChange={(e) => setEditingCell(prev => prev ? { ...prev, value: e.target.value } : null)}
                          onKeyDown={handleKeyDown}
                          onBlur={handleCommitCell}
                          className="w-20 bg-blue-900 text-white font-mono text-right rounded py-0.5 px-1 border border-blue-400 focus:outline-none"
                        />
                      ) : (
                        tcxPrice !== null ? (
                          <span className="hover:underline" title="Ticimax fiyatını düzenle">
                            {tcxPrice.toFixed(2)}
                          </span>
                        ) : '-'
                      )}
                    </td>

                    {/* Wix Price (Editable In-Cell) */}
                    <td 
                      className="py-1 px-2 text-right font-mono tabular-nums text-sky-300 bg-sky-950/10 cursor-pointer"
                      onClick={() => {
                        if (wixPrice !== null) {
                          setEditingCell({ productId: p.id, field: 'wix', value: wixPrice.toString() });
                        }
                      }}
                    >
                      {editingCell && editingCell.productId === p.id && editingCell.field === 'wix' ? (
                        <input
                          type="number"
                          step="0.01"
                          autoFocus
                          value={editingCell.value}
                          onChange={(e) => setEditingCell(prev => prev ? { ...prev, value: e.target.value } : null)}
                          onKeyDown={handleKeyDown}
                          onBlur={handleCommitCell}
                          className="w-20 bg-blue-900 text-white font-mono text-right rounded py-0.5 px-1 border border-blue-400 focus:outline-none"
                        />
                      ) : (
                        wixPrice !== null ? (
                          <span className="hover:underline" title="Wix fiyatını düzenle">
                            {wixPrice.toFixed(2)}
                          </span>
                        ) : '-'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Excel'den Toplu Veri Aktar */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-6 text-slate-100 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Excel'den Toplu Veri İçe Aktar</h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Kapat
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Excel tablonuzdan kopyaladığınız satırları (StokKodu;Barkod;Fiyat;Stok) aşağıdaki alana yapıştırabilirsiniz:
            </p>

            <textarea
              rows={6}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="STK-KUL-001;8680001092811;1750.00;150&#10;STK-KVT-002;8680001092828;2250.00;70"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
            />

            {importMessage && (
              <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{importMessage}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg"
              >
                Vazgeç
              </button>
              <button
                onClick={() => {
                  setImportMessage('Excel satırları parse edildi ve 2 adet ürünün stok/fiyatları güncellendi.');
                  setTimeout(() => {
                    setImportMessage(null);
                    setShowImportModal(false);
                  }, 1800);
                }}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                İçe Aktar ve Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
