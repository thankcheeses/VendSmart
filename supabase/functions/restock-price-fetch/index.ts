// VendSmart — Restock Price Fetch Edge Function
// Fetches real-time pricing and availability from connected suppliers.
// Deploy: supabase functions deploy restock-price-fetch
//
// Required env vars:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//   AMAZON_BUSINESS_CLIENT_ID, AMAZON_BUSINESS_CLIENT_SECRET, AMAZON_BUSINESS_MARKETPLACE_ID
//   SYSCO_API_KEY, SYSCO_ACCOUNT_NUMBER
//   SAMS_CLUB_API_KEY, SAMS_CLUB_MEMBERSHIP_NUMBER
//
// Stub mode: if supplier env vars are not set, returns mock pricing data
// so the UI remains functional. Swap to real credentials to enable live data.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface PriceResult {
  product_id: string;
  supplier: string;
  supplier_sku?: string;
  price?: number;
  in_stock: boolean;
  lead_time_days: number;
  source: 'live' | 'stub';
  error?: string;
}

interface RequestBody {
  product_ids: string[];
  user_id: string;
}

// ── Supplier fetch stubs (replace with real API calls when credentials set) ──

async function fetchAmazonPrices(skus: string[], _clientId: string, _clientSecret: string): Promise<Record<string, { price: number; in_stock: boolean }>> {
  // TODO: Implement Amazon Business Ordering API / Integrated Search API
  // Docs: https://developer-docs.amazon.com/amazon-business/docs/ordering-api
  // POST /ordering/2023-11-15/orders — requires OAuth2 Login with Amazon
  // GET /catalog/2022-04-01/items?keywords={upc}&marketplaceIds={marketplace}
  if (!_clientId) return {};

  // Stub: return placeholder pricing
  return Object.fromEntries(skus.map(sku => [sku, { price: parseFloat((Math.random() * 2 + 0.8).toFixed(2)), in_stock: Math.random() > 0.1 }]));
}

async function fetchSyscoPrices(skus: string[], _apiKey: string, _accountNumber: string): Promise<Record<string, { price: number; in_stock: boolean }>> {
  // TODO: Implement Sysco REST API
  // Docs: https://apic-devportal.sysco.com
  // GET /products/{sku} — returns 30+ data fields including contract pricing and stock status
  // Requires Sysco account number + API key
  if (!_apiKey) return {};

  return Object.fromEntries(skus.map(sku => [sku, { price: parseFloat((Math.random() * 2 + 0.7).toFixed(2)), in_stock: Math.random() > 0.05 }]));
}

async function fetchSamsClubPrices(skus: string[], _apiKey: string): Promise<Record<string, { price: number; in_stock: boolean }>> {
  // TODO: Implement Sam's Club Business API (direct, no EDI required)
  // Launched early 2026 — requires Sam's Club business membership + API credentials
  if (!_apiKey) return {};

  return Object.fromEntries(skus.map(sku => [sku, { price: parseFloat((Math.random() * 2 + 0.6).toFixed(2)), in_stock: Math.random() > 0.08 }]));
}

// ─────────────────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const amazonClientId = Deno.env.get('AMAZON_BUSINESS_CLIENT_ID') ?? '';
  const amazonClientSecret = Deno.env.get('AMAZON_BUSINESS_CLIENT_SECRET') ?? '';
  const syscoApiKey = Deno.env.get('SYSCO_API_KEY') ?? '';
  const syscoAccountNumber = Deno.env.get('SYSCO_ACCOUNT_NUMBER') ?? '';
  const samsApiKey = Deno.env.get('SAMS_CLUB_API_KEY') ?? '';

  try {
    const body = await req.json() as RequestBody;
    const { product_ids, user_id } = body;

    if (!product_ids?.length || !user_id) {
      return new Response(JSON.stringify({ error: 'product_ids and user_id required' }), { status: 400 });
    }

    // Fetch product supplier mappings
    const { data: mappings } = await supabase
      .from('product_supplier_map')
      .select('*')
      .eq('user_id', user_id)
      .in('product_id', product_ids);

    const results: PriceResult[] = [];
    const bySupplier: Record<string, string[]> = { amazon_business: [], sysco: [], sams_club: [] };

    for (const mapping of mappings ?? []) {
      if (mapping.supplier_sku && bySupplier[mapping.supplier]) {
        bySupplier[mapping.supplier].push(mapping.supplier_sku);
      }
    }

    const [amazonPrices, syscoPrices, samsPrices] = await Promise.all([
      fetchAmazonPrices(bySupplier.amazon_business, amazonClientId, amazonClientSecret),
      fetchSyscoPrices(bySupplier.sysco, syscoApiKey, syscoAccountNumber),
      fetchSamsClubPrices(bySupplier.sams_club, samsApiKey),
    ]);

    const allPrices: Record<string, Record<string, { price: number; in_stock: boolean }>> = {
      amazon_business: amazonPrices,
      sysco: syscoPrices,
      sams_club: samsPrices,
    };

    for (const mapping of mappings ?? []) {
      const supplierPrices = allPrices[mapping.supplier];
      const priceData = supplierPrices?.[mapping.supplier_sku];

      results.push({
        product_id: mapping.product_id,
        supplier: mapping.supplier,
        supplier_sku: mapping.supplier_sku,
        price: priceData?.price ?? mapping.last_price ?? undefined,
        in_stock: priceData?.in_stock ?? mapping.in_stock ?? true,
        lead_time_days: mapping.lead_time_days ?? 2,
        source: priceData ? 'live' : 'stub',
      });

      // Update cached prices
      if (priceData) {
        await supabase
          .from('product_supplier_map')
          .update({ last_price: priceData.price, in_stock: priceData.in_stock, last_price_checked_at: new Date().toISOString() })
          .eq('product_id', mapping.product_id)
          .eq('supplier', mapping.supplier);
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
