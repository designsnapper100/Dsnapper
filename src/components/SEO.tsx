import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  schemaData?: any;
}

export function SEO({
  title = "Design Snapper – #1 AI Design Audit & Design Review Tool",
  description = "Design Snapper is the leading AI design audit and design review tool. Get instant AI-powered design feedback, WCAG accessibility checks, and visual hierarchy analysis in under 30 seconds. Try free.",
  image = "https://www.designsnapper.com/og-image.jpg",
  url = typeof window !== 'undefined' ? window.location.href : "https://www.designsnapper.com",
  schemaData
}: SEOProps) {
  const siteTitle = title === "Design Snapper – #1 AI Design Audit & Design Review Tool" ? title : `${title} | Design Snapper`;
  const canonicalUrl = url.split('?')[0].split('#')[0];

  const defaultSchemaData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Design Snapper",
    "alternateName": ["DesignSnapper", "Design Snapper Tool", "AI Design Reviewer"],
    "url": "https://www.designsnapper.com",
    "logo": "https://www.designsnapper.com/favicon.png",
    "description": description,
    "applicationCategory": "DesignApplication",
    "operatingSystem": "Web",
    "keywords": "design snapper, design audit, ai design review, design audit tool, ai design reviewer, automated design review, design critique, wcag audit",
    "featureList": [
      "AI Design Audit",
      "Automated Design Review",
      "WCAG Accessibility Audit",
      "Visual Hierarchy Analysis",
      "Predictive Attention Heatmaps",
      "Design Critique Reports"
    ],
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Organization",
      "name": "Design Snapper",
      "url": "https://www.designsnapper.com"
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Design Snapper",
          "item": "https://www.designsnapper.com"
        }
      ]
    }
  };

  const finalSchema = schemaData || defaultSchemaData;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="title" content={siteTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content="design snapper, design audit, ai design review, design audit tool, ai design reviewer, automated design review, design critique tool, ui design audit, ux design review, wcag audit tool, design snapper tool" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={canonicalUrl} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(finalSchema)}
      </script>

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Design Snapper" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={siteTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
    </Helmet>
  );
}
