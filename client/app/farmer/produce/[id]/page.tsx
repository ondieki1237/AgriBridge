"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api-client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Leaf, MapPin, Weight, Trash2, Edit3 } from "lucide-react"

export default function ProduceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id
  const { user, isLoading } = useAuth()

  const [produce, setProduce] = useState<any | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({ crop: "", quantityKg: "", location: "", latitude: "", longitude: "" })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) router.push('/login')
  }, [user, isLoading, router])

  useEffect(() => {
    if (id) load()
  }, [id])

  const load = async () => {
    setLoading(true)
    try {
      const data = await apiClient.getProduce(id!)
      setProduce(data)
      setForm({ crop: data.crop || "", quantityKg: String(data.quantityKg || ""), location: data.location || "", latitude: data.latitude || "", longitude: data.longitude || "" })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      await apiClient.updateProduce(id!, {
        crop: form.crop,
        quantityKg: Number(form.quantityKg),
        location: form.location,
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
      })
      setIsEditing(false)
      load()
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Failed to update')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this produce?')) return
    try {
      await apiClient.deleteProduce(id!)
      router.push('/farmer/products')
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Failed to delete')
    }
  }

  if (loading || isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Leaf className="w-16 h-16 text-primary animate-pulse" /></div>
  }

  if (!produce) return <div className="min-h-screen flex items-center justify-center">Not found</div>

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-serif text-2xl font-bold">{produce.crop}</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
              <Edit3 className="w-4 h-4 mr-2" /> Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          </div>
        </div>

        <Card className="p-6">
          {!isEditing ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Quantity: <strong>{produce.quantityKg} kg</strong></p>
              <p className="text-sm text-muted-foreground">Location: <strong>{produce.location}</strong></p>
              {produce.latitude && produce.longitude && (
                <p className="text-sm text-muted-foreground">Coords: <strong>{produce.latitude}, {produce.longitude}</strong></p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="crop">Crop</Label>
                <Input id="crop" value={form.crop} onChange={(e) => setForm({...form, crop: e.target.value})} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (kg)</Label>
                <Input id="quantity" type="number" value={form.quantityKg} onChange={(e) => setForm({...form, quantityKg: e.target.value})} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={form.location} onChange={(e) => setForm({...form, location: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input id="latitude" type="number" step="any" value={form.latitude} onChange={(e) => setForm({...form, latitude: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input id="longitude" type="number" step="any" value={form.longitude} onChange={(e) => setForm({...form, longitude: e.target.value})} />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave}>Save</Button>
                <Button variant="outline" onClick={() => { setIsEditing(false); setForm({ crop: produce.crop || "", quantityKg: String(produce.quantityKg || ""), location: produce.location || "", latitude: produce.latitude || "", longitude: produce.longitude || "" }) }}>Cancel</Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
