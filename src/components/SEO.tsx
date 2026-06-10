import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import { getRouteMeta, getSiteUrl, SITE_NAME } from '../config/seo'

export default function SEO() {
  const { pathname } = useLocation()
  const meta = getRouteMeta(pathname)
  const siteUrl = getSiteUrl()
  const canonical = `${siteUrl}${pathname}`
  const ogImage = meta.ogImage ? `${siteUrl}${meta.ogImage}` : undefined

  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      {meta.noindex && <meta name="robots" content="noindex, nofollow" />}

      <link rel="canonical" href={canonical} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:type" content={meta.ogType || 'website'} />
      <meta property="og:url" content={canonical} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  )
}
