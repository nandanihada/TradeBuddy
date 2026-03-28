import { ReactNode } from "react"
import { ArrowUp, ArrowDown } from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  change?: number
  icon?: ReactNode
  trend?: "up" | "down" | "neutral"
}

/**
 * StatCard Component
 * 
 * Displays a key metric with optional trend indicator.
 * Used in dashboards and analysis pages.
 * 
 * Design: Modern Financial Minimalism
 * - Monospace font for numeric values
 * - Color-coded trend indicators (green/red)
 * - Subtle shadows and borders
 */
export function StatCard({
  label,
  value,
  change,
  icon,
  trend = "neutral",
}: StatCardProps) {
  const trendColors = {
    up: "text-accent-success",
    down: "text-accent-alert",
    neutral: "text-muted-foreground",
  }

  const bgColors = {
    up: "bg-accent-success/10",
    down: "bg-accent-alert/10",
    neutral: "bg-secondary",
  }

  return (
    <div className="p-4 rounded-lg border border-border bg-white hover:shadow-sm transition-shadow">
      {/* Header with icon and label */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        {icon && (
          <div className={`p-2 rounded-md ${bgColors[trend]}`}>
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-2">
        <p className="text-2xl font-bold text-foreground font-mono">
          {value}
        </p>
      </div>

      {/* Change indicator */}
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-sm font-medium ${trendColors[trend]}`}>
          {trend === "up" && <ArrowUp className="w-4 h-4" />}
          {trend === "down" && <ArrowDown className="w-4 h-4" />}
          <span>{Math.abs(change)}%</span>
        </div>
      )}
    </div>
  )
}
