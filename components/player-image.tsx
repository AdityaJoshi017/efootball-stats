"use client"

interface PlayerImageProps {
  src?: string
  alt: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export function PlayerImage({ src, alt, size = "md", className = "" }: PlayerImageProps) {
  const sizeClasses = {
    sm: "w-24 h-34", // 48px × 64px
    md: "w-24 h-34", // 96px × 136px (standard)
    lg: "w-32 h-44", // 128px × 176px
    xl: "w-40 h-56", // 160px × 224px
  }

  return (
    <img
      src={src || "/placeholder.svg?height=136&width=96&query=football player"}
      alt={alt}
      className={`${sizeClasses[size]} object-cover ${className}`}
    />
  )
}
