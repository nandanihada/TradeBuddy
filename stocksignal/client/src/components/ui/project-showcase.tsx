"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { ArrowUpRight } from "lucide-react"

interface Project {
  title: string
  description: string
  year: string
  link: string
  image: string
}

interface ProjectShowcaseProps {
  items?: Project[]
  heading?: string
}

const defaultProjects: Project[] = [
  {
    title: "Stock Analysis",
    description: "Deep technical and fundamental analysis with AI-powered insights.",
    year: "Core",
    link: "/analysis",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop",
  },
  {
    title: "Morning Briefing",
    description: "Curated market insights, top movers, and economic calendar events.",
    year: "Core",
    link: "/briefing",
    image: "https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=600&h=400&fit=crop",
  },
  {
    title: "Big Money Tracker",
    description: "Track institutional flows, block trades, and whale activities.",
    year: "Pro",
    link: "/tracker",
    image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=600&h=400&fit=crop",
  },
  {
    title: "Real-Time Alerts",
    description: "Instant notifications on price movements and technical breakouts.",
    year: "Pro",
    link: "#",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f2?w=600&h=400&fit=crop",
  },
  {
    title: "Portfolio Tracking",
    description: "Monitor positions, track performance, and optimize allocation.",
    year: "Core",
    link: "#",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
  },
  {
    title: "Market Intelligence",
    description: "Earnings calendars, analyst ratings, and institutional holdings.",
    year: "Elite",
    link: "#",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&h=400&fit=crop",
  },
]

export function ProjectShowcase({ items, heading = "Our Features" }: ProjectShowcaseProps) {
  const projects = items ?? defaultProjects
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [smoothPosition, setSmoothPosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor

    const animate = () => {
      setSmoothPosition((prev) => ({
        x: lerp(prev.x, mousePosition.x, 0.15),
        y: lerp(prev.y, mousePosition.y, 0.15),
      }))
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [mousePosition])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }
  }

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index)
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    setHoveredIndex(null)
    setIsVisible(false)
  }

  return (
    <section ref={containerRef} onMouseMove={handleMouseMove} className="relative w-full max-w-2xl mx-auto px-6 py-16">
      <h2 className="text-muted-foreground text-sm font-medium tracking-wide uppercase mb-8">{heading}</h2>

      <div
        className="pointer-events-none fixed z-50 overflow-hidden rounded-xl shadow-2xl"
        style={{
          left: containerRef.current?.getBoundingClientRect().left ?? 0,
          top: containerRef.current?.getBoundingClientRect().top ?? 0,
          transform: `translate3d(${smoothPosition.x + 20}px, ${smoothPosition.y - 100}px, 0)`,
          opacity: isVisible ? 1 : 0,
          scale: isVisible ? 1 : 0.8,
          transition: "opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), scale 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="relative w-[280px] h-[180px] bg-secondary rounded-xl overflow-hidden">
          {projects.map((project, index) => (
            <img
              key={project.title}
              src={project.image}
              alt={project.title}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out"
              style={{
                opacity: hoveredIndex === index ? 1 : 0,
                scale: hoveredIndex === index ? 1 : 1.1,
                filter: hoveredIndex === index ? "none" : "blur(10px)",
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
        </div>
      </div>

      <div className="space-y-0">
        {projects.map((project, index) => (
          <a
            key={project.title}
            href={project.link}
            className="group block"
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            <div className="relative py-5 border-t border-border transition-all duration-300 ease-out">
              <div
                className={`absolute inset-0 -mx-4 px-4 bg-secondary/50 rounded-lg transition-all duration-300 ease-out ${
                  hoveredIndex === index ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
              />
              <div className="relative flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-2">
                    <h3 className="text-foreground font-medium text-lg tracking-tight">
                      <span className="relative">
                        {project.title}
                        <span
                          className={`absolute left-0 -bottom-0.5 h-px bg-foreground transition-all duration-300 ease-out ${
                            hoveredIndex === index ? "w-full" : "w-0"
                          }`}
                        />
                      </span>
                    </h3>
                    <ArrowUpRight
                      className={`w-4 h-4 text-muted-foreground transition-all duration-300 ease-out ${
                        hoveredIndex === index ? "opacity-100 translate-x-0 translate-y-0" : "opacity-0 -translate-x-2 translate-y-2"
                      }`}
                    />
                  </div>
                  <p
                    className={`text-muted-foreground text-sm mt-1 leading-relaxed transition-all duration-300 ease-out ${
                      hoveredIndex === index ? "text-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {project.description}
                  </p>
                </div>
                <span
                  className={`text-xs font-mono text-muted-foreground tabular-nums transition-all duration-300 ease-out ${
                    hoveredIndex === index ? "text-foreground/60" : ""
                  }`}
                >
                  {project.year}
                </span>
              </div>
            </div>
          </a>
        ))}
        <div className="border-t border-border" />
      </div>
    </section>
  )
}
