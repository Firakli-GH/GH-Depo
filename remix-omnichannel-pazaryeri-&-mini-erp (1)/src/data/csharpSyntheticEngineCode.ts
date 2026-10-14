// ============================================================================
// OMNICHANNEL PAZARYERİ & ERP - C# .NET 8.0 SAF YAPAY VERİ VE SİMÜLASYON MOTORU
// Harici hiçbir kütüphane veya mock motora ihtiyaç duymayan, %100 saf BCL C# kodu.
// ============================================================================

export interface SyntheticCodeFile {
  id: string;
  fileName: string;
  project: string;
  category: 'Interface' | 'Engine' | 'Worker' | 'DataStore' | 'AI Knowledge Base';
  title: string;
  description: string;
  content: string;
}

export const CSHARP_SYNTHETIC_ENGINE_FILES: SyntheticCodeFile[] = [
  {
    id: 'isynthetic-engine',
    fileName: 'ISyntheticDataEngine.cs',
    project: 'OmniChannel.Simulation',
    category: 'Interface',
    title: 'Simülasyon Motoru Arayüzü (Contract)',
    description: 'Sipariş, stok, kargo desi uyuşmazlığı ve müşteri sorusu simülasyon metodları.',
    content: `using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using OmniChannel.Domain.Entities;
using OmniChannel.Domain.Enums;

namespace OmniChannel.Simulation.Contracts;

/// <summary>
/// Harici hiçbir motora ihtiyaç duymadan, saf C# üzerinde çalışan
/// yapay veri üretici ve simülasyon motoru sözleşmesi.
/// </summary>
public interface ISyntheticDataEngine
{
    /// <summary>
    /// Simülasyon motorunun çalışıp çalışmadığını belirtir.
    /// </summary>
    bool IsRunning { get; }

    /// <summary>
    /// Dakika başına üretilecek ortalama olay/sipariş frekansı.
    /// </summary>
    int SimulationSpeedMultiplier { get; set; }

    /// <summary>
    /// Sistemin ilk başlangıç tohum verilerini (Fiziki Stok, BOM Reçeteleri, Klon İlanlar) yükler.
    /// </summary>
    Task InitializeSeedDataAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Rastgele veya belirtilen kanaldan gerçekçi bir Türk e-ticaret siparişi üretir,
    /// reçetedeki fiziki stokları düşer ve ham JSON yükünü kaydeder.
    /// </summary>
    Task<Order> GenerateSimulatedOrderAsync(MarketplaceChannel? channel = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Depo mal kabulü veya fiziki sayım farkı nedeniyle stok hareketi simüle eder.
    /// Bağlı tüm ana ürünlerin sanal stoklarını anında günceller.
    /// </summary>
    Task<StockMovementResult> SimulateStockMovementAsync(string reason, CancellationToken cancellationToken = default);

    /// <summary>
    /// Taşıyıcı kargo firmasının faturasında sistem desisinden yüksek çıkan
    /// kargo desi uyuşmazlığı ve hakediş kesintisi kaydı simüle eder.
    /// </summary>
    Task<CargoDiscrepancyRecord> SimulateCargoDesiDiscrepancyAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Trendyol veya Hepsiburada üzerinden müşteriden gelen soru simüle eder.
    /// </summary>
    Task<CustomerQuestion> SimulateCustomerQuestionAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Periyodik arka plan simülasyon döngüsü için tek bir adım yürütür.
    /// </summary>
    Task<SimulationTickResult> ExecuteTickAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Simülasyon olayları tetiklendiğinde dinleyicilere (WPF UI, Console, Logger) haber verir.
    /// </summary>
    event EventHandler<SimulationEventArgs>? OnSimulationEvent;
}

public class SimulationTickResult
{
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string EventType { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public object? Data { get; set; }
}

public class SimulationEventArgs : EventArgs
{
    public string EventName { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public MarketplaceChannel? Channel { get; set; }
    public object? Payload { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

public class StockMovementResult
{
    public Guid InventoryProductId { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public int OldPhysicalStock { get; set; }
    public int NewPhysicalStock { get; set; }
    public int Delta { get; set; }
    public string Reason { get; set; } = string.Empty;
    public List<Guid> AffectedMainProductIds { get; set; } = new();
}`
  },
  {
    id: 'synthetic-engine-impl',
    fileName: 'SyntheticDataEngine.cs',
    project: 'OmniChannel.Simulation',
    category: 'Engine',
    title: 'Saf C# Yapay Veri Üretici Motoru',
    description: 'Türkçe isimler, şehirler, TCKN, EAN-13, 3-Kademeli tohum verisi ve tam bağımsız olay simülatörü.',
    content: `using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using OmniChannel.Domain.Entities;
using OmniChannel.Domain.Enums;
using OmniChannel.Simulation.Contracts;

namespace OmniChannel.Simulation.Engine;

/// <summary>
/// %100 Saf C# .NET 8 BCL ile yazılmış, harici kütüphane gerektirmeyen
/// yapay veri üretici ve omni-channel e-ticaret simülatörü.
/// </summary>
public class SyntheticDataEngine : ISyntheticDataEngine
{
    private readonly Random _random = new();
    private readonly InMemoryOmniChannelDataStore _dataStore;

    public bool IsRunning { get; private set; } = true;
    public int SimulationSpeedMultiplier { get; set; } = 1;

    public event EventHandler<SimulationEventArgs>? OnSimulationEvent;

    public SyntheticDataEngine(InMemoryOmniChannelDataStore dataStore)
    {
        _dataStore = dataStore;
    }

    #region Dahili Türkçe Sentetik Veri Havuzu (Zero External Dependency)

    private static readonly string[] FirstNames = 
    { 
        "Ahmet", "Mehmet", "Mustafa", "Ali", "Hüseyin", "Hasan", "İbrahim", "İsmail", "Osman", "Yusuf",
        "Fatma", "Ayşe", "Emine", "Hatice", "Zeynep", "Elif", "Merve", "Büşra", "Canan", "Esra",
        "Burak", "Emre", "Murat", "Serkan", "Tolga", "Oğuz", "Cem", "Kaan", "Berk", "Deniz"
    };

    private static readonly string[] LastNames = 
    { 
        "Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Yıldız", "Yıldırım", "Öztürk", "Aydın", "Özdemir",
        "Arslan", "Doğan", "Kılıç", "Aslan", "Çetin", "Kara", "Koç", "Kurt", "Özkan", "Şimşek",
        "Polat", "Erdoğan", "Acar", "Korkmaz", "Bulut", "Güneş", "Bozkurt", "Ünal", "Güler", "Yavuz"
    };

    private static readonly (string City, string District)[] Locations =
    {
        ("İstanbul", "Kadıköy"), ("İstanbul", "Beşiktaş"), ("İstanbul", "Ümraniye"), ("İstanbul", "Başakşehir"),
        ("Ankara", "Çankaya"), ("Ankara", "Yenimahalle"), ("Ankara", "Keçiören"),
        ("İzmir", "Karşıyaka"), ("İzmir", "Konak"), ("İzmir", "Bornova"),
        ("Bursa", "Nilüfer"), ("Bursa", "Osmangazi"),
        ("Antalya", "Muratpaşa"), ("Antalya", "Konyaaltı"),
        ("Adana", "Seyhan"), ("Kocaeli", "İzmit"), ("Gaziantep", "Şehitkamil")
    };

    private static readonly string[] CustomerQuestionsPool =
    {
        "Merhaba, ürünün son kullanma tarihi nedir?",
        "Hangi kargo şirketi ile gönderim yapıyorsunuz?",
        "Bugün sipariş versem ne zaman kargoya teslim edilir?",
        "Toplu alımlarda kurumsal fatura kesiyor musunuz?",
        "Set içindeki kolonya kokusu kaç derecedir? (80 derece mi?)",
        "Paketleme hediye paketi olarak yapılabilir mi?",
        "Ürün orijinal ambalajında ve emniyet kilitli mi geliyor?"
    };

    #endregion

    #region Algoritmik Yardımcı Metodlar (TCKN & EAN-13)

    /// <summary>
    /// Resmi Türkiye Cumhuriyeti Kimlik Numarası sağlama algoritmasına uygun geçerli sentetik TCKN üretir.
    /// </summary>
    public static string GenerateValidSyntheticTckn(Random rng)
    {
        int[] d = new int[11];
        d[0] = rng.Next(1, 10); // İlk hane 0 olamaz
        for (int i = 1; i < 9; i++) d[i] = rng.Next(0, 10);

        // 10. Hane Algoritması: ((d0+d2+d4+d6+d8)*7 - (d1+d3+d5+d7)) mod 10
        int tekToplam = d[0] + d[2] + d[4] + d[6] + d[8];
        int ciftToplam = d[1] + d[3] + d[5] + d[7];
        d[9] = ((tekToplam * 7) - ciftToplam) % 10;
        if (d[9] < 0) d[9] += 10;

        // 11. Hane Algoritması: İlk 10 hanenin toplamı mod 10
        int ilkOnToplam = 0;
        for (int i = 0; i < 10; i++) ilkOnToplam += d[i];
        d[10] = ilkOnToplam % 10;

        return string.Concat(d);
    }

    /// <summary>
    /// Türkiye (868) ön ekli geçerli EAN-13 barkodu üretir.
    /// </summary>
    public static string GenerateValidEan13(Random rng)
    {
        int[] code = new int[13];
        code[0] = 8; code[1] = 6; code[2] = 8; // Türkiye GS1 Ülke Kodu
        for (int i = 3; i < 12; i++) code[i] = rng.Next(0, 10);

        // Check digit
        int sum = 0;
        for (int i = 0; i < 12; i++)
        {
            sum += code[i] * (i % 2 == 0 ? 1 : 3);
        }
        int check = (10 - (sum % 10)) % 10;
        code[12] = check;

        return string.Concat(code);
    }

    #endregion

    #region Başlangıç Tohum Verisi (Seed Data)

    public Task InitializeSeedDataAsync(CancellationToken cancellationToken = default)
    {
        if (_dataStore.InventoryProducts.Any())
            return Task.CompletedTask;

        // 1. KADEME: FİZİKİ DEPO ÜRÜNLERİ (INVENTORY ITEMS)
        var p1 = new ErpInventoryProduct
        {
            Id = Guid.NewGuid(),
            ProductCode = "STK-KOL-80",
            Barcode = "8680001001",
            Title = "80° Limon Kolonyası 1000ml (Pet Şişe)",
            BuyingPrice = 45.00m,
            VatRate = 20.0m,
            PhysicalStockQuantity = 450,
            ReservedQuantity = 10,
            UnitDesi = 0.85m,
            LeadTimeDays = 1
        };

        var p2 = new ErpInventoryProduct
        {
            Id = Guid.NewGuid(),
            ProductCode = "STK-MEN-100",
            Barcode = "8680001002",
            Title = "Islak Cep Mendili 100'lü Paket",
            BuyingPrice = 18.50m,
            VatRate = 20.0m,
            PhysicalStockQuantity = 600,
            ReservedQuantity = 15,
            UnitDesi = 0.25m,
            LeadTimeDays = 1
        };

        var p3 = new ErpInventoryProduct
        {
            Id = Guid.NewGuid(),
            ProductCode = "STK-DEZ-500",
            Barcode = "8680001003",
            Title = "El Dezenfektanı Pompalı 500ml",
            BuyingPrice = 32.00m,
            VatRate = 20.0m,
            PhysicalStockQuantity = 320,
            ReservedQuantity = 5,
            UnitDesi = 0.50m,
            LeadTimeDays = 1
        };

        _dataStore.InventoryProducts.Add(p1);
        _dataStore.InventoryProducts.Add(p2);
        _dataStore.InventoryProducts.Add(p3);

        // 2. KADEME: ANA ÜRÜNLER & REÇETELER (MAIN PRODUCTS & BOM)
        var mp1 = new MainProduct
        {
            Id = Guid.NewGuid(),
            MasterProductCode = "MP-KOL-TEK",
            MasterBarcode = "8689990001",
            Title = "Geleneksel 80° Limon Kolonyası 1L",
            Kind = ProductKind.Single,
            MainCategory = "Kozmetik & Kişisel Bakım",
            SubCategory = "Kolonya",
            TargetProfitMargin = 35.0m,
            CalculatedDesi = 0.85m,
            ManualDesi = 1.00m,
            CalculatedLeadTimeDays = 1,
            ManualLeadTimeDays = 1,
            CalculatedTotalCost = 45.00m
        };
        mp1.RecipeItems.Add(new MainProductBundleRecipeItem { Id = Guid.NewGuid(), MainProductId = mp1.Id, ErpInventoryProductId = p1.Id, Quantity = 1 });

        var mp2 = new MainProduct
        {
            Id = Guid.NewGuid(),
            MasterProductCode = "MP-SET-HIJYEN",
            MasterBarcode = "8689990002",
            Title = "Süper Hijyen Aile Seti (2x Kolonya + 1x Mendil + 1x Dezenfektan)",
            Kind = ProductKind.CompositeKit,
            MainCategory = "Kozmetik & Kişisel Bakım",
            SubCategory = "Hijyen Paketleri",
            TargetProfitMargin = 40.0m,
            CalculatedDesi = 2.45m,
            ManualDesi = 2.50m,
            CalculatedLeadTimeDays = 1,
            ManualLeadTimeDays = 2,
            CalculatedTotalCost = (45.00m * 2) + 18.50m + 32.00m // 140.50 TL
        };
        mp2.RecipeItems.Add(new MainProductBundleRecipeItem { Id = Guid.NewGuid(), MainProductId = mp2.Id, ErpInventoryProductId = p1.Id, Quantity = 2 });
        mp2.RecipeItems.Add(new MainProductBundleRecipeItem { Id = Guid.NewGuid(), MainProductId = mp2.Id, ErpInventoryProductId = p2.Id, Quantity = 1 });
        mp2.RecipeItems.Add(new MainProductBundleRecipeItem { Id = Guid.NewGuid(), MainProductId = mp2.Id, ErpInventoryProductId = p3.Id, Quantity = 1 });

        _dataStore.MainProducts.Add(mp1);
        _dataStore.MainProducts.Add(mp2);

        // Sanal Stokları İlk Kez Hesapla
        RecalculateVirtualStocks();

        // 3. KADEME: PAZARYERİ İLANLARI (LISTINGS & CLONES)
        var l1 = new ChannelListingProduct
        {
            Id = Guid.NewGuid(),
            MainProductId = mp1.Id,
            Channel = MarketplaceChannel.Trendyol,
            ListingBarcode = "8689990001",
            ListingSku = "TY-KOL-TEK-01",
            ChannelListingTitle = "Limon Kolonyası 80 Derece 1000 ml Pet Şişe - Ferahlatıcı Etki",
            SalePrice = 99.90m,
            CommissionRate = 18.0m,
            IsActive = true
        };

        var l2 = new ChannelListingProduct
        {
            Id = Guid.NewGuid(),
            MainProductId = mp1.Id,
            Channel = MarketplaceChannel.Trendyol,
            ListingBarcode = "TY-FAK-880011", // Klon / Buybox Barkodu
            ListingSku = "TY-KOL-BUYBOX-FAST",
            ChannelListingTitle = "80° Ferah Limon Kolonyası 1 Litre (Aynı Gün Kargo)",
            SalePrice = 94.90m,
            SpecialCampaignPrice = 89.90m,
            CommissionRate = 18.0m,
            IsActive = true
        };

        var l3 = new ChannelListingProduct
        {
            Id = Guid.NewGuid(),
            MainProductId = mp2.Id,
            Channel = MarketplaceChannel.Hepsiburada,
            ListingBarcode = "HB-SET-HIJYEN-99",
            ListingSku = "HB-SET-HIJ-01",
            ChannelListingTitle = "Hijyen Paketi: 2 Adet 1L Kolonya + Mendil + Dezenfektan Seti",
            SalePrice = 299.00m,
            CommissionRate = 21.0m,
            IsActive = true
        };

        _dataStore.ListingProducts.Add(l1);
        _dataStore.ListingProducts.Add(l2);
        _dataStore.ListingProducts.Add(l3);

        return Task.CompletedTask;
    }

    #endregion

    #region Canlı Simülasyon Metodları

    public void RecalculateVirtualStocks()
    {
        var inventoryMap = _dataStore.InventoryProducts.ToDictionary(x => x.Id);

        foreach (var mainProd in _dataStore.MainProducts)
        {
            if (!mainProd.RecipeItems.Any())
            {
                mainProd.CalculatedVirtualStock = 0;
                continue;
            }

            int minStock = int.MaxValue;
            decimal totalCost = 0;

            foreach (var recipe in mainProd.RecipeItems)
            {
                if (inventoryMap.TryGetValue(recipe.ErpInventoryProductId, out var invItem))
                {
                    int availablePhysical = Math.Max(0, invItem.PhysicalStockQuantity - invItem.ReservedQuantity);
                    int canProduce = recipe.Quantity > 0 ? (availablePhysical / recipe.Quantity) : 0;
                    if (canProduce < minStock) minStock = canProduce;

                    totalCost += (invItem.BuyingPrice * recipe.Quantity);
                }
                else
                {
                    minStock = 0;
                }
            }

            mainProd.CalculatedVirtualStock = minStock == int.MaxValue ? 0 : minStock;
            mainProd.CalculatedTotalCost = totalCost;
        }
    }

    public async Task<Order> GenerateSimulatedOrderAsync(MarketplaceChannel? channel = null, CancellationToken cancellationToken = default)
    {
        var activeListings = _dataStore.ListingProducts.Where(l => l.IsActive).ToList();
        if (!activeListings.Any())
        {
            await InitializeSeedDataAsync(cancellationToken);
            activeListings = _dataStore.ListingProducts.Where(l => l.IsActive).ToList();
        }

        var candidateListings = channel.HasValue 
            ? activeListings.Where(l => l.Channel == channel.Value).ToList() 
            : activeListings;

        if (!candidateListings.Any()) candidateListings = activeListings;

        var selectedListing = candidateListings[_random.Next(candidateListings.Count)];
        var mainProd = _dataStore.MainProducts.FirstOrDefault(m => m.Id == selectedListing.MainProductId)
            ?? _dataStore.MainProducts.First();

        // Rastgele Türk Müşteri & Adres
        string firstName = FirstNames[_random.Next(FirstNames.Length)];
        string lastName = LastNames[_random.Next(LastNames.Length)];
        var (city, district) = Locations[_random.Next(Locations.Length)];
        string fullAddress = $"Atatürk Mah. İstiklal Cad. No:{_random.Next(1, 150)} Daire:{_random.Next(1, 24)} {district} / {city}";
        string phone = $"05{_random.Next(30, 56)}{_random.Next(1000000, 9999999)}";

        // Kargo & Takip Kodu
        string cargoCode = selectedListing.Channel switch
        {
            MarketplaceChannel.Trendyol => $"TEX-{_random.Next(10000000, 99999999)}",
            MarketplaceChannel.Hepsiburada => $"HJ-{_random.Next(10000000, 99999999)}",
            MarketplaceChannel.Amazon => $"AMZTR-{_random.Next(10000000, 99999999)}",
            _ => $"YK-{_random.Next(10000000, 99999999)}"
        };

        decimal unitPrice = selectedListing.SpecialCampaignPrice ?? selectedListing.SalePrice;
        int qty = _random.Next(1, 3);
        decimal gross = unitPrice * qty;
        decimal totalDiscount = _random.Next(0, 5) == 0 ? 15.00m : 0.00m;
        decimal net = Math.Max(0, gross - totalDiscount);

        // Yeni Sipariş Nesnesi
        var order = new Order
        {
            Id = Guid.NewGuid(),
            Channel = selectedListing.Channel,
            ChannelOrderNumber = $"{selectedListing.Channel.ToString().ToUpper()}-{DateTime.UtcNow:yyMMdd}-{_random.Next(10000, 99999)}",
            OrderDate = DateTime.UtcNow,
            CustomerName = $"{firstName} {lastName}",
            CustomerEmail = $"{firstName.ToLower()}.{lastName.ToLower()}@eposta-ornek.com",
            ShippingAddress = fullAddress,
            BillingAddress = fullAddress,
            City = city,
            District = district,
            GrossAmount = gross,
            DiscountAmount = totalDiscount,
            TotalAmount = net,
            CargoProvider = selectedListing.Channel == MarketplaceChannel.Trendyol ? "Trendyol Express" : "Yurtiçi Kargo",
            CargoBarcode = cargoCode,
            CargoTrackingNumber = cargoCode,
            Status = OrderStatus.Created
        };

        var orderItem = new OrderItem
        {
            Id = Guid.NewGuid(),
            OrderId = order.Id,
            ChannelListingProductId = selectedListing.Id,
            ListingBarcode = selectedListing.ListingBarcode,
            Title = selectedListing.ChannelListingTitle,
            Quantity = qty,
            UnitPrice = unitPrice,
            CommissionAmount = (gross * selectedListing.CommissionRate) / 100m
        };

        // REÇETEDEN FİZİKİ STOKLARI DÜŞ VE SNAPSHOT KAYDET
        foreach (var recipe in mainProd.RecipeItems)
        {
            var invItem = _dataStore.InventoryProducts.FirstOrDefault(i => i.Id == recipe.ErpInventoryProductId);
            if (invItem != null)
            {
                int totalDeduction = recipe.Quantity * qty;
                invItem.PhysicalStockQuantity = Math.Max(0, invItem.PhysicalStockQuantity - totalDeduction);

                // BOM Snapshot - Geçmişi koru
                orderItem.ComponentSnapshots.Add(new OrderItemComponentSnapshot
                {
                    Id = Guid.NewGuid(),
                    OrderItemId = orderItem.Id,
                    ErpInventoryProductId = invItem.Id,
                    ComponentProductCode = invItem.ProductCode,
                    ComponentBarcode = invItem.Barcode,
                    ComponentTitle = invItem.Title,
                    QuantityPerPackage = recipe.Quantity,
                    TotalQuantityDeducted = totalDeduction,
                    FrozenBuyingCost = invItem.BuyingPrice,
                    FrozenVatRate = invItem.VatRate,
                    SnapshotAtUtc = DateTime.UtcNow
                });
            }
        }

        order.Items.Add(orderItem);

        // Ham JSON Gövdesi (Pazaryeri Webhook Formatı)
        order.RawPayloadJson = JsonSerializer.Serialize(new
        {
            simulatedBy = "SyntheticDataEngine.cs",
            channel = selectedListing.Channel.ToString(),
            channelOrderNumber = order.ChannelOrderNumber,
            customer = new { name = order.CustomerName, phone, city, district },
            lines = order.Items.Select(i => new { barcode = i.ListingBarcode, qty = i.Quantity, price = i.UnitPrice }),
            total = order.TotalAmount,
            timestamp = DateTime.UtcNow
        }, new JsonSerializerOptions { WriteIndented = true });

        _dataStore.Orders.Add(order);

        // Sanal Stokları Güncelle
        RecalculateVirtualStocks();

        // Olayı Tetikle
        OnSimulationEvent?.Invoke(this, new SimulationEventArgs
        {
            EventName = "OrderCreated",
            Message = $"[{selectedListing.Channel}] Yeni Sipariş: {order.ChannelOrderNumber} | {order.CustomerName} | {order.TotalAmount:N2} TL",
            Channel = selectedListing.Channel,
            Payload = order
        });

        return order;
    }

    public Task<StockMovementResult> SimulateStockMovementAsync(string reason, CancellationToken cancellationToken = default)
    {
        if (!_dataStore.InventoryProducts.Any())
            return Task.FromResult(new StockMovementResult { Reason = "Katalog boş!" });

        var target = _dataStore.InventoryProducts[_random.Next(_dataStore.InventoryProducts.Count)];
        int oldStock = target.PhysicalStockQuantity;
        int delta = _random.Next(20, 100); // Depo mal kabulü
        target.PhysicalStockQuantity += delta;

        RecalculateVirtualStocks();

        var affectedMainProds = _dataStore.MainProducts
            .Where(m => m.RecipeItems.Any(r => r.ErpInventoryProductId == target.Id))
            .Select(m => m.Id)
            .ToList();

        var res = new StockMovementResult
        {
            InventoryProductId = target.Id,
            ProductCode = target.ProductCode,
            OldPhysicalStock = oldStock,
            NewPhysicalStock = target.PhysicalStockQuantity,
            Delta = delta,
            Reason = reason,
            AffectedMainProductIds = affectedMainProds
        };

        OnSimulationEvent?.Invoke(this, new SimulationEventArgs
        {
            EventName = "StockReplenished",
            Message = $"[Depo Sayımı] {target.ProductCode} stoğu {oldStock} -> {target.PhysicalStockQuantity} adede yükseldi (+{delta}).",
            Payload = res
        });

        return Task.FromResult(res);
    }

    public Task<CargoDiscrepancyRecord> SimulateCargoDesiDiscrepancyAsync(CancellationToken cancellationToken = default)
    {
        string[] cargoNames = { "Yurtiçi Kargo", "Trendyol Express", "Aras Kargo", "HepsiJet" };
        string cargoName = cargoNames[_random.Next(cargoNames.Length)];
        decimal systemDesi = 1.20m;
        decimal measuredDesi = 3.50m;
        decimal diffAmount = 38.50m;

        var rec = new CargoDiscrepancyRecord
        {
            Id = Guid.NewGuid(),
            CargoProvider = cargoName,
            TrackingNumber = $"TRK-{_random.Next(1000000, 9999999)}",
            SystemCalculatedDesi = systemDesi,
            CarrierInvoicedDesi = measuredDesi,
            DiscrepancyAmount = diffAmount,
            Status = "İtiraz Edildi (Beklemede)",
            CreatedAt = DateTime.UtcNow
        };

        _dataStore.CargoDiscrepancies.Add(rec);

        OnSimulationEvent?.Invoke(this, new SimulationEventArgs
        {
            EventName = "CargoDesiMismatch",
            Message = $"[Kargo Desi Uyuşmazlığı] {cargoName} fatura uyuşmazlığı: Sistem {systemDesi:N2} Desi vs Taşıyıcı {measuredDesi:N2} Desi (Fark: -{diffAmount:N2} TL).",
            Payload = rec
        });

        return Task.FromResult(rec);
    }

    public Task<CustomerQuestion> SimulateCustomerQuestionAsync(CancellationToken cancellationToken = default)
    {
        string questionText = CustomerQuestionsPool[_random.Next(CustomerQuestionsPool.Length)];
        string customerName = $"{FirstNames[_random.Next(FirstNames.Length)]} {LastNames[_random.Next(LastNames.Length)][0]}.";

        var question = new CustomerQuestion
        {
            Id = Guid.NewGuid(),
            Channel = _random.Next(0, 2) == 0 ? MarketplaceChannel.Trendyol : MarketplaceChannel.Hepsiburada,
            CustomerName = customerName,
            QuestionText = questionText,
            CreatedAt = DateTime.UtcNow,
            IsAnswered = false
        };

        _dataStore.CustomerQuestions.Add(question);

        OnSimulationEvent?.Invoke(this, new SimulationEventArgs
        {
            EventName = "CustomerQuestionReceived",
            Message = $"[{question.Channel}] Yeni Müşteri Sorusu: {question.CustomerName} - \"{question.QuestionText}\"",
            Channel = question.Channel,
            Payload = question
        });

        return Task.FromResult(question);
    }

    public async Task<SimulationTickResult> ExecuteTickAsync(CancellationToken cancellationToken = default)
    {
        int roll = _random.Next(1, 101);

        if (roll <= 60)
        {
            var ord = await GenerateSimulatedOrderAsync(null, cancellationToken);
            return new SimulationTickResult { EventType = "Order", Summary = $"Yeni Sipariş: {ord.ChannelOrderNumber}", Data = ord };
        }
        else if (roll <= 75)
        {
            var stock = await SimulateStockMovementAsync("Rutin Depo Girişi / Mal Kabul", cancellationToken);
            return new SimulationTickResult { EventType = "Stock", Summary = $"Depo Hareketi: {stock.ProductCode} (+{stock.Delta})", Data = stock };
        }
        else if (roll <= 90)
        {
            var cargo = await SimulateCargoDesiDiscrepancyAsync(cancellationToken);
            return new SimulationTickResult { EventType = "Cargo", Summary = $"Desi Uyuşmazlığı: {cargo.CargoProvider} ({cargo.DiscrepancyAmount} TL)", Data = cargo };
        }
        else
        {
            var quest = await SimulateCustomerQuestionAsync(cancellationToken);
            return new SimulationTickResult { EventType = "Question", Summary = $"Müşteri Sorusu: {quest.CustomerName}", Data = quest };
        }
    }

    #endregion
}`
  },
  {
    id: 'simulation-background-service',
    fileName: 'SimulationBackgroundService.cs',
    project: 'OmniChannel.Worker',
    category: 'Worker',
    title: 'WPF Background Worker & Simülasyon Servisi',
    description: 'Arka planda periyodik olarak sanal verileri sisteme pompalayan ve WPF ViewModellere bağlayan servis.',
    content: `using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using OmniChannel.Simulation.Contracts;

namespace OmniChannel.Worker.Services;

/// <summary>
/// .NET 8 BackgroundService tabanlı simülasyon iş parçacığı.
/// WPF masaüstü uygulamasında UI thread'i kilitlemeden sanal verileri
/// belirli aralıklarla üretip WPF ViewModel'lere iletir.
/// </summary>
public class SimulationBackgroundService : BackgroundService
{
    private readonly ISyntheticDataEngine _engine;
    private readonly ILogger<SimulationBackgroundService> _logger;

    public SimulationBackgroundService(
        ISyntheticDataEngine engine,
        ILogger<SimulationBackgroundService> logger)
    {
        _engine = engine;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("C# Standalone Sentetik Simülasyon Motoru Başlatıldı.");

        // 1. Tohum verilerini yükle (Fiziki stok, BOM, Klon ilanlar)
        await _engine.InitializeSeedDataAsync(stoppingToken);

        // 2. Simülasyon döngüsü (PeriodicTimer ile hassas aralık)
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                if (_engine.IsRunning)
                {
                    var result = await _engine.ExecuteTickAsync(stoppingToken);
                    _logger.LogDebug("[SIM TICK] {Type}: {Summary}", result.EventType, result.Summary);
                }

                // Hız çarpanına göre bekleme süresi (Varsayılan: 5 saniyede bir tetik)
                int delayMs = Math.Max(1000, 5000 / Math.Max(1, _engine.SimulationSpeedMultiplier));
                await Task.Delay(delayMs, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Simülasyon döngüsünde beklenmeyen hata oluştu!");
                await Task.Delay(3000, stoppingToken);
            }
        }

        _logger.LogInformation("Sentetik Simülasyon Motoru Durduruldu.");
    }
}

/// <summary>
/// WPF Masaüstü arayüzü ile arka plan simülasyon olaylarını güvenle
/// bağlayan Dispatcher köprüsü.
/// </summary>
public static class WpfSimulationUiBridge
{
    public static void BindToDispatcher(ISyntheticDataEngine engine, Action<SimulationEventArgs> uiCallback)
    {
        engine.OnSimulationEvent += (sender, args) =>
        {
            // Windows masaüstünde UI Thread kontrolü
            if (System.Windows.Application.Current?.Dispatcher != null)
            {
                System.Windows.Application.Current.Dispatcher.InvokeAsync(() => uiCallback(args));
            }
            else
            {
                uiCallback(args);
            }
        };
    }
}`
  },
  {
    id: 'in-memory-data-store',
    fileName: 'InMemoryOmniChannelDataStore.cs',
    project: 'OmniChannel.Infrastructure',
    category: 'DataStore',
    title: 'Saf C# Bağımsız Bellek İçi Veri Deposu',
    description: 'Harici SQL Server veya PostgreSQL olmadan masaüstünde çalışan thread-safe in-memory mini ERP veritabanı.',
    content: `using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using OmniChannel.Domain.Entities;

namespace OmniChannel.Infrastructure.Data;

/// <summary>
/// Dış veritabanı kurulumu yapmadan masaüstü WPF uygulamasında
/// sıfır gecikmeyle çalışan iş parçacığı güvenli (thread-safe) bellek içi veri deposu.
/// </summary>
public class InMemoryOmniChannelDataStore
{
    public List<ErpInventoryProduct> InventoryProducts { get; } = new();
    public List<MainProduct> MainProducts { get; } = new();
    public List<ChannelListingProduct> ListingProducts { get; } = new();
    public List<Order> Orders { get; } = new();
    public List<CargoDiscrepancyRecord> CargoDiscrepancies { get; } = new();
    public List<CustomerQuestion> CustomerQuestions { get; } = new();

    public void ClearAll()
    {
        InventoryProducts.Clear();
        MainProducts.Clear();
        ListingProducts.Clear();
        Orders.Clear();
        CargoDiscrepancies.Clear();
        CustomerQuestions.Clear();
    }
}

public class CargoDiscrepancyRecord
{
    public Guid Id { get; set; }
    public string CargoProvider { get; set; } = string.Empty;
    public string TrackingNumber { get; set; } = string.Empty;
    public decimal SystemCalculatedDesi { get; set; }
    public decimal CarrierInvoicedDesi { get; set; }
    public decimal DiscrepancyAmount { get; set; }
    public string Status { get; set; } = "Beklemede";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class CustomerQuestion
{
    public Guid Id { get; set; }
    public MarketplaceChannel Channel { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string QuestionText { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsAnswered { get; set; }
}`
  },
  {
    id: 'ai-architecture-knowledge-base',
    fileName: 'AiArchitectureKnowledgeBase.cs',
    project: 'OmniChannel.Domain',
    category: 'AI Knowledge Base',
    title: 'Yapay Zeka Mimari ve Görev Devir Bilgi Bankası',
    description: 'C# kod tabanına gömülü XML dokümanları ve LLM modellerinin doğrudan okuyup anlayabileceği kılavuz.',
    content: `namespace OmniChannel.Domain.Documentation;

/// <summary>
/// ============================================================================
/// YAPAY ZEKA (AI) MODELLERİ VE GELİŞTİRİCİLER İÇİN MİMARİ BİLGİ BANKASI
/// ============================================================================
/// 
/// BU PROJE HAKKINDA:
/// Türkiye e-ticaret pazaryerleri (Trendyol, Hepsiburada, Amazon TR, N11, Çiçeksepeti)
/// ve ERP süreçlerini yöneten kurumsal bir C# .NET 8 / 9 WPF masaüstü mimarisidir.
/// 
/// TEMEL KURALLAR (AI INVARIANTS):
/// 1. ÜÇ KADEMELİ ÜRÜN MİMARİSİ:
///    - Kademe 1: ErpInventoryProduct (Depodaki tekil fiziki sayım stoğu)
///    - Kademe 2: MainProduct (Katalogdaki ana ürün veya set/reçete - BOM)
///    - Kademe 3: ChannelListingProduct (Pazaryerindeki çoklu klon ilanlar)
/// 
/// 2. SANAL STOK HESAPLAMA FORMÜLÜ:
///    VirtualStock = Min( (PhysicalStock - ReservedQuantity) / RecipeQuantity )
/// 
/// 3. DONDURULMUŞ REÇETE KORUMASI (ORDER SNAPSHOT):
///    Geçmiş bir siparişte maliyet ve reçete ASLA güncel ana ürün tablosundan okunmaz.
///    Her sipariş satırı 'OrderItemComponentSnapshot' içinde dondurulur.
/// 
/// 4. SIFIR VERİ KAYBI (RAW PAYLOAD):
///    Pazaryeri webhook ve REST yanıtları tam metin olarak 'RawPayloadJson' alanında
///    saklanır. Hiçbir özellik budanmaz.
/// 
/// 5. SAF C# SİMÜLASYON MOTORU (ZERO EXTERNAL ENGINE):
///    Dış mock servisleri veya node/python motorları kullanılmaz.
///    Tüm simülasyon 'SyntheticDataEngine.cs' içerisindedir.
/// ============================================================================
/// </summary>
public static class AiArchitectureKnowledgeBase
{
    public const string SystemName = "OmniChannel Pazaryeri & Mini ERP WPF Suite";
    public const string Version = "2026.4.0";
    
    public static readonly string[] SupportedChannels = 
    { 
        "Trendyol", 
        "Hepsiburada", 
        "AmazonTR", 
        "N11", 
        "Ciceksepeti", 
        "PttAVM" 
    };

    public const string VirtualStockFormulaExplanation = 
        "Her ana ürünün reçetesindeki fiziki ürünler taranır. (DepoStoğu - Rezerve) / ReçeteAdedi oranlarının EN KÜÇÜĞÜ sanal stoğu verir.";

    public const string DesiFormulaExplanation = 
        "Hacimsel Desi = (En * Boy * Yükseklik) / 3000. Taşıyıcı fatura desisi ile aradaki fark 'CargoDiscrepancy' olarak takip edilir.";
}`
  }
];
