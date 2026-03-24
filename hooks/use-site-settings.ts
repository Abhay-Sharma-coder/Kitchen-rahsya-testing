'use client';

import { useEffect, useState } from 'react';

export type SiteSettings = {
  siteName: string;
  tagline: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
    whatsapp?: string;
  };
};

const defaultSettings: SiteSettings = {
  siteName: 'Kitchen Rahasya',
  tagline: 'Authentic Indian Spices, From Farm to Kitchen',
  address: 'Delhi, India',
  contactPhone: '+91 98765 43210',
  contactEmail: 'hello@kitchenrahasya.com',
  socialLinks: {},
};

let settingsCache: SiteSettings | null = null;
let settingsPromise: Promise<SiteSettings> | null = null;

async function loadSettings(): Promise<SiteSettings> {
  if (settingsCache) {
    return settingsCache;
  }

  if (!settingsPromise) {
    settingsPromise = (async () => {
      try {
        const response = await fetch('/api/site-settings');
        const data = (await response.json()) as { settings?: Partial<SiteSettings> };
        const merged: SiteSettings = {
          ...defaultSettings,
          ...data.settings,
          socialLinks: {
            ...defaultSettings.socialLinks,
            ...(data.settings?.socialLinks || {}),
          },
        };
        settingsCache = merged;
        return merged;
      } catch {
        settingsCache = defaultSettings;
        return defaultSettings;
      } finally {
        settingsPromise = null;
      }
    })();
  }

  return settingsPromise;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(settingsCache || defaultSettings);

  useEffect(() => {
    let mounted = true;
    loadSettings().then((loaded) => {
      if (mounted) {
        setSettings(loaded);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return settings;
}
