// Kitchen Rahasya - Product Data & Types

export interface PriceOption {
  weight: string;
  weightInGrams: number;
  price: number;
  mrp: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  nameHindi: string;
  slug: string;
  description: string;
  shortDescription: string;
  image: string;
  category: string;
  tags: string[];
  priceOptions: PriceOption[];
  isBestSeller: boolean;
  isTrending: boolean;
  isOrganic: boolean;
  rating: number;
  reviewCount: number;
  benefits: string[];
  ingredients: string[];
  usageTips: string[];
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  isVerified: boolean;
  isHighlighted: boolean;
  sentiment: 'positive' | 'neutral' | 'negative';
  status: 'approved' | 'pending' | 'hidden';
  createdAt: string;
}

export interface CartItem {
  productId: string;
  selectedWeight: string;
  quantity: number;
  pricePerUnit: number;
  weightInGrams: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  isBlocked: boolean;
  addresses: Address[];
  createdAt: string;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  orderId: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: 'cod' | 'online';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentGateway?: 'razorpay';
  paymentOrderId?: string;
  paymentId?: string;
  paymentCapturedAt?: string;
  orderStatus: 'pending' | 'confirmed' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'rto';
  shippingAddress: Address;
  shipment?: {
    courierName: string;
    trackingId: string;
    estimatedDelivery: string;
  };
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

// Product Images
export const PRODUCT_IMAGES = {
  turmeric: '/images/haldi-product.jpeg',
  redChilli: '/images/mirch-product.jpeg',
  coriander: '/images/dhaniya-product.jpeg',
};

// Initial Products
export const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Turmeric Powder',
    nameHindi: 'हल्दी पाउडर',
    slug: 'turmeric-powder',
    description: 'Our premium turmeric powder is sourced from the finest farms of India, known for its vibrant golden color and high curcumin content. Perfect for adding color, flavor, and health benefits to your dishes.',
    shortDescription: 'Premium quality turmeric with high curcumin content',
    image: PRODUCT_IMAGES.turmeric,
    category: 'Spices',
    tags: ['organic', 'immunity', 'anti-inflammatory'],
    priceOptions: [
      { weight: '100g', weightInGrams: 100, price: 45, mrp: 55, stock: 150 },
      { weight: '200g', weightInGrams: 200, price: 85, mrp: 105, stock: 120 },
      { weight: '500g', weightInGrams: 500, price: 199, mrp: 250, stock: 80 },
    ],
    isBestSeller: true,
    isTrending: true,
    isOrganic: true,
    rating: 4.8,
    reviewCount: 256,
    benefits: [
      'Rich in curcumin - powerful antioxidant',
      'Supports immune system',
      'Natural anti-inflammatory properties',
      'Enhances skin glow',
    ],
    ingredients: ['100% Pure Turmeric (Curcuma longa)'],
    usageTips: [
      'Add to curries for authentic Indian flavor',
      'Mix with warm milk for golden milk',
      'Use in marinades for meat and vegetables',
    ],
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Red Chilli Powder',
    nameHindi: 'लाल मिर्च पाउडर',
    slug: 'red-chilli-powder',
    description: 'Authentic red chilli powder made from handpicked Guntur chillies, known for their perfect balance of heat and flavor. Adds rich color and spiciness to your dishes.',
    shortDescription: 'Fiery red chilli with perfect heat balance',
    image: PRODUCT_IMAGES.redChilli,
    category: 'Spices',
    tags: ['spicy', 'metabolism', 'authentic'],
    priceOptions: [
      { weight: '100g', weightInGrams: 100, price: 55, mrp: 70, stock: 130 },
      { weight: '200g', weightInGrams: 200, price: 105, mrp: 135, stock: 100 },
      { weight: '500g', weightInGrams: 500, price: 249, mrp: 320, stock: 60 },
    ],
    isBestSeller: true,
    isTrending: false,
    isOrganic: true,
    rating: 4.7,
    reviewCount: 189,
    benefits: [
      'Boosts metabolism',
      'Rich in Vitamin C',
      'Adds vibrant color to dishes',
      'Natural preservative properties',
    ],
    ingredients: ['100% Pure Guntur Red Chillies'],
    usageTips: [
      'Use sparingly - a little goes a long way',
      'Add to curries, dals, and gravies',
      'Perfect for making spicy chutneys',
    ],
    createdAt: '2024-01-01',
  },
  {
    id: '3',
    name: 'Coriander Powder',
    nameHindi: 'धनिया पाउडर',
    slug: 'coriander-powder',
    description: 'Freshly ground coriander powder with an aromatic flavor profile. Made from premium quality coriander seeds that add depth and warmth to your cooking.',
    shortDescription: 'Aromatic coriander for authentic flavor',
    image: PRODUCT_IMAGES.coriander,
    category: 'Spices',
    tags: ['aromatic', 'digestive', 'essential'],
    priceOptions: [
      { weight: '100g', weightInGrams: 100, price: 40, mrp: 50, stock: 140 },
      { weight: '200g', weightInGrams: 200, price: 75, mrp: 95, stock: 110 },
      { weight: '500g', weightInGrams: 500, price: 175, mrp: 225, stock: 70 },
    ],
    isBestSeller: false,
    isTrending: true,
    isOrganic: true,
    rating: 4.6,
    reviewCount: 142,
    benefits: [
      'Aids digestion',
      'Rich in antioxidants',
      'Essential in Indian cooking',
      'Natural cooling properties',
    ],
    ingredients: ['100% Pure Coriander Seeds (Coriandrum sativum)'],
    usageTips: [
      'Base spice for most Indian curries',
      'Combine with cumin for classic flavor',
      'Add to marinades and spice rubs',
    ],
    createdAt: '2024-01-01',
  },
];

// Initial Reviews
export const initialReviews: Review[] = [
  {
    id: 'r1',
    productId: '1',
    userId: 'u1',
    userName: 'Priya Sharma',
    rating: 5,
    title: 'Best turmeric I have ever used!',
    content: 'The color and aroma are amazing. You can tell it is pure and high quality. My golden milk tastes so much better now.',
    isVerified: true,
    isHighlighted: true,
    sentiment: 'positive',
    status: 'approved',
    createdAt: '2024-02-15',
  },
  {
    id: 'r2',
    productId: '1',
    userId: 'u2',
    userName: 'Rajesh Kumar',
    rating: 4,
    title: 'Good quality product',
    content: 'Nice turmeric powder with good color. Packaging could be better but overall satisfied with the purchase.',
    isVerified: true,
    isHighlighted: false,
    sentiment: 'positive',
    status: 'approved',
    createdAt: '2024-02-20',
  },
  {
    id: 'r3',
    productId: '2',
    userId: 'u3',
    userName: 'Meena Patel',
    rating: 5,
    title: 'Perfect spice level!',
    content: 'Not too hot, not too mild. Perfect balance of heat and flavor. My family loves it!',
    isVerified: true,
    isHighlighted: true,
    sentiment: 'positive',
    status: 'approved',
    createdAt: '2024-03-01',
  },
  {
    id: 'r4',
    productId: '3',
    userId: 'u4',
    userName: 'Amit Verma',
    rating: 5,
    title: 'Fresh and aromatic',
    content: 'The aroma when you open the packet is wonderful. Makes a huge difference in my cooking.',
    isVerified: true,
    isHighlighted: false,
    sentiment: 'positive',
    status: 'approved',
    createdAt: '2024-03-10',
  },
  {
    id: 'r5',
    productId: '1',
    userId: 'u5',
    userName: 'Sanjay Mehta',
    rating: 3,
    title: 'Average quality',
    content: 'The turmeric is okay but nothing special. Expected better for the price. Will try other brands.',
    isVerified: true,
    isHighlighted: false,
    sentiment: 'neutral',
    status: 'pending',
    createdAt: '2024-03-15',
  },
  {
    id: 'r6',
    productId: '2',
    userId: 'u6',
    userName: 'Kavita Singh',
    rating: 5,
    title: 'Excellent red chilli!',
    content: 'This is the best red chilli powder I have used. The color is vibrant and the taste is authentic. Highly recommend!',
    isVerified: true,
    isHighlighted: false,
    sentiment: 'positive',
    status: 'pending',
    createdAt: '2024-03-18',
  },
  {
    id: 'r7',
    productId: '3',
    userId: 'u7',
    userName: 'Deepak Joshi',
    rating: 2,
    title: 'Not fresh',
    content: 'The coriander powder did not smell fresh. Seemed like old stock. Disappointed with this purchase.',
    isVerified: false,
    isHighlighted: false,
    sentiment: 'negative',
    status: 'pending',
    createdAt: '2024-03-20',
  },
];

// Initial Demo Orders
export const initialOrders: Order[] = [
  {
    id: 'order_1',
    orderId: 'KR2024A1B2C3',
    userId: 'user1',
    items: [
      { productId: '1', selectedWeight: '200g', quantity: 2, pricePerUnit: 85, weightInGrams: 200 },
      { productId: '2', selectedWeight: '100g', quantity: 1, pricePerUnit: 55, weightInGrams: 100 },
    ],
    subtotal: 225,
    deliveryCharge: 60,
    total: 285,
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    orderStatus: 'pending',
    shippingAddress: {
      id: 'addr1',
      name: 'Rahul Sharma',
      phone: '9876543210',
      addressLine1: '123, Gandhi Nagar',
      addressLine2: 'Near City Mall',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      isDefault: true,
    },
    createdAt: '2024-03-20T10:30:00Z',
    updatedAt: '2024-03-20T10:30:00Z',
  },
  {
    id: 'order_2',
    orderId: 'KR2024D4E5F6',
    userId: 'user2',
    items: [
      { productId: '3', selectedWeight: '500g', quantity: 1, pricePerUnit: 175, weightInGrams: 500 },
    ],
    subtotal: 175,
    deliveryCharge: 30,
    total: 205,
    paymentMethod: 'online',
    paymentStatus: 'paid',
    orderStatus: 'confirmed',
    shippingAddress: {
      id: 'addr2',
      name: 'Anita Devi',
      phone: '9988776655',
      addressLine1: '456, Shanti Nagar',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      isDefault: true,
    },
    createdAt: '2024-03-19T14:20:00Z',
    updatedAt: '2024-03-19T15:00:00Z',
  },
  {
    id: 'order_3',
    orderId: 'KR2024G7H8I9',
    userId: 'user3',
    items: [
      { productId: '1', selectedWeight: '500g', quantity: 1, pricePerUnit: 199, weightInGrams: 500 },
      { productId: '2', selectedWeight: '500g', quantity: 1, pricePerUnit: 249, weightInGrams: 500 },
      { productId: '3', selectedWeight: '200g', quantity: 2, pricePerUnit: 75, weightInGrams: 200 },
    ],
    subtotal: 598,
    deliveryCharge: 90,
    total: 688,
    paymentMethod: 'online',
    paymentStatus: 'paid',
    orderStatus: 'shipped',
    shippingAddress: {
      id: 'addr3',
      name: 'Vijay Kumar',
      phone: '9112233445',
      addressLine1: '789, MG Road',
      addressLine2: 'Opp. Central Park',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      isDefault: true,
    },
    shipment: {
      courierName: 'Delhivery',
      trackingId: 'DLV123456789',
      estimatedDelivery: 'March 25, 2024',
    },
    createdAt: '2024-03-18T09:15:00Z',
    updatedAt: '2024-03-20T11:00:00Z',
  },
  {
    id: 'order_4',
    orderId: 'KR2024J0K1L2',
    userId: 'user4',
    items: [
      { productId: '1', selectedWeight: '100g', quantity: 3, pricePerUnit: 45, weightInGrams: 100 },
    ],
    subtotal: 135,
    deliveryCharge: 30,
    total: 165,
    paymentMethod: 'online',
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    shippingAddress: {
      id: 'addr4',
      name: 'Sneha Reddy',
      phone: '9223344556',
      addressLine1: '321, Lake View Colony',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500001',
      isDefault: true,
    },
    shipment: {
      courierName: 'BlueDart',
      trackingId: 'BD987654321',
      estimatedDelivery: 'March 15, 2024',
    },
    createdAt: '2024-03-10T16:45:00Z',
    updatedAt: '2024-03-15T12:30:00Z',
  },
  {
    id: 'order_5',
    orderId: 'KR2024M3N4O5',
    userId: 'user5',
    items: [
      { productId: '2', selectedWeight: '200g', quantity: 1, pricePerUnit: 105, weightInGrams: 200 },
    ],
    subtotal: 105,
    deliveryCharge: 60,
    total: 165,
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    orderStatus: 'packed',
    shippingAddress: {
      id: 'addr5',
      name: 'Manish Gupta',
      phone: '9334455667',
      addressLine1: '654, Civil Lines',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302001',
      isDefault: true,
    },
    createdAt: '2024-03-19T08:00:00Z',
    updatedAt: '2024-03-20T09:30:00Z',
  },
];

// Testimonials
export const testimonials = [
  {
    id: 't1',
    name: 'Sunita Devi',
    location: 'Delhi',
    content: 'Kitchen Rahasya has transformed my cooking. The spices are so fresh and aromatic, just like what my grandmother used to get from the village.',
    rating: 5,
    image: '/testimonials/user1.jpg',
  },
  {
    id: 't2',
    name: 'Vikram Singh',
    location: 'Mumbai',
    content: 'Finally found spices that taste authentic! The turmeric especially has such a rich color. Highly recommend to anyone who loves real Indian cooking.',
    rating: 5,
    image: '/testimonials/user2.jpg',
  },
  {
    id: 't3',
    name: 'Lakshmi Iyer',
    location: 'Chennai',
    content: 'Been ordering for 6 months now. The quality is consistent and delivery is always on time. Best spice brand I have found online.',
    rating: 5,
    image: '/testimonials/user3.jpg',
  },
];

// Delivery charge calculation
export const DELIVERY_RATES = {
  cod: 60, // per 500g
  online: 30, // per 500g
};

export function calculateDeliveryCharge(totalWeightInGrams: number, paymentMethod: 'cod' | 'online'): number {
  const units = Math.ceil(totalWeightInGrams / 500);
  return units * DELIVERY_RATES[paymentMethod];
}

export function calculateTotalWeight(items: CartItem[]): number {
  return items.reduce((total, item) => total + (item.weightInGrams * item.quantity), 0);
}

export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + (item.pricePerUnit * item.quantity), 0);
}

export function formatPrice(price: number): string {
  return `₹${price.toLocaleString('en-IN')}`;
}

export function formatWeight(weightInGrams: number): string {
  if (weightInGrams >= 1000) {
    return `${(weightInGrams / 1000).toFixed(1)}kg`;
  }
  return `${weightInGrams}g`;
}

// Generate Order ID
export function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `KR${timestamp}${random}`;
}
