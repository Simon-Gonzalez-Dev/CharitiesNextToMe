"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Heart, Map, Search, Users, MapPin, TrendingUp } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { PostCard } from "@/components/post-card"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"

export default function HomePage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          user:users (
            id,
            full_name,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (postId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from("post_likes")
        .insert({
          post_id: postId,
          user_id: user.id,
          created_at: new Date().toISOString(),
        })

      if (error) throw error

      // Update the post's like count in the UI
      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === postId
            ? { ...post, like_count: post.like_count + 1 }
            : post
        )
      )
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-poppins font-bold text-gray-900 mb-6">
              Discover Local
              <span className="text-charity-red"> Canadian Charities</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect with charitable organizations in your community through our social platform. Follow, support, and
              stay updated with causes that matter to you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-charity-red hover:bg-red-600" asChild>
                <Link href="/auth">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/map">Explore Map</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Posts Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-gray-900 mb-4">Recent Community Posts</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what our community is sharing about their charitable experiences and local initiatives.
            </p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} onLike={handleLike} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-600">No posts yet. Be the first to share your story!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-gray-900 mb-4">
              Everything you need to support local charities
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform makes it easy to discover, follow, and support charitable organizations across Canada.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Heart className="h-12 w-12 text-charity-red mx-auto mb-4" />
                <CardTitle className="font-poppins">Social Feed</CardTitle>
                <CardDescription>
                  Follow your favorite charities and stay updated with their latest posts, events, and impact stories.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Map className="h-12 w-12 text-map-blue mx-auto mb-4" />
                <CardTitle className="font-poppins">Interactive Map</CardTitle>
                <CardDescription>
                  Discover charities near you with our interactive map showing locations, contact info, and details.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Search className="h-12 w-12 text-gray-700 mx-auto mb-4" />
                <CardTitle className="font-poppins">Smart Search</CardTitle>
                <CardDescription>
                  Find charities by city, category, or cause. Our search makes it easy to find exactly what you're
                  looking for.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <Users className="h-12 w-12 text-charity-red mx-auto mb-4" />
              <div className="text-3xl font-poppins font-bold text-gray-900 mb-2">10,000+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <MapPin className="h-12 w-12 text-map-blue mx-auto mb-4" />
              <div className="text-3xl font-poppins font-bold text-gray-900 mb-2">2,500+</div>
              <div className="text-gray-600">Registered Charities</div>
            </div>
            <div>
              <TrendingUp className="h-12 w-12 text-action-green mx-auto mb-4" />
              <div className="text-3xl font-poppins font-bold text-gray-900 mb-2">$5M+</div>
              <div className="text-gray-600">Donations Facilitated</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-charity-red">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-poppins font-bold text-white mb-6">Ready to make a difference?</h2>
          <p className="text-xl text-red-100 mb-8">
            Join thousands of Canadians who are already connected with local charities in their communities.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/auth">Join CharitiesNextToMe</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-8 w-8 text-charity-red" />
                <span className="font-poppins font-bold text-xl">CharitiesNextToMe</span>
              </div>
              <p className="text-gray-400">Connecting Canadians with local charitable organizations.</p>
            </div>
            <div>
              <h3 className="font-poppins font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/feed" className="hover:text-white">
                    Feed
                  </Link>
                </li>
                <li>
                  <Link href="/map" className="hover:text-white">
                    Map
                  </Link>
                </li>
                <li>
                  <Link href="/search" className="hover:text-white">
                    Search
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-poppins font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white">
                    About
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-poppins font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CharitiesNextToMe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
