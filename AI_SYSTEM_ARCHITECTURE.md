# OMNICHANNEL PAZARYERİ & MİNİ ERP - SİSTEM MİMARİSİ VE YAPAY ZEKA (AI) GELİŞTİRİCİ BRİFİNGİ

> **BU DOKÜMANIN AMACI:**  
> Görevi devralan veya projeyi geliştiren yapay zeka modelleri (LLM), yazılım mühendisleri ve mimarlar için hazırlanmış tek gerçek kaynak (Single Source of Truth) kılavuzudur.  
> Bu proje, Türkiye e-ticaret pazaryerleri (Trendyol, Hepsiburada, Amazon TR, N11, Çiçeksepeti, PttAVM) ile konuşan, 3 kademeli ürün mimarisine sahip, **C# .NET 8 / 9 WPF masaüstü** ve **Background Worker** mimarisinde çalışan kurumsal bir Mini ERP sistemidir.  
> **Dış bir sunucuya, harici veritabanına veya ek mock motoruna ihtiyaç duymadan**, tüm sanal veri üretimini ve canlı simülasyon döngüsünü **saf C#** tarafında kendi içinde çalıştırabilir.

---

## 1. YÖNETİCİ ÖZETİ VE TEMEL MİSYON
* **Platform:** C# .NET 8 / 9 WPF (Windows Masaüstü - Modern Windows 11 Fluent Mica Dark Tema) + Web Hibrit Teşhis Konsolu.
* **Tasarım Deseni:** MVVM (`CommunityToolkit.Mvvm`), SOLID, Clean / Hexagonal Architecture, CQRS & MediatR uyumlu.
* **Bağımsızlık Prensibi:** Uygulama, internet bağlantısı veya harici bir mock sunucusu olmasa bile `SyntheticDataEngine.cs` sayesinde gerçeğe birebir uygun sanal siparişler, kargo fatura mutabakatları, stok düşüşleri ve webhook olayları üreterek masaüstünde canlı test edilebilir.

---

## 2. ÜÇ KADEMELİ ÜRÜN MİMARİSİ (THE 3-TIER PRODUCT ARCHITECTURE)

Yapay zeka modellerinin bu projede en çok dikkat etmesi gereken kural bu 3 kademedir:

```
[1. KADEME: FİZİKİ DEPO STOK ÜRÜNÜ] (ErpInventoryProduct)
    │  Örn: STK-KOL-80 (80° Limon Kolonyası 1 Litre) -> Depo Stoğu: 450 Adet
    │  Örn: STK-MEN-100 (Islak Havlu Mendil 100'lü)   -> Depo Stoğu: 600 Adet
    │
    ▼ (BOM Reçetesi ile bağlanır)
[2. KADEME: ANA ÜRÜN & PAKET REÇETESİ] (MainProduct + MainProductBundleRecipeItem)
    │  Örn: MP-SET-HIJYEN (Süper Hijyen Paketi)
    │  Reçete: 2x Limon Kolonyası + 1x Islak Mendil
    │  Sanal Stok = MIN(450/2, 600/1) = 225 Paket (Dinamik Hesaplanır)
    │  Çift Desi: Bileşen Desisi (1.80) vs Elle Koli Desisi (2.00)
    │
    ▼ (1:N Çoklu / Klon / Sahte Barkodlarla Dağıtılır)
[3. KADEME: PAZARYERİ İLANLARI] (ChannelListingProduct)
    ├── Trendyol İlanı (TY-KOL-TEK - Tekil İlan, Komisyon: %18)
    ├── Trendyol Klon İlan (TY-KOL-BUYBOX - Buybox Klonu, Farklı Barkod: TY-FAK-991)
    ├── Hepsiburada İlanı (HB-SET-HIJ - Set İlanı, Komisyon: %21)
    └── Amazon TR İlanı (AMZ-HIJ-DEAL - Fırsat İlanı, Komisyon: %15)
```

### Altın Kurallar (Invariants):
1. **Fiziki Stok Tekil Kaynaktır:** Depoda duran fiziki mal `ErpInventoryProduct` tablosundadır. Satış yapıldığında doğrudan ilgili reçetedeki fiziki stoklar düşülür.
2. **Sanal Stok Formülü:**  
   $$\text{VirtualStock} = \min_{i \in \text{BOM}} \left( \left\lfloor \frac{\text{PhysicalStock}_i - \text{ReservedQuantity}_i}{\text{RecipeQuantity}_i} \right\rfloor \right)$$
3. **OrderItemComponentSnapshot Koruması:** Geçmiş bir sipariş görüntülendiğinde ASLA güncel katalog reçetesine bakılmaz. Sipariş anındaki maliyet ve reçete `OrderItemComponentSnapshot` varlığında kalıcı olarak dondurulmuştur.

---

## 3. C# SAF YAPAY VERİ MOTORU (`SyntheticDataEngine.cs`) MİMARİSİ

Dış motorlara olan bağımlılığı sıfıra indirmek için motor aşağıdaki bileşenlerden oluşur:

### A. Dahili Veri Tohumu (Built-in Turkish Seed Datasets)
* **İsim Havuzu:** 50+ gerçekçi Türk isim ve soyisimleri (Ahmet Yılmaz, Zeynep Kaya, Mehmet Demir...).
* **Şehir & İlçe Havuzu:** 81 il ve ilçeleri (İstanbul-Kadıköy, Ankara-Çankaya, İzmir-Karşıyaka...).
* **Geçerli TCKN / Vergi No Algoritması:** Mod 10 / Mod 11 Türk Kimlik Numarası algoritmasına uygun sentetik numaralar.
* **EAN-13 Barkod Üretici:** `868` Türkiye ülke kodu ile başlayan, 13. hanesi sağlama algoritmasıyla hesaplanan barkodlar.

### B. Olay Tetikleme ve Simülasyon Döngüsü (Event Dispatching)
1. **Sipariş Simülasyonu (`GenerateSimulatedOrderAsync`):**
   * Aktif pazaryeri ilanlarından rastgele birini seçer.
   * Müşteri ve adres üretir.
   * BOM reçetesindeki fiziki ürünlerin stoklarını düşer (`PhysicalStockQuantity -= Qty`).
   * İlgili ürünlerin bağlı olduğu TÜM ana ürünlerin sanal stoklarını (`CalculatedVirtualStock`) yeniden hesaplar.
   * Ham JSON yanıtını (`RawPayloadJson`) gerçek Trendyol/Hepsiburada API formatında oluşturup kaydeder.
   * `OrderCreated` olayını tetikler.
2. **Kargo Desi Uyuşmazlığı (`SimulateCargoDesiDiscrepancyAsync`):**
   * Taşıyıcı kargo firması (Yurtiçi, Tex, HepsiJet, Aras vb.) şubede tartım yaptığında ölçülen desi, sistem desisinden yüksek çıkar (Örn: Sistem: 1.50 Desi, Fatura: 3.50 Desi).
   * Fark bedeli hesaplanır ve `CargoDiscrepancy` kaydı üretilir.
3. **Müşteri Sorusu Simülasyonu (`SimulateCustomerQuestionAsync`):**
   * "Merhaba, ürünün son kullanım tarihi nedir?", "Hangi kargo ile gönderiyorsunuz?" gibi tipik Türk e-ticaret soruları üretir.
4. **WPF UI Köprüsü (`SimulationBackgroundService.cs`):**
   * `BackgroundService` içinde `PeriodicTimer` çalıştırır.
   * Masaüstü WPF uygulamasında UI thread kilitlemesi olmadan `Application.Current.Dispatcher.InvokeAsync` ile ViewModellere veri pompalar.

---

## 4. VERİTABANI VE VERİ SÖZLÜĞÜ (DATA CONTRACTS)

| Varlık (Entity) | C# Sınıfı | Amaç |
| :--- | :--- | :--- |
| `ErpInventoryProduct` | `OmniChannel.Domain.Entities.ErpInventoryProduct` | Fiziki depo sayım stoğu, birim alış maliyeti, KDV ve tekil ürün desisi. |
| `MainProduct` | `OmniChannel.Domain.Entities.MainProduct` | Katalogdaki ana ürün veya set/paket, kâr marjı, çift desi ve sanal stok. |
| `MainProductBundleRecipeItem` | `OmniChannel.Domain.Entities.MainProductBundleRecipeItem` | Reçete bağıntısı (BOM line): Bu ana ürün için hangi fiziki stoktan kaç adet gerekir. |
| `ChannelListingProduct` | `OmniChannel.Domain.Entities.ChannelListingProduct` | Pazaryerine açılan klon ilan, özel satış barkodu, kanal komisyonu. |
| `Order` | `OmniChannel.Domain.Entities.Order` | Pazaryeri siparişi, müşteri bilgisi, kargo kodu ve ham JSON yükü. |
| `OrderItem` | `OmniChannel.Domain.Entities.OrderItem` | Sipariş satırı. |
| `OrderItemComponentSnapshot` | `OmniChannel.Domain.Entities.OrderItemComponentSnapshot` | Sipariş anındaki reçete ve alış maliyeti dondurma kaydı. |
| `CargoDiscrepancyRecord` | `OmniChannel.Domain.Entities.CargoDiscrepancyRecord` | Kargo desi uyuşmazlığı ve fatura itiraz kaydı. |
| `CustomerQuestion` | `OmniChannel.Domain.Entities.CustomerQuestion` | Pazaryeri müşteri soru-cevap kaydı. |

---

## 5. GELECEKTEKİ YAPAY ZEKA MODELLERİ İÇİN TALİMATLAR (DIRECTIVES FOR FUTURE AI AGENTS)

Eğer bu projeyi devralan bir yapay zeka modeliyseniz, kod yazarken aşağıdaki kurallara **harfiyen** uyunuz:

1. **HARİCİ MOCK SUNUCUSU EKLEMEYİN:**  
   Yeni bir test verisi veya simülasyon gerektiğinde Node.js veya Python mock server aramayın. Tüm veriyi `SyntheticDataEngine.cs` içerisindeki metodlarla üretin.
2. **HAM JSON PAYLOAD'I ASLA KIRPMAYIN (`RawPayloadJson`):**  
   Pazaryerinden gelen veri bir DTO'ya dönüştürülse bile, orijinal JSON string'i daima `RawPayloadJson` alanına kaydedilmelidir.
3. **TOPLU İLANLARDA FARKLI BARKODLAR KULLANIN:**  
   Aynı ana ürünü Trendyol'da 3 kere listeliyorsanız, her ilan farklı `ListingBarcode` değerine sahip olmalıdır (Klon/Buybox stratejisi).
4. **WPF MVVM KURALLARI:**  
   * Tüm ViewModel'ler `CommunityToolkit.Mvvm.ComponentModel.ObservableObject` sınıfından türemelidir.
   * `[ObservableProperty]` ve `[RelayCommand]` özniteliklerini kullanın.
   * `INotifyPropertyChanged` olayları UI thread'e (`Dispatcher`) güvenli iletilmelidir.
5. **TÜRKİYE PAZARYERİ KOMİSYON VE DESİ KURALLARI:**  
   * Desi Formülü: $(En \times Boy \times Yükseklik) / 3000$ (cm cinsinden).
   * Kargo barem ücretleri desi aralığına göre belirlenir (0-1 Desi, 1-3 Desi, 3-5 Desi vb.).
   * Trendyol siparişlerinde kargo takip numarası genellikle `TEX-` veya `YK-` ile başlar.

---

## 6. PROJE DİZİN VE ÇALIŞTIRMA ŞEMASI
* `src/data/csharpArchitectureCode.ts` -> C# .NET 8 Backend, EF Core ve Mimari Kodları
* `src/data/csharpSyntheticEngineCode.ts` -> Saf C# Yapay Veri Üretici & Simülasyon Motoru Kodları
* `src/data/wpfScreensData.ts` -> XAML ve C# ViewModel Ekran Kodları
* `src/components/WpfStudioView.tsx` -> Windows 11 Masaüstü Simülatörü ve Kod Dışa Aktarma Stüdyosu
* `AI_SYSTEM_ARCHITECTURE.md` -> Bu dosya (Yapay Zeka ve Geliştirici Kılavuzu)
