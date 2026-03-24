'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Package,
  MapPin,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
  Clock,
  CheckCircle,
  Truck,
  Box,
  RefreshCw,
  XCircle,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Header } from '@/components/store/header';
import { Footer } from '@/components/store/footer';
import { ProductCard } from '@/components/store/product-card';
import { useStore } from '@/lib/store-context';
import { formatPrice, type Address } from '@/lib/data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const orderStatusConfig = {
  pending: { label: 'Pending', icon: Clock, color: 'text-yellow-600 bg-yellow-100' },
  confirmed: { label: 'Confirmed', icon: CheckCircle, color: 'text-blue-600 bg-blue-100' },
  packed: { label: 'Packed', icon: Box, color: 'text-indigo-600 bg-indigo-100' },
  shipped: { label: 'Shipped', icon: Truck, color: 'text-purple-600 bg-purple-100' },
  out_for_delivery: { label: 'Out for Delivery', icon: Truck, color: 'text-orange-600 bg-orange-100' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'text-green-600 bg-green-100' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-600 bg-red-100' },
  rto: { label: 'Returned', icon: RefreshCw, color: 'text-red-600 bg-red-100' },
};

export default function ProfilePage() {
  const router = useRouter();
  const { state, dispatch, logout, getProduct } = useStore();

  const [activeTab, setActiveTab] = useState('orders');
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);

  useEffect(() => {
    if (!state.user) {
      router.replace('/login');
    }
  }, [state.user, router]);

  if (!state.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  const handleSaveAddress = () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.addressLine1 || 
        !newAddress.city || !newAddress.state || !newAddress.pincode) {
      toast.error('Please fill all required fields');
      return;
    }

    const address: Address = {
      id: editingAddress?.id || `addr_${Date.now()}`,
      name: newAddress.name!,
      phone: newAddress.phone!,
      addressLine1: newAddress.addressLine1!,
      addressLine2: newAddress.addressLine2,
      city: newAddress.city!,
      state: newAddress.state!,
      pincode: newAddress.pincode!,
      isDefault: newAddress.isDefault || false,
    };

    if (editingAddress) {
      dispatch({ type: 'UPDATE_ADDRESS', payload: address });
      toast.success('Address updated');
    } else {
      dispatch({ type: 'ADD_ADDRESS', payload: address });
      toast.success('Address added');
    }

    setIsAddressDialogOpen(false);
    setEditingAddress(null);
    setNewAddress({
      name: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false,
    });
  };

  const handleDeleteAddress = (addressId: string) => {
    dispatch({ type: 'DELETE_ADDRESS', payload: addressId });
    toast.success('Address deleted');
  };

  const wishlistProducts = state.products.filter((p) => state.wishlist.includes(p.id));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-4">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  {/* Profile Header */}
                  <div className="flex flex-col items-center text-center mb-6">
                    <Avatar className="h-20 w-20 mb-4">
                      <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                        {state.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="font-semibold text-lg">{state.user.name}</h2>
                    <p className="text-sm text-muted-foreground">{state.user.email}</p>
                    {state.user.role === 'admin' && (
                      <Badge className="mt-2">Admin</Badge>
                    )}
                  </div>

                  <Separator className="my-4" />

                  {/* Navigation */}
                  <nav className="space-y-1">
                    <button
                      onClick={() => setActiveTab('orders')}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                        activeTab === 'orders' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                      )}
                    >
                      <Package className="h-4 w-4" />
                      My Orders
                    </button>
                    <button
                      onClick={() => setActiveTab('addresses')}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                        activeTab === 'addresses' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                      )}
                    >
                      <MapPin className="h-4 w-4" />
                      Addresses
                    </button>
                    <button
                      onClick={() => setActiveTab('wishlist')}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                        activeTab === 'wishlist' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                      )}
                    >
                      <Heart className="h-4 w-4" />
                      Wishlist ({state.wishlist.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('settings')}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                        activeTab === 'settings' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                      )}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </button>
                    {state.user.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted text-primary font-medium"
                      >
                        <Settings className="h-4 w-4" />
                        Admin Panel
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      </Link>
                    )}
                  </nav>

                  <Separator className="my-4" />

                  <Button variant="outline" className="w-full gap-2" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </CardContent>
              </Card>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h1 className="font-serif text-2xl font-bold">My Orders</h1>
                    <span className="text-sm text-muted-foreground">{state.orders.length} orders</span>
                  </div>

                  {state.orders.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">No orders yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">Start shopping to see your orders here</p>
                        <Link href="/products">
                          <Button>Browse Products</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ) : (
                    state.orders.map((order) => {
                      const statusConfig = orderStatusConfig[order.orderStatus];
                      return (
                        <Card key={order.id}>
                          <CardHeader className="pb-2">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <CardTitle className="text-base">Order #{order.orderId}</CardTitle>
                                <CardDescription>
                                  Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                  })}
                                </CardDescription>
                              </div>
                              <Badge className={cn('gap-1', statusConfig.color)}>
                                <statusConfig.icon className="h-3 w-3" />
                                {statusConfig.label}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {/* Order Items */}
                            <div className="space-y-2 mb-4">
                              {order.items.map((item, index) => {
                                const product = getProduct(item.productId);
                                return (
                                  <div key={index} className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                      {product?.name || 'Product'} ({item.selectedWeight}) x {item.quantity}
                                    </span>
                                    <span>{formatPrice(item.pricePerUnit * item.quantity)}</span>
                                  </div>
                                );
                              })}
                            </div>

                            <Separator className="my-3" />

                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="text-sm">
                                <span className="text-muted-foreground">Total: </span>
                                <span className="font-semibold">{formatPrice(order.total)}</span>
                                <span className="text-muted-foreground ml-2">
                                  ({order.paymentMethod === 'cod' ? 'COD' : 'Paid Online'})
                                </span>
                              </div>
                              <div className="flex gap-2">
                                {order.orderStatus === 'delivered' && (
                                  <Button variant="outline" size="sm">
                                    <RefreshCw className="h-4 w-4 mr-1" />
                                    Reorder
                                  </Button>
                                )}
                                <Button variant="outline" size="sm">
                                  View Details
                                </Button>
                              </div>
                            </div>

                            {/* Order Timeline */}
                            {order.orderStatus !== 'cancelled' && order.orderStatus !== 'rto' && (
                              <div className="mt-4 pt-4 border-t">
                                <div className="flex items-center justify-between text-xs">
                                  {['pending', 'confirmed', 'packed', 'shipped', 'delivered'].map((status, index) => {
                                    const statusOrder = ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];
                                    const currentIndex = statusOrder.indexOf(order.orderStatus);
                                    const thisIndex = statusOrder.indexOf(status);
                                    const isComplete = thisIndex <= currentIndex;
                                    const isCurrent = status === order.orderStatus;

                                    return (
                                      <div key={status} className="flex flex-col items-center flex-1">
                                        <div
                                          className={cn(
                                            'h-3 w-3 rounded-full',
                                            isComplete ? 'bg-primary' : 'bg-muted'
                                          )}
                                        />
                                        <span
                                          className={cn(
                                            'mt-1 capitalize',
                                            isCurrent ? 'font-medium text-primary' : 'text-muted-foreground'
                                          )}
                                        >
                                          {status}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h1 className="font-serif text-2xl font-bold">My Addresses</h1>
                    <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          className="gap-2"
                          onClick={() => {
                            setEditingAddress(null);
                            setNewAddress({
                              name: state.user?.name || '',
                              phone: state.user?.phone || '',
                              addressLine1: '',
                              addressLine2: '',
                              city: '',
                              state: '',
                              pincode: '',
                              isDefault: false,
                            });
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          Add Address
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <Label htmlFor="addr-name">Full Name</Label>
                              <Input
                                id="addr-name"
                                value={newAddress.name}
                                onChange={(e) => setNewAddress((prev) => ({ ...prev, name: e.target.value }))}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="addr-phone">Phone</Label>
                              <Input
                                id="addr-phone"
                                value={newAddress.phone}
                                onChange={(e) => setNewAddress((prev) => ({ ...prev, phone: e.target.value }))}
                                className="mt-1"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="addr-line1">Address Line 1</Label>
                            <Input
                              id="addr-line1"
                              value={newAddress.addressLine1}
                              onChange={(e) => setNewAddress((prev) => ({ ...prev, addressLine1: e.target.value }))}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="addr-line2">Address Line 2 (Optional)</Label>
                            <Input
                              id="addr-line2"
                              value={newAddress.addressLine2}
                              onChange={(e) => setNewAddress((prev) => ({ ...prev, addressLine2: e.target.value }))}
                              className="mt-1"
                            />
                          </div>
                          <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                              <Label htmlFor="addr-city">City</Label>
                              <Input
                                id="addr-city"
                                value={newAddress.city}
                                onChange={(e) => setNewAddress((prev) => ({ ...prev, city: e.target.value }))}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="addr-state">State</Label>
                              <Input
                                id="addr-state"
                                value={newAddress.state}
                                onChange={(e) => setNewAddress((prev) => ({ ...prev, state: e.target.value }))}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="addr-pincode">Pincode</Label>
                              <Input
                                id="addr-pincode"
                                value={newAddress.pincode}
                                onChange={(e) => setNewAddress((prev) => ({ ...prev, pincode: e.target.value }))}
                                className="mt-1"
                              />
                            </div>
                          </div>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={newAddress.isDefault}
                              onChange={(e) => setNewAddress((prev) => ({ ...prev, isDefault: e.target.checked }))}
                              className="rounded"
                            />
                            <span className="text-sm">Set as default address</span>
                          </label>
                          <Button onClick={handleSaveAddress} className="w-full">
                            {editingAddress ? 'Update Address' : 'Save Address'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {state.user.addresses.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">No addresses saved</h3>
                        <p className="text-sm text-muted-foreground mb-4">Add an address for faster checkout</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {state.user.addresses.map((address) => (
                        <Card key={address.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{address.name}</h3>
                                {address.isDefault && <Badge variant="secondary">Default</Badge>}
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setEditingAddress(address);
                                    setNewAddress(address);
                                    setIsAddressDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => handleDeleteAddress(address.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {address.addressLine1}
                              {address.addressLine2 && `, ${address.addressLine2}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {address.city}, {address.state} - {address.pincode}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">Phone: {address.phone}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h1 className="font-serif text-2xl font-bold">My Wishlist</h1>
                    <span className="text-sm text-muted-foreground">{wishlistProducts.length} items</span>
                  </div>

                  {wishlistProducts.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">Your wishlist is empty</h3>
                        <p className="text-sm text-muted-foreground mb-4">Save items you love for later</p>
                        <Link href="/products">
                          <Button>Browse Products</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {wishlistProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <h1 className="font-serif text-2xl font-bold">Account Settings</h1>

                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="settings-name">Name</Label>
                          <Input id="settings-name" value={state.user.name} disabled className="mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="settings-email">Email</Label>
                          <Input id="settings-email" value={state.user.email} disabled className="mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="settings-phone">Phone</Label>
                          <Input id="settings-phone" value={state.user.phone} disabled className="mt-1" />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        To update your profile information, please contact support.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Danger Zone</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button variant="destructive" className="gap-2">
                        Delete Account
                      </Button>
                      <p className="text-sm text-muted-foreground mt-2">
                        This action cannot be undone. All your data will be permanently deleted.
                      </p>
                    </CardContent>
                  </Card>
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
