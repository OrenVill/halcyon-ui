import type { ReactNode } from 'react'
import { BlogLayout } from '../../structures/BlogLayout'
import { DocsSiteLayout } from '../../structures/DocsSiteLayout'
import { ErrorPageLayout } from '../../structures/ErrorPageLayout'
import type { BlogLayoutProps, BlogPostPreview } from '../../structures/BlogLayout'
import type { DocsSiteLayoutProps } from '../../structures/DocsSiteLayout'
import type { ErrorPageLayoutProps } from '../../structures/ErrorPageLayout'
import type { SiteNavLink } from '../../structures/types'
import type { WebsiteRoute } from '../types'

export const docsWebsitePaths = {
  docs: '/docs',
  blog: '/blog',
  blogPost: '/blog/:slug',
  notFound: '/404',
} as const

export type DocsWebsitePageId = keyof typeof docsWebsitePaths

export const docsWebsiteRoutes: WebsiteRoute[] = [
  { id: 'docs', label: 'Documentation', path: docsWebsitePaths.docs },
  { id: 'blog', label: 'Blog', path: docsWebsitePaths.blog },
  { id: 'notFound', label: 'Not found', path: docsWebsitePaths.notFound },
]

const DEFAULT_DOC_NAV: SiteNavLink[] = [
  { href: docsWebsitePaths.docs, label: 'Install', active: true },
  { href: docsWebsitePaths.docs, label: 'Themes' },
  { href: docsWebsitePaths.docs, label: 'Components' },
]

export type DocsWebsiteDocsProps = Omit<DocsSiteLayoutProps, 'brand' | 'sidebarLinks'> & {
  brand: ReactNode
  sidebarLinks?: SiteNavLink[]
}

function DocsWebsiteDocs({
  brand,
  sidebarLinks,
  pageTitle = 'Install',
  pageDescription = 'Add halcyon-ui to your project.',
  ...rest
}: DocsWebsiteDocsProps) {
  return (
    <DocsSiteLayout
      {...rest}
      brand={brand}
      version="docs"
      sidebarLinks={sidebarLinks ?? DEFAULT_DOC_NAV}
      pageTitle={pageTitle}
      pageDescription={pageDescription}
    />
  )
}

export type DocsWebsiteBlogProps = Omit<BlogLayoutProps, 'brand' | 'posts'> & {
  brand: ReactNode
  posts?: BlogPostPreview[]
}

function DocsWebsiteBlog({ brand, posts, navLinks, ...rest }: DocsWebsiteBlogProps) {
  const links =
    navLinks ??
    [
      { href: docsWebsitePaths.docs, label: 'Docs' },
      { href: docsWebsitePaths.blog, label: 'Blog', active: true },
    ]

  const feed: BlogPostPreview[] =
    posts ??
    [
      {
        href: `${docsWebsitePaths.blog}/design-tokens`,
        title: 'Design tokens in production',
        meta: '6 min read',
        excerpt: 'Ship eight themes without a runtime CSS engine.',
      },
      {
        href: `${docsWebsitePaths.blog}/accessible-overlays`,
        title: 'Accessible overlays',
        meta: '8 min read',
        excerpt: 'Focus traps, scroll lock, and live regions.',
      },
    ]

  return <BlogLayout {...rest} brand={brand} navLinks={links} posts={feed} />
}

export type DocsWebsiteBlogPostProps = Omit<BlogLayoutProps, 'brand' | 'pageTitle'> & {
  brand: ReactNode
  pageTitle: ReactNode
}

function DocsWebsiteBlogPost({ brand, pageTitle, pageMeta, navLinks, children, ...rest }: DocsWebsiteBlogPostProps) {
  const links =
    navLinks ??
    [
      { href: docsWebsitePaths.docs, label: 'Docs' },
      { href: docsWebsitePaths.blog, label: 'Blog', active: true },
    ]

  return (
    <BlogLayout
      {...rest}
      brand={brand}
      navLinks={links}
      pageTitle={pageTitle}
      pageMeta={pageMeta}
    >
      {children}
    </BlogLayout>
  )
}

export type DocsWebsiteNotFoundProps = ErrorPageLayoutProps

function DocsWebsiteNotFound(props: DocsWebsiteNotFoundProps) {
  return (
    <ErrorPageLayout
      statusCode="404"
      title="Page not found"
      description="We could not find that documentation page."
      {...props}
    />
  )
}

export interface DocsWebsiteComponent {
  Docs: typeof DocsWebsiteDocs
  Blog: typeof DocsWebsiteBlog
  BlogPost: typeof DocsWebsiteBlogPost
  NotFound: typeof DocsWebsiteNotFound
  paths: typeof docsWebsitePaths
  routes: typeof docsWebsiteRoutes
}

export const DocsWebsite = {
  Docs: DocsWebsiteDocs,
  Blog: DocsWebsiteBlog,
  BlogPost: DocsWebsiteBlogPost,
  NotFound: DocsWebsiteNotFound,
  paths: docsWebsitePaths,
  routes: docsWebsiteRoutes,
} as DocsWebsiteComponent
