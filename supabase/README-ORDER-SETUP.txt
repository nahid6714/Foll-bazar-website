ফল বাজার — Website → Supabase → Admin App Order Setup

1) Supabase SQL Editor-এ ORDER_SETUP.sql পুরোটা একবার Run করুন (শুধু function অংশ নয়)।
   SQL-এর শেষে PostgREST schema cache reload command আছে, তাই 404 PGRST202 কমে যাবে.
2) Website deploy/push করুন.
3) Checkout থেকে test order দিন.
4) Supabase public.orders এবং public.order_items-এ row তৈরি হয়েছে কি না দেখুন.
5) Admin App খুলে Orders থেকে order দেখুন.

Checkout shipping:
- ঢাকা: ৳60
- ঢাকার বাইরে: ৳120
- Free Shipping নেই.

Payment options remain:
COD, bKash, Nagad, Rocket, Bank/Internet Banking, ShurjoPay, Card.
TrxID, sender phone and coupon data are saved when supplied.

Important:
- Website-এর UI payment options remove করা হয়নি.
- Cart variant-এর canonical productId আলাদা রাখা হয়েছে যাতে order_items relation ঠিক থাকে.
- UI-র 'cash' payment id database-এর 'cod' value-তে normalize করা হয়.
- service_role/secret key ব্যবহার করা হয়নি.

Troubleshooting PGRST202:
- যদি create_public_order not found দেখায়, নিশ্চিত করুন ORDER_SETUP.sql পুরোটা সফলভাবে Run হয়েছে.
- Supabase Dashboard → Database → Functions-এ public.create_public_order(jsonb) আছে কি না দেখুন.
- SQL Editor-এ আবার পুরো ORDER_SETUP.sql Run করুন; শেষে থাকা notify pgrst, 'reload schema';-টি schema cache refresh করবে.
- Browser hard refresh (Ctrl+Shift+R) করে আবার checkout test করুন.
