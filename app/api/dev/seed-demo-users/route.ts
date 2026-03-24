import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';

const demoUsers = [
  {
    name: 'Admin User',
    email: 'admin@kitchenrahasya.com',
    phone: '9999999999',
    password: 'admin123',
    role: 'admin' as const,
  },
  {
    name: 'Demo Customer',
    email: 'demo@example.com',
    phone: '9876543210',
    password: 'demo123',
    role: 'customer' as const,
  },
];

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }

  try {
    await connectToDatabase();

    for (const user of demoUsers) {
      const existing = await User.findOne({ email: user.email }).select('_id');
      if (existing) {
        continue;
      }

      const hashedPassword = await bcrypt.hash(user.password, 10);
      await User.create({
        name: user.name,
        email: user.email,
        phone: user.phone,
        password: hashedPassword,
        role: user.role,
        isBlocked: false,
        addresses: [],
      });
    }

    return NextResponse.json(
      {
        success: true,
        users: [
          { email: 'admin@kitchenrahasya.com', password: 'admin123', role: 'admin' },
          { email: 'demo@example.com', password: 'demo123', role: 'customer' },
        ],
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to seed demo users', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
