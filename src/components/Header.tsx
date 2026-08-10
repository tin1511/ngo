import React, { useState } from 'react';
import { Search, ShoppingBag, Heart, Sparkles, User, LogOut, ShieldCheck, PlusCircle, PackageCheck, Menu, X } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#EAE7E2] transition-all">
      {/* Top Banner announcing freeship & promo */}
      <div className="bg-[#5A5A40] text-[#FDFBF7] text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#EAE7E2] shrink-0" />
        <span className="truncate">
          {cfg.announcementText}
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex justify-between items-center gap-2 sm:gap-4">
        {/* Mobile/Tablet menu trigger & Brand Title */}
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-8 shrink-0">
          {/* Mobile & Tablet hamburger button (show up to lg) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-[#2D2926] hover:bg-[#F0EDE9] rounded-xl transition-colors cursor-pointer shrink-0"
            aria-label="Mở menu di động"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('products');
            }}
            className="group flex flex-col items-start cursor-pointer select-none shrink-0"
          >
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#5A5A40] font-serif-vi leading-tight">
              {cfg.brandTitle}
            </h1>
            <span className="text-[8px] sm:text-[10px] font-medium uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#8B4513] -mt-0.5 sm:-mt-1 group-hover:text-[#5A5A40] transition-colors truncate max-w-[120px] sm:max-w-[200px] lg:max-w-none">
              {cfg.brandTagline}
            </span>
          </a>

          {/* Navigation for Desktop (lg and up) */}
          <nav className="hidden lg:flex gap-6 lg:gap-8 text-xs sm:text-sm font-semibold uppercase tracking-widest text-[#2D2926]/80">
            <button
              onClick={() => onNavigate('products')}
              className={`transition-colors hover:text-[#5A5A40] cursor-pointer ${
                activeSection === 'products' ? 'text-[#5A5A40] font-bold border-b-2 border-[#5A5A40] pb-1' : ''
              }`}
            >
              Sản Phẩm
            </button>
            <button
              onClick={() => onNavigate('artisans')}
              className={`transition-colors hover:text-[#5A5A40] cursor-pointer ${
                activeSection === 'artisans' ? 'text-[#5A5A40] font-bold border-b-2 border-[#5A5A40] pb-1' : ''
              }`}
            >
              Nghệ Nhân
            </button>
            <button
              onClick={() => onNavigate('about')}
              className={`transition-colors hover:text-[#5A5A40] cursor-pointer ${
                activeSection === 'about' ? 'text-[#5A5A40] font-bold border-b-2 border-[#5A5A40] pb-1' : ''
              }`}
            >
              Liên Hệ
            </button>
          </nav>
        </div>

        {/* Right tools: Search, Wishlist, User, Cart */}
        <div className="flex gap-1.5 sm:gap-2.5 lg:gap-4 items-center shrink-0">
          {/* Search box - compact on mobile/tablet, expands on focus */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8C877E] absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={cfg.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-24 xs:w-32 sm:w-36 md:w-44 lg:w-56 h-8 sm:h-9 lg:h-10 border border-[#DEDAD2] bg-white/80 rounded-full pl-8 sm:pl-9 pr-2.5 sm:pr-4 text-[11px] sm:text-xs font-medium text-[#2D2926] placeholder-[#8C877E] focus:outline-none focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] transition-all"
            />
          </div>

          {/* Tra Cuu Don Hang & Danh Gia (Desktop only) */}
          {onOpenOrderLookup && (
            <button
              onClick={onOpenOrderLookup}
              className="hidden xl:flex items-center gap-1.5 bg-[#F0EDE9] hover:bg-[#EAE7E2] text-[#8B4513] font-bold text-xs px-3 py-1.5 rounded-full border border-[#DEDAD2] transition-colors cursor-pointer shrink-0"
              title="Tra cứu tình trạng giao hàng & Đánh giá sản phẩm"
            >
              <PackageCheck className="w-4 h-4 text-[#8B4513]" />
              <span>Tra Cứu Đơn</span>
            </button>
          )}

          {/* Security Center Button (Large screens only) */}
          {onOpenSecurity && (
            <button
              onClick={onOpenSecurity}
              className="hidden lg:flex p-2 rounded-full hover:bg-[#F0EDE9] transition-colors text-[#5A5A40] items-center justify-center cursor-pointer shrink-0"
              title="Trung Tâm Bảo Mật & Quyền Riêng Tư (SSL 256-Bit)"
            >
              <ShieldCheck className="w-5 h-5 text-[#5A5A40]" />
            </button>
          )}

          {/* Wishlist icon */}
          <button
            onClick={onOpenWishlist}
            aria-label="Danh sách yêu thích"
            className="relative p-1.5 sm:p-2 rounded-full hover:bg-[#F0EDE9] transition-colors text-[#2D2926] cursor-pointer shrink-0"
            title="Sản phẩm yêu thích"
          >
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-[#5A5A40]" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#8B4513] text-white text-[9px] sm:text-[10px] w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center font-bold">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* User Auth / Profile & Logout */}
          {!currentUser ? (
            <button
              onClick={onOpenAuth}
              className="hidden sm:flex items-center gap-1.5 bg-[#F0EDE9] hover:bg-[#EAE7E2] text-[#2D2926] px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border border-[#DEDAD2] cursor-pointer shrink-0"
              title="Đăng nhập / Đăng ký"
            >
              <User className="w-3.5 h-3.5 text-[#8B4513]" />
              <span className="hidden md:inline">Đăng Nhập</span>
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 lg:gap-2 shrink-0">
              {currentUser.role === 'admin' ? (
                <button
                  onClick={onOpenAdminDashboard}
                  className="flex items-center gap-1 bg-[#8B4513] hover:bg-[#6E360F] text-white px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-xs transition-all cursor-pointer shrink-0"
                  title="Mở bảng điều khiển Admin"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FDFBF7]" />
                  <span className="hidden md:inline">Quản Lý SP</span>
                  <span className="md:hidden">Admin</span>
                </button>
              ) : (
                <div className="flex items-center gap-1 bg-[#F0EDE9] text-[#2D2926] px-2 sm:px-2.5 py-1.5 rounded-full text-xs font-semibold border border-[#EAE7E2] shrink-0">
                  <User className="w-3.5 h-3.5 text-[#5A5A40]" />
                  <span className="max-w-[60px] sm:max-w-[90px] truncate">{currentUser.name}</span>
                </div>
              )}

              <button
                onClick={onLogout}
                className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 p-1.5 sm:px-2.5 sm:py-1.5 rounded-full text-xs font-semibold border border-red-200 transition-colors cursor-pointer shrink-0"
                title="Đăng xuất tài khoản"
              >
                <LogOut className="w-3.5 h-3.5 text-red-600" />
                <span className="hidden lg:inline">Thoát</span>
              </button>
            </div>
          )}

          {/* Cart Icon badge */}
          <button
            onClick={onOpenCart}
            aria-label="Giỏ hàng"
            className="relative flex items-center gap-1 sm:gap-1.5 bg-[#5A5A40] hover:bg-[#4A4A35] text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer shrink-0"
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden md:inline">Giỏ hàng</span>
            {cartItemCount > 0 && (
              <span className="bg-[#8B4513] text-white text-[9px] sm:text-[10px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center font-bold">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#EAE7E2] bg-[#FDFBF7] px-5 py-4 space-y-4 shadow-xl animate-fadeIn">
          {/* Main Navigation links */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                onNavigate('products');
                setIsMobileMenuOpen(false);
              }}
              className={`text-left py-2 px-3 rounded-xl font-bold text-sm transition-colors ${
                activeSection === 'products' ? 'bg-[#5A5A40] text-white' : 'text-[#2D2926] hover:bg-[#F0EDE9]'
              }`}
            >
              🪵 Tất Cả Sản Phẩm
            </button>

            <button
              onClick={() => {
                onNavigate('artisans');
                setIsMobileMenuOpen(false);
              }}
              className={`text-left py-2 px-3 rounded-xl font-bold text-sm transition-colors ${
                activeSection === 'artisans' ? 'bg-[#5A5A40] text-white' : 'text-[#2D2926] hover:bg-[#F0EDE9]'
              }`}
            >
              👨‍🎨 Nghệ Nhân & Làng Nghề
            </button>

            <button
              onClick={() => {
                onNavigate('about');
                setIsMobileMenuOpen(false);
              }}
              className={`text-left py-2 px-3 rounded-xl font-bold text-sm transition-colors ${
                activeSection === 'about' ? 'bg-[#5A5A40] text-white' : 'text-[#2D2926] hover:bg-[#F0EDE9]'
              }`}
            >
              📞 Liên Hệ & Giới Thiệu
            </button>
          </div>

          <div className="pt-2 border-t border-[#EAE7E2] flex flex-col gap-2">
            {onOpenOrderLookup && (
              <button
                onClick={() => {
                  onOpenOrderLookup();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-[#F0EDE9] text-[#8B4513] font-bold text-xs"
              >
                <span className="flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-[#8B4513]" /> Tra Cứu Đơn Hàng & Đánh Giá
                </span>
                <span>→</span>
              </button>
            )}

            {onOpenSecurity && (
              <button
                onClick={() => {
                  onOpenSecurity();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-[#F0EDE9] text-[#5A5A40] font-bold text-xs"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#5A5A40]" /> Trung Tâm Bảo Mật SSL 256-Bit
                </span>
                <span>→</span>
              </button>
            )}

            {currentUser?.role === 'admin' && (
              <button
                onClick={() => {
                  onOpenAdminDashboard();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-[#8B4513] text-white font-bold text-xs"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-white" /> Bảng Điều Khiển Admin
                </span>
                <span>→</span>
              </button>
            )}
          </div>

          {/* Auth section in mobile menu */}
          <div className="pt-2 border-t border-[#EAE7E2]">
            {!currentUser ? (
              <button
                onClick={() => {
                  onOpenAuth();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-3 bg-[#5A5A40] text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm"
              >
                <User className="w-4 h-4" />
                <span>Đăng Nhập / Đăng Ký Tài Khoản</span>
              </button>
            ) : (
              <div className="flex items-center justify-between bg-[#F0EDE9] p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#8B4513]" />
                  <div>
                    <p className="text-xs font-bold text-[#2D2926]">{currentUser.name}</p>
                    <p className="text-[10px] text-[#6B665E]">{currentUser.email || currentUser.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Thoát</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
