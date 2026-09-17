import type { Product } from '@/lib/data';
import type { OrderSubmittedData } from '@/components/CartOrderView';
import { supabaseRest } from '@/lib/supabase';

export interface SavedOrder {
  id: string;
  orderNumber: string;
}

function cleanPhone(value: string) {
  return value.trim().replace(/[^0-9+]/g, '');
}

/** Compatibility helper for older checkout imports. Uses the same RPC
 * contract as lib/order-service.ts so two order paths cannot drift apart. */
export async function createOrderInSupabase(
  order: OrderSubmittedData,
  currentUser: { name: string; phone: string; email?: string } | null,
  products: Product[],
): Promise<SavedOrder> {
  if (!order.items.length) throw new Error('অর্ডারে কোনো পণ্য নেই।');

  const items = order.items.map((item) => {
    const productId = item.productId;
    const product = productId
      ? products.find((p) => p.id === productId)
      : products.find((p) => p.title === item.title || item.title.startsWith(`${p.title} (`));

    if (!product?.id) throw new Error(`পণ্যটি খুঁজে পাওয়া যায়নি: ${item.title}`);

    return {
      product_id: product.id,
      product_name: item.title,
      variant_label: item.variant ?? null,
      unit_price: Number(item.price),
      quantity: Number(item.quantity),
    };
  });

  const paymentMethod = order.paymentMethod === 'cash' ? 'cod' : order.paymentMethod;
  const response = await supabaseRest<{ order_id: string; order_number: string }>(
    'rpc/create_public_order',
    {
      method: 'POST',
      body: JSON.stringify({
        payload: {
          order_number: order.orderId,
          customer_name: order.name.trim(),
          customer_phone: cleanPhone(order.phone),
          customer_email: currentUser?.email ?? order.email ?? null,
          address: order.address.trim(),
          division: order.division ?? null,
          district: order.district ?? null,
          upazila: order.upazila ?? null,
          delivery_note: null,
          order_note: order.note ?? null,
          shipping_method: order.deliveryArea === 'ঢাকার বাইরে' ? 'outside' : 'dhaka',
          payment_method: paymentMethod,
          payment_title: order.paymentTitle,
          sender_phone: order.senderPhone ? cleanPhone(order.senderPhone) : null,
          trx_id: order.trxId ?? null,
          coupon_code: order.couponCode ?? null,
          subtotal: Number(order.subtotal),
          discount_amount: Number(order.discount),
          delivery_charge: Number(order.deliveryFee),
          total_amount: Number(order.grandTotal),
          user_id: null,
          items,
        },
      }),
    },
  );

  return { id: response.order_id, orderNumber: response.order_number };
}

export type PublicTrackedOrder = {
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
};

export async function trackPublicOrder(input: { orderNumber?: string; phone?: string }) {
  const response = await supabaseRest<PublicTrackedOrder | null>('rpc/track_public_order', {
    method: 'POST',
    body: JSON.stringify({
      p_order_number: input.orderNumber?.trim() || null,
      p_phone: input.phone?.trim() || null,
    }),
  });
  return response;
}
