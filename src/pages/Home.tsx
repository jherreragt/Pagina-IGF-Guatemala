import { Link } from 'react-router-dom';
import {
  Globe, Users, ShieldCheck, Wifi, Scale, Eye, BookOpen, MessageSquare,
  ArrowRight, ChevronRight, Building2, GraduationCap, Laptop, Heart,
  Lightbulb, TrendingUp, Lock, Database, Zap, Radio, Calendar, User
} from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useEffect, useState } from 'react';
import { supabase, BlogPost } from '../lib/supabase';

const whyMatters = [
  { icon: Wifi, label: 'Brecha digital' },
  { icon: ShieldCheck, label: 'Derechos digitales' },
  { icon: Lock, label: 'Protección de datos' },
  { icon: Lightbulb, label: 'IA responsable' },
  { icon: Scale, label: 'Ciberseguridad' },
  { icon: MessageSquare, label: 'Libertad de expresión' },
  { icon: Radio, label: 'Desinformación' },
  { icon: Database, label: 'Servicios digitales' },
  { icon: Heart, label: 'Inclusión digital' },
];

const principles = [
  'Apertura', 'Inclusión', 'Participación multiactor', 'Transparencia',
  'Neutralidad política', 'Respeto y no discriminación', 'Construcción de consensos',
  'Enfoque de derechos humanos', 'Perspectiva de género', 'Participación juvenil',
  'Carácter no comercial', 'Diálogo basado en evidencia',
];

const stakeholders = [
  { icon: Building2, label: 'Gobierno', desc: 'Instituciones públicas' },
  { icon: Heart, label: 'Sociedad Civil', desc: 'Organizaciones y activistas' },
  { icon: TrendingUp, label: 'Sector Privado', desc: 'Industria tecnológica' },
  { icon: Laptop, label: 'Com. Técnica', desc: 'Expertos en infraestructura' },
  { icon: GraduationCap, label: 'Academia', desc: 'Universidades e investigación' },
  { icon: Zap, label: 'Juventudes', desc: 'Líderes digitales jóvenes' },
  { icon: Globe, label: 'Org. Internacionales', desc: 'Cooperación global' },
  { icon: Radio, label: 'Medios', desc: 'Comunicadores digitales' },
];

const themes = [
  { icon: Lightbulb, title: 'Inteligencia artificial, datos y gobernanza digital', num: '01' },
  { icon: Scale, title: 'Derechos digitales, democracia y libertad de expresión', num: '02' },
  { icon: ShieldCheck, title: 'Ciberseguridad, confianza e infraestructura crítica', num: '03' },
  { icon: Wifi, title: 'Acceso significativo e inclusión digital', num: '04' },
  { icon: Database, title: 'Infraestructura pública digital e interoperabilidad', num: '05' },
  { icon: Zap, title: 'Juventudes, educación digital y futuro del trabajo', num: '06' },
  { icon: Radio, title: 'Integridad informativa y espacio cívico digital', num: '07' },
  { icon: TrendingUp, title: 'Innovación, economía digital y desarrollo sostenible', num: '08' },
];

const pastEditions = [
  { year: '2023', title: 'IGF Guatemala 2023', lema: 'Por una Internet libre, segura y confiable', date: 'Octubre 2023' },
  { year: '2022', title: 'IGF Guatemala 2022', lema: 'Gobernanza de Internet para el desarrollo sostenible', date: 'Noviembre 2022' },
  { year: '2021', title: 'IGF Guatemala 2021', lema: 'Internet inclusivo y resiliente', date: 'Octubre 2021' },
];

export default function Home() {
  const { settings } = useSiteSettings();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    if (settings.show_blog === 'true') {
      supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, cover_url, category, author, published_at, created_at')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(3)
        .then(({ data }) => setBlogPosts((data as BlogPost[]) ?? []));
    }
  }, [settings.show_blog]);

  const titleWords = settings.hero_title.split(' ');
  const titleFirst = titleWords.slice(0, -1).join(' ');
  const titleLast = titleWords[titleWords.length - 1];

  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a3a6e 0%, #1565c0 55%, #0288d1 100%)' }}>
        {/* Decorative orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-sky-600/10 blur-[100px]" />
          <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] rounded-full bg-blue-500/8 blur-[80px]" />
          <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-cyan-500/5 blur-[60px]" />
          <div className="absolute inset-0 bg-grid opacity-100" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-28 animate-fade-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/20 mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            <Globe className="w-3 h-3 text-sky-400" />
            <span className="text-sky-300 text-xs font-semibold tracking-widest uppercase">Capítulo Nacional · IGF Global</span>
          </div>

          <h1 className="font-display font-bold text-white leading-[1.08] mb-6">
            <span className="block text-5xl sm:text-6xl lg:text-7xl">{titleFirst}</span>
            <span className="block text-5xl sm:text-6xl lg:text-7xl gradient-text">{titleLast}</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 font-light mb-4 max-w-2xl mx-auto leading-relaxed">
            {settings.hero_subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-20">
            <Link to="/evento" className="btn-primary text-base px-7 py-3.5">
              Conoce el evento anual
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/contacto" className="btn-outline text-base px-7 py-3.5">
              Súmate a la comunidad
            </Link>
            <Link to="/recursos" className="btn-outline text-base px-7 py-3.5">
              Ver recursos
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/[0.08] pt-12 max-w-2xl mx-auto">
            {[
              { num: '8+', label: 'Ediciones' },
              { num: '500+', label: 'Participantes' },
              { num: '7', label: 'Sectores' },
              { num: '8', label: 'Ejes temáticos' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display font-bold text-2xl sm:text-3xl text-sky-300 mb-1">{stat.num}</div>
                <div className="text-slate-400 text-xs font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </section>

      {/* ── QUÉ ES IGF GUATEMALA ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="section-label">
                <span className="w-5 h-px bg-sky-500" />
                ¿Qué es?
              </p>
              <h2 className="section-title text-4xl sm:text-5xl mb-6">
                {settings.about_title}
              </h2>
              <p className="text-slate-500 leading-relaxed mb-5 text-[15px]">
                {settings.about_body}
              </p>
              <p className="text-slate-500 leading-relaxed mb-5 text-[15px]">
                Funciona como un espacio de diálogo abierto, sin fines de lucro, donde múltiples sectores se reúnen en igualdad de condiciones para discutir los desafíos y oportunidades del ecosistema digital del país.
              </p>
              <p className="text-slate-500 leading-relaxed mb-8 text-[15px]">
                No toma decisiones vinculantes, sino que genera recomendaciones, construye puentes y fortalece la participación de Guatemala en las discusiones globales.
              </p>
              <Link to="/sobre" className="btn-ghost text-sm">
                Conoce más sobre nosotros
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=900"
                  alt="Diálogo multiactor"
                  className="w-full h-[420px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950/40 to-transparent" />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl p-5 shadow-xl border border-slate-100 max-w-[200px]">
                <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center mb-2">
                  <Globe className="w-5 h-5 text-sky-600" />
                </div>
                <p className="font-bold text-blue-950 text-sm">IGF Global</p>
                <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">Parte de la red mundial de capítulos nacionales</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── POR QUÉ IMPORTA ── */}
      <section className="py-24 bg-slate-50 bg-grid-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <p className="section-label">
              <span className="w-5 h-px bg-sky-500" />
              Relevancia
            </p>
            <h2 className="section-title text-4xl sm:text-5xl mb-5">
              ¿Por qué importa la gobernanza de Internet?
            </h2>
            <p className="text-slate-500 text-[15px] leading-relaxed">
              Las decisiones sobre Internet afectan derechos, desarrollo y democracia. Estos son los temas concretos que importan para Guatemala.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {whyMatters.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="card group flex items-center gap-4 px-5 py-4 cursor-default"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-50 group-hover:bg-sky-100 flex items-center justify-center flex-shrink-0 transition-colors">
                  <Icon className="w-5 h-5 text-sky-600" />
                </div>
                <span className="text-slate-700 font-medium text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRINCIPIOS ── */}
      {settings.show_principles === 'true' && (
        <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1565c0 60%, #0369a1 100%)' }}>
          <div className="absolute inset-0 bg-grid" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-sky-600/8 blur-[120px] pointer-events-none" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="section-label-dark justify-center">
                <span className="w-5 h-px bg-sky-500" />
                Valores
                <span className="w-5 h-px bg-sky-500" />
              </p>
              <h2 className="section-title-dark text-4xl sm:text-5xl mb-4">Principios del IGF Guatemala</h2>
              <p className="text-slate-400 max-w-xl mx-auto text-[15px]">
                Los valores fundamentales que guían cada acción, conversación y decisión del capítulo.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {principles.map((p, i) => (
                <div
                  key={p}
                  className="card-dark group px-5 py-4 text-center cursor-default"
                >
                  <div className="text-xs font-black text-sky-500/40 mb-2 font-mono tracking-widest">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <p className="text-white font-medium text-sm leading-relaxed">{p}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/principios" className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 font-semibold text-sm transition-colors group">
                Ver declaración de principios
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── COMUNIDAD ── */}
      {settings.show_community === 'true' && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="section-label justify-center">
                <span className="w-5 h-px bg-sky-500" />
                Participantes
                <span className="w-5 h-px bg-sky-500" />
              </p>
              <h2 className="section-title text-4xl sm:text-5xl mb-4">Comunidad Multiactor</h2>
              <p className="text-slate-500 max-w-xl mx-auto text-[15px]">
                Una plataforma compartida donde todos los sectores participan en igualdad de condiciones.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stakeholders.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="card group p-6 text-center cursor-default">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-sky-50 to-sky-100 group-hover:from-sky-100 group-hover:to-blue-100 flex items-center justify-center mb-4 transition-all">
                    <Icon className="w-6 h-6 text-sky-600" />
                  </div>
                  <h3 className="font-bold text-blue-950 text-sm mb-1">{label}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/comunidad" className="btn-ghost text-sm">
                Conoce la comunidad
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── EJES TEMÁTICOS ── */}
      {settings.show_themes === 'true' && (
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
              <div>
                <p className="section-label">
                  <span className="w-5 h-px bg-sky-500" />
                  Agenda permanente
                </p>
                <h2 className="section-title text-4xl sm:text-5xl">Ejes Temáticos</h2>
              </div>
              <Link to="/ejes" className="btn-ghost text-sm self-start lg:self-auto flex-shrink-0">
                Ver todos los ejes
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {themes.map(({ icon: Icon, title, num }) => (
                <div key={num} className="card group p-6 hover:-translate-y-1 cursor-default">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 group-hover:bg-sky-100 flex items-center justify-center flex-shrink-0 transition-colors">
                      <Icon className="w-5 h-5 text-sky-600" />
                    </div>
                    <span className="text-xs font-black font-mono text-sky-400/50 tracking-widest">{num}</span>
                  </div>
                  <p className="text-slate-700 font-semibold text-sm leading-relaxed">{title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── EVENTO ANUAL CTA ── */}
      <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #0ea5e9 100%)' }}>
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute right-0 top-0 h-full w-1/2 pointer-events-none">
          <div className="h-full w-full bg-gradient-to-l from-white/5 to-transparent" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-xs font-semibold mb-6 tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
                Próximo evento
              </div>
              <h2 className="font-display font-bold text-white text-4xl sm:text-5xl mb-4 leading-tight">
                Evento Anual<br />
                <span className="text-sky-200">IGF Guatemala {settings.event_year}</span>
              </h2>
              <p className="text-sky-100/80 italic text-base mb-6">
                "{settings.event_lema}"
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sky-100/80 text-sm mb-8">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-sky-300" />{settings.event_date}</span>
                <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-sky-300" />{settings.event_location}</span>
              </div>
              <div className="flex gap-3">
                <Link to="/evento" className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-sky-700 font-bold rounded-xl hover:bg-sky-50 transition-all hover:scale-[1.02] shadow-lg">
                  Ver evento anual
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/evento#registro" className="btn-outline">
                  Registrarme
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
                <img
                  src="https://images.pexels.com/photos/2833037/pexels-photo-2833037.jpeg?auto=compress&cs=tinysrgb&w=700"
                  alt="Evento IGF Guatemala"
                  className="w-full h-72 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-sky-900/30 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EDICIONES ANTERIORES ── */}
      {settings.show_past_editions === 'true' && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="section-label justify-center">
                <span className="w-5 h-px bg-sky-500" />
                Historial
                <span className="w-5 h-px bg-sky-500" />
              </p>
              <h2 className="section-title text-4xl sm:text-5xl mb-4">Ediciones Anteriores</h2>
              <p className="text-slate-500 max-w-md mx-auto text-[15px]">La memoria histórica del diálogo sobre gobernanza de Internet en Guatemala.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {pastEditions.map((ed) => (
                <div key={ed.year} className="card group p-7 hover:-translate-y-1 cursor-pointer">
                  <div className="font-display font-black text-[56px] leading-none text-slate-100 group-hover:text-sky-100 transition-colors mb-4 select-none">
                    {ed.year}
                  </div>
                  <h3 className="font-bold text-blue-950 text-lg mb-2">{ed.title}</h3>
                  <p className="text-sky-600 text-sm font-medium italic mb-3">"{ed.lema}"</p>
                  <p className="text-slate-400 text-sm mb-5">{ed.date}</p>
                  <a href="#" className="inline-flex items-center gap-1.5 text-sky-600 text-sm font-semibold hover:text-blue-700 transition-colors group/link">
                    Ver memoria
                    <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── RECURSOS ── */}
      {settings.show_resources_cta === 'true' && (
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-xl">
                  <img
                    src="https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Recursos digitales"
                    className="w-full h-72 object-cover"
                  />
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 rounded-2xl bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/30 hidden lg:flex">
                  <BookOpen className="w-10 h-10 text-white" />
                </div>
              </div>
              <div>
                <p className="section-label">
                  <span className="w-5 h-px bg-sky-500" />
                  Biblioteca
                </p>
                <h2 className="section-title text-4xl sm:text-5xl mb-5">Recursos y Materiales</h2>
                <p className="text-slate-500 text-[15px] leading-relaxed mb-6">
                  Documentos, guías, relatorías, publicaciones y materiales para entender y participar en el debate sobre gobernanza de Internet.
                </p>
                <ul className="space-y-2.5 mb-8">
                  {[
                    'Documentos del IGF Global',
                    'Guías sobre gobernanza de Internet',
                    'Publicaciones sobre derechos digitales',
                    'Relatorías y memorias de eventos',
                    'Glosario de gobernanza de Internet',
                    'Materiales para docentes y funcionarios',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-slate-600 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-sky-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to="/recursos" className="btn-primary text-sm">
                  Explorar biblioteca
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── TRANSPARENCIA ── */}
      <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)' }}>
        <div className="absolute inset-0 bg-grid pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="section-label-dark">
                <span className="w-5 h-px bg-sky-500" />
                Gobernanza abierta
              </p>
              <h2 className="section-title-dark text-4xl sm:text-5xl mb-5">Transparencia y Legitimidad</h2>
              <p className="text-slate-400 text-[15px] leading-relaxed mb-8">
                El IGF Guatemala opera bajo principios de transparencia total. Accede al comité organizador, criterios de participación, código de conducta y memorias del proceso.
              </p>
              <Link to="/transparencia" className="inline-flex items-center gap-2 px-6 py-3 border border-sky-500/40 text-sky-300 font-semibold rounded-xl hover:border-sky-400 hover:bg-sky-400/10 transition-all">
                Ver sección de transparencia
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Users, label: 'Comité Organizador', desc: 'Quiénes coordinan el proceso' },
                { icon: BookOpen, label: 'Código de Conducta', desc: 'Normas de convivencia' },
                { icon: Eye, label: 'Criterios', desc: 'Cómo se seleccionan sesiones' },
                { icon: Globe, label: 'Aliados', desc: 'Organizaciones de apoyo' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="card-dark p-5">
                  <Icon className="w-6 h-6 text-sky-400 mb-3" />
                  <h4 className="font-semibold text-white text-sm mb-1">{label}</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── BLOG ── */}
      {settings.show_blog === 'true' && blogPosts.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="section-label">
                  <span className="w-5 h-px bg-sky-500" />
                  Blog
                </p>
                <h2 className="section-title text-4xl sm:text-5xl">Últimas publicaciones</h2>
              </div>
              <Link to="/blog" className="btn-ghost text-sm flex-shrink-0">
                Ver todo <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="card group flex flex-col overflow-hidden hover:-translate-y-1"
                >
                  <div className="h-44 overflow-hidden">
                    {post.cover_url ? (
                      <img
                        src={post.cover_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-sky-200" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 p-5">
                    <span className="text-xs font-semibold text-sky-600 mb-2">{post.category}</span>
                    <h3 className="font-bold text-blue-950 group-hover:text-sky-700 transition-colors leading-snug mb-2 line-clamp-2 text-[15px]">{post.title}</h3>
                    {post.excerpt && <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 flex-1">{post.excerpt}</p>}
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100 text-slate-400 text-xs">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author}</span>
                      <span className="flex items-center gap-1 ml-auto">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.published_at ?? post.created_at).toLocaleDateString('es-GT', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
