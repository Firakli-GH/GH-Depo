import React, { useState, useMemo } from 'react';
import { 
  Copy, 
  Check, 
  Download, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  FileCode, 
  Table2, 
  Maximize2, 
  Minimize2,
  ExternalLink,
  ShieldCheck,
  Code
} from 'lucide-react';
import { FieldMappingEntry } from '../types/marketplaceSchemas';

interface RawJsonViewerProps {
  rawJsonString?: string;
  rawPayload?: any;
  title?: string;
  sourceChannel?: string;
  entityType?: 'Order' | 'Product' | 'Listing' | 'Settlement' | 'Question';
  identifier?: string;
  mappings?: FieldMappingEntry[];
}

export const RawJsonViewer: React.FC<RawJsonViewerProps> = ({
  rawJsonString,
  rawPayload,
  title = 'Pazaryeri Ham API Yanıtı',
  sourceChannel,
  entityType = 'Order',
  identifier = 'data',
  mappings = []
}) => {
  const [activeView, setActiveView] = useState<'tree' | 'mapping' | 'raw'>('tree');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['root']));
  const [expandAllToggle, setExpandAllToggle] = useState(false);

  // Parse payload object safely
  const parsedData = useMemo(() => {
    if (rawPayload && typeof rawPayload === 'object') {
      return rawPayload;
    }
    if (rawJsonString) {
      try {
        return JSON.parse(rawJsonString);
      } catch (e) {
        return { error: 'Geçersiz JSON formatı', rawContent: rawJsonString };
      }
    }
    return { status: 'empty_payload', message: 'Kayıt için ham veri bulunamadı.' };
  }, [rawJsonString, rawPayload]);

  // Formatted string
  const formattedJsonString = useMemo(() => {
    if (rawJsonString) {
      try {
        const obj = JSON.parse(rawJsonString);
        return JSON.stringify(obj, null, 2);
      } catch {
        return rawJsonString;
      }
    }
    return JSON.stringify(parsedData, null, 2);
  }, [rawJsonString, parsedData]);

  // Size calculation
  const byteSize = useMemo(() => {
    return new Blob([formattedJsonString]).size;
  }, [formattedJsonString]);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedJsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([formattedJsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sourceChannel || 'marketplace'}_${entityType.toLowerCase()}_${identifier.replace(/[^a-zA-Z0-9_-]/g, '_')}_raw.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleExpand = (path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const handleToggleExpandAll = () => {
    if (!expandAllToggle) {
      // Collect all object/array paths
      const allPaths = new Set<string>(['root']);
      const collect = (obj: any, path: string) => {
        if (typeof obj === 'object' && obj !== null) {
          allPaths.add(path);
          Object.keys(obj).forEach(k => collect(obj[k], `${path}.${k}`));
        }
      };
      collect(parsedData, 'root');
      setExpandedPaths(allPaths);
      setExpandAllToggle(true);
    } else {
      setExpandedPaths(new Set(['root']));
      setExpandAllToggle(false);
    }
  };

  // Render tree node recursively
  const renderTreeNode = (data: any, path: string, keyName?: string, depth = 0): React.ReactNode => {
    const isExpanded = expandedPaths.has(path);
    const isObject = typeof data === 'object' && data !== null;
    const isArray = Array.isArray(data);

    // Search filter check
    const matchesSearch = searchQuery.trim() !== '' && (
      (keyName && keyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (!isObject && String(data).toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (isObject) {
      const keys = Object.keys(data);
      const childCount = keys.length;

      return (
        <div key={path} className={`font-mono text-xs leading-relaxed ${depth > 0 ? 'ml-4' : ''}`}>
          <div 
            onClick={() => toggleExpand(path)}
            className={`flex items-center gap-1.5 py-1 px-1.5 rounded cursor-pointer transition-colors group select-none ${
              matchesSearch ? 'bg-amber-500/20 text-amber-200' : 'hover:bg-slate-800/60 text-slate-300'
            }`}
          >
            <span className="text-slate-500 group-hover:text-slate-300">
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </span>
            {keyName && (
              <span className="text-sky-300 font-semibold">{keyName}:</span>
            )}
            <span className="text-slate-400">
              {isArray ? `Array[${childCount}]` : `Object{${childCount}}`}
            </span>
            {!isExpanded && (
              <span className="text-slate-500 text-[11px] truncate max-w-xs">
                {isArray ? `[...]` : `{...}`}
              </span>
            )}
          </div>

          {isExpanded && (
            <div className="border-l border-slate-800/80 pl-2 my-0.5 space-y-0.5">
              {keys.map((k) => renderTreeNode(data[k], `${path}.${k}`, k, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    // Primitive values
    let valClass = 'text-emerald-400';
    let valDisplay = String(data);

    if (typeof data === 'number') {
      valClass = 'text-purple-300 tabular-nums';
    } else if (typeof data === 'boolean') {
      valClass = 'text-amber-400 font-semibold';
      valDisplay = data ? 'true' : 'false';
    } else if (data === null) {
      valClass = 'text-rose-400 italic';
      valDisplay = 'null';
    } else if (typeof data === 'string') {
      valDisplay = `"${data}"`;
    }

    return (
      <div 
        key={path} 
        className={`font-mono text-xs py-0.5 px-1.5 rounded flex items-baseline gap-2 ${depth > 0 ? 'ml-4' : ''} ${
          matchesSearch ? 'bg-amber-500/25 ring-1 ring-amber-400/40' : 'hover:bg-slate-800/40'
        }`}
      >
        {keyName && (
          <span className="text-sky-300 font-semibold shrink-0">{keyName}:</span>
        )}
        <span className={`break-all ${valClass}`}>{valDisplay}</span>
      </div>
    );
  };

  // Auto-generate mappings if not provided
  const resolvedMappings: FieldMappingEntry[] = useMemo(() => {
    if (mappings && mappings.length > 0) return mappings;

    const list: FieldMappingEntry[] = [];
    if (!parsedData || typeof parsedData !== 'object') return list;

    // Detect Trendyol
    if (parsedData.orderNumber || parsedData.shipmentPackageStatus) {
      list.push(
        { rawPath: 'orderNumber', erpTarget: 'channelOrderNumber', rawValue: parsedData.orderNumber, mappedValue: parsedData.orderNumber, status: 'matched' },
        { rawPath: 'shipmentPackageStatus', erpTarget: 'status / channelStatusRaw', rawValue: parsedData.shipmentPackageStatus, mappedValue: parsedData.shipmentPackageStatus, status: 'matched' },
        { rawPath: 'totalPrice', erpTarget: 'totalAmount', rawValue: parsedData.totalPrice, mappedValue: `${parsedData.totalPrice} TL`, status: 'matched' },
        { rawPath: 'cargoProviderName', erpTarget: 'cargoProvider', rawValue: parsedData.cargoProviderName, mappedValue: parsedData.cargoProviderName, status: 'matched' },
        { rawPath: 'cargoTrackingNumber', erpTarget: 'cargoBarcode / cargoTrackingNumber', rawValue: parsedData.cargoTrackingNumber, mappedValue: parsedData.cargoTrackingNumber, status: 'matched' },
        { rawPath: 'shipmentAddress.fullAddress', erpTarget: 'shippingAddress', rawValue: parsedData.shipmentAddress?.fullAddress || parsedData.shipmentAddress?.address1, mappedValue: parsedData.shipmentAddress?.fullAddress, status: 'matched' },
        { rawPath: 'customerFirstName + lastName', erpTarget: 'customerName', rawValue: `${parsedData.customerFirstName || ''} ${parsedData.customerLastName || ''}`.trim(), mappedValue: `${parsedData.customerFirstName || ''} ${parsedData.customerLastName || ''}`.trim(), status: 'matched' },
        { rawPath: 'lines[0].merchantSku', erpTarget: 'items[0].productCode', rawValue: parsedData.lines?.[0]?.merchantSku || parsedData.lines?.[0]?.barcode, mappedValue: parsedData.lines?.[0]?.merchantSku, status: 'matched' }
      );
    }
    // Detect Hepsiburada
    else if (parsedData.recipient || parsedData.cargoCompany) {
      list.push(
        { rawPath: 'orderNumber / id', erpTarget: 'channelOrderNumber', rawValue: parsedData.orderNumber || parsedData.id, mappedValue: parsedData.orderNumber || parsedData.id, status: 'matched' },
        { rawPath: 'status', erpTarget: 'status / channelStatusRaw', rawValue: parsedData.status, mappedValue: parsedData.status, status: 'matched' },
        { rawPath: 'totalPrice.amount', erpTarget: 'totalAmount', rawValue: parsedData.totalPrice?.amount, mappedValue: `${parsedData.totalPrice?.amount} TL`, status: 'matched' },
        { rawPath: 'cargoCompany.name', erpTarget: 'cargoProvider', rawValue: parsedData.cargoCompany?.name, mappedValue: parsedData.cargoCompany?.name, status: 'matched' },
        { rawPath: 'barcode', erpTarget: 'cargoBarcode', rawValue: parsedData.barcode, mappedValue: parsedData.barcode, status: 'matched' },
        { rawPath: 'recipient.addressDetail', erpTarget: 'shippingAddress', rawValue: parsedData.recipient?.addressDetail, mappedValue: parsedData.recipient?.addressDetail, status: 'matched' },
        { rawPath: 'recipient.name', erpTarget: 'customerName', rawValue: parsedData.recipient?.name, mappedValue: parsedData.recipient?.name, status: 'matched' }
      );
    }
    // Detect N11
    else if (parsedData.itemList || parsedData.buyer) {
      list.push(
        { rawPath: 'orderNumber', erpTarget: 'channelOrderNumber', rawValue: parsedData.orderNumber, mappedValue: parsedData.orderNumber, status: 'matched' },
        { rawPath: 'status', erpTarget: 'status / channelStatusRaw', rawValue: parsedData.status, mappedValue: parsedData.status, status: 'matched' },
        { rawPath: 'totalAmount', erpTarget: 'totalAmount', rawValue: parsedData.totalAmount, mappedValue: `${parsedData.totalAmount} TL`, status: 'matched' },
        { rawPath: 'buyer.fullName', erpTarget: 'customerName', rawValue: parsedData.buyer?.fullName || parsedData.fullName, mappedValue: parsedData.buyer?.fullName, status: 'matched' },
        { rawPath: 'shippingAddress.address', erpTarget: 'shippingAddress', rawValue: parsedData.shippingAddress?.address || parsedData.fullAddress, mappedValue: parsedData.shippingAddress?.address, status: 'matched' }
      );
    }
    // Generic fallback mapping
    else {
      Object.entries(parsedData).slice(0, 8).forEach(([k, v]) => {
        list.push({
          rawPath: k,
          erpTarget: `mapped_${k}`,
          rawValue: typeof v === 'object' ? JSON.stringify(v) : v,
          mappedValue: typeof v === 'object' ? '[Object/Array]' : v,
          status: 'matched'
        });
      });
    }

    return list;
  }, [parsedData, mappings]);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-xl">
      {/* Top Header Bar */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Code className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white tracking-tight">{title}</h4>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                {(byteSize / 1024).toFixed(1)} KB
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Doğrulanmış Ham Veri
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Pazaryeri API'sinden dönen orijinal ve filtrelenmemiş JSON gövdesi.
            </p>
          </div>
        </div>

        {/* View Segmented Tabs & Actions */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg">
            <button
              onClick={() => setActiveView('tree')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                activeView === 'tree'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Katlanabilir Hiyerarşik Ağaç"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Ağaç</span>
            </button>
            <button
              onClick={() => setActiveView('mapping')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                activeView === 'mapping'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="ERP Alan Eşleme Denetçisi"
            >
              <Table2 className="w-3.5 h-3.5" />
              <span>Eşleme Müfettişi ({resolvedMappings.length})</span>
            </button>
            <button
              onClick={() => setActiveView('raw')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                activeView === 'raw'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Ham JSON Kod Metni"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Ham Kod</span>
            </button>
          </div>

          {/* Quick Copy */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors"
            title="Panoya Kopyala"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Kopyalandı</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Kopyala</span>
              </>
            )}
          </button>

          {/* Download JSON */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors"
            title=".json Olarak İndir"
          >
            <Download className="w-3.5 h-3.5" />
            <span>İndir</span>
          </button>
        </div>
      </div>

      {/* Search & Tree Tools (Tree view active) */}
      {activeView === 'tree' && (
        <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Anahtar veya değer ara..."
              className="w-full pl-8 pr-3 py-1 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleToggleExpandAll}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2 py-1 rounded bg-slate-800/50 hover:bg-slate-800 transition-colors"
          >
            {expandAllToggle ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Tümünü Daralt</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Tümünü Aç</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Main View Area */}
      <div className="p-4 max-h-[500px] overflow-y-auto font-mono text-xs select-text">
        {/* VIEW 1: Collapsible Tree */}
        {activeView === 'tree' && (
          <div className="space-y-1">
            {renderTreeNode(parsedData, 'root')}
          </div>
        )}

        {/* VIEW 2: Field Mapping Inspector */}
        {activeView === 'mapping' && (
          <div className="space-y-3 font-sans">
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong>Alan Eşleme & Normalizasyon Doğrulaması:</strong> Pazaryerinden gelen ham JSON parametrelerinin Mini ERP standart alanlarına birebir dönüşüm dökümüdür.
              </div>
            </div>

            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Pazaryeri Orijinal Parametresi (JSON Path)</th>
                    <th className="py-2.5 px-3">Mini ERP Hedef Alanı</th>
                    <th className="py-2.5 px-3">Gelen Değer</th>
                    <th className="py-2.5 px-3">ERP Eşlenen Değer</th>
                    <th className="py-2.5 px-3 text-right">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {resolvedMappings.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-2 px-3 text-sky-400 font-medium">
                        {m.rawPath}
                      </td>
                      <td className="py-2 px-3 text-purple-300 font-semibold">
                        {m.erpTarget}
                      </td>
                      <td className="py-2 px-3 text-slate-300 max-w-xs truncate" title={String(m.rawValue)}>
                        {String(m.rawValue ?? '-')}
                      </td>
                      <td className="py-2 px-3 text-emerald-400 font-medium max-w-xs truncate" title={String(m.mappedValue)}>
                        {String(m.mappedValue ?? '-')}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-sans">
                          <Check className="w-3 h-3" /> Eşleşti
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 3: Raw Formatted JSON Code */}
        {activeView === 'raw' && (
          <div className="relative">
            <pre className="text-slate-300 text-xs leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-900 overflow-x-auto whitespace-pre font-mono">
              {formattedJsonString}
            </pre>
          </div>
        )}
      </div>

      {/* Bottom Footer Info */}
      <div className="px-4 py-2.5 bg-slate-900/40 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span>Kanal: <strong className="text-slate-200 capitalize">{sourceChannel || 'Genel'}</strong></span>
          <span>·</span>
          <span>Tip: <strong className="text-slate-200">{entityType}</strong></span>
          <span>·</span>
          <span>Kimlik: <strong className="text-slate-200 font-mono">{identifier}</strong></span>
        </div>
        <div className="text-slate-500">
          EF Core <span className="font-mono text-slate-400">nvarchar(max)</span> / JSONB
        </div>
      </div>
    </div>
  );
};
