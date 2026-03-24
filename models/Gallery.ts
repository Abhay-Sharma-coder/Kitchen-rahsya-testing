import { Document, model, models, Schema } from "mongoose";

export type GalleryMediaType = "image" | "video";

export interface IGallery extends Document {
  url: string;
  mediaType: GalleryMediaType;
  title?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const gallerySchema = new Schema<IGallery>(
  {
    url: {
      type: String,
      required: [true, "Media URL is required"],
      trim: true,
    },
    mediaType: {
      type: String,
      enum: ["image", "video"],
      required: [true, "Media type is required"],
      index: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 180,
    },
    sortOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

gallerySchema.index({ mediaType: 1, isActive: 1, sortOrder: 1, createdAt: -1 });

const Gallery = models.Gallery || model<IGallery>("Gallery", gallerySchema);

export default Gallery;
