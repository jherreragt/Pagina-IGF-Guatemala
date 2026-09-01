import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Globe, Eye, EyeOff, AlertCircle, UserPlus, LogIn, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLogin() {
  const { session, loading, signIn, requestAdminAccess, adminStatus } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pendingRedirect = searchParams.get('pending') === '1';

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (session && adminStatus === 'approved') return <Navigate to="/admin" replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    if (mode === 'register') {
      if (!displayName.trim()) {
        setError('Ingresa tu nombre.');
        setSubmitting(false);
        return;
      }
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        setSubmitting(false);
        return;
      }
      await requestAdminAccess(email, password, displayName.trim());
      setSubmitting(false);
      // The same confirmation is shown whether or not the address already has
      // an account, so this form cannot be used to discover registered users.
      setSuccess('Si el correo es válido, tu solicitud fue registrada. Un super administrador la revisará y te avisaremos cuando sea aprobada.');
      setMode('login');
      setPassword('');
      setDisplayName('');
      return;
    }

    const { error: signInError } = await signIn(email, password);
    setSubmitting(false);
    if (signInError) {
      setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
    } else {
      navigate('/admin');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 items-center justify-center mb-4 shadow-lg shadow-blue-500/25">
            <Globe className="w-7 h-7 text-slate-900" strokeWidth={1.8} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">IGF Guatemala</h1>
          <p className="text-slate-500 text-sm mt-1">Panel de Administración</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-xl">
          {/* Pending notice */}
          {pendingRedirect && (
            <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl mb-5 text-amber-800 text-sm">
              <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Tu solicitud de acceso está pendiente de aprobación por un super administrador.</span>
            </div>
          )}

          {/* Mode tabs */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LogIn className="w-4 h-4" /> Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <UserPlus className="w-4 h-4" /> Solicitar acceso
            </button>
          </div>

          <h2 className="text-lg font-semibold text-slate-900 mb-1">
            {mode === 'login' ? 'Iniciar sesión' : 'Solicitar acceso de administrador'}
          </h2>
          <p className="text-slate-500 text-xs mb-5">
            {mode === 'login'
              ? 'Ingresa con tu cuenta de administrador.'
              : 'Crea una cuenta y solicita acceso. Un super administrador debe aprobarla.'}
          </p>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-5 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-xl mb-5 text-green-700 text-sm">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Tu nombre completo"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-colors"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-11 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-slate-300 border-t-white rounded-full animate-spin" />
              ) : mode === 'login' ? 'Ingresar' : 'Enviar solicitud'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          IGF Guatemala · Panel Administrativo
        </p>
      </div>
    </div>
  );
}
