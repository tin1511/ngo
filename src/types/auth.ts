export interface Voucher {
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  desc: string;
  minOrderTotal?: number;
  active: boolean;
}

export const DEFAULT_VOUCHERS: Voucher[] = [
  {
    code: 'MOCGO10',
    discountPercent: 10,
    desc: 'Giảm 10% tri ân khách hàng mua đồ gỗ custom',
    minOrderTotal: 0,
    active: true,
  },
  {
    code: 'KHACLASER20',
    discountAmount: 30000,
    desc: 'Giảm 30.000đ cho đơn ảnh chân dung & tranh gỗ',
    minOrderTotal: 100000,
    active: true,
  },
  {
    code: 'FREESHIP',
    discountAmount: 30000,
    desc: 'Miễn phí vận chuyển 30.000đ toàn quốc',
    minOrderTotal: 0,
    active: true,
  },
];

export interface ProductReview {
  id: string;
  productId: string;
  orderId?: string;
  customerName: string;
  customerPhone?: string;
  customerUsername?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  village?: string;
  price: number;
  quantity: number;
  engravingNote?: string;
  noteImages?: string[];
}

export type OrderStatus = 'Mới tiếp nhận' | 'Đang xử lý' | 'Đang giao hàng' | 'Đã hoàn thành' | 'Đã hủy';

export interface Order {
  id: string;
  userId?: string;
  username?: string;
  userEmail?: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  promoCode?: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
  deliveredAt?: string;
  engravingNote?: string;
  notes?: string;
  noteImages?: string[];
  // 7-Day Return / Exchange policy fields
  returnRequested?: boolean;
  returnReason?: string;
  returnRequestedAt?: string;
  returnStatus?: 'pending' | 'approved' | 'rejected';
  adminReturnNote?: string;
  returnImages?: string[];
}

export interface UserAccount {
  username: string;
  name: string;
  role: 'admin' | 'user';
  email?: string;
  avatar?: string;
}

export const DEFAULT_ADMIN: UserAccount = {
  username: 'admin',
  name: 'Quản Trị Viên (Admin)',
  role: 'admin',
  email: 'admin@bansacviet.vn',
  avatar: '👑'
};

export interface HeaderConfig {
  announcementText: string;
  brandTitle: string;
  brandTagline: string;
  searchPlaceholder: string;
}

export const DEFAULT_HEADER_CONFIG: HeaderConfig = {
  announcementText: 'Miễn phí khắc tên & thiết kế demo theo yêu cầu • Nhập mã MOCGO10 giảm ngay 10%',
  brandTitle: 'MỘC ĐIÊU',
  brandTagline: 'Khắc Gỗ Laser Theo Yêu Cầu',
  searchPlaceholder: 'Tìm kiếm tinh hoa...',
};

export interface FooterConfig {
  brandName: string;
  brandSub: string;
  brandDesc: string;
  address: string;
  phone: string;
  email: string;
  copyright: string;
  benefit1Title: string;
  benefit1Desc: string;
  benefit2Title: string;
  benefit2Desc: string;
  benefit3Title: string;
  benefit3Desc: string;
  facebookUrl?: string;
  zaloUrl?: string;
}

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  brandName: 'MỘC ĐIÊU',
  brandSub: 'Khắc Gỗ Laser Theo Yêu Cầu',
  brandDesc: 'Xưởng chế tác móc khóa gỗ, tranh/ảnh chân dung khắc laser, thước gỗ học sinh, quà tặng gỗ cá nhân hóa theo yêu cầu uy tín toàn quốc.',
  address: 'Số 18 Làng Nghề Mộc Kim Bồng, Hội An & Hà Nội',
  phone: '0901 888 999 (8:00 - 22:00)',
  email: 'contact@mocdieu.vn',
  copyright: '© 2026 BẢN SẮC VIỆT • TINH HOA LÀNG NGHỀ',
  benefit1Title: 'Giao Hàng Toàn Quốc',
  benefit1Desc: 'Đóng gói an toàn, miễn phí cho đơn hàng trên 1.000.000đ',
  benefit2Title: 'Xác Thực Làng Nghề',
  benefit2Desc: 'Cam kết 100% nguyên liệu tự nhiên và nghệ nhân thủ công',
  benefit3Title: 'Đổi Trả 7 Ngày An Tâm',
  benefit3Desc: 'Miễn phí 1-đổi-1 trong vòng 7 ngày tính từ khi nhận hàng nếu sản phẩm lỗi hoặc vỡ hỏng',
  facebookUrl: 'https://facebook.com',
  zaloUrl: 'https://zalo.me',
};

export interface ShippingConfig {
  defaultShippingFee: number;
  freeShippingThreshold: number;
  shippingNote?: string;
}

export const DEFAULT_SHIPPING_CONFIG: ShippingConfig = {
  defaultShippingFee: 40000,
  freeShippingThreshold: 1000000,
  shippingNote: 'Miễn phí giao hàng toàn quốc cho đơn từ 1.000.000đ',
};

