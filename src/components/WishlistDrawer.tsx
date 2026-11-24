import { Heart, ShoppingBag, Trash2, X } from 'lucide-react';
import type { Product, ProductVariant } from '../types/store';
import { formatINR } from '../utils/storeLogic';
import { ResilientImage } from './ResilientImage';

interface WishlistDrawerProps {
  open: boolean;
  products: Product[];
  onClose: () => void;
  onRemoveWishlist: (productId: string) => void;
  onAddToCart: (product: Product, variant: ProductVariant, quantity?: number) => void;
  onQuickView: (product: Product, variantId: string) => void;
}

export function WishlistDrawer({
  open,
  products,
  onClose,
  onRemoveWishlist,
  onAddToCart,
  onQuickView,
}: WishlistDrawerProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Saved Wishlist"
    >
      <div
        className="fixed inset-0 bg-[#23191E]/55 backdrop-blur-xs"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
        <div className="px-5 py-4 border-b border-[#23191E]/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#B76E79] fill-current" />
            <h2 className="font-serif text-xl font-semibold text-[#23191E]">
              Saved Wishlist
            </h2>
            <span className="text-xs text-[#5C4B52] tabular-nums">({products.length})</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close wishlist"
            className="p-2 rounded-lg text-[#5C4B52] hover:bg-[#FDF8F6] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {products.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#FDF8F6] border border-[#C59B27]/35 flex items-center justify-center text-[#B76E79] mb-4">
              <Heart className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-[#23191E]">
              No saved favorites yet
            </h3>
            <p className="mt-2 text-sm text-[#5C4B52] max-w-xs">
              Tap the heart icon on any resin supply or bespoke gift to shortlist it here.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 px-6 py-3 rounded-lg bg-[#23191E] text-white text-sm font-semibold hover:bg-[#3A2931] cursor-pointer"
            >
              Explore Supplies
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-[#23191E]/8">
            {products.map((product) => {
              const firstVariant = product.variants[0];
              return (
                <div key={product.id} className="py-4 first:pt-0 flex gap-3.5">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onQuickView(product, firstVariant?.id ?? '');
                    }}
                    className="w-20 h-20 rounded-xl overflow-hidden border border-[#23191E]/10 shrink-0 cursor-pointer"
                  >
                    <ResilientImage
                      src={product.images[0]}
                      alt={product.name}
                      fallbackTone={product.fallbackTone}
                      className="w-full h-full object-cover"
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-[#23191E] line-clamp-2">
                        {product.name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => onRemoveWishlist(product.id)}
                        aria-label={`Remove ${product.name} from wishlist`}
                        className="p-1 text-[#5C4B52] hover:text-[#B76E79] cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-[#5C4B52] mt-0.5">
                      {product.category} · {firstVariant?.label}
                    </p>
                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-[#23191E] tabular-nums">
                        {formatINR(firstVariant?.price ?? 0)}
                      </span>
                      {firstVariant && (
                        <button
                          type="button"
                          disabled={!product.inStock}
                          onClick={() => {
                            onAddToCart(product, firstVariant, 1);
                            onRemoveWishlist(product.id);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#B76E79] hover:bg-[#9B5560] disabled:opacity-45 text-white text-xs font-semibold cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Move to Bag</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
