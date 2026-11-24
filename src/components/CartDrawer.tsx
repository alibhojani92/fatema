import { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import type { CartItem } from '../types/store';
import {
  calculateCartTotals,
  formatINR,
  FREE_SHIPPING_THRESHOLD,
} from '../utils/storeLogic';
import { ResilientImage } from './ResilientImage';

interface CartDrawerProps {
  open: boolean;
  items: CartItem[];
  appliedCouponCode: string;
  onClose: () => void;
  onUpdateQty: (productId: string, variantId: string, delta: number) => void;
  onRemoveItem: (productId: string, variantId: string) => void;
  onApplyCoupon: (code: string) => void;
  onProceedToCheckout: () => void;
}

export function CartDrawer({
  open,
  items,
  appliedCouponCode,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onApplyCoupon,
  onProceedToCheckout,
}: CartDrawerProps) {
  const [couponInput, setCouponInput] = useState(appliedCouponCode);

  if (!open) return null;

  const totals = calculateCartTotals(items, appliedCouponCode, 'upi');

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyCoupon(couponInput.trim());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag"
    >
      <div
        className="fixed inset-0 bg-[#23191E]/55 backdrop-blur-xs"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-[#23191E]/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#B76E79]" />
            <h2 className="font-serif text-xl font-semibold text-[#23191E]">
              Your Shopping Bag
            </h2>
            <span className="text-xs text-[#5C4B52] tabular-nums">
              ({totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'})
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shopping bag"
            className="p-2 rounded-lg text-[#5C4B52] hover:bg-[#FDF8F6] hover:text-[#23191E] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Free Shipping Progress Bar */}
        <div className="px-5 py-3.5 bg-[#FDF8F6] border-b border-[#23191E]/8">
          <div className="flex items-center gap-2 text-xs font-medium text-[#23191E]">
            {totals.freeShippingUnlocked ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#2E6B4F] shrink-0" />
                <span>
                  Unlocked! Your prepaid order qualifies for{' '}
                  <strong className="text-[#2E6B4F]">FREE Pan-India Shipping</strong>.
                </span>
              </>
            ) : (
              <>
                <Truck className="w-4 h-4 text-[#C59B27] shrink-0" />
                <span>
                  Add{' '}
                  <strong className="text-[#B76E79] tabular-nums">
                    {formatINR(totals.freeShippingRemaining)}
                  </strong>{' '}
                  more to unlock FREE Prepaid Shipping (above {formatINR(FREE_SHIPPING_THRESHOLD)})
                </span>
              </>
            )}
          </div>
          <div
            className="mt-2 h-2 w-full rounded-full bg-[#23191E]/10 overflow-hidden"
            role="progressbar"
            aria-valuenow={totals.freeShippingProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Free shipping progress"
          >
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                totals.freeShippingUnlocked ? 'bg-[#2E6B4F]' : 'bg-[#C59B27]'
              }`}
              style={{ width: `${totals.freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Cart Items List or Empty State */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#FDF8F6] border border-[#C59B27]/35 flex items-center justify-center text-[#B76E79] mb-4">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-[#23191E]">
              Your resin bag is empty
            </h3>
            <p className="mt-2 text-sm text-[#5C4B52] max-w-xs">
              Explore our crystal-clear 2:1 epoxy resins, shimmering mica powders, and bespoke keepsakes.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 px-6 py-3 rounded-lg bg-[#23191E] hover:bg-[#3A2931] text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-[#23191E]/8">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="py-4 first:pt-0 flex gap-3.5"
                >
                  <ResilientImage
                    src={item.image}
                    alt={item.name}
                    fallbackTone={item.fallbackTone}
                    className="w-20 h-20 rounded-xl object-cover shrink-0 border border-[#23191E]/8"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-[#23191E] leading-snug line-clamp-2">
                          {item.name}
                        </h3>
                        <p className="text-xs text-[#5C4B52] mt-0.5">
                          Option: <span className="font-medium text-[#23191E]">{item.variantLabel}</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.productId, item.variantId)}
                        aria-label={`Remove ${item.name} (${item.variantLabel}) from bag`}
                        className="p-1.5 text-[#5C4B52] hover:text-[#B76E79] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="inline-flex items-center border border-[#23191E]/15 rounded-lg h-8 bg-[#FDF8F6]">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.productId, item.variantId, -1)}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="w-8 h-full flex items-center justify-center text-[#23191E] hover:text-[#B76E79] cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold text-[#23191E] tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.productId, item.variantId, 1)}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="w-8 h-full flex items-center justify-center text-[#23191E] hover:text-[#B76E79] cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right tabular-nums">
                        <span className="text-sm font-bold text-[#23191E]">
                          {formatINR(item.price * item.quantity)}
                        </span>
                        {item.mrp > item.price && (
                          <span className="block text-[11px] text-[#5C4B52] line-through">
                            {formatINR(item.mrp * item.quantity)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon + Summary Footer */}
            <div className="p-5 border-t border-[#23191E]/10 bg-[#FDF8F6] space-y-4">
              {/* Coupon Code Form */}
              <div>
                <form onSubmit={handleCouponSubmit} className="flex gap-2">
                  <label htmlFor="cart-coupon-input" className="sr-only">
                    Coupon code
                  </label>
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-[#5C4B52] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="cart-coupon-input"
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Promo code (e.g. FATIMA10)"
                      className="w-full h-10 pl-9 pr-3 rounded-lg bg-white border border-[#23191E]/15 text-xs font-medium text-[#23191E] placeholder:text-[#5C4B52]/70 focus:outline-none focus:border-[#B76E79]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 h-10 rounded-lg bg-[#23191E] hover:bg-[#3A2931] text-white text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Apply
                  </button>
                </form>

                {totals.appliedCoupon ? (
                  <div className="mt-2 flex items-center justify-between text-xs text-[#2E6B4F] font-medium">
                    <span>
                      Code <strong>{totals.appliedCoupon.code}</strong> applied (10% OFF)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setCouponInput('');
                        onApplyCoupon('');
                      }}
                      className="underline text-[#5C4B52] hover:text-[#23191E] cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : totals.couponError ? (
                  <p className="mt-1.5 text-xs text-[#9B2C3E]">{totals.couponError}</p>
                ) : (
                  <p className="mt-1.5 text-[11px] text-[#5C4B52]">
                    First kit?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setCouponInput('FATIMA10');
                        onApplyCoupon('FATIMA10');
                      }}
                      className="font-semibold text-[#B76E79] underline cursor-pointer"
                    >
                      Tap to apply FATIMA10
                    </button>{' '}
                    for flat 10% OFF.
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs sm:text-sm text-[#5C4B52] pt-2 border-t border-[#23191E]/8 tabular-nums">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#23191E]">{formatINR(totals.subtotal)}</span>
                </div>
                {totals.discountAmount > 0 && (
                  <div className="flex justify-between text-[#2E6B4F] font-medium">
                    <span>Coupon ({totals.appliedCoupon?.code})</span>
                    <span>-{formatINR(totals.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Prepaid Shipping</span>
                  <span className="font-medium text-[#23191E]">
                    {totals.shippingFee === 0 ? (
                      <span className="text-[#2E6B4F]">FREE</span>
                    ) : (
                      formatINR(totals.shippingFee)
                    )}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#23191E]/10 text-base font-bold text-[#23191E]">
                  <span>Estimated Total</span>
                  <span>{formatINR(totals.grandTotal)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onProceedToCheckout}
                className="w-full h-12 rounded-lg bg-[#B76E79] hover:bg-[#9B5560] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
