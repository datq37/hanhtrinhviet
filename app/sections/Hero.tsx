"use client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import VideoModal from "../components/VideoModal";
import ContactModal from "../components/ContactModal";
import MainHeader from "../components/MainHeader";

const locations = [
  {
    id: 1,
    name: "CỔ ĐÔ HUẾ",
    image: "/home/co-do-hue.avif",
    title: "Cố Đô Huế",
    description:
      "Hành trình khám phá kinh thành xưa với quần thể cung điện, lăng tẩm và dòng Hương thơ mộng.",
    province: "Thừa Thiên Huế",
    videoId: "K1ie-Vgss-Q",
  },
  {
    id: 2,
    name: "BÀ NÀ HILL",
    image: "/home/ba-na-hills.jpg",
    title: "Bà Nà Hill",
    description:
      "Thiên đường nghỉ dưỡng trên đỉnh núi với cây Cầu Vàng nổi tiếng và khí hậu bốn mùa trong một ngày.",
    province: "Đà Nẵng",
    videoId: "BrGe5bz2Duw",
  },
  {
    id: 3,
    name: "QUẢNG BÌNH",
    image: "/home/quangbinh.webp",
    title: "Quảng Bình",
    description:
      "Miền đất di sản với hệ thống hang động kỳ vĩ, bãi biển hoang sơ và trải nghiệm khám phá bất tận.",
    province: "Quảng Bình",
    videoId: "VeP5nxrLXc0",
  },
];

export default function Hero() {
  const [currentLocation, setCurrentLocation] = useState(locations[0]);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState(locations[0].videoId);

  const handleLocationChange = (location: (typeof locations)[0]) => {
    if (location.id === currentLocation.id) return;
    setCurrentLocation(location);
    setCurrentVideoId(location.videoId);
    setIsVideoModalOpen(true);
  };

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <section id="hero" className="relative min-h-screen">
      {/* Main Background Image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentLocation.image}
          className="absolute inset-0 z-0"
        >
          <Image
            src={currentLocation.image}
            alt={currentLocation.title}
            fill
            className="object-cover opacity-90"
            priority
            quality={100}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"
          />
        </motion.div>
      </AnimatePresence>

      <MainHeader
        onAboutClick={() => scrollToSection("about")}
        onLogoClick={() => scrollToSection("hero")}
        variant="translucent"
      />

      {/* Side Navigation - Destinations Preview */}
      <div className="absolute right-0 top-0 bottom-0 w-[350px] bg-gray-900/30 backdrop-blur-sm z-10">
        <div className="h-full flex flex-col justify-center items-center text-white">
          <div className="text-8xl font-bold mb-3">
            {String(
              locations.findIndex((loc) => loc.id === currentLocation.id) + 1,
            ).padStart(2, "0")}
          </div>
          <h3 className="text-2xl font-semibold mb-2">
            {currentLocation.title}
          </h3>
          <p className="text-lg">{currentLocation.province}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-[100px] mt-30">
        <div className="max-w-[600px] text-white">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <AnimatePresence mode="wait">
              <motion.h1
                key={currentLocation.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                }}
                className="text-[120px] font-bold leading-[1.1] tracking-tighter"
              >
                {currentLocation.title.toUpperCase()}
              </motion.h1>
            </AnimatePresence>
            <div className="absolute -bottom-6 right-0 flex flex-col items-end">
              <span className="text-xl font-light">KHÁM PHÁ</span>
            </div>
          </motion.div>

          {/* Journey Path */}
          <motion.div className="mt-32">
            <div className="relative">
              <motion.div
                className="border-b border-dashed border-white/30 absolute w-full top-1/2"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
              <div className="flex justify-between relative max-w-[480px]">
                {locations.map((location) => (
                  <motion.div
                    key={location.id}
                    onClick={() => handleLocationChange(location)}
                    className={`text-center group cursor-pointer transition-all duration-300 ${
                      currentLocation.id === location.id ? "scale-110" : ""
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                        currentLocation.id === location.id
                          ? "bg-[#00C951] w-4 h-4"
                          : "bg-white/50"
                      }`}
                      animate={{
                        scale: currentLocation.id === location.id ? 1.2 : 1,
                        backgroundColor:
                          currentLocation.id === location.id
                            ? "rgb(0, 201, 81)"
                            : "rgba(255, 255, 255, 0.5)",
                      }}
                      transition={{
                        duration: 0.2,
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                    />
                    <motion.p
                      className={`text-sm font-medium ${
                        currentLocation.id === location.id
                          ? "text-[#00C951]"
                          : "text-white/70"
                      }`}
                      animate={{
                        color:
                          currentLocation.id === location.id
                            ? "rgb(0, 201, 81)"
                            : "rgba(255, 255, 255, 0.7)",
                        scale: currentLocation.id === location.id ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {location.name.split(" ").map((word, i) => (
                        <span key={i}>
                          {word}
                          <br />
                        </span>
                      ))}
                    </motion.p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Location Description */}
          <AnimatePresence mode="wait">
            <motion.p
              key={currentLocation.description}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
              }}
              className="mt-10 text-base text-white/80 max-w-[420px]"
            >
              {currentLocation.description}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-10 right-10 z-20 flex items-center space-x-5">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsContactModalOpen(true)}
          className="cursor-pointer w-12 h-12 rounded-full bg-[#00C951]/10 backdrop-blur-sm flex items-center justify-center hover:bg-[#00C951]/20 transition-colors"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setCurrentVideoId(currentLocation.videoId);
            setIsVideoModalOpen(true);
          }}
          className="cursor-pointer w-12 h-12 rounded-full bg-[#00C951]/10 backdrop-blur-sm flex items-center justify-center hover:bg-[#00C951]/20 transition-colors"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </motion.button>
      </div>

      {/* Video Modal */}
      <VideoModal
        key={currentVideoId}
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoId={currentVideoId}
      />

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        currentLocation={currentLocation.title}
      />
    </section>
  );
}
