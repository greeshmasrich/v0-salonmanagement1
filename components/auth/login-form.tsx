"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect, type MultiSelectOption } from "@/components/ui/multi-select"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupName, setSignupName] = useState("")
  const [signupPhone, setSignupPhone] = useState("")
  const [signupRole, setSignupRole] = useState<"SuperAdmin" | "Admin" | "Staff" | "User">("User")
  const [designations, setDesignations] = useState<{ id: string; name: string }[]>([])
  const [services, setServices] = useState<any[]>([])
  const [subcats, setSubcats] = useState<any[]>([])
  const [selectedDesignation, setSelectedDesignation] = useState<string>("")
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [signupLoading, setSignupLoading] = useState(false)
  const [signupError, setSignupError] = useState<string | null>(null)
  const [signupSuccess, setSignupSuccess] = useState(false)

  useState(() => {
    ;(async () => {
      try {
        const [d, s, sc] = await Promise.all([
          fetch("/api/designations"),
          fetch("/api/services"),
          fetch("/api/service-subcategories"),
        ])
        if (d.ok) setDesignations(await d.json())
        if (s.ok) setServices(await s.json())
        if (sc.ok) setSubcats(await sc.json())
      } catch {}
    })()
    return undefined
  })

  const serviceOptions: MultiSelectOption[] = services.map((svc: any) => ({
    value: svc.id,
    label: `${svc.name} • ₹${svc.price} (${svc.duration}m)`,
    group: (subcats.find((sc: any) => sc.id === svc.subcategory_id)?.name as string) || "Services",
  }))

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to login")
      }

      router.push("/dashboard")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Failed to login")
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignupLoading(true)
    setSignupError(null)
    setSignupSuccess(false)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signupEmail,
          password: signupPassword,
          full_name: signupName,
          phone: signupPhone,
          role: signupRole,
          designation_id: signupRole === "Staff" && selectedDesignation ? selectedDesignation : undefined,
          service_ids: signupRole === "Staff" ? selectedServiceIds : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to sign up")
      }

      setSignupSuccess(true)
      setSignupEmail("")
      setSignupPassword("")
      setSignupName("")
      setSignupPhone("")
      setSignupRole("User")
      setSelectedDesignation("")
      setSelectedServiceIds([])

      setTimeout(() => {
        router.push("/dashboard")
        router.refresh()
      }, 1500)
    } catch (err: any) {
      setSignupError(err.message || "Failed to sign up")
    } finally {
      setSignupLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Salon Management System</CardTitle>
        <CardDescription>Login or create a new account</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@salon.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              {signupError && (
                <Alert variant="destructive">
                  <AlertDescription>{signupError}</AlertDescription>
                </Alert>
              )}

              {signupSuccess && (
                <Alert>
                  <AlertDescription>Account created successfully! Redirecting...</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="John Doe"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="john@example.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-phone">Phone</Label>
                <Input
                  id="signup-phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-role">Role</Label>
                <Select value={signupRole} onValueChange={(value: any) => setSignupRole(value)}>
                  <SelectTrigger id="signup-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SuperAdmin">Super Admin</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Staff">Staff</SelectItem>
                    <SelectItem value="User">User (Customer)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {signupRole === "Staff" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="designation">Designation</Label>
                    <Select value={selectedDesignation} onValueChange={setSelectedDesignation}>
                      <SelectTrigger id="designation">
                        <SelectValue placeholder="Select designation" />
                      </SelectTrigger>
                      <SelectContent>
                        {designations.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Services you can perform</Label>
                    <MultiSelect
                      options={serviceOptions}
                      value={selectedServiceIds}
                      onChange={setSelectedServiceIds}
                      placeholder="Select one or more services"
                    />
                  </div>
                </>
              )}

              <Button type="submit" className="w-full" disabled={signupLoading || signupSuccess}>
                {signupLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
