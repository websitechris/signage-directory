import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllBlogPosts } from './data'

export const metadata: Metadata = {
  title: 'Signage Guides & Resources - A to Z of Signs',
  description: 'Expert guides on signage regulations, pricing, materials, and more. Learn everything you need to know about business signs and signage services.',
  keywords: ['signage guides', 'signage regulations', 'shop sign cost', 'signage materials', 'business signs', 'signage advice'],
  openGraph: {
    title: 'Signage Guides & Resources - A to Z of Signs',
    description: 'Expert guides on signage regulations, pricing, materials, and more.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Signage Guides & Resources - A to Z of Signs',
    description: 'Expert guides on signage regulations, pricing, materials, and more.',
  },
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function BlogPage() {
  const blogPosts = getAllBlogPosts()

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-6">
            Signage Guides & Resources
          </h1>
          <p className="text-xl text-blue-100">
            Expert advice on signage regulations, pricing, materials, and everything you need to know about business signs.
          </p>
        </div>
      </section>

      {/* Blog posts grid */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow group"
            >
              {/* Category tag */}
              <div className="mb-3">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full">
                  {post.category}
                </span>
              </div>
              
              {/* Title */}
              <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                {post.title}
              </h2>
              
              {/* Excerpt */}
              <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                {post.excerpt}
              </p>
              
              {/* Date */}
              <p className="text-gray-500 text-xs font-medium">
                {formatDate(post.date)}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

