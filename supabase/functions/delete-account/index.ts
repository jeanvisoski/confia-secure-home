import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ACTIVE_ORDER_STATUSES = [
  "aguardando_pagamento",
  "aceito",
  "a_caminho",
  "executando",
  "fotos_enviadas",
  "aguardando_confirmacao",
  "em_disputa",
];

async function removeFolder(
  admin: ReturnType<typeof createClient>,
  bucket: string,
  prefix: string,
) {
  const { data: items, error } = await admin.storage.from(bucket).list(prefix, { limit: 1000 });
  if (error) throw error;

  for (const item of items ?? []) {
    if (item.name === ".emptyFolderPlaceholder") continue;
    const path = `${prefix}/${item.name}`;
    // Storage lists folders and files together. A folder has children, while
    // files do not; recurse so every user-owned upload is removed.
    const { data: children, error: childrenError } = await admin.storage
      .from(bucket)
      .list(path, { limit: 1 });
    if (childrenError) throw childrenError;
    if (children?.length) {
      await removeFolder(admin, bucket, path);
    } else {
      const { error: removeError } = await admin.storage.from(bucket).remove([path]);
      if (removeError) throw removeError;
    }
  }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authorization = request.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
    });
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();
    if (userError || !user) throw new Error("Sessão inválida.");

    const admin = createClient(supabaseUrl, serviceKey);
    const [{ data: profile }, { count: activeOrders }] = await Promise.all([
      admin.from("profiles").select("is_admin").eq("id", user.id).single(),
      admin
        .from("orders")
        .select("id", { count: "exact", head: true })
        .or(`client_id.eq.${user.id},provider_id.eq.${user.id}`)
        .in("status", ACTIVE_ORDER_STATUSES),
    ]);
    if (profile?.is_admin)
      throw new Error("Contas administrativas não podem ser excluídas pelo app.");
    if ((activeOrders ?? 0) > 0)
      throw new Error("Conclua ou cancele os pedidos ativos antes de excluir sua conta.");

    // Arquivos pessoais e dados de contato são removidos. O histórico de
    // pedidos permanece apenas com um perfil anonimizado para auditoria,
    // prevenção a fraude e obrigações financeiras.
    await Promise.all([
      admin.from("addresses").delete().eq("profile_id", user.id),
      admin.from("notifications").delete().eq("profile_id", user.id),
      admin.from("order_provider_locations").delete().eq("provider_id", user.id),
      admin.from("provider_payout_destinations").delete().eq("provider_id", user.id),
      admin
        .from("provider_profiles")
        .update({ headline: null, bio: null, city: null, specialties: [] })
        .eq("profile_id", user.id),
      removeFolder(admin, "bicoja-photos", user.id),
      removeFolder(admin, "provider-documents", user.id),
    ]);

    const { error: profileError } = await admin
      .from("profiles")
      .update({
        full_name: "Conta removida",
        email: null,
        phone: null,
        avatar_url: null,
        is_active: false,
        account_deleted_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    if (profileError) throw profileError;

    const deletedEmail = `deleted-${user.id.replaceAll("-", "")}@deleted.bicoja.invalid`;
    const { error: authError } = await admin.auth.admin.updateUserById(user.id, {
      email: deletedEmail,
      password: crypto.randomUUID() + crypto.randomUUID(),
      user_metadata: {},
      ban_duration: "876000h",
    });
    if (authError) throw authError;

    return Response.json({ ok: true }, { headers: corsHeaders });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Não foi possível excluir a conta." },
      { status: 400, headers: corsHeaders },
    );
  }
});
