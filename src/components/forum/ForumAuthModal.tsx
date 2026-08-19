import { useState } from 'react';
import { X, Mail, Lock, User, AlertCircle, MessageSquare, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ForumConductModal from './ForumConductModal';

interface ForumAuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ForumAuthModal({ open, onClose, onSuccess }: ForumAuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [conductOpen, setConductOpen] = useState(false);
  const [conductAccepted, setConductAccepted] = useState(false);

  if (!open) return null;

  function reset() {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError('');
    setSubmitting(false);
    setConductAccepted(false);
    setSuccess('');
  }

  function handleClose() {
    reset();
    setMode('login');
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (mode === 'register' && !displayName.trim()) {
      setError('Ingresa tu nombre para participar.');
      return;
    }
    if (mode === 'register' && !conductAccepted) {
      setError('Debes aceptar los Lineamientos de Respeto y Convivencia para crear tu cuenta.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setSubmitting(true);

    const result =
      mode === 'login'
        ? await signIn(email, password)
        : await signUp(email, password, displayName.trim());

    setSubmitting(false);

    if (result.error) {
      setError(
        mode === 'login'
          ? 'Credenciales incorrectas. Verifica tu correo y contraseña.'
          : 'No se pudo crear la cuenta. Puede que el correo ya esté registrado.'
      );
      return;
    }

    if (mode === 'register') {
      setMode('login');
      setError('');
      setSuccess('¡Cuenta creada! Ya puedes iniciar sesión.');
      setDisplayName('');
      setPassword('');
      setConductAccepted(false);
      onSuccess?.();
      return;
    }

    reset();
    onSuccess?.();
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={handleClose} />

        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative px-6 pt-6 pb-5 bg-gradient-to-br from-sky-600 to-blue-700 text-white">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center mb-3">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold">
              {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </h2>
            <p className="text-sky-100 text-sm mt-1">
              {mode === 'login'
                ? 'Accede para participar en los foros de diálogo.'
                : 'Regístrate para unirte a la conversación multiactor.'}
            </p>
          </div>

          {/* Body */}
          <div className="p-6">
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-4 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-xl mb-4 text-green-700 text-sm">
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
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Tu nombre"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/30 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/30 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/30 transition-colors"
                  />
                </div>
              </div>

              {/* Conduct acceptance — only at registration */}
              {mode === 'register' && (
                <div className={`rounded-xl border p-3.5 transition-colors ${conductAccepted ? 'border-sky-200 bg-sky-50' : 'border-slate-200 bg-slate-50'}`}>
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={conductAccepted}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setConductOpen(true);
                        } else {
                          setConductAccepted(false);
                        }
                      }}
                      className="mt-0.5 w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-400/40 flex-shrink-0"
                    />
                    <span className="text-sm text-slate-700 leading-relaxed">
                      He leído y acepto los{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setConductOpen(true);
                        }}
                        className="text-sky-600 font-semibold hover:text-sky-700 underline underline-offset-2"
                      >
                        Lineamientos de Respeto y Convivencia
                      </button>{' '}
                      del foro.
                    </span>
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-300 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
              </button>
            </form>

            <div className="text-center mt-5">
              <button
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError('');
                  setSuccess('');
                }}
                className="text-sky-600 hover:text-sky-700 text-sm font-medium transition-colors"
              >
                {mode === 'login'
                  ? '¿No tienes cuenta? Regístrate'
                  : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </div>

            {mode === 'register' && (
              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Espacio seguro · Cero discriminación · Cero acoso</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <ForumConductModal
        open={conductOpen}
        onClose={() => setConductOpen(false)}
        onAccepted={() => setConductAccepted(true)}
      />
    </>
  );
}
