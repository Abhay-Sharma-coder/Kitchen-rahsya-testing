import { Document, model, models, Schema } from "mongoose";

export interface IPriceOption {
  weight: string;
  weightInGrams: number;
  price: number;
  mrp: number;
  stock: number;
}

export interface IProduct extends Document {
  id: string;
  name: string;
  nameHindi: string;
  slug: string;
  description: string;
  shortDescription: string;
  image: string;
  price: number;
  weight: number;
  category: string;
  imageUrl: string;
  tags: string[];
  priceOptions: IPriceOption[];
  isBestSeller: boolean;
  isTrending: boolean;
  isOrganic: boolean;
  rating: number;
  reviewCount: number;
  benefits: string[];
  ingredients: string[];
  usageTips: string[];
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const priceOptionSchema = new Schema<IPriceOption>(
  {
    weight: { type: String, required: true, trim: true },
    weightInGrams: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    id: {
      type: String,
      required: [true, "Product id is required"],
      unique: true,
      index: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: 180,
      index: true,
    },
    nameHindi: {
      type: String,
      default: "",
      trim: true,
      maxlength: 180,
    },
    slug: {
      type: String,
      required: [true, "Product slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },
    shortDescription: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
    image: {
      type: String,
      required: [true, "Image is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    weight: {
      type: Number,
      required: [true, "Weight is required"],
      min: [0, "Weight cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      lowercase: true,
      index: true,
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    priceOptions: {
      type: [priceOptionSchema],
      default: [],
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    isOrganic: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    benefits: {
      type: [String],
      default: [],
    },
    ingredients: {
      type: [String],
      default: [],
    },
    usageTips: {
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
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

productSchema.index({ id: 1 }, { unique: true });
productSchema.index({ category: 1, isActive: 1 });

const Product = models.Product || model<IProduct>("Product", productSchema);

export default Product;
