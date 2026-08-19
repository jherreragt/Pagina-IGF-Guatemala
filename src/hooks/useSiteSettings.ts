import { useEffect, useState } from 'react';
import { supabase, SiteSetting } from '../lib/supabase';

type SettingsMap = Record<string, string>;

const DEFAULTS: SettingsMap = {
  hero_title: 'IGF Guatemala',
  hero_subtitle: 'Un espacio abierto, inclusivo y multiactor para dialogar sobre el futuro de Internet en Guatemala.',
  hero_description: 'Reunimos a gobierno, sociedad civil, sector privado, academia, comunidad técnica, juventudes y organismos internacionales para discutir los principales desafíos digitales del país.',
  home_badge_text: 'Capítulo Guatemala de la Internet Society',
  about_extra_1: 'Funciona como un espacio de diálogo abierto, sin fines de lucro, donde múltiples sectores se reúnen en igualdad de condiciones para discutir los desafíos y oportunidades del ecosistema digital del país.',
  about_extra_2: 'No toma decisiones vinculante, sino que genera recomendaciones, construye puentes y fortalece la participación de Guatemala en las discusiones globales.',
  why_matters_title: '¿Por qué importa la gobernanza de Internet?',
  why_matters_intro: 'Las decisiones sobre Internet afectan derechos, desarrollo y democracia. Estos son los temas concretos que importan para Guatemala.',
  principles_title: 'Principios del IGF Guatemala',
  principles_intro: 'Los valores fundamentales que guían cada acción, conversación y decisión del capítulo.',
  community_title: 'Comunidad Multiactor',
  community_intro: 'Una plataforma compartida donde todos los sectores participan en igualdad de condiciones.',
  past_editions_title: 'Ediciones Anteriores',
  past_editions_intro: 'La memoria histórica del diálogo sobre gobernanza de Internet en Guatemala.',
  resources_title: 'Recursos y Materiales',
  resources_intro: 'Documentos, guías, relatorías, publicaciones y materiales para entender y participar en el debate sobre gobernanza de Internet.',
  resources_list: 'Documentos del IGF Global\nGuías sobre gobernanza de Internet\nPublicaciones sobre derechos digitales\nRelatorías y memorias de eventos\nGlosario de gobernanza de Internet\nMateriales para docentes y funcionarios',
  event_cta_title: 'Clausura 2026',
  event_cta_badge: 'Próximo evento',
  hero_btn_1_text: 'Conoce la Clausura 2026',
  hero_btn_2_text: 'Súmate a la comunidad',
  hero_btn_3_text: 'Ver recursos',
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
  show_past_editions: 'true',
  show_resources_cta: 'true',
  show_blog: 'true',
  show_social_embeds: 'true',
  footer_description: 'Un espacio abierto, inclusivo y multiactor para dialogar sobre el futuro de Internet en Guatemala.',
  footer_cta_text: 'Súmate a la comunidad',
  contact_email: 'igf.guatemala.isocgt@gmail.com',
  contact_address: 'Ciudad de Guatemala, Guatemala',
  contact_twitter: '@IGFGuatemala',
  contact_youtube: 'IGF Guatemala ISOCGT',
  facebook_page_url: 'https://www.facebook.com/share/1FvujVBQMp/',
  facebook_page_name: 'IGF Guatemala',
  youtube_channel_id: 'https://www.youtube.com/@IGFGuatemalaISOCGT',
  youtube_playlist_id: '',
  youtube_channel_name: 'IGF Guatemala ISOCGT',
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
