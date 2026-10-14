import React, { useState } from 'react';
import { CSHARP_ARCHITECTURE_CODE, CodeSnippet } from '../data/csharpArchitectureCode';
import { ErpExporter } from '../services/erpExporter';
import { 
  Code2, 
  Database, 
  Layers, 
  Copy, 
  Check, 
  Download, 
  ShieldCheck, 
  Cpu, 
  FileText,
  Boxes,
  Workflow,
  Monitor
} from 'lucide-react';

interface ArchitectureViewProps {
  onNavigate?: (tab: string) => void;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({ onNavigate }) => {
  const [activeSnippetIndex, setActiveSnippetIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeSnippet = CSHARP_ARCHITECTURE_CODE[activeSnippetIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeSnippet.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAllCode = () => {
    let bundle = `/* ==========================================================================\n`;
    bundle += `   OMNICHANNEL PAZARYERİ & MINİ ERP - C# .NET 8.0 WPF ÇÖZÜM MİMARİSİ\n`;
    bundle += `   Entity Framework Core 8.0 + Background Worker + SOLID Katmanlı Mimari\n`;
    bundle += `   ========================================================================== */\n\n`;

    CSHARP_ARCHITECTURE_CODE.forEach((snip) => {
      bundle += `// ==========================================================================\n`;
      bundle += `// DOSYA: [${snip.project}] / ${snip.fileName}\n`;
      bundle += `// AÇIKLAMA: ${snip.summary}\n`;
      bundle += `// ==========================================================================\n\n`;
      bundle += snip.content;
      bundle += `\n\n`;
    });

    ErpExporter.downloadFile(bundle, 'OmniChannel_DotNet8_Architecture_Code.cs', 'text/plain;charset=utf-8');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            <span>C# .NET 8.0 WPF Katmanlı Mimari & EF Core Veritabanı Modeli</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            SOLID standartlarında modüler monolit yapı: Domain, Application, Infrastructure, Worker ve WPF Presentation.
          </p>
        </div>

        <button
          onClick={handleDownloadAllCode}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Tüm .NET 8 C# Kodlarını İndir (.cs)</span>
        </button>
      </div>

      {/* Quick Jump to WPF Studio Banner */}
      <div className="bg-gradient-to-r from-blue-950/90 via-slate-900 to-indigo-950/90 border border-blue-500/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>WPF (XAML & C# MVVM) Ekran Tasarım Kodları Burada mı Arıyorsunuz?</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">Windows 11 Fluent</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Dashboard, Sipariş, BOM Katalog ve tüm ekranların <strong>.xaml</strong> ve <strong>ViewModel.cs</strong> kodları <strong>WPF Ekran Stüdyosu</strong>'ndadır.
            </p>
          </div>
        </div>

        {onNavigate && (
          <button
            onClick={() => onNavigate('wpf-studio')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md transition-all shrink-0 cursor-pointer"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>WPF Ekran & XAML Kodlarına Git →</span>
          </button>
        )}
      </div>

      {/* Layer Architecture & SOLID Blueprint */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 space-y-1">
          <div className="text-xs font-bold text-blue-400">1. Domain Katmanı</div>
          <p className="text-[11px] text-slate-300">
            Hiçbir dış bağımlılığı olmayan saf C# sınıfları (POCO). Product, Order, StoreAccount, Question, Settlement varlıkları ve enumlar.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 space-y-1">
          <div className="text-xs font-bold text-indigo-400">2. Application Katmanı</div>
          <p className="text-[11px] text-slate-300">
            İş mantığı, CQRS/Service kontratları, FluentValidation kuralları ve <code className="text-slate-200">IMarketplaceAdapter</code> ortak arayüzü.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 space-y-1">
          <div className="text-xs font-bold text-purple-400">3. Infrastructure Katmanı</div>
          <p className="text-[11px] text-slate-300">
            EF Core 8 DbContext, SQL Server bağlantısı, Trendyol/HB/Wix/Ticimax HTTP istemcileri ve Logo XML dönüştürücüsü.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 space-y-1">
          <div className="text-xs font-bold text-emerald-400">4. Worker Katmanı</div>
          <p className="text-[11px] text-slate-300">
            IHostedService, PeriodicTimer ve Polly Retry politikalarıyla arka planda bağımsız çalışan veri çekme döngüleri.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 space-y-1">
          <div className="text-xs font-bold text-amber-400">5. WPF Presentation</div>
          <p className="text-[11px] text-slate-300">
            CommunityToolkit.Mvvm ile reaktif UI, Excel tipi yüksek hızlı DataGrid, asenkron komutlar ve JWT kullanıcı oturumu.
          </p>
        </div>
      </div>

      {/* Code Browser & EF Core Schema Inspector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {/* Snippets Navigation Bar */}
        <div className="bg-slate-950 p-2 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            {CSHARP_ARCHITECTURE_CODE.map((snippet, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSnippetIndex(idx)}
                className={`px-3 py-1.5 text-xs font-mono rounded-md whitespace-nowrap transition-colors ${
                  activeSnippetIndex === idx
                    ? 'bg-purple-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {snippet.fileName}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
          </button>
        </div>

        {/* Snippet Header Information */}
        <div className="px-5 py-3 bg-slate-900/80 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div>
            <span className="font-bold text-purple-400 font-mono">{activeSnippet.project}</span>
            <span className="text-slate-500 mx-2">/</span>
            <span className="font-bold text-white font-mono">{activeSnippet.fileName}</span>
            <span className="text-slate-400 ml-3">({activeSnippet.category})</span>
          </div>
          <p className="text-slate-400 text-[11px]">{activeSnippet.summary}</p>
        </div>

        {/* Code Content */}
        <div className="p-4 bg-slate-950 overflow-x-auto max-h-[600px] font-mono text-[11px] text-slate-200 leading-relaxed select-all">
          <pre>{activeSnippet.content}</pre>
        </div>
      </div>

      {/* Database Schema Visual Model */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-400" />
          <h3 className="text-base font-bold text-white">Entity Framework Core 8.0 Veritabanı Şeması Taslağı</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* Box 1: StoreAccount */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
            <div className="font-bold text-blue-400 flex items-center justify-between">
              <span>StoreAccounts</span>
              <span className="text-[10px] text-slate-500 font-mono">1:N İlişkiler</span>
            </div>
            <ul className="text-slate-400 space-y-1 font-mono text-[11px]">
              <li><span className="text-purple-400">PK</span> Id (Guid)</li>
              <li>StoreName (nvarchar 150)</li>
              <li>Channel (enum: Trendyol, HB...)</li>
              <li>SellerId, ApiKey, ApiSecret</li>
              <li>SyncIntervalMinutes (int)</li>
              <li>LastOrderSyncUtc, LastProductSyncUtc</li>
            </ul>
          </div>

          {/* Box 2: Products & Variants */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
            <div className="font-bold text-emerald-400 flex items-center justify-between">
              <span>Products & Variants</span>
              <span className="text-[10px] text-slate-500 font-mono">1:N & Concurrency</span>
            </div>
            <ul className="text-slate-400 space-y-1 font-mono text-[11px]">
              <li><span className="text-purple-400">PK</span> Id (Guid), ProductCode (Unique)</li>
              <li>BuyingPrice, VatRate, Currency</li>
              <li>ProductVariants: Barcode (Index)</li>
              <li>StockQuantity (Fiili Depo)</li>
              <li>ReservedQuantity (Rezerve)</li>
              <li><span className="text-amber-400">RowVersion</span> (Optimistic Lock)</li>
            </ul>
          </div>

          {/* Box 3: Orders & OrderItems */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
            <div className="font-bold text-purple-400 flex items-center justify-between">
              <span>Orders & OrderItems</span>
              <span className="text-[10px] text-slate-500 font-mono">1:N Sipariş Kalemleri</span>
            </div>
            <ul className="text-slate-400 space-y-1 font-mono text-[11px]">
              <li><span className="text-purple-400">PK</span> Id (Guid), StoreAccountId (FK)</li>
              <li>ChannelOrderNumber (Index)</li>
              <li>Status (Created, Picking, Shipped)</li>
              <li>GrossAmount, CargoAmount, Total</li>
              <li>CargoProvider, CargoTrackingNumber</li>
              <li>IsExportedToErp, ErpFicheNo</li>
            </ul>
          </div>

          {/* Box 4: ChannelProductListings */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
            <div className="font-bold text-amber-400 flex items-center justify-between">
              <span>ChannelProductListings</span>
              <span className="text-[10px] text-slate-500 font-mono">Pazar Yeri Fiyat Bağı</span>
            </div>
            <ul className="text-slate-400 space-y-1 font-mono text-[11px]">
              <li>StoreAccountId (FK), ProductVariantId (FK)</li>
              <li>SalePrice, SpecialPrice</li>
              <li>CommissionRate (decimal)</li>
              <li>SyncStatus, LastSyncUtc, LastError</li>
            </ul>
          </div>

          {/* Box 5: CustomerQuestions */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
            <div className="font-bold text-sky-400 flex items-center justify-between">
              <span>CustomerQuestions</span>
              <span className="text-[10px] text-slate-500 font-mono">SLA & Yanıt Havuzu</span>
            </div>
            <ul className="text-slate-400 space-y-1 font-mono text-[11px]">
              <li>ChannelQuestionId, ProductBarcode</li>
              <li>CustomerDisplayName, QuestionText</li>
              <li>QuestionDateUtc, SlaDeadlineUtc</li>
              <li>Status (WaitingAnswer, Answered)</li>
              <li>AnswerText, AnsweredAtUtc</li>
            </ul>
          </div>

          {/* Box 6: Settlements & SyncLogs */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
            <div className="font-bold text-teal-400 flex items-center justify-between">
              <span>Settlements & SyncLogs</span>
              <span className="text-[10px] text-slate-500 font-mono">Finans & Telemetri</span>
            </div>
            <ul className="text-slate-400 space-y-1 font-mono text-[11px]">
              <li>PeriodCode, PaymentDueDateUtc</li>
              <li>TotalSales, TotalCommission, TotalCargo</li>
              <li>NetPayoutAmount, DiscrepancyNote</li>
              <li>SyncLogs: Module, Fetched, Processed, Ms</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
