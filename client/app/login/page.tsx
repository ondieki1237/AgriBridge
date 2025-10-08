"use client"

import type React from "react"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Leaf, AlertCircle } from "lucide-react"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const role = searchParams.get("role") as "farmer" | "buyer"
  const registered = searchParams.get("registered") === "1"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Debug: log email and role (do not log password)
    // eslint-disable-next-line no-console
    console.debug('Submitting login', { email, role })

    try {
      await login(email, password)
      if (role === "farmer") {
        router.push("/farmer/dashboard")
      } else {
        router.push("/buyer/dashboard")
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please check your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Leaf className="w-12 h-12 text-primary" />
          </div>
          <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Sign In</h1>
          <p className="text-muted-foreground">{role === "farmer" ? "Farmer Portal" : "Buyer Portal"}</p>
        </div>

        <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            {registered && (
              <div className="bg-emerald/10 border border-emerald/20 rounded-lg p-4">
                <p className="text-sm text-emerald-700">Account successfully created. Please login.</p>
              </div>
            )}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button
                onClick={() => router.push(`/register?role=${role}`)}
                className="text-primary hover:underline font-medium"
              >
                Create one
              </button>
            </p>
            <button
              onClick={() => router.push("/")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse">
            <Leaf className="w-16 h-16 text-primary" />
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
