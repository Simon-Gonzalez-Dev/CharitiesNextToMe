"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"
import { UserPlus, Users } from "lucide-react"

interface SuggestedUser {
  id: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  follower_count: number
  following_count: number
}

export function UserDiscovery() {
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchSuggestedUsers()
    }
  }, [user])

  const fetchSuggestedUsers = async () => {
    try {
      // Get users that the current user is not following
      const { data: currentFollowing } = await supabase
        .from("user_follows")
        .select("following_id")
        .eq("follower_id", user?.id || "")

      const followingIds = currentFollowing?.map((f) => f.following_id) || []
      followingIds.push(user?.id || "") // Exclude current user

      const { data: users, error } = await supabase
        .from("users")
        .select("id, full_name, avatar_url, bio, follower_count, following_count")
        .not("id", "in", `(${followingIds.map((id) => `"${id}"`).join(",")})`)
        .order("follower_count", { ascending: false })
        .limit(5)

      if (error) throw error
      setSuggestedUsers(users || [])
    } catch (error) {
      console.error("Error fetching suggested users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async (targetUserId: string) => {
    if (!user) return

    try {
      await supabase.from("user_follows").insert({
        follower_id: user.id,
        following_id: targetUserId,
      })

      // Remove from suggested users
      setSuggestedUsers(suggestedUsers.filter((u) => u.id !== targetUserId))
    } catch (error) {
      console.error("Error following user:", error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Suggested Users</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (suggestedUsers.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-charity-red" />
          <span>Suggested Users</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestedUsers.map((suggestedUser) => (
            <div key={suggestedUser.id} className="flex items-center justify-between space-x-3">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={suggestedUser.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-charity-red text-white">
                    {suggestedUser.full_name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{suggestedUser.full_name || "Anonymous User"}</p>
                  <p className="text-sm text-gray-500 truncate">
                    {suggestedUser.bio || `${suggestedUser.follower_count} followers`}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => handleFollow(suggestedUser.id)}
                className="bg-charity-red hover:bg-red-600"
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Follow
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
