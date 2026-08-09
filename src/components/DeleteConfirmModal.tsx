import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Product, CATEGORIES_INFO } from '../data/products';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onConfirmDelete: (id: string) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  product,
  onClose,
  onConfirmDelete,
}) => {
  if (!isOpen || !product) return null;

  const categoryName =
    CATEGORIES_INFO.find((c) => c.id === product.category)?.name || product.category;

  const handleConfirm = () => {
    onConfirmDelete(product.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2926]/75 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#EAE7E2] relative animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#F5F3EF] hover:bg-[#EAE7E2] flex items-center justify-center text-[#6B665E] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          {/* Warning Icon */}
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 shadow-inner">
            <Trash2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-serif-vi font-bold text-[#2D2926]">
              Xác Nhận Xóa Sản Phẩm
            </h3>
            <p className="text-xs text-[#6B665E]">
              Hành động này sẽ xóa sản phẩm vĩnh viễn khỏi cửa hàng của bạn.
            </p>
          </div>

          {/* Product Preview Box */}
          <div className="w-full bg-[#FDFBF7] p-4 rounded-2xl border border-[#EAE7E2] flex items-center gap-3.5 text-left">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-16 h-16 rounded-xl object-cover border border-[#DEDAD2] flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase text-[#8B4513] tracking-wider">
                {categoryName}
              </span>
              <h4 className="font-bold text-xs sm:text-sm text-[#2D2926] truncate">
                {product.name}
              </h4>
              <p className="text-xs font-bold text-[#5A5A40] mt-0.5">
                {product.price.toLocaleString('vi-VN')} đ
              </p>
              <p className="text-[10px] text-[#8C877E] truncate">
                {product.village}, {product.province}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 w-full pt-2">
            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-full border border-[#DEDAD2] text-[#2D2926] text-xs font-bold hover:bg-[#F5F3EF] transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              onClick={handleConfirm}
              className="w-full py-3 px-4 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa Vĩnh Viễn</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
