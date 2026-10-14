import React, { useState, useEffect } from 'react';
import { WPF_SCREENS, WPF_GLOBAL_THEME_XAML, WpfScreenDefinition } from '../data/wpfScreensData';
import { CSHARP_SYNTHETIC_ENGINE_FILES, SyntheticCodeFile } from '../data/csharpSyntheticEngineCode';
import { AI_CORE_INVARIANTS, AI_SYSTEM_PROMPT_BRIEF } from '../data/aiArchitectureGuide';
import { ErpExporter } from '../services/erpExporter';
import { 
  Monitor, 
  Code2, 
  Layers, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Sparkles, 
  Boxes, 
  ShoppingCart, 
  Truck, 
  HelpCircle, 
  Settings, 
  FileCode, 
  FolderDown, 
  Terminal, 
  CheckCircle2, 
  Send,
  LayoutDashboard,
  Bot,
  Play,
  Pause,
  Zap,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  Cpu,
  BookOpen,
  Activity,
  ArrowRight,
  TrendingUp,
  PackageCheck
} from 'lucide-react';

interface SimulatedEventItem {
  id: string;
  time: string;
  type: 'order' | 'stock' | 'cargo' | 'question';
  channel?: string;
  title: string;
  detail: string;
  delta?: string;
}

export const WpfStudioView: React.FC = () => {
  const [selectedScreenId, setSelectedScreenId] = useState<string>('dashboard');
  const [activeTab, setActiveTab] = useState<'xaml' | 'viewmodel' | 'preview' | 'simulation-engine' | 'ai-onboarding' | 'theme' | 'guide'>('xaml');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // C# Synthetic Engine Tabs
  const [selectedSyntheticFileId, setSelectedSyntheticFileId] = useState<string>('synthetic-engine-impl');

  // Live Simulation Sandbox State (Standalone in C# / UI)
  const [isAutoSimulating, setIsAutoSimulating] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<1 | 2 | 5>(1);
  const [simStats, setSimStats] = useState({
    ordersCount: 8,
    physicalStockDeducted: 14,
    totalRevenue: 2490.50,
    cargoDiscrepancyAmount: 77.00
  });

  const [simEvents, setSimEvents] = useState<SimulatedEventItem[]>([
    {
      id: 'ev-1',
      time: '12:05:14',
      type: 'order',
      channel: 'Trendyol',
      title: 'Yeni Sipariş: TY-261012-49102 (Zeynep K.)',
      detail: '2x Limon Kolonyası 1L | Tutar: 189.80 TL | Fiziki Stok: 450 -> 448',
      delta: '-2 Fiziki Stok'
    },
    {
      id: 'ev-2',
      time: '12:05:28',
      type: 'stock',
      channel: 'Depo',
      title: 'Depo Mal Kabulü: STK-MEN-100 (Islak Mendil)',
      detail: 'Fiziki sayım stoğu güncellendi | Stok: 600 -> 650 adet (+50 adet)',
      delta: '+50 Fiziki Stok'
    },
    {
      id: 'ev-3',
      time: '12:05:42',
      type: 'cargo',
      channel: 'Yurtiçi Kargo',
      title: 'Kargo Desi Uyuşmazlığı Tespit Edildi',
      detail: 'Koli Desisi: 1.20 Desi vs Taşıyıcı Faturası: 3.50 Desi (Fark: -38.50 TL kesinti)',
      delta: '-38.50 TL Hakediş'
    },
    {
      id: 'ev-4',
      time: '12:05:55',
      type: 'question',
      channel: 'Hepsiburada',
      title: 'Müşteri Sorusu Geldi (Mehmet D.)',
      detail: '"Hijyen setindeki kolonyanın son kullanma tarihi nedir?"',
      delta: 'Cevap Bekliyor'
    }
  ]);

  const selectedScreen = WPF_SCREENS.find(s => s.id === selectedScreenId) || WPF_SCREENS[0];
  const selectedSyntheticFile = CSHARP_SYNTHETIC_ENGINE_FILES.find(f => f.id === selectedSyntheticFileId) || CSHARP_SYNTHETIC_ENGINE_FILES[1];

  const handleCopy = (content: string, key: string) => {
    navigator.clipboard.writeText(content);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDownloadSingleFile = (fileName: string, content: string) => {
    ErpExporter.downloadFile(content, fileName, 'text/plain;charset=utf-8');
  };

  const handleDownloadAllWpfProject = () => {
    let bundle = `<!-- ==========================================================================\n`;
    bundle += `     OMNICHANNEL PAZARYERİ & ERP - C# .NET 8.0 WPF EKRAN VE XAML ÇÖZÜMÜ\n`;
    bundle += `     CommunityToolkit.Mvvm + Fluent Dark / Mica Windows 11 Tasarım Paketi\n`;
    bundle += `     Tam Bağımsız (Standalone) C# Sentetik Veri Motoru Dahildir\n`;
    bundle += `     ========================================================================== -->\n\n`;

    // Global Theme
    bundle += `<!-- ==========================================================================\n`;
    bundle += `     DOSYA: Themes/ModernDarkTheme.xaml\n`;
    bundle += `     ========================================================================== -->\n`;
    bundle += WPF_GLOBAL_THEME_XAML;
    bundle += `\n\n`;

    // Each screen
    WPF_SCREENS.forEach(screen => {
      bundle += `<!-- ==========================================================================\n`;
      bundle += `     DOSYA: ${screen.xamlFileName}\n`;
      bundle += `     AÇIKLAMA: ${screen.title} - ${screen.description}\n`;
      bundle += `     ========================================================================== -->\n`;
      bundle += screen.xamlCode;
      bundle += `\n\n`;

      bundle += `/* ==========================================================================\n`;
      bundle += `   DOSYA: ${screen.viewModelFileName}\n`;
      bundle += `   ========================================================================== */\n`;
      bundle += screen.viewModelCode;
      bundle += `\n\n`;
    });

    // Standalone C# Synthetic Engine Files
    bundle += `/* ==========================================================================\n`;
    bundle += `   SAF C# .NET 8 SENTETİK VERİ VE SİMÜLASYON MOTORU (ZERO EXTERNAL ENGINE)\n`;
    bundle += `   ========================================================================== */\n\n`;

    CSHARP_SYNTHETIC_ENGINE_FILES.forEach(sf => {
      bundle += `/* ==========================================================================\n`;
      bundle += `   PROJE: [${sf.project}] / DOSYA: ${sf.fileName}\n`;
      bundle += `   AÇIKLAMA: ${sf.title} - ${sf.description}\n`;
      bundle += `   ========================================================================== */\n`;
      bundle += sf.content;
      bundle += `\n\n`;
    });

    // AI Context Brief
    bundle += `/* ==========================================================================\n`;
    bundle += `   YAPAY ZEKA (AI) GELİŞTİRİCİ BRİFİNGİ VE SİSTEM MİMARİSİ\n`;
    bundle += `   ========================================================================== */\n\n`;
    bundle += AI_SYSTEM_PROMPT_BRIEF;

    ErpExporter.downloadFile(bundle, 'OmniChannel_Wpf_Complete_Solution_With_Simulation_Engine.txt', 'text/plain;charset=utf-8');
  };

  const handleDownloadAllSyntheticEngine = () => {
    let bundle = `/* ==========================================================================\n`;
    bundle += `   OMNICHANNEL PAZARYERİ & ERP - SAF C# SENTETİK VERİ & SİMÜLASYON MOTORU\n`;
    bundle += `   Harici hiçbir mock servisi veya motora ihtiyaç duymaz (%100 Pure BCL)\n`;
    bundle += `   ========================================================================== */\n\n`;

    CSHARP_SYNTHETIC_ENGINE_FILES.forEach(sf => {
      bundle += `// ==========================================================================\n`;
      bundle += `// PROJE: [${sf.project}] / DOSYA: ${sf.fileName}\n`;
      bundle += `// BAŞLIK: ${sf.title}\n`;
      bundle += `// ==========================================================================\n\n`;
      bundle += sf.content;
      bundle += `\n\n`;
    });

    ErpExporter.downloadFile(bundle, 'OmniChannel_CSharp_Synthetic_Data_Engine.cs', 'text/plain;charset=utf-8');
  };

  const handleDownloadAiDoc = () => {
    const content = `# OMNICHANNEL PAZARYERİ & MİNİ ERP - SİSTEM MİMARİSİ VE YAPAY ZEKA (AI) BRİFİNGİ\n\n${AI_SYSTEM_PROMPT_BRIEF}\n\n## TEMEL SİSTEM KANUNLARI (INVARIANTS)\n` +
      AI_CORE_INVARIANTS.map(i => `### ${i.title} [${i.badge}]\n${i.summary}\n${i.details}\n\n\`\`\`csharp\n${i.codeSnippet}\n\`\`\`\n`).join('\n');
    ErpExporter.downloadFile(content, 'AI_SYSTEM_ARCHITECTURE.md', 'text/markdown;charset=utf-8');
  };

  // --- Real-time Simulation Engine Handlers ---
  const triggerOrderSimulation = () => {
    const channels = ['Trendyol', 'Hepsiburada', 'Amazon TR', 'N11'];
    const buyers = ['Ahmet Yılmaz', 'Zeynep Kaya', 'Mehmet Demir', 'Elif Çelik', 'Canan Özkan', 'Burak Şahin'];
    const channel = channels[Math.floor(Math.random() * channels.length || 0)];
    const buyer = buyers[Math.floor(Math.random() * buyers.length)];
    const orderNo = `${channel.substring(0, 2).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const price = (79.90 + Math.random() * 220).toFixed(2);

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newEv: SimulatedEventItem = {
      id: `ev-${Date.now()}`,
      time: timeStr,
      type: 'order',
      channel,
      title: `Yeni Sipariş: ${orderNo} (${buyer})`,
      detail: `Reçetedeki fiziki stoklar düşüldü | Tutar: ${price} TL | BOM Snapshot donduruldu`,
      delta: '-2 Fiziki Stok'
    };

    setSimEvents(prev => [newEv, ...prev.slice(0, 19)]);
    setSimStats(prev => ({
      ordersCount: prev.ordersCount + 1,
      physicalStockDeducted: prev.physicalStockDeducted + 2,
      totalRevenue: +(prev.totalRevenue + parseFloat(price)).toFixed(2),
      cargoDiscrepancyAmount: prev.cargoDiscrepancyAmount
    }));
  };

  const triggerStockReplenishment = () => {
    const items = [
      { code: 'STK-KOL-80', title: '80° Limon Kolonyası 1L' },
      { code: 'STK-MEN-100', title: 'Islak Mendil 100lü' },
      { code: 'STK-DEZ-500', title: 'El Dezenfektanı 500ml' }
    ];
    const picked = items[Math.floor(Math.random() * items.length)];
    const qty = Math.floor(25 + Math.random() * 50);

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newEv: SimulatedEventItem = {
      id: `ev-${Date.now()}`,
      time: timeStr,
      type: 'stock',
      channel: 'Depo',
      title: `Depo Mal Kabulü: ${picked.code}`,
      detail: `${picked.title} fiziki stoğuna +${qty} adet eklendi. Bağlı paketlerin sanal stokları yeniden hesaplandı.`,
      delta: `+${qty} Fiziki Stok`
    };

    setSimEvents(prev => [newEv, ...prev.slice(0, 19)]);
  };

  const triggerCargoDiscrepancy = () => {
    const couriers = ['Yurtiçi Kargo', 'Trendyol Express', 'HepsiJet', 'Aras Kargo'];
    const courier = couriers[Math.floor(Math.random() * couriers.length)];
    const loss = +(25 + Math.random() * 35).toFixed(2);

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newEv: SimulatedEventItem = {
      id: `ev-${Date.now()}`,
      time: timeStr,
      type: 'cargo',
      channel: courier,
      title: `Kargo Desi Uyuşmazlığı: ${courier}`,
      detail: `Taşıyıcı koli desisini yüksek tarttı. Fatura kesintisi: -${loss} TL. İtiraz kaydı oluşturuldu.`,
      delta: `-${loss} TL`
    };

    setSimEvents(prev => [newEv, ...prev.slice(0, 19)]);
    setSimStats(prev => ({
      ...prev,
      cargoDiscrepancyAmount: +(prev.cargoDiscrepancyAmount + loss).toFixed(2)
    }));
  };

  const triggerCustomerQuestion = () => {
    const questions = [
      'Merhaba, ürünün son kullanma tarihi nedir?',
      'Hangi kargo şirketi ile gönderim yapıyorsunuz?',
      'Bugün kargoya verilir mi? Aciliyeti var.',
      'Set içindeki mendiller parfümlü mü?',
      'Toplu alımda kurumsal fatura kesiyor musunuz?'
    ];
    const q = questions[Math.floor(Math.random() * questions.length)];
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newEv: SimulatedEventItem = {
      id: `ev-${Date.now()}`,
      time: timeStr,
      type: 'question',
      channel: Math.random() > 0.5 ? 'Trendyol' : 'Hepsiburada',
      title: 'Müşteri Sorusu Geldi',
      detail: `"${q}"`,
      delta: 'Cevap Bekliyor'
    };

    setSimEvents(prev => [newEv, ...prev.slice(0, 19)]);
  };

  // Continuous auto simulation timer
  useEffect(() => {
    if (!isAutoSimulating) return;

    const intervalMs = Math.max(1000, 4000 / simSpeed);
    const timer = setInterval(() => {
      const roll = Math.random();
      if (roll < 0.6) {
        triggerOrderSimulation();
      } else if (roll < 0.75) {
        triggerStockReplenishment();
      } else if (roll < 0.9) {
        triggerCargoDiscrepancy();
      } else {
        triggerCustomerQuestion();
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isAutoSimulating, simSpeed]);

  const getScreenIcon = (id: string) => {
    switch (id) {
      case 'dashboard': return LayoutDashboard;
      case 'catalog': return Boxes;
      case 'dispatch': return Send;
      case 'orders': return ShoppingCart;
      case 'cargo': return Truck;
      case 'questions': return HelpCircle;
      case 'stores': return Settings;
      default: return Monitor;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Windows 11 Fluent Desktop Studio & C# Standalone Engine</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
              <span>WPF Ekran Stüdyosu & Saf C# Simülasyon Motoru</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-3xl">
              Mevcut sistemin tüm ekranları <strong>Windows 11 Fluent Dark (Mica)</strong> standartlarında XAML ve C# MVVM olarak üretildi. 
              Ayrıca <strong>harici hiçbir motora ihtiyaç duymadan</strong> çalışan saf C# yapay veri motoru ve yapay zeka görev devir mimarisi gömüldü.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => setActiveTab('simulation-engine')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Cpu className="w-4 h-4" />
              <span>⚡ C# Simülasyon Sandbox</span>
            </button>
            <button
              onClick={() => setActiveTab('ai-onboarding')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>🧠 AI Brifingi</span>
            </button>
            <button
              onClick={handleDownloadAllWpfProject}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-105 cursor-pointer"
            >
              <FolderDown className="w-4 h-4" />
              <span>Tüm Çözümü İndir (.xaml & .cs)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar: Screen Selector */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>WPF Ekranları ({WPF_SCREENS.length})</span>
              <span className="text-blue-400 font-mono text-[11px] bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                .NET 8 WPF
              </span>
            </h3>

            <div className="space-y-1.5">
              {WPF_SCREENS.map(screen => {
                const IconComponent = getScreenIcon(screen.id);
                const isSelected = selectedScreenId === screen.id;

                return (
                  <div
                    key={screen.id}
                    className={`p-2.5 rounded-xl transition-all border ${
                      isSelected
                        ? 'bg-slate-800/90 border-blue-500/60 shadow-md'
                        : 'bg-slate-950/60 hover:bg-slate-900/80 border-slate-800/80'
                    }`}
                  >
                    <div 
                      onClick={() => {
                        setSelectedScreenId(screen.id);
                        if (activeTab === 'simulation-engine' || activeTab === 'ai-onboarding') {
                          setActiveTab('xaml');
                        }
                      }}
                      className="flex items-start gap-2.5 cursor-pointer"
                    >
                      <IconComponent className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-blue-400 font-bold' : 'text-slate-400'}`} />
                      <div className="min-w-0 flex-1">
                        <div className={`text-xs font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                          {screen.title}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate font-mono mt-0.5">
                          {screen.xamlFileName}
                        </div>
                      </div>
                    </div>

                    {/* Quick Direct Code Buttons */}
                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-800/60">
                      <button
                        onClick={() => {
                          setSelectedScreenId(screen.id);
                          setActiveTab('xaml');
                        }}
                        className={`flex-1 py-1 px-1.5 rounded text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                          isSelected && activeTab === 'xaml'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-900 hover:bg-slate-800 text-blue-300 border border-blue-500/30'
                        }`}
                        title={`${screen.xamlFileName} kodunu aç`}
                      >
                        <FileCode className="w-3 h-3" />
                        <span>XAML</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedScreenId(screen.id);
                          setActiveTab('viewmodel');
                        }}
                        className={`flex-1 py-1 px-1.5 rounded text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                          isSelected && activeTab === 'viewmodel'
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/30'
                        }`}
                        title={`${screen.viewModelFileName} kodunu aç`}
                      >
                        <Code2 className="w-3 h-3" />
                        <span>C# VM</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedScreenId(screen.id);
                          setActiveTab('preview');
                        }}
                        className={`py-1 px-1.5 rounded text-[10px] font-mono flex items-center justify-center transition-colors cursor-pointer ${
                          isSelected && activeTab === 'preview'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-400'
                        }`}
                        title="Masaüstü görünümünü incele"
                      >
                        <Monitor className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Engine Status Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 rounded-xl p-4 text-xs space-y-2.5 text-slate-300">
            <div className="font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>Saf C# Sanal Motor</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                %100 Standalone
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Dış veritabanı veya mock sunucu yok. Windows masaüstünde <code>SyntheticDataEngine.cs</code> tüm sipariş, stok ve kargo döngüsünü canlı simüle eder.
            </p>
            <button
              onClick={() => setActiveTab('simulation-engine')}
              className="w-full py-1.5 px-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-lg text-emerald-300 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Simülatörü Aç & Çalıştır</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* AI Knowledge Base Quick Box */}
          <div className="bg-slate-900/60 border border-purple-500/30 rounded-xl p-4 text-xs space-y-2 text-slate-300">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-purple-400" />
              <span>AI Model Devir Kılavuzu</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Görevi devralacak yapay zeka modelleri için 3 kademeli ürün mimarisi ve altın kurallar hazırlandı.
            </p>
            <button
              onClick={() => setActiveTab('ai-onboarding')}
              className="w-full py-1.5 px-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-purple-300 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>AI Brifingini Görüntüle</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Area: Screen Viewer, Simulation Sandbox & AI Onboarding */}
        <div className="lg:col-span-3 space-y-4">
          {/* Main Top Navigation Tabs */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 flex flex-wrap items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setActiveTab('xaml')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'xaml'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-blue-300 bg-blue-950/40 hover:bg-slate-800 border border-blue-500/30'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-blue-400" />
                <span>📄 1. XAML Ekran Kodu</span>
              </button>

              <button
                onClick={() => setActiveTab('viewmodel')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'viewmodel'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                    : 'text-purple-300 bg-purple-950/40 hover:bg-slate-800 border border-purple-500/30'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-purple-400" />
                <span>⚙️ 2. C# ViewModel</span>
              </button>

              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>🖥️ 3. Win 11 Canlı Görsel Simülatör</span>
              </button>

              <button
                onClick={() => setActiveTab('simulation-engine')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'simulation-engine'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                <span>⚡ C# Simülasyon Motoru</span>
              </button>

              <button
                onClick={() => setActiveTab('ai-onboarding')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'ai-onboarding'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-purple-400" />
                <span>🧠 AI Brifingi</span>
              </button>

              <button
                onClick={() => setActiveTab('theme')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'theme'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>🎨 Tema XAML</span>
              </button>

              <button
                onClick={() => setActiveTab('guide')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'guide'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>🚀 Kurulum</span>
              </button>
            </div>

            {/* Action buttons based on active tab */}
            <div className="flex items-center gap-2">
              {activeTab === 'xaml' && (
                <>
                  <button
                    onClick={() => handleCopy(selectedScreen.xamlCode, 'xaml')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedCode === 'xaml' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'xaml' ? 'Kopyalandı' : 'XAML Kopyala'}</span>
                  </button>
                  <button
                    onClick={() => handleDownloadSingleFile(selectedScreen.xamlFileName.split('/').pop() || 'View.xaml', selectedScreen.xamlCode)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors cursor-pointer"
                    title="Bu XAML Dosyasını İndir"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </>
              )}

              {activeTab === 'viewmodel' && (
                <>
                  <button
                    onClick={() => handleCopy(selectedScreen.viewModelCode, 'vm')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedCode === 'vm' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'vm' ? 'Kopyalandı' : 'ViewModel Kopyala'}</span>
                  </button>
                  <button
                    onClick={() => handleDownloadSingleFile(selectedScreen.viewModelFileName.split('/').pop() || 'ViewModel.cs', selectedScreen.viewModelCode)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors cursor-pointer"
                    title="Bu C# ViewModel Dosyasını İndir"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </>
              )}

              {activeTab === 'simulation-engine' && (
                <button
                  onClick={handleDownloadAllSyntheticEngine}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tüm C# Simülasyon Kodunu İndir (.cs)</span>
                </button>
              )}

              {activeTab === 'ai-onboarding' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(AI_SYSTEM_PROMPT_BRIEF, 'aiprompt')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedCode === 'aiprompt' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'aiprompt' ? 'Prompt Kopyalandı' : 'AI Promptunu Kopyala'}</span>
                  </button>
                  <button
                    onClick={handleDownloadAiDoc}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors cursor-pointer"
                    title="AI_SYSTEM_ARCHITECTURE.md İndir"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* TAB 1: WINDOWS 11 DESKTOP SIMULATOR */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{selectedScreen.title}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">
                      {selectedScreen.xamlFileName}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{selectedScreen.description}</p>
                </div>
              </div>

              {/* Photorealistic Windows 11 Desktop Window Simulator Frame */}
              <div className="rounded-2xl border border-slate-700/80 bg-slate-950 overflow-hidden shadow-2xl">
                {/* Windows 11 Modern Mica Title Bar */}
                <div className="h-9 bg-slate-900/90 border-b border-slate-800 px-3 flex items-center justify-between select-none">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500/80 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                    <span className="text-xs font-semibold text-slate-200">
                      OmniChannel ERP Windows Suite - [{selectedScreen.title}]
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 font-mono">.NET 8.0 WPF | x64</span>
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="w-3 h-0.5 bg-slate-400 inline-block cursor-default" />
                      <span className="w-2.5 h-2.5 border border-slate-400 inline-block cursor-default" />
                      <span className="text-sm font-bold leading-none cursor-default hover:text-red-400">×</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Desktop Client Content */}
                <div className="p-6 bg-[#0B1120] min-h-[460px] text-slate-100 space-y-4">
                  {/* Top Header of Simulated Client */}
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>{selectedScreen.title}</span>
                      </h2>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Aktif Profil: <span className="text-blue-400 font-medium">Merkez Depo & Çoklu Mağaza Yöneticisi</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-xs font-mono flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>C# Sanal Motor Bağlı</span>
                      </span>
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedScreen.highlightFeatures.map((feat, idx) => (
                      <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 text-xs space-y-1">
                        <div className="font-semibold text-blue-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                          <span>WPF Standart Özelliği #{idx + 1}</span>
                        </div>
                        <div className="text-slate-300 text-[11px]">{feat}</div>
                      </div>
                    ))}
                  </div>

                  {/* Code snippet peek banner */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
                    <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-purple-400" />
                        <span>XAML Bağlama Modeli (CommunityToolkit.Mvvm)</span>
                      </span>
                      <button 
                        onClick={() => setActiveTab('xaml')}
                        className="text-blue-400 hover:text-blue-300 text-xs font-medium cursor-pointer"
                      >
                        Tam XAML Kodunu Aç →
                      </button>
                    </div>
                    <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto p-2 bg-slate-900 rounded border border-slate-800">
                      {selectedScreen.xamlCode.split('\n').slice(0, 10).join('\n')}
                      {'\n... [Tam kodu XAML sekmesinden inceleyin ve indirin]'}
                    </pre>
                  </div>
                </div>

                {/* Windows 11 Bottom Status Bar */}
                <div className="h-6 bg-slate-900 border-t border-slate-800 px-3 flex items-center justify-between text-[11px] text-slate-400 select-none">
                  <div className="flex items-center gap-3">
                    <span>Durum: Hazır</span>
                    <span>•</span>
                    <span>XAML Modeli: MVVM Reaktif</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[10px]">
                    <span>UTF-8</span>
                    <span>WPF / CommunityToolkit</span>
                  </div>
                </div>
              </div>

              {/* Ekranın Canlı XAML & C# Kodları Bölümü (Önizlemenin Hemen Altında) */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {selectedScreen.title} — Canlı WPF XAML ve C# Kodları
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('xaml')}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      XAML Kodunu İncele →
                    </button>
                    <button
                      onClick={() => setActiveTab('viewmodel')}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      C# ViewModel'i İncele →
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 max-h-72 overflow-y-auto select-all">
                  <pre>{selectedScreen.xamlCode}</pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: XAML CODE INSPECTOR */}
          {activeTab === 'xaml' && (
            <div className="space-y-3">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      WPF XAML
                    </span>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-blue-400" />
                      <span>{selectedScreen.xamlFileName}</span>
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {selectedScreen.title} — Windows 11 Fluent Dark / Mica XAML arayüz şablonu (High-DPI sanallaştırılmış DataGrid).
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveTab('viewmodel')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-semibold rounded-lg border border-purple-500/30 transition-colors cursor-pointer"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>C# ViewModel'e Geç →</span>
                  </button>
                  <button
                    onClick={() => handleCopy(selectedScreen.xamlCode, 'xaml')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    {copiedCode === 'xaml' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'xaml' ? 'Kopyalandı!' : 'XAML Kopyala'}</span>
                  </button>
                  <button
                    onClick={() => handleDownloadSingleFile(selectedScreen.xamlFileName.split('/').pop() || 'View.xaml', selectedScreen.xamlCode)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors cursor-pointer"
                    title="Bu XAML Dosyasını İndir"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Code stats strip */}
              <div className="px-4 py-2 bg-slate-950/80 rounded-t-xl border-t border-x border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <div className="flex items-center gap-3">
                  <span>📄 Dosya: <strong className="text-slate-200">Views/{selectedScreen.xamlFileName}</strong></span>
                  <span>•</span>
                  <span>Satır: <strong className="text-blue-400">{selectedScreen.xamlCode.split('\n').length}</strong></span>
                  <span>•</span>
                  <span>Boyut: <strong className="text-slate-200">{(selectedScreen.xamlCode.length / 1024).toFixed(1)} KB</strong></span>
                </div>
                <div className="text-slate-500">XML / XAML (.NET 8.0 WPF)</div>
              </div>

              <div className="p-4 bg-slate-950 rounded-b-xl border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto max-h-[650px] leading-relaxed select-all">
                <pre>{selectedScreen.xamlCode}</pre>
              </div>
            </div>
          )}

          {/* TAB 2: C# VIEWMODEL INSPECTOR */}
          {activeTab === 'viewmodel' && (
            <div className="space-y-3">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      C# MVVM
                    </span>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-purple-400" />
                      <span>{selectedScreen.viewModelFileName}</span>
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    .NET 8.0 <code>CommunityToolkit.Mvvm</code> tabanlı ObservableObject & RelayCommand mimarisi.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveTab('xaml')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 text-xs font-semibold rounded-lg border border-blue-500/30 transition-colors cursor-pointer"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>XAML Koduna Geç →</span>
                  </button>
                  <button
                    onClick={() => handleCopy(selectedScreen.viewModelCode, 'vm')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    {copiedCode === 'vm' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'vm' ? 'Kopyalandı!' : 'ViewModel Kopyala'}</span>
                  </button>
                  <button
                    onClick={() => handleDownloadSingleFile(selectedScreen.viewModelFileName.split('/').pop() || 'ViewModel.cs', selectedScreen.viewModelCode)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors cursor-pointer"
                    title="Bu C# ViewModel Dosyasını İndir"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Code stats strip */}
              <div className="px-4 py-2 bg-slate-950/80 rounded-t-xl border-t border-x border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <div className="flex items-center gap-3">
                  <span>📄 Dosya: <strong className="text-slate-200">ViewModels/{selectedScreen.viewModelFileName}</strong></span>
                  <span>•</span>
                  <span>Satır: <strong className="text-purple-400">{selectedScreen.viewModelCode.split('\n').length}</strong></span>
                  <span>•</span>
                  <span>Boyut: <strong className="text-slate-200">{(selectedScreen.viewModelCode.length / 1024).toFixed(1)} KB</strong></span>
                </div>
                <div className="text-slate-500">C# (.NET 8.0 MVVM)</div>
              </div>

              <div className="p-4 bg-slate-950 rounded-b-xl border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto max-h-[650px] leading-relaxed select-all">
                <pre>{selectedScreen.viewModelCode}</pre>
              </div>
            </div>
          )}

          {/* TAB 4: C# STANDALONE SYNTHETIC ENGINE & SANDBOX (CORE USER REQUIREMENT) */}
          {activeTab === 'simulation-engine' && (
            <div className="space-y-5">
              {/* Simulation Sandbox Control Station */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 border border-emerald-500/40 rounded-xl p-5 shadow-lg space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>C# Standalone Sentetik Simülasyon İstasyonu</span>
                    </div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Dış Motora Bağlı Kalmadan Çalışan Saf C# Simülatörü</span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Windows masaüstü WPF çalıştırıldığında, bu motor harici mock sunucuya veya veri tabanına ihtiyaç duymadan
                      Türk pazaryeri siparişlerini, stok düşüşlerini ve kargo fatura uyuşmazlıklarını canlı olarak sisteme pompalar.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setIsAutoSimulating(!isAutoSimulating)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                        isAutoSimulating
                          ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                      }`}
                    >
                      {isAutoSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      <span>{isAutoSimulating ? 'Otomatik Döngüyü Durdur' : 'Otomatik Döngüyü Başlat'}</span>
                    </button>
                  </div>
                </div>

                {/* Instant Simulation Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-800">
                  <span className="text-xs text-slate-400 font-semibold mr-1">Manuel Tetikleyiciler:</span>

                  <button
                    onClick={triggerOrderSimulation}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-blue-400" />
                    <span>⚡ Yeni Sipariş Üret</span>
                  </button>

                  <button
                    onClick={triggerStockReplenishment}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Boxes className="w-3.5 h-3.5 text-emerald-400" />
                    <span>📦 Depo Mal Kabulü Yap</span>
                  </button>

                  <button
                    onClick={triggerCargoDiscrepancy}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5 text-amber-400" />
                    <span>🚚 Kargo Desi Uyuşmazlığı Simüle Et</span>
                  </button>

                  <button
                    onClick={triggerCustomerQuestion}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                    <span>❓ Müşteri Sorusu Simüle Et</span>
                  </button>

                  <div className="ml-auto flex items-center gap-1 text-xs text-slate-400">
                    <span>Hız:</span>
                    {([1, 2, 5] as const).map(speed => (
                      <button
                        key={speed}
                        onClick={() => setSimSpeed(speed)}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer ${
                          simSpeed === speed ? 'bg-blue-600 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Simulation Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                  <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <ShoppingCart className="w-3.5 h-3.5 text-blue-400" />
                      <span>Simüle Sipariş</span>
                    </div>
                    <div className="text-lg font-bold text-white mt-0.5">{simStats.ordersCount} adet</div>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Boxes className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Düşülen Fiziki Stok</span>
                    </div>
                    <div className="text-lg font-bold text-emerald-400 mt-0.5">-{simStats.physicalStockDeducted} adet</div>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Simüle Ciro</span>
                    </div>
                    <div className="text-lg font-bold text-white mt-0.5">{simStats.totalRevenue.toLocaleString('tr-TR')} TL</div>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Kargo Desi Zararı</span>
                    </div>
                    <div className="text-lg font-bold text-amber-400 mt-0.5">-{simStats.cargoDiscrepancyAmount.toLocaleString('tr-TR')} TL</div>
                  </div>
                </div>
              </div>

              {/* Real-time Simulated Events Stream */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span>Canlı Simülasyon Olay Akışı (C# Event Stream)</span>
                  </h4>
                  <span className="text-[11px] font-mono text-slate-500">
                    Son {simEvents.length} Olay Kaydedildi
                  </span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {simEvents.map(ev => {
                    const badgeColor = 
                      ev.type === 'order' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                      ev.type === 'stock' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                      ev.type === 'cargo' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                      'bg-purple-500/20 text-purple-300 border-purple-500/30';

                    return (
                      <div
                        key={ev.id}
                        className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2.5 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-slate-500">{ev.time}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${badgeColor}`}>
                              {ev.channel || ev.type}
                            </span>
                            <span className="font-semibold text-slate-200 truncate">{ev.title}</span>
                          </div>
                          <p className="text-[11px] text-slate-400">{ev.detail}</p>
                        </div>

                        {ev.delta && (
                          <span className="shrink-0 text-xs font-mono font-bold text-slate-300 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                            {ev.delta}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Standalone C# Source Code Files Inspector */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm space-y-0">
                <div className="bg-slate-950 p-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {CSHARP_SYNTHETIC_ENGINE_FILES.map(file => (
                      <button
                        key={file.id}
                        onClick={() => setSelectedSyntheticFileId(file.id)}
                        className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                          selectedSyntheticFileId === file.id
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                        }`}
                      >
                        {file.fileName}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(selectedSyntheticFile.content, selectedSyntheticFile.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      {copiedCode === selectedSyntheticFile.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode === selectedSyntheticFile.id ? 'Kopyalandı' : 'Kopyala'}</span>
                    </button>
                    <button
                      onClick={() => handleDownloadSingleFile(selectedSyntheticFile.fileName, selectedSyntheticFile.content)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors cursor-pointer"
                      title="Bu C# Dosyasını İndir"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="px-5 py-3 bg-slate-900/80 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-bold text-emerald-400">{selectedSyntheticFile.title}</span>
                    <span className="text-slate-400 ml-2">({selectedSyntheticFile.description})</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-400">
                    Proje: <span className="text-slate-200">{selectedSyntheticFile.project}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 font-mono text-xs text-slate-200 overflow-x-auto max-h-[550px] leading-relaxed select-all">
                  <pre>{selectedSyntheticFile.content}</pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AI ONBOARDING & ARCHITECTURE (BUILT-IN FOR FUTURE LLMs) */}
          {activeTab === 'ai-onboarding' && (
            <div className="space-y-5">
              {/* AI Onboarding Header */}
              <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/40 rounded-xl p-5 shadow-lg space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">
                      <Bot className="w-4 h-4 text-purple-400" />
                      <span>Görevi Devralan Yapay Zeka (AI) Modelleri İçin Brifing</span>
                    </div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Proje İçi Gömülü Bilgilendirme ve Sistem Kuralları</span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Gelecekte görev alacak yapay zeka modellerinin neyin ne olduğunu anında kavraması, mimari drift yapmaması ve
                      mevcut 3 kademeli yapıyı koruması için sistem kuralları kod tabanına gömülmüştür.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopy(AI_SYSTEM_PROMPT_BRIEF, 'brief_copy')}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/30 transition-all cursor-pointer"
                    >
                      {copiedCode === 'brief_copy' ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedCode === 'brief_copy' ? 'Prompt Kopyalandı' : 'AI Devir Promptunu Kopyala'}</span>
                    </button>
                    <button
                      onClick={handleDownloadAiDoc}
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>AI_SYSTEM_ARCHITECTURE.md</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Core System Invariants Cards */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>Yapay Zekanın Asla Çiğnememesi Gereken 5 Temel Kanun (Invariants)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {AI_CORE_INVARIANTS.map(inv => (
                    <div
                      key={inv.id}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5 flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{inv.title}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                            {inv.badge}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-300">{inv.summary}</p>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{inv.details}</p>
                      </div>

                      {inv.codeSnippet && (
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 mt-2">
                          <pre className="overflow-x-auto">{inv.codeSnippet}</pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* AI System Prompt Box */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-purple-400" />
                    <span>LLM Geliştirici Sistem İstemi (System Prompt / Context)</span>
                  </h4>
                  <button
                    onClick={() => handleCopy(AI_SYSTEM_PROMPT_BRIEF, 'box_prompt')}
                    className="text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer flex items-center gap-1"
                  >
                    {copiedCode === 'box_prompt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'box_prompt' ? 'Kopyalandı' : 'Kopyala'}</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap select-all">
                  {AI_SYSTEM_PROMPT_BRIEF}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: GLOBAL THEME XAML */}
          {activeTab === 'theme' && (
            <div className="space-y-3">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>Themes/ModernDarkTheme.xaml</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Windows 11 Fluent Dark ve Mica tasarım standartları için tüm WPF fırça ve kontrol şablonları.
                  </p>
                </div>

                <button
                  onClick={() => handleCopy(WPF_GLOBAL_THEME_XAML, 'theme')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors cursor-pointer"
                >
                  {copiedCode === 'theme' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'theme' ? 'Kopyalandı' : 'Temayı Kopyala'}</span>
                </button>
              </div>

              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto max-h-[500px] leading-relaxed select-all">
                <pre>{WPF_GLOBAL_THEME_XAML}</pre>
              </div>
            </div>
          )}

          {/* TAB 7: NET 8 INSTALLATION GUIDE */}
          {activeTab === 'guide' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-xs text-slate-300 space-y-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-blue-400" />
                <span>Visual Studio 2022 / JetBrains Rider ile .NET 8 WPF Projesi Başlatma</span>
              </h3>

              <div className="space-y-3">
                <div className="font-bold text-blue-400 text-sm">1. Adım: Yeni WPF Projesi Oluşturma</div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-slate-200">
                  dotnet new wpf -n OmniChannel.Wpf -f net8.0-windows
                </div>
              </div>

              <div className="space-y-3">
                <div className="font-bold text-blue-400 text-sm">2. Adım: Gerekli Modern NuGet Paketlerini Yükleme</div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-slate-200 space-y-1">
                  <div>dotnet add package CommunityToolkit.Mvvm --version 8.2.2</div>
                  <div>dotnet add package Microsoft.Extensions.DependencyInjection --version 8.0.0</div>
                  <div>dotnet add package Microsoft.EntityFrameworkCore.SqlServer --version 8.0.2</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="font-bold text-blue-400 text-sm">3. Adım: App.xaml İçine Tema Kaynağını Bağlama</div>
                <p className="text-slate-400">
                  <code>App.xaml</code> dosyasındaki <code>Application.Resources</code> altına <code>Themes/ModernDarkTheme.xaml</code> dosyasını ekleyin:
                </p>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-slate-200">
                  {`<ResourceDictionary.MergedDictionaries>
    <ResourceDictionary Source="Themes/ModernDarkTheme.xaml" />
</ResourceDictionary.MergedDictionaries>`}
                </div>
              </div>

              <div className="space-y-3">
                <div className="font-bold text-emerald-400 text-sm">4. Adım: C# Standalone Simülasyon Motorunu Başlatma</div>
                <p className="text-slate-400">
                  <code>App.xaml.cs</code> veya Dependency Injection konfigürasyonunda arka plan servisini bağlayın:
                </p>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-slate-200">
                  {`services.AddSingleton<InMemoryOmniChannelDataStore>();
services.AddSingleton<ISyntheticDataEngine, SyntheticDataEngine>();
services.AddHostedService<SimulationBackgroundService>();`}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
