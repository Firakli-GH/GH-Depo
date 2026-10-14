import { 
  ErpInventoryProduct, 
  MainProduct, 
  ChannelListingProduct, 
  OrderItemComponentSnapshot 
} from '../types';

export class ProductService {
  /**
   * Recalculates dynamic metrics (Cost, Virtual Stock, Calculated Desi, Calculated Lead Time)
   * for a given MainProduct using the current physical inventory state.
   */
  static calculateMainProductMetrics(
    mainProd: MainProduct, 
    inventoryList: ErpInventoryProduct[]
  ): MainProduct {
    if (!mainProd.recipeItems || mainProd.recipeItems.length === 0) {
      return mainProd;
    }

    let totalCost = 0;
    let totalDesi = 0;
    let maxLeadTime = 0;
    let minVirtualStock = Number.MAX_SAFE_INTEGER;

    for (const item of mainProd.recipeItems) {
      const inv = inventoryList.find(i => i.id === item.erpInventoryProductId);
      if (inv) {
        totalCost += inv.buyingPrice * item.quantity;
        totalDesi += inv.unitDesi * item.quantity;
        if (inv.leadTimeDays > maxLeadTime) {
          maxLeadTime = inv.leadTimeDays;
        }

        const netAvail = Math.max(0, inv.physicalStockQuantity - inv.reservedQuantity);
        const canProduce = Math.floor(netAvail / item.quantity);
        if (canProduce < minVirtualStock) {
          minVirtualStock = canProduce;
        }
      }
    }

    const calculatedStock = minVirtualStock === Number.MAX_SAFE_INTEGER ? 0 : minVirtualStock;

    return {
      ...mainProd,
      calculatedTotalCost: Math.round(totalCost * 100) / 100,
      calculatedDesi: Math.round(totalDesi * 100) / 100,
      calculatedLeadTimeDays: maxLeadTime,
      calculatedVirtualStock: calculatedStock
    };
  }

  /**
   * Recalculates all MainProducts against the latest physical inventory state.
   */
  static recalculateAllMainProducts(
    mainProducts: MainProduct[], 
    inventoryList: ErpInventoryProduct[]
  ): MainProduct[] {
    return mainProducts.map(mp => this.calculateMainProductMetrics(mp, inventoryList));
  }

  /**
   * Generates a frozen snapshot of the bundle recipe for an order line item.
   * This captures the exact BOM configuration, component prices, and deduction counts at the order moment.
   */
  static freezeOrderRecipeSnapshot(
    orderItemId: string,
    listingBarcode: string,
    orderQuantity: number,
    mainProducts: MainProduct[],
    inventoryList: ErpInventoryProduct[]
  ): OrderItemComponentSnapshot[] {
    // 1. Find the listing matching the barcode (or fallback to master barcode)
    let parentMainProd: MainProduct | undefined;

    for (const mp of mainProducts) {
      const hasListing = mp.listings.some(l => l.listingBarcode === listingBarcode);
      if (hasListing || mp.masterBarcode === listingBarcode) {
        parentMainProd = mp;
        break;
      }
    }

    if (!parentMainProd || !parentMainProd.recipeItems) {
      return [];
    }

    const snapshots: OrderItemComponentSnapshot[] = [];

    for (const recipe of parentMainProd.recipeItems) {
      const inv = inventoryList.find(i => i.id === recipe.erpInventoryProductId);
      if (inv) {
        snapshots.push({
          id: `snap-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          orderItemId,
          erpInventoryProductId: inv.id,
          componentProductCode: inv.productCode,
          componentBarcode: inv.barcode,
          componentTitle: inv.title,
          quantityPerPackage: recipe.quantity,
          totalQuantityDeducted: recipe.quantity * orderQuantity,
          frozenBuyingCost: inv.buyingPrice,
          frozenVatRate: inv.vatRate,
          snapshotAtUtc: new Date().toISOString()
        });
      }
    }

    return snapshots;
  }
}
