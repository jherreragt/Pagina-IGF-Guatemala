import { useState } from 'react';
import { Mail, MapPin, Send, Check, Globe, Youtube, Facebook, AlertCircle, Loader2 } from 'lucide-react';
import PageHero from '../components/PageHero';
import { useSiteSettings } from '../hooks/useSiteSettings';

export default function Contact() {
  const { settings } = useSiteSettings();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', org: '', subject: '', message: '' });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact-email`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error('Error al enviar el mensaje');
      setSubmitted(true);
    } catch {
      setError('Ocurrió un error al enviar el mensaje. Por favor, intenta de nuevo o escríbenos directamente a nuestro correo.');
    } finally {
      setSubmitting(false);
    }
  }

  const socialLinks = [
    { icon: Youtube, label: 'YouTube', handle: settings.youtube_channel_name || 'IGF Guatemala ISOCGT', href: settings.youtube_channel_id || 'https://www.youtube.com/@IGFGuatemalaISOCGT', color: 'hover:bg-red-600' },
    { icon: Facebook, label: 'Facebook', handle: settings.facebook_page_name || 'IGF Guatemala', href: settings.facebook_page_url || 'https://www.facebook.com/share/1FvujVBQMp/', color: 'hover:bg-blue-600' },
    { icon: Globe, label: 'IGF Global', handle: 'intgovforum.org', href: 'https://www.intgovforum.org', color: 'hover:bg-sky-600' },
  ];

  return (
    <div className="pt-16 sm:pt-24">
      <PageHero
        icon={<Mail className="w-7 h-7" />}
        eyebrow="Comunícate"
        title="Contacto"
        subtitle="¿Tienes preguntas, propuestas o quieres sumarte al IGF Guatemala? Escríbenos."
      />

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">

            {/* Form */}
            <div>
              {submitted ? (
                <div className="h-full flex items-center">
                  <div className="text-center py-16 bg-sky-50 rounded-2xl border border-sky-100 w-full">
                    <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-5">
                      <Check className="w-8 h-8 text-sky-600" />
                    </div>
                    <h3 className="font-display font-bold text-blue-950 text-2xl mb-3">¡Mensaje enviado!</h3>
                    <p className="text-slate-500 max-w-xs mx-auto text-[15px]">
                      Hemos recibido tu mensaje y te responderemos a la brevedad posible.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Nombre completo <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Tu nombre"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-slate-800 text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Correo electrónico <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="correo@ejemplo.com"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-slate-800 text-sm transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="org" className="block text-sm font-semibold text-slate-700 mb-1.5">Organización</label>
                    <input
                      id="org"
                      type="text"
                      value={form.org}
                      onChange={(e) => setForm({ ...form, org: e.target.value })}
                      placeholder="Tu organización (opcional)"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-slate-800 text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Asunto <span className="text-red-400">*</span>
                    </label>
                    <select
                      id="subject"
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-slate-800 text-sm transition-all bg-white"
                    >
                      <option value="">Selecciona un asunto</option>
                      <option>Información sobre el evento anual</option>
                      <option>Propuesta de sesión</option>
                      <option>Sumarme a la comunidad</option>
                      <option>Alianza o colaboración</option>
                      <option>Medios de comunicación</option>
                      <option>Otro</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Mensaje <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Escribe tu mensaje aquí..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-slate-800 text-sm transition-all resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full justify-center py-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        Enviar mensaje
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Info */}
            <div className="space-y-8">
              <div>
                <h3 className="font-display font-bold text-blue-950 text-xl mb-5">Información de contacto</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-sky-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-blue-950 text-sm">Correo electrónico</p>
                      <a href={`mailto:${settings.contact_email}`} className="text-sky-600 hover:underline text-sm">
                        {settings.contact_email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-sky-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-blue-950 text-sm">Ubicación</p>
                      <p className="text-slate-500 text-sm">{settings.contact_address}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-display font-bold text-blue-950 text-xl mb-5">Redes sociales</h3>
                <div className="space-y-3">
                  {socialLinks.map(({ icon: Icon, label, handle, href, color }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl hover:shadow-md transition-all group"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-sky-50 ${color} flex items-center justify-center flex-shrink-0 transition-colors`}>
                        <Icon className="w-5 h-5 text-sky-600 group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <p className="font-semibold text-blue-950 text-sm">{label}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{handle}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100 rounded-2xl">
                <h3 className="font-bold text-blue-950 mb-3">¿Quieres sumarte al proceso?</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  El IGF Guatemala está abierto a la participación de cualquier persona o institución interesada en el debate sobre gobernanza de Internet.
                </p>
                <a href={`mailto:${settings.contact_email}`} className="inline-flex items-center gap-2 text-sky-600 font-semibold text-sm hover:text-blue-700 transition-colors">
                  Contáctanos
                  <Send className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
