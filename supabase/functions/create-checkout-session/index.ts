// VendSmart — Create Stripe Checkout Session
// Called by the frontend Settings page to initiate a subscription upgrade.
// Deploy: supabase functions deploy create-checkout-session
//
// Required env vars:
//   STRIPE_SECRET_KEY  (sk_live_... or sk_test_...)
//   VITE_APP_URL       (https://your-app.vercel.app — used for success/cancel redirects)

import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PRICE_IDS: Record<string, string> = {
  // Replace with your actual Stripe Price IDs from the Stripe Dashboard
  pro: Deno.env.get('STRIPE_PRICE_PRO') ?? 'price_pro_placeholder',
  enterprise: Deno.env.get('STRIPE_PRICE_ENTERPRISE') ?? 'price_enterprise_placeholder',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' },
    });
  }

  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!stripeKey) {
    return new Response(JSON.stringify({ error: 'Stripe not configured — set STRIPE_SECRET_KEY' }), { status: 500 });
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' });
  const appUrl = Deno.env.get('VITE_APP_URL') ?? 'http://localhost:5173';

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const { plan } = await req.json() as { plan: string };
    const priceId = PRICE_IDS[plan];
    if (!priceId || priceId.endsWith('_placeholder')) {
      return new Response(JSON.stringify({ error: `No Stripe Price ID configured for plan "${plan}". Set STRIPE_PRICE_${plan.toUpperCase()} in your Edge Function environment.` }), { status: 400 });
    }

    // Get or create Stripe customer
    const { data: sub } = await supabase.from('subscriptions').select('stripe_customer_id').eq('user_id', user.id).single();
    let customerId = sub?.stripe_customer_id as string | undefined;

    if (!customerId) {
      const { data: profile } = await supabase.from('profiles').select('email, business_name').eq('id', user.id).single();
      const customer = await stripe.customers.create({ email: profile?.email ?? user.email, name: profile?.business_name, metadata: { user_id: user.id } });
      customerId = customer.id;
      await supabase.from('subscriptions').update({ stripe_customer_id: customerId }).eq('user_id', user.id);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${appUrl}/settings?upgraded=1`,
      cancel_url: `${appUrl}/settings`,
      metadata: { user_id: user.id, plan },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
