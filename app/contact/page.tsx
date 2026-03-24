'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Clock3, Send, Instagram, Facebook, Twitter, Youtube } from 'lucide-react';
import { Header } from '@/components/store/header';
import { Footer } from '@/components/store/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSiteSettings } from '@/hooks/use-site-settings';

export default function ContactPage() {
  const settings = useSiteSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });

  const socialLinks = [
    { label: 'Instagram', href: settings.socialLinks.instagram || '#', icon: Instagram },
    { label: 'Facebook', href: settings.socialLinks.facebook || '#', icon: Facebook },
    { label: 'Twitter', href: settings.socialLinks.twitter || '#', icon: Twitter },
    { label: 'YouTube', href: settings.socialLinks.youtube || '#', icon: Youtube },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.email || !formData.subject || !formData.message) {
      alert('Please fill all fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact-leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        alert(data.error || 'Failed to submit inquiry. Please try again.');
        return;
      }

      alert('Thanks! Your message has been sent successfully.');
      setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-3">Contact Us</Badge>
            <h1 className="font-serif text-4xl font-bold tracking-tight md:text-5xl">Let’s Connect</h1>
            <p className="mt-3 text-muted-foreground md:text-lg">
              Questions about orders, products, or partnerships? We’re here to help.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Contact Details</CardTitle>
                <CardDescription>Managed from admin settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <a href={`tel:${settings.contactPhone}`} className="flex items-start gap-3 rounded-lg border p-3 hover:border-primary/40 transition-colors">
                  <Phone className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{settings.contactPhone}</p>
                  </div>
                </a>

                <a href={`mailto:${settings.contactEmail}`} className="flex items-start gap-3 rounded-lg border p-3 hover:border-primary/40 transition-colors">
                  <Mail className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium break-all">{settings.contactEmail}</p>
                  </div>
                </a>

                <div className="flex items-start gap-3 rounded-lg border p-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{settings.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border p-3">
                  <Clock3 className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Support Hours</p>
                    <p className="font-medium">Mon - Sat, 10:00 AM - 7:00 PM</p>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="mb-2 text-sm text-muted-foreground">Follow us</p>
                  <div className="flex flex-wrap gap-2">
                    {socialLinks.map((item) => (
                      <a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs hover:border-primary/40 transition-colors"
                      >
                        <item.icon className="h-3 w-3" />
                        {item.label}
                      </a>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Send an Inquiry</CardTitle>
                <CardDescription>We usually respond within 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="How can we help?"
                      value={formData.subject}
                      onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      rows={6}
                      placeholder="Write your message here..."
                      value={formData.message}
                      onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Button type="submit" className="gap-2" disabled={isSubmitting}>
                      <Send className="h-4 w-4" />
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                    <Link href="/products">
                      <Button type="button" variant="outline">Continue Shopping</Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
