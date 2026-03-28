import { Link } from "wouter"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

/**
 * NotFound Page (404)
 * 
 * Error page for missing routes.
 * 
 * Design: Modern Financial Minimalism
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <p className="text-6xl font-bold text-primary">404</p>
          <h1 className="text-3xl font-bold text-foreground">
            Page Not Found
          </h1>
        </div>

        <p className="text-muted-foreground">
          The page you're looking for doesn't exist or has been moved. Let's get
          you back on track.
        </p>

        <Link href="/">
          <Button className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
