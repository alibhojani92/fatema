import { useState } from 'react';
import { Check, Plus, SlidersHorizontal, X } from 'lucide-react';
import type { FilterTab, MainCategory, Product } from '../types/store';
import { calculateDiscountPercent, formatINR } from '../utils/storeLogic';

interface StoreManagerModalProps {
  open: boolean;
  products: Product[];
  onClose: () => void;
  onUpdateProductPricing: (
    productId: string,
    newPrice: number,
    newMrp: number,
    inStock: boolean
  ) => void;
  onAddProduct: (product: Product) => void;
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

export function StoreManagerModal({
  open,
  products,
  onClose,
  onUpdateProductPricing,
  onAddProduct,
}: StoreManagerModalProps) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'add'>('inventory');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftPrice, setDraftPrice] = useState('');
  const [draftMrp, setDraftMrp] = useState('');
  const [feedback, setFeedback] = useState('');

  // Add Product form state
  const [name, setName] = useState('');
  const [categoryIdx, setCategoryIdx] = useState(0);
  const [variantLabel, setVariantLabel] = useState('Standard Pack');
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [shortNote, setShortNote] = useState('');
  const [formError, setFormError] = useState('');

  if (!open) return null;

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setDraftPrice(String(product.variants[0]?.price ?? 0));
    setDraftMrp(String(product.variants[0]?.mrp ?? 0));
  };

  const saveEdit = (product: Product) => {
    const parsedPrice = Math.max(1, Number(draftPrice) || product.variants[0]?.price || 1);
    const parsedMrp = Math.max(parsedPrice, Number(draftMrp) || parsedPrice);
    onUpdateProductPricing(product.id, parsedPrice, parsedMrp, product.inStock);
    setEditingId(null);
    setFeedback(`Updated pricing for "${product.name}".`);
    window.setTimeout(() => setFeedback(''), 2500);
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = Number(price);
    const numericMrp = Number(mrp) || numericPrice;

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
        'Freshly curated studio addition from Fatima Resin Art Mumbai.',
      images: [chosenCat.defaultImage, '/images/detail-resin-gloss.svg'],
      variants: [
        {
          id: `${newId}-v1`,
          label: variantLabel.trim() || 'Standard Pack',
          price: Math.round(numericPrice),
          mrp: Math.round(numericMrp),
        },
      ],
      specs: {
        vocStatus: 'Studio Tested Quality · Pan-India Shipping',
      },
      inStock: true,
      isFeatured: true,
      fallbackTone: '#FDF8F6',
    };

    onAddProduct(newProduct);
    setName('');
    setPrice('');
    setMrp('');
    setShortNote('');
    setFormError('');
    setActiveTab('inventory');
    setFeedback(`Added "${newProduct.name}" to the live catalog.`);
    window.setTimeout(() => setFeedback(''), 3000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#23191E]/75 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="store-manager-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl border border-[#23191E]/15 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#23191E]/10 flex items-center justify-between bg-[#FDF8F6]">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="w-5 h-5 text-[#B76E79]" />
            <div>
              <h2
                id="store-manager-title"
                className="font-serif text-xl font-semibold text-[#23191E]"
              >
                Fatima Store Manager
              </h2>
              <p className="text-xs text-[#5C4B52]">
                Edit live ₹ prices, discounts, stock availability, or publish new items
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close store manager"
            className="p-2 rounded-lg text-[#5C4B52] hover:bg-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="px-6 pt-4 pb-3 border-b border-[#23191E]/8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-[#23191E] text-white'
                  : 'bg-[#FDF8F6] text-[#23191E] hover:bg-[#F6EAE6]'
              }`}
            >
              Manage Catalog ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('add')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'add'
                  ? 'bg-[#B76E79] text-white'
                  : 'bg-[#FDF8F6] text-[#23191E] hover:bg-[#F6EAE6]'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Add New Product
            </button>
          </div>

          {feedback && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2E6B4F]">
              <Check className="w-4 h-4" />
              {feedback}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'inventory' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#23191E]/10 text-xs text-[#5C4B52]">
                    <th className="pb-3 pr-4 font-semibold">Product</th>
                    <th className="pb-3 px-3 font-semibold">Selling ₹</th>
                    <th className="pb-3 px-3 font-semibold">MRP ₹</th>
                    <th className="pb-3 px-3 font-semibold">Discount</th>
                    <th className="pb-3 px-3 font-semibold">Stock Status</th>
                    <th className="pb-3 pl-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#23191E]/8 tabular-nums">
                  {products.map((product) => {
                    const base = product.variants[0];
                    const isEditing = editingId === product.id;
                    const disc = base ? calculateDiscountPercent(base.mrp, base.price) : 0;

                    return (
                      <tr key={product.id} className="align-middle">
                        <td className="py-3 pr-4">
                          <p className="font-semibold text-[#23191E] leading-snug">
                            {product.name}
                          </p>
                          <p className="text-xs text-[#5C4B52]">
                            {product.category} · Base: {base?.label}
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
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                              product.inStock
                                ? 'bg-[#2E6B4F]/12 text-[#2E6B4F] hover:bg-[#2E6B4F]/20'
                                : 'bg-[#9B2C3E]/12 text-[#9B2C3E] hover:bg-[#9B2C3E]/20'
                            }`}
                          >
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </button>
                        </td>

                        <td className="py-3 pl-3 text-right">
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
                          ) : (
                            <button
                              type="button"
                              onClick={() => startEdit(product)}
                              className="px-3 py-1.5 rounded-md border border-[#23191E]/15 hover:border-[#B76E79] text-xs font-semibold text-[#23191E] cursor-pointer"
                            >
                              Edit Price
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <form onSubmit={handleAddProductSubmit} noValidate className="max-w-xl space-y-4">
              <div>
                <label htmlFor="admin-prod-name" className="block text-xs font-semibold text-[#23191E] mb-1.5">
                  Product Title *
                </label>
                <input
                  id="admin-prod-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Champagne Gold Liquid Pigment Paste (50g)"
                  className="w-full h-10 px-3.5 rounded-lg border border-[#23191E]/18 bg-[#FDF8F6] focus:bg-white text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="admin-prod-cat" className="block text-xs font-semibold text-[#23191E] mb-1.5">
                    Category
                  </label>
                  <select
                    id="admin-prod-cat"
                    value={categoryIdx}
                    onChange={(e) => setCategoryIdx(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg border border-[#23191E]/18 bg-[#FDF8F6] focus:bg-white text-sm"
                  >
                    {CATEGORY_OPTIONS.map((opt, idx) => (
                      <option key={opt.category} value={idx}>
                        {opt.category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="admin-prod-variant" className="block text-xs font-semibold text-[#23191E] mb-1.5">
                    Default Pack / Variant Label
                  </label>
                  <input
                    id="admin-prod-variant"
                    type="text"
                    value={variantLabel}
                    onChange={(e) => setVariantLabel(e.target.value)}
                    placeholder="e.g. 50g Jar"
                    className="w-full h-10 px-3.5 rounded-lg border border-[#23191E]/18 bg-[#FDF8F6] focus:bg-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="admin-prod-price" className="block text-xs font-semibold text-[#23191E] mb-1.5">
                    Selling Price (₹) *
                  </label>
                  <input
                    id="admin-prod-price"
                    type="number"
                    min={50}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="699"
                    className="w-full h-10 px-3.5 rounded-lg border border-[#23191E]/18 bg-[#FDF8F6] focus:bg-white text-sm tabular-nums"
                  />
                </div>

                <div>
                  <label htmlFor="admin-prod-mrp" className="block text-xs font-semibold text-[#23191E] mb-1.5">
                    MRP (₹)
                  </label>
                  <input
                    id="admin-prod-mrp"
                    type="number"
                    min={50}
                    value={mrp}
                    onChange={(e) => setMrp(e.target.value)}
                    placeholder="899"
                    className="w-full h-10 px-3.5 rounded-lg border border-[#23191E]/18 bg-[#FDF8F6] focus:bg-white text-sm tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="admin-prod-note" className="block text-xs font-semibold text-[#23191E] mb-1.5">
                  Short Highlight Note
                </label>
                <input
                  id="admin-prod-note"
                  type="text"
                  value={shortNote}
                  onChange={(e) => setShortNote(e.target.value)}
                  placeholder="e.g. High-Opalescence Pigment Paste · Ideal for Ocean Cells"
                  className="w-full h-10 px-3.5 rounded-lg border border-[#23191E]/18 bg-[#FDF8F6] focus:bg-white text-sm"
                />
              </div>

              {formError && <p className="text-xs text-[#9B2C3E]">{formError}</p>}

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-[#B76E79] hover:bg-[#9B5560] text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  Publish Product to Catalog
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
