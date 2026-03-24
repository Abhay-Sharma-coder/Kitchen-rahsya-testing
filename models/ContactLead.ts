import { Document, model, models, Schema } from 'mongoose';

export type ContactLeadStatus = 'new' | 'in_progress' | 'resolved';

export interface IContactLead extends Document {
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  status: ContactLeadStatus;
  createdAt: Date;
  updatedAt: Date;
}

const contactLeadSchema = new Schema<IContactLead>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 120,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
      maxlength: 30,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      maxlength: 200,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: 5000,
    },
    status: {
      type: String,
      enum: ['new', 'in_progress', 'resolved'],
      default: 'new',
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

contactLeadSchema.index({ createdAt: -1 });

const ContactLead = models.ContactLead || model<IContactLead>('ContactLead', contactLeadSchema);

export default ContactLead;
