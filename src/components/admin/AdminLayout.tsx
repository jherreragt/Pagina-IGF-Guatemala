import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Globe, LayoutDashboard, FileText, Settings, LogOut,
  ChevronLeft, Menu, ExternalLink, Calendar,
  Users, Download, ClipboardList, ChevronDown, ChevronRight, MessageSquare
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const eventSubItems = [
  { label: 'Resumen', href: '/admin/event' },
  { label: 'Ediciones', href: '/admin/event/editions' },
  { label: 'Agenda', href: '/admin/event/sessions' },
  { label: 'Ponentes', href: '/admin/event/speakers' },
  { label: 'Aliados', href: '/admin/event/allies' },
  { label: 'Recursos', href: '/admin/event/resources' },
  { label: 'Registros', href: '/admin/event/registrations' },
];

const forumSubItems = [
  { label: 'Resumen', href: '/admin/forum' },
  { label: 'Categorías', href: '/admin/forum/categorias' },
  { label: 'Discusiones', href: '/admin/forum/discusiones' },
  { label: 'Reportes', href: '/admin/forum/reportes' },
  { label: 'Reglas', href: '/admin/forum/reglas' },
  { label: 'Usuarios', href: '/admin/forum/usuarios' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const eventActive = location.pathname.startsWith('/admin/event');
  const forumActive = location.pathname.startsWith('/admin/forum');

  async function handleSignOut() {
    await signOut();
    navigate('/admin/login');
  }

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => {
    const expanded = mobile || sidebarOpen;
    return (
      <div className={`flex flex-col h-full bg-slate-950 ${mobile ? 'w-64' : sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-200`}>
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center flex-shrink-0">
            <Globe className="w-4 h-4 text-white" strokeWidth={1.8} />
          </div>
          {expanded && (
            <div className="leading-tight overflow-hidden">
              <div className="font-bold text-white text-xs truncate">IGF Guatemala</div>
              <div className="text-sky-400 text-xs truncate">Panel de Administración</div>
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
          {/* Dashboard */}
          {[
            { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
            { label: 'Blog', href: '/admin/blog', icon: FileText },
          ].map(({ label, href, icon: Icon }) => {
            const active = location.pathname === href || (href !== '/admin' && location.pathname.startsWith(href) && !location.pathname.startsWith('/admin/event'));
            return (
              <Link key={href} to={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${active ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <Icon className="w-5 h-5 flex-shrink-0" />
                {expanded && <span className="text-sm font-medium">{label}</span>}
              </Link>
            );
          })}

          {/* Evento section */}
          <div>
            <Link to="/admin/event"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${eventActive ? 'bg-sky-600/20 text-sky-300' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <Calendar className="w-5 h-5 flex-shrink-0" />
              {expanded && (
                <>
                  <span className="text-sm font-medium flex-1">Evento Anual</span>
                  {eventActive ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </>
              )}
            </Link>

            {expanded && eventActive && (
              <div className="ml-4 mt-0.5 pl-4 border-l border-white/10 space-y-0.5">
                {eventSubItems.map(({ label, href }) => {
                  const active = location.pathname === href;
                  return (
                    <Link key={href} to={href}
                      className={`flex items-center px-3 py-2 rounded-lg text-xs transition-colors ${active ? 'text-white bg-sky-600/20 font-semibold' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}>
                      {label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Foro section */}
          <div>
            <Link to="/admin/forum"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${forumActive ? 'bg-sky-600/20 text-sky-300' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <MessageSquare className="w-5 h-5 flex-shrink-0" />
              {expanded && (
                <>
                  <span className="text-sm font-medium flex-1">Foro de Diálogo</span>
                  {forumActive ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </>
              )}
            </Link>

            {expanded && forumActive && (
              <div className="ml-4 mt-0.5 pl-4 border-l border-white/10 space-y-0.5">
                {forumSubItems.map(({ label, href }) => {
                  const active = location.pathname === href;
                  return (
                    <Link key={href} to={href}
                      className={`flex items-center px-3 py-2 rounded-lg text-xs transition-colors ${active ? 'text-white bg-sky-600/20 font-semibold' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}>
                      {label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Settings */}
          {(() => {
            const active = location.pathname === '/admin/settings';
            return (
              <Link to="/admin/settings"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${active ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <Settings className="w-5 h-5 flex-shrink-0" />
                {expanded && <span className="text-sm font-medium">Configuración</span>}
              </Link>
            );
          })()}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1">
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
            <ExternalLink className="w-4 h-4 flex-shrink-0" />
            {expanded && <span className="text-xs">Ver sitio público</span>}
          </a>
          <button onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors">
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {expanded && <span className="text-xs">Cerrar sesión</span>}
          </button>
        </div>
      </div>
    );
  };

  const currentLabel = (() => {
    if (location.pathname === '/admin/event') return 'Evento Anual';
    const sub = eventSubItems.find((s) => location.pathname === s.href);
    if (sub) return `Evento — ${sub.label}`;
    if (location.pathname.startsWith('/admin/blog')) return 'Blog';
    if (location.pathname === '/admin/forum') return 'Foro de Diálogo';
    const fSub = forumSubItems.find((s) => location.pathname === s.href);
    if (fSub) return `Foro — ${fSub.label}`;
    if (location.pathname === '/admin/settings') return 'Configuración';
    return 'Dashboard';
  })();

  return (
    <div className="min-h-screen flex bg-slate-900">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col border-r border-white/10">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="flex flex-col border-r border-white/10">
            <Sidebar mobile />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-slate-900 border-b border-white/10 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen((v) => !v)} className="text-slate-400 hover:text-white transition-colors hidden lg:block">
              {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <button onClick={() => setMobileOpen((v) => !v)} className="text-slate-400 hover:text-white transition-colors lg:hidden">
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-white font-semibold text-sm hidden sm:block">{currentLabel}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-sky-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.email?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <span className="text-slate-300 text-xs hidden sm:block truncate max-w-[180px]">{user?.email}</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
