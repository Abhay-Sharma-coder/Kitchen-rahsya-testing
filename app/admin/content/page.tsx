'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Upload, Trash2, ImagePlus, Video, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

type GalleryItem = {
  _id: string;
  url: string;
  mediaType: 'image' | 'video';
  title?: string;
  sortOrder: number;
  isActive: boolean;
};

export default function AdminContentPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [file, setFile] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState('');

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gallery');
      const data = (await response.json()) as { gallery?: GalleryItem[] };
      setItems(data.gallery || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchGallery();
  }, []);

  const resetForm = () => {
    setTitle('');
    setSortOrder(0);
    setMediaType('image');
    setFile(null);
    setMediaUrl('');
  };

  const handleUpload = async () => {
    const token = localStorage.getItem('kr_token');
    if (!token) {
      alert('Admin auth token missing. Please login again.');
      return;
    }
    if (!file && !mediaUrl.trim()) {
      alert('Please select a file or enter a media URL.');
      return;
    }

    setUploading(true);
    try {
      let response: Response;

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('mediaType', mediaType);
        formData.append('title', title);
        formData.append('sortOrder', String(sortOrder));

        response = await fetch('/api/gallery', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      } else {
        response = await fetch('/api/gallery', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            url: mediaUrl.trim(),
            mediaType,
            title,
            sortOrder,
          }),
        });
      }

      const data = (await response.json()) as { item?: { url: string }; error?: string; details?: string };
      if (!response.ok) {
        const message = data.details ? `${data.error || 'Upload failed'}: ${data.details}` : data.error || 'Upload failed';
        alert(message);
        return;
      }

      resetForm();
      await fetchGallery();
    } finally {
      setUploading(false);
    }
  };

  const handleAddFromUrl = async () => {
    const token = localStorage.getItem('kr_token');
    if (!token) {
      alert('Admin auth token missing. Please login again.');
      return;
    }

    if (!mediaUrl.trim()) {
      alert('Please enter image/video URL first.');
      return;
    }

    setUploading(true);
    try {
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url: mediaUrl.trim(),
          mediaType,
          title,
          sortOrder,
        }),
      });

      const data = (await response.json()) as { item?: { url: string }; error?: string; details?: string };
      if (!response.ok || !data.item) {
        const message = data.details ? `${data.error || 'Failed to add media URL'}: ${data.details}` : data.error || 'Failed to add media URL';
        alert(message);
        return;
      }

      resetForm();
      await fetchGallery();
    } finally {
      setUploading(false);
    }
  };

  const addDefaultImage = async () => {
    const token = localStorage.getItem('kr_token');
    if (!token) {
      alert('Admin auth token missing. Please login again.');
      return;
    }

    setUploading(true);
    try {
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url: '/images/gallery-image.jpeg',
          mediaType: 'image',
          title: 'Default Gallery Image',
          sortOrder: items.length,
        }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        alert(data.error || 'Failed to add default image');
        return;
      }

      await fetchGallery();
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('kr_token');
    if (!token) {
      alert('Admin auth token missing. Please login again.');
      return;
    }

    const response = await fetch(`/api/gallery/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      alert(data.error || 'Failed to delete item');
      return;
    }

    await fetchGallery();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Gallery Content</h1>
        <p className="text-muted-foreground">Upload and manage website gallery images/videos</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Media
          </CardTitle>
          <CardDescription>Add gallery media from your local system, URL, or use default image</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-1">
              <Label>Media Type</Label>
              <Select value={mediaType} onValueChange={(value) => setMediaType(value as 'image' | 'video')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-1">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Optional title" />
            </div>
            <div className="space-y-2 sm:col-span-1">
              <Label>Sort Order</Label>
              <Input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Choose File</Label>
            <Input
              type="file"
              accept={mediaType === 'image' ? 'image/*' : 'video/*'}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="space-y-2">
            <Label>Or Add from URL</Label>
            <Input
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder={mediaType === 'image' ? 'https://example.com/image.jpg' : 'https://example.com/video.mp4'}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleUpload} disabled={uploading} className="gap-2">
              <Upload className="h-4 w-4" />
              {uploading ? 'Uploading...' : 'Upload to Gallery'}
            </Button>
            <Button variant="outline" onClick={handleAddFromUrl} disabled={uploading} className="gap-2">
              <ImagePlus className="h-4 w-4" />
              Add URL
            </Button>
            <Button variant="outline" onClick={addDefaultImage} disabled={uploading} className="gap-2">
              <ImagePlus className="h-4 w-4" />
              Use Default Gallery Image
            </Button>
            <Button variant="outline" onClick={() => void fetchGallery()} disabled={loading} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gallery Items</CardTitle>
          <CardDescription>{items.length} item(s) currently active</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading gallery...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No gallery items yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <div key={item._id} className="rounded-lg border p-3">
                  <div className="relative mb-3 aspect-video overflow-hidden rounded bg-muted">
                    {item.mediaType === 'image' ? (
                      <Image src={item.url} alt={item.title || 'Gallery image'} fill className="object-cover" />
                    ) : (
                      <video src={item.url} controls className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="gap-1">
                        {item.mediaType === 'image' ? <ImagePlus className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                        {item.mediaType}
                      </Badge>
                      <span className="text-xs text-muted-foreground">Order: {item.sortOrder}</span>
                    </div>
                    <p className="text-sm font-medium">{item.title || 'Untitled'}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.url}</p>
                    <Button variant="destructive" size="sm" className="w-full gap-2" onClick={() => void handleDelete(item._id)}>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
