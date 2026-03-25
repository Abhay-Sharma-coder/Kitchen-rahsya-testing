'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock3, EyeOff, Plus, Star, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useStore } from '@/lib/store-context';
import { type Review } from '@/lib/data';

function normalizeReview(input: Record<string, unknown>): Review {
  return {
    id: String(input.id ?? input._id ?? ''),
    productId: String(input.productId ?? ''),
    userId: String(input.userId ?? ''),
    userName: String(input.userName ?? 'Anonymous'),
    rating: Number(input.rating ?? 5),
    title: String(input.title ?? ''),
    content: String(input.content ?? ''),
    isVerified: Boolean(input.isVerified),
    isHighlighted: Boolean(input.isHighlighted),
    sentiment: (['positive', 'neutral', 'negative'].includes(String(input.sentiment))
      ? String(input.sentiment)
      : 'neutral') as Review['sentiment'],
    status: (['approved', 'pending', 'hidden'].includes(String(input.status))
      ? String(input.status)
      : 'pending') as Review['status'],
    createdAt: String(input.createdAt ?? new Date().toISOString()),
  };
}

export default function AdminReviewsPage() {
  const { state, dispatch, getProduct } = useStore();
  const [reviews, setReviews] = useState<Review[]>(state.reviews);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'hidden'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFakeDialogOpen, setIsFakeDialogOpen] = useState(false);
  const [fakeReview, setFakeReview] = useState({
    productId: state.products[0]?.id || '',
    userName: 'Rohit Sharma',
    rating: 5,
    title: 'Amazing quality',
    content: 'Great product, fast delivery and authentic taste.',
  });

  const fetchReviews = async (filter: 'all' | 'pending' | 'approved' | 'hidden') => {
    const token = localStorage.getItem('kr_token');
    if (!token) {
      setReviews(state.reviews);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('admin', '1');
      if (filter !== 'all') {
        params.set('status', filter);
      }

      const response = await fetch(`/api/reviews?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = (await response.json()) as { reviews?: Array<Record<string, unknown>> };
      if (!response.ok || !Array.isArray(data.reviews)) {
        setReviews(state.reviews);
        return;
      }

      const normalized = data.reviews.map(normalizeReview);
      setReviews(normalized);
      dispatch({ type: 'SET_REVIEWS', payload: normalized });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchReviews(statusFilter);
  }, [statusFilter]);

  const filteredReviews = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return reviews.filter((review) => {
      const matchesSearch =
        query.length === 0 ||
        review.title.toLowerCase().includes(query) ||
        review.content.toLowerCase().includes(query) ||
        review.userName.toLowerCase().includes(query);

      return matchesSearch;
    });
  }, [reviews, searchQuery]);

  const updateReview = async (reviewId: string, updates: Partial<Pick<Review, 'status' | 'isHighlighted' | 'isVerified'>>) => {
    const token = localStorage.getItem('kr_token');
    if (!token) {
      alert('Admin auth token not found. Please login again.');
      return;
    }

    const response = await fetch('/api/reviews', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id: reviewId, ...updates }),
    });

    const data = (await response.json()) as { review?: Record<string, unknown>; error?: string };
    if (!response.ok || !data.review) {
      alert(data.error || 'Failed to update review');
      return;
    }

    const normalized = normalizeReview(data.review);
    setReviews((prev) => prev.map((item) => (item.id === normalized.id ? normalized : item)));
    dispatch({ type: 'UPDATE_REVIEW', payload: normalized });
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Delete this review permanently?')) {
      return;
    }

    const token = localStorage.getItem('kr_token');
    if (!token) {
      alert('Admin auth token not found. Please login again.');
      return;
    }

    const response = await fetch(`/api/reviews?id=${encodeURIComponent(reviewId)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      alert(data.error || 'Failed to delete review');
      return;
    }

    setReviews((prev) => prev.filter((item) => item.id !== reviewId));
    dispatch({ type: 'SET_REVIEWS', payload: state.reviews.filter((item) => item.id !== reviewId) });
  };

  const addFakeReview = async () => {
    if (!fakeReview.productId || !fakeReview.userName || !fakeReview.title || !fakeReview.content) {
      alert('Please fill all fields.');
      return;
    }

    const token = localStorage.getItem('kr_token');
    if (!token) {
      alert('Admin auth token not found. Please login again.');
      return;
    }

    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(fakeReview),
    });

    const data = (await response.json()) as { review?: Record<string, unknown>; error?: string };
    if (!response.ok || !data.review) {
      alert(data.error || 'Failed to add fake review');
      return;
    }

    const normalized = normalizeReview(data.review);
    setReviews((prev) => [normalized, ...prev]);
    dispatch({ type: 'ADD_REVIEW', payload: normalized });
    setIsFakeDialogOpen(false);
    setFakeReview((prev) => ({ ...prev, title: '', content: '' }));
  };

  const pendingCount = reviews.filter((r) => r.status === 'pending').length;
  const approvedCount = reviews.filter((r) => r.status === 'approved').length;
  const hiddenCount = reviews.filter((r) => r.status === 'hidden').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reviews</h1>
          <p className="text-muted-foreground">Manage customer feedback and add demo reviews.</p>
        </div>
        <Button onClick={() => setIsFakeDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Fake Review
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{pendingCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{approvedCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hidden</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{hiddenCount}</CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 grid gap-3 md:grid-cols-[1fr_220px]">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by user, title, content..."
            />
            <Select
              value={statusFilter}
              onValueChange={(value: 'all' | 'pending' | 'approved' | 'hidden') => setStatusFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Review</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      {loading ? 'Loading reviews...' : 'No reviews found.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell className="max-w-[180px] truncate">{getProduct(review.productId)?.name || review.productId}</TableCell>
                      <TableCell>
                        <div className="font-medium">{review.userName}</div>
                        <div className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star
                              key={idx}
                              className={`h-3.5 w-3.5 ${idx < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[360px]">
                          <div className="font-medium truncate">{review.title}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2">{review.content}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          <Badge
                            variant={
                              review.status === 'approved'
                                ? 'default'
                                : review.status === 'pending'
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {review.status}
                          </Badge>
                          <div className="flex gap-1">
                            {review.isVerified && <Badge variant="outline">Verified</Badge>}
                            {review.isHighlighted && <Badge variant="outline">Highlighted</Badge>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => void updateReview(review.id, { status: 'approved' })}>
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => void updateReview(review.id, { status: 'pending' })}>
                            <Clock3 className="mr-1 h-3.5 w-3.5" />Pending
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => void updateReview(review.id, { status: 'hidden' })}>
                            <EyeOff className="mr-1 h-3.5 w-3.5" />Hide
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void updateReview(review.id, { isHighlighted: !review.isHighlighted })}
                          >
                            {review.isHighlighted ? 'Unhighlight' : 'Highlight'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void updateReview(review.id, { isVerified: !review.isVerified })}
                          >
                            {review.isVerified ? 'Unverify' : 'Verify'}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => void deleteReview(review.id)}>
                            <Trash2 className="mr-1 h-3.5 w-3.5" />Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isFakeDialogOpen} onOpenChange={setIsFakeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Fake Review</DialogTitle>
            <DialogDescription>Create a demo review using any identity for testing.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Product</Label>
              <Select
                value={fakeReview.productId}
                onValueChange={(value) => setFakeReview((prev) => ({ ...prev, productId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {state.products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fake User Name</Label>
              <Input
                value={fakeReview.userName}
                onChange={(e) => setFakeReview((prev) => ({ ...prev, userName: e.target.value }))}
                placeholder="e.g. Aman Verma"
              />
            </div>

            <div className="space-y-2">
              <Label>Rating</Label>
              <Select
                value={String(fakeReview.rating)}
                onValueChange={(value) => setFakeReview((prev) => ({ ...prev, rating: Number(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={fakeReview.title}
                onChange={(e) => setFakeReview((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Short review title"
              />
            </div>

            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={fakeReview.content}
                onChange={(e) => setFakeReview((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Review description"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFakeDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => void addFakeReview()}>Add Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
