'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

interface BusinessImageProps {
  src: string | null
  alt: string
  size: 'card' | 'detail'
  className?: string
}

function PlaceholderSVG({ size, className }: { size: 'card' | 'detail'; className?: string }) {
  const viewBox = size === 'card' ? '0 0 200 150' : '0 0 400 300'
  const fontSize = size === 'card' ? '16' : '24'
  const rectWidth = size === 'card' ? '200' : '400'
  const rectHeight = size === 'card' ? '150' : '300'

  return (
    <svg
      width={rectWidth}
      height={rectHeight}
      viewBox={viewBox}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`gradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#2563eb', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#1e40af', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <rect width={rectWidth} height={rectHeight} fill={`url(#gradient-${size})`} />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="white"
        fontSize={fontSize}
        fontWeight="600"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        Sign Shop
      </text>
    </svg>
  )
}

export default function BusinessImage({
  src,
  alt,
  size,
  className = '',
}: BusinessImageProps) {
  const [mounted, setMounted] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Determine dimensions based on size
  const width = size === 'card' ? 200 : 400
  const height = size === 'card' ? 150 : 300

  // Only enable error handling after mount to prevent hydration errors
  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset error state when src changes
  useEffect(() => {
    if (mounted) {
      setImageError(false)
    }
  }, [src, mounted])

  // If no src, show placeholder
  if (!src) {
    return (
      <div suppressHydrationWarning>
        <PlaceholderSVG size={size} className={className} />
      </div>
    )
  }

  // If error occurred (only after mount), show placeholder
  if (mounted && imageError) {
    return (
      <div suppressHydrationWarning>
        <PlaceholderSVG size={size} className={className} />
      </div>
    )
  }

  return (
    <div suppressHydrationWarning>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={mounted ? () => setImageError(true) : undefined}
        unoptimized={true}
      />
    </div>
  )
}

