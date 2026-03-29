import { useState } from "react"
import { Link, useLocation } from "wouter"
import { Button } from "@/components/ui/button"
import { NavbarAvatar } from "@/components/ui/avatar-picker"
import { useAuth } from "@/contexts/AuthContext"

const navItems = [
  { label: "Home", href: "/" },
  { label: "Analysis", href: "/analysis" },
  { label: "Morning Briefing", href: "/briefing" },
  { label: "Big Money Tracker", href: "/tracker" },
]

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, signOut } = useAuth()
  const [, setLocation] = useLocation()

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-border shadow-sm">
      <div className="container flex items-center justify-between h-20">
        {/* Logo */}
        <Link href="/">
          <a className="flex items-center shrink-0 hover:opacity-80 transition-opacity">
            <img
              src="/logo_tradebuddy.png"
              alt="TradeBuddy"
              className="h-36 w-auto object-contain"
            />
          </a>
        </Link>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 z-20"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          <div className={`w-6 h-0.5 bg-[#262626] mb-1.5 transition-transform duration-300 ${isMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <div className={`w-6 h-0.5 bg-[#262626] mb-1.5 transition-opacity duration-300 ${isMenuOpen ? "opacity-0" : ""}`} />
          <div className={`w-6 h-0.5 bg-[#262626] transition-transform duration-300 ${isMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>

        {/* Desktop Nav Links with hover effect */}
        <div className="hidden md:flex items-center gap-2 lg:gap-4">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href}>
              <a className="relative inline-block group">
                <span className="relative z-10 block uppercase text-[#262626] font-sans font-semibold transition-colors duration-300 group-hover:text-white text-sm lg:text-base py-2 px-3 lg:px-4">
                  {item.label}
                </span>
                <span className="absolute inset-0 border-t-2 border-b-2 border-[#262626] transform scale-y-[2] opacity-0 transition-all duration-300 origin-center group-hover:scale-y-100 group-hover:opacity-100" />
                <span className="absolute top-[2px] left-0 w-full h-full bg-[#262626] transform scale-0 opacity-0 transition-all duration-300 origin-top group-hover:scale-100 group-hover:opacity-100" />
              </a>
            </Link>
          ))}
        </div>

        {/* CTA Buttons / User Avatar */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">{user.email?.split("@")[0]}</span>
              <NavbarAvatar />
              <Button variant="outline" size="sm" onClick={() => { signOut(); setLocation("/") }}>
                Log Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <a className="relative inline-block group">
                  <span className="relative z-10 block text-sm font-semibold text-[#262626] transition-colors duration-300 group-hover:text-white py-2 px-3">
                    Log In
                  </span>
                  <span className="absolute inset-0 border-t-2 border-b-2 border-[#262626] transform scale-y-[2] opacity-0 transition-all duration-300 origin-center group-hover:scale-y-100 group-hover:opacity-100" />
                  <span className="absolute top-[2px] left-0 w-full h-full bg-[#262626] transform scale-0 opacity-0 transition-all duration-300 origin-top group-hover:scale-100 group-hover:opacity-100" />
                </a>
              </Link>
              <Link href="/signup">
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-border px-4 pb-4">
          <ul className="flex flex-col items-center space-y-4 py-4">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link href={item.href}>
                  <a
                    className="relative inline-block group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="relative z-10 block uppercase text-[#262626] font-sans font-semibold transition-colors duration-300 group-hover:text-white text-lg py-2 px-4">
                      {item.label}
                    </span>
                    <span className="absolute inset-0 border-t-2 border-b-2 border-[#262626] transform scale-y-[2] opacity-0 transition-all duration-300 origin-center group-hover:scale-y-100 group-hover:opacity-100" />
                    <span className="absolute top-[2px] left-0 w-full h-full bg-[#262626] transform scale-0 opacity-0 transition-all duration-300 origin-top group-hover:scale-100 group-hover:opacity-100" />
                  </a>
                </Link>
              </li>
            ))}
            <li className="pt-2 flex gap-3">
              <Link href="/login">
                <a className="text-sm font-medium" onClick={() => setIsMenuOpen(false)}>Log In</a>
              </Link>
              <Link href="/signup">
                <Button className="bg-primary hover:bg-primary/90 text-white" onClick={() => setIsMenuOpen(false)}>
                  Sign Up
                </Button>
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  )
}
