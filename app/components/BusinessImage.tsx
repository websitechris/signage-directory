'use client'

import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'

interface BusinessImageProps {
  src: string | null
  alt: string
  size: 'card' | 'detail'
  className?: string
}

export default function BusinessImage({
  src,
  alt,
  size,
  className = '',
}: BusinessImageProps) {
  const [mounted, setMounted] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isLoadingRef = useRef(true)

  // Determine dimensions based on size
  const width = size === 'card' ? 200 : 400
  const height = size === 'card' ? 150 : 300

  // Only enable error handling after mount to prevent hydration errors
  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset states when src changes
  useEffect(() => {
    if (mounted && src) {
      setImageError(false)
      setIsLoading(true)
      isLoadingRef.current = true
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      // Set up timeout - if image doesn't load within 5 seconds, show placeholder
      timeoutRef.current = setTimeout(() => {
        if (isLoadingRef.current) {
          setImageError(true)
          setIsLoading(false)
          isLoadingRef.current = false
        }
      }, 5000)
      
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
      }
    }
  }, [src, mounted])

  const handleError = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setImageError(true)
    setIsLoading(false)
    isLoadingRef.current = false
  }

  const handleLoadingComplete = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsLoading(false)
    isLoadingRef.current = false
  }

  // If no src, show placeholder
  if (!src) {
    return (
      <div suppressHydrationWarning>
        <Image
          src="/sign-placeholder.jpg"
          alt="Sign shop placeholder"
          width={width}
          height={height}
          className={className}
          unoptimized={true}
        />
      </div>
    )
  }

  // If error occurred (only after mount), show placeholder
  if (mounted && imageError) {
    return (
      <div suppressHydrationWarning>
        <Image
          src="/sign-placeholder.jpg"
          alt="Sign shop placeholder"
          width={width}
          height={height}
          className={className}
          unoptimized={true}
        />
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
        onError={mounted ? handleError : undefined}
        onLoadingComplete={mounted ? handleLoadingComplete : undefined}
        unoptimized={true}
      />
    </div>
  )
}

