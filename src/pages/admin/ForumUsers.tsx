import { useEffect, useState } from 'react';
import { UserPlus, Trash2, ShieldCheck, X, AlertCircle, Users } from 'lucide-react';
import { supabase, ForumAdmin } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function ForumUsers() {
  const { user: currentUser } = useAuth();
  const [admins, setAdmins] = useState<ForumAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('forum_admins').select('*').order('created_at');
    setAdmins((data as ForumAdmin[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail.trim()) { setError('Ingresa un correo.'); return; }
    setSubmitting(true); setError('');

    // Look up the user by email
    const { data: userData, error: lookupError } = await supabase
      .from('profiles_by_email')
      .select('id')
      .eq('email', newEmail.trim().toLowerCase())
      .maybeSingle();

    // Fallback: try auth.users via RPC if the view doesn't exist
    let userId: string | null = userData?.id ?? null;

    if (!userId) {
      // Try direct lookup through a security-definer function
      const { data: rpcResult } = await supabase.rpc('get_user_id_by_email', { user_email: newEmail.trim().toLowerCase() });
      userId = rpcResult as string | null;
    }

    if (!userId) {
      setError('No se encontró una cuenta con ese correo. La persona debe registrarse primero en el foro.');
      setSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase.from('forum_admins').insert({
      user_id: userId,
      display_name: newName.trim() || newEmail.split('@')[0],
    });

    setSubmitting(false);
    if (insertError) {
      setError(insertError.message.includes('duplicate') ? 'Esta persona ya es moderadora.' : insertError.message);
      return;
    }

    setShowAdd(false);
    setNewEmail('');
    setNewName('');
    await load();
  }

  async function handleRemoveAdmin(admin: ForumAdmin) {
    if (admin.user_id === currentUser?.id) {
      alert('No puedes quitarte tus propios permisos.');
      return;
    }
    if (!confirm('¿Quitar permisos de moderación a esta persona?')) return;
    await supabase.from('forum_admins').delete().eq('id', admin.id);
    await load();
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de usuarios</h1>
          <p className="text-slate-400 text-sm mt-1">Administra el equipo de moderación del foro.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold rounded-lg transition-colors">
          <UserPlus className="w-4 h-4" /> Añadir moderador/a
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-4 flex gap-3">
        <Users className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
        <p className="text-slate-300 text-sm leading-relaxed">
          Las personas moderadoras pueden cerrar, destacar y eliminar discusiones, ocultar respuestas,
          resolver reportes y gestionar categorías y reglas. Para añadir una persona como moderadora,
          esta debe haberse registrado previamente en el foro.
        </p>
      </div>

      {/* Admin list */}
      {loading ? (
        <div className="text-center py-10 text-slate-500 text-sm">Cargando...</div>
      ) : admins.length === 0 ? (
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-10 text-center">
          <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No hay moderadores configurados.</p>
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden">
          <div className="divide-y divide-white/5">
            {admins.map((admin) => (
              <div key={admin.id} className="flex items-center gap-3 px-5 py-4 hover:bg-white/5 transition-colors">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {admin.display_name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{admin.display_name || 'Sin nombre'}</p>
                  <p className="text-slate-500 text-xs mt-0.5">Desde {new Date(admin.created_at).toLocaleDateString('es-GT')}</p>
                </div>
                {admin.user_id === currentUser?.id && (
                  <span className="text-xs text-sky-400 font-medium">Tú</span>
                )}
                <button
                  onClick={() => handleRemoveAdmin(admin)}
                  disabled={admin.user_id === currentUser?.id}
                  className="text-slate-400 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors w-8 h-8 rounded-lg flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add admin modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => { setShowAdd(false); setError(''); }} />
          <div className="relative w-full max-w-md bg-slate-800 border border-white/10 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-base">Añadir moderador/a</h2>
              <button onClick={() => { setShowAdd(false); setError(''); }} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {error && <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"><AlertCircle className="w-4 h-4 flex-shrink-0" />{error}</div>}

            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Correo de la persona</label>
                <input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="correo@ejemplo.com" className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-sky-500" />
                <p className="text-xs text-slate-500 mt-1">La persona debe tener cuenta en el foro.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Nombre (opcional)</label>
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nombre para mostrar" className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-sky-500" />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowAdd(false); setError(''); }} className="px-4 py-2 text-slate-400 text-sm font-medium hover:text-white transition-colors">Cancelar</button>
                <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-500 disabled:bg-slate-700 transition-colors">
                  {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Añadir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
