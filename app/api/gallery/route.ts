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
      const bytes = await file.arrayBuffer();
      const mimeType = file.type || (mediaType === "video" ? "video/mp4" : "image/jpeg");
      const maxBytes = mediaType === "video" ? 10 * 1024 * 1024 : 5 * 1024 * 1024;

      if (bytes.byteLength === 0) {
        return NextResponse.json({ error: "Uploaded file is empty" }, { status: 400 });
      }

      if (bytes.byteLength > maxBytes) {
        return NextResponse.json(
          {
            error:
              mediaType === "video"
                ? "Video is too large. Please upload a file up to 10MB."
                : "Image is too large. Please upload a file up to 5MB.",
          },
          { status: 413 }
        );
      }

      const base64 = Buffer.from(bytes).toString("base64");
      url = `data:${mimeType};base64,${base64}`;
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
