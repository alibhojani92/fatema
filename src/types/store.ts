export type MainCategory =
  | 'Resin & Hardener'
  | 'Pigments'
  | 'Molds'
  | 'Embellishments'
  | 'Clock & MDF Bases'
  | 'Ready & Custom Art'
  | 'Starter Kits';

export type FilterTab =
  | 'All'
  | 'Resin & Hardener'
  | 'Pigments'
  | 'Molds'
  | 'Ready & Custom Art';

export type SortOption =
  | 'featured'
  | 'price-asc'
  | 'price-desc'
  | 'rating-desc';

export interface ProductVariant {
  id: string;
  label: string;
  price: number;
  mrp: number;
  swatchHex?: string;
}

export interface ProductSpecs {
  mixingRatio?: string;
  potLife?: string;
  curingTime?: string;
  vocStatus?: string;
  dimensions?: string;
  finish?: string;
  contents?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: MainCategory;
  categorySlug: string;
  filterTab: Exclude<FilterTab, 'All'>;
  rating: number;
  reviewCount: number;
  description: string;
  shortNote: string;
  images: string[];
  variants: ProductVariant[];
  specs: ProductSpecs;
  inStock: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isCustomOrder?: boolean;
  fallbackTone: string;
}

export interface CategoryArchItem {
  id: string;
  name: string;
  slug: string;
  filterTab: FilterTab;
  subtitle: string;
  image: string;
  fallbackTone: string;
}

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  variantLabel: string;
  category: string;
  price: number;
  mrp: number;
  quantity: number;
  image: string;
  fallbackTone: string;
}

export type PaymentMode = 'upi' | 'card' | 'cod';

export interface OrderShipping {
  fullName: string;
  mobile: string;
  pincode: string;
  city: string;
  state: string;
  address: string;
}

export interface OrderTimelineStep {
  label: string;
  date: string;
  completed: boolean;
  active?: boolean;
}

export interface Order {
  id: string;
  createdAt: string;
  items: CartItem[];
  shipping: OrderShipping;
  paymentMode: PaymentMode;
  subtotal: number;
  discountAmount: number;
  couponCode: string | null;
  shippingFee: number;
  codFee: number;
  grandTotal: number;
  status: 'Confirmed' | 'Packed' | 'In Transit' | 'Delivered';
  estimatedDelivery: string;
  timeline: OrderTimelineStep[];
}

export interface CustomQuoteRequest {
  id: string;
  fullName: string;
  whatsapp: string;
  artType: string;
  size: string;
  preferredColors: string;
  notes: string;
  createdAt: string;
}

export interface ReelItem {
  id: string;
  title: string;
  caption: string;
  duration: string;
  views: string;
  image: string;
  fallbackTone: string;
  productId: string;
  technique: string;
}

export interface ReviewItem {
  id: string;
  author: string;
  role: string;
  city: string;
  rating: number;
  purchasedItem: string;
  quote: string;
  verifiedDate: string;
}
