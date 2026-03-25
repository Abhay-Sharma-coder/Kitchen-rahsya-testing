'use client';

import { useMemo, useState } from 'react';
import { Truck, Search, PackageCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useStore } from '@/lib/store-context';
import { type Order } from '@/lib/data';

const deliveryStatuses: Array<Order['orderStatus']> = [
  'confirmed',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
  'rto',
  'cancelled',
];

const statusColors: Record<Order['orderStatus'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  packed: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-cyan-100 text-cyan-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  rto: 'bg-orange-100 text-orange-800',
};

export default function AdminDeliveryPage() {
  const { state, dispatch } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Order['orderStatus']>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<Order['orderStatus']>('confirmed');
  const [courierName, setCourierName] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  const deliveryOrders = useMemo(() => {
    return state.orders.filter((order) => {
      const isDeliveryOrder = deliveryStatuses.includes(order.orderStatus) || order.paymentStatus === 'paid';
      if (!isDeliveryOrder) {
        return false;
      }

      const matchesSearch =
        order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.shippingAddress.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.shippingAddress.phone.includes(searchQuery);

      const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [state.orders, searchQuery, statusFilter]);

  const openUpdateDialog = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setCourierName(order.shipment?.courierName || '');
    setTrackingId(order.shipment?.trackingId || '');
    setEstimatedDelivery(order.shipment?.estimatedDelivery || '');
    setIsUpdateOpen(true);
  };

  const saveDeliveryUpdate = async () => {
    if (!selectedOrder) {
      return;
    }

    const token = localStorage.getItem('kr_token');
    if (!token) {
      alert('Admin auth token not found. Please login again.');
      return;
    }

    const response = await fetch(`/api/orders/${selectedOrder.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        orderStatus: newStatus,
        shipment: {
          courierName,
          trackingId,
          estimatedDelivery,
        },
      }),
    });

    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      alert(data.error || 'Failed to update delivery');
      return;
    }

    dispatch({
      type: 'UPDATE_ORDER',
      payload: {
        ...selectedOrder,
        orderStatus: newStatus,
        shipment: {
          courierName,
          trackingId,
          estimatedDelivery,
        },
        updatedAt: new Date().toISOString(),
      },
    });

    setIsUpdateOpen(false);
  };

  const inTransitCount = state.orders.filter((o) => ['shipped', 'out_for_delivery'].includes(o.orderStatus)).length;
  const deliveredCount = state.orders.filter((o) => o.orderStatus === 'delivered').length;
  const rtoCount = state.orders.filter((o) => o.orderStatus === 'rto').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Delivery</h1>
        <p className="text-muted-foreground">Manage courier assignment, tracking and delivery status.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">In Transit</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{inTransitCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Delivered</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{deliveredCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">RTO</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{rtoCount}</CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 grid gap-3 md:grid-cols-[1fr_220px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order, customer, phone"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value: 'all' | Order['orderStatus']) => setStatusFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {deliveryStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replaceAll('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Courier</TableHead>
                  <TableHead>Tracking</TableHead>
                  <TableHead>ETA</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveryOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      No delivery orders found.
                    </TableCell>
                  </TableRow>
                ) : (
                  deliveryOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">{order.orderId}</TableCell>
                      <TableCell>
                        <div className="font-medium">{order.shippingAddress.name}</div>
                        <div className="text-xs text-muted-foreground">{order.shippingAddress.phone}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[order.orderStatus]}>
                          {order.orderStatus.replaceAll('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.shipment?.courierName || '-'}</TableCell>
                      <TableCell>{order.shipment?.trackingId || '-'}</TableCell>
                      <TableCell>{order.shipment?.estimatedDelivery || '-'}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => openUpdateDialog(order)}>
                          <PackageCheck className="mr-1 h-4 w-4" />
                          Update
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-4 w-4" /> Update Delivery
            </DialogTitle>
            <DialogDescription>Set order delivery state and shipment details.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={newStatus} onValueChange={(value: Order['orderStatus']) => setNewStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {deliveryStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replaceAll('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Courier</Label>
              <Input value={courierName} onChange={(e) => setCourierName(e.target.value)} placeholder="Shiprocket / Delhivery" />
            </div>

            <div className="space-y-1">
              <Label>Tracking ID</Label>
              <Input value={trackingId} onChange={(e) => setTrackingId(e.target.value)} placeholder="AWB123456" />
            </div>

            <div className="space-y-1">
              <Label>Estimated Delivery</Label>
              <Input value={estimatedDelivery} onChange={(e) => setEstimatedDelivery(e.target.value)} placeholder="2026-03-30" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateOpen(false)}>Cancel</Button>
            <Button onClick={() => void saveDeliveryUpdate()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
