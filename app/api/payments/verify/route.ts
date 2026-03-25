import { NextRequest, NextResponse } from "next/server";
import Order from "@/models/Order";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { serializeOrder } from "@/lib/serializers";
import { verifyRazorpayPaymentSignature } from "@/lib/payments/razorpay";

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error || !auth.payload) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    await connectToDatabase();

    const body = (await req.json()) as {
      internalOrderId?: string;
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
    };

    const internalOrderId = String(body.internalOrderId ?? "").trim();
    const paymentOrderId = String(body.razorpay_order_id ?? "").trim();
    const paymentId = String(body.razorpay_payment_id ?? "").trim();
    const paymentSignature = String(body.razorpay_signature ?? "").trim();

    if (!internalOrderId || !paymentOrderId || !paymentId || !paymentSignature) {
      return NextResponse.json({ error: "Missing payment verification fields" }, { status: 400 });
    }

    const order = await Order.findOne({ id: internalOrderId, userId: auth.payload.userId });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.paymentOrderId !== paymentOrderId) {
      return NextResponse.json({ error: "Payment order mismatch" }, { status: 400 });
    }

    const isValid = verifyRazorpayPaymentSignature({
      orderId: paymentOrderId,
      paymentId,
      signature: paymentSignature,
    });

    if (!isValid) {
      await Order.updateOne(
        { id: internalOrderId },
        {
          paymentStatus: "failed",
          transactionId: paymentId,
          paymentId,
          paymentSignature,
        }
      );
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const updated = await Order.findOneAndUpdate(
      { id: internalOrderId },
      {
        paymentStatus: "paid",
        orderStatus: "confirmed",
        transactionId: paymentId,
        paymentId,
        paymentSignature,
        paymentCapturedAt: new Date(),
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Order not found after verification" }, { status: 404 });
    }

    return NextResponse.json({ order: serializeOrder(updated.toObject()) }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to verify payment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
