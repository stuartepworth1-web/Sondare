import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface RevenueCatWebhook {
  event: {
    type: string;
    app_user_id: string;
    product_id: string;
    entitlement_ids: string[];
    period_type: string;
    purchased_at_ms: number;
    expiration_at_ms: number;
    original_app_user_id: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const webhook: RevenueCatWebhook = await req.json();
    const { event } = webhook;

    console.log('Received webhook:', event.type, 'for user:', event.app_user_id);

    const tierMap: { [key: string]: string } = {
      'com.sondare.app.starter.monthly': 'starter',
      'com.sondare.app.pro.monthly': 'pro',
      'com.sondare.app.entrepreneur.monthly': 'entrepreneur',
    };

    const tier = tierMap[event.product_id] || 'free';

    switch (event.type) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'NON_RENEWING_PURCHASE':
      case 'UNCANCELLATION':
        await supabase
          .from('profiles')
          .update({
            subscription_tier: tier,
            payment_provider: 'apple_iap',
            subscription_id: event.original_app_user_id,
            subscription_status: 'active',
            subscription_expires_at: new Date(event.expiration_at_ms).toISOString(),
          })
          .eq('id', event.app_user_id);
        break;

      case 'CANCELLATION':
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'cancelled',
            subscription_expires_at: new Date(event.expiration_at_ms).toISOString(),
          })
          .eq('id', event.app_user_id);
        break;

      case 'EXPIRATION':
        await supabase
          .from('profiles')
          .update({
            subscription_tier: 'free',
            subscription_status: 'expired',
            subscription_expires_at: new Date(event.expiration_at_ms).toISOString(),
          })
          .eq('id', event.app_user_id);
        break;

      case 'BILLING_ISSUE':
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'grace_period',
          })
          .eq('id', event.app_user_id);
        break;
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});