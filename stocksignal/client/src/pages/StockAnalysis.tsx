import { useState, useEffect, useRef } from "react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AnimatedTabs, type Tab } from "@/components/ui/animated-tabs"
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar,
} from "recharts"
import { Search, Loader2 } from "lucide-react"
import { getStockAnalysis, getStockHistory } from "@/lib/api"
import PageLoader from "@/components/ui/page-loader"
import { BuddyMascot } from "@/components/BuddyMascot"

export default function StockAnalysis() {
  const [searchInput, setSearchInput] = useState("")
  const [symbol, setSymbol] = useState("")
  const [loading, setLoading] = useState(false)
  const [chartLoading, setChartLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [error, setError] = useState("")
  const [period, setPeriod] = useState("6mo")
  const [activeTab, setActiveTab] = useState("verdict")

  // Full fetch (new stock)
  const fetchData = async (sym: string, per: string) => {
    if (!sym) return
    setLoading(true)
    setError("")
    setActiveTab("verdict")
    try {
      const [analysisRes, histRes] = await Promise.all([
        getStockAnalysis(sym), getStockHistory(sym, per),
      ])
      setData(analysisRes)
      setHistory(histRes)
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Couldn't fetch data.")
    } finally { setLoading(false) }
  }

  // Chart-only fetch (period change) — keeps current tab
  const fetchChartOnly = async (per: string) => {
    if (!symbol) return
    setChartLoading(true)
    try {
      const histRes = await getStockHistory(symbol, per)
      setHistory(histRes)
    } catch {} finally { setChartLoading(false) }
  }

  const handlePeriodChange = (p: string) => {
    setPeriod(p)
    setActiveTab("chart") // Stay on chart tab
    fetchChartOnly(p)
  }

  const handleSearch = () => {
    const sym = searchInput.trim().toUpperCase()
    if (sym) { setSymbol(sym); fetchData(sym, period) }
  }
  const handleSuggestionClick = (sym: string) => {
    setSearchInput(sym); setSymbol(sym); fetchData(sym, period)
  }

  const stock = data?.stock
  const rec = data?.recommendation
  const technicals = data?.technicals
  const indicators = technicals?.indicators
  const patterns = technicals?.patterns || []
  const chartData = history.map((h: any) => ({ date: h.date?.slice(5), price: h.close, volume: h.volume }))

  const popularStocks = [
    { symbol: "RELIANCE", name: "Reliance Industries" },
    { symbol: "TCS", name: "Tata Consultancy" },
    { symbol: "HDFCBANK", name: "HDFC Bank" },
    { symbol: "INFY", name: "Infosys" },
    { symbol: "ICICIBANK", name: "ICICI Bank" },
    { symbol: "SBIN", name: "State Bank of India" },
    { symbol: "TATAMOTORS", name: "Tata Motors" },
    { symbol: "ITC", name: "ITC Limited" },
    { symbol: "BAJFINANCE", name: "Bajaj Finance" },
    { symbol: "TITAN", name: "Titan Company" },
    { symbol: "WIPRO", name: "Wipro" },
    { symbol: "SUNPHARMA", name: "Sun Pharma" },
  ]

  const verdictColor = rec?.verdict === "BUY" ? "from-green-500 to-emerald-600" : rec?.verdict === "AVOID" ? "from-red-500 to-rose-600" : "from-amber-500 to-yellow-600"
  const verdictBorder = rec?.verdict === "BUY" ? "border-green-300" : rec?.verdict === "AVOID" ? "border-red-300" : "border-amber-300"
  const verdictGlow = rec?.verdict === "BUY" ? "shadow-green-200/50" : rec?.verdict === "AVOID" ? "shadow-red-200/50" : "shadow-amber-200/50"

  const buildTabs = (): Tab[] => {
    if (!rec || !stock) return []
    const tabs: Tab[] = [
      {
        id: "verdict",
        label: "AI Verdict",
        content: (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <img src="https://images.unsplash.com/photo-1493552152660-f915ab47ae9d?w=600&h=400&fit=crop" alt="Nature" className="rounded-lg w-full h-60 object-cover !m-0 shadow-[0_0_20px_rgba(0,0,0,0.2)]" />
            <div className="flex flex-col gap-y-3">
              <h2 className="text-xl font-bold !m-0 text-white leading-tight">{rec.quick}</h2>
              <p className="text-sm text-gray-300 leading-relaxed">{rec.explanation}</p>
              {rec.entry_price && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-green-500/20 rounded-lg text-center"><p className="text-[10px] text-green-300">Buy</p><p className="font-bold text-green-200 text-sm">{rec.entry_price}</p></div>
                  <div className="p-2 bg-red-500/20 rounded-lg text-center"><p className="text-[10px] text-red-300">SL</p><p className="font-bold text-red-200 text-sm">{rec.stop_loss || "N/A"}</p></div>
                  <div className="p-2 bg-blue-500/20 rounded-lg text-center"><p className="text-[10px] text-blue-300">Target</p><p className="font-bold text-blue-200 text-sm">{rec.target || "N/A"}</p></div>
                </div>
              )}
              {rec.confidence > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">AI Confidence</span>
                  <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden"><div className={`h-full rounded-full ${rec.confidence > 70 ? "bg-green-400" : rec.confidence > 40 ? "bg-yellow-400" : "bg-red-400"}`} style={{ width: `${rec.confidence}%` }} /></div>
                  <span className="text-xs font-bold">{rec.confidence}%</span>
                </div>
              )}
            </div>
          </div>
        ),
      },
      {
        id: "reasons",
        label: "Why?",
        content: (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <img src="https://images.unsplash.com/photo-1506543730435-e2c1d4553a84?w=600&h=400&fit=crop" alt="Plant" className="rounded-lg w-full h-60 object-cover !m-0 shadow-[0_0_20px_rgba(0,0,0,0.2)]" />
            <div className="flex flex-col gap-y-2">
              <h2 className="text-xl font-bold !m-0 text-white">Why this verdict?</h2>
              {rec.detailed_reasons?.length > 0 ? (
                <div className="space-y-2">{rec.detailed_reasons.map((reason: string, i: number) => (
                  <div key={i} className="flex gap-2 items-start p-2 bg-white/5 rounded-lg"><span className="text-sm shrink-0">{["1️⃣","2️⃣","3️⃣","4️⃣"][i]||"•"}</span><p className="text-sm text-gray-200">{reason}</p></div>
                ))}</div>
              ) : <p className="text-sm text-gray-400">No detailed reasons available.</p>}
            </div>
          </div>
        ),
      },
    ]

    // Chart tab — full width, darker
    if (chartData.length > 0) {
      tabs.push({
        id: "chart",
        label: "Chart",
        content: (
          <div className="space-y-3">
            <div className="flex gap-2 justify-center">
              {["1mo", "3mo", "6mo", "1y"].map((p) => (
                <button key={p} onClick={() => handlePeriodChange(p)}
                  className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${period === p ? "bg-white text-black shadow-lg" : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200"}`}>
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
            {chartLoading ? (
              <div className="flex items-center justify-center h-52"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="date" stroke="#555" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#555" domain={["dataMin - 20", "dataMax + 20"]} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid #222", borderRadius: "8px", color: "#fff" }} />
                  <Area type="monotone" dataKey="price" fill={stock.change_pct >= 0 ? "#22c55e" : "#ef4444"} stroke={stock.change_pct >= 0 ? "#22c55e" : "#ef4444"} fillOpacity={0.1} strokeWidth={2} name="Price (₹)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        ),
      })
    }

    // Technicals tab — no image, clean list
    if (indicators && Object.keys(indicators).length > 0) {
      tabs.push({
        id: "technicals",
        label: "Technicals",
        content: (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white/5 rounded-lg text-center"><p className="text-[10px] text-gray-400">52W High</p><p className="font-bold text-lg text-white">₹{stock.fifty_two_week_high?.toLocaleString("en-IN")}</p></div>
              <div className="p-3 bg-white/5 rounded-lg text-center"><p className="text-[10px] text-gray-400">52W Low</p><p className="font-bold text-lg text-white">₹{stock.fifty_two_week_low?.toLocaleString("en-IN")}</p></div>
            </div>
            <div className="space-y-1">
              {[
                { label: "RSI (14)", value: indicators.rsi, signal: indicators.rsi_signal },
                { label: "MACD", value: indicators.macd, signal: indicators.macd_crossover },
                { label: "ADX", value: indicators.adx, signal: indicators.trend_strength },
                { label: "SMA 20", value: indicators.sma_20 ? `₹${indicators.sma_20}` : "N/A" },
                { label: "SMA 50", value: indicators.sma_50 ? `₹${indicators.sma_50}` : "N/A" },
                { label: "BB Upper", value: indicators.bb_upper ? `₹${indicators.bb_upper}` : "N/A" },
                { label: "BB Lower", value: indicators.bb_lower ? `₹${indicators.bb_lower}` : "N/A" },
              ].filter(r => r.value !== undefined).map((row) => (
                <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                  <span className="text-xs text-gray-400">{row.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-white">{row.value}</span>
                    {row.signal && <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${row.signal?.includes("Bullish") || row.signal === "Oversold" ? "bg-green-500/20 text-green-300" : row.signal?.includes("Bearish") || row.signal === "Overbought" ? "bg-red-500/20 text-red-300" : "bg-gray-500/20 text-gray-300"}`}>{row.signal}</span>}
                  </div>
                </div>
              ))}
            </div>
            {patterns.length > 0 && <div className="space-y-1.5 pt-2">{patterns.map((p: any, i: number) => (
              <div key={i} className={`p-2 rounded-lg text-xs ${p.type === "Bullish" ? "bg-green-500/10 text-green-300" : p.type === "Bearish" ? "bg-red-500/10 text-red-300" : "bg-yellow-500/10 text-yellow-300"}`}>{p.name} — {p.description}</div>
            ))}</div>}
          </div>
        ),
      })
    }

    // Volume tab — no image, full dark chart
    if (chartData.length > 0) {
      tabs.push({
        id: "volume",
        label: "Volume",
        content: (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Trading Volume — Last 30 Days</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData.slice(-30)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                <XAxis dataKey="date" stroke="#444" tick={{ fontSize: 9 }} />
                <YAxis stroke="#444" tick={{ fontSize: 9 }} />
                <Tooltip contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid #222", borderRadius: "8px", color: "#fff" }} />
                <Bar dataKey="volume" fill="#4f46e5" name="Volume" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ),
      })
    }
    return tabs
  }

  const tabs = buildTabs()

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 w-full py-8">
        <div className="container max-w-3xl mx-auto space-y-6">
          {/* Search */}
          <div className="text-center space-y-4">
            <BuddyMascot size="md" message={data ? undefined : "Hey! Which stock should I check for you? 🤔"} />
            <h1 className="text-3xl font-bold">Should I buy this stock?</h1>
            <p className="text-muted-foreground">Type any NSE stock name and AI will tell you in simple words</p>
            <div className="flex gap-3 max-w-lg mx-auto">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input placeholder="e.g. RELIANCE, TCS, INFY" className="pl-10 h-12 text-lg" value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
              </div>
              <Button onClick={handleSearch} disabled={loading} className="h-12 px-6">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Ask AI"}
              </Button>
            </div>
          </div>

          {error && <div className="p-4 text-center text-red-500 bg-red-50 rounded-xl">{error}</div>}

          {/* Popular Stocks */}
          {!symbol && !loading && (
            <div className="space-y-4">
              <p className="text-center text-muted-foreground">👇 Pick a stock or type any NSE symbol</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {popularStocks.map((s) => (
                  <button key={s.symbol} onClick={() => handleSuggestionClick(s.symbol)}
                    className="p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all text-left group">
                    <p className="font-semibold text-foreground group-hover:text-primary">{s.symbol}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.name}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && <PageLoader words={["Checking", symbol, "Analyzing", "Thinking", "Almost done"]} message={`AI is analyzing ${symbol}...`} />}

          {/* Results */}
          {!loading && rec && stock && (
            <>
              {/* Enhanced Verdict Card — Compact */}
              <div className={`relative overflow-hidden rounded-2xl border ${verdictBorder} shadow-md ${verdictGlow} px-6 py-5`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${verdictColor} opacity-5`} />
                <div className="relative flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`px-5 py-2 rounded-full text-white font-bold text-base bg-gradient-to-r ${verdictColor} shadow-md shrink-0`}>
                      {rec.verdict === "BUY" ? "✅ BUY" : rec.verdict === "AVOID" ? "❌ AVOID" : "⏳ WAIT"}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{symbol}</h2>
                      <p className={`text-sm font-medium ${stock.change_pct >= 0 ? "text-green-600" : "text-red-500"}`}>
                        {stock.change_pct >= 0 ? "📈" : "📉"} {stock.change_pct >= 0 ? "+" : ""}{stock.change_pct?.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-foreground">₹{stock.price?.toLocaleString("en-IN")}</p>
                </div>
              </div>

              {/* Animated Tabs */}
              {tabs.length > 0 && <AnimatedTabs tabs={tabs} defaultTab={activeTab} />}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
