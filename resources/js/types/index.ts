// ─── Global TypeScript Interfaces — EWWON COCO ───

export type Role = 'super_admin' | 'admin' | 'kasir' | 'customer';

export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    role: Role;
    avatar_url?: string | null;
    google_id?: string | null;
    merchant_id?: number | null;
    is_active: boolean;
    merchant?: Merchant;
    created_at: string;
    updated_at: string;
}

export interface Merchant {
    id: number;
    owner_id: number;
    name: string;
    slug: string;
    category: string;
    address: string;
    phone: string;
    operational_hours: Record<string, { open: string; close: string }>;
    qris_image_url?: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    receipt_header?: string | null;
    receipt_footer?: string | null;
    receipt_font_size?: number;
    receipt_paper_width?: '58mm' | '80mm';
    receipt_extra_bold?: boolean;
    receipt_left_margin?: number;
    instagram_handle?: string | null;
    whatsapp_number?: string | null;
    tiktok_handle?: string | null;
    branches?: Branch[];
}

export interface Branch {
    id: number;
    merchant_id: number;
    name: string;
    address: string;
    phone: string;
    lat?: number | null;
    lng?: number | null;
    is_active: boolean;
}

export interface ProductCategory {
    id: number;
    merchant_id: number;
    name: string;
    icon?: string | null;
    order: number;
}

export interface CustomizationOption {
    id: number;
    customization_id: number;
    name: string;
    price: number;
    is_active: boolean;
    claim_upgrade?: boolean;
}

export interface Customization {
    id: number;
    merchant_id?: number | null;
    name: string;
    type: 'single' | 'multiple';
    is_required: boolean;
    is_active: boolean;
    options?: CustomizationOption[];
}

export interface PriceOption {
    id: string;
    name: string;
    price: number;
    multiplier: number;
}

export interface Product {
    id: number;
    merchant_id: number;
    branch_id?: number | null;
    category_id?: number | null;
    name: string;
    slug: string;
    description?: string | null;
    price: number;
    price_options?: PriceOption[] | null;
    image_url?: string | null;
    barcode?: string | null;
    stock: number;
    min_stock: number;
    is_available: boolean;
    category?: ProductCategory;
    merchant?: Merchant;
    recipes?: Recipe[];
    customizations?: Customization[];
    total_sold?: number;
}

export interface Recipe {
    id: number;
    product_id: number;
    ingredient_id: number;
    quantity: number;
    created_at?: string;
    updated_at?: string;
}

export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'preparing'
    | 'ready_for_pickup'
    | 'on_delivery'
    | 'delivered'
    | 'cancelled';

export type PaymentMethod = 'qris' | 'cash' | 'manual_transfer' | 'tester' | 'gofood' | 'grabfood' | 'shopeefood';
export type PaymentStatus = 'pending' | 'confirmed' | 'failed';

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    price: number; // Alias for unit_price to fix UI errors
    subtotal: number;
    notes?: string | null;
    product?: Product;
    customizations?: CustomizationOption[] | null;
}

export interface Order {
    id: number | string;
    customer_id: number;
    merchant_id: number;
    branch_id: number;
    order_number: string;
    delivery_type: 'delivery' | 'pickup';
    status: OrderStatus;
    payment_method: PaymentMethod;
    payment_status: PaymentStatus;
    subtotal: number;
    delivery_fee: number;
    discount: number;
    total: number;
    delivery_address?: string | null;
    delivery_lat?: number | null;
    delivery_lng?: number | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;
    items?: OrderItem[];
    merchant?: Merchant;
    branch?: Branch;
    customer?: User;
    payment_proof_url?: string | null;
    delivery_request?: DeliveryRequest;
    is_online?: boolean;
}

export type DeliveryProvider = 'gosend' | 'grabexpress';
export type DeliveryStatus =
    | 'requesting'
    | 'finding_driver'
    | 'on_pickup'
    | 'on_delivery'
    | 'delivered'
    | 'cancelled';

export interface DeliveryRequest {
    id: number;
    order_id: number;
    provider: DeliveryProvider;
    provider_order_id?: string | null;
    status: DeliveryStatus;
    delivery_fee: number;
    driver_name?: string | null;
    driver_phone?: string | null;
    driver_photo?: string | null;
    driver_lat?: number | null;
    driver_lng?: number | null;
    estimated_arrival?: string | null;
    requested_at: string;
    delivered_at?: string | null;
}

export interface PosTransactionItem {
    id: number;
    transaction_id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    subtotal: number;
    product?: Product;
}

export interface PosTransaction {
    id: number;
    merchant_id: number;
    branch_id: number;
    cashier_id: number;
    shift_id?: number | null;
    transaction_number: string;
    payment_method: 'cash' | 'qris' | 'tester' | 'gofood' | 'grabfood' | 'shopeefood';
    total: number;
    cash_received?: number | null;
    change_amount?: number | null;
    transaction_at: string;
    items?: PosTransactionItem[];
    cashier?: User;
    merchant?: Merchant;
    branch?: Branch;
}

export interface PosShift {
    id: number;
    cashier_id: number;
    branch_id: number;
    opened_at: string;
    closed_at?: string | null;
    opening_cash: number;
    closing_cash?: number | null;
    void_count: number;
    is_locked: boolean;
    notes?: string | null;
    cashier?: User;
    branch?: Branch;
}

export type DiscountType = 'percent' | 'fixed';

export interface Voucher {
    id: number;
    merchant_id: number;
    code: string;
    discount_type: DiscountType;
    discount_value: number;
    min_purchase: number;
    max_discount?: number | null;
    usage_limit?: number | null;
    used_count: number;
    expires_at?: string | null;
    is_active: boolean;
}

export type LoyaltyTransactionType = 'earn' | 'redeem' | 'expired';

export interface LoyaltyPoint {
    id: number;
    customer_id: number;
    merchant_id: number;
    points: number;
    transaction_type: LoyaltyTransactionType;
    reference_type?: string | null;
    reference_id?: number | null;
    description?: string | null;
    created_at: string;
}

export interface Review {
    id: number;
    customer_id: number;
    order_id: number;
    merchant_id: number;
    rating: 1 | 2 | 3 | 4 | 5;
    comment?: string | null;
    created_at: string;
    customer?: User;
}

export interface Notification {
    id: number;
    user_id: number;
    title: string;
    body: string;
    type: string;
    data?: Record<string, unknown>;
    read_at?: string | null;
    created_at: string;
}

// ─── Inertia Page Props ───
export interface PageProps {
    auth: {
        user: User | null;
    };
    flash?: {
        success?: string;
        error?: string;
        warning?: string;
        info?: string;
    };
    site_settings: Record<string, any>;
    [key: string]: unknown;
}

// ─── Cart (client-side state) ───
export interface CartItem {
    product: Product;
    quantity: number;
    notes?: string;
    customizations?: CustomizationOption[];
}

// ─── Delivery Quote ───
export interface DeliveryQuote {
    provider: DeliveryProvider;
    fee: number;
    estimated_minutes: number;
    distance_km: number;
}
