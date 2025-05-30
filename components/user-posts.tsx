"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EnhancedPostCard } from "@/components/enhanced-post-card"
import { CreatePost } from "@/components/create-post"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"
import { FileText, Plus } from "lucide-react"

interface UserPost {
  id: string
  title: string | null
  content: string
  image_url: string | null
  like_count: number
  created_at: string
  post_type: "user"
  user_liked: boolean
}

interface UserPostsProps {
  userId: string
  isOwnProfile?: boolean
}

export function UserPosts({ userId, isOwnProfile = false }: UserPostsProps) {
  const [posts, setPosts] = useState<UserPost[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    fetchUserPosts()
  }, [userId])

  const fetchUserPosts = async () => {
    try {
      const { data: posts, error } = await supabase
        .from("posts")
        .select(`
          *,
          user_liked:post_likes!left(user_id)
        `)
        .eq("user_id", userId)
        .eq("post_type", "user")
        .order("created_at", { ascending: false })

      if (error) throw error

      const formattedPosts =
        posts?.map((post) => ({
          ...post,
          user_liked: post.user_liked?.some((like: any) => like.user_id === user?.id) || false,
        })) || []

      setPosts(formattedPosts)
    } catch (error) {
      console.error("Error fetching user posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (postId: string, currentlyLiked: boolean) => {
    if (!user) return

    try {
      if (currentlyLiked) {
        await supabase.from("post_likes").delete().eq("user_id", user.id).eq("post_id", postId)
      } else {
        await supabase.from("post_likes").insert({ user_id: user.id, post_id: postId })
      }

      // Update local state
      setPosts(
        posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                user_liked: !currentlyLiked,
                like_count: currentlyLiked ? post.like_count - 1 : post.like_count + 1,
              }
            : post,
        ),
      )
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  const handlePostCreated = () => {
    fetchUserPosts()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Posts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-20 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-charity-red" />
            <span>Posts ({posts.length})</span>
          </CardTitle>
          {isOwnProfile && (
            <CreatePost
              onPostCreated={handlePostCreated}
              trigger={
                <Button size="sm" className="bg-charity-red hover:bg-red-600">
                  <Plus className="h-4 w-4 mr-2" />
                  New Post
                </Button>
              }
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isOwnProfile ? "No posts yet" : "No posts to show"}
            </h3>
            <p className="text-gray-600 mb-4">
              {isOwnProfile
                ? "Share your thoughts about supporting charities and community initiatives."
                : "This user hasn't shared any posts yet."}
            </p>
            {isOwnProfile && <CreatePost onPostCreated={handlePostCreated} />}
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <EnhancedPostCard
                key={post.id}
                post={{
                  ...post,
                  user: {
                    id: userId,
                    full_name: user?.user_metadata?.full_name || null,
                    avatar_url: user?.user_metadata?.avatar_url || null,
                  },
                }}
                onLike={handleLike}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
