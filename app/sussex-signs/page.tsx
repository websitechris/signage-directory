import Link from 'next/link'

export default function SussexSignsPage() {
  const nearbyCities = [
    { name: 'Brighton', slug: 'brighton' },
    { name: 'Worthing', slug: 'worthing' },
    { name: 'Portsmouth', slug: 'portsmouth' },
    { name: 'Southampton', slug: 'southampton' }
  ]

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Find Sign Shops in Sussex & South East England
          </h1>
          <p className="text-xl mb-8 text-blue-100">
            Looking for professional signage services in Brighton, Worthing, or across Sussex? Browse our directory of top-rated sign shops serving the South East.
          </p>
          <Link
            href="/"
            className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
          >
            Browse Sussex Sign Shops
          </Link>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Nearby Cities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {nearbyCities.map((city) => (
            <Link
              key={city.slug}
              href={`/${city.slug}`}
              className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-100 text-center"
            >
              <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                {city.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

