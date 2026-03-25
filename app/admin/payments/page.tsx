'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store-context';
import { Order } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function PaymentsPage() {
  const { state } = useStore();
  const [payments, setPayments] = useState<Order[]>([]);
  const [filtered, setFiltered] = useState<Order[]>([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<Order | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Filter orders that have payment gateway (online payments)
    const onlinePayments = state.orders.filter(
      (order) => order.paymentGateway === 'razorpay' || order.paymentMethod === 'online'
    );
    setPayments(onlinePayments);
  }, [state.orders]);

  useEffect(() => {
    let result = payments;

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter((p) => p.paymentStatus === statusFilter);
    }

    // Search by order ID, customer name, or payment ID
    if (searchText.trim()) {
      const query = searchText.toLowerCase();
      result = result.filter(
        (p) =>
          p.orderId.toLowerCase().includes(query) ||
          p.shippingAddress?.name?.toLowerCase().includes(query) ||
          p.paymentId?.toLowerCase().includes(query)
      );
    }

    setFiltered(result);
  }, [payments, searchText, statusFilter]);

  const stats = {
    total: payments.length,
    paid: payments.filter((p) => p.paymentStatus === 'paid').length,
    pending: payments.filter((p) => p.paymentStatus === 'pending').length,
    failed: payments.filter((p) => p.paymentStatus === 'failed').length,
  };

  const totalRevenue = payments
    .filter((p) => p.paymentStatus === 'paid')
    .reduce((sum, p) => sum + (p.total || 0), 0);

  const getPaymentStatusIcon = (status?: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPaymentStatusBadge = (status?: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const formatDate = (date?: string | Date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', {
        return <Badge>Unknown</Badge>;
    }
  };

  const formatDate = (date?: string | Date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment History</h1>
        <p className="text-gray-600">All online payment transactions via Razorpay</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Transactions</div>
          <div className="text-3xl font-bold">{stats.total}</div>
        </Card>
        <Card className="p-4 border-green-200">
          <div className="text-sm text-gray-600">Paid</div>
          <div className="text-3xl font-bold text-green-600">{stats.paid}</div>
        </Card>
        <Card className="p-4 border-yellow-200">
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
        </Card>
        <Card className="p-4 border-red-200">
          <div className="text-sm text-gray-600">Failed</div>
          <div className="text-3xl font-bold text-red-600">{stats.failed}</div>
        </Card>
      </div>

      {/* Revenue Card */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="text-sm text-gray-600">Total Revenue (Paid)</div>
        <div className="text-4xl font-bold text-indigo-600">₹{totalRevenue.toLocaleString('en-IN')}</div>
      </Card>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Search by Order ID, Customer Name, or Payment ID..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="h-9"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">✓ Paid</SelectItem>
              <SelectItem value="pending">⏳ Pending</SelectItem>
              <SelectItem value="failed">✗ Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Payments Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Gateway</TableHead>
              <TableHead>Payment ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((payment) => (
                <TableRow key={payment.id} className="hover:bg-gray-50">
                  <TableCell className="font-mono text-xs">{payment.id.slice(0, 8)}...</TableCell>
                  <TableCell>
                    <div className="font-medium">{payment.customerName || 'Unknown'}</div>
                    <div className="text-xs text-gray-500">{payment.customerEmail}</div>
                  </TableCell>
                  <TableCell className="font-bold">₹{payment.totalAmount}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50">
                      {payment.paymentGateway || 'razorpay'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {payment.paymentId ? payment.paymentId.slice(0, 12) + '...' : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getPaymentStatusIcon(payment.paymentStatus)}
                      {getPaymentStatusBadge(payment.paymentStatus)}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(payment.paymentCapturedAt || payment.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedPayment(payment);
                        setShowDetails(true);
                      }}
                      className="gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No payments found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Details Dialog */}
      <AlertDialog open={showDetails} onOpenChange={setShowDetails}>
        <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Payment Details</AlertDialogTitle>
            <AlertDialogDescription>Full transaction information</AlertDialogDescription>
          </AlertDialogHeader>

          {selectedPayment && (
            <div className="space-y-6 py-4">
              {/* Order & Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-600">Order ID</div>
                  <div className="font-mono text-sm">{selectedPayment.id}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">Customer Name</div>
                  <div>{selectedPayment.customerName}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">Email</div>
                  <div className="text-sm">{selectedPayment.customerEmail}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">Phone</div>
                  <div>{selectedPayment.customerPhone}</div>
                </div>
              </div>

              <hr />

              {/* Payment Details */}
              <div>
                <div className="text-lg font-semibold mb-3">Payment Information</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-600">Payment Gateway</div>
                    <div className="flex gap-2 items-center">
                      <Badge className="bg-blue-100 text-blue-800">{selectedPayment.paymentGateway}</Badge>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600">Payment Status</div>
                    <div className="flex gap-2 items-center">
                      {getPaymentStatusIcon(selectedPayment.paymentStatus)}
                      {getPaymentStatusBadge(selectedPayment.paymentStatus)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600">Payment Order ID</div>
                    <div className="font-mono text-xs break-all">{selectedPayment.paymentOrderId || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600">Payment Transaction ID</div>
                    <div className="font-mono text-xs break-all">{selectedPayment.paymentId || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600">Payment Method</div>
                    <div className="capitalize">{selectedPayment.paymentMethod}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600">Captured At</div>
                    <div className="text-sm">{formatDate(selectedPayment.paymentCapturedAt)}</div>
                  </div>
                </div>
              </div>

              <hr />

              {/* Order & Amount Details */}
              <div>
                <div className="text-lg font-semibold mb-3">Order Information</div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Date</span>
                    <span>{formatDate(selectedPayment.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Status</span>
                    <Badge>{selectedPayment.orderStatus || 'pending'}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{selectedPayment.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Charge</span>
                    <span>₹{selectedPayment.deliveryCharge || 0}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-bold">Total Amount</span>
                    <span className="font-bold text-lg">₹{selectedPayment.totalAmount}</span>
                  </div>
                </div>
              </div>

              <hr />

              {/* Shipping Address */}
              <div>
                <div className="text-lg font-semibold mb-3">Shipping Address</div>
                <div className="text-sm space-y-1 bg-gray-50 p-3 rounded">
                  <div>{selectedPayment.address?.fullName}</div>
                  <div>{selectedPayment.address?.street}</div>
                  <div>
                    {selectedPayment.address?.city}, {selectedPayment.address?.zip}
                  </div>
                  <div>{selectedPayment.address?.state}</div>
                  <div>Phone: {selectedPayment.address?.phone}</div>
                </div>
              </div>

              {/* Signature for Audit */}
              {selectedPayment.paymentSignature && (
                <>
                  <hr />
                  <div>
                    <div className="text-lg font-semibold mb-3">Security & Audit</div>
                    <div className="bg-gray-50 p-3 rounded font-mono text-xs break-all">
                      <div className="text-gray-600 mb-1">Payment Signature (HMAC):</div>
                      {selectedPayment.paymentSignature}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
