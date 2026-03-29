"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface PageLoaderProps {
  words?: string[]
  message?: string
}

const defaultWords = ["Scanning", "Markets", "Signals", "Analysis", "Insights", "Loading"]

export default function PageLoader({ words = defaultWords, message }: PageLoaderProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length)
    }, 2000)
    return () => clearInterval(timer)
  }, [words.length])

  return (
    <div className="flex flex-col items-center justify-center py-32 select-none">
      {/* Pulsing dot ring */}
      <div className="relative mb-10">
        <motion.div
          className="w-16 h-16 rounded-full border-2 border-primary/20"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0 m-auto w-4 h-4 rounded-full bg-primary"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Animated word */}
      <div className="h-14 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={words[index]}
            className="text-3xl md:text-4xl font-semibold text-foreground"
            initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -30, filter: "blur(8px)" }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {words[index]}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 mt-8">
        {words.map((_, i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            animate={{
              backgroundColor: i === index ? "var(--primary)" : "var(--border)",
              scale: i === index ? 1.4 : 1,
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        ))}
      </div>

      {/* Subtitle message */}
      {message && (
        <motion.p
          className="text-muted-foreground text-sm mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {message}
        </motion.p>
      )}
    </div>
  )
}
