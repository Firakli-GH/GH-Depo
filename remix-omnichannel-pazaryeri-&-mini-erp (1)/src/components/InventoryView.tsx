import React, { useState } from 'react';
import { ErpInventoryProduct, MainProduct } from '../types';
import { ErpExporter } from '../services/erpExporter';
import { 
  Warehouse, 
  Search, 
  Download, 
  AlertTriangle, 
  Boxes, 
  CheckCircle2, 
  TrendingUp, 
  Scale, 
  Clock,
  Plus
} from 'lucide-react';

interface InventoryViewProps {
  inventoryList: ErpInventoryProduct[];
  mainProducts: MainProduct[];
  onUpdateInventoryStock: (id: string, newStock: number) => void;
  onUpdateInventoryPrice: (id: string, newPrice: number) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventoryList,
  mainProducts,
  onUpdateInventoryStock,
  onUpdateInventoryPrice
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCell, setEditingCell] = useState<{ id: string; field: 'stock' | 'price'; value: string } | null>(null);

  const filteredInventory = inventoryList.filter(item => {
    return (
      item.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleCommit = () => {
    if (!editingCell) return;
    const num = parseFloat(editingCell.value);
    if (!isNaN(num) && num >= 0) {
      if (editingCell.field === 'stock') {
        onUpdateInventoryStock(editingCell.id, Math.round(num));
      } else {
        onUpdateInventoryPrice(editingCell.id, num);
      }
    }
    setEditingCell(null);
  };

  const getUsedInBundlesCount = (invId: string) => {
    return mainProducts.filter(mp => mp.recipeItems.some(r => r.erpInventoryProductId === invId)).length;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-emerald-400" />
            <span>Mini ERP Depo Envanteri (1. Kademe Fiziki Stoklar)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Depodaki gerçek sayım adetleri, birim alış maliyetleri ve desiler. Buradaki stok değişimi tüm paketlerin sanal stoklarını doğrudan etkiler.
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex justify-between items-center">
        <div className="relative min-w-[260px] max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ERP Stok Kodu, Orijinal Barkod, Ürün Adı..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="text-xs text-slate-400 font-mono">
          {filteredInventory.length} fiziki stok kartı
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold select-none">
                <th className="py-2.5 px-3">ERP Stok Kodu</th>
                <th className="py-2.5 px-3">Orijinal Barkod (EAN)</th>
                <th className="py-2.5 px-3">Fiziki Ürün Tanımı</th>
                <th className="py-2.5 px-3 text-right">Alış Maliyeti (TL)</th>
                <th className="py-2.5 px-3 text-center bg-slate-900/80">Fiili Depo Stoğu</th>
                <th className="py-2.5 px-3 text-center">Rezerve Stok</th>
                <th className="py-2.5 px-3 text-center">Satılabilir Net</th>
                <th className="py-2.5 px-3 text-right">Birim Desi</th>
                <th className="py-2.5 px-3 text-center">Bağlı Olduğu Paketler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredInventory.map((item) => {
                const bundleCount = getUsedInBundlesCount(item.id);

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-white">
                      {item.productCode}
                    </td>

                    <td className="py-2.5 px-3 font-mono text-slate-400">
                      {item.barcode}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-200">{item.title}</div>
                      <div className="text-[10px] text-slate-400">{item.brand} · {item.category}</div>
                    </td>

                    {/* Cost (Editable) */}
                    <td 
                      className="py-2 px-3 text-right font-mono tabular-nums text-slate-300 cursor-pointer hover:bg-slate-800"
                      onClick={() => setEditingCell({ id: item.id, field: 'price', value: item.buyingPrice.toString() })}
                    >
                      {editingCell?.id === item.id && editingCell.field === 'price' ? (
                        <input
                          type="number"
                          step="0.01"
                          autoFocus
                          value={editingCell.value}
                          onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && handleCommit()}
                          onBlur={handleCommit}
                          className="w-20 bg-blue-900 text-white font-mono text-right rounded py-0.5 px-1 border border-blue-400"
                        />
                      ) : (
                        <span className="hover:underline">{item.buyingPrice.toFixed(2)} TL</span>
                      )}
                    </td>

                    {/* Physical Stock (Editable) */}
                    <td 
                      className={`py-2 px-3 text-center font-mono tabular-nums font-bold cursor-pointer transition-colors ${
                        item.physicalStockQuantity <= 10 ? 'text-amber-400 bg-amber-950/20' : 'text-white bg-slate-950/40'
                      }`}
                      onClick={() => setEditingCell({ id: item.id, field: 'stock', value: item.physicalStockQuantity.toString() })}
                    >
                      {editingCell?.id === item.id && editingCell.field === 'stock' ? (
                        <input
                          type="number"
                          autoFocus
                          value={editingCell.value}
                          onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && handleCommit()}
                          onBlur={handleCommit}
                          className="w-16 bg-blue-900 text-white font-mono text-center rounded py-0.5 border border-blue-400"
                        />
                      ) : (
                        <span className="hover:underline">{item.physicalStockQuantity}</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono tabular-nums text-slate-500">
                      {item.reservedQuantity}
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono tabular-nums font-bold text-emerald-400">
                      {item.availableQuantity}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-400">
                      {item.unitDesi.toFixed(2)} d
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <span className="bg-purple-950/40 border border-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-[11px] font-mono">
                        {bundleCount} pakete bağlı
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
