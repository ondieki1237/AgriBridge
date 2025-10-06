"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api-client"
import { FarmerNav } from "@/components/farmer-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Plus, MapPin, Weight, Leaf, TrendingUp, AlertCircle, Inbox } from "lucide-react"

export default function FarmerDashboard() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [produce, setProduce] = useState<any[]>([])
  const [offers, setOffers] = useState<any[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    crop: "",
    quantityKg: "",
    location: "",
    latitude: "",
    longitude: "",
  })

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "farmer")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      loadProduce()
      loadOffers()
    }
  }, [user])

  const loadProduce = async () => {
    try {
      const data = await apiClient.listProduce()
      setProduce(data)
    } catch (err) {
      console.error("Failed to load produce:", err)
    }
  }

  const loadOffers = async () => {
    try {
      const data = await apiClient.listOffers()
      setOffers(data)
    } catch (err) {
      console.error("Failed to load offers:", err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      await apiClient.createProduce({
        farmerId: user!._id,
        crop: formData.crop,
        quantityKg: Number(formData.quantityKg),
        location: formData.location,
        latitude: formData.latitude ? Number(formData.latitude) : undefined,
        longitude: formData.longitude ? Number(formData.longitude) : undefined,
      })

      setFormData({
        crop: "",
        quantityKg: "",
        location: "",
        latitude: "",
        longitude: "",
      })
      setShowAddForm(false)
      loadProduce()
    } catch (err: any) {
      setError(err.message || "Failed to add produce")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAcceptOffer = async (offerId: string, produceId: string) => {
    try {
      await apiClient.acceptOffer(offerId, produceId)
      loadOffers()
      loadProduce()
    } catch (err) {
      console.error("Failed to accept offer:", err)
    }
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">
          <Leaf className="w-16 h-16 text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <FarmerNav />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl animate-fade-in">
        <div className="mb-6 sm:mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2">
            Farmer Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your produce and view buyer offers</p>
        </div>

        <Tabs defaultValue="produce" className="w-full">
          <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex">
            <TabsTrigger value="produce" className="gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">My Produce</span>
              <span className="sm:hidden">Produce</span>
            </TabsTrigger>
            <TabsTrigger value="offers" className="gap-2">
              <Inbox className="w-4 h-4" />
              <span className="hidden sm:inline">Available Offers</span>
              <span className="sm:hidden">Offers</span>
            </TabsTrigger>
          </TabsList>

          {/* My Produce Tab */}
          <TabsContent value="produce">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                <span className="hidden sm:inline">My Produce</span>
              </h2>
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 transition-all duration-200 hover:scale-105"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Produce</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>

            {showAddForm && (
              <Card className="p-4 sm:p-6 mb-6 border-primary/20 animate-scale-in">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 sm:p-4 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="crop">Crop Type</Label>
                      <Input
                        id="crop"
                        placeholder="e.g., Mango, Maize, Wheat"
                        value={formData.crop}
                        onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity (kg)</Label>
                      <Input
                        id="quantity"
                        type="number"
                        placeholder="100"
                        value={formData.quantityKg}
                        onChange={(e) => setFormData({ ...formData, quantityKg: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="e.g., Nairobi, Kisumu"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude (optional)</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        placeholder="-1.2921"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude (optional)</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        placeholder="36.8219"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="submit"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Adding..." : "Add Produce"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                      className="transition-all duration-200"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {produce.length === 0 ? (
                <Card className="p-8 text-center col-span-full animate-fade-in">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm sm:text-base text-muted-foreground">
                    No produce listed yet. Add your first listing above.
                  </p>
                </Card>
              ) : (
                produce.map((item, index) => (
                  <Card
                    key={item._id}
                    className="p-4 sm:p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 animate-slide-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Leaf className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground capitalize">{item.crop}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Weight className="w-3 h-3" />
                            {item.quantityKg} kg
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-muted-foreground flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {item.location}
                      </p>
                      {item.spoilageRisk && (
                        <p className="text-muted-foreground flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Risk: {item.spoilageRisk}%
                        </p>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Available Offers Tab */}
          <TabsContent value="offers">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
              Available Offers
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {offers.length === 0 ? (
                <Card className="p-8 text-center col-span-full animate-fade-in">
                  <Inbox className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm sm:text-base text-muted-foreground">No offers available at the moment.</p>
                </Card>
              ) : (
                offers.map((offer, index) => (
                  <Card
                    key={offer._id}
                    className="p-4 sm:p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 animate-slide-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="mb-4">
                      <h3 className="font-semibold text-foreground capitalize mb-2">{offer.crop}</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2">
                          <Weight className="w-4 h-4" />
                          {offer.quantityKgWanted} kg wanted
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {offer.location}
                        </p>
                        <p className="font-semibold text-foreground">${offer.pricePerKg}/kg</p>
                      </div>
                    </div>
                    {offer.notes && <p className="text-sm text-muted-foreground mb-4">{offer.notes}</p>}
                    <Button
                      size="sm"
                      className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground transition-all duration-200 hover:scale-105"
                      onClick={() => {
                        const matchingProduce = produce.find((p) => p.crop.toLowerCase() === offer.crop.toLowerCase())
                        if (matchingProduce) {
                          handleAcceptOffer(offer._id, matchingProduce._id)
                        }
                      }}
                    >
                      Accept Offer
                    </Button>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
