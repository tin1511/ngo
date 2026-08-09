import React from 'react';
import { Heart, ShoppingBag, Eye, Star, Trash2 } from 'lucide-react';
import { Product } from '../data/products';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product, e: React.MouseEvent) => void;
  onRequestDelete?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
  onRequestDelete,
}) => {
  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group cursor-pointer flex flex-col bg-white rounded-3xl p-3 sm:p-4 border border-[#EAE7E2] hover:border-[#DEDAD2] hover:shadow-xl transition-all duration-300 relative"
    >
      {/* Top Image Box */}
      <div className="aspect-[4/5] sm:aspect-[3/4] bg-[#F0EDE9] rounded-2xl overflow-hidden mb-4 relative flex items-center justify-center">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top left badge */}
        {product.badge && (
          <span className="absolute top-3 left-3 bg-[#5A5A40]/90 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-xs">
            {product.badge}
          </span>
        )}

        {/* Top right Action buttons (Wishlist & Delete) */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          {onRequestDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRequestDelete(product);
              }}
              className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs hover:bg-red-50 text-[#8C877E] hover:text-red-600 flex items-center justify-center transition-all shadow-xs cursor-pointer"
              title="Xóa sản phẩm này"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={(e) => onToggleWishlist(product, e)}
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center hover:scale-110 transition-transform shadow-xs"
            title={isWishlisted ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isWishlisted ? 'fill-[#8B4513] text-[#8B4513]' : 'text-[#6B665E]'
              }`}
            />
          </button>
        </div>

        {/* Quick View & Add to cart overlay on hover */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-[#2D2926]/70 via-[#2D2926]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectProduct(product);
            }}
            className="flex-1 bg-white/95 hover:bg-white text-[#2D2926] text-xs font-semibold py-2 px-3 rounded-full flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem chi tiết</span>
          </button>
          <button
            onClick={(e) => onAddToCart(product, e)}
            className="w-8 h-8 bg-[#5A5A40] hover:bg-[#4A4A35] text-white rounded-full flex items-center justify-center shadow-sm transition-transform hover:scale-110"
            title="Thêm vào giỏ"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Emoji accent badge */}
        <div className="absolute bottom-3 left-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-base shadow-xs">
          {product.emoji}
        </div>
      </div>

      {/* Product info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[#8C877E] text-[11px] font-medium tracking-wide uppercase">
              Chế Tác Laser
            </span>
            <div className="flex items-center gap-0.5 text-xs text-[#8B4513]">
              <Star className="w-3 h-3 fill-current" />
              <span className="font-semibold">{product.rating ?? 5.0}</span>
            </div>
          </div>

          <h4 className="font-medium text-sm sm:text-base text-[#2D2926] group-hover:text-[#5A5A40] transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h4>
        </div>

        <div className="mt-3 pt-3 border-t border-[#F0EDE9] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-bold text-[#2D2926]">
              {(product.price || 0).toLocaleString('vi-VN')} đ
            </span>
          </div>

          <button
            onClick={(e) => onAddToCart(product, e)}
            className="text-xs font-bold uppercase tracking-wider text-[#8B4513] hover:text-[#5A5A40] transition-colors flex items-center gap-1"
          >
            <span>+ Giỏ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
