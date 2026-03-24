import { NextRequest, NextResponse } from 'next/server';
import ContactLead from '@/models/ContactLead';
import { connectToDatabase } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = (await req.json()) as Record<string, unknown>;

    const name = String(body.name ?? '').trim();
    const phone = String(body.phone ?? '').trim();
    const email = String(body.email ?? '').trim().toLowerCase();
    const subject = String(body.subject ?? '').trim();
    const message = String(body.message ?? '').trim();

    if (!name || !phone || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const lead = await ContactLead.create({
      name,
      phone,
      email,
      subject,
      message,
      status: 'new',
    });

    return NextResponse.json({ lead: lead.toObject() }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to submit inquiry', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth.error || !auth.payload) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'Forbidden' ? 403 : 401 });
  }

  try {
    await connectToDatabase();
    const leads = await ContactLead.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ leads }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch inquiries', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
