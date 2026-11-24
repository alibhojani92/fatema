import { useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { HERO_SLIDES } from '../data/catalog';
import type { FilterTab } from '../types/store';
import { ResilientImage } from './ResilientImage';

interface HeroSliderProps {
  onShopSupplies: (tab: FilterTab) => void;
  onCustomizeArt: () => void;
}

export function HeroSlider({ onShopSupplies, onCustomizeArt }: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6200);
    return () => window.clearInterval(id);
  }, [paused]);

  const current = HERO_SLIDES[activeIndex];

  return (
    <section
      id="top"
      aria-label="Featured collections"
      className="relative overflow-hidden bg-[#23191E]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative min-h-[500px] sm:min-h-[540px] lg:min-h-[580px] flex items-center">
        {/* Background Slide Visuals */}
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            aria-hidden={idx !== activeIndex}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              idx === activeIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <ResilientImage
              src={slide.image}
              alt={slide.title}
              loading={idx === 0 ? 'eager' : 'lazy'}
              fallbackTone="#2B1F24"
              className="w-full h-full object-cover"
            />
            {/* Measured contrast scrim so left-aligned ivory typography always clears WCAG AA */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(95deg, rgba(35,25,30,0.92) 0%, rgba(35,25,30,0.78) 46%, rgba(35,25,30,0.18) 100%)',
              }}
            />
          </div>
        ))}

        {/* Editorial Content Container */}
        <div className="relative z-10 max-w-[1320px] mx-auto w-full px-5 sm:px-8 lg:px-10 py-14 sm:py-16">
          <div className="max-w-2xl">
            <p className="text-xs sm:text-sm font-medium tracking-[0.16em] text-[#E8D5A3] mb-4">
              {current.eyebrow}
            </p>
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-[54px] font-semibold text-white leading-[1.12] tracking-tight">
              {current.title}
            </h1>
            <p className="mt-4 sm:mt-5 text-sm sm:text-base lg:text-[17px] text-[#FDF8F6]/85 leading-relaxed max-w-xl">
              {current.subtitle}
            </p>

            {/* Dual CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={() => onShopSupplies(current.targetTab)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-[#B76E79] hover:bg-[#9B5560] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>{current.primaryCta}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onCustomizeArt}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg border border-[#E8D5A3]/60 bg-[#23191E]/55 hover:bg-[#FDF8F6] hover:text-[#23191E] text-[#FDF8F6] text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#C59B27]" />
                <span>{current.secondaryCta}</span>
              </button>
            </div>

            {/* Quiet Tagline & Pan-India Trust Line */}
            <p className="mt-7 text-xs sm:text-[13px] text-[#FDF8F6]/70 tracking-wide">
              Craft Glossy Masterpieces & Bespoke Resin Memories · Trusted by 18,000+ Indian Artists
            </p>
          </div>
        </div>

        {/* Slide Prev / Next Arrows */}
        <div className="hidden sm:flex items-center gap-2 absolute right-8 bottom-8 z-20">
          <button
            type="button"
            onClick={() =>
              setActiveIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
            }
            aria-label="Previous hero slide"
            className="w-10 h-10 rounded-full border border-white/25 bg-[#23191E]/60 hover:bg-white hover:text-[#23191E] text-white flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setActiveIndex((prev) => (prev + 1) % HERO_SLIDES.length)}
            aria-label="Next hero slide"
            className="w-10 h-10 rounded-full border border-white/25 bg-[#23191E]/60 hover:bg-white hover:text-[#23191E] text-white flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Slide Indicators */}
        <div
          className="absolute left-5 sm:left-10 bottom-6 sm:bottom-8 z-20 flex items-center gap-2"
          role="tablist"
          aria-label="Hero slides"
        >
          {HERO_SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={idx === activeIndex}
              aria-label={`Show slide ${idx + 1}: ${slide.title}`}
              onClick={() => setActiveIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === activeIndex
                  ? 'w-8 bg-[#C59B27]'
                  : 'w-2 bg-white/45 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
