import { NextRequest, NextResponse } from "next/server";
import Order from "@/models/Order";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyRazorpayWebhookSignature } from "@/lib/payments/razorpay";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing webhook signature" }, { status: 400 });
    }

    const isValid = verifyRazorpayWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody) as {
      event?: string;
      payload?: {
        payment?: {
          entity?: {
            id?: string;
            order_id?: string;
            status?: string;
          };
        };
      };
    };

    const paymentEntity = event.payload?.payment?.entity;
    const paymentOrderId = paymentEntity?.order_id;
    const paymentId = paymentEntity?.id;

    if (!paymentOrderId || !paymentId) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    await connectToDatabase();

    if (event.event === "payment.captured") {
      await Order.updateOne(
        { paymentOrderId },
        {
          paymentStatus: "paid",
          orderStatus: "confirmed",
          transactionId: paymentId,
          paymentId,
          paymentCapturedAt: new Date(),
        }
      );
    }

    if (event.event === "payment.failed") {
      await Order.updateOne(
        { paymentOrderId },
        {
          paymentStatus: "failed",
          transactionId: paymentId,
          paymentId,
        }
      );
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Webhook handling failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
