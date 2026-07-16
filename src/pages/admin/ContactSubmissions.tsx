import { useEffect, useState } from 'react';
import { Mail, Trash2, X, Loader2, Search, Inbox } from 'lucide-react';
import { supabase, ContactSubmission } from '../../lib/supabase';

export default function ContactSubmissionsAdmin() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactSubmission | null>(null);
  const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'replied'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    let query = supabase.from('contact_submissions').select('*').order('created_at', { ascending: false });
    if (filter !== 'all') query = query.eq('status', filter);
    const { data } = await query;
    if (data) setSubmissions(data as ContactSubmission[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]);

  async function markStatus(id: string, status: string) {
    await supabase.from('contact_submissions').update({ status }).eq('id', id);
    load();
    if (selected?.id === id) setSelected({ ...selected, status });
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este mensaje?')) return;
    await supabase.from('contact_submissions').delete().eq('id', id);
    if (selected?.id === id) setSelected(null);
    load();
  }

  const filtered = search
    ? submissions.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.subject.toLowerCase().includes(search.toLowerCase())
      )
    : submissions;

  const newCount = submissions.filter((s) => s.status === 'new').length;

  const statusColors: Record<string, string> = {
    new: 'bg-sky-500/10 text-sky-400',
    read: 'bg-amber-500/10 text-amber-400',
    replied: 'bg-green-500/10 text-green-400',
  };

  const statusLabels: Record<string, string> = {
    new: 'Nuevo',
    read: 'Leído',
    replied: 'Respondido',
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Mensajes de Contacto</h1>
        <p className="text-slate-400 text-sm mt-1">
          Gestiona los mensajes recibidos desde el formulario de contacto del sitio.
          {newCount > 0 && <span className="text-sky-400 ml-1">· {newCount} sin leer</span>}
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-slate-800/50 border border-white/10 rounded-xl p-1">
          {(['all', 'new', 'read', 'replied'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {f === 'all' ? 'Todos' : statusLabels[f]}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="w-full pl-9 pr-3 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 text-sky-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-12 text-center">
          <Inbox className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No hay mensajes {filter !== 'all' ? 'con este filtro' : 'todavía'}.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => (
            <div
              key={s.id}
              className={`flex items-center gap-4 p-4 bg-slate-800/50 border rounded-xl hover:bg-slate-800/80 transition-colors cursor-pointer ${s.status === 'new' ? 'border-sky-500/30' : 'border-white/10'}`}
              onClick={() => { setSelected(s); if (s.status === 'new') markStatus(s.id, 'read'); }}
            >
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.status === 'new' ? 'bg-sky-400' : 'bg-transparent'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-white text-sm font-medium truncate">{s.name}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[s.status]}`}>
                    {statusLabels[s.status]}
                  </span>
                </div>
                <p className="text-slate-400 text-xs truncate">{s.subject} · {s.email}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-slate-500 text-xs">{new Date(s.created_at).toLocaleDateString('es-GT')}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-lg bg-slate-800 border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-white font-bold text-lg">Mensaje de contacto</h2>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-500 text-xs mb-1">Nombre</p>
                  <p className="text-white text-sm font-medium">{selected.name}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">Email</p>
                  <a href={`mailto:${selected.email}`} className="text-sky-400 text-sm hover:underline">{selected.email}</a>
                </div>
                {selected.org && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Organización</p>
                    <p className="text-white text-sm">{selected.org}</p>
                  </div>
                )}
                <div>
                  <p className="text-slate-500 text-xs mb-1">Asunto</p>
                  <p className="text-white text-sm">{selected.subject}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">Fecha</p>
                  <p className="text-white text-sm">{new Date(selected.created_at).toLocaleString('es-GT')}</p>
                </div>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-2">Mensaje</p>
                <div className="p-4 bg-slate-900/60 rounded-xl text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {selected.message}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-6 py-4 border-t border-white/10">
              <a
                href={`mailto:${selected.email}?subject=Re: ${selected.subject}&body=Hola ${selected.name},%0D%0A%0D%0A`}
                onClick={() => markStatus(selected.id, 'replied')}
                className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <Mail className="w-4 h-4" />
                Responder
              </a>
              <button
                onClick={() => markStatus(selected.id, 'replied')}
                className="px-4 py-2.5 bg-green-600/20 text-green-400 hover:bg-green-600/30 text-sm font-semibold rounded-xl transition-colors"
              >
                Marcar respondido
              </button>
              <button
                onClick={() => handleDelete(selected.id)}
                className="ml-auto p-2.5 text-slate-400 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
