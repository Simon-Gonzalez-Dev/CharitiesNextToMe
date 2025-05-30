"use client"

import { useEffect, useState } from "react"
import { RouteGuard } from "@/components/route-guard"
import { Navigation } from "@/components/navigation"
import { CharityCard } from "@/components/charity-card"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, X } from "lucide-react"

interface Charity {
  id: string
  name: string
  description: string
  category: string
  logo_url: string | null
  verified: boolean
  follower_count: number
  user_following: boolean
  address: string
  city: {
    name: string
    province: string
  } | null
}

interface City {
  id: number
  name: string
  province: string
}

const categories = [
  "Health",
  "Education",
  "Environment",
  "Animals",
  "Community",
  "Arts & Culture",
  "Human Services",
  "International",
  "Religion",
]

export default function SearchPage() {
  const [charities, setCharities] = useState<Charity[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [filteredCharities, setFilteredCharities] = useState<Charity[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [loading, setLoading] = useState(true)
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const supabase = createClient()

  useEffect(() => {
    fetchCharities()
    fetchCities()
  }, [])

  useEffect(() => {
    filterCharities()
    updateActiveFilters()
  }, [charities, searchQuery, selectedCity, selectedCategory])

  const fetchCharities = async () => {
    try {
      const { data, error } = await supabase
        .from("charities")
        .select(`
          *,
          city:canadian_cities(name, province),
          user_following:follows!left(user_id)
        `)
        .order("follower_count", { ascending: false })

      if (error) throw error

      const formattedCharities =
        data?.map((charity) => ({
          ...charity,
          user_following: charity.user_following?.length > 0 || false,
        })) || []

      setCharities(formattedCharities)
    } catch (error) {
      console.error("Error fetching charities:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase.from("canadian_cities").select("*").order("name")

      if (error) throw error
      setCities(data || [])
    } catch (error) {
      console.error("Error fetching cities:", error)
    }
  }

  const filterCharities = () => {
    let filtered = charities

    if (searchQuery) {
      filtered = filtered.filter(
        (charity) =>
          charity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          charity.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedCity) {
      filtered = filtered.filter((charity) => charity.city?.name === selectedCity)
    }

    if (selectedCategory) {
      filtered = filtered.filter((charity) => charity.category === selectedCategory)
    }

    setFilteredCharities(filtered)
  }

  const updateActiveFilters = () => {
    const filters = []
    if (selectedCity) filters.push(`City: ${selectedCity}`)
    if (selectedCategory) filters.push(`Category: ${selectedCategory}`)
    if (searchQuery) filters.push(`Search: ${searchQuery}`)
    setActiveFilters(filters)
  }

  const clearFilter = (filterType: string) => {
    if (filterType.startsWith("City:")) {
      setSelectedCity("")
    } else if (filterType.startsWith("Category:")) {
      setSelectedCategory("")
    } else if (filterType.startsWith("Search:")) {
      setSearchQuery("")
    }
  }

  const clearAllFilters = () => {
    setSearchQuery("")
    setSelectedCity("")
    setSelectedCategory("")
  }

  const handleFollow = async (charityId: string, currentlyFollowing: boolean) => {
    // Implementation would be similar to the feed page
    console.log("Follow/unfollow charity:", charityId, currentlyFollowing)
  }

  return (
    <RouteGuard requireAuth={true}>
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-poppins font-bold text-gray-900 mb-4">Discover Canadian Charities</h1>
            <p className="text-lg text-gray-600">
              Search and filter through thousands of registered charities across Canada
            </p>
          </div>

          {/* Search and Filter Controls */}
          <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search charities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="allCities">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.name}>
                      {city.name}, {city.province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="allCategories">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {activeFilters.map((filter, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {filter}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter(filter)} />
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-charity-red hover:text-red-600"
                >
                  Clear all
                </Button>
              </div>
            )}

            <div className="mt-4 text-sm text-gray-600">{filteredCharities.length} charities found</div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-16 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredCharities.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No charities found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria or browse all charities.</p>
              <Button onClick={clearAllFilters} variant="outline">
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCharities.map((charity) => (
                <div key={charity.id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <CharityCard charity={charity} onFollow={handleFollow} />
                  {charity.city && (
                    <div className="mt-4 flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      {charity.city.name}, {charity.city.province}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RouteGuard>
  )
}
