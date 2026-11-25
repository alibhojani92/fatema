import test from 'node:test';
import assert from 'node:assert/strict';
import {
  authenticateCustomer,
  buildWhatsAppOrderUrl,
  buildWhatsAppProductUrl,
  calculateCartTotals,
  calculateDiscountPercent,
  filterAndSortProducts,
  formatINR,
  generateOrderId,
  getCustomerOrders,
  getFirstName,
  parseVariantLabels,
  STORE_ADDRESS,
  STORE_PHONE_DISPLAY,
  validateCustomQuoteForm,
  validateProfileUpdateForm,
  validateRegistrationForm,
  validateShippingForm,
  verifyAdminPassword,
  WHATSAPP_NUMBER,
} from './storeLogic';
import type { CartItem, CustomerAccount, Order, Product } from '../types/store';

const sampleCart: CartItem[] = [
  {
    productId: 'p1',
    variantId: 'v1',
    name: 'Ultra Clear 2:1 Epoxy Resin',
    variantLabel: '1.5kg Kit',
    category: 'Resin & Hardener',
    price: 1200,
    mrp: 1500,
    quantity: 1,
    image: '/img1.jpg',
    fallbackTone: '#FDF8F6',
  },
];

const sampleProducts: Product[] = [
  {
    id: 'p1',
    sku: 'FRA-01',
    name: 'Ultra Clear 2:1 Art Epoxy Resin',
    brand: 'Fatima Studio',
    category: 'Resin & Hardener',
    categorySlug: 'epoxy-resin',
    filterTab: 'Resin & Hardener',
    rating: 4.9,
    reviewCount: 210,
    description: 'Crystal clear UV resistant resin',
    shortNote: '2:1 ratio',
    images: ['/a.jpg'],
    variants: [{ id: 'v1', label: '300g', price: 449, mrp: 599 }],
    specs: {},
    inStock: true,
    isBestSeller: true,
    fallbackTone: '#FDF8F6',
  },
  {
    id: 'p2',
    sku: 'FRA-02',
    name: 'Pearl Mica Pigment Set',
    brand: 'Fatima Studio',
    category: 'Pigments',
    categorySlug: 'mica-powders',
    filterTab: 'Pigments',
    rating: 4.8,
    reviewCount: 95,
    description: 'Metallic cosmetic grade mica powders',
    shortNote: '12 shades',
    images: ['/b.jpg'],
    variants: [{ id: 'v2', label: '12 x 10g', price: 899, mrp: 1199 }],
    specs: {},
    inStock: true,
    isFeatured: true,
    fallbackTone: '#F6EAE6',
  },
];

const sampleAccount: CustomerAccount = {
  id: 'cust-1',
  fullName: 'Fatima Patel',
  mobile: '9313626852',
  email: 'fatima@example.com',
  password: 'secret123',
  city: 'Bhavnagar',
  state: 'Gujarat',
  pincode: '364001',
  address: '12 Green Park Society, Bhavnagar',
  createdAt: '24 Nov 2026',
};

test('formatINR formats Indian currency cleanly', () => {
  assert.equal(formatINR(999), '₹999');
  assert.equal(formatINR(1299), '₹1,299');
  assert.equal(formatINR(125000), '₹1,25,000');
});

test('official contact constants and WhatsApp routing match store details', () => {
  assert.equal(WHATSAPP_NUMBER, '919313626852');
  assert.equal(STORE_PHONE_DISPLAY, '+91 93136 26852');
  assert.equal(STORE_ADDRESS, 'Green Park, Bhavnagar, Gujarat');

  const prodUrl = buildWhatsAppProductUrl(sampleProducts[0], sampleProducts[0].variants[0], 2);
  assert.ok(prodUrl.startsWith('https://wa.me/919313626852?text='));
  assert.ok(decodeURIComponent(prodUrl).includes('Ultra Clear 2:1 Art Epoxy Resin'));
});

test('calculateDiscountPercent returns rounded percentage', () => {
  assert.equal(calculateDiscountPercent(1500, 1200), 20);
  assert.equal(calculateDiscountPercent(1000, 1000), 0);
  assert.equal(calculateDiscountPercent(0, 500), 0);
});

test('calculateCartTotals unlocks free shipping at ₹999 and applies FATIMA10', () => {
  const totals = calculateCartTotals(sampleCart, 'fatima10', 'upi');
  assert.equal(totals.subtotal, 1200);
  assert.equal(totals.discountAmount, 120);
  assert.equal(totals.freeShippingUnlocked, true);
  assert.equal(totals.freeShippingRemaining, 0);
  assert.equal(totals.shippingFee, 0);
  assert.equal(totals.codFee, 0);
  assert.equal(totals.grandTotal, 1080);
  assert.equal(totals.appliedCoupon?.code, 'FATIMA10');
  assert.equal(totals.couponError, null);
});

test('calculateCartTotals charges shipping below ₹999 and COD fee for COD mode', () => {
  const smallCart: CartItem[] = [{ ...sampleCart[0], price: 600, mrp: 750 }];
  const totals = calculateCartTotals(smallCart, 'INVALID', 'cod');
  assert.equal(totals.freeShippingUnlocked, false);
  assert.equal(totals.freeShippingRemaining, 399);
  assert.equal(totals.shippingFee, 79);
  assert.equal(totals.codFee, 49);
  assert.equal(totals.grandTotal, 728);
  assert.ok(totals.couponError?.includes('INVALID'));
});

test('filterAndSortProducts filters by tab, category, query, and sorts by price', () => {
  const byTab = filterAndSortProducts(sampleProducts, {
    activeTab: 'Pigments',
    activeCategorySlug: null,
    searchQuery: '',
    sortBy: 'featured',
  });
  assert.equal(byTab.length, 1);
  assert.equal(byTab[0].id, 'p2');

  const desc = filterAndSortProducts(sampleProducts, {
    activeTab: 'All',
    activeCategorySlug: null,
    searchQuery: '',
    sortBy: 'price-desc',
  });
  assert.equal(desc[0].id, 'p2');
  assert.equal(desc[1].id, 'p1');
});

test('validateShippingForm validates Indian mobile and 6-digit pincode', () => {
  const bad = validateShippingForm({
    fullName: 'A',
    mobile: '12345',
    pincode: '3640',
    city: '',
    state: '',
    address: 'Short',
  });
  assert.ok(bad.fullName);
  assert.ok(bad.mobile);
  assert.ok(bad.pincode);
  assert.ok(bad.city);
  assert.ok(bad.state);
  assert.ok(bad.address);

  const good = validateShippingForm({
    fullName: 'Ayesha Siddiqui',
    mobile: '9313626852',
    pincode: '364001',
    city: 'Bhavnagar',
    state: 'Gujarat',
    address: '14 Green Park Residency, Bhavnagar',
  });
  assert.deepEqual(good, {});
});

test('validateRegistrationForm checks required fields and prevents duplicates', () => {
  const bad = validateRegistrationForm(
    {
      fullName: 'A',
      mobile: '9313626852',
      email: 'fatima@example.com',
      password: '123',
      city: '',
      pincode: '364',
    },
    [sampleAccount]
  );
  assert.ok(bad.fullName);
  assert.ok(bad.mobile?.includes('already exists'));
  assert.ok(bad.email?.includes('already exists'));
  assert.ok(bad.password);
  assert.ok(bad.city);
  assert.ok(bad.pincode);

  const good = validateRegistrationForm(
    {
      fullName: 'Zoya Merchant',
      mobile: '9876543210',
      email: 'zoya@example.com',
      password: 'password123',
      city: 'Surat',
      pincode: '395007',
    },
    [sampleAccount]
  );
  assert.deepEqual(good, {});
});

test('authenticateCustomer supports login via email or mobile and rejects wrong password', () => {
  const byEmail = authenticateCustomer('FATIMA@example.com', 'secret123', [sampleAccount]);
  assert.equal(byEmail.account?.id, 'cust-1');

  const byMobile = authenticateCustomer('+91 93136 26852', 'secret123', [sampleAccount]);
  assert.equal(byMobile.account?.id, 'cust-1');

  const wrongPass = authenticateCustomer('fatima@example.com', 'wrong', [sampleAccount]);
  assert.ok(wrongPass.error?.includes('Incorrect password'));

  const unknown = authenticateCustomer('nobody@example.com', 'secret123', [sampleAccount]);
  assert.ok(unknown.error?.includes('No account found'));
});

test('verifyAdminPassword strictly validates 2201', () => {
  assert.equal(verifyAdminPassword('2201'), true);
  assert.equal(verifyAdminPassword(' 2201 '), true);
  assert.equal(verifyAdminPassword('2202'), false);
  assert.equal(verifyAdminPassword(''), false);
});

test('validateProfileUpdateForm and getFirstName work accurately', () => {
  assert.equal(getFirstName('Ayesha Siddiqui'), 'Ayesha');
  assert.deepEqual(
    validateProfileUpdateForm({
      fullName: 'Fatima Patel',
      mobile: '9313626852',
      city: 'Bhavnagar',
      state: 'Gujarat',
      pincode: '364001',
      address: 'Green Park, Bhavnagar',
    }),
    {}
  );
});

test('parseVariantLabels creates multi-variant entries and getCustomerOrders filters properly', () => {
  const variants = parseVariantLabels('300g, 1.5kg, 3kg', 500, 650, 'test');
  assert.equal(variants.length, 3);
  assert.equal(variants[0].label, '300g');
  assert.equal(variants[0].price, 500);
  assert.equal(variants[1].label, '1.5kg');

  const order: Order = {
    id: generateOrderId(4821),
    createdAt: '24 Nov 2026',
    customerId: 'cust-1',
    items: sampleCart,
    shipping: {
      fullName: 'Fatima Patel',
      mobile: '9313626852',
      pincode: '364001',
      city: 'Bhavnagar',
      state: 'Gujarat',
      address: 'Green Park, Bhavnagar',
    },
    paymentMode: 'upi',
    subtotal: 1200,
    discountAmount: 0,
    couponCode: null,
    shippingFee: 0,
    codFee: 0,
    grandTotal: 1200,
    status: 'Confirmed',
    estimatedDelivery: '3-5 days',
    timeline: [],
  };

  assert.equal(getCustomerOrders([order], sampleAccount).length, 1);
  assert.ok(buildWhatsAppOrderUrl(order).startsWith('https://wa.me/919313626852?text='));
});

test('validateCustomQuoteForm validates required fields and WhatsApp number', () => {
  const bad = validateCustomQuoteForm({
    fullName: '',
    whatsapp: '999',
    artType: '',
    size: '',
    preferredColors: '',
    notes: '',
  });
  assert.ok(bad.fullName);
  assert.ok(bad.whatsapp);
  assert.ok(bad.artType);

  const good = validateCustomQuoteForm({
    fullName: 'Meera Kapoor',
    whatsapp: '9876543210',
    artType: 'Wedding Varmala Preservation',
    size: '12x12 Inch Block',
    preferredColors: 'Ivory, Crimson & 24K Gold',
    notes: 'Wedding date 12 Dec',
  });
  assert.deepEqual(good, {});
});
