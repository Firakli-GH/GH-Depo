/**
 * Gerçek Türkiye Pazaryeri API Yanıt Veri Şemaları (Vendor Response DTOs)
 * Resmi Trendyol, Hepsiburada, N11, PttAVM, Pazarama, İdefix, Ticimax ve Wix belgelerine uygun şemalar.
 */

// ============================================================================
// 1. TRENDYOL TEDARİKÇİ SİPARİŞ & ÜRÜN API DTO (V2)
// ============================================================================
export interface TrendyolAddress {
  id?: number;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  cityCode?: number;
  district: string;
  districtId?: number;
  postalCode?: string;
  countryCode: string;
  neighborhoodId?: number;
  neighborhood?: string;
  phone?: string;
  fullAddress: string;
}

export interface TrendyolOrderLine {
  id: number;
  sku: string;
  barcode: string;
  productName: string;
  productCode?: number;
  merchantSku: string;
  quantity: number;
  price: number;
  amount: number;
  discount: number;
  tyDiscount: number;
  vatBaseAmount: number;
  salesCampaignId?: number;
  currencyCode: 'TRY' | 'USD' | 'EUR';
  orderLineItemStatusName: string; // 'Created', 'Picking', 'Invoiced', 'Shipped', 'Delivered'
}

export interface TrendyolOrderPackage {
  id: number; // Shipment package id
  orderNumber: string; // Trendyol sipariş numarası (örn: 9283746101)
  grossAmount: number;
  totalDiscount: number;
  totalPrice: number;
  customerFirstName: string;
  customerLastName: string;
  customerId: number;
  customerEmail: string;
  cargoTrackingNumber: number | string;
  cargoTrackingLink?: string;
  cargoProviderName: string; // 'Trendyol Express', 'Aras Kargo', vb.
  shipmentPackageStatus: 'Created' | 'Picking' | 'Invoiced' | 'Shipped' | 'Delivered' | 'UnDelivered' | 'Cancelled' | 'Returned';
  orderDate: number; // Unix timestamp ms
  tcIdentityNumber?: string;
  taxNumber?: string;
  taxOffice?: string;
  deliveryType: 'FastDelivery' | 'Normal' | 'SameDay';
  originShipmentDate?: number;
  estimatedDeliveryStartDate?: number;
  estimatedDeliveryEndDate?: number;
  shipmentAddress: TrendyolAddress;
  invoiceAddress: TrendyolAddress;
  lines: TrendyolOrderLine[];
}

export interface TrendyolOrdersResponse {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  content: TrendyolOrderPackage[];
}

export interface TrendyolProductListingPayload {
  barcode: string;
  title: string;
  productMainId: string;
  brandId: number;
  categoryId: number;
  quantity: number;
  stockCode: string;
  dimensionalWeight: number;
  description: string;
  currencyType: 'TRY';
  listPrice: number;
  salePrice: number;
  vatRate: number;
  cargoCompanyId: number;
  images: { url: string }[];
  attributes: { attributeId: number; attributeValueId?: number; customAttributeValue?: string }[];
}

// ============================================================================
// 2. HEPSİBURADA MERCHANT / OMS SİPARİŞ & ÜRÜN DTO
// ============================================================================
export interface HepsiburadaPrice {
  amount: number;
  currency: 'TRY' | 'USD' | 'EUR';
}

export interface HepsiburadaRecipient {
  name: string;
  addressDetail: string;
  city: string;
  town: string;
  district?: string;
  phoneNumber: string;
  email?: string;
}

export interface HepsiburadaOrderItem {
  id: string; // lineItemId
  orderId?: string;
  sku: string; // Hepsiburada SKU
  merchantSku: string; // Satıcı stok kodu
  barcode: string;
  productName: string;
  quantity: number;
  price: HepsiburadaPrice;
  vat: number;
  totalPrice: HepsiburadaPrice;
  commission: HepsiburadaPrice;
  status: string;
  cargoCompanyModel: {
    id: number;
    name: string;
    shortCode: string;
  };
}

export interface HepsiburadaOrderPackage {
  id: string; // packageNumber
  orderNumber: string; // Hepsiburada sipariş numarası
  orderDate: string; // ISO 8601
  status: 'Open' | 'InPicking' | 'Billed' | 'Shipped' | 'Delivered' | 'UnDelivered' | 'Cancelled';
  totalPrice: HepsiburadaPrice;
  unitPrice?: HepsiburadaPrice;
  customer: {
    customerId: string;
    name: string;
  };
  recipient: HepsiburadaRecipient;
  invoiceAddress: {
    address: string;
    city: string;
    town: string;
    taxNumber?: string;
    taxOffice?: string;
  };
  shippingAddress: HepsiburadaRecipient;
  cargoCompany: {
    id: number;
    name: string; // 'HepsiJet', 'Yurtiçi Kargo'
    shortCode: string;
  };
  barcode: string; // HB Kargo Takip Barkodu
  trackingNumber: string;
  items: HepsiburadaOrderItem[];
}

// ============================================================================
// 3. N11 ORDER SERVICE (SOAP / REST DETAILED ORDER DTO)
// ============================================================================
export interface N11Buyer {
  id: number;
  fullName: string;
  email: string;
  tcId?: string;
  taxId?: string;
  taxOffice?: string;
  phoneNumber: string;
}

export interface N11Address {
  address: string;
  city: string;
  district: string;
  postalCode?: string;
  fullName: string;
  gsm: string;
}

export interface N11OrderItem {
  id: number;
  productId: number;
  productName: string;
  sellerStockCode: string;
  sellerStockBarcode: string;
  quantity: number;
  price: number;
  sellerDiscount: number;
  mallDiscount: number;
  dueAmount: number;
  shipmentCompany: string; // 'Yurtiçi Kargo', 'Sürat Kargo'
  trackingNumber?: string;
  orderItemStatus: 'Approved' | 'Shipped' | 'Delivered' | 'Completed' | 'Rejected' | 'Cancelled';
  customText?: string;
}

export interface N11DetailedOrder {
  id: number;
  orderNumber: string;
  createDate: string; // 'DD/MM/YYYY HH:mm:ss'
  status: 'Approved' | 'Shipped' | 'Delivered' | 'Completed' | 'Cancelled';
  paymentType: 'CREDIT_CARD' | 'BKM_EXPRESS' | 'BANK_TRANSFER';
  citizenshipId?: string;
  totalAmount: number;
  billingAddress: N11Address;
  shippingAddress: N11Address;
  buyer: N11Buyer;
  itemList: N11OrderItem[];
}

// ============================================================================
// 4. PTTAVM SİPARİŞ SERVİSİ DTO
// ============================================================================
export interface PttAvmItem {
  UrunKodu: string;
  Barkod: string;
  UrunAdi: string;
  Miktar: number;
  BirimFiyat: number;
  ToplamFiyat: number;
  KdvOrani: number;
  Durum: string;
}

export interface PttAvmOrder {
  SiparisKodu: string;
  SiparisTarihi: string;
  Durum: string;
  MusteriAdi: string;
  MusteriSoyadi: string;
  MusteriTelefon: string;
  MusteriEmail: string;
  TeslimatAdresi: string;
  TeslimatSehir: string;
  TeslimatIlce: string;
  FaturaAdresi: string;
  FaturaSehir: string;
  VergiNo?: string;
  VergiDairesi?: string;
  KargoSirketi: string; // 'PTT Kargo'
  KargoBarkod: string;
  KargoTakipNo: string;
  ToplamTutar: number;
  Urunler: PttAvmItem[];
}

// ============================================================================
// 5. PAZARAMA SİPARİŞ REST DTO
// ============================================================================
export interface PazaramaOrderItem {
  orderItemId: string;
  code: string;
  barcode: string;
  name: string;
  quantity: number;
  listPrice: number;
  salePrice: number;
  vatRate: number;
  itemStatus: string;
}

export interface PazaramaOrder {
  orderId: string;
  orderCode: string;
  orderDate: string;
  orderStatus: string;
  buyer: {
    fullName: string;
    email: string;
    phone: string;
    identityNumber?: string;
  };
  deliveryAddress: {
    addressText: string;
    city: string;
    district: string;
  };
  billingAddress: {
    addressText: string;
    city: string;
    district: string;
    taxNumber?: string;
  };
  cargoProviderName: string;
  cargoTrackingNumber: string;
  shipmentBarcode: string;
  totalAmount: number;
  items: PazaramaOrderItem[];
}

// ============================================================================
// 6. İDEFİX / MIRAKL API DTO
// ============================================================================
export interface IdefixOrderLine {
  order_line_id: string;
  offer_sku: string;
  product_title: string;
  quantity: number;
  price: number;
  total_price: number;
  shipping_tracking_reference?: string;
  status: string;
}

export interface IdefixOrder {
  order_id: string;
  created_date: string;
  order_state: string;
  customer: {
    firstname: string;
    lastname: string;
    email: string;
  };
  shipping_address: {
    street_1: string;
    city: string;
    zip_code: string;
    country: string;
    phone: string;
  };
  total_price: number;
  shipping_carrier_code: string;
  lines: IdefixOrderLine[];
}

// ============================================================================
// 7. GENEL HAM VERİ VE ALAN EŞLEME MODELİ
// ============================================================================
export interface FieldMappingEntry {
  rawPath: string;           // 'lines[0].merchantSku'
  erpTarget: string;         // 'item.productCode'
  rawValue: any;             // 'STK-KOL-80'
  mappedValue: any;          // 'STK-KOL-80'
  status: 'matched' | 'default' | 'calculated';
  notes?: string;
}
