import { 
  MasterCategory, 
  MasterBrand, 
  CategoryMarketplaceMapping, 
  BrandMarketplaceMapping 
} from '../types';

// ============================================================================
// 1. MERKEZİ ERP HİYERARŞİK KATEGORİ AĞACI (MASTER CATEGORY TREE)
// ============================================================================
export const INITIAL_MASTER_CATEGORIES: MasterCategory[] = [
  // 1. KADEME ANA KÖK KATEGORİLER
  {
    id: 'cat-kozmetik',
    name: 'Kozmetik & Kişisel Bakım',
    code: 'CAT-KOZ',
    parentId: null,
    slug: 'kozmetik-ve-kisisel-bakim',
    level: 1,
    productCount: 4,
    description: 'Kolonya, losyon, ıslak mendil ve dezenfektan ürünleri.'
  },
  {
    id: 'cat-gida',
    name: 'Gıda & Şarküteri',
    code: 'CAT-GID',
    parentId: null,
    slug: 'gida-ve-sarkuteri',
    level: 1,
    productCount: 3,
    description: 'Zeytin, natürel zeytinyağı ve yöresel organik lezzetler.'
  },
  {
    id: 'cat-elektronik',
    name: 'Elektronik & Çevre Birimleri',
    code: 'CAT-ELK',
    parentId: null,
    slug: 'elektronik-ve-cevre-birimleri',
    level: 1,
    productCount: 2,
    description: 'Bluetooth kulaklıklar, oyuncu klavyeleri ve ses sistemleri.'
  },
  {
    id: 'cat-ev-yasam',
    name: 'Ev, Yaşam & Aksesuar',
    code: 'CAT-EVY',
    parentId: null,
    slug: 'ev-yasam-ve-aksesuar',
    level: 1,
    productCount: 2,
    description: 'Termos mataralar, hakiki deri cüzdanlar ve outdoor ekipmanlar.'
  },

  // 2. KADEME ALT KATEGORİLER (ÜRÜNLERİMİZİN BAĞLANDIĞI UÇLAR)
  {
    id: 'cat-kolonya',
    name: 'Geleneksel Kolonya & Losyon',
    code: 'CAT-KOZ-KOL',
    parentId: 'cat-kozmetik',
    slug: 'geleneksel-kolonya-ve-losyon',
    level: 2,
    productCount: 3,
    description: '80 derece limon, lavanta ve tütün kolonyaları.'
  },
  {
    id: 'cat-mendil',
    name: 'Islak Mendil & Hijyen Paketleri',
    code: 'CAT-KOZ-MEN',
    parentId: 'cat-kozmetik',
    slug: 'islak-mendil-ve-hijyen-paketleri',
    level: 2,
    productCount: 1,
    description: 'Tekli ambalajlı ve çoklu paket ıslak cep mendilleri.'
  },
  {
    id: 'cat-zeytinyagi',
    name: 'Erken Hasat Zeytinyağı',
    code: 'CAT-GID-ZYT-YAG',
    parentId: 'cat-gida',
    slug: 'erken-hasat-zeytinyagi',
    level: 2,
    productCount: 2,
    description: 'Soğuk sıkım natürel sızma cam şişe zeytinyağları.'
  },
  {
    id: 'cat-zeytin',
    name: 'Sofralık Siyah & Yeşil Zeytin',
    code: 'CAT-GID-ZYT-SOF',
    parentId: 'cat-gida',
    slug: 'sofralik-siyah-ve-yesil-zeytin',
    level: 2,
    productCount: 1,
    description: 'Gemlik ve Edremit tipi teneke ve kavanoz sofralık zeytin.'
  },
  {
    id: 'cat-kulaklik',
    name: 'Bluetooth Kulaklık & ANC',
    code: 'CAT-ELK-KUL',
    parentId: 'cat-elektronik',
    slug: 'bluetooth-kulaklik-ve-anc',
    level: 2,
    productCount: 1,
    description: 'Gürültü engelleyici kablosuz kulak içi ve kulak üstü modeller.'
  },
  {
    id: 'cat-klavye',
    name: 'Mekanik Oyuncu Klavyesi',
    code: 'CAT-ELK-KLV',
    parentId: 'cat-elektronik',
    slug: 'mekanik-oyuncu-klavyesi',
    level: 2,
    productCount: 1,
    description: 'RGB aydınlatmalı mekanik switch Türkçe klavyeler.'
  },
  {
    id: 'cat-termos',
    name: 'Çelik Termos & Vakumlu Matara',
    code: 'CAT-EVY-TRM',
    parentId: 'cat-ev-yasam',
    slug: 'celik-termos-ve-vakumlu-matara',
    level: 2,
    productCount: 1,
    description: 'Çift katman paslanmaz çelik sıcak/soğuk termoslar.'
  },
  {
    id: 'cat-cuzdan',
    name: 'Hakiki Deri Cüzdan & Kartlık',
    code: 'CAT-EVY-CZD',
    parentId: 'cat-ev-yasam',
    slug: 'hakiki-deri-cuzdan-ve-kartlik',
    level: 2,
    productCount: 1,
    description: 'RFID korumalı el işçiliği slim deri cüzdanlar.'
  }
];

// ============================================================================
// 2. MERKEZİ ÜRETİCİ MARKA TABLOSU (MASTER BRANDS)
// ============================================================================
export const INITIAL_MASTER_BRANDS: MasterBrand[] = [
  {
    id: 'brand-marmara',
    name: 'Marmara Kolonya',
    code: 'BRD-MRM',
    originCountry: 'Türkiye',
    isManufacturer: true
  },
  {
    id: 'brand-eyup-sabri',
    name: 'Eyüp Sabri Tuncer',
    code: 'BRD-EST',
    originCountry: 'Türkiye',
    isManufacturer: true
  },
  {
    id: 'brand-taris',
    name: 'Tariş Zeytinyağı',
    code: 'BRD-TRS',
    originCountry: 'Türkiye',
    isManufacturer: true
  },
  {
    id: 'brand-kirlangic',
    name: 'Kırlangıç',
    code: 'BRD-KRL',
    originCountry: 'Türkiye',
    isManufacturer: true
  },
  {
    id: 'brand-acoustic',
    name: 'AcousticPlus',
    code: 'BRD-ACP',
    originCountry: 'Almanya',
    isManufacturer: true
  },
  {
    id: 'brand-novatech',
    name: 'NovaTech',
    code: 'BRD-NVT',
    originCountry: 'Tayvan',
    isManufacturer: true
  },
  {
    id: 'brand-hydrosteel',
    name: 'HydroSteel',
    code: 'BRD-HDS',
    originCountry: 'Türkiye',
    isManufacturer: true
  },
  {
    id: 'brand-leathercraft',
    name: 'LeatherCraft',
    code: 'BRD-LCR',
    originCountry: 'Türkiye',
    isManufacturer: true
  }
];

// ============================================================================
// 3. PAZARYERİ KATEGORİ VE ZORUNLU NİTELİK EŞLEME MATRİSİ
// (Yalnızca ürünlerimizin olduğu kategoriler için optimize edilmiştir)
// ============================================================================
export const INITIAL_CATEGORY_MAPPINGS: CategoryMarketplaceMapping[] = [
  // Kolonya -> Trendyol & Hepsiburada & N11
  {
    id: 'map-cat-kolonya-ty',
    masterCategoryId: 'cat-kolonya',
    channel: 'trendyol',
    remoteCategoryId: 412,
    remoteCategoryName: 'Kolonya',
    remoteCategoryPath: 'Kişisel Bakım > Parfüm & Deodorant > Kolonya',
    commissionRate: 19.5,
    isVerified: true,
    lastSyncUtc: new Date().toISOString(),
    mandatoryAttributes: [
      {
        attributeId: 338,
        name: 'Hacim',
        code: 'volume',
        required: true,
        allowCustom: false,
        type: 'select',
        values: [
          { id: 1, name: '100 ml' },
          { id: 2, name: '200 ml' },
          { id: 3, name: '400 ml' },
          { id: 4, name: '1000 ml' },
          { id: 5, name: '5 Litre' }
        ],
        defaultValue: '400 ml'
      },
      {
        attributeId: 342,
        name: 'Koku Türü',
        code: 'fragrance_type',
        required: true,
        allowCustom: false,
        type: 'select',
        values: [
          { id: 10, name: 'Limon' },
          { id: 11, name: 'Lavanta' },
          { id: 12, name: 'Tütün' },
          { id: 13, name: 'Gül' },
          { id: 14, name: 'Amber' }
        ],
        defaultValue: 'Limon'
      },
      {
        attributeId: 349,
        name: 'Form',
        code: 'product_form',
        required: true,
        allowCustom: false,
        type: 'select',
        values: [
          { id: 20, name: 'Sıvı / Losyon' },
          { id: 21, name: 'Sprey' },
          { id: 22, name: 'Jel' }
        ],
        defaultValue: 'Sıvı / Losyon'
      }
    ]
  },
  {
    id: 'map-cat-kolonya-hb',
    masterCategoryId: 'cat-kolonya',
    channel: 'hepsiburada',
    remoteCategoryId: 1802,
    remoteCategoryName: 'Kolonyalar',
    remoteCategoryPath: 'Sağlık & Kozmetik > Parfüm & Vücut > Kolonyalar',
    commissionRate: 18.0,
    isVerified: true,
    lastSyncUtc: new Date().toISOString(),
    mandatoryAttributes: [
      {
        attributeId: 'hb_volume',
        name: 'Hacim',
        code: 'hb_volume',
        required: true,
        allowCustom: false,
        type: 'select',
        values: [
          { id: 101, name: '100 ml' },
          { id: 102, name: '200 ml' },
          { id: 103, name: '400 ml' },
          { id: 104, name: '1 L' }
        ],
        defaultValue: '400 ml'
      },
      {
        attributeId: 'hb_alcohol',
        name: 'Alkol Derecesi',
        code: 'hb_alcohol',
        required: true,
        allowCustom: false,
        type: 'select',
        values: [
          { id: 201, name: '60 Derece' },
          { id: 202, name: '70 Derece' },
          { id: 203, name: '80 Derece' }
        ],
        defaultValue: '80 Derece'
      }
    ]
  },
  {
    id: 'map-cat-kolonya-n11',
    masterCategoryId: 'cat-kolonya',
    channel: 'n11',
    remoteCategoryId: 100234,
    remoteCategoryName: 'Kolonya',
    remoteCategoryPath: 'Kozmetik & Kişisel Bakım > Parfüm & Deodorant > Kolonya',
    commissionRate: 17.0,
    isVerified: true,
    lastSyncUtc: new Date().toISOString(),
    mandatoryAttributes: [
      {
        attributeId: 'n11_vol',
        name: 'Miktar',
        code: 'n11_vol',
        required: true,
        allowCustom: true,
        type: 'text',
        defaultValue: '400 ml'
      }
    ]
  },

  // Zeytinyağı -> Trendyol & Hepsiburada
  {
    id: 'map-cat-zeytinyagi-ty',
    masterCategoryId: 'cat-zeytinyagi',
    channel: 'trendyol',
    remoteCategoryId: 1089,
    remoteCategoryName: 'Zeytinyağı',
    remoteCategoryPath: 'Süpermarket > Temel Gıda > Sıvı Yağlar > Zeytinyağı',
    commissionRate: 12.0,
    isVerified: true,
    lastSyncUtc: new Date().toISOString(),
    mandatoryAttributes: [
      {
        attributeId: 4401,
        name: 'Zeytinyağı Türü',
        code: 'olive_type',
        required: true,
        allowCustom: false,
        type: 'select',
        values: [
          { id: 1, name: 'Erken Hasat Soğuk Sıkım' },
          { id: 2, name: 'Natürel Sızma' },
          { id: 3, name: 'Riviera' }
        ],
        defaultValue: 'Erken Hasat Soğuk Sıkım'
      },
      {
        attributeId: 4402,
        name: 'Ambalaj Türü',
        code: 'packaging_type',
        required: true,
        allowCustom: false,
        type: 'select',
        values: [
          { id: 10, name: 'Koyu Cam Şişe' },
          { id: 11, name: 'Teneke' },
          { id: 12, name: 'Pet' }
        ],
        defaultValue: 'Koyu Cam Şişe'
      },
      {
        attributeId: 4403,
        name: 'Hacim',
        code: 'volume',
        required: true,
        allowCustom: false,
        type: 'select',
        values: [
          { id: 20, name: '500 ml' },
          { id: 21, name: '1000 ml' },
          { id: 22, name: '2 Litre' },
          { id: 23, name: '5 Litre' }
        ],
        defaultValue: '1000 ml'
      }
    ]
  },
  {
    id: 'map-cat-zeytinyagi-hb',
    masterCategoryId: 'cat-zeytinyagi',
    channel: 'hepsiburada',
    remoteCategoryId: 2041,
    remoteCategoryName: 'Zeytinyağları',
    remoteCategoryPath: 'Market > Temel Gıda > Zeytinyağları',
    commissionRate: 11.5,
    isVerified: true,
    lastSyncUtc: new Date().toISOString(),
    mandatoryAttributes: [
      {
        attributeId: 'hb_olive_oil_type',
        name: 'Sıkım Yöntemi',
        code: 'hb_press_method',
        required: true,
        allowCustom: false,
        type: 'select',
        values: [
          { id: 1, name: 'Soğuk Sıkım' },
          { id: 2, name: 'Taş Baskı' },
          { id: 3, name: 'Sıcak Sıkım' }
        ],
        defaultValue: 'Soğuk Sıkım'
      }
    ]
  },

  // Bluetooth Kulaklık -> Trendyol & Hepsiburada
  {
    id: 'map-cat-kulaklik-ty',
    masterCategoryId: 'cat-kulaklik',
    channel: 'trendyol',
    remoteCategoryId: 648,
    remoteCategoryName: 'Bluetooth Kulaklık',
    remoteCategoryPath: 'Elektronik > Telefon & Aksesuar > Bluetooth Kulaklık',
    commissionRate: 15.0,
    isVerified: true,
    lastSyncUtc: new Date().toISOString(),
    mandatoryAttributes: [
      {
        attributeId: 501,
        name: 'Bağlantı Türü',
        code: 'connectivity',
        required: true,
        allowCustom: false,
        type: 'select',
        values: [
          { id: 1, name: 'Bluetooth 5.3' },
          { id: 2, name: 'Bluetooth 5.2' },
          { id: 3, name: 'Kablolu' }
        ],
        defaultValue: 'Bluetooth 5.3'
      },
      {
        attributeId: 502,
        name: 'Aktif Gürültü Önleme (ANC)',
        code: 'anc_support',
        required: true,
        allowCustom: false,
        type: 'select',
        values: [
          { id: 10, name: 'Var' },
          { id: 11, name: 'Yok' }
        ],
        defaultValue: 'Var'
      },
      {
        attributeId: 503,
        name: 'Renk',
        code: 'color',
        required: true,
        allowCustom: false,
        type: 'select',
        values: [
          { id: 20, name: 'Siyah' },
          { id: 21, name: 'Beyaz' },
          { id: 22, name: 'Gece Mavisi' }
        ],
        defaultValue: 'Siyah'
      }
    ]
  },
  {
    id: 'map-cat-kulaklik-hb',
    masterCategoryId: 'cat-kulaklik',
    channel: 'hepsiburada',
    remoteCategoryId: 3312,
    remoteCategoryName: 'Kablosuz Kulaklıklar',
    remoteCategoryPath: 'Elektronik > Ses Sistemleri > Kablosuz Kulaklıklar',
    commissionRate: 14.5,
    isVerified: true,
    lastSyncUtc: new Date().toISOString(),
    mandatoryAttributes: [
      {
        attributeId: 'hb_bt_version',
        name: 'Bluetooth Versiyonu',
        code: 'hb_bt_version',
        required: true,
        allowCustom: false,
        type: 'select',
        values: [
          { id: 1, name: '5.3' },
          { id: 2, name: '5.2' },
          { id: 3, name: '5.0' }
        ],
        defaultValue: '5.3'
      }
    ]
  },

  // Mekanik Klavye -> Trendyol
  {
    id: 'map-cat-klavye-ty',
    masterCategoryId: 'cat-klavye',
    channel: 'trendyol',
    remoteCategoryId: 712,
    remoteCategoryName: 'Oyuncu Klavyeleri',
    remoteCategoryPath: 'Elektronik > Bilgisayar & Tablet > Oyuncu Donanımları > Klavyeler',
    commissionRate: 16.5,
    isVerified: true,
    lastSyncUtc: new Date().toISOString(),
    mandatoryAttributes: [
      {
        attributeId: 601,
        name: 'Switch Türü',
        code: 'switch_type',
        required: true,
        allowCustom: false,
        type: 'select',
        values: [
          { id: 1, name: 'Brown Switch (Sessiz Dokunsal)' },
          { id: 2, name: 'Red Switch (Lineer Hızlı)' },
          { id: 3, name: 'Blue Switch (Klikli)' }
        ],
        defaultValue: 'Brown Switch (Sessiz Dokunsal)'
      },
      {
        attributeId: 602,
        name: 'Aydınlatma',
        code: 'rgb_lighting',
        required: true,
        allowCustom: false,
        type: 'select',
        values: [
          { id: 10, name: 'RGB Çok Renkli' },
          { id: 11, name: 'Tek Renk LED' },
          { id: 12, name: 'Yok' }
        ],
        defaultValue: 'RGB Çok Renkli'
      },
      {
        attributeId: 603,
        name: 'Klavye Dili',
        code: 'keyboard_layout',
        required: true,
        allowCustom: false,
        type: 'select',
        values: [
          { id: 20, name: 'Türkçe Q' },
          { id: 21, name: 'İngilizce US' }
        ],
        defaultValue: 'Türkçe Q'
      }
    ]
  }
];

// ============================================================================
// 4. PAZARYERİ MARKA EŞLEME MATRİSİ
// (Bizim markalarımızın pazaryerlerindeki karşılıkları)
// ============================================================================
export const INITIAL_BRAND_MAPPINGS: BrandMarketplaceMapping[] = [
  // Marmara Kolonya
  {
    id: 'map-brd-marmara-ty',
    masterBrandId: 'brand-marmara',
    channel: 'trendyol',
    remoteBrandId: 10294,
    remoteBrandName: 'Marmara',
    isVerified: true,
    lastSyncUtc: new Date().toISOString()
  },
  {
    id: 'map-brd-marmara-hb',
    masterBrandId: 'brand-marmara',
    channel: 'hepsiburada',
    remoteBrandId: 4410,
    remoteBrandName: 'Marmara',
    isVerified: true,
    lastSyncUtc: new Date().toISOString()
  },
  {
    id: 'map-brd-marmara-n11',
    masterBrandId: 'brand-marmara',
    channel: 'n11',
    remoteBrandId: 1840,
    remoteBrandName: 'Marmara',
    isVerified: true,
    lastSyncUtc: new Date().toISOString()
  },

  // Eyüp Sabri Tuncer
  {
    id: 'map-brd-est-ty',
    masterBrandId: 'brand-eyup-sabri',
    channel: 'trendyol',
    remoteBrandId: 105,
    remoteBrandName: 'Eyüp Sabri Tuncer',
    isVerified: true,
    lastSyncUtc: new Date().toISOString()
  },
  {
    id: 'map-brd-est-hb',
    masterBrandId: 'brand-eyup-sabri',
    channel: 'hepsiburada',
    remoteBrandId: 129,
    remoteBrandName: 'Eyüp Sabri Tuncer',
    isVerified: true,
    lastSyncUtc: new Date().toISOString()
  },

  // Tariş Zeytinyağı
  {
    id: 'map-brd-taris-ty',
    masterBrandId: 'brand-taris',
    channel: 'trendyol',
    remoteBrandId: 334,
    remoteBrandName: 'Tariş',
    isVerified: true,
    lastSyncUtc: new Date().toISOString()
  },
  {
    id: 'map-brd-taris-hb',
    masterBrandId: 'brand-taris',
    channel: 'hepsiburada',
    remoteBrandId: 882,
    remoteBrandName: 'Tariş',
    isVerified: true,
    lastSyncUtc: new Date().toISOString()
  },

  // AcousticPlus
  {
    id: 'map-brd-acoustic-ty',
    masterBrandId: 'brand-acoustic',
    channel: 'trendyol',
    remoteBrandId: 9912,
    remoteBrandName: 'AcousticPlus',
    isVerified: true,
    lastSyncUtc: new Date().toISOString()
  },
  {
    id: 'map-brd-acoustic-hb',
    masterBrandId: 'brand-acoustic',
    channel: 'hepsiburada',
    remoteBrandId: 14092,
    remoteBrandName: 'AcousticPlus',
    isVerified: true,
    lastSyncUtc: new Date().toISOString()
  },

  // NovaTech
  {
    id: 'map-brd-novatech-ty',
    masterBrandId: 'brand-novatech',
    channel: 'trendyol',
    remoteBrandId: 8821,
    remoteBrandName: 'NovaTech',
    isVerified: true,
    lastSyncUtc: new Date().toISOString()
  },
  {
    id: 'map-brd-novatech-hb',
    masterBrandId: 'brand-novatech',
    channel: 'hepsiburada',
    remoteBrandId: 11204,
    remoteBrandName: 'NovaTech',
    isVerified: true,
    lastSyncUtc: new Date().toISOString()
  },

  // HydroSteel
  {
    id: 'map-brd-hydrosteel-ty',
    masterBrandId: 'brand-hydrosteel',
    channel: 'trendyol',
    remoteBrandId: 12093,
    remoteBrandName: 'HydroSteel',
    isVerified: true,
    lastSyncUtc: new Date().toISOString()
  },

  // LeatherCraft
  {
    id: 'map-brd-leathercraft-ty',
    masterBrandId: 'brand-leathercraft',
    channel: 'trendyol',
    remoteBrandId: 14092,
    remoteBrandName: 'LeatherCraft',
    isVerified: true,
    lastSyncUtc: new Date().toISOString()
  }
];
