"use client";

import { useEffect } from "react";
import Head from "next/head";
import Script from "next/script";

interface WebsiteSchema {
  name: string;
  alternateName?: string;
  url: string;
}

interface OrganizationSchema {
  name: string;
  logo: string;
  url: string;
}

interface ArticleSchema {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author: {
    name: string;
    url?: string;
  };
  publisher: {
    name: string;
    logo: string;
  };
}

interface ReviewSchema {
  itemReviewed: {
    type: string;
    name: string;
    image: string;
    description?: string;
    brand?: string;
  };
  reviewRating: {
    ratingValue: number;
    bestRating?: number;
    worstRating?: number;
  };
  author: {
    name: string;
  };
  datePublished: string;
  reviewBody?: string;
  pros?: string[];
  cons?: string[];
}

interface SeoComponentProps {
  title: string;
  description: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  twitterCard?: "summary" | "summary_large_image";
  article?: ArticleSchema;
  review?: ReviewSchema;
  noIndex?: boolean;
}

export default function SeoComponent({
  title,
  description,
  canonical,
  ogType = "website",
  ogImage,
  twitterCard = "summary_large_image",
  article,
  review,
  noIndex = false,
}: SeoComponentProps) {
  const websiteSchema: WebsiteSchema = {
    name: "TechNews",
    alternateName: "TN",
    url: "https://technews.com",
  };

  const organizationSchema: OrganizationSchema = {
    name: "TechNews",
    logo: "https://technews.com/logo.png",
    url: "https://technews.com",
  };

  // Base JSON-LD structured data
  const generateStructuredData = () => {
    const structuredData = [];

    // Website Schema
    structuredData.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      ...websiteSchema,
      potentialAction: {
        "@type": "SearchAction",
        target: `${websiteSchema.url}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    });

    // Organization Schema
    structuredData.push({
      "@context": "https://schema.org",
      "@type": "Organization",
      ...organizationSchema,
    });

    // Article Schema
    if (article) {
      structuredData.push({
        "@context": "https://schema.org",
        "@type": "Article",
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": canonical,
        },
        headline: article.headline,
        description: article.description,
        image: article.image,
        datePublished: article.datePublished,
        dateModified: article.dateModified || article.datePublished,
        author: {
          "@type": "Person",
          name: article.author.name,
          url: article.author.url,
        },
        publisher: {
          "@type": "Organization",
          name: article.publisher.name,
          logo: {
            "@type": "ImageObject",
            url: article.publisher.logo,
          },
        },
      });
    }

    // Review Schema
    if (review) {
      structuredData.push({
        "@context": "https://schema.org",
        "@type": "Review",
        itemReviewed: {
          "@type": review.itemReviewed.type,
          name: review.itemReviewed.name,
          image: review.itemReviewed.image,
          description: review.itemReviewed.description,
          ...(review.itemReviewed.brand && {
            brand: {
              "@type": "Brand",
              name: review.itemReviewed.brand,
            },
          }),
        },
        reviewRating: {
          "@type": "Rating",
          ratingValue: review.reviewRating.ratingValue,
          bestRating: review.reviewRating.bestRating || 10,
          worstRating: review.reviewRating.worstRating || 1,
        },
        author: {
          "@type": "Person",
          name: review.author.name,
        },
        datePublished: review.datePublished,
        ...(review.reviewBody && { reviewBody: review.reviewBody }),
      });
    }

    return structuredData;
  };

  useEffect(() => {
    // Add structured data to head
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.innerHTML = JSON.stringify(generateStructuredData());
    document.head.appendChild(script);

    return () => {
      try {
        // Clean up only our structured data script on unmount
        const scripts = document.querySelectorAll(
          'script[type="application/ld+json"]'
        );
        scripts.forEach((s) => {
          if (s.innerHTML.includes("TechNews")) {
            document.head.removeChild(s);
          }
        });
      } catch (e) {
        console.error("Error cleaning up structured data", e);
      }
    };
  }, [title, article, review]);

  return (
    <>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={canonical} />}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      {canonical && <meta property="og:url" content={canonical} />}
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* Additional SEO tags for articles */}
      {article && (
        <>
          <meta property="article:published_time" content={article.datePublished} />
          {article.dateModified && (
            <meta property="article:modified_time" content={article.dateModified} />
          )}
          <meta property="article:author" content={article.author.name} />
        </>
      )}
    </>
  );
}
