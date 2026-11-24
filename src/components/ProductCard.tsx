import { useState } from 'react';
import { Check, Eye, Heart, ShoppingBag, Star } from 'lucide-react';
import type { Product, ProductVariant } from '../types/store';
import { calculateDiscountPercent, formatINR } from '../utils/storeLogic';
import { ResilientImage } from './ResilientImage';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, variant: ProductVariant, quantity?: number) => void;
  onQuickView: (product: Product, variantId: string) => void;
}

export function ProductCard({
  product,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onQuickView,
}: ProductCardProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants[0]?.id ?? ''
  );
  const [justAdded, setJustAdded] = useState(false);

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0];

  const discount = selectedVariant
    ? calculateDiscountPercent(selectedVariant.mrp, selectedVariant.price)
    : 0;

  const secondaryImage = product.images[1] ?? product.images[0];

  const handleAdd = () => {
    if (!product.inStock || !selectedVariant) return;
    onAddToCart(product, selectedVariant, 1);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <article
      data-testid={`product-card-${product.id}`}
      className="group bg-white border border-[#23191E]/10 rounded-xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
    >
      {/* 1:1 Studio Image with Hover Zoom + Secondary Angle Swap */}
      <div className="relative aspect-square bg-[#FDF8F6] overflow-hidden">
        <button
          type="button"
          onClick={() => onQuickView(product, selectedVariant?.id ?? '')}
          aria-label={`View details for ${product.name}`}
          className="block w-full h-full text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-inset"
        >
          <ResilientImage
            src={product.images[0]}
            alt={product.name}
            fallbackTone={product.fallbackTone}
            fallbackTitle={product.name}
            className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
          {secondaryImage && secondaryImage !== product.images[0] && (
            <ResilientImage
              src={secondaryImage}
              alt={`${product.name} alternate view`}
              fallbackTone={product.fallbackTone}
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"
            />
          )}
        </button>

        {/* Top-Left Discount Tag */}
        {discount > 0 && product.inStock && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#23191E] text-[#FDF8F6] text-[11px] font-semibold tracking-wide pointer-events-none">
            SAVE {discount}%
          </span>
        )}

        {!product.inStock && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#5C4B52] text-white text-[11px] font-semibold tracking-wide pointer-events-none">
            OUT OF STOCK
          </span>
        )}

        {/* Top-Right Wishlist Heart Button */}
        <button
          type="button"
          onClick={() => onToggleWishlist(product.id)}
          aria-pressed={isWishlisted}
          aria-label={
            isWishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
            isWishlisted
              ? 'bg-[#B76E79] text-white shadow-sm'
              : 'bg-white/90 text-[#23191E] hover:bg-white hover:text-[#B76E79] border border-[#23191E]/10'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Product Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Rating + Brand/Category clean unboxed metadata */}
        <div className="flex items-center justify-between gap-2 text-xs text-[#5C4B52]">
          <span className="truncate">
            {product.brand} · {product.category}
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-[#23191E] shrink-0 tabular-nums">
            <Star className="w-3.5 h-3.5 fill-[#C59B27] text-[#C59B27]" />
            {product.rating.toFixed(1)}
            <span className="font-normal text-[#5C4B52]">({product.reviewCount})</span>
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-2 font-sans text-[15px] sm:text-base font-semibold text-[#23191E] leading-snug line-clamp-2 min-h-[2.75rem]">
          <button
            type="button"
            onClick={() => onQuickView(product, selectedVariant?.id ?? '')}
            className="text-left hover:text-[#B76E79] transition-colors cursor-pointer"
          >
            {product.name}
          </button>
        </h3>

        <p className="mt-1 text-xs text-[#5C4B52] line-clamp-1">{product.shortNote}</p>

        {/* Interactive Variant Selector Buttons */}
        {product.variants.length > 0 && (
          <div
            className="mt-3.5 flex flex-wrap gap-1.5"
            role="group"
            aria-label={`Select variant for ${product.name}`}
          >
            {product.variants.map((variant) => {
              const active = variant.id === selectedVariant?.id;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setSelectedVariantId(variant.id)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#23191E] text-white'
                      : 'bg-[#FDF8F6] text-[#23191E] border border-[#23191E]/12 hover:border-[#B76E79]'
                  }`}
                >
                  {variant.swatchHex && (
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-white/60 shrink-0"
                      style={{ backgroundColor: variant.swatchHex }}
                      aria-hidden="true"
                    />
                  )}
                  <span>{variant.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Pricing + Dual Action Footer (pinned to bottom for row alignment) */}
        <div className="mt-auto pt-4">
          <div className="flex items-baseline gap-2.5">
            <span className="text-lg font-bold text-[#23191E] tabular-nums">
              {formatINR(selectedVariant?.price ?? 0)}
            </span>
            {selectedVariant && selectedVariant.mrp > selectedVariant.price && (
              <span className="text-xs text-[#5C4B52] line-through tabular-nums">
                {formatINR(selectedVariant.mrp)}
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              disabled={!product.inStock}
              onClick={handleAdd}
              className={`flex-1 h-10 px-3 rounded-lg text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                !product.inStock
                  ? 'bg-[#23191E]/10 text-[#5C4B52] cursor-not-allowed'
                  : justAdded
                    ? 'bg-[#2E6B4F] text-white'
                    : 'bg-[#B76E79] hover:bg-[#9B5560] text-white'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Bag</span>
                </>
              ) : !product.inStock ? (
                <span>Out of Stock</span>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onQuickView(product, selectedVariant?.id ?? '')}
              aria-label={`Quick view ${product.name}`}
              className="w-10 h-10 rounded-lg border border-[#23191E]/15 bg-[#FDF8F6] hover:bg-[#23191E] hover:text-white text-[#23191E] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
