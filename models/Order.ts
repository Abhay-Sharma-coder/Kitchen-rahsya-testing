import { Document, model, models, Schema } from "mongoose";

export type ShippingStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "rto";

export type PaymentMethod = "cod" | "online";

export type PaymentStatus = "pending" | "paid" | "failed";
export type PaymentGateway = "razorpay";

export interface IOrderItem {
  productId: string;
  selectedWeight: string;
  quantity: number;
  pricePerUnit: number;
  weightInGrams: number;
}

export interface IOrder extends Document {
  id: string;
  orderId: string;
  userId: string;
  items: IOrderItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentGateway?: PaymentGateway;
  paymentOrderId?: string;
  paymentId?: string;
  paymentSignature?: string;
  paymentCapturedAt?: Date;
  orderStatus: ShippingStatus;
  shippingAddress: {
    id: string;
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
  };
  shipment?: {
    courierName: string;
    trackingId: string;
    estimatedDelivery: string;
  };
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: String,
      required: [true, "Product id is required"],
      trim: true,
    },
    selectedWeight: {
      type: String,
      required: [true, "Selected weight is required"],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    pricePerUnit: {
      type: Number,
      required: [true, "Price per unit is required"],
      min: [0, "Price per unit cannot be negative"],
    },
    weightInGrams: {
      type: Number,
      required: [true, "Weight in grams is required"],
      min: [0, "Weight in grams cannot be negative"],
    },
  },
  {
    _id: false,
  }
);

const addressSchema = new Schema(
  {
    id: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const shipmentSchema = new Schema(
  {
    courierName: { type: String, trim: true, default: "" },
    trackingId: { type: String, trim: true, default: "" },
    estimatedDelivery: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    id: {
      type: String,
      required: [true, "Order id is required"],
      unique: true,
      index: true,
      trim: true,
    },
    orderId: {
      type: String,
      required: [true, "Order number is required"],
      unique: true,
      index: true,
      trim: true,
    },
    userId: {
      type: String,
      required: [true, "User id is required"],
      index: true,
      trim: true,
    },
    items: {
      type: [orderItemSchema],
      required: [true, "Order items are required"],
      validate: {
        validator: (value: IOrderItem[]) => Array.isArray(value) && value.length > 0,
        message: "Order must include at least one product",
      },
    },
    subtotal: {
      type: Number,
      required: [true, "Subtotal is required"],
      min: [0, "Subtotal cannot be negative"],
    },
    deliveryCharge: {
      type: Number,
      required: [true, "Delivery charge is required"],
      min: [0, "Delivery charge cannot be negative"],
    },
    total: {
      type: Number,
      required: [true, "Total is required"],
      min: [0, "Total cannot be negative"],
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      required: [true, "Payment method is required"],
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
      index: true,
    },
    paymentGateway: {
      type: String,
      enum: ["razorpay"],
      required: false,
    },
    paymentOrderId: {
      type: String,
      trim: true,
      index: true,
    },
    paymentId: {
      type: String,
      trim: true,
      index: true,
    },
    paymentSignature: {
      type: String,
      trim: true,
    },
    paymentCapturedAt: {
      type: Date,
      required: false,
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "packed",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "rto",
      ],
      default: "pending",
      index: true,
    },
    shippingAddress: {
      type: addressSchema,
      required: [true, "Shipping address is required"],
    },
    shipment: {
      type: shipmentSchema,
      required: false,
    },
    transactionId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });

const Order = models.Order || model<IOrder>("Order", orderSchema);

export default Order;
