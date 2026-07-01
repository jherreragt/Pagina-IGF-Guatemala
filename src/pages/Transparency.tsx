import { Eye, Users, FileText, Shield, DollarSign, Globe } from 'lucide-react';
import PageHero from '../components/PageHero';

const committee = [
  { name: 'María González', role: 'Coordinadora General', org: 'Sociedad Civil', sector: 'Sociedad Civil' },
  { name: 'Carlos Ramírez', role: 'Coordinador Técnico', org: 'Comunidad Técnica', sector: 'Comunidad Técnica' },
  { name: 'Ana López', role: 'Coordinadora de Comunicación', org: 'Academia', sector: 'Academia' },
  { name: 'José Mendoza', role: 'Coordinador de Sesiones', org: 'Sector Privado', sector: 'Sector Privado' },
  { name: 'Luisa Choc', role: 'Coordinadora de Inclusión', org: 'Sociedad Civil', sector: 'Sociedad Civil' },
  { name: 'Roberto Xiloj', role: 'Coordinador de Juventudes', org: 'Juventudes', sector: 'Juventudes' },
];

const allies = [
  { name: 'PNUD Guatemala', type: 'Apoyo Internacional' },
  { name: 'UNESCO', type: 'Apoyo Internacional' },
  { name: 'LACNIC', type: 'Apoyo Técnico' },
  { name: 'Internet Society', type: 'Apoyo Técnico' },
  { name: 'Universidad de San Carlos', type: 'Aliado Nacional' },
  { name: 'Asociación de Periodistas de Guatemala', type: 'Aliado Nacional' },
];

export default function Transparency() {
  return (
    <div className="pt-16 sm:pt-24">
      <PageHero
        icon={<Eye className="w-7 h-7" />}
        eyebrow="Gobernanza abierta"
        title="Transparencia"
        subtitle="El IGF Guatemala opera bajo principios estrictos de transparencia y rendición de cuentas."
      />

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Comité organizador */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <Users className="w-7 h-7 text-sky-600" />
              <h2 className="text-3xl font-bold text-blue-950">Comité Organizador</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {committee.map(({ name, role, org, sector }) => (
                <div key={name} className="p-5 border border-slate-100 rounded-xl hover:border-sky-200 hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm mb-4">
                    {name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h3 className="font-bold text-blue-950">{name}</h3>
                  <p className="text-sky-600 text-sm font-medium">{role}</p>
                  <p className="text-slate-500 text-xs mt-1">{org}</p>
                  <span className="inline-block mt-2 px-2.5 py-0.5 bg-slate-100 rounded-full text-slate-500 text-xs">{sector}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Criterios */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <FileText className="w-7 h-7 text-sky-600" />
              <h2 className="text-3xl font-bold text-blue-950">Criterios de Selección de Sesiones</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: 'Relevancia temática', desc: 'La propuesta debe guardar relación directa con la gobernanza de Internet y los ejes temáticos del proceso.' },
                { title: 'Diversidad multiactor', desc: 'Se prioriza la participación equilibrada de distintos sectores en el desarrollo de cada sesión.' },
                { title: 'Perspectiva de género', desc: 'Las propuestas deben incorporar una perspectiva de género e incluir voces diversas.' },
                { title: 'Relevancia para Guatemala', desc: 'El tema propuesto debe ser pertinente para el contexto, desafíos y oportunidades de Guatemala.' },
                { title: 'Enfoque de derechos', desc: 'La propuesta debe respetar los estándares internacionales de derechos humanos.' },
                { title: 'Generación de recomendaciones', desc: 'Se valoran las propuestas orientadas a producir conclusiones y recomendaciones concretas.' },
              ].map(({ title, desc }) => (
                <div key={title} className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="font-bold text-blue-950 text-sm mb-2">{title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Código de conducta */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <Shield className="w-7 h-7 text-sky-600" />
              <h2 className="text-3xl font-bold text-blue-950">Código de Conducta</h2>
            </div>
            <div className="bg-sky-50 border border-sky-100 rounded-2xl p-7">
              <p className="text-slate-600 leading-relaxed mb-5">
                El Código de Conducta del IGF Guatemala establece las normas de convivencia, respeto y participación para todas las personas que forman parte del proceso: participantes, ponentes, moderadores, relatores, organizadores y aliados.
              </p>
              <p className="text-slate-600 leading-relaxed mb-5">
                Está basado en los principios de respeto mutuo, no discriminación, inclusión, diálogo constructivo y prohibición de acoso. Incluye un mecanismo de reporte confidencial y establece consecuencias claras por incumplimiento.
              </p>
              <a href="#" className="inline-flex items-center gap-2 text-sky-600 font-semibold hover:text-blue-700 transition-colors text-sm">
                Descargar Código de Conducta completo
                <FileText className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Política de patrocinio */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <DollarSign className="w-7 h-7 text-sky-600" />
              <h2 className="text-3xl font-bold text-blue-950">Política de Patrocinio</h2>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-7">
              <p className="text-slate-600 leading-relaxed mb-4">
                El IGF Guatemala acepta apoyos y patrocinios bajo condiciones estrictas que garantizan la independencia del proceso. Los apoyos recibidos son públicos y transparentes.
              </p>
              <ul className="space-y-2">
                {[
                  'Los patrocinadores no condicionan la agenda ni los contenidos del proceso.',
                  'No se aceptan patrocinios de organizaciones con conflictos de interés sobre los temas de la agenda.',
                  'Todos los apoyos son declarados públicamente.',
                  'Los patrocinadores no tienen voto ni participación especial en el comité organizador.',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-600 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Aliados */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <Globe className="w-7 h-7 text-sky-600" />
              <h2 className="text-3xl font-bold text-blue-950">Aliados y Apoyos</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {allies.map(({ name, type }) => (
                <div key={name} className="p-5 border border-slate-100 rounded-xl text-center hover:border-sky-200 hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center mx-auto mb-3">
                    <Globe className="w-6 h-6 text-sky-500" />
                  </div>
                  <h4 className="font-bold text-blue-950 text-sm">{name}</h4>
                  <p className="text-slate-500 text-xs mt-1">{type}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
