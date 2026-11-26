export type Role = "customer" | "admin";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export type CategoryDTO = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  position: number;
  productCount?: number;
};

export type ProductCardDTO = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  compareAtPrice: number | null;
  image: string;
  rating: number;
  reviewCount: number;
  stock: number;
  categorySlug: string;
  categoryName: string;
  featured: boolean;
};

export type ProductDetailDTO = ProductCardDTO & {
  description: string;
  images: string[];
  tags: string[];
  specs: { key: string; value: string }[];
};

export type Quote = {
  subtotal: number;
  discount: number;
  couponCode: string | null;
  shipping: number;
  tax: number;
  total: number;
};

export type CartItemDTO = {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
  unitPrice: number;
  quantity: number;
  stock: number;
  lineTotal: number;
};

export type CartDTO = {
  items: CartItemDTO[];
  itemCount: number;
  quote: Quote;
};

export type AddressDTO = {
  fullName: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  phone: string;
};

export type SavedAddressDTO = AddressDTO & {
  id: string;
  label: string;
  isDefault: boolean;
};

export type AdminProductDTO = ProductDetailDTO & {
  status: "active" | "archived";
};

export type OrderStatus =
  | "placed"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "wallet" | "cod" | "demo_card";

export type PaymentStatus = "unpaid" | "demo_authorized" | "captured" | "refunded" | "partially_refunded";

export type OrderItemDTO = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type ReturnStatus = "requested" | "approved" | "rejected";

export type ReturnItemDTO = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type ReturnDTO = {
  id: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  email: string;
  status: ReturnStatus;
  reason: string;
  items: ReturnItemDTO[];
  refundCents: number;
  createdAt: string;
  resolvedAt: string | null;
  deskNote: string;
};

export type OrderDTO = {
  id: string;
  userId: string;
  orderNumber: string;
  email: string;
  createdAt: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingAddress: AddressDTO;
  items: OrderItemDTO[];
  quote: Quote;
  refundedCents: number;
  returns?: ReturnDTO[];
};

export type PageResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ReviewDTO = {
  id: string;
  productId: string;
  userId: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
};

export type LedgerType = "grant" | "purchase" | "refund";

export type LedgerEntryDTO = {
  id: string;
  type: LedgerType;
  amountCents: number;
  balanceAfter: number;
  note: string;
  orderId: string | null;
  createdAt: string;
};

export type WalletDTO = {
  balanceCents: number;
  entries: LedgerEntryDTO[];
};

export type DeskDashboardDTO = {
  revenueCents: number;
  grossCents: number;
  refundedCents: number;
  paidOrderCount: number;
  openOrders: number;
  openReturns: number;
  lowStock: ProductCardDTO[];
  coupons: { code: string; uses: number; discountCents: number }[];
};

export type FormState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
} | null;
