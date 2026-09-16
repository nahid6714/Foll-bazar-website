import { supabaseRest } from '@/lib/supabase';

export type CreateOrderItem = {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  variant?: string;
};

export type CreateOrderInput = {
  orderNumber: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  note?: string;
  shippingMethod: 'dhaka' | 'outside';
  paymentMethod: string;
  paymentTitle: string;
  senderPhone?: string;
  trxId?: string;
  couponCode?: string;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  grandTotal: number;
  items: CreateOrderItem[];
  userId?: string | null;
};

export async function createOrderInSupabase(input: CreateOrderInput) {
  return supabaseRest<{ order_id: string; order_number: string }>('rpc/create_public_order', {
    method: 'POST',
    body: JSON.stringify({
      order_number: input.orderNumber,
      customer_name: input.name,
      customer_phone: input.phone,
      customer_email: input.email || null,
      address: input.address,
      order_note: input.note || null,
      shipping_method: input.shippingMethod,
      payment_method: input.paymentMethod,
      payment_title: input.paymentTitle,
      sender_phone: input.senderPhone || null,
      trx_id: input.trxId || null,
      coupon_code: input.couponCode || null,
      subtotal: input.subtotal,
      discount_amount: input.discount,
      delivery_charge: input.deliveryFee,
      total_amount: input.grandTotal,
      user_id: input.userId || null,
      items: input.items.map((item) => ({
        product_id: item.productId,
        product_name: item.title,
        variant_label: item.variant || null,
        unit_price: item.price,
        quantity: item.quantity,
      })),
    }),
  });
}
