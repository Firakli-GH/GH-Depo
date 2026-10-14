import React, { useState } from 'react';
import { SettlementReport, SettlementItem } from '../types';
import { CHANNEL_METADATA } from '../data/initialData';
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Calendar, 
  CreditCard,
  X,
  ArrowDownRight,
  ArrowUpRight,
  Code
} from 'lucide-react';
import { RawJsonViewer } from './RawJsonViewer';

interface FinanceViewProps {
  settlements: SettlementReport[];
}

export const FinanceView: React.FC<FinanceViewProps> = ({ settlements }) => {
  const [selectedReport, setSelectedReport] = useState<SettlementReport | null>(null);
  const [activeTab, setActiveTab] = useState<'items' | 'raw_json'>('items');

  // Total metrics
  const totalSales = settlements.reduce((sum, s) => sum + s.totalSalesAmount, 0);
  const totalCommission = settlements.reduce((sum, s) => sum + s.totalCommissionAmount, 0);
  const totalCargo = settlements.reduce((sum, s) => sum + s.totalCargoFeeAmount, 0);
  const totalNet = settlements.reduce((sum, s) => sum + s.netPayoutAmount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span>Pazaryeri Finans & Hakediş Mutabakatı</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Komisyon kesintileri, kargo fatura bedelleri, desi uyuşmazlıkları ve hesaba geçecek net hakedişler.
          </p>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium">Toplam Brüt Satış</div>
          <div className="text-xl font-bold font-mono text-white tabular-nums mt-1">
            {totalSales.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-emerald-400" />
            <span>Müşteriden tahsil edilen</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium">Pazaryeri Komisyonları</div>
          <div className="text-xl font-bold font-mono text-red-400 tabular-nums mt-1">
            -{totalCommission.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Ort. Komisyon Oranı: %{( (totalCommission / (totalSales || 1)) * 100 ).toFixed(1)}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium">Kargo Taşıma Giderleri</div>
          <div className="text-xl font-bold font-mono text-amber-400 tabular-nums mt-1">
            -{totalCargo.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Anlaşmalı kargo kesintileri
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium">Banka Hesabına Geçecek Net</div>
          <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums mt-1">
            {totalNet.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
          </div>
          <div className="text-[11px] text-emerald-500/80 mt-1 font-semibold">
            Logo Cari Hesaba Aktarılabilir
          </div>
        </div>
      </div>

      {/* Settlement Reports Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">Dönemsel Hakediş & Mutabakat Raporları</h3>
          <span className="text-xs text-slate-400 font-mono">{settlements.length} rapor listelendi</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                <th className="py-3 px-3">Dönem Kodu & Kanal</th>
                <th className="py-3 px-3">Dönem Aralığı</th>
                <th className="py-3 px-3">Vade / Ödeme Tarihi</th>
                <th className="py-3 px-3 text-right">Brüt Satış</th>
                <th className="py-3 px-3 text-right">Komisyon</th>
                <th className="py-3 px-3 text-right">Kargo Kesintisi</th>
                <th className="py-3 px-3 text-right text-emerald-400">Net Hakediş</th>
                <th className="py-3 px-3">Durum</th>
                <th className="py-3 px-3 text-center">Detay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {settlements.map((rep) => {
                const chInfo = CHANNEL_METADATA[rep.channel];
                return (
                  <tr key={rep.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Period & Channel */}
                    <td className="py-3 px-3">
                      <div className="font-mono font-semibold text-white">{rep.periodCode}</div>
                      <span className={`text-[10px] font-semibold px-2 py-0.2 rounded mt-1 inline-block ${chInfo?.badgeBg}`}>
                        {chInfo?.name}
                      </span>
                    </td>

                    {/* Date Range */}
                    <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">
                      {new Date(rep.startDateUtc).toLocaleDateString('tr-TR')} - {new Date(rep.endDateUtc).toLocaleDateString('tr-TR')}
                    </td>

                    {/* Due Date */}
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-300">
                      {new Date(rep.paymentDueDateUtc).toLocaleDateString('tr-TR')}
                    </td>

                    {/* Gross */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-200">
                      {rep.totalSalesAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                    </td>

                    {/* Commission */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-red-400">
                      -{rep.totalCommissionAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                    </td>

                    {/* Cargo */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-amber-400">
                      -{rep.totalCargoFeeAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                    </td>

                    {/* Net Payout */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-emerald-400 text-sm">
                      {rep.netPayoutAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      {rep.status === 'Reconciled' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Mutabık</span>
                        </span>
                      ) : rep.status === 'DiscrepancyFound' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded" title={rep.discrepancyNote}>
                          <AlertTriangle className="w-3 h-3" />
                          <span>Uyuşmazlık Var</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Bekliyor</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => setSelectedReport(rep)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium"
                      >
                        İncele
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Settlement Line Items & Discrepancy Inspector */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 text-slate-100 shadow-2xl relative space-y-4">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Hakediş & Mutabakat: {selectedReport.periodCode}</h3>
                  <p className="text-xs text-slate-400">Kanal: {CHANNEL_METADATA[selectedReport.channel]?.name}</p>
                </div>
              </div>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setActiveTab('items')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === 'items'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                Hakediş Kalemleri ({selectedReport.items.length})
              </button>
              <button
                onClick={() => setActiveTab('raw_json')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === 'raw_json'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Code className="w-3.5 h-3.5 text-sky-400" />
                <span>Ham JSON Raporu</span>
              </button>
            </div>

            {activeTab === 'raw_json' ? (
              <div className="max-h-96 overflow-y-auto">
                <RawJsonViewer
                  rawJsonString={selectedReport.rawPayloadJson}
                  rawPayload={selectedReport.rawPayload}
                  title={`${CHANNEL_METADATA[selectedReport.channel]?.name} Hakediş Ham Yanıtı`}
                  sourceChannel={selectedReport.channel}
                  entityType="Settlement"
                  identifier={selectedReport.periodCode}
                />
              </div>
            ) : (
              <>
                {selectedReport.discrepancyNote && (
                  <div className="bg-amber-950/30 border border-amber-500/30 p-3 rounded-lg text-xs text-amber-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Tespit Edilen Uyuşmazlık: </span>
                      {selectedReport.discrepancyNote}
                    </div>
                  </div>
                )}

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {selectedReport.items.map((item) => (
                    <div 
                      key={item.id}
                      className="bg-slate-950 border border-slate-800 rounded p-2.5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-200">{item.description}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Sipariş: {item.orderNumber || '-'} · {new Date(item.transactionDateUtc).toLocaleDateString('tr-TR')}
                        </div>
                      </div>

                      <div className={`font-mono font-bold tabular-nums ${item.amount < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {item.amount < 0 ? '' : '+'}{item.amount.toFixed(2)} TL
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Net Hakediş:</span>
                  <span className="font-mono text-base font-bold text-emerald-400 tabular-nums">
                    {selectedReport.netPayoutAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                  </span>
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedReport(null)}
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
