import Image from "next/image";
import Link from "next/link";
import { FaCalendarAlt, FaEye, FaCheck, FaTimes } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";

interface ReviewProps {
  review: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: string;
    publishedAt: Date;
    author: {
      name: string;
      image: string;
    };
    viewCount: number;
    category: {
      name: string;
      slug: string;
    };
    tags: string[];
    rating: number;
    pros?: string[];
    cons?: string[];
  };
}

export default function FeaturedReview({ review }: ReviewProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg transition-shadow hover:shadow-xl">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Image column */}
        <div className="relative h-64 md:h-full">
          <Image
            src={review.coverImage}
            alt={review.title}
            fill
            style={{ objectFit: "cover" }}
            className="md:rounded-l-xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent md:hidden"></div>
          
          {/* Rating badge (mobile) */}
          <div className="absolute top-4 left-4 bg-yellow-500 text-black font-bold rounded-full w-14 h-14 flex items-center justify-center text-xl md:hidden">
            {review.rating}
          </div>
          
          {/* Category (mobile) */}
          <div className="absolute bottom-4 left-4 md:hidden">
            <Link 
              href={`/categories/${review.category.slug}`}
              className="bg-blue-600 hover:bg-blue-700 transition text-white px-3 py-1 rounded-full text-sm font-medium"
            >
              {review.category.name}
            </Link>
          </div>
        </div>
        
        {/* Content column */}
        <div className="p-6">
          {/* Top section with meta */}
          <div className="flex justify-between items-start mb-4">
            <Link 
              href={`/categories/${review.category.slug}`}
              className="hidden md:block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-xs font-medium"
            >
              {review.category.name}
            </Link>
            
            {/* Rating badge (desktop) */}
            <div className="hidden md:flex bg-yellow-500 text-black font-bold rounded-full w-14 h-14 items-center justify-center text-xl">
              {review.rating}
            </div>
          </div>
          
          {/* Title and excerpt */}
          <h3 className="text-2xl font-bold mb-3">
            <Link href={`/articles/${review.slug}`} className="hover:text-blue-600 dark:hover:text-blue-400">
              {review.title}
            </Link>
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
            {review.excerpt}
          </p>
          
          {/* Pros and cons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Pros */}
            <div>
              <h4 className="font-medium text-green-600 dark:text-green-400 mb-2 flex items-center">
                <FaCheck className="mr-1" /> Pros
              </h4>
              <ul className="space-y-1">
                {review.pros?.slice(0, 3).map((pro, index) => (
                  <li key={index} className="text-sm flex">
                    <span className="text-green-500 mr-2">+</span>
                    <span className="line-clamp-1">{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Cons */}
            <div>
              <h4 className="font-medium text-red-600 dark:text-red-400 mb-2 flex items-center">
                <FaTimes className="mr-1" /> Cons
              </h4>
              <ul className="space-y-1">
                {review.cons?.slice(0, 3).map((con, index) => (
                  <li key={index} className="text-sm flex">
                    <span className="text-red-500 mr-2">−</span>
                    <span className="line-clamp-1">{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Meta footer */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-auto">
            <div className="flex items-center">
              <Image
                src={review.author.image}
                alt={review.author.name}
                width={24}
                height={24}
                className="rounded-full mr-2"
              />
              <span>{review.author.name}</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="flex items-center">
                <FaCalendarAlt className="mr-1" />
                {formatDistanceToNow(review.publishedAt, { addSuffix: true })}
              </span>
              <span className="flex items-center">
                <FaEye className="mr-1" />
                {review.viewCount.toLocaleString()}
              </span>
            </div>
          </div>
          
          {/* Read review button */}
          <Link
            href={`/articles/${review.slug}`}
            className="mt-4 block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Read Full Review
          </Link>
        </div>
      </div>
    </div>
  );
}
