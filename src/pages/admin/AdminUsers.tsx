import { useEffect, useState, useCallback } from 'react';
import {
  UserCog, CheckCircle2, XCircle, Clock, Ban, ShieldCheck, User,
  AlertCircle, Search,
} from 'lucide-react';
import { supabase, AdminUser } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type Filter = 'pending' | 'approved' | 'all';

const statusConfig: Record<string, { label: string; icon: typeof Clock; color: string; bg: string }> = {
  pending: { label: 'Pendiente', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  approved: { label: 'Aprobado', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  rejected: { label: 'Rechazado', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  revoked: { label: 'Revocado', icon: Ban, color: 'text-slate-600', bg: 'bg-slate-100 border-slate-200' },
};

export default function AdminUsersPage() {
  const { user, adminRole } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('pending');
  const [search, setSearch] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('requested_at', { ascending: false });
    if (!error && data) {
      setUsers(data as AdminUser[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(u: AdminUser, newStatus: 'approved' | 'rejected' | 'revoked') {
    setActionError('');
    setActionId(u.id);
    const updates: Record<string, unknown> = {
      status: newStatus,
      approved_at: newStatus === 'approved' ? new Date().toISOString() : null,
      approved_by: user?.id,
    };
    const { error } = await supabase
      .from('admin_users')
      .update(updates)
      .eq('id', u.id);
    setActionId(null);
    if (error) {
      setActionError('No se pudo actualizar el estado. Verifica tus permisos.');
      return;
    }
    load();
  }

  async function toggleRole(u: AdminUser) {
    if (u.user_id === user?.id) {
      setActionError('No puedes cambiar tu propio rol.');
      return;
    }
    setActionError('');
    setActionId(u.id);
    const newRole = u.role === 'super_admin' ? 'admin' : 'super_admin';
    const { error } = await supabase
      .from('admin_users')
      .update({ role: newRole })
      .eq('id', u.id);
    setActionId(null);
    if (error) {
      setActionError('No se pudo cambiar el rol.');
      return;
    }
    load();
  }

  const filtered = users.filter((u) => {
    if (filter === 'pending' && u.status !== 'pending') return false;
    if (filter === 'approved' && u.status !== 'approved') return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return u.email.toLowerCase().includes(q) || u.display_name.toLowerCase().includes(q);
    }
    return true;
  });

  const pendingCount = users.filter((u) => u.status === 'pending').length;
  const isSuperAdmin = adminRole === 'super_admin';

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Administradores</h1>
        <p className="text-slate-500 text-sm mt-1">
          Gestiona solicitudes de acceso y roles del panel administrativo.
        </p>
      </div>

      {!isSuperAdmin && (
        <div className="flex items-start gap-2.5 p-4 bg-sky-50 border border-sky-200 rounded-xl text-sky-800 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Solo los super administradores pueden aprobar, rechazar o cambiar roles.</span>
        </div>
      )}

      {actionError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {actionError}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {([
          { key: 'pending' as Filter, label: 'Pendientes', count: pendingCount },
          { key: 'approved' as Filter, label: 'Aprobados', count: users.filter((u) => u.status === 'approved').length },
          { key: 'all' as Filter, label: 'Todos', count: users.length },
        ]).map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              filter === key
                ? 'bg-sky-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === key ? 'bg-white/20' : 'bg-slate-100'}`}>
              {count}
            </span>
          </button>
        ))}

        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/30 transition-colors"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-white border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <UserCog className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">
            {filter === 'pending'
              ? 'No hay solicitudes pendientes.'
              : 'No se encontraron administradores.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((u) => {
            const cfg = statusConfig[u.status] ?? statusConfig.pending;
            const StatusIcon = cfg.icon;
            const isSelf = u.user_id === user?.id;
            return (
              <div key={u.id} className="bg-white border border-slate-200 rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    u.role === 'super_admin' ? 'bg-blue-600' : 'bg-sky-500'
                  }`}>
                    {u.role === 'super_admin'
                      ? <ShieldCheck className="w-5 h-5 text-white" />
                      : <User className="w-5 h-5 text-white" />
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 text-sm">{u.display_name || u.email}</span>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                      {u.role === 'super_admin' && (
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                          Super Admin
                        </span>
                      )}
                      {isSelf && (
                        <span className="text-xs text-slate-400">(tú)</span>
                      )}
                    </div>
                    <p className="text-slate-500 text-xs mt-1 truncate">{u.email}</p>
                    <p className="text-slate-400 text-xs mt-1">
                      Solicitado: {new Date(u.requested_at).toLocaleDateString('es-GT', { year: 'numeric', month: 'short', day: 'numeric' })}
                      {u.approved_at && (
                        <> · Aprobado: {new Date(u.approved_at).toLocaleDateString('es-GT', { year: 'numeric', month: 'short', day: 'numeric' })}</>
                      )}
                    </p>
                  </div>

                  {/* Actions */}
                  {isSuperAdmin && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {u.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(u, 'approved')}
                            disabled={actionId === u.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold rounded-lg transition-colors disabled:bg-slate-300"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Aprobar
                          </button>
                          <button
                            onClick={() => updateStatus(u, 'rejected')}
                            disabled={actionId === u.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-slate-600 text-xs font-semibold rounded-lg transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Rechazar
                          </button>
                        </>
                      )}
                      {u.status === 'approved' && !isSelf && (
                        <>
                          <button
                            onClick={() => toggleRole(u)}
                            disabled={actionId === u.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-lg transition-colors"
                          >
                            {u.role === 'super_admin' ? 'Quitar super' : 'Hacer super'}
                          </button>
                          <button
                            onClick={() => updateStatus(u, 'revoked')}
                            disabled={actionId === u.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-slate-600 text-xs font-semibold rounded-lg transition-colors"
                          >
                            <Ban className="w-3.5 h-3.5" /> Revocar
                          </button>
                        </>
                      )}
                      {(u.status === 'rejected' || u.status === 'revoked') && (
                        <button
                          onClick={() => updateStatus(u, 'approved')}
                          disabled={actionId === u.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold rounded-lg transition-colors disabled:bg-slate-300"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Reactivar
                        </button>
                      )}
                      {actionId === u.id && (
                        <div className="w-4 h-4 border-2 border-sky-300 border-t-sky-600 rounded-full animate-spin" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
