import { Users, Building2, GraduationCap, Laptop, Heart, Zap, Globe, Radio, TrendingUp, Facebook, Video } from 'lucide-react';
import PageHero from '../components/PageHero';
import FacebookEmbed from '../components/FacebookEmbed';
import YouTubeWebinars from '../components/YouTubeWebinars';
import { useSiteSettings } from '../hooks/useSiteSettings';

const sectors = [
  {
    icon: Building2,
    title: 'Gobierno',
    gradient: 'from-blue-500 to-blue-700',
    desc: 'Ministerios, entes reguladores, secretarías, municipalidades y otras instituciones del Estado participan para compartir políticas públicas y contribuir a propuestas de gobernanza digital incluyente.',
    examples: ['Ministerios con competencias digitales', 'Entes reguladores de telecomunicaciones', 'Superintendencia de Telecomunicaciones (SIT)', 'Oficinas de gobierno digital'],
  },
  {
    icon: Heart,
    title: 'Sociedad Civil',
    gradient: 'from-rose-500 to-pink-600',
    desc: 'Organizaciones no gubernamentales, colectivos ciudadanos, grupos de defensa de derechos digitales y activistas aseguran que las voces de la ciudadanía estén representadas.',
    examples: ['Organizaciones de derechos digitales', 'Colectivos de mujeres tecnólogas', 'Organizaciones indígenas digitales', 'Grupos de jóvenes activistas'],
  },
  {
    icon: TrendingUp,
    title: 'Sector Privado',
    gradient: 'from-amber-500 to-orange-600',
    desc: 'Empresas de telecomunicaciones, startups tecnológicas y asociaciones empresariales contribuyen con perspectivas sobre innovación, inversión y desarrollo del ecosistema digital.',
    examples: ['Operadoras de telecomunicaciones', 'Empresas tecnológicas', 'Asociaciones de la industria digital', 'Startups e innovadores'],
  },
  {
    icon: Laptop,
    title: 'Comunidad Técnica',
    gradient: 'from-cyan-500 to-sky-600',
    desc: 'Expertos en infraestructura de Internet, ingenieros de redes y miembros de organizaciones técnicas internacionales aportan conocimiento especializado.',
    examples: ['Ingenieros de redes y protocolos', 'Administradores de sistemas', 'Comunidad LACNIC', 'Operadores de IXP'],
  },
  {
    icon: GraduationCap,
    title: 'Academia',
    gradient: 'from-emerald-500 to-teal-600',
    desc: 'Universidades, centros de investigación y docentes contribuyen con investigación, análisis de política pública y formación de capacidades.',
    examples: ['Universidad de San Carlos de Guatemala', 'Universidades privadas', 'Centros de investigación', 'Docentes e investigadores'],
  },
  {
    icon: Zap,
    title: 'Juventudes',
    gradient: 'from-violet-500 to-purple-600',
    desc: 'Los y las jóvenes son actores estratégicos. El IGF Guatemala reserva espacios específicos para que lideren discusiones sobre el futuro de Internet.',
    examples: ['Líderes jóvenes digitales', 'Estudiantes de tecnología', 'Jóvenes activistas digitales', 'Youth IGF Guatemala'],
  },
  {
    icon: Globe,
    title: 'Organismos Internacionales',
    gradient: 'from-sky-500 to-blue-600',
    desc: 'Agencias de Naciones Unidas, organismos de cooperación internacional y redes regionales comparten experiencias globales y apoyan la gobernanza digital.',
    examples: ['PNUD', 'UNESCO', 'CEPAL', 'UIT', 'Organismos de cooperación bilateral'],
  },
  {
    icon: Radio,
    title: 'Medios de Comunicación',
    gradient: 'from-slate-500 to-slate-700',
    desc: 'Periodistas y comunicadores digitales contribuyen a la cobertura informada del debate y acercan estos temas a la ciudadanía en general.',
    examples: ['Medios digitales', 'Periodistas de tecnología', 'Comunicadores ciudadanos', 'Radios comunitarias'],
  },
];

export default function Community() {
  const { settings } = useSiteSettings();
  const showEmbeds = settings.show_social_embeds !== 'false';

  return (
    <div className="pt-16 sm:pt-24">
      <PageHero
        icon={<Users className="w-7 h-7" />}
        eyebrow="Participantes"
        title="Comunidad"
        titleAccent="Multiactor"
        subtitle="Una plataforma compartida donde todos los sectores tienen voz y participan en igualdad de condiciones."
      />

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sectors.map(({ icon: Icon, title, gradient, desc, examples }) => (
              <div key={title} className="group rounded-2xl border border-slate-100 hover:border-sky-200 hover:shadow-card-hover transition-all duration-200 overflow-hidden">
                <div className={`h-1 bg-gradient-to-r ${gradient}`} />
                <div className="p-7">
                  <div className={`inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} items-center justify-center mb-5 shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-display font-bold text-blue-950 text-xl mb-3">{title}</h3>
                  <p className="text-slate-500 text-[15px] leading-relaxed mb-5">{desc}</p>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Participantes</p>
                    <div className="flex flex-wrap gap-2">
                      {examples.map((ex) => (
                        <span key={ex} className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-full text-slate-600 text-xs font-medium">
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {showEmbeds && (
        <section className="py-20 bg-slate-50 bg-grid-light">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="section-label justify-center">
                <span className="w-5 h-px bg-sky-500" />
                Vida digital
                <span className="w-5 h-px bg-sky-500" />
              </p>
              <h2 className="section-title text-4xl sm:text-5xl mb-4">Comunidad Digital</h2>
              <p className="text-slate-500 max-w-2xl mx-auto text-[15px]">
                Seguimos la conversación más allá del evento. Aquí encontrás nuestras publicaciones recientes en Facebook y las grabaciones de webinars anteriores en YouTube.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Facebook */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Facebook className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-blue-950 text-lg">Publicaciones de Facebook</h3>
                    <p className="text-slate-400 text-xs">Lo más reciente de nuestra página</p>
                  </div>
                </div>
                <FacebookEmbed
                  pageUrl={settings.facebook_page_url}
                  pageName={settings.facebook_page_name}
                  height={520}
                />
              </div>

              {/* YouTube */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                    <Video className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-blue-950 text-lg">Webinars anteriores</h3>
                    <p className="text-slate-400 text-xs">Grabaciones de nuestros foros y conversatorios</p>
                  </div>
                </div>
                <YouTubeWebinars
                  channelId={settings.youtube_channel_id}
                  playlistId={settings.youtube_playlist_id}
                  channelName={settings.youtube_channel_name}
                />
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
