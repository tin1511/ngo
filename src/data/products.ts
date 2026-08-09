export interface Product {
  id: string;
  name: string;
  shortDesc: string;
  description: string;
  price: number; // in VND
  oldPrice?: number;
  category: 'moc-khoa' | 'anh-chan-dung' | 'thuoc-go' | 'tranh-hinh-khac' | 'qua-tang-custom' | 'tat-ca';
  region: 'mien-bac' | 'mien-trung' | 'mien-nam';
  village: string;
  province: string;
  emoji: string;
  imageUrl: string;
  videoUrl?: string;
  badge?: string;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  originalPrice?: number;
  artisanName?: string;
  artisanStory?: string;
  artisanQuote?: {
    author: string;
    quote: string;
  };
  features: string[];
}

export interface CraftVillageStory {
  id: string;
  name: string;
  province: string;
  region: 'mien-bac' | 'mien-trung' | 'mien-nam';
  history: string;
  description: string;
  heroImage: string;
  artisanName: string;
  productCount: number;
  featuredCategory: string;
}

export const CRAFT_VILLAGES: CraftVillageStory[] = [
  {
    id: 'moc-kim-bong',
    name: 'Làng Mộc Kim Bồng',
    province: 'Quảng Nam (Hội An)',
    region: 'mien-trung',
    history: 'Hơn 500 năm di sản điêu khắc gỗ Phố Cổ Hội An',
    description: 'Nổi tiếng với kỹ thuật chạm khắc gỗ thủ công tỉ mỉ, mộc Kim Bồng kết hợp giữa truyền thống điêu khắc cổ truyền và công nghệ khắc laser hiện đại tạo ra các sản phẩm quà tặng, móc khóa, tranh gỗ tinh xảo.',
    heroImage: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80',
    artisanName: 'Nghệ nhân Huỳnh Ri',
    productCount: 8,
    featuredCategory: 'Móc Khóa & Quà Tặng Gỗ'
  },
  {
    id: 'moc-dong-ky',
    name: 'Làng Mộc Đồng Kỵ',
    province: 'Bắc Ninh',
    region: 'mien-bac',
    history: 'Thủ phủ gỗ mỹ nghệ danh tiếng bậc nhất Đồng Bằng Bắc Bộ',
    description: 'Nơi tập hợp những bàn tay vàng điêu khắc gỗ tự nhiên cao cấp như gỗ sưa, cẩm lai, gỗ maple, tần bì. Luyện độ chính xác cao đến từng đường nét khắc laser chân dung và thông điệp cá nhân hóa.',
    heroImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80',
    artisanName: 'Nghệ nhân Vũ Quốc Vương',
    productCount: 12,
    featuredCategory: 'Tranh & Ảnh Chân Dung Laser'
  },
  {
    id: 'moc-chang-son',
    name: 'Làng Mộc Chàng Sơn',
    province: 'Hà Nội',
    region: 'mien-bac',
    history: 'Làng nghề khắc gỗ cổ truyền Xứ Thạch',
    description: 'Nổi danh từ thời phong kiến với nghề làm mộc, khắc hình và làm thước gỗ học sinh, quà tặng lưu niệm bằng chất liệu gỗ thơm tự nhiên bền bỉ cùng thời gian.',
    heroImage: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=900&q=80',
    artisanName: 'Nghệ nhân Nguyễn Văn Thân',
    productCount: 6,
    featuredCategory: 'Thước Gỗ & Đồ Dùng Văn Phòng'
  },
  {
    id: 'moc-la-xuyen',
    name: 'Làng Mộc La Xuyên',
    province: 'Nam Định',
    region: 'mien-bac',
    history: 'Di sản chạm khắc gỗ hàng nghìn năm lịch sử',
    description: 'La Xuyên chắt lọc từng thớ gỗ mịn đẹp nhất để tạo nên các phôi móc khóa, thước gỗ và khung ảnh chân dung khắc laser sắc nét trọn đời.',
    heroImage: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=900&q=80',
    artisanName: 'Nghệ nhân Dương Văn Trọng',
    productCount: 5,
    featuredCategory: 'Tranh Gỗ Laser'
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'moc-khoa-go-maple-01',
    name: 'Móc Khóa Gỗ Maple Khắc Tên & SĐT Theo Yêu Cầu',
    shortDesc: 'Gỗ Maple nhập khẩu cao cấp - Chống mất chìa',
    description: 'Móc khóa bằng chất liệu gỗ Maple Bắc Mỹ có vân sáng đẹp, mịn màng. Được khắc laser hai mặt theo yêu cầu: một mặt khắc tên / biểu tượng / hình vẽ, một mặt khắc số điện thoại liên hệ chống thất lạc.',
    price: 45000,
    oldPrice: 65000,
    category: 'moc-khoa',
    region: 'mien-trung',
    village: 'Làng Mộc Kim Bồng',
    province: 'Quảng Nam',
    emoji: '🔑',
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    badge: 'Khắc Tên Miễn Phí',
    rating: 4.9,
    reviewsCount: 128,
    inStock: true,
    artisanQuote: {
      author: 'Nghệ nhân Huỳnh Ri',
      quote: 'Mỗi chiếc móc khóa nhỏ bé đều gửi gắm sự chăm chút tỉ mỉ từ phôi gỗ đến nét khắc nét mịn.'
    },
    features: [
      'Gỗ Maple tự nhiên nguyên khối siêu nhẹ và bền',
      'Khắc laser nét mảnh chuẩn độ phân giải HD',
      'Khoen inox 304 không gỉ sét sáng bóng',
      'Kích thước gọn nhẹ: 4cm x 2.5cm x 0.8cm'
    ]
  },
  {
    id: 'anh-chan-dung-go-laser-a5',
    name: 'Ảnh Chân Dung Gỗ Laser Khổ A5 Kỷ Niệm (Kèm Chân Đế)',
    shortDesc: 'Khắc chân dung cá nhân/người yêu/gia đình nét căng',
    description: 'Tác phẩm ảnh chân dung chuyển thể từ hình chụp thực tế của bạn khắc trực tiếp lên tấm gỗ Beech nguyên khối bằng công nghệ laser chuẩn điểm ảnh. Màu gỗ tự nhiên mang lại vẻ đẹp hoài niệm, ấm áp và tồn tại vĩnh cửu theo thời gian.',
    price: 220000,
    oldPrice: 280000,
    category: 'anh-chan-dung',
    region: 'mien-bac',
    village: 'Làng Mộc Đồng Kỵ',
    province: 'Bắc Ninh',
    emoji: '🖼️',
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    badge: 'Bán Chạy Nhất',
    rating: 5.0,
    reviewsCount: 210,
    inStock: true,
    artisanQuote: {
      author: 'Nghệ nhân Vũ Quốc Vương',
      quote: 'Laser lưu giữ từng nụ cười và khoảnh khắc đẹp nhất của bạn lên chất gỗ mộc mạc.'
    },
    features: [
      'Chất liệu gỗ Beech nhập khẩu vân gỗ tự nhiên siêu mịn',
      'Miễn phí thiết kế lại ảnh chân dung và thêm lời nhắn',
      'Kèm chân đế gỗ cao cấp để bàn trang trí',
      'Kích thước chuẩn A5: 15cm x 21cm x 1.2cm'
    ]
  },
  {
    id: 'thuoc-go-maple-20cm-01',
    name: 'Thước Gỗ Maple 20cm Khắc Tên & Lời Chúc Ý Nghĩa',
    shortDesc: 'Vạch chia centimet chuẩn xác - Khắc tên cá nhân',
    description: 'Thước kẻ chế tác từ gỗ Maple vàng nhạt sang trọng, vạch chia cm khắc laser không bao giờ bị mờ hay tróc sơn. Có khoảng trống khắc tên, môn học, lớp hoặc lời chúc may mắn dành cho học sinh, sinh viên và giáo viên.',
    price: 35000,
    oldPrice: 50000,
    category: 'thuoc-go',
    region: 'mien-bac',
    village: 'Làng Mộc Chàng Sơn',
    province: 'Hà Nội',
    emoji: '📐',
    imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    badge: 'Đồ Dùng Học Tập',
    rating: 4.9,
    reviewsCount: 95,
    inStock: true,
    artisanQuote: {
      author: 'Nghệ nhân Nguyễn Văn Thân',
      quote: 'Thước gỗ đồng hành cùng con đường học vấn và ước mơ chắp cánh.'
    },
    features: [
      'Gỗ Maple tự nhiên đã qua sấy chống cong vênh',
      'Vạch chia khắc laser chìm độ chính xác milimet',
      'Tùy chọn khắc tên, icon hoạt hình hoặc châm ngôn',
      'Chiều dài chuẩn 20cm (Kích thước phủ bì 22cm x 3cm)'
    ]
  },
  {
    id: 'moc-khoa-go-doi-trai-tim',
    name: 'Bộ Móc Khóa Gỗ Ghép Đôi Trái Tim (Khắc Ngày Kỷ Niệm)',
    shortDesc: 'Quà tặng cặp đôi - 2 nửa trái tim ghép vừa khít',
    description: 'Bộ đôi móc khóa gỗ dành riêng cho các cặp đôi yêu nhau. Hai nửa trái tim khi đặt cạnh nhau sẽ ghép thành một hình khối hoàn chỉnh. Khắc tên hai bạn, ngày bắt đầu yêu hoặc câu tỏ tình lãng mạn.',
    price: 85000,
    oldPrice: 110000,
    category: 'moc-khoa',
    region: 'mien-trung',
    village: 'Làng Mộc Kim Bồng',
    province: 'Quảng Nam',
    emoji: '💞',
    imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
    badge: 'Quà Tặng Cặp Đôi',
    rating: 5.0,
    reviewsCount: 164,
    inStock: true,
    features: [
      'Gỗ Tần Bì ghép vân tự nhiên đối ứng tuyệt đẹp',
      'Khắc tên cặp đôi + ngày kỷ niệm ở mặt sau',
      'Bao gồm 2 móc khóa + hộp giấy kraft thắt nơ lụa',
      'Kích thước cả bộ ghép: 5cm x 5cm x 0.8cm'
    ]
  },
  {
    id: 'anh-go-laser-khung-led-3d',
    name: 'Khung Ảnh Chân Dung Gỗ Laser 3D Có Đèn LED Đêm',
    shortDesc: 'Ảnh khắc gỗ chiếu sáng nghệ thuật trang trí phòng',
    description: 'Sự kết hợp độc đáo giữa kỹ thuật khắc chân dung laser trên tấm gỗ mỏng và hệ thống đèn LED vàng ấm giấu bên trong đế gỗ. Khi bật đèn, bức ảnh chân dung bừng sáng lung linh rực rỡ.',
    price: 320000,
    oldPrice: 390000,
    category: 'anh-chan-dung',
    region: 'mien-bac',
    village: 'Làng Mộc Đồng Kỵ',
    province: 'Bắc Ninh',
    emoji: '💡',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    badge: 'Đèn Trang Trí Độc Đáo',
    rating: 4.9,
    reviewsCount: 88,
    inStock: true,
    features: [
      'Đế gỗ sồi tích hợp công tắc và dải LED dịu mắt',
      'Tấm gỗ khắc khắc chi tiết độ tương phản cao',
      'Sử dụng cổng cắm USB tiện lợi nối laptop/củ sạc',
      'Kích thước tổng thể: 18cm x 22cm'
    ]
  },
  {
    id: 'thuoc-go-hinh-thu-cho-be',
    name: 'Thước Gỗ Khắc Hình Con Vật & Tên Bé Dễ Thương',
    shortDesc: 'Thước 15cm gỗ Maple bo tròn góc an toàn cho bé',
    description: 'Dòng thước gỗ thiết kế tạo hình các con vật ngộ nghĩnh (mèo, gấu, thỏ, hươu cao cổ) kết hợp khắc tên bé và lớp học. Góc thước bo tròn mài mịn tuyệt đối an toàn cho bàn tay trẻ nhỏ.',
    price: 30000,
    oldPrice: 45000,
    category: 'thuoc-go',
    region: 'mien-bac',
    village: 'Làng Mộc Chàng Sơn',
    province: 'Hà Nội',
    emoji: '🦒',
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    badge: 'Dành Cho Bé',
    rating: 4.8,
    reviewsCount: 72,
    inStock: true,
    features: [
      'Chất liệu gỗ dẻo mộc tự nhiên không độc hại',
      'Mài nhẵn kỹ lưỡng từng mép mép góc',
      'Vạch chia số to rõ ràng dễ quan sát',
      'Chiều dài thước: 15cm'
    ]
  },
  {
    id: 'tranh-go-laser-khac-hinh-gia-dinh',
    name: 'Tranh Gỗ Laser Khắc Hình Kỷ Niệm Gia Đình / Chân Dung',
    shortDesc: 'Tranh gỗ treo tường / để bàn khổ A4 cao cấp',
    description: 'Bức tranh gỗ khắc laser khổ lớn giữ trọn từng nét mặt, tà áo và bối cảnh bức ảnh chụp kỷ niệm gia đình hay chuyến du lịch đáng nhớ của bạn. Viền gỗ chạm chỉ tinh xảo làm tôn lên vẻ sang trọng.',
    price: 380000,
    oldPrice: 450000,
    category: 'tranh-hinh-khac',
    region: 'mien-bac',
    village: 'Làng Mộc La Xuyên',
    province: 'Nam Định',
    emoji: '🖼️',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    badge: 'Quà Tặng Tân Gia / Kỷ Niệm',
    rating: 5.0,
    reviewsCount: 142,
    inStock: true,
    features: [
      'Gỗ Cẩm Lai / Tần Bì phủ PU mờ bảo vệ chống mốc',
      'Tùy chọn móc treo tường hoặc chân đế để bàn',
      'Khắc kèm thơ, câu chúc hoặc mốc thời gian kỷ niệm',
      'Kích thước chuẩn A4: 21cm x 30cm x 1.5cm'
    ]
  },
  {
    id: 'moc-khoa-go-bien-so-xe',
    name: 'Móc Khóa Gỗ Khắc Hình Biển Số Xe & Logo Hãng Xe',
    shortDesc: 'Móc khóa gỗ ô tô / xe máy độc đáo theo số xe bạn',
    description: 'Sản phẩm ưa thích dành cho chủ sở hữu ô tô và xe máy. Mặt trước khắc biển số xe của bạn chuẩn phông chữ, mặt sau khắc logo hãng xe (Honda, Toyota, Mazda, Vespa...) kèm lời chúc "Thượng Lộ Bình An".',
    price: 50000,
    oldPrice: 70000,
    category: 'moc-khoa',
    region: 'mien-trung',
    village: 'Làng Mộc Kim Bồng',
    province: 'Quảng Nam',
    emoji: '🚗',
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    badge: 'Phụ Kiện Ô Tô/Xe Máy',
    rating: 4.9,
    reviewsCount: 180,
    inStock: true,
    features: [
      'Phôi gỗ Walnut trầm tía hoặc Maple vàng óng',
      'Khắc hình biển số xe chuẩn xỉn chữ số',
      'Móc khóa dây da thuộc cao cấp hoặc xích inox',
      'Kích thước: 6cm x 2.2cm'
    ]
  },
  {
    id: 'bo-thuoc-go-hop-but-custom',
    name: 'Bộ Thước Gỗ & Hộp Bút Khắc Tên Tri Ân Thầy Cô / Đồng Nghiệp',
    shortDesc: 'Combo thước kẻ + hộp bút gỗ trượt nắp sang trọng',
    description: 'Bộ quà tặng gỗ cao cấp gồm 1 hộp đựng bút gỗ trượt nắp và 1 thước kẻ gỗ 20cm. Cả hai sản phẩm đều được khắc laser tên người nhận, chức danh hoặc câu chúc tri án ý nghĩa.',
    price: 185000,
    oldPrice: 240000,
    category: 'qua-tang-custom',
    region: 'mien-bac',
    village: 'Làng Mộc Chàng Sơn',
    province: 'Hà Nội',
    emoji: '🎁',
    imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    badge: 'Bộ Quà Tặng Doanh Nghiệp',
    rating: 4.9,
    reviewsCount: 64,
    inStock: true,
    features: [
      'Gỗ Thông tuyết thơm tự nhiên nhẹ nhàng',
      'Khắc laser toàn bộ hộp bút và thước kẻ',
      'Đựng vừa 3-4 cây bút máy/bút bi chuẩn',
      'Hộp quà giấy mỹ thuật đi kèm trang trọng'
    ]
  },
  {
    id: 'moc-khoa-go-12-con-giap',
    name: 'Móc Khóa Gỗ Khắc Hình 12 Con Giáp & Tên Bản Mệnh',
    shortDesc: 'Hình khắc linh vật Tý, Sửu, Dần, Mão... phong thủy',
    description: 'Móc khóa gỗ tròn đập phôi thủ công khắc họa nét vẽ chibi 12 con giáp siêu đáng yêu cùng tên riêng và năm sinh của bạn ở mặt sau, mang ý nghĩa may mắn và bình an.',
    price: 40000,
    oldPrice: 55000,
    category: 'moc-khoa',
    region: 'mien-nam',
    village: 'Xưởng Mộc Thủ Đức',
    province: 'TP. Hồ Chí Minh',
    emoji: '🐯',
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    badge: 'Phong Thủy May Mắn',
    rating: 4.8,
    reviewsCount: 115,
    inStock: true,
    features: [
      'Đường kính phôi gỗ tròn: 4cm, độ dày 0.8cm',
      'Đủ bộ 12 con giáp khắc nét sắc sảo',
      'Tùy chọn dây tua rua phong thủy nhiều màu',
      'Sơn lót bảo vệ chống thấm nước nhẹ'
    ]
  },
  {
    id: 'tranh-go-laser-bac-ho-sen',
    name: 'Tranh Gỗ Laser Khắc Tượng Bác Hồ & Hoa Sen Cổ Truyền',
    shortDesc: 'Tác phẩm nghệ thuật gỗ điêu khắc lưu niệm văn hóa',
    description: 'Khắc họa hình ảnh Chủ tịch Hồ Chí Minh kính yêu bên khóm hoa sen thắm nét bằng kỹ thuật laser ma trận chấm mảng sáng tối tinh vi trên tấm gỗ tự nhiên cao cấp.',
    price: 420000,
    oldPrice: 520000,
    category: 'tranh-hinh-khac',
    region: 'mien-bac',
    village: 'Làng Mộc La Xuyên',
    province: 'Nam Định',
    emoji: '🌺',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    badge: 'Di Sản Văn Hóa',
    rating: 5.0,
    reviewsCount: 76,
    inStock: true,
    features: [
      'Gỗ Dẻo cao cấp vân đều không vết mứt',
      'Khung viền gỗ uốn hoa văn cổ điển',
      'Thích hợp làm quà tặng ngoại giao, thầy cô, sự kiện',
      'Kích thước: 25cm x 35cm'
    ]
  },
  {
    id: 'the-go-custom-treo-xe-ban',
    name: 'Thẻ Gỗ Treo Xe / Bàn Học Khắc Lời Chúc Cầu An & Biểu Tượng',
    shortDesc: 'Thẻ gỗ dây treo may mắn khắc hình & câu chúc',
    description: 'Thẻ gỗ treo gương xe ô tô, phòng làm việc hoặc balo học sinh với các thông điệp "Thượng Lộ Bình An", "Vạn Sự Như Ý", "Bình An Mọi Nẻo Đường" kèm hình hoa sen, phật thủ hoặc chữ Phúc Lộc Thọ.',
    price: 65000,
    oldPrice: 85000,
    category: 'qua-tang-custom',
    region: 'mien-trung',
    village: 'Làng Mộc Kim Bồng',
    province: 'Quảng Nam',
    emoji: '📿',
    imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
    badge: 'Bình An & May Mắn',
    rating: 4.9,
    reviewsCount: 98,
    inStock: true,
    features: [
      'Gỗ Trầm Hương nhân tạo / Gỗ Sưa thơm dịu',
      'Khắc hình 2 mặt chi tiết mềm mại',
      'Dây ngọc trai nhân tạo & tua rua may mắn',
      'Kích thước thẻ: 8cm x 5cm'
    ]
  }
];

export const REGIONS_INFO = [
  { id: 'tat-ca', name: 'Toàn Quốc', count: PRODUCTS.length },
  { id: 'mien-bac', name: 'Miền Bắc', count: PRODUCTS.filter(p => p.region === 'mien-bac').length },
  { id: 'mien-trung', name: 'Miền Trung', count: PRODUCTS.filter(p => p.region === 'mien-trung').length },
  { id: 'mien-nam', name: 'Miền Nam', count: PRODUCTS.filter(p => p.region === 'mien-nam').length },
];

export const CATEGORIES_INFO = [
  { id: 'tat-ca', name: 'Tất Cả Sản Phẩm', icon: '🪵' },
  { id: 'moc-khoa', name: 'Móc Khóa Gỗ Custom', icon: '🔑' },
  { id: 'anh-chan-dung', name: 'Ảnh Chân Dung Laser', icon: '🖼️' },
  { id: 'thuoc-go', name: 'Thước Gỗ Khắc Tên', icon: '📐' },
  { id: 'tranh-hinh-khac', name: 'Tranh & Hình Khắc Gỗ', icon: '🎨' },
  { id: 'qua-tang-custom', name: 'Quà Tặng Cá Nhân Hóa', icon: '🎁' },
];

export const PROMO_CODES: Record<string, { discountPercent?: number; discountAmount?: number; desc: string }> = {
  'MOCGO10': {
    discountPercent: 10,
    desc: 'Giảm 10% tri ân khách hàng khắc gỗ'
  },
  'KHACLASER20': {
    discountAmount: 30000,
    desc: 'Giảm 30.000đ cho đơn hàng ảnh chân dung & tranh gỗ'
  },
  'FREESHIP': {
    discountAmount: 30000,
    desc: 'Miễn phí vận chuyển toàn quốc cho móc khóa & thước gỗ'
  }
};
