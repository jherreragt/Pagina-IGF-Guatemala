import { Link } from 'react-router-dom';
import {
  Globe, Users, ShieldCheck, Wifi, Scale, BookOpen, MessageSquare,
  ArrowRight, ChevronRight, Building2, GraduationCap, Laptop, Heart,
  Lightbulb, TrendingUp, Lock, Database, Zap, Radio, Calendar, User,
  Award, Network, Server, Cpu, Cloud, FileText, Microscope, Eye,
  type LucideIcon,
} from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useEffect, useState } from 'react';
import { supabase, BlogPost, HomeStat, HomeWhyMatter, HomePrinciple, HomeStakeholder } from '../lib/supabase';
import Countdown from '../components/Countdown';
import YouTubeWebinars from '../components/YouTubeWebinars';

const ICON_MAP: Record<string, LucideIcon> = {
  Globe, Users, ShieldCheck, Wifi, Scale, BookOpen, MessageSquare,
  ArrowRight, ChevronRight, Building2, GraduationCap, Laptop, Heart,
  Lightbulb, TrendingUp, Lock, Database, Zap, Radio, Calendar, User,
  Award, Network, Server, Cpu, Cloud, FileText, Microscope, Eye,
};

function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Globe;
}

export default function Home() {
  const { settings } = useSiteSettings();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [stats, setStats] = useState<HomeStat[]>([]);
  const [whyMatters, setWhyMatters] = useState<HomeWhyMatter[]>([]);
  const [principles, setPrinciples] = useState<HomePrinciple[]>([]);
  const [stakeholders, setStakeholders] = useState<HomeStakeholder[]>([]);

  useEffect(() => {
    supabase
      .from('home_stats')
      .select('*')
      .eq('published', true)
      .order('sort_order')
      .then(({ data }) => setStats((data as HomeStat[]) ?? []));

    supabase
      .from('home_why_matters')
      .select('*')
      .eq('published', true)
      .order('sort_order')
      .then(({ data }) => setWhyMatters((data as HomeWhyMatter[]) ?? []));

    supabase
      .from('home_principles')
      .select('*')
      .eq('published', true)
      .order('sort_order')
      .then(({ data }) => setPrinciples((data as HomePrinciple[]) ?? []));

    supabase
      .from('home_stakeholders')
      .select('*')
      .eq('published', true)
      .order('sort_order')
      .then(({ data }) => setStakeholders((data as HomeStakeholder[]) ?? []));
  }, []);

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

  const resourcesList = (settings.resources_list || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a1118 0%, #16293f 55%, #274f7e 100%)' }}>
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
            <span className="text-sky-300 text-xs font-semibold tracking-widest uppercase">{settings.home_badge_text}</span>
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
              {settings.hero_btn_1_text}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/contacto" className="btn-outline text-base px-7 py-3.5">
              {settings.hero_btn_2_text}
            </Link>
            <Link to="/recursos" className="btn-outline text-base px-7 py-3.5">
              {settings.hero_btn_3_text}
            </Link>
          </div>

          {/* Stats row */}
          {stats.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/[0.08] pt-12 max-w-2xl mx-auto">
              {stats.map((stat) => {
                const Icon = getIcon(stat.icon_name);
                return (
                  <div key={stat.id} className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Icon className="w-4 h-4 text-sky-500/40 mr-1.5" />
                      <div className="font-display font-bold text-2xl sm:text-3xl text-sky-300">{stat.number}</div>
                    </div>
                    <div className="text-slate-400 text-xs font-medium">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          )}
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
              {settings.about_extra_1 && (
                <p className="text-slate-500 leading-relaxed mb-5 text-[15px]">
                  {settings.about_extra_1}
                </p>
              )}
              {settings.about_extra_2 && (
                <p className="text-slate-500 leading-relaxed mb-8 text-[15px]">
                  {settings.about_extra_2}
                </p>
              )}
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
      {whyMatters.length > 0 && (
        <section className="py-24 bg-slate-50 bg-grid-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-14">
              <p className="section-label">
                <span className="w-5 h-px bg-sky-500" />
                Relevancia
              </p>
              <h2 className="section-title text-4xl sm:text-5xl mb-5">
                {settings.why_matters_title}
              </h2>
              <p className="text-slate-500 text-[15px] leading-relaxed">
                {settings.why_matters_intro}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {whyMatters.map((item) => {
                const Icon = getIcon(item.icon_name);
                return (
                  <div key={item.id} className="card group flex items-center gap-4 px-5 py-4 cursor-default">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 group-hover:bg-sky-100 flex items-center justify-center flex-shrink-0 transition-colors">
                      <Icon className="w-5 h-5 text-sky-600" />
                    </div>
                    <span className="text-slate-700 font-medium text-sm">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── PRINCIPIOS ── */}
      {settings.show_principles === 'true' && principles.length > 0 && (
        <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #111c2b 0%, #16293f 60%, #1d3a5d 100%)' }}>
          <div className="absolute inset-0 bg-grid" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-sky-600/8 blur-[120px] pointer-events-none" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="section-label-dark justify-center">
                <span className="w-5 h-px bg-sky-500" />
                Valores
                <span className="w-5 h-px bg-sky-500" />
              </p>
              <h2 className="section-title-dark text-4xl sm:text-5xl mb-4">{settings.principles_title}</h2>
              <p className="text-slate-400 max-w-xl mx-auto text-[15px]">
                {settings.principles_intro}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {principles.map((p, i) => (
                <div key={p.id} className="card-dark group px-5 py-4 text-center cursor-default">
                  <div className="text-xs font-black text-sky-500/40 mb-2 font-mono tracking-widest">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <p className="text-white font-medium text-sm leading-relaxed">{p.label}</p>
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
      {settings.show_community === 'true' && stakeholders.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="section-label justify-center">
                <span className="w-5 h-px bg-sky-500" />
                Participantes
                <span className="w-5 h-px bg-sky-500" />
              </p>
              <h2 className="section-title text-4xl sm:text-5xl mb-4">{settings.community_title}</h2>
              <p className="text-slate-500 max-w-xl mx-auto text-[15px]">
                {settings.community_intro}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stakeholders.map((item) => {
                const Icon = getIcon(item.icon_name);
                return (
                  <div key={item.id} className="card group p-6 text-center cursor-default">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-sky-50 to-sky-100 group-hover:from-sky-100 group-hover:to-blue-100 flex items-center justify-center mb-4 transition-all">
                      <Icon className="w-6 h-6 text-sky-600" />
                    </div>
                    <h3 className="font-bold text-blue-950 text-sm mb-1">{item.label}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">{item.description}</p>
                  </div>
                );
              })}
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

      {/* ── EVENTO ANUAL CTA ── */}
      <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #16293f 0%, #1d3a5d 50%, #274f7e 100%)' }}>
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute right-0 top-0 h-full w-1/2 pointer-events-none">
          <div className="h-full w-full bg-gradient-to-l from-white/5 to-transparent" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-xs font-semibold mb-6 tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
                {settings.event_cta_badge}
              </div>
              <h2 className="font-display font-bold text-white text-4xl sm:text-5xl mb-4 leading-tight">
                {settings.event_cta_title}<br />
                <span className="text-sky-200">IGF Guatemala {settings.event_year}</span>
              </h2>
              <p className="text-sky-100/80 italic text-base mb-6">
                "{settings.event_lema}"
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sky-100/80 text-sm mb-8">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-sky-300" />{settings.event_date}</span>
                <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-sky-300" />{settings.event_location}</span>
              </div>

              <div className="mb-8">
                <Countdown targetDate={new Date(settings.event_datetime_iso)} />
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
              <h2 className="section-title text-4xl sm:text-5xl mb-4">{settings.past_editions_title}</h2>
              <p className="text-slate-500 max-w-md mx-auto text-[15px]">{settings.past_editions_intro}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { year: '2023', title: 'IGF Guatemala 2023', lema: 'Por una Internet libre, segura y confiable', date: 'Octubre 2023' },
                { year: '2022', title: 'IGF Guatemala 2022', lema: 'Gobernanza de Internet para el desarrollo sostenible', date: 'Noviembre 2022' },
                { year: '2021', title: 'IGF Guatemala 2021', lema: 'Internet inclusivo y resiliente', date: 'Octubre 2021' },
              ].map((ed) => (
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
                <h2 className="section-title text-4xl sm:text-5xl mb-5">{settings.resources_title}</h2>
                <p className="text-slate-500 text-[15px] leading-relaxed mb-6">
                  {settings.resources_intro}
                </p>
                {resourcesList.length > 0 && (
                  <ul className="space-y-2.5 mb-8">
                    {resourcesList.map((item) => (
                      <li key={item} className="flex items-center gap-3 text-slate-600 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-sky-500 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
                <Link to="/recursos" className="btn-primary text-sm">
                  Explorar biblioteca
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── WEBINARS YOUTUBE ── */}
      <section className="py-24 bg-white">
        <YouTubeWebinars
          channelId={settings.youtube_channel_id || undefined}
          playlistId={settings.youtube_playlist_id || undefined}
          channelName={settings.youtube_channel_name || 'IGF Guatemala'}
        />
      </section>

      {/* ── ALIADOS ESTRATÉGICOS ── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="section-label justify-center">
              <span className="w-5 h-px bg-sky-500" />
              Aliados
              <span className="w-5 h-px bg-sky-500" />
            </p>
            <h2 className="section-title text-3xl sm:text-4xl mb-3">Aliados Estratégicos y Patrocinadores</h2>
            <p className="text-slate-500 text-[15px] max-w-2xl mx-auto">
              Con el respaldo de organizaciones comprometidas con un Internet abierto, seguro e inclusivo para Guatemala.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
            {[
              { name: 'Red Ciudadana', url: 'https://redciudadana.org', logo: '/logo_red_ciudadana2.png' },
              { name: 'Tecnopedagogia', url: '#', logo: '/Logo_Tecnopedagogia.jpeg' },
              { name: 'Observatorio', url: '#', logo: '/Logo_observatorio_nuevo_png.png' },
              { name: 'UNIS', url: '#', logo: '/Logo_UNIS.jpeg' },
              { name: 'IGF Ginebra', url: 'https://www.intgovforum.org', logo: '/igflogo2.png' },
              { name: 'RPSC', url: '#', logo: '/IMG-Rpsc.jpg' },
            ].map(({ name, url, logo }) => (
              <a
                key={name}
                href={url}
                target={url !== '#' ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="group flex flex-col items-center justify-center gap-3 p-6 bg-white border border-slate-100 rounded-2xl hover:border-sky-200 hover:shadow-md transition-all min-h-[160px]"
              >
                {logo ? (
                  <div className="h-16 flex items-center justify-center">
                    <img
                      src={logo}
                      alt={name}
                      className="max-h-16 max-w-[120px] object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-slate-50 group-hover:bg-sky-50 flex items-center justify-center transition-colors">
                    <Building2 className="w-7 h-7 text-slate-400 group-hover:text-sky-600 transition-colors" />
                  </div>
                )}
                <span className="font-display font-bold text-slate-600 group-hover:text-blue-950 text-sm text-center leading-snug transition-colors">
                  {name}
                </span>
              </a>
            ))}
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
