import { useEffect, useState } from 'react';
import { fetchCms } from './cmsApi.js';

const fallbackProfile = {
  name: 'Shandy Shulton Shihab',
  headline: 'Full Stack Developer',
  email: 'ssshandy60@gmail.com',
  phone: '+6281212181182',
  location: 'Jakarta, Indonesia',
  github: 'https://github.com/Shandyshulton',
  linkedin: 'https://www.linkedin.com/in/shandy-shulton-shihab-73a25922a/',
  summary: '',
};

const fallbackSettings = {
  general: { profile: fallbackProfile },
  home: {
    content: {
      greeting: '',
      available_text: '',
      about_label: '',
      about_title: '',
      about_paragraph_1: '',
      about_paragraph_2: '',
    },
  },
  contact: {
    content: {
      section_label: '',
      title: '',
      intro: '',
    },
    form: {
      success_title: '',
      success_text: '',
    },
  },
};

export function useCmsSettings() {
  const [settings, setSettings] = useState(fallbackSettings);

  useEffect(() => {
    let active = true;

    fetchCms('/public/settings')
      .then((payload) => {
        if (active) {
          setSettings({
            ...fallbackSettings,
            ...payload.settings,
            general: {
              ...fallbackSettings.general,
              ...(payload.settings?.general ?? {}),
              profile: { ...fallbackProfile, ...(payload.settings?.general?.profile ?? {}) },
            },
            home: { ...fallbackSettings.home, ...(payload.settings?.home ?? {}) },
            contact: { ...fallbackSettings.contact, ...(payload.settings?.contact ?? {}) },
          });
        }
      })
      .catch(() => {
        if (active) setSettings(fallbackSettings);
      });

    return () => {
      active = false;
    };
  }, []);

  return settings;
}

export function useCmsProfile() {
  return useCmsSettings().general.profile;
}
