import { useEffect, useState } from 'react';
import {
  Flag, CheckCircle2, XCircle, Eye, Trash2, MessageSquare, Reply, Tag,
} from 'lucide-react';
import { supabase, ForumReport } from '../../lib/supabase';
import { REPORT_CATEGORY_LABELS } from '../../hooks/useForumModeration';

export default function ForumReports() {
  const [reports, setReports] = useState<ForumReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'open' | 'resolved' | 'dismissed' | 'all'>('open');
  const [contentCache, setContentCache] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    let q = supabase.from('forum_reports').select('*').order('created_at', { ascending: false });
    if (filter !== 'all') q = q.eq('status', filter);
    const { data } = await q;
    const list = (data as ForumReport[]) ?? [];
    setReports(list);
    setLoading(false);

    // Fetch reported content
    const cache: Record<string, string> = {};
    for (const r of list) {
      const table = r.target_type === 'thread' ? 'forum_threads' : 'forum_posts';
      const field = r.target_type === 'thread' ? 'title' : 'body';
      const { data: content } = await supabase.from(table).select(field).eq('id', r.target_id).maybeSingle();
      if (content) {
        const row = content as Record<string, string>;
        cache[`${r.target_type}:${r.target_id}`] = row[field] ?? '(contenido no encontrado)';
      }
    }
    setContentCache(cache);
  }

  useEffect(() => { load(); }, [filter]);

  async function resolveReport(r: ForumReport, status: 'resolved' | 'dismissed') {
    await supabase.from('forum_reports').update({
      status,
      resolved_at: new Date().toISOString(),
    }).eq('id', r.id);
    load();
  }

  async function deleteContent(r: ForumReport) {
    if (!confirm('¿Eliminar el contenido reportado? Esta acción no se puede deshacer.')) return;
    const table = r.target_type === 'thread' ? 'forum_threads' : 'forum_posts';
    await supabase.from(table).delete().eq('id', r.target_id);
    await resolveReport(r, 'resolved');
  }

  async function hidePost(r: ForumReport) {
    if (r.target_type !== 'post') return;
    await supabase.from('forum_posts').update({ is_hidden: true }).eq('id', r.target_id);
    await resolveReport(r, 'resolved');
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Reportes de contenido</h1>
        <p className="text-slate-400 text-sm mt-1">Revisa y resuelve reportes de contenido inapropiado.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1 w-fit">
        {[
          { key: 'open' as const, label: 'Abiertos' },
          { key: 'resolved' as const, label: 'Resueltos' },
          { key: 'dismissed' as const, label: 'Descartados' },
          { key: 'all' as const, label: 'Todos' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${filter === key ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500 text-sm">Cargando...</div>
      ) : reports.length === 0 ? (
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-10 text-center">
          <Flag className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No hay reportes en este filtro.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => {
            const contentKey = `${r.target_type}:${r.target_id}`;
            const content = contentCache[contentKey] ?? '(contenido no encontrado)';
            return (
              <div key={r.id} className="bg-slate-800/50 border border-white/10 rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    r.status === 'open' ? 'bg-red-500/15' : r.status === 'resolved' ? 'bg-green-500/15' : 'bg-slate-500/15'
                  }`}>
                    {r.target_type === 'thread' ? <MessageSquare className="w-4 h-4 text-red-400" /> : <Reply className="w-4 h-4 text-red-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        r.status === 'open' ? 'bg-red-500/10 text-red-400' :
                        r.status === 'resolved' ? 'bg-green-500/10 text-green-400' :
                        'bg-slate-500/10 text-slate-400'
                      }`}>
                        {r.status === 'open' ? 'Abierto' : r.status === 'resolved' ? 'Resuelto' : 'Descartado'}
                      </span>
                      {r.reason_category && r.reason_category !== 'otro' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-sky-500/10 text-sky-400">
                          <Tag className="w-3 h-3" /> {REPORT_CATEGORY_LABELS[r.reason_category] ?? r.reason_category}
                        </span>
                      )}
                      <span className="text-xs text-slate-500">{r.target_type === 'thread' ? 'Discusión' : 'Respuesta'}</span>
                      <span className="text-xs text-slate-500">{new Date(r.created_at).toLocaleDateString('es-GT')}</span>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3 mb-3">
                      <p className="text-slate-300 text-sm line-clamp-3">{content}</p>
                    </div>
                    <p className="text-slate-400 text-xs mb-3">
                      <span className="font-semibold text-slate-300">Motivo:</span> {r.reason}
                    </p>

                    {r.status === 'open' && (
                      <div className="flex items-center gap-2 flex-wrap">
                        {r.target_type === 'post' && (
                          <button onClick={() => hidePost(r)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/20 text-amber-400 text-xs font-semibold rounded-lg hover:bg-amber-600/30 transition-colors">
                            <Eye className="w-3.5 h-3.5" /> Ocultar
                          </button>
                        )}
                        <button onClick={() => deleteContent(r)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 text-red-400 text-xs font-semibold rounded-lg hover:bg-red-600/30 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" /> Eliminar contenido
                        </button>
                        <button onClick={() => resolveReport(r, 'resolved')} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600/20 text-green-400 text-xs font-semibold rounded-lg hover:bg-green-600/30 transition-colors">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Resolver
                        </button>
                        <button onClick={() => resolveReport(r, 'dismissed')} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-600/20 text-slate-400 text-xs font-semibold rounded-lg hover:bg-slate-600/30 transition-colors">
                          <XCircle className="w-3.5 h-3.5" /> Descartar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
