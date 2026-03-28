import { Button } from "@/components/ui/button"
import { ProjectShowcase } from "@/components/ui/project-showcase"
import { StatCard } from "@/components/StatCard"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { GlobePulse } from "@/components/ui/globe-pulse"
import { TrendingUp, BarChart3, Zap, Globe, ArrowRight, CheckCircle } from "lucide-react"
import { Link } from "wouter"

/**
 * Home Page
 * 
 * Landing page showcasing TradeBuddy's core features and value proposition.
 * 
 * Design: Modern Financial Minimalism
 * - Hero section with background image and clear CTA
 * - Feature cards with icons and descriptions
 * - Statistics and social proof
 * - Global market visualization with COBE globe
 * - Smooth scrolling and responsive layout
 */
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('https://d2xsxph8kpxj0f.cloudfront.net/310519663486858023/oJUkn6AYEJgPyyLcwPCRvM/hero-background-NqAntz3WMW9do4i7DXSJwj.webp')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-white/80" />
        </div>

        {/* Content */}
        <div className="relative z-10 container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-success/10 border border-accent-success/20">
                <span className="text-xs font-semibold text-accent-success">🚀 REAL-TIME INSIGHTS</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                Make Smarter Stock Decisions
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                TradeBuddy delivers real-time market analysis, AI-powered insights, and institutional-grade data to help you stay ahead of market movements.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/analysis">
                  <Button className="bg-primary hover:bg-primary/90 text-white h-12 px-8 text-base font-medium">
                    Start Analyzing
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Button variant="outline" className="h-12 px-8 text-base font-medium">
                  Watch Demo
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-success to-primary border-2 border-white"
                    />
                  ))}
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-foreground">10,000+ traders</p>
                  <p className="text-muted-foreground">trust TradeBuddy daily</p>
                </div>
              </div>
            </div>

            {/* Right: Globe Visualization */}
            <div className="hidden lg:block">
              <div className="relative w-full aspect-square">
                <GlobePulse className="w-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-16 bg-secondary border-y border-border">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary mb-2">50M+</p>
              <p className="text-sm text-muted-foreground">Data Points Daily</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary mb-2">24/7</p>
              <p className="text-sm text-muted-foreground">Market Coverage</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary mb-2">&lt;100ms</p>
              <p className="text-sm text-muted-foreground">Data Latency</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary mb-2">99.9%</p>
              <p className="text-sm text-muted-foreground">Uptime SLA</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 md:py-28">
        <div className="container">
          {/* Section Header */}
          <div className="text-center mb-8 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Powerful Features for Serious Traders
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to analyze stocks, track market movements, and make informed investment decisions.
            </p>
          </div>

          {/* Interactive Feature Showcase */}
          <ProjectShowcase heading="Explore Our Tools" />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-20 md:py-28 bg-secondary">
        <div className="container">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Get started with TradeBuddy in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: "Sign Up",
                description: "Create your account in seconds. No credit card required to explore.",
              },
              {
                step: 2,
                title: "Build Your Watchlist",
                description: "Add stocks you want to track. Customize your dashboard and alerts.",
              },
              {
                step: 3,
                title: "Start Trading Smarter",
                description: "Get real-time insights and make data-driven investment decisions.",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                {/* Step Number */}
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white font-bold text-lg mb-4">
                  {item.step}
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">
                  {item.description}
                </p>

                {/* Connector Line */}
                {item.step < 3 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-0.5 bg-border -ml-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 md:py-28 bg-gradient-to-r from-primary to-primary/90">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Trade Smarter?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of traders who are already using TradeBuddy to make better investment decisions.
          </p>
          <Button className="bg-white hover:bg-white/90 text-primary font-semibold px-8 h-12 text-base">
            Start Free Trial
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
