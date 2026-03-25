'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  CreditCard,
  Wallet,
  Check,
  Info,
  Truck,
  MapPin,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Header } from '@/components/store/header';
import { Footer } from '@/components/store/footer';
import { useStore } from '@/lib/store-context';
import { formatPrice, formatWeight, type Address, type Order } from '@/lib/data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type CheckoutStep = 'cart' | 'address' | 'payment' | 'confirm';

type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

async function loadRazorpayScript() {
  if (window.Razorpay) {
    return true;
  }

  return new Promise<boolean>((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const { state, dispatch, getProduct, removeFromCart, updateCartQuantity, getCartTotal, placeOrder } = useStore();

  const [step, setStep] = useState<CheckoutStep>('cart');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('online');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    state.user?.addresses.find((a) => a.isDefault)?.id || null
  );
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    name: state.user?.name || '',
    phone: state.user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [showNewAddressForm, setShowNewAddressForm] = useState(!state.user?.addresses.length);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { subtotal, deliveryCharge, total, totalWeight } = getCartTotal(paymentMethod);

  // Calculate discount
  const discount = couponApplied ? Math.round(subtotal * 0.2) : 0;
  const finalTotal = total - discount;

  const handleApplyCoupon = () => {
    if (couponCode.toLowerCase() === 'rahasya20') {
      setCouponApplied(true);
      toast.success('Coupon applied! 20% discount added.');
    } else {
      toast.error('Invalid coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setCouponCode('');
    toast.info('Coupon removed');
  };

  const validateAddress = (): Address | null => {
    if (selectedAddressId && state.user) {
      const addr = state.user.addresses.find((a) => a.id === selectedAddressId);
      if (addr) return addr;
    }

    // Validate new address
    if (!newAddress.name || !newAddress.phone || !newAddress.addressLine1 || 
        !newAddress.city || !newAddress.state || !newAddress.pincode) {
      toast.error('Please fill all address fields');
      return null;
    }

    return {
      id: `addr_${Date.now()}`,
      name: newAddress.name!,
      phone: newAddress.phone!,
      addressLine1: newAddress.addressLine1!,
      addressLine2: newAddress.addressLine2,
      city: newAddress.city!,
      state: newAddress.state!,
      pincode: newAddress.pincode!,
      isDefault: false,
    };
  };

  const handlePlaceOrder = async () => {
    const address = validateAddress();
    if (!address) return;

    setIsProcessing(true);

    try {
      if (paymentMethod === 'cod') {
        const order = await placeOrder(paymentMethod, address);
        if (!order) {
          toast.error('Failed to place order. Please try again.');
          return;
        }

        router.push(`/order-success?orderId=${order.orderId}`);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        toast.error('Payment SDK failed to load. Please try again.');
        return;
      }

      const createResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('kr_token') || ''}`,
        },
        body: JSON.stringify({
          items: state.cart,
          address,
        }),
      });

      const createData = (await createResponse.json()) as {
        error?: string;
        order?: { id: string; orderId: string };
        razorpay?: {
          keyId: string;
          orderId: string;
          amount: number;
          currency: string;
          customerEmail?: string;
        };
      };

      if (!createResponse.ok || !createData.order || !createData.razorpay) {
        toast.error(createData.error || 'Unable to initialize online payment');
        return;
      }

      const options: RazorpayOptions = {
        key: createData.razorpay.keyId,
        amount: createData.razorpay.amount,
        currency: createData.razorpay.currency,
        name: 'Kitchen Rahasya',
        description: `Order ${createData.order.orderId}`,
        order_id: createData.razorpay.orderId,
        prefill: {
          name: state.user?.name,
          email: createData.razorpay.customerEmail || state.user?.email,
          contact: state.user?.phone,
        },
        modal: {
          ondismiss: () => {
            toast.info('Payment cancelled. You can retry from checkout.');
          },
        },
        handler: async (paymentResponse) => {
          const verifyResponse = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('kr_token') || ''}`,
            },
            body: JSON.stringify({
              internalOrderId: createData.order?.id,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            }),
          });

          const verifyData = (await verifyResponse.json()) as {
            error?: string;
            order?: Order;
          };

          if (!verifyResponse.ok || !verifyData.order) {
            toast.error(verifyData.error || 'Payment verification failed');
            return;
          }

          dispatch({ type: 'ADD_ORDER', payload: verifyData.order });
          dispatch({ type: 'CLEAR_CART' });
          router.push(`/order-success?orderId=${verifyData.order.orderId}`);
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch {
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (state.cart.length === 0 && step === 'cart') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="rounded-full bg-muted p-6 inline-block mb-4">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Your cart is empty</h1>
            <p className="mt-2 text-muted-foreground">Add some delicious spices to get started!</p>
            <Link href="/products">
              <Button className="mt-4 gap-2">
                Browse Products
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const steps = [
    { key: 'cart', label: 'Cart', icon: ShoppingBag },
    { key: 'address', label: 'Address', icon: MapPin },
    { key: 'payment', label: 'Payment', icon: CreditCard },
    { key: 'confirm', label: 'Confirm', icon: Check },
  ] as const;

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              {steps.map((s, i) => (
                <div key={s.key} className="flex items-center">
                  <button
                    onClick={() => i <= currentStepIndex && setStep(s.key)}
                    disabled={i > currentStepIndex}
                    className={cn(
                      'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                      step === s.key
                        ? 'bg-primary text-primary-foreground'
                        : i < currentStepIndex
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <s.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                  {i < steps.length - 1 && (
                    <div
                      className={cn(
                        'mx-2 h-0.5 w-8 sm:w-16',
                        i < currentStepIndex ? 'bg-primary' : 'bg-muted'
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Cart Step */}
              {step === 'cart' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5" />
                      Your Cart ({state.cart.length} items)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {state.cart.map((item) => {
                      const product = getProduct(item.productId);
                      if (!product) return null;

                      return (
                        <div
                          key={`${item.productId}-${item.selectedWeight}`}
                          className="flex gap-4 rounded-lg border p-4"
                        >
                          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-contain p-2"
                              sizes="96px"
                            />
                          </div>
                          <div className="flex flex-1 flex-col justify-between">
                            <div>
                              <Link href={`/products/${product.slug}`} className="font-semibold hover:text-primary">
                                {product.name}
                              </Link>
                              <p className="text-sm text-muted-foreground">{item.selectedWeight}</p>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateCartQuantity(item.productId, item.selectedWeight, item.quantity - 1)}
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateCartQuantity(item.productId, item.selectedWeight, item.quantity + 1)}
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-semibold">{formatPrice(item.pricePerUnit * item.quantity)}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => removeFromCart(item.productId, item.selectedWeight)}
                                  aria-label="Remove item"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Coupon Code */}
                    <div className="rounded-lg border bg-muted/30 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Tag className="h-4 w-4 text-primary" />
                        <span className="font-medium">Have a coupon?</span>
                      </div>
                      {couponApplied ? (
                        <div className="flex items-center justify-between rounded-md bg-primary/10 px-3 py-2">
                          <span className="text-sm font-medium text-primary">RAHASYA20 applied - 20% off!</span>
                          <Button variant="ghost" size="sm" onClick={handleRemoveCoupon} className="h-auto p-1 text-destructive">
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter coupon code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="flex-1"
                          />
                          <Button variant="outline" onClick={handleApplyCoupon}>
                            Apply
                          </Button>
                        </div>
                      )}
                      <p className="mt-2 text-xs text-muted-foreground">Try: RAHASYA20 for 20% off on first order</p>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Link href="/products">
                        <Button variant="outline" className="gap-2">
                          <ArrowLeft className="h-4 w-4" />
                          Continue Shopping
                        </Button>
                      </Link>
                      <Button onClick={() => setStep('address')} className="gap-2">
                        Proceed
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Address Step */}
              {step === 'address' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Delivery Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Saved Addresses */}
                    {state.user?.addresses && state.user.addresses.length > 0 && (
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Select Address</Label>
                        <RadioGroup value={selectedAddressId || ''} onValueChange={setSelectedAddressId}>
                          {state.user.addresses.map((addr) => (
                            <label
                              key={addr.id}
                              className={cn(
                                'flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors',
                                selectedAddressId === addr.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                              )}
                            >
                              <RadioGroupItem value={addr.id} className="mt-1" />
                              <div>
                                <p className="font-medium">{addr.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {addr.addressLine1}
                                  {addr.addressLine2 && `, ${addr.addressLine2}`}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {addr.city}, {addr.state} - {addr.pincode}
                                </p>
                                <p className="text-sm text-muted-foreground">Phone: {addr.phone}</p>
                                {addr.isDefault && <Badge variant="secondary" className="mt-1">Default</Badge>}
                              </div>
                            </label>
                          ))}
                        </RadioGroup>

                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setShowNewAddressForm(!showNewAddressForm);
                            if (!showNewAddressForm) setSelectedAddressId(null);
                          }}
                        >
                          {showNewAddressForm ? 'Use Saved Address' : 'Add New Address'}
                        </Button>
                      </div>
                    )}

                    {/* New Address Form */}
                    {(showNewAddressForm || !state.user?.addresses.length) && (
                      <div className="space-y-4">
                        <Label className="text-sm font-medium">New Address</Label>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              value={newAddress.name}
                              onChange={(e) => setNewAddress((prev) => ({ ...prev, name: e.target.value }))}
                              placeholder="John Doe"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              value={newAddress.phone}
                              onChange={(e) => setNewAddress((prev) => ({ ...prev, phone: e.target.value }))}
                              placeholder="9876543210"
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="addressLine1">Address Line 1</Label>
                          <Input
                            id="addressLine1"
                            value={newAddress.addressLine1}
                            onChange={(e) => setNewAddress((prev) => ({ ...prev, addressLine1: e.target.value }))}
                            placeholder="House/Flat No., Building Name"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                          <Input
                            id="addressLine2"
                            value={newAddress.addressLine2}
                            onChange={(e) => setNewAddress((prev) => ({ ...prev, addressLine2: e.target.value }))}
                            placeholder="Street, Landmark"
                            className="mt-1"
                          />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div>
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              value={newAddress.city}
                              onChange={(e) => setNewAddress((prev) => ({ ...prev, city: e.target.value }))}
                              placeholder="Mumbai"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="state">State</Label>
                            <Input
                              id="state"
                              value={newAddress.state}
                              onChange={(e) => setNewAddress((prev) => ({ ...prev, state: e.target.value }))}
                              placeholder="Maharashtra"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="pincode">Pincode</Label>
                            <Input
                              id="pincode"
                              value={newAddress.pincode}
                              onChange={(e) => setNewAddress((prev) => ({ ...prev, pincode: e.target.value }))}
                              placeholder="400001"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between pt-4">
                      <Button variant="outline" onClick={() => setStep('cart')} className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                      </Button>
                      <Button onClick={() => {
                        const addr = validateAddress();
                        if (addr) setStep('payment');
                      }} className="gap-2">
                        Continue
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment Step */}
              {step === 'payment' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'cod' | 'online')}>
                      <label
                        className={cn(
                          'flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors',
                          paymentMethod === 'online' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                        )}
                      >
                        <RadioGroupItem value="online" className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">Online Payment</p>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">Recommended</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Pay securely using UPI, Cards, Net Banking, or Wallets
                          </p>
                          <p className="mt-1 text-sm font-medium text-primary">
                            Delivery: {formatPrice(getCartTotal('online').deliveryCharge)} ({formatPrice(30)}/500g)
                          </p>
                        </div>
                      </label>

                      <label
                        className={cn(
                          'flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors',
                          paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                        )}
                      >
                        <RadioGroupItem value="cod" className="mt-1" />
                        <div className="flex-1">
                          <p className="font-medium">Cash on Delivery (COD)</p>
                          <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
                          <p className="mt-1 text-sm font-medium text-muted-foreground">
                            Delivery: {formatPrice(getCartTotal('cod').deliveryCharge)} ({formatPrice(60)}/500g)
                          </p>
                        </div>
                      </label>
                    </RadioGroup>

                    <div className="rounded-lg border bg-muted/30 p-4">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="text-sm text-muted-foreground">
                          <p className="font-medium text-foreground">Delivery Charges</p>
                          <p>Online Payment: {formatPrice(30)} per 500g</p>
                          <p>Cash on Delivery: {formatPrice(60)} per 500g</p>
                          <p className="mt-1">Your total weight: {formatWeight(totalWeight)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button variant="outline" onClick={() => setStep('address')} className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                      </Button>
                      <Button onClick={() => setStep('confirm')} className="gap-2">
                        Review Order
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Confirm Step */}
              {step === 'confirm' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Check className="h-5 w-5" />
                      Order Review
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Order Items */}
                    <div>
                      <h3 className="font-medium mb-3">Items ({state.cart.length})</h3>
                      <div className="space-y-2">
                        {state.cart.map((item) => {
                          const product = getProduct(item.productId);
                          if (!product) return null;
                          return (
                            <div key={`${item.productId}-${item.selectedWeight}`} className="flex justify-between text-sm">
                              <span>
                                {product.name} ({item.selectedWeight}) x {item.quantity}
                              </span>
                              <span className="font-medium">{formatPrice(item.pricePerUnit * item.quantity)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <Separator />

                    {/* Delivery Address */}
                    <div>
                      <h3 className="font-medium mb-2">Delivery Address</h3>
                      {(() => {
                        const addr = selectedAddressId && state.user
                          ? state.user.addresses.find((a) => a.id === selectedAddressId)
                          : newAddress as Address;
                        return addr && (
                          <div className="text-sm text-muted-foreground">
                            <p className="font-medium text-foreground">{addr.name}</p>
                            <p>{addr.addressLine1}{addr.addressLine2 && `, ${addr.addressLine2}`}</p>
                            <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                            <p>Phone: {addr.phone}</p>
                          </div>
                        );
                      })()}
                    </div>

                    <Separator />

                    {/* Payment Method */}
                    <div>
                      <h3 className="font-medium mb-2">Payment Method</h3>
                      <p className="text-sm text-muted-foreground">
                        {paymentMethod === 'online' ? 'Online Payment (UPI/Cards/Net Banking)' : 'Cash on Delivery'}
                      </p>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button variant="outline" onClick={() => setStep('payment')} className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                      </Button>
                      <Button onClick={handlePlaceOrder} disabled={isProcessing} className="gap-2">
                        {isProcessing ? (
                          <>Processing...</>
                        ) : (
                          <>
                            Place Order - {formatPrice(finalTotal)}
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal ({state.cart.length} items)</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Weight</span>
                      <span>{formatWeight(totalWeight)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Delivery ({paymentMethod === 'online' ? 'Online' : 'COD'})
                      </span>
                      <span>{formatPrice(deliveryCharge)}</span>
                    </div>
                    {couponApplied && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount (20%)</span>
                        <span>-{formatPrice(discount)}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(finalTotal)}</span>
                  </div>

                  {paymentMethod === 'cod' && (
                    <p className="text-xs text-muted-foreground text-center">
                      Switch to online payment to save {formatPrice(getCartTotal('cod').deliveryCharge - getCartTotal('online').deliveryCharge)}!
                    </p>
                  )}

                  {/* Estimated Delivery */}
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Truck className="h-4 w-4 text-primary" />
                      <span>Estimated delivery in 3-5 business days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
