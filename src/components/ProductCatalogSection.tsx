import { ArrowUpDown, RotateCcw } from 'lucide-react';
import type { FilterTab, Product, ProductVariant, SortOption } from '../types/store';
import { CATEGORY_ARCHES } from '../data/catalog';
import { ProductCard } from './ProductCard';

interface ProductCatalogSectionProps {
  products: Product[];
  activeTab: FilterTab;
  activeCategorySlug: string | null;
  searchQuery: string;
  sortBy: SortOption;
  wishlistIds: string[];
  onTabChange: (tab: FilterTab) => void;
  onSortChange: (sort: SortOption) => void;
  onClearAllFilters: () => void;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, variant: ProductVariant, quantity?: number) => void;
  onQuickView: (product: Product, variantId: string) => void;
}

const FILTER_TABS: FilterTab[] = [
  'All',
  'Resin & Hardener',
  'Pigments',
  'Molds',
  'Ready & Custom Art',
];

export function ProductCatalogSection({
  products,
  activeTab,
  activeCategorySlug,
  searchQuery,
  sortBy,
  wishlistIds,
  onTabChange,
  onSortChange,
  onClearAllFilters,
  onToggleWishlist,
  onAddToCart,
  onQuickView,
}: ProductCatalogSectionProps) {
  const activeCategoryName = activeCategorySlug
    ? CATEGORY_ARCHES.find((c) => c.slug === activeCategorySlug)?.name ?? activeCategorySlug
    : null;

  return (
    <section
      id="catalog"
      aria-labelledby="catalog-heading"
      className="py-16 sm:py-20 bg-white scroll-mt-28"
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
        {/* Section Heading */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-xs font-medium tracking-[0.14em] text-[#B76E79] mb-1.5">
              Artist-Tested Indian Formulations
            </p>
            <h2
              id="catalog-heading"
              className="font-serif text-2xl sm:text-4xl font-semibold text-[#23191E]"
            >
              Best Sellers & Trending Supplies
            </h2>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-3 self-start lg:self-auto">
            <label
              htmlFor="catalog-sort"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5C4B52] whitespace-nowrap"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort by
            </label>
            <select
              id="catalog-sort"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="h-10 px-3.5 rounded-lg border border-[#23191E]/15 bg-[#FDF8F6] text-sm font-medium text-[#23191E] focus:border-[#B76E79] focus:bg-white cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Best Rating</option>
            </select>
          </div>
        </div>

        {/* Interactive Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-[#23191E]/10">
          <div
            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0"
            role="tablist"
            aria-label="Filter catalog by product type"
          >
            {FILTER_TABS.map((tab) => {
              const isSelected = !activeCategorySlug && activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => onTabChange(tab)}
                  className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[#23191E] text-white'
                      : 'bg-[#FDF8F6] text-[#23191E] hover:bg-[#F6EAE6]'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 text-xs text-[#5C4B52] tabular-nums">
            <span>
              Showing <strong className="text-[#23191E]">{products.length}</strong>{' '}
              {products.length === 1 ? 'item' : 'items'}
            </span>
            {(activeCategoryName || searchQuery.trim().length > 0 || activeTab !== 'All') && (
              <button
                type="button"
                onClick={onClearAllFilters}
                className="inline-flex items-center gap-1 font-semibold text-[#B76E79] hover:text-[#9B5560] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Active Search / Category Summary Notice */}
        {(activeCategoryName || searchQuery.trim().length > 0) && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-[#FDF8F6] border border-[#C59B27]/30 flex flex-wrap items-center justify-between gap-2 text-sm text-[#23191E]">
            <div>
              {activeCategoryName && (
                <span>
                  Category: <strong>{activeCategoryName}</strong>
                </span>
              )}
              {activeCategoryName && searchQuery.trim() && <span className="mx-2">·</span>}
              {searchQuery.trim() && (
                <span>
                  Search: <strong>"{searchQuery.trim()}"</strong>
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onClearAllFilters}
              className="text-xs font-semibold text-[#B76E79] hover:underline cursor-pointer"
            >
              Show entire catalog
            </button>
          </div>
        )}

        {/* Product Grid or Empty State */}
        {products.length > 0 ? (
          <div
            data-testid="product-catalog-grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isWishlisted={wishlistIds.includes(product.id)}
                onToggleWishlist={onToggleWishlist}
                onAddToCart={onAddToCart}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 px-6 rounded-2xl bg-[#FDF8F6] border border-[#23191E]/10 text-center">
            <h3 className="font-serif text-2xl font-semibold text-[#23191E]">
              No matching supplies or resin pieces found
            </h3>
            <p className="mt-2 text-sm text-[#5C4B52] max-w-md mx-auto">
              Try clearing your search or switching back to All Categories to explore our complete resin studio collection.
            </p>
            <button
              type="button"
              onClick={onClearAllFilters}
              className="mt-6 px-5 py-2.5 rounded-lg bg-[#23191E] text-white text-sm font-semibold hover:bg-[#3A2931] transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
