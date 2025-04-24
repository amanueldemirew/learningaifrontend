import Head from "next/head";
import { usePathname } from "next/navigation";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  noIndex?: boolean;
}

export function SEO({
  title,
  description = process.env.NEXT_PUBLIC_APP_DESCRIPTION,
  keywords = [
    "AI",
    "Machine Learning",
    "Education",
    "Online Courses",
    "Learning Platform",
  ],
  ogImage = "/assets/og-image.jpg",
  ogType = "website",
  twitterCard = "summary_large_image",
  noIndex = false,
}: SEOProps) {
  const pathname = usePathname();
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL;
  const fullUrl = `${siteUrl}${pathname}`;
  const appName = process.env.NEXT_PUBLIC_APP_NAME;

  const formattedTitle = title ? `${title} | ${appName}` : appName;

  return (
    <Head>
      <title>{formattedTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(", ")} />

      {/* Open Graph */}
      <meta property="og:title" content={formattedTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={appName} />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={formattedTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
    </Head>
  );
}
