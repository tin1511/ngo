import React from 'react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Product } from '../data/products';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: Product[];
  onRemoveFromWishlist: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onSelectProduct: (product: Product) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  wishlist,
  onRemoveFromWishlist,
  onAddToCart,
  onSelectProduct,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2926]/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-xl max-h-[85vh] bg-[#FDFBF7] rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-[#EAE7E2]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#EAE7E2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 fill-[#8B4513] text-[#8B4513]" />
            <h3 className="text-xl font-serif-vi font-bold text-[#2D2926]">
              Tác Phẩm Đã Yêu Thích ({wishlist.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-[#F0EDE9] text-[#2D2926] flex items-center justify-center transition-colors border border-[#EAE7E2]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {wishlist.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-[#F0EDE9] rounded-full flex items-center justify-center mx-auto text-3xl">
                🌿
              </div>
              <p className="text-sm font-serif-vi font-bold text-[#2D2926]">
                Bạn chưa lưu sản phẩm nào
              </p>
              <p className="text-xs text-[#6B665E]">
                Nhấn vào biểu tượng trái tim trên sản phẩm để lưu lại những tác phẩm bạn yêu thích.
              </p>
              <button
                onClick={onClose}
                className="bg-[#5A5A40] text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#4A4A35] transition-colors"
              >
                Xem Sản Phẩm
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {wishlist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 bg-white rounded-2xl border border-[#EAE7E2] shadow-2xs group"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-xl shrink-0 cursor-pointer"
                    onClick={() => {
                      onSelectProduct(item);
                      onClose();
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-[#8C877E] font-serif-vi">
                      {item.village} • {item.province}
                    </p>
                    <h4
                      onClick={() => {
                        onSelectProduct(item);
                        onClose();
                      }}
                      className="font-medium text-xs sm:text-sm text-[#2D2926] truncate cursor-pointer hover:text-[#5A5A40]"
                    >
                      {item.name}
                    </h4>
                    <p className="text-xs font-bold text-[#5A5A40] mt-1">
                      {item.price.toLocaleString('vi-VN')} đ
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        onAddToCart(item, e);
                      }}
                      className="bg-[#5A5A40] hover:bg-[#4A4A35] text-white p-2 sm:px-3 sm:py-2 rounded-full text-xs font-semibold flex items-center gap-1 transition-transform hover:scale-105"
                      title="Thêm vào giỏ hàng"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Thêm vào giỏ</span>
                    </button>

                    <button
                      onClick={() => onRemoveFromWishlist(item)}
                      className="text-[#8C877E] hover:text-red-600 p-2 transition-colors"
                      title="Bỏ khỏi yêu thích"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistModal;

