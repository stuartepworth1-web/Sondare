import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing required environment variables");
    }

    const stripe = (await import("npm:stripe@14.14.0")).default;
    const stripeClient = new stripe(stripeKey, {
      apiVersion: "2023-10-16",
      httpClient: stripe.createFetchHttpClient(),
    });

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("No signature provided");
    }

    const body = await req.text();
    const event = stripeClient.webhooks.constructEvent(body, signature, webhookSecret);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier as 'starter' | 'pro' | 'entrepreneur';

        if (userId && tier) {
          await supabase
            .from("profiles")
            .update({ subscription_tier: tier })
            .eq("id", userId);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;

        if (userId) {
          const isActive = subscription.status === "active";
          const tier = subscription.metadata?.tier as 'starter' | 'pro' | 'entrepreneur';

          if (!isActive) {
            await supabase
              .from("profiles")
              .update({ subscription_tier: "free" })
              .eq("id", userId);
          } else if (tier) {
            await supabase
              .from("profiles")
              .update({ subscription_tier: tier })
              .eq("id", userId);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;

        if (userId) {
          await supabase
            .from("profiles")
            .update({ subscription_tier: "free" })
            .eq("id", userId);
        }
        break;
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);
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
