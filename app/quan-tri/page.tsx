"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import MainHeader from "../components/MainHeader";
import Footer from "../sections/Footer";
import { useSupabase } from "../context/SupabaseContext";

interface DepositRequest {
  id: number;
  profile_id: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  processed_at: string | null;
  profiles?: {
    full_name: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
}

type DepositRequestRow = {
  id: number;
  profile_id: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  processed_at: string | null;
  profiles: { full_name: string | null; phone: string | null }[] | null;
};

const formatCurrency = (value: number) => `${value.toLocaleString("vi-VN")}₫`;

export default function AdminDashboardPage() {
  const router = useRouter();
  const { profile, supabase, loading: authLoading } = useSupabase();
  const [requests, setRequests] = useState<DepositRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!supabase) {
        throw new Error("Supabase client không khả dụng. Vui lòng tải lại trang.");
      }
      const { data, error } = await supabase
        .from("deposit_requests")
        .select(
          "id, profile_id, amount, status, created_at, processed_at, profiles!deposit_requests_profile_id_fkey(full_name, phone)",
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      const normalized: DepositRequest[] = ((data ?? []) as DepositRequestRow[]).map((item) => ({
        id: item.id,
        profile_id: item.profile_id,
        amount: item.amount,
        status: item.status,
        created_at: item.created_at,
        processed_at: item.processed_at,
        profiles: Array.isArray(item.profiles)
          ? item.profiles[0] ?? null
          : (item.profiles as DepositRequest["profiles"]),
      }));
      setRequests(normalized);
    } catch (error) {
      console.error("Không thể tải danh sách yêu cầu nạp tiền:", error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (authLoading) return;
    if (!profile) {
      router.replace("/");
      return;
    }
    if (profile.role !== "admin") {
      router.replace("/");
      return;
    }

    loadRequests();
  }, [authLoading, profile, router, loadRequests]);

  const pendingRequests = useMemo(
    () => requests.filter((request) => request.status === "pending"),
    [requests],
  );

  const approvedAmount = useMemo(
    () =>
      requests
        .filter((request) => request.status === "approved")
        .reduce((sum, req) => sum + req.amount, 0),
    [requests],
  );

  const handleAction = async (requestId: number, action: "approve" | "reject") => {
    setProcessingId(requestId);
    try {
      if (!supabase) {
        throw new Error("Supabase client không khả dụng. Vui lòng tải lại trang.");
      }
      const procedure = action === "approve" ? "approve_deposit_request" : "reject_deposit_request";
      const { error } = await supabase.rpc(procedure, {
        p_request_id: requestId,
      });

      if (error) throw error;
      await loadRequests();
    } catch (error) {
      console.error("Không thể cập nhật yêu cầu nạp tiền:", error);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <MainHeader variant="solid" />
      <section className="mt-24 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-col gap-8 rounded-3xl border border-white/10 bg-slate-900/60 p-10 shadow-2xl backdrop-blur">
            <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-emerald-400">HÀNH TRÌNH VIỆT Admin</p>
                <h1 className="mt-3 text-3xl font-semibold">Bảng điều khiển quản trị</h1>
                <p className="mt-2 text-sm text-white/70">
                  Xin chào, {profile?.full_name ?? "Quản trị viên"}. Quản lý yêu cầu nạp tiền và theo dõi giao dịch của khách hàng.
                </p>
              </div>
              <div className="grid gap-4 text-sm text-white/80 md:grid-cols-3">
                <div className="rounded-2xl bg-white/10 px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">Yêu cầu chờ duyệt</p>
                  <p className="mt-2 text-2xl font-bold text-amber-300">{pendingRequests.length}</p>
                </div>
                <div className="rounded-2xl bg-white/10 px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">Tổng yêu cầu</p>
                  <p className="mt-2 text-2xl font-bold text-white">{requests.length}</p>
                </div>
                <div className="rounded-2xl bg-white/10 px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">Đã cộng cho khách</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-300">{formatCurrency(approvedAmount)}</p>
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
              {isLoading ? (
                <div className="px-6 py-12 text-center text-sm text-white/60">Đang tải dữ liệu...</div>
              ) : requests.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-white/60">
                  Hiện chưa có yêu cầu nạp tiền nào. Khi khách hàng gửi yêu cầu, hệ thống sẽ hiển thị tại đây.
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {requests.map((request) => {
                    const createdAt = new Date(request.created_at).toLocaleString("vi-VN");
                    const processedAt = request.processed_at
                      ? new Date(request.processed_at).toLocaleString("vi-VN")
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
                            {request.profiles?.full_name ?? "Khách hàng"}
                          </p>
                          <p className="mt-1 text-sm text-white/70">
                            Số tiền: {formatCurrency(request.amount)}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.3em] text-white/50">{createdAt}</p>
                          {processedAt && (
                            <p className="mt-1 text-xs text-white/50">Xử lý: {processedAt}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-start gap-3 md:items-end">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${statusColor}`}
                          >
                            {statusLabel}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleAction(request.id, "approve")}
                              disabled={request.status !== "pending" || processingId === request.id}
                              className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
                            >
                              {processingId === request.id && request.status === "pending"
                                ? "Đang cộng..."
                                : "Cộng tiền"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAction(request.id, "reject")}
                              disabled={request.status !== "pending" || processingId === request.id}
                              className="rounded-full bg-rose-500/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
                            >
                              {processingId === request.id && request.status === "pending"
                                ? "Đang từ chối..."
                                : "Từ chối"}
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
