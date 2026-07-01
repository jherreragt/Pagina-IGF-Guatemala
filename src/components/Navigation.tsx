import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe, ChevronDown, Twitter, Youtube, Linkedin, Mail } from 'lucide-react';

const primaryLinks = [
  { label: 'Inicio', href: '/' },
  { label: 'Evento Anual', href: '/evento' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contacto', href: '/contacto' },
];

const moreLinks = [
  { label: 'Sobre IGF Guatemala', href: '/sobre' },
  { label: 'Principios', href: '/principios' },
  { label: 'Comunidad', href: '/comunidad' },
  { label: 'Ejes Temáticos', href: '/ejes' },
  { label: 'Recursos', href: '/recursos' },
  { label: 'Transparencia', href: '/transparencia' },
];

const socialLinks = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Mail, href: 'mailto:info@igfguatemala.org', label: 'Correo' },
];

const allLinks = [...primaryLinks, ...moreLinks];

export default function Navigation() {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const isHome = location.pathname === '/';
  const solid = scrolled || !isHome;
  const isMoreActive = moreLinks.some(l => location.pathname === l.href);

  return (
    <>
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-8 bg-blue-700 border-b border-white/[0.12] hidden sm:flex">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
          <p className="text-blue-300/70 text-[11px] font-medium tracking-wide">
            Foro Nacional de Gobernanza de Internet · Guatemala
          </p>
          <div className="flex items-center gap-0.5">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="w-7 h-7 flex items-center justify-center text-blue-300/50 hover:text-sky-300 transition-colors rounded"
              >
                <Icon className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main header — offset by top bar height (8 = 2rem) */}
      <header
        className={`fixed top-0 sm:top-8 left-0 right-0 z-50 transition-all duration-300 ${
          solid
            ? 'bg-blue-800/95 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-white/[0.08]'
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Brand */}
            <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-md group-hover:shadow-glow-sky transition-all duration-200 group-hover:scale-105">
                <Globe className="w-4 h-4 text-white" strokeWidth={2} />
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              {primaryLinks.map((link) => {
                const active = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      active
                        ? 'text-white'
                        : 'text-blue-100/80 hover:text-white hover:bg-white/[0.07]'
                    }`}
                  >
                    {active && (
                      <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-sky-400" />
                    )}
                    {link.label}
                  </Link>
                );
              })}

              {/* More dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
                  className={`flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isMoreActive
                      ? 'text-white bg-white/10'
                      : 'text-blue-100/80 hover:text-white hover:bg-white/[0.07]'
                  }`}
                >
                  Más
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute top-full right-0 mt-1.5 w-52 bg-blue-800/98 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/30 py-1.5 animate-fade-in">
                    {moreLinks.map((link) => {
                      const active = location.pathname === link.href;
                      return (
                        <Link
                          key={link.href}
                          to={link.href}
                          className={`flex items-center px-4 py-2.5 text-sm transition-colors duration-100 ${
                            active ? 'text-sky-300 bg-white/5' : 'text-blue-100/80 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* CTA + hamburger */}
            <div className="flex items-center gap-3">
              <Link
                to="/evento"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold rounded-lg transition-all duration-150 hover:scale-[1.02] shadow-md shadow-sky-500/20"
              >
                Registro al evento
              </Link>
              <button
                onClick={() => setOpen(!open)}
                aria-label="Menú"
                className="lg:hidden w-9 h-9 flex items-center justify-center text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile menu — offset below top-bar + header */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setOpen(false)}
        />
        <div
          className={`absolute top-16 sm:top-24 left-0 right-0 bg-blue-800/98 backdrop-blur-xl border-b border-white/10 shadow-2xl transition-all duration-300 ${open ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}
        >
          <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-2 gap-1">
            {allLinks.map((link) => {
              const active = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active ? 'text-sky-300 bg-white/10' : 'text-blue-100 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className="px-4 pb-4 space-y-3">
            <Link
              to="/evento"
              className="w-full flex items-center justify-center py-3 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl transition-colors"
            >
              Registro al evento
            </Link>
            {/* Social icons in mobile menu */}
            <div className="flex items-center justify-center gap-4 pt-1 pb-1">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} aria-label={label}
                  target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                  className="text-blue-300/60 hover:text-sky-300 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
