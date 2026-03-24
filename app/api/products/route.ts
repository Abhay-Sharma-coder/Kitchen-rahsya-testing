import { NextRequest, NextResponse } from "next/server";
import Product from "@/models/Product";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import { serializeProduct } from "@/lib/serializers";
import { initialProducts } from "@/lib/data";

function normalizeProductPayload(input: Record<string, unknown>) {
  const priceOptions = Array.isArray(input.priceOptions) ? input.priceOptions : [];
  const firstOption = (priceOptions[0] as Record<string, unknown> | undefined) ?? {};

  return {
    id: String(input.id || `prod_${Date.now()}`),
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

export async function GET() {
  try {
    await connectToDatabase();
    const docs = await Product.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    const products = docs.map((doc) => serializeProduct(doc as unknown as Record<string, unknown>));
    return NextResponse.json({ products }, { status: 200 });
  } catch {
    return NextResponse.json({ products: initialProducts, fallback: true }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth.error || !auth.payload) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === "Forbidden" ? 403 : 401 });
  }

  try {
    await connectToDatabase();

    const body = (await req.json()) as Record<string, unknown>;
    const payload = normalizeProductPayload(body);

    if (!payload.name || !payload.slug || !payload.category || !payload.imageUrl) {
      return NextResponse.json({ error: "Missing required product fields" }, { status: 400 });
    }

    const doc = await Product.create(payload);
    const product = serializeProduct(doc.toObject());

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create product", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
