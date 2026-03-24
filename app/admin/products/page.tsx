'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  X,
  Save,
  ImageIcon,
  RefreshCw,
  Upload,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useStore } from '@/lib/store-context';
import { formatPrice, type Product, type PriceOption } from '@/lib/data';
import { cn } from '@/lib/utils';

const categories = ['Spices', 'Masalas', 'Blends', 'Dry Fruits', 'Others'];

const emptyPriceOption: PriceOption = {
  weight: '',
  weightInGrams: 0,
  price: 0,
  mrp: 0,
  stock: 0,
};

const emptyProduct: Omit<Product, 'id' | 'createdAt'> = {
  name: '',
  nameHindi: '',
  slug: '',
  description: '',
  shortDescription: '',
  image: '',
  category: 'Spices',
  tags: [],
  priceOptions: [{ ...emptyPriceOption }],
  isBestSeller: false,
  isTrending: false,
  isOrganic: false,
  rating: 0,
  reviewCount: 0,
  benefits: [''],
  ingredients: [''],
  usageTips: [''],
};

export default function AdminProductsPage() {
  const { state, dispatch } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'createdAt'>>(emptyProduct);
  const [tagInput, setTagInput] = useState('');
  const [galleryItems, setGalleryItems] = useState<Array<{ _id: string; url: string; mediaType: 'image' | 'video'; title?: string }>>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchMediaItems = async () => {
    setLoadingMedia(true);
    try {
      const response = await fetch('/api/gallery');
      const data = (await response.json()) as {
        gallery?: Array<{ _id: string; url: string; mediaType: 'image' | 'video'; title?: string }>;
      };
      const imagesOnly = (data.gallery || []).filter((item) => item.mediaType === 'image');
      setGalleryItems(imagesOnly);
    } finally {
      setLoadingMedia(false);
    }
  };

  useEffect(() => {
    if (isDialogOpen) {
      void fetchMediaItems();
    }
  }, [isDialogOpen]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return state.products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.nameHindi.includes(searchQuery);
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const hasLowStock = product.priceOptions.some((opt) => opt.stock < 20);
      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'low' && hasLowStock) ||
        (stockFilter === 'ok' && !hasLowStock);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [state.products, searchQuery, categoryFilter, stockFilter]);

  const openAddDialog = () => {
    setEditingProduct(null);
    setFormData({ ...emptyProduct, priceOptions: [{ ...emptyPriceOption }], benefits: [''], ingredients: [''], usageTips: [''] });
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      nameHindi: product.nameHindi,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      image: product.image,
      category: product.category,
      tags: [...product.tags],
      priceOptions: product.priceOptions.map((opt) => ({ ...opt })),
      isBestSeller: product.isBestSeller,
      isTrending: product.isTrending,
      isOrganic: product.isOrganic,
      rating: product.rating,
      reviewCount: product.reviewCount,
      benefits: [...product.benefits],
      ingredients: [...product.ingredients],
      usageTips: [...product.usageTips],
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    // Validate
    if (!formData.name || !formData.slug || formData.priceOptions.length === 0) {
      alert('Please fill in required fields (Name, Slug, at least one price option)');
      return;
    }

    // Filter out empty values
    const cleanedFormData = {
      ...formData,
      benefits: formData.benefits.filter((b) => b.trim()),
      ingredients: formData.ingredients.filter((i) => i.trim()),
      usageTips: formData.usageTips.filter((t) => t.trim()),
      priceOptions: formData.priceOptions.filter((opt) => opt.weight && opt.weightInGrams > 0),
    };

    const token = localStorage.getItem('kr_token');
    if (!token) {
      alert('Admin auth token not found. Please login again.');
      return;
    }

    if (editingProduct) {
      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...editingProduct,
          ...cleanedFormData,
        }),
      });

      const data = (await response.json()) as { product?: Product; error?: string };
      if (!response.ok || !data.product) {
        alert(data.error || 'Failed to update product');
        return;
      }
      dispatch({ type: 'UPDATE_PRODUCT', payload: data.product });
    } else {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: `prod_${Date.now()}`,
          ...cleanedFormData,
        }),
      });

      const data = (await response.json()) as { product?: Product; error?: string };
      if (!response.ok || !data.product) {
        alert(data.error || 'Failed to create product');
        return;
      }
      dispatch({ type: 'ADD_PRODUCT', payload: data.product });
    }

    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (productToDelete) {
      const token = localStorage.getItem('kr_token');
      if (!token) {
        alert('Admin auth token not found. Please login again.');
        return;
      }

      const response = await fetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        alert(data.error || 'Failed to delete product');
        return;
      }

      dispatch({ type: 'DELETE_PRODUCT', payload: productToDelete.id });
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleProductImageUpload = async (file: File | null) => {
    if (!file) return;

    const token = localStorage.getItem('kr_token');
    if (!token) {
      alert('Admin auth token not found. Please login again.');
      return;
    }

    setUploadingImage(true);
    try {
      const payload = new FormData();
      payload.append('file', file);
      payload.append('mediaType', 'image');
      payload.append('title', file.name);
      payload.append('sortOrder', '0');

      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      const data = (await response.json()) as { item?: { url: string }; error?: string };
      if (!response.ok || !data.item) {
        alert(data.error || 'Image upload failed');
        return;
      }

      setFormData((prev) => ({ ...prev, image: data.item!.url }));
      await fetchMediaItems();
    } finally {
      setUploadingImage(false);
    }
  };

  const addPriceOption = () => {
    setFormData({
      ...formData,
      priceOptions: [...formData.priceOptions, { ...emptyPriceOption }],
    });
  };

  const updatePriceOption = (index: number, field: keyof PriceOption, value: string | number) => {
    const newOptions = [...formData.priceOptions];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData({ ...formData, priceOptions: newOptions });
  };

  const removePriceOption = (index: number) => {
    if (formData.priceOptions.length > 1) {
      setFormData({
        ...formData,
        priceOptions: formData.priceOptions.filter((_, i) => i !== index),
      });
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const updateArrayField = (field: 'benefits' | 'ingredients' | 'usageTips', index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayField = (field: 'benefits' | 'ingredients' | 'usageTips') => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeArrayField = (field: 'benefits' | 'ingredients' | 'usageTips', index: number) => {
    if (formData[field].length > 1) {
      setFormData({ ...formData, [field]: formData[field].filter((_, i) => i !== index) });
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button onClick={openAddDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="ok">In Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price Range</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => {
                  const minPrice = Math.min(...product.priceOptions.map((o) => o.price));
                  const maxPrice = Math.max(...product.priceOptions.map((o) => o.price));
                  const totalStock = product.priceOptions.reduce((sum, o) => sum + o.stock, 0);
                  const hasLowStock = product.priceOptions.some((o) => o.stock < 20);

                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg border bg-muted">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-contain"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.nameHindi}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>
                        {minPrice === maxPrice
                          ? formatPrice(minPrice)
                          : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{totalStock} units</span>
                          {hasLowStock && (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {product.isBestSeller && (
                            <Badge className="bg-green-100 text-green-800 text-xs">Bestseller</Badge>
                          )}
                          {product.isTrending && (
                            <Badge className="bg-blue-100 text-blue-800 text-xs">Trending</Badge>
                          )}
                          {product.isOrganic && (
                            <Badge className="bg-emerald-100 text-emerald-800 text-xs">Organic</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setProductToDelete(product);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update product details' : 'Fill in the details for the new product'}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(90vh-180px)] px-6">
            <div className="space-y-6 pb-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold">Basic Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          name: e.target.value,
                          slug: generateSlug(e.target.value),
                        });
                      }}
                      placeholder="e.g., Turmeric Powder"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nameHindi">Hindi Name</Label>
                    <Input
                      id="nameHindi"
                      value={formData.nameHindi}
                      onChange={(e) => setFormData({ ...formData, nameHindi: e.target.value })}
                      placeholder="e.g., हल्दी पाउडर"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="e.g., turmeric-powder"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Input
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    placeholder="Brief product tagline"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed product description"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://..."
                      className="flex-1"
                    />
                    {formData.image && (
                      <div className="relative h-10 w-10 overflow-hidden rounded border">
                        <Image
                          src={formData.image}
                          alt="Preview"
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => void fetchMediaItems()}
                      disabled={loadingMedia}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Refresh Media
                    </Button>
                    <Label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
                      <Upload className="h-3.5 w-3.5" />
                      {uploadingImage ? 'Uploading...' : 'Upload Image'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingImage}
                        onChange={(e) => void handleProductImageUpload(e.target.files?.[0] || null)}
                      />
                    </Label>
                  </div>
                  <div className="space-y-2">
                    <Label>Pick from Media Library</Label>
                    <Select
                      value={formData.image || '__none__'}
                      onValueChange={(value) => setFormData({ ...formData, image: value === '__none__' ? '' : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select media image" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">None</SelectItem>
                        {galleryItems.map((item) => (
                          <SelectItem key={item._id} value={item.url}>
                            {item.title ? `${item.title} (${item.url})` : item.url}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Price Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Price Options *</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addPriceOption}>
                    <Plus className="mr-1 h-3 w-3" />
                    Add Option
                  </Button>
                </div>

                {formData.priceOptions.map((option, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid gap-3 sm:grid-cols-5">
                      <div className="space-y-1">
                        <Label className="text-xs">Weight Label</Label>
                        <Input
                          value={option.weight}
                          onChange={(e) => updatePriceOption(index, 'weight', e.target.value)}
                          placeholder="e.g., 100g"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Weight (grams)</Label>
                        <Input
                          type="number"
                          value={option.weightInGrams || ''}
                          onChange={(e) => updatePriceOption(index, 'weightInGrams', parseInt(e.target.value) || 0)}
                          placeholder="100"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Price (₹)</Label>
                        <Input
                          type="number"
                          value={option.price || ''}
                          onChange={(e) => updatePriceOption(index, 'price', parseInt(e.target.value) || 0)}
                          placeholder="45"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">MRP (₹)</Label>
                        <Input
                          type="number"
                          value={option.mrp || ''}
                          onChange={(e) => updatePriceOption(index, 'mrp', parseInt(e.target.value) || 0)}
                          placeholder="55"
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs">Stock</Label>
                          <Input
                            type="number"
                            value={option.stock || ''}
                            onChange={(e) => updatePriceOption(index, 'stock', parseInt(e.target.value) || 0)}
                            placeholder="100"
                          />
                        </div>
                        {formData.priceOptions.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removePriceOption(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Separator />

              {/* Tags */}
              <div className="space-y-4">
                <h3 className="font-semibold">Tags</h3>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Status Flags */}
              <div className="space-y-4">
                <h3 className="font-semibold">Status</h3>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.isBestSeller}
                      onCheckedChange={(checked) => setFormData({ ...formData, isBestSeller: checked })}
                    />
                    <Label>Best Seller</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.isTrending}
                      onCheckedChange={(checked) => setFormData({ ...formData, isTrending: checked })}
                    />
                    <Label>Trending</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.isOrganic}
                      onCheckedChange={(checked) => setFormData({ ...formData, isOrganic: checked })}
                    />
                    <Label>Organic</Label>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Benefits */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Benefits</h3>
                  <Button type="button" variant="outline" size="sm" onClick={() => addArrayField('benefits')}>
                    <Plus className="mr-1 h-3 w-3" />
                    Add
                  </Button>
                </div>
                {formData.benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={benefit}
                      onChange={(e) => updateArrayField('benefits', index, e.target.value)}
                      placeholder="Enter a benefit"
                    />
                    {formData.benefits.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeArrayField('benefits', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Separator />

              {/* Ingredients */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Ingredients</h3>
                  <Button type="button" variant="outline" size="sm" onClick={() => addArrayField('ingredients')}>
                    <Plus className="mr-1 h-3 w-3" />
                    Add
                  </Button>
                </div>
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={ingredient}
                      onChange={(e) => updateArrayField('ingredients', index, e.target.value)}
                      placeholder="Enter an ingredient"
                    />
                    {formData.ingredients.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeArrayField('ingredients', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Separator />

              {/* Usage Tips */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Usage Tips</h3>
                  <Button type="button" variant="outline" size="sm" onClick={() => addArrayField('usageTips')}>
                    <Plus className="mr-1 h-3 w-3" />
                    Add
                  </Button>
                </div>
                {formData.usageTips.map((tip, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={tip}
                      onChange={(e) => updateArrayField('usageTips', index, e.target.value)}
                      placeholder="Enter a usage tip"
                    />
                    {formData.usageTips.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeArrayField('usageTips', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="border-t px-6 py-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              {editingProduct ? 'Update Product' : 'Add Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{productToDelete?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
