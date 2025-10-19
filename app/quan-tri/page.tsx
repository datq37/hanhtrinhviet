"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import MainHeader from "../components/MainHeader";
import Footer from "../sections/Footer";

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

const DEPOSIT_STORAGE_KEY = "travelvn-deposit-requests";

export default function AdminDashboardPage() {
  const [requests, setRequests] = useState<DepositRequest[]>([]);
  const [adminName, setAdminName] = useState("Quản trị viên Travel VN");

  const loadRequests = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(DEPOSIT_STORAGE_KEY);
      if (!stored) {
        setRequests([]);
        return;
      }
      const parsed: DepositRequest[] = JSON.parse(stored);
      const sorted = parsed.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setRequests(sorted);
    } catch {
      setRequests([]);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedUser = localStorage.getItem("travelvn-user");
    if (!storedUser) {
      window.location.href = "/";
      return;
    }
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed.role !== "admin") {
        window.location.href = "/";
        return;
      }
      setAdminName(parsed.name || "Quản trị viên Travel VN");
      loadRequests();
    } catch {
      window.location.href = "/";
    }
  }, [loadRequests]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleSync = () => loadRequests();
    window.addEventListener("travelvn-deposit-change", handleSync);
    return () => window.removeEventListener("travelvn-deposit-change", handleSync);
  }, [loadRequests]);

  const pendingRequests = useMemo(
    () => requests.filter((request) => request.status === "pending"),
    [requests],
  );
  const approvedAmount = useMemo(
    () =>
      requests
        .filter((request) => request.status === "approved")
        .reduce((total, request) => total + request.amount, 0),
    [requests],
  );

  const updateRequestStatus = useCallback(
    (requestId: string, status: "approved" | "rejected") => {
      if (typeof window === "undefined") return;
      try {
        const stored = localStorage.getItem(DEPOSIT_STORAGE_KEY);
        const parsed: DepositRequest[] = stored ? JSON.parse(stored) : [];
        let balanceUpdated = false;
        const updated = parsed.map((request) => {
          if (request.id !== requestId) return request;
          if (request.status !== "pending") return request;
          const next: DepositRequest = {
            ...request,
            status,
            processedAt: new Date().toISOString(),
          };
          if (status === "approved" && !balanceUpdated) {
            const balanceKey = `travelvn-wallet-${request.email}`;
            const currentBalance = Number(localStorage.getItem(balanceKey));
            const safeBalance =
              Number.isFinite(currentBalance) && currentBalance >= 0
                ? currentBalance
                : 0;
            const finalBalance = safeBalance + request.amount;
            localStorage.setItem(balanceKey, finalBalance.toString());
            balanceUpdated = true;
          }
          return next;
        });
        localStorage.setItem(DEPOSIT_STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event("travelvn-deposit-change"));
        setRequests(updated);
      } catch {
        /* ignore update errors */
      }
    },
    [],
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <MainHeader variant="solid" />
      <section className="mt-24 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-col gap-8 rounded-3xl border border-white/10 bg-slate-900/60 p-10 shadow-2xl backdrop-blur">
            <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-emerald-400">
                  Travel VN Admin
                </p>
                <h1 className="mt-3 text-3xl font-semibold">
                  Bảng điều khiển quản trị
                </h1>
                <p className="mt-2 text-sm text-white/70">
                  Xin chào, {adminName}. Quản lý yêu cầu nạp tiền và theo dõi giao dịch của khách hàng.
                </p>
              </div>
              <div className="grid gap-4 text-sm text-white/80 md:grid-cols-3">
                <div className="rounded-2xl bg-white/10 px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                    Yêu cầu chờ duyệt
                  </p>
                  <p className="mt-2 text-2xl font-bold text-amber-300">
                    {pendingRequests.length}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                    Tổng yêu cầu
                  </p>
                  <p className="mt-2 text-2xl font-bold text-white">
                    {requests.length}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                    Đã cộng cho khách
                  </p>
                  <p className="mt-2 text-2xl font-bold text-emerald-300">
                    {formatCurrency(approvedAmount)}
                  </p>
                </div>
              </div>
            </header>

            <div className="rounded-3xl border border-white/10 bg-white/5">
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <h2 className="text-lg font-semibold">Yêu cầu nạp tiền</h2>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/60">
                  Cập nhật theo thời gian thực
                </span>
              </div>
              {requests.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-white/60">
                  Hiện chưa có yêu cầu nạp tiền nào. Hệ thống sẽ hiển thị tại đây ngay khi khách hàng gửi yêu cầu.
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {requests.map((request) => {
                    const createdAt = new Date(request.createdAt).toLocaleString(
                      "vi-VN",
                    );
                    const processedAt = request.processedAt
                      ? new Date(request.processedAt).toLocaleString("vi-VN")
                      : null;
                    const statusColor =
                      request.status === "pending"
                        ? "text-amber-300 bg-amber-500/10"
                        : request.status === "approved"
                        ? "text-emerald-300 bg-emerald-500/10"
                        : "text-rose-300 bg-rose-500/10";
                    const statusLabel =
                      request.status === "pending"
                        ? "Đang chờ duyệt"
                        : request.status === "approved"
                        ? "Đã cộng tiền"
                        : "Đã từ chối";
                    return (
                      <div
                        key={request.id}
                        className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <p className="text-base font-semibold text-white">
                            {request.name}
                          </p>
                          <p className="mt-1 text-sm text-white/70">
                            {request.email}
                          </p>
                          <p className="mt-2 text-xs uppercase tracking-[0.3em] text-white/50">
                            {createdAt}
                          </p>
                          {processedAt && (
                            <p className="mt-1 text-xs text-white/50">
                              Xử lý: {processedAt}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-start gap-3 md:items-end">
                          <p className="text-xl font-semibold text-emerald-300">
                            {formatCurrency(request.amount)}
                          </p>
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${statusColor}`}
                          >
                            {statusLabel}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => updateRequestStatus(request.id, "approved")}
                              disabled={request.status !== "pending"}
                              className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
                            >
                              Cộng tiền
                            </button>
                            <button
                              type="button"
                              onClick={() => updateRequestStatus(request.id, "rejected")}
                              disabled={request.status !== "pending"}
                              className="rounded-full bg-rose-500/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
                            >
                              Từ chối
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
