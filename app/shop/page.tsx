'use client';

import React, { useEffect, useState } from 'react';
import NoticeTicker from '@/components/NoticeTicker';
import SiteHeader from '@/components/SiteHeader';
import ShopView from '@/components/ShopView';
import FeaturesBar from '@/components/FeaturesBar';
import SiteFooter from '@/components/SiteFooter';
import VomOrderModal from '@/components/VomOrderModal';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import OrderTrackModal from '@/components/OrderTrackModal';
import MobileBottomNav from '@/components/MobileBottomNav';
import CartToast from '@/components/CartToast';

import { Product, CartItem } from '@/lib/data';
import { useSiteData } from '@/lib/site-data';

export default function ShopPage() {
  const { products: allProductsList } = useSiteData();
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('falbazar_cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) setCart(parsed as CartItem[]);
      }
    } catch {
      // Ignore malformed local cart data.
    } finally {
      setCartHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!cartHydrated) return;
    try {
      localStorage.setItem('falbazar_cart', JSON.stringify(cart));
    } catch {
      // Storage may be unavailable; cart still works in memory.
    }
  }, [cart, cartHydrated]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal states
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
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

  // Add to cart
  const handleAddToCart = (product: Product, quantity = 1, variant?: string) => {
    const numericPrice = parseInt(product.price.replace(/[^0-9]/g, ''), 10) || 0;
    const numericOldPrice = product.oldPrice
      ? parseInt(product.oldPrice.replace(/[^0-9]/g, ''), 10)
      : null;

    const multiplier = variant === '৫০০ গ্রাম' ? 0.5 : variant === '২ কেজি' ? 2 : 1;
    const itemPrice = Math.round(numericPrice * multiplier);
    const itemOldPrice = numericOldPrice == null ? null : Math.round(numericOldPrice * multiplier);
    const normalizedVariant = variant || '১ কেজি';
    const itemId = `${product.id}::${normalizedVariant}`;
    const itemTitle = `${product.title} (${normalizedVariant})`;

    const safeQuantity = Math.max(1, Math.min(50, Number(quantity) || 1));

    setCart((prev) => {
      const existing = prev.find((item) => {
        const itemProductId = item.productId || item.id.split('::')[0] || item.id;
        const itemVariant = item.variant || (item.id.includes('::') ? item.id.split('::').slice(1).join('::') : '১ কেজি');
        return itemProductId === product.id && itemVariant === normalizedVariant;
      });
      if (existing) {
        return prev.map((item) =>
          item.id === existing.id ? { ...item, id: itemId, productId: product.id, title: itemTitle, image: product.image, price: itemPrice, oldPrice: itemOldPrice, basePrice: numericPrice, baseOldPrice: numericOldPrice, variant: normalizedVariant, quantity: Math.min(50, item.quantity + safeQuantity) } : item
        );
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            id: itemId,
            title: itemTitle,
            image: product.image,
            price: itemPrice,
            oldPrice: itemOldPrice,
            quantity: safeQuantity,
            basePrice: numericPrice,
            baseOldPrice: numericOldPrice,
            variant: normalizedVariant,
          },
        ];
      }
    });

    setToastMessage(`"${itemTitle}" সফলভাবে কার্টে যোগ করা হয়েছে!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Product cards add directly to the cart on every device.
  // Package-size selection remains available from the product-details page.
  const handleProductAddToCart = (product: Product, quantity = 1, variant = '১ কেজি') => {
    handleAddToCart(product, quantity, variant);
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

  // Open Order Modal for single product
  const handleOrderProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsOrderModalOpen(true);
  };

  // Open Order Modal for whole cart or general
  const handleOpenOrderModal = (product?: Product | null) => {
    setSelectedProduct(product || null);
    setIsOrderModalOpen(true);
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
    if (!selectedProduct) {
      setCart([]);
    }
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
        onOpenTrackModal={() => setIsTrackModalOpen(true)}
        onOpenComplaintModal={() => setIsComplaintOpen(true)}
        allProducts={allProductsList}
        onNavigateToHome={() => { window.location.href = '/'; }}
      />

      {/* 3. Main Shop View with Filter & Sort System */}
      <main className="app-main" style={{ flex: 1 }}>
        <ShopView
          onOrderProduct={handleOrderProduct}
          onAddToCart={handleProductAddToCart}
          onBackToHome={() => { window.location.href = '/'; }}
        />
      </main>

      {/* 4. Features Bar */}
      <FeaturesBar />

      {/* 5. Site Footer */}
      <SiteFooter
        onOpenTrackModal={() => setIsTrackModalOpen(true)}
        onOpenComplaintModal={() => setIsComplaintOpen(true)}
      />

      {/* 6. Quick Order & Checkout Modal */}
      <VomOrderModal
        isOpen={isOrderModalOpen}
        product={selectedProduct}
        cartItems={cart}
        onClose={() => setIsOrderModalOpen(false)}
        onSuccess={handleOrderSuccess}
      />

      {/* 7. Order Success Confirmation Modal */}
      <OrderSuccessModal order={confirmedOrder} onClose={() => setConfirmedOrder(null)} />

      {/* 8. Order Track Modal */}
      <OrderTrackModal isOpen={isTrackModalOpen} onClose={() => setIsTrackModalOpen(false)} />


      {/* 10. Mobile Bottom Navigation */}
      <MobileBottomNav
        cartCount={totalCartCount}
        activeTab="shop"
        onOpenCart={() => handleOpenOrderModal(null)}
        onOpenLogin={() => {
          window.location.href = '/?auth=login';
        }}
        onNavigate={(tab) => {
          if (tab === 'home') {
            window.location.href = '/';
          }
        }}
      />

      {/* 11. Toast notification */}
      <CartToast message={toastMessage} />
    </div>
  );
}
