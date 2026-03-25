import { Document, model, models, Schema } from "mongoose";

export type ReviewSentiment = "positive" | "neutral" | "negative";
export type ReviewStatus = "approved" | "pending" | "hidden";

export interface IReview extends Document {
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  isVerified: boolean;
  isHighlighted: boolean;
  sentiment: ReviewSentiment;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    productId: {
      type: String,
      required: [true, "Product ID is required"],
      index: true,
    },
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
    },
    userName: {
      type: String,
      required: [true, "User name is required"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: [true, "Review title is required"],
      trim: true,
      maxlength: 100,
    },
    content: {
      type: String,
      required: [true, "Review content is required"],
      trim: true,
      maxlength: 1000,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isHighlighted: {
      type: Boolean,
      default: false,
    },
    sentiment: {
      type: String,
      enum: ["positive", "neutral", "negative"],
      default: "neutral",
    },
    status: {
      type: String,
      enum: ["approved", "pending", "hidden"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

reviewSchema.index({ productId: 1, status: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, createdAt: -1 });

const Review = models.Review || model<IReview>("Review", reviewSchema);

export default Review;
