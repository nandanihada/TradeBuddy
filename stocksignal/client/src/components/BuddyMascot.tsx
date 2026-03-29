import { motion } from "framer-motion"

interface BuddyMascotProps {
  size?: "sm" | "md" | "lg"
  speaking?: boolean
  message?: string
}

export function BuddyMascot({ size = "md", speaking = false, message }: BuddyMascotProps) {
  const sizeMap = { sm: "w-16 h-16", md: "w-28 h-28", lg: "w-40 h-40" }
  const eyeSize = { sm: "w-1.5 h-2", md: "w-2.5 h-3", lg: "w-3 h-4" }
  const bodySize = sizeMap[size]

  return (
    <div className="flex flex-col items-center">
      <motion.div
        className="relative"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Body */}
        <motion.div
          className={`${bodySize} rounded-full bg-gradient-to-br from-amber-400 via-orange-400 to-red-400 shadow-lg relative overflow-hidden`}
        >
          {/* Face shine */}
          <div className="absolute top-2 left-3 w-1/3 h-1/3 bg-white/20 rounded-full blur-sm" />

          {/* Eyes */}
          <div className="absolute top-[38%] left-1/2 -translate-x-1/2 flex gap-3">
            <motion.div
              className={`${eyeSize[size]} bg-gray-900 rounded-full`}
              animate={speaking ? { scaleY: [1, 0.3, 1] } : { scaleY: [1, 0.1, 1] }}
              transition={speaking ? { duration: 0.3, repeat: Infinity, repeatDelay: 0.5 } : { duration: 0.15, repeat: Infinity, repeatDelay: 4 }}
            />
            <motion.div
              className={`${eyeSize[size]} bg-gray-900 rounded-full`}
              animate={speaking ? { scaleY: [1, 0.3, 1] } : { scaleY: [1, 0.1, 1] }}
              transition={speaking ? { duration: 0.3, repeat: Infinity, repeatDelay: 0.5 } : { duration: 0.15, repeat: Infinity, repeatDelay: 4 }}
            />
          </div>

          {/* Mouth */}
          <motion.div
            className="absolute top-[58%] left-1/2 -translate-x-1/2"
            animate={speaking ? { scaleY: [0.5, 1.2, 0.5] } : {}}
            transition={{ duration: 0.4, repeat: Infinity }}
          >
            {speaking ? (
              <div className="w-4 h-3 bg-gray-900 rounded-full" />
            ) : (
              <svg width="20" height="8" viewBox="0 0 20 8">
                <path d="M3 2 Q10 8 17 2" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
            )}
          </motion.div>

          {/* Cheeks */}
          <div className="absolute top-[50%] left-[15%] w-3 h-2 bg-pink-300/50 rounded-full blur-[2px]" />
          <div className="absolute top-[50%] right-[15%] w-3 h-2 bg-pink-300/50 rounded-full blur-[2px]" />
        </motion.div>

        {/* Waving hand */}
        <motion.div
          className="absolute -right-3 top-[40%]"
          animate={{ rotate: [0, 20, -10, 20, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
        >
          <span className="text-2xl">👋</span>
        </motion.div>
      </motion.div>

      {/* Speech bubble */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-4 relative bg-white border-2 border-border rounded-2xl px-5 py-3 shadow-md max-w-xs"
        >
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l-2 border-t-2 border-border rotate-45" />
          <p className="text-foreground text-sm font-medium relative z-10">{message}</p>
        </motion.div>
      )}
    </div>
  )
}
