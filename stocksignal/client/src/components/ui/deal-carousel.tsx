"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface Deal {
  id: string;
  label: string;
  image: string;
  description: string;
  badge: string;
  isBuy: boolean;
}

interface DealCarouselProps {
  deals: Deal[];
  accentColor?: string;
}

const AUTO_PLAY_INTERVAL = 3500;
const ITEM_HEIGHT = 60;

const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

export function DealCarousel({ deals, accentColor = "#0F172A" }: DealCarouselProps) {
  const [step, setStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const currentIndex = ((step % deals.length) + deals.length) % deals.length;

  const nextStep = useCallback(() => setStep((p) => p + 1), []);

  const handleClick = (index: number) => {
    const diff = (index - currentIndex + deals.length) % deals.length;
    if (diff > 0) setStep((s) => s + diff);
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextStep, AUTO_PLAY_INTERVAL);
    return () => clearInterval(interval);
  }, [nextStep, isPaused]);

  const getCardStatus = (index: number) => {
    const diff = index - currentIndex;
    const len = deals.length;
    let nd = diff;
    if (diff > len / 2) nd -= len;
    if (diff < -len / 2) nd += len;
    if (nd === 0) return "active";
    if (nd === -1) return "prev";
    if (nd === 1) return "next";
    return "hidden";
  };

  if (deals.length === 0) return null;

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="relative overflow-hidden rounded-[2rem] flex flex-col lg:flex-row min-h-[550px] border border-border/40 bg-white shadow-sm">
        {/* Left — Deal List */}
        <div
          className="w-full lg:w-[40%] min-h-[350px] lg:min-h-[550px] relative z-30 flex flex-col items-start justify-center overflow-hidden px-8 lg:pl-12 bg-white border-r border-border/20"
        >
          <div className="absolute inset-x-0 top-0 h-16 z-40 bg-gradient-to-b from-white via-white/80 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-16 z-40 bg-gradient-to-t from-white via-white/80 to-transparent" />
          <div className="relative w-full h-full flex items-center justify-center lg:justify-start z-20">
            {deals.map((deal, index) => {
              const isActive = index === currentIndex;
              const distance = index - currentIndex;
              const wd = wrap(-(deals.length / 2), deals.length / 2, distance);
              return (
                <motion.div
                  key={deal.id}
                  style={{ height: ITEM_HEIGHT, width: "fit-content" }}
                  animate={{ y: wd * ITEM_HEIGHT, opacity: 1 - Math.abs(wd) * 0.25 }}
                  transition={{ type: "spring", stiffness: 90, damping: 22, mass: 1 }}
                  className="absolute flex items-center"
                >
                  <button
                    onClick={() => handleClick(index)}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    className={cn(
                      "relative flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-700 text-left border",
                      isActive
                        ? "bg-primary text-white border-primary z-10 shadow-md"
                        : "bg-transparent text-foreground/50 border-border hover:border-foreground/30 hover:text-foreground"
                    )}
                  >
                    <div className={cn("w-2 h-2 rounded-full shrink-0", deal.isBuy ? "bg-green-400" : "bg-red-400")} />
                    <span className="font-medium text-sm tracking-tight whitespace-nowrap">{deal.label}</span>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right — Card Stack */}
        <div className="flex-1 min-h-[450px] lg:min-h-[550px] relative bg-secondary/20 flex items-center justify-center py-12 px-6 lg:px-10 overflow-hidden">
          <div className="relative w-full max-w-[380px] aspect-[4/5] flex items-center justify-center">
            {deals.map((deal, index) => {
              const status = getCardStatus(index);
              const isActive = status === "active";
              const isPrev = status === "prev";
              const isNext = status === "next";
              return (
                <motion.div
                  key={deal.id}
                  initial={false}
                  animate={{
                    x: isActive ? 0 : isPrev ? -80 : isNext ? 80 : 0,
                    scale: isActive ? 1 : isPrev || isNext ? 0.85 : 0.7,
                    opacity: isActive ? 1 : isPrev || isNext ? 0.4 : 0,
                    rotate: isPrev ? -3 : isNext ? 3 : 0,
                    zIndex: isActive ? 20 : isPrev || isNext ? 10 : 0,
                    pointerEvents: isActive ? ("auto" as const) : ("none" as const),
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 25, mass: 0.8 }}
                  className="absolute inset-0 rounded-[2rem] overflow-hidden border-4 border-background bg-background origin-center"
                >
                  <img
                    src={deal.image}
                    alt={deal.label}
                    className={cn("w-full h-full object-cover transition-all duration-700", isActive ? "grayscale-0 blur-0" : "grayscale blur-[2px] brightness-75")}
                  />
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute inset-x-0 bottom-0 p-8 pt-24 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end"
                      >
                        <div className={cn("px-3 py-1 rounded-full text-[11px] font-medium uppercase tracking-widest w-fit shadow-lg mb-3 border", deal.isBuy ? "bg-green-500 text-white border-green-400" : "bg-red-500 text-white border-red-400")}>
                          {deal.badge}
                        </div>
                        <p className="text-white font-medium text-lg leading-snug drop-shadow-md">{deal.description}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DealCarousel;
