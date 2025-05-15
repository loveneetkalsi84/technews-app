"use client";

import Image from "next/image";
import Link from "next/link";
import { FiClock, FiEye, FiTag, FiStar } from "react-icons/fi";
import { format } from "date-fns";

interface ArticleCardProps {
  article: {
    title: string;
    slug: string;
    excerpt: string;
    coverImage: string;
    publishedAt: string | Date;
    author: {
      name: string;
      image?: string;
    };
    viewCount?: number;
    category?: {
      name: string;
      slug: string;
    };
    tags?: string[];
    isReview?: boolean;
    rating?: number;
  };
  featured?: boolean;
  size?: "small" | "medium" | "large";
}

const ArticleCard = ({ article, featured = false, size = "medium" }: ArticleCardProps) => {
  const {
    title,
    slug,
    excerpt,
    coverImage,
    publishedAt,
    author,
    viewCount,
    category,
    tags,
    isReview,
    rating,
  } = article;

  // Format date
  const formattedDate = publishedAt 
    ? format(new Date(publishedAt), "MMM d, yyyy")
    : "";

  return featured ? (
    // Featured Article Card (larger size)
    <div className="rounded-xl overflow-hidden shadow-lg bg-white dark:bg-gray-800 h-full transition-transform transform hover:scale-[1.01] hover:shadow-xl">
      <div className="relative h-80">
        <Image
          src={coverImage || "/images/default-article.jpg"}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority={featured}
        />
        {category && (
          <Link
            href={`/categories/${category.slug}`}
            className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium"
          >
            {category.name}
          </Link>
        )}
      </div>
      <div className="p-6">
        <Link href={`/articles/${slug}`}>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
            {title}
          </h2>
        </Link>
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {excerpt}
        </p>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="relative h-8 w-8 rounded-full overflow-hidden mr-2">
              <Image
                src={author.image || "/images/default-avatar.jpg"}
                alt={author.name}
                fill
                sizes="32px"
                className="object-cover"
              />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {author.name}
            </span>
          </div>
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
            <FiClock className="mr-1" />
            <span>{formattedDate}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
            {viewCount !== undefined && (
              <div className="flex items-center mr-4">
                <FiEye className="mr-1" />
                <span>{viewCount.toLocaleString()}</span>
              </div>
            )}
          </div>
          <Link
            href={`/articles/${slug}`}
            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium"
          >
            Read More
          </Link>
        </div>
      </div>
    </div>
  ) : (
    // Regular Article Card
    <div className="rounded-xl overflow-hidden shadow-md bg-white dark:bg-gray-800 h-full transition-transform transform hover:scale-[1.01] hover:shadow-lg">
      <div className="relative h-48">
        <Image
          src={coverImage || "/images/default-article.jpg"}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
        {category && (
          <Link
            href={`/categories/${category.slug}`}
            className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium"
          >
            {category.name}
          </Link>
        )}
      </div>
      <div className="p-5">
        <Link href={`/articles/${slug}`}>
          <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2">
            {title}
          </h2>
        </Link>
        <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm line-clamp-2">
          {excerpt}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative h-6 w-6 rounded-full overflow-hidden mr-2">
              <Image
                src={author.image || "/images/default-avatar.jpg"}
                alt={author.name}
                fill
                sizes="24px"
                className="object-cover"
              />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {author.name}
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {formattedDate}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
