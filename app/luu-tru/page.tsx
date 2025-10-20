"use client";

import { useCallback, useState } from "react";
import MainHeader from "../components/MainHeader";
import Accommodation, { StayOption } from "../sections/Accommodation";
import Footer from "../sections/Footer";
import { useSupabase } from "../context/SupabaseContext";

type BookingStatus =
  | { status: "idle"; message: ""; activeId: string | null }
  | { status: "loading"; message: ""; activeId: string | null }
  | { status: "success" | "error"; message: string; activeId: string | null };

export default function AccommodationPage() {
  const { profile, supabase, refreshProfile } = useSupabase();
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>({
    status: "idle",
    message: "",
    activeId: null,
  });

  const handleBookStay = useCallback(
    async (stay: StayOption) => {
      if (!profile?.id) {
        setBookingStatus({
          status: "error",
          message: "Vui lòng đăng nhập để đặt phòng.",
          activeId: stay.id,
        });
        return;
      }

      if (!stay.bookingSlug) {
        setBookingStatus({
          status: "error",
          message: "Lưu trú này chưa hỗ trợ đặt trực tuyến. Vui lòng liên hệ concierge.",
          activeId: stay.id,
        });
        return;
      }

      setBookingStatus({
        status: "loading",
        message: "",
        activeId: stay.id,
      });

      try {
        if (!supabase) {
          throw new Error("Supabase client không khả dụng. Vui lòng tải lại trang.");
        }
        const { error } = await supabase.rpc("create_stay_booking", {
          p_profile_id: profile.id,
          p_stay_slug: stay.bookingSlug,
        });

        if (error) throw error;

        setBookingStatus({
          status: "success",
          message: `Đặt phòng "${stay.name}" thành công! Concierge sẽ liên hệ xác nhận chi tiết.`,
          activeId: stay.id,
        });
        await refreshProfile();
      } catch (error) {
        console.error("Không thể đặt lưu trú:", error);
        const message =
          error instanceof Error && error.message.includes("Insufficient balance")
            ? "Số dư ví chưa đủ để đặt phòng. Vui lòng nạp thêm."
            : error instanceof Error
            ? error.message
            : "Không thể đặt phòng. Vui lòng thử lại.";
        setBookingStatus({
          status: "error",
          message,
          activeId: stay.id,
        });
      }
    },
    [profile?.id, refreshProfile, supabase],
  );

  const clearBookingStatus = useCallback(() => {
    setBookingStatus((prev) =>
      prev.status === "idle"
        ? prev
        : {
            status: "idle",
            message: "",
            activeId: null,
          },
    );
  }, []);

  return (
    <main className="bg-white">
      <MainHeader variant="dark" />
      <Accommodation
        onBookStay={handleBookStay}
        bookingState={{
          isLoading: bookingStatus.status === "loading",
          successMessage:
            bookingStatus.status === "success" ? bookingStatus.message : null,
          errorMessage:
            bookingStatus.status === "error" ? bookingStatus.message : null,
          activeStayId: bookingStatus.activeId,
        }}
        onDismissFeedback={clearBookingStatus}
      />
      <Footer />
    </main>
  );
}
