"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Post {
  id: string
  content: string
  image_url: string | null
  created_at: string
  user: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
  like_count: number
}

interface PostCardProps {
  post: Post
  onLike?: (postId: string) => void
}

export function PostCard({ post, onLike }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false)

  const handleLike = () => {
    if (onLike) {
      onLike(post.id)
      setIsLiked(!isLiked)
    }
  }

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center space-x-4 p-4">
        <Avatar>
          <AvatarImage src={post.user.avatar_url || undefined} />
          <AvatarFallback>{post.user.full_name?.[0] || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-medium">{post.user.full_name || "Anonymous User"}</p>
          <p className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-gray-800 whitespace-pre-wrap mb-4">{post.content}</p>
        
        {post.image_url && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img
              src={post.image_url}
              alt="Post attachment"
              className="w-full h-auto max-h-[400px] object-cover"
            />
          </div>
        )}

        <div className="flex items-center space-x-4 pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center space-x-2 ${isLiked ? "text-charity-red" : ""}`}
            onClick={handleLike}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            <span>{post.like_count + (isLiked ? 1 : 0)}</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4" />
            <span>Comment</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center space-x-2">
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
