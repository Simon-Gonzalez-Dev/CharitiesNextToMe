"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, MapPin, Phone, Mail, Globe, Users } from "lucide-react"

interface Charity {
  id: string
  name: string
  description: string
  category: string
  address: string
  latitude: number
  longitude: number
  logo_url: string | null
  verified: boolean
  follower_count: number
  phone: string | null
  email: string | null
  website_url: string | null
}

interface CharityListProps {
  charities: Charity[]
  selectedCharity: Charity | null
  onCharitySelect: (charity: Charity | null) => void
  loading: boolean
  showFullDetails?: boolean
}

export function CharityList({
  charities,
  selectedCharity,
  onCharitySelect,
  loading,
  showFullDetails = false,
}: CharityListProps) {
  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  if (charities.length === 0) {
    return (
      <div className="p-8 text-center">
        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No charities found</h3>
        <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {charities.map((charity) => (
        <Card
          key={charity.id}
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedCharity?.id === charity.id ? "ring-2 ring-blue-500" : ""
          }`}
          onClick={() => onCharitySelect(charity)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={charity.logo_url || undefined} />
                <AvatarFallback>{charity.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">{charity.name}</h3>
                  {charity.verified && <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />}
                </div>

                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {charity.category}
                  </Badge>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Users className="h-3 w-3" />
                    <span>{charity.follower_count} followers</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{charity.description}</p>

                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{charity.address}</span>
                </div>
              </div>
            </div>
          </CardHeader>

          {(showFullDetails || selectedCharity?.id === charity.id) && (
            <CardContent className="pt-0">
              <div className="space-y-3">
                {charity.phone && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <a
                      href={`tel:${charity.phone}`}
                      className="text-blue-600 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {charity.phone}
                    </a>
                  </div>
                )}

                {charity.email && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <a
                      href={`mailto:${charity.email}`}
                      className="text-blue-600 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {charity.email}
                    </a>
                  </div>
                )}

                {charity.website_url && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <a
                      href={charity.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Visit Website
                    </a>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="bg-charity-red hover:bg-red-600" onClick={(e) => e.stopPropagation()}>
                    Follow
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-action-green border-action-green hover:bg-green-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Donate
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}
