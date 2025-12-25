import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const dynamic = 'force-dynamic'

function slugToCityName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function normalizeCityName(cityName: string | null): string {
  if (!cityName) return ''
  // Trim whitespace and normalize case to handle variations
  return cityName.trim().toLowerCase()
}

async function getBusinessesByCity(citySlug: string) {
  // Use EXACT same pagination logic as homepage to fetch ALL businesses
  // First, get the total count
  const { count: totalCount, error: countError } = await supabase
    .from('signage_businesses')
    .select('*', { count: 'exact', head: true })
  
  if (countError) {
    console.error('Error getting total count:', countError)
    throw countError
  }
  
  // Fetch ALL businesses using pagination (Supabase caps at 1000 per request)
  const batchSize = 1000
  const allBusinesses: Array<{ address_info_city: string | null; rating: number | null }> = []
  let offset = 0
  
  while (offset < (totalCount || 0)) {
    const end = Math.min(offset + batchSize - 1, (totalCount || 0) - 1)
    
    const { data, error } = await supabase
      .from('signage_businesses')
      .select('address_info_city, rating')
      .range(offset, end)
    
    if (error) {
      console.error(`Error fetching businesses batch (${offset}-${end}):`, error)
      throw error
    }
    
    if (data && data.length > 0) {
      allBusinesses.push(...data)
    } else {
      // No more data
      break
    }
    
    offset += batchSize
    
    // Safety check: if we got fewer records than expected, we're done
    if (data && data.length < batchSize) {
      break
    }
  }
  
  // Group by normalized city name EXACTLY like homepage does
  const cityMap = new Map<string, {
    normalizedCity: string
    originalCities: Map<string, number> // Track original variations and their counts
    count: number
    avgRating: number
    totalRating: number
  }>()

  allBusinesses.forEach(business => {
    const originalCity = business.address_info_city
    if (!originalCity) return // Skip businesses without city
    
    // Normalize city name for grouping (trim whitespace)
    const normalizedCity = normalizeCityName(originalCity)
    if (!normalizedCity) return
    
    if (!cityMap.has(normalizedCity)) {
      cityMap.set(normalizedCity, { 
        normalizedCity,
        originalCities: new Map(),
        count: 0, 
        avgRating: 0, 
        totalRating: 0 
      })
    }
    
    const cityData = cityMap.get(normalizedCity)!
    
    // Track original city name variations
    const originalCount = cityData.originalCities.get(originalCity) || 0
    cityData.originalCities.set(originalCity, originalCount + 1)
    
    // Count business
    cityData.count++
    cityData.totalRating += business.rating || 0
  })

  // Convert to array and use the most common original city name for display
  const allCities = Array.from(cityMap.values())
    .map(cityData => {
      // Find the most common original city name variation
      let mostCommonOriginal = cityData.normalizedCity
      let maxCount = 0
      cityData.originalCities.forEach((count, original) => {
        if (count > maxCount) {
          maxCount = count
          mostCommonOriginal = original
        }
      })
      
      return {
        city: mostCommonOriginal.trim(), // Use most common original, trimmed
        normalizedCity: cityData.normalizedCity,
        originalCities: Array.from(cityData.originalCities.keys()), // All original variations
        count: cityData.count,
        avgRating: cityData.count > 0 ? cityData.totalRating / cityData.count : 0
      }
    })
    .sort((a, b) => b.count - a.count)
  
  // Normalize the slug for matching
  const normalizedSlug = citySlug.toLowerCase().trim()
  
  // Find the city that matches the slug (same logic as homepage link creation)
  const matchingCity = allCities.find(
    city => {
      // Create slug from city name exactly like homepage does
      const citySlugFormat = city.city.toLowerCase().replace(/\s+/g, '-')
      return citySlugFormat === normalizedSlug
    }
  )
  
  if (!matchingCity) {
    return { businesses: [], cityName: slugToCityName(citySlug), expectedCount: 0 }
  }
  
  // Use the most common original city name for display
  const displayCityName = matchingCity.city
  const expectedCount = matchingCity.count
  
  // Query for businesses matching ANY of the original city name variations
  // Use pagination to fetch ALL businesses for this city
  const cityNameVariations = matchingCity.originalCities
  
  // Fetch businesses using pagination to ensure we get all records
  const cityBatchSize = 1000
  const allCityBusinesses: Array<{
    id: any
    place_id: any
    business_name: string | null
    slug: string | null
    rating: number | null
    votes_count: number | null
    about: string | null
    address_info_city: string | null
  }> = []
  let cityOffset = 0
  
  while (true) {
    const end = cityOffset + cityBatchSize - 1
    
    // Build base query
    let query = supabase
      .from('signage_businesses')
      .select('id, place_id, business_name, slug, rating, votes_count, about, address_info_city')
      .range(cityOffset, end)
    
    // Use .in() to match all original city name variations
    if (cityNameVariations.length === 1) {
      query = query.eq('address_info_city', cityNameVariations[0])
    } else if (cityNameVariations.length > 1) {
      query = query.in('address_info_city', cityNameVariations)
    } else {
      // Fallback: use normalized city name
      query = query.ilike('address_info_city', `%${matchingCity.normalizedCity}%`)
    }
    
    const { data, error } = await query
      .order('rating', { ascending: false, nullsFirst: false })
    
    if (error) {
      console.error(`Error fetching city businesses batch (${cityOffset}-${end}):`, error)
      throw error
    }
    
    if (data && data.length > 0) {
      // Filter to ensure we only return businesses that match normalized city name
      const filtered = data.filter(business => {
        if (!business.address_info_city) return false
        const normalized = normalizeCityName(business.address_info_city)
        return normalized === matchingCity.normalizedCity
      })
      allCityBusinesses.push(...filtered)
      
      // If we got fewer records than batch size, we're done
      if (data.length < cityBatchSize) {
        break
      }
      
      cityOffset += cityBatchSize
    } else {
      // No more data
      break
    }
  }
  
  const filteredBusinesses = allCityBusinesses
  
  // Ensure we have businesses - if not, something went wrong
  if (filteredBusinesses.length === 0 && expectedCount > 0) {
    console.warn(`[WARNING] Expected ${expectedCount} businesses for ${displayCityName} but got 0`)
    console.warn(`[WARNING] City name variations:`, cityNameVariations)
  }
  
  return {
    businesses: filteredBusinesses,
    cityName: displayCityName,
    expectedCount
  }
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>
}) {
  const { city } = await params
  const { businesses, cityName, expectedCount } = await getBusinessesByCity(city)
  
  // Ensure businesses is always an array
  const safeBusinesses = businesses || []
  
  // Use the count from grouped data (same as homepage) to ensure counts match
  const businessCount = expectedCount || safeBusinesses.length
  
  if (safeBusinesses.length === 0) {
    notFound()
  }
  
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-6">
            Sign Shops in {cityName}
          </h1>
          <p className="text-xl mb-8">
            {businessCount} {businessCount === 1 ? 'business' : 'businesses'} found
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeBusinesses.map((business) => {
            const businessSlug = business.slug || ''
            // Use id or place_id as unique key (prefer id, fallback to place_id)
            const uniqueKey = business.id || business.place_id || business.business_name
            const excerpt = business.about 
              ? business.about.length > 150 
                ? business.about.substring(0, 150) + '...'
                : business.about
              : 'No description available'
            
            // Properly check if rating exists and is a valid number
            // Check for null, undefined, and also ensure it's a valid number (not NaN)
            const ratingValue = business.rating
            const hasRating = ratingValue !== null && 
                             ratingValue !== undefined && 
                             !isNaN(Number(ratingValue)) && 
                             Number(ratingValue) >= 0
            const ratingDisplay = hasRating ? `${Number(ratingValue).toFixed(1)}★` : 'No rating'
            
            return (
              <a
                key={uniqueKey}
                href={`/business/${businessSlug}`}
                className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-100"
              >
                <h3 className="text-gray-900 font-bold text-2xl mb-3">
                  {business.business_name}
                </h3>
                <div className="text-gray-900 font-semibold text-lg mb-2">
                  {hasRating ? (
                    <span className="inline-flex items-center">
                      <span className="text-gray-900 font-semibold text-lg mr-1">
                        {Number(ratingValue).toFixed(1)}
                      </span>
                      <span className="text-yellow-600 text-xl">★</span>
                    </span>
                  ) : (
                    <span className="text-gray-600 font-medium text-sm">
                      {ratingDisplay}
                    </span>
                  )}
                  {business.votes_count !== undefined && business.votes_count !== null && business.votes_count > 0 && (
                    <span className="text-gray-900 font-semibold ml-2 text-lg">
                      ({business.votes_count} {business.votes_count === 1 ? 'vote' : 'votes'})
                    </span>
                  )}
                </div>
                <p className="text-gray-800 text-base leading-relaxed line-clamp-3">
                  {excerpt}
                </p>
              </a>
            )
          })}
        </div>
      </section>
    </div>
  )
}

