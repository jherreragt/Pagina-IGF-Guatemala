import { Link } from 'react-router-dom';
import { Globe, ArrowRight, ExternalLink } from 'lucide-react';
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
              <h2 className="font-display font-bold text-green-950 text-3xl mb-5">¿Qué es el IGF Guatemala?</h2>
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
            <h2 className="font-display font-bold text-green-950 text-3xl mb-5">Vínculo con el IGF Global</h2>
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
              className="inline-flex items-center gap-2 text-emerald-600 font-semibold hover:text-green-700 transition-colors text-sm"
            >
              Visitar el IGF Global
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="border-t border-slate-100 pt-12">
            <h2 className="font-display font-bold text-green-950 text-3xl mb-8">Función y alcance</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: 'Diálogo multisectorial', desc: 'Espacios para que todos los sectores discutan en igualdad de condiciones los retos digitales del país.' },
                { title: 'Generación de recomendaciones', desc: 'Construimos propuestas y recomendaciones de política que aportan al debate nacional.' },
                { title: 'Vinculación global', desc: 'Conectamos a Guatemala con las discusiones y debates globales sobre el futuro de Internet.' },
                { title: 'Fortalecimiento de capacidades', desc: 'Formamos a personas y organizaciones en gobernanza de Internet y políticas tecnológicas.' },
              ].map(({ title, desc }) => (
                <div key={title} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all">
                  <h3 className="font-bold text-green-950 mb-2">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-emerald-50 border-t border-emerald-100">
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
