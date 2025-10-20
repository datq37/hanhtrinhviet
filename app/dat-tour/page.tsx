"use client";

import { FormEvent, useCallback, useMemo, useState } from "react";
import Image from "next/image";
import TourDetailModal from "../components/TourDetailModal";
import MainHeader from "../components/MainHeader";
import Footer from "../sections/Footer";
import { useSupabase } from "../context/SupabaseContext";

const formatCurrency = (value: number) =>
  `${value.toLocaleString("vi-VN")}₫`;

interface TourSchedule {
  day: string;
  title: string;
  activities: string[];
}

interface Tour {
  id: string;
  bookingSlug?: string;
  name: string;
  destination: string;
  location: string;
  image: string;
  description: string;
  price: string;
  adultPrice: number;
  childPrice: number;
  duration: string;
  meals: string;
  tickets: string;
  tourType: string;
  tag: string;
  rating: number;
  schedule: TourSchedule[];
}

const tours: Tour[] = [
  {
    id: "dalat-flowers",
    bookingSlug: "tour-dalat-flowers",
    name: "Đà Lạt – Thành phố ngàn hoa",
    destination: "Đà Lạt",
    location: "Lâm Đồng",
    image: "https://ezcloud.vn/wp-content/uploads/2024/08/thanh-pho-da-lat.webp",
    description:
      "Trải nghiệm nét lãng mạn của cao nguyên Đà Lạt với hồ Xuân Hương, LangBiang và những khu vườn hoa rực rỡ.",
    adultPrice: 3500000,
    childPrice: 1750000,
    price: `${formatCurrency(3500000)} / người lớn`,
    duration: "3 ngày 2 đêm",
    meals: "Bao gồm bữa sáng, bữa trưa, bữa tối",
    tickets: "Trọn gói các địa điểm trong tour",
    tourType: "Nghỉ dưỡng, tham quan",
    tag: "Nghỉ dưỡng",
    rating: 4.9,
    schedule: [
      {
        day: "Ngày 1",
        title: "Đến Đà Lạt – Hồ Xuân Hương – Quảng trường Lâm Viên",
        activities: [
          "Đón khách tại sân bay Liên Khương hoặc bến xe Đà Lạt",
          "Nhận phòng khách sạn trung tâm (3–4 sao)",
          "Tham quan Hồ Xuân Hương, Quảng trường Lâm Viên và Nhà thờ Con Gà",
          "Tối: lẩu gà lá é, dạo chợ đêm, thưởng thức sữa đậu nành và bánh tráng nướng",
        ],
      },
      {
        day: "Ngày 2",
        title: "LangBiang – Thung lũng Tình yêu – Vườn hoa thành phố",
        activities: [
          "Sáng: chinh phục LangBiang, ngắm toàn cảnh Đà Lạt",
          "Trưa: ăn tại nhà hàng địa phương",
          "Chiều: Thung lũng Tình yêu hoặc Đồi mộng mơ, Vườn hoa thành phố",
          "Tối: giao lưu cồng chiêng Tây Nguyên với rượu cần và thịt nướng",
        ],
      },
      {
        day: "Ngày 3",
        title: "Vườn dâu – Trang trại cà phê – Tiễn khách",
        activities: [
          "Hái dâu tại vườn công nghệ cao",
          "Ghé trang trại cà phê Mê Linh, check-in cầu gỗ",
          "Mua đặc sản: mứt, trà atiso, cà phê",
          "Tiễn khách tại sân bay hoặc bến xe",
        ],
      },
    ],
  },
  {
    id: "dalat-clouds",
    bookingSlug: "tour-dalat-clouds",
    name: "Đà Lạt – Trải nghiệm và săn mây",
    destination: "Đà Lạt",
    location: "Lâm Đồng",
    image:
      "https://storage.googleapis.com/blogvxr-uploads/2025/04/1db5b615-dia-diem-du-lich-da-lat-mien-phi-3498062.png",
    description:
      "Bốn ngày sống chậm giữa xứ sở sương mù, săn mây Đà Lạt và khám phá các điểm đến mới nổi.",
    adultPrice: 4800000,
    childPrice: 2400000,
    price: `${formatCurrency(4800000)} / người lớn`,
    duration: "4 ngày 3 đêm",
    meals: "Bao gồm bữa sáng, bữa trưa, bữa tối",
    tickets: "Trọn gói các địa điểm trong tour",
    tourType: "Khám phá",
    tag: "Khám phá",
    rating: 4.9,
    schedule: [
      {
        day: "Ngày 1",
        title: "Check-in Đà Lạt – Những điểm dừng mới",
        activities: [
          "Đón khách tại sân bay/bến xe, nhận phòng",
          "Tham quan đồi chè Cầu Đất, phim trường Happy Hill, Thiền viện Trúc Lâm",
          "Tối: ẩm thực phố đêm, kem bơ, bánh căn",
        ],
      },
      {
        day: "Ngày 2",
        title: "Săn mây – Làng cổ châu Âu",
        activities: [
          "Bình minh săn mây tại đồi Đa Phú hoặc đồi Hòn Bồ",
          "Ăn trưa tại quán view thung lũng",
          "Chiều: Làng Cù Lần, Fairy Town – Làng cổ tích",
          "Tối: BBQ ngoài trời hoặc tour Đêm Đà Lạt lung linh",
        ],
      },
      {
        day: "Ngày 3",
        title: "Thác Datanla – Đường hầm đất sét",
        activities: [
          "Trải nghiệm máng trượt hoặc cáp treo thác Datanla",
          "Tham quan Đường hầm đất sét",
          "Check-in cà phê Horizon hoặc View Memory ngắm hoàng hôn",
          "Tối: tự do khám phá ẩm thực",
        ],
      },
      {
        day: "Ngày 4",
        title: "Vườn rau – Mua đặc sản",
        activities: [
          "Tham quan vườn rau thủy canh và trải nghiệm thu hoạch",
          "Mua đặc sản: mứt, cà phê, hoa tươi",
          "Tiễn khách ra sân bay Liên Khương/bến xe",
        ],
      },
    ],
  },
  {
    id: "hue-heritage",
    bookingSlug: "tour-hue-heritage",
    name: "Huế mộng mơ – Hành trình di sản & hương sắc cố đô",
    destination: "Huế",
    location: "Thừa Thiên Huế",
    image: "https://giaonuocnhanh.com/wp-content/uploads/2021/12/hue.jpg",
    description:
      "Khám phá quần thể di sản Huế với Đại Nội, lăng tẩm triều Nguyễn và ca Huế trên sông Hương.",
    adultPrice: 3800000,
    childPrice: 1900000,
    price: `${formatCurrency(3800000)} / người lớn`,
    duration: "3 ngày 2 đêm",
    meals: "Bao gồm bữa sáng, bữa trưa, bữa tối",
    tickets: "Trọn gói các địa điểm trong tour",
    tourType: "Khám phá",
    tag: "Di sản",
    rating: 4.8,
    schedule: [
      {
        day: "Ngày 1",
        title: "Huế – Đại Nội – Chùa Thiên Mụ",
        activities: [
          "Đón khách tại sân bay/bến xe",
          "Tham quan Đại Nội: Ngọ Môn, điện Thái Hòa...",
          "Viếng chùa Thiên Mụ",
          "Tối: nghe ca Huế trên sông Hương",
        ],
      },
      {
        day: "Ngày 2",
        title: "Lăng Khải Định – Lăng Minh Mạng – Biển Lăng Cô",
        activities: [
          "Ăn sáng tại khách sạn",
          "Tham quan lăng Khải Định, lăng Minh Mạng",
          "Chiều: biển Lăng Cô, đầm Lập An",
          "Tối: nghỉ dưỡng tại resort ven biển",
        ],
      },
      {
        day: "Ngày 3",
        title: "Chợ Đông Ba – Làng nghề",
        activities: [
          "Ăn sáng, trả phòng",
          "Mua sắm tại chợ Đông Ba",
          "Thăm làng nghề Xuân Thủy",
          "Kết thúc hành trình",
        ],
      },
    ],
  },
  {
    id: "hue-serenity",
    bookingSlug: "tour-hue-serenity",
    name: "Huế – Vẻ đẹp bình yên & hương sắc miền di sản",
    destination: "Huế",
    location: "Thừa Thiên Huế",
    image:
      "https://aeonmall-review-rikkei.cdn.vccloud.vn/website/21/tinymce/November2024/dai-noi-hue.png",
    description:
      "Lịch trình kết hợp Đồi Thiên An, Phá Tam Giang và suối khoáng Thanh Tân dành cho tín đồ thư giãn.",
    adultPrice: 4500000,
    childPrice: 2250000,
    price: `${formatCurrency(4500000)} / người lớn`,
    duration: "3 ngày 2 đêm",
    meals: "Bao gồm bữa sáng, bữa trưa, bữa tối",
    tickets: "Trọn gói các địa điểm trong tour",
    tourType: "Khám phá",
    tag: "Trải nghiệm",
    rating: 4.8,
    schedule: [
      {
        day: "Ngày 1",
        title: "Đồi Thiên An – Làng hương Thủy Xuân – Phố đêm",
        activities: [
          "Đón khách, ăn sáng bún bò Huế/bánh canh",
          "Check-in Đồi Thiên An, Hồ Thủy Tiên",
          "Làng hương Thủy Xuân, trải nghiệm làm hương",
          "Tối: đặc sản Huế, dạo phố đêm",
        ],
      },
      {
        day: "Ngày 2",
        title: "Phá Tam Giang – Đầm Chuồn – Biển Thuận An",
        activities: [
          "Khám phá Phá Tam Giang lớn nhất Đông Nam Á",
          "Check-in Đầm Chuồn, cầu tre giữa đầm",
          "Tắm biển Thuận An, tối xem áo dài cung đình",
        ],
      },
      {
        day: "Ngày 3",
        title: "Suối khoáng Thanh Tân – Chợ Đông Ba",
        activities: [
          "Tắm khoáng, onsen kiểu Nhật tại Alba Resort",
          "Mua đặc sản mè xửng, tôm chua, nón lá",
          "Tiễn khách ra sân bay/bến xe",
        ],
      },
    ],
  },
  {
    id: "danang-lights",
    bookingSlug: "tour-danang-lights",
    name: "Đà Nẵng – Biển xanh & thành phố ánh sáng",
    destination: "Đà Nẵng",
    location: "Đà Nẵng",
    image:
      "https://cdn3.ivivu.com/2022/07/Gi%E1%BB%9Bi-thi%E1%BB%87u-du-l%E1%BB%8Bch-%C4%90%C3%A0-N%E1%BA%B5ng-ivivu-1-e1743500641858.jpg",
    description:
      "Kết hợp bán đảo Sơn Trà, Bà Nà Hills và trải nghiệm biển Mỹ Khê trong 3 ngày 2 đêm.",
    adultPrice: 3800000,
    childPrice: 1900000,
    price: `${formatCurrency(3800000)} / người lớn`,
    duration: "3 ngày 2 đêm",
    meals: "Bao gồm bữa sáng, bữa trưa, bữa tối",
    tickets: "Trọn gói các địa điểm trong tour",
    tourType: "Khám phá",
    tag: "Biển đảo",
    rating: 4.8,
    schedule: [
      {
        day: "Ngày 1",
        title: "Bán đảo Sơn Trà – Biển Mỹ Khê",
        activities: [
          "Ăn sáng mì Quảng, cà phê Đà Nẵng",
          "Tham quan Sơn Trà, chùa Linh Ứng",
          "Tự do tắm biển Mỹ Khê",
          "Tối: Cầu Rồng, Cầu Tình Yêu, Cá Chép Hóa Rồng",
        ],
      },
      {
        day: "Ngày 2",
        title: "Bà Nà Hills – Làng Pháp – Cầu Vàng",
        activities: [
          "Khởi hành Bà Nà Hills, tham quan Cầu Vàng",
          "Khám phá Làng Pháp, vườn hoa, hầm rượu, Fantasy Park",
          "Ăn trưa buffet, chiều tự do mua sắm hoặc spa",
        ],
      },
      {
        day: "Ngày 3",
        title: "Ngũ Hành Sơn – Làng đá Non Nước",
        activities: [
          "Tham quan Ngũ Hành Sơn, chùa Linh Ứng Non Nước",
          "Làng đá mỹ nghệ, mua quà lưu niệm",
          "Mua đặc sản: chả bò, tré, mực rim",
          "Tiễn khách ra sân bay",
        ],
      },
    ],
  },
  {
    id: "danang-hoian-spring",
    bookingSlug: "tour-danang-hoian-spring",
    name: "Đà Nẵng – Hội An – Suối khoáng & thiên nhiên xanh",
    destination: "Đà Nẵng",
    location: "Đà Nẵng",
    image:
      "https://toquoc.mediacdn.vn/280518851207290880/2024/1/7/dsdgtdy-1704616308047440689926.jpg",
    description:
      "Kết hợp phố cổ Hội An, suối khoáng Núi Thần Tài và những trải nghiệm thư giãn tại Đà Nẵng.",
    adultPrice: 4200000,
    childPrice: 2100000,
    price: `${formatCurrency(4200000)} / người lớn`,
    duration: "3 ngày 2 đêm",
    meals: "Bao gồm bữa sáng, bữa trưa, bữa tối",
    tickets: "Trọn gói các địa điểm trong tour",
    tourType: "Khám phá",
    tag: "Thư giãn",
    rating: 4.8,
    schedule: [
      {
        day: "Ngày 1",
        title: "Ngũ Hành Sơn – Phố cổ Hội An",
        activities: [
          "Tham quan Ngũ Hành Sơn, Làng đá Non Nước",
          "Khám phá phố cổ Hội An, Chùa Cầu, Nhà cổ Tấn Ký, Hội quán Phúc Kiến",
          "Thưởng thức cao lầu, bánh mì Phượng, thả hoa đăng",
        ],
      },
      {
        day: "Ngày 2",
        title: "Suối khoáng nóng Núi Thần Tài",
        activities: [
          "Trải nghiệm onsen, tắm bùn, trượt nước, check-in tượng Phật Di Lặc",
          "Ăn trưa buffet tại khu du lịch",
          "Tối dạo sông Hàn, ngắm cầu Rồng",
        ],
      },
      {
        day: "Ngày 3",
        title: "Biển Mỹ Khê – Chợ Hàn",
        activities: [
          "Ăn sáng, tắm biển Mỹ Khê",
          "Mua quà tại chợ Hàn hoặc siêu thị đặc sản",
          "Tiễn khách ra sân bay",
        ],
      },
    ],
  },
  {
    id: "nhatrang-paradise",
    bookingSlug: "tour-nhatrang-paradise",
    name: "Nha Trang – Biển đảo thiên đường",
    destination: "Nha Trang",
    location: "Khánh Hòa",
    image:
      "https://vietnam.travel/sites/default/files/inline-images/things%20to%20do%20in%20nha%20trang-5.jpg",
    description:
      "Khám phá biển đảo, tour 3 đảo và trải nghiệm spa bùn khoáng thư giãn tại Nha Trang.",
    adultPrice: 4000000,
    childPrice: 2000000,
    price: `${formatCurrency(4000000)} / người lớn`,
    duration: "3 ngày 2 đêm",
    meals: "Bao gồm bữa sáng, bữa trưa, bữa tối",
    tickets: "Trọn gói các địa điểm trong tour",
    tourType: "Nghỉ dưỡng biển",
    tag: "Biển đảo",
    rating: 4.9,
    schedule: [
      {
        day: "Ngày 1",
        title: "Tháp Bà Ponagar – Biển trung tâm",
        activities: [
          "Ăn sáng bún sứa, bánh căn",
          "Tham quan Tháp Bà Ponagar",
          "Tắm biển Trần Phú/bãi Dài",
          "Tối: hải sản, phố đi bộ, kem dừa",
        ],
      },
      {
        day: "Ngày 2",
        title: "Tour 3 đảo – Lặn ngắm san hô",
        activities: [
          "Cano thăm Hòn Mun, Hòn Một, Bãi Tranh/Hòn Miễu",
          "Tham gia thể thao nước, ăn trưa hải sản",
          "Chiều: spa/massage, tối BBQ hải sản",
        ],
      },
      {
        day: "Ngày 3",
        title: "Tắm bùn khoáng – Đặc sản Nha Trang",
        activities: [
          "Tắm bùn I-Resort hoặc Tháp Bà Spa",
          "Mua đặc sản: yến sào, mực rim, muối ớt xanh",
          "Kết thúc hành trình",
        ],
      },
    ],
  },
  {
    id: "nhatrang-vinwonders",
    bookingSlug: "tour-nhatrang-vinwonders",
    name: "Nha Trang – VinWonders – Vịnh san hô – Đồi Cừu Suối Tiên",
    destination: "Nha Trang",
    location: "Khánh Hòa",
    image:
      "https://admin.travelsig.vn/uploads/nha_trang_duoc_binh_chon_la_thanh_pho_ven_bien_dep_nhat_the_gioi_cho_nguoi_nghi_huu_f6c3d10746.jpg",
    description:
      "Lịch trình 4N3Đ trọn vẹn cùng VinWonders, vịnh san hô Hòn Tằm và những trải nghiệm mới lạ tại Suối Tiên.",
    adultPrice: 5000000,
    childPrice: 2500000,
    price: `${formatCurrency(5000000)} / người lớn`,
    duration: "4 ngày 3 đêm",
    meals: "Bao gồm bữa sáng, bữa trưa, bữa tối",
    tickets: "Trọn gói các địa điểm trong tour",
    tourType: "Biển đảo",
    tag: "Gia đình",
    rating: 4.9,
    schedule: [
      {
        day: "Ngày 1",
        title: "Check-in quán cafe view biển – Phố biển đêm",
        activities: [
          "Ăn sáng bún sứa, bánh căn, cà phê muối",
          "Check-in cafe view biển, tắm biển Trần Phú/Phạm Văn Đồng",
          "Tối: hải sản, Quảng trường 2/4, chợ đêm",
        ],
      },
      {
        day: "Ngày 2",
        title: "VinWonders – Cáp treo vượt biển",
        activities: [
          "Đi cáp treo vượt biển đến VinWonders",
          "Tham quan công viên nước, thủy cung, vườn hoa, xem nhạc nước",
          "Chiều về lại đất liền, nghỉ ngơi và khám phá ẩm thực đêm",
        ],
      },
      {
        day: "Ngày 3",
        title: "Vịnh San Hô – Hòn Tằm – Spa bùn khoáng",
        activities: [
          "Lặn ngắm san hô, dù bay, mô tô nước",
          "Ăn trưa, nghỉ ngơi tại Hòn Tằm Resort",
          "Spa bùn khoáng trên biển Hòn Tằm, tối BBQ hải sản",
        ],
      },
      {
        day: "Ngày 4",
        title: "Đồi Cừu Suối Tiên – Mua sắm",
        activities: [
          "Check-in đồng cừu, hồ nước, cầu gỗ sống ảo",
          "Hái nho, tham quan trang trại, mua đặc sản",
          "Kết thúc hành trình",
        ],
      },
    ],
  },
  {
    id: "quangbinh-heritage",
    bookingSlug: "tour-quangbinh-heritage",
    name: "Khám phá di sản thiên nhiên Phong Nha – Kỳ quan Quảng Bình",
    destination: "Quảng Bình",
    location: "Quảng Bình",
    image:
      "https://dulichviet.com.vn/images/bandidau/top-16-dia-diem-du-lich-quang-binh-dep-duoc-nhieu-nguoi-san-don-nhat.jpg",
    description:
      "Hành trình 2N1Đ đến động Phong Nha, suối Nước Moọc và những điểm nhấn văn hóa Quảng Bình.",
    adultPrice: 2800000,
    childPrice: 1400000,
    price: `${formatCurrency(2800000)} / người lớn`,
    duration: "2 ngày 1 đêm",
    meals: "Bao gồm bữa sáng, bữa trưa, bữa tối",
    tickets: "Trọn gói các địa điểm trong tour",
    tourType: "Khám phá",
    tag: "Di sản thiên nhiên",
    rating: 4.8,
    schedule: [
      {
        day: "Ngày 1",
        title: "Động Phong Nha – Sông Son – Biển Nhật Lệ",
        activities: [
          "Thuyền trên sông Son, tham quan Động Phong Nha",
          "Ăn trưa đặc sản: cá sông Son, gà đồi",
          "Tắm biển Nhật Lệ, check-in Quảng Bình Quan, tượng đài Mẹ Suốt",
          "Tối: hải sản, chợ đêm Đồng Hới",
        ],
      },
      {
        day: "Ngày 2",
        title: "Suối Nước Moọc – Mua đặc sản",
        activities: [
          "Tham quan Suối Nước Moọc, tắm suối, chèo kayak",
          "Mua khoai deo, nước mắm ruốc, bánh lọc lá chuối",
          "Tiễn khách, kết thúc chương trình",
        ],
      },
    ],
  },
  {
    id: "quangbinh-adventure",
    bookingSlug: "tour-quangbinh-adventure",
    name: "Chinh phục Quảng Bình – Hang Tối – Sông Chày – Biển Nhật Lệ",
    destination: "Quảng Bình",
    location: "Quảng Bình",
    image: "https://dulichkontum.com.vn/images/khoanh/thum_17212721470.jpg",
    description:
      "Combo trải nghiệm zipline, tắm bùn hang Tối và nghỉ dưỡng biển Nhật Lệ trong 3 ngày.",
    adultPrice: 3800000,
    childPrice: 1900000,
    price: `${formatCurrency(3800000)} / người lớn`,
    duration: "3 ngày 2 đêm",
    meals: "Bao gồm bữa sáng, bữa trưa, bữa tối",
    tickets: "Trọn gói các địa điểm trong tour",
    tourType: "Trải nghiệm",
    tag: "Phiêu lưu",
    rating: 4.8,
    schedule: [
      {
        day: "Ngày 1",
        title: "City tour Đồng Hới – Biển Nhật Lệ",
        activities: [
          "Ăn sáng cháo canh cá lóc, bánh bèo",
          "Tham quan Quảng Bình Quan, tượng đài Mẹ Suốt, nhà thờ Tam Tòa",
          "Tắm biển Nhật Lệ, tối hải sản, phố biển",
        ],
      },
      {
        day: "Ngày 2",
        title: "Sông Chày – Hang Tối – Zipline",
        activities: [
          "Trải nghiệm zipline, tắm bùn trong hang",
          "Chèo kayak, bơi trong dòng nước xanh ngọc",
          "Tối: chợ đêm Đồng Hới, bánh khoái, nem lụi, chè sắn",
        ],
      },
      {
        day: "Ngày 3",
        title: "Suối Nước Moọc – Mua sắm đặc sản",
        activities: [
          "Tắm suối, nghỉ ngơi giữa rừng nguyên sinh",
          "Mua đặc sản trước khi ra sân bay/ga",
        ],
      },
    ],
  },
  {
    id: "phuyen-flower",
    bookingSlug: "tour-phuyen-flower",
    name: "Phú Yên – Xứ Nẫu thơ mộng – Hoa vàng trên cỏ xanh",
    destination: "Phú Yên",
    location: "Tuy Hòa",
    image:
      "https://dulichviet.com.vn/images/bandidau/diem-danh-top-20-dia-diem-du-lich-phu-yen-nhat-dinh-phai-den-mot-lan.jpg",
    description:
      "Khám phá Ghềnh Đá Đĩa, nhà thờ Mằng Lăng và bãi Xép – bối cảnh Hoa vàng trên cỏ xanh.",
    adultPrice: 3800000,
    childPrice: 1900000,
    price: `${formatCurrency(3800000)} / người lớn`,
    duration: "3 ngày 2 đêm",
    meals: "Bao gồm bữa sáng, bữa trưa, bữa tối",
    tickets: "Trọn gói các địa điểm trong tour",
    tourType: "Nghỉ dưỡng",
    tag: "Biển xanh",
    rating: 4.7,
    schedule: [
      {
        day: "Ngày 1",
        title: "Tuy Hòa – Tháp Nhạn – Biển Tuy Hòa",
        activities: [
          "Ăn trưa với đặc sản Phú Yên",
          "Tham quan Tháp Nhạn, ngắm hoàng hôn Chóp Chài",
          "Tối: hải sản, dạo phố biển Tuy Hòa",
        ],
      },
      {
        day: "Ngày 2",
        title: "Ghềnh Đá Đĩa – Nhà thờ Mằng Lăng – Bãi Xép",
        activities: [
          "Khởi hành Bắc Phú Yên, tham quan Ghềnh Đá Đĩa",
          "Nhà thờ Mằng Lăng, Bãi Xép, Ghềnh Ông",
          "Ngắm hoàng hôn biển, nghỉ ngơi",
        ],
      },
      {
        day: "Ngày 3",
        title: "Chợ Tuy Hòa – Mua sắm",
        activities: [
          "Tự do tắm biển, mua đặc sản tại chợ Tuy Hòa",
          "Kết thúc chương trình",
        ],
      },
    ],
  },
  {
    id: "phuyen-vungr0",
    bookingSlug: "tour-phuyen-vungro",
    name: "Phú Yên – Vịnh Vũng Rô – Đảo Nhất Tự Sơn – Ghềnh Đá Dĩa",
    destination: "Phú Yên",
    location: "Tuy Hòa",
    image: "https://zoomtravel.vn/upload/images/ban-do-du-lich-phu-yen-2(1).jpeg",
    description:
      "Combo 4N3Đ dành cho tín đồ khám phá với Vịnh Vũng Rô, Mũi Điện, Đảo Nhất Tự Sơn.",
    adultPrice: 5800000,
    childPrice: 2900000,
    price: `${formatCurrency(5800000)} / người lớn`,
    duration: "4 ngày 3 đêm",
    meals: "Bao gồm bữa sáng, bữa trưa, bữa tối",
    tickets: "Trọn gói các địa điểm trong tour",
    tourType: "Khám phá",
    tag: "Phiêu lưu",
    rating: 4.7,
    schedule: [
      {
        day: "Ngày 1",
        title: "Tuy Hòa – Tháp Nhạn – Quảng trường Nghinh Phong",
        activities: [
          "Ăn trưa đặc sản Phú Yên",
          "Tham quan Tháp Nhạn, check-in Quảng trường Nghinh Phong",
          "Tối: hải sản, khám phá phố đêm",
        ],
      },
      {
        day: "Ngày 2",
        title: "Vịnh Vũng Rô – Mũi Điện – Bãi Môn",
        activities: [
          "Tham quan Vịnh Vũng Rô, nghe câu chuyện đường mòn trên biển",
          "Chinh phục Mũi Điện, đón bình minh",
          "Tắm biển Bãi Môn, thưởng thức đặc sản",
        ],
      },
      {
        day: "Ngày 3",
        title: "Ghềnh Đá Dĩa – Nhà thờ Mằng Lăng – Đảo Nhất Tự Sơn",
        activities: [
          "Khám phá Ghềnh Đá Dĩa, Nhà thờ Mằng Lăng",
          "Ăn trưa hải sản tại Đầm Ô Loan",
          "Tham quan Đảo Nhất Tự Sơn, ngắm hoàng hôn biển",
        ],
      },
      {
        day: "Ngày 4",
        title: "City tour Tuy Hòa – Mua sắm",
        activities: [
          "Tham quan chùa Bảo Lâm hoặc nông trại hoa",
          "Mua đặc sản cá ngừ, bánh tráng Hòa Đa, nước mắm Gành Đỏ",
          "Kết thúc hành trình",
        ],
      },
    ],
  },
  {
    id: "phanthiet-dunes",
    bookingSlug: "tour-phanthiet-dunes",
    name: "Phan Thiết – Mũi Né hồng – Check-in cát bay",
    destination: "Phan Thiết",
    location: "Bình Thuận",
    image:
      "https://pystravel.vn/_next/image?url=https%3A%2F%2Fbooking.pystravel.vn%2Fuploads%2Fposts%2Favatar%2F1746417383.png&w=3840&q=75",
    description:
      "Trọn gói 3N2Đ khám phá Phan Thiết với Đồi Cát Bay, Suối Tiên và ẩm thực biển đặc sắc.",
    adultPrice: 3500000,
    childPrice: 1750000,
    price: `${formatCurrency(3500000)} / người lớn`,
    duration: "3 ngày 2 đêm",
    meals: "Bao gồm bữa sáng, bữa trưa, bữa tối",
    tickets: "Trọn gói các địa điểm trong tour",
    tourType: "Khám phá",
    tag: "Biển & cát",
    rating: 4.8,
    schedule: [
      {
        day: "Ngày 1",
        title: "TP.HCM – Phan Thiết – Biển Đồi Dương",
        activities: [
          "Ăn trưa tại nhà hàng địa phương",
          "Nhận phòng resort ven biển, tắm biển Đồi Dương",
          "Tham quan Tháp Chàm Poshanư, ngắm hoàng hôn Mũi Né",
          "Tối: hải sản, phố ẩm thực Phan Thiết",
        ],
      },
      {
        day: "Ngày 2",
        title: "Đồi cát bay – Làng chài Mũi Né – Suối Tiên",
        activities: [
          "Đón bình minh tại Đồi Cát Bay, trải nghiệm trượt cát",
          "Thăm làng chài Mũi Né đầy màu sắc",
          "Chiều: Suối Tiên, Bãi Đá Ông Địa, tắm biển",
          "Tối: BBQ hải sản tại resort",
        ],
      },
      {
        day: "Ngày 3",
        title: "Chợ Phan Thiết – Đặc sản Bình Thuận",
        activities: [
          "Ăn sáng, trả phòng",
          "Mua nước mắm, mực khô, bánh rế, thanh long",
          "Kết thúc chương trình",
        ],
      },
    ],
  },
];

type TourReviewSeed = {
  id: string;
  author: string;
  rating: number;
  content: string;
  createdAt: string;
};

const defaultTourReviews: TourReviewSeed[] = [
  {
    id: "rv-default-1",
    author: "Hải Nam",
    rating: 5,
    content:
      "Hành trình được chuẩn bị chu đáo, gia đình mình rất yên tâm trong suốt chuyến đi.",
    createdAt: "2025-09-18T17:20:00+07:00",
  },
  {
    id: "rv-default-2",
    author: "Thuỳ Dương",
    rating: 4,
    content:
      "Lịch trình hợp lý, hướng dẫn viên nhiệt tình. Nếu thêm thời gian trải nghiệm tự do thì sẽ tuyệt vời hơn.",
    createdAt: "2025-09-05T09:40:00+07:00",
  },
  {
    id: "rv-default-3",
    author: "Quốc Toàn",
    rating: 5,
    content:
      "Dịch vụ chuyên nghiệp, xe đưa đón đúng giờ và bữa ăn phong phú. Chắc chắn sẽ quay lại.",
    createdAt: "2025-08-29T15:05:00+07:00",
  },
  {
    id: "rv-default-4",
    author: "Thùy Trâm",
    rating: 5,
    content:
      "Đội ngũ concierge hỗ trợ 24/7, cả đoàn cảm thấy được chăm sóc kỹ càng từ đầu tới cuối.",
    createdAt: "2025-08-16T20:50:00+07:00",
  },
];

const dalatTourReviews: TourReviewSeed[] = [
  {
    id: "rv-dl-1",
    author: "Ngọc Hân",
    rating: 5,
    content:
      "Đà Lạt vào sáng sớm thật đẹp, lịch trình săn mây và check-in được sắp xếp rất hợp lý.",
    createdAt: "2025-10-12T06:30:00+07:00",
  },
  {
    id: "rv-dl-2",
    author: "Anh Thi",
    rating: 5,
    content:
      "Homestay ấm cúng, bữa tối BBQ ngoài trời khiến nhóm bạn mình cực kỳ thích thú.",
    createdAt: "2025-09-25T21:15:00+07:00",
  },
  {
    id: "rv-dl-3",
    author: "Hoài Bảo",
    rating: 4,
    content:
      "Hướng dẫn viên thân thiện, chia sẻ nhiều câu chuyện thú vị. Nếu thêm thời gian café nữa thì quá tuyệt.",
    createdAt: "2025-09-11T19:10:00+07:00",
  },
  {
    id: "rv-dl-4",
    author: "Lan Huệ",
    rating: 5,
    content:
      "Vườn dâu công nghệ cao và trang trại cà phê đúng chất Đà Lạt. Rất đáng để quay lại.",
    createdAt: "2025-08-30T14:05:00+07:00",
  },
];

const hueTourReviews: TourReviewSeed[] = [
  {
    id: "rv-hue-1",
    author: "Lệ Quyên",
    rating: 5,
    content:
      "Trải nghiệm áo dài cung đình và ca Huế trên sông Hương khiến chuyến đi đầy cảm xúc.",
    createdAt: "2025-10-18T20:00:00+07:00",
  },
  {
    id: "rv-hue-2",
    author: "Đức Tín",
    rating: 5,
    content:
      "Lộ trình kết hợp di sản và nghỉ dưỡng quá hợp lý, gia đình mình ai cũng hài lòng.",
    createdAt: "2025-09-29T09:20:00+07:00",
  },
  {
    id: "rv-hue-3",
    author: "Bảo Vy",
    rating: 4,
    content:
      "Ẩm thực Huế ngon khỏi bàn, nếu lịch trình chậm lại một chút thì sẽ tận hưởng nhiều hơn.",
    createdAt: "2025-09-08T16:45:00+07:00",
  },
  {
    id: "rv-hue-4",
    author: "Hoàng Phúc",
    rating: 5,
    content:
      "Suối khoáng Thanh Tân thư giãn, concierge chủ động chuẩn bị mọi thứ nên cả đoàn chỉ việc tận hưởng.",
    createdAt: "2025-08-20T11:30:00+07:00",
  },
];

const danangTourReviews: TourReviewSeed[] = [
  {
    id: "rv-dn-1",
    author: "Gia Minh",
    rating: 5,
    content:
      "Bà Nà Hills và Cầu Vàng quá ấn tượng, ekip còn chụp giúp gia đình mình rất nhiều tấm ảnh đẹp.",
    createdAt: "2025-10-05T10:15:00+07:00",
  },
  {
    id: "rv-dn-2",
    author: "Thanh Hà",
    rating: 4,
    content:
      "Biển Mỹ Khê nước trong xanh, lịch trình cân bằng giữa tham quan và nghỉ dưỡng.",
    createdAt: "2025-09-21T18:40:00+07:00",
  },
  {
    id: "rv-dn-3",
    author: "Khánh Ngọc",
    rating: 5,
    content:
      "Team building và gala dinner tổ chức chuyên nghiệp, công ty mình rất ấn tượng.",
    createdAt: "2025-09-03T20:05:00+07:00",
  },
  {
    id: "rv-dn-4",
    author: "Tấn Lộc",
    rating: 5,
    content:
      "Concierge theo sát 24/7, hỗ trợ linh hoạt khi gia đình có trẻ nhỏ. Điểm cộng rất lớn!",
    createdAt: "2025-08-24T13:50:00+07:00",
  },
];

const nhatrangTourReviews: TourReviewSeed[] = [
  {
    id: "rv-nt-1",
    author: "Thuỳ Linh",
    rating: 5,
    content:
      "Tour 3 đảo cực vui, cả nhà được lặn ngắm san hô và thưởng thức hải sản tươi ngon.",
    createdAt: "2025-10-08T09:30:00+07:00",
  },
  {
    id: "rv-nt-2",
    author: "Minh Tâm",
    rating: 4,
    content:
      "Khách sạn ven biển sang trọng, spa bùn khoáng thư giãn. Mình sẽ giới thiệu cho bạn bè.",
    createdAt: "2025-09-22T14:10:00+07:00",
  },
  {
    id: "rv-nt-3",
    author: "Quang Hòa",
    rating: 5,
    content:
      "Hướng dẫn viên nhiệt tình, xe đưa đón đời mới. Con nhỏ nhà mình được chăm sóc tận tâm.",
    createdAt: "2025-09-06T19:25:00+07:00",
  },
  {
    id: "rv-nt-4",
    author: "Thảo Nhi",
    rating: 5,
    content:
      "VinWonders và cáp treo vượt biển quá đỉnh, lịch trình linh hoạt cho cả người lớn lẫn trẻ em.",
    createdAt: "2025-08-18T11:05:00+07:00",
  },
];

const quangBinhTourReviews: TourReviewSeed[] = [
  {
    id: "rv-qb-1",
    author: "Hoài Nam",
    rating: 5,
    content:
      "Động Phong Nha và Thiên Đường hùng vĩ, hướng dẫn viên kể chuyện rất cuốn.",
    createdAt: "2025-10-02T08:45:00+07:00",
  },
  {
    id: "rv-qb-2",
    author: "Phương Anh",
    rating: 5,
    content:
      "Zipline và chèo kayak trên sông Chày là trải nghiệm đáng thử. An toàn và thú vị.",
    createdAt: "2025-09-19T15:20:00+07:00",
  },
  {
    id: "rv-qb-3",
    author: "Nhật Quang",
    rating: 4,
    content:
      "Resort ven biển sạch đẹp, đồ ăn địa phương lạ miệng. Nếu thời tiết đẹp hơn thì sẽ hoàn hảo.",
    createdAt: "2025-09-01T17:35:00+07:00",
  },
  {
    id: "rv-qb-4",
    author: "Thanh Tâm",
    rating: 5,
    content:
      "Lịch trình adventure phù hợp nhóm bạn, nhân viên hỗ trợ chu đáo từ khâu chuẩn bị đến kết thúc.",
    createdAt: "2025-08-22T12:25:00+07:00",
  },
];

const phuYenTourReviews: TourReviewSeed[] = [
  {
    id: "rv-py-1",
    author: "Tuyết Mai",
    rating: 5,
    content:
      "Ghềnh Đá Đĩa và Mũi Đại Lãnh đẹp ngỡ ngàng, cảnh bình minh khiến cả đoàn mê mẩn.",
    createdAt: "2025-10-06T05:55:00+07:00",
  },
  {
    id: "rv-py-2",
    author: "Đông Phương",
    rating: 5,
    content:
      "Ẩm thực Phú Yên độc đáo, concierge đặt sẵn nhà hàng địa phương nên không phải chờ đợi.",
    createdAt: "2025-09-23T13:15:00+07:00",
  },
  {
    id: "rv-py-3",
    author: "Văn Hào",
    rating: 4,
    content:
      "Du thuyền trên Đầm Ô Loan rất chill, nếu có thêm hoạt động cho trẻ em thì sẽ tuyệt hơn.",
    createdAt: "2025-09-07T18:05:00+07:00",
  },
  {
    id: "rv-py-4",
    author: "Kim Chi",
    rating: 5,
    content:
      "Concierge chuẩn bị bánh hoa vàng và quà lưu niệm, cảm giác được chăm sóc rất đặc biệt.",
    createdAt: "2025-08-27T09:40:00+07:00",
  },
];

const phanThietTourReviews: TourReviewSeed[] = [
  {
    id: "rv-pt-1",
    author: "Trung Kiên",
    rating: 5,
    content:
      "Đồi cát bay và trải nghiệm trượt cát cực kỳ thú vị, trẻ con mê tít.",
    createdAt: "2025-09-30T16:10:00+07:00",
  },
  {
    id: "rv-pt-2",
    author: "Hồng Nhung",
    rating: 4,
    content:
      "Resort sát biển đẹp, đồ ăn hải sản tươi. Nếu di chuyển có xe riêng thì sẽ tiện hơn.",
    createdAt: "2025-09-14T12:45:00+07:00",
  },
  {
    id: "rv-pt-3",
    author: "Duy Anh",
    rating: 5,
    content:
      "Làng chài Mũi Né nhiều góc chụp đẹp, concierge hỗ trợ đổi lịch linh hoạt khi thời tiết thay đổi.",
    createdAt: "2025-08-31T09:55:00+07:00",
  },
  {
    id: "rv-pt-4",
    author: "Mỹ Tiên",
    rating: 5,
    content:
      "Suối Tiên và đặc sản Phan Thiết được sắp xếp tham quan thông minh, cả đoàn ai cũng vui.",
    createdAt: "2025-08-19T15:35:00+07:00",
  },
];

const TOUR_REVIEW_LIBRARY: Record<string, TourReviewSeed[]> = {
  default: defaultTourReviews,
  "dalat-flowers": dalatTourReviews,
  "dalat-clouds": dalatTourReviews,
  "hue-heritage": hueTourReviews,
  "hue-serenity": hueTourReviews,
  "danang-lights": danangTourReviews,
  "danang-hoian-spring": danangTourReviews,
  "nhatrang-paradise": nhatrangTourReviews,
  "nhatrang-vinwonders": nhatrangTourReviews,
  "quangbinh-heritage": quangBinhTourReviews,
  "quangbinh-adventure": quangBinhTourReviews,
  "phuyen-flower": phuYenTourReviews,
  "phuyen-vungr0": phuYenTourReviews,
  "phanthiet-dunes": phanThietTourReviews,
};

const getStaticReviewsForTour = (tourId: string | number | null | undefined) => {
  if (tourId === null || tourId === undefined) {
    return TOUR_REVIEW_LIBRARY.default;
  }
  const key = tourId.toString();
  return TOUR_REVIEW_LIBRARY[key] ?? TOUR_REVIEW_LIBRARY.default;
};

const destinationOptions = Array.from(
  new Set(tours.map((tour) => tour.destination)),
);

const reasons = [
  {
    icon: "🧭",
    title: "Lộ trình tinh gọn",
    description:
      "Đội ngũ chuyên gia bản địa khảo sát từng điểm dừng để tối ưu thời gian di chuyển và trải nghiệm.",
  },
  {
    icon: "🛡️",
    title: "Chăm sóc trọn gói",
    description:
      "Từ xe đưa đón, hướng dẫn viên đến bảo hiểm du lịch – mọi thứ được chuẩn bị sẵn sàng cho bạn.",
  },
  {
    icon: "🤝",
    title: "Kết nối chân thành",
    description:
      "Hướng dẫn viên đồng hành 24/7 và sẵn sàng tùy biến lịch trình theo yêu cầu trong suốt chuyến đi.",
  },
];

const galleryImages = [
  "https://hanoitourist.vn/sites/default/files/inline-images/gvghv_0.jpg",
  "https://datviettour.com.vn/uploads/images/tin-tuc/danh-muc-truyen-thong/cuoc-thi-huong-dan-vien-du-lich-trien-vong-toan-thanh-nam-2025/dat-viet-tour-nha-tai-tro-vang.jpg",
  "https://innotour.vn/image/catalog/tour-khach-doan-da-thuc-hien/2024/da-nang-cty-iq-medical/tour-da-nang-cung-cty-iq-medical-1.jpg",
  "https://channel.mediacdn.vn/428462621602512896/2022/6/16/photo-1-16553918346501139565093.jpg",
  "https://www.startravel.vn/upload/GalleryTour/AN241121_1_29_11_2024_15_37_24.webp",
  "https://innotour.vn/image/catalog/tour-khach-doan-da-thuc-hien/2024/nha-trang-cty-duoc-polovita/tour-nha-trang-cung-cty-duoc-polovita-10.jpg",
];

const feedbacks = [
  {
    name: "Minh-Châu & David",
    tour: "Đà Lạt Dreamy Suite · Đà Lạt",
    quote:
      "Hành trình được cá nhân hoá tuyệt vời. Concierge chủ động chuẩn bị hoa, bánh và cả những bất ngờ dễ thương.",
    image: "https://www.vietiso.com/images/2023/blog/5-2023/tourist.png",
  },
  {
    name: "Gia đình Thuý Hạnh",
    tour: "Huế Heritage Suite · Huế",
    quote:
      "Các con được trải nghiệm áo dài cung đình, chèo thuyền rồng và lớp làm bánh. Dịch vụ tận tâm khiến cả nhà rất hài lòng.",
    image:
      "https://vanangroup.com.vn/wp-content/uploads/2024/10/khach-du-lich-la-gi.webp",
  },
  {
    name: "Quốc Anh & Team",
    tour: "Đà Nẵng Ocean Reserve · Đà Nẵng",
    quote:
      "Team building trên bãi biển, BBQ riêng tại villa và hỗ trợ 24/7. Một chuyến đi đáng nhớ cho cả công ty.",
    image:
      "https://www.vietiso.com/images/2023/blog/5-2023/tourist_behavior.png",
  },
];

export default function BookingPage() {
  const { profile, supabase, refreshProfile } = useSupabase();
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [notes, setNotes] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [tourBookingStatus, setTourBookingStatus] = useState<{
    status: "idle" | "loading" | "success" | "error";
    message: string;
    activeId: string | number | null;
  }>({
    status: "idle",
    message: "",
    activeId: null,
  });

  const hasCompleteFilters = Boolean(destination && startDate);

  const results = useMemo(() => {
    if (!hasSearched || !hasCompleteFilters) {
      return [] as Tour[];
    }
    return tours.filter((tour) => tour.destination === destination);
  }, [destination, hasCompleteFilters, hasSearched]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSearched(true);
  };

  const handleBookTour = useCallback(
    async ({
      tourId,
      tourName,
      bookingSlug,
    }: {
      tourId: string | number;
      tourName: string;
      adultCount: number;
      childCount: number;
      totalAmount: number;
      baseAdultPrice: number;
      baseChildPrice: number;
      bookingSlug?: string;
    }) => {
      if (!profile?.id) {
        setTourBookingStatus({
          status: "error",
          message: "Vui lòng đăng nhập để đặt tour.",
          activeId: tourId,
        });
        return;
      }

      if (!bookingSlug) {
        setTourBookingStatus({
          status: "error",
          message: "Tour này chưa hỗ trợ đặt trực tuyến. Vui lòng liên hệ concierge.",
          activeId: tourId,
        });
        return;
      }

      setTourBookingStatus({
        status: "loading",
        message: "",
        activeId: tourId,
      });

      try {
        if (!supabase) {
          throw new Error("Supabase client không khả dụng. Vui lòng tải lại trang.");
        }
        const { error } = await supabase.rpc("create_tour_booking", {
          p_profile_id: profile.id,
          p_tour_slug: bookingSlug,
        });

        if (error) throw error;

        setTourBookingStatus({
          status: "success",
          message: `Đặt tour "${tourName}" thành công! Đội ngũ HÀNH TRÌNH VIỆT sẽ liên hệ xác nhận trong 24 giờ.`,
          activeId: tourId,
        });
        await refreshProfile();
      } catch (error) {
        console.error("Không thể đặt tour:", error);
        const message =
          error instanceof Error && error.message.includes("Insufficient balance")
            ? "Số dư ví chưa đủ để đặt tour. Vui lòng nạp thêm."
            : error instanceof Error
            ? error.message
            : "Không thể đặt tour. Vui lòng thử lại.";
        setTourBookingStatus({
          status: "error",
          message,
          activeId: tourId,
        });
      }
    },
    [profile?.id, refreshProfile, supabase],
  );

  const resetTourBookingStatus = useCallback(() => {
    setTourBookingStatus((prev) =>
      prev.status === "idle"
        ? prev
        : {
            status: "idle",
            message: "",
            activeId: null,
          },
    );
  }, []);

  return (
    <main className="bg-white">
      <MainHeader variant="translucent" />

      {/* Hero Banner */}
      <section className="relative overflow-hidden py-24 text-white">
        <Image
          src="https://hanoitourist.vn/sites/default/files/inline-images/gvghv_0.jpg"
          alt="Đoàn khách HÀNH TRÌNH VIỆT"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 pt-16 lg:flex-row lg:items-center">
          <div className="max-w-2xl space-y-6">
            <p className="inline-flex items-center rounded-full bg-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em]">
              HÀNH TRÌNH VIỆT Concierge
            </p>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              Đặt tour riêng theo phong cách của bạn
            </h1>
            <p className="text-base text-white/85">
              Chúng tôi lắng nghe mong muốn, tư vấn phương án tối ưu và đồng hành
              trọn vẹn từ lúc khởi hành đến khi trở về. Hành trình của bạn sẽ luôn
              được cá nhân hoá với dịch vụ đẳng cấp.
            </p>
            <ul className="space-y-3 text-sm text-white/80">
              <li>• Tư vấn 1-1 miễn phí và bảo mật thông tin.</li>
              <li>• Lộ trình đề xuất trong vòng 24 giờ làm việc.</li>
              <li>• Concierge theo sát 24/7 và hỗ trợ xử lý mọi tình huống.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Reasons */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Vì sao bạn chọn chúng tôi
            </h2>
            <p className="mt-3 text-base text-slate-600">
              HÀNH TRÌNH VIỆT biến mọi chuyến đi thành trải nghiệm đáng nhớ, với hệ sinh
              thái dịch vụ được thiết kế riêng cho từng nhóm khách.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {reasons.map((reason) => (
              <div
                key={reason.title}
                className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl">
                  {reason.icon}
                </div>
                <h3 className="mt-6 text-lg font-semibold text-slate-900">
                  {reason.title}
                </h3>
                <p className="mt-3 text-sm text-slate-600">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="bg-slate-900 py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div className="space-y-6 text-white">
            <p className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em]">
              HÀNH TRÌNH VIỆT Planner
            </p>
            <h2 className="text-3xl font-semibold md:text-4xl">
              Chia sẻ mong muốn, chúng tôi lo phần còn lại
            </h2>
            <p className="text-sm text-white/80">
              Điền những thông tin cơ bản để concierge xây dựng hành trình dựa trên
              sở thích, ngân sách và nhịp sống của bạn.
            </p>
            <ul className="space-y-3 text-sm text-white/70">
              <li>• Đề xuất kèm báo giá gửi trong 24 giờ qua email hoặc Zalo.</li>
              <li>• Được chọn dịch vụ lưu trú, xe, trải nghiệm theo nhiều cấp độ.</li>
              <li>• Điều chỉnh linh hoạt lịch trình trước ngày khởi hành.</li>
            </ul>
          </div>
          <form
            onSubmit={handleSubmit}
            className="rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-md"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                  Bạn muốn đi đâu?
                </label>
                <select
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-emerald-300 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-200/40"
                >
                  <option value="">Chọn điểm đến</option>
                  {destinationOptions.map((option) => (
                    <option key={option} value={option} className="text-slate-900">
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                  Thời gian khởi hành
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-emerald-300 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-200/40"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                  Ghi chú thêm (tuỳ chọn)
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Số lượng khách, nhu cầu lưu trú, mong muốn trải nghiệm..."
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-emerald-300 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-200/40"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-6 w-full rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-emerald-400"
            >
              Tìm kiếm hành trình
            </button>
          </form>
        </div>
      </section>

      {/* Search Results */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
                {hasSearched
                  ? hasCompleteFilters
                    ? `Tour gợi ý tại ${destination}`
                    : "Hãy chọn địa điểm và ngày khởi hành để xem tour phù hợp"
                  : "Hãy nhập thông tin để bắt đầu tìm tour"}
              </h2>
              {hasSearched && hasCompleteFilters && (
                <p className="mt-2 inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white">
                  {startDate}
                </p>
              )}
            {hasSearched && !hasCompleteFilters && (
              <p className="mt-2 text-sm text-amber-600">
                Vui lòng chọn địa điểm và ngày khởi hành trước khi bấm tìm kiếm.
              </p>
            )}
            </div>
            <p className="text-sm text-slate-500">
              Chạm vào từng tour để xem chi tiết lịch trình, giá và dịch vụ kèm theo.
            </p>
          </div>

          {!hasSearched ? null : hasCompleteFilters ? (
            results.length === 0 ? (
              <div className="mt-8 rounded-[28px] border border-dashed border-emerald-300 bg-emerald-50/60 p-8 text-center text-sm text-emerald-700">
                Rất tiếc, hiện chưa có tour được lập cho điểm đến này. Vui lòng liên
                hệ concierge để được thiết kế hành trình riêng cho bạn.
              </div>
            ) : (
              <div className="mt-10 grid gap-6 md:grid-cols-3">
                {results.map((tour) => (
                  <article
                    key={tour.id}
                    className="group flex cursor-pointer flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
                    onClick={() => {
                      resetTourBookingStatus();
                      setSelectedTour(tour);
                    }}
                  >
                    <div className="relative h-56 w-full overflow-hidden bg-slate-200">
                      <Image
                        src={tour.image}
                        alt={tour.name}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-110"
                      />
                      <span className="absolute left-5 top-5 rounded-full bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-900">
                        {tour.tag}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-6">
                      <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
                        <span>{tour.location}</span>
                        <span>{tour.duration}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900">
                        {tour.name}
                      </h3>
                      <p className="text-sm text-slate-600">{tour.description}</p>
                      <p className="text-sm font-semibold text-emerald-600">
                        Giá người lớn: {formatCurrency(tour.adultPrice)}
                      </p>
                      <p className="text-xs text-slate-500">
                        Trẻ em: {formatCurrency(tour.childPrice)} (50% giá người lớn)
                      </p>
                      <div className="mt-auto flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-500">
                        <span>⭐ {tour.rating.toFixed(1)}</span>
                        <button className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600 transition hover:text-emerald-500">
                          Xem chi tiết
                          <span className="ml-2 text-base">→</span>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )
          ) : (
            <div className="mt-8 rounded-[28px] border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-600">
              Vui lòng chọn địa điểm và ngày khởi hành trước khi tìm kiếm.
            </div>
          )}
        </div>
      </section>

      <TourDetailModal
        isOpen={Boolean(selectedTour)}
        tour={selectedTour ?? tours[0]}
        onClose={() => {
          setSelectedTour(null);
          resetTourBookingStatus();
        }}
        onBook={handleBookTour}
        bookingState={{
          isLoading: tourBookingStatus.status === "loading",
          successMessage:
            tourBookingStatus.status === "success" ? tourBookingStatus.message : null,
          errorMessage:
            tourBookingStatus.status === "error" ? tourBookingStatus.message : null,
          activeTourId: tourBookingStatus.activeId,
        }}
        staticReviews={getStaticReviewsForTour((selectedTour ?? tours[0]).id)}
      />

      {/* Gallery */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Hình ảnh các chuyến đi
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Những khoảnh khắc đáng nhớ mà HÀNH TRÌNH VIỆT đã đồng hành cùng khách hàng
              trên khắp mọi miền đất nước.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {galleryImages.map((src) => (
              <div
                key={src}
                className="group relative h-64 overflow-hidden rounded-[28px] shadow-lg"
              >
                <Image
                  src={src}
                  alt="Khoảnh khắc tour HÀNH TRÌNH VIỆT"
                  fill
                  className="object-cover transition duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Companions */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-4">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Đồng hành cùng chúng tôi
            </h2>
            <p className="text-base text-slate-600">
              Hơn 200 doanh nghiệp, tổ chức và trường học đã lựa chọn HÀNH TRÌNH VIỆT là
              đối tác tổ chức tour. Chúng tôi tự hào mang tới những giải pháp du
              lịch linh hoạt, bền vững và gắn kết cộng đồng.
            </p>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>• Dịch vụ MICE, team building, incentive theo quy mô.</li>
              <li>
                • Ưu đãi riêng cho khách hàng thân thiết và đoàn số lượng lớn.
              </li>
              <li>• Hệ thống hậu cần chuyên nghiệp, quy trình chuẩn quốc tế.</li>
            </ul>
          </div>
          <div className="relative flex-1">
            <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl">
              <Image
                src="/images/doingu.png"
                alt="Đối tác HÀNH TRÌNH VIỆT"
                width={720}
                height={480}
                className="w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Feedback */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Feedback khách hàng
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Nghe khách nói về hành trình họ đã trải qua cùng HÀNH TRÌNH VIỆT và đội ngũ
              concierge tận tâm.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {feedbacks.map((feedback) => (
              <article
                key={feedback.name}
                className="flex h-full flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-slate-100">
                    <Image
                      src={feedback.image}
                      alt={feedback.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-900">
                      {feedback.name}
                    </p>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                      {feedback.tour}
                    </p>
                  </div>
                </div>
                <p className="flex-1 text-sm italic text-slate-700">
                  “{feedback.quote}”
                </p>
                <div className="text-sm font-semibold text-emerald-600">
                  ⭐⭐⭐⭐⭐
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
