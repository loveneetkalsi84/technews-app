import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface RelatedArticleProps {
  title: string;
  slug: string;
  coverImage: string;
  publishedAt: string;
}

const RelatedArticleCard = ({ article }: { article: RelatedArticleProps }) => {
  return (
    <Link href={`/articles/${article.slug}`} className="flex items-center gap-3 mb-4 group">
      <div className="relative min-w-[80px] h-[60px] rounded overflow-hidden">
        <Image
          src={article.coverImage}
          alt={article.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="80px"
        />
      </div>
      <div>
        <h4 className="text-sm font-medium line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
          {article.title}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
        </p>
      </div>
    </Link>
  );
};

interface RelatedArticlesProps {
  currentArticleSlug: string;
  tags: string[];
  category: string;
}

export default function RelatedArticles({ currentArticleSlug, tags, category }: RelatedArticlesProps) {
  // In production, this would fetch articles from the API based on tags and category
  const mockRelatedArticles = [
    {
      title: "Samsung Galaxy S23 Ultra Review: The Ultimate Android Flagship",
      slug: "samsung-galaxy-s23-ultra-review",
      coverImage: "https://images.unsplash.com/photo-1610945265064-0e34e5d357bf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      publishedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    },
    {
      title: "NVIDIA Announces RTX 5090: 8K Gaming Finally Becomes Mainstream",
      slug: "nvidia-announces-rtx-5090",
      coverImage: "https://images.unsplash.com/photo-1591488320212-4d092df8884d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      publishedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    },
    {
      title: "The Future of AI: How Machine Learning is Transforming Tech",
      slug: "future-of-ai-machine-learning",
      coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1032&q=80",
      publishedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    },
    {
      title: "Microsoft Announces Windows 12: Everything You Need to Know",
      slug: "microsoft-announces-windows-12",
      coverImage: "https://images.unsplash.com/photo-1646617747456-77562508dcba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      publishedAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    },
  ];

  // Filter out the current article
  const filteredArticles = mockRelatedArticles.filter(article => article.slug !== currentArticleSlug);

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
      {filteredArticles.length > 0 ? (
        filteredArticles.map((article) => (
          <RelatedArticleCard key={article.slug} article={article} />
        ))
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-sm">No related articles found</p>
      )}
      
      <Link 
        href={`/categories/${category}`}
        className="text-blue-600 dark:text-blue-400 text-sm hover:underline mt-2 inline-block"
      >
        View more articles in this category
      </Link>
    </div>
  );
}
