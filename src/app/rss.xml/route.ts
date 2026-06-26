import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oraculoarcangeles.com'
  
  try {
    const posts = await prisma.blog_posts.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        User: { select: { fullName: true, email: true } },
        blog_categories: { select: { name: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    })

    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Blog Angelical - Oráculo de los Arcángeles</title>
    <link>${siteUrl}/blog</link>
    <description>Descubre mensajes angelicales, guía espiritual y sabiduría divina en nuestro blog</description>
    <language>es-ES</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${siteUrl}/logo.png</url>
      <title>Blog Angelical - Oráculo de los Arcángeles</title>
      <link>${siteUrl}/blog</link>
    </image>
    ${posts.map((post: any) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <content:encoded><![CDATA[${post.content}]]></content:encoded>
      <dc:creator>${post.User.fullName}</dc:creator>
      <category>${post.blog_categories.name}</category>
      ${post.tags.map((tag: string) => `<category>${tag}</category>`).join('\n      ')}
      <pubDate>${post.publishedAt?.toUTCString()}</pubDate>
      ${post.coverImage ? `<enclosure url="${post.coverImage}" type="image/jpeg" />` : ''}
    </item>`).join('\n')}
  </channel>
</rss>`

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Error generando RSS feed:', error)
    return new NextResponse('Error generando RSS feed', { status: 500 })
  }
}
