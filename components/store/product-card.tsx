'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useStore } from '@/lib/store-context';
import { type Product, formatPrice } from '@/lib/data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { state, dispatch, addToCart } = useStore();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState(product.priceOptions[0].weight);

  const selectedPrice = product.priceOptions.find((opt) => opt.weight === selectedWeight);
  const isInWishlist = state.wishlist.includes(product.id);
  const discount = selectedPrice
    ? Math.round(((selectedPrice.mrp - selectedPrice.price) / selectedPrice.mrp) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, selectedWeight, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch({ type: 'TOGGLE_WISHLIST', payload: product.id });
    toast.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-300 hover:shadow-lg',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.slug}`}>
        {/* Badges */}
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1">
          {product.isBestSeller && (
            <Badge className="bg-primary text-primary-foreground">Best Seller</Badge>
          )}
          {product.isTrending && (
            <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
              Trending
            </Badge>
          )}
          {discount > 0 && (
            <Badge variant="destructive">{discount}% OFF</Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'absolute right-3 top-3 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur transition-all',
            isInWishlist ? 'text-primary' : 'text-muted-foreground'
          )}
          onClick={handleToggleWishlist}
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={cn('h-4 w-4', isInWishlist && 'fill-current')} />
        </Button>

        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted/50">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />

          {/* Quick View Overlay */}
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm transition-opacity duration-300',
              isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
          >
            <Button variant="secondary" size="sm" className="gap-2">
              <Eye className="h-4 w-4" />
              Quick View
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Category */}
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {product.category}
          </p>

          {/* Name */}
          <h3 className="mt-1 font-semibold text-foreground line-clamp-1">{product.name}</h3>
          <p className="text-sm text-muted-foreground">{product.nameHindi}</p>

          {/* Rating */}
          <div className="mt-2 flex items-center gap-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-3 w-3',
                    i < Math.floor(product.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-muted text-muted'
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
          </div>

          {/* Weight Options */}
          <div className="mt-3 flex flex-wrap gap-1">
            {product.priceOptions.map((opt) => (
              <button
                key={opt.weight}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedWeight(opt.weight);
                }}
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-medium transition-colors',
                  selectedWeight === opt.weight
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {opt.weight}
              </button>
            ))}
          </div>

          {/* Price & Add to Cart */}
          <div className="mt-3 flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-primary">
                {selectedPrice && formatPrice(selectedPrice.price)}
              </span>
              {selectedPrice && selectedPrice.mrp > selectedPrice.price && (
                <span className="ml-1 text-sm text-muted-foreground line-through">
                  {formatPrice(selectedPrice.mrp)}
                </span>
              )}
            </div>
            <Button
              size="sm"
              onClick={handleAddToCart}
              className="h-8 gap-1"
            >
              <ShoppingBag className="h-3 w-3" />
              Add
            </Button>
          </div>

          {/* Stock Warning */}
          {selectedPrice && selectedPrice.stock < 10 && (
            <p className="mt-2 text-xs text-destructive font-medium">
              Only {selectedPrice.stock} left in stock!
            </p>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}
