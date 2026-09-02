import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;

interface CreatePayload {
  email: string;
  password: string;
  display_name: string;
  role: 'admin' | 'super_admin';
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No autorizado." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify the caller's session and check super_admin status
    const meRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "apikey": serviceRoleKey,
      },
    });
    if (!meRes.ok) {
      return new Response(
        JSON.stringify({ error: "Sesión inválida." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const me = await meRes.json();
    const callerId = me.id as string;

    // Check admin_users for super_admin + approved
    const adminRes = await fetch(
      `${supabaseUrl}/rest/v1/admin_users?user_id=eq.${callerId}&select=role,status`,
      {
        headers: {
          "apikey": serviceRoleKey,
          "Authorization": `Bearer ${serviceRoleKey}`,
        },
      },
    );
    const adminRows = await adminRes.json() as Array<{ role: string; status: string }>;
    const isSuperAdmin = adminRows.some(
      (r) => r.role === "super_admin" && r.status === "approved",
    );
    if (!isSuperAdmin) {
      return new Response(
        JSON.stringify({ error: "Solo los super administradores pueden crear usuarios." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const raw = await req.json() as CreatePayload;
    const email = String(raw.email ?? "").trim().toLowerCase();
    const password = String(raw.password ?? "");
    const displayName = String(raw.display_name ?? "").trim();
    const role = raw.role === "super_admin" ? "super_admin" : "admin";

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValid || password.length < 8 || !displayName) {
      return new Response(
        JSON.stringify({ error: "Email inválido, contraseña mínima 8 caracteres o nombre vacío." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create the auth user with the Admin API (service role)
    const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${serviceRoleKey}`,
        "apikey": serviceRoleKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: { display_name: displayName },
      }),
    });

    if (!createRes.ok) {
      const errBody = await createRes.json() as { msg?: string };
      const msg = errBody?.msg ?? "No se pudo crear el usuario.";
      const friendly = msg.includes("already") || msg.includes("exists")
        ? "Ya existe un usuario con ese correo."
        : msg;
      return new Response(
        JSON.stringify({ error: friendly }),
        { status: createRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const newUser = await createRes.json() as { id: string };

    // Insert admin_users row with approved status
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/admin_users`, {
      method: "POST",
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
      },
      body: JSON.stringify({
        user_id: newUser.id,
        email,
        display_name: displayName,
        role,
        status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: callerId,
      }),
    });

    if (!insertRes.ok) {
      // The auth user was created but the admin_users insert failed.
      // Best-effort cleanup of the orphaned auth user.
      await fetch(`${supabaseUrl}/auth/v1/admin/users/${newUser.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${serviceRoleKey}`,
          "apikey": serviceRoleKey,
        },
      });
      return new Response(
        JSON.stringify({ error: "Se creó la cuenta pero no se pudo registrar como administrador. Intenta de nuevo." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (_err) {
    return new Response(
      JSON.stringify({ error: "Error interno del servidor." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
