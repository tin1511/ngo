import React from 'react';
import { Search, ShoppingBag, Heart, Sparkles, User, LogOut, ShieldCheck, PlusCircle, PackageCheck } from 'lucide-react';
import { UserAccount, HeaderConfig, DEFAULT_HEADER_CONFIG } from '../types/auth';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedRegion?: string;
  onRegionChange?: (region: string) => void;
  cartItemCount: number;
  onOpenCart: () => void;
  wishlistCount: number;
  onOpenWishlist: () => void;
  activeSection: string;
  onNavigate: (section: string) => void;
  currentUser: UserAccount | null;
  onOpenAuth: () => void;
  onOpenAdminDashboard: () => void;
  onOpenOrderLookup?: () => void;
  onOpenSecurity?: () => void;
  onLogout: () => void;
  headerConfig?: HeaderConfig;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  cartItemCount,
  onOpenCart,
  wishlistCount,
  onOpenWishlist,
  activeSection,
  onNavigate,
  currentUser,
  onOpenAuth,
  onOpenAdminDashboard,
  onOpenOrderLookup,
  onOpenSecurity,
  onLogout,
  headerConfig,
}) => {
  const cfg = { ...DEFAULT_HEADER_CONFIG, ...headerConfig };

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#EAE7E2] transition-all">
      {/* Top Banner announcing freeship & promo */}
      <div className="bg-[#5A5A40] text-[#FDFBF7] text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#EAE7E2] shrink-0" />
        <span>
          {cfg.announcementText}
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex justify-between items-center gap-6">
        {/* Brand Title & Navigation */}
        <div className="flex items-center gap-8 lg:gap-12">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('products');
            }}
            className="group flex flex-col items-start cursor-pointer select-none"
          >
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#5A5A40] font-serif-vi">
              {cfg.brandTitle}
            </h1>
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8B4513] -mt-1 group-hover:text-[#5A5A40] transition-colors">
              {cfg.brandTagline}
            </span>
          </a>

          <nav className="hidden md:flex gap-6 lg:gap-8 text-xs sm:text-sm font-semibold uppercase tracking-widest text-[#2D2926]/80">
            <button
              onClick={() => onNavigate('products')}
              className={`transition-colors hover:text-[#5A5A40] ${
                activeSection === 'products' ? 'text-[#5A5A40] font-bold border-b-2 border-[#5A5A40] pb-1' : ''
              }`}
            >
              Sản Phẩm
            </button>
            <button
              onClick={() => onNavigate('artisans')}
              className={`transition-colors hover:text-[#5A5A40] ${
                activeSection === 'artisans' ? 'text-[#5A5A40] font-bold border-b-2 border-[#5A5A40] pb-1' : ''
              }`}
            >
              Nghệ Nhân
            </button>
            <button
              onClick={() => onNavigate('about')}
              className={`transition-colors hover:text-[#5A5A40] ${
                activeSection === 'about' ? 'text-[#5A5A40] font-bold border-b-2 border-[#5A5A40] pb-1' : ''
              }`}
            >
              Liên Hệ
            </button>
          </nav>
        </div>

        {/* Right tools: Search, Wishlist, Cart */}
        <div className="flex gap-4 sm:gap-6 items-center">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8C877E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={cfg.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-36 sm:w-48 lg:w-56 h-10 border border-[#DEDAD2] bg-white/70 rounded-full pl-10 pr-4 text-xs font-medium text-[#2D2926] placeholder-[#8C877E] focus:outline-none focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] transition-all"
            />
          </div>

          {/* Tra Cuu Don Hang & Danh Gia */}
          {onOpenOrderLookup && (
            <button
              onClick={onOpenOrderLookup}
              className="hidden lg:flex items-center gap-1.5 bg-[#F0EDE9] hover:bg-[#EAE7E2] text-[#8B4513] font-bold text-xs px-3 py-2 rounded-full border border-[#DEDAD2] transition-colors cursor-pointer"
              title="Tra cứu tình trạng giao hàng & Đánh giá sản phẩm"
            >
              <PackageCheck className="w-4 h-4 text-[#8B4513]" />
              <span>Tra Cứu Đơn</span>
            </button>
          )}

          {/* Security Center Button */}
          {onOpenSecurity && (
            <button
              onClick={onOpenSecurity}
              className="p-2 rounded-full hover:bg-[#F0EDE9] transition-colors text-[#5A5A40] flex items-center justify-center cursor-pointer"
              title="Trung Tâm Bảo Mật & Quyền Riêng Tư (SSL 256-Bit)"
            >
              <ShieldCheck className="w-5 h-5 text-[#5A5A40]" />
            </button>
          )}

          {/* Wishlist icon */}
          <button
            onClick={onOpenWishlist}
            aria-label="Danh sách yêu thích"
            className="relative p-2 rounded-full hover:bg-[#F0EDE9] transition-colors text-[#2D2926]"
            title="Sản phẩm yêu thích"
          >
            <Heart className="w-5 h-5 text-[#5A5A40]" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#8B4513] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Admin Product Management Button */}
          {currentUser?.role === 'admin' && (
            <button
              onClick={onOpenAdminDashboard}
              className="flex items-center gap-1.5 bg-[#8B4513] hover:bg-[#6E360F] text-white px-3 sm:px-3.5 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
              title="Quản lý & Thêm/Sửa/Xóa sản phẩm"
            >
              <ShieldCheck className="w-4 h-4 text-[#FDFBF7]" />
              <span className="hidden sm:inline">Quản Lý SP</span>
            </button>
          )}

          {/* User Auth / Admin Dashboard */}
          {!currentUser ? (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 bg-[#F0EDE9] hover:bg-[#EAE7E2] text-[#2D2926] px-3.5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border border-[#DEDAD2]"
              title="Đăng nhập / Đăng ký"
            >
              <User className="w-4 h-4 text-[#8B4513]" />
              <span className="hidden md:inline">Đăng Nhập</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              {currentUser.role === 'admin' ? (
                <button
                  onClick={onOpenAdminDashboard}
                  className="flex items-center gap-1.5 bg-[#8B4513] hover:bg-[#6E360F] text-white px-3.5 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
                  title="Mở bảng điều khiển Admin"
                >
                  <ShieldCheck className="w-4 h-4 text-[#FDFBF7]" />
                  <span>Quản Trị Admin</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 bg-[#F0EDE9] text-[#2D2926] px-3 py-1.5 rounded-full text-xs font-semibold border border-[#EAE7E2]">
                  <User className="w-3.5 h-3.5 text-[#5A5A40]" />
                  <span className="max-w-[100px] truncate">{currentUser.name}</span>
                </div>
              )}

              <button
                onClick={onLogout}
                className="p-2 text-[#8C877E] hover:text-red-600 rounded-full hover:bg-[#F0EDE9] transition-colors"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Cart Icon badge */}
          <button
            onClick={onOpenCart}
            aria-label="Giỏ hàng"
            className="relative flex items-center gap-2 bg-[#5A5A40] hover:bg-[#4A4A35] text-white px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Giỏ hàng</span>
            {cartItemCount > 0 && (
              <span className="bg-[#8B4513] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
