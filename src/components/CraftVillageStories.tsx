import React, { useState } from 'react';
import { CRAFT_VILLAGES, CraftVillageStory } from '../data/products';
import { ArrowRight, MapPin, Award } from 'lucide-react';

interface CraftVillageStoriesProps {
  onSelectVillageFilter: (villageName: string) => void;
}

export const CraftVillageStories: React.FC<CraftVillageStoriesProps> = ({
  onSelectVillageFilter,
}) => {
  const [selectedStory, setSelectedStory] = useState<CraftVillageStory>(CRAFT_VILLAGES[0]);

  return (
    <section id="stories-section" className="py-16 bg-[#F5F5F0] border-y border-[#EAE7E2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#8B4513]">
              Di Sản Văn Hóa
            </span>
            <h3 className="text-3xl sm:text-4xl font-serif-vi font-bold text-[#2D2926] mt-1">
              Câu Chuyện Làng Nghề & Nghệ Nhân
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#6B665E] max-w-md">
            Mỗi sản phẩm đều chở theo tinh hoa lịch sử hàng trăm năm và bàn tay cần mẫn của các nghệ nhân truyền thống từ khắp ba miền đất nước.
          </p>
        </div>

        {/* Village Stories Grid / Interactive Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Village Selection List */}
          <div className="lg:col-span-5 space-y-3">
            {CRAFT_VILLAGES.map((village) => {
              const isSelected = selectedStory.id === village.id;
              return (
                <div
                  key={village.id}
                  onClick={() => setSelectedStory(village)}
                  className={`p-5 rounded-3xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-white border-[#5A5A40] shadow-md'
                      : 'bg-white/50 border-transparent hover:bg-white hover:border-[#EAE7E2]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B4513] flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {village.province}
                      </span>
                      <h4 className="text-base sm:text-lg font-serif-vi font-bold text-[#2D2926] mt-0.5">
                        {village.name}
                      </h4>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        isSelected
                          ? 'bg-[#5A5A40] text-white'
                          : 'bg-[#EAE7E2] text-[#6B665E]'
                      }`}
                    >
                      {village.productCount} tác phẩm
                    </span>
                  </div>
                  <p className="text-xs text-[#6B665E] mt-2 italic font-serif-vi line-clamp-1">
                    {village.history}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right: Featured Story Card */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE7E2] shadow-xl relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="aspect-[4/3] md:aspect-square rounded-2xl overflow-hidden relative">
                <img
                  src={selectedStory.heroImage}
                  alt={selectedStory.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2D2926]/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-[#5A5A40] px-2.5 py-1 rounded-full">
                    {selectedStory.featuredCategory}
                  </span>
                </div>
              </div>

              <div className="flex flex-col justify-between space-y-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs text-[#8B4513] font-semibold mb-1">
                    <Award className="w-4 h-4" />
                    <span>{selectedStory.artisanName}</span>
                  </div>
                  <h4 className="text-2xl font-serif-vi font-bold text-[#2D2926]">
                    {selectedStory.name}
                  </h4>
                  <p className="text-xs font-serif-vi italic text-[#5A5A40] mb-3">
                    {selectedStory.history}
                  </p>
                  <p className="text-xs sm:text-sm text-[#6B665E] leading-relaxed">
                    {selectedStory.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#EAE7E2]">
                  <button
                    onClick={() => onSelectVillageFilter(selectedStory.name)}
                    className="w-full bg-[#5A5A40] hover:bg-[#4A4A35] text-white py-3 px-5 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 group"
                  >
                    <span>Khám Phá Sản Phẩm {selectedStory.name}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
