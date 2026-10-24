import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { Link } from '../../components/Link'
import { Navbar } from '../Navbar'
import type { SiteNavLink } from '../types'
import { cx } from '../../internal/cx'

export interface BlogPostPreview {
  href: string
  title: ReactNode
  excerpt?: ReactNode
  meta?: ReactNode
  onClick?: SiteNavLink['onClick']
}

export interface BlogLayoutProps extends HTMLAttributes<HTMLDivElement> {
  brand: ReactNode
  navLinks?: SiteNavLink[]
  actions?: ReactNode
  pageTitle?: ReactNode
  pageMeta?: ReactNode
  posts?: BlogPostPreview[]
  children?: ReactNode
}

export const BlogLayout = /* @__PURE__ */ forwardRef<HTMLDivElement, BlogLayoutProps>(
  function BlogLayout(
    {
      brand,
      navLinks,
      actions,
      pageTitle,
      pageMeta,
      posts,
      children,
      className,
      ...rest
    },
    ref,
  ) {
    const isArticle = Boolean(pageTitle)

    return (
      <div {...rest} ref={ref} className={cx('hal-blog-layout', className)}>
        <div className="hal-blog-layout__header">
          <Navbar>
            <Navbar.Brand>{brand}</Navbar.Brand>
            {navLinks && navLinks.length > 0 ? (
              <Navbar.Nav>
                <Navbar.Links>
                  {navLinks.map((link) => (
                    <Navbar.Link
                      key={`${String(link.href)}-${String(link.label)}`}
                      href={link.href}
                      label={link.label}
                      current={link.active}
                      onClick={link.onClick}
                    />
                  ))}
                </Navbar.Links>
              </Navbar.Nav>
            ) : null}
            {actions ? <Navbar.Actions>{actions}</Navbar.Actions> : null}
          </Navbar>
        </div>

        <main className="hal-blog-layout__main">
          {isArticle ? (
            <article className="hal-blog-layout__article">
              {pageMeta ? <p className="hal-blog-layout__meta">{pageMeta}</p> : null}
              <h1 className="hal-blog-layout__title">{pageTitle}</h1>
              <div className="hal-blog-layout__body">{children}</div>
            </article>
          ) : (
            <div className="hal-blog-layout__feed">
              <h1 className="hal-blog-layout__feed-title">Latest posts</h1>
              {posts && posts.length > 0 ? (
                <ul className="hal-blog-layout__posts">
                  {posts.map((post) => (
                    <li key={`${String(post.href)}-${String(post.title)}`} className="hal-blog-layout__post">
                      {post.meta ? <p className="hal-blog-layout__post-meta">{post.meta}</p> : null}
                      <h2 className="hal-blog-layout__post-title">
                        <Link href={post.href} onClick={post.onClick} className="hal-blog-layout__post-link">
                          {post.title}
                        </Link>
                      </h2>
                      {post.excerpt ? <p className="hal-blog-layout__post-excerpt">{post.excerpt}</p> : null}
                    </li>
                  ))}
                </ul>
              ) : (
                children
              )}
            </div>
          )}
        </main>
      </div>
    )
  },
)
