import { useEffect, useMemo, useState } from 'react';
import { INITIAL_PRODUCTS, SEED_ORDERS } from './data/catalog';
import type {
  CartItem,
  CategoryArchItem,
  CustomerAccount,
  CustomQuoteRequest,
  FilterTab,
  Order,
  OrderStatus,
  Product,
  ProductVariant,
  SortOption,
} from './types/store';
import { filterAndSortProducts, getCustomerOrders } from './utils/storeLogic';
import { readStorage, STORAGE_KEYS, writeStorage } from './utils/storage';
import { Header } from './components/Header';
import { HeroSlider } from './components/HeroSlider';
import { CategoryArchStrip } from './components/CategoryArchStrip';
import { ProductCatalogSection } from './components/ProductCatalogSection';
import { CustomArtSpotlight } from './components/CustomArtSpotlight';
import { WatchAndShopReels } from './components/WatchAndShopReels';
import { TrustAndReviewsSection } from './components/TrustAndReviewsSection';
import { Footer } from './components/Footer';
import { ProductQuickViewModal } from './components/ProductQuickViewModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { CustomQuoteModal } from './components/CustomQuoteModal';
import { TrackOrderModal } from './components/TrackOrderModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { StoreManagerModal } from './components/StoreManagerModal';
import { AuthModal } from './components/AuthModal';
import { MyAccountModal, type AccountTab } from './components/MyAccountModal';

function updateTimelineForStatus(order: Order, status: OrderStatus): Order['timeline'] {
  const statusStageMap: Record<OrderStatus, number> = {
    Confirmed: 0,
    Packed: 1,
    'In Transit': 2,
    Delivered: 3,
  };
  const stageIdx = statusStageMap[status] ?? 0;
  return order.timeline.map((step, idx) => ({
    ...step,
    completed: idx <= stageIdx,
    active: idx === stageIdx,
  }));
}

export default function App() {
  const [products, setProducts] = useState<Product[]>(() =>
    readStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS)
  );
  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    readStorage<CartItem[]>(STORAGE_KEYS.CART, [])
  );
  const [wishlistIds, setWishlistIds] = useState<string[]>(() =>
    readStorage<string[]>(STORAGE_KEYS.WISHLIST, [])
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    readStorage<Order[]>(STORAGE_KEYS.ORDERS, SEED_ORDERS)
  );
  const [quoteRequests, setQuoteRequests] = useState<CustomQuoteRequest[]>(() =>
    readStorage<CustomQuoteRequest[]>(STORAGE_KEYS.QUOTES, [])
  );
  const [accounts, setAccounts] = useState<CustomerAccount[]>(() =>
    readStorage<CustomerAccount[]>(STORAGE_KEYS.ACCOUNTS, [])
  );
  const [currentUserId, setCurrentUserId] = useState<string | null>(() =>
    readStorage<string | null>(STORAGE_KEYS.SESSION_USER_ID, null)
  );

  // Persist storefront & customer data to localStorage
  useEffect(() => {
    writeStorage(STORAGE_KEYS.PRODUCTS, products);
  }, [products]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.CART, cartItems);
  }, [cartItems]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.WISHLIST, wishlistIds);
  }, [wishlistIds]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.ORDERS, orders);
  }, [orders]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.QUOTES, quoteRequests);
  }, [quoteRequests]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.ACCOUNTS, accounts);
  }, [accounts]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.SESSION_USER_ID, currentUserId);
  }, [currentUserId]);

  // Catalog filter & sort state
  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [appliedCouponCode, setAppliedCouponCode] = useState('');

  // Modal & Drawer state
  const [quickViewState, setQuickViewState] = useState<{
    product: Product | null;
    variantId?: string;
  }>({ product: null });
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [customQuoteState, setCustomQuoteState] = useState<{
    open: boolean;
    defaultArtType?: string;
  }>({ open: false });
  const [trackOrderState, setTrackOrderState] = useState<{
    open: boolean;
    initialOrderId?: string;
  }>({ open: false });
  const [storeManagerOpen, setStoreManagerOpen] = useState(false);
  const [authModalState, setAuthModalState] = useState<{
    open: boolean;
    initialTab: 'login' | 'register';
  }>({ open: false, initialTab: 'login' });
  const [accountModalState, setAccountModalState] = useState<{
    open: boolean;
    initialTab: AccountTab;
  }>({ open: false, initialTab: 'profile' });

  const currentUser = useMemo(
    () => accounts.find((acc) => acc.id === currentUserId) ?? null,
    [accounts, currentUserId]
  );

  const customerOrders = useMemo(
    () => (currentUser ? getCustomerOrders(orders, currentUser) : []),
    [orders, currentUser]
  );

  const filteredProducts = useMemo(
    () =>
      filterAndSortProducts(products, {
        activeTab,
        activeCategorySlug,
        searchQuery,
        sortBy,
      }),
    [products, activeTab, activeCategorySlug, searchQuery, sortBy]
  );

  const wishlistedProducts = useMemo(
    () => products.filter((p) => wishlistIds.includes(p.id)),
    [products, wishlistIds]
  );

  const totalCartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const handleAddToCart = (
    product: Product,
    variant: ProductVariant,
    quantity = 1
  ) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.productId === product.id && item.variantId === variant.id
      );
      if (existingIdx >= 0) {
        return prev.map((item, idx) =>
          idx === existingIdx
            ? { ...item, quantity: Math.min(20, item.quantity + quantity) }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          variantId: variant.id,
          name: product.name,
          variantLabel: variant.label,
          category: product.category,
          price: variant.price,
          mrp: variant.mrp,
          quantity,
          image: product.images[0],
          fallbackTone: product.fallbackTone,
        },
      ];
    });
    setCartOpen(true);
  };

  const handleUpdateCartQty = (
    productId: string,
    variantId: string,
    delta: number
  ) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.productId === productId && item.variantId === variantId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveCartItem = (productId: string, variantId: string) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item.productId === productId && item.variantId === variantId)
      )
    );
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleNavigateCatalog = ({
    tab,
    categorySlug,
  }: {
    tab?: FilterTab;
    categorySlug?: string | null;
  }) => {
    if (tab !== undefined) setActiveTab(tab);
    if (categorySlug !== undefined) setActiveCategorySlug(categorySlug);
  };

  const handleSelectCategoryArch = (category: CategoryArchItem | null) => {
    if (!category) {
      setActiveCategorySlug(null);
      setActiveTab('All');
      return;
    }
    setActiveCategorySlug(category.slug);
    setActiveTab(category.filterTab);
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTabChange = (tab: FilterTab) => {
    setActiveCategorySlug(null);
    setActiveTab(tab);
  };

  const handleClearAllFilters = () => {
    setActiveTab('All');
    setActiveCategorySlug(null);
    setSearchQuery('');
    setSortBy('featured');
  };

  const handleOrderConfirmed = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    setCartItems([]);
    setAppliedCouponCode('');

    // Save the customer's delivery address to their profile if not yet saved
    if (currentUser && !currentUser.address.trim() && order.shipping.address.trim()) {
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === currentUser.id
            ? {
                ...acc,
                address: order.shipping.address,
                city: order.shipping.city,
                pincode: order.shipping.pincode,
                state: order.shipping.state,
              }
            : acc
        )
      );
    }
  };

  const handleLoginSuccess = (account: CustomerAccount) => {
    setCurrentUserId(account.id);
    setAuthModalState((prev) => ({ ...prev, open: false }));
  };

  const handleRegisterSuccess = (account: CustomerAccount) => {
    setAccounts((prev) => [account, ...prev]);
    setCurrentUserId(account.id);
    setAuthModalState((prev) => ({ ...prev, open: false }));
  };

  const handleLogout = () => {
    setCurrentUserId(null);
    setAccountModalState((prev) => ({ ...prev, open: false }));
  };

  const handleUpdateProfile = (updated: CustomerAccount) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === updated.id ? updated : acc))
    );
  };

  const handleUpdateProductPricing = (
    productId: string,
    newPrice: number,
    newMrp: number,
    inStock: boolean
  ) => {
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id !== productId) return prod;
        const updatedVariants = prod.variants.map((v, idx) =>
          idx === 0 ? { ...v, price: newPrice, mrp: newMrp } : v
        );
        return { ...prod, inStock, variants: updatedVariants };
      })
    );
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((prod) => prod.id !== productId));
    setWishlistIds((prev) => prev.filter((id) => id !== productId));
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, status, timeline: updateTimelineForStatus(order, status) }
          : order
      )
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#23191E]">
      <Header
        products={products}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectProduct={(product) =>
          setQuickViewState({ product, variantId: product.variants[0]?.id })
        }
        onNavigateCatalog={handleNavigateCatalog}
        onOpenCustomQuote={() => setCustomQuoteState({ open: true })}
        onOpenCart={() => setCartOpen(true)}
        onOpenWishlist={() => setWishlistOpen(true)}
        onOpenTrackOrder={() => setTrackOrderState({ open: true })}
        currentUser={currentUser}
        onOpenAuth={(tab = 'login') =>
          setAuthModalState({ open: true, initialTab: tab })
        }
        onOpenAccount={(tab = 'profile') =>
          setAccountModalState({ open: true, initialTab: tab })
        }
        onLogout={handleLogout}
        cartCount={totalCartCount}
        wishlistCount={wishlistIds.length}
      />

      <main className="flex-1">
        <HeroSlider
          onShopSupplies={(tab) => {
            setActiveCategorySlug(null);
            setActiveTab(tab);
            document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
          }}
          onCustomizeArt={() => setCustomQuoteState({ open: true })}
        />

        <CategoryArchStrip
          activeCategorySlug={activeCategorySlug}
          onSelectCategory={handleSelectCategoryArch}
        />

        <ProductCatalogSection
          products={filteredProducts}
          activeTab={activeTab}
          activeCategorySlug={activeCategorySlug}
          searchQuery={searchQuery}
          sortBy={sortBy}
          wishlistIds={wishlistIds}
          onTabChange={handleTabChange}
          onSortChange={setSortBy}
          onClearAllFilters={handleClearAllFilters}
          onToggleWishlist={handleToggleWishlist}
          onAddToCart={handleAddToCart}
          onQuickView={(product, variantId) =>
            setQuickViewState({ product, variantId })
          }
        />

        <CustomArtSpotlight
          onOpenCustomQuote={(defaultArtType) =>
            setCustomQuoteState({ open: true, defaultArtType })
          }
          onViewCustomCatalog={() => {
            setActiveCategorySlug(null);
            setActiveTab('Ready & Custom Art');
            document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        <WatchAndShopReels
          products={products}
          onAddToCart={handleAddToCart}
          onQuickView={(product, variantId) =>
            setQuickViewState({ product, variantId })
          }
        />

        <TrustAndReviewsSection />
      </main>

      <Footer
        onNavigateCatalog={handleNavigateCatalog}
        onOpenCustomQuote={() => setCustomQuoteState({ open: true })}
        onOpenTrackOrder={() => setTrackOrderState({ open: true })}
        onOpenStoreManager={() => setStoreManagerOpen(true)}
      />

      {/* Modals & Slide-Over Drawers */}
      <ProductQuickViewModal
        product={quickViewState.product}
        initialVariantId={quickViewState.variantId}
        isWishlisted={
          quickViewState.product ? wishlistIds.includes(quickViewState.product.id) : false
        }
        onClose={() => setQuickViewState({ product: null })}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        open={cartOpen}
        items={cartItems}
        appliedCouponCode={appliedCouponCode}
        onClose={() => setCartOpen(false)}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onApplyCoupon={setAppliedCouponCode}
        onProceedToCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        open={checkoutOpen}
        items={cartItems}
        couponCode={appliedCouponCode}
        currentUser={currentUser}
        onClose={() => setCheckoutOpen(false)}
        onOrderConfirmed={handleOrderConfirmed}
        onTrackOrder={(orderId) =>
          setTrackOrderState({ open: true, initialOrderId: orderId })
        }
      />

      <CustomQuoteModal
        open={customQuoteState.open}
        defaultArtType={customQuoteState.defaultArtType}
        onClose={() => setCustomQuoteState({ open: false })}
        onSubmitQuote={(quote) => setQuoteRequests((prev) => [quote, ...prev])}
      />

      <TrackOrderModal
        open={trackOrderState.open}
        orders={orders}
        initialOrderId={trackOrderState.initialOrderId}
        onClose={() => setTrackOrderState({ open: false })}
      />

      <WishlistDrawer
        open={wishlistOpen}
        products={wishlistedProducts}
        onClose={() => setWishlistOpen(false)}
        onRemoveWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        onQuickView={(product, variantId) =>
          setQuickViewState({ product, variantId })
        }
      />

      <AuthModal
        open={authModalState.open}
        initialTab={authModalState.initialTab}
        accounts={accounts}
        onClose={() => setAuthModalState((prev) => ({ ...prev, open: false }))}
        onLoginSuccess={handleLoginSuccess}
        onRegisterSuccess={handleRegisterSuccess}
      />

      <MyAccountModal
        open={accountModalState.open}
        initialTab={accountModalState.initialTab}
        customer={currentUser}
        customerOrders={customerOrders}
        wishlistedProducts={wishlistedProducts}
        onClose={() => setAccountModalState((prev) => ({ ...prev, open: false }))}
        onUpdateProfile={handleUpdateProfile}
        onLogout={handleLogout}
        onTrackOrder={(orderId) =>
          setTrackOrderState({ open: true, initialOrderId: orderId })
        }
        onRemoveWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        onQuickView={(product, variantId) =>
          setQuickViewState({ product, variantId })
        }
      />

      <StoreManagerModal
        open={storeManagerOpen}
        products={products}
        orders={orders}
        quoteRequests={quoteRequests}
        onClose={() => setStoreManagerOpen(false)}
        onUpdateProductPricing={handleUpdateProductPricing}
        onAddProduct={handleAddProduct}
        onDeleteProduct={handleDeleteProduct}
        onUpdateOrderStatus={handleUpdateOrderStatus}
      />
    </div>
  );
}
