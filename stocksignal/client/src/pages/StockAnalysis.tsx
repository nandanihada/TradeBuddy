import { useState } from "react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { StatCard } from "@/components/StatCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
  AreaChart,
} from "recharts"
import { Search, TrendingUp, TrendingDown, Activity, Volume2 } from "lucide-react"

/**
 * Stock Analysis Page
 * 
 * Core feature page for detailed stock analysis and visualization.
 * 
 * Design: Modern Financial Minimalism
 * - Clean data presentation with charts
 * - Real-time metrics and indicators
 * - Responsive grid layout
 * - Interactive chart interactions
 */

// Sample data for demonstration
const chartData = [
  { date: "Jan 1", price: 150.2, volume: 2400, ma20: 148.5 },
  { date: "Jan 2", price: 152.1, volume: 2210, ma20: 149.2 },
  { date: "Jan 3", price: 151.8, volume: 2290, ma20: 150.1 },
  { date: "Jan 4", price: 154.3, volume: 2000, ma20: 151.5 },
  { date: "Jan 5", price: 156.7, volume: 2181, ma20: 152.8 },
  { date: "Jan 6", price: 155.2, volume: 2500, ma20: 153.9 },
  { date: "Jan 7", price: 157.8, volume: 2100, ma20: 155.2 },
  { date: "Jan 8", price: 159.4, volume: 2300, ma20: 156.5 },
  { date: "Jan 9", price: 158.9, volume: 2400, ma20: 157.6 },
  { date: "Jan 10", price: 161.2, volume: 2210, ma20: 158.8 },
]

const volumeData = [
  { date: "Jan 1", volume: 2400, avgVolume: 2200 },
  { date: "Jan 2", volume: 2210, avgVolume: 2200 },
  { date: "Jan 3", volume: 2290, avgVolume: 2200 },
  { date: "Jan 4", volume: 2000, avgVolume: 2200 },
  { date: "Jan 5", volume: 2181, avgVolume: 2200 },
  { date: "Jan 6", volume: 2500, avgVolume: 2200 },
  { date: "Jan 7", volume: 2100, avgVolume: 2200 },
  { date: "Jan 8", volume: 2300, avgVolume: 2200 },
  { date: "Jan 9", volume: 2400, avgVolume: 2200 },
  { date: "Jan 10", volume: 2210, avgVolume: 2200 },
]

export default function StockAnalysis() {
  const [selectedStock, setSelectedStock] = useState("AAPL")
  const [timeframe, setTimeframe] = useState("1M")

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 w-full py-8">
        <div className="container space-y-8">
          {/* Header Section */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Stock Analysis
              </h1>
              <p className="text-muted-foreground">
                Deep dive into technical and fundamental analysis with real-time data
              </p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search stock symbol (e.g., AAPL, GOOGL, MSFT)"
                  className="pl-10"
                  value={selectedStock}
                  onChange={(e) => setSelectedStock(e.target.value.toUpperCase())}
                />
              </div>
              <div className="flex gap-2">
                {["1D", "1W", "1M", "3M", "1Y", "5Y"].map((tf) => (
                  <Button
                    key={tf}
                    variant={timeframe === tf ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeframe(tf)}
                    className="text-xs"
                  >
                    {tf}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Stock Header */}
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold text-foreground">
                  {selectedStock}
                </h2>
                <p className="text-muted-foreground text-sm">
                  Apple Inc. • NASDAQ
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-foreground">$161.20</p>
                <p className="text-accent-success font-semibold flex items-center justify-end gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +7.35% (10 days)
                </p>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Current Price"
              value="$161.20"
              change={7.35}
              trend="up"
              icon={<TrendingUp className="w-5 h-5 text-accent-success" />}
            />
            <StatCard
              label="Market Cap"
              value="$2.5T"
              icon={<Activity className="w-5 h-5 text-primary" />}
            />
            <StatCard
              label="Volume"
              value="52.3M"
              change={-3.2}
              trend="down"
              icon={<Volume2 className="w-5 h-5 text-accent-alert" />}
            />
            <StatCard
              label="P/E Ratio"
              value="28.5"
              icon={<Activity className="w-5 h-5 text-primary" />}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Price Chart - Full Width */}
            <Card className="lg:col-span-3 p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Price Movement
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Last 10 days with 20-day moving average
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" domain={["dataMin - 5", "dataMax + 5"]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="price"
                      fill="#10B981"
                      stroke="#10B981"
                      fillOpacity={0.1}
                      name="Price"
                    />
                    <Line
                      type="monotone"
                      dataKey="ma20"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={false}
                      name="20-Day MA"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Volume Chart */}
            <Card className="lg:col-span-2 p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Trading Volume
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Daily volume vs average
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="volume" fill="#10B981" name="Volume" />
                    <Bar
                      dataKey="avgVolume"
                      fill="#E5E7EB"
                      name="Avg Volume"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Technical Indicators */}
            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Technical Indicators
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-border">
                    <span className="text-sm text-muted-foreground">RSI (14)</span>
                    <span className="font-semibold text-foreground">65.2</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-border">
                    <span className="text-sm text-muted-foreground">MACD</span>
                    <span className="font-semibold text-accent-success">Bullish</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-border">
                    <span className="text-sm text-muted-foreground">Bollinger Bands</span>
                    <span className="font-semibold text-foreground">Upper</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Stochastic</span>
                    <span className="font-semibold text-foreground">72.5</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Analysis Summary */}
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Analysis Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    Sentiment
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-accent-success" />
                    <span className="text-sm text-foreground">Bullish</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Strong uptrend with positive momentum
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    Support Level
                  </h4>
                  <p className="text-sm font-mono text-foreground">$155.50</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Key support identified
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    Resistance Level
                  </h4>
                  <p className="text-sm font-mono text-foreground">$165.00</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Watch for breakout
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* News Section */}
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Recent News
              </h3>
              <div className="space-y-4">
                {[
                  {
                    title: "Apple Q4 Earnings Beat Expectations",
                    date: "Jan 10, 2026",
                    sentiment: "positive",
                  },
                  {
                    title: "iPhone 15 Pro Sales Surge in Asia",
                    date: "Jan 9, 2026",
                    sentiment: "positive",
                  },
                  {
                    title: "Tech Sector Faces Regulatory Scrutiny",
                    date: "Jan 8, 2026",
                    sentiment: "negative",
                  },
                ].map((news, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 pb-4 border-b border-border last:border-0"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        news.sentiment === "positive"
                          ? "bg-accent-success"
                          : "bg-accent-alert"
                      }`}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">
                        {news.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {news.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
