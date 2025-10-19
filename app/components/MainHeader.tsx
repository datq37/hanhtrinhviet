"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import AuthModal from "./AuthModal";
import { useSupabase } from "../context/SupabaseContext";

type HeaderVariant = "translucent" | "solid" | "dark";

interface MainHeaderProps {
  onAboutClick?: () => void;
  onLogoClick?: () => void;
  variant?: HeaderVariant;
}

const navClass = (variant: HeaderVariant) => {
  if (variant === "translucent" || variant === "dark") {
    return "whitespace-nowrap text-sm font-medium uppercase tracking-[0.25em] text-white transition-transform duration-200 hover:scale-105 hover:text-[#00C951]";
  }
  return "whitespace-nowrap text-sm font-medium uppercase tracking-[0.25em] text-slate-800 transition-transform duration-200 hover:scale-105 hover:text-[#00C951]";
};

export default function MainHeader({
  onAboutClick,
  onLogoClick,
  variant = "solid",
}: MainHeaderProps) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const { supabase, profile } = useSupabase();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsSigningOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Không thể đăng xuất:", error);
      }
      window.location.href = "/";
    } catch (error) {
      console.error("Không thể đăng xuất:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const containerClasses = useMemo(() => {
    if (variant === "translucent") {
      return "bg-black/20 backdrop-blur-sm";
    }
    if (variant === "dark") {
      return "bg-slate-900 border-b border-slate-800";
    }
    return "bg-white/90 backdrop-blur-md shadow-lg border-b border-slate-100";
  }, [variant]);

  const renderAboutLink = () => {
    if (onAboutClick) {
      return (
        <button
          onClick={onAboutClick}
          className={navClass(variant)}
          type="button"
        >
          Về Chúng Tôi
        </button>
      );
    }
    return (
      <Link href="/#about" className={navClass(variant)}>
        Về Chúng Tôi
      </Link>
    );
  };
  const actionButtonClass =
    "inline-flex items-center justify-center rounded-full bg-[#00C951] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-white shadow-lg shadow-[#00C951]/20 transition-all duration-300 hover:bg-[#00B347] hover:shadow-xl hover:shadow-[#00C951]/30";

  return (
    <>
      <div className={`relative z-50 ${containerClasses}`}>
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-6 lg:gap-10 lg:px-16">
          <div className="flex flex-1 justify-start">
            {onLogoClick ? (
              <motion.button
                type="button"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                onClick={onLogoClick}
                className="flex items-center space-x-4"
              >
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg shadow-[#00C951]/20">
                  <Image
                    src="/hanhtrinhviet-logo.svg"
                    alt="Hành Trình Việt"
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                    priority
                  />
                </div>
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                className={`text-xl font-bold ${
                  variant === "translucent" || variant === "dark"
                    ? "text-white"
                    : "text-slate-900"
                }`}
                >
                  Travel VN
                </motion.span>
              </motion.button>
            ) : (
              <Link href="/" className="group">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="flex items-center space-x-4"
                >
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg shadow-[#00C951]/20">
                    <Image
                      src="/hanhtrinhviet-logo.svg"
                      alt="Hành Trình Việt"
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                      priority
                    />
                  </div>
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className={`text-xl font-bold ${
                      variant === "translucent" || variant === "dark"
                        ? "text-white"
                        : "text-slate-900"
                    }`}
                  >
                    Travel VN
                  </motion.span>
                </motion.div>
              </Link>
            )}
          </div>

          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-1 items-center justify-center"
          >
            <div className="flex items-center gap-8 lg:gap-12">
              {renderAboutLink()}
              <Link href="/dat-tour" className={navClass(variant)}>
                Đặt Tour
              </Link>
              <Link href="/luu-tru" className={navClass(variant)}>
                Lưu Trú
              </Link>
              {profile?.role === "admin" ? (
                <Link href="/quan-tri" className={navClass(variant)}>
                  Quản Trị
                </Link>
              ) : profile ? (
                <Link href="/tai-khoan" className={navClass(variant)}>
                  Tài Khoản
                </Link>
              ) : null}
            </div>
          </motion.nav>

          <div className="flex flex-1 items-center justify-end gap-2">
            {profile ? (
              <>
                <Link
                  href={profile.role === "admin" ? "/quan-tri" : "/tai-khoan"}
                  className={actionButtonClass}
                >
                  {profile.role === "admin"
                    ? "Quản Trị"
                    : profile.full_name?.split(" ").slice(-1).join(" ") || "Tài khoản"}
                </Link>
                <button
                  onClick={handleLogout}
                  className={`${actionButtonClass} ${isSigningOut ? "opacity-60" : ""}`}
                  type="button"
                  disabled={isSigningOut}
                >
                  {isSigningOut ? "Đang thoát..." : "Đăng Xuất"}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className={actionButtonClass}
                >
                  Đăng Nhập
                </button>
                <button
                  onClick={() => setIsRegisterOpen(true)}
                  className={actionButtonClass}
                  >
                  Đăng Ký
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isLoginOpen}
        mode="login"
        onClose={() => setIsLoginOpen(false)}
      />
      <AuthModal
        isOpen={isRegisterOpen}
        mode="register"
        onClose={() => setIsRegisterOpen(false)}
      />
    </>
  );
}
