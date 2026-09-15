'use client';

import React, { useState } from 'react';
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
import AddToCartModal from '@/components/AddToCartModal';

import { Product, CartItem } from '@/lib/data';
import { useSiteData } from '@/lib/site-data';

export default function ShopPage() {
  const { products: allProductsList } = useSiteData();
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [addCartProduct, setAddCartProduct] = useState<Product | null>(null);
  const [isAddCartModalOpen, setIsAddCartModalOpen] = useState(false);

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
    const itemId = variant ? `${product.id}-${variant}` : product.id;
    const itemTitle = variant ? `${product.title} (${variant})` : product.title;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        return prev.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        return [
          ...prev,
          {
            id: itemId,
            title: itemTitle,
            image: product.image,
            price: itemPrice,
            oldPrice: itemOldPrice,
            quantity,
            basePrice: numericPrice,
            baseOldPrice: numericOldPrice,
            variant,
          },
        ];
      }
    });

    setToastMessage(`"${itemTitle}" সফলভাবে কার্টে যোগ করা হয়েছে!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Desktop: show the product-selection modal. Mobile: add immediately.
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

      <AddToCartModal
        isOpen={isAddCartModalOpen}
        product={addCartProduct}
        onClose={() => {
          setIsAddCartModalOpen(false);
          setAddCartProduct(null);
        }}
        onConfirm={(product, quantity, variant) => handleAddToCart(product, quantity, variant)}
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
        onOpenLogin={() => alert('অতিথি হিসেবে আপনি সরাসরি অর্ডার করতে পারেন!')}
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
