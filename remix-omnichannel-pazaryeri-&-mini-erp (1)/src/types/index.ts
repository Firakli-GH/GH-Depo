export * from './marketplaceSchemas';
export * from './categoryBrand';

export type MarketplaceChannel = 
  | 'trendyol'
  | 'hepsiburada'
  | 'n11'
  | 'pttavm'
  | 'pazarama'
  | 'idefix'
  | 'wix'
  | 'ticimax';

export interface ChannelMeta {
  id: MarketplaceChannel;
  name: string;
  type: 'marketplace' | 'ecommerce';
  color: string;
  badgeBg: string;
  badgeText: string;
  iconName: string;
  apiUrl: string;
  docUrl: string;
}

export interface StoreAccount {
  id: string;
  storeName: string;
  channel: MarketplaceChannel;
  sellerId: string;
  supplierId?: string;
  apiKey: string;
  apiSecret: string;
  storeUrl?: string;
  isActive: boolean;
  syncIntervalMinutes: number;
  lastOrderSyncUtc: string | null;
  lastProductSyncUtc: string | null;
  lastQuestionSyncUtc: string | null;
  connectionStatus: 'connected' | 'error' | 'testing';
  lastError?: string;
}

// =========================================================================
// 1. KADEME: MİNİ ERP FİZİKİ DEPO STOK ÜRÜNÜ (INVENTORY ITEM)
// =========================================================================
export interface ErpInventoryProduct {
  id: string;
  productCode: string;          // STK-KOL-80 (Logo / ERP Stok Kodu)
  barcode: string;              // 8680001001 (Orijinal Üretici EAN)
  title: string;                // 80 Derece Limon Kolonyası 400ml
  brand: string;                // Marmara / Eyüp Sabri
  category: string;             // Kozmetik > Kolonya
  buyingPrice: number;          // Birim Alış Maliyeti (45.00 TL)
  vatRate: number;              // KDV Oranı (20, 10, vb.)
  physicalStockQuantity: number;// Fiili Depo Sayım Stoğu (450 adet)
  reservedQuantity: number;     // Bekleyen sipariş rezervi (20 adet)
  availableQuantity: number;    // Satılabilir Net Stok (430 adet)
  unitDesi: number;             // 1 adedin desisi (örn: 0.35 desi)
  leadTimeDays: number;         // Tedarik/Temin süresi (gün)
  updatedAtUtc: string;
}

// =========================================================================
// 2. KADEME: ANA ÜRÜN (MAIN PRODUCT - KATALOG & PAKET REÇETESİ)
// =========================================================================
export type ProductKind = 'Single' | 'MultiUnitBundle' | 'CompositeKit';

export interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface MainProductBundleRecipeItem {
  id: string;
  mainProductId: string;
  erpInventoryProductId: string;
  quantity: number;             // Bu ana üründe kaç adet var? (Örn: 5 adet Kolonya)
  componentTitle?: string;
  componentCode?: string;
  componentBarcode?: string;
  unitBuyingPrice?: number;
  unitDesi?: number;
}

export interface MainProduct {
  id: string;
  masterProductCode: string;    // MP-SET-5K1M
  masterBarcode: string;        // 8689990011 (Merkezi Barkod)
  title: string;                // 5li Limon Kolonyası + 1 Islak Mendil Avantaj Seti
  description: string;          // Ayrıntılı ürün açıklaması ve özellikleri
  kind: ProductKind;            // 'Single' | 'MultiUnitBundle' | 'CompositeKit'
  mainCategory: string;         // Kozmetik & Kişisel Bakım
  subCategory: string;          // Hijyen Paketleri
  targetProfitMargin: number;   // Öngörülen kâr marjı (%35)

  // Desi Yönetimi
  calculatedDesi: number;       // Reçetedeki bileşenlerden hesaplanan toplam desi
  manualDesi: number;           // Operatörün koli bazında girdiği sevk desisi

  // Termin Yönetimi
  calculatedLeadTimeDays: number;// Bileşenlerin tedarik terminlerinden hesaplanan
  manualLeadTimeDays: number;    // Girilen kargoya verme taahhüt süresi (gün)

  // Finans & Sanal Stok (Dinamik Hesaplanır)
  calculatedTotalCost: number;  // Reçetedeki bileşenlerin toplam alış maliyeti
  calculatedVirtualStock: number;// Bileşen stoklarının minimumundan türetilen sanal stok

  // İlişkiler
  images: ProductImage[];
  recipeItems: MainProductBundleRecipeItem[];
  listings: ChannelListingProduct[];

  // Merkezi Kategori & Marka Bağlantısı
  masterCategoryId?: string;
  masterBrandId?: string;

  // Pazaryeri Ek Bilgileri ve Nitelik Değerleri (Attributes)
  marketplaceAttributes?: Record<string, Record<string | number, any>>;

  updatedAtUtc: string;
}

// =========================================================================
// 3. KADEME: PAZARYERİ ÇOKLU İLANLARI (CHANNEL LISTINGS - 1:N MULTI-LISTING)
// =========================================================================
export interface ChannelListingProduct {
  id: string;
  mainProductId: string;        // Bağlı olduğu Ana Ürün (MainProduct)
  storeAccountId: string;       // İlanın yayınlandığı mağaza hesabı
  channel: MarketplaceChannel;  // 'trendyol', 'hepsiburada', 'n11', vb.
  
  // Sahte / Özel / Alternatif Barkod ve Başlık Desteği
  listingBarcode: string;       // TY-FAK-990012 veya 8689990011 (Klon İlan Barkodu)
  listingSku: string;           // TY-SKU-SET-5K1M
  channelListingTitle: string;  // Kanala özel arama optimizasyonlu başlık
  channelListingDescription: string; // Kanala özel açıklama
  
  salePrice: number;            // Kanaldaki satış fiyatı (TL)
  specialCampaignPrice?: number;// Kampanyalı fiyat
  commissionRate: number;       // Pazar yeri komisyon oranı (%)
  isActive: boolean;
  syncStatus: 'Synced' | 'Pending' | 'Error';
  lastSyncUtc: string;
  lastError?: string;

  // Ham Pazaryeri Dönüş Verisi (Raw Payload)
  rawPayloadJson?: string;
  rawPayload?: Record<string, any>;
}

// =========================================================================
// KARGO DESİ & BAREM TARİFE SİSTEMİ
// =========================================================================
export interface CargoTierRate {
  id: string;
  channel: MarketplaceChannel;     // 'trendyol', 'hepsiburada', vb.
  cargoProvider: string;           // 'Trendyol Express', 'Aras Kargo', 'HepsiJet', 'PTT Kargo'
  tierName: string;                // 'Barem 1 (≤150 TL)', 'Standart Tarife (300+ TL)'
  minCartPrice: number;            // Minimum sepet tutarı (TL)
  maxCartPrice: number;            // Maksimum sepet tutarı (TL)
  minDesi: number;                 // Minimum desi (örn: 0)
  maxDesi: number;                 // Maksimum desi (örn: 9.99)
  sellerCargoFee: number;          // Satıcıya faturalandırılan kargo ücreti (TL)
  isMarketplaceSubsidized: boolean;// Pazaryeri desteği var mı?
  validFromUtc: string;
}

export interface OrderCargoSnapshot {
  id: string;
  orderId: string;
  selectedCargoProvider: string;   // Sipariş anında belirlenen kargo firması
  estimatedDesi: number;           // Hesaplanan / girilen koli desisi (örn: 2.00 desi)
  estimatedCargoFee: number;       // Formüle göre öngörülen kargo ücreti (örn: 9.00 TL)
  appliedBaremCode: string;         // 'TY-0-150-TEX'
  frozenAtUtc: string;
  
  // Operatör kargo değişikliği
  wasProviderOverridden: boolean;
  overriddenReason?: string;
  originalProvider?: string;

  // Pazaryeri Dönüş & Fatura Değerleri (Reel / Actual)
  actualInvoicedDesi?: number;     // Kargo şubesinin girdiği gerçek desi (örn: 3.50 desi)
  actualInvoicedFee?: number;      // Pazaryerinin kestiği reel kargo bedeli (örn: 24.50 TL)
  discrepancyFee: number;          // Fark: actualInvoicedFee - estimatedCargoFee (+15.50 TL)
  discrepancyDesi: number;         // Desi Farkı: actualInvoicedDesi - estimatedDesi (+1.50 d)
  hasDiscrepancy: boolean;         // Uyuşmazlık bayrağı
  claimStatus?: 'PendingClaim' | 'ClaimSubmitted' | 'Resolved' | 'Rejected';
}

export interface CargoProviderShare {
  provider: string;
  sharePercentage: number; // e.g. 70 (%)
  unitFee: number;         // e.g. 9.00 (TL)
}

export interface PricingFormulaSimulation {
  buyingCost: number;
  profitMarginRate: number;      // e.g. 0.35 (35%)
  costWithProfit: number;        // buyingCost * (1 + profitMarginRate)
  cargoFee: number;              // e.g. 12.30
  marketplaceCommissionRate: number; // e.g. 0.19 (19%)
  calculatedSalePrice: number;   // (costWithProfit + cargoFee) / (1 - commissionRate)
  effectiveNetProfit: number;
  selectedBaremTier?: CargoTierRate;
}


// =========================================================================
// SİPARİŞ ANI DONDURULMUŞ REÇETE (BOM SNAPSHOT)
// =========================================================================
export interface OrderItemComponentSnapshot {
  id: string;
  orderItemId: string;
  erpInventoryProductId: string;
  componentProductCode: string; // STK-KOL-80
  componentBarcode: string;     // 8680001001
  componentTitle: string;       // 80 Derece Limon Kolonyası 400ml
  quantityPerPackage: number;   // 1 paketteki miktar (örn: 5)
  totalQuantityDeducted: number;// Siparişteki toplam düşülen fiziki adet (Miktar * Paket Adedi)
  frozenBuyingCost: number;     // Sipariş anındaki alış maliyeti
  frozenVatRate: number;        // Sipariş anındaki KDV oranı
  snapshotAtUtc: string;        // Dondurulma zamanı
}

export interface OrderItemNote {
  id: string;
  itemId: string;
  author: string;
  content: string;
  category: 'supply' | 'cargo' | 'return' | 'general';
  createdAt: string;
}

export type OrderStatus = 
  | 'Created'      // Yeni Sipariş
  | 'Approved'     // Onaylandı
  | 'Picking'      // Hazırlanıyor / Toplanıyor
  | 'Invoiced'     // Faturalandı
  | 'Shipped'      // Kargoya Verildi
  | 'Delivered'    // Teslim Edildi
  | 'Completed'    // Tamamlandı
  | 'Problematic'  // Sorunluya Alındı (Teslim edilemeyen / tedarik aksayan)
  | 'Cancelled'    // İptal Edildi
  | 'Returned';    // İade

export interface OrderItem {
  id: string;
  orderId: string;
  channelLineItemId: string;
  barcode: string;              // Satılan pazaryeri barkodu (Örn: TY-FAK-990012)
  productCode: string;          // Ana Ürün veya İlan SKU
  title: string;                // Satılan ürün/paket başlığı
  quantity: number;
  unitPrice: number;
  vatRate: number;
  lineTotal: number;
  status: 'Active' | 'Cancelled' | 'Returned';
  imageUrl?: string;            // Mini ürün görseli (thumbnail)
  itemDesi?: number;            // Kalem bazlı tahmini desi
  itemNote?: string;            // Kalem altında doğrudan görünen alt bilgi notu
  virtualStock?: number;        // Güncel sanal stok (Yeni/Onaylı siparişlerde kritik stok takibi için)
  notesHistory?: OrderItemNote[]; // Geçmiş notlar listesi
  
  // Dondurulmuş Reçete (BOM Snapshot - Sadece detay ekranında açılır)
  mainProductId?: string;
  snapshots?: OrderItemComponentSnapshot[];
}

export interface Order {
  id: string;
  storeId: string;
  channel: MarketplaceChannel;
  channelOrderNumber: string;
  customerName: string;
  customerTaxNoOrId?: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  billingAddress: string;
  city: string;
  district: string;
  status: OrderStatus;
  channelStatusRaw: string;
  orderDateUtc: string;
  paymentType: 'MarketplaceCollection' | 'CreditCard' | 'BankTransfer';
  grossAmount: number;
  discountAmount: number;
  cargoAmount: number;
  totalAmount: number;
  cargoProvider: string;
  cargoTrackingNumber?: string;
  cargoBarcode: string;
  isExportedToErp: boolean;
  erpFicheNo?: string;
  items: OrderItem[];
  
  // Müşteri Özel Mesajı / Notu
  customerMessage?: string;

  // Aynı Müşteriye Ait Çoklu Sipariş Bildirimi (Ayrı Barkod Uyarısı)
  hasMultipleOrdersForCustomer?: boolean;
  relatedOrderNumbers?: string[];

  // İl ve Yerel Rota Dağıtım Bilgisi (İstanbul vb.)
  deliveryCityType?: 'istanbul_own_fleet' | 'other_city';

  // Sorunlular Masası Parametreleri
  issueType?: 'pre_shipment_cancel' | 'delivery_failed' | 'return_requested' | 'supply_shortage' | 'manual_flag';
  issueNotes?: string;
  issueDisputeDeadline?: string;
  issueResolutionStatus?: 'investigating' | 'disputed' | 'cancelled_stopped' | 'resolved';

  // Dondurulmuş Kargo Parametreleri ve Fatura Mutabakatı
  cargoSnapshot?: OrderCargoSnapshot;

  // Ham Pazaryeri Yanıt Verisi (Raw Payload - Veri kaybını önleme ve denetim)
  rawPayloadJson?: string;
  rawPayload?: Record<string, any>;
}

export type QuestionStatus = 'WaitingAnswer' | 'Answered' | 'Rejected' | 'Expired';

export interface CustomerQuestion {
  id: string;
  storeId: string;
  channel: MarketplaceChannel;
  channelQuestionId: string;
  productTitle: string;
  productBarcode: string;
  customerDisplayName: string;
  questionText: string;
  questionDateUtc: string;
  slaDeadlineUtc: string;
  status: QuestionStatus;
  answerText?: string;
  answeredAtUtc?: string;
  answeredBy?: string;
  rawPayloadJson?: string;
  rawPayload?: Record<string, any>;
}

export interface SettlementItem {
  id: string;
  settlementReportId: string;
  orderNumber?: string;
  transactionType: 'Sale' | 'Commission' | 'CargoFee' | 'Penalty' | 'ReturnDeduction' | 'Advertising';
  amount: number;
  transactionDateUtc: string;
  description: string;
}

export interface SettlementReport {
  id: string;
  storeId: string;
  channel: MarketplaceChannel;
  periodCode: string;
  startDateUtc: string;
  endDateUtc: string;
  paymentDueDateUtc: string;
  totalSalesAmount: number;
  totalCommissionAmount: number;
  totalCargoFeeAmount: number;
  totalPenaltyOrDiscount: number;
  netPayoutAmount: number;
  status: 'Reconciled' | 'DiscrepancyFound' | 'Pending';
  discrepancyNote?: string;
  items: SettlementItem[];
  rawPayloadJson?: string;
  rawPayload?: Record<string, any>;
}

export interface SyncLog {
  id: string;
  storeId?: string;
  storeName?: string;
  channel?: MarketplaceChannel;
  timestampUtc: string;
  module: 'Orders' | 'Inventory' | 'Questions' | 'Settlements' | 'Cargo';
  status: 'Success' | 'PartialSuccess' | 'Failed' | 'Warning';
  fetchedCount: number;
  processedCount: number;
  errorCount: number;
  durationMs: number;
  details: string;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  entity: string;
  entityId: string;
  timestampUtc: string;
  diffSummary: string;
}

export type UserRole = 'Admin' | 'Operator' | 'Finance' | 'CustomerService';

export interface UserSession {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  jwtToken: string;
  expiresUtc: string;
}

export interface WorkerStatus {
  isRunning: boolean;
  isPaused: boolean;
  lastExecutionUtc: string | null;
  nextExecutionUtc: string | null;
  activeJobsCount: number;
  ordersIntervalSec: number;
  inventoryIntervalSec: number;
  questionsIntervalSec: number;
  settlementIntervalSec: number;
}

// Legacy compatibility
export interface ProductListingLegacy {
  id: string;
  storeId: string;
  channel: MarketplaceChannel;
  channelListingId: string;
  listingBarcode: string;
  salePrice: number;
  specialPrice?: number;
  commissionRate: number;
  syncStatus: 'synced' | 'pending' | 'error';
  lastSyncUtc: string;
  lastError?: string;
}

export interface Product {
  id: string;
  productCode: string;
  barcode: string;
  title: string;
  brand: string;
  category: string;
  vatRate: number;
  currency: 'TRY' | 'USD' | 'EUR';
  buyingPrice: number;
  stockQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  createdAtUtc: string;
  updatedAtUtc: string;
  channelListings: ProductListingLegacy[];
}
