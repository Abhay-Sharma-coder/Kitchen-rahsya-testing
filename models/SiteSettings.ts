import { Document, model, models, Schema } from 'mongoose';

export interface ISocialLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
  whatsapp?: string;
}

export interface ISiteSettings extends Document {
  key: string;
  siteName: string;
  tagline: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  socialLinks: ISocialLinks;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const socialLinksSchema = new Schema<ISocialLinks>(
  {
    instagram: { type: String, trim: true, default: '' },
    facebook: { type: String, trim: true, default: '' },
    twitter: { type: String, trim: true, default: '' },
    youtube: { type: String, trim: true, default: '' },
    whatsapp: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const siteSettingsSchema = new Schema<ISiteSettings>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'default',
      index: true,
    },
    siteName: {
      type: String,
      default: 'Kitchen Rahasya',
      trim: true,
    },
    tagline: {
      type: String,
      default: 'Authentic Indian Spices, From Farm to Kitchen',
      trim: true,
    },
    address: {
      type: String,
      default: 'Delhi, India',
      trim: true,
    },
    contactPhone: {
      type: String,
      default: '+91 98765 43210',
      trim: true,
    },
    contactEmail: {
      type: String,
      default: 'hello@kitchenrahasya.com',
      trim: true,
      lowercase: true,
    },
    socialLinks: {
      type: socialLinksSchema,
      default: {},
    },
    updatedBy: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const SiteSettings = models.SiteSettings || model<ISiteSettings>('SiteSettings', siteSettingsSchema);

export default SiteSettings;
