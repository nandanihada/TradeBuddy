import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Zap, Building2, DollarSign } from "lucide-react"

/**
 * Big Money Tracker Page
 * 
 * Track institutional flows, block trades, and whale activities.
 * 
 * Design: Modern Financial Minimalism
 * - Transaction-focused layout
 * - Clear institutional activity indicators
 * - Real-time tracking data
 */

export default function BigMoneyTracker() {
  const institutionalTrades = [
    {
      id: 1,
      institution: "Berkshire Hathaway",
      stock: "AAPL",
      type: "BUY",
      quantity: "2.5M shares",
      value: "$402.5M",
      time: "2:15 PM",
      sentiment: "bullish",
    },
    {
      id: 2,
      institution: "BlackRock",
      stock: "MSFT",
      type: "SELL",
      quantity: "1.8M shares",
      value: "$612.3M",
      time: "1:42 PM",
      sentiment: "bearish",
    },
    {
      id: 3,
      institution: "Vanguard",
      stock: "GOOGL",
      type: "BUY",
      quantity: "890K shares",
      value: "$118.4M",
      time: "1:28 PM",
      sentiment: "bullish",
    },
    {
      id: 4,
      institution: "State Street",
      stock: "AMZN",
      type: "BUY",
      quantity: "3.2M shares",
      value: "$571.8M",
      time: "12:55 PM",
      sentiment: "bullish",
    },
    {
      id: 5,
      institution: "Fidelity",
      stock: "NVDA",
      type: "SELL",
      quantity: "1.1M shares",
      value: "$963.2M",
      time: "12:30 PM",
      sentiment: "bearish",
    },
  ]

  const blockTrades = [
    {
      id: 1,
      seller: "Unknown Seller",
      buyer: "Unknown Buyer",
      stock: "TSLA",
      quantity: "500K shares",
      value: "$121.1M",
      premium: "+2.3%",
      time: "3:45 PM",
    },
    {
      id: 2,
      seller: "Institutional Fund",
      buyer: "Hedge Fund",
      stock: "META",
      quantity: "750K shares",
      value: "$377M",
      premium: "+1.8%",
      time: "3:22 PM",
    },
    {
      id: 3,
      seller: "Private Equity",
      buyer: "Institutional Buyer",
      stock: "NFLX",
      quantity: "300K shares",
      value: "$95.7M",
      premium: "+0.9%",
      time: "2:58 PM",
    },
  ]

  const whaleWatchlist = [
    {
      whale: "Elon Musk",
      company: "Tesla",
      position: "$182.5B",
      change: "+$4.2B",
      trend: "up",
      activity: "Recent accumulation",
    },
    {
      whale: "Warren Buffett",
      company: "Berkshire Hathaway",
      position: "$652.3B",
      change: "+$12.1B",
      trend: "up",
      activity: "Increasing AAPL position",
    },
    {
      whale: "Mark Zuckerberg",
      company: "Meta",
      position: "$185.4B",
      change: "+$18.3B",
      trend: "up",
      activity: "AI investment phase",
    },
    {
      whale: "Larry Page",
      company: "Alphabet",
      position: "$142.7B",
      change: "-$2.1B",
      trend: "down",
      activity: "Slight profit taking",
    },
  ]

  const insiderTrades = [
    {
      company: "Apple",
      insider: "CEO Tim Cook",
      type: "SELL",
      shares: "50K",
      value: "$8.06M",
      date: "Jan 9, 2026",
    },
    {
      company: "Microsoft",
      insider: "CFO Amy Hood",
      type: "BUY",
      shares: "25K",
      value: "$8.52M",
      date: "Jan 8, 2026",
    },
    {
      company: "Tesla",
      insider: "Board Member",
      type: "SELL",
      shares: "100K",
      value: "$24.22M",
      date: "Jan 7, 2026",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 w-full py-8">
        <div className="container space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">
              Big Money Tracker
            </h1>
            <p className="text-muted-foreground">
              Track institutional flows, block trades, and whale activities in
              real-time
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Today's Block Trades
                  </p>
                  <p className="text-3xl font-bold text-foreground">$1.59B</p>
                </div>
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Institutional Buys
                  </p>
                  <p className="text-3xl font-bold text-accent-success">
                    +$1.09B
                  </p>
                </div>
                <TrendingUp className="w-6 h-6 text-accent-success" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Institutional Sells
                  </p>
                  <p className="text-3xl font-bold text-accent-alert">
                    -$1.58B
                  </p>
                </div>
                <TrendingDown className="w-6 h-6 text-accent-alert" />
              </div>
            </Card>
          </div>

          {/* Institutional Trades */}
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Latest Institutional Trades
            </h2>
            <div className="space-y-3">
              {institutionalTrades.map((trade) => (
                <Card key={trade.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-foreground">
                          {trade.institution}
                        </h3>
                        <Badge
                          variant={
                            trade.type === "BUY" ? "default" : "secondary"
                          }
                        >
                          {trade.type}
                        </Badge>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{trade.stock}</span>
                        <span>{trade.quantity}</span>
                        <span>{trade.time}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground mb-1">
                        {trade.value}
                      </p>
                      <div
                        className={`flex items-center justify-end gap-1 text-sm font-semibold ${
                          trade.sentiment === "bullish"
                            ? "text-accent-success"
                            : "text-accent-alert"
                        }`}
                      >
                        {trade.sentiment === "bullish" ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {trade.sentiment === "bullish" ? "Bullish" : "Bearish"}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Block Trades */}
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Block Trades (Off-Exchange)
            </h2>
            <div className="space-y-3">
              {blockTrades.map((trade) => (
                <Card key={trade.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Zap className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-foreground">
                          {trade.stock}
                        </h3>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{trade.quantity}</span>
                        <span>{trade.time}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground mb-1">
                        {trade.value}
                      </p>
                      <p className="text-sm text-accent-success font-semibold">
                        {trade.premium} premium
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Whale Watchlist */}
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Whale Watchlist
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {whaleWatchlist.map((whale) => (
                <Card key={whale.whale} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {whale.whale}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {whale.company}
                      </p>
                    </div>
                    <Badge variant="outline">{whale.activity}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Net Worth
                      </span>
                      <span className="font-bold text-foreground">
                        {whale.position}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Change (30d)
                      </span>
                      <span
                        className={`font-semibold ${
                          whale.trend === "up"
                            ? "text-accent-success"
                            : "text-accent-alert"
                        }`}
                      >
                        {whale.change}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Insider Trades */}
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Insider Trades
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Company
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Insider
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Type
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-foreground">
                      Shares
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-foreground">
                      Value
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {insiderTrades.map((trade, idx) => (
                    <tr key={idx} className="border-b border-border hover:bg-secondary">
                      <td className="py-3 px-4 text-foreground font-medium">
                        {trade.company}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {trade.insider}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            trade.type === "BUY" ? "default" : "secondary"
                          }
                        >
                          {trade.type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right text-foreground">
                        {trade.shares}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-foreground">
                        {trade.value}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {trade.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
