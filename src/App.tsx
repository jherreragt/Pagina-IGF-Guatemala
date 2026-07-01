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
      <BrowserRouter>
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
