'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  ArrowRight,
  AlertTriangle,
  Star,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useStore } from '@/lib/store-context';
import { formatPrice } from '@/lib/data';
import { cn } from '@/lib/utils';

export default function AdminDashboardPage() {
  const { state, getProduct } = useStore();

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalRevenue = state.orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = state.orders.length;
    const pendingOrders = state.orders.filter((o) => o.orderStatus === 'pending').length;
    const deliveredOrders = state.orders.filter((o) => o.orderStatus === 'delivered').length;
    const totalProducts = state.products.length;
    const lowStockProducts = state.products.filter((p) =>
      p.priceOptions.some((opt) => opt.stock < 20)
    ).length;
    const totalReviews = state.reviews.length;
    const pendingReviews = state.reviews.filter((r) => r.status === 'pending').length;
    const avgRating =
      state.reviews.length > 0
        ? state.reviews.reduce((sum, r) => sum + r.rating, 0) / state.reviews.length
        : 0;

    // Best selling products (by orders)
    const productSales: Record<string, number> = {};
    state.orders.forEach((order) => {
      order.items.forEach((item) => {
        productSales[item.productId] = (productSales[item.productId] || 0) + item.quantity;
      });
    });

    const bestSellers = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([productId, sales]) => ({
        product: getProduct(productId),
        sales,
      }));

    // Recent orders
    const recentOrders = state.orders.slice(0, 5);

    return {
      totalRevenue,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      totalProducts,
      lowStockProducts,
      totalReviews,
      pendingReviews,
      avgRating,
      bestSellers,
      recentOrders,
    };
  }, [state.orders, state.products, state.reviews, getProduct]);

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatPrice(metrics.totalRevenue),
      description: 'All-time earnings',
      icon: DollarSign,
      trend: '+12%',
      trendUp: true,
      color: 'text-green-600 bg-green-100',
    },
    {
      title: 'Total Orders',
      value: metrics.totalOrders.toString(),
      description: `${metrics.pendingOrders} pending`,
      icon: ShoppingCart,
      trend: '+8%',
      trendUp: true,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      title: 'Products',
      value: metrics.totalProducts.toString(),
      description: `${metrics.lowStockProducts} low stock`,
      icon: Package,
      trend: metrics.lowStockProducts > 0 ? 'Alert' : 'Good',
      trendUp: metrics.lowStockProducts === 0,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      title: 'Avg Rating',
      value: metrics.avgRating.toFixed(1),
      description: `${metrics.totalReviews} reviews`,
      icon: Star,
      trend: '+0.2',
      trendUp: true,
      color: 'text-yellow-600 bg-yellow-100',
    },
  ];

  const orderStatusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    packed: 'bg-indigo-100 text-indigo-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to Kitchen Rahasya Admin Panel</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={cn('rounded-lg p-2', stat.color)}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <Badge variant={stat.trendUp ? 'default' : 'destructive'} className="gap-1">
                  {stat.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {stat.trend}
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      {(metrics.lowStockProducts > 0 || metrics.pendingOrders > 0 || metrics.pendingReviews > 0) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Alerts & Actions Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {metrics.lowStockProducts > 0 && (
                <Link href="/admin/products">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Package className="h-4 w-4" />
                    {metrics.lowStockProducts} products low on stock
                  </Button>
                </Link>
              )}
              {metrics.pendingOrders > 0 && (
                <Link href="/admin/orders">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Clock className="h-4 w-4" />
                    {metrics.pendingOrders} orders pending
                  </Button>
                </Link>
              )}
              {metrics.pendingReviews > 0 && (
                <Link href="/admin/reviews">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Star className="h-4 w-4" />
                    {metrics.pendingReviews} reviews to moderate
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest customer orders</CardDescription>
            </div>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm" className="gap-1">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {metrics.recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {metrics.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">#{order.orderId}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{formatPrice(order.total)}</p>
                      <Badge className={cn('text-xs', orderStatusColors[order.orderStatus])}>
                        {order.orderStatus}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Best Selling Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Best Selling Products</CardTitle>
              <CardDescription>Top performing items</CardDescription>
            </div>
            <Link href="/admin/products">
              <Button variant="ghost" size="sm" className="gap-1">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {metrics.bestSellers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No sales data yet</p>
            ) : (
              <div className="space-y-4">
                {metrics.bestSellers.map(({ product, sales }, index) => (
                  product && (
                    <div key={product.id} className="flex items-center gap-4">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{sales} units sold</p>
                      </div>
                      <div className="w-24">
                        <Progress value={(sales / (metrics.bestSellers[0]?.sales || 1)) * 100} />
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status Distribution</CardTitle>
          <CardDescription>Overview of order fulfillment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            {['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'].map((status) => {
              const count = state.orders.filter((o) => o.orderStatus === status).length;
              const percentage = metrics.totalOrders > 0 ? (count / metrics.totalOrders) * 100 : 0;

              return (
                <div key={status} className="text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <span className="text-lg font-bold">{count}</span>
                  </div>
                  <p className="text-xs font-medium capitalize">{status.replace('_', ' ')}</p>
                  <p className="text-xs text-muted-foreground">{percentage.toFixed(0)}%</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/products">
              <Button variant="outline" className="gap-2">
                <Package className="h-4 w-4" />
                Add New Product
              </Button>
            </Link>
            <Link href="/admin/orders">
              <Button variant="outline" className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                Process Orders
              </Button>
            </Link>
            <Link href="/admin/reviews">
              <Button variant="outline" className="gap-2">
                <Star className="h-4 w-4" />
                Moderate Reviews
              </Button>
            </Link>
            <Link href="/" target="_blank">
              <Button variant="outline" className="gap-2">
                View Store
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
