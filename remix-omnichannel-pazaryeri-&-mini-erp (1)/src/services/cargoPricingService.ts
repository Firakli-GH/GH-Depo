import { 
  MarketplaceChannel, 
  CargoTierRate, 
  CargoProviderShare, 
  PricingFormulaSimulation 
} from '../types';

export class CargoPricingService {
  /**
   * Kullanıcının formülü:
   * (Maliyet * (1 + Kâr Oranı) + Kargo Bedeli) / (1 - Pazaryeri Komisyon Oranı)
   */
  static calculateFormulaPrice(
    buyingCost: number,
    profitMarginRate: number,
    cargoFee: number,
    commissionRate: number
  ): number {
    if (commissionRate >= 1) commissionRate = 0.99; // divide-by-zero protection
    const costWithProfit = buyingCost * (1 + profitMarginRate);
    const rawPrice = (costWithProfit + cargoFee) / (1 - commissionRate);
    return Math.round(rawPrice * 100) / 100;
  }

  /**
   * Çalışılan kargolardan ağırlıklı ortalama kargo bedeli üretir:
   * Örn: %70 Trendyol Express (9 TL) + %30 Aras Kargo (20 TL) -> (9 * 0.70) + (20 * 0.30) = 12.30 TL
   */
  static calculateWeightedCargoFee(shares: CargoProviderShare[]): number {
    const totalPercentage = shares.reduce((sum, s) => sum + s.sharePercentage, 0);
    if (totalPercentage === 0) return 0;

    const weighted = shares.reduce((sum, s) => {
      const weight = s.sharePercentage / totalPercentage;
      return sum + s.unitFee * weight;
    }, 0);

    return Math.round(weighted * 100) / 100;
  }

  /**
   * Verilen sepet tutarı ve koli desisi için en uygun baremi bulur
   */
  static resolveBaremTier(
    tariffs: CargoTierRate[],
    channel: MarketplaceChannel,
    desi: number,
    cartPrice: number,
    provider?: string
  ): CargoTierRate | undefined {
    return tariffs.find(t => {
      const matchesChannel = t.channel === channel;
      const matchesProvider = !provider || t.cargoProvider.toLowerCase() === provider.toLowerCase();
      const matchesDesi = desi >= t.minDesi && desi <= t.maxDesi;
      const matchesPrice = cartPrice >= t.minCartPrice && cartPrice <= t.maxCartPrice;
      return matchesChannel && matchesProvider && matchesDesi && matchesPrice;
    });
  }

  /**
   * Döngüsel barem çözümleme (Circular barem solver):
   * Satış fiyatı baremi, barem de kargo ücreti üzerinden nihai satış fiyatını belirler.
   */
  static simulateDynamicPricing(
    buyingCost: number,
    profitMarginRate: number,
    commissionRate: number,
    productDesi: number,
    channel: MarketplaceChannel,
    tariffs: CargoTierRate[],
    preferredProvider: string = 'Trendyol Express'
  ): PricingFormulaSimulation {
    // 1. Başlangıç tahmini: ortalama standart kargo ücreti (örn: 25 TL)
    let candidateFee = 25.00;
    let candidatePrice = this.calculateFormulaPrice(buyingCost, profitMarginRate, candidateFee, commissionRate);

    // 2. İlk fiyata uyan baremi bul
    let matchedTier = this.resolveBaremTier(tariffs, channel, productDesi, candidatePrice, preferredProvider);

    // Eğer bulunamadıysa sağlayıcı kısıtı olmadan ara
    if (!matchedTier) {
      matchedTier = this.resolveBaremTier(tariffs, channel, productDesi, candidatePrice);
    }

    // 3. Eşleşen barem varsa onun ücretiyle nihai fiyatı kesinleştir
    if (matchedTier) {
      candidateFee = matchedTier.sellerCargoFee;
      candidatePrice = this.calculateFormulaPrice(buyingCost, profitMarginRate, candidateFee, commissionRate);
    }

    const costWithProfit = buyingCost * (1 + profitMarginRate);
    const commissionAmount = candidatePrice * commissionRate;
    const effectiveNetProfit = candidatePrice - buyingCost - candidateFee - commissionAmount;

    return {
      buyingCost,
      profitMarginRate,
      costWithProfit: Math.round(costWithProfit * 100) / 100,
      cargoFee: candidateFee,
      marketplaceCommissionRate: commissionRate,
      calculatedSalePrice: candidatePrice,
      effectiveNetProfit: Math.round(effectiveNetProfit * 100) / 100,
      selectedBaremTier: matchedTier
    };
  }

  /**
   * Excel'den kopyalanan veya CSV olarak yüklenen tarife metnini parse eder.
   */
  static parseTariffCsv(csvText: string): { success: boolean; tariffs: CargoTierRate[]; error?: string } {
    try {
      const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length < 2) {
        return { success: false, tariffs: [], error: 'CSV dosyası boş veya başlık satırı dışında veri içermiyor.' };
      }

      // Başlık ayracı tespit (noktalı virgül veya virgül)
      const delimiter = lines[0].includes(';') ? ';' : ',';
      const parsedTariffs: CargoTierRate[] = [];

      // İlk satır başlık olduğu için 1. satırdan başla
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(delimiter).map(c => c.replace(/^["']|["']$/g, '').trim());
        if (cols.length < 7) continue;

        const rawChannel = cols[0].toLowerCase().trim() as MarketplaceChannel;
        const cargoProvider = cols[1];
        const tierName = cols[2];
        const minCartPrice = parseFloat(cols[3].replace(',', '.')) || 0;
        const maxCartPrice = parseFloat(cols[4].replace(',', '.')) || 999999;
        const minDesi = parseFloat(cols[5].replace(',', '.')) || 0;
        const maxDesi = parseFloat(cols[6].replace(',', '.')) || 99;
        const sellerCargoFee = parseFloat(cols[7]?.replace(',', '.')) || 0;
        const isSubsidized = cols[8] ? (cols[8].toLowerCase().includes('evet') || cols[8].toLowerCase().includes('true') || cols[8] === '1') : true;

        if (cargoProvider && sellerCargoFee >= 0) {
          parsedTariffs.push({
            id: `tier-imp-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`,
            channel: rawChannel || 'trendyol',
            cargoProvider,
            tierName: tierName || `${cargoProvider} ${minDesi}-${maxDesi} Desi`,
            minCartPrice,
            maxCartPrice,
            minDesi,
            maxDesi,
            sellerCargoFee,
            isMarketplaceSubsidized: isSubsidized,
            validFromUtc: new Date().toISOString()
          });
        }
      }

      if (parsedTariffs.length === 0) {
        return { success: false, tariffs: [], error: 'Geçerli tarife satırı bulunamadı. Lütfen kolon sırasını kontrol edin.' };
      }

      return { success: true, tariffs: parsedTariffs };
    } catch (err: any) {
      return { success: false, tariffs: [], error: `CSV işleme hatası: ${err.message || 'Bilinmeyen hata'}` };
    }
  }

  /**
   * Excel için örnek kargo barem şablonu CSV çıktısı üretir
   */
  static generateTariffTemplateCsv(): string {
    const headers = [
      'Pazaryeri Kanalı',
      'Kargo Firması',
      'Barem Adı',
      'Min Sepet Tutarı (TL)',
      'Max Sepet Tutarı (TL)',
      'Min Desi',
      'Max Desi',
      'Satıcı Kargo Bedeli (TL)',
      'Pazaryeri Destekli (Evet/Hayır)'
    ];

    const sampleRows = [
      ['trendyol', 'Trendyol Express', '10 Desi Altı Barem 1', '0', '150', '0', '10', '9.00', 'Evet'],
      ['trendyol', 'Aras Kargo', '10 Desi Altı Barem 1', '0', '150', '0', '10', '20.00', 'Evet'],
      ['trendyol', 'PTT Kargo', '10 Desi Altı Barem 1', '0', '150', '0', '10', '15.00', 'Evet'],
      ['trendyol', 'Trendyol Express', '10 Desi Altı Barem 2', '150.01', '300', '0', '10', '19.00', 'Evet'],
      ['trendyol', 'Aras Kargo', '10 Desi Altı Barem 2', '150.01', '300', '0', '10', '28.50', 'Evet'],
      ['trendyol', 'Trendyol Express', 'Standart Tarife', '300.01', '999999', '0', '10', '39.50', 'Hayır'],
      ['hepsiburada', 'HepsiJet', 'HJ Barem 1', '0', '150', '0', '10', '11.00', 'Evet'],
      ['hepsiburada', 'Aras Kargo', 'HB Barem 1', '0', '150', '0', '10', '21.00', 'Evet'],
      ['hepsiburada', 'HepsiJet', 'HJ Standart', '300.01', '999999', '0', '10', '41.00', 'Hayır'],
      ['n11', 'Aras Kargo', 'N11 Kargo Barem 1', '0', '200', '0', '5', '18.50', 'Evet']
    ];

    const csvContent = [headers.join(';'), ...sampleRows.map(r => r.join(';'))].join('\r\n');
    return '\uFEFF' + csvContent;
  }
}
