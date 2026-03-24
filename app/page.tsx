'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Leaf, Shield, Truck, Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/store/header';
import { Footer } from '@/components/store/footer';
import { ProductCard } from '@/components/store/product-card';
import { useStore } from '@/lib/store-context';
import { testimonials, PRODUCT_IMAGES } from '@/lib/data';
import { cn } from '@/lib/utils';

const trustBadges = [
  {
    icon: Leaf,
    title: '100% Pure & Natural',
    description: 'No additives, no preservatives, no artificial colors',
  },
  {
    icon: Shield,
    title: 'Quality Assured',
    description: 'Rigorous testing for purity and safety',
  },
  {
    icon: Truck,
    title: 'Fresh Delivery',
    description: 'Packed fresh and delivered to your doorstep',
  },
];

export default function HomePage() {
  const { state } = useStore();

  const bestSellers = state.products.filter((p) => p.isBestSeller);
  const trending = state.products.filter((p) => p.isTrending);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-secondary/30 via-background to-primary/5">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-6">
                <Badge variant="secondary" className="text-sm">
                  Authentic Indian Spices
                </Badge>
                <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl text-balance">
                  The Secret to{' '}
                  <span className="text-primary">Authentic</span>{' '}
                  Indian Cooking
                </h1>
                <p className="max-w-lg text-lg text-muted-foreground leading-relaxed">
                  Discover premium spices handpicked from the finest farms of India. 
                  From farm to kitchen, experience the true taste of tradition.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/products">
                    <Button size="lg" className="gap-2">
                      Shop Now
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button variant="outline" size="lg">
                      Our Story
                    </Button>
                  </Link>
                </div>

                {/* Stats */}
                <div className="flex gap-8 pt-4">
                  <div>
                    <p className="text-3xl font-bold text-primary">50K+</p>
                    <p className="text-sm text-muted-foreground">Happy Customers</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-primary">100%</p>
                    <p className="text-sm text-muted-foreground">Pure & Natural</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-primary">4.9</p>
                    <p className="text-sm text-muted-foreground">Average Rating</p>
                  </div>
                </div>
              </div>

              {/* Hero Images */}
              <div className="relative">
                <div className="relative aspect-square max-w-md mx-auto">
                  {/* Decorative circles */}
                  <div className="absolute inset-0 rounded-full bg-secondary/20 animate-pulse" />
                  <div className="absolute inset-8 rounded-full bg-primary/10" />
                  
                  {/* Product images */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 md:w-52 md:h-52">
                    <Image
                      src={PRODUCT_IMAGES.turmeric}
                      alt="Turmeric Powder"
                      fill
                      className="object-contain drop-shadow-2xl animate-[float_3s_ease-in-out_infinite]"
                      priority
                    />
                  </div>
                  <div className="absolute bottom-8 left-0 w-36 h-36 md:w-44 md:h-44">
                    <Image
                      src={PRODUCT_IMAGES.redChilli}
                      alt="Red Chilli Powder"
                      fill
                      className="object-contain drop-shadow-2xl animate-[float_3s_ease-in-out_infinite_0.5s]"
                    />
                  </div>
                  <div className="absolute bottom-8 right-0 w-36 h-36 md:w-44 md:h-44">
                    <Image
                      src={PRODUCT_IMAGES.coriander}
                      alt="Coriander Powder"
                      fill
                      className="object-contain drop-shadow-2xl animate-[float_3s_ease-in-out_infinite_1s]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Wave decoration */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path
                d="M0 50L60 45C120 40 240 30 360 35C480 40 600 60 720 65C840 70 960 60 1080 50C1200 40 1320 30 1380 25L1440 20V100H0V50Z"
                fill="currentColor"
                className="text-background"
              />
            </svg>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl font-bold md:text-4xl">Why Kitchen Rahasya?</h2>
              <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
                We bring the authentic taste of India to your kitchen with our carefully curated spices
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {trustBadges.map((badge) => (
                <Card key={badge.title} className="text-center border-2 hover:border-primary/50 transition-colors">
                  <CardContent className="pt-8 pb-6">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                      <badge.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">{badge.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{badge.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Best Sellers */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-serif text-3xl font-bold md:text-4xl">Best Sellers</h2>
                <p className="mt-2 text-muted-foreground">Our most loved spices by customers</p>
              </div>
              <Link href="/products?filter=bestseller">
                <Button variant="outline" className="hidden sm:flex gap-2">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link href="/products?filter=bestseller">
                <Button variant="outline" className="gap-2">
                  View All Best Sellers
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Banner */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,white,transparent_50%)]" />
              </div>
              <div className="relative grid gap-8 p-8 md:grid-cols-2 md:p-12 items-center">
                <div className="space-y-4">
                  <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-0">
                    Limited Time Offer
                  </Badge>
                  <h2 className="font-serif text-3xl font-bold md:text-4xl text-balance">
                    Get 20% Off on Your First Order
                  </h2>
                  <p className="text-primary-foreground/90 leading-relaxed">
                    Use code <span className="font-bold">RAHASYA20</span> at checkout. 
                    Valid for new customers only.
                  </p>
                  <Link href="/products">
                    <Button variant="secondary" size="lg" className="gap-2">
                      Shop Now
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="relative h-48 md:h-64">
                  <Image
                    src={PRODUCT_IMAGES.turmeric}
                    alt="Featured Product"
                    fill
                    className="object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* All Products Preview */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-serif text-3xl font-bold md:text-4xl">Our Spices</h2>
                <p className="mt-2 text-muted-foreground">Explore our complete collection</p>
              </div>
              <Link href="/products">
                <Button variant="outline" className="hidden sm:flex gap-2">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {state.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl font-bold md:text-4xl">What Our Customers Say</h2>
              <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
                Join thousands of happy customers who have transformed their cooking
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id} className="relative">
                  <CardContent className="pt-8 pb-6">
                    <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/20" />
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground leading-relaxed">"{testimonial.content}"</p>
                    <div className="mt-6 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-semibold text-primary">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-serif text-3xl font-bold md:text-4xl text-balance">
              Ready to Transform Your Cooking?
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Experience the difference that authentic, premium spices can make in your kitchen. 
              Order now and taste the tradition.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/products">
                <Button size="lg" className="gap-2">
                  Start Shopping
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Float Animation Keyframes - Added via Tailwind config or inline style */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
