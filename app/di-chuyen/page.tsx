"use client";

import Image from "next/image";
import Link from "next/link";
import MainHeader from "../components/MainHeader";
import Footer from "../sections/Footer";
import { FormEvent, useMemo, useState } from "react";

const testimonials = [
  {
    id: "lan-phuong",
    name: "Lan Phương",
    route: "Huế ⇔ Đà Nẵng",
    quote:
      "Xe limousine sạch sẽ, tài xế biết tiếng Anh và chủ động điều chỉnh giờ đón khi chuyến bay bị trễ. Rất chuyên nghiệp!",
    avatar:
      "https://cdnmedia.baotintuc.vn/Upload/e9GdNZvHDFi8lZSWc6ubA/files/2024/04/xich-lo-5424l.jpg",
  },
  {
    id: "quang-huy",
    name: "Quang Huy",
    route: "Team building Hội An",
    quote:
      "Đoàn công ty 30 người của chúng tôi được chăm sóc chu đáo, xe 32 chỗ đời mới và lịch trình linh hoạt.",
    avatar: "https://vinapad.com/wp-content/uploads/2019/10/tam-ly-khach-du-lich-anh-1.jpg",
  },
  {
    id: "mai-chi",
    name: "Mai Chi",
    route: "Nghỉ dưỡng Quy Nhơn",
    quote:
      "Gia đình có trẻ nhỏ nên tôi rất an tâm khi được hỗ trợ ghế trẻ em, tài xế thân thiện và lái xe an toàn.",
    avatar:
      "https://heritagecruises.com/wp-content/uploads/2022/05/z2048364481961_6f832d660379810f7f352e3caba72a24-1024x776.jpg",
  },
];

const serviceHighlights = [
  {
    id: "airport",
    title: "Đưa đón sân bay cao cấp",
    icon: "✈️",
    description:
      "Xe riêng hạng thương gia, tài xế song ngữ đón tại gate, hỗ trợ hành lý và cập nhật chuyến bay theo thời gian thực.",
  },
  {
    id: "limousine",
    title: "Hành trình đường dài riêng tư",
    icon: "🚘",
    description:
      "Xe limousine hoặc SUV đời mới với wifi, đồ uống và lịch trình linh hoạt vừa di chuyển vừa khám phá.",
  },
  {
    id: "river-train",
    title: "Trải nghiệm đường sông & đường sắt",
    icon: "🌊",
    description:
      "Ngắm cảnh thiên nhiên từ cabin tàu đêm, du thuyền boutique hoặc thủy phi cơ xuyên vịnh biển.",
  },
  {
    id: "green",
    title: "Di chuyển xanh bền vững",
    icon: "🌱",
    description:
      "Xe điện, xe đạp và tuyến trekking nhẹ nhàng, dành cho tín đồ sống chậm và yêu môi trường.",
  },
];

const vehicleOptions = [
  "Xe 7 chỗ (SUV)",
  "Xe 9 chỗ (Limousine)",
  "Xe 16 chỗ (Limousine)",
  "Xe 29 chỗ",
  "Xe 45 chỗ",
];

const destinationPresets = [
  "Đà Lạt",
  "Huế",
  "Đà Nẵng",
  "Nha Trang",
  "Quảng Bình",
  "Phú Yên",
  "Phan Thiết",
];

export default function TransportPage() {
  const [destination, setDestination] = useState("");
  const [vehicleType, setVehicleType] = useState(vehicleOptions[2]);
  const [travelDate, setTravelDate] = useState("");
  const [searchMessage, setSearchMessage] = useState("");
  const [requests, setRequests] = useState<
    { id: string; destination: string; vehicleType: string; travelDate: string; createdAt: string }[]
  >([]);

  const sortedRequests = useMemo(
    () =>
      [...requests].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [requests]
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!destination || !travelDate) {
      setSearchMessage("Vui lòng chọn điểm đến và ngày di chuyển để chúng tôi tư vấn chi tiết.");
      return;
    }
    const createdAt = new Date().toISOString();
    setRequests((prev) => [
      {
        id: `request-${createdAt}`,
        destination,
        vehicleType,
        travelDate,
        createdAt,
      },
      ...prev,
    ]);
    setSearchMessage(
      `Đã nhận yêu cầu thuê ${vehicleType.toLowerCase()} tới ${destination}. Chúng tôi sẽ liên hệ sớm để xác nhận chi tiết.`
    );
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <MainHeader variant="translucent" />

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-slate-900 text-white">
        <Image
          src="https://datviettour.com.vn/uploads/images/tin-tuc-SEO/tin-tong-hop/xu-huong-du-lich/du-lich-trai-nghiem.jpg"
          alt="Xe bus du lịch cao cấp"
          fill
          priority
          className="object-cover opacity-60"
        />
        <div className="relative mx-auto flex min-h-[520px] max-w-6xl flex-col justify-center px-6 py-24">
          <span className="inline-flex w-fit rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/80 backdrop-blur">
            Di chuyển linh hoạt
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight text-white md:text-5xl">
            Hành trình trọn vẹn bắt đầu từ cách bạn di chuyển
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            Từ xe riêng sang trọng đến chuyến tàu tuyệt đẹp, HÀNH TRÌNH VIỆT sắp xếp mọi chặng đường để bạn chỉ tập trung tận hưởng.
          </p>
          <Link
            href="#booking"
            className="mt-8 inline-flex w-fit items-center rounded-full bg-blue-500 px-7 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-blue-400"
          >
            Nhận tư vấn miễn phí
          </Link>
        </div>
      </section>

      {/* Booking form */}
      <section id="booking" className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 rounded-[36px] border border-slate-100 bg-white p-10 shadow-2xl shadow-blue-100/40 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">Thuê xe riêng theo yêu cầu</h2>
            <p className="text-sm text-slate-600">
              Chọn điểm đến, loại xe và thời gian, đội ngũ HÀNH TRÌNH VIỆT sẽ sắp xếp và báo giá trong thời gian sớm nhất.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                "https://hyundaimiennam.com/wp-content/uploads/2023/12/Xe-Khach-Hyundai-Solati-16-cho-1-1.jpg",
                "https://drive.gianhangvn.com/image/2583199-2621034j33348.jpg",
                "https://thuexekhach.com/wp-content/uploads/2017/03/cho-thue-xe-du-lich-tai-long-an-thuexekhach-1.jpg",
              ].map((src) => (
                <div key={src} className="relative h-28 overflow-hidden rounded-2xl">
                  <Image src={src} alt="Ghế xe du lịch" fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block space-y-2 text-sm text-slate-700">
              <span className="font-semibold uppercase tracking-[0.3em] text-slate-400">Điểm đến</span>
              <select
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Ví dụ: Hà Nội</option>
                {destinationPresets.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2 text-sm text-slate-700">
              <span className="font-semibold uppercase tracking-[0.3em] text-slate-400">Loại xe</span>
              <select
                value={vehicleType}
                onChange={(event) => setVehicleType(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-200"
              >
                {vehicleOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2 text-sm text-slate-700">
              <span className="font-semibold uppercase tracking-[0.3em] text-slate-400">Ngày di chuyển</span>
              <input
                type="date"
                value={travelDate}
                onChange={(event) => setTravelDate(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-200"
              />
            </label>

            {searchMessage ? (
              <p
                className={`text-sm ${
                  searchMessage.startsWith("Đã nhận")
                    ? "text-emerald-500"
                    : "text-rose-500"
                }`}
              >
                {searchMessage}
              </p>
            ) : null}

            <button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-blue-500 via-blue-400 to-teal-300 px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white transition hover:brightness-105"
            >
              Tìm chuyến
            </button>
          </form>

          {sortedRequests.length ? (
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
              <h3 className="text-lg font-semibold text-slate-900">Yêu cầu gần đây</h3>
              <p className="mt-1 text-sm text-slate-500">
                Các yêu cầu tìm chuyến đã gửi sẽ hiển thị tại đây để bạn tiện theo dõi.
              </p>
              <div className="mt-5 space-y-4">
                {sortedRequests.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>
                        Gửi lúc{" "}
                        {new Date(item.createdAt).toLocaleString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="mt-3 space-y-1 text-sm text-slate-700">
                      <p>
                        <strong className="text-slate-900">Điểm đến:</strong> {item.destination}
                      </p>
                      <p>
                        <strong className="text-slate-900">Loại xe:</strong> {item.vehicleType}
                      </p>
                      <p>
                        <strong className="text-slate-900">Ngày di chuyển:</strong>{" "}
                        {new Date(item.travelDate).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">Giải pháp di chuyển hoàn hảo cho từng phong cách</h2>
          <p className="mt-3 text-base text-slate-600">
            Chúng tôi kết hợp xe riêng, đường sắt, đường sông và hàng không để tạo nên hành trình thông minh, thuận tiện và giàu cảm xúc.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {serviceHighlights.map((item) => (
            <div
              key={item.id}
              className="flex h-full flex-col gap-3 rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-blue-100/30 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <span className="text-4xl">{item.icon}</span>
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="text-sm text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Care section */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-[36px] bg-gradient-to-br from-blue-100 via-blue-200 to-blue-100 p-8 text-slate-900 shadow-2xl shadow-blue-100/40 md:p-12">
          <h2 className="text-3xl font-semibold md:text-4xl">Chúng tôi chăm lo từng chi tiết</h2>
          <ul className="mt-6 space-y-3 text-sm text-slate-700">
            <li>• Theo dõi chuyến bay, cập nhật thay đổi và điều phối tài xế 24/7.</li>
            <li>• Đội ngũ tài xế được đào tạo phục vụ du lịch cao cấp, thông thạo ngoại ngữ cơ bản.</li>
            <li>• Bảo hiểm du lịch toàn diện cho cả chặng đường.</li>
            <li>• Hỗ trợ đặc biệt cho gia đình có trẻ nhỏ và khách cao tuổi.</li>
          </ul>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-100 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
              Khách hàng nói gì về dịch vụ di chuyển?
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Những phản hồi chân thành từ khách hàng đã tin tưởng HÀNH TRÌNH VIỆT trên mọi hành trình.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {testimonials.map((item) => (
              <article
                key={item.id}
                className="flex h-full flex-col gap-4 rounded-3xl border border-white/60 bg-white p-6 shadow-xl shadow-blue-100/40"
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-14 w-14 rounded-full border-2 border-blue-200">
                    <Image src={item.avatar} alt={item.name} fill className="rounded-full object-cover" />
                  </div>
                  <div>
                    <strong className="text-sm text-slate-900">{item.name}</strong>
                    <p className="text-xs text-slate-500">{item.route}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-700">“{item.quote}”</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
