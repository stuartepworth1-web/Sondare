import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const PRICE_IDS = {
  starter: {
    monthly: "price_starter_monthly_prod",
    yearly: "price_starter_yearly_prod",
  },
  pro: {
    monthly: "price_pro_monthly_prod",
    yearly: "price_pro_yearly_prod",
  },
  entrepreneur: {
    monthly: "price_entrepreneur_monthly_prod",
    yearly: "price_entrepreneur_yearly_prod",
  },
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { tier, userId, isYearly } = await req.json();

    if (!tier || !userId) {
      throw new Error("Missing required parameters");
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe key not configured");
    }

    const stripe = (await import("npm:stripe@14.14.0")).default;
    const stripeClient = new stripe(stripeKey, {
      apiVersion: "2023-10-16",
      httpClient: stripe.createFetchHttpClient(),
    });

    const priceId = isYearly
      ? PRICE_IDS[tier as keyof typeof PRICE_IDS].yearly
      : PRICE_IDS[tier as keyof typeof PRICE_IDS].monthly;

    const session = await stripeClient.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/?success=true`,
      cancel_url: `${req.headers.get("origin")}/?canceled=true`,
      metadata: {
        userId,
        tier,
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
