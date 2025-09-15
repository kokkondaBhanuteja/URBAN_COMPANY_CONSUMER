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
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Login failed")
    }

    this.setUser(data.user)
    return data
  },
  
  async resendOTP(email: string): Promise<void> {
    const response = await fetch("/api/auth/otp/resend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to resend OTP");
    }
  },
  setUser(user: User) {
    if (typeof window !== "undefined") {
      localStorage.setItem("uc-user", JSON.stringify(user))
      // Dispatch a storage event to notify other tabs/windows
      window.dispatchEvent(new Event("storage"))
    }
  },

  getUser(): User | null {
    if (typeof window === "undefined") return null
    const userStr = localStorage.getItem("uc-user")
    return userStr ? JSON.parse(userStr) : null
  },

  async logout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })
    } catch (error) {
      console.error("Logout API error:", error)
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("uc-user")
        window.dispatchEvent(new Event("storage"))
      }
    }
  },

  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false
    return !!this.getUser()
  },
}