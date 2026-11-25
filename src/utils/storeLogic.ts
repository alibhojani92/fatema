import type {
  CartItem,
  CustomerAccount,
  FilterTab,
  Order,
  OrderShipping,
  PaymentMode,
  Product,
  ProductVariant,
  SortOption,
} from '../types/store';

export const FREE_SHIPPING_THRESHOLD = 999;
export const STANDARD_SHIPPING_FEE = 79;
export const COD_HANDLING_FEE = 49;
export const WHATSAPP_NUMBER = '919313626852';
export const STORE_PHONE_DISPLAY = '+91 93136 26852';
export const STORE_ADDRESS = 'Green Park, Bhavnagar, Gujarat';
export const ADMIN_PASSWORD = '2201';

export interface CouponDefinition {
  code: string;
  discountPercent: number;
  label: string;
}

export const COUPON_CODES: Record<string, CouponDefinition> = {
  FATIMA10: {
    code: 'FATIMA10',
    discountPercent: 10,
    label: 'Flat 10% OFF on your order',
  },
};

export function formatINR(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.round(amount) : 0;
  return `₹${safe.toLocaleString('en-IN')}`;
}

export function calculateDiscountPercent(mrp: number, price: number): number {
  if (mrp <= 0 || price >= mrp) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

export function normalizeIndianMobile(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits;
}

export function getFirstName(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) return 'Account';
  return trimmed.split(/\s+/)[0] || 'Account';
}

export function verifyAdminPassword(input: string): boolean {
  return input.trim() === ADMIN_PASSWORD;
}

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  mrpTotal: number;
  productSavings: number;
  discountAmount: number;
  shippingFee: number;
  codFee: number;
  grandTotal: number;
  freeShippingRemaining: number;
  freeShippingProgress: number;
  freeShippingUnlocked: boolean;
  appliedCoupon: CouponDefinition | null;
  couponError: string | null;
}

export function calculateCartTotals(
  items: CartItem[],
  rawCouponCode: string,
  paymentMode: PaymentMode = 'upi'
): CartTotals {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const mrpTotal = items.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
  const productSavings = Math.max(0, mrpTotal - subtotal);

  const trimmedCode = rawCouponCode.trim().toUpperCase();
  let appliedCoupon: CouponDefinition | null = null;
  let couponError: string | null = null;

  if (trimmedCode.length > 0) {
    const found = COUPON_CODES[trimmedCode];
    if (found) {
      appliedCoupon = found;
    } else {
      couponError = `Code "${trimmedCode}" is not valid. Try FATIMA10 for 10% off.`;
    }
  }

  const discountAmount = appliedCoupon
    ? Math.round((subtotal * appliedCoupon.discountPercent) / 100)
    : 0;

  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const freeShippingUnlocked = subtotal >= FREE_SHIPPING_THRESHOLD;
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(
    100,
    Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100)
  );

  const shippingFee =
    items.length === 0
      ? 0
      : freeShippingUnlocked
        ? 0
        : STANDARD_SHIPPING_FEE;

  const codFee = items.length > 0 && paymentMode === 'cod' ? COD_HANDLING_FEE : 0;
  const grandTotal = afterDiscount + shippingFee + codFee;

  return {
    itemCount,
    subtotal,
    mrpTotal,
    productSavings,
    discountAmount,
    shippingFee,
    codFee,
    grandTotal,
    freeShippingRemaining,
    freeShippingProgress,
    freeShippingUnlocked,
    appliedCoupon,
    couponError,
  };
}

export interface CatalogFilterParams {
  activeTab: FilterTab;
  activeCategorySlug: string | null;
  searchQuery: string;
  sortBy: SortOption;
}

export function getBasePrice(product: Product): number {
  return product.variants[0]?.price ?? 0;
}

export function filterAndSortProducts(
  products: Product[],
  params: CatalogFilterParams
): Product[] {
  const query = params.searchQuery.trim().toLowerCase();

  const filtered = products.filter((product) => {
    if (params.activeCategorySlug && product.categorySlug !== params.activeCategorySlug) {
      return false;
    }
    if (!params.activeCategorySlug && params.activeTab !== 'All' && product.filterTab !== params.activeTab) {
      return false;
    }
    if (query.length > 0) {
      const haystack = [
        product.name,
        product.category,
        product.brand,
        product.description,
        product.shortNote,
        ...product.variants.map((v) => v.label),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    }
    return true;
  });

  const sorted = [...filtered];
  switch (params.sortBy) {
    case 'price-asc':
      sorted.sort((a, b) => getBasePrice(a) - getBasePrice(b));
      break;
    case 'price-desc':
      sorted.sort((a, b) => getBasePrice(b) - getBasePrice(a));
      break;
    case 'rating-desc':
      sorted.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
      break;
    case 'featured':
    default:
      sorted.sort((a, b) => {
        const scoreA = (a.isBestSeller ? 2 : 0) + (a.isFeatured ? 1 : 0);
        const scoreB = (b.isBestSeller ? 2 : 0) + (b.isFeatured ? 1 : 0);
        return scoreB - scoreA;
      });
      break;
  }

  return sorted;
}

export function searchProductsPreview(products: Product[], query: string, limit = 6): Product[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];
  return products
    .filter((p) => {
      const text = `${p.name} ${p.category} ${p.shortNote} ${p.description}`.toLowerCase();
      return text.includes(trimmed);
    })
    .slice(0, limit);
}

export function validateShippingForm(
  shipping: OrderShipping
): Partial<Record<keyof OrderShipping, string>> {
  const errors: Partial<Record<keyof OrderShipping, string>> = {};
  if (shipping.fullName.trim().length < 2) {
    errors.fullName = 'Please enter your full name.';
  }
  const cleanPhone = normalizeIndianMobile(shipping.mobile);
  if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
    errors.mobile = 'Enter a valid 10-digit Indian mobile number.';
  }
  const cleanPin = shipping.pincode.replace(/\D/g, '');
  if (!/^\d{6}$/.test(cleanPin)) {
    errors.pincode = 'Enter a valid 6-digit Indian pincode.';
  }
  if (shipping.city.trim().length < 2) {
    errors.city = 'Please enter your city.';
  }
  if (shipping.state.trim().length < 2) {
    errors.state = 'Please select or enter your state.';
  }
  if (shipping.address.trim().length < 8) {
    errors.address = 'Please provide house/flat number, street, and landmark.';
  }
  return errors;
}

export interface RegistrationInput {
  fullName: string;
  mobile: string;
  email: string;
  password: string;
  city: string;
  pincode: string;
}

export function validateRegistrationForm(
  input: RegistrationInput,
  existingAccounts: CustomerAccount[]
): Partial<Record<keyof RegistrationInput, string>> {
  const errors: Partial<Record<keyof RegistrationInput, string>> = {};
  if (input.fullName.trim().length < 2) {
    errors.fullName = 'Please enter your full name.';
  }
  const cleanPhone = normalizeIndianMobile(input.mobile);
  if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
    errors.mobile = 'Enter a valid 10-digit Indian mobile number.';
  } else if (existingAccounts.some((acc) => normalizeIndianMobile(acc.mobile) === cleanPhone)) {
    errors.mobile = 'An account with this mobile number already exists. Please log in.';
  }
  const cleanEmail = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    errors.email = 'Enter a valid email address.';
  } else if (existingAccounts.some((acc) => acc.email.trim().toLowerCase() === cleanEmail)) {
    errors.email = 'An account with this email already exists. Please log in.';
  }
  if (input.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }
  if (input.city.trim().length < 2) {
    errors.city = 'Please enter your city.';
  }
  const cleanPin = input.pincode.replace(/\D/g, '');
  if (!/^\d{6}$/.test(cleanPin)) {
    errors.pincode = 'Enter a valid 6-digit Indian pincode.';
  }
  return errors;
}

export function authenticateCustomer(
  identifier: string,
  password: string,
  accounts: CustomerAccount[]
): { account?: CustomerAccount; error?: string } {
  const trimmedId = identifier.trim();
  if (!trimmedId) {
    return { error: 'Please enter your registered email address or mobile number.' };
  }
  if (!password) {
    return { error: 'Please enter your password.' };
  }
  const lowerEmail = trimmedId.toLowerCase();
  const normalizedPhone = normalizeIndianMobile(trimmedId);
  const found = accounts.find(
    (acc) =>
      acc.email.trim().toLowerCase() === lowerEmail ||
      (normalizedPhone.length === 10 && normalizeIndianMobile(acc.mobile) === normalizedPhone)
  );
  if (!found) {
    return { error: 'No account found with that email or mobile number. Please create an account.' };
  }
  if (found.password !== password) {
    return { error: 'Incorrect password. Please try again.' };
  }
  return { account: found };
}

export interface ProfileUpdateInput {
  fullName: string;
  mobile: string;
  city: string;
  state: string;
  pincode: string;
  address: string;
}

export function validateProfileUpdateForm(
  input: ProfileUpdateInput
): Partial<Record<keyof ProfileUpdateInput, string>> {
  const errors: Partial<Record<keyof ProfileUpdateInput, string>> = {};
  if (input.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters.';
  }
  const cleanPhone = normalizeIndianMobile(input.mobile);
  if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
    errors.mobile = 'Enter a valid 10-digit Indian mobile number.';
  }
  if (input.city.trim().length < 2) {
    errors.city = 'Enter a valid city name.';
  }
  const cleanPin = input.pincode.replace(/\D/g, '');
  if (!/^\d{6}$/.test(cleanPin)) {
    errors.pincode = 'Enter a valid 6-digit pincode.';
  }
  return errors;
}

export function getCustomerOrders(orders: Order[], customer: CustomerAccount): Order[] {
  const userPhone = normalizeIndianMobile(customer.mobile);
  const userEmail = customer.email.trim().toLowerCase();
  return orders.filter(
    (order) =>
      order.customerId === customer.id ||
      (order.customerEmail && order.customerEmail.trim().toLowerCase() === userEmail) ||
      normalizeIndianMobile(order.shipping.mobile) === userPhone
  );
}

export function parseVariantLabels(
  rawVariants: string,
  basePrice: number,
  baseMrp: number,
  idPrefix: string
): ProductVariant[] {
  const labels = rawVariants
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (labels.length === 0) {
    return [
      {
        id: `${idPrefix}-v1`,
        label: 'Standard Pack',
        price: Math.round(basePrice),
        mrp: Math.round(Math.max(basePrice, baseMrp)),
      },
    ];
  }

  return labels.map((label, idx) => {
    const multiplier = idx === 0 ? 1 : Number((1 + idx * 0.45).toFixed(2));
    const vPrice = Math.round(basePrice * multiplier);
    const vMrp = Math.round(Math.max(basePrice, baseMrp) * multiplier);
    return {
      id: `${idPrefix}-v${idx + 1}`,
      label,
      price: vPrice,
      mrp: vMrp,
    };
  });
}

export interface CustomQuoteInput {
  fullName: string;
  whatsapp: string;
  artType: string;
  size: string;
  preferredColors: string;
  notes: string;
}

export function validateCustomQuoteForm(
  input: CustomQuoteInput
): Partial<Record<keyof CustomQuoteInput, string>> {
  const errors: Partial<Record<keyof CustomQuoteInput, string>> = {};
  if (input.fullName.trim().length < 2) {
    errors.fullName = 'Please enter your name.';
  }
  const cleanPhone = normalizeIndianMobile(input.whatsapp);
  if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
    errors.whatsapp = 'Enter a valid 10-digit WhatsApp number.';
  }
  if (!input.artType.trim()) {
    errors.artType = 'Select the type of custom resin artwork.';
  }
  if (!input.size.trim()) {
    errors.size = 'Specify your preferred size.';
  }
  if (input.preferredColors.trim().length < 2) {
    errors.preferredColors = 'Share at least one preferred colour palette.';
  }
  return errors;
}

export function generateOrderId(randomDigits?: number): string {
  const num = randomDigits ?? Math.floor(1000 + Math.random() * 9000);
  return `FRA-2611-${num}`;
}

export function buildWhatsAppOrderUrl(order: Order): string {
  const lines = [
    `Hello Fatima Resin Art! I just placed an order on your website.`,
    ``,
    `Order ID: ${order.id}`,
    `Customer: ${order.shipping.fullName} (${order.shipping.mobile})`,
    `Delivery: ${order.shipping.address}, ${order.shipping.city}, ${order.shipping.state} - ${order.shipping.pincode}`,
    `Payment Mode: ${order.paymentMode.toUpperCase()}`,
    ``,
    `Items:`,
    ...order.items.map(
      (item) => `• ${item.name} (${item.variantLabel}) × ${item.quantity} — ${formatINR(item.price * item.quantity)}`
    ),
    ``,
    order.couponCode ? `Coupon Applied (${order.couponCode}): -${formatINR(order.discountAmount)}` : null,
    `Total Payable: ${formatINR(order.grandTotal)}`,
  ].filter(Boolean);

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
}

export function buildWhatsAppProductUrl(
  product: Product,
  variant: ProductVariant,
  quantity: number
): string {
  const message = [
    `Hello Fatima Resin Art! I would like to order directly:`,
    `• Product: ${product.name}`,
    `• Variant: ${variant.label}`,
    `• Quantity: ${quantity}`,
    `• Amount: ${formatINR(variant.price * quantity)}`,
  ].join('\n');

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppQuoteUrl(quote: CustomQuoteInput, quoteId: string): string {
  const message = [
    `Hello Fatima Resin Art! Custom Resin Quote Request (${quoteId})`,
    `• Name: ${quote.fullName}`,
    `• WhatsApp: ${quote.whatsapp}`,
    `• Art Type: ${quote.artType}`,
    `• Size: ${quote.size}`,
    `• Preferred Colours: ${quote.preferredColors}`,
    quote.notes ? `• Notes: ${quote.notes}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
