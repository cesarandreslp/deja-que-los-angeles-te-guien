import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import BlogPostClient from './BlogPostClient'

export const dynamic = 'force-dynamic'

interface Props {
  params: {
    slug: string
  }
}

// Generar metadata dinámica para SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.blog_posts.findUnique({
    where: { 
      slug: params.slug,
      status: 'PUBLISHED'
    },
    include: {
      User: { select: { fullName: true, email: true } },
      blog_categories: { select: { name: true } },
    },
  })

  if (!post) {
    return {
      title: 'Post no encontrado | Blog Angelical',
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oraculoarcangeles.com'
  const postUrl = `${siteUrl}/blog/${post.slug}`
  const imageUrl = post.coverImage || `${siteUrl}/images/default-blog.jpg`

  return {
    title: `${post.title} | Blog Angelical`,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: post.User.fullName }],
    
    // Open Graph (Facebook, LinkedIn, etc.)
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      url: postUrl,
      siteName: 'Oráculo de los Arcángeles',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.User.fullName],
      tags: post.tags,
      locale: 'es_ES',
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [imageUrl],
      creator: '@oraculoarcangeles',
      site: '@oraculoarcangeles',
    },
    
    // Canonical URL
    alternates: {
      canonical: postUrl,
    },
    
    // Otros metadatos
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}


export default async function BlogPostPage({ params }: Props) {
  const post = await prisma.blog_posts.findUnique({
    where: { 
      slug: params.slug,
      status: 'PUBLISHED'
    },
    include: {
      User: {
        select: {
          id: true,
          fullName: true,
          email: true,
        }
      },
      blog_categories: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      blog_comments: {
        where: { isApproved: true },
        include: {
          User: {
            select: {
              fullName: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    },
  })

  if (!post) {
    notFound()
  }

  // Calcular tiempo de lectura
  const wordsPerMinute = 200
  const words = post.content.split(/\s+/).length
  const readingTime = Math.ceil(words / wordsPerMinute)

  // JSON-LD para Google Rich Snippets
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oraculoarcangeles.com'
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    image: post.coverImage || `${siteUrl}/images/default-blog.jpg`,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: post.User.fullName,
      url: `${siteUrl}/consultores/${post.User.id}`
    },
    publisher: {
      '@type': 'Organization',
      name: 'Oráculo de los Arcángeles',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`
      }
    },
    description: post.excerpt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${post.slug}`
    },
    keywords: post.tags.join(', '),
    articleSection: post.blog_categories.name,
    wordCount: words,
    inLanguage: 'es-ES',
    interactionStatistic: [
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/LikeAction',
        userInteractionCount: post.likes
      },
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/CommentAction',
        userInteractionCount: post.blog_comments.length
      }
    ]
  }

  // Breadcrumb JSON-LD
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: siteUrl
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${siteUrl}/blog`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.blog_categories.name,
        item: `${siteUrl}/blog/categoria/${post.blog_categories.slug}`
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: post.title,
        item: `${siteUrl}/blog/${post.slug}`
      }
    ]
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      
      {/* Componente cliente con la UI interactiva */}
      <BlogPostClient
        post={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          content: post.content,
          excerpt: post.excerpt,
          coverImage: post.coverImage,
          tags: post.tags,
          views: post.views,
          likes: post.likes,
          publishedAt: post.publishedAt?.toISOString() || '',
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
          author: {
            id: post.User.id,
            fullName: post.User.fullName,
            email: post.User.email,
          },
          category: {
            id: post.blog_categories.id,
            name: post.blog_categories.name,
            slug: post.blog_categories.slug,
          },
          comments: post.blog_comments.map(comment => ({
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt.toISOString(),
            updatedAt: comment.updatedAt.toISOString(),
            isApproved: comment.isApproved,
            user: {
              fullName: comment.User.fullName,
            },
          }))
        }}
        readingTime={readingTime}
      />
    </>
  )
}
