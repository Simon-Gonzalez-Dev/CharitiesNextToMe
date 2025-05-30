"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { Camera, Upload, X, CheckCircle } from "lucide-react"

interface ProfilePictureUploadProps {
  userId: string
  currentAvatarUrl?: string | null
  userName: string
  onUploadComplete: (url: string) => void
}

export function ProfilePictureUpload({
  userId,
  currentAvatarUrl,
  userName,
  onUploadComplete,
}: ProfilePictureUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
      setError("Please select a PNG or JPEG image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB")
      return
    }

    setUploading(true)
    setError("")
    setSuccess("")

    try {
      // Create unique filename
      const fileExt = file.name.split(".").pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) throw uploadError

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath)

      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from("users")
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (updateError) throw updateError

      setSuccess("Profile picture updated successfully!")
      onUploadComplete(publicUrl)

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error: any) {
      console.error("Error uploading avatar:", error)
      setError(error.message || "Failed to upload profile picture")
    } finally {
      setUploading(false)
    }
  }

  const removeProfilePicture = async () => {
    setUploading(true)
    setError("")
    setSuccess("")

    try {
      // Update user profile to remove avatar URL
      const { error } = await supabase
        .from("users")
        .update({
          avatar_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) throw error

      setSuccess("Profile picture removed successfully!")
      onUploadComplete("")
    } catch (error: any) {
      console.error("Error removing avatar:", error)
      setError(error.message || "Failed to remove profile picture")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Avatar className="h-32 w-32">
            <AvatarImage src={currentAvatarUrl || "/placeholder.svg"} />
            <AvatarFallback className="bg-charity-red text-white text-4xl">
              {userName.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <Button
            size="icon"
            className="absolute bottom-0 right-0 rounded-full bg-charity-red hover:bg-red-600"
            onClick={handleFileSelect}
            disabled={uploading}
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex space-x-2">
          <Button onClick={handleFileSelect} disabled={uploading} variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Uploading..." : "Upload Photo"}
          </Button>
          {currentAvatarUrl && (
            <Button onClick={removeProfilePicture} disabled={uploading} variant="outline" size="sm">
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        onChange={handleFileChange}
        className="hidden"
      />

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

      <div className="text-xs text-gray-500 text-center">Supported formats: PNG, JPEG. Max size: 5MB</div>
    </div>
  )
}
