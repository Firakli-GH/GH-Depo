import { MarketplaceChannel, StoreAccount, Order, Product, CustomerQuestion, SettlementReport } from '../types';

export interface AdapterSyncResult<T> {
  success: boolean;
  channel: MarketplaceChannel;
  storeName: string;
  items: T[];
  count: number;
  durationMs: number;
  message: string;
  rawRequestSummary: string;
  rawResponseCode: number;
}

export class MarketplaceAdapterRegistry {
  /**
   * Simulates fetching latest orders from the given channel store
   */
  static async fetchOrders(store: StoreAccount): Promise<AdapterSyncResult<Partial<Order>>> {
    const startTime = performance.now();
    await new Promise(res => setTimeout(res, 250 + Math.random() * 300));
    const duration = Math.round(performance.now() - startTime);

    const simulatedNewOrders: Partial<Order>[] = [];

    // Simulate 1 incoming order occasionally
    if (Math.random() > 0.4) {
      const orderNum = `${store.channel.toUpperCase()}-${Math.floor(100000000 + Math.random() * 900000000)}`;
      const randomCustomers = [
        { name: 'Oğuzhan Kaya', city: 'İstanbul', dist: 'Kadıköy', email: 'oguzhan@gmail.com', phone: '0532 999 11 22' },
        { name: 'Selin Yıldız', city: 'İzmir', dist: 'Karşıyaka', email: 'selin.yildiz@hotmail.com', phone: '0544 333 88 99' },
        { name: 'Mert Aktaş', city: 'Bursa', dist: 'Nilüfer', email: 'mert.aktas@yahoo.com', phone: '0555 123 45 67' },
        { name: 'Gizem Demir', city: 'Ankara', dist: 'Çankaya', email: 'gizem.demir@outlook.com', phone: '0533 777 44 55' },
      ];
      const cust = randomCustomers[Math.floor(Math.random() * randomCustomers.length)];

      // Generate authentic real marketplace vendor payload
      let rawVendorPayload: Record<string, any>;

      if (store.channel === 'trendyol') {
        rawVendorPayload = {
          id: Math.floor(100000000 + Math.random() * 900000000),
          orderNumber: orderNum,
          grossAmount: 1499.00,
          totalDiscount: 0,
          totalPrice: 1499.00,
          customerFirstName: cust.name.split(' ')[0],
          customerLastName: cust.name.split(' ').slice(1).join(' ') || 'Müşteri',
          customerId: Math.floor(100000 + Math.random() * 900000),
          customerEmail: cust.email,
          cargoTrackingNumber: `${Math.floor(7000000000 + Math.random() * 900000000)}`,
          cargoProviderName: 'Trendyol Express',
          shipmentPackageStatus: 'Created',
          orderDate: Date.now(),
          tcIdentityNumber: '11223344556',
          deliveryType: 'Normal',
          shipmentAddress: {
            address1: `${cust.dist} Mah. Atatürk Cad. No:${Math.floor(1 + Math.random() * 100)}`,
            city: cust.city,
            district: cust.dist,
            postalCode: '34000',
            fullAddress: `${cust.dist} Mah. Atatürk Cad. No:${Math.floor(1 + Math.random() * 100)} ${cust.dist}/${cust.city}`
          },
          invoiceAddress: {
            address1: `${cust.dist} Mah. Atatürk Cad. No:${Math.floor(1 + Math.random() * 100)}`,
            city: cust.city,
            district: cust.dist,
            postalCode: '34000',
            fullAddress: `${cust.dist} Mah. Atatürk Cad. No:${Math.floor(1 + Math.random() * 100)} ${cust.dist}/${cust.city}`
          },
          lines: [
            {
              id: Math.floor(10000000 + Math.random() * 90000000),
              sku: 'TY-SKU-KUL-01',
              barcode: '8680001092811',
              merchantSku: 'STK-KUL-001',
              productName: 'Kablosuz ANC Bluetooth Kulaklık Pro V5.3',
              quantity: 1,
              price: 1499.00,
              amount: 1499.00,
              discount: 0,
              vatBaseAmount: 249.83,
              currencyCode: 'TRY'
            }
          ]
        };
      } else if (store.channel === 'hepsiburada') {
        rawVendorPayload = {
          id: `PKG-${orderNum}`,
          orderNumber: orderNum,
          orderDate: new Date().toISOString(),
          status: 'Open',
          totalPrice: { amount: 1499.00, currency: 'TRY' },
          customer: { customerId: `CUST-${Math.floor(10000 + Math.random() * 90000)}`, name: cust.name },
          recipient: {
            name: cust.name,
            addressDetail: `${cust.dist} Mah. Atatürk Cad. No:${Math.floor(1 + Math.random() * 100)}`,
            city: cust.city,
            town: cust.dist,
            phoneNumber: cust.phone
          },
          cargoCompany: { id: 3, name: 'HepsiJet', shortCode: 'HJ' },
          barcode: `HB-${orderNum}`,
          trackingNumber: `TRK-${Math.floor(100000000 + Math.random() * 900000000)}`,
          items: [
            {
              id: `ITEM-${Math.floor(1000 + Math.random() * 9000)}`,
              merchantSku: 'STK-KUL-001',
              barcode: '8680001092811',
              productName: 'Kablosuz ANC Bluetooth Kulaklık Pro V5.3',
              quantity: 1,
              price: { amount: 1499.00, currency: 'TRY' },
              vat: 20
            }
          ]
        };
      } else {
        // N11 / PttAVM / Pazarama generic authentic payload
        rawVendorPayload = {
          orderNumber: orderNum,
          orderDate: new Date().toISOString(),
          channel: store.channel,
          totalAmount: 1499.00,
          customer: { name: cust.name, email: cust.email, phone: cust.phone },
          shippingAddress: {
            addressText: `${cust.dist} Mah. Atatürk Cad. No:${Math.floor(1 + Math.random() * 100)}`,
            city: cust.city,
            district: cust.dist
          },
          cargo: {
            provider: store.channel === 'pttavm' ? 'PTT Kargo' : 'Yurtiçi Kargo',
            barcode: `BAR-${orderNum}`,
            trackingNumber: `TRK-${Math.floor(100000000 + Math.random() * 900000000)}`
          },
          items: [
            {
              itemCode: 'STK-KUL-001',
              barcode: '8680001092811',
              title: 'Kablosuz ANC Bluetooth Kulaklık Pro V5.3',
              quantity: 1,
              unitPrice: 1499.00
            }
          ]
        };
      }

      simulatedNewOrders.push({
        id: `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        storeId: store.id,
        channel: store.channel,
        channelOrderNumber: orderNum,
        customerName: cust.name,
        customerEmail: cust.email,
        customerPhone: cust.phone,
        shippingAddress: `${cust.dist} Mah. Atatürk Cad. No:${Math.floor(1 + Math.random() * 100)}`,
        billingAddress: `${cust.dist} Mah. Atatürk Cad. No:${Math.floor(1 + Math.random() * 100)}`,
        city: cust.city,
        district: cust.dist,
        status: 'Created',
        channelStatusRaw: store.channel === 'trendyol' ? 'Created' : store.channel === 'hepsiburada' ? 'Open' : 'Approved',
        orderDateUtc: new Date().toISOString(),
        paymentType: store.channel === 'wix' || store.channel === 'ticimax' ? 'CreditCard' : 'MarketplaceCollection',
        grossAmount: 1499.00,
        discountAmount: 0,
        cargoAmount: 0,
        totalAmount: 1499.00,
        cargoProvider: store.channel === 'trendyol' ? 'Trendyol Express' : store.channel === 'hepsiburada' ? 'HepsiJet' : 'Yurtiçi Kargo',
        cargoBarcode: `BAR-${orderNum}`,
        isExportedToErp: false,
        rawPayload: rawVendorPayload,
        rawPayloadJson: JSON.stringify(rawVendorPayload, null, 2),
        items: [
          {
            id: `item-${Date.now()}`,
            orderId: '',
            channelLineItemId: `LINE-${Math.floor(1000 + Math.random() * 9000)}`,
            barcode: '8680001092811',
            productCode: 'STK-KUL-001',
            title: 'Kablosuz ANC Bluetooth Kulaklık Pro V5.3',
            quantity: 1,
            unitPrice: 1499.00,
            vatRate: 20,
            lineTotal: 1499.00,
            status: 'Active'
          }
        ]
      });
    }

    return {
      success: true,
      channel: store.channel,
      storeName: store.storeName,
      items: simulatedNewOrders,
      count: simulatedNewOrders.length,
      durationMs: duration,
      message: `${store.storeName} üzerinden ${simulatedNewOrders.length} adet yeni sipariş tespit edildi.`,
      rawRequestSummary: `GET ${store.channel}://api/v2/orders?status=Created&startDate=${new Date(Date.now() - 3600000).toISOString()}`,
      rawResponseCode: 200
    };
  }

  /**
   * Simulates updating price & stock on remote marketplace
   */
  static async pushInventoryUpdate(
    store: StoreAccount, 
    barcode: string, 
    stock: number, 
    price?: number
  ): Promise<{ success: boolean; durationMs: number; message: string; rawResponse: string }> {
    const startTime = performance.now();
    await new Promise(res => setTimeout(res, 200 + Math.random() * 200));
    const duration = Math.round(performance.now() - startTime);

    let format = 'REST JSON';
    if (store.channel === 'ticimax' || store.channel === 'n11') {
      format = 'SOAP XML Envelope';
    }

    return {
      success: true,
      durationMs: duration,
      message: `${store.storeName} [${barcode}] için stok: ${stock}${price ? `, fiyat: ${price} TL` : ''} güncellendi (${format}).`,
      rawResponse: JSON.stringify({
        status: 'SUCCESS',
        batchRequestId: `BATCH-${Date.now()}`,
        channel: store.channel,
        itemCount: 1,
        processedUtc: new Date().toISOString()
      }, null, 2)
    };
  }

  /**
   * Simulates answering a customer question via API
   */
  static async answerCustomerQuestion(
    store: StoreAccount,
    channelQuestionId: string,
    answerText: string
  ): Promise<{ success: boolean; durationMs: number; message: string }> {
    const startTime = performance.now();
    await new Promise(res => setTimeout(res, 280));
    const duration = Math.round(performance.now() - startTime);

    return {
      success: true,
      durationMs: duration,
      message: `${store.storeName} soru ID: ${channelQuestionId} başarıyla yanıtlandı ve satıcı portalına iletildi.`
    };
  }

  /**
   * Tests API credentials for a given store
   */
  static async testConnection(store: StoreAccount): Promise<{ success: boolean; message: string; durationMs: number }> {
    const startTime = performance.now();
    await new Promise(res => setTimeout(res, 350 + Math.random() * 200));
    const duration = Math.round(performance.now() - startTime);

    if (!store.apiKey || store.apiKey.length < 5) {
      return {
        success: false,
        message: 'API Key geçersiz veya boş. Lütfen geçerli yetkilendirme anahtarı giriniz.',
        durationMs: duration
      };
    }

    return {
      success: true,
      message: `200 OK: ${store.storeName} (${store.channel}) API bağlantısı doğrulandı. Token ve yetkiler geçerli.`,
      durationMs: duration
    };
  }
}
