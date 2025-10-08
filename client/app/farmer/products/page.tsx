"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api-client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Leaf, Package, Weight, MapPin } from "lucide-react"

export default function MyProductsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [produce, setProduce] = useState<any[]>([])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) load()
  }, [user])

  const load = async () => {
    try {
      const data = await apiClient.listProduce()
      // filter to current user's products, if backend doesn't already
      const mine = data.filter((p: any) => p.farmerId === user?._id)
      setProduce(mine)
    } catch (err) {
      console.error(err)
    }
  }

  if (isLoading || !user) return null

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-serif text-2xl font-bold">My Products</h1>
          <Button onClick={() => router.push('/farmer/dashboard')} variant="outline">Back</Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {produce.length === 0 ? (
            <Card className="p-8 text-center col-span-full">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">No products yet.</p>
            </Card>
          ) : (
            produce.map((p) => (
              <Card key={p._id} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <a href={`/farmer/produce/${p._id}`} className="font-semibold hover:underline">{p.crop}</a>
                    <p className="text-sm text-muted-foreground flex items-center gap-2"><Weight className="w-3 h-3" />{p.quantityKg} kg</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2"><MapPin className="w-3 h-3" />{p.location}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
