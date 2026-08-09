import React from 'react';
import { Mail, Phone, MapPin, Heart, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { FooterConfig, DEFAULT_FOOTER_CONFIG } from '../types/auth';

interface FooterProps {
  onOpenSecurity?: () => void;
  footerConfig?: FooterConfig;
}

export const Footer: React.FC<FooterProps> = ({ onOpenSecurity, footerConfig }) => {
  const cfg = { ...DEFAULT_FOOTER_CONFIG, ...footerConfig };

  return (
    <footer className="bg-[#2D2926] text-[#FDFBF7] pt-16 pb-8 border-t border-[#EAE7E2]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Top benefits row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-[#EAE7E2]/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#5A5A40]/30 flex items-center justify-center text-[#EAE7E2] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-serif-vi font-semibold text-sm">
                {cfg.benefit1Title}
              </h5>
              <p className="text-xs text-[#8C877E]">
                {cfg.benefit1Desc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#8B4513]/30 flex items-center justify-center text-[#EAE7E2] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-serif-vi font-semibold text-sm">
                {cfg.benefit2Title}
              </h5>
              <p className="text-xs text-[#8C877E]">
                {cfg.benefit2Desc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#5A5A40]/30 flex items-center justify-center text-[#EAE7E2] shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-serif-vi font-semibold text-sm">
                {cfg.benefit3Title}
              </h5>
              <p className="text-xs text-[#8C877E]">
                {cfg.benefit3Desc}
              </p>
            </div>
          </div>
        </div>

        {/* Main Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 py-12">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex flex-col">
              <h4 className="text-2xl font-bold tracking-tight text-[#EAE7E2] font-serif-vi">
                {cfg.brandName}
              </h4>
              <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-[#8B4513]">
                {cfg.brandSub}
              </span>
            </div>
            <p className="text-xs text-[#8C877E] leading-relaxed max-w-sm">
              {cfg.brandDesc}
            </p>
            <div className="space-y-2 text-xs text-[#DEDAD2]">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#8B4513] shrink-0" />
                <span>{cfg.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#5A5A40] shrink-0" />
                <span>{cfg.phone}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#8B4513] shrink-0" />
                <span>{cfg.email}</span>
              </p>
            </div>
          </div>

          {/* Col 2: Làng nghề nổi bật */}
          <div className="lg:col-span-3 space-y-3">
            <h5 className="text-sm font-bold uppercase tracking-widest text-[#EAE7E2]">
              Làng Nghề Mộc
            </h5>
            <ul className="space-y-2 text-xs text-[#8C877E]">
              <li>
                <a href="#stories-section" className="hover:text-white transition-colors">
                  Làng Mộc Kim Bồng (Quảng Nam)
                </a>
              </li>
              <li>
                <a href="#stories-section" className="hover:text-white transition-colors">
                  Làng Mộc Đồng Kỵ (Bắc Ninh)
                </a>
              </li>
              <li>
                <a href="#stories-section" className="hover:text-white transition-colors">
                  Làng Mộc Chàng Sơn (Hà Nội)
                </a>
              </li>
              <li>
                <a href="#stories-section" className="hover:text-white transition-colors">
                  Làng Mộc La Xuyên (Nam Định)
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Hỗ trợ khách hàng */}
          <div className="lg:col-span-2 space-y-3">
            <h5 className="text-sm font-bold uppercase tracking-widest text-[#EAE7E2]">
              Chính Sách & Hỗ Trợ
            </h5>
            <ul className="space-y-2 text-xs text-[#8C877E]">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Hướng dẫn mua hàng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Chính sách đổi trả 7 ngày
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenSecurity}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Bảo mật thông tin (SSL 256-bit)
                </button>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Quà tặng doanh nghiệp
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div className="lg:col-span-3 space-y-3">
            <h5 className="text-sm font-bold uppercase tracking-widest text-[#EAE7E2]">
              Nhận Câu Chuyện Làng Nghề
            </h5>
            <p className="text-xs text-[#8C877E] leading-relaxed">
              Đăng ký để nhận thông báo về các bộ sưu tập giới hạn và ưu đãi 10% cho đơn hàng đầu tiên.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Cảm ơn bạn đã đăng ký nhận bản tin BẢN SẮC VIỆT!');
              }}
              className="flex gap-2"
            >
              <input
                type="email"
                required
                placeholder="Email của bạn..."
                className="w-full px-3 py-2 text-xs bg-[#2D2926] border border-[#5A5A40] rounded-full text-white placeholder-[#8C877E] focus:outline-none focus:border-white"
              />
              <button
                type="submit"
                className="bg-[#5A5A40] hover:bg-[#4A4A35] text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shrink-0"
              >
                Gửi
              </button>
            </form>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-[#EAE7E2]/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] uppercase tracking-[0.2em] text-[#8C877E]">
          <span>{cfg.copyright}</span>
          <span className="flex items-center gap-1.5">
            Thiết kế với <Heart className="w-3 h-3 text-[#8B4513] fill-current" /> tại Việt Nam
          </span>
          <span>Giao hàng toàn quốc • Thanh toán an toàn</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


