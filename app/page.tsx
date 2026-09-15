'use client';

import React, { useState } from 'react';
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
import OrderTrackModal from '@/components/OrderTrackModal';
import PromoPopup from '@/components/PromoPopup';
import GccLiveChat from '@/components/GccLiveChat';
import MobileBottomNav from '@/components/MobileBottomNav';
import CartToast from '@/components/CartToast';
import ShopView from '@/components/ShopView';
import ProductDetailsView from '@/components/ProductDetailsView';
import AuthView, { UserProfile } from '@/components/AuthView';
import CartOrderView from '@/components/CartOrderView';

import {
  Product,
  CartItem,
  promoBanners,
  dinajpurProducts,
  premiumProducts,
  allProductsList,
} from '@/lib/data';

export default function HomePage() {
  // Navigation view state: 'home' | 'shop' | 'product-detail' | 'auth' | 'cart'
  const [currentView, setCurrentView] = useState<'home' | 'shop' | 'product-detail' | 'auth' | 'cart'>('home');
  const [shopCategory, setShopCategory] = useState<string | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  // Authentication state
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('falbazar_user');
        return savedUser ? (JSON.parse(savedUser) as UserProfile) : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add to cart with support for optional quantity and variant
  const handleAddToCart = (product: Product, quantity = 1, variant?: string) => {
    const numericPrice = parseInt(product.price.replace(/[^0-9]/g, ''), 10) || 0;
    const numericOldPrice = product.oldPrice
      ? parseInt(product.oldPrice.replace(/[^0-9]/g, ''), 10)
      : null;

    let itemPrice = numericPrice;
    let titleWithVariant = product.title;
    if (variant) {
      if (variant === '৫০০ গ্রাম') itemPrice = Math.round(numericPrice * 0.5);
      else if (variant === '২ কেজি') itemPrice = Math.round(numericPrice * 2.0);
      titleWithVariant = `${product.title} (${variant})`;
    }

    setCart((prev) => {
      const cartItemId = variant ? `${product.id}-${variant}` : product.id;
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        return [
          ...prev,
          {
            id: cartItemId,
            title: titleWithVariant,
            image: product.image,
            price: itemPrice,
            oldPrice: numericOldPrice,
            quantity: quantity,
          },
        ];
      }
    });

    // Show toast
    setToastMessage(`"${titleWithVariant}" সফলভাবে কার্টে যোগ করা হয়েছে!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
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
      localStorage.setItem('falbazar_user', JSON.stringify(user));
    } catch {
      // Ignore
    }
    setToastMessage(`স্বাগতম, ${user.name}!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('falbazar_user');
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
        onOpenTrackModal={() => setIsTrackModalOpen(true)}
        onOpenComplaintModal={() => setIsComplaintOpen(true)}
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
            onNavigateToShop={() => {
              setCurrentView('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOrderSuccess={handleOrderSuccess}
            currentUser={currentUser}
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
            onOpenTrackModal={() => setIsTrackModalOpen(true)}
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
            onAddToCart={handleAddToCart}
            onOrderProduct={handleOrderProduct}
          />
        ) : currentView === 'shop' ? (
          /* Dedicated Shop Page View with Filtering & Sorting */
          <ShopView
            onOrderProduct={handleOrderProduct}
            onAddToCart={handleAddToCart}
            initialCategory={shopCategory}
            onBackToHome={() => {
              setCurrentView('home');
              setShopCategory(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onViewDetails={handleViewProductDetails}
          />
        ) : (
          /* Home Page Sections */
          <>
            {/* 4. Hero Slider */}
            <HeroSlider />

            {/* 5. Flash Sale Section */}
            <FlashSaleSection
              onOrderProduct={handleOrderProduct}
              onAddToCart={handleAddToCart}
              onViewDetails={handleViewProductDetails}
            />

            {/* 6. Promo Banner 1 */}
            <PromoSection image={promoBanners[0]} />

            {/* 7. Hot Deal Section */}
            <HotDealSection
              onOrderProduct={handleOrderProduct}
              onAddToCart={handleAddToCart}
              onViewDetails={handleViewProductDetails}
            />

            {/* 8. Promo Banner 2 */}
            <PromoSection image={promoBanners[1]} />

            {/* 9. দিনাজপুর লিচু Section */}
            <CategorySection
              id="dinajpur-licu"
              title="দিনাজপুর লিচু"
              products={dinajpurProducts}
              onOrderProduct={handleOrderProduct}
              onAddToCart={handleAddToCart}
              onViewDetails={handleViewProductDetails}
            />

            {/* 10. প্রিমিয়াম লিচু Section */}
            <CategorySection
              id="premium-licu"
              title="প্রিমিয়াম লিচু"
              products={premiumProducts}
              onOrderProduct={handleOrderProduct}
              onAddToCart={handleAddToCart}
              onViewDetails={handleViewProductDetails}
            />

            {/* 11. Promo Banner 3 */}
            <PromoSection image={promoBanners[2]} />

            {/* 12. সকল প্রোডাক্ট Section */}
            <AllProductsSection
              onOrderProduct={handleOrderProduct}
              onAddToCart={handleAddToCart}
              onViewDetails={handleViewProductDetails}
            />

            {/* 13. Promo Banner 4 */}
            <PromoSection image={promoBanners[3]} />
          </>
        )}
      </main>

      {/* 14. Features Bar */}
      <FeaturesBar />

      {/* 15. Site Footer */}
      <SiteFooter
        onOpenTrackModal={() => setIsTrackModalOpen(true)}
        onOpenComplaintModal={() => setIsComplaintOpen(true)}
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

      {/* 17. Order Success Confirmation Modal */}
      <OrderSuccessModal order={confirmedOrder} onClose={() => setConfirmedOrder(null)} />

      {/* 18. Order Track Modal */}
      <OrderTrackModal isOpen={isTrackModalOpen} onClose={() => setIsTrackModalOpen(false)} />

      {/* 19. Live Shopping Assistant & Complaint Widget */}
      <GccLiveChat
        onOpenTrackModal={() => setIsTrackModalOpen(true)}
        onOrderProduct={handleOrderProduct}
        allProducts={allProductsList}
        externalOpenComplaint={isComplaintOpen}
        onCloseComplaint={() => setIsComplaintOpen(false)}
      />

      {/* 21. Promo Modal Popup on first load */}
      <PromoPopup />

      {/* 22. Mobile Bottom Navigation (Hidden on Cart/Checkout page for sticky order action) */}
      {currentView !== 'cart' && (
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
      )}

      {/* 23. Toast notification */}
      <CartToast message={toastMessage} />
    </div>
  );
}
