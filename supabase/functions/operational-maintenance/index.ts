import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret" };

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (request.headers.get("x-cron-secret") !== Deno.env.get("OPERATIONAL_CRON_SECRET")) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const [completion, guarantee] = await Promise.all([
    supabase.rpc("complete_due_orders"),
    supabase.rpc("release_due_guarantee_wallet_transactions"),
  ]);
  if (completion.error || guarantee.error) return new Response(JSON.stringify({ completion: completion.error?.message, guarantee: guarantee.error?.message }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  return new Response(JSON.stringify({ completed_orders: completion.data ?? 0, released_wallet_transactions: guarantee.data ?? 0 }), { headers: { ...cors, "Content-Type": "application/json" } });
});
