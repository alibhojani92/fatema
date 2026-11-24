import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Droplets,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';
import { VERIFIED_REVIEWS } from '../data/catalog';

const TRUST_GUARANTEES = [
  {
    icon: Sparkles,
    title: 'Ultra-Clear UV Resistant Formula',
    description:
      'Optical-grade HALS UV stabilizers engineered to prevent yellowing across warm Indian summers.',
  },
  {
    icon: Droplets,
    title: 'Zero-Bubble Self-Leveling',
    description:
      'Low-viscosity resin de-gasses smoothly for a flawless, glass-clear glossy dome without cloudy ripples.',
  },
  {
    icon: PackageCheck,
    title: 'Damage-Proof Bubble Wrap Packaging',
    description:
      'Induction-sealed leak-proof bottles cushioned inside double-walled corrugated boxes for safe Pan-India transit.',
  },
  {
    icon: ShieldCheck,
    title: '100% Secure UPI & Card Checkout',
    description:
      'Instant GPay, PhonePe, Paytm, RuPay, Visa, Mastercard, and Pan-India Cash on Delivery support.',
  },
];

export function TrustAndReviewsSection() {
  const [startIndex, setStartIndex] = useState(0);

  const visibleReviews = [
    VERIFIED_REVIEWS[startIndex % VERIFIED_REVIEWS.length],
    VERIFIED_REVIEWS[(startIndex + 1) % VERIFIED_REVIEWS.length],
    VERIFIED_REVIEWS[(startIndex + 2) % VERIFIED_REVIEWS.length],
  ];

  const handlePrev = () => {
    setStartIndex((prev) => (prev - 1 + VERIFIED_REVIEWS.length) % VERIFIED_REVIEWS.length);
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev + 1) % VERIFIED_REVIEWS.length);
  };

  return (
    <>
      {/* 4-Card Trust & Quality Guarantee Strip */}
      <section
        aria-label="Quality and shipping guarantees"
        className="py-14 bg-[#FDF8F6] border-y border-[#23191E]/8"
      >
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_GUARANTEES.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="p-6 rounded-xl bg-white border border-[#23191E]/8 flex flex-col"
                >
                  <div className="w-11 h-11 rounded-lg bg-[#FDF8F6] border border-[#C59B27]/35 flex items-center justify-center text-[#B76E79] mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-[#23191E] leading-snug">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-[#5C4B52] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Verified Artist & Customer Reviews Carousel */}
      <section
        aria-labelledby="reviews-heading"
        className="py-16 sm:py-20 bg-white"
      >
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-medium tracking-[0.14em] text-[#B76E79] mb-1.5">
                4.9 Average Rating Across 1,800+ Verified Orders
              </p>
              <h2
                id="reviews-heading"
                className="font-serif text-2xl sm:text-4xl font-semibold text-[#23191E]"
              >
                Loved by Indian Resin Artists & Brides
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous customer reviews"
                className="w-10 h-10 rounded-full border border-[#23191E]/15 hover:border-[#B76E79] hover:text-[#B76E79] text-[#23191E] flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next customer reviews"
                className="w-10 h-10 rounded-full border border-[#23191E]/15 hover:border-[#B76E79] hover:text-[#B76E79] text-[#23191E] flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleReviews.map((review) => (
              <article
                key={review.id}
                className="p-6 sm:p-7 rounded-xl bg-[#FDF8F6] border border-[#23191E]/8 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className="flex items-center gap-0.5 text-[#C59B27]"
                      aria-label={`${review.rating} out of 5 stars`}
                    >
                      {Array.from({ length: review.rating }).map((_, idx) => (
                        <Star key={idx} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-xs text-[#5C4B52]">{review.verifiedDate}</span>
                  </div>

                  <blockquote className="mt-4 text-sm sm:text-[15px] text-[#23191E] leading-relaxed">
                    "{review.quote}"
                  </blockquote>
                </div>

                <div className="mt-6 pt-4 border-t border-[#23191E]/10">
                  <p className="text-sm font-semibold text-[#23191E]">{review.author}</p>
                  <p className="text-xs text-[#5C4B52] mt-0.5">
                    {review.role} · {review.city}
                  </p>
                  <p className="text-xs text-[#B76E79] font-medium mt-2">
                    Verified Purchase: {review.purchasedItem}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
