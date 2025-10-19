import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Review {
  id: string;
  name: string;
  rating: number;
  content: string;
  createdAt: string;
}

interface TourDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  tour: {
    id: string | number;
    name: string;
    location: string;
    image: string;
    description: string;
    price: string;
    adultPrice?: number;
    childPrice?: number;
    duration: string;
    rating: number;
    tag: string;
    meals: string;
    tickets: string;
    tourType: string;
    schedule: {
      day: string;
      title: string;
      activities: string[];
    }[];
  };
  initialAdultCount?: number;
  initialChildCount?: number;
  initialReviews?: Review[];
}

export default function TourDetailModal({
  isOpen,
  onClose,
  tour,
  initialAdultCount = 2,
  initialChildCount = 0,
  initialReviews,
}: TourDetailModalProps) {
  const parsePrice = (value?: number, text?: string) => {
    if (typeof value === "number" && !Number.isNaN(value)) {
      return value;
    }
    if (text) {
      const numeric = Number(text.replace(/[^\d]/g, ""));
      if (!Number.isNaN(numeric)) {
        return numeric;
      }
    }
    return 0;
  };

  const formatCurrency = (value: number) =>
    `${value.toLocaleString("vi-VN")}₫`;

  const baseAdultPrice = parsePrice(tour.adultPrice, tour.price);
  const baseChildPrice =
    parsePrice(tour.childPrice) || Math.round(baseAdultPrice / 2);

  const [adultQty, setAdultQty] = useState(initialAdultCount);
  const [childQty, setChildQty] = useState(initialChildCount);
  const [reviews, setReviews] = useState<Review[]>(
    initialReviews && initialReviews.length > 0
      ? initialReviews
      : [
          {
            id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-1`,
            name: "Ngọc Anh",
            rating: 5,
            content:
              "Hành trình tuyệt vời, lịch trình hợp lý và hướng dẫn viên siêu dễ thương.",
            createdAt: new Date().toISOString(),
          },
        ],
  );
  const [reviewerName, setReviewerName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    setReviews(
      initialReviews && initialReviews.length > 0
        ? initialReviews
        : [
            {
              id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-1`,
              name: "Ngọc Anh",
              rating: 5,
              content:
                "Hành trình tuyệt vời, lịch trình hợp lý và hướng dẫn viên siêu dễ thương.",
              createdAt: new Date().toISOString(),
            },
          ],
    );
    setAdultQty(initialAdultCount);
    setChildQty(initialChildCount);
    setReviewerName("");
    setReviewRating(5);
    setReviewContent("");
    setShowAllReviews(false);
  }, [initialAdultCount, initialChildCount, initialReviews, tour.id]);

  const priceHighlight = `${formatCurrency(
    baseAdultPrice,
  )} / người lớn · ${formatCurrency(baseChildPrice)} / trẻ em`;

  const totalPrice =
    adultQty * baseAdultPrice + childQty * baseChildPrice;

  const handleAddReview = () => {
    if (!reviewerName.trim() || !reviewContent.trim()) {
      return;
    }

    const newReview: Review = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      name: reviewerName.trim(),
      rating: reviewRating,
      content: reviewContent.trim(),
      createdAt: new Date().toISOString(),
    };

    setReviews((prev) => [newReview, ...prev]);
    setReviewerName("");
    setReviewRating(5);
    setReviewContent("");
  };

  const tourHighlights = [
    {
      icon: "💰",
      title: "Giá tour",
      description: priceHighlight,
    },
    {
      icon: "🕒",
      title: "Thời gian",
      description: tour.duration,
    },
    {
      icon: "🍽️",
      title: "Bữa ăn",
      description: tour.meals,
    },
    {
      icon: "🎫",
      title: "Vé tham quan",
      description: tour.tickets,
    },
    {
      icon: "🧭",
      title: "Loại hình",
      description: tour.tourType,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900 rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-sm p-2 rounded-full text-white hover:bg-black/70 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Hero Image */}
            <div className="relative h-[300px]">
              <Image
                src={tour.image}
                alt={tour.name}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="bg-[#00C951]/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                    {tour.tag}
                  </span>
                  <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full flex items-center">
                    <svg
                      className="w-4 h-4 text-[#00C951]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="ml-1 text-white text-sm">
                      {tour.rating}
                    </span>
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {tour.name}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-gray-300">
                  <p className="flex items-center">
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
                    {tour.duration}
                  </p>
                  <p className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-[#00C951]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {tour.location}
                  </p>
                  <div className="space-y-1 text-sm text-white/80">
                    <p className="flex items-center text-[#00C951] font-semibold">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V5m0 11v3"
                        />
                      </svg>
                      {formatCurrency(baseAdultPrice)} / người lớn
                    </p>
                    <p className="flex items-center text-[#00C951]">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V5m0 11v3"
                        />
                      </svg>
                      {formatCurrency(baseChildPrice)} / trẻ em (50% người lớn)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Tour Overview */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Tổng Quan Tour
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {tourHighlights.map((highlight, index) => (
                    <div
                      key={index}
                      className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm"
                    >
                      <div className="text-2xl mb-2">{highlight.icon}</div>
                      <h4 className="text-white font-medium mb-1">
                        {highlight.title}
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {highlight.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Calculator */}
              <div className="rounded-2xl bg-gray-800/60 p-6 space-y-4">
                <h3 className="text-xl font-semibold text-white">
                  Tính chi phí dự kiến
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                      Người lớn
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={adultQty}
                      onChange={(event) =>
                        setAdultQty(
                          Math.max(1, Math.floor(Number(event.target.value) || 0)),
                        )
                      }
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-emerald-300 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-200/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                      Trẻ em
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={childQty}
                      onChange={(event) =>
                        setChildQty(
                          Math.max(0, Math.floor(Number(event.target.value) || 0)),
                        )
                      }
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-emerald-300 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-200/40"
                    />
                  </div>
                </div>
                <p className="text-sm text-white/70">
                  Giá người lớn: {formatCurrency(baseAdultPrice)} · Giá trẻ em:{" "}
                  {formatCurrency(baseChildPrice)}
                </p>
                <div className="flex items-center justify-between rounded-xl bg-gray-900/70 p-4">
                  <span className="text-xs uppercase tracking-[0.3em] text-white/60">
                    Tổng tạm tính
                  </span>
                  <span className="text-2xl font-semibold text-emerald-400">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>

              {/* Tour Description */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Mô Tả Tour
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {tour.description}
                </p>
              </div>

              {/* Tour Schedule */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Lịch Trình Tour
                </h3>
                <div className="space-y-4">
                  {tour.schedule.map((day, index) => (
                    <div key={index} className="bg-gray-800/50 rounded-xl p-4">
                      <div className="flex items-center mb-3">
                        <span className="text-[#00C951] font-semibold">
                          {day.day}
                        </span>
                        <span className="mx-2 text-gray-500">|</span>
                        <span className="text-white font-medium">
                          {day.title}
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {day.activities.map((activity, actIndex) => (
                          <li
                            key={actIndex}
                            className="text-gray-300 flex items-center"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00C951] mr-2" />
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price and Booking */}
              <div className="bg-[#00C951]/10 rounded-xl p-6 backdrop-blur-sm space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-300 mb-1 uppercase tracking-[0.3em] text-xs">
                      Tổng tạm tính
                    </p>
                    <p className="text-3xl font-bold text-white">
                      {formatCurrency(totalPrice)}
                    </p>
                    <p className="text-sm text-white/70">
                      {adultQty} người lớn · {childQty} trẻ em
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-300 mb-1 uppercase tracking-[0.3em] text-xs">
                      Thời gian
                    </p>
                    <p className="text-xl font-semibold text-white">
                      {tour.duration}
                    </p>
                    <p className="text-xs text-white/70">
                      Giá người lớn: {formatCurrency(baseAdultPrice)}
                    </p>
                    <p className="text-xs text-white/70">
                      Trẻ em: {formatCurrency(baseChildPrice)}
                    </p>
                  </div>
                </div>
                <button className="w-full bg-[#00C951] hover:bg-[#00B347] text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center space-x-2">
                  <span>Đặt Tour Ngay</span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </button>
              </div>

              {/* Reviews */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white">
                  Đánh giá từ khách hàng
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review) => (
                    <div
                      key={review.id}
                      className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4 shadow-inner"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-semibold">
                          {review.name}
                        </h4>
                        <span className="text-[#00C951] text-sm font-medium">
                          {"⭐".repeat(review.rating)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 whitespace-pre-line">
                        {review.content}
                      </p>
                      <p className="mt-3 text-xs uppercase tracking-[0.3em] text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  ))}
                  {reviews.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-gray-700 bg-gray-900/40 p-6 text-sm text-gray-400">
                      Chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ trải
                      nghiệm của bạn!
                    </div>
                  )}
                </div>
                {reviews.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setShowAllReviews((prev) => !prev)}
                    className="inline-flex items-center text-sm font-semibold text-emerald-400 hover:text-emerald-300"
                  >
                    {showAllReviews ? "Thu gọn đánh giá" : "Xem thêm đánh giá"}
                  </button>
                )}

                <div className="space-y-4 rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
                  <h4 className="text-lg font-semibold text-white">
                    Gửi đánh giá của bạn
                  </h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                        Tên của bạn
                      </label>
                      <input
                        type="text"
                        value={reviewerName}
                        onChange={(event) => setReviewerName(event.target.value)}
                        placeholder="VD: Trần Minh An"
                        className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-emerald-300 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-200/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                        Số sao
                      </label>
                      <select
                        value={reviewRating}
                        onChange={(event) =>
                          setReviewRating(Number(event.target.value))
                        }
                        className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-emerald-300 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-200/40"
                      >
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <option key={rating} value={rating} className="text-slate-900">
                            {rating} sao
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                        Nội dung đánh giá
                      </label>
                      <textarea
                        rows={4}
                        value={reviewContent}
                        onChange={(event) => setReviewContent(event.target.value)}
                        placeholder="Chia sẻ cảm nhận của bạn về tour..."
                        className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-emerald-300 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-200/40"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddReview}
                    className="w-full rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-emerald-400"
                  >
                    Gửi đánh giá
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
