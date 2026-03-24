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
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const phone = String(body.phone ?? "").trim();
    const password = String(body.password ?? "");

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userDoc = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "customer",
      isBlocked: false,
      addresses: [],
    });

    const user = serializeUser(userDoc.toObject());
    const token = signAuthToken({ userId: user.id, email: user.email, role: user.role });

    return NextResponse.json({ user, token }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Registration failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
