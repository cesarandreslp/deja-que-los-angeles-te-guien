import { MetadataRoute } from 'next'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oraculoarcangeles.com'

  let posts: { slug: string; updatedAt: Date; publishedAt: Date | null }[] = []
  let categories: { slug: string; updatedAt: Date }[] = []

  try {
    const { prisma } = await import('@/lib/prisma')
    posts = await prisma.blog_posts.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true, publishedAt: true },
      orderBy: { publishedAt: 'desc' }
    })
    categories = await prisma.blog_categories.findMany({
      select: { slug: true, updatedAt: true }
    })
  } catch {
    // DB not available at build time — return static pages only
  }

  const staticPages = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${siteUrl}/tienda`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${siteUrl}/consultas`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${siteUrl}/membresias`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
  ]

  const blogPostPages = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const categoryPages = categories.map((category) => ({
    url: `${siteUrl}/blog/categoria/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...blogPostPages, ...categoryPages]
}
