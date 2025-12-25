import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'A to Z of Signs - Find UK Sign Shops & Signage Services',
  description: 'Find top-rated sign shops across the UK. Browse 1,485+ verified signage businesses in 566 cities with an average 4.8★ rating. Compare local sign makers, vehicle graphics, and custom signage services.',
  keywords: ['sign shop', 'signage', 'vehicle graphics', 'sign makers', 'custom signage', 'shop signs', 'UK sign shops', 'signage services', 'vehicle wraps', 'LED signs'],
  openGraph: {
    title: 'A to Z of Signs - Find UK Sign Shops & Signage Services',
    description: 'Find top-rated sign shops across the UK. Browse 1,485+ verified signage businesses in 566 cities with an average 4.8★ rating.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'A to Z of Signs - Find UK Sign Shops & Signage Services',
    description: 'Find top-rated sign shops across the UK. Browse 1,485+ verified signage businesses in 566 cities.',
  },
}

function normalizeCityName(cityName: string | null): string {
  if (!cityName) return ''
  // Trim whitespace and normalize case to handle variations
  return cityName.trim().toLowerCase()
}

async function getCitiesWithCounts() {
  // First, get the total count
  const { count: totalCount, error: countError } = await supabase
    .from('signage_businesses')
    .select('*', { count: 'exact', head: true })
  
  if (countError) {
    console.error('Error getting total count:', countError)
    throw countError
  }
  
  console.log(`[DEBUG] Total businesses in database: ${totalCount}`)
  
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
      console.log(`[DEBUG] Fetched batch: ${offset}-${end} (${data.length} businesses)`)
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
  
  console.log(`[DEBUG] Total businesses fetched: ${allBusinesses.length} out of ${totalCount}`)
  
  // Log Manchester businesses for debugging
  const manchesterBusinesses = allBusinesses.filter(b => {
    const city = b.address_info_city
    return city && normalizeCityName(city) === 'manchester'
  })
  console.log(`[DEBUG] Manchester businesses found: ${manchesterBusinesses.length}`)
  if (manchesterBusinesses.length > 0) {
    const variations = [...new Set(manchesterBusinesses.map(b => b.address_info_city))]
    console.log(`[DEBUG] Manchester city name variations:`, variations)
    console.log(`[DEBUG] Variation counts:`, variations.map(v => ({
      name: v,
      count: manchesterBusinesses.filter(b => b.address_info_city === v).length
    })))
  }
  
  const data = allBusinesses

  // Group by normalized city name to handle variations (spaces, casing, etc.)
  const cityMap = new Map<string, {
    normalizedCity: string
    originalCities: Map<string, number> // Track original variations and their counts
    count: number
    avgRating: number
    totalRating: number
  }>()

  data.forEach(business => {
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
      
      // Debug: Log Manchester grouping
      if (cityData.normalizedCity === 'manchester') {
        console.log(`Manchester: Found ${cityData.count} businesses`)
        console.log(`Manchester variations:`, Array.from(cityData.originalCities.entries()))
      }
      
      return {
        city: mostCommonOriginal.trim(), // Use most common original, trimmed (preserve original casing)
        count: cityData.count,
        avgRating: cityData.count > 0 ? cityData.totalRating / cityData.count : 0
      }
    })
    .sort((a, b) => b.count - a.count)

  // Calculate overall average rating across all businesses
  const businessesWithRatings = data.filter(b => b.rating !== null && b.rating !== undefined && !isNaN(Number(b.rating)))
  const totalRating = businessesWithRatings.reduce((sum, b) => sum + (Number(b.rating) || 0), 0)
  const overallAvgRating = businessesWithRatings.length > 0 ? totalRating / businessesWithRatings.length : 0

  return {
    cities: allCities.slice(0, 24),
    totalBusinesses: data.length,
    totalCities: allCities.length,
    overallAvgRating
  }
}

export default async function Home() {
  const { cities, totalBusinesses, totalCities, overallAvgRating } = await getCitiesWithCounts()

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-6">
            Find UK Sign Shops & Signage Services
          </h1>
          <p className="text-xl mb-8 flex items-center gap-2">
            Discover {totalBusinesses.toLocaleString()}+ top-rated sign shops across {totalCities} UK cities - Average {overallAvgRating.toFixed(1)}
            <span className="text-yellow-400 text-3xl drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] animate-pulse">
              ★
            </span>
            rating
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">Browse by City</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {cities.map((city) => {
            const citySlug = city.city.toLowerCase().replace(/\s+/g, '-')
            return (
              <a
                key={city.city}
                href={`/${citySlug}`}
                className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <h3 className="text-gray-900 font-bold text-xl mb-2">{city.city}</h3>
                <p className="text-gray-700 font-medium">
                  {city.count} businesses • {city.avgRating.toFixed(1)}★ avg
                </p>
              </a>
            )
          })}
        </div>
      </section>
    </div>
  )
}