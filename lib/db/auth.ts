import { queryOne } from "./mysql"
import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production")

export interface User {
  id: string
  email: string
  full_name: string
  phone: string | null
  role: "SuperAdmin" | "Admin" | "Staff" | "User"
  created_at: Date
  updated_at: Date
}

export async function hashPassword(password: string): Promise<string> {
  // Simple hash for demo - in production use bcrypt
  const crypto = await import("crypto")
  return crypto.createHash("sha256").update(password).digest("hex")
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

export async function createSession(userId: string): Promise<string> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET)

  const cookieStore = await cookies()
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return token
}

export async function getSession(): Promise<{ userId: string } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return { userId: payload.userId as string }
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession()
  if (!session) return null

  const user = await queryOne<User>("SELECT * FROM users WHERE id = ?", [session.userId])
  return user
}

export async function getAuthUser(): Promise<User | null> {
  return getCurrentUser()
}

export async function signOut(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}

export async function verifyAuth(request: Request): Promise<User | null> {
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7) // Remove "Bearer " prefix

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as string

    const user = await queryOne<User>("SELECT * FROM users WHERE id = ?", [userId])
    return user
  } catch {
    return null
  }
}
