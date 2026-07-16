import { Link } from 'react-router-dom';
import { Globe, ArrowRight, ExternalLink, Users, Heart } from 'lucide-react';
import PageHero from '../components/PageHero';

export default function About() {
  return (
    <div className="pt-16 sm:pt-24">
      <PageHero
        icon={<Globe className="w-7 h-7" />}
        eyebrow="Capítulo Nacional"
        title="Sobre IGF"
        titleAccent="Guatemala"
        subtitle="El espacio nacional de diálogo multiactor sobre gobernanza de Internet, vinculado al Internet Governance Forum de las Naciones Unidas."
      />

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">

          <div className="grid sm:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="font-display font-bold text-blue-950 text-3xl mb-5">¿Qué es el IGF Guatemala?</h2>
              <p className="text-slate-500 leading-relaxed mb-4 text-[15px]">
                El IGF Guatemala es el capítulo nacional del Internet Governance Forum (IGF), el principal foro multilateral de las Naciones Unidas dedicado al diálogo sobre políticas de Internet.
              </p>
              <p className="text-slate-500 leading-relaxed mb-4 text-[15px]">
                Funciona como un espacio de diálogo abierto, sin fines de lucro y sin ánimo de apropiación por parte de ningún sector. Todos los actores participan en igualdad de condiciones.
              </p>
              <p className="text-slate-500 leading-relaxed text-[15px]">
                No toma decisiones vinculantes ni tiene mandato regulatorio. Su función es generar recomendaciones, construir puentes entre sectores y fortalecer capacidades.
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img
                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=700"
                alt="IGF Guatemala"
                className="w-full h-60 object-cover"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-12">
            <h2 className="font-display font-bold text-blue-950 text-3xl mb-5">Vínculo con el IGF Global</h2>
            <p className="text-slate-500 leading-relaxed mb-4 text-[15px]">
              El IGF global fue creado en 2006 como resultado de la Cumbre Mundial sobre la Sociedad de la Información (CMSI). Se reúne anualmente para discutir temas de política de Internet con participación de múltiples sectores a nivel mundial.
            </p>
            <p className="text-slate-500 leading-relaxed mb-6 text-[15px]">
              Los Foros Nacionales e Iniciativas (NRIs) son capítulos nacionales, regionales o temáticos que replican la metodología del IGF global a nivel local. El IGF Guatemala es uno de esos capítulos y mantiene vínculos activos con la secretaría del IGF global.
            </p>
            <a
              href="https://www.intgovforum.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sky-600 font-semibold hover:text-blue-700 transition-colors text-sm"
            >
              Visitar el IGF Global
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="border-t border-slate-100 pt-12">
            <h2 className="font-display font-bold text-blue-950 text-3xl mb-8">Función y alcance</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: 'Diálogo multisectorial', desc: 'Espacios para que todos los sectores discutan en igualdad de condiciones los retos digitales del país.' },
                { title: 'Generación de recomendaciones', desc: 'Construimos propuestas y recomendaciones de política que aportan al debate nacional.' },
                { title: 'Vinculación global', desc: 'Conectamos a Guatemala con las discusiones y debates globales sobre el futuro de Internet.' },
                { title: 'Fortalecimiento de capacidades', desc: 'Formamos a personas y organizaciones en gobernanza de Internet y políticas tecnológicas.' },
              ].map(({ title, desc }) => (
                <div key={title} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-sky-200 hover:shadow-md transition-all">
                  <h3 className="font-bold text-blue-950 mb-2">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── EQUIPO ORGANIZADOR ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="section-label justify-center">
              <span className="w-5 h-px bg-sky-500" />
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
                  <h3 className="font-bold text-blue-950 text-[15px]">{name}</h3>
                  <p className="text-slate-500 text-xs mt-1 leading-snug">{role}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-slate-400 text-sm">
              ¿Quieres ser parte del equipo organizador?{' '}
              <Link to="/contacto" className="text-sky-600 font-semibold hover:text-sky-700">Contáctanos</Link>
            </p>
          </div>
        </div>
      </section>

      {/* ── ALIADOS ── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="section-label justify-center">
              <span className="w-5 h-px bg-sky-500" />
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
            <Heart className="w-5 h-5 text-sky-500 flex-shrink-0" />
            <p className="text-slate-600 text-sm">
              ¿Tu organización quiere ser aliada del IGF Guatemala?{' '}
              <Link to="/contacto" className="text-sky-600 font-semibold hover:text-sky-700">Escríbenos</Link>
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-sky-50 border-t border-sky-100">
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
