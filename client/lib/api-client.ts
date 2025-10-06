const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export interface ApiError {
  message: string
  status: number
}

export class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("token")
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      localStorage.removeItem("role")
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (this.token) {
      ;(headers as Record<string, string>)["Authorization"] = `Bearer ${this.token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    // Attempt to parse JSON when present, otherwise fall back to text
    const contentType = response.headers.get("content-type") || ""
    const parseBody = async () => {
      if (response.status === 204) return null
      if (contentType.includes("application/json")) {
        try {
          return await response.json()
        } catch (err) {
          // malformed JSON
          return await response.text()
        }
      }
      return await response.text()
    }

    const body = await parseBody()

    if (!response.ok) {
      // Debug: log failed request information to help dev diagnose issues
      try {
        // eslint-disable-next-line no-console
        console.debug("API request failed:", { endpoint, status: response.status, body })
      } catch (e) {
        // ignore
      }
      // If backend returned JSON with a message field, prefer that
      const message =
        (body && typeof body === "object" && "message" in body && (body as any).message) ||
        (typeof body === "string" ? body : undefined) ||
        response.statusText

      const error: ApiError = {
        message: message || "Request failed",
        status: response.status,
      }
      throw error
    }

    return body as T
  }

  // Auth endpoints
  async register(data: {
    name: string
    email: string
    password: string
    role: "farmer" | "buyer"
  }) {
    return this.request<{ token: string; user: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async login(data: { email: string; password: string }) {
    return this.request<{ token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getProfile() {
    return this.request<any>("/auth/profile")
  }

  // Produce endpoints
  async createProduce(data: {
    farmerId: string
    crop: string
    quantityKg: number
    location: string
    latitude?: number
    longitude?: number
  }) {
    return this.request<any>("/produce", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async listProduce() {
    return this.request<any[]>("/produce")
  }

  // Market endpoints
  async createMarket(data: {
    name: string
    contactEmail: string
    crops: string[]
    prices: { crop: string; pricePerKg: number }[]
    location: string
  }) {
    return this.request<any>("/market", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async findMarkets(crop?: string, location?: string) {
    const params = new URLSearchParams()
    if (crop) params.append("crop", crop)
    if (location) params.append("location", location)
    return this.request<any[]>(`/market/find?${params.toString()}`)
  }

  // Offers endpoints
  async createOffer(data: {
    buyerId: string
    crop: string
    quantityKgWanted: number
    pricePerKg: number
    location: string
    desiredDate: string
    notes?: string
  }) {
    return this.request<any>("/offers", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async listOffers(crop?: string, location?: string) {
    const params = new URLSearchParams()
    if (crop) params.append("crop", crop)
    if (location) params.append("location", location)
    return this.request<any[]>(`/offers?${params.toString()}`)
  }

  async matchOffer(offerId: string) {
    return this.request<any[]>(`/offers/${offerId}/match`)
  }

  async acceptOffer(offerId: string, produceId: string) {
    return this.request<any>(`/offers/${offerId}/accept`, {
      method: "POST",
      body: JSON.stringify({ produceId }),
    })
  }

  // Transactions
  async createTransaction(data: {
    buyerId: string
    farmerId: string
    produceId: string
    amount: number
  }) {
    return this.request<any>("/transactions", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getTransaction(transactionId: string) {
    return this.request<any>(`/transactions/${transactionId}`)
  }

  // Recommendations
  async getRecommendations(data: {
    crop: string
    quantityKg: number
    location: string
    latitude?: number
    longitude?: number
  }) {
    return this.request<any>("/recommend", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Batches
  async createBatch(data: {
    crop: string
    location: string
    produceIds: string[]
  }) {
    return this.request<any>("/batches", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async listBatches() {
    return this.request<any[]>("/batches")
  }

  async getBatch(batchId: string) {
    return this.request<any>(`/batches/${batchId}`)
  }

  async matchBatch(batchId: string) {
    return this.request<any>(`/batches/${batchId}/match`, {
      method: "POST",
    })
  }

  // Notifications
  async notifySubscribers(data: { subject: string; html: string }) {
    return this.request<any>("/notifications/notify", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Match endpoints
  async findMatches(crop?: string, location?: string) {
    const params = new URLSearchParams()
    if (crop) params.append("crop", crop)
    if (location) params.append("location", location)
    return this.request<any[]>(`/match/find?${params.toString()}`)
  }

  // Weather endpoints
  async getWeather(data: {
    latitude: number
    longitude: number
    hourly?: string[]
    daily?: string[]
    past_days?: number
  }) {
    return this.request<any>("/python/weather", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Batch aggregation
  async aggregateBatches(maxBatchKg = 800) {
    return this.request<any>("/batches/aggregate", {
      method: "POST",
      body: JSON.stringify({ maxBatchKg }),
    })
  }

  async acceptBatch(batchId: string) {
    return this.request<any>(`/batches/${batchId}/accept`, {
      method: "POST",
    })
  }

  async scheduleBatch(batchId: string, scheduledDate: string) {
    return this.request<any>(`/batches/${batchId}/schedule`, {
      method: "POST",
      body: JSON.stringify({ scheduledDate }),
    })
  }
}

export const apiClient = new ApiClient()
