import { Link } from 'react-router-dom';
import { Globe, ArrowRight, ExternalLink, Users, Heart, BookOpen } from 'lucide-react';
import PageHero from '../components/PageHero';

const historyTimeline = [
  { year: '2003', text: 'Naciones Unidas organizó el World Summit of the Information Society o WSIS, por sus siglas en inglés, donde surgió la necesidad de profundizar en el tema de la Gobernanza de Internet.' },
  { year: '2005', text: 'En el WSIS se acordó que la gobernanza de internet englobe más que solamente dominios, protocolos y direcciones IP.' },
  { year: '2006', text: 'Nace un proceso abierto basado en reuniones virtuales de múltiples partes, traducción simultánea y un archivo de discusiones plasmadas en el sitio de IGF. Se sentó un precedente para foros a nivel mundial.' },
];

const igfMeetings = [
  '2006 — IGF Athens, Greece',
  '2007 — IGF Rio de Janeiro, Brazil',
  '2008 — IGF Hyderabad, India',
  '2009 — IGF Sharm El Sheikh, Egypt',
  '2010 — IGF Vilnius, Lithuania',
  '2011 — IGF Nairobi, Kenya',
  '2012 — IGF Baku, Azerbaijan',
  '2013 — IGF Bali, Indonesia',
  '2014 — IGF Istanbul, Turkey',
  '2015 — IGF João Pessoa, Brasil',
  '2016 — IGF Jalisco, México',
  '2017 — IGF Geneva',
  '2018 — IGF Paris',
  '2019 — IGF Berlín, Alemania',
];

const igfPrinciples = [
  { title: 'Abierto y transparente' },
  { title: 'Inclusivo' },
  { title: 'De abajo hacia arriba' },
  { title: 'De múltiples partes interesadas' },
  { title: 'No comercial' },
];

export default function About() {
  return (
    <div className="pt-16 sm:pt-24">
      <PageHero
        icon={<Globe className="w-7 h-7" />}
        eyebrow="Sobre el IGF"
        title="Gobernanza de la Internet"
        titleAccent="en Guatemala"
        subtitle="El espacio nacional de diálogo multiactor sobre gobernanza de Internet, vinculado al Internet Governance Forum de las Naciones Unidas."
      />

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

          {/* ¿Qué es la Gobernanza de la Internet? */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-brand-600" />
              </div>
              <h2 className="font-display font-bold text-brand-900 text-3xl">¿Qué es la Gobernanza de la Internet?</h2>
            </div>
            <p className="text-slate-600 leading-relaxed text-[15px]">
              Se refiere a los procesos y normas que afectan la forma en que se gestiona Internet. El éxito histórico y futuro de Internet como plataforma abierta y confiable para la innovación y el empoderamiento depende de la adopción de un enfoque descentralizado, colaborativo y de múltiples partes interesadas.
            </p>
            <p className="text-slate-400 text-xs mt-3 italic">Fuente: Internet Society</p>
          </div>

          {/* ¿Qué es el IGF? */}
          <div className="border-t border-slate-100 pt-12">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-brand-600" />
              </div>
              <h2 className="font-display font-bold text-brand-900 text-3xl">¿Qué es el IGF (Internet Governance Forum)?</h2>
            </div>
            <p className="text-slate-600 leading-relaxed mb-4 text-[15px]">
              Las Iniciativas del IGF (Internet Governance Forum) o FGI —por sus siglas en español— son foros organizados como un reflejo del Foro Mundial que se realiza todos los años.
            </p>
            <p className="text-slate-600 leading-relaxed text-[15px]">
              Busca ser un espacio único de diálogo que reúna a todas las partes interesadas del ecosistema de internet, incluyendo expertos nacionales e internacionales, gobierno, sector privado, sociedad civil, comunidad técnica y académica en igualdad de condiciones y mediante un proceso abierto e inclusivo para ser un referente del tema y crear conciencia del uso y manejo del mismo, en el país.
            </p>
          </div>

          {/* Historia del IGF */}
          <div className="border-t border-slate-100 pt-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-brand-600" />
              </div>
              <h2 className="font-display font-bold text-brand-900 text-3xl">Historia del IGF</h2>
            </div>

            {/* Timeline */}
            <div className="relative pl-6 border-l-2 border-brand-100 space-y-8 mb-12">
              {historyTimeline.map(({ year, text }) => (
                <div key={year} className="relative">
                  <div className="absolute -left-[31px] w-5 h-5 rounded-full bg-brand-500 border-4 border-white shadow" />
                  <div className="font-display font-bold text-brand-600 text-xl mb-2">{year}</div>
                  <p className="text-slate-600 leading-relaxed text-[15px]">{text}</p>
                </div>
              ))}
            </div>

            {/* Reuniones IGF */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <p className="font-semibold text-brand-900 text-sm mb-4 uppercase tracking-wider">Reuniones del IGF Mundial</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                {igfMeetings.map((meeting) => (
                  <p key={meeting} className="text-slate-600 text-sm leading-relaxed flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
                    {meeting}
                  </p>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="text-center p-6 bg-brand-900 rounded-2xl">
                <div className="text-3xl font-black text-white">21+</div>
                <div className="text-brand-200 text-xs mt-1">iniciativas nacionales</div>
              </div>
              <div className="text-center p-6 bg-brand-800 rounded-2xl">
                <div className="text-3xl font-black text-white">12+</div>
                <div className="text-brand-200 text-xs mt-1">regionales/sub-regionales</div>
              </div>
            </div>
          </div>

          {/* Principios del IGF */}
          <div className="border-t border-slate-100 pt-12">
            <h2 className="font-display font-bold text-brand-900 text-3xl mb-8">Principios del IGF</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {igfPrinciples.map(({ title }, i) => (
                <div key={title} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-brand-200 hover:shadow-md transition-all">
                  <div className="text-xs font-black text-brand-400/70 mb-2 font-mono">{String(i + 1).padStart(2, '0')}</div>
                  <h3 className="font-bold text-brand-900">{title}</h3>
                </div>
              ))}
            </div>
            <p className="text-slate-600 leading-relaxed text-[15px] bg-brand-50 p-5 rounded-2xl border border-brand-100">
              Facilita un entendimiento común sobre el cómo maximizar las oportunidades de Internet, y de gestionar los riesgos y retos que implica.
            </p>
          </div>

          {/* Fases del IGF */}
          <div className="border-t border-slate-100 pt-12">
            <h2 className="font-display font-bold text-brand-900 text-3xl mb-8">Fases del IGF</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-7 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-brand-600" />
                </div>
                <h3 className="font-display font-bold text-brand-900 text-xl mb-3">Conversatorios</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-3">
                  Se llevarán a cabo varios conversatorios con expertos, sobre distintos temas de gobernanza de interés en nuestro país. Inician el 21 de octubre.
                </p>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Los temas son de actualidad, pensamos que son de importancia a los usuarios de Internet de nuestro país.
                </p>
              </div>
              <div className="p-7 bg-brand-900 rounded-2xl shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-brand-300" />
                </div>
                <h3 className="font-display font-bold text-white text-xl mb-3">Evento IGF</h3>
                <p className="text-brand-100 text-sm leading-relaxed mb-3">
                  Se presentarán el 24 de noviembre en un solo evento en el cual presentaremos las conclusiones y recomendaciones de los conversatorios, los cuales estarán también en discusión por quienes participen.
                </p>
                <p className="text-brand-200 text-sm leading-relaxed">
                  Es un evento dinámico y participativo que busca compartir el conocimiento generado durante los conversatorios.
                </p>
              </div>
            </div>
          </div>

          {/* Vínculo con IGF Global */}
          <div className="border-t border-slate-100 pt-12">
            <h2 className="font-display font-bold text-brand-900 text-3xl mb-5">Vínculo con el IGF Global</h2>
            <p className="text-slate-600 leading-relaxed mb-4 text-[15px]">
              El IGF global fue creado en 2006 como resultado de la Cumbre Mundial sobre la Sociedad de la Información (CMSI). Se reúne anualmente para discutir temas de política de Internet con participación de múltiples sectores a nivel mundial.
            </p>
            <a
              href="https://www.intgovforum.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-brand-600 font-semibold hover:text-brand-700 transition-colors text-sm"
            >
              Visitar el IGF Global
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── EQUIPO ORGANIZADOR ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="section-label justify-center">
              <span className="w-5 h-px bg-brand-500" />
              Equipo
            </p>
            <h2 className="section-title text-4xl sm:text-5xl mb-4">Equipo Organizador</h2>
            <p className="text-slate-500 text-[15px] max-w-2xl mx-auto leading-relaxed">
              El IGF Guatemala es organizado por un comité multidisciplinario de profesionales comprometidos con la gobernanza de Internet en el país.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Fred Clark', role: 'Coordinador del Comité Organizador', img: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400' },
              { name: 'Álvaro Gálvez', role: 'Presidente, ISOC Guatemala', img: 'https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?auto=compress&cs=tinysrgb&w=400' },
              { name: 'Raul Solares', role: 'Vicepresidente, ISOC Guatemala', img: 'https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?auto=compress&cs=tinysrgb&w=400' },
              { name: 'Manuel Rodas', role: 'Secretario, ISOC Guatemala', img: 'https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?auto=compress&cs=tinysrgb&w=400' },
              { name: 'Jorge Guajardo', role: 'Tesorero, ISOC Guatemala', img: 'https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?auto=compress&cs=tinysrgb&w=400' },
              { name: 'Montserrat Vidal', role: 'UNESCO Guatemala', img: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400' },
              { name: 'Roman Cancinos', role: 'Derechos Humanos y Constitucional', img: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400' },
              { name: 'Jorge García', role: 'Vocal I, ISOC Guatemala', img: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400' },
            ].map(({ name, role, img }) => (
              <div key={name} className="group bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-card-hover hover:-translate-y-1 transition-all">
                <div className="relative h-56 overflow-hidden">
                  <img src={img} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-brand-900 text-[15px]">{name}</h3>
                  <p className="text-slate-500 text-xs mt-1 leading-snug">{role}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-slate-400 text-sm">
              ¿Quieres ser parte del equipo organizador?{' '}
              <Link to="/contacto" className="text-brand-600 font-semibold hover:text-brand-700">Contáctanos</Link>
            </p>
          </div>
        </div>
      </section>

      {/* ── ALIADOS ── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="section-label justify-center">
              <span className="w-5 h-px bg-brand-500" />
              Colaboradores
            </p>
            <h2 className="section-title text-4xl sm:text-5xl mb-3">Apoyo Nacional e Internacional</h2>
            <p className="text-slate-500 text-[15px] max-w-2xl mx-auto">
              El IGF Guatemala es posible gracias al apoyo de instituciones comprometidas con un Internet abierto y seguro.
            </p>
          </div>

          <div>
            <p className="text-center text-slate-400 text-xs font-semibold uppercase tracking-wider mb-5">Apoyo Internacional</p>
            <div className="flex flex-wrap justify-center items-center gap-4 mb-10">
              {['UNESCO', 'ISOC', 'Google', 'Microsoft', 'IGFSA'].map((name) => (
                <div key={name} className="px-8 py-5 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all min-w-[140px] text-center">
                  <span className="font-display font-bold text-slate-400 text-lg">{name}</span>
                </div>
              ))}
            </div>

            <p className="text-center text-slate-400 text-xs font-semibold uppercase tracking-wider mb-5">Apoyo Nacional</p>
            <div className="flex flex-wrap justify-center items-center gap-4">
              {['ISOC Guatemala', 'Intecap', 'Grupo Intersat', 'LECCO', 'URL'].map((name) => (
                <div key={name} className="px-8 py-5 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all min-w-[140px] text-center">
                  <span className="font-display font-bold text-slate-400 text-lg">{name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 p-6 bg-white border border-slate-100 rounded-2xl flex items-center gap-4 justify-center text-center">
            <Heart className="w-5 h-5 text-brand-500 flex-shrink-0" />
            <p className="text-slate-600 text-sm">
              ¿Tu organización quiere ser aliada del IGF Guatemala?{' '}
              <Link to="/contacto" className="text-brand-600 font-semibold hover:text-brand-700">Escríbenos</Link>
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-brand-50 border-t border-brand-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/principios" className="btn-primary text-sm">
            Ver principios <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/comunidad" className="btn-ghost text-sm">
            Conoce la comunidad <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
