"use client";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useMemo, useState } from "react";

const transportHighlights = [
  {
    title: "Đưa đón sân bay cao cấp",
    description:
      "Xe riêng hạng thương gia, tài xế song ngữ trực tại cổng, hỗ trợ hành lý và theo dõi chuyến bay theo thời gian thực.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.6}
          d="M2.25 12L9 3.75l4.5 6 4.5-6L21.75 12M7.5 12h9m-12 3.75h15"
        />
      </svg>
    ),
  },
  {
    title: "Hành trình riêng tư linh hoạt",
    description:
      "Limousine hoặc SUV đời mới với wifi, đồ uống và lịch trình cá nhân hoá giúp việc di chuyển trở thành trải nghiệm.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.6}
          d="M3 13l2-2h14l2 2M5 11V7a3 3 0 013-3h8a3 3 0 013 3v4"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.6}
          d="M7 16h.01M17 16h.01M5 16a2 2 0 104 0 2 2 0 00-4 0zm10 0a2 2 0 104 0 2 2 0 00-4 0z"
        />
      </svg>
    ),
  },
  {
    title: "Đường sông & đường sắt",
    description:
      "Cabin tàu đêm, du thuyền boutique hay thuỷ phi cơ xuyên vịnh để ngắm cảnh sắc Việt Nam ở góc nhìn ấn tượng nhất.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.6}
          d="M3 15l4-2 4 2 4-2 4 2"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.6}
          d="M5 10l2.5-1.5L10 10l2.5-1.5L15 10l2.5-1.5L20 10"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.6}
          d="M4 19h16"
        />
      </svg>
    ),
  },
  {
    title: "Di chuyển xanh bền vững",
    description:
      "Xe điện, trekking nhẹ hay xe đạp dành cho tín đồ sống chậm, tối ưu hoá dấu chân carbon trong từng hành trình.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.6}
          d="M12 6a9 9 0 00-9 9h9V6z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.6}
          d="M21 15a9 9 0 00-9-9v9h9z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.6}
          d="M12 15v6"
        />
      </svg>
    ),
  },
];

const vehicleOptions = [
  { value: "16", label: "Xe 16 chỗ (Limousine)" },
  { value: "32", label: "Xe 32 chỗ" },
  { value: "45", label: "Xe 45 chỗ" },
];

const journeyCards = [
  {
    slug: "central-heritage-arc",
    title: "Vòng cung di sản miền Trung",
    description:
      "Xe riêng phục vụ xuyên suốt Đà Nẵng – Huế – Hội An, kết hợp tàu hoả ngắm biển Lăng Cô và bữa tối du thuyền sông Hương.",
    detail:
      "Hành trình 4 ngày kết hợp xe riêng hạng sang và trải nghiệm tàu hoả panorama. Concierge đi cùng chăm sóc từng điểm dừng, từ phố cổ Hội An, cố đô Huế đến check-in biển Mỹ Khê.",
    image: "/assets/transport/codohue.jpg",
  },
  {
    slug: "cloud-chasing-northwest",
    title: "Săn mây Tây Bắc",
    description:
      "Limousine giường nằm Hà Nội – Sa Pa, trekking bản Tả Van và jeep săn mây Y Tý lúc bình minh.",
    detail:
      "Tận hưởng khí hậu se lạnh của Tây Bắc với limousine giường nằm riêng, porter bản địa dẫn đường và chuyến jeep độc quyền lên đỉnh Y Tý. Trọn gói ẩm thực địa phương và homestay cao cấp.",
    image: "/assets/transport/khoangxe32cho.jpg",
  },
  {
    slug: "phu-quoc-island-hop",
    title: "Đảo ngọc Phú Quốc",
    description:
      "Thuỷ phi cơ từ TP.HCM, buggy riêng trong resort và cano riêng khám phá quần đảo An Thới.",
    detail:
      "Một ngày di chuyển không chạm đất liền với thuỷ phi cơ, xe buggy đưa đón riêng và cano cao tốc. Đội ngũ trực 24/7 để sắp xếp spa, fine-dining và hoạt động trên biển.",
    image: "/assets/transport/daongocphuquoc.jpg",
  },
];

const transportTestimonials = [
  {
    quote:
      "“Xe limousine sạch sẽ, tài xế biết tiếng Anh và chủ động điều chỉnh giờ đón khi chuyến bay trễ. Rất đáng tin cậy!”",
    name: "Lan Phương",
    route: "Hà Nội ⇄ Hạ Long",
    image: "/assets/transport/khach1.jpg",
  },
  {
    quote:
      "“Đoàn công ty 30 người được chăm sóc chu đáo, xe 32 chỗ đời mới và lịch trình linh hoạt theo yêu cầu.”",
    name: "Quang Huy",
    route: "Team building Đà Nẵng",
    image: "/assets/transport/khach2.jpg",
  },
  {
    quote:
      "“Gia đình có trẻ nhỏ nên tôi rất an tâm khi được hỗ trợ ghế trẻ em, tài xế thân thiện và lái xe an toàn.”",
    name: "Mai Chi",
    route: "Nghỉ dưỡng Phú Quốc",
    image: "/assets/transport/khach3.jpg",
  },
];

const assurances = [
  "Theo dõi chuyến bay, cập nhật thay đổi và điều phối tài xế 24/7.",
  "Tài xế được đào tạo phục vụ du lịch cao cấp, giao tiếp tiếng Anh cơ bản.",
  "Bảo hiểm du lịch toàn diện trên mọi chặng đường.",
  "Hỗ trợ đặc biệt cho gia đình có trẻ nhỏ và khách cao tuổi.",
];

const galleryImages = [
  {
    src: "/assets/transport/khoangxelimouse16cho.jpg",
    alt: "Khoang limousine 16 chỗ",
  },
  {
    src: "/assets/transport/khoangxe32cho.jpg",
    alt: "Khoang xe 32 chỗ",
  },
  {
    src: "/assets/transport/khoangxe45cho.jpg",
    alt: "Khoang xe 45 chỗ",
  },
];

export default function Transport() {
  const [tripRequest, setTripRequest] = useState({
    destination: "",
    vehicle: vehicleOptions[0].value,
    date: "",
    notes: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const selectedVehicleLabel = useMemo(
    () =>
      vehicleOptions.find((option) => option.value === tripRequest.vehicle)
        ?.label ?? "",
    [tripRequest.vehicle]
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <section id="transport" className="bg-white py-24 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6">
        <div className="grid gap-10 md:grid-cols-5 md:items-center">
          <div className="md:col-span-3 space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs uppercase tracking-[0.35em] text-emerald-600">
              Di chuyển linh hoạt
            </span>
            <h2 className="text-4xl font-semibold leading-tight md:text-5xl">
              Hành trình trọn vẹn bắt đầu từ cách bạn di chuyển
            </h2>
            <p className="text-sm text-slate-600 md:text-base">
              Từ xe riêng sang trọng đến chuyến tàu tuyệt đẹp, Travel VN sắp
              xếp mọi chặng đường để bạn chỉ tập trung tận hưởng. Dịch vụ concierge
              chủ động 24/7 giúp hành trình luôn mượt mà.
            </p>
          </div>
          <div className="md:col-span-2 md:justify-self-end">
            <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
              <div className="absolute -top-10 right-10 h-24 w-24 rounded-full bg-emerald-200/50 blur-3xl" />
              <h3 className="text-lg font-semibold">Trải nghiệm nổi bật</h3>
              <p className="mt-2 text-sm text-slate-600">
                4.9/5 điểm hài lòng từ hơn 3.000 hành trình cao cấp.
              </p>
              <Image
                src="/assets/transport/khoangxe45cho.jpg"
                alt="Khoang xe hạng sang"
                width={360}
                height={220}
                className="mt-6 w-full rounded-2xl object-cover"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          {transportHighlights.map((item) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="group rounded-3xl border border-slate-200 bg-white p-6 transition hover:border-emerald-400/40 hover:bg-emerald-50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                {item.icon}
              </div>
              <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm text-slate-600">{item.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-10 rounded-[32px] bg-gradient-to-br from-emerald-50 to-white p-10 shadow-2xl shadow-emerald-100 md:grid-cols-2">
          <div>
            <h3 className="text-2xl font-semibold">
              Thuê xe riêng theo yêu cầu
            </h3>
            <p className="mt-3 text-sm text-slate-600">
              Chọn điểm đến, loại xe và thời gian. Đội Travel VN sẽ phản hồi
              ngay với lịch xe khả dụng và bảng giá chi tiết.
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Điểm đến
                </label>
                <input
                  required
                  value={tripRequest.destination}
                  onChange={(event) =>
                    setTripRequest((prev) => ({
                      ...prev,
                      destination: event.target.value,
                    }))
                  }
                  placeholder="Ví dụ: Hà Nội, Huế, Phú Quốc…"
                  className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Loại xe
                </label>
                <div className="relative">
                  <select
                    value={tripRequest.vehicle}
                    onChange={(event) =>
                      setTripRequest((prev) => ({
                        ...prev,
                        vehicle: event.target.value,
                      }))
                    }
                    className="w-full appearance-none rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  >
                    {vehicleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-500">
                    ▾
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Ngày di chuyển
                </label>
                <input
                  type="date"
                  required
                  value={tripRequest.date}
                  onChange={(event) =>
                    setTripRequest((prev) => ({
                      ...prev,
                      date: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Ghi chú
                </label>
                <textarea
                  value={tripRequest.notes}
                  onChange={(event) =>
                    setTripRequest((prev) => ({
                      ...prev,
                      notes: event.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="Yêu cầu đặc biệt về hành trình, ví dụ: ghế trẻ em, thông dịch viên…"
                  className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-slate-900 transition hover:bg-emerald-300"
              >
                Gửi yêu cầu
              </button>
            </form>
          </div>

          <div className="flex flex-col justify-between">
            <div className="grid grid-cols-3 gap-3">
              {galleryImages.map((item) => (
                <div
                  key={item.alt}
                  className="overflow-hidden rounded-2xl border border-slate-200"
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={180}
                    height={120}
                    className="h-24 w-full object-cover transition duration-300 hover:scale-105"
                  />
                </div>
              ))}
            </div>

            <AnimatePresence>
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-800"
                >
                  <h4 className="text-lg font-semibold text-emerald-700">
                    Yêu cầu đã được ghi nhận
                  </h4>
                  <p className="mt-2 text-emerald-700">
                    Đội ngũ Travel VN sẽ kiểm tra lịch xe khả dụng và gửi báo
                    giá trong 30 phút.
                  </p>
                  <div className="mt-4 space-y-2 text-emerald-800">
                    <p>
                      <span className="font-semibold">Điểm đến:</span>{" "}
                      {tripRequest.destination}
                    </p>
                    <p>
                      <span className="font-semibold">Loại xe:</span>{" "}
                      {selectedVehicleLabel}
                    </p>
                    <p>
                      <span className="font-semibold">Ngày khởi hành:</span>{" "}
                      {tripRequest.date}
                    </p>
                    {tripRequest.notes && (
                      <p>
                        <span className="font-semibold">Ghi chú:</span>{" "}
                        {tripRequest.notes}
                      </p>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600"
                >
                  <h4 className="text-lg font-semibold text-slate-900">
                    Chúng tôi sẽ liên hệ ngay
                  </h4>
                  <p className="mt-3">
                    Sau khi gửi yêu cầu, concierge Travel VN sẽ gọi lại với lịch
                    trình gợi ý và bảng giá chi tiết.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-10">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="text-xs uppercase tracking-[0.35em] text-slate-400">
                Hành trình nổi bật
              </span>
              <h3 className="mt-3 text-3xl font-semibold">
                Ba hành trình được yêu thích
              </h3>
            </div>
            <p className="max-w-xl text-sm text-slate-600">
              Mỗi hành trình kết hợp nhiều phương tiện – từ limousine, cano tới
              tàu hoả ngắm cảnh – để mang tới trải nghiệm xuyên suốt.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {journeyCards.map((journey) => (
              <motion.article
                key={journey.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="group flex flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white transition hover:border-emerald-300 hover:bg-emerald-50"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={journey.image}
                    alt={journey.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="flex flex-1 flex-col p-8">
                  <h4 className="text-xl font-semibold text-slate-900">
                    {journey.title}
                  </h4>
                  <p className="mt-3 text-sm text-slate-600">
                    {journey.description}
                  </p>
                  <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-xs text-emerald-700">
                    {journey.detail}
                  </div>
                  <button className="mt-6 inline-flex items-center text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
                    Tư vấn lịch trình
                    <span className="ml-2 text-base">→</span>
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <h3 className="text-3xl font-semibold">
              Chúng tôi chăm lo từng chi tiết
            </h3>
            <ul className="space-y-4 text-sm text-slate-600">
              {assurances.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-6">
            <h3 className="text-3xl font-semibold">
              Khách hàng nói gì về dịch vụ di chuyển?
            </h3>
            <div className="space-y-4">
              {transportTestimonials.map((item) => (
                <div
                  key={item.name}
                  className="flex gap-4 rounded-3xl border border-slate-200 bg-white p-6"
                >
                  <div className="relative h-16 w-16 overflow-hidden rounded-2xl">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-2xl object-cover"
                    />
                  </div>
                  <div className="space-y-2 text-sm text-slate-600">
                    <p className="italic text-slate-700">{item.quote}</p>
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      {item.route}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
