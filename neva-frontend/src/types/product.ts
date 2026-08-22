export interface ProductImageItem {
  id?: string;
  imageUrl: string;
  isPrimary?: boolean;
  mediaType?: 'image' | 'video';
  color?: string;
}

export interface MaterialVariantItem {
  name: string;
  priceAdjustment: number;
}

export interface ColorOptionItem {
  name: string;
  code: string;
  priceAdjustment?: number;
  imageUrl?: string;
}

export interface SizeVariantItem {
  name: string;
  priceAdjustment: number;
}

export interface KeyFeatureItem {
  title: string;
  description: string;
  icon?: string;
}

export interface Product {
  id: string;
  name: string;
  slug?: string;
  sku?: string;
  category?: string | { id: string; name: string; slug: string };
  categoryId?: string;
  price: number | string;
  discountPrice?: number | string | null;
  stock?: number;
  status?: 'draft' | 'active' | 'out_of_stock';
  rating?: number;
  image?: string;
  images?: ProductImageItem[];
  badge?: string;
  isIoT?: boolean;
  description?: string | null;
  materialVariants?: MaterialVariantItem[];
  colorOptions?: ColorOptionItem[];
  sizeVariants?: SizeVariantItem[];
  careInstructions?: string[];
  keyFeatures?: KeyFeatureItem[];
  specifications?: Record<string, any>;
  specs?: Record<string, string>;
}
