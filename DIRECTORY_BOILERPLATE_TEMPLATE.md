# Directory Boilerplate Template

This template provides a quick-start guide for creating a business directory website using Next.js, Supabase, and Tailwind CSS.

## Table of Contents

- [Next.js Components](#nextjs-components)
- [SEO Metadata Setup](#seo-metadata-setup)
- [Deployment Checklist](#deployment-checklist)

## Next.js Components

[Your existing component documentation here]

## SEO Metadata Setup

### Quick Setup (One Command)

**Use Cursor Composer to add comprehensive SEO metadata to all pages at once:**

```
Add comprehensive SEO metadata to all pages in the directory.

Check these files and add proper Next.js metadata exports:

1. app/page.tsx - Homepage
   - Title: "A to Z of {Category} - Find UK {Category} Businesses & Services"
   - Description: 150-160 chars mentioning business count, city count, ratings

2. app/[city]/page.tsx - City pages
   - Add generateMetadata() function
   - Title: "{Category} Businesses in {City} - {count} Top-Rated Businesses"
   - Description: Include city name, business count, average rating
   - Include star rating: "Average {rating}★"

3. app/business/[slug]/page.tsx - Business pages
   - Add generateMetadata() function
   - Title: "{Business Name} - {Category} in {City} | {Rating}★"
   - Description: First 150-160 chars from business 'about' field

4. app/blog/page.tsx - Blog listing
   - Title and description for the blog home

5. app/blog/[slug]/page.tsx - Individual blog posts
   - Add generateMetadata() using post title and excerpt

All descriptions should be 150-160 characters. Include OpenGraph tags for social sharing.
```

**This single command will add metadata to all pages in under 5 minutes!**

### Metadata Structure Templates

#### 1. Homepage (Static Metadata)

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'A to Z of {Category} - Find UK {Category} Businesses & Services',
  description: 'Find top-rated {category} businesses across the UK. Browse {count}+ verified businesses in {cityCount} cities with an average {rating}★ rating.',
  keywords: ['{category}', 'business directory', 'UK businesses', 'local services'],
  openGraph: {
    title: 'A to Z of {Category} - Find UK {Category} Businesses & Services',
    description: 'Find top-rated {category} businesses across the UK. Browse {count}+ verified businesses in {cityCount} cities with an average {rating}★ rating.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'A to Z of {Category} - Find UK {Category} Businesses & Services',
    description: 'Find top-rated {category} businesses across the UK. Browse {count}+ verified businesses in {cityCount} cities.',
  },
}
```

#### 2. City Pages (Dynamic with generateMetadata)

```typescript
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>
}): Promise<Metadata> {
  const { city } = await params
  const { cityName, expectedCount, avgRating } = await getBusinessesByCity(city)
  
  const avgRatingDisplay = avgRating && avgRating > 0 ? avgRating.toFixed(1) : '4.8'
  const title = `{Category} Businesses in ${cityName} - ${expectedCount} Top-Rated Businesses`
  
  // Ensure description is 150-160 characters
  let description = `Find the best {category} businesses in ${cityName}. Compare ${expectedCount} verified businesses with an average ${avgRatingDisplay}★ rating. Professional services available.`
  
  if (description.length > 160) {
    description = description.substring(0, 157) + '...'
  }

  return {
    title,
    description,
    keywords: [`{category} ${cityName}`, 'business directory', 'local services'],
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
```

#### 3. Business Pages (Dynamic with Ratings)

```typescript
import type { Metadata } from 'next'

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

  const ratingValue = business.rating
  const hasRating = ratingValue !== null && 
                   ratingValue !== undefined && 
                   !isNaN(Number(ratingValue)) && 
                   Number(ratingValue) >= 0
  
  const ratingDisplay = hasRating ? `${Number(ratingValue).toFixed(1)}★` : ''
  const cityDisplay = business.address_info_city ? ` in ${business.address_info_city}` : ''
  
  const title = `${business.business_name} - {Category}${cityDisplay}${ratingDisplay ? ` | ${ratingDisplay}` : ''}`
  
  // Use first 150-160 characters from 'about' field
  let description = ''
  if (business.about) {
    description = business.about.substring(0, 160).trim()
    if (description.length > 160) {
      description = description.substring(0, 157) + '...'
    }
  } else {
    description = `${business.business_name}${cityDisplay}. Professional {category} services${ratingDisplay ? ` with ${ratingDisplay} rating` : ''}.`
  }

  // Ensure 150-160 characters
  if (description.length < 150) {
    description += ` {Category} business${cityDisplay ? ` in ${business.address_info_city}` : ''}.`
  }
  if (description.length > 160) {
    description = description.substring(0, 157) + '...'
  }

  return {
    title,
    description,
    keywords: [
      `{category} ${business.address_info_city || ''}`,
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
```

#### 4. Blog Listing Page

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '{Category} Guides & Resources - A to Z of {Category}',
  description: 'Expert guides on {category} regulations, pricing, materials, and more. Learn everything you need to know about {category} services.',
  keywords: ['{category} guides', '{category} regulations', '{category} pricing', 'business advice'],
  openGraph: {
    title: '{Category} Guides & Resources - A to Z of {Category}',
    description: 'Expert guides on {category} regulations, pricing, materials, and more.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '{Category} Guides & Resources - A to Z of {Category}',
    description: 'Expert guides on {category} regulations, pricing, materials, and more.',
  },
}
```

#### 5. Individual Blog Posts

```typescript
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)

  if (!post) {
    return {
      title: 'Post Not Found - A to Z of {Category}',
      description: 'The requested blog post could not be found.',
    }
  }

  // Ensure description is 150-160 characters
  let description = post.excerpt
  if (description.length < 150) {
    description = post.excerpt + ' Expert guidance for UK businesses.'
    if (description.length > 160) {
      description = description.substring(0, 157) + '...'
    }
  } else if (description.length > 160) {
    description = description.substring(0, 157) + '...'
  }

  return {
    title: `${post.title} - A to Z of {Category}`,
    description,
    keywords: [post.category.toLowerCase(), '{category}', 'business advice', post.title],
    openGraph: {
      title: `${post.title} - A to Z of {Category}`,
      description,
      type: 'article',
      publishedTime: post.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} - A to Z of {Category}`,
      description,
    },
  }
}
```

### Important Notes

- **Description Length**: All meta descriptions should be **150-160 characters** for optimal SEO and social sharing
- **Title Length**: Page titles should be **50-60 characters** for best display in search results
- **OpenGraph Tags**: Always include OpenGraph tags for proper social media sharing (Facebook, LinkedIn, etc.)
- **Twitter Cards**: Include Twitter card metadata for optimal Twitter/X sharing
- **Dynamic Metadata**: Use `generateMetadata()` function for pages with dynamic content (city pages, business pages, blog posts)

### Example: Driveway Installer Directory

For a driveway installer directory, your business page metadata would look like:

```typescript
const title = `${business.business_name} - Driveway Installer in ${cityName} | ${ratingDisplay}`
```

Example output: `"ABC Driveways - Driveway Installer in Manchester | 4.8★"`

## Deployment Checklist

Before deploying your directory site, ensure you've completed:

- [ ] Set up Supabase database with required tables
- [ ] Configure environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- [ ] Add business images to `/public/business-images/` directory
- [ ] Configure Next.js config for image optimization
- [ ] Set up sitemap generation (`app/sitemap.ts`)
- [ ] **Add SEO metadata using Composer (5 mins)** - Use the quick command above to add metadata to all pages
- [ ] **Verify metadata in page source** - Check that titles are 50-60 chars and descriptions are 150-160 chars
- [ ] Test all dynamic routes (city pages, business pages, blog posts)
- [ ] Verify OpenGraph previews using [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [ ] Verify Twitter card previews using [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [ ] Test mobile responsiveness
- [ ] Run production build (`npm run build`)
- [ ] Deploy to Vercel or your preferred hosting platform

### Quick SEO Verification

After adding metadata, verify it's working:

1. **View Page Source**: Right-click → View Page Source → Look for `<title>` and `<meta name="description">` tags
2. **Check Title Length**: Should be 50-60 characters
3. **Check Description Length**: Should be 150-160 characters
4. **Test Social Sharing**: Use the Facebook and Twitter validators above to see how your pages appear when shared

---

**Remember**: The SEO metadata setup can be done in one quick Composer command - it's super quick and easy! Just paste the command template above into Cursor Composer and it will handle all pages automatically.

