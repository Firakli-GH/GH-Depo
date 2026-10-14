import { Order, MainProduct, ErpInventoryProduct, Product, CargoTierRate } from '../types';

export class ErpExporter {
  /**
   * Generates production-ready Logo Tiger / Logo Go3 XML format for selected orders.
   * If an order item has a frozen BOM recipe snapshot, it decomposes the package into its true physical inventory lines!
   */
  static generateLogoTigerXml(orders: Order[]): string {
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()}`;
    const formattedTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    let xml = `<?xml version="1.0" encoding="ISO-8859-9"?>\n`;
    xml += `<SALES_INVOICES>\n`;

    orders.forEach((order, index) => {
      const docNo = order.erpFicheNo || `EFT-${now.getFullYear()}-${(index + 1).toString().padStart(6, '0')}`;
      const arpCode = `120.01.${order.channel.toUpperCase()}.${order.channelOrderNumber.replace(/[^a-zA-Z0-9]/g, '').slice(-6)}`;

      xml += `  <INVOICE DBOP="INS">\n`;
      xml += `    <TYPE>8</TYPE> <!-- 8: Perakende Satış Faturası -->\n`;
      xml += `    <NUMBER>${docNo}</NUMBER>\n`;
      xml += `    <DOC_NUMBER>${order.channelOrderNumber}</DOC_NUMBER>\n`;
      xml += `    <DATE>${formattedDate}</DATE>\n`;
      xml += `    <TIME>${formattedTime}</TIME>\n`;
      xml += `    <DOC_DATE>${formattedDate}</DOC_DATE>\n`;
      xml += `    <ARP_CODE>${arpCode}</ARP_CODE>\n`;
      xml += `    <CLIENTREF_NAME><![CDATA[${order.customerName}]]></CLIENTREF_NAME>\n`;
      xml += `    <TAX_NUMBER>${order.customerTaxNoOrId || '11111111111'}</TAX_NUMBER>\n`;
      xml += `    <TAX_OFFICE>${order.district} VD</TAX_OFFICE>\n`;
      xml += `    <ADDRESS1><![CDATA[${order.shippingAddress}]]></ADDRESS1>\n`;
      xml += `    <CITY>${order.city}</CITY>\n`;
      xml += `    <PAYMENT_CODE>PAZARYERI_TAHSILAT</PAYMENT_CODE>\n`;
      xml += `    <SOURCE_WH>1</SOURCE_WH> <!-- 1: Merkez Depo -->\n`;
      xml += `    <TOTAL_GROSS>${order.grossAmount.toFixed(2)}</TOTAL_GROSS>\n`;
      xml += `    <TOTAL_DISCOUNTS>${order.discountAmount.toFixed(2)}</TOTAL_DISCOUNTS>\n`;
      xml += `    <TOTAL_NET>${order.totalAmount.toFixed(2)}</TOTAL_NET>\n`;
      xml += `    <TRANSACTIONS>\n`;

      let lineCounter = 1;
      order.items.forEach((item) => {
        // If the item has a frozen BOM recipe snapshot, decompose it into physical inventory lines!
        if (item.snapshots && item.snapshots.length > 0) {
          item.snapshots.forEach((snap) => {
            xml += `      <TRANSACTION>\n`;
            xml += `        <TYPE>0</TYPE> <!-- 0: Malzeme Satırı (Reçete Bileşeni) -->\n`;
            xml += `        <ITEM_CODE>${snap.componentProductCode}</ITEM_CODE>\n`;
            xml += `        <BARCODE>${snap.componentBarcode}</BARCODE>\n`;
            xml += `        <LINE_NUMBER>${lineCounter++}</LINE_NUMBER>\n`;
            xml += `        <QUANTITY>${snap.totalQuantityDeducted}</QUANTITY>\n`;
            xml += `        <PRICE>${(snap.frozenBuyingCost * 1.4).toFixed(2)}</PRICE>\n`;
            xml += `        <TOTAL>${((snap.frozenBuyingCost * 1.4) * snap.totalQuantityDeducted).toFixed(2)}</TOTAL>\n`;
            xml += `        <VAT_RATE>${snap.frozenVatRate}</VAT_RATE>\n`;
            xml += `        <UNIT_CODE>ADET</UNIT_CODE>\n`;
            xml += `        <DESCRIPTION><![CDATA[Paket Bileşeni: ${snap.componentTitle} (Paket: ${item.title})]]></DESCRIPTION>\n`;
            xml += `      </TRANSACTION>\n`;
          });
        } else {
          // Standard single item
          xml += `      <TRANSACTION>\n`;
          xml += `        <TYPE>0</TYPE>\n`;
          xml += `        <ITEM_CODE>${item.productCode}</ITEM_CODE>\n`;
          xml += `        <BARCODE>${item.barcode}</BARCODE>\n`;
          xml += `        <LINE_NUMBER>${lineCounter++}</LINE_NUMBER>\n`;
          xml += `        <QUANTITY>${item.quantity}</QUANTITY>\n`;
          xml += `        <PRICE>${item.unitPrice.toFixed(2)}</PRICE>\n`;
          xml += `        <TOTAL>${item.lineTotal.toFixed(2)}</TOTAL>\n`;
          xml += `        <VAT_RATE>${item.vatRate}</VAT_RATE>\n`;
          xml += `        <UNIT_CODE>ADET</UNIT_CODE>\n`;
          xml += `        <DESCRIPTION><![CDATA[${item.title}]]></DESCRIPTION>\n`;
          xml += `      </TRANSACTION>\n`;
        }
      });

      xml += `    </TRANSACTIONS>\n`;
      xml += `  </INVOICE>\n`;
    });

    xml += `</SALES_INVOICES>`;
    return xml;
  }

  /**
   * Generates UTF-8 BOM CSV for Orders
   */
  static generateOrdersCsv(orders: Order[]): string {
    const headers = [
      'Sipariş No',
      'Kanal',
      'Müşteri Adı',
      'Şehir',
      'İlçe',
      'Tarih',
      'Durum',
      'Tutar (TL)',
      'Paket / Ürün',
      'Dondurulmuş Reçete Özeti',
      'Kargo Firması',
      'ERP Fatura No'
    ];

    const rows = orders.map(o => {
      const itemsSummary = o.items.map(i => `${i.quantity}x ${i.title}`).join(' | ');
      const recipeSnapshotSummary = o.items
        .flatMap(i => i.snapshots?.map(s => `${s.totalQuantityDeducted}x ${s.componentProductCode} (${s.componentTitle})`) || [])
        .join(' + ') || 'Tekil Ürün';

      return [
        `"${o.channelOrderNumber}"`,
        `"${o.channel.toUpperCase()}"`,
        `"${o.customerName}"`,
        `"${o.city}"`,
        `"${o.district}"`,
        `"${new Date(o.orderDateUtc).toLocaleString('tr-TR')}"`,
        `"${o.status}"`,
        o.totalAmount.toFixed(2),
        `"${itemsSummary.replace(/"/g, '""')}"`,
        `"${recipeSnapshotSummary.replace(/"/g, '""')}"`,
        `"${o.cargoProvider}"`,
        `"${o.erpFicheNo || '-'}"`
      ];
    });

    const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    return '\uFEFF' + csvContent;
  }

  /**
   * Generates UTF-8 BOM CSV for Main Products & Multi-Listings
   */
  static generateMainProductsCsv(mainProducts: MainProduct[]): string {
    const headers = [
      'Ana Ürün Kodu',
      'Master Barkod',
      'Ürün Başlığı',
      'Ürün Tipi',
      'Kategori',
      'Toplam Reçete Maliyeti (TL)',
      'Hesaplanan Sanal Stok',
      'Hesaplanan Desi',
      'Girilen Desi',
      'Hesaplanan Termin (Gün)',
      'Girilen Termin (Gün)',
      'Reçete Bileşenleri',
      'Toplam Kanal İlan Sayısı'
    ];

    const rows = mainProducts.map(p => {
      const recipeText = p.recipeItems.map(r => `${r.quantity}x ${r.componentCode || r.componentTitle}`).join(' + ');

      return [
        `"${p.masterProductCode}"`,
        `"${p.masterBarcode}"`,
        `"${p.title.replace(/"/g, '""')}"`,
        `"${p.kind === 'Single' ? 'Tekil' : p.kind === 'MultiUnitBundle' ? 'Adetli Paket' : 'Karma Set'}"`,
        `"${p.mainCategory} / ${p.subCategory}"`,
        p.calculatedTotalCost.toFixed(2),
        p.calculatedVirtualStock,
        p.calculatedDesi.toFixed(2),
        p.manualDesi.toFixed(2),
        p.calculatedLeadTimeDays,
        p.manualLeadTimeDays,
        `"${recipeText}"`,
        p.listings.length
      ];
    });

    const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    return '\uFEFF' + csvContent;
  }

  static generateProductsCsv(products: Product[]): string {
    const headers = [
      'Stok Kodu',
      'Barkod',
      'Ürün Adı',
      'Marka',
      'Kategori',
      'Alış Maliyeti (TL)',
      'Fiili Stok',
      'Rezerve Stok',
      'Kullanılabilir Stok',
      'KDV (%)'
    ];

    const rows = products.map(p => [
      `"${p.productCode}"`,
      `"${p.barcode}"`,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.brand}"`,
      `"${p.category}"`,
      p.buyingPrice.toFixed(2),
      p.stockQuantity,
      p.reservedQuantity,
      p.availableQuantity,
      p.vatRate
    ]);

    const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    return '\uFEFF' + csvContent;
  }

  /**
   * Generates marketplace discrepancy claims CSV for disputed orders (İtiraz Dökümü)
   */
  static generateCargoDiscrepancyClaimCsv(orders: Order[]): string {
    const headers = [
      'Sipariş No',
      'Pazaryeri Kanalı',
      'Kargo Firması',
      'Kargo Takip No',
      'Müşteri Adı',
      'Şehir',
      'Tarih',
      'Paketlenen Desi (Beyan Edilen)',
      'Kargo Şubesinin Girdiği Desi',
      'Desi Sapması (Delta Desi)',
      'Öngörülen Barem Bedeli (TL)',
      'Pazaryeri Kesilen Tutar (TL)',
      'Haksız Kesinti Tutarı (TL)',
      'Uygulanan Barem Kodu',
      'İtiraz Durumu',
      'İtiraz Gerekçesi / Açıklama'
    ];

    const disputedOrders = orders.filter(o => o.cargoSnapshot && (o.cargoSnapshot.hasDiscrepancy || o.cargoSnapshot.claimStatus));

    const rows = disputedOrders.map(o => {
      const snap = o.cargoSnapshot!;
      const diffDesi = snap.discrepancyDesi > 0 ? `+${snap.discrepancyDesi.toFixed(2)}` : snap.discrepancyDesi.toFixed(2);
      const diffFee = snap.discrepancyFee > 0 ? `+${snap.discrepancyFee.toFixed(2)}` : snap.discrepancyFee.toFixed(2);

      let claimReason = 'Otomatik tespit: Desi ve fatura tutarı barem tarifesinden yüksek kesilmiştir.';
      if (snap.wasProviderOverridden) {
        claimReason += ` Operatör firma değişikliği yapılmıştır (${snap.originalProvider} -> ${snap.selectedCargoProvider}).`;
      }

      return [
        `"${o.channelOrderNumber}"`,
        `"${o.channel.toUpperCase()}"`,
        `"${snap.selectedCargoProvider || o.cargoProvider}"`,
        `"${o.cargoTrackingNumber || o.cargoBarcode || '-'}"`,
        `"${o.customerName}"`,
        `"${o.city}"`,
        `"${new Date(o.orderDateUtc).toLocaleDateString('tr-TR')}"`,
        snap.estimatedDesi.toFixed(2),
        snap.actualInvoicedDesi ? snap.actualInvoicedDesi.toFixed(2) : '-',
        `"${diffDesi}"`,
        snap.estimatedCargoFee.toFixed(2),
        snap.actualInvoicedFee ? snap.actualInvoicedFee.toFixed(2) : '-',
        `"${diffFee}"`,
        `"${snap.appliedBaremCode || '-'}"`,
        `"${snap.claimStatus || 'PendingClaim'}"`,
        `"${claimReason.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    return '\uFEFF' + csvContent;
  }

  /**
   * Generates CSV export for Cargo Tariffs
   */
  static generateCargoTariffCsv(tariffs: CargoTierRate[]): string {
    const headers = [
      'Pazaryeri Kanalı',
      'Kargo Firması',
      'Barem Adı',
      'Min Sepet Tutarı (TL)',
      'Max Sepet Tutarı (TL)',
      'Min Desi',
      'Max Desi',
      'Satıcı Kargo Bedeli (TL)',
      'Pazaryeri Destekli'
    ];

    const rows = tariffs.map(t => [
      `"${t.channel}"`,
      `"${t.cargoProvider}"`,
      `"${t.tierName}"`,
      t.minCartPrice.toFixed(2),
      t.maxCartPrice >= 900000 ? '999999' : t.maxCartPrice.toFixed(2),
      t.minDesi.toFixed(2),
      t.maxDesi.toFixed(2),
      t.sellerCargoFee.toFixed(2),
      t.isMarketplaceSubsidized ? 'Evet' : 'Hayır'
    ]);

    const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    return '\uFEFF' + csvContent;
  }

  /**
   * Helper to trigger browser file download
   */
  static downloadFile(content: string, filename: string, mimeType: string = 'text/plain;charset=utf-8') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
