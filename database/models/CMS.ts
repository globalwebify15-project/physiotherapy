import mongoose, { Schema, Document } from 'mongoose';

export interface ICMS extends Document {
  key: string; // e.g., 'homepage_banners', 'testimonials', 'faqs', 'about_clinic', 'contact_details'
  content: any; // Freeform JSON content
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CMSSchema: Schema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    content: { type: Schema.Types.Mixed, required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const CMS = mongoose.models.CMS || mongoose.model<ICMS>('CMS', CMSSchema);
