import React, { useState } from 'react';
import { ArrowRight, Sparkles, Award, Film, Play } from 'lucide-react';
import { Product } from '../data/products';

interface HeroSectionProps {
  featuredProducts: Product[];
  onExploreClick: () => void;
  onSelectProduct: (product: Product) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  featuredProducts,
  onExploreClick,
  onSelectProduct,
}) => {
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const currentHeroProduct = featuredProducts[activeHeroIndex] || featuredProducts[0];

  return (
    <section className="relative overflow-hidden py-8 sm:py-14 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Typography & Call to actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 bg-[#F0EDE9] px-4 py-1.5 rounded-full border border-[#EAE7E2]">
              <Sparkles className="w-4 h-4 text-[#8B4513]" />
              <span className="text-[#5A5A40] font-serif-vi italic text-sm sm:text-base">
                Chế Tác Gỗ Laser & Khắc Theo Yêu Cầu
              </span>
            </div>

            <h2 className="text-4xl sm:text-6xl font-serif-vi leading-[1.15] text-[#2D2926]">
              Móc Khóa & Ảnh Gỗ <br className="hidden sm:inline" />
              <span className="text-[#5A5A40]">Cá Nhân Hóa</span>
            </h2>

            <p className="text-[#6B665E] text-base sm:text-lg leading-relaxed max-w-xl">
              Chuyên thiết kế và chế tác móc khóa gỗ, tranh/ảnh chân dung laser, thước gỗ học sinh, quà tặng gỗ khắc tên, ngày kỷ niệm, biển số xe & lời chúc cá nhân hóa theo yêu cầu.
            </p>

            <div className="flex flex-wrap gap-3 sm:gap-4 pt-4">
              <button
                onClick={onExploreClick}
                className="bg-[#5A5A40] text-white px-7 py-3.5 sm:px-8 sm:py-4 rounded-full text-xs sm:text-sm font-bold tracking-widest uppercase hover:bg-[#4A4A35] transition-all shadow-md flex items-center gap-2.5 group cursor-pointer"
              >
                <span>Đặt Khắc Ngay</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href="#videos-section"
                className="border border-[#8B4513] text-[#8B4513] px-6 py-3.5 sm:px-7 sm:py-4 rounded-full text-xs sm:text-sm font-bold tracking-widest uppercase hover:bg-[#8B4513] hover:text-white transition-all flex items-center gap-2 shadow-2xs"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Xem Video Chế Tác</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 border-t border-[#EAE7E2] flex flex-wrap gap-8 items-center text-xs text-[#6B665E]">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5A5A40]"></span>
                <span><b>100% Gỗ Tự Nhiên</b> (Maple, Beech, Tần Bì)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8B4513]"></span>
                <span><b>Khắc Laser HD</b> rõ nét từng chi tiết</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5A5A40]"></span>
                <span><b>Duyệt Demo Ảnh</b> trước khi sản xuất</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Specialty Card in Natural Tones oval frame */}
          <div className="lg:col-span-5 relative flex items-center justify-center py-6">
            <div
              onClick={() => currentHeroProduct && onSelectProduct(currentHeroProduct)}
              className="w-[320px] sm:w-[380px] h-[450px] sm:h-[500px] bg-[#EAE7E2] rounded-[180px] sm:rounded-[200px] overflow-hidden relative shadow-2xl group cursor-pointer border-4 border-white transition-transform hover:scale-[1.01]"
            >
              {/* Product Background Image */}
              {currentHeroProduct && (
                <img
                  src={currentHeroProduct.imageUrl}
                  alt={currentHeroProduct.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-[#2D2926]/80 via-[#2D2926]/20 to-transparent"></div>

              {/* Top pill badge */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-[#5A5A40]/90 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase shadow-md">
                {currentHeroProduct?.badge || 'Phiên Bản Giới Hạn'}
              </div>

              {/* Bottom product title card */}
              <div className="absolute bottom-8 left-6 right-6 text-center text-white p-4">
                <span className="text-4xl mb-2 inline-block drop-shadow-md">
                  {currentHeroProduct?.emoji}
                </span>
                <h3 className="font-serif-vi italic text-xl sm:text-2xl drop-shadow-sm font-semibold">
                  {currentHeroProduct?.name}
                </h3>
                <div className="mt-3 inline-block bg-white text-[#2D2926] px-5 py-1.5 rounded-full text-xs font-bold shadow-sm">
                  {currentHeroProduct?.price.toLocaleString('vi-VN')} đ
                </div>
              </div>
            </div>

            {/* Floating badge bottom left */}
            <div className="absolute -bottom-2 sm:-bottom-4 left-2 sm:-left-4 bg-white p-4 sm:p-5 rounded-3xl shadow-xl flex items-center gap-3.5 border border-[#F0EDE9] z-10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#F5F5F0] rounded-full flex items-center justify-center text-xl">
                🌿
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-tighter text-[#2D2926]">
                  100% Tự Nhiên
                </p>
                <p className="text-[10px] text-[#8C877E]">
                  Nguyên liệu bền vững
                </p>
              </div>
            </div>

            {/* Floating artisan badge top right */}
            <div className="absolute top-4 right-0 sm:-right-4 bg-white p-4 rounded-3xl shadow-xl flex items-center gap-3 border border-[#F0EDE9] z-10">
              <div className="w-10 h-10 bg-[#F0EDE9] rounded-full flex items-center justify-center text-[#8B4513]">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-tighter text-[#2D2926]">
                  Tinh Hoa Làng Nghề
                </p>
                <p className="text-[10px] text-[#6B665E]">
                  Nghệ nhân Việt Nam
                </p>
              </div>
            </div>

            {/* Thumbnails to switch hero item */}
            <div className="absolute -right-2 bottom-12 flex flex-col gap-2 z-20">
              {featuredProducts.slice(0, 3).map((prod, idx) => (
                <button
                  key={prod.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveHeroIndex(idx);
                  }}
                  className={`w-10 h-10 rounded-full border-2 overflow-hidden shadow-md transition-all ${
                    activeHeroIndex === idx
                      ? 'border-[#8B4513] scale-110'
                      : 'border-white opacity-70 hover:opacity-100'
                  }`}
                  title={prod.name}
                >
                  <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
