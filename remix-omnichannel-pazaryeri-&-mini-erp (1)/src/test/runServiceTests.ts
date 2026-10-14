import { ApiDiagnosticService } from '../services/apiDiagnosticService';
import { INITIAL_STORES, INITIAL_MAIN_PRODUCTS } from '../data/initialData';
import { INITIAL_CATEGORY_MAPPINGS, INITIAL_BRAND_MAPPINGS } from '../data/categoryBrandData';
import { ProductDispatchService } from '../services/productDispatchService';

async function runTestSuite() {
  console.log('========================================================================');
  console.log('  OMNICHANNEL PAZARYERİ TÜM SERVİSLER ÇALIŞABİLİRLİK VE DOĞRULAMA TESTİ ');
  console.log('========================================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  // Test 1: Product Dispatch Service on all products and all channels
  console.log('--- TEST 1: PAZARYERİNE ÜRÜN AÇMA MOTORU & HAZIRLIK HESAPLAYICI ---');
  const channels = ['trendyol', 'hepsiburada', 'n11', 'pazarama'] as const;

  for (const prod of INITIAL_MAIN_PRODUCTS) {
    for (const channel of channels) {
      try {
        const readiness = ProductDispatchService.calculateReadiness(
          prod,
          channel,
          INITIAL_CATEGORY_MAPPINGS,
          INITIAL_BRAND_MAPPINGS
        );
        console.log(`  [OK] ${channel.toUpperCase()} - Ürün: [${prod.title.slice(0, 32)}...] Skor: %${readiness.score} - Hazır: ${readiness.isReady}`);
        passedCount++;
      } catch (err: any) {
        console.error(`  [FAIL] ${channel} - Ürün: ${prod.id} - Hata:`, err.message);
        failedCount++;
      }
    }
  }

  // Test 2: Full Diagnostic on Top 3 Stores
  console.log('\n--- TEST 2: SERVİS SAĞLIK & PROTOKOL TESTLERİ (AUTH, ORDER, INV, DISPATCH, TAXONOMY, QUESTIONS, CARGO) ---');
  const targetStores = INITIAL_STORES.slice(0, 3); // Trendyol, Trendyol Outlet, Hepsiburada

  for (const store of targetStores) {
    console.log(`\n>> Mağaza: ${store.storeName} (${store.channel.toUpperCase()})`);

    // 1. Auth Handshake
    const authRes = await ApiDiagnosticService.testAuthentication(store);
    console.log(`   [${authRes.status.toUpperCase()}] 1. Auth Handshake: HTTP ${authRes.httpStatus} (${authRes.durationMs}ms)`);
    if (authRes.status === 'passed') passedCount++; else failedCount++;

    // 2. Orders Fetch
    const orderRes = await ApiDiagnosticService.testOrderSync(store);
    console.log(`   [${orderRes.status.toUpperCase()}] 2. Order Sync Polling: HTTP ${orderRes.httpStatus} (${orderRes.durationMs}ms)`);
    if (orderRes.status === 'passed') passedCount++; else failedCount++;

    // 3. Inventory & Price Push
    const invRes = await ApiDiagnosticService.testInventoryPriceUpdate(store);
    console.log(`   [${invRes.status.toUpperCase()}] 3. Inventory & Price Push: HTTP ${invRes.httpStatus} (${invRes.durationMs}ms)`);
    if (invRes.status === 'passed') passedCount++; else failedCount++;

    // 4. Product Dispatch (Ürün Açma)
    const dispatchRes = await ApiDiagnosticService.testProductDispatch(store, INITIAL_MAIN_PRODUCTS[0]);
    console.log(`   [${dispatchRes.status.toUpperCase()}] 4. Ürün Açma Motoru: HTTP ${dispatchRes.httpStatus} (${dispatchRes.durationMs}ms) - Batch ID: ${dispatchRes.responsePayload?.batchId}`);
    if (dispatchRes.status === 'passed') passedCount++; else failedCount++;

    // 5. Taxonomy Sync
    const taxRes = await ApiDiagnosticService.testTaxonomySync(store.channel);
    console.log(`   [${taxRes.status.toUpperCase()}] 5. Kategori Ağacı & Nitelikler: HTTP ${taxRes.httpStatus} (${taxRes.durationMs}ms)`);
    if (taxRes.status === 'passed') passedCount++; else failedCount++;

    // 6. Questions Service
    const qRes = await ApiDiagnosticService.testCustomerQuestionService(store);
    console.log(`   [${qRes.status.toUpperCase()}] 6. Müşteri Soru-Cevap & SLA: HTTP ${qRes.httpStatus} (${qRes.durationMs}ms)`);
    if (qRes.status === 'passed') passedCount++; else failedCount++;

    // 7. Cargo Tariff Service
    const cargoRes = await ApiDiagnosticService.testCargoTariffService(store);
    console.log(`   [${cargoRes.status.toUpperCase()}] 7. Kargo & Desi Barem Servisi: HTTP ${cargoRes.httpStatus} (${cargoRes.durationMs}ms)`);
    if (cargoRes.status === 'passed') passedCount++; else failedCount++;
  }

  console.log('\n========================================================================');
  console.log(`  TEST SONUCU: TOPLAM ${passedCount + failedCount} TEST | BAŞARILI: ${passedCount} | BAŞARISIZ: ${failedCount}`);
  console.log('========================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test süreci kritik hata verdi:', err);
  process.exit(1);
});
