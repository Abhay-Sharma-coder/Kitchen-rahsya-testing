'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Image as ImageIcon, Video, RefreshCw } from 'lucide-react';
import { Header } from '@/components/store/header';
import { Footer } from '@/components/store/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type GalleryItem = {
  _id: string;
  url: string;
  mediaType: 'image' | 'video';
  title?: string;
  sortOrder: number;
};

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl font-bold md:text-4xl">Gallery</h1>
              <p className="mt-2 text-muted-foreground">Moments from our spices, products, and brand story</p>
            </div>
            <Button variant="outline" onClick={() => void fetchGallery()} className="gap-2" disabled={loading}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading gallery...</p>
          ) : items.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">No gallery content available yet.</CardContent>
            </Card>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <Card key={item._id} className="overflow-hidden">
                  <div className="relative aspect-video bg-muted">
                    {item.mediaType === 'image' ? (
                      <Image src={item.url} alt={item.title || 'Gallery image'} fill className="object-cover" />
                    ) : (
                      <video src={item.url} controls className="h-full w-full object-cover" />
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <Badge variant="outline" className="gap-1">
                        {item.mediaType === 'image' ? <ImageIcon className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                        {item.mediaType}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">{item.title || 'Kitchen Rahasya Gallery'}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
