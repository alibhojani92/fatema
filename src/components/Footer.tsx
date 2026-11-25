import { useState } from 'react';
import {
  CheckCircle2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import type { FilterTab } from '../types/store';
import {
  STORE_ADDRESS,
  STORE_PHONE_DISPLAY,
  WHATSAPP_NUMBER,
} from '../utils/storeLogic';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  onNavigateCatalog: (opts: { tab?: FilterTab; categorySlug?: string | null }) => void;
  onOpenCustomQuote: () => void;
  onOpenTrackOrder: () => void;
  onOpenStoreManager: () => void;
}

const POLICIES: Record<string, { title: string; body: string }> = {
  shipping: {
    title: 'Pan-India Shipping & Express Delivery',
    body: `Prepaid orders above ₹999 qualify for complimentary Pan-India shipping via BlueDart and Delhivery Air. Resin supplies dispatch within 24 working hours from our ${STORE_ADDRESS} studio in induction-sealed, double bubble-wrapped cartons. Custom preserved pieces ship in 8–21 days after WhatsApp design approval.`,
  },
  returns: {
    title: 'Damage Replacement & Returns Policy',
    body: `Every bottle is hand-inspected before dispatch. In the rare event of transit leakage or breakage, share an unboxing photo on WhatsApp (${STORE_PHONE_DISPLAY}) within 48 hours of delivery for a free express replacement. Custom varmala preservation and personalized nameplates are made-to-order and non-returnable once poured.`,
  },
  varmala: {
    title: 'Wedding Varmala Courier Guide',
    body: `After booking your varmala slot, store your fresh garlands in a breathable cardboard box (never airtight plastic) in a cool room and dispatch within 2–4 days of your wedding via overnight courier to our Fatima Resin Art studio at ${STORE_ADDRESS}.`,
  },
};

const PAYMENT_BADGES = [
  'UPI',
  'GPay',
  'PhonePe',
  'Paytm',
  'RuPay',
  'Visa',
  'Mastercard',
  'COD',
];

export function Footer({
  onNavigateCatalog,
  onOpenCustomQuote,
  onOpenTrackOrder,
  onOpenStoreManager,
}: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [openPolicyKey, setOpenPolicyKey] = useState<string | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError('');
    setSubscribed(true);
    setEmail('');
  };

  return (
    <>
      <footer className="bg-[#23191E] text-[#FDF8F6]">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
            {/* Column 1: Brand Bio */}
            <div className="lg:col-span-4 space-y-4">
              <BrandLogo inverted />
              <p className="text-sm text-[#FDF8F6]/75 leading-relaxed max-w-sm">
                Craft Glossy Masterpieces & Bespoke Resin Memories. India’s boutique destination for studio-grade 2:1 & 3:1 epoxy resin supplies, cosmetic-grade mica pigments, and handcrafted wedding varmala preservation heirlooms.
              </p>
              <div className="space-y-2 text-xs text-[#FDF8F6]/75 pt-1">
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#C59B27] shrink-0" />
                  {STORE_ADDRESS}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#C59B27] shrink-0" />
                  <a
                    href={`tel:${WHATSAPP_NUMBER}`}
                    className="hover:text-[#E8D5A3] transition-colors"
                  >
                    {STORE_PHONE_DISPLAY}
                  </a>{' '}
                  (Mon–Sat, 10 AM – 7 PM IST)
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#C59B27] shrink-0" />
                  studio@fatimaresinart.in
                </p>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="lg:col-span-2">
              <h3 className="font-serif text-base font-semibold text-white mb-4">
                Shop Studio
              </h3>
              <ul className="space-y-2.5 text-sm text-[#FDF8F6]/75">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateCatalog({ tab: 'Resin & Hardener', categorySlug: 'epoxy-resin' });
                      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-[#E8D5A3] transition-colors cursor-pointer"
                  >
                    Epoxy Resin & Hardeners
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateCatalog({ tab: 'Pigments', categorySlug: 'mica-powders' });
                      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-[#E8D5A3] transition-colors cursor-pointer"
                  >
                    Mica Pigments & Inks
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateCatalog({ tab: 'Molds', categorySlug: 'silicone-molds' });
                      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-[#E8D5A3] transition-colors cursor-pointer"
                  >
                    Silicone Molds & MDF
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateCatalog({ tab: 'Ready & Custom Art', categorySlug: null });
                      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-[#E8D5A3] transition-colors cursor-pointer"
                  >
                    Varmala & Custom Gifts
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenCustomQuote}
                    className="hover:text-[#E8D5A3] transition-colors cursor-pointer"
                  >
                    Request Custom Quote
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Customer Care Policies */}
            <div className="lg:col-span-3">
              <h3 className="font-serif text-base font-semibold text-white mb-4">
                Customer Care
              </h3>
              <ul className="space-y-2.5 text-sm text-[#FDF8F6]/75">
                <li>
                  <button
                    type="button"
                    onClick={onOpenTrackOrder}
                    className="hover:text-[#E8D5A3] transition-colors cursor-pointer"
                  >
                    Track Your Order
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setOpenPolicyKey('shipping')}
                    className="hover:text-[#E8D5A3] transition-colors cursor-pointer"
                  >
                    Pan-India Shipping Policy
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setOpenPolicyKey('returns')}
                    className="hover:text-[#E8D5A3] transition-colors cursor-pointer"
                  >
                    Damage Replacement & Returns
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setOpenPolicyKey('varmala')}
                    className="hover:text-[#E8D5A3] transition-colors cursor-pointer"
                  >
                    Varmala Flower Shipping Guide
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenStoreManager}
                    className="inline-flex items-center gap-1.5 text-xs text-[#FDF8F6]/65 hover:text-[#E8D5A3] transition-colors pt-1 cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    Admin Panel
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Newsletter */}
            <div className="lg:col-span-3">
              <h3 className="font-serif text-base font-semibold text-white mb-3">
                Join the Atelier List
              </h3>
              <p className="text-xs sm:text-sm text-[#FDF8F6]/75 leading-relaxed mb-4">
                Receive new pigment launches, resin pouring guides, and exclusive festive offers. Use <strong className="text-[#E8D5A3]">FATIMA10</strong> at checkout for 10% off.
              </p>

              {subscribed ? (
                <div className="p-3.5 rounded-lg bg-[#2E6B4F]/25 border border-[#2E6B4F]/50 text-xs text-[#FDF8F6] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0" />
                  <span>Welcome to Fatima Resin Art! Code FATIMA10 is active on your bag.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} noValidate className="space-y-2">
                  <label htmlFor="footer-newsletter-email" className="sr-only">
                    Email address for newsletter
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="footer-newsletter-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError('');
                      }}
                      placeholder="Your email address"
                      className="flex-1 min-w-0 h-10 px-3 rounded-lg bg-white/10 border border-white/20 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-[#C59B27]"
                    />
                    <button
                      type="submit"
                      className="px-4 h-10 rounded-lg bg-[#B76E79] hover:bg-[#9B5560] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Join
                    </button>
                  </div>
                  {emailError && <p className="text-xs text-[#F2A6B3]">{emailError}</p>}
                </form>
              )}
            </div>
          </div>

          {/* Payment Badges & Copyright Row */}
          <div className="mt-12 pt-8 border-t border-white/12 flex flex-col md:flex-row items-center justify-between gap-5">
            <p className="text-xs text-[#FDF8F6]/60 text-center md:text-left">
              © {new Date().getFullYear()} Fatima Resin Art Studio, {STORE_ADDRESS}. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2" aria-label="Accepted Indian payment methods">
              {PAYMENT_BADGES.map((method) => (
                <span
                  key={method}
                  className="px-2.5 py-1 rounded border border-white/15 bg-white/6 text-[11px] font-medium tracking-wide text-[#FDF8F6]/85"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Bottom-Right WhatsApp Quick-Chat Button */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
          'Hello Fatima Resin Art! I have a question about your resin supplies / custom art.'
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Fatima Resin Art on WhatsApp"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-[#25D366] hover:bg-[#1FB858] text-[#112A1B] font-semibold text-xs sm:text-sm shadow-lg transition-transform duration-200 hover:scale-105"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="hidden sm:inline">WhatsApp Studio</span>
      </a>

      {/* Policy Details Modal */}
      {openPolicyKey && POLICIES[openPolicyKey] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#23191E]/65 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label={POLICIES[openPolicyKey].title}
          onClick={() => setOpenPolicyKey(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 sm:p-7 shadow-2xl border border-[#23191E]/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-serif text-2xl font-semibold text-[#23191E]">
                {POLICIES[openPolicyKey].title}
              </h3>
              <button
                type="button"
                onClick={() => setOpenPolicyKey(null)}
                aria-label="Close policy modal"
                className="p-1.5 rounded-lg text-[#5C4B52] hover:bg-[#FDF8F6] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-4 text-sm text-[#5C4B52] leading-relaxed">
              {POLICIES[openPolicyKey].body}
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setOpenPolicyKey(null)}
                className="px-5 py-2.5 rounded-lg bg-[#23191E] text-white text-sm font-semibold hover:bg-[#3A2931] cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
