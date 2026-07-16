import { Link } from 'react-router-dom';
import { Mail, Twitter, Youtube, Facebook, ExternalLink, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-slate-400 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-5">
              <img
                src="/IGF-aprobado-invertido-blanco-e1730905954692.png"
                alt="IGF Guatemala"
                className="h-20 w-auto"
              />
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-xs">
              Un espacio abierto, inclusivo y multiactor para dialogar sobre el futuro de Internet en Guatemala.
            </p>
            <Link
              to="/contacto"
              className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 text-sm font-semibold transition-colors group"
            >
              Súmate a la comunidad
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="flex gap-2 mt-5">
              {[
                { icon: Youtube, label: 'YouTube', href: 'https://www.youtube.com/@IGFGuatemalaISOCGT' },
                { icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/share/1FvujVBQMp/' },
                { icon: Twitter, label: 'Twitter', href: 'https://twitter.com/IGFGuatemala' },
                { icon: Mail, label: 'Email', href: 'mailto:igf.guatemala.isocgt@gmail.com' },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href ?? '#'}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-sky-500 border border-white/8 hover:border-transparent flex items-center justify-center transition-all duration-150 hover:scale-105"
                >
                  <Icon className="w-4 h-4 text-slate-400 hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold text-xs uppercase tracking-[0.1em] mb-4">Navegación</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Inicio', href: '/' },
                { label: 'Sobre IGF Guatemala', href: '/sobre' },
                { label: 'Principios', href: '/principios' },
                { label: 'Comunidad', href: '/comunidad' },
                { label: 'Ejes Temáticos', href: '/ejes' },
                { label: 'Evento Anual', href: '/evento' },
              ].map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-slate-500 hover:text-slate-200 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold text-xs uppercase tracking-[0.1em] mb-4">Recursos</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Blog', href: '/blog' },
                { label: 'Foro de Diálogo', href: '/foro' },
                { label: 'Biblioteca', href: '/recursos' },
                { label: 'Transparencia', href: '/transparencia' },
                { label: 'Contacto', href: '/contacto' },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-slate-500 hover:text-slate-200 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="https://www.intgovforum.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-slate-200 text-sm transition-colors inline-flex items-center gap-1.5"
                >
                  IGF Global
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li className="pt-2 mt-2 border-t border-white/[0.06]">
                <Link to="/admin" className="text-slate-600 hover:text-slate-400 text-xs transition-colors inline-flex items-center gap-1.5">
                  Panel de administración
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 text-xs">
            © {new Date().getFullYear()} IGF Guatemala. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/transparencia" className="text-slate-600 hover:text-slate-400 text-xs transition-colors">Código de Conducta</Link>
            <a href="#" className="text-slate-600 hover:text-slate-400 text-xs transition-colors">Política de Privacidad</a>
            <a href="#" className="text-slate-600 hover:text-slate-400 text-xs transition-colors">Accesibilidad</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
