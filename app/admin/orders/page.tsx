'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Search,
  Package,
  ChevronDown,
  ChevronUp,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
import { Separator } from '@/components/ui/separator';
import { useStore } from '@/lib/store-context';
import { formatPrice, type Order } from '@/lib/data';
import { cn } from '@/lib/utils';

const orderStatuses = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  { value: 'packed', label: 'Packed', color: 'bg-indigo-100 text-indigo-800', icon: Package },
  { value: 'shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-800', icon: Truck },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-cyan-100 text-cyan-800', icon: Truck },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
  { value: 'rto', label: 'RTO', color: 'bg-orange-100 text-orange-800', icon: ArrowRight },
];

const paymentStatuses = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-800' },
  { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800' },
];

export default function AdminOrdersPage() {
  const { state, dispatch, getProduct } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [courierName, setCourierName] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    return state.orders
      .filter((order) => {
        const matchesSearch =
          order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.shippingAddress.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.shippingAddress.phone.includes(searchQuery);
        const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
        const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;

        return matchesSearch && matchesStatus && matchesPayment;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      });
  }, [state.orders, searchQuery, statusFilter, paymentFilter, sortOrder]);

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const openUpdateStatus = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setTrackingId(order.shipment?.trackingId || '');
    setCourierName(order.shipment?.courierName || '');
    setEstimatedDelivery(order.shipment?.estimatedDelivery || '');
    setIsUpdateOpen(true);
  };

  const handleUpdateOrder = async () => {
    if (selectedOrder) {
      const token = localStorage.getItem('kr_token');
      if (!token) {
        return;
      }

      const updatedOrder: Order = {
        ...selectedOrder,
        orderStatus: newStatus as Order['orderStatus'],
        updatedAt: new Date().toISOString(),
        ...(trackingId || courierName
          ? {
              shipment: {
                trackingId: trackingId || '',
                courierName: courierName || '',
                estimatedDelivery: estimatedDelivery || '',
              },
            }
          : {}),
      };

      const response = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderStatus: updatedOrder.orderStatus,
          shipment: updatedOrder.shipment,
        }),
      });

      if (!response.ok) {
        return;
      }

      dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });
      setIsUpdateOpen(false);
    }
  };

  const updatePaymentStatus = async (order: Order, status: 'pending' | 'paid' | 'failed') => {
    const token = localStorage.getItem('kr_token');
    if (!token) {
      return;
    }

    const updatedOrder: Order = {
      ...order,
      paymentStatus: status,
      updatedAt: new Date().toISOString(),
    };

    const response = await fetch(`/api/orders/${order.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        paymentStatus: status,
      }),
    });

    if (!response.ok) {
      return;
    }

    dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });
  };

  const getStatusInfo = (status: string) => {
    return orderStatuses.find((s) => s.value === status) || orderStatuses[0];
  };

  const getPaymentInfo = (status: string) => {
    return paymentStatuses.find((s) => s.value === status) || paymentStatuses[0];
  };

  // Order stats
  const stats = useMemo(() => {
    const total = state.orders.length;
    const pending = state.orders.filter((o) => o.orderStatus === 'pending').length;
    const processing = state.orders.filter((o) => ['confirmed', 'packed', 'shipped', 'out_for_delivery'].includes(o.orderStatus)).length;
    const delivered = state.orders.filter((o) => o.orderStatus === 'delivered').length;
    const cancelled = state.orders.filter((o) => ['cancelled', 'rto'].includes(o.orderStatus)).length;

    return { total, pending, processing, delivered, cancelled };
  }, [state.orders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">Process and manage customer orders</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-800">Pending</p>
            <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <p className="text-sm text-blue-800">Processing</p>
            <p className="text-2xl font-bold text-blue-800">{stats.processing}</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <p className="text-sm text-green-800">Delivered</p>
            <p className="text-2xl font-bold text-green-800">{stats.delivered}</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-sm text-red-800">Cancelled</p>
            <p className="text-2xl font-bold text-red-800">{stats.cancelled}</p>
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
                placeholder="Search by Order ID, Name, or Phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Order Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {orderStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                {paymentStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            >
              {sortOrder === 'newest' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => {
                  const statusInfo = getStatusInfo(order.orderStatus);
                  const paymentInfo = getPaymentInfo(order.paymentStatus);

                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono font-medium">{order.orderId}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.shippingAddress.name}</p>
                          <p className="text-xs text-muted-foreground">{order.shippingAddress.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{order.items.length} item(s)</span>
                      </TableCell>
                      <TableCell className="font-medium">{formatPrice(order.total)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge className={cn('text-xs', paymentInfo.color)}>{paymentInfo.label}</Badge>
                          <span className="text-xs text-muted-foreground uppercase">{order.paymentMethod}</span>
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
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openOrderDetail(order)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openUpdateStatus(order)}>
                            Update
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

      {/* Order Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Order #{selectedOrder?.orderId}</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Status & Payment */}
              <div className="flex flex-wrap gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Order Status</Label>
                  <Badge className={cn('mt-1', getStatusInfo(selectedOrder.orderStatus).color)}>
                    {getStatusInfo(selectedOrder.orderStatus).label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Payment Status</Label>
                  <Badge className={cn('mt-1', getPaymentInfo(selectedOrder.paymentStatus).color)}>
                    {getPaymentInfo(selectedOrder.paymentStatus).label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Payment Method</Label>
                  <p className="mt-1 font-medium uppercase">{selectedOrder.paymentMethod}</p>
                </div>
              </div>

              <Separator />

              {/* Payment Details (for online payments) */}
              {selectedOrder.paymentGateway && (
                <div className="space-y-3 rounded-lg border bg-blue-50 p-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payment Gateway Details
                  </h4>
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gateway:</span>
                      <Badge className="bg-blue-100 text-blue-800">{selectedOrder.paymentGateway}</Badge>
                    </div>
                    {selectedOrder.paymentOrderId && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Order ID:</span>
                        <span className="font-mono text-xs break-all">{selectedOrder.paymentOrderId}</span>
                      </div>
                    )}
                    {selectedOrder.paymentId && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Transaction ID:</span>
                        <span className="font-mono text-xs break-all">{selectedOrder.paymentId}</span>
                      </div>
                    )}
                    {selectedOrder.paymentCapturedAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Captured At:</span>
                        <span>{new Date(selectedOrder.paymentCapturedAt).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {selectedOrder.paymentSignature && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1">Signature (HMAC):</p>
                        <p className="font-mono text-xs break-all bg-white p-2 rounded border">{selectedOrder.paymentSignature}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Separator />

              {/* Customer & Shipping */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Shipping Address
                  </h4>
                  <div className="rounded-lg border bg-muted/50 p-3 text-sm">
                    <p className="font-medium">{selectedOrder.shippingAddress.name}</p>
                    <p>{selectedOrder.shippingAddress.addressLine1}</p>
                    {selectedOrder.shippingAddress.addressLine2 && (
                      <p>{selectedOrder.shippingAddress.addressLine2}</p>
                    )}
                    <p>
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{' '}
                      {selectedOrder.shippingAddress.pincode}
                    </p>
                    <p className="mt-2 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {selectedOrder.shippingAddress.phone}
                    </p>
                  </div>
                </div>

                {selectedOrder.shipment && (
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Shipment Info
                    </h4>
                    <div className="rounded-lg border bg-muted/50 p-3 text-sm">
                      <p>
                        <span className="text-muted-foreground">Courier:</span>{' '}
                        {selectedOrder.shipment.courierName}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Tracking ID:</span>{' '}
                        {selectedOrder.shipment.trackingId}
                      </p>
                      {selectedOrder.shipment.estimatedDelivery && (
                        <p>
                          <span className="text-muted-foreground">Est. Delivery:</span>{' '}
                          {selectedOrder.shipment.estimatedDelivery}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Order Items */}
              <div className="space-y-2">
                <h4 className="font-semibold">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => {
                    const product = getProduct(item.productId);
                    return (
                      <div key={index} className="flex items-center gap-3 rounded-lg border p-3">
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
                        <div className="flex-1">
                          <p className="font-medium">{product?.name || 'Unknown Product'}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.selectedWeight} x {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">{formatPrice(item.pricePerUnit * item.quantity)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Order Summary */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Charge</span>
                  <span>{formatPrice(selectedOrder.deliveryCharge)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Timestamps */}
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Created: {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Updated: {new Date(selectedOrder.updatedAt).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
            <Button onClick={() => { setIsDetailOpen(false); if(selectedOrder) openUpdateStatus(selectedOrder); }}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>Order #{selectedOrder?.orderId}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Order Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {orderStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      <span className="flex items-center gap-2">
                        <status.icon className="h-4 w-4" />
                        {status.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Status Quick Actions */}
            {selectedOrder?.paymentMethod === 'cod' && selectedOrder.orderStatus === 'delivered' && (
              <div className="space-y-2">
                <Label>Payment Status</Label>
                <div className="flex gap-2">
                  <Button
                    variant={selectedOrder.paymentStatus === 'paid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updatePaymentStatus(selectedOrder, 'paid')}
                    className="flex-1"
                  >
                    Mark as Paid
                  </Button>
                </div>
              </div>
            )}

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Shipment Details (Optional)</h4>
              <div className="space-y-2">
                <Label>Courier Name</Label>
                <Input
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="e.g., Delhivery, BlueDart"
                />
              </div>
              <div className="space-y-2">
                <Label>Tracking ID</Label>
                <Input
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="e.g., AWB12345678"
                />
              </div>
              <div className="space-y-2">
                <Label>Estimated Delivery</Label>
                <Input
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                  placeholder="e.g., March 25, 2026"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateOrder}>Update Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
