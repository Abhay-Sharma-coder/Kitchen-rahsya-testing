import { NextRequest, NextResponse } from "next/server";
import Order from "@/models/Order";
import { requireAdmin } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { serializeOrder } from "@/lib/serializers";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(req);
  if (auth.error || !auth.payload) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === "Forbidden" ? 403 : 401 });
  }

  try {
    await connectToDatabase();
    const { id } = await context.params;
    const body = (await req.json()) as Record<string, unknown>;

    const allowedUpdates = {
      orderStatus: body.orderStatus,
      paymentStatus: body.paymentStatus,
      shipment: body.shipment,
      transactionId: body.transactionId,
      updatedAt: new Date().toISOString(),
    };

    const doc = await Order.findOneAndUpdate({ id }, allowedUpdates, { new: true });
    if (!doc) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order: serializeOrder(doc.toObject()) }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update order", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
