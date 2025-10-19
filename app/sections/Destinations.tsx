"use client";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { useState, useRef } from "react";
import TourDetailModal from "../components/TourDetailModal";

const destinations = [
  {
    id: 1,
    name: "Đà Lạt – Thành phố ngàn hoa",
    location: "Lâm Đồng",
    image: "https://cdn3.ivivu.com/2023/10/du-lich-Da-Lat-ivivu1.jpg",
    description:
      "Trải nghiệm Đà Lạt lãng mạn với Hồ Xuân Hương, LangBiang và vườn hoa rực rỡ.",
    price: "3.500.000₫/người",
    duration: "3 ngày 2 đêm",
    rating: 4.9,
    tag: "Nghỉ dưỡng & Tham quan",
    meals: "Bao gồm bữa sáng, trưa, tối",
    tickets: "Trọn gói vé tham quan trong lịch trình",
    tourType: "Nghỉ dưỡng, tham quan",
    schedule: [
      {
        day: "Ngày 1",
        title: "Đón khách – Hồ Xuân Hương – Quảng trường Lâm Viên",
        activities: [
          "Đón khách tại sân bay Liên Khương hoặc bến xe Đà Lạt",
          "Nhận phòng khách sạn trung tâm (3–4 sao)",
          "Tham quan Hồ Xuân Hương, Quảng trường Lâm Viên, Nhà thờ Con Gà",
          "Tối thưởng thức lẩu gà lá é, dạo chợ đêm Đà Lạt",
        ],
      },
      {
        day: "Ngày 2",
        title: "LangBiang – Thung lũng Tình yêu – Vườn hoa",
        activities: [
          "Chinh phục đỉnh LangBiang ngắm toàn cảnh Đà Lạt",
          "Ăn trưa tại nhà hàng địa phương",
          "Tham quan Thung lũng Tình yêu hoặc Đồi mộng mơ",
          "Chiêm ngưỡng Vườn hoa thành phố",
          "Tham gia đêm cồng chiêng Tây Nguyên",
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
    id: 2,
    name: "Huế – Di sản cố đô",
    location: "Thừa Thiên Huế",
    image: "https://media.vov.vn/sites/default/files/styles/large/public/2020-08/Hue%20(13).jpg",
    description:
      "Khám phá Đại Nội, chùa Thiên Mụ, lăng tẩm triều Nguyễn và ca Huế trên sông Hương.",
    price: "3.800.000₫/người",
    duration: "3 ngày 2 đêm",
    rating: 4.8,
    tag: "Khám phá văn hóa",
    meals: "Bao gồm bữa sáng, trưa, tối",
    tickets: "Trọn gói vé tham quan các điểm di sản",
    tourType: "Khám phá",
    schedule: [
      {
        day: "Ngày 1",
        title: "Huế - Đại Nội - Chùa Thiên Mụ",
        activities: [
          "Đón khách tại sân bay hoặc bến xe",
          "Tham quan Đại Nội Huế: Ngọ Môn, Điện Thái Hòa,...",
          "Chiêm bái chùa Thiên Mụ - biểu tượng tâm linh xứ Huế",
          "Tối nghe ca Huế trên sông Hương",
        ],
      },
      {
        day: "Ngày 2",
        title: "Lăng Khải Định - Lăng Minh Mạng - Biển Lăng Cô",
        activities: [
          "Ăn sáng tại khách sạn, khởi hành tham quan",
          "Khám phá Lăng Khải Định và Lăng Minh Mạng",
          "Ăn trưa tại nhà hàng địa phương",
          "Chiều ghé biển Lăng Cô, đầm Lập An",
          "Tối nghỉ dưỡng tại resort ven biển",
        ],
      },
      {
        day: "Ngày 3",
        title: "Chợ Đông Ba - Làng nghề",
        activities: [
          "Ăn sáng, trả phòng khách sạn",
          "Mua sắm đặc sản tại chợ Đông Ba",
          "Thăm làng nghề Xuân Thủy",
          "Tiễn khách, kết thúc hành trình",
        ],
      },
    ],
  },
  {
    id: 3,
    name: "Đà Nẵng – Biển & Núi",
    location: "Đà Nẵng",
    image:
      "https://cdn3.ivivu.com/2022/07/Giới-thiệu-du-lịch-Đà-Nẵng-ivivu-1-e1743500641858.jpg",
    description:
      "Hành trình kết hợp biển Mỹ Khê, Bà Nà Hills, Ngũ Hành Sơn và phố đêm Đà Nẵng.",
    price: "3.800.000₫/người",
    duration: "3 ngày 2 đêm",
    rating: 4.9,
    tag: "Khám phá",
    meals: "Bao gồm bữa sáng, trưa, tối",
    tickets: "Vé tham quan Bà Nà Hills, Ngũ Hành Sơn, các điểm theo tour",
    tourType: "Khám phá thiên nhiên & văn hóa",
    schedule: [
      {
        day: "Ngày 1",
        title: "Đà Nẵng – Bán đảo Sơn Trà – Biển Mỹ Khê",
        activities: [
          "Thưởng thức mì Quảng, cà phê Đà Nẵng",
          "Tham quan Bán đảo Sơn Trà, chùa Linh Ứng",
          "Tự do tắm biển Mỹ Khê",
          "Ăn tối ven biển, dạo Cầu Rồng – Cầu Tình Yêu – Cá chép hóa rồng",
        ],
      },
      {
        day: "Ngày 2",
        title: "Bà Nà Hills – Làng Pháp – Cầu Vàng",
        activities: [
          "Ăn sáng, khởi hành đi Bà Nà Hills",
          "Tham quan Cầu Vàng, Làng Pháp, Vườn hoa Le Jardin D’Amour",
          "Khám phá Hầm rượu Debay, Fantasy Park",
          "Ăn trưa buffet tại Bà Nà, chiều về trung tâm tự do mua sắm",
        ],
      },
      {
        day: "Ngày 3",
        title: "Ngũ Hành Sơn – Làng đá Non Nước – Tiễn khách",
        activities: [
          "Ăn sáng, trả phòng khách sạn",
          "Tham quan Ngũ Hành Sơn, chùa Linh Ứng Non Nước",
          "Ghé làng đá mỹ nghệ Non Nước, mua quà lưu niệm",
          "Mua đặc sản và tiễn khách ra sân bay",
        ],
      },
    ],
  },
  {
    id: 4,
    name: "Khánh Hòa – Biển xanh Nha Trang",
    location: "Khánh Hòa",
    image: "https://cdn3.ivivu.com/2023/02/duong-tran-phu-nha-trang-ivivu.jpg",
    description:
      "Tận hưởng biển Nha Trang, tour 3 đảo, lặn ngắm san hô và thư giãn bùn khoáng.",
    price: "4.000.000₫/người",
    duration: "3 ngày 2 đêm",
    rating: 4.7,
    tag: "Nghỉ dưỡng biển",
    meals: "Bao gồm bữa sáng, trưa, tối",
    tickets: "Cano tour 3 đảo, vé tắm bùn, điểm tham quan theo lịch trình",
    tourType: "Nghỉ dưỡng",
    schedule: [
      {
        day: "Ngày 1",
        title: "Nha Trang – Tháp Bà Ponagar – Biển trung tâm",
        activities: [
          "Ăn sáng bún sứa, bánh căn Nha Trang",
          "Tham quan Tháp Bà Ponagar",
          "Tắm biển Trần Phú hoặc bãi Dài",
          "Tối ăn hải sản, dạo phố biển, thưởng thức kem dừa",
        ],
      },
      {
        day: "Ngày 2",
        title: "Tour 3 đảo – Lặn ngắm san hô",
        activities: [
          "Cano tham quan Hòn Mun, lặn ngắm san hô",
          "Vui chơi tại Hòn Một với các hoạt động thể thao nước",
          "Ăn trưa hải sản tại Bãi Tranh hoặc Hòn Miễu",
          "Chiều thư giãn spa/massage, tối BBQ hải sản",
        ],
      },
      {
        day: "Ngày 3",
        title: "Tắm bùn khoáng – Mua sắm đặc sản – Tiễn khách",
        activities: [
          "Trải nghiệm tắm bùn khoáng nóng I-Resort hoặc Tháp Bà Spa",
          "Mua đặc sản yến sào, mực rim, muối ớt xanh",
          "Kết thúc và tiễn khách",
        ],
      },
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const titleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

export default function Destinations() {
  const [selectedTour, setSelectedTour] = useState<
    (typeof destinations)[0] | null
  >(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      id="destinations"
      className="py-20 bg-gray-900 overflow-hidden"
    >
      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center mb-16"
        >
          <motion.span
            variants={titleVariants}
            className="text-[#00C951] text-sm font-medium uppercase tracking-wider"
          >
            Điểm Đến Nổi Bật
          </motion.span>
          <motion.h2
            variants={titleVariants}
            className="text-4xl md:text-5xl font-bold mt-4 mb-6 text-white"
          >
            Khám Phá Việt Nam
          </motion.h2>
          <motion.p
            variants={titleVariants}
            className="text-gray-400 max-w-2xl mx-auto text-lg"
          >
            Những điểm đến độc đáo và ấn tượng nhất Việt Nam, từ di sản thiên
            nhiên đến văn hóa nghìn năm
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {destinations.map((destination) => (
            <motion.div
              key={destination.id}
              variants={cardVariants}
              onClick={() => setSelectedTour(destination)}
              className="group bg-gray-900 rounded-2xl overflow-hidden hover:shadow-[0_0_40px_rgba(0,201,81,0.15)] transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
            >
              <motion.div
                className="relative h-64 overflow-hidden"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src={destination.image}
                  alt={destination.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="absolute top-4 left-4">
                  <motion.span
                    whileHover={{ scale: 1.1 }}
                    className="bg-[#00C951]/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm"
                  >
                    {destination.tag}
                  </motion.span>
                </div>

                <div className="absolute top-4 right-4">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full"
                  >
                    <span className="font-semibold text-white">
                      {destination.price}
                    </span>
                  </motion.div>
                </div>
              </motion.div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {destination.name}
                    </h3>
                    <p className="text-gray-400 text-sm flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {destination.location}
                    </p>
                  </div>
                  <div className="flex items-center bg-[#00C951]/10 px-2 py-1 rounded">
                    <svg
                      className="w-4 h-4 text-[#00C951]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="ml-1 text-sm font-medium text-[#00C951]">
                      {destination.rating}
                    </span>
                  </div>
                </div>

                <p className="text-gray-400 text-sm mb-4">
                  {destination.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <span className="text-sm text-gray-400 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-[#00C951]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {destination.duration}
                  </span>
                  <motion.button
                    whileHover={{ x: 5 }}
                    className="text-[#00C951] text-sm font-medium hover:text-white transition-colors flex items-center"
                  >
                    Chi tiết
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>

      {selectedTour && (
        <TourDetailModal
          isOpen={!!selectedTour}
          onClose={() => setSelectedTour(null)}
          tour={selectedTour}
        />
      )}
    </section>
  );
}
