"use client"

import { useState } from "react"
import { getFileUrl } from "@/lib/utils/fileUrl"
import { User } from "lucide-react"

interface SafeImageProps {
  src: string | null | undefined
  alt: string
  className?: string
  fallbackClassName?: string
  size?: "sm" | "md" | "lg"
}

export function SafeImage({ src, alt, className = "", fallbackClassName = "", size = "md" }: SafeImageProps) {
  const [error, setError] = useState(false)

  const sizeClasses = {
    sm: "w-9 h-9",
    md: "w-16 h-16",
    lg: "w-24 h-24"
  }

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-10 h-10"
  }

  const imageUrl = getFileUrl(src)

  if (!imageUrl || error) {
    return (
      <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center border border-blue-50 ${fallbackClassName}`}>
        <User className={`${iconSizes[size]} text-blue-400`} />
      </div>
    )
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={`${sizeClasses[size]} rounded-xl object-cover ${className}`}
      onError={() => setError(true)}
    />
  )
}