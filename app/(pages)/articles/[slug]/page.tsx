"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import Markdown from "react-markdown";
import { FaCalendarAlt, FaEye, FaFacebook, FaLinkedin, FaTwitter } from "react-icons/fa";

// Components
import AdPlaceholder from "@/app/components/ads/AdPlaceholder";
import RelatedArticles from "@/app/components/articles/RelatedArticles";
import CommentSection from "@/app/components/comments/CommentSection";

interface ArticleAuthor {
  name: string;
  image: string;
  bio?: string;
}

interface ArticleCategory {
  name: string;
  slug: string;
}

interface Article {
  title: string;
  slug: string;
  content: string;
  coverImage: string;
  publishedAt: string;
  author: ArticleAuthor;
  viewCount: number;
  category: ArticleCategory;
  tags: string[];
  metaDescription?: string;
}

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug;
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        // In production, fetch from API
        // const response = await fetch(`/api/articles/${slug}`);
        // if (!response.ok) throw new Error('Article not found');
        // const data = await response.json();
        
        // For now, use mock data
        setTimeout(() => {
          setArticle({
            title: "Apple Unveils New MacBook Pro with M3 Chip: A Revolutionary Leap in Performance",
            slug: "apple-unveils-new-macbook-pro-m3-chip",
            content: `
# Apple's Revolutionary M3 Chip Arrives in New MacBook Pro

Apple has just unveiled its latest MacBook Pro lineup featuring the groundbreaking M3 chip, marking a significant leap forward in performance and efficiency for professional-grade laptops.

## Unprecedented Performance

The new M3 chip, built on a 3-nanometer process, delivers up to 40% faster performance than the previous M2 generation. This translates to:

- Significantly faster rendering times for video editors
- Improved compilation speeds for developers
- Enhanced AI processing capabilities
- Smoother gaming experiences with better graphics performance

"The M3 represents our commitment to pushing the boundaries of what's possible with Apple silicon," said Tim Cook, Apple's CEO, during the keynote presentation. "It's not just an incremental update—it's a revolutionary leap forward."

## Battery Life That Redefines "All Day"

Perhaps most impressive is the enhanced power efficiency of the M3 chip. The new MacBook Pro models can achieve:

- Up to 22 hours of video playback on a single charge
- 15 hours of wireless web browsing
- Significantly reduced power consumption during intensive tasks

This means professionals can work longer without being tethered to a power outlet, making the new MacBook Pro truly portable for demanding workloads.

## Enhanced Thermal Design

Apple has also redesigned the thermal architecture of the MacBook Pro to handle the increased performance:

1. New vapor chamber cooling system
2. Redesigned heat sink with greater surface area
3. More efficient fans that produce less noise

These improvements ensure that the M3 chip can sustain peak performance during extended professional workflows without thermal throttling.

## Pricing and Availability

The new MacBook Pro with M3 chip starts at $1,999 for the 14-inch model and $2,499 for the 16-inch model. Pre-orders are available starting today, with devices shipping next week.

For professionals in video editing, software development, 3D rendering, scientific research, and other demanding fields, the new MacBook Pro represents a compelling upgrade that could significantly improve productivity and workflow efficiency.
            `,
            coverImage: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1026&q=80",
            publishedAt: new Date().toISOString(),
            author: {
              name: "John Doe",
              image: "https://randomuser.me/api/portraits/men/23.jpg",
              bio: "Tech enthusiast and Apple specialist with over 10 years of experience covering Apple events and reviewing their products."
            },
            viewCount: 1254,
            category: {
              name: "News",
              slug: "news",
            },
            tags: ["Apple", "MacBook", "M3 Chip"],
          });
          setIsLoading(false);
        }, 500);
      } catch (err) {
        setError('Failed to load article');
        setIsLoading(false);
        console.error(err);
      }
    };

    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  // View counter incrementation
  useEffect(() => {
    const incrementViewCount = async () => {
      // In production, this would update the view count in the database
      // await fetch(`/api/articles/${slug}/view`, { method: 'POST' });
      console.log('View count incremented');
    };

    if (article) {
      incrementViewCount();
    }
  }, [article, slug]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-6"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-600">Error: {error || 'Article not found'}</h1>
        <Link href="/news" className="mt-6 inline-block text-blue-600 hover:underline">
          Return to News
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Article Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
          <Link 
            href={`/categories/${article.category.slug}`}
            className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-xs font-medium"
          >
            {article.category.name}
          </Link>
          <span className="mx-2">•</span>
          <div className="flex items-center">
            <FaCalendarAlt className="mr-1" />
            {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
          </div>
          <span className="mx-2">•</span>
          <div className="flex items-center">
            <FaEye className="mr-1" />
            {article.viewCount.toLocaleString()} views
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">{article.title}</h1>
      </div>

      {/* Author info */}
      <div className="flex items-center mb-8">
        <Image 
          src={article.author.image} 
          alt={article.author.name}
          width={50}
          height={50}
          className="rounded-full mr-4"
        />
        <div>
          <p className="font-medium">{article.author.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{article.author.bio}</p>
        </div>
      </div>

      {/* Featured Image */}
      <div className="relative w-full h-80 md:h-96 lg:h-[500px] mb-8 rounded-lg overflow-hidden">
        <Image
          src={article.coverImage}
          alt={article.title}
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>

      {/* Share buttons */}
      <div className="flex space-x-4 mb-8">
        <button className="bg-[#1877F2] text-white p-2 rounded-full hover:opacity-90">
          <FaFacebook size={18} />
        </button>
        <button className="bg-[#1DA1F2] text-white p-2 rounded-full hover:opacity-90">
          <FaTwitter size={18} />
        </button>
        <button className="bg-[#0A66C2] text-white p-2 rounded-full hover:opacity-90">
          <FaLinkedin size={18} />
        </button>
      </div>

      {/* Article content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main content */}
        <div className="lg:col-span-8">
          <article className="prose prose-lg dark:prose-invert max-w-none mb-12">
            <Markdown>{article.content}</Markdown>
          </article>

          {/* Tags */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Link 
                  key={tag}
                  href={`/tags/${tag.toLowerCase()}`}
                  className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>

          {/* In-article ad */}
          <div className="my-8">
            <AdPlaceholder type="in-article" />
          </div>

          {/* Comments section */}
          <div className="mt-12">
            <CommentSection articleSlug={article.slug} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4">
          {/* Author bio (mobile only) */}
          <div className="lg:hidden mb-8">
            <h3 className="text-xl font-bold mb-4">About the Author</h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Image 
                  src={article.author.image} 
                  alt={article.author.name}
                  width={60}
                  height={60}
                  className="rounded-full mr-4"
                />
                <h4 className="text-lg font-medium">{article.author.name}</h4>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{article.author.bio}</p>
              <Link 
                href={`/authors/${article.author.name.toLowerCase().replace(' ', '-')}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                View all articles
              </Link>
            </div>
          </div>

          {/* Ad sidebar */}
          <div className="sticky top-24 mb-8">
            <AdPlaceholder type="sidebar" />
          </div>

          {/* Related articles */}
          <div className="sticky top-24">
            <h3 className="text-xl font-bold mb-4">Related Articles</h3>
            <RelatedArticles 
              currentArticleSlug={article.slug} 
              tags={article.tags}
              category={article.category.slug}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
