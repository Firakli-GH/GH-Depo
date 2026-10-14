import React, { useState, useEffect, useCallback } from 'react';
import { 
  StoreAccount, 
  ErpInventoryProduct,
  MainProduct, 
  ChannelListingProduct,
  Order, 
  CustomerQuestion, 
  SettlementReport, 
  SyncLog, 
  UserSession, 
  UserRole,
  WorkerStatus,
  OrderStatus,
  MarketplaceChannel,
  CargoTierRate
} from './types';
import { 
  INITIAL_STORES, 
  INITIAL_ERP_INVENTORY,
  INITIAL_MAIN_PRODUCTS, 
  INITIAL_ORDERS, 
  INITIAL_QUESTIONS, 
  INITIAL_SETTLEMENTS, 
  INITIAL_SYNC_LOGS, 
  INITIAL_USER,
  INITIAL_CARGO_TARIFFS,
  CHANNEL_METADATA
} from './data/initialData';
import { MarketplaceAdapterRegistry } from './services/marketplaceAdapters';
import { ProductService } from './services/productService';
import { CargoPricingService } from './services/cargoPricingService';
import { RawPayloadGenerator } from './utils/rawPayloadGenerator';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { MainProductCatalogView } from './components/MainProductCatalogView';
import { InventoryView } from './components/InventoryView';
import { OrdersView } from './components/OrdersView';
import { CargoTariffDeskView } from './components/CargoTariffDeskView';
import { CargoDiscrepancyView } from './components/CargoDiscrepancyView';
import { QuestionsView } from './components/QuestionsView';
import { FinanceView } from './components/FinanceView';
import { WorkerConsoleView } from './components/WorkerConsoleView';
import { StoreSettingsView } from './components/StoreSettingsView';
import { ArchitectureView } from './components/ArchitectureView';
import { CategoryBrandMappingView } from './components/CategoryBrandMappingView';
import { ServiceDiagnosticView } from './components/ServiceDiagnosticView';
import { WpfStudioView } from './components/WpfStudioView';
import { 
  CategoryMarketplaceMapping, 
  BrandMarketplaceMapping,
  MasterCategory,
  MasterBrand
} from './types';
import { 
  INITIAL_CATEGORY_MAPPINGS, 
  INITIAL_BRAND_MAPPINGS,
  INITIAL_MASTER_CATEGORIES,
  INITIAL_MASTER_BRANDS 
} from './data/categoryBrandData';

export default function App() {
  // Main state stores
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [stores, setStores] = useState<StoreAccount[]>(INITIAL_STORES);
  
  // 3-Tier Product States
  const [inventoryList, setInventoryList] = useState<ErpInventoryProduct[]>(INITIAL_ERP_INVENTORY);
  const [mainProducts, setMainProducts] = useState<MainProduct[]>(INITIAL_MAIN_PRODUCTS);
  
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [cargoTariffs, setCargoTariffs] = useState<CargoTierRate[]>(INITIAL_CARGO_TARIFFS);
  const [questions, setQuestions] = useState<CustomerQuestion[]>(INITIAL_QUESTIONS);
  const [settlements, setSettlements] = useState<SettlementReport[]>(INITIAL_SETTLEMENTS);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>(INITIAL_SYNC_LOGS);
  const [user, setUser] = useState<UserSession>(INITIAL_USER);

  // Kategori Ağacı, Marka Tablosu ve Pazaryeri Eşleme Durumları
  const [categories, setCategories] = useState<MasterCategory[]>(INITIAL_MASTER_CATEGORIES);
  const [brands, setBrands] = useState<MasterBrand[]>(INITIAL_MASTER_BRANDS);
  const [categoryMappings, setCategoryMappings] = useState<CategoryMarketplaceMapping[]>(INITIAL_CATEGORY_MAPPINGS);
  const [brandMappings, setBrandMappings] = useState<BrandMarketplaceMapping[]>(INITIAL_BRAND_MAPPINGS);

  // Filter state
  const [selectedStoreId, setSelectedStoreId] = useState<string>('all');

  // Background Worker state
  const [workerStatus, setWorkerStatus] = useState<WorkerStatus>({
    isRunning: true,
    isPaused: false,
    lastExecutionUtc: new Date().toISOString(),
    nextExecutionUtc: new Date(Date.now() + 60000).toISOString(),
    activeJobsCount: 3,
    ordersIntervalSec: 60,
    inventoryIntervalSec: 120,
    questionsIntervalSec: 180,
    settlementIntervalSec: 600
  });

  const [isSyncing, setIsSyncing] = useState(false);

  // Filtered orders & questions based on store selector
  const activeOrders = selectedStoreId === 'all'
    ? orders
    : orders.filter(o => o.storeId === selectedStoreId);

  const activeQuestions = selectedStoreId === 'all'
    ? questions
    : questions.filter(q => q.storeId === selectedStoreId);

  // Background Worker ticker simulation
  const runBackgroundSyncTick = useCallback(async () => {
    if (workerStatus.isPaused) return;

    const activeStores = stores.filter(s => s.isActive);
    if (activeStores.length === 0) return;

    const store = activeStores[Math.floor(Math.random() * activeStores.length)];
    const result = await MarketplaceAdapterRegistry.fetchOrders(store);

    if (result.items.length > 0) {
      const newOrder = result.items[0] as Order;

      // Freeze recipe snapshot for the incoming item if it matches any listing
      if (newOrder.items.length > 0) {
        const item = newOrder.items[0];
        const snapshots = ProductService.freezeOrderRecipeSnapshot(
          item.id,
          item.barcode,
          item.quantity,
          mainProducts,
          inventoryList
        );

        if (snapshots.length > 0) {
          item.snapshots = snapshots;

          // Deduct from physical inventory reservations
          setInventoryList(prev => prev.map(inv => {
            const snap = snapshots.find(s => s.erpInventoryProductId === inv.id);
            if (snap) {
              const newRes = inv.reservedQuantity + snap.totalQuantityDeducted;
              return {
                ...inv,
                reservedQuantity: newRes,
                availableQuantity: Math.max(0, inv.physicalStockQuantity - newRes)
              };
            }
            return inv;
          }));
        }
      }

      // Freeze Cargo Snapshot as well (Dondurulmuş Kargo Parametreleri)
      const candidateTier = CargoPricingService.resolveBaremTier(
        cargoTariffs,
        store.channel,
        1.5,
        newOrder.totalAmount,
        newOrder.cargoProvider
      );

      newOrder.cargoSnapshot = {
        id: `csnap-${Date.now()}`,
        orderId: newOrder.id,
        selectedCargoProvider: newOrder.cargoProvider,
        estimatedDesi: 1.5,
        estimatedCargoFee: candidateTier?.sellerCargoFee || 19.00,
        appliedBaremCode: candidateTier?.tierName || 'STD-10D-BAREM',
        frozenAtUtc: new Date().toISOString(),
        wasProviderOverridden: false,
        actualInvoicedDesi: 1.5,
        actualInvoicedFee: candidateTier?.sellerCargoFee || 19.00,
        discrepancyDesi: 0,
        discrepancyFee: 0,
        hasDiscrepancy: false
      };

      if (!newOrder.rawPayloadJson) {
        const raw = RawPayloadGenerator.generateOrderRawPayload(newOrder as Order);
        newOrder.rawPayload = raw.rawPayload;
        newOrder.rawPayloadJson = raw.rawPayloadJson;
      }

      setOrders(prev => [newOrder as Order, ...prev]);

      // Add structured log
      const newLog: SyncLog = {
        id: `log-${Date.now()}`,
        storeId: store.id,
        storeName: store.storeName,
        channel: store.channel,
        timestampUtc: new Date().toISOString(),
        module: 'Orders',
        status: 'Success',
        fetchedCount: 1,
        processedCount: 1,
        errorCount: 0,
        durationMs: result.durationMs,
        details: `${store.storeName} sipariş aldı: ${newOrder.channelOrderNumber}. Reçete ve Kargo Barem parametreleri anlık donduruldu (Snapshot).`
      };
      setSyncLogs(prev => [newLog, ...prev]);
    }

    setWorkerStatus(prev => ({
      ...prev,
      lastExecutionUtc: new Date().toISOString(),
      nextExecutionUtc: new Date(Date.now() + prev.ordersIntervalSec * 1000).toISOString()
    }));
  }, [stores, workerStatus.isPaused, workerStatus.ordersIntervalSec, mainProducts, inventoryList, cargoTariffs]);

  // Periodic Timer effect for Background Worker
  useEffect(() => {
    const timer = setInterval(() => {
      runBackgroundSyncTick();
    }, 45000);

    return () => clearInterval(timer);
  }, [runBackgroundSyncTick]);

  // Trigger Full Sync across all channels
  const handleTriggerFullSync = async () => {
    setIsSyncing(true);
    const startTime = performance.now();
    await new Promise(r => setTimeout(r, 650));

    // Recalculate all virtual stocks
    const updatedMain = ProductService.recalculateAllMainProducts(mainProducts, inventoryList);
    setMainProducts(updatedMain);

    const fullSyncLog: SyncLog = {
      id: `log-${Date.now()}`,
      timestampUtc: new Date().toISOString(),
      module: 'Inventory',
      status: 'Success',
      fetchedCount: stores.length,
      processedCount: updatedMain.length,
      errorCount: 0,
      durationMs: Math.round(performance.now() - startTime),
      details: `Manuel Eşleme: 8 Kanal, ${mainProducts.length} Ana Ürün ve tüm klon ilanların sanal stokları depodan yeniden hesaplanıp senkronize edildi.`
    };

    setSyncLogs(prev => [fullSyncLog, ...prev]);
    setIsSyncing(false);
  };

  // 1. Kademe: Fiziki Depo Stoğu Güncelleme
  const handleUpdateInventoryStock = (invId: string, newStock: number) => {
    const updatedInv = inventoryList.map(item => {
      if (item.id !== invId) return item;
      const net = Math.max(0, newStock - item.reservedQuantity);
      return {
        ...item,
        physicalStockQuantity: newStock,
        availableQuantity: net,
        updatedAtUtc: new Date().toISOString()
      };
    });

    setInventoryList(updatedInv);

    // Reaktif olarak tüm ana ürünlerin sanal stoklarını yeniden hesapla!
    const updatedMain = ProductService.recalculateAllMainProducts(mainProducts, updatedInv);
    setMainProducts(updatedMain);

    const targetItem = inventoryList.find(i => i.id === invId);
    setSyncLogs(prev => [{
      id: `log-${Date.now()}`,
      timestampUtc: new Date().toISOString(),
      module: 'Inventory',
      status: 'Success',
      fetchedCount: 1,
      processedCount: updatedMain.length,
      durationMs: 45,
      errorCount: 0,
      details: `Fiziki Stok Güncelleme: [${targetItem?.productCode}] stoğu ${newStock} oldu. Reçetesinde bu ürünü kullanan tüm paketlerin sanal stokları pazaryerlerine itildi.`
    }, ...prev]);
  };

  // 1. Kademe: Fiziki Depo Alış Maliyeti Güncelleme
  const handleUpdateInventoryPrice = (invId: string, newPrice: number) => {
    const updatedInv = inventoryList.map(item => {
      if (item.id !== invId) return item;
      return { ...item, buyingPrice: newPrice, updatedAtUtc: new Date().toISOString() };
    });

    setInventoryList(updatedInv);
    const updatedMain = ProductService.recalculateAllMainProducts(mainProducts, updatedInv);
    setMainProducts(updatedMain);
  };

  // 2. Kademe: Ana Ürün & Reçete Güncelleme
  const handleUpdateMainProduct = (updated: MainProduct) => {
    const fresh = ProductService.calculateMainProductMetrics(updated, inventoryList);
    setMainProducts(prev => prev.map(p => p.id === fresh.id ? fresh : p));

    setSyncLogs(prev => [{
      id: `log-${Date.now()}`,
      timestampUtc: new Date().toISOString(),
      module: 'Inventory',
      status: 'Success',
      fetchedCount: 1,
      processedCount: 1,
      durationMs: 35,
      errorCount: 0,
      details: `Reçete/Desi Güncelleme: [${fresh.masterProductCode}] güncellendi (Yeni Maliyet: ${fresh.calculatedTotalCost} TL, Sanal Stok: ${fresh.calculatedVirtualStock}).`
    }, ...prev]);
  };

  // 3. Kademe: Yeni Klon / Sahte Barkodlu İlan Ekleme
  const handleAddCloneListing = (mainProductId: string, listing: ChannelListingProduct) => {
    setMainProducts(prev => prev.map(mp => {
      if (mp.id !== mainProductId) return mp;
      return {
        ...mp,
        listings: [...mp.listings, listing]
      };
    }));

    setSyncLogs(prev => [{
      id: `log-${Date.now()}`,
      timestampUtc: new Date().toISOString(),
      module: 'Inventory',
      status: 'Success',
      fetchedCount: 1,
      processedCount: 1,
      durationMs: 40,
      errorCount: 0,
      details: `Yeni Klon İlan Açıldı: ${listing.channel.toUpperCase()} kanalında [${listing.listingBarcode}] barkoduyla bağlandı.`
    }, ...prev]);
  };

  // 3. Kademe: İlan Silme
  const handleDeleteListing = (mainProductId: string, listingId: string) => {
    setMainProducts(prev => prev.map(mp => {
      if (mp.id !== mainProductId) return mp;
      return {
        ...mp,
        listings: mp.listings.filter(l => l.id !== listingId)
      };
    }));
  };

  // Order status advance
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      return {
        ...o,
        status: newStatus,
        erpFicheNo: newStatus === 'Invoiced' && !o.erpFicheNo ? `LOGO-FAT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}` : o.erpFicheNo,
        isExportedToErp: newStatus === 'Invoiced' ? true : o.isExportedToErp
      };
    }));
  };

  // Bulk status update
  const handleBulkUpdateStatus = (orderIds: string[], newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => {
      if (!orderIds.includes(o.id)) return o;
      return {
        ...o,
        status: newStatus,
        erpFicheNo: newStatus === 'Invoiced' && !o.erpFicheNo ? `LOGO-FAT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}` : o.erpFicheNo,
        isExportedToErp: newStatus === 'Invoiced' ? true : o.isExportedToErp
      };
    }));
  };

  // Answer customer question
  const handleAnswerQuestion = (questionId: string, answerText: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== questionId) return q;
      return {
        ...q,
        status: 'Answered',
        answerText,
        answeredAtUtc: new Date().toISOString(),
        answeredBy: user.fullName
      };
    }));
  };

  // Store management
  const handleAddStore = (newStore: StoreAccount) => {
    setStores(prev => [...prev, newStore]);
  };

  const handleUpdateStore = (updatedStore: StoreAccount) => {
    setStores(prev => prev.map(s => s.id === updatedStore.id ? updatedStore : s));
  };

  const handleDeleteStore = (storeId: string) => {
    setStores(prev => prev.filter(s => s.id !== storeId));
  };

  // Kategori & Marka Eşleme Güncellemeleri
  const handleUpdateCategoryMapping = (updated: CategoryMarketplaceMapping) => {
    setCategoryMappings(prev => prev.map(m => m.id === updated.id ? updated : m));
  };

  const handleUpdateBrandMapping = (updated: BrandMarketplaceMapping) => {
    setBrandMappings(prev => prev.map(m => m.id === updated.id ? updated : m));
  };

  const handleBatchDispatchSuccess = (updatedProducts: MainProduct[], batchId: string) => {
    setMainProducts(prev => prev.map(p => {
      const upd = updatedProducts.find(u => u.id === p.id);
      return upd ? upd : p;
    }));
    setSyncLogs(prev => [{
      id: `log-${Date.now()}`,
      timestampUtc: new Date().toISOString(),
      module: 'Inventory',
      status: 'Success',
      fetchedCount: updatedProducts.length,
      processedCount: updatedProducts.length,
      durationMs: 380,
      errorCount: 0,
      details: `Pazaryerine Ürün Açma Başarılı: ${updatedProducts.length} adet ürün başarıyla kanala aktarıldı (Batch ID: ${batchId})`
    }, ...prev]);
  };

  // Kargo Değiştirme (Operatör Firma Override)
  const handleOverrideCargoProvider = (orderId: string, newProvider: string, reason: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const original = o.cargoSnapshot?.originalProvider || o.cargoSnapshot?.selectedCargoProvider || o.cargoProvider;
      return {
        ...o,
        cargoProvider: newProvider,
        cargoSnapshot: o.cargoSnapshot ? {
          ...o.cargoSnapshot,
          originalProvider: original,
          selectedCargoProvider: newProvider,
          wasProviderOverridden: true,
          overriddenReason: reason
        } : undefined
      };
    }));

    const target = orders.find(o => o.id === orderId);
    setSyncLogs(prev => [{
      id: `log-${Date.now()}`,
      timestampUtc: new Date().toISOString(),
      module: 'Orders',
      status: 'Warning',
      fetchedCount: 1,
      processedCount: 1,
      durationMs: 30,
      errorCount: 0,
      details: `Kargo Değişikliği: [${target?.channelOrderNumber}] için kargo firması değiştirildi (${target?.cargoProvider} -> ${newProvider}). Gerekçe: "${reason}"`
    }, ...prev]);
  };

  // Kalem Düzeyinde Not Güncelleme
  const handleUpdateOrderItemNote = (orderId: string, itemId: string, noteText: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      return {
        ...o,
        items: o.items.map(it => {
          if (it.id !== itemId) return it;
          return {
            ...it,
            itemNote: noteText
          };
        })
      };
    }));

    const targetOrder = orders.find(o => o.id === orderId);
    const targetItem = targetOrder?.items.find(i => i.id === itemId);
    setSyncLogs(prev => [{
      id: `log-${Date.now()}`,
      timestampUtc: new Date().toISOString(),
      module: 'Orders',
      status: 'Success',
      fetchedCount: 1,
      processedCount: 1,
      durationMs: 25,
      errorCount: 0,
      details: `Kalem Notu Güncellendi: [${targetOrder?.channelOrderNumber}] siparişindeki [${targetItem?.title ? targetItem.title.slice(0, 20) : 'Ürün'}] kalemi için not kaydedildi.`
    }, ...prev]);
  };

  // Kargo İtiraz Durumu Güncelleme
  const handleUpdateClaimStatus = (orderId: string, newStatus: 'PendingClaim' | 'ClaimSubmitted' | 'Resolved' | 'Rejected') => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId || !o.cargoSnapshot) return o;
      return {
        ...o,
        cargoSnapshot: {
          ...o.cargoSnapshot,
          claimStatus: newStatus
        }
      };
    }));

    const target = orders.find(o => o.id === orderId);
    setSyncLogs(prev => [{
      id: `log-${Date.now()}`,
      timestampUtc: new Date().toISOString(),
      module: 'Orders',
      status: newStatus === 'Resolved' ? 'Success' : 'Warning',
      fetchedCount: 1,
      processedCount: 1,
      durationMs: 25,
      errorCount: 0,
      details: `Kargo İtiraz Takibi: [${target?.channelOrderNumber}] uyuşmazlık durumu "${newStatus}" olarak güncellendi.`
    }, ...prev]);
  };

  // Kargo Baremleri Yönetimi
  const handleAddTariff = (tariff: CargoTierRate) => {
    setCargoTariffs(prev => [tariff, ...prev]);
  };

  const handleDeleteTariff = (tariffId: string) => {
    setCargoTariffs(prev => prev.filter(t => t.id !== tariffId));
  };

  const handleImportTariffs = (newTariffs: CargoTierRate[], overwrite: boolean) => {
    if (overwrite) {
      setCargoTariffs(newTariffs);
    } else {
      setCargoTariffs(prev => [...newTariffs, ...prev]);
    }

    setSyncLogs(prev => [{
      id: `log-${Date.now()}`,
      timestampUtc: new Date().toISOString(),
      module: 'Inventory',
      status: 'Success',
      fetchedCount: newTariffs.length,
      processedCount: newTariffs.length,
      durationMs: 65,
      errorCount: 0,
      details: `Excel Kargo Tarifesi Yüklendi: ${newTariffs.length} yeni barem matrisi sisteme işlendi (${overwrite ? 'Üzerine Yazıldı' : 'Mevcut Listeye Eklendi'}).`
    }, ...prev]);
  };

  const discrepancyCount = orders.filter(o => o.cargoSnapshot?.hasDiscrepancy).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        stores={stores}
        selectedStoreId={selectedStoreId}
        onSelectStoreId={setSelectedStoreId}
        user={user}
        onChangeUserRole={(role) => setUser({ ...user, role })}
        workerStatus={workerStatus}
        isSyncing={isSyncing}
        onTriggerSync={handleTriggerFullSync}
        onToggleWorkerPause={() => setWorkerStatus(prev => ({ ...prev, isPaused: !prev.isPaused }))}
        discrepancyCount={discrepancyCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1580px] w-full mx-auto px-4 sm:px-6 py-6">
        {/* TAB 1: KOKPİT */}
        {currentTab === 'dashboard' && (
          <DashboardView
            orders={activeOrders}
            products={mainProducts.map(mp => ({
              id: mp.id,
              productCode: mp.masterProductCode,
              barcode: mp.masterBarcode,
              title: mp.title,
              brand: 'Katalog',
              category: mp.mainCategory,
              vatRate: 20,
              currency: 'TRY',
              buyingPrice: mp.calculatedTotalCost,
              stockQuantity: mp.calculatedVirtualStock,
              reservedQuantity: 0,
              availableQuantity: mp.calculatedVirtualStock,
              createdAtUtc: mp.updatedAtUtc,
              updatedAtUtc: mp.updatedAtUtc,
              channelListings: mp.listings.map(l => ({
                id: l.id,
                storeId: l.storeAccountId,
                channel: l.channel,
                channelListingId: l.listingSku,
                listingBarcode: l.listingBarcode,
                salePrice: l.salePrice,
                commissionRate: l.commissionRate,
                syncStatus: 'synced',
                lastSyncUtc: l.lastSyncUtc
              }))
            }))}
            questions={activeQuestions}
            stores={stores}
            syncLogs={syncLogs}
            onNavigate={setCurrentTab}
            onFilterByChannel={(ch) => setCurrentTab('orders')}
          />
        )}

        {/* TAB 2: ANA ÜRÜN & PAKET (BOM MASASI) */}
        {currentTab === 'main-catalog' && (
          <MainProductCatalogView
            mainProducts={mainProducts}
            inventoryList={inventoryList}
            stores={stores}
            categoryMappings={categoryMappings}
            brandMappings={brandMappings}
            onUpdateMainProduct={handleUpdateMainProduct}
            onAddCloneListing={handleAddCloneListing}
            onDeleteListing={handleDeleteListing}
            onOpenMappingView={() => setCurrentTab('category-mapping')}
            onBatchDispatchSuccess={handleBatchDispatchSuccess}
          />
        )}

        {/* TAB: KATEGORİ & MARKA EŞLEME MASASI */}
        {currentTab === 'category-mapping' && (
          <CategoryBrandMappingView
            categories={categories}
            brands={brands}
            categoryMappings={categoryMappings}
            brandMappings={brandMappings}
            onUpdateCategoryMapping={handleUpdateCategoryMapping}
            onUpdateBrandMapping={handleUpdateBrandMapping}
          />
        )}

        {/* TAB 3: DEPO ENVANTERİ (FİZİKİ STOKLAR) - NEW! */}
        {currentTab === 'inventory' && (
          <InventoryView
            inventoryList={inventoryList}
            mainProducts={mainProducts}
            onUpdateInventoryStock={handleUpdateInventoryStock}
            onUpdateInventoryPrice={handleUpdateInventoryPrice}
          />
        )}

        {/* TAB 4: SİPARİŞLER */}
        {currentTab === 'orders' && (
          <OrdersView
            orders={activeOrders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onBulkUpdateStatus={handleBulkUpdateStatus}
            onAssignErpFicheNo={(id, fiche) => {
              setOrders(prev => prev.map(o => o.id === id ? { ...o, erpFicheNo: fiche, isExportedToErp: true } : o));
            }}
            onOverrideCargoProvider={handleOverrideCargoProvider}
            onUpdateOrderItemNote={handleUpdateOrderItemNote}
          />
        )}

        {/* TAB: KARGO & BAREM MASASI (Dönemsel Tarifeler & Fiyat Simülatörü) */}
        {currentTab === 'cargo-tariffs' && (
          <CargoTariffDeskView
            tariffs={cargoTariffs}
            mainProducts={mainProducts}
            onAddTariff={handleAddTariff}
            onDeleteTariff={handleDeleteTariff}
            onImportTariffs={handleImportTariffs}
          />
        )}

        {/* TAB: KARGO MUTABAKATI & DESİ UYUŞMAZLIKLARI */}
        {currentTab === 'cargo-discrepancy' && (
          <CargoDiscrepancyView
            orders={activeOrders}
            onUpdateClaimStatus={handleUpdateClaimStatus}
            onOpenOrderDetails={() => setCurrentTab('orders')}
          />
        )}

        {/* TAB 5: MÜŞTERİ SORU-CEVAP */}
        {currentTab === 'questions' && (
          <QuestionsView
            questions={activeQuestions}
            onAnswerQuestion={handleAnswerQuestion}
          />
        )}

        {/* TAB 6: FİNANS & HAKEDİŞ */}
        {currentTab === 'finance' && (
          <FinanceView
            settlements={settlements}
          />
        )}

        {/* TAB 7: WORKER KONSOLU */}
        {currentTab === 'worker' && (
          <WorkerConsoleView
            workerStatus={workerStatus}
            syncLogs={syncLogs}
            onTogglePause={() => setWorkerStatus(prev => ({ ...prev, isPaused: !prev.isPaused }))}
            onTriggerSingleJob={(mod) => handleTriggerFullSync()}
            onUpdateInterval={(mod, sec) => {
              if (mod === 'orders') setWorkerStatus(prev => ({ ...prev, ordersIntervalSec: sec }));
              if (mod === 'inventory') setWorkerStatus(prev => ({ ...prev, inventoryIntervalSec: sec }));
              if (mod === 'questions') setWorkerStatus(prev => ({ ...prev, questionsIntervalSec: sec }));
            }}
            onClearLogs={() => setSyncLogs([])}
          />
        )}

        {/* TAB 8: MAĞAZA AYARLARI */}
        {currentTab === 'stores' && (
          <StoreSettingsView
            stores={stores}
            onAddStore={handleAddStore}
            onUpdateStore={handleUpdateStore}
            onDeleteStore={handleDeleteStore}
            onOpenDiagnostic={() => setCurrentTab('api-diagnostic')}
          />
        )}

        {/* TAB: API & SERVİS TEST MASASI (CANLI TEŞHİS) */}
        {currentTab === 'api-diagnostic' && (
          <ServiceDiagnosticView
            stores={stores}
            mainProducts={mainProducts}
            onNavigateToTab={setCurrentTab}
          />
        )}

        {/* TAB: WPF EKRAN VE XAML STÜDYOSU */}
        {currentTab === 'wpf-studio' && (
          <WpfStudioView />
        )}

        {/* TAB 9: C# .NET 8 MİMARİSİ */}
        {currentTab === 'architecture' && (
          <ArchitectureView onNavigate={setCurrentTab} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
        <div>
          OmniChannel Mini ERP · 3 Kademeli Ürün & BOM Reçete Mimarisi · .NET 8.0 WPF Katmanlı Yapı
        </div>
        <div className="flex items-center gap-3">
          <span>Depo Stoğu $\longrightarrow$ Ana Ürün (BOM) $\longrightarrow$ Pazaryeri Klon İlanları (1:N)</span>
          <span aria-hidden="true">·</span>
          <span>Dondurulmuş Reçete (BOM Snapshot)</span>
        </div>
      </footer>
    </div>
  );
}
