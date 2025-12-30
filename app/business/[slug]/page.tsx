import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import BusinessImage from '../../components/BusinessImage'
import BusinessMap from '../../components/BusinessMap'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const dynamic = 'force-dynamic'

function cityToSlug(cityName: string): string {
  return cityName.toLowerCase().trim().replace(/\s+/g, '-')
}

function renderStars(rating: number): string {
  const fullStars = Math.floor(rating)
  const emptyStars = 5 - fullStars
  
  return '★'.repeat(fullStars) + '☆'.repeat(emptyStars)
}

async function getBusinessBySlug(slug: string) {
  const { data, error } = await supabase
    .from('signage_businesses')
    .select('business_name, slug, category, description, phone, url, address, address_info_city, rating, votes_count, about, place_id, logo, main_image, latitude, longitude')
    .eq('slug', slug)
    .single()
  
  if (error || !data) {
    return null
  }
  
  return data
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const business = await getBusinessBySlug(slug)
  
  if (!business) {
    return {
      title: 'Business Not Found',
      description: 'The requested business could not be found.',
    }
  }

  // Check if rating exists and is valid
  const ratingValue = business.rating
  const hasRating = ratingValue !== null && 
                   ratingValue !== undefined && 
                   !isNaN(Number(ratingValue)) && 
                   Number(ratingValue) >= 0
  
  const ratingDisplay = hasRating ? `${Number(ratingValue).toFixed(1)}★` : ''
  const cityDisplay = business.address_info_city ? ` in ${business.address_info_city}` : ''
  
  const title = `${business.business_name} - Sign Shop${cityDisplay}${ratingDisplay ? ` | ${ratingDisplay}` : ''}`
  
  // Use first 150-160 characters of 'about' field for description, fallback to description field
  let description = ''
  if (business.about) {
    // Take first 160 chars, then trim to ensure we're within 150-160 range
    let rawDescription = business.about.substring(0, 160).trim()
    // If it's too short, pad it; if too long, trim it
    if (rawDescription.length < 150) {
      // Try to extend if there's more content
      if (business.about.length > 160) {
        rawDescription = business.about.substring(0, 160).trim()
      }
      // If still short, add context
      if (rawDescription.length < 150) {
        rawDescription += ` Sign shop${cityDisplay ? ` in ${business.address_info_city}` : ''}.`
      }
    }
    // Ensure it's not over 160
    if (rawDescription.length > 160) {
      rawDescription = rawDescription.substring(0, 157) + '...'
    }
    description = rawDescription
  } else if (business.description) {
    let rawDescription = business.description.substring(0, 160).trim()
    if (rawDescription.length < 150) {
      if (business.description.length > 160) {
        rawDescription = business.description.substring(0, 160).trim()
      }
      if (rawDescription.length < 150) {
        rawDescription += ` Sign shop${cityDisplay ? ` in ${business.address_info_city}` : ''}.`
      }
    }
    if (rawDescription.length > 160) {
      rawDescription = rawDescription.substring(0, 157) + '...'
    }
    description = rawDescription
  } else {
    description = `${business.business_name}${cityDisplay ? ` in ${business.address_info_city}` : ''}. Professional signage services${ratingDisplay ? ` with ${ratingDisplay} rating` : ''}.`
    // Ensure fallback description is also 150-160 chars
    if (description.length < 150) {
      description += ` Sign shop${cityDisplay ? ` in ${business.address_info_city}` : ''} offering signage services.`
    }
    if (description.length > 160) {
      description = description.substring(0, 157) + '...'
    }
  }

  return {
    title,
    description,
    keywords: [
      `sign shop ${business.address_info_city || ''}`,
      'signage',
      'vehicle graphics',
      'sign makers',
      'custom signage',
      business.business_name || '',
      business.category || '',
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const business = await getBusinessBySlug(slug)
  
  if (!business) {
    notFound()
  }
  
  // Check if rating exists and is valid
  const ratingValue = business.rating
  const hasRating = ratingValue !== null && 
                   ratingValue !== undefined && 
                   !isNaN(Number(ratingValue)) && 
                   Number(ratingValue) >= 0
  
  return (
    <div className="min-h-screen">
      {/* Blue gradient header matching homepage */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-6">
            {business.business_name}
          </h1>
          {business.category && (
            <p className="text-xl mb-4 text-blue-100">
              {business.category}
            </p>
          )}
          {business.address_info_city && (
            <p className="text-lg text-blue-100">
              {business.address_info_city}
            </p>
          )}
        </div>
      </section>

      {/* Main content */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        {/* Back to city button */}
        {business.address_info_city && (
          <a 
            href={`/${cityToSlug(business.address_info_city)}`}
            className="inline-block mb-4 text-white bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
          >
            ← Back to {business.address_info_city} Businesses
          </a>
        )}
        {/* Business Image with Text Overlay */}
        <div className="mb-8 w-full h-[300px] relative rounded-lg overflow-hidden bg-gray-100 shadow-lg">
          <BusinessImage
            src={business.main_image || business.logo}
            alt={`${business.business_name || 'Business'} image`}
            size="detail"
            className="w-full h-full object-cover"
          />
          {/* Semi-transparent text overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent flex items-end">
            <div className="w-full p-6 backdrop-blur-sm">
              <h2 className="text-3xl font-bold text-white mb-2">
                {business.business_name}
              </h2>
              {business.category && (
                <p className="text-lg text-white/90 mb-1">
                  {business.category}
                </p>
              )}
              {business.address_info_city && (
                <p className="text-base text-white/80">
                  {business.address_info_city}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Professional Rating Card */}
        {(hasRating || business.votes_count) && (
          <div className="mb-8 p-8 bg-white rounded-lg shadow-lg border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              {/* Left side: Rating number and stars */}
              <div className="flex items-center gap-6">
                {hasRating && (
                  <>
                    <div className="text-5xl font-bold text-gray-900">
                      {Number(ratingValue).toFixed(1)}
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="text-3xl text-yellow-500 tracking-wide">
                        {renderStars(Number(ratingValue))}
                      </div>
                      {business.votes_count !== undefined && business.votes_count !== null && business.votes_count > 0 && (
                        <div className="text-sm text-gray-600 font-medium">
                          {business.votes_count.toLocaleString()} {business.votes_count === 1 ? 'review' : 'reviews'}
                        </div>
                      )}
                    </div>
                  </>
                )}
                {!hasRating && business.votes_count !== undefined && business.votes_count !== null && business.votes_count > 0 && (
                  <div className="text-gray-600 font-medium">
                    {business.votes_count.toLocaleString()} {business.votes_count === 1 ? 'review' : 'reviews'} - No rating yet
                  </div>
                )}
              </div>
              
              {/* Right side: Progress bar */}
              {hasRating && (
                <div className="flex-1 max-w-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Rating</span>
                    <span className="text-sm text-gray-600">{Number(ratingValue).toFixed(1)} / 5.0</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${(Number(ratingValue) / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* About section */}
        {business.about && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">About</h2>
            <div className="p-6 bg-white rounded-lg shadow">
              <p className="text-gray-800 text-base leading-relaxed whitespace-pre-line">
                {business.about}
              </p>
            </div>
          </div>
        )}

        {/* Description section (if different from about) */}
        {business.description && business.description !== business.about && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Description</h2>
            <div className="p-6 bg-white rounded-lg shadow">
              <p className="text-gray-800 text-base leading-relaxed whitespace-pre-line">
                {business.description}
              </p>
            </div>
          </div>
        )}

        {/* Location section */}
        {business.latitude && business.longitude && 
         !isNaN(Number(business.latitude)) && 
         !isNaN(Number(business.longitude)) && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Location</h2>
            <div className="p-6 bg-white rounded-lg shadow">
              <BusinessMap
                latitude={Number(business.latitude)}
                longitude={Number(business.longitude)}
                businessName={business.business_name || 'Business'}
              />
            </div>
          </div>
        )}

        {/* Contact section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Contact</h2>
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="space-y-4">
              {/* Address */}
              {business.address && (
                <div>
                  <h3 className="text-gray-700 font-semibold mb-1">Address</h3>
                  <p className="text-gray-800 text-base">
                    {business.address}
                  </p>
                </div>
              )}

              {/* Phone */}
              {business.phone && (
                <div>
                  <h3 className="text-gray-700 font-semibold mb-1">Phone</h3>
                  <a 
                    href={`tel:${business.phone}`}
                    className="text-blue-600 hover:text-blue-800 font-medium text-base underline"
                  >
                    {business.phone}
                  </a>
                </div>
              )}

              {/* Website */}
              {business.url && (
                <div>
                  <h3 className="text-gray-700 font-semibold mb-1">Website</h3>
                  <a 
                    href={business.url.startsWith('http') ? business.url : `https://${business.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium text-base underline"
                  >
                    {business.url}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

