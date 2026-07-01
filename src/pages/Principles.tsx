import { Scale } from 'lucide-react';
import PageHero from '../components/PageHero';

const principles = [
  {
    num: '01', title: 'Apertura',
    desc: 'El IGF Guatemala es un espacio abierto a la participación de cualquier persona interesada en el debate sobre gobernanza de Internet, sin barreras de acceso.',
  },
  {
    num: '02', title: 'Inclusión',
    desc: 'Se promueve activamente la participación de grupos históricamente marginados: mujeres, juventudes, pueblos indígenas, personas con discapacidad y comunidades rurales.',
  },
  {
    num: '03', title: 'Participación multiactor',
    desc: 'Gobierno, sociedad civil, sector privado, comunidad técnica, academia, juventudes y organismos internacionales participan en igualdad de condiciones.',
  },
  {
    num: '04', title: 'Transparencia',
    desc: 'Los procesos de organización, selección de sesiones, criterios de participación, fuentes de financiamiento y resultados son públicos y accesibles.',
  },
  {
    num: '05', title: 'Neutralidad política',
    desc: 'El IGF Guatemala no toma partido político ni favorece posiciones de ningún partido. Es un espacio técnico y de diálogo de políticas públicas.',
  },
  {
    num: '06', title: 'Respeto y no discriminación',
    desc: 'Todas las personas participantes merecen un trato digno. No se tolera ningún tipo de discriminación por género, etnia, origen, orientación sexual ni discapacidad.',
  },
  {
    num: '07', title: 'Construcción de consensos',
    desc: 'El objetivo no es imponer posiciones, sino identificar puntos de encuentro y generar recomendaciones que reflejen la diversidad de perspectivas.',
  },
  {
    num: '08', title: 'Enfoque de derechos humanos',
    desc: 'El diálogo se ancla en los estándares internacionales de derechos humanos, reconociendo que Internet es una plataforma esencial para ejercer derechos fundamentales.',
  },
  {
    num: '09', title: 'Perspectiva de género e inclusión',
    desc: 'Se integra una perspectiva de género transversal en todos los espacios, reconociendo las desigualdades estructurales que afectan el acceso y uso de Internet.',
  },
  {
    num: '10', title: 'Participación juvenil',
    desc: 'Las juventudes son actores estratégicos. Se reservan espacios específicos y se fomenta su liderazgo en todos los procesos del capítulo.',
  },
  {
    num: '11', title: 'Carácter no comercial',
    desc: 'El IGF Guatemala no tiene fines de lucro. Los apoyos recibidos son transparentes y no condicionan la agenda ni los contenidos del proceso.',
  },
  {
    num: '12', title: 'Diálogo basado en evidencia',
    desc: 'Las discusiones se fundamentan en datos, investigaciones y buenas prácticas. Se fomenta el pensamiento crítico y el debate fundamentado.',
  },
];

export default function Principles() {
  return (
    <div className="pt-16 sm:pt-24">
      <PageHero
        icon={<Scale className="w-7 h-7" />}
        eyebrow="Valores"
        title="Principios del"
        titleAccent="IGF Guatemala"
        subtitle="Los valores fundamentales que guían cada acción, conversación y decisión del capítulo nacional."
      />

      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {principles.map(({ num, title, desc }) => (
              <div
                key={num}
                className="group p-7 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-card-hover transition-all duration-200"
              >
                <div className="font-mono font-black text-3xl text-emerald-500/20 mb-3 group-hover:text-emerald-500/30 transition-colors">{num}</div>
                <h3 className="font-display font-bold text-green-950 text-lg mb-3">{title}</h3>
                <p className="text-slate-500 text-[15px] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
