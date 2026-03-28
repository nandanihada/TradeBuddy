import { ReactNode } from "react"

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  accent?: "success" | "alert" | "neutral"
}

/**
 * FeatureCard Component
 * 
 * Displays a feature with icon, title, and description.
 * Used in landing page feature sections.
 * 
 * Design: Modern Financial Minimalism
 * - Subtle borders and shadows
 * - Icon with accent color
 * - Clean typography hierarchy
 */
export function FeatureCard({
  icon,
  title,
  description,
  accent = "neutral",
}: FeatureCardProps) {
  const accentColors = {
    success: "text-accent-success",
    alert: "text-accent-alert",
    neutral: "text-primary",
  }

  return (
    <div className="group p-6 rounded-lg border border-border bg-white hover:shadow-md transition-shadow duration-300">
      {/* Icon */}
      <div className={`w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${accentColors[accent]}`}>
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  )
}
