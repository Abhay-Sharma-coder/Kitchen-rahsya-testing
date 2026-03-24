import { NextRequest, NextResponse } from "next/server";
import Gallery from "@/models/Gallery";
import { requireAdmin } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(req);
  if (auth.error || !auth.payload) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === "Forbidden" ? 403 : 401 });
  }

  try {
    await connectToDatabase();
    const { id } = await context.params;

    const deleted = await Gallery.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Gallery item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete gallery item", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
