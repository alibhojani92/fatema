import { useEffect, useState } from 'react';
import {
  Check,
  Heart,
  MessageCircle,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  X,
} from 'lucide-react';
import type { Product, ProductVariant } from '../types/store';
import {
  buildWhatsAppProductUrl,
  calculateDiscountPercent,
  formatINR,
} from '../utils/storeLogic';
import { ResilientImage } from './ResilientImage';

interface ProductQuickViewModalProps {
  product: Product | null;
  initialVariantId?: string;
  isWishlisted: boolean;
  onClose: () => void;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, variant: ProductVariant, quantity: number) => void;
}

export function ProductQuickViewModal({
  product,
  initialVariantId,
  isWishlisted,
  onClose,
  onToggleWishlist,
  onAddToCart,
}: ProductQuickViewModalProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    if (!product) return;
    setActiveImageIdx(0);
    setSelectedVariantId(initialVariantId || product.variants[0]?.id || '');
    setQuantity(1);
    setAddedFeedback(false);
  }, [product, initialVariantId]);

  useEffect(() => {
    if (!product) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0];

  const discount = selectedVariant
    ? calculateDiscountPercent(selectedVariant.mrp, selectedVariant.price)
    : 0;

  const specEntries: Array<{ label: string; value: string }> = [
    product.specs.mixingRatio ? { label: 'Mixing Ratio', value: product.specs.mixingRatio } : null,
    product.specs.potLife ? { label: 'Pot Life', value: product.specs.potLife } : null,
    product.specs.curingTime ? { label: 'Curing / Dispatch', value: product.specs.curingTime } : null,
    product.specs.vocStatus ? { label: 'Safety & Formula', value: product.specs.vocStatus } : null,
    product.specs.dimensions ? { label: 'Dimensions', value: product.specs.dimensions } : null,
    product.specs.finish ? { label: 'Surface Finish', value: product.specs.finish } : null,
    product.specs.contents ? { label: 'Box Contents', value: product.specs.contents } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  const handleAdd = () => {
    if (!product.inStock || !selectedVariant) return;
    onAddToCart(product, selectedVariant, quantity);
    setAddedFeedback(true);
    window.setTimeout(() => setAddedFeedback(false), 1400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#23191E]/65 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-view-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-[#23191E]/10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product quick view"
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/95 border border-[#23191E]/12 text-[#23191E] hover:bg-[#FDF8F6] flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Left Gallery */}
          <div className="md:col-span-6 p-5 sm:p-7 bg-[#FDF8F6] flex flex-col gap-3.5">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-white border border-[#23191E]/8">
              <ResilientImage
                src={product.images[activeImageIdx] ?? product.images[0]}
                alt={product.name}
                fallbackTone={product.fallbackTone}
                fallbackTitle={product.name}
                className="w-full h-full object-cover"
              />
              {discount > 0 && (
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#23191E] text-white text-xs font-semibold">
                  SAVE {discount}%
                </span>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto">
                {product.images.map((img, idx) => (
                  <button
                    key={img + idx}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    aria-label={`View image ${idx + 1} of ${product.name}`}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      idx === activeImageIdx
                        ? 'border-[#B76E79] ring-1 ring-[#B76E79]'
                        : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <ResilientImage
                      src={img}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Contiguous Purchase Module */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col">
            <div className="flex items-center gap-2 text-xs text-[#5C4B52] pr-8">
              <span>{product.brand}</span>
              <span aria-hidden="true">·</span>
              <span>{product.category}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 font-semibold text-[#23191E] tabular-nums">
                <Star className="w-3.5 h-3.5 fill-[#C59B27] text-[#C59B27]" />
                {product.rating.toFixed(1)} ({product.reviewCount})
              </span>
            </div>

            <h2
              id="quick-view-title"
              className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-[#23191E] leading-snug"
            >
              {product.name}
            </h2>

            {/* Pricing */}
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-2xl font-bold text-[#23191E] tabular-nums">
                {formatINR(selectedVariant?.price ?? 0)}
              </span>
              {selectedVariant && selectedVariant.mrp > selectedVariant.price && (
                <span className="text-sm text-[#5C4B52] line-through tabular-nums">
                  {formatINR(selectedVariant.mrp)}
                </span>
              )}
              <span className="text-xs text-[#5C4B52]">Inclusive of all taxes</span>
            </div>

            <p className="mt-3.5 text-sm text-[#5C4B52] leading-relaxed">
              {product.description}
            </p>

            {/* Variant Selector */}
            {product.variants.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-semibold text-[#23191E] mb-2">
                  Select Pack / Option:{' '}
                  <span className="font-normal text-[#B76E79]">{selectedVariant?.label}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => {
                    const active = variant.id === selectedVariant?.id;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariantId(variant.id)}
                        aria-pressed={active}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#23191E] text-white'
                            : 'bg-[#FDF8F6] text-[#23191E] border border-[#23191E]/15 hover:border-[#B76E79]'
                        }`}
                      >
                        {variant.swatchHex && (
                          <span
                            className="w-3 h-3 rounded-full border border-white/70"
                            style={{ backgroundColor: variant.swatchHex }}
                          />
                        )}
                        <span>{variant.label}</span>
                        <span className="opacity-75 tabular-nums">
                          {formatINR(variant.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Stepper + Primary CTAs */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center border border-[#23191E]/18 rounded-lg h-11 bg-[#FDF8F6]">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="w-10 h-full flex items-center justify-center text-[#23191E] hover:text-[#B76E79] cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span
                    data-testid="quickview-qty"
                    className="w-10 text-center text-sm font-semibold text-[#23191E] tabular-nums"
                  >
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                    aria-label="Increase quantity"
                    className="w-10 h-full flex items-center justify-center text-[#23191E] hover:text-[#B76E79] cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  disabled={!product.inStock}
                  onClick={handleAdd}
                  className={`flex-1 h-11 px-5 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    !product.inStock
                      ? 'bg-[#23191E]/15 text-[#5C4B52] cursor-not-allowed'
                      : addedFeedback
                        ? 'bg-[#2E6B4F] text-white'
                        : 'bg-[#B76E79] hover:bg-[#9B5560] text-white'
                  }`}
                >
                  {addedFeedback ? (
                    <>
                      <Check className="w-4 h-4" />
                      Added to Bag
                    </>
                  ) : !product.inStock ? (
                    'Currently Out of Stock'
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      Add to Cart · {formatINR((selectedVariant?.price ?? 0) * quantity)}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onToggleWishlist(product.id)}
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                  className={`w-11 h-11 rounded-lg border flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                    isWishlisted
                      ? 'border-[#B76E79] bg-[#B76E79] text-white'
                      : 'border-[#23191E]/18 bg-white text-[#23191E] hover:border-[#B76E79]'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>

              {selectedVariant && (
                <a
                  href={buildWhatsAppProductUrl(product, selectedVariant, quantity)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-11 px-5 rounded-lg border border-[#25D366]/60 bg-[#25D366]/12 hover:bg-[#25D366]/22 text-[#164A2B] text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-[#1A9A4B]" />
                  <span>Order Directly on WhatsApp</span>
                </a>
              )}
            </div>

            {/* Technical Specs Box */}
            {specEntries.length > 0 && (
              <div className="mt-6 pt-5 border-t border-[#23191E]/10">
                <h3 className="text-xs font-semibold tracking-[0.12em] text-[#23191E] mb-3">
                  Technical Specifications & Studio Notes
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {specEntries.map((spec) => (
                    <div
                      key={spec.label}
                      className="p-2.5 rounded-lg bg-[#FDF8F6] border border-[#23191E]/6"
                    >
                      <dt className="text-[#5C4B52]">{spec.label}</dt>
                      <dd className="font-semibold text-[#23191E] mt-0.5">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Shipping Assurance Row */}
            <div className="mt-5 pt-4 border-t border-[#23191E]/8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#5C4B52]">
              <span className="inline-flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#C59B27]" />
                Free Prepaid Shipping above ₹999
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C59B27]" />
                Leak-Proof Bubble Wrap Guarantee
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
