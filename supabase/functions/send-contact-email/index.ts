import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const TO_EMAIL = "igf.guatemala.isocgt@gmail.com";
const FROM_EMAIL = "no-reply@igf.gt";

interface ContactPayload {
  name: string;
  email: string;
  org?: string;
  subject: string;
  message: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { name, email, org, subject, message }: ContactPayload = await req.json();

    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Faltan campos requeridos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1e3a8a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Nuevo mensaje de contacto - IGF Guatemala</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; font-weight: bold; color: #475569; width: 120px;">Nombre:</td><td style="padding: 8px 0; color: #1e293b;">${name}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #475569;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #0284c7;">${email}</a></td></tr>
          ${org ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #475569;">Organización:</td><td style="padding: 8px 0; color: #1e293b;">${org}</td></tr>` : ""}
          <tr><td style="padding: 8px 0; font-weight: bold; color: #475569;">Asunto:</td><td style="padding: 8px 0; color: #1e293b;">${subject}</td></tr>
        </table>
        <h3 style="color: #475569; margin-top: 20px;">Mensaje:</h3>
        <div style="background: #f8fafc; border-left: 4px solid #0284c7; padding: 15px; border-radius: 4px; color: #1e293b; line-height: 1.6; white-space: pre-wrap;">${message}</div>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
          Este mensaje fue enviado desde el formulario de contacto del sitio web IGF Guatemala.
        </p>
      </div>
    `;

    let sent = false;

    if (RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `IGF Guatemala <${FROM_EMAIL}>`,
          to: [TO_EMAIL],
          reply_to: email,
          subject: `[Contacto IGF] ${subject}`,
          html,
        }),
      });
      sent = res.ok;
    }

    return new Response(
      JSON.stringify({ success: true, emailSent: sent }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
