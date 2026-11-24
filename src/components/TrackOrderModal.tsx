import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, PackageSearch, Search, Truck, X } from 'lucide-react';
import type { Order } from '../types/store';
import { formatINR } from '../utils/storeLogic';

interface TrackOrderModalProps {
  open: boolean;
  orders: Order[];
  initialOrderId?: string;
  onClose: () => void;
}

export function TrackOrderModal({
  open,
  orders,
  initialOrderId,
  onClose,
}: TrackOrderModalProps) {
  const [query, setQuery] = useState(initialOrderId || '');
  const [searchedId, setSearchedId] = useState(initialOrderId || '');

  useEffect(() => {
    if (open && initialOrderId) {
      setQuery(initialOrderId);
      setSearchedId(initialOrderId);
    }
  }, [open, initialOrderId]);

  if (!open) return null;

  const matchedOrder = searchedId
    ? orders.find((o) => o.id.toLowerCase() === searchedId.trim().toLowerCase()) ?? null
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchedId(query.trim());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#23191E]/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="track-order-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-[#23191E]/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#23191E]/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <PackageSearch className="w-5 h-5 text-[#B76E79]" />
            <h2
              id="track-order-title"
              className="font-serif text-xl sm:text-2xl font-semibold text-[#23191E]"
            >
              Track Your Order
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close track order modal"
            className="p-2 rounded-lg text-[#5C4B52] hover:bg-[#FDF8F6] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <label htmlFor="track-order-input" className="sr-only">
              Enter your Fatima Resin Art Order ID
            </label>
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#5C4B52] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="track-order-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Order ID (e.g. FRA-2611-7412)"
                className="w-full h-11 pl-10 pr-3 rounded-lg bg-[#FDF8F6] border border-[#23191E]/18 text-sm text-[#23191E] focus:bg-white focus:border-[#B76E79] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-5 h-11 rounded-lg bg-[#23191E] hover:bg-[#3A2931] text-white text-sm font-semibold whitespace-nowrap cursor-pointer"
            >
              Track
            </button>
          </form>

          {/* Recent / Sample Order Quick Buttons */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#5C4B52]">
            <span>Recent orders:</span>
            {orders.slice(0, 3).map((ord) => (
              <button
                key={ord.id}
                type="button"
                onClick={() => {
                  setQuery(ord.id);
                  setSearchedId(ord.id);
                }}
                className="px-2.5 py-1 rounded-md bg-[#FDF8F6] border border-[#23191E]/12 hover:border-[#B76E79] text-[#23191E] font-medium tabular-nums cursor-pointer"
              >
                {ord.id}
              </button>
            ))}
          </div>

          {searchedId && matchedOrder ? (
            <div className="rounded-xl border border-[#23191E]/12 bg-[#FDF8F6] p-5 space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-2 pb-4 border-b border-[#23191E]/10">
                <div>
                  <p className="text-xs text-[#5C4B52]">Order #{matchedOrder.id}</p>
                  <p className="font-serif text-lg font-semibold text-[#23191E] mt-0.5">
                    {matchedOrder.status}
                  </p>
                  <p className="text-xs text-[#5C4B52] mt-1 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#C59B27]" />
                    {matchedOrder.estimatedDelivery}
                  </p>
                </div>
                <div className="text-right text-xs text-[#5C4B52] tabular-nums">
                  <p className="font-semibold text-[#23191E] text-sm">
                    {formatINR(matchedOrder.grandTotal)}
                  </p>
                  <p className="mt-0.5">{matchedOrder.paymentMode.toUpperCase()}</p>
                  <p className="mt-0.5">
                    {matchedOrder.shipping.city}, {matchedOrder.shipping.pincode}
                  </p>
                </div>
              </div>

              {/* Shipment Timeline */}
              <ol className="space-y-3.5">
                {matchedOrder.timeline.map((step) => (
                  <li key={step.label} className="flex items-start gap-3">
                    {step.completed ? (
                      <CheckCircle2
                        className={`w-5 h-5 shrink-0 mt-0.5 ${
                          step.active ? 'text-[#B76E79]' : 'text-[#2E6B4F]'
                        }`}
                      />
                    ) : (
                      <Clock className="w-5 h-5 shrink-0 mt-0.5 text-[#5C4B52]/45" />
                    )}
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          step.completed ? 'text-[#23191E]' : 'text-[#5C4B52]'
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-[#5C4B52]">{step.date}</p>
                    </div>
                  </li>
                ))}
              </ol>

              {/* Items Summary */}
              <div className="pt-3 border-t border-[#23191E]/10 space-y-1.5 text-xs">
                <p className="font-semibold text-[#23191E]">Items in this parcel</p>
                {matchedOrder.items.map((it) => (
                  <div
                    key={`${it.productId}-${it.variantId}`}
                    className="flex justify-between text-[#5C4B52] tabular-nums"
                  >
                    <span>
                      {it.name} ({it.variantLabel}) × {it.quantity}
                    </span>
                    <span className="font-medium text-[#23191E]">
                      {formatINR(it.price * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : searchedId ? (
            <div className="p-6 rounded-xl bg-[#FDF8F6] border border-[#23191E]/10 text-center">
              <p className="text-sm font-semibold text-[#23191E]">
                No order found for "{searchedId}"
              </p>
              <p className="text-xs text-[#5C4B52] mt-1">
                Double-check your Order ID (e.g. FRA-2611-7412) or tap one of the recent orders above.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
