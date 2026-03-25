import { NextRequest, NextResponse } from "next/server";
import Order from "@/models/Order";
import { requireAuth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { serializeOrder } from "@/lib/serializers";
import { calculateDeliveryCharge, calculateSubtotal, calculateTotalWeight, generateOrderId, type Address, type CartItem } from "@/lib/data";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error || !auth.payload) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    await connectToDatabase();

    const query = auth.payload.role === "admin" ? {} : { userId: auth.payload.userId };
    const docs = await Order.find(query).sort({ createdAt: -1 }).lean();
    const orders = docs.map((doc) => serializeOrder(doc as unknown as Record<string, unknown>));

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch orders", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error || !auth.payload) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    await connectToDatabase();

    const body = (await req.json()) as {
      items: CartItem[];
      paymentMethod: "cod" | "online";
      address: Address;
      transactionId?: string;
    };

    const items = Array.isArray(body.items) ? body.items : [];
    if (items.length === 0 || !body.address || !body.paymentMethod) {
      return NextResponse.json({ error: "Invalid order payload" }, { status: 400 });
    }

    const subtotal = calculateSubtotal(items);
    const totalWeight = calculateTotalWeight(items);
    const deliveryCharge = calculateDeliveryCharge(totalWeight, body.paymentMethod);
    const total = subtotal + deliveryCharge;
    const isOnlinePaid = body.paymentMethod === "online" && Boolean(body.transactionId);

    const order = await Order.create({
      id: `order_${Date.now()}`,
      orderId: generateOrderId(),
      userId: auth.payload.userId,
      items,
      subtotal,
      deliveryCharge,
      total,
      paymentMethod: body.paymentMethod,
      paymentStatus: isOnlinePaid ? "paid" : "pending",
      orderStatus: isOnlinePaid ? "confirmed" : "pending",
      shippingAddress: body.address,
      transactionId: body.transactionId,
    });

    return NextResponse.json({ order: serializeOrder(order.toObject()) }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to place order", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
