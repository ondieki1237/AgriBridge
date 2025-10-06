"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Leaf } from "lucide-react"

function RoleSelectContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedRole, setSelectedRole] = useState<"farmer" | "buyer" | null>(null)

  useEffect(() => {
    const role = searchParams.get("role") as "farmer" | "buyer" | null
    if (role) {
      setSelectedRole(role)
    }
  }, [searchParams])

  const handleContinue = (action: "login" | "register") => {
    if (selectedRole) {
      router.push(`/${action}?role=${selectedRole}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Leaf className="w-12 h-12 text-primary" />
          </div>
          <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Welcome to AgriBridge</h1>
          <p className="text-muted-foreground">{selectedRole === "farmer" ? "Farmer Portal" : "Buyer Portal"}</p>
        </div>

        <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
          <div className="space-y-4">
            <Button
              onClick={() => handleContinue("login")}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              Sign In
            </Button>
            <Button onClick={() => handleContinue("register")} variant="outline" className="w-full" size="lg">
              Create Account
            </Button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push("/")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to role selection
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RoleSelectPage() {
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
      <RoleSelectContent />
    </Suspense>
  )
}
