import { Lightbulb, ShieldCheck, Scale, Wifi, Database, Zap, Radio, TrendingUp } from 'lucide-react';
import PageHero from '../components/PageHero';

const themes = [
  {
    icon: Lightbulb,
    num: '01',
    title: 'Inteligencia artificial, datos y gobernanza digital',
    color: 'from-sky-500 to-blue-600',
    desc: 'Debate sobre el uso responsable de la inteligencia artificial, la protección de datos personales, los sesgos algorítmicos y la gobernanza de sistemas de IA en Guatemala. Incluye discusiones sobre regulación, ética digital y el rol del Estado.',
    subtopics: ['Regulación de IA en Guatemala', 'Protección de datos y privacidad', 'Sesgos algorítmicos y derechos', 'IA para servicios públicos', 'Gobernanza de datos personales'],
  },
  {
    icon: Scale,
    num: '02',
    title: 'Derechos digitales, democracia y libertad de expresión',
    color: 'from-blue-600 to-blue-800',
    desc: 'Análisis de los derechos digitales como extensión de los derechos humanos. Incluye libertad de expresión en línea, derecho al anonimato, privacidad digital, participación ciudadana digital y el rol de Internet en la democracia.',
    subtopics: ['Libertad de expresión en línea', 'Vigilancia y privacidad', 'Participación ciudadana digital', 'Derechos digitales en contextos electorales', 'Acceso a la información'],
  },
  {
    icon: ShieldCheck,
    num: '03',
    title: 'Ciberseguridad, confianza e infraestructura crítica',
    color: 'from-cyan-500 to-sky-600',
    desc: 'Protección de la infraestructura digital del país, respuesta a incidentes cibernéticos, seguridad de servicios públicos digitales y construcción de confianza en el ecosistema digital guatemalteco.',
    subtopics: ['Seguridad de infraestructura crítica', 'Respuesta a incidentes', 'Seguridad en servicios públicos', 'Educación en ciberseguridad', 'Marcos normativos de ciberseguridad'],
  },
  {
    icon: Wifi,
    num: '04',
    title: 'Acceso significativo e inclusión digital',
    color: 'from-sky-400 to-cyan-600',
    desc: 'Cierre de la brecha digital en Guatemala: acceso a Internet en áreas rurales, conectividad en lenguas indígenas, acceso para personas con discapacidad, conectividad escolar y políticas de acceso universal.',
    subtopics: ['Conectividad rural', 'Acceso en lenguas indígenas', 'Internet para personas con discapacidad', 'Conectividad escolar y educativa', 'Políticas de acceso universal'],
  },
  {
    icon: Database,
    num: '05',
    title: 'Infraestructura pública digital, interoperabilidad y servicios',
    color: 'from-blue-500 to-sky-700',
    desc: 'Gobierno digital, interoperabilidad de sistemas públicos, identidad digital, servicios en línea para la ciudadanía, apertura de datos públicos y modernización del Estado guatemalteco.',
    subtopics: ['Gobierno digital y e-servicios', 'Identidad digital ciudadana', 'Apertura de datos públicos', 'Interoperabilidad de sistemas', 'Modernización del Estado'],
  },
  {
    icon: Zap,
    num: '06',
    title: 'Juventudes, educación digital y futuro del trabajo',
    color: 'from-cyan-400 to-blue-500',
    desc: 'Rol de las juventudes en la gobernanza de Internet, educación digital, habilidades del futuro, empleo en la economía digital, trabajo remoto y el impacto de la automatización en Guatemala.',
    subtopics: ['Educación digital y habilidades', 'Jóvenes en la gobernanza de Internet', 'Futuro del trabajo y automatización', 'Emprendimiento digital juvenil', 'Alfabetización digital'],
  },
  {
    icon: Radio,
    num: '07',
    title: 'Integridad informativa y espacio cívico digital',
    color: 'from-sky-600 to-blue-700',
    desc: 'Combate a la desinformación, verificación de hechos, salud del ecosistema informativo digital, responsabilidad de plataformas y protección del espacio cívico en línea.',
    subtopics: ['Desinformación y fact-checking', 'Responsabilidad de plataformas', 'Manipulación de información electoral', 'Periodismo digital ético', 'Educación mediática'],
  },
  {
    icon: TrendingUp,
    num: '08',
    title: 'Innovación, economía digital y desarrollo sostenible',
    color: 'from-blue-400 to-cyan-700',
    desc: 'Ecosistema de innovación digital en Guatemala, comercio electrónico, fintech, startups, tributación digital y el vínculo entre la economía digital y los Objetivos de Desarrollo Sostenible.',
    subtopics: ['Ecosistema de innovación', 'Comercio electrónico y fintech', 'Tributación digital', 'ODS y digitalización', 'Economía creativa digital'],
  },
];

export default function Themes() {
  return (
    <div className="pt-16 sm:pt-24">
      <PageHero
        eyebrow="Agenda permanente"
        title="Ejes"
        titleAccent="Temáticos"
        subtitle="Los grandes debates que articulan el diálogo sobre gobernanza de Internet en Guatemala."
      />

      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {themes.map(({ icon: Icon, num, title, color, desc, subtopics }) => (
              <div key={num} className="group rounded-2xl border border-slate-100 hover:border-sky-200 hover:shadow-xl transition-all overflow-hidden">
                <div className={`h-1.5 bg-gradient-to-r ${color}`} />
                <div className="p-8">
                  <div className="flex items-start gap-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-black font-mono text-sky-400/50">{num}</span>
                        <h3 className="font-display font-bold text-blue-950 text-xl">{title}</h3>
                      </div>
                      <p className="text-slate-600 leading-relaxed mb-5">{desc}</p>
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Subtemas</p>
                        <div className="flex flex-wrap gap-2">
                          {subtopics.map((s) => (
                            <span key={s} className="px-3 py-1 bg-sky-50 border border-sky-100 rounded-full text-sky-700 text-xs font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
