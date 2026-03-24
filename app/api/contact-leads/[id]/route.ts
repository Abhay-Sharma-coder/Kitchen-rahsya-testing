import { NextRequest, NextResponse } from 'next/server';
import ContactLead from '@/models/ContactLead';
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
    const status = String(body.status ?? 'new');

    if (!['new', 'in_progress', 'resolved'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const lead = await ContactLead.findByIdAndUpdate(id, { status }, { new: true });
    if (!lead) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    return NextResponse.json({ lead: lead.toObject() }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update inquiry', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(req);
  if (auth.error || !auth.payload) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'Forbidden' ? 403 : 401 });
  }

  try {
    await connectToDatabase();
    const { id } = await context.params;
    const deleted = await ContactLead.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete inquiry', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
