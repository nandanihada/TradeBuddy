"use client";
import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface Testimonial {
  quote: string;
  name: string;
  designation: string;
  src: string;
}

interface CircularTestimonialsProps {
  testimonials: Testimonial[];
  autoplay?: boolean;
  colors?: { name?: string; designation?: string; testimony?: string; arrowBackground?: string; arrowForeground?: string; arrowHoverBackground?: string };
  fontSizes?: { name?: string; designation?: string; quote?: string };
}

function calculateGap(width: number) {
  const minWidth = 1024, maxWidth = 1456, minGap = 60, maxGap = 86;
  if (width <= minWidth) return minGap;
  if (width >= maxWidth) return Math.max(minGap, maxGap + 0.06018 * (width - maxWidth));
  return minGap + (maxGap - minGap) * ((width - minWidth) / (maxWidth - minWidth));
}

export const CircularTestimonials = ({ testimonials, autoplay = true, colors = {}, fontSizes = {} }: CircularTestimonialsProps) => {
  const colorName = colors.name ?? "#000";
  const colorDesignation = colors.designation ?? "#6b7280";
  const colorTestimony = colors.testimony ?? "#4b5563";
  const colorArrowBg = colors.arrowBackground ?? "#141414";
  const colorArrowFg = colors.arrowForeground ?? "#f1f1f7";
  const colorArrowHoverBg = colors.arrowHoverBackground ?? "#00a6fb";
  const fontSizeName = fontSizes.name ?? "1.5rem";
  const fontSizeDesignation = fontSizes.designation ?? "0.925rem";
  const fontSizeQuote = fontSizes.quote ?? "1.125rem";

  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverPrev, setHoverPrev] = useState(false);
  const [hoverNext, setHoverNext] = useState(false);
  const [containerWidth, setContainerWidth] = useState(1200);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const len = useMemo(() => testimonials.length, [testimonials]);
  const active = useMemo(() => testimonials[activeIndex], [activeIndex, testimonials]);

  useEffect(() => {
    function handleResize() { if (imageContainerRef.current) setContainerWidth(imageContainerRef.current.offsetWidth); }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (autoplay) { autoplayRef.current = setInterval(() => setActiveIndex((p) => (p + 1) % len), 5000); }
    return () => { if (autoplayRef.current) clearInterval(autoplayRef.current); };
  }, [autoplay, len]);

  const handleNext = useCallback(() => { setActiveIndex((p) => (p + 1) % len); if (autoplayRef.current) clearInterval(autoplayRef.current); }, [len]);
  const handlePrev = useCallback(() => { setActiveIndex((p) => (p - 1 + len) % len); if (autoplayRef.current) clearInterval(autoplayRef.current); }, [len]);

  function getImageStyle(index: number): React.CSSProperties {
    const gap = calculateGap(containerWidth);
    const maxStickUp = gap * 0.8;
    const isActive = index === activeIndex;
    const isLeft = (activeIndex - 1 + len) % len === index;
    const isRight = (activeIndex + 1) % len === index;
    if (isActive) return { zIndex: 3, opacity: 1, pointerEvents: "auto", transform: "translateX(0px) translateY(0px) scale(1) rotateY(0deg)", transition: "all 0.8s cubic-bezier(.4,2,.3,1)" };
    if (isLeft) return { zIndex: 2, opacity: 1, pointerEvents: "auto", transform: `translateX(-${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(15deg)`, transition: "all 0.8s cubic-bezier(.4,2,.3,1)" };
    if (isRight) return { zIndex: 2, opacity: 1, pointerEvents: "auto", transform: `translateX(${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(-15deg)`, transition: "all 0.8s cubic-bezier(.4,2,.3,1)" };
    return { zIndex: 1, opacity: 0, pointerEvents: "none", transition: "all 0.8s cubic-bezier(.4,2,.3,1)" };
  }

  return (
    <div style={{ width: "100%", maxWidth: "56rem", padding: "1rem" }}>
      <div style={{ display: "grid", gap: "4rem" }} className="md:grid-cols-2">
        <div ref={imageContainerRef} style={{ position: "relative", width: "100%", height: "22rem", perspective: "1000px" }}>
          {testimonials.map((t, i) => (
            <img key={t.src} src={t.src} alt={t.name}
              style={{ ...getImageStyle(i), position: "absolute", width: "100%", height: "100%", objectFit: "cover", borderRadius: "1.5rem", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }} />
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "1rem" }}>
          <AnimatePresence mode="wait">
            <motion.div key={activeIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <h3 style={{ color: colorName, fontSize: fontSizeName, fontWeight: "bold", marginBottom: "0.5rem", lineHeight: 1.3 }}>{active.name}</h3>
              <p style={{ color: colorDesignation, fontSize: fontSizeDesignation, marginBottom: "2rem" }}>{active.designation}</p>
              <motion.p style={{ color: colorTestimony, fontSize: fontSizeQuote, lineHeight: 1.8 }}>
                {active.quote.split(" ").map((word, i) => (
                  <motion.span key={i} initial={{ filter: "blur(10px)", opacity: 0, y: 5 }} animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: "easeInOut", delay: 0.025 * i }} style={{ display: "inline-block" }}>{word}&nbsp;</motion.span>
                ))}
              </motion.p>
            </motion.div>
          </AnimatePresence>
          <div style={{ display: "flex", gap: "1rem", paddingTop: "2.5rem" }}>
            <button onClick={handlePrev} onMouseEnter={() => setHoverPrev(true)} onMouseLeave={() => setHoverPrev(false)} aria-label="Previous"
              style={{ width: "3rem", height: "3rem", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "none", backgroundColor: hoverPrev ? colorArrowHoverBg : colorArrowBg, transition: "background-color 0.3s" }}>
              <FaArrowLeft size={18} color={colorArrowFg} />
            </button>
            <button onClick={handleNext} onMouseEnter={() => setHoverNext(true)} onMouseLeave={() => setHoverNext(false)} aria-label="Next"
              style={{ width: "3rem", height: "3rem", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "none", backgroundColor: hoverNext ? colorArrowHoverBg : colorArrowBg, transition: "background-color 0.3s" }}>
              <FaArrowRight size={18} color={colorArrowFg} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircularTestimonials;
