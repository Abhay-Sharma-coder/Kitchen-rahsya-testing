'use client';

import { useEffect, useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type SiteSettings = {
  siteName: string;
  tagline: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  socialLinks: {
    instagram: string;
    facebook: string;
    twitter: string;
    youtube: string;
    whatsapp: string;
  };
};

const emptySettings: SiteSettings = {
  siteName: 'Kitchen Rahasya',
  tagline: 'Authentic Indian Spices, From Farm to Kitchen',
  address: 'Delhi, India',
  contactPhone: '+91 98765 43210',
  contactEmail: 'hello@kitchenrahasya.com',
  socialLinks: {
    instagram: '',
    facebook: '',
    twitter: '',
    youtube: '',
    whatsapp: '',
  },
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(emptySettings);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/site-settings');
      const data = (await response.json()) as { settings?: Partial<SiteSettings> };
      setSettings({
        ...emptySettings,
        ...data.settings,
        socialLinks: {
          ...emptySettings.socialLinks,
          ...(data.settings?.socialLinks || {}),
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSettings();
  }, []);

  const handleSave = async () => {
    const token = localStorage.getItem('kr_token');
    if (!token) {
      alert('Admin auth token missing. Please login again.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/site-settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      const data = (await response.json()) as { settings?: Partial<SiteSettings>; error?: string };
      if (!response.ok) {
        console.error('Settings update failed:', data);
        alert(`Error: ${data.error || 'Failed to save settings'}`);
        return;
      }

      alert('Website settings updated successfully.');
      if (data.settings) {
        setSettings({
          ...emptySettings,
          ...data.settings,
          socialLinks: {
            ...emptySettings.socialLinks,
            ...(data.settings.socialLinks || {}),
          },
        });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold">Website Settings</h1>
          <p className="text-muted-foreground">Manage public website address, contact details, and social links</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void fetchSettings()} disabled={loading} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Info</CardTitle>
          <CardDescription>This information appears on your customer-facing pages.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="siteName">Website Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings((prev) => ({ ...prev, siteName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={settings.tagline}
                onChange={(e) => setSettings((prev) => ({ ...prev, tagline: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={settings.address}
              onChange={(e) => setSettings((prev) => ({ ...prev, address: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Number</Label>
              <Input
                id="contactPhone"
                value={settings.contactPhone}
                onChange={(e) => setSettings((prev) => ({ ...prev, contactPhone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings((prev) => ({ ...prev, contactEmail: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Accounts</CardTitle>
          <CardDescription>Set redirect links for social media icons and buttons.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram URL</Label>
              <Input
                id="instagram"
                placeholder="https://instagram.com/yourpage"
                value={settings.socialLinks.instagram}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, instagram: e.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook URL</Label>
              <Input
                id="facebook"
                placeholder="https://facebook.com/yourpage"
                value={settings.socialLinks.facebook}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, facebook: e.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter">X/Twitter URL</Label>
              <Input
                id="twitter"
                placeholder="https://x.com/yourpage"
                value={settings.socialLinks.twitter}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, twitter: e.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube URL</Label>
              <Input
                id="youtube"
                placeholder="https://youtube.com/@yourchannel"
                value={settings.socialLinks.youtube}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, youtube: e.target.value },
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp Link</Label>
            <Input
              id="whatsapp"
              placeholder="https://wa.me/919876543210"
              value={settings.socialLinks.whatsapp}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  socialLinks: { ...prev.socialLinks, whatsapp: e.target.value },
                }))
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
