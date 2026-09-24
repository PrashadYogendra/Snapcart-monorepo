"use client";

import { Leaf, ShoppingBasket, Smartphone, Truck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import Image from "next/image";

function HeroSection() {

  const slides = [
    {
      id: 1,
      icon: (
        <Leaf className="w-20 h-20 sm:w-28 text-green-400 drop-shadow-lg" />
      ),
      title: "Fresh Organic Groceries",
      subtitle:
        "Farm-fresh fruits, vegetables, and daily essentials delivered to your doorstep.",
      btnText: "Shop Now",
      bg: "https://plus.unsplash.com/premium_photo-1663012860167-220d9d9c8aca?q=80&w=1170&auto=format&fit=crop",
    },
    {
      id: 2,
      icon: (
        <Truck className="w-20 h-20 sm:w-28 text-yellow-400 drop-shadow-lg" />
      ),
      title: "Fast & Reliable Delivery",
      subtitle: "We ensure your groceries reach your doorstep in no time.",
      btnText: "Order Now",
      bg: "https://images.unsplash.com/photo-1695654390723-479197a8c4a3?q=80&w=1134&auto=format&fit=crop",
    },
    {
      id: 3,
      icon: (
        <Smartphone className="w-20 h-20 sm:w-28 text-blue-400 drop-shadow-lg" />
      ),
      title: "Shop Anytime, Anywhere",
      subtitle: "Easy and seamless online grocery shopping experience.",
      btnText: "Get Started",
      bg: "https://plus.unsplash.com/premium_photo-1726869818459-061e0986c1a1?q=80&w=1160&auto=format&fit=crop",
    },
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative w-[98%] mx-auto mt-32 h-[80vh] rounded-3xl overflow-hidden shadow-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={slides[current].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <Image
            src={slides[current].bg}
            alt={slides[current].title}
            fill
            priority
            className="object-cover"
          />

          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-white">
        <motion.div
          key={slides[current].id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex max-w-3xl flex-col items-center gap-6"
        >
          <div className="rounded-full bg-white/10 p-6 backdrop-blur-md shadow-lg">
            {slides[current].icon}
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight drop-shadow-lg sm:text-5xl md:text-6xl">
            {slides[current].title}
          </h1>

          <p className="max-w-2xl text-lg text-gray-200 sm:text-xl">
            {slides[current].subtitle}
          </p>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 flex items-center gap-2 rounded-full bg-white px-8 py-3 font-semibold text-green-700 shadow-lg transition hover:bg-green-100"
          >
            <ShoppingBasket className="h-5 w-5" />
            {slides[current].btnText}
          </motion.button>
        </motion.div>
      </div>

      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-3">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => setCurrent(index)}
            className={`h-3 rounded-full transition-all ${
              current === index ? "w-6 bg-white" : "w-3 bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default HeroSection;
