import { useState, useEffect } from "react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar,
} from "recharts"
import { Search, TrendingUp, TrendingDown, Loader2, ChevronDown, ChevronUp } from "lucide-react"
import { getStockAnalysis, getStockHistory } from "@/lib/api"
import PageLoader from "@/components/ui/page-loader"

export default function StockAnalysis() {
  const [searchInput, setSearchInput] = useState("")
  const [symbol, setSymbol] = useState("")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [error, setError] = useState("")
  const [period, setPeriod] = useState("6mo")
  const [showDetails, setShowDetails] = useState(false)
  const [showChart, setShowChart] = useState(false)
  const [showReasons, setShowReasons] = useState(false)

  const fetchData = async (sym: string, per: string) => {
    if (!sym) return
    setLoading(true)
    setError("")
    setShowDetails(false)
    setShowChart(false)
    setShowReasons(false)
    try {
      const [analysisRes, histRes] = await Promise.all([
        getStockAnalysis(sym),
        getStockHistory(sym, per),
      ])
      setData(analysisRes)
      setHistory(histRes)
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Couldn't fetch data. Check the stock name and try again.")
    } finally {
      setLoading(false)
    }
  }

  // Only fetch when period changes AND we already have a symbol selected
  useEffect(() => { if (symbol) fetchData(symbol, period) }, [period])

  const handleSearch = () => {
    const sym = searchInput.trim().toUpperCase()
    if (sym) {
      setSymbol(sym)
      fetchData(sym, period)
    }
  }

  const handleSuggestionClick = (sym: string) => {
    setSearchInput(sym)
    setSymbol(sym)
    fetchData(sym, period)
  }

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

  const stock = data?.stock
  const rec = data?.recommendation
  const technicals = data?.technicals
  const indicators = technicals?.indicators
  const patterns = technicals?.patterns || []

  const chartData = history.map((h: any) => ({ date: h.date?.slice(5), price: h.close, volume: h.volume }))

  const verdictColor = rec?.verdict === "BUY" ? "bg-green-500" : rec?.verdict === "AVOID" ? "bg-red-500" : "bg-yellow-500"
  const verdictBg = rec?.verdict === "BUY" ? "bg-green-50 border-green-200" : rec?.verdict === "AVOID" ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 w-full py-8">
        <div className="container max-w-3xl mx-auto space-y-6">
          {/* Search */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Should I buy this stock? 🤔</h1>
            <p className="text-muted-foreground">Type any NSE stock name and AI will tell you in simple words</p>
            <div className="flex gap-3 max-w-lg mx-auto">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="e.g. RELIANCE, TCS, INFY, TATAMOTORS"
                  className="pl-10 h-12 text-lg"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} disabled={loading} className="h-12 px-6">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Ask AI"}
              </Button>
            </div>
          </div>

          {error && <Card className="p-6 text-center text-red-500">{error}</Card>}

          {/* Popular Stock Suggestions — shown when no stock is selected */}
          {!symbol && !loading && (
            <div className="space-y-4">
              <p className="text-center text-muted-foreground">👇 Pick a stock or type any NSE symbol above</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {popularStocks.map((s) => (
                  <button
                    key={s.symbol}
                    onClick={() => handleSuggestionClick(s.symbol)}
                    className="p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
                  >
                    <p className="font-semibold text-foreground group-hover:text-primary">{s.symbol}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.name}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <PageLoader
              words={["Checking", symbol, "Analyzing", "Thinking", "Almost done"]}
              message={`AI is analyzing ${symbol} for you...`}
            />
          )}

          {!loading && rec && stock && (
            <>
              {/* THE VERDICT — Layer 1 */}
              <Card className={`p-8 ${verdictBg} border-2`}>
                <div className="text-center space-y-4">
                  <div className={`inline-block px-6 py-2 rounded-full text-white font-bold text-xl ${verdictColor}`}>
                    {rec.verdict === "BUY" ? "✅ BUY" : rec.verdict === "AVOID" ? "❌ AVOID" : "⏳ WAIT"}
                  </div>
                  <h2 className="text-2xl font-bold">{symbol} — ₹{stock.price?.toLocaleString("en-IN")}</h2>
                  <p className={`text-lg font-medium ${stock.change_pct >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {stock.change_pct >= 0 ? "📈" : "📉"} {stock.change_pct >= 0 ? "+" : ""}{stock.change_pct?.toFixed(2)}% today
                  </p>
                  <p className="text-xl font-medium text-foreground">{rec.quick}</p>
                </div>
              </Card>

              {/* SIMPLE EXPLANATION — Layer 2 */}
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-3">💬 In simple words:</h3>
                <p className="text-foreground text-lg leading-relaxed">{rec.explanation}</p>
                {rec.entry_price && (
                  <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Buy around</p>
                      <p className="font-bold text-green-700">{rec.entry_price}</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Stop Loss</p>
                      <p className="font-bold text-red-700">{rec.stop_loss || "N/A"}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Target</p>
                      <p className="font-bold text-blue-700">{rec.target || "N/A"}</p>
                    </div>
                  </div>
                )}
                {rec.confidence > 0 && (
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">AI Confidence:</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${rec.confidence > 70 ? "bg-green-500" : rec.confidence > 40 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${rec.confidence}%` }} />
                    </div>
                    <span className="text-sm font-semibold">{rec.confidence}%</span>
                  </div>
                )}
              </Card>

              {/* EXPANDABLE SECTIONS — Layer 3 & 4 */}

              {/* Show Reasons */}
              {rec.detailed_reasons && rec.detailed_reasons.length > 0 && (
                <Card className="overflow-hidden">
                  <button onClick={() => setShowReasons(!showReasons)} className="w-full p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                    <span className="font-semibold">📋 Why? (See the reasons)</span>
                    {showReasons ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {showReasons && (
                    <div className="px-6 pb-6 space-y-3">
                      {rec.detailed_reasons.map((reason: string, i: number) => (
                        <div key={i} className="flex gap-3 items-start">
                          <span className="text-lg">{i === 0 ? "1️⃣" : i === 1 ? "2️⃣" : "3️⃣"}</span>
                          <p className="text-foreground">{reason}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}

              {/* Show Chart */}
              <Card className="overflow-hidden">
                <button onClick={() => setShowChart(!showChart)} className="w-full p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                  <span className="font-semibold">📊 Show me the chart</span>
                  {showChart ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {showChart && chartData.length > 0 && (
                  <div className="px-4 pb-6">
                    <div className="flex gap-2 mb-4 justify-center">
                      {["1mo", "3mo", "6mo", "1y"].map((p) => (
                        <Button key={p} variant={period === p ? "default" : "outline"} size="sm" onClick={() => setPeriod(p)}>
                          {p.toUpperCase()}
                        </Button>
                      ))}
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="date" stroke="#6B7280" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#6B7280" domain={["dataMin - 20", "dataMax + 20"]} />
                        <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px" }} />
                        <Area type="monotone" dataKey="price" fill={stock.change_pct >= 0 ? "#10B981" : "#EF4444"} stroke={stock.change_pct >= 0 ? "#10B981" : "#EF4444"} fillOpacity={0.1} name="Price (₹)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>

              {/* Show Technical Details */}
              <Card className="overflow-hidden">
                <button onClick={() => setShowDetails(!showDetails)} className="w-full p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                  <span className="font-semibold">🔬 Show me the numbers (for nerds)</span>
                  {showDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {showDetails && indicators && (
                  <div className="px-6 pb-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-muted-foreground">52W High</p>
                        <p className="font-bold">₹{stock.fifty_two_week_high?.toLocaleString("en-IN")}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-muted-foreground">52W Low</p>
                        <p className="font-bold">₹{stock.fifty_two_week_low?.toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: "RSI (14)", value: indicators.rsi, signal: indicators.rsi_signal },
                        { label: "MACD", value: indicators.macd, signal: indicators.macd_crossover },
                        { label: "ADX", value: indicators.adx, signal: indicators.trend_strength },
                        { label: "SMA 20", value: indicators.sma_20 ? `₹${indicators.sma_20}` : "N/A" },
                        { label: "SMA 50", value: indicators.sma_50 ? `₹${indicators.sma_50}` : "N/A" },
                        { label: "Bollinger Upper", value: indicators.bb_upper ? `₹${indicators.bb_upper}` : "N/A" },
                        { label: "Bollinger Lower", value: indicators.bb_lower ? `₹${indicators.bb_lower}` : "N/A" },
                      ].filter(r => r.value !== undefined).map((row) => (
                        <div key={row.label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                          <span className="text-sm text-muted-foreground">{row.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{row.value}</span>
                            {row.signal && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                row.signal?.includes("Bullish") || row.signal === "Oversold" ? "bg-green-100 text-green-700" :
                                row.signal?.includes("Bearish") || row.signal === "Overbought" ? "bg-red-100 text-red-700" :
                                "bg-gray-100 text-gray-700"
                              }`}>{row.signal}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {patterns.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="font-semibold text-sm">Patterns Detected:</p>
                        {patterns.map((p: any, i: number) => (
                          <div key={i} className={`p-3 rounded-lg text-sm ${p.type === "Bullish" ? "bg-green-50" : p.type === "Bearish" ? "bg-red-50" : "bg-yellow-50"}`}>
                            <span className="font-medium">{p.name}</span> — {p.description}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
