import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { ResilientImage } from './ResilientImage';

interface CustomArtSpotlightProps {
  onOpenCustomQuote: (defaultArtType?: string) => void;
  onViewCustomCatalog: () => void;
}

const BESPOKE_OFFERINGS = [
  {
    title: 'Wedding Varmala Preservation',
    detail: 'Pan-India flower courier guide & archival non-yellowing blocks.',
  },
  {
    title: 'Geode Wall Clocks',
    detail: 'Crushed quartz druzy, 24K gold veins & silent brass sweep hands.',
  },
  {
    title: 'Islamic Calligraphy & Nameplates',
    detail: 'Weather-sealed villa entrance plaques in mirror-gold acrylic.',
  },
  {
    title: 'Ocean Resin Serving Trays',
    detail: 'Food-safe glossy wave lacing with solid champagne brass handles.',
  },
];

export function CustomArtSpotlight({
  onOpenCustomQuote,
  onViewCustomCatalog,
}: CustomArtSpotlightProps) {
  return (
    <section
      aria-labelledby="custom-spotlight-heading"
      className="py-16 sm:py-20 bg-[#FDF8F6] border-y border-[#23191E]/8"
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
        <div className="bg-white border border-[#C59B27]/30 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch shadow-sm">
          {/* Left Visual Showcase: Balanced Studio Diptych */}
          <div className="lg:col-span-6 relative min-h-[360px] lg:min-h-full bg-[#23191E] p-6 sm:p-8 flex flex-col justify-between">
            <div className="grid grid-cols-2 gap-4 my-auto">
              <div className="aspect-[4/5] rounded-xl overflow-hidden border border-[#C59B27]/40 bg-[#FDF8F6] shadow-lg">
                <ResilientImage
                  src="/images/prod-varmala-frame.svg"
                  alt="Custom Wedding Varmala Preservation Block by Fatima Resin Art"
                  fallbackTone="#F7E7EA"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-[4/5] rounded-xl overflow-hidden border border-[#C59B27]/40 bg-[#FDF8F6] shadow-lg mt-6">
                <ResilientImage
                  src="/images/prod-geode-clock.svg"
                  alt="Rose Plum and 24K Gold Crystal Geode Wall Clock"
                  fallbackTone="#F4E5E9"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="mt-6 pt-5 border-t border-white/12">
              <p className="text-xs font-medium tracking-[0.14em] text-[#E8D5A3]">
                Bespoke Commissions · Hand-Poured in Bhavnagar, Gujarat
              </p>
              <p className="mt-1 font-serif text-lg sm:text-xl text-white">
                WhatsApp layout approval included before every final pour.
              </p>
            </div>
          </div>

          {/* Right Editorial Copy & Interactive CTA */}
          <div className="lg:col-span-6 p-7 sm:p-10 lg:p-12 flex flex-col justify-center">
            <p className="text-xs font-medium tracking-[0.14em] text-[#B76E79] mb-2">
              Custom Resin Studio & Heirloom Gifting
            </p>
            <h2
              id="custom-spotlight-heading"
              className="font-serif text-3xl sm:text-4xl font-semibold text-[#23191E] leading-tight"
            >
              Turn Sacred Varmala & Moments into Crystal Heirlooms
            </h2>
            <p className="mt-4 text-sm sm:text-[15px] text-[#5C4B52] leading-relaxed">
              Every bespoke artwork at Fatima Resin Art is poured layer by layer in our climate-controlled studio using museum-clear UV-stabilized resin, real 24K gold leaf, and custom colour palettes matched to your home interiors.
            </p>

            <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {BESPOKE_OFFERINGS.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  aria-label={`Request custom quote for ${item.title}`}
                  onClick={() => onOpenCustomQuote(item.title)}
                  className="text-left p-3.5 rounded-xl bg-[#FDF8F6] hover:bg-[#F6EAE6] border border-[#23191E]/8 transition-colors group cursor-pointer"
                >
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#C59B27] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-[#23191E] group-hover:text-[#B76E79] transition-colors">
                        {item.title}
                      </p>
                      <p className="text-xs text-[#5C4B52] mt-1 leading-relaxed">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={() => onOpenCustomQuote()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-[#23191E] hover:bg-[#3A2931] text-white text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#C59B27]" />
                <span>Request Custom Quote</span>
              </button>
              <button
                type="button"
                onClick={onViewCustomCatalog}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-lg border border-[#23191E]/20 hover:border-[#B76E79] text-[#23191E] hover:text-[#B76E79] text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
              >
                <span>Browse Ready Custom Pieces</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
