import { NextRequest, NextResponse } from "next/server";
import Order from "@/models/Order";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { serializeOrder } from "@/lib/serializers";
import {
  calculateDeliveryCharge,
  calculateSubtotal,
  calculateTotalWeight,
  generateOrderId,
  type Address,
  type CartItem,
} from "@/lib/data";
import { createRazorpayOrder, getRazorpayPublicConfig, isRazorpayConfigured } from "@/lib/payments/razorpay";

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error || !auth.payload) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  if (!isRazorpayConfigured()) {
    return NextResponse.json({ error: "Payment gateway is not configured" }, { status: 503 });
  }

  try {
    await connectToDatabase();

    const body = (await req.json()) as {
      items: CartItem[];
      address: Address;
    };

    const items = Array.isArray(body.items) ? body.items : [];
    if (items.length === 0 || !body.address) {
      return NextResponse.json({ error: "Invalid checkout payload" }, { status: 400 });
    }

    const subtotal = calculateSubtotal(items);
    const totalWeight = calculateTotalWeight(items);
    const deliveryCharge = calculateDeliveryCharge(totalWeight, "online");
    const total = subtotal + deliveryCharge;

    const internalId = `order_${Date.now()}`;
    const generatedOrderId = generateOrderId();

    const razorpayOrder = await createRazorpayOrder({
      amountInPaise: Math.round(total * 100),
      receipt: generatedOrderId,
      notes: {
        internalOrderId: internalId,
        userId: auth.payload.userId,
      },
    });

    const order = await Order.create({
      id: internalId,
      orderId: generatedOrderId,
      userId: auth.payload.userId,
      items,
      subtotal,
      deliveryCharge,
      total,
      paymentMethod: "online",
      paymentStatus: "pending",
      paymentGateway: "razorpay",
      paymentOrderId: razorpayOrder.id,
      orderStatus: "pending",
      shippingAddress: body.address,
    });

    const publicConfig = getRazorpayPublicConfig();
    if (!publicConfig) {
      return NextResponse.json({ error: "Payment gateway is not configured" }, { status: 503 });
    }

    return NextResponse.json(
      {
        order: serializeOrder(order.toObject()),
        razorpay: {
          keyId: publicConfig.keyId,
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          receipt: razorpayOrder.receipt,
          customerEmail: auth.payload.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to initialize payment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
