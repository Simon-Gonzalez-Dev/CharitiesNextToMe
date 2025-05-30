"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"
import { PlusCircle, ImageIcon, Send, X, CheckCircle, Image } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CreatePostProps {
  onPostCreated?: () => void
  trigger?: React.ReactNode
}

export function CreatePost({ onPostCreated, trigger }: CreatePostProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { user } = useAuth()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !content.trim()) return

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      // Validate image URL if provided
      if (imageUrl && !isValidImageUrl(imageUrl)) {
        throw new Error("Please provide a valid image URL (must end with .jpg, .jpeg, .png, .gif, or .webp)")
      }

      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        title: title.trim() || null,
        content: content.trim(),
        image_url: imageUrl.trim() || null,
        post_type: "user",
        like_count: 0,
        created_at: new Date().toISOString(),
      })

      if (error) throw error

      setSuccess("Post created successfully!")
      setTitle("")
      setContent("")
      setImageUrl("")

      // Close dialog after a short delay
      setTimeout(() => {
        setOpen(false)
        setSuccess("")
        onPostCreated?.()
      }, 1500)
    } catch (error: any) {
      console.error("Error creating post:", error)
      setError(error.message || "Failed to create post")
    } finally {
      setLoading(false)
    }
  }

  const isValidImageUrl = (url: string) => {
    try {
      new URL(url)
      return /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
    } catch {
      return false
    }
  }

  const handleCancel = () => {
    setTitle("")
    setContent("")
    setImageUrl("")
    setError("")
    setSuccess("")
    setOpen(false)
  }

  const defaultTrigger = (
    <Button className="bg-charity-red hover:bg-red-600">
      <PlusCircle className="h-4 w-4 mr-2" />
      Create Post
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <PlusCircle className="h-5 w-5 text-charity-red" />
            <span>Create New Post</span>
          </DialogTitle>
        </DialogHeader>

        <Card>
          <CardHeader>
            <CardTitle>Create Post</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <X className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Title (Optional)</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your post a title..."
                  className="mt-1"
                  maxLength={255}
                />
                <p className="text-xs text-gray-500 mt-1">{title.length}/255 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Share your thoughts about supporting charities, volunteer experiences, or community initiatives..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[100px]"
                  required
                  maxLength={2000}
                />
                <p className="text-xs text-gray-500 mt-1">{content.length}/2000 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL (optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="imageUrl"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    type="url"
                  />
                  {imageUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setImageUrl("")}
                    >
                      <Image className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Image Preview */}
              {imageUrl && isValidImageUrl(imageUrl) && (
                <div>
                  <Label>Image Preview</Label>
                  <div className="mt-1 border rounded-lg overflow-hidden">
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                      onError={() => setError("Failed to load image. Please check the URL.")}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || !content.trim()} className="bg-charity-red hover:bg-red-600">
                  {loading ? (
                    "Publishing..."
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Publish Post
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
