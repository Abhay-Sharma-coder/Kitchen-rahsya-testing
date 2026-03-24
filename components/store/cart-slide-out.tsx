'use client';

import { type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStore } from '@/lib/store-context';
import { formatPrice, formatWeight } from '@/lib/data';
import { cn } from '@/lib/utils';

interface CartSlideOutProps {
  children: ReactNode;
}

export function CartSlideOut({ children }: CartSlideOutProps) {
  const { state, dispatch, getProduct, removeFromCart, updateCartQuantity, getCartTotal } = useStore();

  const { subtotal, deliveryCharge, total, totalWeight } = getCartTotal('online');
  const codTotal = getCartTotal('cod');

  return (
    <Sheet open={state.isCartOpen} onOpenChange={(open) => dispatch({ type: 'SET_CART_OPEN', payload: open })}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Your Cart ({state.cart.length} items)
          </SheetTitle>
        </SheetHeader>

        {state.cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-muted p-6">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground">Add some spices to get started!</p>
            </div>
            <Link href="/products" onClick={() => dispatch({ type: 'SET_CART_OPEN', payload: false })}>
              <Button>
                Start Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="flex flex-col gap-4 py-4">
                {state.cart.map((item) => {
                  const product = getProduct(item.productId);
                  if (!product) return null;

                  return (
                    <div
                      key={`${item.productId}-${item.selectedWeight}`}
                      className="flex gap-4 rounded-lg border bg-card p-3"
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain p-1"
                          sizes="80px"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h4 className="font-medium leading-tight">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">{item.selectedWeight}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                updateCartQuantity(item.productId, item.selectedWeight, item.quantity - 1)
                              }
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                updateCartQuantity(item.productId, item.selectedWeight, item.quantity + 1)
                              }
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{formatPrice(item.pricePerUnit * item.quantity)}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
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
              </div>
            </ScrollArea>

            <div className="border-t pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Weight</span>
                  <span>{formatWeight(totalWeight)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Delivery (Online Payment)</span>
                  <span>{formatPrice(deliveryCharge)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Delivery (COD)</span>
                  <span>{formatPrice(codTotal.deliveryCharge)}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between text-lg font-semibold">
                <span>Total (Online)</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <Link href="/checkout" onClick={() => dispatch({ type: 'SET_CART_OPEN', payload: false })}>
                  <Button className="w-full" size="lg">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/products" onClick={() => dispatch({ type: 'SET_CART_OPEN', payload: false })}>
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>

              <p className="mt-3 text-center text-xs text-muted-foreground">
                Save {formatPrice(codTotal.deliveryCharge - deliveryCharge)} with online payment!
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
