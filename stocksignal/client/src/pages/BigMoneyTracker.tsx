import { useState, useEffect } from "react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Card } from "@/components/ui/card"
import { getFiiDiiData, getBulkDeals, getInstitutionalActivity } from "@/lib/api"
import PageLoader from "@/components/ui/page-loader"
import { BuddyMascot } from "@/components/BuddyMascot"
import { DealCarousel } from "@/components/ui/deal-carousel"

export default function BigMoneyTracker() {
  const [institutional, setInstitutional] = useState<any>(null)
  const [bulkDeals, setBulkDeals] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const lang = typeof window !== "undefined" ? localStorage.getItem("tradebuddy_lang") || "en" : "en"

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const [inst, bulk] = await Promise.all([getInstitutionalActivity(), getBulkDeals()])
        setInstitutional(inst)
        setBulkDeals(bulk)
      } catch {} finally { setLoading(false) }
    }
    fetch()
  }, [])

  const fii = institutional?.fii
  const dii = institutional?.dii
  const fiiNet = parseFloat(fii?.netValue || 0)
  const diiNet = parseFloat(dii?.netValue || 0)
  const bulkList = bulkDeals?.BULK_DEALS_DATA || []

  // Determine market sentiment
  const sentiment = fiiNet > 0 && diiNet > 0 ? "very_bullish" : fiiNet < 0 && diiNet > 0 ? "mixed_domestic" : fiiNet > 0 && diiNet < 0 ? "mixed_foreign" : fiiNet < 0 && diiNet < 0 ? "very_bearish" : "neutral"

  const sentimentInfo = {
    very_bullish: {
      emoji: "🚀", color: "bg-green-50 border-green-200",
      en: { title: "Both FII & DII are buying!", explain: "Foreign and Indian institutions are both putting money into the market. This is a strong bullish signal — big money is confident.", action: "Market sentiment is very positive. Good time to stay invested." },
      hinglish: { title: "FII aur DII dono kharid rahe hain!", explain: "Foreign aur Indian dono bade investors market mein paisa laga rahe hain. Yeh bahut accha signal hai — bade log confident hain.", action: "Market ka mood bahut accha hai. Invested rehna accha rahega." },
    },
    mixed_domestic: {
      emoji: "🤔", color: "bg-yellow-50 border-yellow-200",
      en: { title: "FII selling, but DII buying", explain: "Foreign investors are pulling money out, but Indian institutions are buying. This means domestic investors see value even though foreigners are cautious.", action: "Mixed signals. Indian institutions are supporting the market. Don't panic." },
      hinglish: { title: "FII bech rahe hain, lekin DII kharid rahe hain", explain: "Foreign investors paisa nikal rahe hain, lekin Indian institutions kharid rahe hain. Matlab domestic investors ko market mein value dikh rahi hai.", action: "Mixed signals hain. Indian institutions market ko support kar rahe hain. Panic mat karo." },
    },
    mixed_foreign: {
      emoji: "🌍", color: "bg-blue-50 border-blue-200",
      en: { title: "FII buying, DII selling", explain: "Foreign money is flowing in while Indian institutions are booking profits. Foreign investors see opportunity in Indian markets.", action: "Foreign money inflow is positive. Watch if DII selling continues." },
      hinglish: { title: "FII kharid rahe hain, DII bech rahe hain", explain: "Foreign paisa aa raha hai aur Indian institutions profit book kar rahe hain. Foreign investors ko Indian market mein opportunity dikh rahi hai.", action: "Foreign money aana accha hai. Dekho DII selling continue hoti hai ya nahi." },
    },
    very_bearish: {
      emoji: "⚠️", color: "bg-red-50 border-red-200",
      en: { title: "Both FII & DII are selling!", explain: "Both foreign and Indian institutions are pulling money out. This is a bearish signal — big money is being very cautious.", action: "Be careful. When both FII and DII sell, markets usually fall. Don't make big investments right now." },
      hinglish: { title: "FII aur DII dono bech rahe hain!", explain: "Foreign aur Indian dono bade investors paisa nikal rahe hain. Yeh bearish signal hai — bade log bahut cautious hain.", action: "Dhyan se. Jab dono bechte hain to market usually girta hai. Abhi bada investment mat karo." },
    },
    neutral: {
      emoji: "😐", color: "bg-gray-50 border-gray-200",
      en: { title: "No significant institutional activity", explain: "Institutional data is not available right now. Markets may be closed.", action: "Check back during market hours." },
      hinglish: { title: "Abhi koi bada institutional activity nahi hai", explain: "Institutional data abhi available nahi hai. Market band ho sakta hai.", action: "Market hours mein wapas check karo." },
    },
  }

  const info = sentimentInfo[sentiment]
  const t = lang === "hinglish" ? info.hinglish : info.en

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 w-full py-8">
        <div className="container max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <BuddyMascot size="md" speaking={loading} message={
              loading ? (lang === "hinglish" ? "Bade investors kya kar rahe hain dekh raha hoon..." : "Checking what big investors are doing...") :
              fii || dii ? (lang === "hinglish" ? "Dekho bade log kya kar rahe hain 👀" : "See what the big players are doing 👀") :
              (lang === "hinglish" ? "Abhi data available nahi hai" : "Data not available right now")
            } />
            <h1 className="text-3xl font-bold">
              {lang === "hinglish" ? "🏦 Bade Investors Kya Kar Rahe Hain?" : "🏦 What Are Big Investors Doing?"}
            </h1>
            <p className="text-muted-foreground">
              {lang === "hinglish"
                ? "FII (foreign) aur DII (Indian) institutions ka paisa kahan ja raha hai"
                : "Track where FII (foreign) and DII (Indian) institutional money is flowing"}
            </p>
          </div>

          {loading && <PageLoader words={["Tracking", "FII", "DII", "Institutions", "Big Money"]} message="Fetching institutional data..." />}

          {!loading && (
            <>
              {/* Sentiment Card */}
              <Card className={`p-6 ${info.color} border`}>
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{info.emoji}</span>
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-foreground">{t.title}</h2>
                    <div className="bg-white/80 rounded-lg p-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        {lang === "hinglish" ? "📖 Iska matlab:" : "📖 What this means:"}
                      </p>
                      <p className="text-sm text-foreground">{t.explain}</p>
                    </div>
                    <div className="bg-primary/5 rounded-lg p-3">
                      <p className="text-xs font-semibold text-primary mb-1">
                        {lang === "hinglish" ? "💡 Aapke liye:" : "💡 For you:"}
                      </p>
                      <p className="text-sm text-foreground">{t.action}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* FII vs DII Cards */}
              {(fii || dii) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {fii && (
                    <Card className={`p-5 border-l-4 ${fiiNet >= 0 ? "border-l-green-500" : "border-l-red-500"}`}>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold flex items-center gap-2">
                            🌍 {lang === "hinglish" ? "Foreign Investors (FII)" : "Foreign Investors (FII)"}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${fiiNet >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {fiiNet >= 0 ? (lang === "hinglish" ? "Kharid rahe" : "Buying") : (lang === "hinglish" ? "Bech rahe" : "Selling")}
                          </span>
                        </div>
                        <div className={`text-3xl font-bold ${fiiNet >= 0 ? "text-green-600" : "text-red-500"}`}>
                          {fiiNet >= 0 ? "+" : ""}₹{Math.abs(fiiNet).toLocaleString("en-IN")} Cr
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {lang === "hinglish"
                            ? `Kharida: ₹${parseFloat(fii.buyValue || 0).toLocaleString("en-IN")} Cr | Becha: ₹${parseFloat(fii.sellValue || 0).toLocaleString("en-IN")} Cr`
                            : `Bought: ₹${parseFloat(fii.buyValue || 0).toLocaleString("en-IN")} Cr | Sold: ₹${parseFloat(fii.sellValue || 0).toLocaleString("en-IN")} Cr`}
                        </p>
                      </div>
                    </Card>
                  )}
                  {dii && (
                    <Card className={`p-5 border-l-4 ${diiNet >= 0 ? "border-l-green-500" : "border-l-red-500"}`}>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold flex items-center gap-2">
                            🏠 {lang === "hinglish" ? "Indian Institutions (DII)" : "Indian Institutions (DII)"}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${diiNet >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {diiNet >= 0 ? (lang === "hinglish" ? "Kharid rahe" : "Buying") : (lang === "hinglish" ? "Bech rahe" : "Selling")}
                          </span>
                        </div>
                        <div className={`text-3xl font-bold ${diiNet >= 0 ? "text-green-600" : "text-red-500"}`}>
                          {diiNet >= 0 ? "+" : ""}₹{Math.abs(diiNet).toLocaleString("en-IN")} Cr
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {lang === "hinglish"
                            ? `Kharida: ₹${parseFloat(dii.buyValue || 0).toLocaleString("en-IN")} Cr | Becha: ₹${parseFloat(dii.sellValue || 0).toLocaleString("en-IN")} Cr`
                            : `Bought: ₹${parseFloat(dii.buyValue || 0).toLocaleString("en-IN")} Cr | Sold: ₹${parseFloat(dii.sellValue || 0).toLocaleString("en-IN")} Cr`}
                        </p>
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {/* Bulk Deals — Simplified */}
              {bulkList.length > 0 && (() => {
                const dealImages = [
                  "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&h=800&fit=crop",
                  "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&h=800&fit=crop",
                  "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&h=800&fit=crop",
                  "https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?w=600&h=800&fit=crop",
                  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=800&fit=crop",
                  "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=800&fit=crop",
                  "https://images.unsplash.com/photo-1551288049-bbda38a10ad5?w=600&h=800&fit=crop",
                  "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&h=800&fit=crop",
                ]
                const carouselDeals = bulkList.slice(0, 8).map((deal: any, i: number) => {
                  const isBuy = deal.buySell === "BUY"
                  const qty = parseInt(deal.qty || 0)
                  const price = parseFloat(deal.wAvgPrice || 0)
                  const valueCr = (qty * price) / 10000000
                  return {
                    id: `deal-${i}`,
                    label: `${deal.symbol} — ${isBuy ? "Buy" : "Sell"}`,
                    image: dealImages[i % dealImages.length],
                    description: lang === "hinglish"
                      ? `${deal.clientName?.slice(0, 35)} ne ${qty.toLocaleString("en-IN")} shares ${isBuy ? "kharide" : "beche"} at ₹${price.toFixed(0)} (₹${valueCr.toFixed(1)} Cr)`
                      : `${deal.clientName?.slice(0, 35)} ${isBuy ? "bought" : "sold"} ${qty.toLocaleString("en-IN")} shares at ₹${price.toFixed(0)} (₹${valueCr.toFixed(1)} Cr)`,
                    badge: isBuy ? "BUY" : "SELL",
                    isBuy,
                  }
                })
                return (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">
                      {lang === "hinglish" ? "Bade Deals (Bulk Deals)" : "Big Deals Today"}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      {lang === "hinglish"
                        ? "Jab koi bada investor ek saath bahut saare shares khareedta ya bechta hai, usse bulk deal kehte hain."
                        : "When a big investor buys or sells a large number of shares at once, it's called a bulk deal."}
                    </p>
                    <DealCarousel deals={carouselDeals} accentColor="#0F172A" />
                  </div>
                )
              })()}

              {/* No data state */}
              {!fii && !dii && bulkList.length === 0 && (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">
                    {lang === "hinglish"
                      ? "Abhi institutional data available nahi hai. Market hours mein check karo (9:15 AM - 3:30 PM)."
                      : "Institutional data not available right now. Check during market hours (9:15 AM - 3:30 PM)."}
                  </p>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
