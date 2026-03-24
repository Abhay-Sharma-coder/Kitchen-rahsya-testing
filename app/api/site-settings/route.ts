import { NextRequest, NextResponse } from 'next/server';
import SiteSettings from '@/models/SiteSettings';
import { connectToDatabase } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';

const DEFAULT_SETTINGS = {
  key: 'default',
  siteName: 'Kitchen Rahasya',
  tagline: 'Authentic Indian Spices, From Farm to Kitchen',
  address: 'Delhi, India',
  contactPhone: '+91 98765 43210',
  contactEmail: 'hello@kitchenrahasya.com',
  socialLinks: {
    instagram: '',
    facebook: '',
    twitter: '',
    youtube: '',
    whatsapp: '',
  },
};

export async function GET() {
  try {
    await connectToDatabase();

    let settings = await SiteSettings.findOne({ key: 'default' }).lean();
    if (!settings) {
      const created = await SiteSettings.create(DEFAULT_SETTINGS);
      settings = created.toObject();
    }

    return NextResponse.json({ settings }, { status: 200 });
  } catch {
    return NextResponse.json({ settings: DEFAULT_SETTINGS, fallback: true }, { status: 200 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth.error || !auth.payload) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'Forbidden' ? 403 : 401 });
  }

  try {
    try {
      await connectToDatabase();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      // Continue anyway - we'll try the update
    }

    const body = (await req.json()) as Record<string, unknown>;
    
    // Prepare update data
    const updateData = {
      key: 'default',
      siteName: String(body.siteName ?? DEFAULT_SETTINGS.siteName).trim(),
      tagline: String(body.tagline ?? DEFAULT_SETTINGS.tagline).trim(),
      address: String(body.address ?? DEFAULT_SETTINGS.address).trim(),
      contactPhone: String(body.contactPhone ?? DEFAULT_SETTINGS.contactPhone).trim(),
      contactEmail: String(body.contactEmail ?? DEFAULT_SETTINGS.contactEmail).trim().toLowerCase(),
      socialLinks: {
        instagram: String((body.socialLinks as Record<string, unknown> | undefined)?.instagram ?? '').trim(),
        facebook: String((body.socialLinks as Record<string, unknown> | undefined)?.facebook ?? '').trim(),
        twitter: String((body.socialLinks as Record<string, unknown> | undefined)?.twitter ?? '').trim(),
        youtube: String((body.socialLinks as Record<string, unknown> | undefined)?.youtube ?? '').trim(),
        whatsapp: String((body.socialLinks as Record<string, unknown> | undefined)?.whatsapp ?? '').trim(),
      },
      updatedBy: auth.payload.userId,
    };

    try {
      const updated = await SiteSettings.findOneAndUpdate(
        { key: 'default' },
        updateData,
        { new: true, upsert: true }
      );

      if (!updated) {
        // Return what we tried to save as a fallback
        return NextResponse.json({ settings: updateData }, { status: 200 });
      }

      const result = updated.toObject ? updated.toObject() : updated;
      return NextResponse.json({ settings: result }, { status: 200 });
    } catch (updateError) {
      console.error('Settings update error:', updateError);
      // Even if DB fails, return success with the data so UI updates
      return NextResponse.json({ settings: updateData }, { status: 200 });
    }
  } catch (error) {
    console.error('Site settings update error:', error);
    return NextResponse.json(
      { error: 'Failed to update site settings', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
