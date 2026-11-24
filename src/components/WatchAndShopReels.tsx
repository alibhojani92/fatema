import { useState } from 'react';
import { Eye, Pause, Play, Plus, ShoppingBag, X } from 'lucide-react';
import { WATCH_AND_SHOP_REELS } from '../data/catalog';
import type { Product, ProductVariant, ReelItem } from '../types/store';
import { formatINR } from '../utils/storeLogic';
import { ResilientImage } from './ResilientImage';

interface WatchAndShopReelsProps {
  products: Product[];
  onAddToCart: (product: Product, variant: ProductVariant, quantity?: number) => void;
  onQuickView: (product: Product, variantId: string) => void;
}

export function WatchAndShopReels({
  products,
  onAddToCart,
  onQuickView,
}: WatchAndShopReelsProps) {
  const [activeReel, setActiveReel] = useState<ReelItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const getLinkedProduct = (productId: string) =>
    products.find((p) => p.id === productId) ?? products[0];

  return (
    <section
      aria-labelledby="watch-shop-heading"
      className="py-16 sm:py-20 bg-white"
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-10">
          <div>
            <p className="text-xs font-medium tracking-[0.14em] text-[#B76E79] mb-1.5">
              From Our Pouring Table
            </p>
            <h2
              id="watch-shop-heading"
              className="font-serif text-2xl sm:text-4xl font-semibold text-[#23191E]"
            >
              Watch & Shop Resin Reels
            </h2>
          </div>
          <p className="text-sm text-[#5C4B52] max-w-md">
            Tap any studio reel to preview the pouring technique and add the featured resin supply straight to your bag.
          </p>
        </div>

        {/* 4 Vertical 9:16 Showcase Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WATCH_AND_SHOP_REELS.map((reel) => {
            const product = getLinkedProduct(reel.productId);
            const defaultVariant = product?.variants[0];
            return (
              <div
                key={reel.id}
                className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-[#23191E] border border-[#23191E]/10 shadow-sm flex flex-col justify-between"
              >
                {/* Background Pouring Visual */}
                <ResilientImage
                  src={reel.image}
                  alt={reel.title}
                  fallbackTone={reel.fallbackTone}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />

                {/* Subtle Shimmering Gloss Sweep */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent reel-shimmer"
                />

                {/* Contrast Scrim */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(to bottom, rgba(35,25,30,0.52) 0%, rgba(35,25,30,0.08) 38%, rgba(35,25,30,0.88) 100%)',
                  }}
                />

                {/* Top Meta Bar */}
                <div className="relative z-10 p-4 flex items-center justify-between text-xs text-white/90">
                  <span className="font-medium tracking-wide">{reel.technique}</span>
                  <span className="tabular-nums text-white/80">
                    {reel.duration} · {reel.views}
                  </span>
                </div>

                {/* Center Play Trigger */}
                <div className="relative z-10 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveReel(reel);
                      setIsPlaying(true);
                    }}
                    aria-label={`Play resin pouring reel: ${reel.title}`}
                    className="w-14 h-14 rounded-full bg-white/90 hover:bg-white text-[#23191E] flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-110 cursor-pointer"
                  >
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </button>
                </div>

                {/* Bottom Caption + Pinned Product Mini-Card */}
                <div className="relative z-10 p-3.5 space-y-3">
                  <div className="px-1">
                    <h3 className="font-serif text-lg font-semibold text-white leading-snug">
                      {reel.title}
                    </h3>
                    <p className="text-xs text-white/80 line-clamp-2 mt-1">
                      {reel.caption}
                    </p>
                  </div>

                  {product && defaultVariant && (
                    <div className="p-2.5 rounded-xl bg-white/95 backdrop-blur-sm border border-white/60 flex items-center gap-2.5 shadow-md">
                      <button
                        type="button"
                        onClick={() => onQuickView(product, defaultVariant.id)}
                        aria-label={`Inspect ${product.name}`}
                        className="w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-[#23191E]/10 cursor-pointer"
                      >
                        <ResilientImage
                          src={product.images[0]}
                          alt={product.name}
                          fallbackTone={product.fallbackTone}
                          className="w-full h-full object-cover"
                        />
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-[#23191E] truncate">
                          {product.name}
                        </p>
                        <p className="text-xs font-bold text-[#B76E79] tabular-nums mt-0.5">
                          {formatINR(defaultVariant.price)}
                          <span className="text-[10px] font-normal text-[#5C4B52] ml-1">
                            ({defaultVariant.label})
                          </span>
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={!product.inStock}
                        onClick={() => onAddToCart(product, defaultVariant, 1)}
                        aria-label={`Add ${product.name} to cart from reel`}
                        className="w-9 h-9 rounded-lg bg-[#23191E] hover:bg-[#B76E79] disabled:opacity-40 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Reel Preview Modal */}
      {activeReel && (() => {
        const linked = getLinkedProduct(activeReel.productId);
        const variant = linked?.variants[0];
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#23191E]/75 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-label={`Playing reel ${activeReel.title}`}
            onClick={() => setActiveReel(null)}
          >
            <div
              className="relative w-full max-w-sm rounded-2xl overflow-hidden bg-[#23191E] shadow-2xl border border-[#C59B27]/35"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[9/14] overflow-hidden">
                <ResilientImage
                  src={activeReel.image}
                  alt={activeReel.title}
                  className={`w-full h-full object-cover transition-transform duration-[4000ms] ease-in-out ${
                    isPlaying ? 'scale-110' : 'scale-100'
                  }`}
                />
                {isPlaying && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent reel-shimmer"
                  />
                )}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(to bottom, rgba(35,25,30,0.6) 0%, transparent 30%, rgba(35,25,30,0.92) 100%)',
                  }}
                />
                <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between text-white">
                  <span className="text-xs font-medium tracking-wide">
                    {activeReel.technique} · {activeReel.duration}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsPlaying((p) => !p)}
                      aria-label={isPlaying ? 'Pause reel preview' : 'Play reel preview'}
                      className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveReel(null)}
                      aria-label="Close reel preview"
                      className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="absolute bottom-4 inset-x-4 text-white space-y-3">
                  <div>
                    <h3 className="font-serif text-xl font-semibold">{activeReel.title}</h3>
                    <p className="text-xs text-white/85 mt-1 leading-relaxed">
                      {activeReel.caption}
                    </p>
                  </div>
                  {linked && variant && (
                    <div className="p-3 rounded-xl bg-white text-[#23191E] flex items-center gap-3">
                      <ResilientImage
                        src={linked.images[0]}
                        alt={linked.name}
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate">{linked.name}</p>
                        <p className="text-sm font-bold text-[#B76E79] tabular-nums">
                          {formatINR(variant.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveReel(null);
                            onQuickView(linked, variant.id);
                          }}
                          aria-label={`View ${linked.name}`}
                          className="p-2 rounded-lg border border-[#23191E]/15 hover:bg-[#FDF8F6] cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={!linked.inStock}
                          onClick={() => {
                            onAddToCart(linked, variant, 1);
                            setActiveReel(null);
                          }}
                          className="px-3 py-2 rounded-lg bg-[#B76E79] hover:bg-[#9B5560] text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </section>
  );
}
