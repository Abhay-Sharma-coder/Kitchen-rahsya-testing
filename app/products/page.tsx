'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, Grid3X3, LayoutGrid, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Header } from '@/components/store/header';
import { Footer } from '@/components/store/footer';
import { ProductCard } from '@/components/store/product-card';
import { useStore } from '@/lib/store-context';
import { cn } from '@/lib/utils';

type SortOption = 'popular' | 'price-low' | 'price-high' | 'newest' | 'rating';

export default function ProductsPage() {
  const { state } = useStore();
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showOnlyOrganic, setShowOnlyOrganic] = useState(false);
  const [gridCols, setGridCols] = useState<2 | 3>(3);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    state.products.forEach((p) => p.tags.forEach((t) => tags.add(t)));
    return Array.from(tags);
  }, [state.products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let products = [...state.products];

    // Apply URL filter param
    if (filterParam === 'bestseller') {
      products = products.filter((p) => p.isBestSeller);
    } else if (filterParam === 'trending') {
      products = products.filter((p) => p.isTrending);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.nameHindi.includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    // Price filter
    products = products.filter((p) => {
      const minPrice = Math.min(...p.priceOptions.map((opt) => opt.price));
      return minPrice >= priceRange[0] && minPrice <= priceRange[1];
    });

    // Tag filter
    if (selectedTags.length > 0) {
      products = products.filter((p) => selectedTags.some((t) => p.tags.includes(t)));
    }

    // Organic filter
    if (showOnlyOrganic) {
      products = products.filter((p) => p.isOrganic);
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        products.sort((a, b) => {
          const aMin = Math.min(...a.priceOptions.map((opt) => opt.price));
          const bMin = Math.min(...b.priceOptions.map((opt) => opt.price));
          return aMin - bMin;
        });
        break;
      case 'price-high':
        products.sort((a, b) => {
          const aMax = Math.max(...a.priceOptions.map((opt) => opt.price));
          const bMax = Math.max(...b.priceOptions.map((opt) => opt.price));
          return bMax - aMax;
        });
        break;
      case 'newest':
        products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'rating':
        products.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // Popular - sort by review count
        products.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    return products;
  }, [state.products, searchQuery, sortBy, priceRange, selectedTags, showOnlyOrganic, filterParam]);

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 500 ? 1 : 0) +
    selectedTags.length +
    (showOnlyOrganic ? 1 : 0);

  const clearAllFilters = () => {
    setSearchQuery('');
    setPriceRange([0, 500]);
    setSelectedTags([]);
    setShowOnlyOrganic(false);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <Label className="text-sm font-medium">Search</Label>
        <Input
          placeholder="Search spices..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mt-2"
        />
      </div>

      {/* Price Range */}
      <div>
        <Label className="text-sm font-medium">Price Range</Label>
        <div className="mt-4 px-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            min={0}
            max={500}
            step={10}
          />
          <div className="mt-2 flex justify-between text-sm text-muted-foreground">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div>
        <Label className="text-sm font-medium">Categories</Label>
        <div className="mt-3 space-y-2">
          {allTags.map((tag) => (
            <div key={tag} className="flex items-center gap-2">
              <Checkbox
                id={`tag-${tag}`}
                checked={selectedTags.includes(tag)}
                onCheckedChange={(checked) => {
                  setSelectedTags((prev) =>
                    checked ? [...prev, tag] : prev.filter((t) => t !== tag)
                  );
                }}
              />
              <Label htmlFor={`tag-${tag}`} className="text-sm font-normal capitalize cursor-pointer">
                {tag}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Organic Filter */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="organic"
          checked={showOnlyOrganic}
          onCheckedChange={(checked) => setShowOnlyOrganic(checked === true)}
        />
        <Label htmlFor="organic" className="text-sm font-normal cursor-pointer">
          Show only organic products
        </Label>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button variant="outline" className="w-full" onClick={clearAllFilters}>
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <div className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-8">
            <h1 className="font-serif text-3xl font-bold md:text-4xl">Our Spices</h1>
            <p className="mt-2 text-muted-foreground">
              {filterParam === 'bestseller' && 'Our most loved products'}
              {filterParam === 'trending' && 'Trending right now'}
              {!filterParam && 'Explore our complete collection of premium spices'}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* Desktop Sidebar Filters */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24">
                <h2 className="font-semibold mb-4">Filters</h2>
                <FilterContent />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  {/* Mobile Filter Button */}
                  <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden gap-2">
                        <SlidersHorizontal className="h-4 w-4" />
                        Filters
                        {activeFiltersCount > 0 && (
                          <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center">
                            {activeFiltersCount}
                          </Badge>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px]">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <FilterContent />
                      </div>
                    </SheetContent>
                  </Sheet>

                  <span className="text-sm text-muted-foreground">
                    {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Sort */}
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Grid Toggle */}
                  <div className="hidden sm:flex border rounded-md">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn('rounded-r-none', gridCols === 2 && 'bg-muted')}
                      onClick={() => setGridCols(2)}
                      aria-label="2 columns"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn('rounded-l-none', gridCols === 3 && 'bg-muted')}
                      onClick={() => setGridCols(3)}
                      aria-label="3 columns"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {searchQuery && (
                    <Badge variant="secondary" className="gap-1">
                      Search: {searchQuery}
                      <button onClick={() => setSearchQuery('')} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {(priceRange[0] > 0 || priceRange[1] < 500) && (
                    <Badge variant="secondary" className="gap-1">
                      ₹{priceRange[0]} - ₹{priceRange[1]}
                      <button onClick={() => setPriceRange([0, 500])} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1 capitalize">
                      {tag}
                      <button onClick={() => setSelectedTags((prev) => prev.filter((t) => t !== tag))} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {showOnlyOrganic && (
                    <Badge variant="secondary" className="gap-1">
                      Organic
                      <button onClick={() => setShowOnlyOrganic(false)} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}

              {/* Products Grid */}
              {filteredProducts.length > 0 ? (
                <div
                  className={cn(
                    'grid gap-6',
                    gridCols === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  )}
                >
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="rounded-full bg-muted p-6 mb-4">
                    <SlidersHorizontal className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">No products found</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                    Try adjusting your filters or search query to find what you are looking for.
                  </p>
                  <Button variant="outline" className="mt-4" onClick={clearAllFilters}>
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
