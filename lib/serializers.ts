export function serializeUser(user: Record<string, unknown>) {
  return {
    id: String(user.id ?? user._id ?? ""),
    name: String(user.name ?? ""),
    email: String(user.email ?? ""),
    phone: String(user.phone ?? ""),
    role: (user.role as "admin" | "customer") ?? "customer",
    isBlocked: Boolean(user.isBlocked ?? false),
    addresses: Array.isArray(user.addresses) ? user.addresses : [],
    createdAt: new Date(user.createdAt as string | number | Date).toISOString(),
  };
}

export function serializeProduct(product: Record<string, unknown>) {
  const priceOptions = Array.isArray(product.priceOptions) ? product.priceOptions : [];
  const firstOption = priceOptions[0] as Record<string, unknown> | undefined;

  return {
    id: String(product.id ?? product._id ?? ""),
    name: String(product.name ?? ""),
    nameHindi: String(product.nameHindi ?? ""),
    slug: String(product.slug ?? ""),
    description: String(product.description ?? ""),
    shortDescription: String(product.shortDescription ?? ""),
    image: String(product.image ?? product.imageUrl ?? ""),
    imageUrl: String(product.imageUrl ?? product.image ?? ""),
    category: String(product.category ?? ""),
    tags: Array.isArray(product.tags) ? product.tags : [],
    priceOptions,
    price: Number(product.price ?? firstOption?.price ?? 0),
    weight: Number(product.weight ?? firstOption?.weightInGrams ?? 0),
    stock: Number(
      product.stock ??
        priceOptions.reduce((sum: number, option: unknown) => {
          const entry = option as Record<string, unknown>;
          return sum + Number(entry.stock ?? 0);
        }, 0)
    ),
    isBestSeller: Boolean(product.isBestSeller ?? false),
    isTrending: Boolean(product.isTrending ?? false),
    isOrganic: Boolean(product.isOrganic ?? false),
    rating: Number(product.rating ?? 0),
    reviewCount: Number(product.reviewCount ?? 0),
    benefits: Array.isArray(product.benefits) ? product.benefits : [],
    ingredients: Array.isArray(product.ingredients) ? product.ingredients : [],
    usageTips: Array.isArray(product.usageTips) ? product.usageTips : [],
    isActive: Boolean(product.isActive ?? true),
    createdAt: new Date(product.createdAt as string | number | Date).toISOString(),
    updatedAt: new Date(product.updatedAt as string | number | Date).toISOString(),
  };
}

export function serializeOrder(order: Record<string, unknown>) {
  return {
    id: String(order.id ?? order._id ?? ""),
    orderId: String(order.orderId ?? ""),
    userId: String(order.userId ?? ""),
    items: Array.isArray(order.items) ? order.items : [],
    subtotal: Number(order.subtotal ?? 0),
    deliveryCharge: Number(order.deliveryCharge ?? 0),
    total: Number(order.total ?? 0),
    paymentMethod: (order.paymentMethod as "cod" | "online") ?? "online",
    paymentStatus: (order.paymentStatus as "pending" | "paid" | "failed") ?? "pending",
    orderStatus:
      (order.orderStatus as
        | "pending"
        | "confirmed"
        | "packed"
        | "shipped"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
        | "rto") ?? "pending",
    shippingAddress: order.shippingAddress,
    shipment: order.shipment,
    transactionId: order.transactionId,
    createdAt: new Date(order.createdAt as string | number | Date).toISOString(),
    updatedAt: new Date(order.updatedAt as string | number | Date).toISOString(),
  };
}
