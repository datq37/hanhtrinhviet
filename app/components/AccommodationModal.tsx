import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import type { StayOption } from "../sections/Accommodation";

interface AccommodationModalProps {
  isOpen: boolean;
  onClose: () => void;
  stay: StayOption;
  onBook?: (payload: StayOption) => void;
  bookingState?: {
    isLoading?: boolean;
    successMessage?: string | null;
    errorMessage?: string | null;
    activeStayId?: string | null;
  };
}

export default function AccommodationModal({
  isOpen,
  onClose,
  stay,
  onBook,
  bookingState,
}: AccommodationModalProps) {
  const isProcessing =
    bookingState?.activeStayId === stay.id && bookingState?.isLoading;
  const successMessage =
    bookingState?.activeStayId === stay.id ? bookingState?.successMessage ?? null : null;
  const errorMessage =
    bookingState?.activeStayId === stay.id ? bookingState?.errorMessage ?? null : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(event) => event.stopPropagation()}
            className="bg-gray-900 rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto relative text-white shadow-2xl"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-6 top-6 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
              aria-label="Đóng"
            >
              <svg
                className="h-6 w-6"
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

            <div className="relative h-[300px] w-full">
              <Image
                src={stay.image}
                alt={stay.name}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="inline-flex items-center rounded-full bg-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white">
                  {stay.type === "hotel"
                    ? "Khách sạn"
                    : stay.type === "homestay"
                    ? "Homestay"
                    : "Resort"}
                </span>
                <h2 className="mt-4 text-3xl font-bold">{stay.name}</h2>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/80">
                  <span className="flex items-center">
                    <svg
                      className="mr-2 h-5 w-5 text-emerald-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {stay.location}
                  </span>
                  <span className="flex items-center">
                    <svg
                      className="mr-2 h-5 w-5 text-emerald-400"
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
                    {stay.priceFrom}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-8 p-8 md:p-10">
              <div>
                <h3 className="text-xl font-semibold">Giới thiệu</h3>
                <p className="mt-3 text-white/80">{stay.description}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold">Điểm nổi bật</h3>
                <ul className="mt-4 space-y-3 text-sm text-white/80">
                  {stay.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex items-start gap-3 rounded-2xl bg-white/5 p-4"
                    >
                      <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                        ✓
                      </span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-3 rounded-2xl bg-white/5 p-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-white/60">
                    Giá từ
                  </p>
                  <p className="text-2xl font-semibold text-emerald-300">
                    {stay.priceFrom}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onBook?.(stay)}
                  disabled={!onBook || Boolean(isProcessing)}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-emerald-400"
                >
                  {isProcessing ? "Đang đặt..." : "Đặt phòng"}
                  <svg
                    className="ml-2 h-5 w-5"
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
                </button>
                {successMessage && (
                  <p className="text-sm text-emerald-300 text-center md:text-left">
                    {successMessage}
                  </p>
                )}
                {errorMessage && (
                  <p className="text-sm text-rose-300 text-center md:text-left">
                    {errorMessage}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
