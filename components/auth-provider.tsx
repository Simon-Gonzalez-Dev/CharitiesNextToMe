"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useRef } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mounted = useRef(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) throw error

        if (mounted.current) {
          setUser(session?.user ?? null)
          setLoading(false)

          if (session?.user) {
            await createUserProfile(session.user)
          }
        }
      } catch (error: any) {
        if (mounted.current) {
          setError(error.message)
          setLoading(false)
        }
      }
    }

    getInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted.current) {
        setUser(session?.user ?? null)
        setLoading(false)

        if (event === "SIGNED_IN" && session?.user) {
          await createUserProfile(session.user)
          router.refresh()
        }

        if (event === "SIGNED_OUT") {
          router.push("/")
          router.refresh()
        }
      }
    })

    return () => {
      mounted.current = false
      subscription.unsubscribe()
    }
  }, [supabase.auth, router])

  const createUserProfile = async (user: User) => {
    if (!mounted.current) return

    try {
      const { data: existingUser, error: selectError } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single()
        .throwOnError()

      if (!existingUser) {
        const { error: insertError } = await supabase
          .from("users")
          .insert({
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Anonymous",
            avatar_url: user.user_metadata?.avatar_url || null,
          })
          .throwOnError()

        if (insertError && (insertError as any).code !== "23505") {
          throw insertError
        }
      }
    } catch (error: any) {
      if (mounted.current) {
        setError(error.message)
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    if (error) throw error
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
