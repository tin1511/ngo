/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ArtisansSection } from './components/ArtisansSection';
import { Footer } from './components/Footer';
import { CartModal, CartItem } from './components/CartModal';
import { WishlistModal } from './components/WishlistModal';
import { AuthModal } from './components/AuthModal';
import { SecurityModal } from './components/SecurityModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { OrderLookupModal } from './components/OrderLookupModal';
import { PRODUCTS, Product } from './data/products';
import { UserAccount, FooterConfig, DEFAULT_FOOTER_CONFIG, HeaderConfig, DEFAULT_HEADER_CONFIG, ShippingConfig, DEFAULT_SHIPPING_CONFIG, Order, OrderStatus, Voucher, DEFAULT_VOUCHERS, ProductReview } from './types/auth';
import { Filter, Sparkles, Plus, RefreshCw, CheckCircle2 } from 'lucide-react';
import {
  subscribeToProducts,
  addProductToFirestore,
  updateProductInFirestore,
  deleteProductFromFirestore,
  toggleStockInFirestore,
  subscribeToFooterConfig,
  saveFooterConfigToFirestore,
  subscribeToHeaderConfig,
  saveHeaderConfigToFirestore,
  subscribeToShippingConfig,
  saveShippingConfigToFirestore,
  subscribeToOrders,
  updateOrderStatusInFirestore,
  deleteOrderFromFirestore,
  subscribeToVouchers,
  saveVouchersToFirestore,
  clearAllOrdersFromFirestore,
  subscribeToReviews,
  updateProductReviewInFirestore,
  deleteProductReviewFromFirestore,
} from './lib/firestoreService';

export default function App() {
  // Products list state synced with Firestore cloud database
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);

  // Header, Footer & Shipping config states synced with Firestore cloud database
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>(DEFAULT_HEADER_CONFIG);
  const [footerConfig, setFooterConfig] = useState<FooterConfig>(DEFAULT_FOOTER_CONFIG);
  const [shippingConfig, setShippingConfig] = useState<ShippingConfig>(DEFAULT_SHIPPING_CONFIG);

  // Orders state synced with Firestore cloud database
  const [orders, setOrders] = useState<Order[]>([]);

  // Product reviews state synced with Firestore cloud database
  const [reviews, setReviews] = useState<ProductReview[]>([]);

  // Vouchers state synced with Firestore cloud database
  const [vouchers, setVouchers] = useState<Voucher[]>(DEFAULT_VOUCHERS);

  // Order Lookup Modal State
  const [isOrderLookupOpen, setIsOrderLookupOpen] = useState(false);

  // Subscribe to real-time Firestore products collection
  useEffect(() => {
    const unsubscribe = subscribeToProducts((updatedProducts) => {
      setProducts(updatedProducts);
      setIsProductsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to real-time Firestore reviews collection
  useEffect(() => {
    const unsubscribe = subscribeToReviews((updatedReviews) => {
      setReviews(updatedReviews);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to real-time Firestore vouchers
  useEffect(() => {
    const unsubscribe = subscribeToVouchers((updatedVouchers) => {
      setVouchers(updatedVouchers);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to real-time Firestore header configuration
  useEffect(() => {
    const unsubscribe = subscribeToHeaderConfig((config) => {
      setHeaderConfig(config);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to real-time Firestore footer configuration
  useEffect(() => {
    const unsubscribe = subscribeToFooterConfig((config) => {
      setFooterConfig(config);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to real-time Firestore shipping configuration
  useEffect(() => {
    const unsubscribe = subscribeToShippingConfig((config) => {
      setShippingConfig(config);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to real-time Firestore orders collection
  useEffect(() => {
    const unsubscribe = subscribeToOrders((updatedOrders) => {
      setOrders(updatedOrders);
    });
    return () => unsubscribe();
  }, []);

  const handleSaveVouchers = async (newVouchers: Voucher[]) => {
    setVouchers(newVouchers);
    await saveVouchersToFirestore(newVouchers);
    showToast('✨ Danh sách Voucher đã được cập nhật thành công!');
  };

  const handleResetStats = async () => {
    try {
      await clearAllOrdersFromFirestore(orders);
      showToast('✨ Tất cả số liệu thống kê & đơn hàng đã được reset về 0!');
    } catch (e) {
      console.error('Lỗi reset thống kê:', e);
      showToast('❌ Không thể reset thống kê trên Firestore Cloud.');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus, notes?: string) => {
    try {
      await updateOrderStatusInFirestore(orderId, status, notes);
      showToast(`✨ Đã cập nhật trạng thái đơn hàng #${orderId} sang "${status}"`);
    } catch (e) {
      console.error('Lỗi cập nhật trạng thái đơn hàng:', e);
      showToast('❌ Cập nhật trạng thái thất bại.');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteOrderFromFirestore(orderId);
      showToast(`🗑️ Đã xóa thành công đơn hàng #${orderId}`);
    } catch (e) {
      console.error('Lỗi xóa đơn hàng:', e);
      showToast('❌ Không thể xóa đơn hàng từ Firestore Cloud.');
    }
  };

  const handleSaveHeaderConfig = async (config: HeaderConfig) => {
    setHeaderConfig(config);
    await saveHeaderConfigToFirestore(config);
    showToast('✨ Đã cập nhật cấu hình Đầu Trang (Header) thành công!');
  };

  const handleSaveFooterConfig = async (config: FooterConfig) => {
    setFooterConfig(config);
    await saveFooterConfigToFirestore(config);
    showToast('✨ Đã cập nhật cấu hình Chân Trang (Footer) thành công!');
  };

  const handleSaveShippingConfig = async (config: ShippingConfig) => {
    setShippingConfig(config);
    await saveShippingConfigToFirestore(config);
    showToast('✨ Đã cập nhật cấu hình Phí Vận Chuyển thành công!');
  };


  // Auth & User State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const savedUser = localStorage.getItem('bansacviet_current_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register'>('login');
  const [pendingBuyNowItem, setPendingBuyNowItem] = useState<{ product: Product; quantity: number } | null>(null);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  // Auto Logout Idle Timer Listener
  useEffect(() => {
    if (!currentUser) return;

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      const savedMinsStr = localStorage.getItem('bansacviet_auto_logout');
      const mins = savedMinsStr ? parseInt(savedMinsStr, 10) : 30;

      if (mins > 0) {
        timeoutId = setTimeout(() => {
          handleLogout();
          showToast('🔒 Hệ thống đã tự động đăng xuất để bảo mật thông tin tài khoản.');
        }, mins * 60 * 1000);
      }
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, resetTimer));
    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [currentUser]);

  const showToast = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => {
      setToastNotification((current) => (current === msg ? null : current));
    }, 3500);
  };

  // Navigation & Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('tat-ca');
  const [selectedCategory, setSelectedCategory] = useState('tat-ca');
  const [selectedVillageFilter, setSelectedVillageFilter] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'rating'>('default');
  const [activeSection, setActiveSection] = useState('products');

  // Modals & Cart/Wishlist State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search text filter
      const matchesSearch =
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });
  }, [products, searchQuery, sortBy]);

  // Auth actions
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    localStorage.setItem('bansacviet_current_user', JSON.stringify(user));
    showToast(`🎉 Đăng nhập thành công! Chào mừng ${user.name}.`);

    if (pendingBuyNowItem) {
      handleAddToCart(pendingBuyNowItem.product, pendingBuyNowItem.quantity);
      setSelectedProduct(null);
      setIsCartOpen(true);
      setPendingBuyNowItem(null);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('bansacviet_current_user');
    showToast('👋 Đã đăng xuất khỏi tài khoản.');
  };

  const handleOpenAdmin = () => {
    if (currentUser?.role === 'admin') {
      setIsAdminOpen(true);
    } else {
      showToast('⚠️ Bạn cần đăng nhập bằng tài khoản Admin để quản lý sản phẩm!');
      setIsAuthOpen(true);
    }
  };

  // Admin Product actions (synced with Firestore cloud database in real-time)
  const handleAddProduct = async (newProduct: Product) => {
    try {
      await addProductToFirestore(newProduct);
      showToast(`🎉 Đã thêm sản phẩm "${newProduct.name}" lên cơ sở dữ liệu cloud!`);
    } catch (e) {
      console.error('Lỗi thêm sản phẩm:', e);
      showToast('❌ Không thể thêm sản phẩm vào database cloud.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const deleted = products.find((p) => p.id === id);
    try {
      await deleteProductFromFirestore(id);
      if (selectedProduct?.id === id) {
        setSelectedProduct(null);
      }
      if (deleted) {
        showToast(`🗑️ Đã xóa sản phẩm "${deleted.name}" khỏi cơ sở dữ liệu cloud!`);
      }
    } catch (e) {
      console.error('Lỗi xóa sản phẩm:', e);
      showToast('❌ Không thể xóa sản phẩm khỏi database cloud.');
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      await updateProductInFirestore(updatedProduct);
      showToast(`✨ Đã cập nhật sản phẩm "${updatedProduct.name}" trên cloud!`);
    } catch (e) {
      console.error('Lỗi cập nhật sản phẩm:', e);
      showToast('❌ Không thể cập nhật sản phẩm.');
    }
  };

  const handleToggleStock = async (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    try {
      await toggleStockInFirestore(id, target.inStock);
      showToast(`🔄 Đã đổi trạng thái kho của "${target.name}" trên cloud!`);
    } catch (e) {
      console.error('Lỗi đổi trạng thái hàng:', e);
      showToast('❌ Cập nhật trạng thái kho thất bại.');
    }
  };

  // Cart actions
  const handleAddToCart = (product: Product, quantityOrEvent: number | React.MouseEvent = 1) => {
    if (typeof quantityOrEvent !== 'number') {
      quantityOrEvent.stopPropagation();
    }
    const quantity = typeof quantityOrEvent === 'number' ? quantityOrEvent : 1;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleBuyNow = (product: Product, quantity: number = 1) => {
    if (!currentUser) {
      showToast('🔑 Vui lòng đăng ký / đăng nhập tài khoản để tiếp tục Mua Ngay!');
      setPendingBuyNowItem({ product, quantity });
      setAuthInitialTab('register');
      setIsAuthOpen(true);
      return;
    }
    handleAddToCart(product, quantity);
    setSelectedProduct(null);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Wishlist actions
  const handleToggleWishlist = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const isProductWishlisted = (productId: string) =>
    wishlist.some((item) => item.id === productId);

  // Navigation scroll to section
  const handleNavigate = (section: string) => {
    setActiveSection(section);
    if (section === 'products') {
      const el = document.getElementById('products-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (section === 'stories') {
      const el = document.getElementById('stories-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (section === 'artisans') {
      const el = document.getElementById('artisans-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (section === 'about') {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  // Total items count
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D2926] flex flex-col font-sans selection:bg-[#5A5A40] selection:text-white">
      {/* Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedRegion={selectedRegion}
        onRegionChange={setSelectedRegion}
        cartItemCount={cartItemCount}
        onOpenCart={() => setIsCartOpen(true)}
        wishlistCount={wishlist.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAdminDashboard={handleOpenAdmin}
        onOpenOrderLookup={() => setIsOrderLookupOpen(true)}
        onOpenSecurity={() => setIsSecurityOpen(true)}
        onLogout={handleLogout}
        headerConfig={headerConfig}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Banner Section */}
        <HeroSection
          featuredProducts={products.slice(0, 4)}
          onExploreClick={() => handleNavigate('products')}
          onSelectProduct={setSelectedProduct}
        />

        {/* Products Section */}
        <section id="products-section" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-8">
          {/* Section Heading */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b border-[#EAE7E2] pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#8B4513] mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sưu tập tuyển chọn</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-serif-vi font-bold text-[#2D2926]">
                Sản Phẩm Tiêu Biểu
              </h3>
            </div>
          </div>

          {/* Filter banner if active search */}
          {searchQuery && (
            <div className="mb-6 flex items-center justify-between bg-[#F0EDE9] px-4 py-3 rounded-2xl border border-[#EAE7E2] text-xs">
              <span className="text-[#2D2926]">
                Đang tìm kiếm theo từ khóa: <b>"{searchQuery}"</b>
              </span>
              <button
                onClick={() => setSearchQuery('')}
                className="text-[#8B4513] font-bold hover:underline"
              >
                Xóa tìm kiếm
              </button>
            </div>
          )}

          {/* Sort bar & count */}
          <div className="flex flex-wrap items-center justify-between mb-8 text-xs text-[#6B665E] gap-3">
            <span>
              Hiển thị <b>{filteredProducts.length}</b> tác phẩm thủ công Việt Nam
            </span>

            <div className="flex items-center gap-3">
              {currentUser?.role === 'admin' && (
                <button
                  onClick={handleOpenAdmin}
                  className="bg-[#8B4513] hover:bg-[#6E360F] text-white px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  title="Thêm sản phẩm mới"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm Sản Phẩm</span>
                </button>
              )}

              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span className="hidden sm:inline">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white border border-[#DEDAD2] rounded-full px-3 py-1.5 text-xs text-[#2D2926] font-medium focus:outline-none focus:border-[#5A5A40] cursor-pointer"
                >
                  <option value="default">Nổi bật nhất</option>
                  <option value="price-asc">Giá: Thấp đến Cao</option>
                  <option value="price-desc">Giá: Cao đến Thấp</option>
                  <option value="rating">Đánh giá cao nhất</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={setSelectedProduct}
                  onAddToCart={handleAddToCart}
                  isWishlisted={isProductWishlisted(product.id)}
                  onToggleWishlist={handleToggleWishlist}
                  onRequestDelete={currentUser?.role === 'admin' ? setProductToDelete : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-[#F5F5F0] rounded-3xl border border-[#EAE7E2] space-y-3">
              <div className="text-4xl">🪵</div>
              <h4 className="font-serif-vi font-bold text-base text-[#2D2926]">
                Không tìm thấy sản phẩm phù hợp
              </h4>
              <p className="text-xs text-[#6B665E]">
                {currentUser?.role === 'admin' 
                  ? 'Bạn có thể tự thêm sản phẩm mới hoặc khôi phục danh sách sản phẩm mẫu ban đầu.'
                  : 'Hãy thử đổi danh mục hoặc nhập từ khóa tìm kiếm khác.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {currentUser?.role === 'admin' && (
                  <button
                    onClick={handleOpenAdmin}
                    className="bg-[#8B4513] text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#6E360F] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Sản Phẩm Mới</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setProducts(PRODUCTS);
                    localStorage.setItem('bansacviet_products', JSON.stringify(PRODUCTS));
                    setSearchQuery('');
                    setSelectedCategory('tat-ca');
                    setSelectedRegion('tat-ca');
                    setSelectedVillageFilter('');
                    showToast('Đã khôi phục danh sách sản phẩm mẫu!');
                  }}
                  className="bg-[#5A5A40] text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#4A4A35] flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Khôi Phục Danh Sách Mẫu</span>
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Why Choose Us & Artisans Values Section */}
        <ArtisansSection />
      </main>

      {/* Footer */}
      <Footer
        onOpenSecurity={() => setIsSecurityOpen(true)}
        footerConfig={footerConfig}
      />

      {/* Modals */}
      <SecurityModal
        isOpen={isSecurityOpen}
        onClose={() => setIsSecurityOpen(false)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        isWishlisted={selectedProduct ? isProductWishlisted(selectedProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
        onRequestDelete={currentUser?.role === 'admin' ? setProductToDelete : undefined}
        reviews={reviews}
        currentUser={currentUser}
        onUpdateReview={updateProductReviewInFirestore}
        onDeleteReview={deleteProductReviewFromFirestore}
      />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        currentUser={currentUser}
        shippingConfig={shippingConfig}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        vouchers={vouchers}
        onPlaceOrder={() => {
          showToast('🎉 Đơn hàng đã được khởi tạo và gửi tới Quản Trị Viên!');
        }}
        onOpenAuth={() => {
          showToast('🔑 Vui lòng đăng ký / đăng nhập để tiến hành thanh toán đơn hàng!');
          setAuthInitialTab('register');
          setIsAuthOpen(true);
        }}
      />

      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        onRemoveFromWishlist={(product) => handleToggleWishlist(product)}
        onAddToCart={handleAddToCart}
        onSelectProduct={setSelectedProduct}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialTab={authInitialTab}
      />

      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        products={products}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onRequestDelete={setProductToDelete}
        onToggleStock={handleToggleStock}
        footerConfig={footerConfig}
        onSaveFooterConfig={handleSaveFooterConfig}
        headerConfig={headerConfig}
        onSaveHeaderConfig={handleSaveHeaderConfig}
        shippingConfig={shippingConfig}
        onSaveShippingConfig={handleSaveShippingConfig}
        orders={orders}
        reviews={reviews}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onDeleteOrder={handleDeleteOrder}
        vouchers={vouchers}
        onSaveVouchers={handleSaveVouchers}
        onResetStats={handleResetStats}
      />

      <OrderLookupModal
        isOpen={isOrderLookupOpen}
        onClose={() => setIsOrderLookupOpen(false)}
        orders={orders}
        products={products}
        currentUser={currentUser}
        onShowToast={showToast}
      />


      <DeleteConfirmModal
        isOpen={!!productToDelete}
        product={productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirmDelete={handleDeleteProduct}
      />

      {/* Toast Notification Floating Banner */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2D2926] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#5A5A40] flex items-center gap-3 animate-slideUp">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-medium">{toastNotification}</span>
        </div>
      )}
    </div>
  );
}