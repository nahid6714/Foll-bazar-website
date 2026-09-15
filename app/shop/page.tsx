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
import GccLiveChat from '@/components/GccLiveChat';
import MobileBottomNav from '@/components/MobileBottomNav';
import CartToast from '@/components/CartToast';

import {
  Product,
  CartItem,
  allProductsList,
} from '@/lib/data';

export default function ShopPage() {
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
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
  const handleAddToCart = (product: Product) => {
    const numericPrice = parseInt(product.price.replace(/[^0-9]/g, ''), 10) || 0;
    const numericOldPrice = product.oldPrice
      ? parseInt(product.oldPrice.replace(/[^0-9]/g, ''), 10)
      : null;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [
          ...prev,
          {
            id: product.id,
            title: product.title,
            image: product.image,
            price: numericPrice,
            oldPrice: numericOldPrice,
            quantity: 1,
          },
        ];
      }
    });

    setToastMessage(`"${product.title}" সফলভাবে কার্টে যোগ করা হয়েছে!`);
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
          onAddToCart={handleAddToCart}
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

      {/* 9. Live Shopping Assistant & Complaint Widget */}
      <GccLiveChat
        onOpenTrackModal={() => setIsTrackModalOpen(true)}
        onOrderProduct={handleOrderProduct}
        allProducts={allProductsList}
        externalOpenComplaint={isComplaintOpen}
        onCloseComplaint={() => setIsComplaintOpen(false)}
      />

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
