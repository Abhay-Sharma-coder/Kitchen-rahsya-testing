import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/mongodb";
import { signAuthToken } from "@/lib/auth";
import { serializeUser } from "@/lib/serializers";

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const userDoc = await User.findOne({ email }).select("+password");
    if (!userDoc) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (userDoc.isBlocked) {
      return NextResponse.json({ error: "Your account is blocked" }, { status: 403 });
    }

    const validPassword = await bcrypt.compare(password, userDoc.password);
    if (!validPassword) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const user = serializeUser(userDoc.toObject());
    const token = signAuthToken({ userId: user.id, email: user.email, role: user.role });

    return NextResponse.json({ user, token }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Login failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
