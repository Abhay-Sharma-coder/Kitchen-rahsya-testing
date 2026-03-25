'use client';

import { useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  Shield,
  Leaf,
  Clock,
  ChevronRight,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/store/header';
import { Footer } from '@/components/store/footer';
import { ProductCard } from '@/components/store/product-card';
import { useStore } from '@/lib/store-context';
import { formatPrice, formatWeight, type Review } from '@/lib/data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const { state, dispatch, getProductBySlug, getProductReviews, addToCart } = useStore();

  const product = getProductBySlug(slug);
  const reviews = product ? getProductReviews(product.id) : [];

  const [selectedWeight, setSelectedWeight] = useState(product?.priceOptions[0].weight || '');
  const [quantity, setQuantity] = useState(1);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', content: '' });

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Product Not Found</h1>
            <p className="mt-2 text-muted-foreground">The product you are looking for does not exist.</p>
            <Link href="/products">
              <Button className="mt-4">Browse Products</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const selectedPriceOption = product.priceOptions.find((opt) => opt.weight === selectedWeight);
  const isInWishlist = state.wishlist.includes(product.id);
  const discount = selectedPriceOption
    ? Math.round(((selectedPriceOption.mrp - selectedPriceOption.price) / selectedPriceOption.mrp) * 100)
    : 0;

  // Calculate estimated delivery
  const today = new Date();
  const deliveryDate = new Date(today);
  deliveryDate.setDate(today.getDate() + 3);
  const deliveryDateStr = deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  // Hours until cutoff for same-day processing
  const cutoffHour = 14; // 2 PM
  const currentHour = today.getHours();
  const hoursUntilCutoff = cutoffHour - currentHour;

  // Related products
  const relatedProducts = state.products.filter((p) => p.id !== product.id).slice(0, 3);

  const handleAddToCart = () => {
    addToCart(product, selectedWeight, quantity);
    toast.success(`${product.name} (${selectedWeight}) added to cart!`);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedWeight, quantity);
    router.push('/checkout');
  };

  const handleToggleWishlist = () => {
    dispatch({ type: 'TOGGLE_WISHLIST', payload: product.id });
    toast.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.user) {
      toast.error('Please login to submit a review');
      return;
    }
    if (!newReview.title || !newReview.content) {
      toast.error('Please fill in all fields');
      return;
    }

    const token = localStorage.getItem('kr_token');
    if (!token) {
      toast.error('Auth token not found. Please login again.');
      return;
    }

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product.id,
          rating: newReview.rating,
          title: newReview.title,
          content: newReview.content,
        }),
      });

      const data = (await response.json()) as { review?: Review; error?: string };
      if (!response.ok || !data.review) {
        toast.error(data.error || 'Failed to submit review');
        return;
      }

      dispatch({ type: 'ADD_REVIEW', payload: data.review });
      setNewReview({ rating: 5, title: '', content: '' });
      toast.success('Review submitted! It will appear after moderation.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit review');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/products" className="hover:text-foreground transition-colors">
                Products
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">{product.name}</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Product Image */}
            <div className="relative">
              <div className="sticky top-24">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted/50">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain p-8"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />

                  {/* Badges */}
                  <div className="absolute left-4 top-4 flex flex-col gap-2">
                    {product.isBestSeller && (
                      <Badge className="bg-primary text-primary-foreground">Best Seller</Badge>
                    )}
                    {product.isTrending && <Badge variant="secondary">Trending</Badge>}
                    {discount > 0 && <Badge variant="destructive">{discount}% OFF</Badge>}
                  </div>

                  {/* Wishlist Button */}
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      'absolute right-4 top-4 rounded-full bg-background/80 backdrop-blur',
                      isInWishlist && 'text-primary'
                    )}
                    onClick={handleToggleWishlist}
                    aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart className={cn('h-5 w-5', isInWishlist && 'fill-current')} />
                  </Button>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Leaf className="h-5 w-5 text-primary" />
                    </div>
                    <span className="mt-2 text-xs text-muted-foreground">100% Natural</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <span className="mt-2 text-xs text-muted-foreground">Quality Assured</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Truck className="h-5 w-5 text-primary" />
                    </div>
                    <span className="mt-2 text-xs text-muted-foreground">Fast Delivery</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Title & Rating */}
              <div>
                <p className="text-sm font-medium text-primary uppercase tracking-wide">
                  {product.category}
                </p>
                <h1 className="mt-1 font-serif text-3xl font-bold md:text-4xl">{product.name}</h1>
                <p className="text-xl text-muted-foreground">{product.nameHindi}</p>

                <div className="mt-3 flex items-center gap-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'h-4 w-4',
                          i < Math.floor(product.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-muted text-muted'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm">
                    {product.rating} ({product.reviewCount} reviews)
                  </span>
                </div>
              </div>

              <Separator />

              {/* Price & Weight Selection */}
              <div>
                <Label className="text-base font-semibold">Select Weight</Label>
                <div className="mt-3 flex flex-wrap gap-3">
                  {product.priceOptions.map((opt) => (
                    <button
                      key={opt.weight}
                      onClick={() => setSelectedWeight(opt.weight)}
                      className={cn(
                        'relative flex flex-col items-center rounded-lg border-2 px-4 py-3 transition-all',
                        selectedWeight === opt.weight
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      {selectedWeight === opt.weight && (
                        <Check className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-primary p-0.5 text-primary-foreground" />
                      )}
                      <span className="font-semibold">{opt.weight}</span>
                      <span className="text-lg font-bold text-primary">{formatPrice(opt.price)}</span>
                      {opt.mrp > opt.price && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(opt.mrp)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Display */}
              {selectedPriceOption && (
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-primary">
                    {formatPrice(selectedPriceOption.price * quantity)}
                  </span>
                  {selectedPriceOption.mrp > selectedPriceOption.price && (
                    <>
                      <span className="text-xl text-muted-foreground line-through">
                        {formatPrice(selectedPriceOption.mrp * quantity)}
                      </span>
                      <Badge variant="destructive">Save {formatPrice((selectedPriceOption.mrp - selectedPriceOption.price) * quantity)}</Badge>
                    </>
                  )}
                </div>
              )}

              {/* Quantity */}
              <div>
                <Label className="text-base font-semibold">Quantity</Label>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex items-center rounded-lg border">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-semibold">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity((q) => q + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {selectedPriceOption && selectedPriceOption.stock < 10 && (
                    <Badge variant="outline" className="text-destructive border-destructive">
                      Only {selectedPriceOption.stock} left!
                    </Badge>
                  )}
                </div>
              </div>

              {/* Delivery Estimate */}
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Truck className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Estimated Delivery by {deliveryDateStr}</p>
                      {hoursUntilCutoff > 0 && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Order within {hoursUntilCutoff} hours for faster processing
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button size="lg" className="flex-1 gap-2" onClick={handleAddToCart}>
                  <ShoppingBag className="h-5 w-5" />
                  Add to Cart
                </Button>
                <Button size="lg" variant="secondary" className="flex-1" onClick={handleBuyNow}>
                  Buy Now
                </Button>
              </div>

              {/* Short Description */}
              <p className="text-muted-foreground leading-relaxed">{product.shortDescription}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="capitalize">
                    {tag}
                  </Badge>
                ))}
                {product.isOrganic && (
                  <Badge variant="secondary" className="gap-1">
                    <Leaf className="h-3 w-3" />
                    Organic
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="description" className="mt-12">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="benefits"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Benefits
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Reviews ({reviews.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <div className="prose max-w-none">
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>

                <h4 className="mt-6 font-semibold">Ingredients</h4>
                <ul className="mt-2 space-y-1">
                  {product.ingredients.map((ingredient, i) => (
                    <li key={i} className="flex items-center gap-2 text-muted-foreground">
                      <Check className="h-4 w-4 text-primary" />
                      {ingredient}
                    </li>
                  ))}
                </ul>

                <h4 className="mt-6 font-semibold">Usage Tips</h4>
                <ul className="mt-2 space-y-1">
                  {product.usageTips.map((tip, i) => (
                    <li key={i} className="flex items-center gap-2 text-muted-foreground">
                      <Check className="h-4 w-4 text-primary" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="benefits" className="mt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {product.benefits.map((benefit, i) => (
                  <Card key={i}>
                    <CardContent className="flex items-start gap-3 p-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-sm">{benefit}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Reviews List */}
                <div className="lg:col-span-2 space-y-4">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{review.userName}</span>
                                {review.isVerified && (
                                  <Badge variant="secondary" className="text-xs">
                                    Verified Purchase
                                  </Badge>
                                )}
                              </div>
                              <div className="mt-1 flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      'h-3 w-3',
                                      i < review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'fill-muted text-muted'
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="mt-3 font-medium">{review.title}</h4>
                          <p className="mt-1 text-sm text-muted-foreground">{review.content}</p>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
                  )}
                </div>

                {/* Add Review Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Write a Review</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <Label>Rating</Label>
                        <div className="mt-2 flex gap-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => setNewReview((prev) => ({ ...prev, rating }))}
                              className="p-0.5"
                            >
                              <Star
                                className={cn(
                                  'h-6 w-6 transition-colors',
                                  rating <= newReview.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'fill-muted text-muted hover:text-yellow-400'
                                )}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="review-title">Title</Label>
                        <Input
                          id="review-title"
                          placeholder="Summarize your experience"
                          value={newReview.title}
                          onChange={(e) => setNewReview((prev) => ({ ...prev, title: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="review-content">Review</Label>
                        <Textarea
                          id="review-content"
                          placeholder="Share your thoughts about this product"
                          value={newReview.content}
                          onChange={(e) => setNewReview((prev) => ({ ...prev, content: e.target.value }))}
                          className="mt-1"
                          rows={4}
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Submit Review
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-16">
              <h2 className="font-serif text-2xl font-bold mb-6">You May Also Like</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
