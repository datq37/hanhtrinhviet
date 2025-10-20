"use client";
import { AnimatePresence, motion } from "framer-motion";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { supabase, profile } = useSupabase();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsSigningOut(true);
      if (!supabase) {
        console.error("Supabase client không khả dụng, không thể đăng xuất.");
        return;
      }
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

  const isDarkVariant = variant === "translucent" || variant === "dark";
  const toggleMobileMenu = () => setIsMobileMenuOpen((previous) => !previous);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

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
  const mobileActionButtonClass = `${actionButtonClass} w-full`;
  const mobileNavItemClass = isDarkVariant
    ? "block rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-white/10"
    : "block rounded-2xl bg-slate-900/5 px-4 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-slate-900 transition hover:bg-slate-900/10";
  const mobileMenuContainerClass = isDarkVariant
    ? "border-white/10 bg-slate-900/95 text-white"
    : "border-slate-200 bg-white text-slate-900 shadow-lg";
  const mobileMenuButtonClass = isDarkVariant
    ? "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
    : "inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 transition hover:bg-slate-100";

  const handleAuthClick = (mode: "login" | "register") => {
    closeMobileMenu();
    if (mode === "login") {
      setIsLoginOpen(true);
    } else {
      setIsRegisterOpen(true);
    }
  };

  const handleLogoutClick = () => {
    closeMobileMenu();
    void handleLogout();
  };

  const primaryNavLinks = [
    { href: "/dat-tour", label: "Đặt Tour" },
    { href: "/di-chuyen", label: "Di Chuyển" },
    { href: "/luu-tru", label: "Lưu Trú" },
  ];
  const managementLink = profile
    ? {
        href: profile.role === "admin" ? "/quan-tri" : "/tai-khoan",
        label: profile.role === "admin" ? "Quản Trị" : "Tài Khoản",
      }
    : null;

  return (
    <>
      <div className={`relative z-50 ${containerClasses}`}>
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-5 sm:px-6 lg:gap-10 lg:px-16">
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
                  className={`whitespace-nowrap text-xl font-bold ${
                    variant === "translucent" || variant === "dark"
                      ? "text-white"
                      : "text-slate-900"
                  }`}
                >
                  HÀNH TRÌNH VIỆT
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
                    className={`whitespace-nowrap text-xl font-bold ${
                      variant === "translucent" || variant === "dark"
                        ? "text-white"
                        : "text-slate-900"
                    }`}
                  >
                    HÀNH TRÌNH VIỆT
                  </motion.span>
                </motion.div>
              </Link>
            )}
          </div>

          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="hidden flex-1 items-center justify-center lg:flex"
          >
            <div className="flex items-center gap-8 lg:gap-12">
              {renderAboutLink()}
              {primaryNavLinks.map(({ href, label }) => (
                <Link key={href} href={href} className={navClass(variant)}>
                  {label}
                </Link>
              ))}
              {managementLink ? (
                <Link href={managementLink.href} className={navClass(variant)}>
                  {managementLink.label}
                </Link>
              ) : null}
            </div>
          </motion.nav>

          <div className="flex flex-1 items-center justify-end gap-2">
            <div className="hidden items-center gap-2 lg:flex">
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

            <button
              type="button"
              onClick={toggleMobileMenu}
              aria-expanded={isMobileMenuOpen}
              aria-controls="main-header-mobile-menu"
              className={`lg:hidden ${mobileMenuButtonClass}`}
            >
              {isMobileMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
              <span className="sr-only">Toggle navigation</span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen ? (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden"
            >
              <div
                id="main-header-mobile-menu"
                className={`border-t px-4 pb-6 pt-6 sm:px-6 ${mobileMenuContainerClass}`}
              >
                <div className="mx-auto flex max-w-6xl flex-col gap-4">
                  {onAboutClick ? (
                    <button
                      type="button"
                      onClick={() => {
                        onAboutClick();
                        closeMobileMenu();
                      }}
                      className={mobileNavItemClass}
                    >
                      Về Chúng Tôi
                    </button>
                  ) : (
                    <Link
                      href="/#about"
                      onClick={closeMobileMenu}
                      className={mobileNavItemClass}
                    >
                      Về Chúng Tôi
                    </Link>
                  )}

                  {primaryNavLinks.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={closeMobileMenu}
                      className={mobileNavItemClass}
                    >
                      {label}
                    </Link>
                  ))}

                  {managementLink ? (
                    <Link
                      href={managementLink.href}
                      onClick={closeMobileMenu}
                      className={mobileNavItemClass}
                    >
                      {managementLink.label}
                    </Link>
                  ) : null}
                </div>

                <div className="mx-auto mt-6 max-w-6xl space-y-3">
                  {profile ? (
                    <>
                      <Link
                        href={profile.role === "admin" ? "/quan-tri" : "/tai-khoan"}
                        onClick={closeMobileMenu}
                        className={mobileActionButtonClass}
                      >
                        {profile.role === "admin"
                          ? "Quản Trị"
                          : profile.full_name?.split(" ").slice(-1).join(" ") || "Tài khoản"}
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogoutClick}
                        className={`${mobileActionButtonClass} ${isSigningOut ? "opacity-60" : ""}`}
                        disabled={isSigningOut}
                      >
                        {isSigningOut ? "Đang thoát..." : "Đăng Xuất"}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleAuthClick("login")}
                        className={mobileActionButtonClass}
                      >
                        Đăng Nhập
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAuthClick("register")}
                        className={mobileActionButtonClass}
                      >
                        Đăng Ký
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
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
