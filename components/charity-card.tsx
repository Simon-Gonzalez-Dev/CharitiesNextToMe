"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Users } from "lucide-react"

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

interface CharityCardProps {
  charity: Charity
  onFollow: (charityId: string, currentlyFollowing: boolean) => void
}

export function CharityCard({ charity, onFollow }: CharityCardProps) {
  return (
    <div className="flex items-start space-x-3">
      <Avatar className="h-12 w-12">
        <AvatarImage src={charity.logo_url || undefined} />
        <AvatarFallback>{charity.name.charAt(0)}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <h4 className="font-semibold text-gray-900 truncate">{charity.name}</h4>
          {charity.verified && <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />}
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{charity.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              {charity.category}
            </Badge>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Users className="h-3 w-3" />
              <span>{charity.follower_count}</span>
            </div>
          </div>

          <Button
            size="sm"
            variant={charity.user_following ? "outline" : "default"}
            onClick={() => onFollow(charity.id, charity.user_following)}
            className={charity.user_following ? "" : "bg-charity-red hover:bg-red-600"}
          >
            {charity.user_following ? "Following" : "Follow"}
          </Button>
        </div>
      </div>
    </div>
  )
}
