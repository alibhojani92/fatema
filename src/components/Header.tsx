import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Menu,
  PackageSearch,
  Search,
  ShoppingBag,
  X,
} from 'lucide-react';
import type { FilterTab, Product } from '../types/store';
import { ANNOUNCEMENTS } from '../data/catalog';
import { formatINR, searchProductsPreview } from '../utils/storeLogic';
import { BrandLogo } from './BrandLogo';
import { ResilientImage } from './ResilientImage';

interface HeaderProps {
  products: Product[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectProduct: (product: Product) => void;
  onNavigateCatalog: (opts: { tab?: FilterTab; categorySlug?: string | null }) => void;
  onOpenCustomQuote: () => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenTrackOrder: () => void;
  cartCount: number;
  wishlistCount: number;
}

interface NavItem {
  label: string;
  action: 'home' | 'catalog' | 'custom';
  tab?: FilterTab;
  categorySlug?: string | null;
  dropdown?: Array<{ label: string; subtitle: string; tab?: FilterTab; categorySlug?: string | null; isCustom?: boolean }>;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', action: 'home' },
  {
    label: 'Resin & Hardeners',
    action: 'catalog',
    tab: 'Resin & Hardener',
    categorySlug: 'epoxy-resin',
    dropdown: [
      { label: 'Ultra Clear 2:1 Art Resin', subtitle: 'Coasters, clocks & glossy topcoats', categorySlug: 'epoxy-resin' },
      { label: 'Deep Pour 3:1 Casting Resin', subtitle: 'Up to 2-inch pours & varmala blocks', categorySlug: 'epoxy-resin' },
      { label: 'Resin Starter Kits', subtitle: 'All-in-one beginner atelier boxes', categorySlug: 'resin-starter-kits' },
    ],
  },
  {
    label: 'Pigments & Inks',
    action: 'catalog',
    tab: 'Pigments',
    categorySlug: 'mica-powders',
    dropdown: [
      { label: 'Pearl Interference Mica Powders', subtitle: 'Cosmetic-grade metallic shimmers', categorySlug: 'mica-powders' },
      { label: 'Alcohol Inks & Sinker White', subtitle: 'Vibrant 3D petri-dish colours', categorySlug: 'mica-powders' },
      { label: '24K Gold & Rose Gold Flakes', subtitle: 'Non-tarnish floating leaf foils', categorySlug: 'gold-foils-stones' },
    ],
  },
  {
    label: 'Silicone Molds',
    action: 'catalog',
    tab: 'Molds',
    categorySlug: 'silicone-molds',
    dropdown: [
      { label: 'Geode Agate Coaster Molds', subtitle: 'Mirror-gloss platinum silicone', categorySlug: 'silicone-molds' },
      { label: 'MDF & Clock Bases', subtitle: '8mm warp-free birch bases + hands', categorySlug: 'mdf-clock-bases' },
    ],
  },
  {
    label: 'Embellishments',
    action: 'catalog',
    tab: 'Molds',
    categorySlug: 'dried-flowers',
    dropdown: [
      { label: 'Pressed Real Dried Flowers', subtitle: 'Roses, baby’s breath & botanical ferns', categorySlug: 'dried-flowers' },
      { label: 'Gold Foils & Crushed Quartz', subtitle: '24K gold leaf, rose gold & crystals', categorySlug: 'gold-foils-stones' },
      { label: 'MDF Clock Numerals & Hands', subtitle: 'Brushed brass sweep mechanisms', categorySlug: 'mdf-clock-bases' },
    ],
  },
  {
    label: 'Custom Gifts',
    action: 'catalog',
    tab: 'Ready & Custom Art',
    categorySlug: null,
    dropdown: [
      { label: 'Wedding Varmala Preservation', subtitle: 'Heirloom blocks with Pan-India pickup', categorySlug: 'varmala-preservation' },
      { label: 'Geode Wall Clocks', subtitle: 'Rose plum, ivory & 24K gold druzy', tab: 'Ready & Custom Art', categorySlug: null },
      { label: 'Custom Home Nameplates', subtitle: 'Weatherproof gold raised lettering', tab: 'Ready & Custom Art', categorySlug: null },
      { label: 'Ocean Resin Serving Trays', subtitle: 'Food-safe coastal wave lacing', tab: 'Ready & Custom Art', categorySlug: null },
    ],
  },
  {
    label: 'Starter Kits & Combos',
    action: 'catalog',
    tab: 'Resin & Hardener',
    categorySlug: 'resin-starter-kits',
  },
  {
    label: 'Custom Order Form',
    action: 'custom',
  },
];

export function Header({
  products,
  searchQuery,
  onSearchChange,
  onSelectProduct,
  onNavigateCatalog,
  onOpenCustomQuote,
  onOpenCart,
  onOpenWishlist,
  onOpenTrackOrder,
  cartCount,
  wishlistCount,
}: HeaderProps) {
  const [promoIndex, setPromoIndex] = useState(0);
  const [promoPaused, setPromoPaused] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (promoPaused) return;
    const timer = window.setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [promoPaused]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const previewMatches = searchProductsPreview(products, searchQuery, 6);

  const handleNavClick = (item: NavItem) => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
    if (item.action === 'home') {
      onNavigateCatalog({ tab: 'All', categorySlug: null });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (item.action === 'custom') {
      onOpenCustomQuote();
      return;
    }
    onNavigateCatalog({
      tab: item.tab ?? 'All',
      categorySlug: item.categorySlug ?? null,
    });
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchOpen(false);
    setMobileSearchOpen(false);
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Top Announcement Bar (non-sticky on mobile to keep sticky chrome compact) */}
      <div
        className="bg-[#23191E] text-[#FDF8F6] border-b border-[#C59B27]/25"
        onMouseEnter={() => setPromoPaused(true)}
        onMouseLeave={() => setPromoPaused(false)}
      >
        <div className="max-w-[1320px] mx-auto px-4 h-9 flex items-center justify-between gap-2 text-xs">
          <button
            type="button"
            onClick={() =>
              setPromoIndex((prev) => (prev - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length)
            }
            aria-label="Previous announcement"
            className="p-1 text-[#E8D5A3]/80 hover:text-white transition-colors shrink-0"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <p className="truncate text-center font-medium tracking-wide text-[#FDF8F6]">
            {ANNOUNCEMENTS[promoIndex]}
          </p>
          <button
            type="button"
            onClick={() => setPromoIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length)}
            aria-label="Next announcement"
            className="p-1 text-[#E8D5A3]/80 hover:text-white transition-colors shrink-0"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#23191E]/10">
        <div className="max-w-[1320px] mx-auto px-3 sm:px-6 h-15 lg:h-[74px] flex items-center justify-between gap-2 sm:gap-4 lg:gap-8">
          {/* Left: Mobile Menu + Brand Wordmark */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-1.5 -ml-1 text-[#23191E] hover:text-[#B76E79] transition-colors shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                onNavigateCatalog({ tab: 'All', categorySlug: null });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="focus-visible:outline-2 focus-visible:outline-offset-4 rounded"
              aria-label="Fatima Resin Art Home"
            >
              <BrandLogo compact />
            </a>
          </div>

          {/* Center: Desktop Live Instant Search */}
          <div ref={searchRef} className="hidden md:block flex-1 max-w-xl relative">
            <form onSubmit={handleSearchSubmit} role="search">
              <label htmlFor="desktop-catalog-search" className="sr-only">
                Search epoxy resin, mica pigments, silicone molds, clocks
              </label>
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-[#5C4B52] absolute left-3.5 pointer-events-none" />
                <input
                  id="desktop-catalog-search"
                  type="search"
                  value={searchQuery}
                  onFocus={() => setSearchOpen(true)}
                  onChange={(e) => {
                    onSearchChange(e.target.value);
                    setSearchOpen(true);
                  }}
                  placeholder="Search epoxy resin, mica pigments, silicone molds, clocks..."
                  className="w-full h-10 pl-10 pr-9 rounded-lg bg-[#FDF8F6] border border-[#23191E]/12 text-sm text-[#23191E] placeholder:text-[#5C4B52]/75 focus:bg-white focus:border-[#B76E79] focus:outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    aria-label="Clear search query"
                    className="absolute right-2.5 p-1 text-[#5C4B52] hover:text-[#23191E]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>

            {/* Instant Search Dropdown */}
            {searchOpen && searchQuery.trim().length > 0 && (
              <div
                role="listbox"
                aria-label="Search results"
                className="absolute left-0 right-0 top-[calc(100%+6px)] bg-white border border-[#23191E]/12 rounded-xl shadow-xl overflow-hidden z-50"
              >
                {previewMatches.length > 0 ? (
                  <>
                    <div className="divide-y divide-[#23191E]/6 max-h-[360px] overflow-y-auto">
                      {previewMatches.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSearchOpen(false);
                            onSelectProduct(item);
                          }}
                          className="w-full px-3.5 py-2.5 flex items-center gap-3.5 text-left hover:bg-[#FDF8F6] transition-colors"
                        >
                          <ResilientImage
                            src={item.images[0]}
                            alt={item.name}
                            fallbackTone={item.fallbackTone}
                            className="w-12 h-12 rounded-lg object-cover shrink-0 border border-[#23191E]/8"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-[#23191E] truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-[#5C4B52] truncate">
                              {item.category} · {item.variants[0]?.label}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold text-[#23191E] tabular-nums">
                              {formatINR(item.variants[0]?.price ?? 0)}
                            </p>
                            {item.variants[0] && item.variants[0].mrp > item.variants[0].price && (
                              <p className="text-[11px] text-[#5C4B52] line-through tabular-nums">
                                {formatINR(item.variants[0].mrp)}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="px-3.5 py-2 bg-[#FDF8F6] border-t border-[#23191E]/8 flex items-center justify-between text-xs">
                      <span className="text-[#5C4B52]">
                        Showing top {previewMatches.length} matches
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchOpen(false);
                          document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="font-semibold text-[#B76E79] hover:text-[#9B5560]"
                      >
                        View all in catalog
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-sm font-medium text-[#23191E]">
                      No resin supplies found for "{searchQuery}"
                    </p>
                    <p className="text-xs text-[#5C4B52] mt-1">
                      Try searching for Epoxy Resin, Mica, Silicone Molds, Varmala, or Clock.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Utility Actions */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setMobileSearchOpen((v) => !v)}
              aria-label="Toggle mobile search"
              className="md:hidden p-2 rounded-lg text-[#23191E] hover:bg-[#FDF8F6] transition-colors"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            <button
              type="button"
              onClick={onOpenTrackOrder}
              aria-label="Track Order"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-[#23191E] hover:bg-[#FDF8F6] hover:text-[#B76E79] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <PackageSearch className="w-[18px] h-[18px]" />
              <span>Track Order</span>
            </button>

            <button
              type="button"
              onClick={onOpenWishlist}
              aria-label={`Open wishlist (${wishlistCount} items)`}
              className="relative p-2 sm:p-2.5 rounded-lg text-[#23191E] hover:bg-[#FDF8F6] hover:text-[#B76E79] transition-colors shrink-0 cursor-pointer"
            >
              <Heart className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[#B76E79] text-white text-[10px] font-semibold flex items-center justify-center tabular-nums">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              aria-label={`Open shopping cart (${cartCount} items)`}
              className="relative inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-[#23191E] text-white text-xs sm:text-sm font-medium hover:bg-[#3A2931] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Bag</span>
              <span className="min-w-[18px] h-[18px] sm:min-w-[20px] sm:h-5 px-1 sm:px-1.5 rounded-full bg-[#C59B27] text-[#23191E] text-[11px] font-bold flex items-center justify-center tabular-nums">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Expandable Search Bar */}
        {mobileSearchOpen && (
          <div className="md:hidden px-4 pb-3 border-t border-[#23191E]/8 pt-2.5 bg-white">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-[#5C4B52] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search resin, mica, molds, varmala..."
                className="w-full h-10 pl-9 pr-9 rounded-lg bg-[#FDF8F6] border border-[#23191E]/15 text-sm text-[#23191E] focus:outline-none focus:border-[#B76E79]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Clear mobile search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#5C4B52]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
            {previewMatches.length > 0 && (
              <div className="mt-2 border border-[#23191E]/10 rounded-lg divide-y divide-[#23191E]/6 bg-white max-h-60 overflow-y-auto">
                {previewMatches.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setMobileSearchOpen(false);
                      onSelectProduct(item);
                    }}
                    className="w-full px-3 py-2 flex items-center gap-3 text-left hover:bg-[#FDF8F6]"
                  >
                    <ResilientImage
                      src={item.images[0]}
                      alt={item.name}
                      className="w-10 h-10 rounded object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#23191E] truncate">{item.name}</p>
                      <p className="text-[11px] text-[#5C4B52]">{item.category}</p>
                    </div>
                    <span className="text-xs font-semibold text-[#23191E] tabular-nums">
                      {formatINR(item.variants[0]?.price ?? 0)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Desktop Category Mega-Navigation Bar */}
        <nav
          aria-label="Primary categories"
          className="hidden lg:block border-t border-[#23191E]/8 bg-[#FDF8F6]/70"
        >
          <div className="max-w-[1320px] mx-auto px-6 h-11 flex items-center justify-between gap-4">
            {NAV_ITEMS.map((item) => {
              const hasDropdown = Boolean(item.dropdown?.length);
              const isOpen = openDropdown === item.label;
              return (
                <div
                  key={item.label}
                  className="relative h-full flex items-center"
                  onMouseEnter={() => hasDropdown && setOpenDropdown(item.label)}
                  onMouseLeave={() => hasDropdown && setOpenDropdown(null)}
                >
                  <button
                    type="button"
                    onClick={() => handleNavClick(item)}
                    aria-expanded={hasDropdown ? isOpen : undefined}
                    className={`inline-flex items-center gap-1 text-[13px] font-medium whitespace-nowrap shrink-0 py-1.5 transition-colors border-b-2 ${
                      item.action === 'custom'
                        ? 'text-[#B76E79] border-transparent hover:border-[#B76E79] font-semibold'
                        : 'text-[#23191E]/90 border-transparent hover:text-[#B76E79] hover:border-[#B76E79]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {hasDropdown && <ChevronDown className="w-3.5 h-3.5 opacity-65" />}
                  </button>

                  {hasDropdown && isOpen && (
                    <div className="absolute left-0 top-full pt-1 z-50">
                      <div className="w-72 bg-white border border-[#23191E]/10 rounded-xl shadow-xl p-2">
                        {item.dropdown!.map((sub) => (
                          <button
                            key={sub.label}
                            type="button"
                            onClick={() => {
                              setOpenDropdown(null);
                              if (sub.isCustom) {
                                onOpenCustomQuote();
                              } else {
                                onNavigateCatalog({
                                  tab: sub.tab ?? item.tab ?? 'All',
                                  categorySlug:
                                    sub.categorySlug !== undefined ? sub.categorySlug : null,
                                });
                                document
                                  .getElementById('catalog')
                                  ?.scrollIntoView({ behavior: 'smooth' });
                              }
                            }}
                            className="w-full px-3 py-2.5 rounded-lg text-left hover:bg-[#FDF8F6] transition-colors group"
                          >
                            <p className="text-sm font-medium text-[#23191E] group-hover:text-[#B76E79]">
                              {sub.label}
                            </p>
                            <p className="text-xs text-[#5C4B52] mt-0.5">{sub.subtitle}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          <div
            className="fixed inset-0 bg-[#23191E]/55 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-[84%] max-w-xs bg-white h-full shadow-2xl flex flex-col">
            <div className="px-5 py-4 border-b border-[#23191E]/10 flex items-center justify-between">
              <BrandLogo compact />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="p-2 text-[#23191E] hover:text-[#B76E79]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleNavClick(item)}
                  className={`w-full text-left px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    item.action === 'custom'
                      ? 'bg-[#FDF8F6] text-[#B76E79] font-semibold'
                      : 'text-[#23191E] hover:bg-[#FDF8F6]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-[#23191E]/10 bg-[#FDF8F6] space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenTrackOrder();
                }}
                className="w-full py-2.5 px-4 rounded-lg border border-[#23191E]/15 bg-white text-sm font-medium text-[#23191E] flex items-center justify-center gap-2"
              >
                <PackageSearch className="w-4 h-4" />
                Track Existing Order
              </button>
              <p className="text-[11px] text-center text-[#5C4B52]">
                Free Shipping Above ₹999 · Pan-India Express
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
