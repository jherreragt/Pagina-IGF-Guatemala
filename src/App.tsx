import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';

// Public pages
import Home from './pages/Home';
import About from './pages/About';
import Principles from './pages/Principles';
import Community from './pages/Community';
import Themes from './pages/Themes';
import Event from './pages/Event';
import Resources from './pages/Resources';
import Transparency from './pages/Transparency';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';

// Admin pages
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import BlogList from './pages/admin/BlogList';
import BlogEditor from './pages/admin/BlogEditor';
import SiteSettings from './pages/admin/SiteSettings';
import EventDashboard from './pages/admin/EventDashboard';
import EventSessions from './pages/admin/EventSessions';
import EventSpeakers from './pages/admin/EventSpeakers';
import EventAllies from './pages/admin/EventAllies';
import EventResources from './pages/admin/EventResources';
import EventRegistrations from './pages/admin/EventRegistrations';
import EventEditions from './pages/admin/EventEditions';
import YouTubeVideosAdmin from './pages/admin/YouTubeVideos';
import ContactSubmissionsAdmin from './pages/admin/ContactSubmissions';
import HomeContent from './pages/admin/HomeContent';

// Forum pages
import Forum from './pages/Forum';
import ForumCategoryPage from './pages/ForumCategoryPage';
import ForumThreadPage from './pages/ForumThreadPage';

// Forum admin pages
import ForumDashboard from './pages/admin/ForumDashboard';
import ForumCategories from './pages/admin/ForumCategories';
import ForumThreads from './pages/admin/ForumThreads';
import ForumReports from './pages/admin/ForumReports';
import ForumRulesAdmin from './pages/admin/ForumRulesAdmin';
import ForumUsers from './pages/admin/ForumUsers';
import ForumModerationQueue from './pages/admin/ForumModerationQueue';
import ForumConductAdmin from './pages/admin/ForumConductAdmin';
import AdminUsersPage from './pages/admin/AdminUsers';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <ScrollToTop />
        <Routes>
          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout><AdminDashboard /></AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/blog"
            element={
              <ProtectedRoute>
                <AdminLayout><BlogList /></AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/blog/new"
            element={
              <ProtectedRoute>
                <AdminLayout><BlogEditor /></AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/blog/edit/:id"
            element={
              <ProtectedRoute>
                <AdminLayout><BlogEditor /></AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <AdminLayout><SiteSettings /></AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/admin/event" element={<ProtectedRoute><AdminLayout><EventDashboard /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/event/sessions" element={<ProtectedRoute><AdminLayout><EventSessions /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/event/speakers" element={<ProtectedRoute><AdminLayout><EventSpeakers /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/event/allies" element={<ProtectedRoute><AdminLayout><EventAllies /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/event/resources" element={<ProtectedRoute><AdminLayout><EventResources /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/event/registrations" element={<ProtectedRoute><AdminLayout><EventRegistrations /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/event/editions" element={<ProtectedRoute><AdminLayout><EventEditions /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/videos" element={<ProtectedRoute><AdminLayout><YouTubeVideosAdmin /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/mensajes" element={<ProtectedRoute><AdminLayout><ContactSubmissionsAdmin /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/home" element={<ProtectedRoute><AdminLayout><HomeContent /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/usuarios" element={<ProtectedRoute><AdminLayout><AdminUsersPage /></AdminLayout></ProtectedRoute>} />
          {/* Forum admin routes */}
          <Route path="/admin/forum" element={<ProtectedRoute><AdminLayout><ForumDashboard /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/forum/categorias" element={<ProtectedRoute><AdminLayout><ForumCategories /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/forum/discusiones" element={<ProtectedRoute><AdminLayout><ForumThreads /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/forum/reportes" element={<ProtectedRoute><AdminLayout><ForumReports /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/forum/reglas" element={<ProtectedRoute><AdminLayout><ForumRulesAdmin /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/forum/usuarios" element={<ProtectedRoute><AdminLayout><ForumUsers /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/forum/cola" element={<ProtectedRoute><AdminLayout><ForumModerationQueue /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/forum/lineamientos" element={<ProtectedRoute><AdminLayout><ForumConductAdmin /></AdminLayout></ProtectedRoute>} />

          {/* Public routes */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/sobre" element={<PublicLayout><About /></PublicLayout>} />
          <Route path="/principios" element={<PublicLayout><Principles /></PublicLayout>} />
          <Route path="/comunidad" element={<PublicLayout><Community /></PublicLayout>} />
          <Route path="/ejes" element={<PublicLayout><Themes /></PublicLayout>} />
          <Route path="/evento" element={<PublicLayout><Event /></PublicLayout>} />
          <Route path="/recursos" element={<PublicLayout><Resources /></PublicLayout>} />
          <Route path="/transparencia" element={<PublicLayout><Transparency /></PublicLayout>} />
          <Route path="/contacto" element={<PublicLayout><Contact /></PublicLayout>} />
          <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
          <Route path="/blog/:slug" element={<PublicLayout><BlogPost /></PublicLayout>} />
          <Route path="/noticias" element={<PublicLayout><Blog /></PublicLayout>} />

          {/* Forum public routes */}
          <Route path="/foro" element={<PublicLayout><Forum /></PublicLayout>} />
          <Route path="/foro/:slug" element={<PublicLayout><ForumCategoryPage /></PublicLayout>} />
          <Route path="/foro/t/:id" element={<PublicLayout><ForumThreadPage /></PublicLayout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
