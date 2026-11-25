import { useState } from 'react';
import {
  AlertCircle,
  Check,
  KeyRound,
  Lock,
  MessageCircle,
  Package,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import type {
  CustomQuoteRequest,
  FilterTab,
  MainCategory,
  Order,
  OrderStatus,
  Product,
} from '../types/store';
import {
  calculateDiscountPercent,
  formatINR,
  parseVariantLabels,
  verifyAdminPassword,
} from '../utils/storeLogic';

interface StoreManagerModalProps {
  open: boolean;
  products: Product[];
  orders: Order[];
  quoteRequests: CustomQuoteRequest[];
  onClose: () => void;
  onUpdateProductPricing: (
    productId: string,
    newPrice: number,
    newMrp: number,
    inStock: boolean
  ) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

const CATEGORY_OPTIONS: Array<{
  category: MainCategory;
  slug: string;
  filterTab: Exclude<FilterTab, 'All'>;
  defaultImage: string;
}> = [
  {
    category: 'Resin & Hardener',
    slug: 'epoxy-resin',
    filterTab: 'Resin & Hardener',
    defaultImage: '/images/prod-epoxy-21.svg',
  },
  {
    category: 'Pigments',
    slug: 'mica-powders',
    filterTab: 'Pigments',
    defaultImage: '/images/prod-mica-set.svg',
  },
  {
    category: 'Molds',
    slug: 'silicone-molds',
    filterTab: 'Molds',
    defaultImage: '/images/prod-silicone-mold.svg',
  },
  {
    category: 'Embellishments',
    slug: 'dried-flowers',
    filterTab: 'Molds',
    defaultImage: '/images/prod-dried-flowers.svg',
  },
  {
    category: 'Clock & MDF Bases',
    slug: 'mdf-clock-bases',
    filterTab: 'Molds',
    defaultImage: '/images/prod-mdf-clock.svg',
  },
  {
    category: 'Ready & Custom Art',
    slug: 'varmala-preservation',
    filterTab: 'Ready & Custom Art',
    defaultImage: '/images/prod-varmala-frame.svg',
  },
  {
    category: 'Starter Kits',
    slug: 'resin-starter-kits',
    filterTab: 'Resin & Hardener',
    defaultImage: '/images/prod-starter-kit.svg',
  },
];

const ORDER_STATUSES: OrderStatus[] = ['Confirmed', 'Packed', 'In Transit', 'Delivered'];

export function StoreManagerModal({
  open,
  products,
  orders,
  quoteRequests,
  onClose,
  onUpdateProductPricing,
  onAddProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
}: StoreManagerModalProps) {
  // Security Gate state (password: 2201)
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Dashboard tabs
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [showAddForm, setShowAddForm] = useState(false);

  // Inline Edit & Delete states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftPrice, setDraftPrice] = useState('');
  const [draftMrp, setDraftMrp] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  // Add Product form state
  const [name, setName] = useState('');
  const [categoryIdx, setCategoryIdx] = useState(0);
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [discountPercentInput, setDiscountPercentInput] = useState('');
  const [variantsInput, setVariantsInput] = useState('300g, 1.5kg');
  const [imageUrl, setImageUrl] = useState('');
  const [shortNote, setShortNote] = useState('');
  const [newInStock, setNewInStock] = useState(true);
  const [formError, setFormError] = useState('');

  if (!open) return null;

  const handleClose = () => {
    setPasswordInput('');
    setPasswordError('');
    setConfirmDeleteId(null);
    onClose();
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPassword(passwordInput)) {
      setIsUnlocked(true);
      setPasswordError('');
      setPasswordInput('');
    } else {
      setPasswordError('Incorrect Password. Please enter the authorized Admin PIN.');
    }
  };

  const handleLockAdmin = () => {
    setIsUnlocked(false);
    setPasswordInput('');
    setPasswordError('');
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setDraftPrice(String(product.variants[0]?.price ?? 0));
    setDraftMrp(String(product.variants[0]?.mrp ?? 0));
    setConfirmDeleteId(null);
  };

  const saveEdit = (product: Product) => {
    const parsedPrice = Math.max(1, Number(draftPrice) || product.variants[0]?.price || 1);
    const parsedMrp = Math.max(parsedPrice, Number(draftMrp) || parsedPrice);
    onUpdateProductPricing(product.id, parsedPrice, parsedMrp, product.inStock);
    setEditingId(null);
    setFeedback(`Saved pricing for "${product.name}".`);
    window.setTimeout(() => setFeedback(''), 2600);
  };

  const handlePriceOrDiscountChange = (nextPrice: string, nextMrp: string, nextDiscount: string) => {
    setPrice(nextPrice);
    setMrp(nextMrp);
    setDiscountPercentInput(nextDiscount);
  };

  const handleApplyDiscountPercent = (pctStr: string) => {
    setDiscountPercentInput(pctStr);
    const pct = Number(pctStr);
    const baseMrp = Number(mrp);
    const basePrice = Number(price);
    if (Number.isFinite(pct) && pct >= 0 && pct < 95) {
      if (baseMrp > 0) {
        const computedSelling = Math.max(1, Math.round(baseMrp * (1 - pct / 100)));
        setPrice(String(computedSelling));
      } else if (basePrice > 0 && pct > 0) {
        const computedMrp = Math.round(basePrice / (1 - pct / 100));
        setMrp(String(computedMrp));
      }
    }
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = Number(price);
    let numericMrp = Number(mrp);
    const numericDisc = Number(discountPercentInput);

    if (!numericMrp && Number.isFinite(numericDisc) && numericDisc > 0 && numericDisc < 95 && numericPrice > 0) {
      numericMrp = Math.round(numericPrice / (1 - numericDisc / 100));
    }
    if (!numericMrp) {
      numericMrp = numericPrice;
    }

    if (name.trim().length < 3) {
      setFormError('Enter a product title (at least 3 characters).');
      return;
    }
    if (!Number.isFinite(numericPrice) || numericPrice < 50) {
      setFormError('Enter a valid selling price in ₹ (minimum ₹50).');
      return;
    }
    if (numericMrp < numericPrice) {
      setFormError('MRP must be equal to or higher than selling price.');
      return;
    }

    const chosenCat = CATEGORY_OPTIONS[categoryIdx] ?? CATEGORY_OPTIONS[0];
    const newId = `custom-${Date.now()}`;
    const trimmedImg = imageUrl.trim();
    const primaryImage =
      trimmedImg && (trimmedImg.startsWith('http://') || trimmedImg.startsWith('https://') || trimmedImg.startsWith('/'))
        ? trimmedImg
        : chosenCat.defaultImage;

    const variants = parseVariantLabels(variantsInput, numericPrice, numericMrp, newId);

    const newProduct: Product = {
      id: newId,
      sku: `FRA-NEW-${Math.floor(100 + Math.random() * 900)}`,
      name: name.trim(),
      brand: 'Fatima Studio',
      category: chosenCat.category,
      categorySlug: chosenCat.slug,
      filterTab: chosenCat.filterTab,
      rating: 5.0,
      reviewCount: 1,
      shortNote: shortNote.trim() || 'Newly Added Studio Release',
      description:
        shortNote.trim() ||
        'Freshly curated studio addition from Fatima Resin Art, Bhavnagar, Gujarat.',
      images: [primaryImage, '/images/detail-resin-gloss.svg'],
      variants,
      specs: {
        vocStatus: 'Studio Tested Quality · Dispatched from Bhavnagar, Gujarat',
      },
      inStock: newInStock,
      isFeatured: true,
      fallbackTone: '#FDF8F6',
    };

    onAddProduct(newProduct);
    setName('');
    setPrice('');
    setMrp('');
    setDiscountPercentInput('');
    setVariantsInput('300g, 1.5kg');
    setImageUrl('');
    setShortNote('');
    setNewInStock(true);
    setFormError('');
    setShowAddForm(false);
    setFeedback(`Published "${newProduct.name}" to the storefront.`);
    window.setTimeout(() => setFeedback(''), 3000);
  };

  // Password Security Gate View
  if (!isUnlocked) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#23191E]/75 backdrop-blur-xs"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-security-title"
        onClick={handleClose}
      >
        <div
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#23191E]/15 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-5 bg-[#23191E] text-[#FDF8F6] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-white/10 border border-[#C59B27]/50 flex items-center justify-center text-[#E8D5A3]">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h2 id="admin-security-title" className="font-serif text-lg font-semibold">
                  Admin Security Gate
                </h2>
                <p className="text-[11px] text-[#FDF8F6]/70">
                  Fatima Resin Art · Store Manager
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close admin security modal"
              className="p-1.5 rounded-lg text-[#FDF8F6]/75 hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handlePasswordSubmit} noValidate className="p-6 space-y-4">
            <p className="text-sm text-[#5C4B52] leading-relaxed">
              Enter the authorized Admin Password to manage catalog inventory, prices, customer orders, and custom varmala quotes.
            </p>

            <div>
              <label
                htmlFor="admin-password-input"
                className="block text-xs font-semibold text-[#23191E] mb-1.5"
              >
                Admin Password *
              </label>
              <input
                id="admin-password-input"
                type="password"
                autoFocus
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                placeholder="Enter 4-digit Admin Password"
                className="w-full h-11 px-3.5 rounded-lg border border-[#23191E]/20 bg-[#FDF8F6] focus:bg-white focus:border-[#B76E79] text-sm tracking-widest"
              />
            </div>

            {passwordError && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-[#9B2C3E]/10 border border-[#9B2C3E]/30 flex items-center gap-2 text-xs font-semibold text-[#9B2C3E]"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <div className="pt-1 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-lg border border-[#23191E]/18 text-sm font-medium text-[#23191E] hover:bg-[#FDF8F6] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#23191E] hover:bg-[#3A2931] text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                <Lock className="w-4 h-4 text-[#C59B27]" />
                <span>Unlock Admin Panel</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const computedPreviewDiscount =
    Number(mrp) > 0 && Number(price) > 0
      ? calculateDiscountPercent(Number(mrp), Number(price))
      : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#23191E]/75 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="store-manager-title"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden bg-white rounded-2xl shadow-2xl border border-[#23191E]/15 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#23191E]/10 flex items-center justify-between gap-4 bg-[#FDF8F6]">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="w-5 h-5 text-[#B76E79]" />
            <div>
              <h2
                id="store-manager-title"
                className="font-serif text-xl font-semibold text-[#23191E]"
              >
                Fatima Resin Art — Admin Dashboard
              </h2>
              <p className="text-xs text-[#5C4B52] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2E6B4F]" />
                Changes save automatically to localStorage and update the storefront immediately
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleLockAdmin}
              className="px-3 py-1.5 rounded-lg border border-[#23191E]/15 bg-white hover:bg-[#FDF8F6] text-xs font-semibold text-[#5C4B52] cursor-pointer"
            >
              Lock Panel
            </button>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close store manager"
              className="p-2 rounded-lg text-[#5C4B52] hover:bg-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main 2-Tab Navigation */}
        <div className="px-6 pt-3.5 pb-3 border-b border-[#23191E]/8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2" role="tablist" aria-label="Admin sections">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'products'}
              onClick={() => setActiveTab('products')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-[#23191E] text-white'
                  : 'bg-[#FDF8F6] text-[#23191E] hover:bg-[#F6EAE6]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Manage Products ({products.length})</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'orders'}
              onClick={() => setActiveTab('orders')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-[#23191E] text-white'
                  : 'bg-[#FDF8F6] text-[#23191E] hover:bg-[#F6EAE6]'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>
                Customer Orders ({orders.length}) & Quotes ({quoteRequests.length})
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {feedback && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2E6B4F]">
                <Check className="w-4 h-4" />
                {feedback}
              </span>
            )}
            {activeTab === 'products' && (
              <button
                type="button"
                onClick={() => setShowAddForm((v) => !v)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#B76E79] hover:bg-[#9B5560] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddForm ? 'Close Add Form' : 'Add New Product'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: MANAGE PRODUCTS */}
          {activeTab === 'products' && (
            <>
              {showAddForm && (
                <form
                  onSubmit={handleAddProductSubmit}
                  noValidate
                  className="p-5 rounded-xl bg-[#FDF8F6] border border-[#C59B27]/35 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-semibold text-[#23191E]">
                      Add New Storefront Product
                    </h3>
                    {computedPreviewDiscount > 0 && (
                      <span className="text-xs font-semibold text-[#2E6B4F]">
                        Calculated Discount: {computedPreviewDiscount}% OFF
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="admin-prod-name"
                        className="block text-xs font-semibold text-[#23191E] mb-1.5"
                      >
                        Product Title *
                      </label>
                      <input
                        id="admin-prod-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Champagne Gold Liquid Pigment Paste"
                        className="w-full h-10 px-3.5 rounded-lg border border-[#23191E]/18 bg-white text-sm"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="admin-prod-cat"
                        className="block text-xs font-semibold text-[#23191E] mb-1.5"
                      >
                        Category *
                      </label>
                      <select
                        id="admin-prod-cat"
                        value={categoryIdx}
                        onChange={(e) => setCategoryIdx(Number(e.target.value))}
                        className="w-full h-10 px-3 rounded-lg border border-[#23191E]/18 bg-white text-sm"
                      >
                        {CATEGORY_OPTIONS.map((opt, idx) => (
                          <option key={opt.category} value={idx}>
                            {opt.category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="admin-prod-price"
                        className="block text-xs font-semibold text-[#23191E] mb-1.5"
                      >
                        Selling Price (₹) *
                      </label>
                      <input
                        id="admin-prod-price"
                        type="number"
                        min={50}
                        value={price}
                        onChange={(e) => {
                          const val = e.target.value;
                          const nextDisc =
                            Number(mrp) > 0 && Number(val) > 0
                              ? String(calculateDiscountPercent(Number(mrp), Number(val)))
                              : discountPercentInput;
                          handlePriceOrDiscountChange(val, mrp, nextDisc);
                        }}
                        placeholder="699"
                        className="w-full h-10 px-3.5 rounded-lg border border-[#23191E]/18 bg-white text-sm tabular-nums"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="admin-prod-mrp"
                        className="block text-xs font-semibold text-[#23191E] mb-1.5"
                      >
                        MRP (₹) *
                      </label>
                      <input
                        id="admin-prod-mrp"
                        type="number"
                        min={50}
                        value={mrp}
                        onChange={(e) => {
                          const val = e.target.value;
                          const nextDisc =
                            Number(val) > 0 && Number(price) > 0
                              ? String(calculateDiscountPercent(Number(val), Number(price)))
                              : discountPercentInput;
                          handlePriceOrDiscountChange(price, val, nextDisc);
                        }}
                        placeholder="899"
                        className="w-full h-10 px-3.5 rounded-lg border border-[#23191E]/18 bg-white text-sm tabular-nums"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="admin-prod-discount"
                        className="block text-xs font-semibold text-[#23191E] mb-1.5"
                      >
                        Discount %
                      </label>
                      <input
                        id="admin-prod-discount"
                        type="number"
                        min={0}
                        max={90}
                        value={discountPercentInput}
                        onChange={(e) => handleApplyDiscountPercent(e.target.value)}
                        placeholder="22"
                        className="w-full h-10 px-3.5 rounded-lg border border-[#23191E]/18 bg-white text-sm tabular-nums"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="admin-prod-variants"
                        className="block text-xs font-semibold text-[#23191E] mb-1.5"
                      >
                        Weight / Color Variants (comma-separated)
                      </label>
                      <input
                        id="admin-prod-variants"
                        type="text"
                        value={variantsInput}
                        onChange={(e) => setVariantsInput(e.target.value)}
                        placeholder="e.g. 300g, 1.5kg, 3kg or Rose Gold, Pearl White"
                        className="w-full h-10 px-3.5 rounded-lg border border-[#23191E]/18 bg-white text-sm"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="admin-prod-image"
                        className="block text-xs font-semibold text-[#23191E] mb-1.5"
                      >
                        Image URL (optional — uses studio artwork if blank)
                      </label>
                      <input
                        id="admin-prod-image"
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="/images/prod-mica-set.svg or https://..."
                        className="w-full h-10 px-3.5 rounded-lg border border-[#23191E]/18 bg-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="admin-prod-note"
                        className="block text-xs font-semibold text-[#23191E] mb-1.5"
                      >
                        Short Highlight Note
                      </label>
                      <input
                        id="admin-prod-note"
                        type="text"
                        value={shortNote}
                        onChange={(e) => setShortNote(e.target.value)}
                        placeholder="e.g. High-Opalescence Pigment Paste · Ideal for Ocean Cells"
                        className="w-full h-10 px-3.5 rounded-lg border border-[#23191E]/18 bg-white text-sm"
                      />
                    </div>

                    <label className="flex items-center gap-2.5 h-10 px-3.5 rounded-lg bg-white border border-[#23191E]/18 text-xs font-semibold text-[#23191E] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newInStock}
                        onChange={(e) => setNewInStock(e.target.checked)}
                        className="accent-[#B76E79] w-4 h-4"
                      />
                      <span>In Stock Immediately</span>
                    </label>
                  </div>

                  {formError && <p className="text-xs font-medium text-[#9B2C3E]">{formError}</p>}

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-lg bg-[#23191E] hover:bg-[#3A2931] text-white text-sm font-semibold transition-colors cursor-pointer"
                    >
                      Publish Product to Catalog
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setFormError('');
                      }}
                      className="px-4 py-2.5 rounded-lg border border-[#23191E]/15 bg-white text-xs font-semibold text-[#5C4B52] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Existing Inventory Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[#23191E]/10 text-xs text-[#5C4B52]">
                      <th className="pb-3 pr-4 font-semibold">Product</th>
                      <th className="pb-3 px-3 font-semibold">Selling ₹</th>
                      <th className="pb-3 px-3 font-semibold">MRP ₹</th>
                      <th className="pb-3 px-3 font-semibold">Discount</th>
                      <th className="pb-3 px-3 font-semibold">Stock</th>
                      <th className="pb-3 pl-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#23191E]/8 tabular-nums">
                    {products.map((product) => {
                      const base = product.variants[0];
                      const isEditing = editingId === product.id;
                      const isConfirmingDelete = confirmDeleteId === product.id;
                      const disc = base ? calculateDiscountPercent(base.mrp, base.price) : 0;

                      return (
                        <tr key={product.id} className="align-middle">
                          <td className="py-3 pr-4">
                            <p className="font-semibold text-[#23191E] leading-snug">
                              {product.name}
                            </p>
                            <p className="text-xs text-[#5C4B52]">
                              {product.category} · {product.variants.map((v) => v.label).join(', ')}
                            </p>
                          </td>

                          <td className="py-3 px-3">
                            {isEditing ? (
                              <input
                                type="number"
                                min={1}
                                value={draftPrice}
                                onChange={(e) => setDraftPrice(e.target.value)}
                                aria-label={`Selling price for ${product.name}`}
                                className="w-24 h-8 px-2 rounded border border-[#B76E79] text-xs"
                              />
                            ) : (
                              <span className="font-semibold text-[#23191E]">
                                {formatINR(base?.price ?? 0)}
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3">
                            {isEditing ? (
                              <input
                                type="number"
                                min={1}
                                value={draftMrp}
                                onChange={(e) => setDraftMrp(e.target.value)}
                                aria-label={`MRP for ${product.name}`}
                                className="w-24 h-8 px-2 rounded border border-[#B76E79] text-xs"
                              />
                            ) : (
                              <span className="text-[#5C4B52]">{formatINR(base?.mrp ?? 0)}</span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-xs text-[#5C4B52]">
                            {disc > 0 ? `${disc}% OFF` : '—'}
                          </td>

                          <td className="py-3 px-3">
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateProductPricing(
                                  product.id,
                                  base?.price ?? 0,
                                  base?.mrp ?? 0,
                                  !product.inStock
                                )
                              }
                              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                                product.inStock
                                  ? 'bg-[#2E6B4F]/12 text-[#2E6B4F] hover:bg-[#2E6B4F]/20'
                                  : 'bg-[#9B2C3E]/12 text-[#9B2C3E] hover:bg-[#9B2C3E]/20'
                              }`}
                            >
                              {product.inStock ? 'In Stock' : 'Out of Stock'}
                            </button>
                          </td>

                          <td className="py-3 pl-3 text-right whitespace-nowrap">
                            {isEditing ? (
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => saveEdit(product)}
                                  className="px-3 py-1.5 rounded-md bg-[#23191E] text-white text-xs font-semibold cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingId(null)}
                                  className="px-2.5 py-1.5 rounded-md border border-[#23191E]/15 text-xs text-[#5C4B52] cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : isConfirmingDelete ? (
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onDeleteProduct(product.id);
                                    setConfirmDeleteId(null);
                                    setFeedback(`Deleted "${product.name}" from catalog.`);
                                    window.setTimeout(() => setFeedback(''), 2500);
                                  }}
                                  className="px-2.5 py-1.5 rounded-md bg-[#9B2C3E] text-white text-xs font-semibold cursor-pointer"
                                >
                                  Confirm Delete
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-2 py-1.5 rounded-md border border-[#23191E]/15 text-xs text-[#5C4B52] cursor-pointer"
                                >
                                  Keep
                                </button>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => startEdit(product)}
                                  className="px-3 py-1.5 rounded-md border border-[#23191E]/15 hover:border-[#B76E79] text-xs font-semibold text-[#23191E] cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(product.id)}
                                  aria-label={`Delete ${product.name}`}
                                  className="p-1.5 rounded-md border border-[#23191E]/15 hover:border-[#9B2C3E] hover:text-[#9B2C3E] text-[#5C4B52] cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* TAB 2: CUSTOMER ORDERS & CUSTOM QUOTES */}
          {activeTab === 'orders' && (
            <div className="space-y-8">
              {/* Section A: Customer Checkout Orders */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-serif text-lg font-semibold text-[#23191E] flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#B76E79]" />
                    Customer Checkout Orders ({orders.length})
                  </h3>
                </div>

                {orders.length === 0 ? (
                  <p className="p-5 rounded-xl bg-[#FDF8F6] text-sm text-[#5C4B52]">
                    No customer orders placed yet.
                  </p>
                ) : (
                  <div className="space-y-3.5">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="p-4 sm:p-5 rounded-xl bg-[#FDF8F6] border border-[#23191E]/10 space-y-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-[#23191E]/10">
                          <div>
                            <p className="text-sm font-bold text-[#23191E] tabular-nums">
                              Order #{order.id} · {order.createdAt}
                            </p>
                            <p className="text-xs text-[#23191E] font-semibold mt-1">
                              {order.shipping.fullName} · +91 {order.shipping.mobile}
                            </p>
                            <p className="text-xs text-[#5C4B52] mt-0.5">
                              {order.shipping.address}, {order.shipping.city}, {order.shipping.state} - {order.shipping.pincode}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-1.5">
                            <span className="text-base font-bold text-[#23191E] tabular-nums">
                              {formatINR(order.grandTotal)}{' '}
                              <span className="text-xs font-normal text-[#5C4B52]">
                                ({order.paymentMode.toUpperCase()})
                              </span>
                            </span>
                            <label className="inline-flex items-center gap-1.5 text-xs text-[#5C4B52]">
                              <span>Status:</span>
                              <select
                                aria-label={`Status for order ${order.id}`}
                                value={order.status}
                                onChange={(e) =>
                                  onUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                                }
                                className="h-8 px-2 rounded-md border border-[#23191E]/18 bg-white text-xs font-semibold text-[#23191E] cursor-pointer"
                              >
                                {ORDER_STATUSES.map((st) => (
                                  <option key={st} value={st}>
                                    {st}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>
                        </div>

                        <div className="space-y-1 text-xs">
                          {order.items.map((item) => (
                            <div
                              key={`${order.id}-${item.productId}-${item.variantId}`}
                              className="flex justify-between gap-2 text-[#23191E]"
                            >
                              <span>
                                {item.name} ({item.variantLabel}) × {item.quantity}
                              </span>
                              <span className="font-semibold tabular-nums">
                                {formatINR(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section B: Custom Resin & Varmala Quote Requests */}
              <div>
                <h3 className="font-serif text-lg font-semibold text-[#23191E] flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-[#C59B27]" />
                  Custom Resin & Varmala Quote Requests ({quoteRequests.length})
                </h3>

                {quoteRequests.length === 0 ? (
                  <p className="p-5 rounded-xl bg-[#FDF8F6] border border-[#23191E]/8 text-sm text-[#5C4B52]">
                    No custom quote briefs submitted yet. Requests submitted via "Request Custom Quote" appear here automatically.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quoteRequests.map((quote) => (
                      <div
                        key={quote.id}
                        className="p-4 rounded-xl bg-white border border-[#C59B27]/35 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold text-[#B76E79]">{quote.id} · {quote.createdAt}</p>
                            <p className="text-sm font-bold text-[#23191E] mt-0.5">
                              {quote.fullName}
                            </p>
                          </div>
                          <a
                            href={`https://wa.me/91${quote.whatsapp.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(
                              `Hello ${quote.fullName}, regarding your Fatima Resin Art custom quote ${quote.id} (${quote.artType}):`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#25D366]/18 text-[#113D23] text-xs font-semibold"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>+91 {quote.whatsapp}</span>
                          </a>
                        </div>
                        <p className="text-xs text-[#23191E]">
                          <strong>Art Type:</strong> {quote.artType}
                        </p>
                        <p className="text-xs text-[#5C4B52]">
                          <strong>Size:</strong> {quote.size} · <strong>Colours:</strong> {quote.preferredColors}
                        </p>
                        {quote.notes && (
                          <p className="text-xs text-[#5C4B52] pt-1 border-t border-[#23191E]/8">
                            <strong>Notes:</strong> {quote.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
