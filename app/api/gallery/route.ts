import path from "path";
import { promises as fs } from "fs";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import Gallery from "@/models/Gallery";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await connectToDatabase();
    const gallery = await Gallery.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 }).lean();
    return NextResponse.json({ gallery }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch gallery", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth.error || !auth.payload) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === "Forbidden" ? 403 : 401 });
  }

  try {
    await connectToDatabase();

    const contentType = req.headers.get("content-type") || "";
    let url = "";
    let mediaType: "image" | "video" = "image";
    let title = "";
    let sortOrder = 0;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      mediaType = (String(formData.get("mediaType") ?? "image") === "video" ? "video" : "image");
      title = String(formData.get("title") ?? "").trim();
      sortOrder = Number(formData.get("sortOrder") ?? 0) || 0;

      if (!file) {
        return NextResponse.json({ error: "File is required" }, { status: 400 });
      }

      const extension = path.extname(file.name) || (mediaType === "video" ? ".mp4" : ".jpg");
      const fileName = `gallery-${Date.now()}-${randomUUID()}${extension}`;
      const imagesDir = path.join(process.cwd(), "public", "images");
      const filePath = path.join(imagesDir, fileName);
      const bytes = await file.arrayBuffer();

      await fs.mkdir(imagesDir, { recursive: true });
      await fs.writeFile(filePath, Buffer.from(bytes));

      url = `/images/${fileName}`;
    } else {
      const body = (await req.json()) as Record<string, unknown>;
      url = String(body.url ?? "").trim();
      mediaType = (String(body.mediaType ?? "image") === "video" ? "video" : "image");
      title = String(body.title ?? "").trim();
      sortOrder = Number(body.sortOrder ?? 0) || 0;
    }

    if (!url) {
      return NextResponse.json({ error: "Media URL is required" }, { status: 400 });
    }

    const doc = await Gallery.create({
      url,
      mediaType,
      title,
      sortOrder,
      isActive: true,
    });

    return NextResponse.json({ item: doc.toObject() }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add gallery item", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
