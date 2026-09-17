'use client';

import React, { useEffect, useRef, useState } from 'react';
import NoticeTicker from '@/components/NoticeTicker';
import SiteHeader from '@/components/SiteHeader';
import MobileCategoryScroll from '@/components/MobileCategoryScroll';
import HeroSlider from '@/components/HeroSlider';
import FlashSaleSection from '@/components/FlashSaleSection';
import HotDealSection from '@/components/HotDealSection';
import CategorySection from '@/components/CategorySection';
import PromoSection from '@/components/PromoSection';
import AllProductsSection from '@/components/AllProductsSection';
import FeaturesBar from '@/components/FeaturesBar';
import SiteFooter from '@/components/SiteFooter';
import VomOrderModal from '@/components/VomOrderModal';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import OrderTrackView from '@/components/OrderTrackView';
import PromoPopup from '@/components/PromoPopup';
import MobileBottomNav from '@/components/MobileBottomNav';
import CartToast from '@/components/CartToast';
import ShopView from '@/components/ShopView';
import ProductDetailsView from '@/components/ProductDetailsView';
import AuthView, { UserProfile } from '@/components/AuthView';
import CartOrderView from '@/components/CartOrderView';
import AddToCartModal from '@/components/AddToCartModal';
import ComplaintView from '@/components/ComplaintView';
import GccLiveChat from '@/components/GccLiveChat';
import HomeLoadingSkeleton from '@/components/HomeLoadingSkeleton';

import { Product, CartItem } from '@/lib/data';
import { clearAuthSession, getStoredAccessToken, supabaseGetProfile, supabaseSignOut } from '@/lib/supabase';
import { useSiteData } from '@/lib/site-data';

export default function HomePage() {
  const { products: allProductsList, dinajpurProducts, premiumProducts, promoBanners, loading: siteLoading } = useSiteData();
  // Navigation view state: 'home' | 'shop' | 'product-detail' | 'auth' | 'cart'
  const [currentView, setCurrentView] = useState<'home' | 'shop' | 'product-detail' | 'auth' | 'cart' | 'track' | 'complaint'>('home');
  const [shopCategory, setShopCategory] = useState<string | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  // Authentication state
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedUser = sessionStorage.getItem('falbazar_user');
        return savedUser ? (JSON.parse(savedUser) as UserProfile) : null;
      } catch {
        return null;
      }
    }
    return null;
  });




  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Remove the legacy client-side account/token store. Auth is now owned by Supabase
    // and the short-lived browser session uses sessionStorage only.
    localStorage.removeItem('falbazar_user');
    localStorage.removeItem('falbazar_registered_accounts');
    localStorage.removeItem('falbazar_auth_access_token');
    localStorage.removeItem('falbazar_auth_refresh_token');
  }, []);

  // Keep the SPA navigation inside the browser history so Android/Chrome
  // back returns to the previous website view instead of leaving the site.
  const productsRef = useRef(allProductsList);
  const currentViewRef = useRef(currentView);
  const historyReadyRef = useRef(false);
  const skipNextHistoryPushRef = useRef(false);
  const handlingPopStateRef = useRef(false);

  useEffect(() => {
    productsRef.current = allProductsList;
  }, [allProductsList]);

  useEffect(() => {
    currentViewRef.current = currentView;
  }, [currentView]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initialState = {
      __falBazar: true,
      view: 'home',
      shopCategory: null,
      productId: null,
      authMode: 'login',
    };

    if (!historyReadyRef.current) {
      window.history.replaceState(initialState, '', window.location.href);
      historyReadyRef.current = true;
      skipNextHistoryPushRef.current = true;
    }

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;

      // A state created by this app restores the previous in-site view.
      if (state?.__falBazar) {
        handlingPopStateRef.current = true;
        setShopCategory(state.shopCategory ?? null);
        setAuthInitialMode(state.authMode === 'register' ? 'register' : 'login');

        if (state.view === 'product-detail' && state.productId) {
          const product = productsRef.current.find((item) => item.id === String(state.productId));
          setViewingProduct(product ?? null);
          setCurrentView(product ? 'product-detail' : 'home');
        } else {
          setViewingProduct(null);
          setCurrentView(state.view || 'home');
        }

        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        return;
      }

      // If the user reaches a history entry from before the app was opened,
      // keep navigation inside the site when currently viewing another page.
      if (currentViewRef.current !== 'home') {
        handlingPopStateRef.current = true;
        setViewingProduct(null);
        setShopCategory(null);
        setCurrentView('home');
        window.history.pushState(initialState, '', window.location.href);
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
    // The listener intentionally stays attached while this page is mounted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !historyReadyRef.current) return;

    if (skipNextHistoryPushRef.current) {
      skipNextHistoryPushRef.current = false;
      return;
    }

    if (handlingPopStateRef.current) {
      handlingPopStateRef.current = false;
      return;
    }

    const state = {
      __falBazar: true,
      view: currentView,
      shopCategory,
      productId: currentView === 'product-detail' ? viewingProduct?.id ?? null : null,
      authMode: authInitialMode,
    };

    window.history.pushState(state, '', window.location.href);
  }, [currentView, shopCategory, viewingProduct?.id, authInitialMode]);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [addCartProduct, setAddCartProduct] = useState<Product | null>(null);
  const [isAddCartModalOpen, setIsAddCartModalOpen] = useState(false);

  // Modal states
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderModalQuantity, setOrderModalQuantity] = useState<number>(1);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [isComplaintOpen, setIsComplaintOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderId: string;
    items: { title: string; price: number; quantity: number }[];
    name: string;
    phone: string;
    address: string;
    deliveryArea: string;
    deliveryFee: number;
    subtotal: number;
    grandTotal: number;
  } | null>(null);

  // Navigate to Product Details
  const handleViewProductDetails = (product: Product) => {
    setViewingProduct(product);
    setCurrentView('product-detail');
    // Product details should appear as a fresh page from the very top,
    // without a visible smooth scroll animation from the previous section.
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  };

  // Add to cart with support for optional quantity and variant
  const handleAddToCart = (product: Product, quantity = 1, variant?: string) => {
    const numericPrice = parseInt(product.price.replace(/[^0-9]/g, ''), 10) || 0;
    const numericOldPrice = product.oldPrice
      ? parseInt(product.oldPrice.replace(/[^0-9]/g, ''), 10)
      : null;

    // A product + package size is one cart line. Always use a stable key so
    // adding 2/3/4 units from the product-details page increments that exact
    // line instead of creating a second line or losing the selected quantity.
    const normalizedVariant = variant || '১ কেজি';
    let itemPrice = numericPrice;
    if (normalizedVariant === '৫০০ গ্রাম') itemPrice = Math.round(numericPrice * 0.5);
    else if (normalizedVariant === '২ কেজি') itemPrice = Math.round(numericPrice * 2.0);
    const titleWithVariant = `${product.title} (${normalizedVariant})`;
    const cartItemId = `${product.id}::${normalizedVariant}`;
    const safeQuantity = Math.max(1, Math.min(50, Number(quantity) || 1));

    setCart((prev) => {
      const existing = prev.find((item) => {
        const itemProductId = item.productId || item.id.split('::')[0] || item.id;
        const itemVariant = item.variant || (item.id.includes('::') ? item.id.split('::').slice(1).join('::') : '১ কেজি');
        return itemProductId === product.id && itemVariant === normalizedVariant;
      });

      if (existing) {
        return prev.map((item) =>
          item.id === existing.id
            ? {
                ...item,
                productId: product.id,
                id: cartItemId,
                title: titleWithVariant,
                image: product.image,
                price: itemPrice,
                oldPrice: numericOldPrice,
                basePrice: numericPrice,
                baseOldPrice: numericOldPrice,
                variant: normalizedVariant,
                quantity: Math.min(50, item.quantity + safeQuantity),
              }
            : item
        );
      }

      return [
        ...prev,
        {
          productId: product.id,
          id: cartItemId,
          title: titleWithVariant,
          image: product.image,
          price: itemPrice,
          oldPrice: numericOldPrice,
          quantity: safeQuantity,
          basePrice: numericPrice,
          baseOldPrice: numericOldPrice,
          variant: normalizedVariant,
        },
      ];
    });

    // Show toast
    setToastMessage(`"${titleWithVariant}" সফলভাবে কার্টে যোগ করা হয়েছে!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Product-card add-to-cart behavior: desktop opens the selection modal;
  // mobile adds directly so the mobile cart/checkout remains uninterrupted.
  const handleProductAddToCart = (product: Product) => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setAddCartProduct(product);
      setIsAddCartModalOpen(true);
      return;
    }
    handleAddToCart(product);
  };

  // Update cart qty
  const handleUpdateCartQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Change package size/variant from cart without losing the selected product.
  const handleChangeCartVariant = (id: string, variant: string) => {
    const normalizedVariant = variant || '১ কেজি';
    setCart((prev) => {
      const current = prev.find((item) => item.id === id);
      if (!current) return prev;

      const productId = current.productId || current.id.split('::')[0] || current.id;
      const nextId = `${productId}::${normalizedVariant}`;
      const basePrice = current.basePrice ?? current.price;
      const baseOldPrice = current.baseOldPrice ?? current.oldPrice ?? null;
      const multiplier = normalizedVariant === '৫০০ গ্রাম' ? 0.5 : normalizedVariant === '২ কেজি' ? 2 : 1;
      const baseTitle = current.title.replace(/ \(১ কেজি\)| \(২ কেজি\)| \(৫০০ গ্রাম\)/g, '');
      const duplicate = prev.find((item) => item.id === nextId && item.id !== id);

      return prev
        .filter((item) => item.id !== id)
        .map((item) => item.id === duplicate?.id
          ? { ...item, quantity: Math.min(50, item.quantity + current.quantity) }
          : item)
        .concat(duplicate ? [] : [{
          ...current,
          productId,
          id: nextId,
          title: `${baseTitle} (${normalizedVariant})`,
          price: Math.round(basePrice * multiplier),
          oldPrice: baseOldPrice == null ? null : Math.round(baseOldPrice * multiplier),
          basePrice,
          baseOldPrice,
          variant: normalizedVariant,
        }]);
    });
  };

  // Remove from cart
  const handleRemoveFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Open Order View for single product (with optional quantity and variant)
  const handleOrderProduct = (product: Product, quantity = 1, variant?: string) => {
    handleAddToCart(product, quantity, variant);
    setCurrentView('cart');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Order Page for cart or general
  const handleOpenOrderModal = (product?: Product | null) => {
    if (product) {
      handleAddToCart(product, 1);
    }
    setCurrentView('cart');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Order Confirmed handler
  const handleOrderSuccess = (orderData: {
    orderId: string;
    items: { title: string; price: number; quantity: number }[];
    name: string;
    phone: string;
    address: string;
    deliveryArea: string;
    deliveryFee: number;
    subtotal: number;
    grandTotal: number;
  }) => {
    setConfirmedOrder(orderData);
    setCart([]);
    setSelectedProduct(null);
    setIsOrderModalOpen(false);
  };

  // Auth Handlers
  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthInitialMode(mode);
    setCurrentView('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      sessionStorage.setItem('falbazar_user', JSON.stringify(user));
    } catch {
      // Ignore
    }
    setToastMessage(`স্বাগতম, ${user.name}!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleLogout = () => {
    const token = getStoredAccessToken();
    if (token) void supabaseSignOut(token);
    setCurrentUser(null);
    try {
      clearAuthSession();
    } catch {
      // Ignore
    }
    setToastMessage('সফলভাবে লগআউট করা হয়েছে।');
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="site-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. Notice Ticker */}
      <NoticeTicker />

      {/* 2. Site Header */}
      <SiteHeader
        cart={cart}
        onUpdateCartQty={handleUpdateCartQty}
        onRemoveFromCart={handleRemoveFromCart}
        onOpenOrderModal={handleOpenOrderModal}
        onOpenCartPage={() => {
          setCurrentView('cart');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenTrackModal={() => { setIsTrackModalOpen(false); setCurrentView('track'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        onOpenComplaintModal={() => { setIsComplaintOpen(false); setCurrentView('complaint'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        allProducts={allProductsList}
        onNavigateToHome={() => {
          setCurrentView('home');
          setShopCategory(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateToShop={(catSlug) => {
          setShopCategory(catSlug || null);
          setCurrentView('shop');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onViewProductDetails={handleViewProductDetails}
        onOpenAuth={handleOpenAuth}
        currentUser={currentUser}
      />

      {/* 3. Mobile Category Scroll (Only on Home view, ShopView has its own pills) */}
      {currentView === 'home' && (
        <MobileCategoryScroll
          activeCategory={shopCategory}
          onSelectCategory={(slug) => {
            setShopCategory(slug);
            setCurrentView('shop');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* Main Content Area */}
      <main className="app-main" style={{ flex: 1 }}>
        {currentView === 'cart' ? (
          /* Dedicated Cart & Order Checkout View matching Screenshots 1-4 */
          <CartOrderView
            cartItems={cart}
            onUpdateQty={handleUpdateCartQty}
            onRemoveItem={handleRemoveFromCart}
            onChangeVariant={handleChangeCartVariant}
            onNavigateToShop={() => {
              setCurrentView('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOrderSuccess={handleOrderSuccess}
            currentUser={currentUser}
          />
        ) : currentView === 'track' ? (
          <OrderTrackView
            onBack={() => {
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : currentView === 'complaint' ? (
          <ComplaintView
            onBack={() => {
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : currentView === 'auth' ? (
          /* Dedicated Login / Register View matching Screenshots 1, 2, 3 */
          <AuthView
            key={authInitialMode}
            initialMode={authInitialMode}
            currentUser={currentUser}
            onLoginSuccess={handleLoginSuccess}
            onLogout={handleLogout}
            onNavigateToShop={() => {
              setCurrentView('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenTrackModal={() => { setIsTrackModalOpen(false); setCurrentView('track'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          />
        ) : currentView === 'product-detail' && viewingProduct ? (
          /* Dedicated Product Details Page matching Screenshots 1-5 */
          <ProductDetailsView
            product={viewingProduct}
            onBackToHome={() => {
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToCategory={(catSlug) => {
              setShopCategory(catSlug);
              setCurrentView('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onViewProductDetails={handleViewProductDetails}
            onAddToCart={handleProductAddToCart}
            onOrderProduct={handleOrderProduct}
          />
        ) : currentView === 'shop' ? (
          /* Dedicated Shop Page View with Filtering & Sorting */
          <ShopView
            key={`shop-${shopCategory || 'all'}`}
            onOrderProduct={handleOrderProduct}
            onAddToCart={handleProductAddToCart}
            initialCategory={shopCategory}
            onCategoryChange={(categorySlug) => setShopCategory(categorySlug)}
            onBackToHome={() => {
              setCurrentView('home');
              setShopCategory(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onViewDetails={handleViewProductDetails}
          />
        ) : (
          /* Home Page Sections */
          siteLoading ? (
            <HomeLoadingSkeleton />
          ) : (
            <>
            {/* 4. Hero Slider */}
            <HeroSlider />

            {/* 5. Flash Sale Section */}
            <FlashSaleSection
              onOrderProduct={handleOrderProduct}
              onAddToCart={handleProductAddToCart}
              onViewDetails={handleViewProductDetails}
            />

            {/* 6. Promo Banner 1 */}
            {promoBanners[0] && <PromoSection image={promoBanners[0].image} widthPercent={promoBanners[0].widthPercent} heightPx={promoBanners[0].heightPx} linkUrl={promoBanners[0].linkUrl} />}

            {/* 7. Hot Deal Section */}
            <HotDealSection
              onOrderProduct={handleOrderProduct}
              onAddToCart={handleProductAddToCart}
              onViewDetails={handleViewProductDetails}
            />

            {/* 8. Promo Banner 2 */}
            {promoBanners[1] && <PromoSection image={promoBanners[1].image} widthPercent={promoBanners[1].widthPercent} heightPx={promoBanners[1].heightPx} linkUrl={promoBanners[1].linkUrl} />}

            {/* 9. দিনাজপুর লিচু Section */}
            <CategorySection
              id="dinajpur-licu"
              title="দিনাজপুর লিচু"
              products={dinajpurProducts}
              onOrderProduct={handleOrderProduct}
              onAddToCart={handleProductAddToCart}
              onViewDetails={handleViewProductDetails}
            />

            {/* 10. প্রিমিয়াম লিচু Section */}
            <CategorySection
              id="premium-licu"
              title="প্রিমিয়াম লিচু"
              products={premiumProducts}
              onOrderProduct={handleOrderProduct}
              onAddToCart={handleProductAddToCart}
              onViewDetails={handleViewProductDetails}
            />

            {/* 11. Promo Banner 3 */}
            {promoBanners[2] && <PromoSection image={promoBanners[2].image} widthPercent={promoBanners[2].widthPercent} heightPx={promoBanners[2].heightPx} linkUrl={promoBanners[2].linkUrl} />}

            {/* 12. সকল প্রোডাক্ট Section */}
            <AllProductsSection
              onOrderProduct={handleOrderProduct}
              onAddToCart={handleProductAddToCart}
              onViewDetails={handleViewProductDetails}
            />

            {/* 13. Promo Banner 4 */}
            {promoBanners[3] && <PromoSection image={promoBanners[3].image} widthPercent={promoBanners[3].widthPercent} heightPx={promoBanners[3].heightPx} linkUrl={promoBanners[3].linkUrl} />}
            </>
          )
        )}
      </main>

      {/* 14. Features Bar */}
      <FeaturesBar />

      {/* 15. Site Footer */}
      <SiteFooter
        onOpenTrackModal={() => { setIsTrackModalOpen(false); setCurrentView('track'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        onOpenComplaintModal={() => { setIsComplaintOpen(false); setCurrentView('complaint'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
      />

      {/* 16. Quick Order & Checkout Modal */}
      <VomOrderModal
        key={isOrderModalOpen ? `${selectedProduct?.id || 'cart'}-${orderModalQuantity}` : 'closed'}
        isOpen={isOrderModalOpen}
        product={selectedProduct}
        cartItems={cart}
        initialQuantity={orderModalQuantity}
        onClose={() => setIsOrderModalOpen(false)}
        onSuccess={handleOrderSuccess}
      />

      <AddToCartModal
        isOpen={isAddCartModalOpen}
        product={addCartProduct}
        onClose={() => {
          setIsAddCartModalOpen(false);
          setAddCartProduct(null);
        }}
        onConfirm={(product, quantity, variant) => handleAddToCart(product, quantity, variant)}
      />

      {/* 17. Order Success Confirmation Modal */}
      <OrderSuccessModal order={confirmedOrder} onClose={() => setConfirmedOrder(null)} />

      {/* 18. Order Track Modal */}


      {/* 21. Promo Modal Popup on first load */}
      <PromoPopup />

      {/* 22. Floating customer chat, matching the reference home screen */}
      <GccLiveChat
        onOpenTrackModal={() => { setCurrentView('track'); window.scrollTo({ top: 0, behavior: 'auto' }); }}
        onOrderProduct={handleOrderProduct}
        allProducts={allProductsList}
        externalOpenComplaint={false}
      />

      {/* 22. Mobile Bottom Navigation */}
      <MobileBottomNav
          cartCount={totalCartCount}
          activeTab={currentView}
          onOpenCart={() => {
            setCurrentView('cart');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenLogin={() => handleOpenAuth('login')}
          onNavigate={(tab) => {
            setCurrentView(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
      />

      {/* 23. Toast notification */}
      <CartToast message={toastMessage} />
    </div>
  );
}
