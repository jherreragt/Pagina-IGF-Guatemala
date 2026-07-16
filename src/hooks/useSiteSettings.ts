import { useEffect, useState } from 'react';
import { supabase, SiteSetting } from '../lib/supabase';

type SettingsMap = Record<string, string>;

const DEFAULTS: SettingsMap = {
  hero_title: 'IGF Guatemala',
  hero_subtitle: 'Un espacio abierto, inclusivo y multiactor para dialogar sobre el futuro de Internet en Guatemala.',
  hero_description: 'Reunimos a gobierno, sociedad civil, sector privado, academia, comunidad técnica, juventudes y organismos internacionales para discutir los principales desafíos digitales del país.',
  event_year: '2026',
  event_date: '5 de noviembre de 2026',
  event_location: 'Ciudad de Guatemala',
  event_modality: 'Presencial con transmisión en línea',
  event_lema: 'Por una Internet abierta, segura, inclusiva y democrática para Guatemala',
  event_datetime_iso: '2026-11-05T09:00:00',
  event_registration_open: 'true',
  event_sessions_open: 'true',
  about_title: '¿Qué es el IGF Guatemala?',
  about_body: 'El IGF Guatemala es el capítulo nacional del Internet Governance Forum (IGF).',
  show_principles: 'true',
  show_community: 'true',
  show_themes: 'true',
  show_past_editions: 'true',
  show_resources_cta: 'true',
  show_blog: 'true',
  show_social_embeds: 'true',
  contact_email: 'info@igfguatemala.org',
  contact_address: 'Ciudad de Guatemala, Guatemala',
  contact_twitter: '@IGFGuatemala',
  contact_youtube: 'IGF Guatemala',
  facebook_page_url: '',
  facebook_page_name: 'IGF Guatemala',
  youtube_channel_id: '',
  youtube_playlist_id: '',
  youtube_channel_name: 'IGF Guatemala',
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SettingsMap>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('key, value')
      .then(({ data }) => {
        if (data && data.length > 0) {
          const map: SettingsMap = { ...DEFAULTS };
          (data as Pick<SiteSetting, 'key' | 'value'>[]).forEach(({ key, value }) => {
            if (value !== null) map[key] = value;
          });
          setSettings(map);
        }
        setLoading(false);
      });
  }, []);

  return { settings, loading };
}
