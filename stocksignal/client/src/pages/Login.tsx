import * as React from "react"
import { motion } from "framer-motion"
import { ImageSlider } from "@/components/ui/image-slider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Chrome, Apple, ArrowRight } from "lucide-react"
import { Link } from "wouter"
import { useState } from "react"
import { toast } from "sonner"

/**
 * Login Page
 * 
 * User authentication page with image slider and form.
 * 
 * Design: Modern Financial Minimalism
 * - Split layout with visual slider on left
 * - Clean form on right with social auth options
 * - Smooth animations and transitions
 */

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [isLoading, setIsLoading] = useState(false)

  const images = [
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900https://images.unsplash.com/photo-1590080876-b0267e1e6e5e?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0auto=formathttps://images.unsplash.com/photo-1590080876-b0267e1e6e5e?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0fit=crophttps://images.unsplash.com/photo-1590080876-b0267e1e6e5e?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0q=60https://images.unsplash.com/photo-1590080876-b0267e1e6e5e?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900https://images.unsplash.com/photo-1611987867914-0ea5ddd13158?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0auto=formathttps://images.unsplash.com/photo-1611987867914-0ea5ddd13158?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0fit=crophttps://images.unsplash.com/photo-1611987867914-0ea5ddd13158?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0q=60https://images.unsplash.com/photo-1611987867914-0ea5ddd13158?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0ixlib=rb-4.1.0",
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12,
      },
    },
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      toast.error("Please enter email and password")
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      toast.success("Logged in successfully! Redirecting...")
      setIsLoading(false)
      // In a real app, redirect to dashboard
    }, 1500)
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        className="w-full max-w-5xl min-h-[700px] grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl border border-border bg-white"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Left side: Image Slider */}
        <div className="hidden lg:block">
          <ImageSlider images={images} interval={4000} />
        </div>

        {/* Right side: Login Form */}
        <div className="w-full h-full bg-card text-card-foreground flex flex-col items-center justify-center p-8 md:p-12">
          <motion.div
            className="w-full max-w-sm"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
                Welcome Back
              </h1>
              <p className="text-muted-foreground">
                Enter your credentials to access your account
              </p>
            </motion.div>

            {/* Social Auth Buttons */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6"
            >
              <Button
                variant="outline"
                className="w-full"
                onClick={() => toast.info("Google login coming soon")}
              >
                <Chrome className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => toast.info("Apple login coming soon")}
              >
                <Apple className="mr-2 h-4 w-4" />
                Apple
              </Button>
            </motion.div>

            {/* Divider */}
            <motion.div variants={itemVariants} className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </motion.div>

            {/* Form */}
            <motion.form
              variants={itemVariants}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="bg-background text-foreground border-border"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-foreground">
                    Password
                  </Label>
                  <Link href="/forgot-password">
                    <a className="text-sm font-medium text-primary hover:underline">
                      Forgot password?
                    </a>
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="bg-background text-foreground border-border"
                />
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-border cursor-pointer"
                />
                <label
                  htmlFor="rememberMe"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  Remember me
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white h-10"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Log In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </motion.form>

            {/* Sign Up Link */}
            <motion.p
              variants={itemVariants}
              className="text-center text-sm text-muted-foreground mt-6"
            >
              Don't have an account?{" "}
              <Link href="/signup">
                <a className="font-medium text-primary hover:underline">
                  Sign up
                </a>
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
