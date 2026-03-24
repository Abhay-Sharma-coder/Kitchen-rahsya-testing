'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useSiteSettings } from '@/hooks/use-site-settings';

const footerLinks = {
  shop: [
    { label: 'All Products', href: '/products' },
    { label: 'Best Sellers', href: '/products?filter=bestseller' },
    { label: 'New Arrivals', href: '/products?filter=new' },
    { label: 'Offers', href: '/products?filter=offers' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
  ],
  support: [
    { label: 'FAQs', href: '/faqs' },
    { label: 'Shipping', href: '/shipping' },
    { label: 'Returns', href: '/returns' },
    { label: 'Track Order', href: '/track' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Refund Policy', href: '/refund' },
  ],
};

export function Footer() {
  const settings = useSiteSettings();

  const socialHref = (value?: string) => (value && value.trim().length > 0 ? value : '#');

  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="font-serif text-2xl font-bold text-primary">
              {settings.siteName}
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground leading-relaxed">
              {settings.tagline}
            </p>
            <div className="mt-6 flex gap-4">
              <a href={socialHref(settings.socialLinks.instagram)} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href={socialHref(settings.socialLinks.facebook)} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href={socialHref(settings.socialLinks.twitter)} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 rounded-xl bg-primary/5 p-6 md:p-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div>
              <h4 className="font-serif text-xl font-semibold">Stay Updated</h4>
              <p className="text-sm text-muted-foreground">Get exclusive offers and recipe tips in your inbox</p>
            </div>
            <div className="flex w-full max-w-md gap-2">
              <Input placeholder="Enter your email" type="email" className="bg-background" />
              <Button>Subscribe</Button>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <a href={`mailto:${settings.contactEmail}`} className="flex items-center gap-2 hover:text-primary transition-colors">
            <Mail className="h-4 w-4" />
            {settings.contactEmail}
          </a>
          <a href={`tel:${settings.contactPhone}`} className="flex items-center gap-2 hover:text-primary transition-colors">
            <Phone className="h-4 w-4" />
            {settings.contactPhone}
          </a>
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {settings.address}
          </span>
        </div>

        <Separator className="my-8" />

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <p>&copy; {new Date().getFullYear()} {settings.siteName}. All rights reserved.</p>
          <div className="flex gap-4">
            {footerLinks.legal.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-primary transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
