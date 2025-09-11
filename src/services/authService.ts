interface User {
  id: string
  fullName: string
  email: string
  userType: string
}

interface AuthResponse {
  user: User
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch("/api/auth/consumer/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include", // Include cookies for authentication
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Login failed")
    }

    this.setUser(data.user)
    return data
  },

  async register(userData: any): Promise<{ message: string; userId: string; userType: string }> {
    const response = await fetch("/api/auth/consumer/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
      credentials: "include", // Include cookies for authentication
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Registration failed")
    }

    return data
  },

  async resendOTP(email: string): Promise<{ message: string }> {
    const response = await fetch("/api/auth/otp/resend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
      credentials: "include",
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Failed to resend OTP")
    }

    return data
  },

  setUser(user: User) {
    if (typeof window !== "undefined") {
      localStorage.setItem("uc-user", JSON.stringify(user))
      window.dispatchEvent(new Event("authChange")) // Dispatch event
    }
  },

  getUser(): User | null {
    if (typeof window === "undefined") return null
    const userStr = localStorage.getItem("uc-user")
    return userStr ? JSON.parse(userStr) : null
  },

  getAuthToken(): string | null {
    // Since we're using cookie-based auth, we don't need to return a token
    // The cookie will be sent automatically with requests
    return null
  },

  async logout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Logout API error:", error)
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("uc-user")
        window.dispatchEvent(new Event("authChange")) // Dispatch event
      }
    }
  },

  isAuthenticated(): boolean {
    return !!this.getUser()
  },
}