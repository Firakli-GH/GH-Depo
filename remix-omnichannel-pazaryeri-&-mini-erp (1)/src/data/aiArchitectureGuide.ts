// ============================================================================
// OMNICHANNEL PAZARYERİ & ERP - YAPAY ZEKA (AI) GELİŞTİRİCİ VE MİMARİ REHBERİ
// Görevi devralan AI modelleri ve mühendisler için tek gerçek kaynak.
// ============================================================================

export interface AiRuleItem {
  id: string;
  title: string;
  badge: string;
  color: 'blue' | 'emerald' | 'amber' | 'purple' | 'red';
  summary: string;
  details: string;
  codeSnippet?: string;
}

export const AI_CORE_INVARIANTS: AiRuleItem[] = [
  {
    id: 'three-tier-architecture',
    title: '3 Kademeli Ürün Mimarisi Kuralı',
    badge: 'Temel Mimari',
    color: 'blue',
    summary: 'Fiziki Stok -> Ana Ürün / BOM Reçetesi -> Pazaryeri Klon İlanları ayrımı esastır.',
    details: 'Pazaryerindeki satış ilanları (Kademe 3) depodaki fiziki ürünü (Kademe 1) asla doğrudan tüketmez; aradaki Ana Ürün (Kademe 2) ve Reçete (BOM) üzerinden sanal stok hesaplanır ve düşülür.',
    codeSnippet: `// 1. Kademe: ErpInventoryProduct (Depo Stoğu: 450 adet)
// 2. Kademe: MainProduct (Reçete: 2x ErpInventoryProduct)
// 3. Kademe: ChannelListingProduct (Trendyol, HB, Amazon klon ilanları)`
  },
  {
    id: 'virtual-stock-formula',
    title: 'Sanal Stok Hesaplama Kanunu',
    badge: 'Matematiksel Formül',
    color: 'emerald',
    summary: 'Sanal Stok = Reçetedeki her bir bileşen için (Fiziki Stok - Rezerve) / Reçete Adedi oranlarının minimumudur.',
    details: 'Paket veya setin satışa sunulabilecek maksimum adedi, reçetedeki en az stoğa sahip (darboğaz) bileşen tarafından sınırlandırılır.',
    codeSnippet: `int minStock = int.MaxValue;
foreach (var recipe in mainProduct.RecipeItems) {
    int available = recipe.PhysicalStock - recipe.ReservedQuantity;
    int canProduce = available / recipe.Quantity;
    if (canProduce < minStock) minStock = canProduce;
}
return minStock;`
  },
  {
    id: 'snapshot-freezing',
    title: 'BOM Snapshot ile Geçmişi Dondurma',
    badge: 'Finansal Güvenlik',
    color: 'purple',
    summary: 'Sipariş anında reçete ve birim alış maliyeti kalıcı olarak dondurulur.',
    details: 'Katalogdaki reçete veya maliyet gelecekte değişse bile, geçmiş siparişlerin kâr-zarar hesabı ve parça düşüş kayıtları asla bozulmaz.',
    codeSnippet: `orderItem.ComponentSnapshots.Add(new OrderItemComponentSnapshot {
    FrozenBuyingCost = invItem.BuyingPrice,
    TotalQuantityDeducted = recipe.Quantity * orderItem.Quantity,
    SnapshotAtUtc = DateTime.UtcNow
});`
  },
  {
    id: 'raw-payload-immutability',
    title: 'Sıfır Veri Kaybı (RawPayloadJson)',
    badge: 'Audit & Webhook',
    color: 'amber',
    summary: 'Pazaryeri API/Webhook JSON yanıtı hiçbir kırpma yapılmadan ham string olarak saklanır.',
    details: 'DTO haritalamasında eksik alan kalsa dahi, gelecekteki olası uyuşmazlık veya adli incelemelerde pazaryerinin gönderdiği orijinal metin her zaman okunabilir.',
    codeSnippet: `order.RawPayloadJson = rawHttpResponseJson; // NVARCHAR(MAX) / JSONB`
  },
  {
    id: 'cargo-desi-reconciliation',
    title: 'Kargo Desi Uyuşmazlığı ve Hakediş Mutabakatı',
    badge: 'Kargo & Finans',
    color: 'red',
    summary: 'Sistem koli desisi ile kargo firmasının faturaya yansıttığı desi farkı anında tespit edilir.',
    details: 'Taşıyıcı desi farkından kaynaklı haksız navlun kesintileri tespit edilerek otomatik itiraz dosyası hazırlanır.',
    codeSnippet: `decimal diffAmount = (carrierDesi - systemDesi) * carrierDesiUnitPrice;
// Otomatik CargoDiscrepancyRecord üretilir.`
  }
];

export const AI_SYSTEM_PROMPT_BRIEF = `Sen Türkiye e-ticaret pazaryerleri (Trendyol, Hepsiburada, Amazon TR, N11, Çiçeksepeti, PttAVM) için C# .NET 8 / 9 WPF masaüstü ve Mini ERP geliştiren kıdemli yazılım mimarısın.

GÖREV DEVİR VE GELİŞTİRME KURALLARI:
1. ÜRÜN MODELİ: 3 Kademeli mimariyi (ErpInventoryProduct -> MainProduct/BOM -> ChannelListingProduct) asla bozma.
2. SANAL VERİ MOTORU: Harici bir mock sunucusuna (node/python/docker) BAĞLANMA. Simülasyon %100 saf C# BCL sınıfı olan 'SyntheticDataEngine.cs' ve 'InMemoryOmniChannelDataStore.cs' içinde kalmalıdır.
3. WPF MVVM: CommunityToolkit.Mvvm standartlarına uy; [ObservableProperty] ve [RelayCommand] kullan.
4. ÇİFT DESİ VE ÇİFT TERMİN: Hem bileşenlerden hesaplanan hem de elle girilen (manual override) değerleri destekle.
5. SİPARİŞ GEÇMİŞİ: Siparişleri sorgularken daima OrderItemComponentSnapshot üzerinden maliyet oku.
6. TÜRK PAZARYERİ KURALLARI: Barkodlar 868 ile başlamalıdır veya kanala özel klon barkod olmalıdır (TY-FAK-*, HB-*). Kargo takip kodları kanala özgüdür (TEX-*, HJ-*, AMZTR-*).`;
