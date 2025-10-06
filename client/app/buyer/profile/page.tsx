"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, User, Mail, Calendar, CheckCircle2, XCircle, LogOut } from "lucide-react"

interface Profile {
  _id: string
  name: string
  email: string
  role: string
  subscribed: boolean
  createdAt: string
  updatedAt: string
}

export default function BuyerProfilePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user || user.role !== "buyer") {
      router.push("/login")
      return
    }

    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        const data = await apiClient.getProfile()
        setProfile(data)
      } catch (err: any) {
        setError(err.message || "Failed to load profile")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [user, router])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage-50 to-cream flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-forest" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage-50 to-cream flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-forest/20">
          <CardContent className="pt-6">
            <p className="text-red-600 text-center">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-cream animate-fade-in">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-slide-down">
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-forest">My Profile</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="border-forest/30 text-forest hover:bg-forest hover:text-white transition-all duration-300 bg-transparent"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Profile Card */}
        {profile && (
          <Card className="border-forest/20 shadow-lg animate-scale-in hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-forest/5 to-sage/10">
              <CardTitle className="font-serif text-forest flex items-center gap-2">
                <User className="h-5 w-5" />
                Buyer Profile
              </CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Name */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-sage-50/50 hover:bg-sage-50 transition-colors duration-300">
                <div className="p-2 rounded-full bg-forest/10">
                  <User className="h-5 w-5 text-forest" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                  <p className="font-medium text-forest text-lg">{profile.name}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-sage-50/50 hover:bg-sage-50 transition-colors duration-300">
                <div className="p-2 rounded-full bg-forest/10">
                  <Mail className="h-5 w-5 text-forest" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Email Address</p>
                  <p className="font-medium text-forest text-lg break-all">{profile.email}</p>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-sage-50/50 hover:bg-sage-50 transition-colors duration-300">
                <div className="p-2 rounded-full bg-forest/10">
                  <User className="h-5 w-5 text-forest" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Account Type</p>
                  <p className="font-medium text-forest text-lg capitalize">{profile.role}</p>
                </div>
              </div>

              {/* Subscription Status */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-sage-50/50 hover:bg-sage-50 transition-colors duration-300">
                <div className="p-2 rounded-full bg-forest/10">
                  {profile.subscribed ? (
                    <CheckCircle2 className="h-5 w-5 text-forest" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Notification Status</p>
                  <p className="font-medium text-forest text-lg">
                    {profile.subscribed ? "Subscribed" : "Not Subscribed"}
                  </p>
                </div>
              </div>

              {/* Member Since */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-sage-50/50 hover:bg-sage-50 transition-colors duration-300">
                <div className="p-2 rounded-full bg-forest/10">
                  <Calendar className="h-5 w-5 text-forest" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Member Since</p>
                  <p className="font-medium text-forest text-lg">
                    {new Date(profile.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* User ID */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-sage-50/50 hover:bg-sage-50 transition-colors duration-300">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">User ID</p>
                  <p className="font-mono text-xs text-forest break-all">{profile._id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Back to Dashboard */}
        <div className="mt-6 animate-slide-up">
          <Button
            onClick={() => router.push("/buyer/dashboard")}
            className="w-full bg-forest hover:bg-forest/90 text-white transition-all duration-300 hover:scale-[1.02]"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
