import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(req);
  if (auth.error || !auth.payload) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'Forbidden' ? 403 : 401 });
  }

  try {
    await connectToDatabase();
    const { id } = await context.params;
    const body = (await req.json()) as Record<string, unknown>;

    const updatePayload: Record<string, unknown> = {};

    if (typeof body.isBlocked === 'boolean') {
      updatePayload.isBlocked = body.isBlocked;
    }
    if (body.role === 'admin' || body.role === 'customer') {
      updatePayload.role = body.role;
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: 'No valid update fields provided' }, { status: 400 });
    }

    const updated = await User.findByIdAndUpdate(id, updatePayload, { new: true, projection: { password: 0 } }).lean();

    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
