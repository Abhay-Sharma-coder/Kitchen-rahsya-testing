'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Search,
  Star,
  Check,
  X,
  Eye,
  EyeOff,
  Sparkles,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Package,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useStore } from '@/lib/store-context';
import { type Review } from '@/lib/data';
import { cn } from '@/lib/utils';

const reviewStatuses = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800', icon: Check },
  { value: 'hidden', label: 'Hidden', color: 'bg-gray-100 text-gray-800', icon: EyeOff },
];

const sentiments = [
  { value: 'positive', label: 'Positive', color: 'text-green-600', icon: ThumbsUp },
  { value: 'neutral', label: 'Neutral', color: 'text-gray-600', icon: MessageSquare },
  { value: 'negative', label: 'Negative', color: 'text-red-600', icon: ThumbsDown },
];

export default function AdminReviewsPage() {
  const { state, dispatch, getProduct } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Filter reviews
  const filteredReviews = useMemo(() => {
    return state.reviews.filter((review) => {
      const product = getProduct(review.productId);
      const matchesSearch =
        review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product?.name.toLowerCase().includes(searchQuery.toLowerCase()) || false);
      const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
      const matchesRating = ratingFilter === 'all' || review.rating.toString() === ratingFilter;
      const matchesSentiment = sentimentFilter === 'all' || review.sentiment === sentimentFilter;

      return matchesSearch && matchesStatus && matchesRating && matchesSentiment;
    });
  }, [state.reviews, searchQuery, statusFilter, ratingFilter, sentimentFilter, getProduct]);

  const updateReviewStatus = (review: Review, status: Review['status']) => {
    dispatch({
      type: 'UPDATE_REVIEW',
      payload: { ...review, status },
    });
  };

  const toggleHighlight = (review: Review) => {
    dispatch({
      type: 'UPDATE_REVIEW',
      payload: { ...review, isHighlighted: !review.isHighlighted },
    });
  };

  const getStatusInfo = (status: string) => {
    return reviewStatuses.find((s) => s.value === status) || reviewStatuses[0];
  };

  const getSentimentInfo = (sentiment: string) => {
    return sentiments.find((s) => s.value === sentiment) || sentiments[1];
  };

  // Review stats
  const stats = useMemo(() => {
    const total = state.reviews.length;
    const pending = state.reviews.filter((r) => r.status === 'pending').length;
    const approved = state.reviews.filter((r) => r.status === 'approved').length;
    const hidden = state.reviews.filter((r) => r.status === 'hidden').length;
    const avgRating =
      state.reviews.length > 0
        ? (state.reviews.reduce((sum, r) => sum + r.rating, 0) / state.reviews.length).toFixed(1)
        : '0.0';
    const positive = state.reviews.filter((r) => r.sentiment === 'positive').length;
    const negative = state.reviews.filter((r) => r.sentiment === 'negative').length;

    return { total, pending, approved, hidden, avgRating, positive, negative };
  }, [state.reviews]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              'h-4 w-4',
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold">Reviews</h1>
        <p className="text-muted-foreground">Moderate and manage customer reviews</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Reviews</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-800">Pending</p>
            <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <p className="text-sm text-green-800">Approved</p>
            <p className="text-2xl font-bold text-green-800">{stats.approved}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Hidden</p>
            <p className="text-2xl font-bold text-gray-600">{stats.hidden}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Avg Rating</p>
            <p className="text-2xl font-bold flex items-center gap-1">
              {stats.avgRating}
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Positive</p>
            <p className="text-2xl font-bold text-green-600">{stats.positive}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {reviewStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <SelectItem key={rating} value={rating.toString()}>
                    {rating} Star{rating !== 1 ? 's' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger className="w-full md:w-36">
                <SelectValue placeholder="Sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sentiments</SelectItem>
                {sentiments.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pending Reviews Alert */}
      {stats.pending > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <p className="text-yellow-800">
              <strong>{stats.pending} review{stats.pending !== 1 ? 's' : ''}</strong> pending moderation
            </p>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={() => setStatusFilter('pending')}
            >
              View Pending
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Reviews Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Review</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Sentiment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No reviews found
                  </TableCell>
                </TableRow>
              ) : (
                filteredReviews.map((review) => {
                  const product = getProduct(review.productId);
                  const statusInfo = getStatusInfo(review.status);
                  const sentimentInfo = getSentimentInfo(review.sentiment);

                  return (
                    <TableRow key={review.id}>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{review.title}</p>
                            {review.isHighlighted && (
                              <Sparkles className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{review.userName}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {review.content}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="relative h-8 w-8 overflow-hidden rounded border bg-muted flex-shrink-0">
                            {product?.image ? (
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-contain"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Package className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <span className="text-sm truncate max-w-[100px]">
                            {product?.name || 'Unknown'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{renderStars(review.rating)}</TableCell>
                      <TableCell>
                        <div className={cn('flex items-center gap-1', sentimentInfo.color)}>
                          <sentimentInfo.icon className="h-4 w-4" />
                          <span className="text-sm">{sentimentInfo.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('gap-1', statusInfo.color)}>
                          <statusInfo.icon className="h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {new Date(review.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedReview(review);
                                setIsDetailOpen(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {review.status !== 'approved' && (
                              <DropdownMenuItem onClick={() => updateReviewStatus(review, 'approved')}>
                                <Check className="mr-2 h-4 w-4 text-green-600" />
                                Approve
                              </DropdownMenuItem>
                            )}
                            {review.status !== 'hidden' && (
                              <DropdownMenuItem onClick={() => updateReviewStatus(review, 'hidden')}>
                                <EyeOff className="mr-2 h-4 w-4 text-gray-600" />
                                Hide
                              </DropdownMenuItem>
                            )}
                            {review.status === 'hidden' && (
                              <DropdownMenuItem onClick={() => updateReviewStatus(review, 'pending')}>
                                <AlertCircle className="mr-2 h-4 w-4 text-yellow-600" />
                                Set Pending
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => toggleHighlight(review)}>
                              <Sparkles className={cn('mr-2 h-4 w-4', review.isHighlighted ? 'text-yellow-500' : '')} />
                              {review.isHighlighted ? 'Remove Highlight' : 'Highlight Review'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Review Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <DialogDescription>Full review information</DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-4">
              {/* Product */}
              {(() => {
                const product = getProduct(selectedReview.productId);
                return (
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded border bg-muted">
                      {product?.image ? (
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
                    <div>
                      <p className="font-medium">{product?.name || 'Unknown Product'}</p>
                      <p className="text-sm text-muted-foreground">{product?.category}</p>
                    </div>
                  </div>
                );
              })()}

              {/* Review Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {renderStars(selectedReview.rating)}
                    <span className="font-medium">({selectedReview.rating}/5)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedReview.isVerified && (
                      <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
                        <Check className="h-3 w-3" />
                        Verified Purchase
                      </Badge>
                    )}
                    {selectedReview.isHighlighted && (
                      <Badge className="gap-1 bg-yellow-100 text-yellow-800">
                        <Sparkles className="h-3 w-3" />
                        Highlighted
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg">{selectedReview.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    by {selectedReview.userName} on{' '}
                    {new Date(selectedReview.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <p className="text-sm leading-relaxed">{selectedReview.content}</p>

                <div className="flex gap-4 pt-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <Badge className={cn('mt-1', getStatusInfo(selectedReview.status).color)}>
                      {getStatusInfo(selectedReview.status).label}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Sentiment</Label>
                    <div className={cn('mt-1 flex items-center gap-1', getSentimentInfo(selectedReview.sentiment).color)}>
                      {(() => {
                        const SentimentIcon = getSentimentInfo(selectedReview.sentiment).icon;
                        return <SentimentIcon className="h-4 w-4" />;
                      })()}
                      <span className="text-sm font-medium">
                        {getSentimentInfo(selectedReview.sentiment).label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Quick Actions */}
              <div className="space-y-2">
                <Label>Quick Actions</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedReview.status !== 'approved' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        updateReviewStatus(selectedReview, 'approved');
                        setSelectedReview({ ...selectedReview, status: 'approved' });
                      }}
                      className="gap-1"
                    >
                      <Check className="h-4 w-4 text-green-600" />
                      Approve
                    </Button>
                  )}
                  {selectedReview.status !== 'hidden' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        updateReviewStatus(selectedReview, 'hidden');
                        setSelectedReview({ ...selectedReview, status: 'hidden' });
                      }}
                      className="gap-1"
                    >
                      <EyeOff className="h-4 w-4 text-gray-600" />
                      Hide
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toggleHighlight(selectedReview);
                      setSelectedReview({ ...selectedReview, isHighlighted: !selectedReview.isHighlighted });
                    }}
                    className="gap-1"
                  >
                    <Sparkles className={cn('h-4 w-4', selectedReview.isHighlighted ? 'text-yellow-500' : '')} />
                    {selectedReview.isHighlighted ? 'Remove Highlight' : 'Highlight'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
