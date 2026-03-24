import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { Toaster } from 'sonner';
import { StoreProvider } from '@/lib/store-context';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Kitchen Rahasya | Authentic Indian Spices',
  description: 'Discover the secret to authentic Indian cooking with our premium, handpicked spices. From farm to kitchen, experience the true taste of India.',
  keywords: ['Indian spices', 'turmeric', 'red chilli', 'coriander', 'organic spices', 'authentic spices'],
  authors: [{ name: 'Kitchen Rahasya' }],
  openGraph: {
    title: 'Kitchen Rahasya | Authentic Indian Spices',
    description: 'Discover the secret to authentic Indian cooking with our premium, handpicked spices.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#C53030' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${playfair.variable} ${inter.variable} font-sans antialiased`}>
        <StoreProvider>
          {children}
          <Toaster position="top-center" richColors />
        </StoreProvider>
        <Analytics />
      </body>
    </html>
  );
}
