"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import MainHeader from "../components/MainHeader";
import Footer from "../sections/Footer";

interface HistoryItem {
  id: string;
  name: string;
  date: string;
  amount: number;
  status: "completed" | "pending";
  reference: string;
}

interface BankInfo {
  name: string;
  accountName: string;
  accountNumber: string;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  bank: BankInfo;
}

interface DepositRequest {
  id: string;
  email: string;
  name: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  processedAt?: string;
}

const formatCurrency = (value: number) =>
  `${value.toLocaleString("vi-VN")}₫`;

const DEFAULT_PROFILE: UserProfile = {
  name: "Nguyễn Minh Quân",
  email: "minhquan@example.com",
  phone: "0968019227",
  bank: {
    name: "MB Bank - Ngân hàng Quân đội",
    accountName: "NGUYỄN THỊ THU THỦY",
    accountNumber: "3888981688",
  },
};

const DEFAULT_BALANCE = 1_500_000;
const DEPOSIT_STORAGE_KEY = "travelvn-deposit-requests";

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

export default function AccountPage() {
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [balance, setBalance] = useState(DEFAULT_BALANCE);
  const [frozenBalance] = useState(0);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositMessage, setDepositMessage] = useState("");
  const [depositError, setDepositError] = useState("");
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);

  const [tourHistory, setTourHistory] = useState<HistoryItem[]>([]);
  const [stayHistory, setStayHistory] = useState<HistoryItem[]>([]);
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingError, setBookingError] = useState("");

  const userEmail = userProfile.email;
  const walletKey = useMemo(
    () => (userEmail ? `travelvn-wallet-${userEmail}` : null),
    [userEmail],
  );

  const loadDepositRequests = useCallback(() => {
    if (typeof window === "undefined" || !userEmail) return;
    try {
      const stored = localStorage.getItem(DEPOSIT_STORAGE_KEY);
      if (!stored) {
        setDepositRequests([]);
        return;
      }
      const parsed: DepositRequest[] = JSON.parse(stored);
      const filtered = parsed
        .filter((request) => request.email === userEmail)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      setDepositRequests(filtered);
    } catch {
      setDepositRequests([]);
    }
  }, [userEmail]);

  const syncBalanceFromStorage = useCallback(() => {
    if (typeof window === "undefined" || !walletKey) return;
    const storedBalance = Number(localStorage.getItem(walletKey));
    if (Number.isFinite(storedBalance) && storedBalance >= 0) {
      setBalance(storedBalance);
    }
  }, [walletKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("travelvn-user");
      if (!stored) {
        setUserProfile(DEFAULT_PROFILE);
        return;
      }
      const parsed = JSON.parse(stored);
      setUserProfile({
        name: parsed.name || DEFAULT_PROFILE.name,
        email: parsed.email || DEFAULT_PROFILE.email,
        phone: parsed.phone || DEFAULT_PROFILE.phone,
        bank: DEFAULT_PROFILE.bank,
      });
    } catch {
      setUserProfile(DEFAULT_PROFILE);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !walletKey) return;
    const storedBalance = Number(localStorage.getItem(walletKey));
    if (!Number.isFinite(storedBalance) || storedBalance < 0) {
      localStorage.setItem(walletKey, DEFAULT_BALANCE.toString());
      setBalance(DEFAULT_BALANCE);
    } else {
      setBalance(storedBalance);
    }
    loadDepositRequests();
  }, [walletKey, loadDepositRequests]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleSync = () => {
      syncBalanceFromStorage();
      loadDepositRequests();
    };
    window.addEventListener("travelvn-deposit-change", handleSync);
    return () => {
      window.removeEventListener("travelvn-deposit-change", handleSync);
    };
  }, [syncBalanceFromStorage, loadDepositRequests]);

  const applyBalanceDelta = useCallback(
    (delta: number) => {
      if (typeof window === "undefined" || !walletKey) return;
      setBalance((previous) => {
        const next = Math.max(previous + delta, 0);
        localStorage.setItem(walletKey, next.toString());
        window.dispatchEvent(new Event("travelvn-deposit-change"));
        return next;
      });
    },
    [walletKey],
  );

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setDepositMessage("Đã sao chép thông tin giao dịch!");
      setTimeout(() => setDepositMessage(""), 2000);
    } catch {
      /* ignore */
    }
  };

  const handleDeposit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDepositError("");
    setDepositMessage("");

    if (!userEmail) {
      setDepositError("Vui lòng đăng nhập trước khi nạp tiền.");
      return;
    }

    const numeric = Number(depositAmount.replace(/[^\d]/g, ""));
    if (!numeric || numeric < 500000) {
      setDepositError("Số tiền nạp tối thiểu là 500.000đ.");
      return;
    }

    try {
      const stored = localStorage.getItem(DEPOSIT_STORAGE_KEY);
      const existing: DepositRequest[] = stored ? JSON.parse(stored) : [];
      const newRequest: DepositRequest = {
        id: `deposit-${Date.now()}`,
        email: userEmail,
        name: userProfile.name,
        amount: numeric,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      const updated = [newRequest, ...existing];
      localStorage.setItem(DEPOSIT_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("travelvn-deposit-change"));
      setDepositRequests((prev) => [newRequest, ...prev]);
      setDepositMessage(
        `Yêu cầu nạp ${formatCurrency(numeric)} đã được gửi tới quản trị viên. Vui lòng chờ phê duyệt.`,
      );
    } catch {
      setDepositError("Không thể gửi yêu cầu nạp tiền. Vui lòng thử lại sau.");
      return;
    }

    setDepositAmount("");
  };

  const bookTour = (tourId: string) => {
    setBookingError("");
    setBookingMessage("");

    const tour = tourCatalog.find((item) => item.id === tourId);
    if (!tour) return;

    if (balance < tour.price) {
      setBookingError(
        `Số dư chưa đủ để đặt tour. Vui lòng nạp thêm ít nhất ${formatCurrency(
          tour.price - balance,
        )}.`,
      );
      return;
    }

    applyBalanceDelta(-tour.price);
    setTourHistory((prev) => [
      {
        id: `${Date.now()}-${tour.id}`,
        name: tour.name,
        amount: tour.price,
        status: "pending",
        date: new Date().toISOString(),
        reference: `TOUR-${Math.floor(Math.random() * 9000 + 1000)}`,
      },
      ...prev,
    ]);
    setBookingMessage(
      `Đặt tour "${tour.name}" thành công! Đội ngũ Travel VN sẽ liên hệ xác nhận trong 24 giờ.`,
    );
  };

  const bookStay = (stayId: string) => {
    setBookingError("");
    setBookingMessage("");

    const stay = stayCatalog.find((item) => item.id === stayId);
    if (!stay) return;

    if (balance < stay.price) {
      setBookingError(
        `Số dư chưa đủ để đặt phòng. Vui lòng nạp thêm ít nhất ${formatCurrency(
          stay.price - balance,
        )}.`,
      );
      return;
    }

    applyBalanceDelta(-stay.price);
    setStayHistory((prev) => [
      {
        id: `${Date.now()}-${stay.id}`,
        name: stay.name,
        amount: stay.price,
        status: "pending",
        date: new Date().toISOString(),
        reference: `ROOM-${Math.floor(Math.random() * 9000 + 1000)}`,
      },
      ...prev,
    ]);
    setBookingMessage(
      `Đặt phòng "${stay.name}" thành công! Concierge sẽ liên hệ xác nhận chi tiết.`,
    );
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <MainHeader variant="translucent" />

      <section className="relative mt-24 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-col gap-8 rounded-3xl border border-white/10 bg-slate-900/60 p-10 shadow-2xl backdrop-blur">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-emerald-400">
                  Travel VN Account
                </p>
                <h1 className="mt-3 text-3xl font-semibold">
                  Xin chào, {userProfile.name}
                </h1>
                <p className="mt-2 text-sm text-white/70">
                  Quản lý số dư, thực hiện nạp tiền và xem lịch sử đặt tour/lưu trú của bạn.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-white/80">
                <div className="rounded-2xl bg-white/5 px-6 py-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                    Số dư khả dụng
                  </p>
                  <p className="mt-2 text-2xl font-bold text-emerald-400">
                    {formatCurrency(balance)}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 px-6 py-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                    Số dư đóng băng
                  </p>
                  <p className="mt-2 text-2xl font-bold text-rose-400">
                    {formatCurrency(frozenBalance)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-[1.2fr,0.8fr]">
              <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-lg font-semibold text-white">Thông tin nạp tiền</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.3em] text-white/50">
                      Ngân hàng
                    </label>
                    <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-sm">
                      <span>{userProfile.bank.name}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(userProfile.bank.name)}
                        className="rounded-full bg-white/10 p-2 text-white/70 transition hover:bg-white/20"
                        aria-label="Copy bank name"
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
                      <span className="font-semibold uppercase text-white">
                        {userProfile.bank.accountName}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(userProfile.bank.accountName)}
                        className="rounded-full bg-white/10 p-2 text-white/70 transition hover:bg-white/20"
                        aria-label="Copy account name"
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
                      <span>{userProfile.bank.accountNumber}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(userProfile.bank.accountNumber)}
                        className="rounded-full bg-white/10 p-2 text-white/70 transition hover:bg-white/20"
                        aria-label="Copy account number"
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
                      <span>{userProfile.phone} travelvn</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(`${userProfile.phone} travelvn`)}
                        className="rounded-full bg-white/10 p-2 text-white/70 transition hover:bg-white/20"
                        aria-label="Copy transfer note"
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
                      className="rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-emerald-400"
                    >
                      Xác nhận nạp
                    </button>
                  </div>
                  {depositError && <p className="text-sm text-rose-400">{depositError}</p>}
                  {depositMessage && (
                    <p className="text-sm text-emerald-400">{depositMessage}</p>
                  )}
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
                        const created = new Date(request.createdAt).toLocaleString("vi-VN");
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
                                {request.processedAt && (
                                  <p className="mt-1 text-xs text-white/50">
                                    Xử lý:{" "}
                                    {new Date(request.processedAt).toLocaleString("vi-VN")}
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

              <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-lg font-semibold text-white">Lưu ý quan trọng</h2>
                <ul className="space-y-3 text-sm text-white/70">
                  <li>
                    • Thời gian xử lý nạp tiền: 5-10 phút trong giờ hành chính, tối đa 2
                    giờ ngoài giờ.
                  </li>
                  <li>
                    • Nội dung chuyển khoản phải ghi đúng số điện thoại đã đăng ký để hệ
                    thống tự động cộng tiền.
                  </li>
                  <li>
                    • Liên hệ trợ lý Travel VN qua hotline 1900 636 545 khi cần hỗ trợ.
                  </li>
                  <li>
                    • Số dư đóng băng là khoản tạm giữ cho các dịch vụ đang xử lý.
                  </li>
                </ul>
                <div className="rounded-2xl bg-white/10 p-4 text-xs text-white/60">
                  <p>Mọi giao dịch nạp tiền được ghi nhận trên hệ thống Travel VN.</p>
                  <p className="mt-2">
                    Chúng tôi cam kết bảo mật thông tin cá nhân và chỉ sử dụng nhằm phục vụ
                    hành trình của bạn.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-950">
        <div className="mx-auto max-w-6xl px-6 pb-20">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Đặt tour nhanh</h2>
                <span className="text-sm text-white/60">
                  Số dư khả dụng:{" "}
                  <span className="font-semibold text-emerald-400">
                    {formatCurrency(balance)}
                  </span>
                </span>
              </div>
              <p className="mt-2 text-sm text-white/60">
                Chọn tour muốn đặt, hệ thống sẽ tự động trừ tiền từ số dư của bạn và lưu
                vào lịch sử.
              </p>

              <div className="mt-6 space-y-4">
                {tourCatalog.map((tour) => (
                  <div
                    key={tour.id}
                    className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-white">{tour.name}</h3>
                      <p className="text-sm text-white/70">Thời gian: {tour.duration}</p>
                      <p className="text-sm font-semibold text-emerald-400">
                        {formatCurrency(tour.price)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => bookTour(tour.id)}
                      className="rounded-full bg-emerald-500 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-emerald-400"
                    >
                      Đặt tour ngay
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Đặt phòng nhanh</h2>
                <span className="text-sm text-white/60">
                  Số dư khả dụng:{" "}
                  <span className="font-semibold text-emerald-400">
                    {formatCurrency(balance)}
                  </span>
                </span>
              </div>
              <p className="mt-2 text-sm text-white/60">
                Lựa chọn nơi lưu trú yêu thích, chi phí sẽ khấu trừ trực tiếp từ số dư Travel
                Wallet.
              </p>

              <div className="mt-6 space-y-4">
                {stayCatalog.map((stay) => (
                  <div
                    key={stay.id}
                    className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-white">{stay.name}</h3>
                      <p className="text-sm text-white/70">Số đêm: {stay.nights}</p>
                      <p className="text-sm font-semibold text-emerald-400">
                        {formatCurrency(stay.price)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => bookStay(stay.id)}
                      className="rounded-full bg-emerald-500 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-emerald-400"
                    >
                      Đặt phòng ngay
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {(bookingMessage || bookingError) && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
              {bookingMessage && (
                <p className="text-emerald-400">{bookingMessage}</p>
              )}
              {bookingError && <p className="text-rose-400">{bookingError}</p>}
            </div>
          )}

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Lịch sử đặt tour</h2>
                <span className="text-xs uppercase tracking-[0.3em] text-white/50">
                  Cập nhật liên tục
                </span>
              </div>
              <div className="mt-4 space-y-4 text-sm">
                {tourHistory.length === 0 ? (
                  <p className="rounded-2xl bg-white/5 p-4 text-white/60">
                    Bạn chưa có tour nào. Hãy khám phá những hành trình mới và đặt tour để
                    trải nghiệm cùng Travel VN.
                  </p>
                ) : (
                  tourHistory.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white">{item.name}</h3>
                        <span
                          className={`text-xs font-semibold uppercase ${
                            item.status === "completed"
                              ? "text-emerald-400"
                              : "text-amber-400"
                          }`}
                        >
                          {item.status === "completed" ? "Đã hoàn tất" : "Chờ xác nhận"}
                        </span>
                      </div>
                      <p className="mt-1 text-white/60">
                        Ngày đặt: {new Date(item.date).toLocaleDateString("vi-VN")}
                      </p>
                      <p className="text-white/60">Mã tham chiếu: {item.reference}</p>
                      <p className="mt-2 font-semibold text-emerald-400">
                        {formatCurrency(item.amount)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Lịch sử đặt phòng</h2>
                <span className="text-xs uppercase tracking-[0.3em] text-white/50">
                  Cập nhật liên tục
                </span>
              </div>
              <div className="mt-4 space-y-4 text-sm">
                {stayHistory.length === 0 ? (
                  <p className="rounded-2xl bg-white/5 p-4 text-white/60">
                    Bạn chưa đặt phòng nào. Hãy chọn trải nghiệm lưu trú yêu thích để bắt
                    đầu hành trình.
                  </p>
                ) : (
                  stayHistory.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white">{item.name}</h3>
                        <span
                          className={`text-xs font-semibold uppercase ${
                            item.status === "completed"
                              ? "text-emerald-400"
                              : "text-amber-400"
                          }`}
                        >
                          {item.status === "completed" ? "Đã xác nhận" : "Chờ xác nhận"}
                        </span>
                      </div>
                      <p className="mt-1 text-white/60">
                        Ngày đặt: {new Date(item.date).toLocaleDateString("vi-VN")}
                      </p>
                      <p className="text-white/60">Mã tham chiếu: {item.reference}</p>
                      <p className="mt-2 font-semibold text-emerald-400">
                        {formatCurrency(item.amount)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
