import { CATEGORY_ARCHES } from '../data/catalog';
import type { CategoryArchItem } from '../types/store';
import { ResilientImage } from './ResilientImage';

interface CategoryArchStripProps {
  activeCategorySlug: string | null;
  onSelectCategory: (category: CategoryArchItem | null) => void;
}

export function CategoryArchStrip({
  activeCategorySlug,
  onSelectCategory,
}: CategoryArchStripProps) {
  return (
    <section
      aria-labelledby="shop-by-category-heading"
      className="py-14 sm:py-16 bg-[#FDF8F6] border-b border-[#23191E]/8"
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-9">
          <div>
            <p className="text-xs font-medium tracking-[0.14em] text-[#B76E79] mb-1.5">
              Curated Resin Atelier
            </p>
            <h2
              id="shop-by-category-heading"
              className="font-serif text-2xl sm:text-3xl font-semibold text-[#23191E]"
            >
              Shop By Category
            </h2>
          </div>
          {activeCategorySlug && (
            <button
              type="button"
              onClick={() => onSelectCategory(null)}
              className="self-start sm:self-auto text-xs font-semibold text-[#B76E79] hover:text-[#9B5560] underline underline-offset-4 cursor-pointer"
            >
              Reset category filter
            </button>
          )}
        </div>

        {/* 8-Category Arch Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 sm:gap-5">
          {CATEGORY_ARCHES.map((cat) => {
            const isActive = activeCategorySlug === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(isActive ? null : cat)}
                aria-pressed={isActive}
                className="group flex flex-col items-center text-center focus-visible:outline-2 focus-visible:outline-offset-4 rounded-xl cursor-pointer"
              >
                <div
                  className={`w-full aspect-[4/5] rounded-t-full rounded-b-xl overflow-hidden p-1.5 transition-all duration-200 ${
                    isActive
                      ? 'ring-2 ring-[#C59B27] bg-white shadow-md'
                      : 'border border-[#C59B27]/35 bg-white group-hover:border-[#C59B27] group-hover:shadow-md'
                  }`}
                >
                  <div className="w-full h-full rounded-t-full rounded-b-lg overflow-hidden bg-[#FDF8F6]">
                    <ResilientImage
                      src={cat.image}
                      alt={cat.name}
                      fallbackTone={cat.fallbackTone}
                      className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                    />
                  </div>
                </div>
                <span
                  className={`mt-3 text-sm font-semibold leading-snug transition-colors ${
                    isActive
                      ? 'text-[#B76E79]'
                      : 'text-[#23191E] group-hover:text-[#B76E79]'
                  }`}
                >
                  {cat.name}
                </span>
                <span className="mt-0.5 text-[11px] text-[#5C4B52] leading-tight">
                  {cat.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
