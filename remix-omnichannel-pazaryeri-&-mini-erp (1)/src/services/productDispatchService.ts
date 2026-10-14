import { 
  MainProduct, 
  ChannelListingProduct, 
  MarketplaceChannel, 
  StoreAccount,
  CategoryMarketplaceMapping,
  BrandMarketplaceMapping,
  ProductReadinessReport,
  ProductDispatchBatchItem,
  CategoryAttributeDefinition
} from '../types';
import { RawPayloadGenerator } from '../utils/rawPayloadGenerator';

export class ProductDispatchService {
  /**
   * Ürünün seçilen pazaryeri için yayınlanabilirlik durumunu ve eksiklerini hesaplar
   */
  static calculateReadiness(
    product: MainProduct,
    channel: MarketplaceChannel,
    categoryMappings: CategoryMarketplaceMapping[],
    brandMappings: BrandMarketplaceMapping[]
  ): ProductReadinessReport {
    const missingFields: string[] = [];
    const missingMandatoryAttributes: CategoryAttributeDefinition[] = [];
    const warnings: string[] = [];
    let points = 0;
    const maxPoints = 5;

    // 1. Temel Ürün Bilgileri (Barkod, Başlık, Resim)
    if (product.masterBarcode && product.masterBarcode.trim().length >= 8) {
      points += 1;
    } else {
      missingFields.push('Merkezi EAN / Barkod Eksik');
    }

    if (product.title && product.title.trim().length > 5) {
      points += 1;
    } else {
      missingFields.push('Ürün Başlığı Yetersiz');
    }

    if (product.images && product.images.length > 0) {
      points += 1;
    } else {
      missingFields.push('Ürün Görseli (En az 1 adet) Eksik');
    }

    // 2. Kategori Eşleme Kontrolü
    const catMap = categoryMappings.find(
      m => m.masterCategoryId === product.masterCategoryId && m.channel === channel
    );

    if (catMap) {
      points += 1;

      // Zorunlu Nitelikler Kontrolü
      const productAttrs = product.marketplaceAttributes?.[channel] || {};
      const mandAttrs = catMap.mandatoryAttributes || [];
      for (const reqAttr of mandAttrs) {
        if (reqAttr && reqAttr.required) {
          const val = productAttrs[reqAttr.attributeId] || productAttrs[reqAttr.code];
          if (!val) {
            missingMandatoryAttributes.push(reqAttr);
          }
        }
      }
    } else {
      missingFields.push(`${channel.toUpperCase()} Kategori Eşleşmesi Yapılmamış`);
    }

    // 3. Marka Eşleme Kontrolü
    const brdMap = brandMappings.find(
      m => m.masterBrandId === product.masterBrandId && m.channel === channel
    );

    if (brdMap) {
      points += 1;
    } else {
      missingFields.push(`${channel.toUpperCase()} Marka Eşleşmesi Yapılmamış`);
    }

    // Nitelik eksikleri varsa puan düşür
    if (missingMandatoryAttributes.length > 0) {
      missingFields.push(`${missingMandatoryAttributes.length} Adet Zorunlu Nitelik (Attribute) Eksik`);
    }

    const calculatedScore = Math.max(
      10,
      Math.round(((points / maxPoints) * 100) - (missingMandatoryAttributes.length * 15))
    );

    return {
      productId: product.id,
      channel,
      isReady: missingFields.length === 0 && missingMandatoryAttributes.length === 0,
      score: Math.min(100, Math.max(0, calculatedScore)),
      missingFields,
      missingMandatoryAttributes,
      warnings
    };
  }

  /**
   * Seçilen ürünleri pazaryerine toplu (Batch) olarak gönderir ve ilan kayıtlarını oluşturur/günceller
   */
  static async dispatchBatch(
    products: MainProduct[],
    channel: MarketplaceChannel,
    store: StoreAccount,
    categoryMappings: CategoryMarketplaceMapping[],
    brandMappings: BrandMarketplaceMapping[],
    attributeOverrides: Record<string, Record<string | number, any>> = {}
  ): Promise<{
    success: boolean;
    batchId: string;
    items: ProductDispatchBatchItem[];
    updatedProducts: MainProduct[];
    durationMs: number;
  }> {
    const startTime = performance.now();
    await new Promise(r => setTimeout(r, 650 + Math.random() * 400));
    const duration = Math.round(performance.now() - startTime);

    const batchId = `${channel.toUpperCase()}-BATCH-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const batchItems: ProductDispatchBatchItem[] = [];

    const updatedProducts = products.map((prod) => {
      // Find category and brand mapping
      const catMap = categoryMappings.find(
        m => m.masterCategoryId === prod.masterCategoryId && m.channel === channel
      );
      const brdMap = brandMappings.find(
        m => m.masterBrandId === prod.masterBrandId && m.channel === channel
      );

      // Merge product's existing channel attributes with overrides
      const currentAttrs = prod.marketplaceAttributes?.[channel] || {};
      const prodOverrides = attributeOverrides[prod.id] || {};
      const mergedAttrs = { ...currentAttrs, ...prodOverrides };

      // Generate channel-specific listing code and barcode
      const listingBarcode = prod.masterBarcode;
      const listingSku = `${channel.toUpperCase()}-SKU-${prod.masterProductCode}`;
      const channelTitle = `${prod.title} (${store.storeName})`;
      const salePrice = +(prod.calculatedTotalCost * 1.45).toFixed(2);
      const commissionRate = catMap?.commissionRate || 18.0;

      // Build remote API request body
      let outgoingVendorPayload: Record<string, any>;
      if (channel === 'trendyol') {
        outgoingVendorPayload = {
          barcode: listingBarcode,
          title: channelTitle,
          productMainId: listingSku,
          brandId: brdMap?.remoteBrandId || 10294,
          categoryId: catMap?.remoteCategoryId || 412,
          quantity: prod.calculatedVirtualStock,
          stockCode: listingSku,
          dimensionalWeight: prod.manualDesi || prod.calculatedDesi,
          description: prod.description,
          currencyType: 'TRY',
          listPrice: +(salePrice * 1.15).toFixed(2),
          salePrice: salePrice,
          vatRate: 20,
          cargoCompanyId: 10,
          deliveryDuration: prod.manualLeadTimeDays || 1,
          images: (prod.images || []).map(img => ({ url: img?.url || '' })),
          attributes: Object.entries(mergedAttrs).map(([k, v]) => ({
            attributeId: parseInt(String(k), 10) || 338,
            customAttributeValue: String(v)
          }))
        };
      } else if (channel === 'hepsiburada') {
        outgoingVendorPayload = {
          hepsiburadaSku: `HB-${listingBarcode}`,
          merchantSku: listingSku,
          barcode: listingBarcode,
          productName: channelTitle,
          price: { amount: salePrice, currency: 'TRY' },
          availableStock: prod.calculatedVirtualStock,
          maximumPurchasableQuantity: 10,
          dispatchTime: prod.manualLeadTimeDays || 1,
          cargoCompany: 'HepsiJet',
          attributes: mergedAttrs
        };
      } else {
        outgoingVendorPayload = {
          channel,
          barcode: listingBarcode,
          sku: listingSku,
          title: channelTitle,
          price: salePrice,
          stock: prod.calculatedVirtualStock,
          attributes: mergedAttrs
        };
      }

      // Create or update ChannelListingProduct
      const existingListingIndex = prod.listings.findIndex(
        l => l.storeAccountId === store.id && l.channel === channel
      );

      const listingObj: ChannelListingProduct = {
        id: existingListingIndex >= 0 ? prod.listings[existingListingIndex].id : `list-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        mainProductId: prod.id,
        storeAccountId: store.id,
        channel,
        listingBarcode,
        listingSku,
        channelListingTitle: channelTitle,
        channelListingDescription: prod.description,
        salePrice,
        commissionRate,
        isActive: true,
        syncStatus: 'Synced',
        lastSyncUtc: new Date().toISOString(),
        rawPayload: outgoingVendorPayload,
        rawPayloadJson: JSON.stringify(outgoingVendorPayload, null, 2)
      };

      const updatedListings = existingListingIndex >= 0
        ? prod.listings.map((l, i) => i === existingListingIndex ? listingObj : l)
        : [...prod.listings, listingObj];

      // Update product's stored attributes
      const updatedMarketplaceAttrs = {
        ...(prod.marketplaceAttributes || {}),
        [channel]: mergedAttrs
      };

      batchItems.push({
        productId: prod.id,
        channel,
        status: 'Success',
        batchId,
        listingBarcode,
        listingSku,
        channelTitle,
        salePrice,
        message: `${store.storeName} (${channel.toUpperCase()}) üzerine başarıyla aktarıldı.`,
        sentPayload: outgoingVendorPayload,
        sentAtUtc: new Date().toISOString()
      });

      return {
        ...prod,
        listings: updatedListings,
        marketplaceAttributes: updatedMarketplaceAttrs,
        updatedAtUtc: new Date().toISOString()
      };
    });

    return {
      success: true,
      batchId,
      items: batchItems,
      updatedProducts,
      durationMs: duration
    };
  }
}
