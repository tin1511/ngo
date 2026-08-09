import React from 'react';
import { Award, HeartHandshake, Leaf, Sparkles, ShieldCheck } from 'lucide-react';

export const ArtisansSection: React.FC = () => {
  const values = [
    {
      icon: <Award className="w-6 h-6 text-[#8B4513]" />,
      title: 'Công Nghệ Khắc Laser HD',
      desc: 'Hệ thống máy khắc laser hiện đại tái hiện hình ảnh chân dung, logo và nét chữ độ phân giải cao sắc nét trọn đời.',
    },
    {
      icon: <Leaf className="w-6 h-6 text-[#5A5A40]" />,
      title: '100% Gỗ Tự Nhiên Tuyển Chọn',
      desc: 'Chế tác từ gỗ Maple Bắc Mỹ, Gỗ Beech, Gỗ Tần Bì và Gỗ Cẩm Lai vân gỗ mịn màng, chống ẩm mốc cong vênh.',
    },
    {
      icon: <HeartHandshake className="w-6 h-6 text-[#8B4513]" />,
      title: 'Cá Nhân Hóa Độc Bản',
      desc: 'Nhận thiết kế & khắc nội dung riêng: tên, ngày kỷ niệm, biển số xe, ảnh cá nhân, logo trường học & doanh nghiệp.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#5A5A40]" />,
      title: 'Duyệt Demo Trước Khi In',
      desc: 'Gửi bản xem trước thiết kế 2D/3D cho khách duyệt chỉnh sửa vừa ý trước khi tiến hành khắc laser hàng loạt.',
    },
  ];

  return (
    <section id="artisans-section" className="py-16 bg-[#FDFBF7] border-t border-[#EAE7E2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-[#F0EDE9] px-3.5 py-1 rounded-full text-xs text-[#5A5A40] font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Xưởng Khắc Gỗ Uy Tín</span>
          </div>
          <h3 className="text-3xl sm:text-4xl font-serif-vi font-bold text-[#2D2926]">
            Tại Sao Chọn Khắc Gỗ Mộc Điêu?
          </h3>
          <p className="text-xs sm:text-sm text-[#6B665E] leading-relaxed">
            Mỗi món quà móc khóa, thước gỗ, bức ảnh chân dung khắc gỗ đều mang đậm cảm xúc cá nhân và thông điệp yêu thương duy nhất.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((val, idx) => (
            <div
              key={idx}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE7E2] hover:border-[#DEDAD2] hover:shadow-lg transition-all flex flex-col items-start text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#F5F5F0] flex items-center justify-center mb-4">
                {val.icon}
              </div>
              <h4 className="text-base font-serif-vi font-bold text-[#2D2926] mb-2">
                {val.title}
              </h4>
              <p className="text-xs sm:text-sm text-[#6B665E] leading-relaxed">
                {val.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Banner callout bottom */}
        <div className="mt-14 bg-[#5A5A40] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#4A4A35] to-transparent opacity-50 pointer-events-none"></div>
          <div className="relative z-10 max-w-2xl space-y-4 text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-[#EAE7E2] bg-white/10 px-3 py-1 rounded-full">
              Khắc gỗ theo yêu cầu
            </span>
            <h4 className="text-2xl sm:text-3xl font-serif-vi font-bold leading-tight">
              Tạo Món Quà Ý Nghĩa Dành Tặng Người Thân, Cặp Đôi & Bạn Bè
            </h4>
            <p className="text-xs sm:text-sm text-[#F0EDE9] leading-relaxed">
              Nhận khắc đơn lẻ và đơn số lượng lớn quà tặng doanh nghiệp, quà tri ân thầy cô, quà tốt nghiệp, sinh nhật hay ngày kỷ niệm lãng mạn.
            </p>
            <div className="pt-2">
              <a
                href="#products-section"
                className="inline-block bg-white text-[#2D2926] px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#FDFBF7] transition-all shadow-md"
              >
                Khám Phá Danh Mục Sản Phẩm
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
