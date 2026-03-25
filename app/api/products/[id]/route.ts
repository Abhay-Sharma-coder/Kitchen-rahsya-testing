import { NextRequest, NextResponse } from "next/server";
import Product from "@/models/Product";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import { serializeProduct } from "@/lib/serializers";

function normalizeProductPayload(input: Record<string, unknown>) {
  const priceOptions = Array.isArray(input.priceOptions) ? input.priceOptions : [];
  const firstOption = (priceOptions[0] as Record<string, unknown> | undefined) ?? {};

  return {
    name: String(input.name ?? "").trim(),
    nameHindi: String(input.nameHindi ?? "").trim(),
    slug: String(input.slug ?? "").trim().toLowerCase(),
    description: String(input.description ?? ""),
    shortDescription: String(input.shortDescription ?? ""),
    image: String(input.image ?? input.imageUrl ?? "").trim(),
    imageUrl: String(input.imageUrl ?? input.image ?? "").trim(),
    category: String(input.category ?? "").trim(),
    tags: Array.isArray(input.tags) ? input.tags : [],
    priceOptions,
    price: Number(input.price ?? firstOption.price ?? 0),
    weight: Number(input.weight ?? firstOption.weightInGrams ?? 0),
    stock: Number(
      input.stock ??
        priceOptions.reduce((sum: number, option: unknown) => {
          const entry = option as Record<string, unknown>;
          return sum + Number(entry.stock ?? 0);
        }, 0)
    ),
    isBestSeller: Boolean(input.isBestSeller ?? false),
    isTrending: Boolean(input.isTrending ?? false),
    isOrganic: Boolean(input.isOrganic ?? false),
    rating: Number(input.rating ?? 0),
    reviewCount: Number(input.reviewCount ?? 0),
    benefits: Array.isArray(input.benefits) ? input.benefits : [],
    ingredients: Array.isArray(input.ingredients) ? input.ingredients : [],
    usageTips: Array.isArray(input.usageTips) ? input.usageTips : [],
    isActive: Boolean(input.isActive ?? true),
  };
}

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await context.params;

    const doc = await Product.findOne({ id }).lean();
    if (!doc) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product: serializeProduct(doc as unknown as Record<string, unknown>) }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch product", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(req);
  if (auth.error || !auth.payload) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === "Forbidden" ? 403 : 401 });
  }

  try {
    await connectToDatabase();
    const { id } = await context.params;
    const body = (await req.json()) as Record<string, unknown>;
    const payload = normalizeProductPayload(body);
    const incomingId = String(body.id ?? "").trim();
    const productId = incomingId || id;

    const doc = await Product.findOneAndUpdate(
      { id: productId },
      { ...payload, id: productId },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ product: serializeProduct(doc.toObject()) }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update product", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(req);
  if (auth.error || !auth.payload) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === "Forbidden" ? 403 : 401 });
  }

  try {
    await connectToDatabase();
    const { id } = await context.params;
    const deleted = await Product.findOneAndDelete({ id });

    if (!deleted) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete product", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
