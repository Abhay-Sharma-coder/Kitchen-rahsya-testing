'use client';

import Link from 'next/link';
import { Leaf, Shield, HeartHandshake, Truck, Phone, Mail, MapPin, ArrowRight } from 'lucide-react';
import { Header } from '@/components/store/header';
import { Footer } from '@/components/store/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSiteSettings } from '@/hooks/use-site-settings';

const values = [
  {
    title: 'Purity First',
    description: 'We source spices from trusted farms and keep quality checks strict at every stage.',
    icon: Leaf,
  },
  {
    title: 'Honest Quality',
    description: 'No unnecessary fillers. Just authentic spices with real aroma, color, and flavor.',
    icon: Shield,
  },
  {
    title: 'Customer Trust',
    description: 'Your family’s taste and health matter most, and that guides every product we ship.',
    icon: HeartHandshake,
  },
  {
    title: 'Fresh Delivery',
    description: 'Careful packing and fast dispatch ensure freshness from our kitchen to yours.',
    icon: Truck,
  },
];

export default function AboutPage() {
  const settings = useSiteSettings();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-secondary/40 via-background to-primary/10">
          <div className="container mx-auto px-4 py-14 md:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="secondary" className="mb-4">Our Story</Badge>
              <h1 className="font-serif text-4xl font-bold tracking-tight md:text-5xl">About {settings.siteName}</h1>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
                {settings.tagline}. We are building a spice brand that keeps traditional Indian flavors alive with modern quality standards.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/products">
                  <Button className="gap-2">Explore Products <ArrowRight className="h-4 w-4" /></Button>
                </Link>
                <Link href="/gallery">
                  <Button variant="outline">View Gallery</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 md:py-20">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
              <Card className="border-2">
                <CardContent className="p-6 md:p-8">
                  <h2 className="font-serif text-2xl font-bold md:text-3xl">How We Started</h2>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    {settings.siteName} started with one simple thought: authentic Indian food needs authentic spices.
                    We saw many homes struggling with low-aroma, over-processed masalas, and we wanted to fix that.
                  </p>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    Today, we work closely with trusted sourcing partners and focus on clean processing, careful packing,
                    and honest quality so every meal tastes the way it should.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6 md:p-8">
                  <h2 className="font-serif text-2xl font-bold md:text-3xl">What We Promise</h2>
                  <ul className="mt-4 space-y-3 text-muted-foreground">
                    <li>• Transparent sourcing and consistent quality checks</li>
                    <li>• Fresh stock rotation for better aroma and flavor</li>
                    <li>• Safe packaging and reliable doorstep delivery</li>
                    <li>• Customer-first service and continuous improvement</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-muted/30 py-14 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mb-8 text-center">
              <h2 className="font-serif text-3xl font-bold md:text-4xl">Why Customers Choose Us</h2>
              <p className="mt-3 text-muted-foreground">Built on quality, trust, and authentic taste.</p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => (
                <Card key={value.title} className="h-full border-2">
                  <CardContent className="p-6">
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                      <value.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">{value.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 md:py-20">
          <div className="container mx-auto px-4">
            <div className="rounded-2xl border bg-card p-6 md:p-8">
              <h2 className="font-serif text-2xl font-bold md:text-3xl">Contact & Business Details</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <a href={`tel:${settings.contactPhone}`} className="rounded-xl border p-4 hover:border-primary/40 transition-colors">
                  <Phone className="mb-2 h-5 w-5 text-primary" />
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{settings.contactPhone}</p>
                </a>
                <a href={`mailto:${settings.contactEmail}`} className="rounded-xl border p-4 hover:border-primary/40 transition-colors">
                  <Mail className="mb-2 h-5 w-5 text-primary" />
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium break-all">{settings.contactEmail}</p>
                </a>
                <div className="rounded-xl border p-4">
                  <MapPin className="mb-2 h-5 w-5 text-primary" />
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{settings.address}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
