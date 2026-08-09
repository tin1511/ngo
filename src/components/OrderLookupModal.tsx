import React, { useState } from 'react';
import { X, Search, PackageCheck, Truck, Clock, CheckCircle2, Star, MessageSquare, Phone, User, MapPin, ShieldCheck, Lock, RefreshCw, AlertCircle, Upload, Image as ImageIcon, Loader2, Trash2 } from 'lucide-react';
import { Order, OrderStatus, ProductReview, UserAccount } from '../types/auth';
import { Product } from '../data/products';
import { updateOrderStatusInFirestore, addProductReviewToFirestore, requestOrderReturnInFirestore } from '../lib/firestoreService';
import { compressImageFile } from '../lib/imageUtils';

interface OrderLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  products: Product[];
  currentUser?: UserAccount | null;
  onShowToast?: (msg: string) => void;
}

export const OrderLookupModal: React.FC<OrderLookupModalProps> = ({
  isOpen,
  onClose,
  orders = [],
  products = [],
  currentUser,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  
  // Review form state
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [reviewProductId, setReviewProductId] = useState<string>('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);

  // Return/Exchange Request form state (7-day policy)
  const [returnModalOrder, setReturnModalOrder] = useState<Order | null>(null);
  const [returnReasonType, setReturnReasonType] = useState<string>('Hàng bị nứt, vỡ, gãy do vận chuyển');
  const [returnReasonDetail, setReturnReasonDetail] = useState<string>('');
  const [returnImages, setReturnImages] = useState<string[]>([]);
  const [isUploadingReturnImage, setIsUploadingReturnImage] = useState<boolean>(false);
  const [isSubmittingReturn, setIsSubmittingReturn] = useState<boolean>(false);

  // Lightbox Preview State for Images
  const [previewLightboxImage, setPreviewLightboxImage] = useState<string | null>(null);

  // Cancel order state
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [isCancellingOrder, setIsCancellingOrder] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleReturnImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingReturnImage(true);
    try {
      const newImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        if (returnImages.length + newImages.length >= 5) {
          alert('Tối đa 5 hình ảnh đính kèm cho mỗi yêu cầu đổi trả.');
          break;
        }
        const compressed = await compressImageFile(files[i]);
        newImages.push(compressed);
      }
      setReturnImages((prev) => [...prev, ...newImages]);
    } catch (err) {
      console.error('Lỗi nén ảnh:', err);
      alert('Không thể tải ảnh lên. Vui lòng chọn lại file ảnh.');
    } finally {
      setIsUploadingReturnImage(false);
      e.target.value = '';
    }
  };

  const handleRemoveReturnImage = (indexToRemove: number) => {
    setReturnImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnModalOrder) return;

    setIsSubmittingReturn(true);
    try {
      const fullReason = `${returnReasonType}${returnReasonDetail.trim() ? ` - Chi tiết: ${returnReasonDetail.trim()}` : ''}`;
      await requestOrderReturnInFirestore(returnModalOrder.id, fullReason, returnImages);
      if (onShowToast) {
        onShowToast('🔄 Đã gửi yêu cầu đổi trả kèm hình ảnh thành công! Nhân viên sẽ liên hệ lại trong 24h.');
      }
      setReturnModalOrder(null);
      setReturnReasonDetail('');
      setReturnImages([]);
    } catch (err) {
      console.error('Lỗi gửi yêu cầu đổi trả:', err);
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
  };

  // Find orders belonging to logged in currentUser
  const currentUserOrders = orders.filter((o) => {
    if (!currentUser) return false;
    const cName = (o.customerName || '').toLowerCase();
    const cPhone = (o.customerPhone || '').toLowerCase();
    const uName = (currentUser.username || '').toLowerCase();
    const uFullName = (currentUser.name || '').toLowerCase();
    const uEmail = (currentUser.email || '').toLowerCase();

    return (
      (o.username && o.username === currentUser.username) ||
      (o.userId && o.userId === currentUser.username) ||
      (o.userEmail && o.userEmail === currentUser.email) ||
      (uEmail && o.userEmail === uEmail) ||
      (uFullName && cName.includes(uFullName)) ||
      (uName && (cName.includes(uName) || cPhone.includes(uName)))
    );
  });

  const searchedOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase().trim();
    return (
      (o.customerPhone || '').toLowerCase().includes(q) ||
      (o.id || '').toLowerCase().includes(q) ||
      (o.customerName || '').toLowerCase().includes(q)
    );
  });

  // Display orders:
  // If user typed search query: show searchedOrders
  // If logged in & no search query: show currentUserOrders automatically
  // Otherwise: show search results or empty state
  const displayOrders = searchQuery.trim()
    ? searchedOrders
    : currentUser
    ? currentUserOrders
    : hasSearched
    ? searchedOrders
    : [];

  const handleConfirmReceivedAndReview = (order: Order, productId?: string) => {
    setReviewOrder(order);
    if (productId) {
      setReviewProductId(productId);
    } else if (order.items && order.items.length > 0) {
      setReviewProductId(order.items[0].productId);
    }
    setReviewRating(5);
    setReviewComment('');
    setReviewSuccess(false);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewOrder || !reviewProductId) return;

    setIsSubmittingReview(true);
    try {
      const targetProduct = products.find((p) => p.id === reviewProductId);
      const newReview: ProductReview = {
        id: `REV-${Date.now()}`,
        productId: reviewProductId,
        orderId: reviewOrder.id,
        customerName: reviewOrder.customerName || 'Khách hàng',
        customerPhone: reviewOrder.customerPhone || '',
        customerUsername: currentUser?.username || reviewOrder.username || reviewOrder.userId || '',
        rating: reviewRating,
        comment: reviewComment.trim() || 'Sản phẩm gỗ khắc laser rất đẹp và xịn xịn!',
        createdAt: new Date().toISOString(),
      };

      await addProductReviewToFirestore(newReview, targetProduct);

      // If order status is still 'Đang giao hàng', mark it 'Đã hoàn thành'
      if (reviewOrder.status === 'Đang giao hàng') {
        await updateOrderStatusInFirestore(reviewOrder.id, 'Đã hoàn thành', 'Khách đã nhận hàng và đánh giá');
      }

      setReviewSuccess(true);
      if (onShowToast) {
        onShowToast('🎉 Cảm ơn bạn đã đánh giá sản phẩm! Đánh giá đã được lưu.');
      }
      setTimeout(() => {
        setReviewOrder(null);
        setReviewSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Lỗi gửi đánh giá:', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2926]/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#FDFBF7] rounded-3xl border border-[#EAE7E2] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-[#F8F6F2] border-b border-[#EAE7E2] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#8B4513] text-white rounded-2xl flex items-center justify-center shadow-xs">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-vi font-bold text-lg text-[#2D2926]">
                Tra Cứu & Đánh Giá Đơn Hàng
              </h3>
              <p className="text-xs text-[#6B665E]">
                Nhập số điện thoại hoặc mã đơn hàng để theo dõi trạng thái & gửi đánh giá
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#8C877E] hover:text-[#2D2926] rounded-full hover:bg-[#EAE7E2] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Logged in User Security Banner or Info */}
        <div className="px-5 pt-4">
          {currentUser ? (
            <div className="bg-emerald-50 border border-emerald-200/80 p-3.5 rounded-2xl flex items-start gap-3 text-emerald-950 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
                🔒
              </div>
              <div className="space-y-0.5 text-xs flex-1">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <p className="font-bold text-sm text-emerald-950 flex items-center gap-1.5">
                    <span>{currentUser.name}</span>
                    <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full font-mono font-bold">
                      @{currentUser.username}
                    </span>
                  </p>
                  <span className="bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Đã Đồng Bộ Tự Động
                  </span>
                </div>
                <p className="text-emerald-800 text-[11px] leading-relaxed">
                  Tài khoản của bạn đã được nhận diện an toàn. Tất cả <b>{currentUserOrders.length} đơn hàng</b> được tự động bảo mật & hiển thị bên dưới mà không cần gõ số điện thoại!
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50/80 border border-amber-200 p-3 rounded-2xl text-xs text-amber-900 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="text-[11px]">
                💡 <b>Bảo mật thông tin:</b> Vui lòng nhập Số điện thoại hoặc Mã đơn hàng bên dưới để kiểm tra tiến trình giao vận.
              </span>
            </div>
          )}
        </div>

        {/* Search Input Bar */}
        <div className="p-5 border-b border-[#EAE7E2] bg-white">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8C877E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={currentUser ? "Tìm nhanh mã đơn hàng hoặc tên..." : "Nhập số điện thoại (VD: 0901xxx) hoặc mã đơn hàng..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#F8F6F2] border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#8B4513]"
              />
            </div>
            <button
              type="submit"
              className="bg-[#8B4513] hover:bg-[#6E360F] text-white px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
            >
              Lọc Đơn
            </button>
          </form>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {displayOrders.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-16 h-16 bg-[#F0EDE9] rounded-full flex items-center justify-center mx-auto text-3xl">
                {currentUser ? '📦' : '🔍'}
              </div>
              <h4 className="font-bold text-sm text-[#2D2926]">
                {currentUser
                  ? 'Chưa Có Đơn Hàng Nào Đã Đặt'
                  : searchQuery.trim()
                  ? 'Không Tìm Thấy Đơn Hàng'
                  : 'Chưa Nhập Thông Tin Tra Cứu'}
              </h4>
              <p className="text-xs text-[#6B665E] max-w-sm mx-auto">
                {currentUser
                  ? 'Tài khoản của bạn hiện chưa có lịch sử đơn hàng. Hãy chọn cho mình một món quà gỗ khắc laser độc bản ngay!'
                  : searchQuery.trim()
                  ? `Không tìm thấy đơn hàng nào khớp với từ khóa "${searchQuery}". Vui lòng kiểm tra lại số điện thoại hoặc mã đơn!`
                  : 'Nhập số điện thoại mà bạn đã dùng khi đặt hàng để kiểm tra quá trình giao vận và viết đánh giá sau khi nhận hàng.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#6B665E] font-bold border-b border-[#EAE7E2] pb-2">
                <span>
                  {currentUser && !searchQuery.trim()
                    ? `Danh Sách Đơn Hàng Của ${currentUser.name} (${displayOrders.length})`
                    : `Tìm thấy ${displayOrders.length} đơn hàng liên quan:`}
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-normal">
                  🟢 Tự động đồng bộ thời gian thực
                </span>
              </div>

              {displayOrders.map((order) => {
                const dateStr = order.createdAt
                  ? new Date(order.createdAt).toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Vừa xong';

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl border border-[#EAE7E2] overflow-hidden shadow-xs space-y-3 p-4"
                  >
                    {/* Order Top Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EAE7E2] pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-[#8B4513] text-white px-2.5 py-1 rounded-full">
                          #{order.id}
                        </span>
                        <span className="text-xs text-[#8C877E] flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          {dateStr}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border ${
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
                        {order.status === 'Mới tiếp nhận' && '🟡 Mới Tiếp Nhận'}
                        {order.status === 'Đang xử lý' && '🔵 Đang Chế Tác / Đóng Gói'}
                        {order.status === 'Đang giao hàng' && '🚚 Đang Giao Hàng'}
                        {order.status === 'Đã hoàn thành' && '🟢 Đã Giao & Hoàn Thành'}
                        {order.status === 'Đã hủy' && '🔴 Đã Hủy'}
                      </span>
                    </div>

                    {/* 4-STEP VISUAL PROGRESS TIMELINE */}
                    {order.status !== 'Đã hủy' && (
                      <div className="bg-[#FDFBF7] p-3.5 rounded-2xl border border-[#EAE7E2] my-2 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-[#6B665E] px-1">
                          <span className={order.status === 'Mới tiếp nhận' ? 'text-[#8B4513]' : 'text-[#2D2926]'}>
                            1. tiếp nhận
                          </span>
                          <span className={order.status === 'Đang xử lý' ? 'text-blue-700' : 'text-[#2D2926]'}>
                            2. Chế tác
                          </span>
                          <span className={order.status === 'Đang giao hàng' ? 'text-purple-700' : 'text-[#2D2926]'}>
                            3. Đang giao
                          </span>
                          <span className={order.status === 'Đã hoàn thành' ? 'text-green-700' : 'text-[#2D2926]'}>
                            4. Hoàn thành
                          </span>
                        </div>

                        {/* Progress Line */}
                        <div className="relative w-full h-2.5 bg-[#EAE7E2] rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 rounded-full ${
                              order.status === 'Mới tiếp nhận'
                                ? 'w-1/4 bg-amber-500'
                                : order.status === 'Đang xử lý'
                                ? 'w-2/4 bg-blue-600'
                                : order.status === 'Đang giao hàng'
                                ? 'w-3/4 bg-purple-600'
                                : 'w-full bg-green-600'
                            }`}
                          />
                        </div>
                      </div>
                    )}

                    {/* SPECIAL STATUS NOTICE BANNERS */}
                    {order.status === 'Đang giao hàng' && (
                      <div className="p-3.5 bg-purple-50 rounded-2xl border-2 border-purple-200 text-xs space-y-2">
                        <div className="flex items-start gap-2 text-purple-900 font-bold">
                          <span className="text-base">🚚</span>
                          <div>
                            <p className="font-bold text-sm">Đơn hàng đang được giao tới bạn!</p>
                            <p className="font-normal text-[11px] text-purple-800 mt-0.5">
                              Quản trị viên đã bàn giao sản phẩm khắc thủ công cho đối tác vận chuyển. Shipper đang trên đường phát hàng tới địa chỉ của bạn ({order.customerAddress}). Vui lòng giữ liên lạc qua điện thoại!
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => handleConfirmReceivedAndReview(order)}
                            className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Xác Nhận Đã Nhận Hàng & Viết Đánh Giá</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {order.status === 'Đã hoàn thành' && (() => {
                      const deliveredDate = order.deliveredAt
                        ? new Date(order.deliveredAt)
                        : order.updatedAt
                        ? new Date(order.updatedAt)
                        : new Date(order.createdAt);

                      const now = new Date();
                      const diffMs = Math.max(0, now.getTime() - deliveredDate.getTime());
                      const daysPassed = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                      const daysRemaining = 7 - daysPassed;
                      const isWithin7Days = daysRemaining >= 0 && daysPassed <= 7;

                      return (
                        <div className="space-y-2.5">
                          {/* Completed Order Header */}
                          <div className="p-3.5 bg-green-50 rounded-2xl border border-green-200 text-xs space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2 text-green-900 font-bold">
                                <span className="text-base">🎉</span>
                                <div>
                                  <p className="font-bold text-sm text-green-950">
                                    Đơn hàng đã được giao thành công!
                                  </p>
                                  <p className="font-normal text-[11px] text-green-800 mt-0.5">
                                    Thời gian nhận hàng:{' '}
                                    <b>
                                      {deliveredDate.toLocaleString('vi-VN', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </b>
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 7-DAY RETURN POLICY STATUS CARD */}
                          {order.returnRequested ? (
                            <div
                              className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
                                order.returnStatus === 'approved'
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                                  : order.returnStatus === 'rejected'
                                  ? 'bg-red-50 border-red-300 text-red-950'
                                  : 'bg-amber-50 border-amber-300 text-amber-950'
                              }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <div
                                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                                    order.returnStatus === 'approved'
                                      ? 'bg-emerald-200 text-emerald-900'
                                      : order.returnStatus === 'rejected'
                                      ? 'bg-red-200 text-red-900'
                                      : 'bg-amber-200 text-amber-900'
                                  }`}
                                >
                                  🔄
                                </div>
                                <div className="space-y-1 flex-1">
                                  <div className="flex items-center justify-between flex-wrap gap-1">
                                    <p className="font-bold text-sm">
                                      {order.returnStatus === 'approved' && '✅ Đã Chấp Nhận Yêu Cầu Đổi Trả'}
                                      {order.returnStatus === 'rejected' && '❌ Yêu Cầu Đổi Trả Bị Từ Chối'}
                                      {(!order.returnStatus || order.returnStatus === 'pending') && '⏳ Đã Gửi Yêu Cầu Đổi Trả (Chờ Xử Lý)'}
                                    </p>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/80 border">
                                      7 Ngày Bảo Hành
                                    </span>
                                  </div>

                                  <p className="text-[11px] leading-relaxed">
                                    <b>Lý do yêu cầu:</b> {order.returnReason || 'Không có ghi chú'}
                                  </p>

                                  {order.adminReturnNote && (
                                    <p className="text-[11px] font-bold p-2 bg-white/90 rounded-xl border mt-1">
                                      💬 Tin nhắn từ Quản trị viên: {order.adminReturnNote}
                                    </p>
                                  )}

                                  {(!order.returnStatus || order.returnStatus === 'pending') && (
                                    <p className="text-[10px] italic text-amber-800 pt-0.5">
                                      💡 Yêu cầu của bạn đang được admin xử lý. Khi admin phản hồi, tin nhắn sẽ được cập nhật ngay tại đây.
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : isWithin7Days ? (
                            <div className="p-3.5 bg-amber-50/90 border border-amber-300 rounded-2xl text-xs space-y-2 text-amber-950">
                              <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                                <div className="flex items-start gap-2.5">
                                  <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                                  <div>
                                    <p className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                                      <span>🛡️ BẢO HÀNH ĐỔI TRẢ 7 NGÀY MẸO TẬN TÂM</span>
                                      <span className="bg-amber-200 text-amber-900 font-bold text-[10px] px-2 py-0.5 rounded-full">
                                        Còn {daysRemaining === 0 ? 'Hôm nay' : `${daysRemaining} ngày`}
                                      </span>
                                    </p>
                                    <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                                      Đơn hàng được áp dụng <b>chính sách 1-đổi-1 miễn phí</b> trong vòng 7 ngày nếu nứt vỡ do vận chuyển, sai nội dung khắc hoặc lỗi gỗ.
                                    </p>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setReturnModalOrder(order)}
                                  className="bg-[#8B4513] hover:bg-[#6E360F] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  <span>Yêu Cầu Đổi Trả</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-[11px] text-gray-500 flex items-center gap-2">
                              <Lock className="w-3.5 h-3.5 shrink-0" />
                              <span>
                                Đã hết thời hạn đổi trả 7 ngày (Giao hàng ngày {deliveredDate.toLocaleDateString('vi-VN')}).
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {order.status === 'Đang xử lý' && (
                      <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
                        <span className="text-base">🎨</span>
                        <span>
                          <b>Nghệ nhân đang khắc laser & chế tác:</b> Đơn hàng của bạn đang được xưởng xẻ khắc thủ công tỉ mỉ theo yêu cầu.
                        </span>
                      </div>
                    )}

                    {/* Order Items */}
                    <div className="space-y-2">
                      {(order.items || []).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-3 p-2 rounded-2xl bg-[#F8F6F2] border border-[#EAE7E2] text-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-10 h-10 rounded-xl object-cover border border-[#EAE7E2] shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-[#2D2926] truncate">{item.productName}</p>
                              <p className="text-[11px] text-[#6B665E]">
                                {item.price.toLocaleString('vi-VN')}đ × x{item.quantity}
                              </p>
                            </div>
                          </div>

                          {/* Review button if shipped or completed */}
                          {(order.status === 'Đang giao hàng' || order.status === 'Đã hoàn thành') && (
                            <button
                              type="button"
                              onClick={() => handleConfirmReceivedAndReview(order, item.productId)}
                              className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors shrink-0 cursor-pointer shadow-2xs"
                            >
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span>Đánh Giá</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Custom Engraving Note & Attached Images if available */}
                    {(order.engravingNote || order.notes || (order.noteImages && order.noteImages.length > 0)) && (
                      <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs space-y-2">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-[#8B4513] flex items-center gap-1 text-[11px] uppercase tracking-wider">
                            <span>✒️</span> Yêu Cầu Khắc Laser & Ảnh Đính Kèm Của Bạn:
                          </span>
                          {order.noteImages && order.noteImages.length > 0 && (
                            <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              📷 {order.noteImages.length} Ảnh mẫu
                            </span>
                          )}
                        </div>
                        {(order.engravingNote || order.notes) && (
                          <p className="text-[#2D2926] font-serif-vi font-semibold bg-white p-2 rounded-xl border border-amber-200/60">
                            "{order.engravingNote || order.notes}"
                          </p>
                        )}
                        {order.noteImages && order.noteImages.length > 0 && (
                          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 pt-1">
                            {order.noteImages.map((imgUrl, imgIdx) => (
                              <div
                                key={imgIdx}
                                onClick={() => setPreviewLightboxImage(imgUrl)}
                                className="aspect-square rounded-xl overflow-hidden border border-amber-300 bg-white cursor-pointer hover:opacity-90 transition-all shadow-2xs group relative"
                                title="Bấm để xem ảnh phóng to"
                              >
                                <img src={imgUrl} alt={`Ảnh ghi chú ${imgIdx + 1}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                                  🔍 Phóng to
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bottom total & action */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#EAE7E2] text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div>
                          <span className="text-[#6B665E]">Khách hàng: </span>
                          <b className="text-[#2D2926]">{order.customerName}</b> ({order.customerPhone})
                        </div>
                        {(order.status === 'Mới tiếp nhận' || order.status === 'Đang xử lý') && (
                          <button
                            type="button"
                            onClick={() => setOrderToCancel(order)}
                            className="text-red-600 hover:text-red-800 text-[11px] font-bold px-2 py-0.5 rounded-md border border-red-200 hover:bg-red-50 transition-colors flex items-center gap-1 cursor-pointer"
                            title="Hủy đơn hàng này"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hủy đơn</span>
                          </button>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-[#6B665E] mr-1">Tổng tiền:</span>
                        <b className="text-sm text-[#8B4513] font-mono font-bold">
                          {(order.total || 0).toLocaleString('vi-VN')} đ
                        </b>
                      </div>
                    </div>

                    {/* Quick confirm receipt button for shipping orders */}
                    {order.status === 'Đang giao hàng' && (
                      <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 flex items-center justify-between text-xs">
                        <span className="text-purple-900 font-medium">
                          🚚 Đơn hàng đang trên đường giao tới bạn!
                        </span>
                        <button
                          type="button"
                          onClick={() => handleConfirmReceivedAndReview(order)}
                          className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer shadow-xs"
                        >
                          Đã Nhận Hàng & Đánh Giá
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Product Review Form Dialog */}
        {reviewOrder && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-[#EAE7E2] max-w-md w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
              <div className="flex items-center justify-between border-b border-[#EAE7E2] pb-3">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <h4 className="font-serif-vi font-bold text-base text-[#2D2926]">
                    Gửi Đánh Giá Sản Phẩm
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setReviewOrder(null)}
                  className="text-[#8C877E] hover:text-[#2D2926] p-1 rounded-full hover:bg-[#F0EDE9]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {reviewSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                    ✓
                  </div>
                  <h4 className="font-bold text-base text-green-800">Đánh Giá Thành Công!</h4>
                  <p className="text-xs text-[#6B665E]">
                    Cảm ơn sự đóng góp quý báu của bạn đối với sản phẩm chạm khắc gỗ làng nghề Việt!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {/* Select item if multiple items in order */}
                  {reviewOrder.items && reviewOrder.items.length > 1 && (
                    <div>
                      <label className="block text-xs font-bold text-[#2D2926] mb-1">
                        Chọn sản phẩm đánh giá:
                      </label>
                      <select
                        value={reviewProductId}
                        onChange={(e) => setReviewProductId(e.target.value)}
                        className="w-full text-xs p-2.5 border border-[#DEDAD2] rounded-xl focus:outline-none focus:border-[#8B4513]"
                      >
                        {reviewOrder.items.map((it) => (
                          <option key={it.productId} value={it.productId}>
                            {it.productName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Rating star picker */}
                  <div>
                    <label className="block text-xs font-bold text-[#2D2926] mb-1.5">
                      Đánh giá mức độ hài lòng:
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              star <= reviewRating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-[#DEDAD2]'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-amber-600 ml-2">
                        {reviewRating === 5 && 'Tuyệt vời ⭐️⭐️⭐️⭐️⭐️'}
                        {reviewRating === 4 && 'Rất tốt ⭐️⭐️⭐️⭐️'}
                        {reviewRating === 3 && 'Bình thường ⭐️⭐️⭐️'}
                        {reviewRating <= 2 && 'Cần cải thiện'}
                      </span>
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-xs font-bold text-[#2D2926] mb-1">
                      Lời nhận xét của bạn:
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Chia sẻ cảm nhận về nét khắc laser, độ mịn của gỗ và thái độ phục vụ..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full p-3 text-xs border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#8B4513]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setReviewOrder(null)}
                      className="px-4 py-2 text-xs font-bold text-[#6B665E] border border-[#DEDAD2] rounded-xl hover:bg-[#F0EDE9]"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="bg-[#8B4513] hover:bg-[#6E360F] text-white px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingReview ? 'Đang gửi...' : 'Gửi Đánh Giá'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* RETURN / EXCHANGE REQUEST FORM DIALOG (7-DAY POLICY) */}
        {returnModalOrder && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl border border-[#EAE7E2] max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
              <div className="flex items-center justify-between border-b border-[#EAE7E2] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                    🔄
                  </div>
                  <div>
                    <h4 className="font-serif-vi font-bold text-base text-[#2D2926]">
                      Yêu Cầu Đổi Trả Sản Phẩm (7 Ngày)
                    </h4>
                    <p className="text-[11px] text-[#8C877E]">
                      Đơn hàng #{returnModalOrder.id} • Khách hàng: {returnModalOrder.customerName}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReturnModalOrder(null)}
                  className="text-[#8C877E] hover:text-[#2D2926] p-1 rounded-full hover:bg-[#F0EDE9]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-1">
                <p className="font-bold">🛡️ Cam kết bảo hành 1-đổi-1 từ xưởng Mộc Điêu:</p>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  Nếu sản phẩm bị nứt gãy trong quá trình vận chuyển, sai nội dung khắc chữ hoặc có lỗi kĩ thuật, xưởng sẽ thu hồi & làm mới hoàn toàn <b>MIỄN PHÍ 100% PHÍ VẬN CHUYỂN</b>.
                </p>
              </div>

              <form onSubmit={handleSubmitReturn} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#2D2926] mb-1.5">
                    Lý do bạn muốn yêu cầu đổi trả / bảo hành:
                  </label>
                  <div className="space-y-2">
                    {[
                      'Hàng bị nứt, vỡ, gãy do vận chuyển',
                      'Nội dung khắc laser sai so với ghi chú đặt hàng',
                      'Gửi sai mẫu sản phẩm / nhầm món đồ',
                      'Lý do khác (chi tiết bên dưới)',
                    ].map((reason) => (
                      <label
                        key={reason}
                        className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all text-xs font-medium ${
                          returnReasonType === reason
                            ? 'bg-[#8B4513]/10 border-[#8B4513] text-[#8B4513] font-bold'
                            : 'bg-[#F8F6F2] border-[#EAE7E2] text-[#2D2926] hover:bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="returnReasonType"
                          value={reason}
                          checked={returnReasonType === reason}
                          onChange={(e) => setReturnReasonType(e.target.value)}
                          className="accent-[#8B4513]"
                        />
                        <span>{reason}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2926] mb-1">
                    Ghi chú chi tiết / Yêu cầu thêm (Tùy chọn):
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Mô tả cụ thể vị trí bị nứt, vỡ hoặc nội dung khắc bị sai để xưởng hỗ trợ xử lý nhanh nhất..."
                    value={returnReasonDetail}
                    onChange={(e) => setReturnReasonDetail(e.target.value)}
                    className="w-full p-3 text-xs border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#8B4513]"
                  />
                </div>

                {/* Upload Minh Họa Lỗi / Sự Cố */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#2D2926] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#8B4513]" />
                      <span>Đính kèm hình ảnh minh họa (Vỡ, nứt, sai khắc...):</span>
                    </span>
                    <span className="text-[10px] text-[#6B665E] font-normal">
                      Tối đa 5 ảnh ({returnImages.length}/5)
                    </span>
                  </label>

                  <div className="grid grid-cols-5 gap-2">
                    {returnImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-[#EAE7E2] bg-[#F8F6F2] group">
                        <img src={img} alt={`Lỗi ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveReturnImage(idx)}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                          title="Xóa ảnh"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {returnImages.length < 5 && (
                      <label className="aspect-square rounded-xl border-2 border-dashed border-[#8B4513]/40 bg-[#8B4513]/5 hover:bg-[#8B4513]/10 flex flex-col items-center justify-center cursor-pointer transition-colors p-1 text-center">
                        {isUploadingReturnImage ? (
                          <Loader2 className="w-4 h-4 text-[#8B4513] animate-spin" />
                        ) : (
                          <>
                            <Upload className="w-4 h-4 text-[#8B4513] mb-0.5" />
                            <span className="text-[9px] font-bold text-[#8B4513]">Tải ảnh</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={isUploadingReturnImage}
                          onChange={handleReturnImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setReturnModalOrder(null);
                      setReturnImages([]);
                    }}
                    className="px-4 py-2 text-xs font-bold text-[#6B665E] border border-[#DEDAD2] rounded-xl hover:bg-[#F0EDE9]"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReturn || isUploadingReturnImage}
                    className="bg-[#8B4513] hover:bg-[#6E360F] text-white px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-xs"
                  >
                    {isSubmittingReturn ? (
                      'Đang gửi...'
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Gửi Yêu Cầu Đổi Trả</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* LIGHTBOX PREVIEW MODAL FOR CUSTOMER */}
        {previewLightboxImage && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setPreviewLightboxImage(null)}
          >
            <div
              className="relative max-w-3xl w-full bg-white rounded-3xl overflow-hidden p-3 shadow-2xl space-y-3 border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-3 py-1 border-b border-[#EAE7E2]">
                <span className="font-bold text-xs text-[#2D2926] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#8B4513]" />
                  <span>Hình Ảnh Chi Tiết</span>
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={previewLightboxImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold px-3 py-1.5 bg-[#8B4513] text-white rounded-xl hover:bg-[#6E360F] transition-colors"
                  >
                    Mở trong tab mới ↗
                  </a>
                  <button
                    type="button"
                    onClick={() => setPreviewLightboxImage(null)}
                    className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-gray-950 rounded-2xl p-2">
                <img
                  src={previewLightboxImage}
                  alt="Ảnh chi tiết"
                  className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-md"
                />
              </div>
            </div>
          </div>
        )}

        {/* Cancel Order Confirmation Modal */}
        {orderToCancel && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setOrderToCancel(null)}
          >
            <div
              className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-[#EAE7E2] relative space-y-4 text-center animate-scaleUp"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-xl shadow-inner">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-serif-vi font-bold text-[#2D2926]">
                  Hủy Đơn Hàng #{orderToCancel.id}
                </h3>
                <p className="text-xs text-[#6B665E]">
                  Bạn có chắc chắn muốn hủy đơn hàng này không? Trạng thái đơn sẽ được chuyển sang "Đã hủy".
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOrderToCancel(null)}
                  className="py-2.5 px-4 rounded-xl border border-[#DEDAD2] text-[#2D2926] text-xs font-bold hover:bg-[#F5F3EF] transition-colors"
                >
                  Quay Lại
                </button>
                <button
                  type="button"
                  disabled={isCancellingOrder}
                  onClick={async () => {
                    setIsCancellingOrder(true);
                    try {
                      await updateOrderStatusInFirestore(orderToCancel.id, 'Đã hủy', 'Khách hàng tự hủy đơn');
                      if (onShowToast) {
                        onShowToast(`🔴 Đã hủy đơn hàng #${orderToCancel.id} thành công.`);
                      }
                      setOrderToCancel(null);
                    } catch (err) {
                      console.error('Lỗi hủy đơn hàng:', err);
                    } finally {
                      setIsCancellingOrder(false);
                    }
                  }}
                  className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isCancellingOrder ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>Xác Nhận Hủy</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default OrderLookupModal;
