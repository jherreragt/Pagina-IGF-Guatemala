import { Scale, Globe, Users, TrendingUp, Heart, ShieldCheck } from 'lucide-react';
import PageHero from '../components/PageHero';

const principles = [
  {
    num: '01',
    icon: Globe,
    title: 'Abierto y transparente',
    desc: 'El IGF Guatemala es un espacio abierto a la participación de cualquier persona interesada en el debate sobre gobernanza de Internet, sin barreras de acceso. Los procesos de organización, selección de sesiones, criterios de participación, fuentes de financiamiento y resultados son públicos y accesibles.',
  },
  {
    num: '02',
    icon: Users,
    title: 'Inclusivo',
    desc: 'Se promueve activamente la participación de grupos históricamente marginados: mujeres, juventudes, pueblos indígenas, personas con discapacidad y comunidades rurales. Todos los actores participan en igualdad de condiciones.',
  },
  {
    num: '03',
    icon: TrendingUp,
    title: 'De abajo hacia arriba',
    desc: 'Las temáticas y prioridades surgen de las bases y de las comunidades, no de una agenda impuesta desde arriba. El diálogo se construye desde las necesidades reales del país.',
  },
  {
    num: '04',
    icon: Heart,
    title: 'De múltiples partes interesadas',
    desc: 'Gobierno, sociedad civil, sector privado, comunidad técnica, academia, juventudes y organismos internacionales participan en igualdad de condiciones, mediante un proceso abierto e inclusivo.',
  },
  {
    num: '05',
    icon: ShieldCheck,
    title: 'No comercial',
    desc: 'El IGF Guatemala no tiene fines de lucro. Los apoyos recibidos son transparentes y no condicionan la agenda ni los contenidos del proceso.',
  },
];

export default function Principles() {
  return (
    <div className="pt-16 sm:pt-24">
      <PageHero
        icon={<Scale className="w-7 h-7" />}
        eyebrow="Valores"
        title="Principios del"
        titleAccent="IGF"
        subtitle="Facilita un entendimiento común sobre el cómo maximizar las oportunidades de Internet, y de gestionar los riesgos y retos que implica."
      />

      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {principles.map(({ num, icon: Icon, title, desc }) => (
              <div
                key={num}
                className="group p-7 rounded-2xl border border-slate-100 hover:border-brand-200 hover:shadow-card-hover transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-brand-50 group-hover:bg-brand-100 flex items-center justify-center transition-colors">
                    <Icon className="w-5 h-5 text-brand-600" />
                  </div>
                  <div className="font-mono font-black text-2xl text-brand-500/20 group-hover:text-brand-500/30 transition-colors">{num}</div>
                </div>
                <h3 className="font-display font-bold text-brand-900 text-lg mb-3">{title}</h3>
                <p className="text-slate-500 text-[15px] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-brand-50 rounded-2xl border border-brand-100 text-center">
            <p className="text-brand-900 text-[15px] leading-relaxed font-medium">
              Facilita un entendimiento común sobre el cómo maximizar las oportunidades de Internet, y de gestionar los riesgos y retos que implica.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
