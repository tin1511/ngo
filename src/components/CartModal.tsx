import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, CheckCircle2, ShieldCheck, Ticket, Loader2, Tag, Truck, Upload, Image as ImageIcon } from 'lucide-react';
import { Product, PROMO_CODES } from '../data/products';
import { addOrderToFirestore, uploadOrderImage } from '../lib/firestoreService';
import { sendOrderNotificationToAdmin } from '../lib/emailService';
import { Order, Voucher, DEFAULT_VOUCHERS, UserAccount, ShippingConfig, DEFAULT_SHIPPING_CONFIG } from '../types/auth';
import { compressImageFile } from '../lib/imageUtils';

export interface CartItem {
  product: Product;
  quantity: number;
  engravingNote?: string;
  noteImages?: string[];
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  currentUser?: UserAccount | null;
  shippingConfig?: ShippingConfig;
  vouchers?: Voucher[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onPlaceOrder?: (order: Order) => Promise<void> | void;
  onOpenAuth?: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  currentUser,
  shippingConfig = DEFAULT_SHIPPING_CONFIG,
  vouchers = DEFAULT_VOUCHERS,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onPlaceOrder,
  onOpenAuth,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Form checkout state
  const [customerName, setCustomerName] = useState('');

  React.useEffect(() => {
    if (currentUser?.name && !customerName) {
      setCustomerName(currentUser.name);
    }
  }, [currentUser]);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [engravingNote, setEngravingNote] = useState('');
  const [noteImages, setNoteImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingImage(true);
    try {
      const newImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        if (noteImages.length + newImages.length >= 5) {
          alert('Tối đa 5 hình ảnh đính kèm cho mỗi đơn hàng.');
          break;
        }
        const compressed = await compressImageFile(files[i]);
        newImages.push(compressed);
      }
      setNoteImages((prev) => [...prev, ...newImages]);
    } catch (err) {
      console.error('Lỗi nén ảnh:', err);
      alert('Không thể tải ảnh lên. Vui lòng chọn lại file ảnh.');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setNoteImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Prefill customer name if logged in
  React.useEffect(() => {
    if (currentUser?.name && !customerName) {
      setCustomerName(currentUser.name);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const activeVouchers = (vouchers ?? DEFAULT_VOUCHERS).filter(v => v.active);

  let discount = 0;
  const currentVoucher = activeVouchers.find((v) => v.code.toUpperCase() === appliedPromo?.toUpperCase());

  if (currentVoucher) {
    if (currentVoucher.discountPercent) {
      discount = Math.round((subtotal * currentVoucher.discountPercent) / 100);
    } else if (currentVoucher.discountAmount) {
      discount = currentVoucher.discountAmount;
    }
  } else if (appliedPromo && PROMO_CODES[appliedPromo]) {
    const codeData = PROMO_CODES[appliedPromo];
    if (codeData.discountPercent) {
      discount = Math.round((subtotal * codeData.discountPercent) / 100);
    } else if (codeData.discountAmount) {
      discount = codeData.discountAmount;
    }
  }

  const freeThreshold = shippingConfig?.freeShippingThreshold ?? 1000000;
  const defaultFee = shippingConfig?.defaultShippingFee ?? 40000;
  const isFreeShipEligible = subtotal >= freeThreshold && subtotal > 0;
  const shippingFee = isFreeShipEligible ? 0 : defaultFee;
  const total = Math.max(0, subtotal - discount + shippingFee);

  const handleApplyPromo = () => {
    const cleanCode = promoCode.trim().toUpperCase();

    if (cleanCode === 'FREESHIP' && !isFreeShipEligible) {
      setPromoError(
        `Voucher FREESHIP chỉ áp dụng cho đơn hàng từ ${freeThreshold.toLocaleString('vi-VN')}đ trở lên. Đơn hiện tại: ${subtotal.toLocaleString('vi-VN')}đ. Vui lòng mua thêm ${(freeThreshold - subtotal).toLocaleString('vi-VN')}đ!`
      );
      return;
    }

    const foundVoucher = activeVouchers.find((v) => v.code.toUpperCase() === cleanCode);
    if (foundVoucher) {
      if (foundVoucher.minOrderTotal && subtotal < foundVoucher.minOrderTotal) {
        setPromoError(
          `Voucher ${foundVoucher.code} chỉ áp dụng cho đơn hàng từ ${foundVoucher.minOrderTotal.toLocaleString('vi-VN')}đ trở lên.`
        );
        return;
      }
      setAppliedPromo(foundVoucher.code);
      setPromoError('');
    } else if (PROMO_CODES[cleanCode]) {
      setAppliedPromo(cleanCode);
      setPromoError('');
    } else {
      setPromoError('Mã ưu đãi không tồn tại hoặc đã hết hạn.');
    }
  };

  const handleFinishOrderAndClose = () => {
    onClearCart();
    setOrderSuccess(false);
    setIsCheckingOut(false);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setEngravingNote('');
    setNoteImages([]);
    onClose();
  };

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerAddress) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng!');
      return;
    }

    setIsSubmittingOrder(true);
    const orderId = `MD-${Date.now().toString().slice(-6)}`;

    // Combine any top-level noteImages and item-level noteImages
    const combinedNoteImages = [
      ...noteImages,
      ...cartItems.flatMap((item) => item.noteImages || []),
    ].filter(Boolean);

    const newOrder: Order = {
      id: orderId,
      userId: currentUser?.username || undefined,
      username: currentUser?.username || undefined,
      userEmail: currentUser?.email || undefined,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      engravingNote: engravingNote.trim() || undefined,
      notes: engravingNote.trim() || undefined,
      noteImages: combinedNoteImages.length > 0 ? Array.from(new Set(combinedNoteImages)) : undefined,
      items: cartItems.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.imageUrl,
        village: item.product.village || '',
        price: item.product.price,
        quantity: item.quantity,
        engravingNote: item.engravingNote,
        noteImages: item.noteImages,
      })),
      subtotal,
      discount,
      shippingFee,
      total,
      promoCode: appliedPromo || undefined,
      status: 'Mới tiếp nhận',
      createdAt: new Date().toISOString(),
    };

    // Fast optimistic trigger
    if (onPlaceOrder) {
      onPlaceOrder(newOrder);
    }

    // Immediately show success screen to remove perceived lag
    setOrderSuccess(true);
    setIsSubmittingOrder(false);

    // Save to Firestore asynchronously in background
    addOrderToFirestore(newOrder).catch((err) => {
      console.error('Lỗi lưu đơn hàng vào Firestore Cloud:', err);
    });

    // Send email notification to Admin
    sendOrderNotificationToAdmin(newOrder).catch((err) => {
      console.error('Lỗi gửi email thông báo đơn hàng mới tới Admin:', err);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2926]/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-[#FDFBF7] rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-[#EAE7E2]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#EAE7E2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#5A5A40]" />
            <h3 className="text-xl font-serif-vi font-bold text-[#2D2926]">
              Giỏ Hàng Tinh Hoa ({cartItems.length} sản phẩm)
            </h3>
          </div>
          <button
            onClick={orderSuccess ? handleFinishOrderAndClose : onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-[#F0EDE9] text-[#2D2926] flex items-center justify-center transition-colors border border-[#EAE7E2] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {orderSuccess ? (
            <div className="text-center py-10 space-y-4 animate-fadeIn">
              <CheckCircle2 className="w-16 h-16 text-[#5A5A40] mx-auto animate-bounce" />
              <h4 className="text-2xl font-serif-vi font-bold text-[#2D2926]">
                Đơn Hàng Đã Được Tiếp Nhận!
              </h4>
              <p className="text-xs sm:text-sm text-[#6B665E] max-w-md mx-auto leading-relaxed">
                Cảm ơn bạn đã trân quý và ủng hộ các nghệ nhân thủ công truyền thống Việt Nam. Chúng tôi sẽ gọi xác nhận đơn hàng qua số <b>{customerPhone}</b> sớm nhất.
              </p>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleFinishOrderAndClose}
                  className="bg-[#5A5A40] hover:bg-[#4A4A35] text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95"
                >
                  Hoàn Tất & Xem Tiếp
                </button>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 bg-[#F0EDE9] rounded-full flex items-center justify-center mx-auto text-3xl">
                🏮
              </div>
              <p className="text-sm font-serif-vi font-bold text-[#2D2926]">
                Giỏ hàng hiện đang trống
              </p>
              <p className="text-xs text-[#6B665E]">
                Khám phá các sản phẩm thủ công mỹ nghệ Việt Nam ngay nhé.
              </p>
              <button
                onClick={onClose}
                className="bg-[#5A5A40] text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#4A4A35] transition-colors"
              >
                Tiếp Tục Mua Sắm
              </button>
            </div>
          ) : !isCheckingOut ? (
            <div className="space-y-6">
              {/* List of Cart Items */}
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-4 p-3 bg-white rounded-2xl border border-[#EAE7E2] shadow-2xs"
                  >
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-xl shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#8C877E] font-serif-vi">
                        {item.product.village}
                      </p>
                      <h4 className="font-medium text-xs sm:text-sm text-[#2D2926] truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-xs font-bold text-[#5A5A40] mt-1">
                        {item.product.price.toLocaleString('vi-VN')} đ
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center border border-[#DEDAD2] rounded-full px-2 py-1">
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.product.id, item.quantity - 1)
                        }
                        className="w-6 h-6 flex items-center justify-center font-bold text-sm text-[#2D2926]"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-bold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="w-6 h-6 flex items-center justify-center font-bold text-sm text-[#2D2926]"
                      >
                        +
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-[#8C877E] hover:text-red-600 p-1.5 transition-colors"
                      title="Xóa sản phẩm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Automatic Free Shipping Status Banner */}
              {subtotal > 0 && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 transition-all ${
                    isFreeShipEligible
                      ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-2xs'
                      : 'bg-amber-50/90 border-amber-300 text-amber-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isFreeShipEligible ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      {isFreeShipEligible ? (
                        <>
                          <p className="font-bold text-emerald-800 text-xs flex items-center gap-1">
                            <span>🎉 TỰ ĐỘNG ÁP DỤNG VOUCHER MIỄN PHÍ VẬN CHUYỂN</span>
                          </p>
                          <p className="text-[11px] text-emerald-700 mt-0.5">
                            Đơn hàng đạt từ <b>{freeThreshold.toLocaleString('vi-VN')}đ</b> — Hệ thống đã tự động kích hoạt Miễn Phí Ship (Tiết kiệm {defaultFee.toLocaleString('vi-VN')}đ).
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-bold text-amber-900 text-xs">
                            🚚 Chưa đủ điều kiện Miễn Phí Vận Chuyển
                          </p>
                          <p className="text-[11px] text-amber-800 mt-0.5">
                            Mua thêm <b className="text-red-700 font-bold font-mono">{(freeThreshold - subtotal).toLocaleString('vi-VN')}đ</b> để hệ thống <b>TỰ ĐỘNG MIỄN PHÍ SHIP</b> toàn quốc!
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  {isFreeShipEligible && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg shrink-0">
                      -100% Ship
                    </span>
                  )}
                </div>
              )}

              {/* Promo code input & Available Vouchers */}
              <div className="p-4 bg-[#F8F6F2] border border-[#EAE7E2] rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#2D2926] flex items-center gap-1.5">
                    <Ticket className="w-4 h-4 text-[#8B4513]" />
                    Mã Ưu Đãi / Voucher Shop
                  </label>
                  {appliedPromo && (
                    <button
                      onClick={() => {
                        setAppliedPromo(null);
                        setPromoCode('');
                        setPromoError('');
                      }}
                      className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                    >
                      Bỏ áp dụng
                    </button>
                  )}
                </div>

                {/* Voucher Quick Selector List */}
                {activeVouchers.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] text-[#8C877E] font-medium">Chạm để dùng nhanh mã giảm giá:</p>
                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1">
                      {activeVouchers.map((v) => {
                        const isFreeshipCode = v.code.toUpperCase() === 'FREESHIP';
                        const requiredMin = isFreeshipCode ? freeThreshold : (v.minOrderTotal || 0);
                        const isEligible = subtotal >= requiredMin;
                        const isApplied = appliedPromo?.toUpperCase() === v.code.toUpperCase();

                        return (
                          <div
                            key={v.code}
                            className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 transition-all ${
                              isFreeshipCode && isFreeShipEligible
                                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                                : isApplied
                                ? 'bg-[#8B4513]/10 border-[#8B4513] text-[#8B4513]'
                                : !isEligible
                                ? 'bg-gray-50 border-gray-200 opacity-70'
                                : 'bg-white border-[#EAE7E2] hover:border-[#8B4513]'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="font-mono font-bold text-xs flex items-center gap-1.5 flex-wrap">
                                <Tag className="w-3.5 h-3.5 text-[#8B4513]" />
                                <span>{v.code}</span>
                                {isFreeshipCode ? (
                                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-md border border-emerald-200">
                                    FREESHIP 0đ
                                  </span>
                                ) : v.discountPercent ? (
                                  <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded-md">
                                    -{v.discountPercent}%
                                  </span>
                                ) : v.discountAmount ? (
                                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-md">
                                    -{v.discountAmount.toLocaleString('vi-VN')}đ
                                  </span>
                                ) : null}
                              </div>
                              <p className="text-[11px] text-[#6B665E] truncate mt-0.5">
                                {isFreeshipCode ? `Miễn phí giao hàng toàn quốc cho đơn từ ${freeThreshold.toLocaleString('vi-VN')}đ` : v.desc}
                              </p>
                            </div>

                            <div>
                              {isFreeshipCode && isFreeShipEligible ? (
                                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300 shrink-0">
                                  ✓ Tự động kích hoạt
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!isEligible) {
                                      setPromoError(
                                        isFreeshipCode
                                          ? `Voucher FREESHIP chỉ áp dụng cho đơn từ ${freeThreshold.toLocaleString('vi-VN')}đ trở lên. Vui lòng mua thêm ${(freeThreshold - subtotal).toLocaleString('vi-VN')}đ!`
                                          : `Voucher ${v.code} chỉ áp dụng cho đơn từ ${requiredMin.toLocaleString('vi-VN')}đ trở lên.`
                                      );
                                      return;
                                    }
                                    setAppliedPromo(v.code);
                                    setPromoCode(v.code);
                                    setPromoError('');
                                  }}
                                  className={`text-[10px] font-bold px-3 py-1.5 rounded-lg shrink-0 cursor-pointer transition-all ${
                                    isApplied
                                      ? 'bg-[#8B4513] text-white shadow-xs'
                                      : !isEligible
                                      ? 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                                      : 'bg-[#F0EDE9] text-[#2D2926] hover:bg-[#8B4513] hover:text-white'
                                  }`}
                                >
                                  {isApplied ? '✓ Đã dùng' : !isEligible ? 'Chưa đủ ĐK' : 'Áp dụng'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Custom code input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Khác: Nhập mã giảm giá..."
                    className="flex-1 px-3 py-2 text-xs bg-white border border-[#DEDAD2] rounded-xl focus:outline-none focus:border-[#8B4513] uppercase font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="bg-[#8B4513] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#6E360F] cursor-pointer shrink-0"
                  >
                    Áp Dụng
                  </button>
                </div>

                {appliedPromo && (
                  <p className="text-xs text-green-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    Đã áp dụng thành công mã ưu đãi <b className="font-mono">{appliedPromo}</b>!
                  </p>
                )}
                {promoError && (
                  <p className="text-xs text-red-600 font-medium">{promoError}</p>
                )}
              </div>

              {/* Summary totals */}
              <div className="space-y-2 text-xs border-t border-[#EAE7E2] pt-4">
                <div className="flex justify-between text-[#6B665E]">
                  <span>Tạm tính:</span>
                  <span>{subtotal.toLocaleString('vi-VN')} đ</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#8B4513] font-semibold">
                    <span>Ưu đãi giảm giá:</span>
                    <span>-{discount.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}
                <div className="flex justify-between items-start text-[#6B665E]">
                  <div className="flex flex-col">
                    <span>Phí vận chuyển toàn quốc:</span>
                    {shippingConfig?.shippingNote && (
                      <span className="text-[10px] text-amber-800 font-medium">
                        {shippingConfig.shippingNote}
                      </span>
                    )}
                  </div>
                  <span className="font-semibold">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]">
                        Miễn Phí
                      </span>
                    ) : (
                      `${shippingFee.toLocaleString('vi-VN')} đ`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#2D2926] pt-2 border-t border-[#EAE7E2]">
                  <span>Tổng thanh toán:</span>
                  <span className="text-[#5A5A40]">
                    {total.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleCompleteOrder} className="space-y-4">
              <div className="p-3 bg-[#F0EDE9] rounded-2xl text-xs text-[#5A5A40] font-medium flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Thanh toán khi nhận hàng (COD) hoặc chuyển khoản QR an toàn.</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D2926] mb-1">
                    Họ và tên người nhận *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="VD: Nguyễn Văn An"
                    className="w-full px-4 py-2.5 text-xs bg-white border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2926] mb-1">
                    Số điện thoại liên hệ *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="VD: 0901 xxx xxx"
                    className="w-full px-4 py-2.5 text-xs bg-white border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2926] mb-1">
                    Địa chỉ nhận hàng (Số nhà, đường, phường/xã, tỉnh/thành) *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="VD: 123 Đường Láng, Đống Đa, Hà Nội"
                    className="w-full px-4 py-2.5 text-xs bg-white border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40]"
                  />
                </div>

                {/* Yeu Cau Khac Laser Theo Yeu Cau & Tai Anh Minh Hoa */}
                <div className="bg-amber-50/70 p-3.5 sm:p-4 rounded-2xl border border-amber-200/90 space-y-2.5">
                  <label className="block text-xs font-bold text-[#8B4513] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span>✒️</span>
                      <span>Yêu Cầu Khắc Laser Chữ / Lời Chúc & Tải Ảnh Mẫu:</span>
                    </span>
                    <span className="text-[10px] text-amber-800 bg-amber-100 font-bold px-2 py-0.5 rounded-md">
                      Miễn Phí Khắc
                    </span>
                  </label>
                  <textarea
                    rows={2}
                    value={engravingNote}
                    onChange={(e) => setEngravingNote(e.target.value)}
                    placeholder="VD: Nhờ nghệ nhân khắc chữ 'Kỷ niệm 10 năm - Anh Nam & Chị Mai' hoặc 'Chúc Mừng Tân Gia' lên sản phẩm..."
                    className="w-full px-3.5 py-2 text-xs bg-white border border-amber-300 rounded-xl focus:outline-none focus:border-[#8B4513] text-[#2D2926]"
                  />

                  {/* Image Attachment Upload Section */}
                  <div className="pt-2 border-t border-amber-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2D2926] flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-[#8B4513]" />
                        <span>Tải Ảnh Chân Dụng / Logo / Phác Thảo Khắc Laser (Nếu có):</span>
                      </span>
                      <span className="text-[10px] text-[#8C877E] font-medium">Tối đa 5 ảnh</span>
                    </div>

                    {noteImages.length > 0 && (
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 pt-1">
                        {noteImages.map((imgUrl, index) => (
                          <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-amber-300 bg-white shadow-2xs">
                            <img src={imgUrl} alt={`Ảnh ghi chú ${index + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-90 hover:opacity-100 shadow-xs cursor-pointer transition-all"
                              title="Xóa ảnh này"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-amber-300 hover:border-[#8B4513] text-[#8B4513] text-xs font-bold rounded-xl cursor-pointer transition-all shadow-2xs">
                        <Upload className="w-4 h-4" />
                        <span>{isUploadingImage ? 'Đang xử lý ảnh...' : '+ Tải ảnh mẫu / Chân dung'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={isUploadingImage || noteImages.length >= 5}
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      {isUploadingImage && <Loader2 className="w-4 h-4 animate-spin text-[#8B4513]" />}
                    </div>

                    <p className="text-[10px] text-[#8C877E] italic">
                      💡 Cả thông tin chữ & hình ảnh đính kèm sẽ gửi trực tiếp cho Quản Trị Viên & Nghệ Nhân để tiến hành khắc laser chuẩn xác nhất.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#EAE7E2] text-xs space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Tổng thanh toán:</span>
                  <span className="text-base text-[#5A5A40]">{total.toLocaleString('vi-VN')} đ</span>
                </div>
                <p className="text-[11px] text-[#8C877E]">
                  Giao hàng tiêu chuẩn: 2-4 ngày làm việc
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCheckingOut(false)}
                  className="w-1/3 border border-[#DEDAD2] text-[#2D2926] py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#F0EDE9]"
                >
                  Quay Lại
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className="flex-1 bg-[#8B4513] text-white py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#6E360F] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                >
                  {isSubmittingOrder ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang Gửi Đơn Hàng...</span>
                    </>
                  ) : (
                    <span>Xác Nhận Đặt Hàng</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        {!orderSuccess && cartItems.length > 0 && !isCheckingOut && (
          <div className="p-6 border-t border-[#EAE7E2] bg-white flex items-center justify-between gap-4">
            <button
              onClick={onClose}
              className="text-xs text-[#6B665E] hover:text-[#2D2926] font-medium"
            >
              Tiếp Tục Chọn Đồ
            </button>
            <button
              onClick={() => {
                if (!currentUser && onOpenAuth) {
                  onClose();
                  onOpenAuth();
                  return;
                }
                setIsCheckingOut(true);
              }}
              className="bg-[#5A5A40] hover:bg-[#4A4A35] text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span>Tiến Hành Đặt Hàng</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
