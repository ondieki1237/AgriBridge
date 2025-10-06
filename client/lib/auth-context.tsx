"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { apiClient } from "./api-client"

interface User {
  _id: string
  name: string
  email: string
  role: "farmer" | "buyer"
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role: "farmer" | "buyer") => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    const storedToken = localStorage.getItem("token")

    if (storedUser && storedToken) {
      // storedUser might be the literal string "undefined" or malformed JSON; guard against that
      if (storedUser === "undefined" || storedUser === "null") {
        // Clean up invalid values
        localStorage.removeItem("user")
        localStorage.removeItem("token")
      } else {
        try {
          const parsed = JSON.parse(storedUser)
          if (parsed && typeof parsed === "object") {
            setUser(parsed)
            apiClient.setToken(storedToken)
          } else {
            // Not an object — clear
            localStorage.removeItem("user")
            localStorage.removeItem("token")
          }
        } catch (err) {
          // malformed JSON in localStorage, remove and warn
          // eslint-disable-next-line no-console
          console.warn("Clearing malformed stored user from localStorage", err)
          localStorage.removeItem("user")
          localStorage.removeItem("token")
        }
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error("Email and password are required")
    }

    try {
      const response = await apiClient.login({ email, password })
      if (!response || !response.token || !response.user) {
        throw new Error("Invalid login response from server")
      }

      apiClient.setToken(response.token)
      setUser(response.user)
      localStorage.setItem("user", JSON.stringify(response.user))
      localStorage.setItem("role", response.user.role)
    } catch (err: any) {
      // Preserve backend error shape (ApiError.message)
      throw new Error(err?.message || "Login failed")
    }
  }

  const register = async (name: string, email: string, password: string, role: "farmer" | "buyer") => {
    if (!name || !email || !password || !role) {
      throw new Error("Name, email, password and role are required")
    }

    try {
      const response = await apiClient.register({ name, email, password, role })
      if (!response || !response.token || !response.user) {
        throw new Error("Invalid register response from server")
      }

      apiClient.setToken(response.token)
      setUser(response.user)
      localStorage.setItem("user", JSON.stringify(response.user))
      localStorage.setItem("role", response.user.role)
    } catch (err: any) {
      throw new Error(err?.message || "Registration failed")
    }
  }

  const logout = () => {
    apiClient.clearToken()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
