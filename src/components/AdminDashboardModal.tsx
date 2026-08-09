import React, { useState } from 'react';
import {
  X,
  Package,
  Plus,
  Trash2,
  CheckCircle,
  CheckCircle2,
  TrendingUp,
  Users,
  User,
  Phone,
  Clock,
  Search,
  Tag,
  MapPin,
  Image as ImageIcon,
  ShieldCheck,
  Edit3,
  Upload,
  DollarSign,
  ShoppingBag,
  Archive,
  BarChart2,
  Award,
  ArrowUpRight,
  Box,
  ArrowLeft,
  Video,
  Film,
  Globe,
  Save,
  Sparkles,
  AlertCircle,
  Filter,
  Ticket,
  RefreshCw,
  Truck,
  Mail,
  Send,
  Inbox,
} from 'lucide-react';
import { Star, MessageSquare } from 'lucide-react';
import { Product, REGIONS_INFO, CATEGORIES_INFO } from '../data/products';
import { UserAccount, FooterConfig, DEFAULT_FOOTER_CONFIG, HeaderConfig, DEFAULT_HEADER_CONFIG, ShippingConfig, DEFAULT_SHIPPING_CONFIG, Order, OrderStatus, Voucher, DEFAULT_VOUCHERS, ProductReview } from '../types/auth';
import { getEmailConfig, saveEmailConfig, sendOrderNotificationToAdmin } from '../lib/emailService';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserAccount | null;
  onOpenAuth?: () => void;
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onRequestDelete?: (product: Product) => void;
  onToggleStock: (id: string) => void;
  footerConfig?: FooterConfig;
  onSaveFooterConfig?: (config: FooterConfig) => void;
  headerConfig?: HeaderConfig;
  onSaveHeaderConfig?: (config: HeaderConfig) => void;
  shippingConfig?: ShippingConfig;
  onSaveShippingConfig?: (config: ShippingConfig) => void;
  orders?: Order[];
  reviews?: ProductReview[];
  onUpdateOrderStatus?: (orderId: string, status: OrderStatus, notes?: string) => Promise<void> | void;
  onDeleteOrder?: (orderId: string) => Promise<void> | void;
  vouchers?: Voucher[];
  onSaveVouchers?: (vouchers: Voucher[]) => Promise<void> | void;
  onResetStats?: () => Promise<void> | void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAuth,
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onRequestDelete,
  onToggleStock,
  footerConfig,
  onSaveFooterConfig,
  headerConfig,
  onSaveHeaderConfig,
  shippingConfig,
  onSaveShippingConfig,
  orders = [],
  reviews = [],
  onUpdateOrderStatus,
  onDeleteOrder,
  vouchers = DEFAULT_VOUCHERS,
  onSaveVouchers,
  onResetStats,
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'orders' | 'reviews' | 'vouchers' | 'header' | 'footer' | 'shipping' | 'email'>('stats');
  const [productSubMode, setProductSubMode] = useState<'list' | 'form'>('list');
  const [searchFilter, setSearchFilter] = useState('');
  const [orderSearchFilter, setOrderSearchFilter] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [previewImageModalUrl, setPreviewImageModalUrl] = useState<string | null>(null);
  const [orderToDeleteId, setOrderToDeleteId] = useState<string | null>(null);
  const [isConfirmingResetStats, setIsConfirmingResetStats] = useState<boolean>(false);

  // Admin Email & EmailJS config state
  const [adminEmail, setAdminEmail] = useState('btin2499@gmail.com');
  const [emailServiceId, setEmailServiceId] = useState('');
  const [emailTemplateId, setEmailTemplateId] = useState('');
  const [emailPublicKey, setEmailPublicKey] = useState('');
  const [isSendingTestMail, setIsSendingTestMail] = useState(false);

  React.useEffect(() => {
    const cfg = getEmailConfig();
    setAdminEmail(cfg.adminEmail || 'btin2499@gmail.com');
    setEmailServiceId(cfg.serviceId || '');
    setEmailTemplateId(cfg.templateId || '');
    setEmailPublicKey(cfg.publicKey || '');
  }, []);

  // Vouchers state
  const [vouchersList, setVouchersList] = useState<Voucher[]>(vouchers || DEFAULT_VOUCHERS);
  const [newVoucherCode, setNewVoucherCode] = useState('');
  const [newVoucherPercent, setNewVoucherPercent] = useState('10');
  const [newVoucherAmount, setNewVoucherAmount] = useState('0');
  const [newVoucherDesc, setNewVoucherDesc] = useState('');

  React.useEffect(() => {
    if (vouchers) {
      setVouchersList(vouchers);
    }
  }, [vouchers]);

  const [headerForm, setHeaderForm] = useState<HeaderConfig>(() => ({
    ...DEFAULT_HEADER_CONFIG,
    ...headerConfig,
  }));

  React.useEffect(() => {
    if (headerConfig) {
      setHeaderForm({ ...DEFAULT_HEADER_CONFIG, ...headerConfig });
    }
  }, [headerConfig]);

  const [footerForm, setFooterForm] = useState<FooterConfig>(() => ({
    ...DEFAULT_FOOTER_CONFIG,
    ...footerConfig,
  }));

  React.useEffect(() => {
    if (footerConfig) {
      setFooterForm({ ...DEFAULT_FOOTER_CONFIG, ...footerConfig });
    }
  }, [footerConfig]);

  const [shippingForm, setShippingForm] = useState<ShippingConfig>(() => ({
    ...DEFAULT_SHIPPING_CONFIG,
    ...shippingConfig,
  }));

  React.useEffect(() => {
    if (shippingConfig) {
      setShippingForm({ ...DEFAULT_SHIPPING_CONFIG, ...shippingConfig });
    }
  }, [shippingConfig]);


  // Editing product state (if null, creating new)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state for adding/editing product
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES_INFO[1]?.id || 'moc-khoa');
  const [region, setRegion] = useState('mien-bac');
  const [village, setVillage] = useState('');
  const [province, setProvince] = useState('');
  const [price, setPrice] = useState('45000');
  const [originalPrice, setOriginalPrice] = useState('65000');
  const [shortDesc, setShortDesc] = useState('');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=800'
  );
  const [inStock, setInStock] = useState(true);
  const [artisanName, setArtisanName] = useState('Nghệ nhân Mộc');
  const [artisanStory, setArtisanStory] = useState(
    'Chế tác và khắc laser tỉ mỉ theo yêu cầu cá nhân hóa.'
  );
  const [videoUrl, setVideoUrl] = useState('');

  if (!isOpen) return null;

  // Access control check: Only Admin can access product management
  if (currentUser?.role !== 'admin') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2926]/70 backdrop-blur-sm animate-fadeIn">
        <div className="relative w-full max-w-md bg-[#FDFBF7] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#EAE7E2] text-center space-y-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#8C877E] hover:text-[#2D2926] rounded-full hover:bg-[#F0EDE9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 bg-[#8B4513]/10 text-[#8B4513] rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold font-serif-vi text-[#2D2926]">Yêu Cầu Quyền Admin</h3>
          <p className="text-xs text-[#6B665E] leading-relaxed">
            Chức năng quản lý sản phẩm (Thêm, Sửa, Xóa, Tạm hết hàng) chỉ dành riêng cho tài khoản Quản trị viên (Admin). Vui lòng đăng nhập tài khoản Quản trị viên để tiếp tục.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-full border border-[#DEDAD2] text-xs font-bold text-[#6B665E] hover:bg-[#F0EDE9]"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                onClose();
                if (onOpenAuth) onOpenAuth();
              }}
              className="flex-1 py-2.5 px-4 rounded-full bg-[#8B4513] hover:bg-[#6E360F] text-white text-xs font-bold uppercase tracking-wider shadow-sm"
            >
              Đăng Nhập Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  const resetForm = () => {
    setEditingProduct(null);
    setName('');
    setCategory(CATEGORIES_INFO[1]?.id || 'moc-khoa');
    setRegion('mien-bac');
    setVillage('');
    setProvince('');
    setPrice('45000');
    setOriginalPrice('65000');
    setShortDesc('');
    setImageUrl('https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=800');
    setVideoUrl('');
    setInStock(true);
    setArtisanName('Nghệ nhân Mộc');
    setArtisanStory('Chế tác và khắc laser tỉ mỉ theo yêu cầu cá nhân hóa.');
  };

  const handleEditClick = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setRegion(p.region);
    setVillage(p.village);
    setProvince(p.province);
    setPrice(String(p.price));
    setOriginalPrice(p.originalPrice ? String(p.originalPrice) : '');
    setShortDesc(p.shortDesc);
    setImageUrl(p.imageUrl);
    setVideoUrl(p.videoUrl || '');
    setInStock(p.inStock);
    setArtisanName(p.artisanName || 'Nghệ nhân Việt');
    setArtisanStory(p.artisanStory || '');
    setActiveTab('products');
    setProductSubMode('form');
  };

  const compressImageFile = (
    file: File,
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.75
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = (err) => reject(err);
        img.src = event.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMessage({
        text: 'Vui lòng chọn tệp định dạng hình ảnh (JPG, PNG, WEBP...)',
        type: 'error',
      });
      return;
    }

    try {
      setStatusMessage({
        text: 'Đang tự động nén & tối ưu hóa dung lượng ảnh...',
        type: 'success',
      });

      const compressedBase64 = await compressImageFile(file, 800, 800, 0.75);
      setImageUrl(compressedBase64);
      setStatusMessage({
        text: 'Đã tải và tối ưu dung lượng ảnh thành công (sẵn sàng lưu Cloud)!',
        type: 'success',
      });
    } catch (err) {
      console.error('Lỗi nén ảnh:', err);
      setStatusMessage({
        text: 'Không thể xử lý hình ảnh này. Vui lòng chọn ảnh khác hoặc dùng link URL.',
        type: 'error',
      });
    }
  };

  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setStatusMessage({
        text: 'Vui lòng chọn tệp định dạng video (MP4, WEBM, MOV...)',
        type: 'error',
      });
      return;
    }

    if (file.size > 900 * 1024) {
      setStatusMessage({
        text: `Tệp video quá lớn (${(file.size / (1024 * 1024)).toFixed(1)}MB). Dung lượng tối đa lưu trữ Cloud trực tiếp là 900KB. Vui lòng chọn tệp video ngắn/nhẹ hơn hoặc dán link URL video từ internet.`,
        type: 'error',
      });
      return;
    }

    setStatusMessage({
      text: 'Đang tải video từ máy lên...',
      type: 'success',
    });

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setVideoUrl(reader.result as string);
        setStatusMessage({
          text: 'Đã tải tệp video từ máy lên thành công (Dành riêng cho Admin)!',
          type: 'success',
        });
      }
    };
    reader.onerror = () => {
      setStatusMessage({
        text: 'Không thể đọc tệp video này. Vui lòng thử lại.',
        type: 'error',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      setStatusMessage({
        text: 'Vui lòng điền đầy đủ tên và giá sản phẩm',
        type: 'error',
      });
      return;
    }

    if (imageUrl && imageUrl.startsWith('data:') && imageUrl.length > 900000) {
      setStatusMessage({
        text: 'Ảnh có dung lượng quá lớn (>900KB). Vui lòng chọn ảnh khác hoặc tải lên tệp ảnh để được tự động nén.',
        type: 'error',
      });
      return;
    }

    if (editingProduct) {
      const updatedProduct: Product = {
        ...editingProduct,
        name: name.trim(),
        category: category as Product['category'],
        region: region as Product['region'],
        price: Number(price) || 500000,
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        imageUrl,
        videoUrl: videoUrl.trim() || undefined,
        village: village.trim() || 'Mộc Điêu',
        province: province.trim() || 'Việt Nam',
        inStock,
        shortDesc: shortDesc.trim() || 'Tác phẩm thủ công mỹ nghệ cao cấp.',
        artisanName: artisanName.trim() || 'Nghệ nhân bản địa',
        artisanStory:
          artisanStory.trim() || 'Tác phẩm thủ công truyền thống mang đậm bản sắc văn hóa Việt Nam.',
      };

      onUpdateProduct(updatedProduct);
      setStatusMessage({
        text: `Đã cập nhật sản phẩm "${updatedProduct.name}" thành công!`,
        type: 'success',
      });
    } else {
      const newProduct: Product = {
        id: 'prod-' + Date.now(),
        name: name.trim(),
        category: (category || 'tat-ca') as Product['category'],
        region: (region || 'mien-bac') as Product['region'],
        price: Number(price) || 500000,
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        imageUrl,
        videoUrl: videoUrl.trim() || undefined,
        village: village.trim() || 'Mộc Điêu',
        province: province.trim() || 'Việt Nam',
        rating: 5.0,
        reviewsCount: 1,
        inStock,
        description: shortDesc.trim() || 'Tác phẩm thủ công mỹ nghệ tinh xảo được chế tác tỉ mỉ từ gỗ tự nhiên.',
        emoji: '🪵',
        shortDesc: shortDesc.trim() || 'Tác phẩm thủ công mỹ nghệ cao cấp.',
        artisanName: artisanName.trim() || 'Nghệ nhân bản địa',
        artisanStory:
          artisanStory.trim() || 'Tác phẩm thủ công truyền thống mang đậm bản sắc văn hóa Việt Nam.',
        features: ['Gỗ tự nhiên 100%', 'Khắc laser HD chính xác'],
      };

      onAddProduct(newProduct);
      setStatusMessage({
        text: `Đã thêm sản phẩm "${newProduct.name}" thành công!`,
        type: 'success',
      });
    }

    resetForm();
    setProductSubMode('list');
  };

  // Calculations for Sales & Revenue & Inventory Stats
  const safeProducts = Array.isArray(products) ? products.filter(Boolean) : [];
  const totalProducts = safeProducts.length;
  const totalInStock = safeProducts.filter((p) => p && p.inStock).length;
  const totalOutOfStock = safeProducts.filter((p) => p && !p.inStock).length;
  const stockPercentage = totalProducts > 0 ? Math.round((totalInStock / totalProducts) * 100) : 0;

  const safeOrders = orders || [];
  const validOrders = safeOrders.filter((o) => o.status !== 'Đã hủy');
  const totalOrders = validOrders.length;
  const totalRevenue = validOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);

  // Map product ID to total sold quantity from real orders
  const productSoldMap: Record<string, number> = {};
  validOrders.forEach((o) => {
    (o.items || []).forEach((item) => {
      if (item.productId) {
        productSoldMap[item.productId] = (productSoldMap[item.productId] || 0) + (Number(item.quantity) || 1);
      }
    });
  });

  const getProductSoldUnits = (p: Product) => {
    if (!p) return 0;
    return productSoldMap[p.id] || 0;
  };

  const totalUnitsSold = Object.values(productSoldMap).reduce((acc, qty) => acc + qty, 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Revenue & Sold units breakdown by Category
  const categoryStats = CATEGORIES_INFO.filter((c) => c && c.id !== 'tat-ca').map((cat) => {
    const categoryProducts = safeProducts.filter((p) => p && p.category === cat.id);
    const catSoldUnits = categoryProducts.reduce((acc, p) => acc + getProductSoldUnits(p), 0);
    const catRevenue = categoryProducts.reduce((acc, p) => {
      const sold = getProductSoldUnits(p);
      return acc + (Number(p?.price) || 0) * sold;
    }, 0);
    return {
      category: cat,
      productCount: categoryProducts.length,
      soldUnits: catSoldUnits,
      revenue: catRevenue,
      revenueShare: totalRevenue > 0 ? Math.round((catRevenue / totalRevenue) * 100) : 0,
    };
  });

  // Top 5 Bestselling Products
  const topProducts = [...safeProducts]
    .map((p) => ({
      product: p,
      soldUnits: getProductSoldUnits(p),
      revenue: (Number(p?.price) || 0) * getProductSoldUnits(p),
    }))
    .sort((a, b) => b.soldUnits - a.soldUnits)
    .slice(0, 5);

  const filteredProducts = safeProducts.filter((p) => {
    if (!p) return false;
    const nameStr = (p.name || '').toLowerCase();
    const descStr = (p.shortDesc || '').toLowerCase();
    const filterStr = (searchFilter || '').toLowerCase();
    return nameStr.includes(filterStr) || descStr.includes(filterStr);
  });

  const newOrdersCount = safeOrders.filter((o) => o.status === 'Mới tiếp nhận').length;

  const filteredOrders = safeOrders.filter((order) => {
    const matchesStatus =
      orderStatusFilter === 'all' ? true : order.status === orderStatusFilter;

    if (!orderSearchFilter.trim()) return matchesStatus;

    const query = orderSearchFilter.toLowerCase().trim();
    const matchesQuery =
      (order.id || '').toLowerCase().includes(query) ||
      (order.customerName || '').toLowerCase().includes(query) ||
      (order.customerPhone || '').toLowerCase().includes(query) ||
      (order.customerAddress || '').toLowerCase().includes(query) ||
      (order.items || []).some((item) =>
        (item.productName || '').toLowerCase().includes(query)
      );

    return matchesStatus && matchesQuery;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2926]/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-5xl h-[90vh] bg-[#FDFBF7] rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-[#EAE7E2]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#EAE7E2] bg-[#F0EDE9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5A5A40] text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-serif-vi font-bold text-[#2D2926]">
                  Trung Tâm Quản Trị Admin
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#8B4513] text-white px-2.5 py-0.5 rounded-full">
                  Admin Master
                </span>
              </div>
              <p className="text-xs text-[#6B665E]">
                Thống kê doanh thu, số lượng hàng đã bán/còn tồn kho và Quản lý Thêm/Xóa sản phẩm
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-[#EAE7E2] text-[#2D2926] flex items-center justify-center transition-colors border border-[#DEDAD2] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Navigation Bar */}
        <div className="flex border-b border-[#EAE7E2] bg-white text-xs sm:text-sm font-semibold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3.5 flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'stats'
                ? 'border-[#8B4513] text-[#8B4513] bg-[#FDFBF7] font-bold'
                : 'border-transparent text-[#6B665E] hover:text-[#2D2926]'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-[#8B4513]" />
            <span>Thống Kê Doanh Thu & Hàng Hóa</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-3.5 flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'products'
                ? 'border-[#5A5A40] text-[#5A5A40] bg-[#FDFBF7] font-bold'
                : 'border-transparent text-[#6B665E] hover:text-[#2D2926]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Sản Phẩm ({totalProducts})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-3.5 flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer relative ${
              activeTab === 'orders'
                ? 'border-[#8B4513] text-[#8B4513] bg-[#FDFBF7] font-bold'
                : 'border-transparent text-[#6B665E] hover:text-[#2D2926]'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-[#8B4513]" />
            <span>Đơn Hàng ({safeOrders.length})</span>
            {newOrdersCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                {newOrdersCount} mới
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-3.5 flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer relative ${
              activeTab === 'reviews'
                ? 'border-amber-600 text-amber-800 bg-[#FDFBF7] font-bold'
                : 'border-transparent text-[#6B665E] hover:text-[#2D2926]'
            }`}
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Đánh Giá Khách Hàng ({reviews.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('vouchers')}
            className={`flex-1 py-3.5 flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'vouchers'
                ? 'border-[#8B4513] text-[#8B4513] bg-[#FDFBF7] font-bold'
                : 'border-transparent text-[#6B665E] hover:text-[#2D2926]'
            }`}
          >
            <Ticket className="w-4 h-4 text-[#8B4513]" />
            <span>Voucher ({vouchersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('shipping')}
            className={`flex-1 py-3.5 flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'shipping'
                ? 'border-[#8B4513] text-[#8B4513] bg-[#FDFBF7] font-bold'
                : 'border-transparent text-[#6B665E] hover:text-[#2D2926]'
            }`}
          >
            <Truck className="w-4 h-4 text-[#8B4513]" />
            <span>Phí Vận Chuyển</span>
          </button>

          <button
            onClick={() => setActiveTab('header')}
            className={`flex-1 py-3.5 flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'header'
                ? 'border-[#5A5A40] text-[#5A5A40] bg-[#FDFBF7] font-bold'
                : 'border-transparent text-[#6B665E] hover:text-[#2D2926]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#5A5A40]" />
            <span>Đầu Trang (Header)</span>
          </button>

          <button
            onClick={() => setActiveTab('footer')}
            className={`flex-1 py-3.5 flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'footer'
                ? 'border-[#8B4513] text-[#8B4513] bg-[#FDFBF7] font-bold'
                : 'border-transparent text-[#6B665E] hover:text-[#2D2926]'
            }`}
          >
            <Globe className="w-4 h-4 text-[#8B4513]" />
            <span>Chân Trang (Footer)</span>
          </button>

          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-3.5 flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'email'
                ? 'border-[#8B4513] text-[#8B4513] bg-[#FDFBF7] font-bold'
                : 'border-transparent text-[#6B665E] hover:text-[#2D2926]'
            }`}
          >
            <Mail className="w-4 h-4 text-[#8B4513]" />
            <span>Mail Thông Báo Admin</span>
          </button>
        </div>


        {/* Status Notification Banner */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 text-xs font-semibold flex items-center justify-between ${
              statusMessage.type === 'success'
                ? 'bg-green-100 text-green-800 border-b border-green-200'
                : 'bg-red-100 text-red-800 border-b border-red-200'
            }`}
          >
            <span>{statusMessage.text}</span>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-xs font-bold hover:underline"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'products' && (
            <div className="space-y-4">
              {productSubMode === 'list' ? (
                <>
                  {/* Filter / Search Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#EAE7E2]">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-[#8C877E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Tìm tên sản phẩm, mô tả..."
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-xs border border-[#DEDAD2] rounded-xl focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <button
                      onClick={() => {
                        resetForm();
                        setProductSubMode('form');
                      }}
                      className="bg-[#5A5A40] hover:bg-[#4A4A35] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm Sản Phẩm Mới</span>
                    </button>
                  </div>

                  {/* Products Table/List */}
                  <div className="bg-white rounded-2xl border border-[#EAE7E2] overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#F5F5F0] text-[#6B665E] font-bold uppercase tracking-wider">
                          <tr>
                            <th className="py-3 px-4">Tác Phẩm</th>
                            <th className="py-3 px-4">Giá bán</th>
                            <th className="py-3 px-4">Tình trạng</th>
                            <th className="py-3 px-4 text-right">Thao Tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EAE7E2]">
                          {filteredProducts.map((p) => (
                            <tr key={p.id || Math.random()} className="hover:bg-[#FDFBF7] transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={p.imageUrl || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=800'}
                                    alt={p.name || 'Sản phẩm'}
                                    className="w-12 h-12 rounded-xl object-cover border border-[#EAE7E2]"
                                  />
                                  <div>
                                    <p className="font-semibold text-sm text-[#2D2926] max-w-xs truncate">
                                      {p.name || 'Sản phẩm chưa đặt tên'}
                                    </p>
                                    <p className="text-[11px] text-[#6B665E] max-w-xs truncate">
                                      {p.shortDesc || ''}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <p className="font-bold text-[#5A5A40]">
                                  {(Number(p.price) || 0).toLocaleString('vi-VN')} đ
                                </p>
                                {p.originalPrice ? (
                                  <p className="text-[11px] text-[#8C877E] line-through">
                                    {(Number(p.originalPrice) || 0).toLocaleString('vi-VN')} đ
                                  </p>
                                ) : null}
                              </td>
                              <td className="py-3 px-4">
                                <button
                                  onClick={() => onToggleStock(p.id)}
                                  className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                                    p.inStock
                                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                                  }`}
                                  title="Nhấn để đổi trạng thái"
                                >
                                  {p.inStock ? 'Còn hàng' : 'Tạm hết'}
                                </button>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => handleEditClick(p)}
                                    className="text-[#8C877E] hover:text-[#5A5A40] p-2 rounded-lg hover:bg-[#F0EDE9] transition-colors cursor-pointer"
                                    title="Chỉnh sửa sản phẩm"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (onRequestDelete) {
                                        onRequestDelete(p);
                                      } else {
                                        onDeleteProduct(p.id);
                                        setStatusMessage({
                                          text: `Đã xóa sản phẩm "${p.name}"!`,
                                          type: 'success',
                                        });
                                      }
                                    }}
                                    className="text-[#8C877E] hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                    title="Xóa sản phẩm này"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#EAE7E2]">
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setProductSubMode('list');
                      }}
                      className="flex items-center gap-2 text-xs font-bold text-[#5A5A40] hover:text-[#2D2926] bg-[#F0EDE9] hover:bg-[#EAE7E2] px-4 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Quay lại danh sách sản phẩm</span>
                    </button>
                    <span className="text-xs text-[#8C877E] font-semibold">
                      {editingProduct ? `Đang chỉnh sửa: "${editingProduct.name}"` : 'Tạo mới tác phẩm'}
                    </span>
                  </div>

                  <form onSubmit={handleCreateProduct} className="max-w-3xl mx-auto space-y-5 bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE7E2] shadow-2xs">
                    <div className="border-b border-[#EAE7E2] pb-4">
                      <h4 className="text-lg font-serif-vi font-bold text-[#2D2926]">
                        {editingProduct ? 'Chỉnh Sửa Thông Tin Sản Phẩm' : 'Thêm Tác Phẩm Mới'}
                      </h4>
                      <p className="text-xs text-[#6B665E]">
                        Thông tin sản phẩm sẽ được tự động cập nhật và hiển thị trên gian hàng MỘC ĐIÊU
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2926] mb-1.5">
                          Tên tác phẩm *
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="VD: Móc Khóa Gỗ Maple Khắc Tên"
                          className="w-full px-4 py-2.5 text-xs border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2926] mb-1.5">
                          Giá bán (VNĐ) *
                        </label>
                        <input
                          type="number"
                          required
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="VD: 850000"
                          className="w-full px-4 py-2.5 text-xs border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2926] mb-1.5">
                          Hình ảnh tác phẩm (URL hoặc tải lên từ máy) *
                        </label>
                        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                          <div className="flex-1 flex gap-2 items-center">
                            <input
                              type="text"
                              required
                              value={imageUrl}
                              onChange={(e) => setImageUrl(e.target.value)}
                              placeholder="https://... hoặc chọn ảnh từ máy"
                              className="w-full px-4 py-2.5 text-xs border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40]"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="cursor-pointer bg-[#F0EDE9] hover:bg-[#E2DFDA] text-[#2D2926] px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 border border-[#DEDAD2] transition-colors shrink-0">
                              <Upload className="w-4 h-4 text-[#5A5A40]" />
                              <span>Tải ảnh từ máy</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageFileUpload}
                                className="hidden"
                              />
                            </label>
                            {imageUrl && (
                              <img
                                src={imageUrl}
                                alt="preview"
                                className="w-11 h-11 rounded-xl object-cover border border-[#EAE7E2] shrink-0"
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2926]">
                            Video Chế Tác / Giới Thiệu (Chỉ Admin)
                          </label>
                          <span className="text-[10px] font-bold text-[#8B4513] bg-[#8B4513]/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Quyền Admin
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                          <div className="flex-1 flex gap-2 items-center">
                            <input
                              type="text"
                              value={videoUrl}
                              onChange={(e) => setVideoUrl(e.target.value)}
                              placeholder="Dán link video https://... hoặc tải từ máy"
                              className="w-full px-4 py-2.5 text-xs border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40]"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="cursor-pointer bg-[#F0EDE9] hover:bg-[#E2DFDA] text-[#2D2926] px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 border border-[#DEDAD2] transition-colors shrink-0">
                              <Video className="w-4 h-4 text-[#8B4513]" />
                              <span>Tải video từ máy</span>
                              <input
                                type="file"
                                accept="video/*"
                                onChange={handleVideoFileUpload}
                                className="hidden"
                              />
                            </label>
                            {videoUrl && (
                              <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-black border border-[#EAE7E2] shrink-0 flex items-center justify-center">
                                <video src={videoUrl} className="w-full h-full object-cover" muted />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  <Film className="w-4 h-4 text-white" />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-[10px] text-[#8C877E] mt-1">
                          * Dành riêng cho tài khoản Admin: Tải video từ máy (MP4, WEBM) hoặc dán đường dẫn link URL video giới thiệu quy trình chế tác.
                        </p>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2926] mb-1.5">
                          Mô tả ngắn tác phẩm *
                        </label>
                        <textarea
                          rows={2}
                          value={shortDesc}
                          onChange={(e) => setShortDesc(e.target.value)}
                          placeholder="Giới thiệu điểm nổi bật của sản phẩm..."
                          className="w-full px-4 py-2.5 text-xs border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40]"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#EAE7E2] flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          resetForm();
                          setProductSubMode('list');
                        }}
                        className="px-6 py-2.5 rounded-full text-xs font-semibold text-[#6B665E] hover:bg-[#F0EDE9] transition-colors cursor-pointer"
                      >
                        Hủy Bỏ
                      </button>
                      <button
                        type="submit"
                        className="bg-[#5A5A40] hover:bg-[#4A4A35] text-white px-8 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-md flex items-center gap-2 cursor-pointer"
                      >
                        {editingProduct ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        <span>{editingProduct ? 'Cập Nhật Sản Phẩm' : 'Đăng Sản Phẩm Lên Gian Hàng'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              {/* TOP BAR: RESET STATS BUTTON */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#EAE7E2] shadow-2xs">
                <div>
                  <h4 className="font-serif-vi font-bold text-base text-[#2D2926] flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#8B4513]" />
                    <span>Bảng Thống Kê Doanh Thu & Chi Tiết Từng Hàng Hóa</span>
                  </h4>
                  <p className="text-xs text-[#6B665E]">
                    Theo dõi số lượng bán ra, doanh thu theo sản phẩm và quản lý thông số kho hàng.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsConfirmingResetStats(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset Thống Kê Về 0</span>
                </button>
              </div>

              {/* SECTION 1: TOP SUMMARY STAT CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Doanh thu tổng */}
                <div className="bg-white p-5 rounded-3xl border border-[#EAE7E2] shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C877E]">
                      Tổng Doanh Thu
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl sm:text-2xl font-serif-vi font-bold text-[#2D2926]">
                      {totalRevenue.toLocaleString('vi-VN')} đ
                    </h4>
                    <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>{totalOrders} đơn hàng phát sinh</span>
                    </p>
                  </div>
                </div>

                {/* 2. Hàng đã bán */}
                <div className="bg-white p-5 rounded-3xl border border-[#EAE7E2] shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C877E]">
                      Hàng Đã Bán
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-[#8B4513]/10 text-[#8B4513] flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl sm:text-2xl font-serif-vi font-bold text-[#2D2926]">
                      {totalUnitsSold.toLocaleString('vi-VN')}
                      <span className="text-xs font-normal text-[#6B665E] ml-1">sản phẩm</span>
                    </h4>
                    <p className="text-[11px] text-[#6B665E] mt-1">
                      TB <b>{avgOrderValue.toLocaleString('vi-VN')} đ</b> / đơn
                    </p>
                  </div>
                </div>

                {/* 3. Hàng còn trong kho */}
                <div className="bg-white p-5 rounded-3xl border border-[#EAE7E2] shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C877E]">
                      Hàng Còn Trong Kho
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center">
                      <Box className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl sm:text-2xl font-serif-vi font-bold text-[#2D2926]">
                      {totalInStock}
                      <span className="text-xs font-normal text-[#6B665E] ml-1">mẫu sản phẩm</span>
                    </h4>
                    <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                      Chiếm {stockPercentage}% tổng mẫu cửa hàng
                    </p>
                  </div>
                </div>

                {/* 4. Hàng tạm hết */}
                <div className="bg-white p-5 rounded-3xl border border-[#EAE7E2] shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C877E]">
                      Hàng Tạm Hết
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Archive className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl sm:text-2xl font-serif-vi font-bold text-[#2D2926]">
                      {totalOutOfStock}
                      <span className="text-xs font-normal text-[#6B665E] ml-1">mẫu hết hàng</span>
                    </h4>
                    <p className="text-[11px] text-amber-700 mt-1 font-medium">
                      Cần chế tác bổ sung
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 2: PRODUCT-BY-PRODUCT DETAILED STATS TABLE */}
              <div className="bg-white p-6 rounded-3xl border border-[#EAE7E2] shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE7E2] pb-3">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-[#8B4513]" />
                    <h4 className="font-serif-vi font-bold text-base text-[#2D2926]">
                      Thống Kê Chi Tiết Bán Hàng Theo Từng Hàng Hóa / Sản Phẩm
                    </h4>
                  </div>
                  <span className="text-xs text-[#8C877E]">
                    Tổng cộng {safeProducts.length} mẫu sản phẩm
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#F8F6F2] text-[#6B665E] font-bold uppercase tracking-wider border-b border-[#EAE7E2]">
                      <tr>
                        <th className="p-3">Sản Phẩm / Hàng Hóa</th>
                        <th className="p-3">Đơn Giá</th>
                        <th className="p-3">Tình Trạng Kho</th>
                        <th className="p-3 text-center">Đã Bán Out</th>
                        <th className="p-3 text-right">Doanh Thu</th>
                        <th className="p-3 w-36">Tỷ Lệ Đóng Góp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAE7E2]">
                      {safeProducts.map((p) => {
                        const sold = getProductSoldUnits(p);
                        const rev = sold * (Number(p.price) || 0);
                        const share = totalRevenue > 0 ? Math.round((rev / totalRevenue) * 100) : 0;

                        return (
                          <tr key={p.id} className="hover:bg-[#FDFBF7] transition-colors">
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={p.imageUrl}
                                  alt={p.name}
                                  className="w-10 h-10 rounded-xl object-cover border border-[#EAE7E2] shrink-0"
                                />
                                <div className="min-w-0">
                                  <p className="font-bold text-[#2D2926] truncate">{p.name}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] bg-[#F0EDE9] text-[#6B665E] px-1.5 py-0.2 rounded-md">
                                      {p.category}
                                    </span>
                                    {p.village && (
                                      <span className="text-[10px] text-[#8B4513]">
                                        📍 {p.village}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="p-3 font-mono font-bold text-[#2D2926]">
                              {(p.price || 0).toLocaleString('vi-VN')} đ
                            </td>

                            <td className="p-3">
                              <span
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                                  p.inStock
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {p.inStock ? 'Còn Hàng' : 'Tạm Hết'}
                              </span>
                            </td>

                            <td className="p-3 text-center">
                              <span className="font-bold text-sm bg-[#8B4513]/10 text-[#8B4513] px-3 py-1 rounded-full font-mono">
                                {sold}
                              </span>
                            </td>

                            <td className="p-3 text-right font-mono font-bold text-sm text-[#8B4513]">
                              {rev.toLocaleString('vi-VN')} đ
                            </td>

                            <td className="p-3">
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-bold text-[#6B665E]">
                                  <span>{share}%</span>
                                </div>
                                <div className="w-full h-2 bg-[#F0EDE9] rounded-full overflow-hidden">
                                  <div
                                    className="bg-[#8B4513] h-full rounded-full transition-all duration-300"
                                    style={{ width: `${Math.max(share, sold > 0 ? 5 : 0)}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 3: TOP BESTSELLERS */}
              <div className="bg-white p-6 rounded-3xl border border-[#EAE7E2] shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#EAE7E2] pb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#8B4513]" />
                    <h4 className="font-serif-vi font-bold text-base text-[#2D2926]">
                      Top Sản Phẩm Bán Chạy Nhất
                    </h4>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {topProducts.map((tp, idx) => (
                    <div
                      key={tp.product.id}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-[#FDFBF7] border border-[#EAE7E2] hover:bg-[#F5F3EF] transition-colors"
                    >
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          idx === 0
                            ? 'bg-[#8B4513] text-white'
                            : idx === 1
                            ? 'bg-[#5A5A40] text-white'
                            : 'bg-[#EAE7E2] text-[#2D2926]'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <img
                        src={tp.product.imageUrl}
                        alt={tp.product.name}
                        className="w-10 h-10 rounded-xl object-cover border border-[#DEDAD2] shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h5 className="font-bold text-xs text-[#2D2926] truncate">
                          {tp.product.name}
                        </h5>
                        <p className="text-[10px] text-[#6B665E] mt-0.5">
                          Đã bán: <b className="text-[#8B4513]">{tp.soldUnits}</b> sản phẩm
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info Banner */}
              <div className="bg-[#F5F5F0] p-5 rounded-3xl border border-[#EAE7E2] flex items-start gap-4">
                <Users className="w-6 h-6 text-[#5A5A40] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="font-serif-vi font-bold text-sm text-[#2D2926]">
                    Hệ Thống Thống Kê & Báo Cáo Tự Động
                  </h5>
                  <p className="text-xs text-[#6B665E] leading-relaxed">
                    Dữ liệu doanh thu và tồn kho được tự động tính toán đồng bộ theo thời gian thực dựa trên toàn bộ đơn hàng thực tế của khách hàng.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              {/* Filter and Overview header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#EAE7E2]">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#8C877E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm tên khách hàng, SĐT, địa chỉ, mã đơn hàng..."
                    value={orderSearchFilter}
                    onChange={(e) => setOrderSearchFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs border border-[#DEDAD2] rounded-xl focus:outline-none focus:border-[#8B4513]"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                  <Filter className="w-4 h-4 text-[#8B4513] shrink-0" />
                  <span className="text-xs font-bold text-[#6B665E] shrink-0">Lọc:</span>
                  {[
                    { id: 'all', label: `Tất cả (${safeOrders.length})` },
                    { id: 'Mới tiếp nhận', label: `🟡 Mới (${safeOrders.filter((o) => o.status === 'Mới tiếp nhận').length})` },
                    { id: 'Đang xử lý', label: '🔵 Đang xử lý' },
                    { id: 'Đang giao hàng', label: '🟣 Đang giao' },
                    { id: 'Đã hoàn thành', label: '🟢 Hoàn thành' },
                    { id: 'Đã hủy', label: '🔴 Đã hủy' },
                  ].map((filterItem) => (
                    <button
                      key={filterItem.id}
                      type="button"
                      onClick={() => setOrderStatusFilter(filterItem.id)}
                      className={`text-xs px-3 py-1.5 rounded-full font-bold transition-colors shrink-0 cursor-pointer ${
                        orderStatusFilter === filterItem.id
                          ? 'bg-[#8B4513] text-white shadow-xs'
                          : 'bg-[#F0EDE9] text-[#6B665E] hover:bg-[#EAE7E2]'
                      }`}
                    >
                      {filterItem.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* List of Orders */}
              {filteredOrders.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-[#EAE7E2] text-center space-y-3">
                  <div className="w-16 h-16 bg-[#F0EDE9] rounded-full flex items-center justify-center mx-auto text-3xl">
                    📦
                  </div>
                  <h4 className="font-serif-vi font-bold text-base text-[#2D2926]">
                    Không Tìm Thấy Đơn Hàng Nào
                  </h4>
                  <p className="text-xs text-[#6B665E] max-w-md mx-auto">
                    {orderSearchFilter || orderStatusFilter !== 'all'
                      ? 'Không có đơn hàng nào phù hợp với bộ lọc tìm kiếm hiện tại.'
                      : 'Chưa có đơn hàng nào từ khách hàng trên hệ thống Firestore Cloud. Khi khách đặt hàng qua giỏ hàng, thông tin sẽ tự động xuất hiện tại đây theo thời gian thực!'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => {
                    const orderDateStr = order.createdAt
                      ? new Date(order.createdAt).toLocaleString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Gần đây';

                    return (
                      <div
                        key={order.id}
                        className={`bg-white rounded-3xl border overflow-hidden transition-all shadow-sm ${
                          order.status === 'Mới tiếp nhận'
                            ? 'border-amber-400 ring-2 ring-amber-400/20'
                            : 'border-[#EAE7E2]'
                        }`}
                      >
                        {/* Order Header Bar */}
                        <div className="p-4 bg-[#FDFBF7] border-b border-[#EAE7E2] flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm bg-[#8B4513] text-white px-3 py-1 rounded-full shadow-2xs">
                              #{order.id}
                            </span>
                            <span className="text-xs text-[#6B665E] flex items-center gap-1 font-medium">
                              <Clock className="w-3.5 h-3.5 text-[#8C877E]" />
                              {orderDateStr}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Quick Action Buttons */}
                            {order.status !== 'Đang giao hàng' && order.status !== 'Đã hoàn thành' && (
                              <button
                                type="button"
                                onClick={async () => {
                                  if (onUpdateOrderStatus) {
                                    await onUpdateOrderStatus(order.id, 'Đang giao hàng');
                                    setStatusMessage({
                                      text: `🚚 Đã bấm GIAO HÀNG cho đơn #${order.id}! Trạng thái chuyển sang "Đang giao hàng".`,
                                      type: 'success',
                                    });
                                  }
                                }}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                <span>Giao Hàng</span>
                              </button>
                            )}

                            {order.status !== 'Đã hoàn thành' && (
                              <button
                                type="button"
                                onClick={async () => {
                                  if (onUpdateOrderStatus) {
                                    await onUpdateOrderStatus(order.id, 'Đã hoàn thành');
                                    setStatusMessage({
                                      text: `✅ Đã đánh dấu HOÀN THÀNH cho đơn #${order.id}!`,
                                      type: 'success',
                                    });
                                  }
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Hoàn Thành</span>
                              </button>
                            )}

                            <select
                              value={order.status}
                              onChange={async (e) => {
                                const newStatus = e.target.value as OrderStatus;
                                if (onUpdateOrderStatus) {
                                  await onUpdateOrderStatus(order.id, newStatus);
                                  setStatusMessage({
                                    text: `Đã cập nhật đơn hàng #${order.id} sang trạng thái "${newStatus}"!`,
                                    type: 'success',
                                  });
                                }
                              }}
                              className={`text-xs font-bold px-3 py-1.5 rounded-full border focus:outline-none cursor-pointer transition-all ${
                                order.status === 'Mới tiếp nhận'
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : order.status === 'Đang xử lý'
                                  ? 'bg-blue-100 text-blue-900 border-blue-300'
                                  : order.status === 'Đang giao hàng'
                                  ? 'bg-purple-100 text-purple-900 border-purple-300'
                                  : order.status === 'Đã hoàn thành'
                                  ? 'bg-green-100 text-green-900 border-green-300'
                                  : 'bg-red-100 text-red-900 border-red-300'
                              }`}
                            >
                              <option value="Mới tiếp nhận">🟡 Mới tiếp nhận</option>
                              <option value="Đang xử lý">🔵 Đang xử lý</option>
                              <option value="Đang giao hàng">🟣 Đang giao hàng</option>
                              <option value="Đã hoàn thành">🟢 Đã hoàn thành</option>
                              <option value="Đã hủy">🔴 Đã hủy</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => setOrderToDeleteId(order.id)}
                              className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                              title="Xóa đơn hàng này"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Customer Info Card */}
                        <div className="p-4 sm:p-5 space-y-4">
                          <div className="bg-[#F8F6F2] p-4 rounded-2xl border border-[#EAE7E2] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div className="space-y-1">
                              <span className="text-[#8C877E] font-semibold block text-[11px] uppercase tracking-wider">
                                Khách Hàng đặt
                              </span>
                              <div className="font-bold text-[#2D2926] text-sm flex items-center gap-2">
                                <User className="w-4 h-4 text-[#8B4513] shrink-0" />
                                <span>{order.customerName}</span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[#8C877E] font-semibold block text-[11px] uppercase tracking-wider">
                                Số Điện Thoại
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#5A5A40] text-sm flex items-center gap-1.5 font-mono">
                                  <Phone className="w-4 h-4 text-[#5A5A40] shrink-0" />
                                  {order.customerPhone}
                                </span>
                                <a
                                  href={`tel:${order.customerPhone}`}
                                  className="text-[10px] bg-[#5A5A40] text-white font-bold px-2.5 py-1 rounded-md hover:bg-[#4A4A35] transition-colors shadow-2xs"
                                >
                                  Gọi ngay
                                </a>
                              </div>
                            </div>

                            <div className="space-y-1 sm:col-span-1">
                              <span className="text-[#8C877E] font-semibold block text-[11px] uppercase tracking-wider">
                                Địa Chỉ Giao Hàng
                              </span>
                              <div className="font-medium text-[#2D2926] flex items-start gap-1.5 leading-relaxed">
                                <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                <span>{order.customerAddress}</span>
                              </div>
                            </div>
                          </div>

                          {/* Yêu Cầu Khắc Laser & Ảnh Đính Kèm Theo Yêu Cầu Của Khách Hàng */}
                          {order.engravingNote || order.notes || (order.noteImages && order.noteImages.length > 0) ? (
                            <div className="bg-amber-50/90 border-2 border-dashed border-amber-600/50 p-4 rounded-2xl space-y-3 shadow-2xs">
                              <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-2xl bg-[#8B4513] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                                  ✒️
                                </div>
                                <div className="space-y-1 flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <span className="font-bold text-[#8B4513] text-xs uppercase tracking-wider flex items-center gap-1.5">
                                      Yêu Cầu Khắc Laser Của Khách Hàng:
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                      {order.noteImages && order.noteImages.length > 0 && (
                                        <span className="bg-[#8B4513] text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1">
                                          <ImageIcon className="w-3 h-3" />
                                          {order.noteImages.length} Ảnh đính kèm
                                        </span>
                                      )}
                                      <span className="bg-amber-200 text-amber-900 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                                        ✍️ Chế Tác Riêng
                                      </span>
                                    </div>
                                  </div>
                                  {(order.engravingNote || order.notes) && (
                                    <div className="bg-white p-3 rounded-xl border border-amber-200 text-xs font-bold text-[#2D2926] leading-relaxed font-serif-vi shadow-2xs">
                                      "{order.engravingNote || order.notes}"
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Attached Images Grid */}
                              {order.noteImages && order.noteImages.length > 0 && (
                                <div className="pt-2 border-t border-amber-200/80 space-y-2">
                                  <span className="text-xs font-bold text-[#8B4513] block">
                                    📷 Hình ảnh đính kèm từ khách hàng ({order.noteImages.length} ảnh):
                                  </span>
                                  <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2.5">
                                    {order.noteImages.map((imgUrl, imgIdx) => (
                                      <div
                                        key={imgIdx}
                                        onClick={() => setPreviewImageModalUrl(imgUrl)}
                                        className="group relative aspect-square rounded-xl overflow-hidden border-2 border-amber-300 bg-white shadow-2xs cursor-pointer hover:border-[#8B4513] transition-all hover:scale-105"
                                        title="Bấm để xem ảnh phóng to"
                                      >
                                        <img src={imgUrl} alt={`Ảnh ghi chú ${imgIdx + 1}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                                          🔍 Phóng to
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="bg-[#F8F6F2] p-2.5 rounded-2xl border border-[#EAE7E2] text-[11px] text-[#8C877E] italic flex items-center gap-2">
                              <span>✒️ Khách không ghi chú khắc thêm (Chế tác theo mẫu chuẩn gốc của xưởng).</span>
                            </div>
                          )}

                          {/* Return / Exchange Request Banner & Images if any */}
                          {order.returnRequested && (
                            <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl space-y-3">
                              <div className="flex items-start justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">🔄</span>
                                  <div>
                                    <span className="font-bold text-amber-950 text-xs uppercase tracking-wider block">
                                      Yêu Cầu Đổi Trả / Bảo Hành 7 Ngày Của Khách:
                                    </span>
                                    <span className="text-[11px] text-amber-900 font-medium">
                                      Lý do: <b>{order.returnReason || 'Không có mô tả'}</b>
                                    </span>
                                  </div>
                                </div>
                                <span className="bg-amber-200 text-amber-950 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase">
                                  {order.returnStatus === 'approved' && '✅ Đã chấp nhận'}
                                  {order.returnStatus === 'rejected' && '❌ Đã từ chối'}
                                  {(!order.returnStatus || order.returnStatus === 'pending') && '⏳ Chờ Admin xử lý'}
                                </span>
                              </div>

                              {/* Return Request Attached Images */}
                              {order.returnImages && order.returnImages.length > 0 && (
                                <div className="space-y-1.5 pt-2 border-t border-amber-200">
                                  <span className="text-xs font-bold text-amber-900 block">
                                    📷 Ảnh minh họa sự cố / lỗi từ khách ({order.returnImages.length} ảnh):
                                  </span>
                                  <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2">
                                    {order.returnImages.map((rImg, rIdx) => (
                                      <div
                                        key={rIdx}
                                        onClick={() => setPreviewImageModalUrl(rImg)}
                                        className="group relative aspect-square rounded-xl overflow-hidden border-2 border-amber-300 bg-white shadow-2xs cursor-pointer hover:border-[#8B4513] transition-all hover:scale-105"
                                        title="Bấm để xem ảnh phóng to"
                                      >
                                        <img src={rImg} alt={`Ảnh đổi trả ${rIdx + 1}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                                          🔍 Phóng to
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Order Products List */}
                          <div className="border border-[#EAE7E2] rounded-2xl overflow-hidden divide-y divide-[#EAE7E2]">
                            <div className="bg-[#FDFBF7] px-4 py-2 text-[11px] font-bold text-[#6B665E] uppercase tracking-wider flex justify-between">
                              <span>Sản phẩm ({order.items?.length || 0})</span>
                              <span>Thành tiền</span>
                            </div>

                            {(order.items || []).map((item, idx) => (
                              <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs hover:bg-[#FDFBF7]">
                                <div className="flex items-center gap-3 min-w-0">
                                  <img
                                    src={item.productImage || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=800'}
                                    alt={item.productName}
                                    className="w-12 h-12 rounded-xl object-cover border border-[#EAE7E2] shrink-0"
                                  />
                                  <div className="min-w-0">
                                    {item.village && (
                                      <span className="text-[10px] font-bold text-[#8B4513] bg-[#8B4513]/10 px-2 py-0.5 rounded-full">
                                        {item.village}
                                      </span>
                                    )}
                                    <p className="font-bold text-[#2D2926] truncate mt-0.5">
                                      {item.productName}
                                    </p>
                                    <p className="text-[11px] text-[#6B665E]">
                                      {item.price.toLocaleString('vi-VN')} đ × <b className="text-[#2D2926]">x{item.quantity}</b>
                                    </p>
                                  </div>
                                </div>

                                <div className="text-right font-bold text-[#5A5A40] text-xs shrink-0">
                                  {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Order Total Footer Summary */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs border-t border-[#EAE7E2]">
                            <div className="flex items-center gap-3 text-[#6B665E]">
                              {order.promoCode && (
                                <span className="bg-[#5A5A40]/10 text-[#5A5A40] px-2.5 py-1 rounded-full font-bold">
                                  Mã giảm: <b>{order.promoCode}</b> (-{(order.discount || 0).toLocaleString('vi-VN')}đ)
                                </span>
                              )}
                              <span>
                                Phí vận chuyển: <b>{order.shippingFee === 0 ? 'Miễn phí' : `${(order.shippingFee || 0).toLocaleString('vi-VN')}đ`}</b>
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="text-[#6B665E] font-medium mr-2">Tổng tiền thanh toán (COD):</span>
                              <span className="text-base font-bold text-[#8B4513] font-mono">
                                {(order.total || 0).toLocaleString('vi-VN')} đ
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-3xl border border-[#EAE7E2] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-serif-vi font-bold text-lg text-[#2D2926] flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span>Quản Lý Đánh Giá & Phản Hồi Từ Khách Hàng</span>
                  </h4>
                  <p className="text-xs text-[#6B665E] mt-0.5">
                    Toàn bộ đánh giá chất lượng sản phẩm & bình luận thực tế được khách hàng gửi về sau khi nhận đơn.
                  </p>
                </div>
                <div className="bg-amber-50 px-5 py-2.5 rounded-2xl border border-amber-200 text-center shrink-0">
                  <span className="text-2xl font-bold font-serif-vi text-[#8B4513]">
                    {reviews.length > 0
                      ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
                      : '5.0'}
                    ⭐
                  </span>
                  <p className="text-[10px] text-amber-900 font-medium">Trung bình ({reviews.length} đánh giá)</p>
                </div>
              </div>

              {reviews.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-[#EAE7E2] text-center space-y-3">
                  <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto text-3xl">
                    ⭐
                  </div>
                  <h5 className="font-bold text-sm text-[#2D2926]">Chưa Có Đánh Giá Nào Từ Khách Hàng</h5>
                  <p className="text-xs text-[#6B665E] max-w-sm mx-auto leading-relaxed">
                    Khi khách hàng nhận được sản phẩm gỗ khắc laser và gửi nhận xét qua mục "Tra cứu đơn hàng", các đánh giá thực tế sẽ xuất hiện trực tiếp tại đây để Quản trị viên dễ dàng theo dõi.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviews.map((rev) => {
                    const targetProduct = products.find((p) => p.id === rev.productId);
                    const dateStr = rev.createdAt
                      ? new Date(rev.createdAt).toLocaleString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Gần đây';

                    return (
                      <div
                        key={rev.id}
                        className="bg-white p-5 rounded-3xl border border-[#EAE7E2] shadow-2xs space-y-3 hover:border-amber-300 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2 border-b border-[#EAE7E2] pb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-[#8B4513] text-white flex items-center justify-center font-bold text-xs shrink-0">
                              {rev.customerName ? rev.customerName.charAt(0).toUpperCase() : 'K'}
                            </div>
                            <div>
                              <h5 className="font-bold text-xs text-[#2D2926]">
                                {rev.customerName || 'Khách hàng'}
                              </h5>
                              <p className="text-[10px] text-[#8C877E]">
                                {rev.customerPhone ? `SĐT: ${rev.customerPhone}` : 'Đã mua hàng'} • {dateStr}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < (rev.rating || 5)
                                    ? 'text-amber-500 fill-amber-500'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {targetProduct && (
                          <div className="flex items-center gap-3 bg-[#FDFBF7] p-2.5 rounded-2xl border border-[#EAE7E2]">
                            <img
                              src={targetProduct.imageUrl}
                              alt={targetProduct.name}
                              className="w-10 h-10 rounded-xl object-cover border border-[#DEDAD2] shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] uppercase font-bold text-[#8B4513]">
                                Sản phẩm đã mua:
                              </span>
                              <h6 className="font-bold text-xs text-[#2D2926] truncate">
                                {targetProduct.name}
                              </h6>
                            </div>
                          </div>
                        )}

                        <div className="bg-[#F8F6F2] p-3 rounded-2xl border border-[#EAE7E2] text-xs font-serif-vi text-[#2D2926] leading-relaxed italic">
                          "{rev.comment}"
                        </div>

                        {rev.orderId && (
                          <div className="flex items-center justify-between text-[10px] text-[#8C877E] pt-1">
                            <span>Mã Đơn Hàng: <b className="font-mono text-[#2D2926]">#{rev.orderId}</b></span>
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              ✓ Đã mua và hoàn thành đơn
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'vouchers' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#EAE7E2] shadow-2xs">
                <div>
                  <h4 className="font-serif-vi font-bold text-base text-[#2D2926] flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-[#8B4513]" />
                    <span>Quản Lý Voucher & Mã Giảm Giá Cửa Hàng</span>
                  </h4>
                  <p className="text-xs text-[#6B665E]">
                    Tạo mới, chỉnh sửa mức giảm giá (theo % hoặc số tiền đ) và bật/tắt hiển thị mã ưu đãi.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    if (onSaveVouchers) {
                      await onSaveVouchers(vouchersList);
                      setStatusMessage({
                        text: '✨ Đã lưu và đồng bộ danh sách Voucher lên Cloud thành công!',
                        type: 'success',
                      });
                    }
                  }}
                  className="bg-[#8B4513] hover:bg-[#6E360F] text-white text-xs font-bold px-5 py-2.5 rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors shrink-0"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu Danh Sách Voucher</span>
                </button>
              </div>

              {/* Form Add New Voucher */}
              <div className="bg-white p-5 rounded-3xl border border-[#EAE7E2] shadow-2xs space-y-4">
                <h5 className="font-bold text-xs uppercase tracking-wider text-[#2D2926]">
                  ➕ Thêm Mã Voucher Mới:
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-[#6B665E] font-bold mb-1">Mã voucher (Code) *</label>
                    <input
                      type="text"
                      placeholder="VD: MOCGO15"
                      value={newVoucherCode}
                      onChange={(e) => setNewVoucherCode(e.target.value.toUpperCase())}
                      className="w-full p-2.5 bg-[#F8F6F2] border border-[#DEDAD2] rounded-xl uppercase font-mono font-bold focus:outline-none focus:border-[#8B4513]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#6B665E] font-bold mb-1">Mức Giảm Theo (%)</label>
                    <input
                      type="number"
                      placeholder="VD: 15"
                      value={newVoucherPercent}
                      onChange={(e) => {
                        setNewVoucherPercent(e.target.value);
                        setNewVoucherAmount('0');
                      }}
                      className="w-full p-2.5 bg-[#F8F6F2] border border-[#DEDAD2] rounded-xl font-bold focus:outline-none focus:border-[#8B4513]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#6B665E] font-bold mb-1">Hoặc Giảm Tiền Trực Tiếp (VNĐ)</label>
                    <input
                      type="number"
                      placeholder="VD: 50000"
                      value={newVoucherAmount}
                      onChange={(e) => {
                        setNewVoucherAmount(e.target.value);
                        setNewVoucherPercent('0');
                      }}
                      className="w-full p-2.5 bg-[#F8F6F2] border border-[#DEDAD2] rounded-xl font-bold focus:outline-none focus:border-[#8B4513]"
                    />
                  </div>

                  <div className="sm:col-span-1 flex items-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!newVoucherCode.trim()) {
                          setStatusMessage({ text: 'Vui lòng nhập Mã giảm giá!', type: 'error' });
                          return;
                        }
                        const percentNum = Number(newVoucherPercent) || 0;
                        const amountNum = Number(newVoucherAmount) || 0;

                        const voucherObj: Voucher = {
                          code: newVoucherCode.trim().toUpperCase(),
                          discountPercent: percentNum > 0 ? percentNum : undefined,
                          discountAmount: amountNum > 0 ? amountNum : undefined,
                          desc: newVoucherDesc.trim() || `Ưu đãi giảm giá ${newVoucherCode}`,
                          active: true,
                        };

                        const updated = [voucherObj, ...vouchersList.filter((v) => v.code !== voucherObj.code)];
                        setVouchersList(updated);
                        if (onSaveVouchers) onSaveVouchers(updated);

                        setNewVoucherCode('');
                        setNewVoucherDesc('');
                        setStatusMessage({ text: `✨ Đã thêm mã voucher ${voucherObj.code}!`, type: 'success' });
                      }}
                      className="w-full bg-[#5A5A40] hover:bg-[#4A4A35] text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs transition-colors"
                    >
                      Thêm Voucher
                    </button>
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[#6B665E] font-bold mb-1">Mô tả hiển thị cho khách hàng:</label>
                    <input
                      type="text"
                      placeholder="VD: Giảm ngay 15% tri ân khách hàng thân thiết mua tranh gỗ & quà tặng"
                      value={newVoucherDesc}
                      onChange={(e) => setNewVoucherDesc(e.target.value)}
                      className="w-full p-2.5 bg-[#F8F6F2] border border-[#DEDAD2] rounded-xl focus:outline-none focus:border-[#8B4513]"
                    />
                  </div>
                </div>
              </div>

              {/* Existing Vouchers List Table */}
              <div className="bg-white rounded-3xl border border-[#EAE7E2] overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#F8F6F2] text-[#6B665E] font-bold uppercase tracking-wider border-b border-[#EAE7E2]">
                    <tr>
                      <th className="p-3.5">Mã Voucher</th>
                      <th className="p-3.5">Mức Giảm</th>
                      <th className="p-3.5">Mô Tả Quà Tặng</th>
                      <th className="p-3.5">Trạng Thái</th>
                      <th className="p-3.5 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE7E2]">
                    {vouchersList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-[#8C877E] text-xs">
                          Chưa có mã voucher nào. Hãy nhập thông tin phía trên và nhấn <b className="text-[#8B4513]">"Thêm Voucher"</b> để tạo mã giảm giá mới!
                        </td>
                      </tr>
                    ) : (
                      vouchersList.map((v) => (
                        <tr key={v.code} className="hover:bg-[#FDFBF7] transition-colors">
                          <td className="p-3.5 font-mono font-bold text-[#8B4513] text-sm">
                            🎟️ {v.code}
                          </td>
                          <td className="p-3.5 font-bold text-[#2D2926]">
                            {v.discountPercent && (
                              <span className="text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">
                                Giảm {v.discountPercent}%
                              </span>
                            )}
                            {v.discountAmount && (
                              <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                                Giảm {v.discountAmount.toLocaleString('vi-VN')} đ
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-[#6B665E] font-medium">
                            {v.desc}
                          </td>
                          <td className="p-3.5">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = vouchersList.map((item) =>
                                  item.code === v.code ? { ...item, active: !item.active } : item
                                );
                                setVouchersList(updated);
                                if (onSaveVouchers) onSaveVouchers(updated);
                              }}
                              className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                                v.active
                                  ? 'bg-green-100 text-green-800 border border-green-300'
                                  : 'bg-gray-100 text-gray-500 border border-gray-300'
                              }`}
                            >
                              {v.active ? '🟢 Đang Áp Dụng' : '⚪ Đã Tắt'}
                            </button>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = vouchersList.filter((item) => item.code !== v.code);
                                setVouchersList(updated);
                                if (onSaveVouchers) onSaveVouchers(updated);
                                setStatusMessage({ text: `Đã xóa voucher ${v.code}!`, type: 'success' });
                              }}
                              className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                              title="Xóa voucher"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-[#FDFBF7] p-4.5 rounded-2xl border border-amber-200 shadow-2xs">
                <div>
                  <h4 className="font-serif-vi font-bold text-base text-[#2D2926] flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[#8B4513]" />
                    Cấu Hình Phí Vận Chuyển & Chính Sách Giao Hàng
                  </h4>
                  <p className="text-xs text-[#6B665E] mt-0.5">
                    Thay đổi phí giao hàng mặc định và giá trị đơn hàng tối thiểu để được miễn phí giao hàng (Free Shipping) trên toàn hệ thống.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#8B4513] bg-[#8B4513]/10 px-3 py-1 rounded-full flex items-center gap-1.5 shrink-0">
                  <ShieldCheck className="w-4 h-4" /> Đồng bộ Cloud
                </span>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (onSaveShippingConfig) {
                    onSaveShippingConfig(shippingForm);
                  }
                  setStatusMessage({
                    text: 'Đã lưu và cập nhật chính sách Phí Vận Chuyển lên Cloud thành công!',
                    type: 'success',
                  });
                }}
                className="space-y-6 bg-white p-6 rounded-3xl border border-[#EAE7E2] shadow-2xs"
              >
                {/* 1. Phí Giao Hàng Mặc Định */}
                <div className="space-y-3 border-b border-[#EAE7E2] pb-6">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-[#8B4513] flex items-center gap-1.5">
                    <span>1. Phí Giao Hàng Tiêu Chuẩn (Toàn Quốc)</span>
                  </h5>
                  <div>
                    <label className="block text-xs font-bold text-[#2D2926] mb-1">
                      Số tiền phí vận chuyển (VNĐ)
                    </label>
                    <div className="relative max-w-md">
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={shippingForm.defaultShippingFee}
                        onChange={(e) =>
                          setShippingForm({
                            ...shippingForm,
                            defaultShippingFee: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full pl-4 pr-16 py-2.5 text-xs font-mono font-bold border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#8B4513] text-[#2D2926]"
                        required
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8C877E]">
                        VNĐ
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8C877E] mt-1.5">
                      Áp dụng cho tất cả các đơn hàng chưa đủ điều kiện miễn phí vận chuyển.
                    </p>

                    {/* Presets */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <span className="text-[10px] font-bold text-[#8C877E] uppercase">Gợi ý nhanh:</span>
                      {[0, 20000, 30000, 35000, 40000, 50000].map((fee) => (
                        <button
                          key={fee}
                          type="button"
                          onClick={() => setShippingForm({ ...shippingForm, defaultShippingFee: fee })}
                          className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                            shippingForm.defaultShippingFee === fee
                              ? 'bg-[#8B4513] text-white shadow-xs'
                              : 'bg-[#F8F6F2] hover:bg-[#EAE7E2] text-[#2D2926] border border-[#DEDAD2]'
                          }`}
                        >
                          {fee === 0 ? '0đ (Free)' : `${fee.toLocaleString('vi-VN')}đ`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Ngưỡng Miễn Phí Giao Hàng & Tự Động Kích Hoạt Voucher */}
                <div className="space-y-3 border-b border-[#EAE7E2] pb-6">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-[#8B4513] flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#8B4513]" />
                    <span>2. Ngưỡng Tự Động Miễn Phí Vận Chuyển (Freeship Voucher)</span>
                  </h5>
                  <div>
                    <label className="block text-xs font-bold text-[#2D2926] mb-1">
                      Giá trị đơn hàng tối thiểu để được FREESHIP (VNĐ)
                    </label>
                    <div className="relative max-w-md">
                      <input
                        type="number"
                        min="0"
                        step="50000"
                        value={shippingForm.freeShippingThreshold}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setShippingForm({
                            ...shippingForm,
                            freeShippingThreshold: val,
                            shippingNote: `Miễn phí giao hàng toàn quốc cho đơn từ ${val.toLocaleString('vi-VN')}đ`,
                          });
                        }}
                        className="w-full pl-4 pr-16 py-2.5 text-xs font-mono font-bold border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#8B4513] text-[#2D2926]"
                        required
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8C877E]">
                        VNĐ
                      </span>
                    </div>
                    <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl text-[11px] text-amber-900 mt-2 space-y-1">
                      <p className="font-bold">⚡ Quy tắc tự động hóa khi áp dụng cho khách hàng:</p>
                      <ul className="list-disc pl-4 space-y-0.5 text-[#6B665E]">
                        <li>
                          Đơn hàng <b>≥ {shippingForm.freeShippingThreshold.toLocaleString('vi-VN')}đ</b>: Hệ thống <b>tự động kích hoạt Voucher Miễn Phí Vận Chuyển</b> (Phí ship = 0đ).
                        </li>
                        <li>
                          Đơn hàng <b>&lt; {shippingForm.freeShippingThreshold.toLocaleString('vi-VN')}đ</b>: <b>KHÔNG được áp dụng FREESHIP</b> và tính phí giao hàng mặc định ({shippingForm.defaultShippingFee.toLocaleString('vi-VN')}đ).
                        </li>
                      </ul>
                    </div>

                    {/* Presets */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <span className="text-[10px] font-bold text-[#8C877E] uppercase">Gợi ý nhanh:</span>
                      {[0, 300000, 500000, 800000, 1000000, 1500000, 2000000].map((thresh) => (
                        <button
                          key={thresh}
                          type="button"
                          onClick={() => setShippingForm({
                            ...shippingForm,
                            freeShippingThreshold: thresh,
                            shippingNote: thresh === 0 ? 'Miễn phí giao hàng toàn quốc cho mọi đơn' : `Miễn phí giao hàng toàn quốc cho đơn từ ${thresh.toLocaleString('vi-VN')}đ`,
                          })}
                          className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                            shippingForm.freeShippingThreshold === thresh
                              ? 'bg-[#8B4513] text-white shadow-xs'
                              : 'bg-[#F8F6F2] hover:bg-[#EAE7E2] text-[#2D2926] border border-[#DEDAD2]'
                          }`}
                        >
                          {thresh === 0 ? '0đ (Luôn freeship)' : `${thresh.toLocaleString('vi-VN')}đ`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Ghi Chú / Thông Báo Vận Chuyển */}
                <div className="space-y-3 border-b border-[#EAE7E2] pb-6">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-[#8B4513]">
                    3. Ghi Chú Vận Chuyển Hướng Dẫn Khách Hàng
                  </h5>
                  <div>
                    <label className="block text-xs font-bold text-[#2D2926] mb-1">
                      Nội dung thông báo vận chuyển ngắn gọn
                    </label>
                    <input
                      type="text"
                      value={shippingForm.shippingNote || ''}
                      onChange={(e) => setShippingForm({ ...shippingForm, shippingNote: e.target.value })}
                      placeholder="VD: Miễn phí giao hàng toàn quốc cho đơn từ 1.000.000đ"
                      className="w-full px-4 py-2.5 text-xs border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#8B4513]"
                    />
                  </div>
                </div>

                {/* Dynamic Preview Box */}
                <div className="bg-[#F8F6F2] p-4.5 rounded-2xl border border-[#DEDAD2] space-y-2">
                  <h6 className="font-bold text-xs text-[#2D2926] uppercase tracking-wider flex items-center gap-1.5">
                    <span>💡 XEM TRƯỚC BẢNG TÍNH GIỎ HÀNG:</span>
                  </h6>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-[#EAE7E2] space-y-1">
                      <span className="text-[10px] text-[#8C877E] uppercase font-bold">Đơn hàng 500.000đ</span>
                      <div className="flex justify-between font-bold">
                        <span>Phí giao hàng:</span>
                        <span className={500000 >= shippingForm.freeShippingThreshold ? 'text-emerald-700' : 'text-[#8B4513]'}>
                          {500000 >= shippingForm.freeShippingThreshold
                            ? '0đ (Miễn phí)'
                            : `${shippingForm.defaultShippingFee.toLocaleString('vi-VN')}đ`}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-[#EAE7E2] space-y-1">
                      <span className="text-[10px] text-[#8C877E] uppercase font-bold">Đơn hàng 1.200.000đ</span>
                      <div className="flex justify-between font-bold">
                        <span>Phí giao hàng:</span>
                        <span className={1200000 >= shippingForm.freeShippingThreshold ? 'text-emerald-700' : 'text-[#8B4513]'}>
                          {1200000 >= shippingForm.freeShippingThreshold
                            ? '0đ (Miễn phí)'
                            : `${shippingForm.defaultShippingFee.toLocaleString('vi-VN')}đ`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="bg-[#8B4513] hover:bg-[#6E360F] text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu Cấu Hình Phí Vận Chuyển (Cloud)</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'header' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-[#F5F5F0] p-4 rounded-2xl border border-[#EAE7E2]">
                <div>
                  <h4 className="font-serif-vi font-bold text-base text-[#2D2926] flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#5A5A40]" />
                    Cấu Hình Nội Dung Đầu Trang (Header)
                  </h4>
                  <p className="text-xs text-[#6B665E] mt-0.5">
                    Tùy chỉnh thanh thông báo ưu đãi dòng đầu, tên thương hiệu chính, khẩu hiệu và thanh tìm kiếm
                  </p>
                </div>
                <span className="text-xs font-bold text-[#8B4513] bg-[#8B4513]/10 px-3 py-1 rounded-full flex items-center gap-1.5 shrink-0">
                  <ShieldCheck className="w-4 h-4" /> Quyền Admin
                </span>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (onSaveHeaderConfig) {
                    onSaveHeaderConfig(headerForm);
                  }
                  setStatusMessage({
                    text: 'Đã lưu và cập nhật nội dung Đầu Trang (Header) lên Cloud thành công!',
                    type: 'success',
                  });
                }}
                className="space-y-6 bg-white p-6 rounded-3xl border border-[#EAE7E2] shadow-2xs"
              >
                {/* Announcement Bar */}
                <div className="space-y-3 border-b border-[#EAE7E2] pb-6">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-[#5A5A40]">
                    1. Thanh Thông Báo Khuyến Mãi / Ưu Đãi (Dòng Đầu Tiên)
                  </h5>
                  <div>
                    <label className="block text-xs font-bold text-[#2D2926] mb-1">
                      Nội Dung Dòng Thông Báo Băng Rôn Trên Cùng
                    </label>
                    <textarea
                      rows={2}
                      value={headerForm.announcementText}
                      onChange={(e) => setHeaderForm({ ...headerForm, announcementText: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40]"
                      placeholder="VD: Miễn phí khắc tên & thiết kế demo theo yêu cầu • Nhập mã MOCGO10 giảm 10%"
                      required
                    />
                    <p className="text-[10px] text-[#8C877E] mt-1">
                      Hiển thị trực tiếp ở dải băng rôn màu xanh olive trên cùng của website.
                    </p>
                  </div>
                </div>

                {/* Brand Name & Subtitle */}
                <div className="space-y-4 border-b border-[#EAE7E2] pb-6">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-[#5A5A40]">
                    2. Logo Thương Hiệu & Dòng Khẩu Hiệu
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#2D2926] mb-1">
                        Tên Thương Hiệu Chính
                      </label>
                      <input
                        type="text"
                        value={headerForm.brandTitle}
                        onChange={(e) => setHeaderForm({ ...headerForm, brandTitle: e.target.value })}
                        className="w-full px-4 py-2.5 text-xs border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#2D2926] mb-1">
                        Slogan / Khẩu Hiệu
                      </label>
                      <input
                        type="text"
                        value={headerForm.brandTagline}
                        onChange={(e) => setHeaderForm({ ...headerForm, brandTagline: e.target.value })}
                        className="w-full px-4 py-2.5 text-xs border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40]"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Search Box Placeholder */}
                <div className="space-y-3">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-[#5A5A40]">
                    3. Ô Tìm Kiếm
                  </h5>
                  <div>
                    <label className="block text-xs font-bold text-[#2D2926] mb-1">
                      Gợi Ý Trong Ô Tìm Kiếm (Placeholder)
                    </label>
                    <input
                      type="text"
                      value={headerForm.searchPlaceholder}
                      onChange={(e) => setHeaderForm({ ...headerForm, searchPlaceholder: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40]"
                      required
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="bg-[#5A5A40] hover:bg-[#4A4A35] text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu Cấu Hình Đầu Trang (Cloud)</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'footer' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-[#F0EDE9] p-4 rounded-2xl border border-[#EAE7E2]">
                <div>
                  <h4 className="font-serif-vi font-bold text-base text-[#2D2926] flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[#8B4513]" />
                    Cấu Hình Nội Dung Chân Trang (Footer)
                  </h4>
                  <p className="text-xs text-[#6B665E] mt-0.5">
                    Tùy chỉnh thông tin thương hiệu, địa chỉ, số hotline, email và các chính sách hiển thị ở chân trang website
                  </p>
                </div>
                <span className="text-xs font-bold text-[#8B4513] bg-[#8B4513]/10 px-3 py-1 rounded-full flex items-center gap-1.5 shrink-0">
                  <ShieldCheck className="w-4 h-4" /> Quyền Admin
                </span>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (onSaveFooterConfig) {
                    onSaveFooterConfig(footerForm);
                  }
                  setStatusMessage({
                    text: 'Đã lưu và cập nhật nội dung Chân Trang (Footer) lên Cloud thành công!',
                    type: 'success',
                  });
                }}
                className="space-y-6 bg-white p-6 rounded-3xl border border-[#EAE7E2] shadow-2xs"
              >
                {/* SECTION 1: Brand Info */}
                <div className="space-y-4 border-b border-[#EAE7E2] pb-6">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-[#8B4513]">
                    1. Thông Tin Thương Hiệu & Mô Tả Chân Trang
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#2D2926] mb-1">
                        Tên Thương Hiệu (Tiêu Đề)
                      </label>
                      <input
                        type="text"
                        value={footerForm.brandName}
                        onChange={(e) => setFooterForm({ ...footerForm, brandName: e.target.value })}
                        className="w-full px-4 py-2.5 text-xs border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#8B4513]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#2D2926] mb-1">
                        Dòng Phụ / Slogan Dưới Tên
                      </label>
                      <input
                        type="text"
                        value={footerForm.brandSub}
                        onChange={(e) => setFooterForm({ ...footerForm, brandSub: e.target.value })}
                        className="w-full px-4 py-2.5 text-xs border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#8B4513]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#2D2926] mb-1">
                        Đoạn Giới Thiệu Chân Trang
                      </label>
                      <textarea
                        rows={2}
                        value={footerForm.brandDesc}
                        onChange={(e) => setFooterForm({ ...footerForm, brandDesc: e.target.value })}
                        className="w-full px-4 py-2.5 text-xs border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#8B4513]"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: Contact Details */}
                <div className="space-y-4 border-b border-[#EAE7E2] pb-6">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-[#8B4513]">
                    2. Thông Tin Liên Hệ & Dòng Bản Quyền
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#2D2926] mb-1">
                        Địa Chỉ Cửa Hàng / Làng Nghề
                      </label>
                      <input
                        type="text"
                        value={footerForm.address}
                        onChange={(e) => setFooterForm({ ...footerForm, address: e.target.value })}
                        className="w-full px-4 py-2.5 text-xs border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#8B4513]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#2D2926] mb-1">
                        Hotline / Zalo Hỗ Trợ
                      </label>
                      <input
                        type="text"
                        value={footerForm.phone}
                        onChange={(e) => setFooterForm({ ...footerForm, phone: e.target.value })}
                        className="w-full px-4 py-2.5 text-xs border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#8B4513]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#2D2926] mb-1">
                        Email Liên Hệ
                      </label>
                      <input
                        type="email"
                        value={footerForm.email}
                        onChange={(e) => setFooterForm({ ...footerForm, email: e.target.value })}
                        className="w-full px-4 py-2.5 text-xs border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#8B4513]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#2D2926] mb-1">
                        Dòng Bản Quyền (Copyright)
                      </label>
                      <input
                        type="text"
                        value={footerForm.copyright}
                        onChange={(e) => setFooterForm({ ...footerForm, copyright: e.target.value })}
                        className="w-full px-4 py-2.5 text-xs border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#8B4513]"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: Top Benefits Row */}
                <div className="space-y-4 border-b border-[#EAE7E2] pb-6">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-[#8B4513]">
                    3. Khối Tiện Ích Cam Kết (3 Cột Đầu Chân Trang)
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Benefit 1 */}
                    <div className="bg-[#FDFBF7] p-3.5 rounded-2xl border border-[#EAE7E2] space-y-2">
                      <span className="text-[10px] font-bold text-[#5A5A40] uppercase">Cột 1: Giao Hàng</span>
                      <input
                        type="text"
                        placeholder="Tiêu đề 1"
                        value={footerForm.benefit1Title}
                        onChange={(e) => setFooterForm({ ...footerForm, benefit1Title: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs border border-[#DEDAD2] rounded-xl focus:outline-none focus:border-[#8B4513]"
                      />
                      <textarea
                        rows={2}
                        placeholder="Mô tả 1"
                        value={footerForm.benefit1Desc}
                        onChange={(e) => setFooterForm({ ...footerForm, benefit1Desc: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs border border-[#DEDAD2] rounded-xl focus:outline-none focus:border-[#8B4513]"
                      />
                    </div>

                    {/* Benefit 2 */}
                    <div className="bg-[#FDFBF7] p-3.5 rounded-2xl border border-[#EAE7E2] space-y-2">
                      <span className="text-[10px] font-bold text-[#8B4513] uppercase">Cột 2: Xác Thực</span>
                      <input
                        type="text"
                        placeholder="Tiêu đề 2"
                        value={footerForm.benefit2Title}
                        onChange={(e) => setFooterForm({ ...footerForm, benefit2Title: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs border border-[#DEDAD2] rounded-xl focus:outline-none focus:border-[#8B4513]"
                      />
                      <textarea
                        rows={2}
                        placeholder="Mô tả 2"
                        value={footerForm.benefit2Desc}
                        onChange={(e) => setFooterForm({ ...footerForm, benefit2Desc: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs border border-[#DEDAD2] rounded-xl focus:outline-none focus:border-[#8B4513]"
                      />
                    </div>

                    {/* Benefit 3 */}
                    <div className="bg-[#FDFBF7] p-3.5 rounded-2xl border border-[#EAE7E2] space-y-2">
                      <span className="text-[10px] font-bold text-[#5A5A40] uppercase">Cột 3: Đổi Trả</span>
                      <input
                        type="text"
                        placeholder="Tiêu đề 3"
                        value={footerForm.benefit3Title}
                        onChange={(e) => setFooterForm({ ...footerForm, benefit3Title: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs border border-[#DEDAD2] rounded-xl focus:outline-none focus:border-[#8B4513]"
                      />
                      <textarea
                        rows={2}
                        placeholder="Mô tả 3"
                        value={footerForm.benefit3Desc}
                        onChange={(e) => setFooterForm({ ...footerForm, benefit3Desc: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs border border-[#DEDAD2] rounded-xl focus:outline-none focus:border-[#8B4513]"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="bg-[#8B4513] hover:bg-[#6E360F] text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu Cấu Hình Chân Trang (Cloud)</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-[#F0EDE9] p-4 rounded-2xl border border-[#EAE7E2]">
                <div>
                  <h4 className="font-serif-vi font-bold text-base text-[#2D2926] flex items-center gap-2">
                    <Mail className="w-5 h-5 text-[#8B4513]" />
                    Cấu Hình Email Thông Báo Đơn Hàng Mới Cho Admin
                  </h4>
                  <p className="text-xs text-[#6B665E] mt-0.5">
                    Tự động nhận thông báo email chi tiết mỗi khi có khách hàng hoàn tất đặt hàng thành công trên website.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#8B4513] bg-[#8B4513]/10 px-3 py-1 rounded-full flex items-center gap-1.5 shrink-0">
                  <ShieldCheck className="w-4 h-4" /> Tự động 100%
                </span>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveEmailConfig({
                    adminEmail: adminEmail.trim() || 'btin2499@gmail.com',
                    serviceId: emailServiceId.trim(),
                    templateId: emailTemplateId.trim(),
                    publicKey: emailPublicKey.trim(),
                  });
                  setStatusMessage({
                    text: '✨ Đã lưu thông tin Cấu Hình Email Admin thành công!',
                    type: 'success',
                  });
                  setTimeout(() => setStatusMessage(null), 4000);
                }}
                className="space-y-6 bg-white p-6 rounded-3xl border border-[#EAE7E2] shadow-2xs"
              >
                {/* Section 1: Admin Email Target */}
                <div className="space-y-4">
                  <h5 className="text-sm font-bold text-[#2D2926] border-b border-[#EAE7E2] pb-2 flex items-center gap-2">
                    <Inbox className="w-4 h-4 text-[#8B4513]" />
                    1. Địa chỉ Email nhận thông báo
                  </h5>

                  <div>
                    <label className="block text-xs font-bold text-[#2D2926] mb-1">
                      Email Admin (Nhận đơn hàng mới) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="vd: btin2499@gmail.com"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-[#DEDAD2] text-xs focus:ring-2 focus:ring-[#8B4513] focus:outline-hidden"
                    />
                    <p className="text-[11px] text-[#8B4513] mt-1 font-medium">
                      Mỗi khi khách nhấn "Hoàn Tất Đặt Hàng", thông tin chi tiết (tên khách, SĐT, địa chỉ, danh sách món, ghi chú, tổng tiền) sẽ tự động được hệ thống ghi nhận và gửi đến email này.
                    </p>
                  </div>
                </div>

                {/* Section 2: EmailJS Config */}
                <div className="space-y-4 pt-2">
                  <h5 className="text-sm font-bold text-[#2D2926] border-b border-[#EAE7E2] pb-2 flex items-center gap-2">
                    <Send className="w-4 h-4 text-[#8B4513]" />
                    2. Cấu hình gửi mail qua EmailJS (Miễn phí 100%)
                  </h5>

                  <p className="text-xs text-[#6B665E]">
                    Nhập thông tin tài khoản EmailJS (miễn phí tại <b>emailjs.com</b>) để ứng dụng gửi mail thực sự trực tiếp đến hộp thư Gmail của Admin:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#2D2926] mb-1">
                        Service ID
                      </label>
                      <input
                        type="text"
                        value={emailServiceId}
                        onChange={(e) => setEmailServiceId(e.target.value)}
                        placeholder="service_xxxxx"
                        className="w-full px-3.5 py-2 rounded-xl border border-[#DEDAD2] text-xs focus:ring-2 focus:ring-[#8B4513] focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2D2926] mb-1">
                        Template ID
                      </label>
                      <input
                        type="text"
                        value={emailTemplateId}
                        onChange={(e) => setEmailTemplateId(e.target.value)}
                        placeholder="template_xxxxx"
                        className="w-full px-3.5 py-2 rounded-xl border border-[#DEDAD2] text-xs focus:ring-2 focus:ring-[#8B4513] focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2D2926] mb-1">
                        Public Key (User ID)
                      </label>
                      <input
                        type="text"
                        value={emailPublicKey}
                        onChange={(e) => setEmailPublicKey(e.target.value)}
                        placeholder="publicKey_xxxxx"
                        className="w-full px-3.5 py-2 rounded-xl border border-[#DEDAD2] text-xs focus:ring-2 focus:ring-[#8B4513] focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit & Test buttons */}
                <div className="pt-4 border-t border-[#EAE7E2] flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    disabled={isSendingTestMail}
                    onClick={async () => {
                      setIsSendingTestMail(true);
                      const testOrder: Order = {
                        id: `TEST-${Math.floor(1000 + Math.random() * 9000)}`,
                        customerName: 'Nguyễn Văn Test',
                        customerPhone: '0987654321',
                        customerAddress: '123 Đường Tố Hữu, Quận 1, TP. Hồ Chí Minh',
                        items: [
                          {
                            productId: 'p1',
                            productName: 'Móc khóa Gỗ Bách Xanh Khắc Laser Custom',
                            productImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400',
                            village: 'Làng Mộc Nhàn',
                            price: 150000,
                            quantity: 2,
                            engravingNote: 'Khắc tên: Bản Sắc Việt 2026',
                          },
                        ],
                        subtotal: 300000,
                        discount: 30000,
                        shippingFee: 15000,
                        total: 285000,
                        notes: 'Khách yêu cầu đóng gói hộp quà lịch sự.',
                        status: 'Mới tiếp nhận',
                        createdAt: new Date().toISOString(),
                      };

                      const res = await sendOrderNotificationToAdmin(testOrder);
                      setIsSendingTestMail(false);
                      if (res.success) {
                        setStatusMessage({
                          text: `✅ ${res.message}`,
                          type: 'success',
                        });
                      } else {
                        setStatusMessage({
                          text: `⚠️ ${res.message}`,
                          type: 'error',
                        });
                      }
                      setTimeout(() => setStatusMessage(null), 6000);
                    }}
                    className="py-2.5 px-4 rounded-xl border border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513]/10 text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSendingTestMail ? 'Đang gửi mail thử...' : 'Gửi Thử Email Thông Báo Đơn Hàng Mẫu'}</span>
                  </button>

                  <button
                    type="submit"
                    className="py-2.5 px-6 rounded-xl bg-[#8B4513] hover:bg-[#6E360F] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu Cấu Hình Email Admin</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* IMAGE LIGHTBOX PREVIEW MODAL FOR ADMIN */}
      {previewImageModalUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setPreviewImageModalUrl(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden p-3 shadow-2xl space-y-3 border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-3 py-1 border-b border-[#EAE7E2]">
              <span className="font-bold text-xs text-[#2D2926] flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#8B4513]" />
                <span>Xem Ảnh Phóng To (Ảnh Đính Kèm Của Khách Hàng)</span>
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={previewImageModalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold px-3 py-1.5 bg-[#8B4513] text-white rounded-xl hover:bg-[#6E360F] transition-colors"
                >
                  Mở trong tab mới ↗
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewImageModalUrl(null)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-gray-950 rounded-2xl p-2">
              <img
                src={previewImageModalUrl}
                alt="Ảnh đính kèm"
                className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-md"
              />
            </div>
          </div>
        </div>
      )}

      {/* DELETE ORDER CONFIRMATION MODAL */}
      {orderToDeleteId && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setOrderToDeleteId(null)}
        >
          <div
            className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#EAE7E2] relative space-y-4 text-center animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-serif-vi font-bold text-[#2D2926]">
                Xác Nhận Xóa Đơn Hàng #{orderToDeleteId}
              </h3>
              <p className="text-xs text-[#6B665E]">
                Bạn có chắc chắn muốn xóa hẳn đơn hàng này khỏi cơ sở dữ liệu cloud không? Thao tác này sẽ xóa vĩnh viễn và không thể hoàn tác!
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOrderToDeleteId(null)}
                className="py-3 px-4 rounded-xl border border-[#DEDAD2] text-[#2D2926] text-xs font-bold hover:bg-[#F5F3EF] transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={async () => {
                  const id = orderToDeleteId;
                  setOrderToDeleteId(null);
                  if (id && onDeleteOrder) {
                    try {
                      await onDeleteOrder(id);
                      setStatusMessage({ text: `✨ Đã xóa thành công đơn hàng #${id}!`, type: 'success' });
                    } catch (err) {
                      console.error('Lỗi xóa đơn hàng:', err);
                      setStatusMessage({ text: `❌ Lỗi xóa đơn hàng #${id}. Vui lòng thử lại.`, type: 'error' });
                    }
                  }
                }}
                className="py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa Vĩnh Viễn</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESET STATS CONFIRMATION MODAL */}
      {isConfirmingResetStats && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsConfirmingResetStats(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#EAE7E2] relative space-y-4 text-center animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto text-2xl shadow-inner">
              <RefreshCw className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-serif-vi font-bold text-[#2D2926]">
                Reset Thống Kê & Xóa Toàn Bộ Đơn
              </h3>
              <p className="text-xs text-[#6B665E] leading-relaxed">
                Bạn có chắc chắn muốn xóa tất cả đơn hàng để <b>RESET THỐNG KÊ DOANH THU & HÀNG HÓA VỀ 0</b> không? Thao tác này không thể hoàn tác!
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmingResetStats(false)}
                className="py-3 px-4 rounded-xl border border-[#DEDAD2] text-[#2D2926] text-xs font-bold hover:bg-[#F5F3EF] transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={async () => {
                  setIsConfirmingResetStats(false);
                  if (onResetStats) {
                    try {
                      await onResetStats();
                      setStatusMessage({
                        text: '✨ Đã reset thành công toàn bộ số liệu thống kê doanh thu và đơn hàng về 0!',
                        type: 'success',
                      });
                    } catch (err) {
                      console.error('Lỗi reset thống kê:', err);
                      setStatusMessage({ text: '❌ Lỗi reset thống kê. Vui lòng thử lại.', type: 'error' });
                    }
                  }
                }}
                className="py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Xác Nhận Reset Về 0</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardModal;
