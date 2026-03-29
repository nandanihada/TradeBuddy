import { useState, useEffect } from "react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import { getAllSignals, getMarketOverview } from "@/lib/api"
import PageLoader from "@/components/ui/page-loader"
import { BuddyMascot } from "@/components/BuddyMascot"
import { CircularTestimonials } from "@/components/ui/circular-testimonials"

export default function MorningBriefing() {
  const [signals, setSignals] = useState<any[]>([])
  const [market, setMarket] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [signalData, marketData] = await Promise.all([getAllSignals(), getMarketOverview()])
        setSignals(signalData)
        setMarket(marketData)
      } catch {
        setError("Couldn't load signals. Backend may be starting up — try again in a moment.")
      } finally { setLoading(false) }
    }
    fetchAll()
  }, [])

  const lang = typeof window !== "undefined" ? localStorage.getItem("tradebuddy_lang") || "en" : "en"

  // Generate human-friendly explanation for each signal
  const explainSignal = (s: any): { emoji: string; title: string; explain: string; action: string; color: string } => {
    if (s.type === "fii_dii") {
      const isBuying = (s.net_value_cr || 0) > 0
      const who = s.title?.includes("FII") ? "Foreign investors (FII)" : "Indian institutions (DII)"
      if (lang === "hinglish") {
        return {
          emoji: isBuying ? "🟢" : "🔴",
          title: isBuying ? `${who} kharid rahe hain` : `${who} bech rahe hain`,
          explain: isBuying
            ? `${who} ne aaj ₹${Math.abs(s.net_value_cr || 0).toLocaleString("en-IN")} Cr ki khareedari ki. Iska matlab hai ki bade investors ko market mein bharosa hai.`
            : `${who} ne aaj ₹${Math.abs(s.net_value_cr || 0).toLocaleString("en-IN")} Cr bech diye. Iska matlab hai ki bade investors thoda cautious hain.`,
          action: isBuying ? "Yeh bullish signal hai — market ke liye accha hai" : "Yeh bearish signal hai — thoda dhyan rakhna",
          color: isBuying ? "border-l-green-500 bg-green-50" : "border-l-red-500 bg-red-50",
        }
      }
      return {
        emoji: isBuying ? "🟢" : "🔴",
        title: isBuying ? `${who} are buying heavily` : `${who} are selling heavily`,
        explain: isBuying
          ? `${who} bought ₹${Math.abs(s.net_value_cr || 0).toLocaleString("en-IN")} Cr worth of stocks today. This means big money is confident about the market.`
          : `${who} sold ₹${Math.abs(s.net_value_cr || 0).toLocaleString("en-IN")} Cr worth of stocks today. Big money is being cautious.`,
        action: isBuying ? "This is a bullish signal — good for the market" : "This is a bearish signal — be careful",
        color: isBuying ? "border-l-green-500 bg-green-50" : "border-l-red-500 bg-red-50",
      }
    }

    if (s.type === "price_drop") {
      if (lang === "hinglish") {
        return {
          emoji: "📉",
          title: `${s.symbol} aaj ${Math.abs(s.change_pct || 0).toFixed(1)}% gira`,
          explain: `${s.symbol} ki price ₹${s.price?.toLocaleString("en-IN")} ho gayi hai. Aaj market mein iska stock kaafi gira hai.`,
          action: "Agar company strong hai to yeh buying opportunity ho sakti hai. Lekin pehle check karo kyun gira.",
          color: "border-l-orange-500 bg-orange-50",
        }
      }
      return {
        emoji: "📉",
        title: `${s.symbol} dropped ${Math.abs(s.change_pct || 0).toFixed(1)}% today`,
        explain: `${s.symbol} fell to ₹${s.price?.toLocaleString("en-IN")}. The stock saw significant selling pressure today.`,
        action: "If the company is fundamentally strong, this could be a buying opportunity. But first check why it dropped.",
        color: "border-l-orange-500 bg-orange-50",
      }
    }

    if (s.type === "price_rally") {
      if (lang === "hinglish") {
        return {
          emoji: "📈",
          title: `${s.symbol} aaj ${Math.abs(s.change_pct || 0).toFixed(1)}% badha`,
          explain: `${s.symbol} ki price ₹${s.price?.toLocaleString("en-IN")} ho gayi hai. Strong buying interest dikh raha hai.`,
          action: "Abhi buy mat karo — big jump ke baad usually thoda girta hai. Dip ka wait karo.",
          color: "border-l-green-500 bg-green-50",
        }
      }
      return {
        emoji: "📈",
        title: `${s.symbol} surged ${Math.abs(s.change_pct || 0).toFixed(1)}% today`,
        explain: `${s.symbol} rallied to ₹${s.price?.toLocaleString("en-IN")}. Strong buying interest today.`,
        action: "Don't chase it now — stocks usually pull back after a big jump. Wait for a dip.",
        color: "border-l-green-500 bg-green-50",
      }
    }

    if (s.type === "near_52w_high") {
      return {
        emoji: "🔝",
        title: lang === "hinglish" ? `${s.symbol} 52-week high ke paas hai` : `${s.symbol} is near its 52-week high`,
        explain: lang === "hinglish"
          ? `Yeh stock apne 1 saal ke sabse upar ke level ke paas hai. Breakout ho sakta hai ya resistance mil sakta hai.`
          : `This stock is near its highest price in the last year. It could break out higher or face resistance here.`,
        action: lang === "hinglish" ? "Risky hai top pe kharidna. Confirmation ka wait karo." : "Risky to buy at the top. Wait for confirmation.",
        color: "border-l-blue-500 bg-blue-50",
      }
    }

    if (s.type === "near_52w_low") {
      return {
        emoji: "⬇️",
        title: lang === "hinglish" ? `${s.symbol} 52-week low ke paas hai` : `${s.symbol} is near its 52-week low`,
        explain: lang === "hinglish"
          ? `Yeh stock apne 1 saal ke sabse neeche ke level ke paas hai. Value buy ho sakta hai ya aur gir sakta hai.`
          : `This stock is near its lowest price in the last year. Could be a value buy or could fall further.`,
        action: lang === "hinglish" ? "Fundamentals check karo pehle. Agar company strong hai to accha entry point hai." : "Check fundamentals first. If the company is strong, this could be a good entry.",
        color: "border-l-purple-500 bg-purple-50",
      }
    }

    return {
      emoji: "📊",
      title: s.title || "Signal detected",
      explain: s.description || "",
      action: "Review this signal carefully.",
      color: "border-l-gray-500 bg-gray-50",
    }
  }

  // Count signal types for summary
  const bullishCount = signals.filter(s => s.type === "price_rally" || (s.type === "fii_dii" && (s.net_value_cr || 0) > 0)).length
  const bearishCount = signals.filter(s => s.type === "price_drop" || (s.type === "fii_dii" && (s.net_value_cr || 0) < 0)).length
  const marketMood = bullishCount > bearishCount ? "positive" : bearishCount > bullishCount ? "cautious" : "mixed"

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 w-full py-8">
        <div className="container max-w-3xl mx-auto space-y-6">
          {/* Header with Buddy */}
          <div className="text-center space-y-2">
            <BuddyMascot size="md" speaking={loading} message={
              loading ? "Scanning markets for you..." :
              signals.length > 0 ? (
                lang === "hinglish"
                  ? `Maine ${signals.length} signals dhundhe hain. Market ka mood ${marketMood === "positive" ? "accha" : marketMood === "cautious" ? "thoda cautious" : "mixed"} hai.`
                  : `I found ${signals.length} signals today. Market mood is ${marketMood}.`
              ) : "No signals found today. Markets might be closed."
            } />
            <h1 className="text-3xl font-bold">
              {lang === "hinglish" ? "☀️ Aaj Ka Market Update" : "☀️ Today's Market Update"}
            </h1>
            <p className="text-muted-foreground">
              {lang === "hinglish"
                ? "AI ne market scan kiya aur yeh important cheezein mili"
                : "AI scanned the market and found these important things for you"}
            </p>
          </div>

          {loading && <PageLoader words={["Scanning", "NSE", "FII/DII", "Signals", "Almost done"]} message="Scanning markets..." />}

          {error && <div className="p-4 text-center text-red-500 bg-red-50 rounded-xl">{error}</div>}

          {!loading && signals.length > 0 && (
            <>
              {/* Market Mood Card */}
              <Card className={`p-5 ${marketMood === "positive" ? "bg-green-50 border-green-200" : marketMood === "cautious" ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"}`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{marketMood === "positive" ? "😊" : marketMood === "cautious" ? "😟" : "🤔"}</span>
                  <div>
                    <p className="font-semibold text-foreground">
                      {lang === "hinglish"
                        ? `Market ka mood: ${marketMood === "positive" ? "Accha hai! 📈" : marketMood === "cautious" ? "Thoda cautious hai 📉" : "Mixed hai 🤷"}`
                        : `Market mood: ${marketMood === "positive" ? "Looking good! 📈" : marketMood === "cautious" ? "A bit cautious 📉" : "Mixed signals 🤷"}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {lang === "hinglish"
                        ? `${bullishCount} positive signals, ${bearishCount} negative signals mile hain`
                        : `${bullishCount} positive signals, ${bearishCount} negative signals found`}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Top Movers */}
              {market && (market.gainers?.length > 0 || market.losers?.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {market.gainers?.length > 0 && (
                    <Card className="p-4">
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        {lang === "hinglish" ? "Aaj ke winners" : "Today's Winners"}
                      </h3>
                      <div className="space-y-2">
                        {market.gainers.slice(0, 4).map((s: any) => (
                          <div key={s.symbol} className="flex justify-between items-center">
                            <span className="text-sm font-medium">{s.symbol}</span>
                            <span className="text-sm text-green-600 font-semibold">+{s.change_pct?.toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                  {market.losers?.length > 0 && (
                    <Card className="p-4">
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-red-500" />
                        {lang === "hinglish" ? "Aaj ke losers" : "Today's Losers"}
                      </h3>
                      <div className="space-y-2">
                        {market.losers.slice(0, 4).map((s: any) => (
                          <div key={s.symbol} className="flex justify-between items-center">
                            <span className="text-sm font-medium">{s.symbol}</span>
                            <span className="text-sm text-red-500 font-semibold">{s.change_pct?.toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {/* Signals — Human Friendly */}
              {/* Signals Carousel */}
              {signals.length > 0 && (() => {
                const calmImages = [
                  "https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?w=600&h=400&fit=crop",
                  "https://images.unsplash.com/photo-1628749528992-f5702133b686?w=600&h=400&fit=crop",
                  "https://images.unsplash.com/photo-1524267213992-b76e8577d046?w=600&h=400&fit=crop",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
                  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&h=400&fit=crop",
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=400&fit=crop",
                ]
                const testimonials = signals.map((signal, i) => {
                  const info = explainSignal(signal)
                  // Clean title — remove emojis
                  const cleanTitle = info.title.replace(/[\u2600-\u27BF]|[\uD83C-\uDBFF][\uDC00-\uDFFF]|[\u200D\uFE0F]/g, "").trim()
                  return {
                    name: cleanTitle,
                    designation: lang === "hinglish" ? "Kya karna chahiye" : "What you should do",
                    quote: `${info.explain}\n\n${info.action}`,
                    src: calmImages[i % calmImages.length],
                  }
                })
                return (
                  <div className="bg-[#f7f7fa] p-8 sm:p-12 rounded-2xl flex items-center justify-center">
                    <CircularTestimonials
                      testimonials={testimonials}
                      autoplay={true}
                      colors={{
                        name: "#0a0a0a",
                        designation: "#6b7280",
                        testimony: "#374151",
                        arrowBackground: "#141414",
                        arrowForeground: "#f1f1f7",
                        arrowHoverBackground: "#374151",
                      }}
                      fontSizes={{ name: "24px", designation: "15px", quote: "17px" }}
                    />
                  </div>
                )
              })()}
            </>
          )}

          {!loading && signals.length === 0 && !error && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                {lang === "hinglish" ? "Aaj koi signal nahi mila. Market band ho sakta hai." : "No signals found today. Markets may be closed."}
              </p>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
