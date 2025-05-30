"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Share, CheckCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Post {
  id: string
  title: string
  content: string
  image_url: string | null
  like_count: number
  created_at: string
  charity: {
    id: string
    name: string
    logo_url: string | null
    verified: boolean
  }
  user_liked: boolean
}

interface PostCardProps {
  post: Post
  onLike: (postId: string, currentlyLiked: boolean) => void
}

export function PostCard({ post, onLike }: PostCardProps) {
  const [imageLoading, setImageLoading] = useState(true)

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.charity.logo_url || undefined} />
            <AvatarFallback>{post.charity.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">{post.charity.name}</h3>
              {post.charity.verified && <CheckCircle className="h-4 w-4 text-blue-500" />}
            </div>
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {post.title && <h4 className="font-semibold text-lg text-gray-900 mb-2">{post.title}</h4>}

        <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>

        {post.image_url && (
          <div className="relative mb-4 rounded-lg overflow-hidden">
            {imageLoading && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
            <Image
              src={post.image_url || "/placeholder.svg"}
              alt={post.title || "Post image"}
              width={600}
              height={400}
              className="w-full h-auto object-cover"
              onLoad={() => setImageLoading(false)}
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(post.id, post.user_liked)}
              className={`flex items-center space-x-2 ${post.user_liked ? "text-charity-red" : "text-gray-600"}`}
            >
              <Heart className={`h-5 w-5 ${post.user_liked ? "fill-current" : ""}`} />
              <span>{post.like_count}</span>
            </Button>

            <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-gray-600">
              <MessageCircle className="h-5 w-5" />
              <span>Comment</span>
            </Button>
          </div>

          <Button variant="ghost" size="sm" className="text-gray-600">
            <Share className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
