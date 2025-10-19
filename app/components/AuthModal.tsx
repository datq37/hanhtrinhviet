"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

type AuthMode = "login" | "register";

interface AuthModalProps {
  isOpen: boolean;
  mode: AuthMode;
  onClose: () => void;
}

interface FormState {
  fullName?: string;
  email: string;
  phone?: string;
  password: string;
}

export default function AuthModal({ isOpen, mode, onClose }: AuthModalProps) {
  const [formState, setFormState] = useState<FormState>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const resetForm = () => {
    setFormState({
      fullName: "",
      email: "",
      phone: "",
      password: "",
    });
    setIsSubmitting(false);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setShowSuccess(false);
      resetForm();
    }, 300);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      const trimmedEmail = formState.email.trim();
      const normalizedEmail = trimmedEmail.toLowerCase();
      const isAdminCredentials =
        mode === "login" &&
        normalizedEmail === "admin@travelvn.vn" &&
        formState.password === "admin123";

      const userData = {
        name: isAdminCredentials
          ? "Quản trị viên Travel VN"
          : mode === "register"
          ? formState.fullName?.trim() || "Thành viên Travel VN"
          : formState.email?.split("@")[0] || "Thành viên Travel VN",
        email: trimmedEmail,
        phone: isAdminCredentials
          ? ""
          : formState.phone?.trim() ||
            localStorage.getItem("travelvn-last-phone") ||
            "",
        role: isAdminCredentials ? "admin" : "user",
      };

      if (userData.phone) {
        localStorage.setItem("travelvn-last-phone", userData.phone);
      }

      localStorage.setItem("travelvn-user", JSON.stringify(userData));
      window.dispatchEvent(new Event("travelvn-auth-change"));
    } catch (error) {
      console.error("Không thể lưu thông tin đăng nhập:", error);
    }
    setShowSuccess(true);

    setTimeout(() => {
      handleClose();
      if (mode === "login" || mode === "register") {
        const stored = localStorage.getItem("travelvn-user");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            const target =
              parsed.role === "admin" ? "/quan-tri" : "/tai-khoan";
            window.location.href = target;
            return;
          } catch {
            /* ignore parsing errors and fall through */
          }
        }
        window.location.href = "/tai-khoan";
      }
    }, 1200);
  };

  if (!isOpen) return null;

  const title =
    mode === "login" ? "Đăng nhập tài khoản" : "Tạo tài khoản thành viên";
  const description =
    mode === "login"
      ? "Truy cập lịch sử đặt tour, lưu lại hành trình yêu thích và quản lý thông tin cá nhân."
      : "Đăng ký để nhận ưu đãi riêng, quản lý đặt tour và lưu trữ những điểm đến bạn yêu thích.";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
          onClick={(event) => event.stopPropagation()}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
        >
          <button
            onClick={handleClose}
            className="absolute right-6 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-gray-600 transition hover:bg-black/10"
            aria-label="Đóng"
          >
            <svg
              className="h-5 w-5"
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

          <div className="bg-gradient-to-br from-[#00C951] via-[#00af4d] to-[#00863e] px-10 pb-16 pt-12 text-white">
            <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs uppercase tracking-[0.3em]">
              Travel VN
            </span>
            <h2 className="mt-5 text-3xl font-semibold leading-tight">{title}</h2>
            <p className="mt-4 text-sm text-white/80">{description}</p>
          </div>

          {showSuccess ? (
            <div className="space-y-4 px-10 pb-12 pt-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#00C951]/10 text-[#00C951]">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900">
                {mode === "login"
                  ? "Đăng nhập thành công!"
                  : "Đã tạo tài khoản!"}
              </h3>
              <p className="text-gray-600">
                {mode === "login"
                  ? "Chúng tôi đang chuyển bạn đến trang quản lý hành trình."
                  : "Chúng tôi đã ghi nhận thông tin, đội ngũ hỗ trợ sẽ liên hệ khi cần."}
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-6 px-10 pb-12 pt-10"
            >
              {mode === "register" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.fullName}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        fullName: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 transition focus:border-[#00C951] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00C951]/20"
                    placeholder="Nhập họ tên của bạn"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formState.email}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 transition focus:border-[#00C951] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00C951]/20"
                  placeholder="name@example.com"
                />
              </div>

              {mode === "register" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    required
                    value={formState.phone}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        phone: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 transition focus:border-[#00C951] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00C951]/20"
                    placeholder="Ví dụ: 0989 888 999"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  required
                  value={formState.password}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 transition focus:border-[#00C951] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00C951]/20"
                  placeholder="Nhập mật khẩu"
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-[#00C951] px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg shadow-[#00C951]/20 transition hover:bg-[#00b347] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting
                  ? "Đang xử lý..."
                  : mode === "login"
                  ? "Đăng nhập"
                  : "Đăng ký"}
              </button>

              <p className="text-center text-xs text-gray-500">
                Khi tiếp tục, bạn đồng ý với các điều khoản sử dụng và chính
                sách bảo mật của Travel VN.
              </p>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
