import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Calendar, Clock, AlertCircle } from "lucide-react"

/**
 * Morning Briefing Page
 * 
 * Curated daily market insights and top movers.
 * 
 * Design: Modern Financial Minimalism
 * - Card-based layout for easy scanning
 * - Color-coded sentiment indicators
 * - Real-time market data
 */

export default function MorningBriefing() {
  const topMovers = [
    {
      symbol: "NVDA",
      name: "NVIDIA",
      price: 875.32,
      change: 12.5,
      volume: "45.2M",
      reason: "AI boom continues with strong earnings guidance",
    },
    {
      symbol: "TSLA",
      name: "Tesla",
      price: 242.18,
      change: -8.3,
      volume: "52.1M",
      reason: "Production concerns amid supply chain issues",
    },
    {
      symbol: "AMZN",
      name: "Amazon",
      price: 178.45,
      change: 5.2,
      volume: "38.9M",
      reason: "Cloud division shows strong growth trajectory",
    },
    {
      symbol: "META",
      name: "Meta",
      price: 502.67,
      change: 15.8,
      volume: "28.3M",
      reason: "AI investments paying off, ad revenue strong",
    },
  ]

  const economicCalendar = [
    {
      time: "08:30 AM",
      event: "Initial Jobless Claims",
      forecast: "210K",
      previous: "215K",
      importance: "high",
    },
    {
      time: "10:00 AM",
      event: "Consumer Sentiment Index",
      forecast: "72.5",
      previous: "70.2",
      importance: "medium",
    },
    {
      time: "02:00 PM",
      event: "Fed Chair Powell Speech",
      forecast: "-",
      previous: "-",
      importance: "high",
    },
  ]

  const marketIndices = [
    { name: "S&P 500", value: 4892.5, change: 2.3, status: "up" },
    { name: "Nasdaq-100", value: 18234.2, change: 3.1, status: "up" },
    { name: "Dow Jones", value: 38567.8, change: 1.8, status: "up" },
    { name: "VIX", value: 14.2, change: -5.2, status: "down" },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 w-full py-8">
        <div className="container space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">
              Morning Briefing
            </h1>
            <p className="text-muted-foreground">
              Your daily market snapshot • Friday, January 10, 2026
            </p>
          </div>

          {/* Market Indices */}
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Market Indices
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {marketIndices.map((index) => (
                <Card key={index.name} className="p-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    {index.name}
                  </p>
                  <p className="text-2xl font-bold text-foreground mb-2">
                    {index.value.toLocaleString()}
                  </p>
                  <div
                    className={`flex items-center gap-1 text-sm font-semibold ${
                      index.status === "up"
                        ? "text-accent-success"
                        : "text-accent-alert"
                    }`}
                  >
                    {index.status === "up" ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {Math.abs(index.change)}%
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Top Movers */}
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Top Movers
            </h2>
            <div className="space-y-4">
              {topMovers.map((stock) => (
                <Card key={stock.symbol} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-foreground">
                          {stock.symbol}
                        </h3>
                        <span className="text-sm text-muted-foreground">
                          {stock.name}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {stock.reason}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground mb-1">
                        ${stock.price.toFixed(2)}
                      </p>
                      <div
                        className={`flex items-center justify-end gap-1 font-semibold ${
                          stock.change > 0
                            ? "text-accent-success"
                            : "text-accent-alert"
                        }`}
                      >
                        {stock.change > 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {Math.abs(stock.change).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Volume: {stock.volume}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Economic Calendar */}
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Today's Economic Calendar
            </h2>
            <div className="space-y-3">
              {economicCalendar.map((item, idx) => (
                <Card key={idx} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-fit">
                        <Clock className="w-4 h-4" />
                        {item.time}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">
                          {item.event}
                        </h4>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Forecast: {item.forecast}</span>
                          <span>Previous: {item.previous}</span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        item.importance === "high" ? "default" : "secondary"
                      }
                      className="ml-4"
                    >
                      {item.importance === "high" ? "High Impact" : "Medium"}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Market Insights */}
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Market Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6 border-l-4 border-accent-success">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-accent-success flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Bullish Signals
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Tech stocks leading gains with strong earnings reports. AI
                      sector continues to attract institutional investment.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-l-4 border-accent-alert">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-accent-alert flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Watch Out
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Fed chair speech at 2 PM could trigger volatility. Energy
                      sector showing weakness amid economic concerns.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Sector Performance */}
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Sector Performance
            </h2>
            <div className="space-y-2">
              {[
                { name: "Technology", change: 3.2, status: "up" },
                { name: "Healthcare", change: 1.8, status: "up" },
                { name: "Financials", change: 2.1, status: "up" },
                { name: "Energy", change: -1.5, status: "down" },
                { name: "Consumer Discretionary", change: 0.9, status: "up" },
                { name: "Real Estate", change: -0.5, status: "down" },
              ].map((sector) => (
                <div key={sector.name} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <span className="font-medium text-foreground">
                    {sector.name}
                  </span>
                  <div
                    className={`flex items-center gap-1 font-semibold ${
                      sector.status === "up"
                        ? "text-accent-success"
                        : "text-accent-alert"
                    }`}
                  >
                    {sector.status === "up" ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {Math.abs(sector.change)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
