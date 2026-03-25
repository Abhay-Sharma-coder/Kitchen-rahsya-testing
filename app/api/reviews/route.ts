import { NextRequest, NextResponse } from "next/server";
import Review from "@/models/Review";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAuth, requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const status = searchParams.get("status");

    if (!productId) {
      return NextResponse.json({ reviews: [] }, { status: 200 });
    }

    const query: Record<string, unknown> = { productId };
    if (status && ["approved", "pending", "hidden"].includes(status)) {
      query.status = status;
    } else {
      query.status = "approved";
    }

    const reviews = await Review.find(query)
      .sort({ isHighlighted: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({ reviews }, { status: 200 });
  } catch {
    return NextResponse.json(
      { reviews: [], error: "Failed to fetch reviews" },
      { status: 200 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error || !auth.payload) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === "Forbidden" ? 403 : 401 });
  }

  try {
    await connectToDatabase();

    const body = (await req.json()) as Record<string, unknown>;
    const productId = String(body.productId ?? "").trim();
    const rating = Number(body.rating ?? 5);
    const title = String(body.title ?? "").trim();
    const content = String(body.content ?? "").trim();

    if (!productId || !title || !content || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    if (title.length > 100 || content.length > 1000) {
      return NextResponse.json(
        { error: "Title max 100 chars, content max 1000 chars" },
        { status: 400 }
      );
    }

    const sentiment = rating >= 4 ? "positive" : rating >= 3 ? "neutral" : "negative";

    const doc = await Review.create({
      productId,
      userId: auth.payload.userId,
      userName: auth.payload.userId === "admin_local" ? "Demo User" : auth.payload.userId,
      rating,
      title,
      content,
      sentiment,
      status: "pending",
      isVerified: false,
      isHighlighted: false,
    });

    return NextResponse.json({ review: doc.toObject() }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to create review",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth.error || !auth.payload) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === "Forbidden" ? 403 : 401 });
  }

  try {
    await connectToDatabase();

    const body = (await req.json()) as Record<string, unknown>;
    const reviewId = String(body.id ?? "").trim();
    const updates: Record<string, unknown> = {};

    if (body.status && ["approved", "pending", "hidden"].includes(String(body.status))) {
      updates.status = body.status;
    }
    if (typeof body.isHighlighted === "boolean") {
      updates.isHighlighted = body.isHighlighted;
    }
    if (typeof body.isVerified === "boolean") {
      updates.isVerified = body.isVerified;
    }

    if (!reviewId || Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "Review ID and at least one update field required" },
        { status: 400 }
      );
    }

    const doc = await Review.findByIdAndUpdate(reviewId, updates, { new: true });
    if (!doc) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ review: doc.toObject() }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to update review",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth.error || !auth.payload) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === "Forbidden" ? 403 : 401 });
  }

  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get("id");

    if (!reviewId) {
      return NextResponse.json({ error: "Review ID required" }, { status: 400 });
    }

    const doc = await Review.findByIdAndDelete(reviewId);
    if (!doc) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to delete review",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
