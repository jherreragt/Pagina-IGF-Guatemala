import { useEffect, useState } from 'react';
import { Save, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase, SiteSetting } from '../../lib/supabase';

const SECTION_LABELS: Record<string, string> = {
  hero: 'Sección Hero (Inicio)',
  sobre: 'Sobre IGF Guatemala',
  evento: 'Clausura 2026',
  inicio: 'Textos del Home',
  footer: 'Footer',
  visibilidad: 'Visibilidad de Secciones',
  contacto: 'Información de Contacto y Redes',
};

const SECTION_ORDER = ['hero', 'evento', 'sobre', 'inicio', 'footer', 'visibilidad', 'contacto'];

export default function SiteSettings() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    hero: true, evento: true, sobre: false, inicio: false, footer: false, visibilidad: false, contacto: false,
  });

  useEffect(() => {
    supabase.from('site_settings').select('*').order('sort_order').then(({ data }) => {
      if (data) {
        setSettings(data as SiteSetting[]);
        const map: Record<string, string> = {};
        (data as SiteSetting[]).forEach((s) => { map[s.key] = s.value ?? ''; });
        setValues(map);
      }
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    setError('');
    setSaved(false);

    const updates = settings.map((s) => ({
      id: s.id,
      key: s.key,
      value: values[s.key] ?? s.value,
      label: s.label,
      section: s.section,
      type: s.type,
      sort_order: s.sort_order,
    }));

    const { error: err } = await supabase.from('site_settings').upsert(updates);
    setSaving(false);
    if (err) {
      setError('No se pudo guardar la configuración. Intenta de nuevo.');
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  const grouped = SECTION_ORDER.reduce<Record<string, SiteSetting[]>>((acc, section) => {
    acc[section] = settings.filter((s) => s.section === section);
    return acc;
  }, {});

  function toggleSection(section: string) {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }

  function renderField(setting: SiteSetting) {
    const val = values[setting.key] ?? '';

    if (setting.type === 'boolean') {
      return (
        <label key={setting.key} className="flex items-center justify-between p-4 bg-white/60 rounded-xl cursor-pointer hover:bg-white transition-colors">
          <div>
            <p className="text-slate-900 text-sm font-medium">{setting.label}</p>
            <p className="text-slate-500 text-xs mt-0.5 font-mono">{setting.key}</p>
          </div>
          <div
            onClick={() => setValues((v) => ({ ...v, [setting.key]: val === 'true' ? 'false' : 'true' }))}
            className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${val === 'true' ? 'bg-sky-600' : 'bg-slate-700'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${val === 'true' ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
        </label>
      );
    }

    if (setting.type === 'textarea') {
      return (
        <div key={setting.key} className="p-4 bg-white/60 rounded-xl">
          <label className="block text-sm font-medium text-slate-500 mb-1">{setting.label}</label>
          <p className="text-slate-600 text-xs mb-2 font-mono">{setting.key}</p>
          <textarea
            value={val}
            onChange={(e) => setValues((v) => ({ ...v, [setting.key]: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-sky-500 transition-colors resize-y"
          />
        </div>
      );
    }

    return (
      <div key={setting.key} className="p-4 bg-white/60 rounded-xl">
        <label className="block text-sm font-medium text-slate-500 mb-1">{setting.label}</label>
        <p className="text-slate-600 text-xs mb-2 font-mono">{setting.key}</p>
        <input
          type="text"
          value={val}
          onChange={(e) => setValues((v) => ({ ...v, [setting.key]: e.target.value }))}
          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-sky-500 transition-colors"
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Configuración del sitio</h1>
          <p className="text-slate-500 text-sm mt-1">Edita los textos y secciones del sitio público del IGF Guatemala.</p>
        </div>
        <div className="flex gap-3 items-center">
          {saved && (
            <div className="flex items-center gap-1.5 text-green-400 text-sm">
              <CheckCircle2 className="w-4 h-4" /> Guardado
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors"
          >
            {saving ? <div className="w-4 h-4 border-2 border-slate-300 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {SECTION_ORDER.map((section) => {
        const fields = grouped[section] ?? [];
        if (fields.length === 0) return null;
        const isOpen = openSections[section];
        return (
          <div key={section} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <button
              onClick={() => toggleSection(section)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-100 transition-colors"
            >
              <div className="text-left">
                <p className="text-slate-900 font-semibold text-sm">{SECTION_LABELS[section] ?? section}</p>
                <p className="text-slate-500 text-xs mt-0.5">{fields.length} campo{fields.length !== 1 ? 's' : ''}</p>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </button>
            {isOpen && (
              <div className="px-6 pb-6 space-y-3 border-t border-slate-100 pt-4">
                {fields.map(renderField)}
              </div>
            )}
          </div>
        );
      })}

      <div className="pb-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors"
        >
          {saving ? <div className="w-4 h-4 border-2 border-slate-300 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Guardando...' : 'Guardar todos los cambios'}
        </button>
      </div>
    </div>
  );
}
