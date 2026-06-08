// VendSmart — Stripe Webhook Handler
// Keeps subscriptions table in sync with Stripe billing events.
// Deploy: supabase functions deploy stripe-webhook
//
// In Stripe Dashboard → Webhooks, set endpoint to:
//   https://<your-project>.supabase.co/functions/v1/stripe-webhook
//
// Required events to subscribe to:
//   checkout.session.completed
//   customer.subscription.updated
//   customer.subscription.deleted
//   invoice.payment_failed
//
// Required env vars:
//   STRIPE_SECRET_KEY
//   STRIPE_WEBHOOK_SECRET  (whsec_... from Stripe Dashboard Webhook page)

import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PLAN_FROM_PRODUCT: Record<string, string> = {
  // Map Stripe Product IDs to VendSmart plan names
  // Replace these with your actual Stripe Product IDs
  [Deno.env.get('STRIPE_PRODUCT_PRO') ?? 'prod_pro_placeholder']: 'pro',
  [Deno.env.get('STRIPE_PRODUCT_ENTERPRISE') ?? 'prod_enterprise_placeholder']: 'enterprise',
};

const MACHINE_LIMITS: Record<string, number> = {
  free: 5,
  pro: -1,       // unlimited
  enterprise: -1, // unlimited
};

Deno.serve(async (req) => {
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')!;
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' });

  const signature = req.headers.get('stripe-signature');
  if (!signature) return new Response('Missing signature', { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response(`Webhook Error: ${String(err)}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const plan = session.metadata?.plan;
        if (!userId || !plan) break;

        await supabase.from('subscriptions').update({
          plan,
          status: 'active',
          machine_limit: MACHINE_LIMITS[plan] ?? 5,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
        }).eq('user_id', userId);
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const productId = sub.items.data[0]?.price?.product as string;
        const plan = PLAN_FROM_PRODUCT[productId] ?? 'free';

        const status = sub.status === 'active' ? 'active'
          : sub.status === 'canceled' ? 'cancelled'
          : sub.status === 'past_due' ? 'past_due'
          : 'active';

        await supabase.from('subscriptions').update({
          plan,
          status,
          machine_limit: MACHINE_LIMITS[plan] ?? 5,
          stripe_subscription_id: sub.id,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        }).eq('stripe_customer_id', customerId);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await supabase.from('subscriptions').update({
          plan: 'free',
          status: 'cancelled',
          machine_limit: 5,
          stripe_subscription_id: null,
          current_period_end: null,
        }).eq('stripe_customer_id', sub.customer as string);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await supabase.from('subscriptions').update({ status: 'past_due' })
          .eq('stripe_customer_id', invoice.customer as string);
        break;
      }
    }
  } catch (err) {
    console.error(`Error processing event ${event.type}:`, err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
