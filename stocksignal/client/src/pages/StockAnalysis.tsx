import { useState, useEffect } from "react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart, Area, Line, BarChart, Bar,
} from "recharts"
import { Search, TrendingUp, TrendingDown, Activity, Loader2 } from "lucide-react"
import { getStockAnalysis, getStockHistory } from "@/lib/api"
import PageLoader from "@/components/ui/page-loader"

export default function StockAnalysis() {
  const [searchInput, setSearchInput] = useState("RELIANCE")
  const [symbol, setSymbol] = useState("RELIANCE")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [error, setError] = useState("")
  const [period, setPeriod] = useState("6mo")

  const fetchData = async (sym: string, per: string) => {
    setLoading(true)
    setError("")
    try {
      const [analysisRes, histRes] = await Promise.all([
        getStockAnalysis(sym),
        getStockHistory(sym, per),
      ])
      setData(analysisRes)
      setHistory(histRes)
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to fetch data. Check the symbol.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData(symbol, period) }, [symbol, period])

  const handleSearch = () => {
    if (searchInput.trim()) {
      setSymbol(searchInput.trim().toUpperCase())
    }
  }

  const stock = data?.stock
  const technicals = data?.technicals
  const indicators = technicals?.indicators
  const patterns = technicals?.patterns || []
  const sr = technicals?.support_resistance

  const priceChange = stock ? (stock.price - stock.prev_close) : 0
  const priceChangePct = stock?.prev_close ? ((priceChange / stock.prev_close) * 100) : 0
  const isUp = priceChange >= 0

  // Prepare chart data from history
  const chartData = history.map((h: any) => ({
    date: h.date.slice(5), // MM-DD
    price: h.close,
    volume: h.volume,
  }))

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 w-full py-8">
        <div className="container space-y-8">
          {/* Header */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Stock Analysis</h1>
              <p className="text-muted-foreground">Real-time technical analysis for NSE stocks with AI-powered pattern detection</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Enter NSE symbol (e.g., RELIANCE, TCS, INFY)"
                  className="pl-10"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Analyze"}
              </Button>
            </div>
            <div className="flex gap-2">
              {["1mo", "3mo", "6mo", "1y"].map((p) => (
                <Button key={p} variant={period === p ? "default" : "outline"} size="sm" onClick={() => setPeriod(p)}>
                  {p.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          {error && <Card className="p-6 text-center text-red-500">{error}</Card>}

          {loading && (
            <PageLoader
              words={["Connecting", "NSE", "Fetching", symbol, "Analyzing", "Patterns", "Crunching"]}
              message={`Pulling real-time data for ${symbol} from NSE...`}
            />
          )}

          {!loading && stock && (
            <>
              {/* Stock Header */}
              <div className="flex items-end justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-foreground">{stock.symbol}</h2>
                  <p className="text-muted-foreground text-sm">{stock.name} • {stock.sector}</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-foreground">₹{stock.price?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                  <p className={`font-semibold flex items-center justify-end gap-1 ${isUp ? "text-green-600" : "text-red-500"}`}>
                    {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {isUp ? "+" : ""}{priceChange.toFixed(2)} ({priceChangePct.toFixed(2)}%)
                  </p>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Market Cap", value: stock.market_cap ? `₹${(stock.market_cap / 10000000).toFixed(0)} Cr` : "N/A" },
                  { label: "P/E Ratio", value: stock.pe_ratio?.toFixed(2) || "N/A" },
                  { label: "52W High", value: `₹${stock.fifty_two_week_high?.toLocaleString("en-IN")}` },
                  { label: "52W Low", value: `₹${stock.fifty_two_week_low?.toLocaleString("en-IN")}` },
                ].map((m) => (
                  <Card key={m.label} className="p-4">
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className="text-lg font-bold text-foreground mt-1">{m.value}</p>
                  </Card>
                ))}
              </div>

              {/* Price Chart */}
              {chartData.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Price Movement — {symbol}</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="date" stroke="#6B7280" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#6B7280" domain={["dataMin - 10", "dataMax + 10"]} />
                      <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px" }} />
                      <Legend />
                      <Area type="monotone" dataKey="price" fill="#10B981" stroke="#10B981" fillOpacity={0.1} name="Close Price (₹)" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {/* Volume Chart */}
              {chartData.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Trading Volume</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="date" stroke="#6B7280" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#6B7280" />
                      <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px" }} />
                      <Bar dataKey="volume" fill="#6366F1" name="Volume" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {/* Technical Indicators + Patterns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Indicators */}
                {indicators && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Technical Indicators</h3>
                    <div className="space-y-3">
                      {[
                        { label: "RSI (14)", value: indicators.rsi, signal: indicators.rsi_signal },
                        { label: "MACD", value: indicators.macd, signal: indicators.macd_crossover },
                        { label: "ADX", value: indicators.adx, signal: indicators.trend_strength + " Trend" },
                        { label: "Stochastic %K", value: indicators.stoch_k, signal: indicators.stoch_k > 80 ? "Overbought" : indicators.stoch_k < 20 ? "Oversold" : "Neutral" },
                        { label: "SMA 20", value: `₹${indicators.sma_20}`, signal: indicators.price_vs_sma20 },
                        { label: "SMA 50", value: `₹${indicators.sma_50}`, signal: indicators.price_vs_sma50 },
                        { label: "BB Upper", value: `₹${indicators.bb_upper}`, signal: "" },
                        { label: "BB Lower", value: `₹${indicators.bb_lower}`, signal: "" },
                        { label: "Volume Ratio", value: `${indicators.volume_ratio}x`, signal: indicators.volume_signal },
                      ].map((row) => (
                        <div key={row.label} className="flex justify-between items-center pb-2 border-b border-border last:border-0">
                          <span className="text-sm text-muted-foreground">{row.label}</span>
                          <div className="text-right">
                            <span className="font-semibold text-foreground">{row.value}</span>
                            {row.signal && (
                              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                                row.signal.includes("Bullish") || row.signal === "Above" || row.signal === "Oversold"
                                  ? "bg-green-100 text-green-700"
                                  : row.signal.includes("Bearish") || row.signal === "Below" || row.signal === "Overbought"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}>
                                {row.signal}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Patterns Detected */}
                <div className="space-y-6">
                  {patterns.length > 0 && (
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4">🔍 Patterns Detected</h3>
                      <div className="space-y-4">
                        {patterns.map((p: any, i: number) => (
                          <div key={i} className={`p-4 rounded-lg border-l-4 ${
                            p.type === "Bullish" ? "border-green-500 bg-green-50" :
                            p.type === "Bearish" ? "border-red-500 bg-red-50" :
                            "border-yellow-500 bg-yellow-50"
                          }`}>
                            <div className="flex justify-between items-start">
                              <h4 className="font-semibold">{p.name}</h4>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                p.type === "Bullish" ? "bg-green-200 text-green-800" :
                                p.type === "Bearish" ? "bg-red-200 text-red-800" :
                                "bg-yellow-200 text-yellow-800"
                              }`}>{p.type}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">{p.description}</p>
                            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                              <span>Confidence: {p.confidence}%</span>
                              <span>Backtest Win Rate: {p.backtest_winrate}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Support & Resistance */}
                  {sr && (
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Support & Resistance</h3>
                      <div className="space-y-2">
                        {[
                          { label: "Resistance 2", value: sr.resistance_2, color: "text-red-500" },
                          { label: "Resistance 1", value: sr.resistance_1, color: "text-red-400" },
                          { label: "Pivot", value: sr.pivot, color: "text-blue-500" },
                          { label: "Support 1", value: sr.support_1, color: "text-green-400" },
                          { label: "Support 2", value: sr.support_2, color: "text-green-500" },
                        ].map((level) => (
                          <div key={level.label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                            <span className="text-sm text-muted-foreground">{level.label}</span>
                            <span className={`font-mono font-semibold ${level.color}`}>₹{level.value?.toLocaleString("en-IN")}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              </div>

              {/* Signal Summary */}
              {technicals?.signal_summary && (
                <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                  <h3 className="text-lg font-semibold mb-2">📊 AI Signal Summary</h3>
                  <p className="text-foreground text-lg">{technicals.signal_summary}</p>
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
