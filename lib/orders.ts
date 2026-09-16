import { supabaseRest } from '@/lib/supabase';
import type { Product } from '@/lib/data';
import type { OrderSubmittedData } from '@/components/CartOrderView';

export interface SavedOrder {
  id: string;
  orderNumber: string;
}

function cleanPhone(value: string) {
  return value.trim().replace(/[^0-9+]/g, '');
}

export async function createOrderInSupabase(
  order: OrderSubmittedData,
  currentUser: { name: string; phone: string; email?: string } | null,
  products: Product[],
): Promise<SavedOrder> {
  if (!order.items.length) throw new Error('অর্ডারে কোনো পণ্য নেই।');

  const items = order.items.map((item) => {
    const product = item.productId
      ? products.find((p) => p.id === item.productId)
      : products.find((p) => p.title === item.title || item.title.startsWith(`${p.title} (`));

    if (!product?.id) throw new Error(`পণ্যটি খুঁজে পাওয়া যায়নি: ${item.title}`);

    return {
      product_id: product.id,
      variant_label: item.variant ?? null,
      product_name: item.title,
      quantity: Number(item.quantity),
    };
  });

  const paymentMethod = order.paymentMethod === 'cash' ? 'cod' : order.paymentMethod;
  const payload = {
    order_number: order.orderId,
    customer_name: order.name.trim(),
    customer_phone: cleanPhone(order.phone),
    customer_email: currentUser?.email ?? null,
    address: order.address.trim(),
    division: order.division ?? null,
    district: order.district ?? null,
    upazila: order.upazila ?? null,
    shipping_area: order.deliveryArea,
    delivery_note: order.note ?? null,
    subtotal: Number(order.subtotal),
    delivery_charge: Number(order.deliveryFee),
    discount_amount: Number(order.discount),
    coupon_code: order.couponCode ?? null,
    total_amount: Number(order.grandTotal),
    payment_method: paymentMethod,
    payment_trx_id: order.trxId ?? null,
    payment_sender_phone: order.senderPhone ? cleanPhone(order.senderPhone) : null,
    order_note: order.note ?? null,
  };

  const response = await supabaseRest<SavedOrder[]>('rpc/create_public_order', {
    method: 'POST',
    body: JSON.stringify({ p_order: payload, p_items: items }),
  });

  const saved = response?.[0];
  if (!saved?.id || !saved?.orderNumber) {
    throw new Error('Supabase অর্ডার তৈরি করেছে, কিন্তু Order ID ফেরত দেয়নি।');
  }
  return saved;
}
