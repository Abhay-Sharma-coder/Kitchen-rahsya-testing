import crypto from "crypto";

const RAZORPAY_BASE_URL = "https://api.razorpay.com/v1";

function getRequiredEnv() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return { keyId, keySecret };
}

export function isRazorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export function getRazorpayPublicConfig() {
  const env = getRequiredEnv();
  if (!env) {
    return null;
  }

  return { keyId: env.keyId };
}

export async function createRazorpayOrder(params: {
  amountInPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}) {
  const env = getRequiredEnv();
  if (!env) {
    throw new Error("Razorpay is not configured");
  }

  const auth = Buffer.from(`${env.keyId}:${env.keySecret}`).toString("base64");

  const response = await fetch(`${RAZORPAY_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.amountInPaise,
      currency: "INR",
      receipt: params.receipt,
      notes: params.notes ?? {},
    }),
  });

  const data = (await response.json()) as Record<string, unknown>;
  if (!response.ok) {
    throw new Error(String(data.error ? JSON.stringify(data.error) : "Failed to create Razorpay order"));
  }

  return {
    id: String(data.id),
    amount: Number(data.amount),
    currency: String(data.currency ?? "INR"),
    receipt: String(data.receipt ?? params.receipt),
  };
}

export function verifyRazorpayPaymentSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const env = getRequiredEnv();
  if (!env) {
    throw new Error("Razorpay is not configured");
  }

  const payload = `${input.orderId}|${input.paymentId}`;
  const expected = crypto.createHmac("sha256", env.keySecret).update(payload).digest("hex");

  return expected === input.signature;
}

export function verifyRazorpayWebhookSignature(rawBody: string, signatureHeader: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("Missing RAZORPAY_WEBHOOK_SECRET");
  }

  const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return digest === signatureHeader;
}
