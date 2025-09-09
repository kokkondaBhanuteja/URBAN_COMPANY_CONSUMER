interface User {
  id: string
  fullName: string
  email: string
  userType: string
}

interface AuthResponse {
  token: string
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

    return data
  },

  async register(userData: any): Promise<{ message: string; userId: string; userType: string }> {
    const response = await fetch("/api/auth/consumer/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Registration failed")
    }

    return data
  },

  setAuthToken(token: string) {
    localStorage.setItem("uc-auth-token", token)
  },

  getAuthToken(): string | null {
    return localStorage.getItem("uc-auth-token")
  },

  setUser(user: User) {
    localStorage.setItem("uc-user", JSON.stringify(user))
  },

  getUser(): User | null {
    const userStr = localStorage.getItem("uc-user")
    return userStr ? JSON.parse(userStr) : null
  },

  logout() {
    localStorage.removeItem("uc-auth-token")
    localStorage.removeItem("uc-user")
  },

  isAuthenticated(): boolean {
    return !!this.getAuthToken() && !!this.getUser()
  },
}
