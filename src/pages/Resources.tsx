import { BookOpen, FileText, Video, Globe, Download } from 'lucide-react';
import PageHero from '../components/PageHero';

const resources = [
  {
    category: 'Documentos IGF Global',
    icon: Globe,
    color: 'sky',
    items: [
      { title: 'Guía sobre el IGF y sus procesos', type: 'PDF', year: '2024' },
      { title: 'Reporte anual del IGF 2023', type: 'PDF', year: '2023' },
      { title: 'Declaración de principios multiactor', type: 'PDF', year: '2022' },
      { title: 'Marco para foros nacionales e iniciativas (NRIs)', type: 'PDF', year: '2023' },
    ],
  },
  {
    category: 'Gobernanza de Internet',
    icon: BookOpen,
    color: 'blue',
    items: [
      { title: 'Guía introductoria a la gobernanza de Internet', type: 'PDF', year: '2024' },
      { title: 'Glosario de gobernanza de Internet', type: 'PDF', year: '2023' },
      { title: 'Modelos de gobernanza: comparativa internacional', type: 'PDF', year: '2022' },
      { title: 'Gobernanza de Internet para principiantes', type: 'PDF', year: '2023' },
    ],
  },
  {
    category: 'Derechos Digitales',
    icon: FileText,
    color: 'cyan',
    items: [
      { title: 'Marco internacional de derechos digitales', type: 'PDF', year: '2024' },
      { title: 'Privacidad y protección de datos en Guatemala', type: 'PDF', year: '2023' },
      { title: 'Libertad de expresión en Internet: estándares ONU', type: 'PDF', year: '2022' },
      { title: 'Derechos digitales de las mujeres', type: 'PDF', year: '2023' },
    ],
  },
  {
    category: 'Memorias y Relatorías',
    icon: Video,
    color: 'sky',
    items: [
      { title: 'Relatoría IGF Guatemala 2023', type: 'PDF', year: '2023' },
      { title: 'Principales conclusiones IGF Guatemala 2022', type: 'PDF', year: '2022' },
      { title: 'Recomendaciones IGF Guatemala 2021', type: 'PDF', year: '2021' },
      { title: 'Memoria fotográfica y audiovisual 2023', type: 'ZIP', year: '2023' },
    ],
  },
];

const colorMap: Record<string, string> = {
  sky: 'bg-sky-50 border-sky-100 text-sky-600',
  blue: 'bg-blue-50 border-blue-100 text-blue-600',
  cyan: 'bg-cyan-50 border-cyan-100 text-cyan-700',
};

const iconBg: Record<string, string> = {
  sky: 'bg-sky-100',
  blue: 'bg-blue-100',
  cyan: 'bg-cyan-100',
};

export default function Resources() {
  return (
    <div className="pt-16 sm:pt-24">
      <PageHero
        icon={<BookOpen className="w-7 h-7" />}
        eyebrow="Documentación"
        title="Biblioteca de"
        titleAccent="Recursos"
        subtitle="Documentos, guías, publicaciones y materiales sobre gobernanza de Internet, derechos digitales y transformación digital."
      />

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {resources.map(({ category, icon: Icon, color, items }) => (
              <div key={category} className="rounded-2xl border border-slate-100 overflow-hidden">
                <div className={`p-5 border-b ${colorMap[color]} border-${color}-100`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg ${iconBg[color]} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-blue-950">{category}</h3>
                  </div>
                </div>
                <div className="divide-y divide-slate-50">
                  {items.map(({ title, type, year }) => (
                    <div key={title} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-700 text-sm font-medium truncate">{title}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{year}</p>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <span className="text-xs text-slate-400 font-mono">{type}</span>
                        <button className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-sky-100 flex items-center justify-center transition-colors">
                          <Download className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 p-8 bg-sky-50 rounded-2xl border border-sky-100 text-center">
            <BookOpen className="w-10 h-10 text-sky-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-blue-950 mb-2">Glosario de Gobernanza de Internet</h3>
            <p className="text-slate-600 text-sm mb-5 max-w-md mx-auto">
              Un glosario completo con los términos y conceptos más importantes de la gobernanza de Internet, accesible para personas sin conocimiento técnico previo.
            </p>
            <a href="#" className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 text-white font-semibold rounded-xl hover:bg-sky-500 transition-colors">
              Consultar glosario
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
