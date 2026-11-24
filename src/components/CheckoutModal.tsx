import { useState } from 'react';
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  CreditCard,
  Lock,
  MessageCircle,
  PackageSearch,
  QrCode,
  X,
} from 'lucide-react';
import type { CartItem, Order, OrderShipping, PaymentMode } from '../types/store';
import { INDIAN_STATES } from '../data/catalog';
import {
  buildWhatsAppOrderUrl,
  calculateCartTotals,
  COD_HANDLING_FEE,
  formatINR,
  generateOrderId,
  validateShippingForm,
} from '../utils/storeLogic';

interface CheckoutModalProps {
  open: boolean;
  items: CartItem[];
  couponCode: string;
  onClose: () => void;
  onOrderConfirmed: (order: Order) => void;
  onTrackOrder: (orderId: string) => void;
}

const EMPTY_SHIPPING: OrderShipping = {
  fullName: '',
  mobile: '',
  pincode: '',
  city: '',
  state: 'Maharashtra',
  address: '',
};

export function CheckoutModal({
  open,
  items,
  couponCode,
  onClose,
  onOrderConfirmed,
  onTrackOrder,
}: CheckoutModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [shipping, setShipping] = useState<OrderShipping>(EMPTY_SHIPPING);
  const [errors, setErrors] = useState<Partial<Record<keyof OrderShipping, string>>>({});
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('upi');
  const [upiId, setUpiId] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  if (!open) return null;

  const totals = calculateCartTotals(items, couponCode, paymentMode);

  const handleClose = () => {
    setStep(1);
    setErrors({});
    setConfirmedOrder(null);
    onClose();
  };

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateShippingForm(shipping);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    setErrors({});
    setStep(2);
  };

  const handlePlaceOrder = () => {
    const orderId = generateOrderId();
    const today = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const newOrder: Order = {
      id: orderId,
      createdAt: today,
      items: items.map((it) => ({ ...it })),
      shipping: { ...shipping },
      paymentMode,
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      couponCode: totals.appliedCoupon?.code ?? null,
      shippingFee: totals.shippingFee,
      codFee: totals.codFee,
      grandTotal: totals.grandTotal,
      status: 'Confirmed',
      estimatedDelivery: 'Dispatching within 24 hrs · Est. 3–5 Days Pan-India',
      timeline: [
        { label: 'Order Confirmed', date: `${today} · Just now`, completed: true, active: true },
        { label: 'Bubble-Wrap Packing at Mumbai Studio', date: 'Within 24 hours', completed: false },
        { label: 'In Transit via Express Courier', date: 'Pending dispatch', completed: false },
        { label: 'Delivered', date: 'Est. 3–5 Working Days', completed: false },
      ],
    };

    setConfirmedOrder(newOrder);
    onOrderConfirmed(newOrder);
    setStep(3);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#23191E]/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Checkout"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-[#23191E]/10">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#23191E]/10 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#23191E]">
              {step === 1 && 'Step 1 of 2 · Shipping Details'}
              {step === 2 && 'Step 2 of 2 · Payment Mode'}
              {step === 3 && 'Order Confirmed'}
            </h2>
            {step < 3 && (
              <p className="text-xs text-[#5C4B52] mt-0.5">
                Pan-India Express Delivery · Damage-Proof Packaging
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close checkout"
            className="p-2 rounded-lg text-[#5C4B52] hover:bg-[#FDF8F6] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Shipping Form */}
        {step === 1 && (
          <form onSubmit={handleContinueToPayment} noValidate className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ship-name" className="block text-xs font-semibold text-[#23191E] mb-1.5">
                  Full Name *
                </label>
                <input
                  id="ship-name"
                  type="text"
                  value={shipping.fullName}
                  onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
                  placeholder="e.g. Ayesha Siddiqui"
                  className="w-full h-10 px-3.5 rounded-lg border border-[#23191E]/18 bg-[#FDF8F6] focus:bg-white focus:border-[#B76E79] text-sm"
                />
                {errors.fullName && <p className="mt-1 text-xs text-[#9B2C3E]">{errors.fullName}</p>}
              </div>

              <div>
                <label htmlFor="ship-mobile" className="block text-xs font-semibold text-[#23191E] mb-1.5">
                  Mobile Number (WhatsApp Updates) *
                </label>
                <input
                  id="ship-mobile"
                  type="tel"
                  value={shipping.mobile}
                  onChange={(e) => setShipping({ ...shipping, mobile: e.target.value })}
                  placeholder="10-digit Indian mobile"
                  className="w-full h-10 px-3.5 rounded-lg border border-[#23191E]/18 bg-[#FDF8F6] focus:bg-white focus:border-[#B76E79] text-sm tabular-nums"
                />
                {errors.mobile && <p className="mt-1 text-xs text-[#9B2C3E]">{errors.mobile}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="ship-pincode" className="block text-xs font-semibold text-[#23191E] mb-1.5">
                  Pincode *
                </label>
                <input
                  id="ship-pincode"
                  type="text"
                  maxLength={6}
                  value={shipping.pincode}
                  onChange={(e) => setShipping({ ...shipping, pincode: e.target.value })}
                  placeholder="400050"
                  className="w-full h-10 px-3.5 rounded-lg border border-[#23191E]/18 bg-[#FDF8F6] focus:bg-white focus:border-[#B76E79] text-sm tabular-nums"
                />
                {errors.pincode && <p className="mt-1 text-xs text-[#9B2C3E]">{errors.pincode}</p>}
              </div>

              <div>
                <label htmlFor="ship-city" className="block text-xs font-semibold text-[#23191E] mb-1.5">
                  City *
                </label>
                <input
                  id="ship-city"
                  type="text"
                  value={shipping.city}
                  onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                  placeholder="Mumbai"
                  className="w-full h-10 px-3.5 rounded-lg border border-[#23191E]/18 bg-[#FDF8F6] focus:bg-white focus:border-[#B76E79] text-sm"
                />
                {errors.city && <p className="mt-1 text-xs text-[#9B2C3E]">{errors.city}</p>}
              </div>

              <div>
                <label htmlFor="ship-state" className="block text-xs font-semibold text-[#23191E] mb-1.5">
                  State *
                </label>
                <select
                  id="ship-state"
                  value={shipping.state}
                  onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-[#23191E]/18 bg-[#FDF8F6] focus:bg-white focus:border-[#B76E79] text-sm"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                {errors.state && <p className="mt-1 text-xs text-[#9B2C3E]">{errors.state}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="ship-address" className="block text-xs font-semibold text-[#23191E] mb-1.5">
                Full Delivery Address *
              </label>
              <textarea
                id="ship-address"
                rows={3}
                value={shipping.address}
                onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                placeholder="Flat / House No., Building, Street, Locality & Landmark"
                className="w-full p-3.5 rounded-lg border border-[#23191E]/18 bg-[#FDF8F6] focus:bg-white focus:border-[#B76E79] text-sm"
              />
              {errors.address && <p className="mt-1 text-xs text-[#9B2C3E]">{errors.address}</p>}
            </div>

            <div className="pt-4 border-t border-[#23191E]/10 flex items-center justify-between gap-4">
              <div className="text-xs text-[#5C4B52] tabular-nums">
                Order Subtotal:{' '}
                <strong className="text-sm text-[#23191E]">{formatINR(totals.grandTotal)}</strong>
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-lg bg-[#23191E] hover:bg-[#3A2931] text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                Continue to Payment
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Payment Mode Selector */}
        {step === 2 && (
          <div className="p-6 space-y-6">
            <div className="space-y-3" role="radiogroup" aria-label="Choose payment method">
              {/* Option 1: UPI / QR */}
              <button
                type="button"
                role="radio"
                aria-checked={paymentMode === 'upi'}
                onClick={() => setPaymentMode('upi')}
                className={`w-full p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                  paymentMode === 'upi'
                    ? 'border-[#B76E79] bg-[#FDF8F6] ring-1 ring-[#B76E79]'
                    : 'border-[#23191E]/12 bg-white hover:bg-[#FDF8F6]/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <QrCode className="w-5 h-5 text-[#B76E79] shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-[#23191E]">
                        UPI / QR Instant Pay (GPay · PhonePe · Paytm)
                      </span>
                      <span className="text-xs font-semibold text-[#2E6B4F]">Recommended</span>
                    </div>
                    <p className="text-xs text-[#5C4B52] mt-1">
                      Zero extra fees · Instant confirmation & priority dispatch.
                    </p>
                  </div>
                </div>
              </button>

              {paymentMode === 'upi' && (
                <div className="p-4 rounded-xl bg-[#FDF8F6] border border-[#23191E]/10 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-24 h-24 rounded-lg bg-white border border-[#23191E]/15 p-2 flex items-center justify-center shrink-0">
                    <QrCode className="w-16 h-16 text-[#23191E]" />
                  </div>
                  <div className="flex-1 w-full">
                    <p className="text-xs font-semibold text-[#23191E]">
                      Pay via UPI ID or Scan Studio QR
                    </p>
                    <p className="text-xs text-[#5C4B52] mt-0.5">
                      Merchant VPA: <strong className="text-[#23191E]">fatimaresinart@okaxis</strong>
                    </p>
                    <label htmlFor="checkout-upi-id" className="sr-only">
                      Your UPI ID (optional)
                    </label>
                    <input
                      id="checkout-upi-id"
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="Optional: yourname@okhdfcbank"
                      className="mt-2.5 w-full h-9 px-3 rounded-lg bg-white border border-[#23191E]/15 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Option 2: Credit / Debit Card */}
              <button
                type="button"
                role="radio"
                aria-checked={paymentMode === 'card'}
                onClick={() => setPaymentMode('card')}
                className={`w-full p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                  paymentMode === 'card'
                    ? 'border-[#B76E79] bg-[#FDF8F6] ring-1 ring-[#B76E79]'
                    : 'border-[#23191E]/12 bg-white hover:bg-[#FDF8F6]/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-[#B76E79] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-semibold text-[#23191E]">
                      Credit / Debit Card (RuPay · Visa · Mastercard)
                    </span>
                    <p className="text-xs text-[#5C4B52] mt-1">
                      256-bit encrypted Indian payment gateway with OTP verification.
                    </p>
                  </div>
                </div>
              </button>

              {/* Option 3: Cash on Delivery */}
              <button
                type="button"
                role="radio"
                aria-checked={paymentMode === 'cod'}
                onClick={() => setPaymentMode('cod')}
                className={`w-full p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                  paymentMode === 'cod'
                    ? 'border-[#B76E79] bg-[#FDF8F6] ring-1 ring-[#B76E79]'
                    : 'border-[#23191E]/12 bg-white hover:bg-[#FDF8F6]/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Banknote className="w-5 h-5 text-[#B76E79] shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-[#23191E]">
                        Cash on Delivery (COD)
                      </span>
                      <span className="text-xs text-[#5C4B52] tabular-nums">
                        +{formatINR(COD_HANDLING_FEE)} COD fee
                      </span>
                    </div>
                    <p className="text-xs text-[#5C4B52] mt-1">
                      Pay in cash or UPI when the courier arrives at your doorstep.
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Order Summary Card */}
            <div className="p-4 rounded-xl bg-[#FDF8F6] border border-[#23191E]/10 space-y-2 text-xs sm:text-sm tabular-nums">
              <div className="flex justify-between text-[#5C4B52]">
                <span>Delivering to</span>
                <span className="font-medium text-[#23191E] text-right">
                  {shipping.fullName} · {shipping.city} ({shipping.pincode})
                </span>
              </div>
              <div className="flex justify-between text-[#5C4B52]">
                <span>Items ({totals.itemCount})</span>
                <span className="font-medium text-[#23191E]">{formatINR(totals.subtotal)}</span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-[#2E6B4F] font-medium">
                  <span>Coupon ({totals.appliedCoupon?.code})</span>
                  <span>-{formatINR(totals.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#5C4B52]">
                <span>Shipping</span>
                <span className="font-medium text-[#23191E]">
                  {totals.shippingFee === 0 ? 'FREE' : formatINR(totals.shippingFee)}
                </span>
              </div>
              {totals.codFee > 0 && (
                <div className="flex justify-between text-[#5C4B52]">
                  <span>COD Handling Fee</span>
                  <span className="font-medium text-[#23191E]">{formatINR(totals.codFee)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2.5 border-t border-[#23191E]/10 text-base font-bold text-[#23191E]">
                <span>Total Payable</span>
                <span>{formatINR(totals.grandTotal)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#23191E]/18 text-sm font-medium text-[#23191E] hover:bg-[#FDF8F6] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="button"
                onClick={handlePlaceOrder}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#B76E79] hover:bg-[#9B5560] text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Place Order · {formatINR(totals.grandTotal)}</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Instant Confirmation Screen */}
        {step === 3 && confirmedOrder && (
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-[#2E6B4F]/12 text-[#2E6B4F] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-[#B76E79]">
                Thank You for Shopping with Fatima Resin Art
              </p>
              <h3 className="mt-1 font-serif text-2xl sm:text-3xl font-semibold text-[#23191E]">
                Order #{confirmedOrder.id} Confirmed
              </h3>
              <p className="mt-2 text-sm text-[#5C4B52]">
                We are preparing your leak-proof resin parcel for{' '}
                <strong>{confirmedOrder.shipping.fullName}</strong> in{' '}
                <strong>{confirmedOrder.shipping.city}</strong>.
              </p>
            </div>

            <div className="text-left p-4 rounded-xl bg-[#FDF8F6] border border-[#23191E]/10 space-y-2 text-xs sm:text-sm tabular-nums">
              {confirmedOrder.items.map((it) => (
                <div
                  key={`${it.productId}-${it.variantId}`}
                  className="flex justify-between gap-2 text-[#23191E]"
                >
                  <span className="truncate">
                    {it.name} ({it.variantLabel}) × {it.quantity}
                  </span>
                  <span className="font-semibold shrink-0">
                    {formatINR(it.price * it.quantity)}
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-[#23191E]/10 flex justify-between font-bold text-[#23191E]">
                <span>Total ({confirmedOrder.paymentMode.toUpperCase()})</span>
                <span>{formatINR(confirmedOrder.grandTotal)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={buildWhatsAppOrderUrl(confirmedOrder)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-12 px-5 rounded-lg bg-[#25D366] hover:bg-[#1FB858] text-[#112A1B] text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Send Order Details on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  const oid = confirmedOrder.id;
                  handleClose();
                  onTrackOrder(oid);
                }}
                className="h-12 px-5 rounded-lg border border-[#23191E]/20 hover:bg-[#FDF8F6] text-[#23191E] text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <PackageSearch className="w-4 h-4" />
                <span>Track Order</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
