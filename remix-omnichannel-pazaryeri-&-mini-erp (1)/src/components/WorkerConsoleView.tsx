import React, { useState } from 'react';
import { SyncLog, WorkerStatus } from '../types';
import { 
  Play, 
  Pause, 
  RotateCw, 
  Terminal, 
  Clock, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  Filter,
  Trash2,
  Cpu
} from 'lucide-react';

interface WorkerConsoleViewProps {
  workerStatus: WorkerStatus;
  syncLogs: SyncLog[];
  onTogglePause: () => void;
  onTriggerSingleJob: (moduleName: string) => void;
  onUpdateInterval: (module: 'orders' | 'inventory' | 'questions', seconds: number) => void;
  onClearLogs: () => void;
}

export const WorkerConsoleView: React.FC<WorkerConsoleViewProps> = ({
  workerStatus,
  syncLogs,
  onTogglePause,
  onTriggerSingleJob,
  onUpdateInterval,
  onClearLogs
}) => {
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<SyncLog | null>(null);

  const filteredLogs = syncLogs.filter(log => {
    return moduleFilter === 'all' || log.module === moduleFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Station */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-400" />
              <span>Background Worker Servis Havuzu & Görev Yöneticisi</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              .NET 8 IHostedService arka plan iş parçacıkları; pazaryeri API lerinden veri çeker, stok eşler ve veritabanına yazar.
            </p>
          </div>

          {/* Master Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={onTogglePause}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold shadow-md transition-all ${
                workerStatus.isPaused 
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                  : 'bg-amber-600 hover:bg-amber-500 text-white'
              }`}
            >
              {workerStatus.isPaused ? (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Servisi Başlat</span>
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Servisi Duraklat</span>
                </>
              )}
            </button>

            <button
              onClick={() => onTriggerSingleJob('Orders')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Şimdi Tetikle</span>
            </button>
          </div>
        </div>

        {/* Worker Threads Status & Intervals */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-4 border-t border-slate-800">
          {/* Order Thread */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-blue-400">Sipariş Çekme İşi</span>
              <span className={`w-2 h-2 rounded-full ${workerStatus.isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
            </div>
            <div className="text-slate-400 text-[11px]">Yeni siparişleri çeker, rezervasyon yapar</div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-500">Periyot:</span>
              <select
                value={workerStatus.ordersIntervalSec}
                onChange={(e) => onUpdateInterval('orders', parseInt(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-slate-200 text-[11px]"
              >
                <option value={30}>30 Saniye</option>
                <option value={60}>1 Dakika</option>
                <option value={120}>2 Dakika</option>
                <option value={300}>5 Dakika</option>
              </select>
            </div>
          </div>

          {/* Inventory Thread */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-emerald-400">Stok & Fiyat İtiş İşi</span>
              <span className={`w-2 h-2 rounded-full ${workerStatus.isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
            </div>
            <div className="text-slate-400 text-[11px]">Değişen stokları pazaryerlerine iletir</div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-500">Periyot:</span>
              <select
                value={workerStatus.inventoryIntervalSec}
                onChange={(e) => onUpdateInterval('inventory', parseInt(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-slate-200 text-[11px]"
              >
                <option value={60}>1 Dakika</option>
                <option value={180}>3 Dakika</option>
                <option value={300}>5 Dakika</option>
              </select>
            </div>
          </div>

          {/* Question Thread */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-purple-400">Soru-Cevap & SLA İşi</span>
              <span className={`w-2 h-2 rounded-full ${workerStatus.isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
            </div>
            <div className="text-slate-400 text-[11px]">Müşteri sorularını çeker, SLA kontrolü yapar</div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-500">Periyot:</span>
              <select
                value={workerStatus.questionsIntervalSec}
                onChange={(e) => onUpdateInterval('questions', parseInt(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-slate-200 text-[11px]"
              >
                <option value={60}>1 Dakika</option>
                <option value={300}>5 Dakika</option>
                <option value={600}>10 Dakika</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Log Console Station */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-white">Yapılandırılmış Senkronizasyon Logları (Serilog Sink)</h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Module Filter */}
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">Tüm Modüller</option>
              <option value="Orders">Siparişler</option>
              <option value="Inventory">Envanter</option>
              <option value="Questions">Sorular</option>
              <option value="Settlements">Finans</option>
            </select>

            <button
              onClick={onClearLogs}
              className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 px-2 py-1 rounded bg-slate-950 border border-slate-800"
              title="Konsol geçmişini temizle"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Temizle</span>
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                <th className="py-2.5 px-3">Zaman</th>
                <th className="py-2.5 px-3">Mağaza / Kanal</th>
                <th className="py-2.5 px-3">Modül</th>
                <th className="py-2.5 px-3">Durum</th>
                <th className="py-2.5 px-3 text-right">Kayıt Sayısı</th>
                <th className="py-2.5 px-3 text-right">Süre (ms)</th>
                <th className="py-2.5 px-3">Detay Açıklaması</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                    Henüz log kaydı oluşmadı.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 px-3 text-slate-400">
                      {new Date(log.timestampUtc).toLocaleTimeString('tr-TR')}
                    </td>
                    <td className="py-2 px-3 text-slate-200 font-sans">
                      {log.storeName || '-'}
                    </td>
                    <td className="py-2 px-3 text-blue-400">
                      {log.module}
                    </td>
                    <td className="py-2 px-3">
                      <span className="text-emerald-400 font-bold">
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-slate-200 tabular-nums">
                      {log.processedCount}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-400 tabular-nums">
                      {log.durationMs}
                    </td>
                    <td className="py-2 px-3 text-slate-300 font-sans truncate max-w-md" title={log.details}>
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
