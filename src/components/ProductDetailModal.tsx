import React, { useMemo, useState } from 'react';
import { X, Heart, ShoppingBag, Star, MapPin, CheckCircle2, ShieldCheck, Truck, Quote, Trash2, Play, Film, Image as ImageIcon } from 'lucide-react';
import { Product } from '../data/products';
import { ProductReview, UserAccount } from '../types/auth';
import { updateProductReviewInFirestore, deleteProductReviewFromFirestore } from '../lib/firestoreService';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onRequestDelete?: (product: Product) => void;
  reviews?: ProductReview[];
  currentUser?: UserAccount | null;
  onUpdateReview?: (reviewId: string, updates: Pick<ProductReview, 'rating' | 'comment'>, productId: string) => Promise<void>;
  onDeleteReview?: (reviewId: string, productId: string) => Promise<void>;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  isWishlisted,
  onToggleWishlist,
  onRequestDelete,
  reviews = [],
  currentUser,
  onUpdateReview,
  onDeleteReview,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<ProductReview | null>(null);

  const productReviews = useMemo(() => {
    if (!product) return [];
    return reviews
      .filter((review) => review.productId === product.id)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [reviews, product?.id]);

  if (!product) return null;

  const demoVideoUrl = product.videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-carpenter-working-with-wood-41618-large.mp4';

  const reviewAverage = productReviews.length
    ? (productReviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0) / productReviews.length).toFixed(1)
    : (product.rating ?? 5.0).toFixed(1);

  const isReviewOwner = (review: ProductReview) => {
    return Boolean(
      currentUser?.username &&
      review.customerUsername &&
      review.customerUsername === currentUser.username
    );
  };

  const startEditingReview = (review: ProductReview) => {
    setEditingReviewId(review.id);
    setEditRating(Number(review.rating) || 5);
    setEditComment(review.comment || '');
  };

  const saveEditedReview = async (review: ProductReview) => {
    if (!product || !isReviewOwner(review) || !editComment.trim()) return;
    setIsSavingReview(true);
    try {
      const updater = onUpdateReview || updateProductReviewInFirestore;
      await updater(review.id, { rating: editRating, comment: editComment.trim() }, product.id);
      setEditingReviewId(null);
    } catch (error) {
      console.error('Lỗi cập nhật đánh giá:', error);
    } finally {
      setIsSavingReview(false);
    }
  };

  const removeOwnReview = (review: ProductReview) => {
    if (!product || !isReviewOwner(review)) return;
    setReviewToDelete(review);
  };

  const handleConfirmDeleteReview = async () => {
    if (!product || !reviewToDelete) return;
    try {
      const remover = onDeleteReview || deleteProductReviewFromFirestore;
      await remover(reviewToDelete.id, product.id);
      setReviewToDelete(null);
    } catch (error) {
      console.error('Lỗi xóa đánh giá:', error);
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5" aria-label={`${rating} trên 5 sao`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`w-3.5 h-3.5 ${index < rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#2D2926]/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#FDFBF7] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-[#EAE7E2]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-[#2D2926] flex items-center justify-center shadow-md transition-transform hover:scale-105 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left column: Image / Video showcase */}
        <div className="md:w-1/2 relative bg-[#F0EDE9] flex flex-col items-center justify-center p-6 sm:p-8">
          {isPlayingVideo ? (
            <div className="w-full h-72 sm:h-96 md:h-full bg-black rounded-2xl overflow-hidden relative shadow-lg flex items-center justify-center">
              <video
                src={demoVideoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              >
                Trình duyệt của bạn không hỗ trợ video HTML5.
              </video>
              <button
                onClick={() => setIsPlayingVideo(false)}
                className="absolute top-3 left-3 bg-black/70 hover:bg-black text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 backdrop-blur-xs transition-all cursor-pointer z-10"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Xem Hình Ảnh</span>
              </button>
            </div>
          ) : (
            <div className="relative w-full h-72 sm:h-96 md:h-full group rounded-2xl overflow-hidden shadow-lg">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
              />

              {/* Play Video Button Overlay */}
              <button
                onClick={() => setIsPlayingVideo(true)}
                className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-white/90 text-[#8B4513] hover:bg-[#8B4513] hover:text-white flex items-center justify-center shadow-xl transition-all duration-300 transform hover:scale-110 cursor-pointer group-hover:bg-[#8B4513] group-hover:text-white"
                title="Xem Video Chế Tác Laser"
              >
                <Play className="w-7 h-7 fill-current ml-1" />
              </button>

              <div className="absolute top-4 left-4 bg-[#5A5A40] text-white px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
                {product.badge || 'Tác Phẩm Gỗ Laser'}
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="bg-white/90 backdrop-blur-xs px-3.5 py-1.5 rounded-2xl shadow-md flex items-center gap-2 border border-[#EAE7E2]">
                  <span className="text-xl">{product.emoji}</span>
                  <span className="text-xs font-bold text-[#2D2926]">Khắc Theo Yêu Cầu</span>
                </div>

                <button
                  onClick={() => setIsPlayingVideo(true)}
                  className="bg-black/70 hover:bg-black text-white px-3 py-1.5 rounded-2xl text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-xs transition-all cursor-pointer shadow-md"
                >
                  <Film className="w-3.5 h-3.5 text-[#8B4513]" />
                  <span>Xem Video</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right column: Details & Ordering */}
        <div className="md:w-1/2 p-6 sm:p-8 overflow-y-auto flex flex-col justify-between space-y-6">
          <div>
            {/* Rating */}
            <div className="flex items-center justify-between text-xs text-[#6B665E] mb-2">
              <span className="inline-flex items-center gap-1 font-semibold text-[#8B4513] uppercase text-[11px] tracking-wider">
                ✨ Mộc Điêu Premium
              </span>
              <div className="flex items-center gap-1 text-[#8B4513] font-bold">
                <Star className="w-4 h-4 fill-current" />
                <span>{product.rating ?? 5.0} ({(product.reviewsCount ?? 12)} đánh giá)</span>
              </div>
            </div>

            {/* Product title */}
            <h3 className="text-2xl sm:text-3xl font-serif-vi font-bold text-[#2D2926] leading-tight">
              {product.name}
            </h3>

            {/* Price section */}
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-bold text-[#5A5A40]">
                {(product.price || 0).toLocaleString('vi-VN')} đ
              </span>
              <span className="ml-auto text-xs font-semibold text-[#5A5A40] bg-[#5A5A40]/10 px-2.5 py-1 rounded-full">
                {product.inStock ? 'Còn Hàng' : 'Tạm Hết'}
              </span>
            </div>

            {/* Description */}
            <p className="mt-4 text-xs sm:text-sm text-[#6B665E] leading-relaxed">
              {product.description || product.shortDesc}
            </p>

            {/* Artisan Quote Box if present */}
            {product.artisanQuote?.quote && (
              <div className="mt-4 p-4 rounded-2xl bg-[#F0EDE9] border-l-4 border-[#8B4513] relative">
                <Quote className="w-5 h-5 text-[#8B4513]/40 absolute top-2 right-2" />
                <p className="text-xs italic text-[#2D2926] font-serif-vi leading-relaxed">
                  "{product.artisanQuote.quote}"
                </p>
                <p className="mt-1.5 text-[10px] font-bold uppercase tracking-widest text-[#8B4513]">
                  — {product.artisanQuote.author}
                </p>
              </div>
            )}

            {/* Key Features List */}
            {product.features && product.features.length > 0 && (
              <div className="mt-5 space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-[#2D2926]">
                  Đặc Điểm Nổi Bật
                </p>
                <ul className="space-y-1.5 text-xs text-[#6B665E]">
                  {product.features.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#5A5A40] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Customer Reviews */}
            <div className="mt-6 pt-5 border-t border-[#EAE7E2]">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <h4 className="text-sm font-bold text-[#2D2926] flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    Đánh giá của khách hàng
                  </h4>
                  <p className="text-[10px] text-[#8C877E] mt-0.5">
                    {productReviews.length > 0
                      ? `${reviewAverage}/5 từ ${productReviews.length} đánh giá thực tế`
                      : `Sản phẩm đang có ${product.reviewsCount ?? 0} lượt đánh giá`}
                  </p>
                </div>
                {productReviews.length > 0 && (
                  <div className="flex items-center gap-2 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-200">
                    <span className="text-sm font-bold text-[#8B4513]">{reviewAverage}</span>
                    {renderStars(Math.round(Number(reviewAverage)))}
                  </div>
                )}
              </div>

              {productReviews.length === 0 ? (
                <div className="rounded-2xl bg-[#F5F3EF] border border-[#EAE7E2] p-4 text-center">
                  <p className="text-xs font-semibold text-[#2D2926]">Chưa có đánh giá thực tế hiển thị</p>
                  <p className="text-[10px] text-[#8C877E] mt-1">Hãy là khách hàng đầu tiên chia sẻ cảm nhận về sản phẩm này.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {productReviews.map((review) => {
                    const dateStr = review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })
                      : 'Gần đây';

                    return (
                      <div key={review.id} className="rounded-2xl bg-white border border-[#EAE7E2] p-3.5 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-[#8B4513] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                              {(review.customerName || 'K').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#2D2926] truncate">{review.customerName || 'Khách hàng'}</p>
                              <p className="text-[10px] text-[#8C877E]">{dateStr}</p>
                            </div>
                          </div>
                          {renderStars(Number(review.rating) || 5)}
                        </div>
                        {editingReviewId === review.id ? (
                          <div className="mt-3 space-y-2.5">
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => setEditRating(index + 1)}
                                  className="p-0.5 cursor-pointer"
                                  title={`${index + 1} sao`}
                                >
                                  <Star className={`w-4 h-4 ${index < editRating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
                                </button>
                              ))}
                            </div>
                            <textarea
                              value={editComment}
                              onChange={(e) => setEditComment(e.target.value)}
                              rows={3}
                              className="w-full text-xs p-2.5 rounded-xl border border-[#DEDAD2] bg-white focus:outline-none focus:ring-1 focus:ring-[#8B4513] text-[#2D2926]"
                            />
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => setEditingReviewId(null)} className="px-3 py-1.5 text-[10px] font-bold rounded-lg border border-[#DEDAD2] cursor-pointer">Hủy</button>
                              <button type="button" disabled={isSavingReview || !editComment.trim()} onClick={() => saveEditedReview(review)} className="px-3 py-1.5 text-[10px] font-bold rounded-lg bg-[#8B4513] text-white disabled:opacity-50 cursor-pointer">{isSavingReview ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
                            </div>
                          </div>
                        ) : (
                          <p className="mt-2.5 text-xs text-[#5F5A53] leading-relaxed">
                            {review.comment || 'Khách hàng chưa để lại bình luận.'}
                          </p>
                        )}

                        {isReviewOwner(review) && editingReviewId !== review.id && (
                          <div className="mt-3 flex justify-end gap-2">
                            <button type="button" onClick={() => startEditingReview(review)} className="text-[10px] font-bold text-[#8B4513] hover:underline cursor-pointer">✏️ Sửa</button>
                            <button type="button" onClick={() => removeOwnReview(review)} className="text-[10px] font-bold text-red-600 hover:underline cursor-pointer">🗑️ Xóa</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Custom Engraving Note Input */}
            <div className="mt-5 p-3.5 rounded-2xl bg-[#F5F3EF] border border-[#EAE7E2] space-y-2">
              <label className="block text-xs font-bold text-[#8B4513] uppercase tracking-wider">
                ✍️ Nội dung khắc gỗ theo yêu cầu:
              </label>
              <textarea
                rows={2}
                placeholder="Ví dụ: Mặt 1 khắc tên Hoàng Minh & SĐT 0988xxx; Mặt 2 khắc hình con mèo / Ngày kỷ niệm 20/10/2024..."
                className="w-full text-xs p-2.5 rounded-xl border border-[#DEDAD2] bg-white focus:outline-none focus:ring-1 focus:ring-[#8B4513] text-[#2D2926]"
              ></textarea>
              <p className="text-[10px] text-[#8C877E] italic">
                * Kèm file ảnh chân dung? Bạn có thể gửi ảnh trực tiếp qua Zalo hoặc gắn link ảnh trong ghi chú đơn hàng.
              </p>
            </div>
          </div>

          {/* Quantity & Action Buttons */}
          <div className="pt-4 border-t border-[#EAE7E2] space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center border border-[#DEDAD2] rounded-full px-3 py-1 bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center text-[#2D2926] hover:text-[#5A5A40] font-bold text-lg"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-sm text-[#2D2926]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center text-[#2D2926] hover:text-[#5A5A40] font-bold text-lg"
                >
                  +
                </button>
              </div>

              {onRequestDelete && (
                <button
                  onClick={() => {
                    onRequestDelete(product);
                    onClose();
                  }}
                  className="p-3 rounded-full border border-red-200 text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                  title="Xóa sản phẩm này"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}

              <button
                onClick={() => onToggleWishlist(product)}
                className={`p-3 rounded-full border transition-all ${
                  isWishlisted
                    ? 'border-[#8B4513] bg-[#8B4513]/10 text-[#8B4513]'
                    : 'border-[#DEDAD2] hover:bg-[#F0EDE9] text-[#6B665E]'
                }`}
                title={isWishlisted ? 'Đã yêu thích' : 'Thêm vào yêu thích'}
              >
                <Heart
                  className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`}
                />
              </button>

              <button
                onClick={() => {
                  onAddToCart(product, quantity);
                }}
                className="flex-1 bg-[#5A5A40] hover:bg-[#4A4A35] text-white py-3.5 px-6 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Thêm Vào Giỏ</span>
              </button>
            </div>

            <button
              onClick={() => {
                onBuyNow(product, quantity);
              }}
              className="w-full bg-[#8B4513] hover:bg-[#6E360F] text-white py-3.5 px-6 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-md text-center block"
            >
              Mua Ngay • Thanh Toán An Toàn
            </button>

            {/* Assurance footer */}
            <div className="flex items-center justify-between text-[11px] text-[#8C877E] pt-1">
              <span className="inline-flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" /> Giao hàng toàn quốc 2-4 ngày
              </span>
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Kiểm tra trước khi nhận
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* DELETE REVIEW CONFIRMATION MODAL */}
      {reviewToDelete && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setReviewToDelete(null)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-[#EAE7E2] relative space-y-4 text-center animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-xl shadow-inner">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-serif-vi font-bold text-[#2D2926]">Xóa Đánh Giá Của Bạn</h3>
              <p className="text-xs text-[#6B665E]">
                Bạn có chắc chắn muốn xóa đánh giá này không? Thao tác này không thể hoàn tác.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReviewToDelete(null)}
                className="py-2.5 px-4 rounded-xl border border-[#DEDAD2] text-[#2D2926] text-xs font-bold hover:bg-[#F5F3EF] transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteReview}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa Đánh Giá</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailModal;

