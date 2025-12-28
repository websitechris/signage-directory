import { createClient } from '@supabase/supabase-js'
import { MetadataRoute } from 'next'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function normalizeCityName(cityName: string | null): string {
  if (!cityName) return ''
  return cityName.trim().toLowerCase()
}

function createCitySlug(cityName: string): string {
  return cityName.toLowerCase().replace(/\s+/g, '-')
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://atozofsigns.co.uk'
  const now = new Date()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/sussex-signs`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/planning-permission-business-sign`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/shop-sign-cost-2025`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/dibond-vs-aluminium-signage`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/calculator`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  // Fetch all businesses to get cities and business slugs
  const batchSize = 1000
  const allBusinesses: Array<{
    address_info_city: string | null
    slug: string | null
    updated_at?: string | null
  }> = []
  
  // Get total count first
  const { count: totalCount, error: countError } = await supabase
    .from('signage_businesses')
    .select('*', { count: 'exact', head: true })
  
  if (countError) {
    console.error('Error getting total count:', countError)
    return staticPages
  }

  // Fetch all businesses using pagination
  let offset = 0
  while (offset < (totalCount || 0)) {
    const end = Math.min(offset + batchSize - 1, (totalCount || 0) - 1)
    
    const { data, error } = await supabase
      .from('signage_businesses')
      .select('address_info_city, slug, updated_at')
      .range(offset, end)
    
    if (error) {
      console.error(`Error fetching businesses batch (${offset}-${end}):`, error)
      break
    }
    
    if (data && data.length > 0) {
      allBusinesses.push(...data)
    } else {
      break
    }
    
    offset += batchSize
    
    if (data && data.length < batchSize) {
      break
    }
  }

  // Get unique cities (normalized for grouping)
  const cityMap = new Map<string, {
    originalCity: string
    updatedAt: Date | null
  }>()

  allBusinesses.forEach(business => {
    const originalCity = business.address_info_city
    if (!originalCity) return
    
    const normalizedCity = normalizeCityName(originalCity)
    if (!normalizedCity) return
    
    // Keep the most common original city name and latest update date
    if (!cityMap.has(normalizedCity)) {
      cityMap.set(normalizedCity, {
        originalCity: originalCity.trim(),
        updatedAt: business.updated_at ? new Date(business.updated_at) : null
      })
    } else {
      const existing = cityMap.get(normalizedCity)!
      // Update if this business has a more recent update
      if (business.updated_at) {
        const businessDate = new Date(business.updated_at)
        if (!existing.updatedAt || businessDate > existing.updatedAt) {
          existing.updatedAt = businessDate
        }
      }
    }
  })

  // Generate city pages
  const cityPages: MetadataRoute.Sitemap = Array.from(cityMap.values()).map(city => ({
    url: `${baseUrl}/${createCitySlug(city.originalCity)}`,
    lastModified: city.updatedAt || now,
    changeFrequency: 'weekly',
    priority: 0.9,
  }))

  // Generate business pages
  const businessPages: MetadataRoute.Sitemap = allBusinesses
    .filter(business => business.slug) // Only include businesses with slugs
    .map(business => ({
      url: `${baseUrl}/business/${business.slug}`,
      lastModified: business.updated_at ? new Date(business.updated_at) : now,
      changeFrequency: 'monthly',
      priority: 0.8,
    }))

  // Combine all pages
  return [...staticPages, ...cityPages, ...businessPages]
}

