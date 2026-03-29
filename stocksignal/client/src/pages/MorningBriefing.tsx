import { useState, useEffect } from "react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle, TrendingUp, TrendingDown, Zap } from "lucide-react"
import { getAllSignals, getMarketOverview } from "@/lib/api"
import PageLoader from "@/components/ui/page-loader"

export default function MorningBriefing() {
  const [signals, setSignals] = useState<any[]>([])
  const [market, setMarket] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [signalData, marketData] = await Promise.all([
          getAllSignals(),
          getMarketOverview(),
        ])
        setSignals(signalData)
        setMarket(marketData)
      } catch (e: any) {
        setError("Failed to fetch signals. Backend may be loading — try again in a moment.")
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const filtered = filter === "all" ? signals : signals.filter((s) => s.type === filter)
  const highSeverity = signals.filter((s) => s.severity === "high")

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 w-full py-8">
        <div className="container space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              🔔 Opportunity Radar — Morning Briefing
            </h1>
            <p className="text-muted-foreground">
              AI-powered signal detection → enrichment → actionable alerts. 3-step agentic pipeline running autonomously.
            </p>
          </div>

          {/* Market Overview */}
          {market && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.values(market.indices || {}).map((idx: any) => (
                <Card key={idx.name} className="p-4">
                  <p className="text-xs text-muted-foreground">{idx.name}</p>
                  <p className="text-xl font-bold">₹{idx.price?.toLocaleString("en-IN")}</p>
                  <p className={`text-sm font-semibold ${idx.change_pct >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {idx.change_pct >= 0 ? "+" : ""}{idx.change_pct}%
                  </p>
                </Card>
              ))}
            </div>
          )}

          {/* Top Movers */}
          {market && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" /> Top Gainers
                </h3>
                <div className="space-y-2">
                  {(market.gainers || []).map((s: any) => (
                    <div key={s.symbol} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                      <span className="font-medium">{s.symbol}</span>
                      <div className="text-right">
                        <span className="font-mono">₹{s.price?.toLocaleString("en-IN")}</span>
                        <span className="ml-2 text-green-600 text-sm">+{s.change_pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-500" /> Top Losers
                </h3>
                <div className="space-y-2">
                  {(market.losers || []).map((s: any) => (
                    <div key={s.symbol} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                      <span className="font-medium">{s.symbol}</span>
                      <div className="text-right">
                        <span className="font-mono">₹{s.price?.toLocaleString("en-IN")}</span>
                        <span className="ml-2 text-red-500 text-sm">{s.change_pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Pipeline Status */}
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <div className="flex items-center gap-4 text-sm">
              <Zap className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-800">Agentic Pipeline:</span>
              <span className="text-blue-700">Step 1: Signal Detection</span>
              <span className="text-blue-400">→</span>
              <span className="text-blue-700">Step 2: AI Enrichment</span>
              <span className="text-blue-400">→</span>
              <span className="text-blue-700">Step 3: Actionable Alert</span>
            </div>
          </Card>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {[
              { key: "all", label: "All Signals" },
              { key: "technical", label: "📈 Technical" },
              { key: "bulk_deal", label: "💰 Bulk Deals" },
              { key: "fii_dii", label: "🏦 FII/DII" },
            ].map((f) => (
              <Button key={f.key} variant={filter === f.key ? "default" : "outline"} size="sm" onClick={() => setFilter(f.key)}>
                {f.label} {f.key === "all" ? `(${signals.length})` : `(${signals.filter((s) => s.type === f.key).length})`}
              </Button>
            ))}
          </div>

          {loading && (
            <PageLoader
              words={["Scanning", "NSE", "Bulk Deals", "FII/DII", "Patterns", "Enriching", "Signals"]}
              message="Running agentic pipeline — scanning markets, enriching signals..."
            />
          )}

          {error && (
            <Card className="p-6 text-center">
              <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-muted-foreground">{error}</p>
            </Card>
          )}

          {/* Signal Cards */}
          {!loading && filtered.length > 0 && (
            <div className="space-y-4">
              {filtered.map((signal, i) => (
                <Card key={i} className={`p-6 border-l-4 ${
                  signal.severity === "high" ? "border-l-red-500" : "border-l-yellow-500"
                }`}>
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{signal.title}</h3>
                      <p className="text-muted-foreground mt-1">{signal.description}</p>

                      {/* AI Enrichment */}
                      {signal.ai_enrichment && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                          <p className="text-xs font-semibold text-blue-700 mb-1">🤖 AI Enrichment (Step 2)</p>
                          <p className="text-sm text-blue-900 whitespace-pre-line">{signal.ai_enrichment}</p>
                        </div>
                      )}

                      {/* Actionable Alert */}
                      {signal.alert && signal.alert.action && (
                        <div className="mt-3 p-4 bg-green-50 rounded-lg border border-green-100">
                          <p className="text-xs font-semibold text-green-700 mb-1">🎯 Actionable Alert (Step 3)</p>
                          <p className="font-semibold text-green-900">{signal.alert.alert_title}</p>
                          <p className="text-sm text-green-800 mt-1">{signal.alert.action}</p>
                          {signal.alert.reasoning && (
                            <p className="text-xs text-green-700 mt-1">{signal.alert.reasoning}</p>
                          )}
                          <div className="flex gap-4 mt-2 text-xs text-green-600">
                            {signal.alert.risk_level && <span>Risk: {signal.alert.risk_level}</span>}
                            {signal.alert.time_horizon && <span>Horizon: {signal.alert.time_horizon}</span>}
                            {signal.alert.confidence && <span>Confidence: {signal.alert.confidence}%</span>}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        signal.type === "technical" ? "bg-purple-100 text-purple-700" :
                        signal.type === "bulk_deal" ? "bg-orange-100 text-orange-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {signal.type === "technical" ? "Technical" : signal.type === "bulk_deal" ? "Bulk Deal" : "FII/DII"}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        signal.severity === "high" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {signal.severity === "high" ? "High Priority" : "Medium"}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && !error && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No signals detected for this filter. Markets may be closed.</p>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
