"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { RouteGuard } from "@/components/route-guard"
import { Navigation } from "@/components/navigation"
import { CharityCard } from "@/components/charity-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { Heart, Search, TrendingUp } from "lucide-react"
import { redirect } from "next/navigation"
import { UserDiscovery } from "@/components/user-discovery"
import { EnhancedPostCard } from "@/components/enhanced-post-card"
import { CreatePost } from "@/components/create-post"

interface Post {
  id: string
  title: string | null
  content: string
  image_url: string | null
  like_count: number
  created_at: string
  post_type: "charity" | "user"
  charity?: {
    id: string
    name: string
    logo_url: string | null
    verified: boolean
  } | null
  user?: {
    id: string
    full_name: string | null
    avatar_url: string | null
  } | null
  user_liked: boolean
}

interface Charity {
  id: string
  name: string
  description: string
  category: string
  logo_url: string | null
  verified: boolean
  follower_count: number
  user_following: boolean
}

export default function FeedPage() {
  const { user, loading } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [suggestedCharities, setSuggestedCharities] = useState<Charity[]>([])
  const [feedLoading, setFeedLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const supabase = createClient()

  useEffect(() => {
    if (!loading && !user) {
      redirect("/auth")
    }
  }, [user, loading])

  useEffect(() => {
    if (user) {
      fetchFeed()
      fetchSuggestedCharities()
    }
  }, [user])

  const fetchFeed = async () => {
    try {
      const { data: posts, error } = await supabase
        .from("posts")
        .select(`
        *,
        charity:charities(id, name, logo_url, verified),
        user:users(id, full_name, avatar_url),
        user_liked:post_likes!left(user_id)
      `)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) throw error

      const formattedPosts =
        posts?.map((post) => ({
          ...post,
          user_liked: post.user_liked?.some((like: any) => like.user_id === user?.id) || false,
        })) || []

      setPosts(formattedPosts)
    } catch (error) {
      console.error("Error fetching feed:", error)
    } finally {
      setFeedLoading(false)
    }
  }

  const fetchSuggestedCharities = async () => {
    try {
      const { data: charities, error } = await supabase
        .from("charities")
        .select(`
          *,
          user_following:follows!left(user_id)
        `)
        .order("follower_count", { ascending: false })
        .limit(5)

      if (error) throw error

      const formattedCharities =
        charities?.map((charity) => ({
          ...charity,
          user_following: charity.user_following?.some((follow: any) => follow.user_id === user?.id) || false,
        })) || []

      setSuggestedCharities(formattedCharities)
    } catch (error) {
      console.error("Error fetching suggested charities:", error)
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

  const handleFollow = async (charityId: string, currentlyFollowing: boolean) => {
    if (!user) return

    try {
      if (currentlyFollowing) {
        await supabase.from("follows").delete().eq("user_id", user.id).eq("charity_id", charityId)
      } else {
        await supabase.from("follows").insert({ user_id: user.id, charity_id: charityId })
      }

      // Update local state
      setSuggestedCharities(
        suggestedCharities.map((charity) =>
          charity.id === charityId
            ? {
                ...charity,
                user_following: !currentlyFollowing,
                follower_count: currentlyFollowing ? charity.follower_count - 1 : charity.follower_count + 1,
              }
            : charity,
        ),
      )
    } catch (error) {
      console.error("Error toggling follow:", error)
    }
  }

  if (loading || !user) {
    return <div>Loading...</div>
  }

  return (
    <RouteGuard requireAuth={true}>
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Feed */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-poppins font-bold text-gray-900">Your Feed</h1>
                  <CreatePost onPostCreated={fetchFeed} />
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {feedLoading ? (
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-32 bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {posts.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                      <p className="text-gray-600">Follow some charities to see their posts here!</p>
                    </div>
                  ) : (
                    posts
                      .filter(
                        (post) =>
                          searchQuery === "" ||
                          post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (post.post_type === "charity" &&
                            post.charity?.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (post.post_type === "user" &&
                            post.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())),
                      )
                      .map((post) => <EnhancedPostCard key={post.id} post={post} onLike={handleLike} />)
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Suggested Charities */}
              <div className="bg-white rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-charity-red" />
                  <h2 className="font-poppins font-semibold text-gray-900">Suggested Charities</h2>
                </div>
                <div className="space-y-4">
                  {suggestedCharities.map((charity) => (
                    <CharityCard key={charity.id} charity={charity} onFollow={handleFollow} />
                  ))}
                </div>
              </div>

              <UserDiscovery />

              {/* Quick Actions */}
              <div className="bg-white rounded-lg p-6">
                <h2 className="font-poppins font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="/map">
                      <Search className="mr-2 h-4 w-4" />
                      Find Nearby Charities
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="/search">
                      <Heart className="mr-2 h-4 w-4" />
                      Browse Categories
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  )
}
