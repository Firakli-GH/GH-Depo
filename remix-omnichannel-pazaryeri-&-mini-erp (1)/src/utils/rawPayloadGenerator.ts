import { 
  Order, 
  ChannelListingProduct, 
  SettlementReport, 
  MarketplaceChannel 
} from '../types';

/**
 * Türkiye Pazaryerleri için Gerçek Veri Şeması Üreticisi (Vendor Payload Generator)
 * Resmi Trendyol, Hepsiburada, N11, PttAVM, Pazarama ve İdefix API dönüşlerini üretir.
 */
export class RawPayloadGenerator {
  /**
   * Sipariş için resmi pazaryeri dönüş JSON gövdesini oluşturur
   */
  static generateOrderRawPayload(order: Order): { rawPayload: Record<string, any>; rawPayloadJson: string } {
    const channel = order.channel;
    let payload: Record<string, any>;

    if (channel === 'trendyol') {
      const nameParts = order.customerName.trim().split(' ');
      const firstName = nameParts[0] || 'Müşteri';
      const lastName = nameParts.slice(1).join(' ') || 'Soyadı';

      payload = {
        id: parseInt(order.channelOrderNumber.replace(/\D/g, '').slice(-9) || '928104812', 10),
        orderNumber: order.channelOrderNumber,
        grossAmount: order.grossAmount,
        totalDiscount: order.discountAmount,
        totalPrice: order.totalAmount,
        customerFirstName: firstName,
        customerLastName: lastName,
        customerId: 4819024,
        customerEmail: order.customerEmail,
        cargoTrackingNumber: order.cargoTrackingNumber || order.cargoBarcode.replace(/\D/g, '') || '73491029410',
        cargoTrackingLink: `https://kargotakip.trendyol.com/?code=${order.cargoBarcode}`,
        cargoProviderName: order.cargoProvider || 'Trendyol Express',
        shipmentPackageStatus: order.status === 'Created' ? 'Created' 
          : order.status === 'Picking' ? 'Picking'
          : order.status === 'Invoiced' ? 'Invoiced'
          : order.status === 'Shipped' ? 'Shipped'
          : order.status === 'Delivered' ? 'Delivered'
          : order.status === 'Cancelled' ? 'Cancelled'
          : order.status === 'Returned' ? 'UnDelivered' : 'Created',
        orderDate: new Date(order.orderDateUtc).getTime(),
        tcIdentityNumber: order.customerTaxNoOrId || '12345678901',
        taxNumber: order.customerTaxNoOrId || null,
        taxOffice: order.city ? `${order.city} Vergi Dairesi` : null,
        deliveryType: order.deliveryCityType === 'istanbul_own_fleet' ? 'FastDelivery' : 'Normal',
        shipmentAddress: {
          id: 1029481,
          firstName: firstName,
          lastName: lastName,
          address1: order.shippingAddress,
          city: order.city,
          cityCode: 34,
          district: order.district,
          postalCode: '34000',
          countryCode: 'TR',
          fullAddress: `${order.shippingAddress} ${order.district}/${order.city}`
        },
        invoiceAddress: {
          id: 1029482,
          firstName: firstName,
          lastName: lastName,
          address1: order.billingAddress,
          city: order.city,
          district: order.district,
          postalCode: '34000',
          countryCode: 'TR',
          fullAddress: `${order.billingAddress} ${order.district}/${order.city}`
        },
        lines: order.items.map((item, idx) => ({
          id: 20000000 + idx,
          sku: `TY-SKU-${item.productCode}`,
          barcode: item.barcode,
          productName: item.title,
          merchantSku: item.productCode,
          quantity: item.quantity,
          price: item.unitPrice,
          amount: item.lineTotal,
          discount: 0,
          tyDiscount: 0,
          vatBaseAmount: +(item.lineTotal / (1 + item.vatRate / 100) * (item.vatRate / 100)).toFixed(2),
          currencyCode: 'TRY',
          orderLineItemStatusName: order.status === 'Delivered' ? 'Delivered' : 'Created'
        }))
      };
    } else if (channel === 'hepsiburada') {
      payload = {
        id: `PKG-${order.channelOrderNumber}`,
        orderNumber: order.channelOrderNumber,
        orderDate: order.orderDateUtc,
        status: order.status === 'Created' ? 'Open' 
          : order.status === 'Picking' ? 'InPicking'
          : order.status === 'Invoiced' ? 'Billed'
          : order.status === 'Shipped' ? 'Shipped'
          : order.status === 'Delivered' ? 'Delivered' : 'Open',
        totalPrice: {
          amount: order.totalAmount,
          currency: 'TRY'
        },
        customer: {
          customerId: `HB-CUST-${order.customerPhone.replace(/\D/g, '').slice(-6)}`,
          name: order.customerName
        },
        recipient: {
          name: order.customerName,
          addressDetail: order.shippingAddress,
          city: order.city,
          town: order.district,
          phoneNumber: order.customerPhone,
          email: order.customerEmail
        },
        invoiceAddress: {
          address: order.billingAddress,
          city: order.city,
          town: order.district,
          taxNumber: order.customerTaxNoOrId || null
        },
        shippingAddress: {
          name: order.customerName,
          addressDetail: order.shippingAddress,
          city: order.city,
          town: order.district,
          phoneNumber: order.customerPhone
        },
        cargoCompany: {
          id: 104,
          name: order.cargoProvider || 'HepsiJet',
          shortCode: 'HJ'
        },
        barcode: order.cargoBarcode,
        trackingNumber: order.cargoTrackingNumber || `HJ-TRK-${order.channelOrderNumber}`,
        items: order.items.map((item, idx) => ({
          id: `LINE-${idx + 100}`,
          orderId: order.channelOrderNumber,
          sku: `HB-SKU-${item.barcode}`,
          merchantSku: item.productCode,
          barcode: item.barcode,
          productName: item.title,
          quantity: item.quantity,
          price: { amount: item.unitPrice, currency: 'TRY' },
          vat: item.vatRate,
          totalPrice: { amount: item.lineTotal, currency: 'TRY' },
          commission: { amount: +(item.lineTotal * 0.18).toFixed(2), currency: 'TRY' },
          status: 'Active',
          cargoCompanyModel: { id: 104, name: order.cargoProvider || 'HepsiJet', shortCode: 'HJ' }
        }))
      };
    } else if (channel === 'n11') {
      payload = {
        id: 74910294,
        orderNumber: order.channelOrderNumber,
        createDate: new Date(order.orderDateUtc).toLocaleString('tr-TR'),
        status: order.status === 'Approved' ? 'Approved' : 'Shipped',
        paymentType: 'CREDIT_CARD',
        citizenshipId: order.customerTaxNoOrId || '28491029410',
        totalAmount: order.totalAmount,
        billingAddress: {
          address: order.billingAddress,
          city: order.city,
          district: order.district,
          fullName: order.customerName,
          gsm: order.customerPhone
        },
        shippingAddress: {
          address: order.shippingAddress,
          city: order.city,
          district: order.district,
          fullName: order.customerName,
          gsm: order.customerPhone
        },
        buyer: {
          id: 39401,
          fullName: order.customerName,
          email: order.customerEmail,
          phoneNumber: order.customerPhone,
          tcId: order.customerTaxNoOrId || '28491029410'
        },
        itemList: order.items.map((item, idx) => ({
          id: 900000 + idx,
          productId: 50000 + idx,
          productName: item.title,
          sellerStockCode: item.productCode,
          sellerStockBarcode: item.barcode,
          quantity: item.quantity,
          price: item.unitPrice,
          sellerDiscount: 0,
          mallDiscount: 0,
          dueAmount: item.lineTotal,
          shipmentCompany: order.cargoProvider || 'Yurtiçi Kargo',
          trackingNumber: order.cargoTrackingNumber || order.cargoBarcode,
          orderItemStatus: 'Approved'
        }))
      };
    } else if (channel === 'pttavm') {
      payload = {
        SiparisKodu: order.channelOrderNumber,
        SiparisTarihi: order.orderDateUtc,
        Durum: 'Onaylandi',
        MusteriAdi: order.customerName.split(' ')[0],
        MusteriSoyadi: order.customerName.split(' ').slice(1).join(' ') || 'Müşteri',
        MusteriTelefon: order.customerPhone,
        MusteriEmail: order.customerEmail,
        TeslimatAdresi: order.shippingAddress,
        TeslimatSehir: order.city,
        TeslimatIlce: order.district,
        FaturaAdresi: order.billingAddress,
        FaturaSehir: order.city,
        KargoSirketi: order.cargoProvider || 'PTT Kargo',
        KargoBarkod: order.cargoBarcode,
        KargoTakipNo: order.cargoTrackingNumber || `PTT-${order.channelOrderNumber}`,
        ToplamTutar: order.totalAmount,
        Urunler: order.items.map((item) => ({
          UrunKodu: item.productCode,
          Barkod: item.barcode,
          UrunAdi: item.title,
          Miktar: item.quantity,
          BirimFiyat: item.unitPrice,
          ToplamFiyat: item.lineTotal,
          KdvOrani: item.vatRate,
          Durum: 'Onaylandi'
        }))
      };
    } else if (channel === 'pazarama') {
      payload = {
        orderId: `PZR-${order.channelOrderNumber}`,
        orderCode: order.channelOrderNumber,
        orderDate: order.orderDateUtc,
        orderStatus: 'Approved',
        buyer: {
          fullName: order.customerName,
          email: order.customerEmail,
          phone: order.customerPhone,
          identityNumber: order.customerTaxNoOrId || '12345678901'
        },
        deliveryAddress: {
          addressText: order.shippingAddress,
          city: order.city,
          district: order.district
        },
        billingAddress: {
          addressText: order.billingAddress,
          city: order.city,
          district: order.district
        },
        cargoProviderName: order.cargoProvider || 'Yurtiçi Kargo',
        cargoTrackingNumber: order.cargoTrackingNumber || order.cargoBarcode,
        shipmentBarcode: order.cargoBarcode,
        totalAmount: order.totalAmount,
        items: order.items.map((item, idx) => ({
          orderItemId: `PZR-ITEM-${idx + 1}`,
          code: item.productCode,
          barcode: item.barcode,
          name: item.title,
          quantity: item.quantity,
          listPrice: item.unitPrice,
          salePrice: item.unitPrice,
          vatRate: item.vatRate,
          itemStatus: 'Approved'
        }))
      };
    } else {
      // E-ticaret platformları (Wix / Ticimax Webhook dönüşü)
      payload = {
        orderId: order.channelOrderNumber,
        createdDate: order.orderDateUtc,
        currency: 'TRY',
        channelSource: channel,
        paymentStatus: 'PAID',
        totals: {
          subtotal: order.grossAmount,
          shipping: order.cargoAmount,
          total: order.totalAmount
        },
        shippingInfo: {
          deliverTo: {
            fullName: order.customerName,
            phone: order.customerPhone,
            email: order.customerEmail
          },
          address: {
            street: order.shippingAddress,
            city: order.city,
            district: order.district,
            country: 'Turkey'
          },
          carrier: order.cargoProvider,
          trackingNumber: order.cargoTrackingNumber || order.cargoBarcode
        },
        lineItems: order.items.map((item) => ({
          sku: item.productCode,
          barcode: item.barcode,
          title: item.title,
          quantity: item.quantity,
          price: item.unitPrice,
          lineTotal: item.lineTotal
        }))
      };
    }

    return {
      rawPayload: payload,
      rawPayloadJson: JSON.stringify(payload, null, 2)
    };
  }

  /**
   * Pazaryeri İlanı için gerçek katalog ve listeleme şeması
   */
  static generateListingRawPayload(listing: ChannelListingProduct): { rawPayload: Record<string, any>; rawPayloadJson: string } {
    let payload: Record<string, any>;

    if (listing.channel === 'trendyol') {
      payload = {
        barcode: listing.listingBarcode,
        title: listing.channelListingTitle,
        productMainId: listing.listingSku,
        brandId: 10294,
        brandName: 'Yerli Üretici / Marmara',
        categoryId: 412,
        categoryName: 'Kişisel Bakım > Kolonya',
        quantity: 150,
        stockCode: listing.listingSku,
        dimensionalWeight: 0.40,
        description: listing.channelListingDescription,
        currencyType: 'TRY',
        listPrice: +(listing.salePrice * 1.15).toFixed(2),
        salePrice: listing.salePrice,
        vatRate: 20,
        cargoCompanyId: 10,
        cargoCompanyName: 'Trendyol Express',
        deliveryDuration: 1,
        images: [
          { url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&auto=format&fit=crop&q=80' }
        ],
        attributes: [
          { attributeId: 338, attributeName: 'Hacim', customAttributeValue: '400 ml' },
          { attributeId: 342, attributeName: 'Tür', customAttributeValue: 'Limon Kolonyası 80°' }
        ]
      };
    } else if (listing.channel === 'hepsiburada') {
      payload = {
        hepsiburadaSku: `HB-${listing.listingBarcode}`,
        merchantSku: listing.listingSku,
        barcode: listing.listingBarcode,
        productName: listing.channelListingTitle,
        price: {
          amount: listing.salePrice,
          currency: 'TRY'
        },
        availableStock: 150,
        maximumPurchasableQuantity: 10,
        dispatchTime: 1,
        cargoCompany: 'HepsiJet',
        isActive: listing.isActive,
        lastUpdateDate: listing.lastSyncUtc
      };
    } else {
      payload = {
        channel: listing.channel,
        listingBarcode: listing.listingBarcode,
        listingSku: listing.listingSku,
        title: listing.channelListingTitle,
        description: listing.channelListingDescription,
        salePrice: listing.salePrice,
        commissionRate: listing.commissionRate,
        status: listing.syncStatus,
        lastSync: listing.lastSyncUtc
      };
    }

    return {
      rawPayload: payload,
      rawPayloadJson: JSON.stringify(payload, null, 2)
    };
  }

  /**
   * Hakediş ve Mutabakat Raporu için ham finans yanıtı
   */
  static generateSettlementRawPayload(report: SettlementReport): { rawPayload: Record<string, any>; rawPayloadJson: string } {
    const payload = {
      payoutId: report.id,
      marketplace: report.channel,
      periodCode: report.periodCode,
      startDate: report.startDateUtc,
      endDate: report.endDateUtc,
      payoutDate: report.paymentDueDateUtc,
      summary: {
        grossSales: report.totalSalesAmount,
        commissionDeduction: -report.totalCommissionAmount,
        cargoFeeDeduction: -report.totalCargoFeeAmount,
        penaltyAndDiscounts: -report.totalPenaltyOrDiscount,
        netPayout: report.netPayoutAmount,
        currency: 'TRY'
      },
      bankAccount: {
        iban: 'TR330006200000012345678901',
        bankName: 'Garanti BBVA',
        accountHolder: 'ETİCARET MERKEZİ A.Ş.'
      },
      transactions: report.items.map((item) => ({
        transactionId: item.id,
        orderNumber: item.orderNumber,
        type: item.transactionType,
        amount: item.amount,
        date: item.transactionDateUtc,
        note: item.description
      }))
    };

    return {
      rawPayload: payload,
      rawPayloadJson: JSON.stringify(payload, null, 2)
    };
  }
}
