import { useEffect, useState } from 'react';
import { Search, Download, Trash2, ClipboardList } from 'lucide-react';
import { supabase, EventRegistration } from '../../lib/supabase';

export default function EventRegistrations() {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'presencial' | 'virtual'>('all');

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('event_registrations').select('*').order('created_at', { ascending: false });
    setRegistrations((data as EventRegistration[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function deleteReg(id: string) {
    if (!confirm('¿Eliminar este registro?')) return;
    await supabase.from('event_registrations').delete().eq('id', id);
    setRegistrations((prev) => prev.filter((r) => r.id !== id));
  }

  function exportCSV() {
    const headers = ['Nombre', 'Organización', 'Cargo', 'Correo', 'Teléfono', 'Sector', 'Modalidad', 'Fecha'];
    const rows = registrations.map((r) => [
      r.name, r.organization ?? '', r.role ?? '', r.email, r.phone ?? '',
      r.sector ?? '', r.modality ?? '', new Date(r.created_at).toLocaleDateString('es-GT'),
    ]);
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'registros-igf-guatemala.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = registrations.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || (r.organization ?? '').toLowerCase().includes(q);
    const matchFilter = filter === 'all' || r.modality === filter;
    return matchSearch && matchFilter;
  });

  const presencialCount = registrations.filter((r) => r.modality === 'presencial').length;
  const virtualCount = registrations.filter((r) => r.modality === 'virtual').length;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Registros de participantes</h1>
          <p className="text-slate-400 text-sm mt-1">{registrations.length} registros totales · {presencialCount} presenciales · {virtualCount} virtuales</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-semibold text-sm rounded-xl transition-colors flex-shrink-0">
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" placeholder="Buscar por nombre, correo u organización..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition-colors" />
        </div>
        <div className="flex rounded-xl border border-white/10 overflow-hidden">
          {(['all', 'presencial', 'virtual'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2.5 text-xs font-medium transition-colors ${filter === f ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
              {f === 'all' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500 text-sm">Cargando registros...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">
              {search || filter !== 'all' ? 'No se encontraron registros con esos criterios.' : 'Aún no hay participantes registrados.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  {['Nombre', 'Organización', 'Correo', 'Sector', 'Modalidad', 'Fecha', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-slate-500 text-xs font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{r.name}</p>
                      {r.role && <p className="text-slate-500 text-xs">{r.role}</p>}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{r.organization ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{r.email}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{r.sector ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.modality === 'presencial' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'}`}>
                        {r.modality ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(r.created_at).toLocaleDateString('es-GT', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteReg(r.id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
