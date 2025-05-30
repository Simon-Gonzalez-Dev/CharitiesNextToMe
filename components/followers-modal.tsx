"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"
import { Users, Search, UserPlus, UserMinus } from "lucide-react"

interface User {
  id: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  follower_count: number
  following_count: number
  is_following: boolean
}

interface FollowersModalProps {
  userId: string
  type: "followers" | "following"
  count: number
  trigger: React.ReactNode
}

export function FollowersModal({ userId, type, count, trigger }: FollowersModalProps) {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const { user: currentUser } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (open) {
      fetchUsers()
    }
  }, [open, userId, type])

  useEffect(() => {
    filterUsers()
  }, [users, searchQuery])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      let query
      if (type === "followers") {
        query = supabase
          .from("user_follows")
          .select(`
            follower_id,
            follower:users!user_follows_follower_id_fkey(
              id, full_name, avatar_url, bio, follower_count, following_count
            )
          `)
          .eq("following_id", userId)
      } else {
        query = supabase
          .from("user_follows")
          .select(`
            following_id,
            following:users!user_follows_following_id_fkey(
              id, full_name, avatar_url, bio, follower_count, following_count
            )
          `)
          .eq("follower_id", userId)
      }

      const { data, error } = await query

      if (error) throw error

      // Get current user's following list to determine follow status
      const { data: currentUserFollowing } = await supabase
        .from("user_follows")
        .select("following_id")
        .eq("follower_id", currentUser?.id || "")

      const followingIds = new Set(currentUserFollowing?.map((f) => f.following_id) || [])

      const formattedUsers =
        data?.map((item: any) => {
          const userData = type === "followers" ? item.follower : item.following
          return {
            ...userData,
            is_following: followingIds.has(userData.id),
          }
        }) || []

      setUsers(formattedUsers)
    } catch (error) {
      console.error(`Error fetching ${type}:`, error)
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    if (!searchQuery) {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter((user) => user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()))
      setFilteredUsers(filtered)
    }
  }

  const handleFollow = async (targetUserId: string, isCurrentlyFollowing: boolean) => {
    if (!currentUser || targetUserId === currentUser.id) return

    try {
      if (isCurrentlyFollowing) {
        await supabase.from("user_follows").delete().eq("follower_id", currentUser.id).eq("following_id", targetUserId)
      } else {
        await supabase.from("user_follows").insert({
          follower_id: currentUser.id,
          following_id: targetUserId,
        })
      }

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === targetUserId
            ? {
                ...user,
                is_following: !isCurrentlyFollowing,
                follower_count: isCurrentlyFollowing ? user.follower_count - 1 : user.follower_count + 1,
              }
            : user,
        ),
      )
    } catch (error) {
      console.error("Error updating follow status:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>
              {count} {type === "followers" ? "Followers" : "Following"}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="overflow-y-auto max-h-96 space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 animate-pulse">
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">{searchQuery ? "No users found" : `No ${type} yet`}</div>
            ) : (
              filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between space-x-3">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="bg-charity-red text-white">
                        {user.full_name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{user.full_name || "Anonymous User"}</p>
                      <p className="text-sm text-gray-500">
                        {user.follower_count} followers • {user.following_count} following
                      </p>
                    </div>
                  </div>
                  {currentUser?.id !== user.id && (
                    <Button
                      size="sm"
                      variant={user.is_following ? "outline" : "default"}
                      onClick={() => handleFollow(user.id, user.is_following)}
                      className={user.is_following ? "" : "bg-charity-red hover:bg-red-600"}
                    >
                      {user.is_following ? (
                        <>
                          <UserMinus className="h-4 w-4 mr-1" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-1" />
                          Follow
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
