import { 
  ChannelMeta, 
  StoreAccount, 
  ErpInventoryProduct,
  MainProduct,
  Order, 
  CustomerQuestion, 
  SettlementReport, 
  SyncLog,
  UserSession,
  CargoTierRate,
  OrderCargoSnapshot
} from '../types';
import { RawPayloadGenerator } from '../utils/rawPayloadGenerator';

export const CHANNEL_METADATA: Record<string, ChannelMeta> = {
  trendyol: {
    id: 'trendyol',
    name: 'Trendyol',
    type: 'marketplace',
    color: '#F27A1A',
    badgeBg: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
    badgeText: 'text-orange-400',
    iconName: 'ShoppingBag',
    apiUrl: 'https://api.trendyol.com/sapigw/suppliers',
    docUrl: 'https://developers.trendyol.com/'
  },
  hepsiburada: {
    id: 'hepsiburada',
    name: 'Hepsiburada',
    type: 'marketplace',
    color: '#FF6000',
    badgeBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    badgeText: 'text-amber-400',
    iconName: 'Store',
    apiUrl: 'https://merchant.hepsiburada.com/api',
    docUrl: 'https://developers.hepsiburada.com/'
  },
  n11: {
    id: 'n11',
    name: 'N11',
    type: 'marketplace',
    color: '#5C2D91',
    badgeBg: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    badgeText: 'text-purple-400',
    iconName: 'Tag',
    apiUrl: 'https://api.n11.com/ws',
    docUrl: 'https://developer.n11.com/'
  },
  pttavm: {
    id: 'pttavm',
    name: 'PttAVM',
    type: 'marketplace',
    color: '#005BA6',
    badgeBg: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    badgeText: 'text-blue-400',
    iconName: 'Mail',
    apiUrl: 'https://epk.ptt.gov.tr/api',
    docUrl: 'https://pttavm.com/api'
  },
  pazarama: {
    id: 'pazarama',
    name: 'Pazarama',
    type: 'marketplace',
    color: '#00A389',
    badgeBg: 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
    badgeText: 'text-teal-400',
    iconName: 'Compass',
    apiUrl: 'https://api.pazarama.com/seller',
    docUrl: 'https://developer.pazarama.com/'
  },
  idefix: {
    id: 'idefix',
    name: 'İdefix',
    type: 'marketplace',
    color: '#E30613',
    badgeBg: 'bg-red-500/10 text-red-400 border border-red-500/20',
    badgeText: 'text-red-400',
    iconName: 'BookOpen',
    apiUrl: 'https://api.idefix.com/pazaryeri',
    docUrl: 'https://idefix.com/entegrasyon'
  },
  wix: {
    id: 'wix',
    name: 'Wix eCommerce',
    type: 'ecommerce',
    color: '#0C80DF',
    badgeBg: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
    badgeText: 'text-sky-400',
    iconName: 'Globe',
    apiUrl: 'https://www.wixapis.com/stores/v2',
    docUrl: 'https://dev.wix.com/api/rest/wix-stores'
  },
  ticimax: {
    id: 'ticimax',
    name: 'Ticimax',
    type: 'ecommerce',
    color: '#00B050',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    badgeText: 'text-emerald-400',
    iconName: 'Zap',
    apiUrl: 'https://eticaret.ticimax.com/Servis/UrunServis.svc',
    docUrl: 'https://www.ticimax.com/destek/api'
  }
};

// =========================================================================
// DÖNEMSEL PAZARYERİ KARGO VE BAREM TARİFE LİSTELERİ (CARGO TARIFF MATRIX)
// =========================================================================
export const INITIAL_CARGO_TARIFFS: CargoTierRate[] = [
  // TRENDYOL BAREMLERİ (Örn: 10 Desi Altı ≤150 TL: TEX 9 TL, PTT 15 TL, Aras 20 TL)
  {
    id: 'tier-ty-1',
    channel: 'trendyol',
    cargoProvider: 'Trendyol Express',
    tierName: 'TEX Barem 1 (≤150 TL)',
    minCartPrice: 0,
    maxCartPrice: 150.00,
    minDesi: 0,
    maxDesi: 10.00,
    sellerCargoFee: 9.00,
    isMarketplaceSubsidized: true,
    validFromUtc: '2026-04-01T00:00:00Z'
  },
  {
    id: 'tier-ty-2',
    channel: 'trendyol',
    cargoProvider: 'PTT Kargo',
    tierName: 'PTT Barem 1 (≤150 TL)',
    minCartPrice: 0,
    maxCartPrice: 150.00,
    minDesi: 0,
    maxDesi: 10.00,
    sellerCargoFee: 15.00,
    isMarketplaceSubsidized: true,
    validFromUtc: '2026-04-01T00:00:00Z'
  },
  {
    id: 'tier-ty-3',
    channel: 'trendyol',
    cargoProvider: 'Aras Kargo',
    tierName: 'Aras Barem 1 (≤150 TL)',
    minCartPrice: 0,
    maxCartPrice: 150.00,
    minDesi: 0,
    maxDesi: 10.00,
    sellerCargoFee: 20.00,
    isMarketplaceSubsidized: true,
    validFromUtc: '2026-04-01T00:00:00Z'
  },
  {
    id: 'tier-ty-4',
    channel: 'trendyol',
    cargoProvider: 'Trendyol Express',
    tierName: 'TEX Barem 2 (150-300 TL)',
    minCartPrice: 150.01,
    maxCartPrice: 300.00,
    minDesi: 0,
    maxDesi: 10.00,
    sellerCargoFee: 19.00,
    isMarketplaceSubsidized: true,
    validFromUtc: '2026-04-01T00:00:00Z'
  },
  {
    id: 'tier-ty-5',
    channel: 'trendyol',
    cargoProvider: 'Aras Kargo',
    tierName: 'Aras Barem 2 (150-300 TL)',
    minCartPrice: 150.01,
    maxCartPrice: 300.00,
    minDesi: 0,
    maxDesi: 10.00,
    sellerCargoFee: 28.50,
    isMarketplaceSubsidized: true,
    validFromUtc: '2026-04-01T00:00:00Z'
  },
  {
    id: 'tier-ty-6',
    channel: 'trendyol',
    cargoProvider: 'Trendyol Express',
    tierName: 'TEX Standart Tarife (300+ TL)',
    minCartPrice: 300.01,
    maxCartPrice: 999999,
    minDesi: 0,
    maxDesi: 10.00,
    sellerCargoFee: 39.50,
    isMarketplaceSubsidized: false,
    validFromUtc: '2026-04-01T00:00:00Z'
  },
  {
    id: 'tier-ty-7',
    channel: 'trendyol',
    cargoProvider: 'Aras Kargo',
    tierName: 'Aras Standart Tarife (300+ TL)',
    minCartPrice: 300.01,
    maxCartPrice: 999999,
    minDesi: 0,
    maxDesi: 10.00,
    sellerCargoFee: 45.00,
    isMarketplaceSubsidized: false,
    validFromUtc: '2026-04-01T00:00:00Z'
  },
  {
    id: 'tier-ty-8',
    channel: 'trendyol',
    cargoProvider: 'Trendyol Express',
    tierName: 'TEX Büyük Paket (11-20 Desi)',
    minCartPrice: 0,
    maxCartPrice: 999999,
    minDesi: 10.01,
    maxDesi: 20.00,
    sellerCargoFee: 62.00,
    isMarketplaceSubsidized: false,
    validFromUtc: '2026-04-01T00:00:00Z'
  },

  // HEPSİBURADA BAREMLERİ
  {
    id: 'tier-hb-1',
    channel: 'hepsiburada',
    cargoProvider: 'HepsiJet',
    tierName: 'HJ Barem 1 (≤150 TL)',
    minCartPrice: 0,
    maxCartPrice: 150.00,
    minDesi: 0,
    maxDesi: 10.00,
    sellerCargoFee: 11.00,
    isMarketplaceSubsidized: true,
    validFromUtc: '2026-04-01T00:00:00Z'
  },
  {
    id: 'tier-hb-2',
    channel: 'hepsiburada',
    cargoProvider: 'Aras Kargo',
    tierName: 'HB Aras Barem 1 (≤150 TL)',
    minCartPrice: 0,
    maxCartPrice: 150.00,
    minDesi: 0,
    maxDesi: 10.00,
    sellerCargoFee: 21.00,
    isMarketplaceSubsidized: true,
    validFromUtc: '2026-04-01T00:00:00Z'
  },
  {
    id: 'tier-hb-3',
    channel: 'hepsiburada',
    cargoProvider: 'HepsiJet',
    tierName: 'HJ Barem 2 (150-300 TL)',
    minCartPrice: 150.01,
    maxCartPrice: 300.00,
    minDesi: 0,
    maxDesi: 10.00,
    sellerCargoFee: 22.00,
    isMarketplaceSubsidized: true,
    validFromUtc: '2026-04-01T00:00:00Z'
  },
  {
    id: 'tier-hb-4',
    channel: 'hepsiburada',
    cargoProvider: 'HepsiJet',
    tierName: 'HJ Standart Tarife (300+ TL)',
    minCartPrice: 300.01,
    maxCartPrice: 999999,
    minDesi: 0,
    maxDesi: 10.00,
    sellerCargoFee: 41.00,
    isMarketplaceSubsidized: false,
    validFromUtc: '2026-04-01T00:00:00Z'
  },

  // N11 BAREMLERİ
  {
    id: 'tier-n11-1',
    channel: 'n11',
    cargoProvider: 'Aras Kargo',
    tierName: 'N11 Aras Barem (≤200 TL)',
    minCartPrice: 0,
    maxCartPrice: 200.00,
    minDesi: 0,
    maxDesi: 5.00,
    sellerCargoFee: 18.50,
    isMarketplaceSubsidized: true,
    validFromUtc: '2026-04-01T00:00:00Z'
  },
  {
    id: 'tier-n11-2',
    channel: 'n11',
    cargoProvider: 'Yurtiçi Kargo',
    tierName: 'N11 YK Barem (≤200 TL)',
    minCartPrice: 0,
    maxCartPrice: 200.00,
    minDesi: 0,
    maxDesi: 5.00,
    sellerCargoFee: 24.00,
    isMarketplaceSubsidized: true,
    validFromUtc: '2026-04-01T00:00:00Z'
  },
  {
    id: 'tier-n11-3',
    channel: 'n11',
    cargoProvider: 'Aras Kargo',
    tierName: 'N11 Aras Standart',
    minCartPrice: 200.01,
    maxCartPrice: 999999,
    minDesi: 0,
    maxDesi: 10.00,
    sellerCargoFee: 38.00,
    isMarketplaceSubsidized: false,
    validFromUtc: '2026-04-01T00:00:00Z'
  },

  // PTTAVM BAREMLERİ
  {
    id: 'tier-ptt-1',
    channel: 'pttavm',
    cargoProvider: 'PTT Kargo',
    tierName: 'PttAVM Standart İndirimli',
    minCartPrice: 0,
    maxCartPrice: 999999,
    minDesi: 0,
    maxDesi: 10.00,
    sellerCargoFee: 26.50,
    isMarketplaceSubsidized: true,
    validFromUtc: '2026-04-01T00:00:00Z'
  },

  // PAZARAMA BAREMLERİ
  {
    id: 'tier-paz-1',
    channel: 'pazarama',
    cargoProvider: 'Sendeo',
    tierName: 'Pazarama Sendeo Barem 1',
    minCartPrice: 0,
    maxCartPrice: 250.00,
    minDesi: 0,
    maxDesi: 10.00,
    sellerCargoFee: 19.90,
    isMarketplaceSubsidized: true,
    validFromUtc: '2026-04-01T00:00:00Z'
  }
];

export const INITIAL_STORES: StoreAccount[] = [
  {
    id: 'store-ty-1',
    storeName: 'Trendyol Ana Mağaza',
    channel: 'trendyol',
    sellerId: 'TY-948102',
    supplierId: 'SUP-41029',
    apiKey: 'ty_live_key_948102_xyz',
    apiSecret: 'ty_sec_*********************',
    isActive: true,
    syncIntervalMinutes: 2,
    lastOrderSyncUtc: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    lastProductSyncUtc: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    lastQuestionSyncUtc: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    connectionStatus: 'connected'
  },
  {
    id: 'store-ty-2',
    storeName: 'Trendyol Outlet & Fırsat',
    channel: 'trendyol',
    sellerId: 'TY-948103',
    apiKey: 'ty_live_key_outlet_881',
    apiSecret: 'ty_sec_*********************',
    isActive: true,
    syncIntervalMinutes: 5,
    lastOrderSyncUtc: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    lastProductSyncUtc: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    lastQuestionSyncUtc: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    connectionStatus: 'connected'
  },
  {
    id: 'store-hb-1',
    storeName: 'Hepsiburada Resmi Satıcı',
    channel: 'hepsiburada',
    sellerId: 'HB-MERCH-7712',
    apiKey: 'hb_live_auth_7712',
    apiSecret: 'hb_secret_*****************',
    isActive: true,
    syncIntervalMinutes: 3,
    lastOrderSyncUtc: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    lastProductSyncUtc: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    lastQuestionSyncUtc: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    connectionStatus: 'connected'
  },
  {
    id: 'store-n11-1',
    storeName: 'N11 Butik Mağazası',
    channel: 'n11',
    sellerId: 'N11-APIMAG-4401',
    apiKey: 'n11_app_key_88419',
    apiSecret: 'n11_sec_*******************',
    isActive: true,
    syncIntervalMinutes: 5,
    lastOrderSyncUtc: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    lastProductSyncUtc: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    lastQuestionSyncUtc: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    connectionStatus: 'connected'
  },
  {
    id: 'store-ptt-1',
    storeName: 'PttAVM Kurumsal Mağaza',
    channel: 'pttavm',
    sellerId: 'PTT-SUP-1092',
    apiKey: 'ptt_token_bearer_1092',
    apiSecret: 'ptt_sec_*******************',
    isActive: true,
    syncIntervalMinutes: 10,
    lastOrderSyncUtc: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    lastProductSyncUtc: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    lastQuestionSyncUtc: null,
    connectionStatus: 'connected'
  },
  {
    id: 'store-pzr-1',
    storeName: 'Pazarama Satıcı Hesabı',
    channel: 'pazarama',
    sellerId: 'PZR-MERCHANT-309',
    apiKey: 'pzr_api_key_30981',
    apiSecret: 'pzr_sec_*******************',
    isActive: true,
    syncIntervalMinutes: 5,
    lastOrderSyncUtc: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    lastProductSyncUtc: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    lastQuestionSyncUtc: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    connectionStatus: 'connected'
  },
  {
    id: 'store-idx-1',
    storeName: 'İdefix Kitap & Hobi',
    channel: 'idefix',
    sellerId: 'IDX-SELLER-550',
    apiKey: 'idx_live_55021',
    apiSecret: 'idx_sec_*******************',
    isActive: true,
    syncIntervalMinutes: 15,
    lastOrderSyncUtc: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    lastProductSyncUtc: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    lastQuestionSyncUtc: null,
    connectionStatus: 'connected'
  },
  {
    id: 'store-wix-1',
    storeName: 'Wix Global D2C Mağaza',
    channel: 'wix',
    sellerId: 'WIX-INSTANCE-991',
    apiKey: 'wix_bearer_oauth_99182',
    apiSecret: 'wix_secret_****************',
    storeUrl: 'https://mystore.wixsite.com/shop',
    isActive: true,
    syncIntervalMinutes: 5,
    lastOrderSyncUtc: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    lastProductSyncUtc: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    lastQuestionSyncUtc: null,
    connectionStatus: 'connected'
  },
  {
    id: 'store-tcx-1',
    storeName: 'Ticimax Ana E-Ticaret Deposu',
    channel: 'ticimax',
    sellerId: 'TICIMAX-WS-001',
    apiKey: 'tcx_soap_auth_key_119',
    apiSecret: 'tcx_pass_******************',
    storeUrl: 'https://eticaret.markamiz.com',
    isActive: true,
    syncIntervalMinutes: 2,
    lastOrderSyncUtc: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    lastProductSyncUtc: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    lastQuestionSyncUtc: null,
    connectionStatus: 'connected'
  }
];

// =========================================================================
// 1. KADEME: MİNİ ERP FİZİKİ DEPO STOKLARI
// =========================================================================
export const INITIAL_ERP_INVENTORY: ErpInventoryProduct[] = [
  {
    id: 'inv-001',
    productCode: 'STK-KOL-80',
    barcode: '8680001001',
    title: '80 Derece Limon Kolonyası 400ml Pet Şişe',
    brand: 'Marmara Çiçeği',
    category: 'Kozmetik > Kolonya',
    buyingPrice: 45.00,
    vatRate: 20,
    physicalStockQuantity: 450,
    reservedQuantity: 20,
    availableQuantity: 430,
    unitDesi: 0.35,
    leadTimeDays: 1,
    updatedAtUtc: new Date().toISOString()
  },
  {
    id: 'inv-002',
    productCode: 'STK-MND-10',
    barcode: '8680001002',
    title: 'Antiseptik Islak Cep Mendili 120li Paket',
    brand: 'FreshClean',
    category: 'Kişisel Bakım > Mendil',
    buyingPrice: 15.00,
    vatRate: 20,
    physicalStockQuantity: 280,
    reservedQuantity: 15,
    availableQuantity: 265,
    unitDesi: 0.20,
    leadTimeDays: 1,
    updatedAtUtc: new Date().toISOString()
  },
  {
    id: 'inv-003',
    productCode: 'STK-KUL-01',
    barcode: '8680001092811',
    title: 'Kablosuz ANC Bluetooth Kulaklık Pro V5.3',
    brand: 'AcousticPlus',
    category: 'Elektronik > Ses Sistemleri',
    buyingPrice: 850.00,
    vatRate: 20,
    physicalStockQuantity: 140,
    reservedQuantity: 8,
    availableQuantity: 132,
    unitDesi: 0.80,
    leadTimeDays: 2,
    updatedAtUtc: new Date().toISOString()
  },
  {
    id: 'inv-004',
    productCode: 'STK-KVT-02',
    barcode: '8680001092828',
    title: 'Mekanik RGB Oyuncu Klavyesi Brown Switch',
    brand: 'NovaTech',
    category: 'Bilgisayar & Aksesuar',
    buyingPrice: 1100.00,
    vatRate: 20,
    physicalStockQuantity: 65,
    reservedQuantity: 4,
    availableQuantity: 61,
    unitDesi: 1.50,
    leadTimeDays: 1,
    updatedAtUtc: new Date().toISOString()
  },
  {
    id: 'inv-005',
    productCode: 'STK-TRS-03',
    barcode: '8680001092835',
    title: 'Termos Çelik Matara 750ml Çift Katman Vakumlu',
    brand: 'HydroSteel',
    category: 'Ev & Yaşam > Mutfak',
    buyingPrice: 280.00,
    vatRate: 20,
    physicalStockQuantity: 210,
    reservedQuantity: 12,
    availableQuantity: 198,
    unitDesi: 0.90,
    leadTimeDays: 1,
    updatedAtUtc: new Date().toISOString()
  },
  {
    id: 'inv-006',
    productCode: 'STK-CZN-04',
    barcode: '8680001092842',
    title: 'Hakiki Deri Erkek Cüzdan RFID Korumalı Slim',
    brand: 'LeatherCraft',
    category: 'Moda & Aksesuar',
    buyingPrice: 320.00,
    vatRate: 10,
    physicalStockQuantity: 9,
    reservedQuantity: 3,
    availableQuantity: 6,
    unitDesi: 0.25,
    leadTimeDays: 1,
    updatedAtUtc: new Date().toISOString()
  }
];

// =========================================================================
// 2. KADEME: ANA ÜRÜNLER (MAIN PRODUCTS & BUNDLE REÇETELERİ)
// =========================================================================
const BASE_MAIN_PRODUCTS: MainProduct[] = [
  // 1. Tekli Kolonya
  {
    id: 'mp-001',
    masterProductCode: 'MP-KOL-TEK',
    masterBarcode: '8680001001',
    title: '80 Derece Limon Kolonyası 400ml Tekli',
    description: 'Doğal limon esansı ile zenginleştirilmiş, 80 derece ferahlatıcı geleneksel Türk limon kolonyası.',
    kind: 'Single',
    mainCategory: 'Kozmetik & Kişisel Bakım',
    subCategory: 'Kolonya',
    masterCategoryId: 'cat-kolonya',
    masterBrandId: 'brand-marmara',
    marketplaceAttributes: {
      trendyol: { 338: '400 ml', 342: 'Limon', 349: 'Sıvı / Losyon' },
      hepsiburada: { hb_volume: '400 ml', hb_alcohol: '80 Derece' }
    },
    targetProfitMargin: 40,
    calculatedDesi: 0.35,
    manualDesi: 0.40,
    calculatedLeadTimeDays: 1,
    manualLeadTimeDays: 1,
    calculatedTotalCost: 45.00,
    calculatedVirtualStock: 430,
    images: [{ id: 'img-1', url: '/images/kolonya.png', isPrimary: true, sortOrder: 1 }],
    recipeItems: [
      {
        id: 'rec-001-1',
        mainProductId: 'mp-001',
        erpInventoryProductId: 'inv-001',
        quantity: 1,
        componentTitle: '80 Derece Limon Kolonyası 400ml Pet Şişe',
        componentCode: 'STK-KOL-80',
        componentBarcode: '8680001001',
        unitBuyingPrice: 45.00,
        unitDesi: 0.35
      }
    ],
    listings: [
      {
        id: 'list-001-ty-1',
        mainProductId: 'mp-001',
        storeAccountId: 'store-ty-1',
        channel: 'trendyol',
        listingBarcode: '8680001001',
        listingSku: 'TY-KOL-ORJ-01',
        channelListingTitle: '80 Derece Ferah Limon Kolonyası 400 ml Orijinal Şişe',
        channelListingDescription: 'Orijinal ambalajında ferah limon kolonyası. Günlük kullanım için idealdir.',
        salePrice: 99.90,
        commissionRate: 18.0,
        isActive: true,
        syncStatus: 'Synced',
        lastSyncUtc: new Date(Date.now() - 5 * 60000).toISOString()
      },
      // Aynı Trendyol mağazasında Sahte/Alternatif Barkod ile açılmış 2. Klon İlan!
      {
        id: 'list-001-ty-klon',
        mainProductId: 'mp-001',
        storeAccountId: 'store-ty-1',
        channel: 'trendyol',
        listingBarcode: 'TY-FAK-KOL-01',
        listingSku: 'TY-KLON-KOL-DISC',
        channelListingTitle: 'Süper Fiyat Limon Kolonyası Doğal Ferahlık 400ml',
        channelListingDescription: 'İndirimli fırsat ürünü. Hızlı teslimat garantili limon kolonyası.',
        salePrice: 89.90,
        commissionRate: 18.0,
        isActive: true,
        syncStatus: 'Synced',
        lastSyncUtc: new Date(Date.now() - 8 * 60000).toISOString()
      },
      {
        id: 'list-001-hb-1',
        mainProductId: 'mp-001',
        storeAccountId: 'store-hb-1',
        channel: 'hepsiburada',
        listingBarcode: 'HB-KOL-80-ORJ',
        listingSku: 'HB-KOL-80',
        channelListingTitle: 'Geleneksel Limon Kolonyası 400ml Hijyenik Şişe',
        channelListingDescription: 'Yüksek alkol oranıyla etkin temizlik ve ferahlık sağlar.',
        salePrice: 94.90,
        commissionRate: 17.5,
        isActive: true,
        syncStatus: 'Synced',
        lastSyncUtc: new Date(Date.now() - 10 * 60000).toISOString()
      }
    ],
    updatedAtUtc: new Date().toISOString()
  },

  // 2. Adetli Paket (4'lü Kolonya)
  {
    id: 'mp-002',
    masterProductCode: 'MP-KOL-4PAK',
    masterBarcode: '8689990004',
    title: '80 Derece Limon Kolonyası 4lü Avantaj Paketi (4 x 400ml)',
    description: 'Aile ve ofis boyu ekonomik 4 adet 80 derece limon kolonyası avantaj paketi.',
    kind: 'MultiUnitBundle',
    mainCategory: 'Kozmetik & Kişisel Bakım',
    subCategory: 'Avantaj Paketleri',
    masterCategoryId: 'cat-kolonya',
    masterBrandId: 'brand-marmara',
    marketplaceAttributes: {
      trendyol: { 338: '400 ml', 342: 'Limon', 349: 'Sıvı / Losyon' },
      hepsiburada: { hb_volume: '400 ml', hb_alcohol: '80 Derece' }
    },
    targetProfitMargin: 45,
    calculatedDesi: 1.40, // 4 x 0.35
    manualDesi: 1.50,     // Koli sevk desisi
    calculatedLeadTimeDays: 1,
    manualLeadTimeDays: 1,
    calculatedTotalCost: 180.00, // 4 x 45 TL
    calculatedVirtualStock: 107, // floor(430 / 4)
    images: [{ id: 'img-2', url: '/images/kolonya-4lu.png', isPrimary: true, sortOrder: 1 }],
    recipeItems: [
      {
        id: 'rec-002-1',
        mainProductId: 'mp-002',
        erpInventoryProductId: 'inv-001',
        quantity: 4,
        componentTitle: '80 Derece Limon Kolonyası 400ml Pet Şişe',
        componentCode: 'STK-KOL-80',
        componentBarcode: '8680001001',
        unitBuyingPrice: 45.00,
        unitDesi: 0.35
      }
    ],
    listings: [
      {
        id: 'list-002-ty-1',
        mainProductId: 'mp-002',
        storeAccountId: 'store-ty-1',
        channel: 'trendyol',
        listingBarcode: '8689990004',
        listingSku: 'TY-4KOL-MAIN',
        channelListingTitle: '80 Derece Limon Kolonyası 4x400 ml Ekonomik Paket',
        channelListingDescription: '4 adet 400ml kolonya içeren ekonomik süper set.',
        salePrice: 349.90,
        commissionRate: 19.0,
        isActive: true,
        syncStatus: 'Synced',
        lastSyncUtc: new Date(Date.now() - 4 * 60000).toISOString()
      },
      // Trendyol Alternatif Klon İlan (Özel/Sahte Barkod)
      {
        id: 'list-002-ty-klon',
        mainProductId: 'mp-002',
        storeAccountId: 'store-ty-1',
        channel: 'trendyol',
        listingBarcode: 'TY-FAK-4KOL-ADV',
        listingSku: 'TY-4KOL-KLON-SALE',
        channelListingTitle: 'Dörtlü Kolonya Aile Boyu Avantaj Paketi 4x400ml',
        channelListingDescription: 'Toplu alım avantajı ile 4 kutu taze limon kolonyası.',
        salePrice: 339.90,
        commissionRate: 19.0,
        isActive: true,
        syncStatus: 'Synced',
        lastSyncUtc: new Date(Date.now() - 6 * 60000).toISOString()
      },
      {
        id: 'list-002-hb-1',
        mainProductId: 'mp-002',
        storeAccountId: 'store-hb-1',
        channel: 'hepsiburada',
        listingBarcode: 'HB-4LU-KOLON-SET',
        listingSku: 'HB-4KOL-SET',
        channelListingTitle: '4 Adet Limon Kolonyası Süper Set 400ml',
        channelListingDescription: 'Hepsiburada özel fiyatlı 4 adet kolonya sepeti.',
        salePrice: 345.00,
        commissionRate: 18.0,
        isActive: true,
        syncStatus: 'Synced',
        lastSyncUtc: new Date(Date.now() - 9 * 60000).toISOString()
      }
    ],
    updatedAtUtc: new Date().toISOString()
  },

  // 3. Karma Set (5x Kolonya + 1x Islak Mendil)
  {
    id: 'mp-003',
    masterProductCode: 'MP-SET-5K1M',
    masterBarcode: '8689990011',
    title: '5li Limon Kolonyası + 1 Paket Islak Mendil Hijyen Kiti',
    description: '5 adet 400ml Limon Kolonyası ve 1 paket 120li antiseptik cep mendili içeren tam hijyen paketi.',
    kind: 'CompositeKit',
    mainCategory: 'Kozmetik & Kişisel Bakım',
    subCategory: 'Hijyen Kitleri',
    masterCategoryId: 'cat-kolonya',
    masterBrandId: 'brand-marmara',
    marketplaceAttributes: {
      trendyol: { 338: '400 ml', 342: 'Limon', 349: 'Sıvı / Losyon' }
    },
    targetProfitMargin: 50,
    calculatedDesi: 1.95, // 5 x 0.35 + 1 x 0.20 = 1.95
    manualDesi: 2.00,     // Koli sevk desisi
    calculatedLeadTimeDays: 1,
    manualLeadTimeDays: 1,
    calculatedTotalCost: 240.00, // 5 x 45 + 1 x 15 = 240 TL
    calculatedVirtualStock: 86,  // min(floor(430/5), floor(265/1)) = min(86, 265) = 86 paket
    images: [{ id: 'img-3', url: '/images/hijyen-seti.png', isPrimary: true, sortOrder: 1 }],
    recipeItems: [
      {
        id: 'rec-003-1',
        mainProductId: 'mp-003',
        erpInventoryProductId: 'inv-001',
        quantity: 5,
        componentTitle: '80 Derece Limon Kolonyası 400ml Pet Şişe',
        componentCode: 'STK-KOL-80',
        componentBarcode: '8680001001',
        unitBuyingPrice: 45.00,
        unitDesi: 0.35
      },
      {
        id: 'rec-003-2',
        mainProductId: 'mp-003',
        erpInventoryProductId: 'inv-002',
        quantity: 1,
        componentTitle: 'Antiseptik Islak Cep Mendili 120li Paket',
        componentCode: 'STK-MND-10',
        componentBarcode: '8680001002',
        unitBuyingPrice: 15.00,
        unitDesi: 0.20
      }
    ],
    listings: [
      {
        id: 'list-003-ty-1',
        mainProductId: 'mp-003',
        storeAccountId: 'store-ty-1',
        channel: 'trendyol',
        listingBarcode: '8689990011',
        listingSku: 'TY-5K1M-MAIN',
        channelListingTitle: '5li Limon Kolonyası + 1 Paket Islak Mendil Hijyen Seti',
        channelListingDescription: 'Ev ve iş yeri için komple dezenfeksiyon ve ferahlık kiti.',
        salePrice: 469.90,
        commissionRate: 19.5,
        isActive: true,
        syncStatus: 'Synced',
        lastSyncUtc: new Date(Date.now() - 3 * 60000).toISOString()
      },
      {
        id: 'list-003-hb-1',
        mainProductId: 'mp-003',
        storeAccountId: 'store-hb-1',
        channel: 'hepsiburada',
        listingBarcode: 'HB-5K1M-HIJYEN',
        listingSku: 'HB-5K1M-KIT',
        channelListingTitle: 'Ferahlık Paketi: 5 Adet Kolonya ve Islak Mendil',
        channelListingDescription: 'Toplu tasarruf paketi. 5 kolonya ve 1 ıslak mendil bir arada.',
        salePrice: 459.00,
        commissionRate: 18.0,
        isActive: true,
        syncStatus: 'Synced',
        lastSyncUtc: new Date(Date.now() - 5 * 60000).toISOString()
      },
      {
        id: 'list-003-tcx-1',
        mainProductId: 'mp-003',
        storeAccountId: 'store-tcx-1',
        channel: 'ticimax',
        listingBarcode: 'TCX-SET-5K1M',
        listingSku: 'TCX-5K1M-D2C',
        channelListingTitle: 'Özel Hijyen ve Temizlik Kiti 5 Kolonya + Mendil',
        channelListingDescription: 'Doğrudan üreticiden web sitemize özel indirimli fiyat.',
        salePrice: 419.00,
        commissionRate: 0.0,
        isActive: true,
        syncStatus: 'Synced',
        lastSyncUtc: new Date(Date.now() - 2 * 60000).toISOString()
      }
    ],
    updatedAtUtc: new Date().toISOString()
  },

  // 4. Kablosuz Kulaklık (Tekil)
  {
    id: 'mp-004',
    masterProductCode: 'MP-KUL-PRO',
    masterBarcode: '8680001092811',
    title: 'Kablosuz ANC Bluetooth Kulaklık Pro V5.3',
    description: 'Aktif Gürültü Engelleme özellikli, 36 saat pil ömrüne sahip kablosuz kulaklık.',
    kind: 'Single',
    mainCategory: 'Elektronik',
    subCategory: 'Ses Sistemleri',
    masterCategoryId: 'cat-kulaklik',
    masterBrandId: 'brand-acoustic',
    marketplaceAttributes: {
      trendyol: { 501: 'Bluetooth 5.3', 502: 'Var', 503: 'Siyah' },
      hepsiburada: { hb_bt_version: '5.3' }
    },
    targetProfitMargin: 50,
    calculatedDesi: 0.80,
    manualDesi: 1.00,
    calculatedLeadTimeDays: 2,
    manualLeadTimeDays: 2,
    calculatedTotalCost: 850.00,
    calculatedVirtualStock: 132,
    images: [{ id: 'img-4', url: '/images/kulaklik.png', isPrimary: true, sortOrder: 1 }],
    recipeItems: [
      {
        id: 'rec-004-1',
        mainProductId: 'mp-004',
        erpInventoryProductId: 'inv-003',
        quantity: 1,
        componentTitle: 'Kablosuz ANC Bluetooth Kulaklık Pro V5.3',
        componentCode: 'STK-KUL-01',
        componentBarcode: '8680001092811',
        unitBuyingPrice: 850.00,
        unitDesi: 0.80
      }
    ],
    listings: [
      {
        id: 'list-004-ty-1',
        mainProductId: 'mp-004',
        storeAccountId: 'store-ty-1',
        channel: 'trendyol',
        listingBarcode: '8680001092811',
        listingSku: 'TY-KUL-001',
        channelListingTitle: 'Kablosuz ANC Bluetooth Kulaklık Pro V5.3 Siyah',
        channelListingDescription: 'Gürültü engelleme ve şeffaf mod destekli profesyonel kulaklık.',
        salePrice: 1699.90,
        commissionRate: 19.5,
        isActive: true,
        syncStatus: 'Synced',
        lastSyncUtc: new Date(Date.now() - 10 * 60000).toISOString()
      }
    ],
    updatedAtUtc: new Date().toISOString()
  },

  // 5. Mekanik Klavye (Tekil)
  {
    id: 'mp-005',
    masterProductCode: 'MP-KVT-NOVA',
    masterBarcode: '8680001092828',
    title: 'Mekanik RGB Oyuncu Klavyesi Brown Switch',
    description: 'Dayanıklı alüminyum gövde, çalışırken değiştirilebilir switch ve RGB aydınlatma.',
    kind: 'Single',
    mainCategory: 'Bilgisayar & Aksesuar',
    subCategory: 'Klavyeler',
    masterCategoryId: 'cat-klavye',
    masterBrandId: 'brand-novatech',
    marketplaceAttributes: {
      trendyol: { 601: 'Brown Switch (Sessiz Dokunsal)', 602: 'RGB Çok Renkli', 603: 'Türkçe Q' }
    },
    targetProfitMargin: 45,
    calculatedDesi: 1.50,
    manualDesi: 1.50,
    calculatedLeadTimeDays: 1,
    manualLeadTimeDays: 1,
    calculatedTotalCost: 1100.00,
    calculatedVirtualStock: 61,
    images: [{ id: 'img-5', url: '/images/klavye.png', isPrimary: true, sortOrder: 1 }],
    recipeItems: [
      {
        id: 'rec-005-1',
        mainProductId: 'mp-005',
        erpInventoryProductId: 'inv-004',
        quantity: 1,
        componentTitle: 'Mekanik RGB Oyuncu Klavyesi Brown Switch',
        componentCode: 'STK-KVT-02',
        componentBarcode: '8680001092828',
        unitBuyingPrice: 1100.00,
        unitDesi: 1.50
      }
    ],
    listings: [
      {
        id: 'list-005-ty-1',
        mainProductId: 'mp-005',
        storeAccountId: 'store-ty-1',
        channel: 'trendyol',
        listingBarcode: '8680001092828',
        listingSku: 'TY-KVT-002',
        channelListingTitle: 'Mekanik RGB Oyuncu Klavyesi Kahverengi Switch Türkçe Q',
        channelListingDescription: 'Hızlı tepkime süresi ve sessiz mekanik dokunuş hissi.',
        salePrice: 2199.00,
        commissionRate: 16.5,
        isActive: true,
        syncStatus: 'Synced',
        lastSyncUtc: new Date(Date.now() - 12 * 60000).toISOString()
      }
    ],
    updatedAtUtc: new Date().toISOString()
  }
];

// Ham Veri (Raw JSON) ile Zenginleştirilmiş Ana Ürün & İlan Kataloğu
export const INITIAL_MAIN_PRODUCTS: MainProduct[] = BASE_MAIN_PRODUCTS.map(p => ({
  ...p,
  listings: p.listings.map(l => ({
    ...l,
    ...RawPayloadGenerator.generateListingRawPayload(l)
  }))
}));

// =========================================================================
// SİPARİŞLER (DONDURULMUŞ REÇETE / BOM SNAPSHOT ÖRNEKLERİ DAHİL)
// =========================================================================
const BASE_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    storeId: 'store-ty-1',
    channel: 'trendyol',
    channelOrderNumber: 'TY-849102941',
    customerName: 'Ahmet Yılmaz',
    customerEmail: 'ahmet.yilmaz@gmail.com',
    customerPhone: '0532 444 11 22',
    shippingAddress: 'Barbaros Mah. Mor Sümbül Sok. Varyap Meridian A Blok No:4 D:18',
    billingAddress: 'Barbaros Mah. Mor Sümbül Sok. Varyap Meridian A Blok No:4 D:18',
    city: 'İstanbul',
    district: 'Ataşehir',
    status: 'Created',
    channelStatusRaw: 'Created',
    orderDateUtc: new Date(Date.now() - 25 * 60000).toISOString(),
    paymentType: 'MarketplaceCollection',
    grossAmount: 1035.00,
    discountAmount: 0,
    cargoAmount: 0,
    totalAmount: 1035.00,
    cargoProvider: 'Trendyol Express',
    cargoBarcode: 'TY-TEX-849102941',
    isExportedToErp: false,
    deliveryCityType: 'istanbul_own_fleet',
    customerMessage: 'Lütfen kolileri özenli paketleyin, zil çalmayın bebek uyuyor. Kapıya bırakabilirsiniz.',
    hasMultipleOrdersForCustomer: true,
    relatedOrderNumbers: ['TY-849102945'],
    cargoSnapshot: {
      id: 'csnap-1001',
      orderId: 'ord-1001',
      selectedCargoProvider: 'Trendyol Express',
      estimatedDesi: 6.80,
      estimatedCargoFee: 54.00,
      appliedBaremCode: 'TY-TEX-STD-300PLUS',
      frozenAtUtc: new Date(Date.now() - 25 * 60000).toISOString(),
      wasProviderOverridden: false,
      actualInvoicedDesi: 6.80,
      actualInvoicedFee: 54.00,
      discrepancyDesi: 0,
      discrepancyFee: 0,
      hasDiscrepancy: false
    },
    items: [
      {
        id: 'item-1001-1',
        orderId: 'ord-1001',
        channelLineItemId: 'TY-LN-1',
        barcode: '8680001001',
        productCode: 'STK-KOL-80',
        title: '80 Derece Limon Kolonyası 400ml Pet Şişe',
        quantity: 1,
        unitPrice: 95.00,
        vatRate: 20,
        lineTotal: 95.00,
        status: 'Active',
        virtualStock: 42,
        imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=100&auto=format&fit=crop&q=80',
        itemDesi: 0.40,
        itemNote: 'Müşteri talebi: Kolonyalar limon kokulu orijinal seri olarak teyit edildi.',
        mainProductId: 'mp-001',
        snapshots: [
          {
            id: 'snap-1001-1',
            orderItemId: 'item-1001-1',
            erpInventoryProductId: 'inv-001',
            componentProductCode: 'STK-KOL-80',
            componentBarcode: '8680001001',
            componentTitle: '80 Derece Limon Kolonyası 400ml Pet Şişe',
            quantityPerPackage: 1,
            totalQuantityDeducted: 1,
            frozenBuyingCost: 45.00,
            frozenVatRate: 20,
            snapshotAtUtc: new Date(Date.now() - 25 * 60000).toISOString()
          }
        ]
      },
      {
        id: 'item-1001-2',
        orderId: 'ord-1001',
        channelLineItemId: 'TY-LN-2',
        barcode: '8680001099881',
        productCode: 'STK-ZYT-5KG',
        title: 'Doğal Gemlik Siyah Zeytin 5 Kg Teneke',
        quantity: 1,
        unitPrice: 550.00,
        vatRate: 1,
        lineTotal: 550.00,
        status: 'Active',
        virtualStock: 3, // Kritik düşük stok
        imageUrl: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=100&auto=format&fit=crop&q=80',
        itemDesi: 5.20,
        // itemNote bırakılmadı -> '+ Not Ekle' butonu burada test edilecek
        mainProductId: 'mp-001'
      },
      {
        id: 'item-1001-3',
        orderId: 'ord-1001',
        channelLineItemId: 'TY-LN-3',
        barcode: '8680001099120',
        productCode: 'STK-ZYT-01',
        title: 'Doğal Soğuk Sıkım Erken Hasat Zeytinyağı 1000ml (2 Adet)',
        quantity: 2,
        unitPrice: 195.00,
        vatRate: 1,
        lineTotal: 390.00,
        status: 'Active',
        virtualStock: 0, // Stok YOK uyarısı!
        imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100&auto=format&fit=crop&q=80',
        itemDesi: 2.40,
        itemNote: 'Depo notu: Stok tükendiği için yarın sabahki soğuk sıkım partisinden sevk edilecek.',
        mainProductId: 'mp-001',
        snapshots: [
          {
            id: 'snap-1001-3',
            orderItemId: 'item-1001-3',
            erpInventoryProductId: 'inv-002',
            componentProductCode: 'STK-ZYT-01',
            componentBarcode: '8680001099120',
            componentTitle: 'Sızma Zeytinyağı 1 Litre Şişe',
            quantityPerPackage: 1,
            totalQuantityDeducted: 2,
            frozenBuyingCost: 95.00,
            frozenVatRate: 1,
            snapshotAtUtc: new Date(Date.now() - 25 * 60000).toISOString()
          }
        ]
      }
    ]
  },
  {
    id: 'ord-1001-b',
    storeId: 'store-ty-1',
    channel: 'trendyol',
    channelOrderNumber: 'TY-849102945',
    customerName: 'Ahmet Yılmaz',
    customerEmail: 'ahmet.yilmaz@gmail.com',
    customerPhone: '0532 444 11 22',
    shippingAddress: 'Barbaros Mah. Mor Sümbül Sok. Varyap Meridian A Blok No:4 D:18',
    billingAddress: 'Barbaros Mah. Mor Sümbül Sok. Varyap Meridian A Blok No:4 D:18',
    city: 'İstanbul',
    district: 'Ataşehir',
    status: 'Created',
    channelStatusRaw: 'Created',
    orderDateUtc: new Date(Date.now() - 10 * 60000).toISOString(),
    paymentType: 'MarketplaceCollection',
    grossAmount: 120.00,
    discountAmount: 0,
    cargoAmount: 0,
    totalAmount: 120.00,
    cargoProvider: 'Trendyol Express',
    cargoBarcode: 'TY-TEX-849102945',
    isExportedToErp: false,
    deliveryCityType: 'istanbul_own_fleet',
    hasMultipleOrdersForCustomer: true,
    relatedOrderNumbers: ['TY-849102941'],
    cargoSnapshot: {
      id: 'csnap-1001-b',
      orderId: 'ord-1001-b',
      selectedCargoProvider: 'Trendyol Express',
      estimatedDesi: 0.50,
      estimatedCargoFee: 9.00,
      appliedBaremCode: 'TY-TEX-10D-SUB150',
      frozenAtUtc: new Date(Date.now() - 10 * 60000).toISOString(),
      wasProviderOverridden: false,
      actualInvoicedDesi: 0.50,
      actualInvoicedFee: 9.00,
      discrepancyDesi: 0,
      discrepancyFee: 0,
      hasDiscrepancy: false
    },
    items: [
      {
        id: 'item-1001-b-1',
        orderId: 'ord-1001-b',
        channelLineItemId: 'TY-LN-3',
        barcode: '8680001002',
        productCode: 'STK-MND-10',
        title: 'Antiseptik Islak Cep Mendili 120li Paket (3 Adet)',
        quantity: 3,
        unitPrice: 40.00,
        vatRate: 20,
        lineTotal: 120.00,
        status: 'Active',
        virtualStock: 85,
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&auto=format&fit=crop&q=80',
        itemDesi: 0.45,
        mainProductId: 'mp-001',
        snapshots: [
          {
            id: 'snap-1001-b-1',
            orderItemId: 'item-1001-b-1',
            erpInventoryProductId: 'inv-002',
            componentProductCode: 'STK-MND-10',
            componentBarcode: '8680001002',
            componentTitle: 'Antiseptik Islak Cep Mendili 120li Paket',
            quantityPerPackage: 1,
            totalQuantityDeducted: 3,
            frozenBuyingCost: 15.00,
            frozenVatRate: 20,
            snapshotAtUtc: new Date(Date.now() - 10 * 60000).toISOString()
          }
        ]
      }
    ]
  },
  {
    id: 'ord-1002',
    storeId: 'store-hb-1',
    channel: 'hepsiburada',
    channelOrderNumber: 'HB-4091823901',
    customerName: 'Elif Kaya',
    customerEmail: 'elif.kaya@outlook.com',
    customerPhone: '0543 555 77 88',
    shippingAddress: 'Çankaya Mah. Atatürk Bulvarı No:142 D:9',
    billingAddress: 'Çankaya Mah. Atatürk Bulvarı No:142 D:9',
    city: 'Ankara',
    district: 'Çankaya',
    status: 'Picking',
    channelStatusRaw: 'Picking',
    orderDateUtc: new Date(Date.now() - 55 * 60000).toISOString(),
    paymentType: 'MarketplaceCollection',
    grossAmount: 459.00,
    discountAmount: 0,
    cargoAmount: 0,
    totalAmount: 459.00,
    cargoProvider: 'HepsiJet',
    cargoBarcode: 'HJ-4091823901-TR',
    isExportedToErp: false,
    deliveryCityType: 'other_city',
    customerMessage: 'Fatura adresindeki vergi numarasını lütfen kontrol ediniz.',
    cargoSnapshot: {
      id: 'csnap-1002',
      orderId: 'ord-1002',
      selectedCargoProvider: 'HepsiJet',
      estimatedDesi: 2.00,
      estimatedCargoFee: 22.00,
      appliedBaremCode: 'HJ-10D-SUB300',
      frozenAtUtc: new Date(Date.now() - 55 * 60000).toISOString(),
      wasProviderOverridden: false,
      actualInvoicedDesi: 3.50,
      actualInvoicedFee: 41.00,
      discrepancyDesi: 1.50,
      discrepancyFee: 19.00,
      hasDiscrepancy: true,
      claimStatus: 'PendingClaim'
    },
    items: [
      {
        id: 'item-1002-1',
        orderId: 'ord-1002',
        channelLineItemId: 'HB-LN-1',
        barcode: 'HB-5K1M-HIJYEN',
        productCode: 'HB-5K1M-KIT',
        title: 'Ferahlık Paketi: 5 Adet Kolonya ve Islak Mendil',
        quantity: 1,
        unitPrice: 459.00,
        vatRate: 20,
        lineTotal: 459.00,
        status: 'Active',
        virtualStock: 18,
        imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=100&auto=format&fit=crop&q=80',
        itemDesi: 2.00,
        itemNote: 'Tedarik notu: Islak mendil partisi sabah 09:00da depoya alındı, eksiksiz paketlendi.',
        mainProductId: 'mp-003',
        snapshots: [
          {
            id: 'snap-1002-1',
            orderItemId: 'item-1002-1',
            erpInventoryProductId: 'inv-001',
            componentProductCode: 'STK-KOL-80',
            componentBarcode: '8680001001',
            componentTitle: '80 Derece Limon Kolonyası 400ml Pet Şişe',
            quantityPerPackage: 5,
            totalQuantityDeducted: 5,
            frozenBuyingCost: 45.00,
            frozenVatRate: 20,
            snapshotAtUtc: new Date(Date.now() - 55 * 60000).toISOString()
          },
          {
            id: 'snap-1002-2',
            orderItemId: 'item-1002-1',
            erpInventoryProductId: 'inv-002',
            componentProductCode: 'STK-MND-10',
            componentBarcode: '8680001002',
            componentTitle: 'Antiseptik Islak Cep Mendili 120li Paket',
            quantityPerPackage: 1,
            totalQuantityDeducted: 1,
            frozenBuyingCost: 15.00,
            frozenVatRate: 20,
            snapshotAtUtc: new Date(Date.now() - 55 * 60000).toISOString()
          }
        ]
      }
    ]
  },
  {
    id: 'ord-1003',
    storeId: 'store-ty-1',
    channel: 'trendyol',
    channelOrderNumber: 'TY-991204812',
    customerName: 'Burak Demir',
    customerEmail: 'b.demir@kurumsal.com.tr',
    customerTaxNoOrId: '1234567890',
    customerPhone: '0555 333 44 11',
    shippingAddress: 'Alsancak Mah. Kıbrıs Şehitleri Cad. No:88 K:3',
    billingAddress: 'Demir Teknoloji Ltd. Şti. - Konak VD 1234567890',
    city: 'İzmir',
    district: 'Konak',
    status: 'Invoiced',
    channelStatusRaw: 'Hazirlaniyor',
    orderDateUtc: new Date(Date.now() - 120 * 60000).toISOString(),
    paymentType: 'MarketplaceCollection',
    grossAmount: 1699.90,
    discountAmount: 0,
    cargoAmount: 0,
    totalAmount: 1699.90,
    cargoProvider: 'Trendyol Express',
    cargoTrackingNumber: '921820491823',
    cargoBarcode: 'TY-TEX-991204812',
    isExportedToErp: true,
    erpFicheNo: 'LOGO-FAT-2026-00481',
    deliveryCityType: 'other_city',
    customerMessage: 'Fatura Demir Teknoloji Ltd. Şti adına kesilmiştir, kargo içerisine basılı fatura konulsun.',
    cargoSnapshot: {
      id: 'csnap-1003',
      orderId: 'ord-1003',
      selectedCargoProvider: 'Trendyol Express',
      estimatedDesi: 0.80,
      estimatedCargoFee: 39.50,
      appliedBaremCode: 'TY-TEX-STD-300PLUS',
      frozenAtUtc: new Date(Date.now() - 120 * 60000).toISOString(),
      wasProviderOverridden: false,
      actualInvoicedDesi: 0.80,
      actualInvoicedFee: 39.50,
      discrepancyDesi: 0,
      discrepancyFee: 0,
      hasDiscrepancy: false
    },
    items: [
      {
        id: 'item-1003-1',
        orderId: 'ord-1003',
        channelLineItemId: 'TY-LN-2',
        barcode: '8680001092811',
        productCode: 'TY-KUL-001',
        title: 'Kablosuz ANC Bluetooth Kulaklık Pro V5.3 Siyah',
        quantity: 1,
        unitPrice: 1699.90,
        vatRate: 20,
        lineTotal: 1699.90,
        status: 'Active',
        virtualStock: 9,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&auto=format&fit=crop&q=80',
        itemDesi: 0.80,
        itemNote: 'Seri No: ANC-2026-8910 garantili kutu faturaya eşlendi.',
        mainProductId: 'mp-004',
        snapshots: [
          {
            id: 'snap-1003-1',
            orderItemId: 'item-1003-1',
            erpInventoryProductId: 'inv-003',
            componentProductCode: 'STK-KUL-01',
            componentBarcode: '8680001092811',
            componentTitle: 'Kablosuz ANC Bluetooth Kulaklık Pro V5.3',
            quantityPerPackage: 1,
            totalQuantityDeducted: 1,
            frozenBuyingCost: 850.00,
            frozenVatRate: 20,
            snapshotAtUtc: new Date(Date.now() - 120 * 60000).toISOString()
          }
        ]
      }
    ]
  },
  {
    id: 'ord-1004',
    storeId: 'store-n11-1',
    channel: 'n11',
    channelOrderNumber: 'N11-209418294',
    customerName: 'Selin Doğan',
    customerEmail: 'selin.d@gmail.com',
    customerPhone: '0530 111 22 33',
    shippingAddress: 'Gökçepınar Köyü Küme Evleri No:14',
    billingAddress: 'Gökçepınar Köyü Küme Evleri No:14',
    city: 'Çanakkale',
    district: 'Biga',
    status: 'Shipped',
    channelStatusRaw: 'Shipped',
    orderDateUtc: new Date(Date.now() - 180 * 60000).toISOString(),
    paymentType: 'MarketplaceCollection',
    grossAmount: 189.90,
    discountAmount: 0,
    cargoAmount: 0,
    totalAmount: 189.90,
    cargoProvider: 'Yurtiçi Kargo',
    cargoTrackingNumber: 'YK-4891029141',
    cargoBarcode: 'YK-N11-209418294',
    isExportedToErp: false,
    deliveryCityType: 'other_city',
    cargoSnapshot: {
      id: 'csnap-1004',
      orderId: 'ord-1004',
      selectedCargoProvider: 'Yurtiçi Kargo',
      originalProvider: 'Aras Kargo',
      wasProviderOverridden: true,
      overriddenReason: 'Müşteri adresi köy dağıtım alanında. Aras Kargo dağıtıma çıkmıyor, Yurtiçi Kargo tercih edildi.',
      estimatedDesi: 1.00,
      estimatedCargoFee: 24.00,
      appliedBaremCode: 'N11-YK-SUB200',
      frozenAtUtc: new Date(Date.now() - 180 * 60000).toISOString(),
      actualInvoicedDesi: 1.00,
      actualInvoicedFee: 24.00,
      discrepancyDesi: 0,
      discrepancyFee: 0,
      hasDiscrepancy: false
    },
    items: [
      {
        id: 'item-1004-1',
        orderId: 'ord-1004',
        channelLineItemId: 'N11-LN-1',
        barcode: '8680001001',
        productCode: 'STK-KOL-80',
        title: '80 Derece Limon Kolonyası 400ml Pet Şişe (2 Adet)',
        quantity: 2,
        unitPrice: 94.95,
        vatRate: 20,
        lineTotal: 189.90,
        status: 'Active',
        virtualStock: 42,
        imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=100&auto=format&fit=crop&q=80',
        itemDesi: 1.00,
        itemNote: 'Köy teslimatı: Yurtiçi Kargo şubesi haftada 2 gün ring yapıyor, müşteriye SMS iletildi.',
        mainProductId: 'mp-001',
        snapshots: [
          {
            id: 'snap-1004-1',
            orderItemId: 'item-1004-1',
            erpInventoryProductId: 'inv-001',
            componentProductCode: 'STK-KOL-80',
            componentBarcode: '8680001001',
            componentTitle: '80 Derece Limon Kolonyası 400ml Pet Şişe',
            quantityPerPackage: 1,
            totalQuantityDeducted: 2,
            frozenBuyingCost: 45.00,
            frozenVatRate: 20,
            snapshotAtUtc: new Date(Date.now() - 180 * 60000).toISOString()
          }
        ]
      }
    ]
  },
  {
    id: 'ord-1005',
    storeId: 'store-ty-1',
    channel: 'trendyol',
    channelOrderNumber: 'TY-773194012',
    customerName: 'Canan Güneş',
    customerEmail: 'canan.gunes@hotmail.com',
    customerPhone: '0535 999 88 77',
    shippingAddress: 'Batı Mah. Sahil Bulvarı No:45 D:12',
    billingAddress: 'Batı Mah. Sahil Bulvarı No:45 D:12',
    city: 'Bursa',
    district: 'Nilüfer',
    status: 'Delivered',
    channelStatusRaw: 'Delivered',
    orderDateUtc: new Date(Date.now() - 360 * 60000).toISOString(),
    paymentType: 'MarketplaceCollection',
    grossAmount: 139.90,
    discountAmount: 0,
    cargoAmount: 0,
    totalAmount: 139.90,
    cargoProvider: 'Trendyol Express',
    cargoTrackingNumber: '88410294124',
    cargoBarcode: 'TY-TEX-773194012',
    isExportedToErp: false,
    deliveryCityType: 'other_city',
    cargoSnapshot: {
      id: 'csnap-1005',
      orderId: 'ord-1005',
      selectedCargoProvider: 'Trendyol Express',
      estimatedDesi: 0.35,
      estimatedCargoFee: 9.00,
      appliedBaremCode: 'TY-TEX-10D-SUB150',
      frozenAtUtc: new Date(Date.now() - 360 * 60000).toISOString(),
      wasProviderOverridden: false,
      actualInvoicedDesi: 4.80,
      actualInvoicedFee: 39.50,
      discrepancyDesi: 4.45,
      discrepancyFee: 30.50,
      hasDiscrepancy: true,
      claimStatus: 'ClaimSubmitted'
    },
    items: [
      {
        id: 'item-1005-1',
        orderId: 'ord-1005',
        channelLineItemId: 'TY-LN-3',
        barcode: '8680001001',
        productCode: 'STK-KOL-80',
        title: '80 Derece Limon Kolonyası 400ml Tekli Şişe',
        quantity: 1,
        unitPrice: 139.90,
        vatRate: 20,
        lineTotal: 139.90,
        status: 'Active',
        imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=100&auto=format&fit=crop&q=80',
        itemDesi: 0.35,
        itemNote: 'Kargo Desi Uyuşmazlığı: Şube 4.80 desi fatura etti, itiraz dosyası açıldı.',
        mainProductId: 'mp-001',
        snapshots: [
          {
            id: 'snap-1005-1',
            orderItemId: 'item-1005-1',
            erpInventoryProductId: 'inv-001',
            componentProductCode: 'STK-KOL-80',
            componentBarcode: '8680001001',
            componentTitle: '80 Derece Limon Kolonyası 400ml Pet Şişe',
            quantityPerPackage: 1,
            totalQuantityDeducted: 1,
            frozenBuyingCost: 45.00,
            frozenVatRate: 20,
            snapshotAtUtc: new Date(Date.now() - 360 * 60000).toISOString()
          }
        ]
      }
    ]
  },
  {
    id: 'ord-1006',
    storeId: 'store-ty-1',
    channel: 'trendyol',
    channelOrderNumber: 'TY-109283719',
    customerName: 'Murat Aydın',
    customerEmail: 'murat.aydin@gmail.com',
    customerPhone: '0542 333 99 00',
    shippingAddress: 'Moda Cad. Caferağa Mah. No:22 D:5',
    billingAddress: 'Moda Cad. Caferağa Mah. No:22 D:5',
    city: 'İstanbul',
    district: 'Kadıköy',
    status: 'Cancelled',
    channelStatusRaw: 'CancelledBeforeShipment',
    orderDateUtc: new Date(Date.now() - 40 * 60000).toISOString(),
    paymentType: 'MarketplaceCollection',
    grossAmount: 349.00,
    discountAmount: 0,
    cargoAmount: 0,
    totalAmount: 349.00,
    cargoProvider: 'Trendyol Express',
    cargoBarcode: 'TY-TEX-109283719',
    isExportedToErp: false,
    deliveryCityType: 'istanbul_own_fleet',
    issueType: 'pre_shipment_cancel',
    issueNotes: 'Müşteri kargoya verilmeden önce vazgeçip iptal etti. Koli barkodunu durdurun, kuryeye vermeyin!',
    issueResolutionStatus: 'cancelled_stopped',
    items: [
      {
        id: 'item-1006-1',
        orderId: 'ord-1006',
        channelLineItemId: 'TY-LN-6',
        barcode: '8689990022',
        productCode: 'TY-SET-LUKSAHS',
        title: 'Lüks Ahşap Kapaklı Kolonya & Oda Kokusu Seti',
        quantity: 1,
        unitPrice: 349.00,
        vatRate: 20,
        lineTotal: 349.00,
        status: 'Cancelled',
        imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=100&auto=format&fit=crop&q=80',
        itemDesi: 1.10,
        itemNote: 'BLOKAJ: Sevkiyat iptal edildi, koli depoda ayrıldı ve barkod karantinaya alındı.',
        mainProductId: 'mp-003'
      }
    ]
  },
  {
    id: 'ord-1007',
    storeId: 'store-hb-1',
    channel: 'hepsiburada',
    channelOrderNumber: 'HB-8891024810',
    customerName: 'Zehra Çelik',
    customerEmail: 'zehra.celik@gmail.com',
    customerPhone: '0533 111 44 77',
    shippingAddress: 'Liman Mah. Boğaçayı Cad. No:19 D:4',
    billingAddress: 'Liman Mah. Boğaçayı Cad. No:19 D:4',
    city: 'Antalya',
    district: 'Konyaaltı',
    status: 'Returned',
    channelStatusRaw: 'ReturnRequested',
    orderDateUtc: new Date(Date.now() - 48 * 3600000).toISOString(),
    paymentType: 'MarketplaceCollection',
    grossAmount: 139.90,
    discountAmount: 0,
    cargoAmount: 0,
    totalAmount: 139.90,
    cargoProvider: 'HepsiJet',
    cargoTrackingNumber: 'HJ-RET-889102',
    cargoBarcode: 'HJ-8891024810-RET',
    isExportedToErp: false,
    deliveryCityType: 'other_city',
    issueType: 'return_requested',
    issueDisputeDeadline: '1 gün 14 saat kaldı',
    issueNotes: 'Müşteri "Koli ıslanmış ve şişe kırılmış" gerekçesiyle iade açtı. Kargo hasar tespit tutanağı Hepsiburada Destek Masasına yüklendi.',
    issueResolutionStatus: 'disputed',
    items: [
      {
        id: 'item-1007-1',
        orderId: 'ord-1007',
        channelLineItemId: 'HB-LN-7',
        barcode: '8680001001',
        productCode: 'STK-KOL-80',
        title: '80 Derece Limon Kolonyası 400ml Tekli Şişe',
        quantity: 1,
        unitPrice: 139.90,
        vatRate: 20,
        lineTotal: 139.90,
        status: 'Returned',
        imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=100&auto=format&fit=crop&q=80',
        itemDesi: 0.35,
        itemNote: 'İade Takibi: Kargo tazmin dilekçesi sisteme girildi, itiraz onay bekliyor.',
        mainProductId: 'mp-001'
      }
    ]
  },
  {
    id: 'ord-1008',
    storeId: 'store-ty-1',
    channel: 'trendyol',
    channelOrderNumber: 'TY-662910482',
    customerName: 'Mehmet Öz',
    customerEmail: 'mehmet.oz@trabzon.edu.tr',
    customerPhone: '0544 888 22 11',
    shippingAddress: 'Üniversite Mah. KTÜ Kampüsü Lojmanları C-3 D:8',
    billingAddress: 'Üniversite Mah. KTÜ Kampüsü Lojmanları C-3 D:8',
    city: 'Trabzon',
    district: 'Ortahisar',
    status: 'Problematic',
    channelStatusRaw: 'SupplyIssue',
    orderDateUtc: new Date(Date.now() - 30 * 60000).toISOString(),
    paymentType: 'MarketplaceCollection',
    grossAmount: 219.00,
    discountAmount: 0,
    cargoAmount: 0,
    totalAmount: 219.00,
    cargoProvider: 'Aras Kargo',
    cargoBarcode: 'ARAS-TY-662910482',
    isExportedToErp: false,
    deliveryCityType: 'other_city',
    issueType: 'supply_shortage',
    issueNotes: 'Tedarikçi cam şişe partisinde 2 gün gecikme bildirdi. Müşteriye alternatif ürün veya bekleme teyidi sorulacak.',
    issueResolutionStatus: 'investigating',
    items: [
      {
        id: 'item-1008-1',
        orderId: 'ord-1008',
        channelLineItemId: 'TY-LN-8',
        barcode: '8689990033',
        productCode: 'TY-CAM-LAV',
        title: 'Premium Lavanta Kolonyası Cam Şişe 200ml',
        quantity: 1,
        unitPrice: 219.00,
        vatRate: 20,
        lineTotal: 219.00,
        status: 'Active',
        imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=100&auto=format&fit=crop&q=80',
        itemDesi: 0.60,
        itemNote: 'Tedarik Karantinası: Fabrikadan cam ambalaj sevkiyatı yarın bekleniyor.',
        mainProductId: 'mp-001'
      }
    ]
  },
  {
    id: 'ord-1009',
    storeId: 'store-ty-1',
    channel: 'trendyol',
    channelOrderNumber: 'TY-330192849',
    customerName: 'Fatma Şahin',
    customerEmail: 'fatma.sahin@gmail.com',
    customerPhone: '0531 222 33 44',
    shippingAddress: 'Yıldız Mah. Çırağan Cad. No:34 D:2',
    billingAddress: 'Yıldız Mah. Çırağan Cad. No:34 D:2',
    city: 'İstanbul',
    district: 'Beşiktaş',
    status: 'Completed',
    channelStatusRaw: 'DeliveredAndCompleted',
    // Son 2 gün içinde tamamlanmış (Son 7 gün kuralına uygun - varsayılan olarak görünür)
    orderDateUtc: new Date(Date.now() - 48 * 3600000).toISOString(),
    paymentType: 'MarketplaceCollection',
    grossAmount: 94.95,
    discountAmount: 0,
    cargoAmount: 0,
    totalAmount: 94.95,
    cargoProvider: 'Trendyol Express',
    cargoTrackingNumber: '92810481029',
    cargoBarcode: 'TY-TEX-330192849',
    isExportedToErp: true,
    erpFicheNo: 'LOGO-FAT-2026-00412',
    deliveryCityType: 'istanbul_own_fleet',
    cargoSnapshot: {
      id: 'csnap-1009',
      orderId: 'ord-1009',
      selectedCargoProvider: 'Trendyol Express',
      estimatedDesi: 0.35,
      estimatedCargoFee: 9.00,
      appliedBaremCode: 'TY-TEX-10D-SUB150',
      frozenAtUtc: new Date(Date.now() - 48 * 3600000).toISOString(),
      wasProviderOverridden: false,
      actualInvoicedDesi: 0.35,
      actualInvoicedFee: 9.00,
      discrepancyDesi: 0,
      discrepancyFee: 0,
      hasDiscrepancy: false
    },
    items: [
      {
        id: 'item-1009-1',
        orderId: 'ord-1009',
        channelLineItemId: 'TY-LN-9',
        barcode: '8680001001',
        productCode: 'STK-KOL-80',
        title: '80 Derece Limon Kolonyası 400ml Tekli Şişe',
        quantity: 1,
        unitPrice: 94.95,
        vatRate: 20,
        lineTotal: 94.95,
        status: 'Active',
        imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=100&auto=format&fit=crop&q=80',
        itemDesi: 0.35,
        itemNote: 'Tamamlandı: Müşteri teslim aldı, 5 yıldızlı mağaza yorumu bıraktı.',
        mainProductId: 'mp-001'
      }
    ]
  },
  {
    id: 'ord-1010',
    storeId: 'store-ty-1',
    channel: 'trendyol',
    channelOrderNumber: 'TY-220194812',
    customerName: 'Hakan Vural',
    customerEmail: 'hakan.vural@gmail.com',
    customerPhone: '0533 777 88 99',
    shippingAddress: 'Kurtuluş Mah. Ziyapaşa Bulvarı No:18 D:6',
    billingAddress: 'Kurtuluş Mah. Ziyapaşa Bulvarı No:18 D:6',
    city: 'Adana',
    district: 'Seyhan',
    status: 'Completed',
    channelStatusRaw: 'DeliveredAndCompleted',
    // 16 gün önce tamamlanmış (Son 7 günden eski: varsayılan listede gizlenir, tarih aralığı seçilince listelenir!)
    orderDateUtc: new Date(Date.now() - 16 * 24 * 3600000).toISOString(),
    paymentType: 'MarketplaceCollection',
    grossAmount: 289.00,
    discountAmount: 0,
    cargoAmount: 0,
    totalAmount: 289.00,
    cargoProvider: 'Aras Kargo',
    cargoTrackingNumber: 'ARAS-910248102',
    cargoBarcode: 'ARAS-TY-220194812',
    isExportedToErp: true,
    erpFicheNo: 'LOGO-FAT-2026-00388',
    deliveryCityType: 'other_city',
    cargoSnapshot: {
      id: 'csnap-1010',
      orderId: 'ord-1010',
      selectedCargoProvider: 'Aras Kargo',
      estimatedDesi: 1.20,
      estimatedCargoFee: 28.00,
      appliedBaremCode: 'TY-ARAS-SUB300',
      frozenAtUtc: new Date(Date.now() - 16 * 24 * 3600000).toISOString(),
      wasProviderOverridden: false,
      actualInvoicedDesi: 1.20,
      actualInvoicedFee: 28.00,
      discrepancyDesi: 0,
      discrepancyFee: 0,
      hasDiscrepancy: false
    },
    items: [
      {
        id: 'item-1010-1',
        orderId: 'ord-1010',
        channelLineItemId: 'TY-LN-10',
        barcode: '8680001099120',
        productCode: 'STK-ZYT-01',
        title: 'Doğal Soğuk Sıkım Erken Hasat Zeytinyağı 1000ml',
        quantity: 1,
        unitPrice: 289.00,
        vatRate: 1,
        lineTotal: 289.00,
        status: 'Active',
        imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100&auto=format&fit=crop&q=80',
        itemDesi: 1.20,
        itemNote: 'Eski Sipariş: Arşiv faturası Logo Tiger üzerinden kapatıldı.',
        mainProductId: 'mp-001'
      }
    ]
  }
];

// Ham Veri (Raw JSON) ile Zenginleştirilmiş Siparişler
export const INITIAL_ORDERS: Order[] = BASE_ORDERS.map(o => ({
  ...o,
  ...RawPayloadGenerator.generateOrderRawPayload(o)
}));

export const INITIAL_QUESTIONS: CustomerQuestion[] = [
  {
    id: 'q-201',
    storeId: 'store-ty-1',
    channel: 'trendyol',
    channelQuestionId: 'TY-Q-99481',
    productTitle: '80 Derece Limon Kolonyası 4lü Avantaj Paketi (4 x 400ml)',
    productBarcode: '8689990004',
    customerDisplayName: 'S*** T***',
    questionText: 'Merhaba, 4 adet ürün tek koli içinde mi geliyor ayrı ayrı mı paketleniyor? Dökülme kırılma riski var mı?',
    questionDateUtc: new Date(Date.now() - 45 * 60000).toISOString(),
    slaDeadlineUtc: new Date(Date.now() + 75 * 60000).toISOString(),
    status: 'WaitingAnswer'
  },
  {
    id: 'q-202',
    storeId: 'store-hb-1',
    channel: 'hepsiburada',
    channelQuestionId: 'HB-Q-10492',
    productTitle: 'Ferahlık Paketi: 5 Adet Kolonya ve Islak Mendil',
    productBarcode: 'HB-5K1M-HIJYEN',
    customerDisplayName: 'Mert K.',
    questionText: 'Mendiller alkollü mü kokulu mu acaba? Hediye paketi yapabiliyor musunuz?',
    questionDateUtc: new Date(Date.now() - 15 * 60000).toISOString(),
    slaDeadlineUtc: new Date(Date.now() + 165 * 60000).toISOString(),
    status: 'WaitingAnswer'
  }
];

const BASE_SETTLEMENTS: SettlementReport[] = [
  {
    id: 'set-001',
    storeId: 'store-ty-1',
    channel: 'trendyol',
    periodCode: 'TY-2026-W14-A',
    startDateUtc: '2026-03-24T00:00:00Z',
    endDateUtc: '2026-03-31T23:59:59Z',
    paymentDueDateUtc: '2026-04-14T00:00:00Z',
    totalSalesAmount: 184500.00,
    totalCommissionAmount: 35055.00,
    totalCargoFeeAmount: 7850.00,
    totalPenaltyOrDiscount: 620.00,
    netPayoutAmount: 140975.00,
    status: 'Reconciled',
    items: [
      {
        id: 's-item-1',
        settlementReportId: 'set-001',
        orderNumber: 'TY-849102941',
        transactionType: 'Sale',
        amount: 339.90,
        transactionDateUtc: '2026-03-25T11:20:00Z',
        description: '4lü Kolonya Avantaj Paketi Satışı'
      },
      {
        id: 's-item-2',
        settlementReportId: 'set-001',
        orderNumber: 'TY-849102941',
        transactionType: 'Commission',
        amount: -64.58,
        transactionDateUtc: '2026-03-25T11:20:00Z',
        description: 'Trendyol Kategori Komisyonu (%19.0)'
      }
    ]
  }
];

// Ham Veri (Raw JSON) ile Zenginleştirilmiş Hakediş Raporları
export const INITIAL_SETTLEMENTS: SettlementReport[] = BASE_SETTLEMENTS.map(s => ({
  ...s,
  ...RawPayloadGenerator.generateSettlementRawPayload(s)
}));

export const INITIAL_SYNC_LOGS: SyncLog[] = [
  {
    id: 'log-101',
    storeId: 'store-ty-1',
    storeName: 'Trendyol Ana Mağaza',
    channel: 'trendyol',
    timestampUtc: new Date(Date.now() - 3 * 60000).toISOString(),
    module: 'Orders',
    status: 'Success',
    fetchedCount: 1,
    processedCount: 1,
    errorCount: 0,
    durationMs: 412,
    details: 'Yeni sipariş alındı: TY-849102941. Reçete donduruldu (4x STK-KOL-80) ve stok rezervi işlendi.'
  },
  {
    id: 'log-102',
    storeId: 'store-ty-1',
    storeName: 'Trendyol Ana Mağaza',
    channel: 'trendyol',
    timestampUtc: new Date(Date.now() - 5 * 60000).toISOString(),
    module: 'Inventory',
    status: 'Success',
    fetchedCount: 3,
    processedCount: 3,
    errorCount: 0,
    durationMs: 310,
    details: 'Kolonya stoğu değişti. Bağlı tüm 4lü ve 5li paketlerin sanal stokları (86 ve 107 paket) 8 kanala itildi.'
  }
];

export const INITIAL_USER: UserSession = {
  id: 'usr-001',
  username: 'admin.operasyon',
  fullName: 'Kerem Yurtseven',
  email: 'kerem@eticaret-merkezi.com',
  role: 'Admin',
  jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3ItMDAxIiwicm9sZSI6IkFkbWluIiwiZXhwIjoxNzg0NDI5MTIwfQ.signature_ok',
  expiresUtc: new Date(Date.now() + 24 * 3600 * 1000).toISOString()
};
