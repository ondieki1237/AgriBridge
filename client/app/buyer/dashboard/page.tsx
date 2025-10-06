"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api-client"
import { BuyerNav } from "@/components/buyer-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, Plus, MapPin, Weight, Leaf, TrendingUp, AlertCircle, Tag } from "lucide-react"

export default function BuyerDashboard() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [produce, setProduce] = useState<any[]>([])
  const [myOffers, setMyOffers] = useState<any[]>([])
  const [showOfferForm, setShowOfferForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    crop: "",
    quantityKgWanted: "",
    pricePerKg: "",
    location: "",
    desiredDate: "",
    notes: "",
  })

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "buyer")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      loadProduce()
      loadMyOffers()
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

  const loadMyOffers = async () => {
    try {
      const data = await apiClient.listOffers()
      setMyOffers(data)
    } catch (err) {
      console.error("Failed to load offers:", err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      await apiClient.createOffer({
        buyerId: user!._id,
        crop: formData.crop,
        quantityKgWanted: Number(formData.quantityKgWanted),
        pricePerKg: Number(formData.pricePerKg),
        location: formData.location,
        desiredDate: formData.desiredDate || new Date().toISOString(),
        notes: formData.notes,
      })

      setFormData({
        crop: "",
        quantityKgWanted: "",
        pricePerKg: "",
        location: "",
        desiredDate: "",
        notes: "",
      })
      setShowOfferForm(false)
      loadMyOffers()
    } catch (err: any) {
      setError(err.message || "Failed to create offer")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">
          <Leaf className="w-16 h-16 text-secondary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <BuyerNav />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl animate-fade-in">
        <div className="mb-6 sm:mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2">
            Buyer Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">Browse available produce and create offers</p>
        </div>

        <Tabs defaultValue="marketplace" className="w-full">
          <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex">
            <TabsTrigger value="marketplace" className="gap-2">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Marketplace</span>
              <span className="sm:hidden">Browse</span>
            </TabsTrigger>
            <TabsTrigger value="offers" className="gap-2">
              <Tag className="w-4 h-4" />
              <span className="hidden sm:inline">My Offers</span>
              <span className="sm:hidden">Offers</span>
            </TabsTrigger>
          </TabsList>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              Available Produce
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {produce.length === 0 ? (
                <Card className="p-8 text-center col-span-full animate-fade-in">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm sm:text-base text-muted-foreground">No produce available at the moment.</p>
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
                          Freshness: {100 - item.spoilageRisk}%
                        </p>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* My Offers Tab */}
          <TabsContent value="offers">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <Tag className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
                <span className="hidden sm:inline">My Offers</span>
              </h2>
              <Button
                onClick={() => setShowOfferForm(!showOfferForm)}
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2 transition-all duration-200 hover:scale-105"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create Offer</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </div>

            {showOfferForm && (
              <Card className="p-4 sm:p-6 mb-6 border-secondary/20 animate-scale-in">
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
                      <Label htmlFor="quantity">Quantity Wanted (kg)</Label>
                      <Input
                        id="quantity"
                        type="number"
                        placeholder="100"
                        value={formData.quantityKgWanted}
                        onChange={(e) => setFormData({ ...formData, quantityKgWanted: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">Price per kg ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        placeholder="50"
                        value={formData.pricePerKg}
                        onChange={(e) => setFormData({ ...formData, pricePerKg: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="e.g., Nairobi, Kisumu"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="notes">Notes (optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any specific requirements..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="submit"
                      className="bg-secondary hover:bg-secondary/90 text-secondary-foreground transition-all duration-200"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Creating..." : "Create Offer"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowOfferForm(false)}
                      className="transition-all duration-200"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myOffers.length === 0 ? (
                <Card className="p-8 text-center col-span-full animate-fade-in">
                  <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm sm:text-base text-muted-foreground">
                    No offers created yet. Create your first offer above.
                  </p>
                </Card>
              ) : (
                myOffers.map((offer, index) => (
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
                    {offer.notes && <p className="text-sm text-muted-foreground">{offer.notes}</p>}
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
