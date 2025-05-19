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
  const [error, setError] = useState<string | null>(null);  useEffect(() => {
    const fetchArticle = async () => {
      try {
        if (!slug || typeof slug !== 'string') {
          setError('Invalid article slug');
          setIsLoading(false);
          return;
        }
        
        setIsLoading(true);
        console.log(`Fetching article with slug: ${slug}`);
        console.log(`Current route: ${window.location.pathname}`);
        
        // Fetch the article data from the API with strong cache-busting headers
        const response = await fetch(`/api/articles/${slug}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Article not found');
          } else {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
          }
        }
        
        const data = await response.json();
        console.log('Article data received:', data);
          // Validate that the returned article matches the requested slug
        if (data.slug !== slug) {
          console.error(`Slug mismatch: requested ${slug} but received ${data.slug}`);
          console.error('Full article data:', JSON.stringify(data, null, 2));
          throw new Error(`Article data mismatch: requested ${slug} but received ${data.slug}`);
        }
        
        // Transform the data if needed to match the expected Article interface
        setArticle({
          title: data.title,
          slug: data.slug,
          content: data.content,
          coverImage: data.coverImage || '/images/default-article.jpg',
          publishedAt: data.publishedAt,
          author: {
            name: typeof data.author === 'string' ? data.author : data.author?.name || 'Unknown Author',
            image: typeof data.author === 'string' ? '/images/default-avatar.jpg' : (data.author?.image || '/images/default-avatar.jpg'),
            bio: typeof data.author === 'string' ? '' : (data.author?.bio || '')
          },
          viewCount: data.viewCount || 0,
          category: {
            name: typeof data.category === 'string' ? data.category : (data.category?.name || 'Uncategorized'),
            slug: typeof data.category === 'string' ? data.category.toLowerCase() : (data.category?.slug || 'uncategorized')
          },
          tags: Array.isArray(data.tags) ? data.tags : [],
          metaDescription: data.metaDescription || '',
        });
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching article:', err);
        console.error('Error details:', {
          url: `/api/articles/${slug}`,
          slug: slug,
          errorMessage: err instanceof Error ? err.message : 'Unknown error',
          errorStack: err instanceof Error ? err.stack : null
        });
        setError(err instanceof Error ? err.message : 'Failed to load article');
        setIsLoading(false);
        
        // If in development mode or we have test data, fallback to mock data for testing purposes
        if (process.env.NODE_ENV === 'development') {
          console.log('Falling back to mock data for testing purposes');
          setArticle({
            title: "Article Preview Fallback",
            slug: slug as string,
            content: `# Test Article Content\n\nThis is a mock article because the actual article could not be loaded from the database. The requested article slug was: "${slug}"`,
            coverImage: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1026&q=80",
            publishedAt: new Date().toISOString(),
            author: {
              name: "Test Author",
              image: "https://randomuser.me/api/portraits/men/23.jpg",
              bio: "This is a fallback test author because the real article could not be loaded."
            },
            viewCount: 0,
            category: {
              name: "Test",
              slug: "test",
            },
            tags: ["Test"],
            metaDescription: "Test article for development purposes",
          });
          setError(null);
          setIsLoading(false);
        }
      }
    };

    if (slug) {
      fetchArticle();
    }
  }, [slug]);
  // View counter incrementation
  useEffect(() => {
    const incrementViewCount = async () => {
      try {
        // The GET request to the article endpoint already increments the view count
        // We don't need to make a separate request
        console.log('View count incremented automatically via GET request');
      } catch (error) {
        console.error('Error incrementing view count:', error);
      }
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
