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
  division?: string;
  district?: string;
  upazila?: string;
  deliveryNote?: string;
  note?: string;
  shippingMethod: 'dhaka' | 'outside';
  paymentMethod: string;
  paymentTitle: string;
  senderPhone?: string;
  trxId?: string;
  couponCode?: string;
  subtotal?: number;
  discount?: number;
  deliveryFee?: number;
  grandTotal?: number;
  items: CreateOrderItem[];
  userId?: string | null;
};

/**
 * Creates an order through the single public RPC defined in
 * supabase/ORDER_SETUP.sql. Keeping the client payload and SQL function
 * signature aligned prevents silent checkout failures after deployment.
 */
export async function createOrderInSupabase(input: CreateOrderInput) {
  if (!input.items.length) {
    throw new Error('অর্ডারে কোনো পণ্য নেই।');
  }

  const paymentMethod = input.paymentMethod === 'cash' ? 'cod' : input.paymentMethod;

  const payload = {
    order_number: input.orderNumber,
    customer_name: input.name.trim(),
    customer_phone: input.phone.trim().replace(/[^0-9+]/g, ''),
    customer_email: input.email?.trim() || null,
    address: input.address.trim(),
    division: input.division?.trim() || null,
    district: input.district?.trim() || null,
    upazila: input.upazila?.trim() || null,
    delivery_note: input.deliveryNote?.trim() || null,
    order_note: input.note?.trim() || null,
    shipping_method: input.shippingMethod,
    payment_method: paymentMethod,
    payment_title: input.paymentTitle,
    sender_phone: input.senderPhone?.trim().replace(/[^0-9+]/g, '') || null,
    trx_id: input.trxId?.trim() || null,
    coupon_code: input.couponCode?.trim().toUpperCase() || null,
    // These totals are retained for backward compatibility only. The secure
    // RPC recalculates subtotal, discount, delivery and total from DB data.
    subtotal: Number(input.subtotal ?? 0),
    discount_amount: Number(input.discount ?? 0),
    delivery_charge: Number(input.deliveryFee ?? 0),
    total_amount: Number(input.grandTotal ?? 0),
    items: input.items.map((item) => ({
      product_id: item.productId,
      product_name: item.title,
      variant_label: item.variant || null,
      unit_price: Number(item.price),
      quantity: Number(item.quantity),
    })),
  };

  return supabaseRest<{ order_id: string; order_number: string; subtotal: number; discount_amount: number; delivery_charge: number; total_amount: number }>(
    'rpc/create_public_order',
    {
      method: 'POST',
      body: JSON.stringify({ payload }),
    },
  );
}
