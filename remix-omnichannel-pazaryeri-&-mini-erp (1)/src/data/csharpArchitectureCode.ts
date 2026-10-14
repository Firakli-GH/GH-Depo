import { CSHARP_SYNTHETIC_ENGINE_FILES } from './csharpSyntheticEngineCode';

export interface CodeSnippet {
  fileName: string;
  project: string;
  category: 'Entity' | 'DbContext' | 'Worker' | 'Adapter' | 'WPF MVVM' | 'DI & Config' | 'Simulation & AI';
  summary: string;
  language: string;
  content: string;
}

export const CSHARP_ARCHITECTURE_CODE: CodeSnippet[] = [
  {
    fileName: '3TierProducts.cs',
    project: 'OmniChannel.Domain',
    category: 'Entity',
    summary: '3 Kademeli Ürün Mimarisi: Fiziki Depo Stoğu, Ana Ürün & Paket Reçetesi (BOM) ve Pazaryeri Çoklu/Klon İlanları.',
    language: 'csharp',
    content: `using OmniChannel.Domain.Enums;

namespace OmniChannel.Domain.Entities;

// =========================================================================
// 1. KADEME: MİNİ ERP FİZİKİ DEPO STOK ÜRÜNÜ (INVENTORY ITEM)
// =========================================================================
public class ErpInventoryProduct
{
    public Guid Id { get; set; }
    public string ProductCode { get; set; } = string.Empty; // STK-KOL-80 (Logo/ERP Kodu)
    public string Barcode { get; set; } = string.Empty;     // 8680001001 (Orijinal EAN)
    public string Title { get; set; } = string.Empty;
    public decimal BuyingPrice { get; set; }                // Birim Alış Maliyeti (45.00 TL)
    public decimal VatRate { get; set; }                    // KDV (%20)
    public int PhysicalStockQuantity { get; set; }          // Depodaki Gerçek Sayım Stoğu (450 adet)
    public int ReservedQuantity { get; set; }               // Bekleyen sipariş rezervi (20 adet)
    public decimal UnitDesi { get; set; }                   // 1 adedin desisi (0.35 desi)
    public int LeadTimeDays { get; set; }                   // Tedarik temin süresi (gün)
    public byte[] RowVersion { get; set; } = null!;         // EF Core Eşzamanlılık Kilidi

    public ICollection<MainProductBundleRecipeItem> IncludedInRecipes { get; set; } = new List<MainProductBundleRecipeItem>();
}

// =========================================================================
// 2. KADEME: ANA ÜRÜN (MAIN PRODUCT - KATALOG & PAKET REÇETESİ)
// =========================================================================
public enum ProductKind
{
    Single = 1,          // Tekil ürün
    MultiUnitBundle = 2, // Adetli paket (4x)
    CompositeKit = 3     // Karma set (5x Kolonya + 1x Islak Mendil)
}

public class MainProduct
{
    public Guid Id { get; set; }
    public string MasterProductCode { get; set; } = string.Empty; // MP-SET-5K1M
    public string MasterBarcode { get; set; } = string.Empty;     // 8689990011
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ProductKind Kind { get; set; }
    public string MainCategory { get; set; } = string.Empty;
    public string SubCategory { get; set; } = string.Empty;
    public decimal TargetProfitMargin { get; set; }               // %35 öngörülen kâr

    // Çift Desi Yönetimi
    public decimal CalculatedDesi { get; set; }                   // Bileşenlerden hesaplanan desi (1.95)
    public decimal ManualDesi { get; set; }                       // Elle girilen koli sevk desisi (2.00)

    // Çift Termin Yönetimi
    public int CalculatedLeadTimeDays { get; set; }               // Hesaplanan termin
    public int ManualLeadTimeDays { get; set; }                   // Girilen termin (gün)

    // Finans & Sanal Stok (Dinamik Hesaplanır)
    public decimal CalculatedTotalCost { get; set; }              // Reçete toplam maliyeti (240 TL)
    public int CalculatedVirtualStock { get; set; }               // Satışa açık sanal stok (86 paket)

    // İlişkiler
    public ICollection<MainProductBundleRecipeItem> RecipeItems { get; set; } = new List<MainProductBundleRecipeItem>();
    public ICollection<ChannelListingProduct> Listings { get; set; } = new List<ChannelListingProduct>();
}

// Paket Reçete Satırı (BOM Line)
public class MainProductBundleRecipeItem
{
    public Guid Id { get; set; }
    public Guid MainProductId { get; set; }
    public MainProduct MainProduct { get; set; } = null!;

    public Guid ErpInventoryProductId { get; set; }
    public ErpInventoryProduct ErpInventoryProduct { get; set; } = null!;

    public int Quantity { get; set; } // Bu ana üründe kaç adet var? (Örn: 5 adet)
}

// =========================================================================
// 3. KADEME: PAZARYERİ ÇOKLU İLANLARI (1:N ÇOKLU / SAHTE BARKODLAR)
// =========================================================================
public class ChannelListingProduct
{
    public Guid Id { get; set; }
    public Guid MainProductId { get; set; }
    public MainProduct MainProduct { get; set; } = null!;

    public Guid StoreAccountId { get; set; }
    public MarketplaceChannel Channel { get; set; }

    // Sahte / Özel / Klon Barkod Desteği
    public string ListingBarcode { get; set; } = string.Empty; // TY-FAK-990012 veya 8689990011
    public string ListingSku { get; set; } = string.Empty;
    public string ChannelListingTitle { get; set; } = string.Empty; // Kanala özel optimize başlık
    public string ChannelListingDescription { get; set; } = string.Empty; // Kanala özel açıklama

    public decimal SalePrice { get; set; }
    public decimal? SpecialCampaignPrice { get; set; }
    public decimal CommissionRate { get; set; }
    public bool IsActive { get; set; } = true;
    public string SyncStatus { get; set; } = "Synced";
}`
  },
  {
    fileName: 'OrderItemComponentSnapshot.cs',
    project: 'OmniChannel.Domain',
    category: 'Entity',
    summary: 'Sipariş anında ürünün reçetesini donduran ve geçmiş siparişlerin değişmesini engelleyen Snapshot varlığı.',
    language: 'csharp',
    content: `namespace OmniChannel.Domain.Entities;

/// <summary>
/// Sipariş anında paketin reçetesini kalıcı olarak dondurur.
/// Katalogdaki sonraki reçete veya maliyet değişiklikleri bu kaydı asla etkilemez.
/// </summary>
public class OrderItemComponentSnapshot
{
    public Guid Id { get; set; }
    public Guid OrderItemId { get; set; }
    public OrderItem OrderItem { get; set; } = null!;

    public Guid ErpInventoryProductId { get; set; }
    public string ComponentProductCode { get; set; } = string.Empty; // STK-KOL-80
    public string ComponentBarcode { get; set; } = string.Empty;     // 8680001001
    public string ComponentTitle { get; set; } = string.Empty;       // Limon Kolonyası

    public int QuantityPerPackage { get; set; }   // 1 paket içindeki adet (örn: 5)
    public int TotalQuantityDeducted { get; set; } // Toplam düşülen fiziki stok (Miktar * Paket İçi Adet)

    public decimal FrozenBuyingCost { get; set; } // Sipariş anındaki alış maliyeti
    public decimal FrozenVatRate { get; set; }    // Sipariş anındaki KDV oranı
    public DateTime SnapshotAtUtc { get; set; }   // Dondurulma zaman damgası
}`
  },
  {
    fileName: 'OmniChannelDbContext.cs',
    project: 'OmniChannel.Infrastructure',
    category: 'DbContext',
    summary: 'EF Core 8 DbContext; 3 Kademeli ürün modelleri, 1:N klon ilanlar ve BOM Snapshot ilişkileri.',
    language: 'csharp',
    content: `using Microsoft.EntityFrameworkCore;
using OmniChannel.Domain.Entities;

namespace OmniChannel.Infrastructure.Data;

public class OmniChannelDbContext : DbContext
{
    public OmniChannelDbContext(DbContextOptions<OmniChannelDbContext> options) : base(options)
    {
    }

    public DbSet<ErpInventoryProduct> ErpInventoryProducts => Set<ErpInventoryProduct>();
    public DbSet<MainProduct> MainProducts => Set<MainProduct>();
    public DbSet<MainProductBundleRecipeItem> MainProductBundleRecipeItems => Set<MainProductBundleRecipeItem>();
    public DbSet<ChannelListingProduct> ChannelListingProducts => Set<ChannelListingProduct>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<OrderItemComponentSnapshot> OrderItemComponentSnapshots => Set<OrderItemComponentSnapshot>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // 1. Kademe: ErpInventoryProduct
        modelBuilder.Entity<ErpInventoryProduct>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.ProductCode).HasMaxLength(100).IsRequired();
            b.HasIndex(x => x.ProductCode).IsUnique();
            b.Property(x => x.Barcode).HasMaxLength(50).IsRequired();
            b.HasIndex(x => x.Barcode);
            b.Property(x => x.BuyingPrice).HasPrecision(18, 2);
            b.Property(x => x.UnitDesi).HasPrecision(6, 2);
            b.Property(x => x.RowVersion).IsRowVersion();
        });

        // 2. Kademe: MainProduct
        modelBuilder.Entity<MainProduct>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.MasterProductCode).HasMaxLength(100).IsRequired();
            b.HasIndex(x => x.MasterProductCode).IsUnique();
            b.Property(x => x.MasterBarcode).HasMaxLength(50).IsRequired();
            b.Property(x => x.CalculatedTotalCost).HasPrecision(18, 2);
            b.Property(x => x.CalculatedDesi).HasPrecision(6, 2);
            b.Property(x => x.ManualDesi).HasPrecision(6, 2);
        });

        // Reçete Bağlantısı (MainProduct -> ErpInventoryProduct)
        modelBuilder.Entity<MainProductBundleRecipeItem>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasOne(x => x.MainProduct)
             .WithMany(x => x.RecipeItems)
             .HasForeignKey(x => x.MainProductId)
             .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(x => x.ErpInventoryProduct)
             .WithMany(x => x.IncludedInRecipes)
             .HasForeignKey(x => x.ErpInventoryProductId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // 3. Kademe: ChannelListingProduct (1:N Çoklu / Sahte Barkodlu İlanlar)
        modelBuilder.Entity<ChannelListingProduct>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.ListingBarcode).HasMaxLength(100).IsRequired();
            b.HasIndex(x => new { x.StoreAccountId, x.ListingBarcode });
            b.Property(x => x.SalePrice).HasPrecision(18, 2);
            b.Property(x => x.CommissionRate).HasPrecision(5, 2);

            b.HasOne(x => x.MainProduct)
             .WithMany(x => x.Listings)
             .HasForeignKey(x => x.MainProductId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // Sipariş Anı Dondurulmuş Reçete (Snapshot)
        modelBuilder.Entity<OrderItemComponentSnapshot>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.FrozenBuyingCost).HasPrecision(18, 2);
            b.Property(x => x.FrozenVatRate).HasPrecision(5, 2);

            b.HasOne(x => x.OrderItem)
             .WithMany(x => x.Snapshots)
             .HasForeignKey(x => x.OrderItemId)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
}`
  },
  {
    fileName: 'VirtualStockCalculationService.cs',
    project: 'OmniChannel.Application',
    category: 'Worker',
    summary: 'Dinamik sanal stok hesaplayıcı ve sipariş anında reçeteyi donduran Snapshot servisi.',
    language: 'csharp',
    content: `using Microsoft.EntityFrameworkCore;
using OmniChannel.Domain.Entities;
using OmniChannel.Infrastructure.Data;

namespace OmniChannel.Application.Services;

public class VirtualStockCalculationService
{
    private readonly OmniChannelDbContext _db;

    public VirtualStockCalculationService(OmniChannelDbContext db) => _db = db;

    /// <summary>
    /// Bir ana ürünün reçetesine göre satışa açık sanal stok miktarını hesaplar: min(floor(depo / adet))
    /// </summary>
    public int CalculateVirtualStock(MainProduct mainProduct)
    {
        if (mainProduct.Kind == ProductKind.Single && mainProduct.RecipeItems.Count == 1)
        {
            var single = mainProduct.RecipeItems.First().ErpInventoryProduct;
            return Math.Max(0, single.PhysicalStockQuantity - single.ReservedQuantity);
        }

        int minCanProduce = int.MaxValue;
        foreach (var recipe in mainProduct.RecipeItems)
        {
            var inv = recipe.ErpInventoryProduct;
            int netAvailable = Math.Max(0, inv.PhysicalStockQuantity - inv.ReservedQuantity);
            int possible = netAvailable / recipe.Quantity;
            if (possible < minCanProduce) minCanProduce = possible;
        }

        return minCanProduce == int.MaxValue ? 0 : minCanProduce;
    }

    /// <summary>
    /// Pazaryerinden sipariş geldiğinde sipariş anındaki reçeteyi dondurur.
    /// </summary>
    public async Task FreezeOrderRecipeAsync(OrderItem orderItem, string channelBarcode, CancellationToken ct)
    {
        var listing = await _db.ChannelListingProducts
            .Include(l => l.MainProduct)
                .ThenInclude(m => m.RecipeItems)
                    .ThenInclude(r => r.ErpInventoryProduct)
            .FirstOrDefaultAsync(l => l.ListingBarcode == channelBarcode, ct);

        if (listing?.MainProduct == null) return;

        foreach (var recipe in listing.MainProduct.RecipeItems)
        {
            var inv = recipe.ErpInventoryProduct;
            var snapshot = new OrderItemComponentSnapshot
            {
                OrderItemId = orderItem.Id,
                ErpInventoryProductId = inv.Id,
                ComponentProductCode = inv.ProductCode,
                ComponentBarcode = inv.Barcode,
                ComponentTitle = inv.Title,
                QuantityPerPackage = recipe.Quantity,
                TotalQuantityDeducted = recipe.Quantity * orderItem.Quantity,
                FrozenBuyingCost = inv.BuyingPrice,
                FrozenVatRate = inv.VatRate,
                SnapshotAtUtc = DateTime.UtcNow
            };

            await _db.OrderItemComponentSnapshots.AddAsync(snapshot, ct);

            // Fiziki depoda rezervasyon oluştur
            inv.ReservedQuantity += (recipe.Quantity * orderItem.Quantity);
        }

        await _db.SaveChangesAsync(ct);
    }
}`
  },
  {
    fileName: 'CargoEntities.cs',
    project: 'OmniChannel.Domain',
    category: 'Entity',
    summary: 'Pazaryeri kargo ve barem matrisi (CargoTierRate) ile sipariş anı dondurulan kargo snapshot (OrderCargoSnapshot) varlıkları.',
    language: 'csharp',
    content: `using OmniChannel.Domain.Enums;

namespace OmniChannel.Domain.Entities;

/// <summary>
/// Pazaryerlerinin yayınladığı dönemsel desi ve sepet tutarı kargo barem tablosu
/// </summary>
public class CargoTierRate
{
    public Guid Id { get; set; }
    public MarketplaceChannel Channel { get; set; }
    public string CargoProvider { get; set; } = string.Empty; // Trendyol Express, Aras, HepsiJet, PTT
    public string TierName { get; set; } = string.Empty;      // Barem 1 (≤150 TL)

    // Sepet Tutarı Baremi (TL)
    public decimal MinCartPrice { get; set; }
    public decimal MaxCartPrice { get; set; }

    // Desi Aralığı
    public decimal MinDesi { get; set; }
    public decimal MaxDesi { get; set; }

    // Satıcıya Yansıtılan Kargo Bedeli
    public decimal SellerCargoFee { get; set; }
    public bool IsMarketplaceSubsidized { get; set; } = true;
    public DateTime ValidFromUtc { get; set; }
}

/// <summary>
/// Sipariş anında dondurulan kargo parametreleri ve fatura mutabakat kaydı
/// </summary>
public class OrderCargoSnapshot
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    // 1. Sipariş Anı Dondurulan Tahmini Değerler (Estimates)
    public string SelectedCargoProvider { get; set; } = string.Empty;
    public decimal EstimatedDesi { get; set; }       // Depo/ürün koli desisi
    public decimal EstimatedCargoFee { get; set; }   // Barem listesinden kilitlenen tahmini bedel
    public string AppliedBaremCode { get; set; } = string.Empty;
    public DateTime FrozenAtUtc { get; set; }

    // 2. Operatör Değişikliği Logu
    public bool WasProviderOverridden { get; set; }
    public string? OriginalProvider { get; set; }
    public string? OverriddenReason { get; set; }

    // 3. Pazaryeri Fatura / Dönüş Değerleri (Actual Invoiced)
    public decimal? ActualInvoicedDesi { get; set; } // Şubenin girdiği desi
    public decimal? ActualInvoicedFee { get; set; }  // Pazaryerinin kestiği reel tutar

    // Hesaplanmış Uyuşmazlık Alanları
    public decimal DiscrepancyFee => (ActualInvoicedFee ?? 0) - EstimatedCargoFee;
    public decimal DiscrepancyDesi => (ActualInvoicedDesi ?? 0) - EstimatedDesi;
    public bool HasDiscrepancy => DiscrepancyFee > 2.00m || DiscrepancyDesi > 0.50m;
    public string? ClaimStatus { get; set; } // "PendingClaim", "ClaimSubmitted", "Resolved", "Rejected"
}`
  },
  {
    fileName: 'CargoPricingEngine.cs',
    project: 'OmniChannel.Application',
    category: 'Worker',
    summary: 'Kullanıcının fiyatlama formülü: [Maliyet * (1 + Kâr) + Kargo] / (1 - Komisyon) ve döngüsel barem çözümleme motoru.',
    language: 'csharp',
    content: `using Microsoft.EntityFrameworkCore;
using OmniChannel.Domain.Entities;
using OmniChannel.Domain.Enums;
using OmniChannel.Infrastructure.Data;

namespace OmniChannel.Application.Services;

public class CargoPricingEngine
{
    private readonly OmniChannelDbContext _db;

    public CargoPricingEngine(OmniChannelDbContext db) => _db = db;

    /// <summary>
    /// Satış Fiyatı Formülü: (Maliyet * (1 + Kâr) + Kargo) / (1 - Komisyon)
    /// </summary>
    public decimal CalculateSellingPrice(
        decimal buyingCost, 
        decimal profitMarginRate, 
        decimal freightFee, 
        decimal commissionRate)
    {
        if (commissionRate >= 1.0m) commissionRate = 0.99m;
        decimal costWithProfit = buyingCost * (1.0m + profitMarginRate);
        decimal rawPrice = (costWithProfit + freightFee) / (1.0m - commissionRate);
        return Math.Round(rawPrice, 2);
    }

    /// <summary>
    /// Çalışılan kargolardan ağırlıklı ortalama kargo maliyeti üretir:
    /// Örn: %70 TEX (19 TL) + %30 Aras (28.50 TL) -> (19 * 0.70) + (28.50 * 0.30) = 21.85 TL
    /// </summary>
    public decimal CalculateWeightedFreight(IEnumerable<(string Provider, decimal SharePercentage, decimal Fee)> shares)
    {
        decimal totalPercent = shares.Sum(s => s.SharePercentage);
        if (totalPercent == 0) return 0;

        decimal weighted = shares.Sum(s => s.Fee * (s.SharePercentage / totalPercent));
        return Math.Round(weighted, 2);
    }

    /// <summary>
    /// Döngüsel barem çözümleme: Satış fiyatı bareme, barem de satış fiyatına etki ettiği için iki aşamalı çözer.
    /// </summary>
    public async Task<(decimal FinalPrice, CargoTierRate? MatchedTier)> ResolveDynamicPriceAsync(
        decimal cost,
        decimal profitRate,
        decimal commissionRate,
        decimal productDesi,
        MarketplaceChannel channel,
        string preferredProvider,
        CancellationToken ct)
    {
        // 1. Aşama: Standart tarife ile geçici fiyat hesapla
        decimal tentativeFreight = 25.00m;
        decimal tentativePrice = CalculateSellingPrice(cost, profitRate, tentativeFreight, commissionRate);

        // 2. Aşama: Fiyata ve desiye uyan baremi bul
        var matchedTier = await _db.CargoTierRates
            .Where(t => t.Channel == channel 
                     && t.CargoProvider == preferredProvider
                     && productDesi >= t.MinDesi && productDesi <= t.MaxDesi
                     && tentativePrice >= t.MinCartPrice && tentativePrice <= t.MaxCartPrice)
            .FirstOrDefaultAsync(ct);

        if (matchedTier != null)
        {
            // Kesin barem bedeli ile nihai fiyatı kilitle
            decimal finalPrice = CalculateSellingPrice(cost, profitRate, matchedTier.SellerCargoFee, commissionRate);
            return (finalPrice, matchedTier);
        }

        return (tentativePrice, null);
    }
}`
  },
  {
    fileName: 'CargoDiscrepancyWorker.cs',
    project: 'OmniChannel.Worker',
    category: 'Worker',
    summary: 'Pazaryeri hakediş/fatura API dönüşlerini tarayıp dondurulan kargo snapshot ile reel kesintileri mutabakat eden arka plan servisi.',
    language: 'csharp',
    content: `using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using OmniChannel.Infrastructure.Data;

namespace OmniChannel.Worker.BackgroundServices;

public class CargoDiscrepancyReconciliationWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<CargoDiscrepancyReconciliationWorker> _logger;

    public CargoDiscrepancyReconciliationWorker(
        IServiceProvider serviceProvider, 
        ILogger<CargoDiscrepancyReconciliationWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<OmniChannelDbContext>();

                // Faturası dönmüş ancak uyuşmazlığı denetlenmemiş siparişleri al
                var snapshots = await db.OrderCargoSnapshots
                    .Include(s => s.Order)
                    .Where(s => s.ActualInvoicedFee != null && s.ClaimStatus == null)
                    .ToListAsync(stoppingToken);

                foreach (var snap in snapshots)
                {
                    if (snap.HasDiscrepancy)
                    {
                        snap.ClaimStatus = "PendingClaim";
                        _logger.LogWarning(
                            "[KARGO UYUŞMAZLIĞI] Sipariş: {OrderNo} - Öngörülen: {Est} TL, Kesilen: {Act} TL (Fark: +{Diff} TL, Desi Farkı: +{DiffDesi} d). İtiraz kuyruğuna alındı.",
                            snap.Order.ChannelOrderNumber, snap.EstimatedCargoFee, snap.ActualInvoicedFee, snap.DiscrepancyFee, snap.DiscrepancyDesi);
                    }
                }

                await db.SaveChangesAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kargo mutabakat kontrolü sırasında hata oluştu.");
            }

            // 15 dakikada bir kontrol et
            await Task.Delay(TimeSpan.FromMinutes(15), stoppingToken);
        }
    }
}`
  },
  {
    fileName: 'MarketplaceVendorDtos.cs',
    project: 'OmniChannel.Domain.Dtos',
    category: 'Adapter',
    summary: 'Türkiye pazaryerlerinin (Trendyol, Hepsiburada, N11, PttAVM, Pazarama, İdefix) gerçek JSON/XML dönüş şemalarını temsil eden resmi DTO sınıfları.',
    language: 'csharp',
    content: `using System.Text.Json.Serialization;

namespace OmniChannel.Domain.Dtos;

// =========================================================================
// 1. TRENDYOL TEDARİKÇİ SİPARİŞ & PAKET DTO
// =========================================================================
public class TrendyolOrderPackageDto
{
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("orderNumber")]
    public string OrderNumber { get; set; } = string.Empty;

    [JsonPropertyName("grossAmount")]
    public decimal GrossAmount { get; set; }

    [JsonPropertyName("totalDiscount")]
    public decimal TotalDiscount { get; set; }

    [JsonPropertyName("totalPrice")]
    public decimal TotalPrice { get; set; }

    [JsonPropertyName("customerFirstName")]
    public string CustomerFirstName { get; set; } = string.Empty;

    [JsonPropertyName("customerLastName")]
    public string CustomerLastName { get; set; } = string.Empty;

    [JsonPropertyName("customerId")]
    public long CustomerId { get; set; }

    [JsonPropertyName("customerEmail")]
    public string CustomerEmail { get; set; } = string.Empty;

    [JsonPropertyName("cargoTrackingNumber")]
    public string CargoTrackingNumber { get; set; } = string.Empty;

    [JsonPropertyName("cargoProviderName")]
    public string CargoProviderName { get; set; } = string.Empty;

    [JsonPropertyName("shipmentPackageStatus")]
    public string ShipmentPackageStatus { get; set; } = string.Empty;

    [JsonPropertyName("orderDate")]
    public long OrderDateUnixMs { get; set; }

    [JsonPropertyName("tcIdentityNumber")]
    public string? TcIdentityNumber { get; set; }

    [JsonPropertyName("deliveryType")]
    public string DeliveryType { get; set; } = "Normal";

    [JsonPropertyName("shipmentAddress")]
    public TrendyolAddressDto ShipmentAddress { get; set; } = new();

    [JsonPropertyName("invoiceAddress")]
    public TrendyolAddressDto InvoiceAddress { get; set; } = new();

    [JsonPropertyName("lines")]
    public List<TrendyolOrderLineDto> Lines { get; set; } = new();
}

public class TrendyolAddressDto
{
    [JsonPropertyName("address1")]
    public string Address1 { get; set; } = string.Empty;

    [JsonPropertyName("city")]
    public string City { get; set; } = string.Empty;

    [JsonPropertyName("district")]
    public string District { get; set; } = string.Empty;

    [JsonPropertyName("postalCode")]
    public string? PostalCode { get; set; }

    [JsonPropertyName("fullAddress")]
    public string FullAddress { get; set; } = string.Empty;
}

public class TrendyolOrderLineDto
{
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("barcode")]
    public string Barcode { get; set; } = string.Empty;

    [JsonPropertyName("productName")]
    public string ProductName { get; set; } = string.Empty;

    [JsonPropertyName("merchantSku")]
    public string MerchantSku { get; set; } = string.Empty;

    [JsonPropertyName("quantity")]
    public int Quantity { get; set; }

    [JsonPropertyName("price")]
    public decimal Price { get; set; }

    [JsonPropertyName("amount")]
    public decimal Amount { get; set; }

    [JsonPropertyName("discount")]
    public decimal Discount { get; set; }

    [JsonPropertyName("vatBaseAmount")]
    public decimal VatBaseAmount { get; set; }
}

// =========================================================================
// 2. HEPSİBURADA MERCHANT / OMS DTO
// =========================================================================
public class HepsiburadaOrderPackageDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty; // PackageNumber

    [JsonPropertyName("orderNumber")]
    public string OrderNumber { get; set; } = string.Empty;

    [JsonPropertyName("orderDate")]
    public DateTime OrderDate { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("totalPrice")]
    public HbPriceDto TotalPrice { get; set; } = new();

    [JsonPropertyName("recipient")]
    public HbRecipientDto Recipient { get; set; } = new();

    [JsonPropertyName("cargoCompany")]
    public HbCargoCompanyDto CargoCompany { get; set; } = new();

    [JsonPropertyName("barcode")]
    public string Barcode { get; set; } = string.Empty;

    [JsonPropertyName("trackingNumber")]
    public string TrackingNumber { get; set; } = string.Empty;

    [JsonPropertyName("items")]
    public List<HepsiburadaItemDto> Items { get; set; } = new();
}

public class HbPriceDto
{
    [JsonPropertyName("amount")]
    public decimal Amount { get; set; }

    [JsonPropertyName("currency")]
    public string Currency { get; set; } = "TRY";
}

public class HbRecipientDto
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("addressDetail")]
    public string AddressDetail { get; set; } = string.Empty;

    [JsonPropertyName("city")]
    public string City { get; set; } = string.Empty;

    [JsonPropertyName("town")]
    public string Town { get; set; } = string.Empty;

    [JsonPropertyName("phoneNumber")]
    public string PhoneNumber { get; set; } = string.Empty;
}

public class HbCargoCompanyDto
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("shortCode")]
    public string ShortCode { get; set; } = string.Empty;
}

public class HepsiburadaItemDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("merchantSku")]
    public string MerchantSku { get; set; } = string.Empty;

    [JsonPropertyName("barcode")]
    public string Barcode { get; set; } = string.Empty;

    [JsonPropertyName("productName")]
    public string ProductName { get; set; } = string.Empty;

    [JsonPropertyName("quantity")]
    public int Quantity { get; set; }

    [JsonPropertyName("price")]
    public HbPriceDto Price { get; set; } = new();

    [JsonPropertyName("vat")]
    public decimal Vat { get; set; }
}

// =========================================================================
// 3. N11, PTTAVM & PAZARAMA DTO
// =========================================================================
public class N11DetailedOrderDto
{
    public long Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string FullAddress { get; set; } = string.Empty;
    public List<N11OrderItemDto> ItemList { get; set; } = new();
}

public class N11OrderItemDto
{
    public long Id { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string SellerStockBarcode { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Price { get; set; }
}

public class PttAvmOrderDto
{
    public string SiparisKodu { get; set; } = string.Empty;
    public string SiparisTarihi { get; set; } = string.Empty;
    public string MusteriAdi { get; set; } = string.Empty;
    public string TeslimatAdresi { get; set; } = string.Empty;
    public string KargoBarkod { get; set; } = string.Empty;
    public decimal ToplamTutar { get; set; }
}

public class PazaramaOrderDto
{
    public string OrderId { get; set; } = string.Empty;
    public string OrderCode { get; set; } = string.Empty;
    public string CargoProviderName { get; set; } = string.Empty;
    public string ShipmentBarcode { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
}`
  },
  {
    fileName: 'RawPayloadIngestionAndStorage.cs',
    project: 'OmniChannel.Infrastructure',
    category: 'DbContext',
    summary: 'Ham JSON verisinin sıfır kayıpla NVARCHAR(MAX) / JSONB olarak saklanması ve Ingestion servisi.',
    language: 'csharp',
    content: `using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using OmniChannel.Domain.Dtos;
using OmniChannel.Domain.Entities;

namespace OmniChannel.Infrastructure.Data;

/// <summary>
/// Sipariş, İlan ve Mutabakat kayıtlarında ham API yanıtının
/// tam metin olarak saklanmasını garanti eden EF Core yapılandırması.
/// </summary>
public static class RawPayloadModelConfiguration
{
    public static void ConfigureRawPayloads(ModelBuilder modelBuilder)
    {
        // 1. Sipariş (Order) Ham JSON Alanı (NVARCHAR(MAX) / Postgres JSONB)
        modelBuilder.Entity<Order>(b =>
        {
            b.Property(x => x.RawPayloadJson)
             .HasColumnType("nvarchar(max)")
             .IsRequired();

            b.HasIndex(x => new { x.StoreId, x.ChannelOrderNumber });
        });

        // 2. Pazaryeri Klon İlanı (ChannelListingProduct) Ham Katalog Yanıtı
        modelBuilder.Entity<ChannelListingProduct>(b =>
        {
            b.Property(x => x.RawPayloadJson)
             .HasColumnType("nvarchar(max)")
             .IsRequired(false);
        });

        // 3. Hakediş ve Finans Mutabakat Raporu (SettlementReport)
        modelBuilder.Entity<SettlementReport>(b =>
        {
            b.Property(x => x.RawPayloadJson)
             .HasColumnType("nvarchar(max)")
             .IsRequired(false);
        });
    }
}

/// <summary>
/// Pazaryeri API yanıtını alıp ham gövdeyi eksiksiz saklayan Ingestion örneği.
/// </summary>
public class TrendyolOrderIngestionService
{
    private readonly OmniChannelDbContext _dbContext;

    public TrendyolOrderIngestionService(OmniChannelDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task IngestOrderAsync(string rawHttpResponseJson, Guid storeId)
    {
        // 1. Ham JSON güçlü tipli DTO'ya Deserialize edilir
        var dto = JsonSerializer.Deserialize<TrendyolOrderPackageDto>(rawHttpResponseJson, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        }) ?? throw new InvalidOperationException("Geçersiz Trendyol JSON şeması!");

        // 2. Normalize Mini ERP Order entity'sine haritalanır
        var order = new Order
        {
            Id = Guid.NewGuid(),
            StoreId = storeId,
            Channel = MarketplaceChannel.Trendyol,
            ChannelOrderNumber = dto.OrderNumber,
            CustomerName = $"{dto.CustomerFirstName} {dto.CustomerLastName}".Trim(),
            CustomerEmail = dto.CustomerEmail,
            ShippingAddress = dto.ShipmentAddress.FullAddress,
            BillingAddress = dto.InvoiceAddress.FullAddress,
            City = dto.ShipmentAddress.City,
            District = dto.ShipmentAddress.District,
            GrossAmount = dto.GrossAmount,
            DiscountAmount = dto.TotalDiscount,
            TotalAmount = dto.TotalPrice,
            CargoProvider = dto.CargoProviderName,
            CargoBarcode = $"TEX-{dto.CargoTrackingNumber}",
            CargoTrackingNumber = dto.CargoTrackingNumber,

            // CRITICAL: Ham JSON stringi hiçbir veri kırpılmadan saklanır!
            RawPayloadJson = rawHttpResponseJson
        };

        _dbContext.Orders.Add(order);
        await _dbContext.SaveChangesAsync();
    }
}`
  },
  ...CSHARP_SYNTHETIC_ENGINE_FILES.map(f => ({
    fileName: f.fileName,
    project: f.project,
    category: 'Simulation & AI' as const,
    summary: f.description,
    language: 'csharp',
    content: f.content
  }))
];

