import { MarketplaceChannel } from './index';

export interface MasterCategory {
  id: string;
  name: string;
  code: string;
  parentId: string | null;
  slug: string;
  level: number;
  productCount: number;
  iconName?: string;
  description?: string;
}

export interface MasterBrand {
  id: string;
  name: string;
  code: string;
  originCountry: string;
  logoUrl?: string;
  isManufacturer: boolean;
}

export interface CategoryAttributeValueOption {
  id: number | string;
  name: string;
}

export interface CategoryAttributeDefinition {
  attributeId: number | string;
  name: string;
  code: string;
  required: boolean;
  allowCustom: boolean;
  type: 'select' | 'text' | 'number' | 'multi_select';
  values?: CategoryAttributeValueOption[];
  defaultValue?: string | number;
  placeholder?: string;
}

export interface CategoryMarketplaceMapping {
  id: string;
  masterCategoryId: string;
  channel: MarketplaceChannel;
  remoteCategoryId: number | string;
  remoteCategoryName: string;
  remoteCategoryPath: string;
  commissionRate: number;
  mandatoryAttributes: CategoryAttributeDefinition[];
  isVerified: boolean;
  lastSyncUtc: string;
}

export interface BrandMarketplaceMapping {
  id: string;
  masterBrandId: string;
  channel: MarketplaceChannel;
  remoteBrandId: number | string;
  remoteBrandName: string;
  isVerified: boolean;
  lastSyncUtc: string;
}

export interface ProductMarketplaceAttributeValue {
  attributeId: number | string;
  attributeName: string;
  valueId?: number | string;
  customValue?: string | number;
}

export interface ProductReadinessReport {
  productId: string;
  channel: MarketplaceChannel;
  isReady: boolean;
  score: number; // 0 - 100
  missingFields: string[];
  missingMandatoryAttributes: CategoryAttributeDefinition[];
  warnings: string[];
}

export interface ProductDispatchBatchItem {
  productId: string;
  channel: MarketplaceChannel;
  status: 'Pending' | 'Success' | 'Failed';
  batchId?: string;
  listingBarcode: string;
  listingSku: string;
  channelTitle: string;
  salePrice: number;
  message?: string;
  sentPayload?: Record<string, any>;
  sentAtUtc?: string;
}
