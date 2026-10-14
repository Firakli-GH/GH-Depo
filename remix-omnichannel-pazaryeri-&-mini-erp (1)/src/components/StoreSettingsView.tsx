import React, { useState } from 'react';
import { StoreAccount, MarketplaceChannel } from '../types';
import { CHANNEL_METADATA } from '../data/initialData';
import { MarketplaceAdapterRegistry } from '../services/marketplaceAdapters';
import { 
  Store, 
  Plus, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Trash2, 
  Sliders,
  ExternalLink,
  ShieldAlert,
  Check,
  Activity
} from 'lucide-react';

interface StoreSettingsViewProps {
  stores: StoreAccount[];
  onAddStore: (store: StoreAccount) => void;
  onUpdateStore: (store: StoreAccount) => void;
  onDeleteStore: (storeId: string) => void;
  onOpenDiagnostic?: () => void;
}

export const StoreSettingsView: React.FC<StoreSettingsViewProps> = ({
  stores,
  onAddStore,
  onUpdateStore,
  onDeleteStore,
  onOpenDiagnostic
}) => {
  const [testingStoreId, setTestingStoreId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string } | null>(null);

  // New store modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStoreChannel, setNewStoreChannel] = useState<MarketplaceChannel>('trendyol');
  const [newStoreName, setNewStoreName] = useState('');
  const [newSellerId, setNewSellerId] = useState('');
  const [newApiKey, setNewApiKey] = useState('');
  const [newApiSecret, setNewApiSecret] = useState('');
  const [newStoreUrl, setNewStoreUrl] = useState('');

  // Test connection
  const handleTestConnection = async (store: StoreAccount) => {
    setTestingStoreId(store.id);
    setTestResult(null);
    const res = await MarketplaceAdapterRegistry.testConnection(store);
    setTestingStoreId(null);
    setTestResult({
      id: store.id,
      success: res.success,
      message: res.message
    });
    setTimeout(() => setTestResult(null), 4000);
  };

  const handleSaveNewStore = () => {
    if (!newStoreName.trim() || !newSellerId.trim()) return;

    const newStore: StoreAccount = {
      id: `store-${newStoreChannel}-${Date.now()}`,
      storeName: newStoreName.trim(),
      channel: newStoreChannel,
      sellerId: newSellerId.trim(),
      apiKey: newApiKey.trim() || `key_${Date.now()}`,
      apiSecret: newApiSecret.trim() || `sec_${Date.now()}`,
      storeUrl: newStoreUrl.trim() || undefined,
      isActive: true,
      syncIntervalMinutes: 5,
      lastOrderSyncUtc: null,
      lastProductSyncUtc: null,
      lastQuestionSyncUtc: null,
      connectionStatus: 'connected'
    };

    onAddStore(newStore);
    setShowAddModal(false);
    // Reset form
    setNewStoreName('');
    setNewSellerId('');
    setNewApiKey('');
    setNewApiSecret('');
    setNewStoreUrl('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-400" />
            <span>Çoklu Mağaza & API Entegrasyon Yapılandırması</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Trendyol, Hepsiburada, N11, PttAVM, Pazarama, İdefix, Wix ve Ticimax mağaza anahtarlarınızı yönetin.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenDiagnostic && (
            <button
              onClick={onOpenDiagnostic}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>API & Servis Test Masası</span>
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Mağaza Hesabı Ekle</span>
          </button>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stores.map((store) => {
          const chMeta = CHANNEL_METADATA[store.channel];
          const isTesting = testingStoreId === store.id;
          const currentResult = testResult?.id === store.id ? testResult : null;

          return (
            <div
              key={store.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${chMeta?.badgeBg}`}>
                    {chMeta?.name || store.channel}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1.5">{store.storeName}</h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={store.isActive}
                      onChange={(e) => onUpdateStore({ ...store, isActive: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Credentials Summary */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 text-xs space-y-1.5 font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Satıcı ID:</span>
                  <span className="text-slate-200">{store.sellerId}</span>
                </div>
                {store.supplierId && (
                  <div className="flex justify-between text-slate-400">
                    <span>Tedarikçi ID:</span>
                    <span className="text-slate-200">{store.supplierId}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>API Key:</span>
                  <span className="text-slate-200 truncate max-w-[140px]">{store.apiKey}</span>
                </div>
                {store.storeUrl && (
                  <div className="flex justify-between text-slate-400 font-sans">
                    <span>Mağaza URL:</span>
                    <span className="text-blue-400 truncate max-w-[140px]">{store.storeUrl}</span>
                  </div>
                )}
              </div>

              {/* Sync Interval and Last Sync */}
              <div className="text-[11px] text-slate-500 flex justify-between items-center">
                <span>Periyot: {store.syncIntervalMinutes} dk</span>
                <span className="font-mono">
                  Son Eşleme: {store.lastOrderSyncUtc ? new Date(store.lastOrderSyncUtc).toLocaleTimeString('tr-TR') : 'Bekliyor'}
                </span>
              </div>

              {/* Test Connection Result Box */}
              {currentResult && (
                <div className={`p-2.5 rounded text-xs flex items-start gap-1.5 ${
                  currentResult.success 
                    ? 'bg-emerald-950/30 text-emerald-300 border border-emerald-500/20' 
                    : 'bg-red-950/30 text-red-300 border border-red-500/20'
                }`}>
                  {currentResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                  <span>{currentResult.message}</span>
                </div>
              )}

              {/* Actions Footer */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => handleTestConnection(store)}
                  disabled={isTesting}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Test Ediliyor...' : 'Bağlantıyı Test Et'}</span>
                </button>

                <button
                  onClick={() => onDeleteStore(store.id)}
                  className="text-slate-500 hover:text-red-400 p-1.5 transition-colors"
                  title="Mağazayı Kaldır"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Yeni Mağaza Ekle */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 text-slate-100 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              Yeni Mağaza / Entegrasyon Hesabı Tanımla
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Satış Kanalı</label>
                <select
                  value={newStoreChannel}
                  onChange={(e) => setNewStoreChannel(e.target.value as MarketplaceChannel)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  {Object.keys(CHANNEL_METADATA).map(k => (
                    <option key={k} value={k}>{CHANNEL_METADATA[k].name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Mağaza / Şube Adı</label>
                <input
                  type="text"
                  placeholder="Örn: Trendyol Butik 2, Ticimax B2B Depo"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Satıcı ID / Merchant ID</label>
                  <input
                    type="text"
                    placeholder="Örn: 948102"
                    value={newSellerId}
                    onChange={(e) => setNewSellerId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">API Key / Token</label>
                  <input
                    type="password"
                    placeholder="API Key"
                    value={newApiKey}
                    onChange={(e) => setNewApiKey(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {(newStoreChannel === 'wix' || newStoreChannel === 'ticimax') && (
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">E-Ticaret Web Sitesi URL</label>
                  <input
                    type="text"
                    placeholder="https://www.markamiz.com"
                    value={newStoreUrl}
                    onChange={(e) => setNewStoreUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg"
              >
                Vazgeç
              </button>
              <button
                onClick={handleSaveNewStore}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md"
              >
                Mağazayı Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
