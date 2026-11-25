import { useEffect, useState } from 'react';
import {
  Check,
  Heart,
  LogOut,
  MessageCircle,
  Package,
  PackageSearch,
  ShoppingBag,
  Trash2,
  User,
  X,
} from 'lucide-react';
import type {
  CustomerAccount,
  Order,
  Product,
  ProductVariant,
} from '../types/store';
import { INDIAN_STATES } from '../data/catalog';
import {
  buildWhatsAppOrderUrl,
  formatINR,
  normalizeIndianMobile,
  validateProfileUpdateForm,
  type ProfileUpdateInput,
} from '../utils/storeLogic';
import { ResilientImage } from './ResilientImage';

export type AccountTab = 'profile' | 'orders' | 'wishlist';

interface MyAccountModalProps {
  open: boolean;
  initialTab?: AccountTab;
  customer: CustomerAccount | null;
  customerOrders: Order[];
  wishlistedProducts: Product[];
  onClose: () => void;
  onUpdateProfile: (updated: CustomerAccount) => void;
  onLogout: () => void;
  onTrackOrder: (orderId: string) => void;
  onRemoveWishlist: (productId: string) => void;
  onAddToCart: (product: Product, variant: ProductVariant, quantity?: number) => void;
  onQuickView: (product: Product, variantId: string) => void;
}

export function MyAccountModal({
  open,
  initialTab = 'profile',
  customer,
  customerOrders,
  wishlistedProducts,
  onClose,
  onUpdateProfile,
  onLogout,
  onTrackOrder,
  onRemoveWishlist,
  onAddToCart,
  onQuickView,
}: MyAccountModalProps) {
  const [activeTab, setActiveTab] = useState<AccountTab>(initialTab);
  const [profileForm, setProfileForm] = useState<ProfileUpdateInput>({
    fullName: '',
    mobile: '',
    city: '',
    state: 'Gujarat',
    pincode: '',
    address: '',
  });
  const [profileErrors, setProfileErrors] = useState<
    Partial<Record<keyof ProfileUpdateInput, string>>
  >({});
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (open && customer) {
      setActiveTab(initialTab);
      setProfileForm({
        fullName: customer.fullName,
        mobile: customer.mobile,
        city: customer.city,
        state: customer.state || 'Gujarat',
        pincode: customer.pincode,
        address: customer.address || '',
      });
      setProfileErrors({});
      setSavedNotice(false);
    }
  }, [open, initialTab, customer]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open || !customer) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateProfileUpdateForm(profileForm);
    if (Object.keys(validation).length > 0) {
      setProfileErrors(validation);
      return;
    }

    setProfileErrors({});
    onUpdateProfile({
      ...customer,
      fullName: profileForm.fullName.trim(),
      mobile: normalizeIndianMobile(profileForm.mobile),
      city: profileForm.city.trim(),
      state: profileForm.state,
      pincode: profileForm.pincode.replace(/\D/g, ''),
      address: profileForm.address.trim(),
    });
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 2600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#23191E]/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="my-account-heading"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-[#23191E]/12 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="px-6 py-4 border-b border-[#23191E]/10 bg-[#FDF8F6] flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#B76E79]">
              CUSTOMER ACCOUNT
            </p>
            <h2
              id="my-account-heading"
              className="font-serif text-xl sm:text-2xl font-semibold text-[#23191E] truncate"
            >
              {customer.fullName}
            </h2>
            <p className="text-xs text-[#5C4B52] truncate">
              {customer.email} · +91 {customer.mobile}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#23191E]/15 bg-white hover:bg-[#FDF8F6] text-xs font-semibold text-[#23191E] cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-[#B76E79]" />
              <span>Logout</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close my account modal"
              className="p-2 rounded-lg text-[#5C4B52] hover:bg-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Account Navigation Tabs */}
        <div className="px-6 pt-3 pb-3 border-b border-[#23191E]/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#23191E] text-white'
                : 'bg-[#FDF8F6] text-[#23191E] hover:bg-[#F6EAE6]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>My Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#23191E] text-white'
                : 'bg-[#FDF8F6] text-[#23191E] hover:bg-[#F6EAE6]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders ({customerOrders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wishlist')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'wishlist'
                ? 'bg-[#23191E] text-white'
                : 'bg-[#FDF8F6] text-[#23191E] hover:bg-[#F6EAE6]'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Saved Wishlist ({wishlistedProducts.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tab 1: My Profile */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} noValidate className="space-y-4 max-w-xl">
              <p className="text-xs text-[#5C4B52]">
                Your saved details automatically pre-fill during checkout for faster Pan-India ordering.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="profile-fullname"
                    className="block text-xs font-semibold text-[#23191E] mb-1.5"
                  >
                    Full Name *
                  </label>
                  <input
                    id="profile-fullname"
                    type="text"
                    value={profileForm.fullName}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, fullName: e.target.value })
                    }
                    className="w-full h-10 px-3.5 rounded-lg border border-[#23191E]/18 bg-[#FDF8F6] focus:bg-white focus:border-[#B76E79] text-sm"
                  />
                  {profileErrors.fullName && (
                    <p className="mt-1 text-xs text-[#9B2C3E]">{profileErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="profile-mobile"
                    className="block text-xs font-semibold text-[#23191E] mb-1.5"
                  >
                    Mobile Number *
                  </label>
                  <input
                    id="profile-mobile"
                    type="tel"
                    value={profileForm.mobile}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, mobile: e.target.value })
                    }
                    className="w-full h-10 px-3.5 rounded-lg border border-[#23191E]/18 bg-[#FDF8F6] focus:bg-white focus:border-[#B76E79] text-sm tabular-nums"
                  />
                  {profileErrors.mobile && (
                    <p className="mt-1 text-xs text-[#9B2C3E]">{profileErrors.mobile}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="profile-city"
                    className="block text-xs font-semibold text-[#23191E] mb-1.5"
                  >
                    City *
                  </label>
                  <input
                    id="profile-city"
                    type="text"
                    value={profileForm.city}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, city: e.target.value })
                    }
                    className="w-full h-10 px-3.5 rounded-lg border border-[#23191E]/18 bg-[#FDF8F6] focus:bg-white focus:border-[#B76E79] text-sm"
                  />
                  {profileErrors.city && (
                    <p className="mt-1 text-xs text-[#9B2C3E]">{profileErrors.city}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="profile-state"
                    className="block text-xs font-semibold text-[#23191E] mb-1.5"
                  >
                    State
                  </label>
                  <select
                    id="profile-state"
                    value={profileForm.state}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, state: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-lg border border-[#23191E]/18 bg-[#FDF8F6] focus:bg-white focus:border-[#B76E79] text-sm"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="profile-pincode"
                    className="block text-xs font-semibold text-[#23191E] mb-1.5"
                  >
                    Pincode *
                  </label>
                  <input
                    id="profile-pincode"
                    type="text"
                    maxLength={6}
                    value={profileForm.pincode}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, pincode: e.target.value })
                    }
                    className="w-full h-10 px-3.5 rounded-lg border border-[#23191E]/18 bg-[#FDF8F6] focus:bg-white focus:border-[#B76E79] text-sm tabular-nums"
                  />
                  {profileErrors.pincode && (
                    <p className="mt-1 text-xs text-[#9B2C3E]">{profileErrors.pincode}</p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="profile-address"
                  className="block text-xs font-semibold text-[#23191E] mb-1.5"
                >
                  Default Delivery Address
                </label>
                <textarea
                  id="profile-address"
                  rows={3}
                  value={profileForm.address}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, address: e.target.value })
                  }
                  placeholder="House / Flat No., Society, Street & Landmark"
                  className="w-full p-3.5 rounded-lg border border-[#23191E]/18 bg-[#FDF8F6] focus:bg-white focus:border-[#B76E79] text-sm"
                />
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-[#B76E79] hover:bg-[#9B5560] text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  Save Profile Details
                </button>
                {savedNotice && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2E6B4F]">
                    <Check className="w-4 h-4" />
                    Profile updated & saved
                  </span>
                )}
              </div>
            </form>
          )}

          {/* Tab 2: My Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {customerOrders.length === 0 ? (
                <div className="py-12 px-6 rounded-xl bg-[#FDF8F6] border border-[#23191E]/10 text-center">
                  <Package className="w-8 h-8 text-[#B76E79] mx-auto mb-3" />
                  <h3 className="font-serif text-xl font-semibold text-[#23191E]">
                    No orders placed yet
                  </h3>
                  <p className="mt-1.5 text-sm text-[#5C4B52] max-w-sm mx-auto">
                    When you complete an order while logged in, your full order receipt, payment details, and tracking status will appear here.
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-5 px-5 py-2.5 rounded-lg bg-[#23191E] text-white text-xs font-semibold hover:bg-[#3A2931] cursor-pointer"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                customerOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 rounded-xl bg-[#FDF8F6] border border-[#23191E]/10 space-y-3.5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-[#23191E]/10">
                      <div>
                        <p className="text-sm font-bold text-[#23191E] tabular-nums">
                          Order #{order.id}
                        </p>
                        <p className="text-xs text-[#5C4B52] mt-0.5">
                          Placed on {order.createdAt} · Payment: {order.paymentMode.toUpperCase()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-md ${
                            order.status === 'Delivered'
                              ? 'bg-[#2E6B4F]/15 text-[#2E6B4F]'
                              : order.status === 'In Transit'
                                ? 'bg-[#C59B27]/20 text-[#7A5D0F]'
                                : 'bg-[#B76E79]/15 text-[#8E3F4B]'
                          }`}
                        >
                          {order.status}
                        </span>
                        <p className="text-base font-bold text-[#23191E] mt-1 tabular-nums">
                          {formatINR(order.grandTotal)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs sm:text-sm">
                      {order.items.map((item) => (
                        <div
                          key={`${order.id}-${item.productId}-${item.variantId}`}
                          className="flex justify-between gap-2 text-[#23191E]"
                        >
                          <span className="truncate">
                            {item.name} ({item.variantLabel}) × {item.quantity}
                          </span>
                          <span className="font-semibold shrink-0 tabular-nums">
                            {formatINR(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-[#23191E]/8 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="text-[#5C4B52]">
                        Ship to: {order.shipping.city}, {order.shipping.state} - {order.shipping.pincode}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onTrackOrder(order.id);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#23191E]/18 bg-white hover:bg-[#F6EAE6] font-semibold text-[#23191E] cursor-pointer"
                        >
                          <PackageSearch className="w-3.5 h-3.5" />
                          <span>Track</span>
                        </button>
                        <a
                          href={buildWhatsAppOrderUrl(order)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#25D366]/18 hover:bg-[#25D366]/30 font-semibold text-[#113D23]"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Saved Wishlist */}
          {activeTab === 'wishlist' && (
            <div>
              {wishlistedProducts.length === 0 ? (
                <div className="py-12 px-6 rounded-xl bg-[#FDF8F6] border border-[#23191E]/10 text-center">
                  <Heart className="w-8 h-8 text-[#B76E79] mx-auto mb-3" />
                  <h3 className="font-serif text-xl font-semibold text-[#23191E]">
                    Your wishlist is empty
                  </h3>
                  <p className="mt-1.5 text-sm text-[#5C4B52] max-w-sm mx-auto">
                    Tap the heart button on any resin kit, pigment, or bespoke art piece to save it here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlistedProducts.map((product) => {
                    const firstVariant = product.variants[0];
                    return (
                      <div
                        key={product.id}
                        className="p-3.5 rounded-xl bg-[#FDF8F6] border border-[#23191E]/10 flex gap-3.5"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onQuickView(product, firstVariant?.id ?? '');
                          }}
                          className="w-20 h-20 rounded-lg overflow-hidden border border-[#23191E]/10 shrink-0 cursor-pointer"
                        >
                          <ResilientImage
                            src={product.images[0]}
                            alt={product.name}
                            fallbackTone={product.fallbackTone}
                            className="w-full h-full object-cover"
                          />
                        </button>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
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
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-[#23191E] tabular-nums">
                              {formatINR(firstVariant?.price ?? 0)}
                            </span>
                            {firstVariant && (
                              <button
                                type="button"
                                disabled={!product.inStock}
                                onClick={() => {
                                  onAddToCart(product, firstVariant, 1);
                                  onClose();
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#B76E79] hover:bg-[#9B5560] disabled:opacity-45 text-white text-xs font-semibold cursor-pointer"
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>Add to Bag</span>
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
          )}
        </div>
      </div>
    </div>
  );
}
