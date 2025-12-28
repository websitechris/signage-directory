'use client'

import { useState } from 'react'

interface BusinessImageProps {
  src: string | null
  alt: string
  size: 'card' | 'detail'
  className?: string
}

export default function BusinessImage({ src, alt, size, className = '' }: BusinessImageProps) {
  const [imageError, setImageError] = useState(false)
  
  const dimensions = size === 'card' 
    ? { width: 200, height: 150 }
    : { width: 400, height: 300 }
  
  if (!src || imageError) {
    return (
      <div suppressHydrationWarning>
        <img
          src="/signshop-placeholder.jpg"
          alt="Sign shop storefront"
          width={dimensions.width}
          height={dimensions.height}
          className={className}
        />
      </div>
    )
  }
  
  return (
    <div suppressHydrationWarning>
      <img
        src={src}
        alt={alt}
        width={dimensions.width}
        height={dimensions.height}
        className={className}
        onError={() => setImageError(true)}
      />
    </div>
  )
}
