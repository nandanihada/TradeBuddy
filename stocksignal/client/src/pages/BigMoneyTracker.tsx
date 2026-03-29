import { useState, useEffect } from "react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Card } from "@/components/ui/card"
import { Loader2, Building2, Landmark } from "lucide-react"
import { getFiiDiiData, getBulkDeals, getInstitutionalActivity } from "@/lib/api"
import PageLoader from "@/components/ui/page-loader"

export default function BigMoneyTracker() {
  const [fiiDii, setFiiDii] = useState<any>(null)
  const [bulkDeals, setBulkDeals] = useState<any>(null)
  const [institutional, setInstitutional] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const [fii, bulk, inst] = await Promise.all([
          getFiiDiiData(),
          getBulkDeals(),
          getInstitutionalActivity(),
        ])
        setFiiDii(fii)
        setBulkDeals(bulk)
        setInstitutional(inst)
      } catch (e) {
        console.error("Failed to fetch tracker data", e)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const fiiData = fiiDii?.data || []
  const bulkList = bulkDeals?.BULK_DEALS_DATA || []
  const blockList = bulkDeals?.BLOCK_DEALS_DATA || []

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 w-full py-8">
        <div className="container space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">🏦 Big Money Tracker</h1>
            <p className="text-muted-foreground">Track FII/DII flows, bulk deals, block deals, and institutional activity in real-time</p>
          </div>

          {loading && (
            <PageLoader
              words={["Tracking", "FII", "DII", "Institutions", "Block Deals", "Whale Activity"]}
              message="Fetching institutional data from NSE..."
            />
          )}

          {!loading && (
            <>
              {/* Institutional Summary */}
              {institutional?.summary && (
                <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                  <h3 className="text-lg font-semibold mb-2">📊 Market Sentiment</h3>
                  <p className="text-foreground text-lg">{institutional.summary}</p>
                </Card>
              )}

              {/* FII/DII Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {institutional?.fii && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Landmark className="w-5 h-5 text-blue-600" />
                      FII / FPI Activity
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Buy Value</span>
                        <span className="font-semibold text-green-600">₹{parseFloat(institutional.fii.buyValue || 0).toLocaleString("en-IN")} Cr</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Sell Value</span>
                        <span className="font-semibold text-red-500">₹{parseFloat(institutional.fii.sellValue || 0).toLocaleString("en-IN")} Cr</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-muted-foreground">Net Value</span>
                        <span className={`font-bold text-lg ${parseFloat(institutional.fii.netValue || 0) >= 0 ? "text-green-600" : "text-red-500"}`}>
                          ₹{parseFloat(institutional.fii.netValue || 0).toLocaleString("en-IN")} Cr
                        </span>
                      </div>
                    </div>
                  </Card>
                )}

                {institutional?.dii && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-green-600" />
                      DII Activity
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Buy Value</span>
                        <span className="font-semibold text-green-600">₹{parseFloat(institutional.dii.buyValue || 0).toLocaleString("en-IN")} Cr</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Sell Value</span>
                        <span className="font-semibold text-red-500">₹{parseFloat(institutional.dii.sellValue || 0).toLocaleString("en-IN")} Cr</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-muted-foreground">Net Value</span>
                        <span className={`font-bold text-lg ${parseFloat(institutional.dii.netValue || 0) >= 0 ? "text-green-600" : "text-red-500"}`}>
                          ₹{parseFloat(institutional.dii.netValue || 0).toLocaleString("en-IN")} Cr
                        </span>
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              {/* Bulk Deals */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">💰 Recent Bulk Deals</h3>
                {bulkList.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 text-muted-foreground font-medium">Symbol</th>
                          <th className="text-left py-2 text-muted-foreground font-medium">Client</th>
                          <th className="text-right py-2 text-muted-foreground font-medium">Buy/Sell</th>
                          <th className="text-right py-2 text-muted-foreground font-medium">Qty</th>
                          <th className="text-right py-2 text-muted-foreground font-medium">Price (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkList.slice(0, 20).map((deal: any, i: number) => (
                          <tr key={i} className="border-b border-border last:border-0">
                            <td className="py-2 font-medium">{deal.symbol}</td>
                            <td className="py-2 text-muted-foreground">{deal.clientName?.slice(0, 30)}</td>
                            <td className={`py-2 text-right font-semibold ${deal.buySell === "BUY" ? "text-green-600" : "text-red-500"}`}>
                              {deal.buySell}
                            </td>
                            <td className="py-2 text-right font-mono">{parseInt(deal.qty || 0).toLocaleString("en-IN")}</td>
                            <td className="py-2 text-right font-mono">₹{parseFloat(deal.wAvgPrice || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No bulk deals data available. NSE data may be temporarily unavailable.</p>
                )}
              </Card>

              {/* Block Deals */}
              {blockList.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">🔒 Block Deals</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 text-muted-foreground font-medium">Symbol</th>
                          <th className="text-left py-2 text-muted-foreground font-medium">Client</th>
                          <th className="text-right py-2 text-muted-foreground font-medium">Buy/Sell</th>
                          <th className="text-right py-2 text-muted-foreground font-medium">Qty</th>
                          <th className="text-right py-2 text-muted-foreground font-medium">Price (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {blockList.slice(0, 20).map((deal: any, i: number) => (
                          <tr key={i} className="border-b border-border last:border-0">
                            <td className="py-2 font-medium">{deal.symbol}</td>
                            <td className="py-2 text-muted-foreground">{deal.clientName?.slice(0, 30)}</td>
                            <td className={`py-2 text-right font-semibold ${deal.buySell === "BUY" ? "text-green-600" : "text-red-500"}`}>
                              {deal.buySell}
                            </td>
                            <td className="py-2 text-right font-mono">{parseInt(deal.qty || 0).toLocaleString("en-IN")}</td>
                            <td className="py-2 text-right font-mono">₹{parseFloat(deal.wAvgPrice || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
