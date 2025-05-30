"use client"

import { useEffect, useState } from "react"
import { RouteGuard } from "@/components/route-guard"
import { Navigation } from "@/components/navigation"
import { MapView } from "@/components/map-view"
import { CharityList } from "@/components/charity-list"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, MapPin } from "lucide-react"

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

const categories = [
  "All Categories",
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

export default function MapPage() {
  const [charities, setCharities] = useState<Charity[]>([])
  const [filteredCharities, setFilteredCharities] = useState<Charity[]>([])
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"map" | "list">("map")

  const supabase = createClient()

  useEffect(() => {
    fetchCharities()
  }, [])

  useEffect(() => {
    filterCharities()
  }, [charities, searchQuery, selectedCategory])

  const fetchCharities = async () => {
    try {
      const { data, error } = await supabase
        .from("charities")
        .select("*")
        .not("latitude", "is", null)
        .not("longitude", "is", null)

      if (error) throw error
      setCharities(data || [])
    } catch (error) {
      console.error("Error fetching charities:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterCharities = () => {
    let filtered = charities

    if (searchQuery) {
      filtered = filtered.filter(
        (charity) =>
          charity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          charity.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          charity.address?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter((charity) => charity.category === selectedCategory)
    }

    setFilteredCharities(filtered)
  }

  return (
    <RouteGuard requireAuth={true}>
      <div className="min-h-screen bg-white">
        <Navigation />

        <div className="h-[calc(100vh-4rem)] flex flex-col">
          {/* Search and Filter Bar */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search charities, locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "map" ? "default" : "outline"}
                    onClick={() => setViewMode("map")}
                    className={viewMode === "map" ? "bg-map-blue hover:bg-blue-600" : ""}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Map
                  </Button>
                  <Button variant={viewMode === "list" ? "default" : "outline"} onClick={() => setViewMode("list")}>
                    <Filter className="h-4 w-4 mr-2" />
                    List
                  </Button>
                </div>
              </div>

              <div className="mt-2 text-sm text-gray-600">{filteredCharities.length} charities found</div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 relative">
            {viewMode === "map" ? (
              <div className="grid lg:grid-cols-3 h-full">
                <div className="lg:col-span-2">
                  <MapView
                    charities={filteredCharities}
                    selectedCharity={selectedCharity}
                    onCharitySelect={setSelectedCharity}
                  />
                </div>
                <div className="bg-white border-l border-gray-200 overflow-y-auto">
                  <CharityList
                    charities={filteredCharities}
                    selectedCharity={selectedCharity}
                    onCharitySelect={setSelectedCharity}
                    loading={loading}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full overflow-y-auto">
                <div className="max-w-4xl mx-auto p-4">
                  <CharityList
                    charities={filteredCharities}
                    selectedCharity={selectedCharity}
                    onCharitySelect={setSelectedCharity}
                    loading={loading}
                    showFullDetails
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </RouteGuard>
  )
}
