import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCartTotals,
  calculateDiscountPercent,
  filterAndSortProducts,
  formatINR,
  generateOrderId,
  validateCustomQuoteForm,
  validateShippingForm,
} from './storeLogic';
import type { CartItem, Product } from '../types/store';

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

test('formatINR formats Indian currency cleanly', () => {
  assert.equal(formatINR(999), '₹999');
  assert.equal(formatINR(1299), '₹1,299');
  assert.equal(formatINR(125000), '₹1,25,000');
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
    pincode: '4000',
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
    mobile: '9820456789',
    pincode: '400050',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: '402 Pearl Residency, Bandra West, Near Pali Hill',
  });
  assert.deepEqual(good, {});
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

test('generateOrderId follows FRA-2611-XXXX format', () => {
  assert.equal(generateOrderId(4821), 'FRA-2611-4821');
});
