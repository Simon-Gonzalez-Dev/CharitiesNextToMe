"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { RouteGuard } from "@/components/route-guard"
import { Navigation } from "@/components/navigation"
import { ProfilePictureUpload } from "@/components/profile-picture-upload"
import { FollowersModal } from "@/components/followers-modal"
import { UserDiscovery } from "@/components/user-discovery"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { User, Mail, MapPin, Calendar, CheckCircle, Heart, Edit3 } from "lucide-react"
import { UserPosts } from "@/components/user-posts"
import { CreatePost } from "@/components/create-post"
import { PostCard } from "@/components/post-card"

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  location: string | null
  follower_count: number
  following_count: number
  created_at: string
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [posts, setPosts] = useState<any[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)

  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    location: "",
  })

  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchProfile()
      fetchPosts()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", user?.id).single()

      if (error) throw error

      setProfile(data)
      setFormData({
        full_name: data.full_name || "",
        bio: data.bio || "",
        location: data.location || "",
      })
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

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
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoadingPosts(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage("")

    try {
      const { error } = await supabase
        .from("users")
        .update({
          full_name: formData.full_name,
          bio: formData.bio,
          location: formData.location,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id)

      if (error) throw error

      setMessage("Profile updated successfully!")
      setEditing(false)
      fetchProfile()
    } catch (error: any) {
      setMessage(`Error updating profile: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || "",
      bio: profile?.bio || "",
      location: profile?.location || "",
    })
    setEditing(false)
    setMessage("")
  }

  const handleAvatarUpload = (newAvatarUrl: string) => {
    if (profile) {
      setProfile({ ...profile, avatar_url: newAvatarUrl })
    }
  }

  const handleLike = async (postId: string) => {
    try {
      const { error } = await supabase
        .from("post_likes")
        .insert({
          post_id: postId,
          user_id: user?.id,
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

  if (loading) {
    return (
      <RouteGuard requireAuth={true}>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="h-96 bg-gray-200 rounded-lg"></div>
                <div className="lg:col-span-2 h-96 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </RouteGuard>
    )
  }

  return (
    <RouteGuard requireAuth={true}>
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-poppins font-bold text-gray-900">Your Profile</h1>
            <p className="text-gray-600 mt-2">Manage your account information and connect with other users</p>
          </div>

          {message && (
            <Alert
              className={`mb-6 ${message.includes("Error") ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}
            >
              <CheckCircle className={`h-4 w-4 ${message.includes("Error") ? "text-red-600" : "text-green-600"}`} />
              <AlertDescription className={message.includes("Error") ? "text-red-800" : "text-green-800"}>
                {message}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="text-center">
                  <ProfilePictureUpload
                    userId={user?.id || ""}
                    currentAvatarUrl={profile?.avatar_url}
                    userName={profile?.full_name || profile?.email || "User"}
                    onUploadComplete={handleAvatarUpload}
                  />
                  <CardTitle className="font-poppins mt-4">{profile?.full_name || "Anonymous User"}</CardTitle>
                  <CardDescription className="flex items-center justify-center space-x-1">
                    <Mail className="h-4 w-4" />
                    <span>{profile?.email}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Follower/Following Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <FollowersModal
                        userId={user?.id || ""}
                        type="followers"
                        count={profile?.follower_count || 0}
                        trigger={
                          <Button variant="ghost" className="flex flex-col items-center p-4 h-auto">
                            <span className="text-2xl font-bold text-charity-red">{profile?.follower_count || 0}</span>
                            <span className="text-sm text-gray-600">Followers</span>
                          </Button>
                        }
                      />
                      <FollowersModal
                        userId={user?.id || ""}
                        type="following"
                        count={profile?.following_count || 0}
                        trigger={
                          <Button variant="ghost" className="flex flex-col items-center p-4 h-auto">
                            <span className="text-2xl font-bold text-charity-red">{profile?.following_count || 0}</span>
                            <span className="text-sm text-gray-600">Following</span>
                          </Button>
                        }
                      />
                    </div>

                    <div className="space-y-3 text-sm border-t pt-4">
                      {profile?.location && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{profile.location}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Joined {new Date(profile?.created_at || "").toLocaleDateString()}</span>
                      </div>
                    </div>

                    {profile?.bio && (
                      <div className="border-t pt-4">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* User Discovery */}
              <UserDiscovery />
            </div>

            {/* Profile Details and Posts */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <User className="h-5 w-5" />
                        <span>Profile Information</span>
                      </CardTitle>
                      <CardDescription>Update your personal information and bio</CardDescription>
                    </div>
                    {!editing && (
                      <Button onClick={() => setEditing(true)} variant="outline">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {editing ? (
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="full_name" className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>Full Name</span>
                        </Label>
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          className="mt-1"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="location" className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>Location</span>
                        </Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="mt-1"
                          placeholder="e.g., Toronto, ON"
                        />
                      </div>

                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <textarea
                          id="bio"
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          className="mt-1 w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-charity-red focus:border-transparent"
                          placeholder="Tell us about yourself and your interest in supporting charities..."
                          rows={5}
                        />
                      </div>

                      <div className="flex space-x-4">
                        <Button onClick={handleSave} disabled={saving} className="bg-charity-red hover:bg-red-600">
                          {saving ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button onClick={handleCancel} variant="outline">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Full Name</h4>
                        <p className="text-gray-600">{profile?.full_name || "Not provided"}</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Email</h4>
                        <p className="text-gray-600">{profile?.email}</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                        <p className="text-gray-600">{profile?.location || "Not provided"}</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Bio</h4>
                        <p className="text-gray-600 whitespace-pre-wrap">
                          {profile?.bio ||
                            "No bio provided yet. Click 'Edit Profile' to add information about yourself."}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Activity Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-charity-red" />
                    <span>Your Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-charity-red">{profile?.follower_count || 0}</div>
                      <div className="text-sm text-gray-600">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-charity-red">{profile?.following_count || 0}</div>
                      <div className="text-sm text-gray-600">Following</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-400">0</div>
                      <div className="text-sm text-gray-600">Posts Liked</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-400">0</div>
                      <div className="text-sm text-gray-600">Charities Followed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Create Post */}
              <CreatePost />

              {/* User Posts */}
              <div>
                <h2 className="text-2xl font-poppins font-bold text-gray-900 mb-6">Your Posts</h2>
                {loadingPosts ? (
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
                      <p className="text-gray-600">You haven't created any posts yet.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  )
}
