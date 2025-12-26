import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import BusinessImage from '../../components/BusinessImage'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const dynamic = 'force-dynamic'

async function getBusinessBySlug(slug: string) {
  const { data, error } = await supabase
    .from('signage_businesses')
    .select('business_name, slug, category, description, phone, url, address, address_info_city, rating, votes_count, about, place_id, logo, main_image')
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
  
  // Use first 155 characters of 'about' field for description, fallback to description field
  let description = ''
  if (business.about) {
    description = business.about.substring(0, 155).trim()
    if (business.about.length > 155) {
      description += '...'
    }
  } else if (business.description) {
    description = business.description.substring(0, 155).trim()
    if (business.description.length > 155) {
      description += '...'
    }
  } else {
    description = `${business.business_name}${cityDisplay ? ` in ${business.address_info_city}` : ''}. Professional signage services${ratingDisplay ? ` with ${ratingDisplay} rating` : ''}.`
  }

  // Ensure description is between 150-160 characters
  if (description.length < 150) {
    description += ` Sign shop${cityDisplay ? ` in ${business.address_info_city}` : ''} offering signage services.`
  }
  if (description.length > 160) {
    description = description.substring(0, 157) + '...'
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
        {/* Business Image */}
        <div className="mb-8 w-full h-[300px] relative rounded-lg overflow-hidden bg-gray-100 shadow-lg">
          <BusinessImage
            src={business.main_image || business.logo}
            alt={`${business.business_name || 'Business'} image`}
            size="detail"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Rating and votes */}
        {(hasRating || business.votes_count) && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow">
            <div className="flex items-center gap-4">
              {hasRating && (
                <div className="flex items-center">
                  <span className="text-gray-900 font-bold text-2xl mr-2">
                    {Number(ratingValue).toFixed(1)}
                  </span>
                  <span className="text-yellow-600 text-3xl">★</span>
                </div>
              )}
              {business.votes_count !== undefined && business.votes_count !== null && business.votes_count > 0 && (
                <span className="text-gray-700 font-medium text-lg">
                  {business.votes_count} {business.votes_count === 1 ? 'vote' : 'votes'}
                </span>
              )}
              {!hasRating && (
                <span className="text-gray-600 font-medium">
                  No rating yet
                </span>
              )}
            </div>
          </div>
        )}

        {/* About section */}
        {business.about && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">About</h2>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Description</h2>
            <div className="p-6 bg-white rounded-lg shadow">
              <p className="text-gray-800 text-base leading-relaxed whitespace-pre-line">
                {business.description}
              </p>
            </div>
          </div>
        )}

        {/* Contact section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact</h2>
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

