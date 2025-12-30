import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getBlogPostBySlug, getRelatedPosts } from '../data'

export const dynamic = 'force-dynamic'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)

  if (!post) {
    return {
      title: 'Post Not Found - A to Z of Signs',
      description: 'The requested blog post could not be found.',
    }
  }

  // Ensure description is between 150-160 characters
  let description = post.excerpt
  if (description.length < 150) {
    // Try to extend with more context if available
    description = post.excerpt + ' Expert guidance for UK businesses.'
    if (description.length > 160) {
      description = description.substring(0, 157) + '...'
    }
  } else if (description.length > 160) {
    description = description.substring(0, 157) + '...'
  }

  return {
    title: `${post.title} - A to Z of Signs`,
    description,
    keywords: [post.category.toLowerCase(), 'signage', 'business signs', post.title],
    openGraph: {
      title: `${post.title} - A to Z of Signs`,
      description,
      type: 'article',
      publishedTime: post.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} - A to Z of Signs`,
      description,
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)
  const relatedPosts = getRelatedPosts(slug, 2)

  if (!post) {
    notFound()
  }

  // Convert markdown-style content to HTML (simple conversion)
  const formatContent = (content: string) => {
    const lines = content.split('\n')
    let html = ''
    let inList = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()

      // Headers
      if (trimmed.startsWith('# ')) {
        if (inList) {
          html += '</ul>'
          inList = false
        }
        html += `<h2 class="text-3xl font-bold text-gray-900 mt-8 mb-4">${trimmed.substring(2)}</h2>`
        continue
      }
      if (trimmed.startsWith('## ')) {
        if (inList) {
          html += '</ul>'
          inList = false
        }
        html += `<h3 class="text-2xl font-bold text-gray-900 mt-6 mb-3">${trimmed.substring(3)}</h3>`
        continue
      }
      if (trimmed.startsWith('### ')) {
        if (inList) {
          html += '</ul>'
          inList = false
        }
        html += `<h4 class="text-xl font-semibold text-gray-900 mt-4 mb-2">${trimmed.substring(4)}</h4>`
        continue
      }

      // Lists
      if (trimmed.startsWith('- ')) {
        if (!inList) {
          html += '<ul class="list-disc mb-4 ml-6 space-y-2">'
          inList = true
        }
        let listItem = trimmed.substring(2)
        // Process bold text in list items
        listItem = listItem.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
        html += `<li class="text-gray-900">${listItem}</li>`
        continue
      }

      // End list if we hit a non-list line
      if (inList && trimmed !== '') {
        html += '</ul>'
        inList = false
      }

      // Empty lines
      if (trimmed === '') {
        html += '<br />'
        continue
      }

      // Regular paragraphs
      let paragraph = trimmed
      // Process bold text
      paragraph = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      html += `<p class="mb-4 text-gray-900 leading-relaxed">${paragraph}</p>`
    }

    // Close any open list
    if (inList) {
      html += '</ul>'
    }

    return html
  }

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Breadcrumb navigation */}
          <nav className="mb-6 text-sm">
            <ol className="flex items-center gap-2 text-blue-100">
              <li>
                <Link href="/" className="hover:text-white hover:underline">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/blog" className="hover:text-white hover:underline">
                  Blog
                </Link>
              </li>
              <li>/</li>
              <li className="text-white">{post.title}</li>
            </ol>
          </nav>

          {/* Category tag */}
          <div className="mb-4">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-white rounded-full">
              {post.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>

          {/* Date */}
          <p className="text-lg text-blue-100">{formatDate(post.date)}</p>
        </div>
      </section>

      {/* Article content */}
      <article className="bg-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div
            className="prose prose-lg max-w-none text-gray-900 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
          />
        </div>
      </article>

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow group"
                >
                  {/* Category tag */}
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full">
                      {relatedPost.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {relatedPost.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                    {relatedPost.excerpt}
                  </p>

                  {/* Date */}
                  <p className="text-gray-500 text-xs font-medium">
                    {formatDate(relatedPost.date)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

