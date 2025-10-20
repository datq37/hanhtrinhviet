"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useSupabase } from "../context/SupabaseContext";
import MainHeader from "../components/MainHeader";
import Footer from "../sections/Footer";

interface HistoryItem {
  id: string;
  name: string;
  date: string;
  amount: number;
  status: "pending" | "completed";
  reference: string;
}

interface DepositRequest {
  id: number;
  amount: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  processed_at: string | null;
}

type TourBookingRow = {
  id: number;
  total_amount: number;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
  tours: { name: string; slug: string }[] | { name: string; slug: string } | null;
};

type StayBookingRow = {
  id: number;
  total_amount: number;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
  stays: { name: string; slug: string }[] | { name: string; slug: string } | null;
};

const formatCurrency = (value: number) => `${value.toLocaleString("vi-VN")}₫`;

const BANK_INFO = {
  name: "MB Bank - Ngân hàng Quân đội",
  accountName: "NGUYỄN THỊ THU THỦY",
  accountNumber: "3888981688",
};

const tourCatalog = [
  {
    id: "tour-dalat",
    name: "Đà Lạt – Thành phố ngàn hoa",
    price: 3500000,
    duration: "3N2Đ",
  },
  {
    id: "tour-hue",
    name: "Huế – Di sản cố đô",
    price: 3800000,
    duration: "3N2Đ",
  },
  {
    id: "tour-nhatrang",
    name: "Nha Trang – Biển đảo thiên đường",
    price: 4000000,
    duration: "3N2Đ",
  },
];

const stayCatalog = [
  {
    id: "stay-danang",
    name: "Đà Nẵng Coastal Chic Hotel",
    price: 1500000,
    nights: "2 đêm",
  },
  {
    id: "stay-hue",
    name: "Hue Garden Deluxe Villa",
    price: 1800000,
    nights: "2 đêm",
  },
  {
    id: "stay-phuquoc",
    name: "Phú Quốc Ocean Retreat",
    price: 2200000,
    nights: "3 đêm",
  },
];

const VIETNAM_OFFSET_MINUTES = 7 * 60;
const pad = (value: number) => value.toString().padStart(2, "0");

const toVietnamTime = (value: string) => {
  const input = new Date(value);
  if (Number.isNaN(input.getTime())) return null;
  const utcMillis = input.getTime() + input.getTimezoneOffset() * 60000;
  return new Date(utcMillis + VIETNAM_OFFSET_MINUTES * 60000);
};

const formatDate = (value: string) => {
  const date = toVietnamTime(value);
  if (!date) return "";
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};

const formatDateTime = (value: string) => {
  const date = toVietnamTime(value);
  if (!date) return "";
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function AccountPage() {
  const { profile, supabase, loading: authLoading, refreshProfile } = useSupabase();
  const [balance, setBalance] = useState(0);
  const [frozenBalance, setFrozenBalance] = useState(0);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositMessage, setDepositMessage] = useState("");
  const [depositError, setDepositError] = useState("");
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [tourHistory, setTourHistory] = useState<HistoryItem[]>([]);
  const [stayHistory, setStayHistory] = useState<HistoryItem[]>([]);
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmittingDeposit, setIsSubmittingDeposit] = useState(false);
  const [isProcessingBooking, setIsProcessingBooking] = useState(false);

  const transferNote = useMemo(() => `${profile?.phone ?? ""} travelvn`, [profile?.phone]);

  const loadAccountData = useCallback(async () => {
    if (!profile?.id) return;
    setIsLoadingData(true);

    try {
      const [{ data: walletData, error: walletError }, { data: depositsData, error: depositErrorRes }, { data: tourBookings, error: tourError }, { data: stayBookings, error: stayError }] =
        await Promise.all([
          supabase
            .from("wallets")
            .select("available_balance, frozen_balance")
            .eq("profile_id", profile.id)
            .maybeSingle(),
          supabase
            .from("deposit_requests")
            .select("id, amount, status, created_at, processed_at")
            .eq("profile_id", profile.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("tour_bookings")
            .select("id, total_amount, status, created_at, tours(name, slug)")
            .eq("profile_id", profile.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("stay_bookings")
            .select("id, total_amount, status, created_at, stays(name, slug)")
            .eq("profile_id", profile.id)
            .order("created_at", { ascending: false }),
        ]);

      if (walletError) throw walletError;
      if (depositErrorRes) throw depositErrorRes;
      if (tourError) throw tourError;
      if (stayError) throw stayError;

      setBalance(walletData?.available_balance ?? 0);
      setFrozenBalance(walletData?.frozen_balance ?? 0);
      setDepositRequests((depositsData ?? []) as DepositRequest[]);

      setTourHistory(
        ((tourBookings ?? []) as TourBookingRow[]).map((booking) => {
          const tourInfo = Array.isArray(booking.tours)
            ? booking.tours[0] ?? null
            : booking.tours;
          return {
          id: booking.id.toString(),
          name: tourInfo?.name ?? "Tour du lịch",
          amount: booking.total_amount,
          status: booking.status === "confirmed" ? "completed" : "pending",
          date: booking.created_at,
          reference: `TOUR-${booking.id}`,
          };
        }),
      );

      setStayHistory(
        ((stayBookings ?? []) as StayBookingRow[]).map((booking) => {
          const stayInfo = Array.isArray(booking.stays)
            ? booking.stays[0] ?? null
            : booking.stays;
          return {
          id: booking.id.toString(),
          name: stayInfo?.name ?? "Đặt phòng",
          amount: booking.total_amount,
          status: booking.status === "confirmed" ? "completed" : "pending",
          date: booking.created_at,
          reference: `ROOM-${booking.id}`,
          };
        }),
      );
    } catch (error) {
      console.error("Không thể tải dữ liệu tài khoản:", error);
    } finally {
      setIsLoadingData(false);
    }
  }, [profile?.id, supabase]);

  useEffect(() => {
    if (!profile?.id) return;
    loadAccountData();
  }, [profile?.id, loadAccountData]);

  useEffect(() => {
    if (authLoading) return;
    if (!profile) {
      refreshProfile();
    }
  }, [authLoading, profile, refreshProfile]);

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setDepositMessage("Đã sao chép thông tin giao dịch!");
      setTimeout(() => setDepositMessage(""), 2000);
    } catch {
      /* bỏ qua */
    }
  };

  const handleDeposit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDepositError("");
    setDepositMessage("");

    if (!profile?.id) {
      setDepositError("Vui lòng đăng nhập để nạp tiền.");
      return;
    }

    const numeric = Number(depositAmount.replace(/[^\d]/g, ""));
    if (!numeric || numeric < 500000) {
      setDepositError("Số tiền nạp tối thiểu là 500.000đ.");
      return;
    }

    setIsSubmittingDeposit(true);
    try {
      const { error } = await supabase.from("deposit_requests").insert({
        profile_id: profile.id,
        amount: numeric,
      });
      if (error) throw error;

      setDepositAmount("");
      setDepositMessage(
        `Yêu cầu nạp ${formatCurrency(numeric)} đã được gửi tới quản trị viên. Vui lòng chờ phê duyệt.`,
      );
      await loadAccountData();
    } catch (error) {
      console.error("Không thể gửi yêu cầu nạp tiền:", error);
      setDepositError("Không thể gửi yêu cầu nạp tiền. Vui lòng thử lại.");
    } finally {
      setIsSubmittingDeposit(false);
    }
  };

  const bookTour = async (tourId: string) => {
    setBookingError("");
    setBookingMessage("");

    const tour = tourCatalog.find((item) => item.id === tourId);
    if (!profile?.id || !tour) {
      setBookingError("Không thể xác định tour. Vui lòng thử lại.");
      return;
    }

    setIsProcessingBooking(true);
    try {
      const { error } = await supabase.rpc("create_tour_booking", {
        p_profile_id: profile.id,
        p_tour_slug: tour.id,
      });

      if (error) throw error;

      setBookingMessage(
        `Đặt tour "${tour.name}" thành công! Đội ngũ HÀNH TRÌNH VIỆT sẽ liên hệ xác nhận trong 24 giờ.`,
      );
      await loadAccountData();
    } catch (error) {
      console.error("Không thể đặt tour:", error);
      const message =
        error instanceof Error && error.message.includes("Insufficient balance")
          ? "Số dư chưa đủ để đặt tour. Vui lòng nạp thêm."
          : error instanceof Error
          ? error.message
          : "Không thể đặt tour. Vui lòng thử lại.";
      setBookingError(message);
    } finally {
      setIsProcessingBooking(false);
    }
  };

  const bookStay = async (stayId: string) => {
    setBookingError("");
    setBookingMessage("");

    const stay = stayCatalog.find((item) => item.id === stayId);
    if (!profile?.id || !stay) {
      setBookingError("Không thể xác định lưu trú. Vui lòng thử lại.");
      return;
    }

    setIsProcessingBooking(true);
    try {
      const { error } = await supabase.rpc("create_stay_booking", {
        p_profile_id: profile.id,
        p_stay_slug: stay.id,
      });

      if (error) throw error;

      setBookingMessage(
        `Đặt phòng "${stay.name}" thành công! Concierge sẽ liên hệ xác nhận chi tiết.`,
      );
      await loadAccountData();
    } catch (error) {
      console.error("Không thể đặt lưu trú:", error);
      const message =
        error instanceof Error && error.message.includes("Insufficient balance")
          ? "Số dư chưa đủ để đặt phòng. Vui lòng nạp thêm."
          : error instanceof Error
          ? error.message
          : "Không thể đặt phòng. Vui lòng thử lại.";
      setBookingError(message);
    } finally {
      setIsProcessingBooking(false);
    }
  };

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-sm text-white/70">Đang tải tài khoản...</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-10 text-center">
          <p className="text-lg font-semibold text-white">Vui lòng đăng nhập để xem tài khoản.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <MainHeader variant="translucent" />

      <section className="relative mt-16 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 sm:mt-24">
        <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
          <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl backdrop-blur md:gap-8 md:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-emerald-400">
                  HÀNH TRÌNH VIỆT Account
                </p>
                <h1 className="mt-3 text-3xl font-semibold">
                  {authLoading
                    ? "Đang tải tài khoản..."
                    : profile?.full_name
                    ? `Xin chào, ${profile.full_name}`
                    : "Vui lòng đăng nhập"}
                </h1>
                <p className="mt-2 text-sm text-white/70">
                  Quản lý số dư, thực hiện nạp tiền và xem lịch sử đặt tour/lưu trú của bạn.
                </p>
              </div>
              <div className="grid gap-3 text-sm text-white/80 sm:grid-cols-2 md:gap-4">
                <div className="rounded-2xl bg-white/5 px-5 py-4 md:px-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                    Số dư khả dụng
                  </p>
                  <p className="mt-2 text-2xl font-bold text-emerald-400">
                    {isLoadingData ? "..." : formatCurrency(balance)}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 px-5 py-4 md:px-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                    Số dư đóng băng
                  </p>
                  <p className="mt-2 text-2xl font-bold text-rose-400">
                    {isLoadingData ? "..." : formatCurrency(frozenBalance)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-[1.2fr,0.8fr] md:gap-8">
              <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6">
                <h2 className="text-lg font-semibold text-white">Thông tin nạp tiền</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.3em] text-white/50">
                      Ngân hàng
                    </label>
                    <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-sm">
                      <span>{BANK_INFO.name}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(BANK_INFO.name)}
                        className="rounded-full bg-white/10 p-2 text-white/70 transition hover:bg-white/20"
                        aria-label="Copy bank name"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-4 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.3em] text-white/50">
                      Tên người nhận
                    </label>
                    <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-sm">
                      <span className="font-semibold uppercase text-white">{BANK_INFO.accountName}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(BANK_INFO.accountName)}
                        className="rounded-full bg-white/10 p-2 text-white/70 transition hover:bg-white/20"
                        aria-label="Copy account name"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-4 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.3em] text-white/50">
                      Số tài khoản
                    </label>
                    <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-sm">
                      <span>{BANK_INFO.accountNumber}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(BANK_INFO.accountNumber)}
                        className="rounded-full bg-white/10 p-2 text-white/70 transition hover:bg-white/20"
                        aria-label="Copy account number"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-4 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.3em] text-white/50">
                      Nội dung chuyển khoản
                    </label>
                    <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-sm">
                      <span>{transferNote}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(transferNote)}
                        className="rounded-full bg-white/10 p-2 text-white/70 transition hover:bg-white/20"
                        aria-label="Copy transfer note"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-4 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleDeposit} className="space-y-4 rounded-2xl bg-white/5 p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
                    Thực hiện nạp tiền
                  </h3>
                  <div className="grid gap-4 md:grid-cols-[1fr,auto]">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Nhập số tiền muốn nạp (ví dụ: 2.000.000)"
                      value={depositAmount}
                      onChange={(event) => setDepositAmount(event.target.value)}
                      className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-emerald-300 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-200/40"
                    />
                    <button
                      type="submit"
                      className="w-full rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
                      disabled={isSubmittingDeposit}
                    >
                      {isSubmittingDeposit ? "Đang gửi..." : "Xác nhận nạp"}
                    </button>
                  </div>
                  {depositError && <p className="text-sm text-rose-400">{depositError}</p>}
                  {depositMessage && <p className="text-sm text-emerald-400">{depositMessage}</p>}
                </form>

                <div className="rounded-2xl bg-slate-900/40 p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
                    Yêu cầu nạp tiền gần đây
                  </h3>
                  {depositRequests.length === 0 ? (
                    <p className="mt-4 text-sm text-white/60">
                      Bạn chưa có yêu cầu nạp tiền nào. Thực hiện nạp tiền để gửi yêu cầu tới quản trị viên.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-4">
                      {depositRequests.map((request) => {
                        const created = formatDateTime(request.created_at);
                        const statusLabel =
                          request.status === "pending"
                            ? "Đang chờ duyệt"
                            : request.status === "approved"
                            ? "Đã cộng tiền"
                            : "Đã từ chối";
                        const statusClass =
                          request.status === "pending"
                            ? "text-amber-300 bg-amber-500/10"
                            : request.status === "approved"
                            ? "text-emerald-300 bg-emerald-500/10"
                            : "text-rose-300 bg-rose-500/10";

                        return (
                          <div
                            key={request.id}
                            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-base font-semibold text-white">
                                  {formatCurrency(request.amount)}
                                </p>
                                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/50">
                                  {created}
                                </p>
                                {request.processed_at && (
                                  <p className="mt-1 text-xs text-white/50">
                                    Xử lý: {formatDateTime(request.processed_at)}
                                  </p>
                                )}
                              </div>
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${statusClass}`}
                              >
                                {statusLabel}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6">
                <h2 className="text-lg font-semibold text-white">Lưu ý quan trọng</h2>
                <ul className="space-y-3 text-sm text-white/70">
                  <li>• Thời gian xử lý nạp tiền: 5-10 phút trong giờ hành chính, tối đa 2 giờ ngoài giờ.</li>
                  <li>• Nội dung chuyển khoản phải ghi đúng số điện thoại đã đăng ký để hệ thống tự động cộng tiền.</li>
                  <li>• Liên hệ trợ lý HÀNH TRÌNH VIỆT qua hotline 1900 636 545 khi cần hỗ trợ.</li>
                  <li>• Số dư đóng băng là khoản tạm giữ cho các dịch vụ đang xử lý.</li>
                </ul>
                <div className="rounded-2xl bg-white/10 p-4 text-xs text-white/60">
                  <p>Mọi giao dịch nạp tiền được ghi nhận trên hệ thống HÀNH TRÌNH VIỆT.</p>
                  <p className="mt-2">
                    Chúng tôi cam kết bảo mật thông tin cá nhân và chỉ sử dụng nhằm phục vụ hành trình của bạn.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 pb-16 md:px-6 md:pb-20">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl md:p-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold text-white">Đặt tour nhanh</h2>
                <span className="text-sm text-white/60">
                  Số dư khả dụng: <span className="font-semibold text-emerald-400">{formatCurrency(balance)}</span>
                </span>
              </div>
              <p className="mt-2 text-sm text-white/60">
                Chọn tour muốn đặt, hệ thống sẽ tự động trừ tiền từ số dư của bạn và lưu vào lịch sử.
              </p>

              <div className="mt-6 space-y-4">
                {tourCatalog.map((tour) => (
                  <div
                    key={tour.id}
                    className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-white">{tour.name}</h3>
                      <p className="text-sm text-white/60">Thời gian: {tour.duration}</p>
                    </div>
                    <div className="flex w-full flex-col items-start gap-3 md:w-auto md:items-end">
                      <span className="text-lg font-semibold text-emerald-400">
                        {formatCurrency(tour.price)}
                      </span>
                      <button
                        type="button"
                        onClick={() => bookTour(tour.id)}
                        className="w-full rounded-full bg-emerald-500 px-6 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
                        disabled={isProcessingBooking}
                      >
                        {isProcessingBooking ? "Đang xử lý..." : "Đặt tour"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl md:p-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold text-white">Đặt lưu trú nhanh</h2>
                <span className="text-sm text-white/60">
                  Số dư khả dụng: <span className="font-semibold text-emerald-400">{formatCurrency(balance)}</span>
                </span>
              </div>
              <p className="mt-2 text-sm text-white/60">
                Chọn lưu trú mong muốn, HÀNH TRÌNH VIỆT sẽ trừ tiền và gửi xác nhận sớm nhất.
              </p>

              <div className="mt-6 space-y-4">
                {stayCatalog.map((stay) => (
                  <div
                    key={stay.id}
                    className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-white">{stay.name}</h3>
                      <p className="text-sm text-white/60">Thời gian lưu trú: {stay.nights}</p>
                    </div>
                    <div className="flex w-full flex-col items-start gap-3 md:w-auto md:items-end">
                      <span className="text-lg font-semibold text-emerald-400">
                        {formatCurrency(stay.price)}
                      </span>
                      <button
                        type="button"
                        onClick={() => bookStay(stay.id)}
                        className="w-full rounded-full bg-emerald-500 px-6 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
                        disabled={isProcessingBooking}
                      >
                        {isProcessingBooking ? "Đang xử lý..." : "Đặt phòng"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {bookingError && <p className="mt-4 text-sm text-rose-400">{bookingError}</p>}
              {bookingMessage && <p className="mt-2 text-sm text-emerald-400">{bookingMessage}</p>}
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:mt-12 lg:grid-cols-2 lg:gap-10">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl md:p-8">
              <h2 className="mb-4 text-xl font-semibold text-white">Lịch sử đặt tour</h2>
              {tourHistory.length === 0 ? (
                <p className="text-sm text-white/60">Bạn chưa có tour nào trong lịch sử. Hãy bắt đầu hành trình đầu tiên.</p>
              ) : (
                <div className="space-y-4">
                  {tourHistory.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="font-semibold text-white">{item.name}</h3>
                        {item.status === "completed" ? (
                          <span className="text-xs font-semibold uppercase text-emerald-400">
                            Đã xác nhận
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-white/60">
                        Ngày đặt: {formatDate(item.date)}
                      </p>
                      <p className="text-white/60">Mã tham chiếu: {item.reference}</p>
                      <p className="mt-2 font-semibold text-emerald-400">{formatCurrency(item.amount)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl md:p-8">
              <h2 className="mb-4 text-xl font-semibold text-white">Lịch sử đặt lưu trú</h2>
              {stayHistory.length === 0 ? (
                <p className="text-sm text-white/60">Bạn chưa có lưu trú nào trong lịch sử. Chọn điểm nghỉ dưỡng yêu thích để bắt đầu hành trình.</p>
              ) : (
                <div className="space-y-4">
                  {stayHistory.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="font-semibold text-white">{item.name}</h3>
                        {item.status === "completed" ? (
                          <span className="text-xs font-semibold uppercase text-emerald-400">
                            Đã xác nhận
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-white/60">
                        Ngày đặt: {formatDate(item.date)}
                      </p>
                      <p className="text-white/60">Mã tham chiếu: {item.reference}</p>
                      <p className="mt-2 font-semibold text-emerald-400">{formatCurrency(item.amount)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
