"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useMemo, useState } from "react";
import AccommodationModal from "../components/AccommodationModal";

type StayType = "hotel" | "homestay" | "resort";

export interface StayOption {
  id: string;
  name: string;
  location: string;
  type: StayType;
  priceFrom: string;
  description: string;
  image: string;
  highlights: string[];
  bookingSlug?: string;
}

interface AccommodationProps {
  onBookStay?: (stay: StayOption) => void;
  bookingState?: {
    isLoading?: boolean;
    successMessage?: string | null;
    errorMessage?: string | null;
    activeStayId?: string | null;
  };
  onDismissFeedback?: () => void;
}

const stayOptions: StayOption[] = [
  // Đà Lạt
  {
    id: "dalat-pine-retreat",
    bookingSlug: "stay-dalat-pine-retreat",
    name: "Đà Lạt Pine Retreat",
    location: "Đà Lạt",
    type: "homestay",
    priceFrom: "1.000.000đ / đêm",
    description:
      "Phòng đôi ấm áp nằm giữa rừng thông với hương hoa lan tỏa khắp không gian, phù hợp cho cặp đôi yêu sự yên bình.",
    image:
      "https://manmo.vn/wp-content/uploads/2023/07/Homestay-phong-kinh-Da-Lat.jpg",
    highlights: [
      "Ban công nhìn thẳng ra đồi thông",
      "Bữa sáng homemade với mứt dâu Đà Lạt",
      "Lò sưởi đốt củi riêng trong phòng",
    ],
  },
  {
    id: "dalat-dreamy-suite",
    bookingSlug: "stay-dalat-dreamy-suite",
    name: "Đà Lạt Dreamy Suite",
    location: "Đà Lạt",
    type: "hotel",
    priceFrom: "2.000.000đ / đêm",
    description:
      "Suite rộng 45m² với cửa kính toàn cảnh, phong cách Scandinavian kết hợp với nội thất gỗ thông mộc mạc.",
    image:
      "https://agotourist.com/wp-content/uploads/2020/10/khach-san-minh-chien-da-lat-1.jpg",
    highlights: [
      "Bathtub đặt cạnh cửa sổ nhìn toàn cảnh thung lũng",
      "Mini bar với trà atiso và snack địa phương",
      "Đệm sưởi nhiệt độ tự điều chỉnh",
    ],
  },
  {
    id: "dalat-skyline-villa",
    bookingSlug: "stay-dalat-skyline-villa",
    name: "Đà Lạt Skyline Villa",
    location: "Đà Lạt",
    type: "resort",
    priceFrom: "3.000.000đ / đêm",
    description:
      "Biệt thự 2 phòng ngủ trong khu nghỉ dưỡng sang trọng, có sân vườn riêng và hồ bơi nước ấm.",
    image:
      "https://tiki.vn/blog/wp-content/uploads/2022/12/khach-san-da-lat.jpg",
    highlights: [
      "Quản gia chăm sóc 24/7 và private BBQ",
      "Xe buggy đưa đón nội khu",
      "Phòng xông hơi hương thảo mộc",
    ],
  },
  // Huế
  {
    id: "hue-garden-deluxe",
    bookingSlug: "stay-hue-garden-deluxe",
    name: "Huế Garden Deluxe",
    location: "Huế",
    type: "homestay",
    priceFrom: "1.000.000đ / đêm",
    description:
      "Phòng nằm trong biệt thất cổ bên sông Hương, giữ nguyên nền gạch bông và cửa gỗ nguyên bản.",
    image:
      "https://ik.imagekit.io/tvlk/image/imageResource/2025/02/24/1740378950440-793bb3f09c5a0e887465614524c3d235.jpeg",
    highlights: [
      "Sân vườn rợp bóng cây đại",
      "Trãi nghiệm trà cung đình lúc 5h chiều",
      "Xe đạp vintage dạo phố miễn phí",
    ],
  },
  {
    id: "hue-heritage-suite",
    bookingSlug: "stay-hue-heritage-suite",
    name: "Huế Heritage Suite",
    location: "Huế",
    type: "hotel",
    priceFrom: "2.000.000đ / đêm",
    description:
      "Suite lấy cảm hứng từ triều Nguyễn với giường baldachin, họa tiết rồng phượng tinh xảo.",
    image:
      "https://statics.vinpearl.com/gia-phong-vinpearl-hue-2_1627379379.jpg",
    highlights: [
      "Bữa sáng floating trên hồ sen",
      "Phòng tắm đá cẩm thạch với tinh dầu trầm hương",
      "Dịch vụ áo dài và áo ngũ thân chụp ảnh",
    ],
  },
  {
    id: "hue-imperial-residence",
    bookingSlug: "stay-hue-imperial-residence",
    name: "Huế Imperial Residence",
    location: "Huế",
    type: "resort",
    priceFrom: "3.000.000đ / đêm",
    description:
      "Villa riêng tại khu nghỉ dưỡng ven phá Tam Giang, có hồ bơi riêng và bể sục nước khoáng.",
    image:
      "https://cdn2.vietnambooking.com/wp-content/uploads/hotel_pro/hotel_348809/c6a9e5396a44db6dbdeba8d38c7468cb.jpg",
    highlights: [
      "Dịch vụ đưa đón bằng thuyền rồng",
      "Ẩm thực cung đình trình diễn tại villa",
      "Phòng thiền và yoga nhìn ra mặt nước",
    ],
  },
  // Đà Nẵng
  {
    id: "danang-coastal-chic",
    bookingSlug: "stay-danang-coastal-chic",
    name: "Đà Nẵng Coastal Chic",
    location: "Đà Nẵng",
    type: "hotel",
    priceFrom: "1.000.000đ / đêm",
    description:
      "Phòng khách sạn hướng biển Mỹ Khê, décor tông trắng xanh biển trẻ trung và hiện đại.",
    image:
      "https://ik.imagekit.io/tvlk/blog/2022/08/khach-san-view-bien-da-nang-2.jpg",
    highlights: [
      "Ban công nhìn trực diện biển Mỹ Khê",
      "Hồ bơi vô cực chung tầng 20",
      "Ăn sáng buffet với hải sản Đà Nẵng",
    ],
  },
  {
    id: "danang-marble-suite",
    bookingSlug: "stay-danang-marble-suite",
    name: "Đà Nẵng Marble Suite",
    location: "Đà Nẵng",
    type: "hotel",
    priceFrom: "2.000.000đ / đêm",
    description:
      "Suite 1 phòng ngủ lấy cảm hứng từ Ngũ Hành Sơn với đá cẩm thạch và ánh sáng tự nhiên.",
    image:
      "https://eholiday.vn/wp-content/uploads/2024/03/Khach-san-Mangata-Beachfront-Da-Nang-Phong-Deluxe.jpg",
    highlights: [
      "Phòng khách riêng với quầy bar mini",
      "Dịch vụ spa đá nóng cam kết 60 phút",
      "Xe limousine đưa đón sân bay",
    ],
  },
  {
    id: "danang-ocean-reserve",
    bookingSlug: "stay-danang-ocean-reserve",
    name: "Đà Nẵng Ocean Reserve",
    location: "Đà Nẵng",
    type: "resort",
    priceFrom: "3.000.000đ / đêm",
    description:
      "Biệt thự cạnh bán đảo Sơn Trà, có hồ bơi và khu BBQ riêng, thích hợp cho nhóm bạn.",
    image:
      "https://ik.imagekit.io/tvlk/blog/2022/08/khach-san-view-bien-da-nang-2.jpg",
    highlights: [
      "Hồ bơi riêng và cabana hướng biển",
      "Lớp yoga bình minh trên bãi cát",
      "Chef riêng phục vụ tiệc hải sản",
    ],
  },
  // Nha Trang
  {
    id: "nhatrang-sunrise-room",
    bookingSlug: "stay-nhatrang-sunrise-room",
    name: "Nha Trang Sunrise Room",
    location: "Nha Trang",
    type: "hotel",
    priceFrom: "1.000.000đ / đêm",
    description:
      "Phòng đôi cao tầng trên đường Trần Phú, ngắm bình minh ngay trên giường với rèm tự động.",
    image:
      "https://statics.vinpearl.com/VPRSNTB%20_%20Execultive%20Suite%201_1660819488.jpg",
    highlights: [
      "Giường king với nệm memory foam",
      "Bồn tắm đứng kèm máy xông hơi",
      "Vé tắm bùn khoáng đi kèm",
    ],
  },
  {
    id: "nhatrang-coral-suite",
    bookingSlug: "stay-nhatrang-coral-suite",
    name: "Nha Trang Coral Suite",
    location: "Nha Trang",
    type: "hotel",
    priceFrom: "2.000.000đ / đêm",
    description:
      "Suite tông trắng - san hô, có phòng khách riêng và cửa kính nhìn ra vịnh biển Nha Trang.",
    image:
      "https://statics.vinpearl.com/cac-loai-phong-o-vinpearl-nha-trang-3.jpg",
    highlights: [
      "Vé charter cano thăm 3 đảo",
      "Đồ uống chào mừng với yến sào",
      "Mini bar refill mỗi ngày",
    ],
  },
  {
    id: "nhatrang-lagoon-villa",
    bookingSlug: "stay-nhatrang-lagoon-villa",
    name: "Nha Trang Lagoon Villa",
    location: "Nha Trang",
    type: "resort",
    priceFrom: "3.000.000đ / đêm",
    description:
      "Villa ven vịnh với hồ bơi riêng, sân cỏ rộng cho team building và dịch vụ BBQ hải sản.",
    image:
      "https://onlinebooking.vn/wp-content/uploads/vinpearl-beachfront-grand-2bedroom-ocean-view-5.jpg",
    highlights: [
      "Bữa tối BBQ hải sản tại villa",
      "Kayak và sup miễn phí",
      "Trị liệu spa bằng bùn khoáng",
    ],
  },
  // Quảng Bình
  {
    id: "quangbinh-river-lodge",
    bookingSlug: "stay-quangbinh-river-lodge",
    name: "Quảng Bình River Lodge",
    location: "Quảng Bình",
    type: "homestay",
    priceFrom: "1.000.000đ / đêm",
    description:
      "Phòng lodge ven sông Son, décor gỗ kiến trúc bản địa cực chill cho khách thích khám phá hang động.",
    image:
      "https://aw-d.tripcdn.com/images/1mc6c12000ir6qmwqCDC7.jpg",
    highlights: [
      "View sông Son và bến thuyền riêng",
      "Combo vé động Phong Nha",
      "Bữa tối BBQ bờ sông với cá mè truyền thống",
    ],
  },
  {
    id: "quangbinh-cave-suite",
    bookingSlug: "stay-quangbinh-cave-suite",
    name: "Quảng Bình Cave Suite",
    location: "Quảng Bình",
    type: "hotel",
    priceFrom: "2.000.000đ / đêm",
    description:
      "Suite tái hiện nhũ đá kỳ ảo với hệ thống đèn nghệ thuật, nằm trong khách sạn trung tâm Đồng Hới.",
    image:
      "https://www.annovahotel.com/storage/r5-6723-copy-878x494.jpg",
    highlights: [
      "Xe riêng đưa đón sân bay Đồng Hới",
      "Tour động Thiên Đường nửa ngày",
      "Pool bar với cocktail lấy cảm hứng hang động",
    ],
  },
  {
    id: "quangbinh-emerald-residence",
    bookingSlug: "stay-quangbinh-emerald-residence",
    name: "Quảng Bình Emerald Residence",
    location: "Quảng Bình",
    type: "resort",
    priceFrom: "3.000.000đ / đêm",
    description:
      "Villa sát bãi biển Nhật Lệ, có hồ bơi vô cực và phòng ngủ hướng biển với kính toàn cảnh.",
    image:
      "https://eholiday.vn/wp-content/uploads/2024/12/Nha-Trang-Marriott-Resort-Spa-Hon-Tre-Island-villa-3-phong-ngu-huong-vuon-.jpg",
    highlights: [
      "Private picnic trên bờ biển Nhật Lệ",
      "Dịch vụ spa thảo dược địa phương",
      "Xe đạp đôi chạy dọc bờ biển",
    ],
  },
  // Phú Yên
  {
    id: "phuyen-bay-room",
    bookingSlug: "stay-phuyen-bay-room",
    name: "Phú Yên Bay Room",
    location: "Phú Yên",
    type: "hotel",
    priceFrom: "1.000.000đ / đêm",
    description:
      "Phòng khách sạn hướng biển Tuy Hòa, thiết kế mang tông xanh Jade hòa cùng màu trời biển.",
    image:
      "https://vesnahotelnhatrang.com/wp-content/uploads/2023/01/vesna-noithat-1-1024x681.jpg",
    highlights: [
      "View ghềnh Đá Đĩa từ ban công",
      "Bữa sáng với bánh canh hẹ Phú Yên",
      "Xe điện đưa ra bãi Xép",
    ],
  },
  {
    id: "phuyen-lagoon-suite",
    bookingSlug: "stay-phuyen-lagoon-suite",
    name: "Phú Yên Lagoon Suite",
    location: "Phú Yên",
    type: "hotel",
    priceFrom: "2.000.000đ / đêm",
    description:
      "Suite rộng với phòng khách riêng và cửa kính hướng phá Ô Loan, décor lấy cảm hứng từ làng chài.",
    image:
      "https://havanahotel.vn/storage/2024-room/91-deluxe-ocean-view-olus.jpg",
    highlights: [
      "Xe jeep check-in Mũi Điện bình minh",
      "Bồn tắm đá cẩm thạch kèm muối thảo mộc",
      "Lớp nấu ăn món cá ngừ đại dương trứ danh",
    ],
  },
  {
    id: "phuyen-bliss-villa",
    bookingSlug: "stay-phuyen-bliss-villa",
    name: "Phú Yên Bliss Villa",
    location: "Phú Yên",
    type: "resort",
    priceFrom: "3.000.000đ / đêm",
    description:
      "Villa sát biển Đá Bàn, có hồ bơi vô cực và khu vườn nhiệt đới riêng tư cho bữa tiệc barbecue.",
    image:
      "https://imperialnhatranghotel.com/wp-content/uploads/2022/09/Superior_04-1024x717.jpg",
    highlights: [
      "BBQ hải sản với đầu bếp riêng",
      "Kayak ngắm hoàng hôn tại Vũng Rô",
      "Liệu trình spa đá muối",
    ],
  },
  // Phan Thiết
  {
    id: "phanthiet-sand-room",
    bookingSlug: "stay-phanthiet-sand-room",
    name: "Phan Thiết Sand Room",
    location: "Phan Thiết",
    type: "hotel",
    priceFrom: "1.000.000đ / đêm",
    description:
      "Phòng khách sạn trẻ trung trên trục resort Hàm Tiến, cách bãi biển chỉ 50m.",
    image:
      "https://www.annovahotel.com/storage/event/r5-6981-copy.jpg",
    highlights: [
      "Combo trượt cát Đồi Hồng",
      "Vé tham quan Làng chài Mũi Né",
      "Bữa sáng với bánh căn Phan Thiết",
    ],
  },
  {
    id: "phanthiet-dune-suite",
    bookingSlug: "stay-phanthiet-dune-suite",
    name: "Phan Thiết Dune Suite",
    location: "Phan Thiết",
    type: "hotel",
    priceFrom: "2.000.000đ / đêm",
    description:
      "Suite sang trọng với phòng khách và ban công lớn, décor tông be cát hòa cùng không khí biển.",
    image:
      "https://havanahotel.vn/storage/2024-room/81-club-suite-ocean-view.jpg",
    highlights: [
      "Đưa đón riêng sân bay Cam Ranh/Phan Thiết",
      "Bồn tắm sục hướng biển",
      "Quầy bar riêng với menu cocktail nhiệt đới",
    ],
  },
  {
    id: "phanthiet-ocean-villa",
    bookingSlug: "stay-phanthiet-ocean-villa",
    name: "Phan Thiết Ocean Villa",
    location: "Phan Thiết",
    type: "resort",
    priceFrom: "3.000.000đ / đêm",
    description:
      "Villa beachfront với hồ bơi riêng, sân cỏ tổ chức tiệc và dịch vụ chef riêng mỗi tối.",
    image:
      "https://vesnahotelnhatrang.com/wp-content/uploads/2023/01/Premier-DL-0707.jpg",
    highlights: [
      "Tiệc BBQ hải sản trên bờ biển riêng",
      "Lướt ván buồm và sup miễn phí",
      "Xe jeep ngắm bình minh Bàu Trắng",
    ],
  },
];

const destinations = [
  "",
  "Đà Lạt",
  "Huế",
  "Đà Nẵng",
  "Nha Trang",
  "Quảng Bình",
  "Phú Yên",
  "Phan Thiết",
];

const accommodationReviews = [
  {
    name: "Minh-Châu & David",
    stay: "Đà Lạt Dreamy Suite · Đà Lạt",
    quote:
      "Căn phòng kính toàn cảnh khiến chúng tôi không muốn rời Đà Lạt. Team concierge chuẩn bị hoa và bánh sinh nhật vô cùng dễ thương.",
    rating: 5,
    image:
      "https://www.vietiso.com/images/2023/blog/5-2023/tourist.png",
  },
  {
    name: "Gia đình Thuý Hạnh",
    stay: "Huế Heritage Suite · Huế",
    quote:
      "Áo dài cung đình, trà chiều và tour thuyền rồng khiến cả gia đình có những khoảnh khắc khó quên. Dịch vụ tận tâm từng chi tiết.",
    rating: 5,
    image:
      "https://vanangroup.com.vn/wp-content/uploads/2024/10/khach-du-lich-la-gi.webp",
  },
  {
    name: "Quốc Anh & team",
    stay: "Đà Nẵng Ocean Reserve · Đà Nẵng",
    quote:
      "Villa ven biển với hồ bơi riêng quá hợp để team tổ chức retreat. Đêm BBQ hải sản và lớp yoga sáng sớm đều được sắp xếp chu đáo.",
    rating: 5,
    image:
      "https://www.vietiso.com/images/2023/blog/5-2023/tourist_behavior.png",
  },
];

export default function Accommodation({
  onBookStay,
  bookingState,
  onDismissFeedback,
}: AccommodationProps = {}) {
  const [filters, setFilters] = useState({
    destination: "",
    checkIn: "",
    checkOut: "",
  });
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedStay, setSelectedStay] = useState<StayOption | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasCompleteFilters = Boolean(
    filters.destination && filters.checkIn && filters.checkOut,
  );

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setHasSearched(true);
    setSelectedStay(null);
    setIsModalOpen(false);
  };

  const results = useMemo(() => {
    if (!hasSearched) {
      return stayOptions.slice(0, 3);
    }
    if (hasCompleteFilters) {
      return stayOptions
        .filter((stay) => stay.location === filters.destination)
        .slice(0, 3);
    }
    return [];
  }, [hasSearched, hasCompleteFilters, filters.destination]);

  return (
    <section id="accommodation" className="bg-white py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6">
        <div className="relative overflow-hidden rounded-[40px] shadow-2xl">
          <Image
            src="https://media.baosonla.org.vn/public/linhlv/2024-10-21/nha-nghi-cong-dong-tai-khu-du-lich-moc-chau-happy-land_.jpg"
            alt="Không gian lưu trú HÀNH TRÌNH VIỆT"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/10" />
          <div className="relative grid gap-10 p-10 text-white md:grid-cols-2 md:p-16">
            <div className="space-y-4">
              <span className="inline-flex items-center rounded-full bg-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white">
                Lưu trú tinh tế
              </span>
              <h2 className="text-4xl font-semibold md:text-5xl">
                Không gian lưu trú mang dấu ấn cá nhân của bạn
              </h2>
              <p className="text-base text-white/90">
                Homestay cảm hứng, khách sạn boutique hay resort sang trọng – đội
                ngũ HÀNH TRÌNH VIỆT tuyển chọn tỉ mỉ để mỗi đêm nghỉ đều đáng nhớ. Chúng
                tôi đồng hành từ khâu chọn phòng đến những setup bất ngờ dành riêng
                cho bạn.
              </p>
            </div>
            <div className="rounded-3xl bg-white/20 p-8 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white">
                Dịch vụ concierge kèm theo
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-white/80">
                <li>• Cá nhân hoá lựa chọn phòng theo ánh sáng & phong thuỷ.</li>
                <li>• Đặt bàn nhà hàng signature, setup cầu hôn hoặc kỷ niệm.</li>
                <li>
                  • Thiết kế hoạt động riêng: yoga bình minh, lớp làm gốm, mixology.
                </li>
                <li>
                  • Linh hoạt giờ nhận – trả phòng và kết nối phương tiện di chuyển.
                </li>
              </ul>
            </div>
          </div>
        </div>

        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid gap-6 rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl md:grid-cols-4"
        >
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Địa điểm
            </label>
            <div className="relative">
              <select
                value={filters.destination}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    destination: event.target.value,
                  }))
                }
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
              >
                <option value="">Tất cả địa điểm</option>
                {destinations
                  .filter((item) => item)
                  .map((destination) => (
                    <option key={destination} value={destination}>
                      {destination}
                    </option>
                  ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                ▾
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Check-in
            </label>
            <input
              type="date"
              value={filters.checkIn}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  checkIn: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Check-out
            </label>
            <input
              type="date"
              value={filters.checkOut}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  checkOut: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          <div className="flex flex-col justify-end">
            <button
              type="submit"
              className="w-full rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-emerald-400"
            >
              Tìm kiếm
            </button>
          </div>
        </motion.form>

        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-3xl font-semibold text-slate-900">
              {hasSearched
                ? hasCompleteFilters
                  ? `Gợi ý lưu trú tại ${filters.destination}`
                  : "Hãy chọn đầy đủ địa điểm và thời gian để xem gợi ý"
                : "Bộ sưu tập được tuyển chọn"}
            </h3>
            {hasSearched && hasCompleteFilters && (
              <p className="mt-2 inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white">
                {`Từ ${filters.checkIn} · Đến ${filters.checkOut}`}
              </p>
            )}
            {hasSearched && !hasCompleteFilters && (
              <p className="mt-2 text-sm text-amber-600">
                Vui lòng nhập địa điểm cùng ngày nhận - trả phòng rồi nhấn tìm kiếm.
              </p>
            )}
          </div>
          <p className="text-sm text-slate-500">
            Chạm vào từng thẻ để xem thông tin chi tiết và đặt phòng cùng concierge.
          </p>
        </div>

        {results.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-emerald-300 bg-emerald-50/40 p-8 text-center text-sm text-emerald-700">
            Vui lòng chọn địa điểm cùng ngày check-in và check-out rồi nhấn tìm kiếm
            để xem 3 gợi ý phòng phù hợp (1 triệu, 2 triệu và 3 triệu một đêm).
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {results.map((stay) => (
              <motion.article
                key={stay.id}
                layout
                className={`group flex cursor-pointer flex-col overflow-hidden rounded-[28px] border bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-2xl ${
                  selectedStay?.id === stay.id
                    ? "border-emerald-400 shadow-emerald-100"
                    : "border-slate-200"
                }`}
                onClick={() => {
                  setSelectedStay(stay);
                  setIsModalOpen(true);
                }}
              >
                <div className="relative h-48 w-full overflow-hidden bg-slate-200">
                  <Image
                    src={stay.image}
                    alt={stay.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-110"
                  />
                  <span className="absolute left-5 top-5 rounded-full bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-900">
                    {stay.type === "hotel"
                      ? "Hotel"
                      : stay.type === "homestay"
                      ? "Homestay"
                      : "Resort"}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
                    <span>{stay.location}</span>
                    <span>{stay.priceFrom}</span>
                  </div>
                  <h4 className="mt-3 text-xl font-semibold text-slate-900">
                    {stay.name}
                  </h4>
                  <p className="mt-2 text-sm text-slate-900">
                    {stay.description}
                  </p>
                  <button className="mt-6 inline-flex items-center text-xs font-semibold uppercase tracking-[0.3em] text-slate-900">
                    Đặt phòng
                    <span className="ml-2 text-base">→</span>
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        <AccommodationModal
          isOpen={isModalOpen && !!selectedStay}
          stay={
            selectedStay ??
            stayOptions[0]
          }
          onClose={() => {
            setIsModalOpen(false);
            setSelectedStay(null);
            onDismissFeedback?.();
          }}
          onBook={onBookStay ? (stay) => onBookStay(stay) : undefined}
          bookingState={bookingState}
        />

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="space-y-10 rounded-[32px] border border-slate-200 bg-gradient-to-br from-white to-emerald-50 p-10"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700">
                Khách hàng nói gì
              </span>
              <h3 className="mt-3 text-3xl font-semibold text-slate-900">
                Trải nghiệm lưu trú đáng nhớ
              </h3>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Những phản hồi thực tế từ hành trình gần đây – nơi mỗi đêm nghỉ được cá nhân hoá theo gu của từng vị khách.
              </p>
            </div>
            <div className="text-sm text-emerald-700">
              Điểm hài lòng trung bình <strong>4.9/5</strong> · hơn 2.000 lượt đánh giá.
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {accommodationReviews.map((review) => (
              <article
                key={review.name}
                className="flex h-full flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-2xl">
                    <Image
                      src={review.image}
                      alt={review.stay}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-900">
                      {review.name}
                    </p>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                      {review.stay}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 text-emerald-500">
                  {Array.from({ length: review.rating }).map((_, index) => (
                    <svg
                      key={index}
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="flex-1 text-sm italic text-slate-900">
                  “{review.quote}”
                </p>
              </article>
            ))}
          </div>
        </motion.section>
      </div>
    </section>
  );
}
