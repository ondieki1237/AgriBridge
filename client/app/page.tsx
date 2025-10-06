"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Leaf, Users, TrendingUp } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "farmer") {
        router.push("/farmer/dashboard")
      } else if (user.role === "buyer") {
        router.push("/buyer/dashboard")
      }
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-accent to-background">
        <div className="animate-pulse">
          <Leaf className="w-16 h-16 text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent via-background to-muted">
      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-12 sm:mb-16 pt-4 sm:pt-8 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <Leaf className="w-12 h-12 sm:w-16 sm:h-16 text-primary animate-pulse" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-bold text-foreground mb-4 text-balance">
            AgriBridge
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto text-balance px-4">
            Connecting smallholder farmers with buyers to reduce post-harvest loss
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto mb-12 sm:mb-16">
          <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-lg border border-border hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-in">
            <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full mb-6">
              <Leaf className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-4">I'm a Farmer</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed">
              List your produce, get climate-aware recommendations, and connect with buyers to reduce waste and maximize
              profits.
            </p>
            <Button
              onClick={() => router.push("/role-select?role=farmer")}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 hover:scale-105"
              size="lg"
            >
              Continue as Farmer
            </Button>
          </div>

          <div
            className="bg-card rounded-2xl p-6 sm:p-8 shadow-lg border border-border hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-in"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-secondary/10 rounded-full mb-6">
              <Users className="w-7 h-7 sm:w-8 sm:h-8 text-secondary" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-4">I'm a Buyer</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed">
              Browse available produce, post offers, and connect directly with farmers for fresh, quality agricultural
              products.
            </p>
            <Button
              onClick={() => router.push("/role-select?role=buyer")}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground transition-all duration-200 hover:scale-105"
              size="lg"
            >
              Continue as Buyer
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 text-center">
            <div className="p-4 sm:p-6 transition-transform duration-300 hover:scale-105">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Smart Matching</h3>
              <p className="text-sm text-muted-foreground">AI-powered matching between produce and buyers</p>
            </div>
            <div className="p-4 sm:p-6 transition-transform duration-300 hover:scale-105">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mx-auto mb-4">
                <Leaf className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Climate Aware</h3>
              <p className="text-sm text-muted-foreground">Weather-based spoilage predictions and recommendations</p>
            </div>
            <div className="p-4 sm:p-6 transition-transform duration-300 hover:scale-105 sm:col-span-2 md:col-span-1">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mx-auto mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Direct Connection</h3>
              <p className="text-sm text-muted-foreground">Connect farmers and buyers without intermediaries</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
