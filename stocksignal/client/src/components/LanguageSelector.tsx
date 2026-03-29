import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BuddyMascot } from "@/components/BuddyMascot"

const languages = [
  { code: "en", label: "English", emoji: "🇬🇧", greeting: "Hey Buddy!" },
  { code: "hi", label: "हिंदी", emoji: "🇮🇳", greeting: "हे बडी!" },
  { code: "hinglish", label: "Hinglish", emoji: "🇮🇳🇬🇧", greeting: "Hey Buddy! Kya haal hai?" },
  { code: "ta", label: "தமிழ்", emoji: "🇮🇳", greeting: "ஹே பட்டி!" },
  { code: "te", label: "తెలుగు", emoji: "🇮🇳", greeting: "హే బడ్డీ!" },
  { code: "bn", label: "বাংলা", emoji: "🇮🇳", greeting: "হে বাডি!" },
  { code: "mr", label: "मराठी", emoji: "🇮🇳", greeting: "हे बडी!" },
  { code: "gu", label: "ગુજરાતી", emoji: "🇮🇳", greeting: "હે બડી!" },
]

interface LanguageSelectorProps {
  onSelect: (lang: string) => void
}

export function LanguageSelector({ onSelect }: LanguageSelectorProps) {
  const [step, setStep] = useState<"greeting" | "pick">("greeting")
  const [hoveredLang, setHoveredLang] = useState<string | null>(null)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-white flex items-center justify-center"
    >
      <div className="max-w-lg w-full px-6 text-center">
        {/* Mascot */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          className="mx-auto mb-4"
        >
          <BuddyMascot size="lg" speaking={step === "greeting"} />
        </motion.div>

        <AnimatePresence mode="wait">
          {step === "greeting" ? (
            <motion.div
              key="greeting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold text-foreground mb-3">
                Hey Buddy! 👋
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Welcome to TradeBuddy. I'm your AI stock market friend.
              </p>
              <motion.button
                onClick={() => setStep("pick")}
                className="px-8 py-3 bg-primary text-white rounded-xl font-semibold text-lg hover:bg-primary/90 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Let's get started →
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="pick"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Which language suits you best? 🗣️
              </h2>
              <p className="text-muted-foreground mb-8">
                I'll talk to you in this language
              </p>

              <div className="grid grid-cols-2 gap-3">
                {languages.map((lang, i) => (
                  <motion.button
                    key={lang.code}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i, duration: 0.4 }}
                    onClick={() => onSelect(lang.code)}
                    onMouseEnter={() => setHoveredLang(lang.code)}
                    onMouseLeave={() => setHoveredLang(null)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      hoveredLang === lang.code
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="text-2xl">{lang.emoji}</span>
                    <p className="font-semibold text-foreground mt-2">{lang.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{lang.greeting}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
