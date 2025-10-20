"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSupabase } from "../context/SupabaseContext";

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
    bookingSlug?: string;
    schedule: {
      day: string;
      title: string;
      activities: string[];
    }[];
  };
  initialAdultCount?: number;
  initialChildCount?: number;
  onBook?: (payload: {
    tourId: string | number;
    tourName: string;
    adultCount: number;
    childCount: number;
    totalAmount: number;
    baseAdultPrice: number;
    baseChildPrice: number;
    bookingSlug?: string;
  }) => void;
  bookingState?: {
    isLoading?: boolean;
    successMessage?: string | null;
    errorMessage?: string | null;
    activeTourId?: string | number | null;
  };
  staticReviews?: {
    id: string;
    author: string;
    rating: number;
    content: string;
    createdAt: string;
  }[];
}

type ModalReview = {
  id: string;
  author: string;
  rating: number;
  content: string;
  createdAt: string | null;
  timestamp: string;
  source: "static" | "remote" | "local";
};

export default function TourDetailModal({
  isOpen,
  onClose,
  tour,
  initialAdultCount = 2,
  initialChildCount = 0,
  onBook,
  bookingState,
  staticReviews = [],
}: TourDetailModalProps) {
  const bookingEnabled = typeof onBook === "function";
  const { supabase } = useSupabase();
  const anonymousReviewer = "Khách ẩn danh";
  const [remoteReviews, setRemoteReviews] = useState<ModalReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [visibleReviewCount, setVisibleReviewCount] = useState(4);
  const [reviewForm, setReviewForm] = useState({
    name: "",
    rating: "5",
    message: "",
  });
  const [reviewFeedback, setReviewFeedback] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({
    type: null,
    message: "",
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const clampRating = useCallback((value: number) => {
    if (!Number.isFinite(value)) {
      return 5;
    }
    return Math.min(Math.max(Math.round(value), 1), 5);
  }, []);

  const formatReviewTimestamp = useCallback((value: string | null) => {
    if (!value) {
      return "";
    }
    try {
      return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "long",
        timeStyle: "short",
      }).format(new Date(value));
    } catch {
      return new Date(value).toLocaleString("vi-VN");
    }
  }, []);

  const normalisedStaticReviews = useMemo((): ModalReview[] => {
    const items: ModalReview[] = [];
    for (const review of staticReviews ?? []) {
      const author =
        typeof review.author === "string" && review.author.trim().length
          ? review.author.trim()
          : anonymousReviewer;
      const content =
        typeof review.content === "string" ? review.content.trim() : "";
      if (!content.length) {
        continue;
      }
      const date = new Date(review.createdAt);
      const iso = Number.isNaN(date.getTime()) ? null : date.toISOString();
      items.push({
        id: review.id ?? `static-${Math.random().toString(36).slice(2, 10)}`,
        author,
        rating: clampRating(review.rating),
        content,
        createdAt: iso,
        timestamp: iso ? formatReviewTimestamp(iso) : "",
        source: "static",
      });
    }
    return items;
  }, [anonymousReviewer, clampRating, formatReviewTimestamp, staticReviews]);

  const reviewFormId = useMemo(
    () => `tour-review-form-${tour.id}`,
    [tour.id],
  );

  useEffect(() => {
    if (!isOpen || !tour?.id) {
      return;
    }

    setVisibleReviewCount(4);
    setReviewFeedback({ type: null, message: "" });
    setReviewForm({
      name: "",
      rating: "5",
      message: "",
    });

    if (!supabase) {
      setRemoteReviews([]);
      setReviewsLoading(false);
      setReviewsError(null);
      return;
    }

    let isMounted = true;
    setReviewsLoading(true);
    setReviewsError(null);

    supabase
      .from("tour_reviews")
      .select("id, author_name, rating, comment, created_at")
      .eq("tour_id", tour.id)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error) {
          setReviewsError(
            error.message || "Không thể tải danh sách đánh giá. Vui lòng thử lại sau.",
          );
          setRemoteReviews([]);
          return;
        }

        const mapped: ModalReview[] =
          (data ?? [])
            .map((row: Record<string, unknown>) => {
              const content =
                typeof row.comment === "string" ? row.comment.trim() : "";
              if (!content.length) {
                return null;
              }
              const iso =
                typeof row.created_at === "string" && row.created_at
                  ? row.created_at
                  : new Date().toISOString();
              const author =
                typeof row.author_name === "string" && row.author_name.trim().length
                  ? row.author_name.trim()
                  : anonymousReviewer;
              const ratingValue =
                typeof row.rating === "number"
                  ? row.rating
                  : Number.parseInt(String(row.rating ?? 5), 10);
              return {
                id:
                  typeof row.id === "string"
                    ? row.id
                    : typeof row.id === "number"
                    ? row.id.toString()
                    : `remote-${Math.random().toString(36).slice(2, 10)}`,
                author,
                rating: clampRating(ratingValue),
                content,
                createdAt: iso,
                timestamp: formatReviewTimestamp(iso),
                source: "remote" as const,
              };
            })
            .filter((item): item is ModalReview => Boolean(item));

        setRemoteReviews(mapped);
      })
      .catch((error) => {
        if (!isMounted) return;
        setReviewsError(
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách đánh giá. Vui lòng thử lại sau.",
        );
        setRemoteReviews([]);
      })
      .finally(() => {
        if (!isMounted) return;
        setReviewsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [
    anonymousReviewer,
    clampRating,
    formatReviewTimestamp,
    isOpen,
    supabase,
    tour?.id,
  ]);

  const allReviews = useMemo<ModalReview[]>(() => {
    const merged = [...remoteReviews, ...normalisedStaticReviews];
    return merged.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [normalisedStaticReviews, remoteReviews]);

  const totalReviews = allReviews.length;

  const averageRating = useMemo(() => {
    if (!totalReviews) {
      return Math.max(0, Number.isFinite(tour.rating) ? tour.rating : 0);
    }
    const sum = allReviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / totalReviews;
  }, [allReviews, totalReviews, tour.rating]);

  const ratingBreakdown = useMemo(
    () =>
      [5, 4, 3, 2, 1].map((star) => {
        const count = allReviews.filter((review) => review.rating === star).length;
        const percentage = totalReviews
          ? Math.round((count / totalReviews) * 100)
          : 0;
        return {
          star,
          count,
          percentage,
        };
      }),
    [allReviews, totalReviews],
  );

  const displayedReviews = useMemo(
    () => allReviews.slice(0, visibleReviewCount),
    [allReviews, visibleReviewCount],
  );

  const handleReviewFieldChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setReviewForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (reviewFeedback.type) {
      setReviewFeedback({ type: null, message: "" });
    }
  };

  const handleSubmitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmittingReview) {
      return;
    }

    const trimmedName = reviewForm.name.trim();
    const trimmedMessage = reviewForm.message.trim();
    if (!trimmedName || !trimmedMessage) {
      setReviewFeedback({
        type: "error",
        message: "Vui lòng nhập tên và cảm nhận trước khi gửi.",
      });
      return;
    }

    const safeRating = clampRating(Number.parseInt(reviewForm.rating, 10) || 5);
    const now = new Date().toISOString();
    const optimisticReview: ModalReview = {
      id: `local-${Math.random().toString(36).slice(2, 10)}`,
      author: trimmedName,
      rating: safeRating,
      content: trimmedMessage,
      createdAt: now,
      timestamp: formatReviewTimestamp(now),
      source: supabase ? "remote" : "local",
    };

    setIsSubmittingReview(true);
    setReviewFeedback({ type: null, message: "" });

    if (!supabase) {
      setRemoteReviews((prev) => [optimisticReview, ...prev]);
      setReviewFeedback({
        type: "success",
        message: "Cảm ơn bạn! Đánh giá của bạn đã được ghi nhận.",
      });
      setReviewForm({ name: "", rating: reviewForm.rating, message: "" });
      setIsSubmittingReview(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("tour_reviews")
        .insert({
          tour_id: tour.id,
          author_name: trimmedName,
          rating: safeRating,
          comment: trimmedMessage,
        })
        .select("id, author_name, rating, comment, created_at")
        .single();

      if (error) {
        throw error;
      }

      const inserted: ModalReview = data
        ? {
            id:
              typeof data.id === "string"
                ? data.id
                : typeof data.id === "number"
                ? data.id.toString()
                : optimisticReview.id,
            author:
              typeof data.author_name === "string" && data.author_name.trim().length
                ? data.author_name.trim()
                : optimisticReview.author,
            rating: clampRating(
              typeof data.rating === "number"
                ? data.rating
                : Number.parseInt(String(data.rating ?? safeRating), 10),
            ),
            content:
              typeof data.comment === "string" && data.comment.trim().length
                ? data.comment.trim()
                : optimisticReview.content,
            createdAt:
              typeof data.created_at === "string" && data.created_at
                ? data.created_at
                : optimisticReview.createdAt,
            timestamp: formatReviewTimestamp(
              typeof data.created_at === "string" && data.created_at
                ? data.created_at
                : optimisticReview.createdAt,
            ),
            source: "remote",
          }
        : optimisticReview;

      setRemoteReviews((prev) => [inserted, ...prev]);
      setReviewFeedback({
        type: "success",
        message: "Cảm ơn bạn! Đánh giá của bạn đã được ghi nhận.",
      });
      setReviewForm({ name: "", rating: reviewForm.rating, message: "" });
    } catch (error) {
      console.error("Không thể gửi đánh giá:", error);
      const fallback =
        "Không thể gửi đánh giá. Vui lòng thử lại trong giây lát.";
      setReviewFeedback({
        type: "error",
        message:
          error instanceof Error && error.message ? error.message : fallback,
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleShowMoreReviews = () => {
    setVisibleReviewCount((prev) =>
      allReviews.length ? Math.min(prev + 4, allReviews.length) : prev,
    );
  };

  const handleScrollToReviewForm = () => {
    const container = document.getElementById(reviewFormId);
    if (!container) {
      return;
    }
    container.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      const input = container.querySelector("input[name='name']");
      if (input instanceof HTMLInputElement) {
        input.focus();
      }
    }, 320);
  };

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

  useEffect(() => {
    if (!isOpen) return;

    setAdultQty(initialAdultCount);
    setChildQty(initialChildCount);
  }, [isOpen, initialAdultCount, initialChildCount, tour.id]);

  const priceHighlight = `${formatCurrency(
    baseAdultPrice,
  )} / người lớn · ${formatCurrency(baseChildPrice)} / trẻ em`;

  const totalPrice =
    adultQty * baseAdultPrice + childQty * baseChildPrice;

  const handleBook = () => {
    if (!onBook) return;
    onBook({
      tourId: tour.id,
      tourName: tour.name,
      adultCount: adultQty,
      childCount: childQty,
      totalAmount: totalPrice,
      baseAdultPrice,
      baseChildPrice,
      bookingSlug: tour.bookingSlug,
    });
  };

  const isProcessingBooking =
    bookingState?.activeTourId === tour.id && bookingState?.isLoading;
  const bookingSuccessMessage =
    bookingState?.activeTourId === tour.id ? bookingState?.successMessage ?? null : null;
  const bookingErrorMessage =
    bookingState?.activeTourId === tour.id ? bookingState?.errorMessage ?? null : null;

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
              {bookingEnabled && (
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
              )}

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
              {bookingEnabled && (
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
                  <button
                    type="button"
                    onClick={handleBook}
                    disabled={!onBook || Boolean(isProcessingBooking)}
                    className="w-full bg-[#00C951] hover:bg-[#00B347] text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center space-x-2 disabled:cursor-not-allowed disabled:bg-[#00C951]/60"
                  >
                    <span>{isProcessingBooking ? "Đang đặt..." : "Đặt Tour Ngay"}</span>
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
                  {bookingSuccessMessage && (
                    <p className="text-sm text-emerald-300 text-center">
                      {bookingSuccessMessage}
                    </p>
                  )}
                  {bookingErrorMessage && (
                    <p className="text-sm text-rose-300 text-center">
                      {bookingErrorMessage}
                    </p>
                  )}
                </div>
              )}

              {/* Reviews */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Đánh Giá Khách Hàng
                </h3>
                <div className="grid gap-6 rounded-[28px] border border-white/10 bg-gray-800/40 p-6 lg:grid-cols-[minmax(260px,320px),1fr]">
                  <aside className="flex flex-col gap-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-xl">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                        Điểm trung bình
                      </p>
                      <div className="mt-4 flex items-end gap-3">
                        <span className="text-5xl font-bold">
                          {averageRating.toFixed(1)}
                        </span>
                        <div className="flex gap-1 text-amber-300">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <svg
                              key={`avg-star-${index}`}
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill={index < Math.round(averageRating) ? "currentColor" : "none"}
                              stroke="currentColor"
                              strokeWidth={index < Math.round(averageRating) ? 0 : 1.5}
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="mt-2 text-xs uppercase tracking-[0.25em] text-white/50">
                        {totalReviews
                          ? `${totalReviews} đánh giá`
                          : "Chưa có đánh giá"}
                      </p>
                    </div>
                    <div className="space-y-3">
                      {ratingBreakdown.map((row) => (
                        <div
                          key={`rating-${row.star}`}
                          className="flex items-center gap-3 text-sm"
                        >
                          <span className="w-10 font-semibold">{row.star}★</span>
                          <div className="h-2 flex-1 rounded-full bg-white/20 overflow-hidden">
                            <span
                              className="block h-full rounded-full bg-amber-400"
                              style={{ width: `${row.percentage}%` }}
                            />
                          </div>
                          <span className="w-10 text-right tabular-nums">
                            {row.count}
                          </span>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleScrollToReviewForm}
                      className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/90 transition hover:bg-white/20"
                    >
                      Viết đánh giá
                    </button>
                  </aside>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      {reviewsLoading ? (
                        <p className="text-sm text-white/70">
                          Đang tải đánh giá...
                        </p>
                      ) : null}
                      {reviewsError ? (
                        <p className="text-sm text-rose-300">{reviewsError}</p>
                      ) : null}
                      {displayedReviews.length ? (
                        <div className="space-y-4">
                          {displayedReviews.map((review) => {
                            const avatarInitial = review.author
                              ? review.author.charAt(0).toUpperCase()
                              : "★";
                            return (
                              <article
                                key={review.id}
                                className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/90 shadow-lg"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-semibold text-emerald-200">
                                    {avatarInitial}
                                  </div>
                                  <div className="flex-1 space-y-2">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <strong className="text-white">
                                        {review.author}
                                      </strong>
                                      <time className="text-xs uppercase tracking-[0.25em] text-white/50">
                                        {review.timestamp}
                                      </time>
                                    </div>
                                    <div className="flex items-center gap-1 text-amber-300">
                                      {Array.from({ length: 5 }).map((_, index) => (
                                        <svg
                                          key={`${review.id}-star-${index}`}
                                          className="h-4 w-4"
                                          viewBox="0 0 20 20"
                                          fill={index < review.rating ? "currentColor" : "none"}
                                          stroke="currentColor"
                                          strokeWidth={index < review.rating ? 0 : 1.5}
                                        >
                                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                      ))}
                                    </div>
                                    <p className="text-sm leading-relaxed text-white/80">
                                      {review.content}
                                    </p>
                                  </div>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      ) : !reviewsLoading ? (
                        <p className="text-sm text-white/70">
                          Chưa có đánh giá cho hành trình này. Hãy là người đầu tiên chia sẻ cảm nhận của bạn!
                        </p>
                      ) : null}
                      {allReviews.length > displayedReviews.length ? (
                        <button
                          type="button"
                          onClick={handleShowMoreReviews}
                          className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-white/20"
                        >
                          Xem thêm đánh giá
                        </button>
                      ) : null}
                    </div>

                    <form
                      id={reviewFormId}
                      onSubmit={handleSubmitReview}
                      className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-white"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold">Viết đánh giá</h4>
                        <span className="text-xs uppercase tracking-[0.3em] text-white/50">
                          Không cần đăng nhập
                        </span>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-2 text-sm text-white/70">
                          <span className="uppercase tracking-[0.3em] text-xs text-white/50">
                            Tên của bạn
                          </span>
                          <input
                            type="text"
                            name="name"
                            value={reviewForm.name}
                            onChange={handleReviewFieldChange}
                            placeholder="Nguyễn Văn A"
                            className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-emerald-300 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-200/40"
                          />
                        </label>
                        <label className="space-y-2 text-sm text-white/70">
                          <span className="uppercase tracking-[0.3em] text-xs text-white/50">
                            Chọn số sao
                          </span>
                          <select
                            name="rating"
                            value={reviewForm.rating}
                            onChange={handleReviewFieldChange}
                            className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-emerald-300 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-200/40"
                          >
                            <option value="5">5 ⭐</option>
                            <option value="4">4 ⭐</option>
                            <option value="3">3 ⭐</option>
                            <option value="2">2 ⭐</option>
                            <option value="1">1 ⭐</option>
                          </select>
                        </label>
                      </div>
                      <label className="space-y-2 text-sm text-white/70">
                        <span className="uppercase tracking-[0.3em] text-xs text-white/50">
                          Cảm nhận của bạn
                        </span>
                        <textarea
                          name="message"
                          value={reviewForm.message}
                          onChange={handleReviewFieldChange}
                          rows={4}
                          placeholder="Chia sẻ trải nghiệm của bạn cùng HÀNH TRÌNH VIỆT..."
                          className="w-full resize-none rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-emerald-300 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-200/40"
                        />
                      </label>
                      {reviewFeedback.message ? (
                        <p
                          className={`text-sm ${
                            reviewFeedback.type === "success"
                              ? "text-emerald-300"
                              : "text-rose-300"
                          }`}
                        >
                          {reviewFeedback.message}
                        </p>
                      ) : null}
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isSubmittingReview}
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 19l9-7-9-7v14zm-9 0V5l7 7-7 7z"
                          />
                        </svg>
                        {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                      </button>
                    </form>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
