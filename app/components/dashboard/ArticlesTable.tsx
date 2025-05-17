"use client";

import { useState } from "react";
import Link from "next/link";
import { FaEye, FaEdit, FaTrash, FaCheck, FaTimes, FaNewspaper, FaPlus } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";

interface Article {
  id: string;
  title: string;
  slug: string;
  status: "published" | "draft";
  author: string;
  category: string;
  publishedAt: string | null;
  viewCount?: number;
}

interface ArticlesTableProps {
  articles: Article[];
  showPagination?: boolean;
}

export default function ArticlesTable({ articles, showPagination = true }: ArticlesTableProps) {
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 10;

  const handleSelectAll = () => {
    if (selectedArticles.length === articles.length) {
      setSelectedArticles([]);
    } else {
      setSelectedArticles(articles.map((article) => article.id));
    }
  };

  const handleSelectArticle = (id: string) => {
    if (selectedArticles.includes(id)) {
      setSelectedArticles(selectedArticles.filter((articleId) => articleId !== id));
    } else {
      setSelectedArticles([...selectedArticles, id]);
    }
  };

  const handleBulkDelete = () => {
    // In production, this would call an API to delete selected articles
    console.log("Deleting articles:", selectedArticles);    alert(`Would delete ${selectedArticles.length} articles`);
    setSelectedArticles([]);
  };

  // Pagination logic
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = showPagination ? articles.slice(indexOfFirstArticle, indexOfLastArticle) : articles;
  const totalPages = Math.ceil(articles.length / articlesPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
      {/* Bulk actions */}
      {selectedArticles.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50 p-4 flex items-center justify-between border-b border-blue-200 dark:border-blue-800">
          <span className="text-sm font-medium flex items-center">
            <FaCheck className="text-blue-600 dark:text-blue-400 mr-2" />
            {selectedArticles.length} {selectedArticles.length === 1 ? "article" : "articles"} selected
          </span>
          <button
            onClick={handleBulkDelete}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-1.5 rounded-lg text-sm font-medium shadow-sm hover:shadow transition-all flex items-center"
          >
            <FaTrash className="mr-1.5" size={12} />
            Delete Selected
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-750">
            <tr>
              <th scope="col" className="pl-6 pr-3 py-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedArticles.length === articles.length && articles.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 dark:border-gray-600 w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
              >
                Title
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
              >
                Author
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
              >
                Category
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
              >
                Status
              </th>              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {currentArticles.length > 0 ? (
              currentArticles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-700/70 transition-colors">
                  <td className="pl-6 pr-3 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedArticles.includes(article.id)}
                      onChange={() => handleSelectArticle(article.id)}
                      className="rounded border-gray-300 dark:border-gray-600 w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </td>                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          <Link 
                            href={`/admin/articles/edit/${article.slug}`}
                            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {article.title}
                          </Link>
                        </div>
                        <div className="text-xs flex items-center mt-1 text-gray-500 dark:text-gray-400">
                          <FaEye className="mr-1" size={12} />
                          {article.viewCount ? `${article.viewCount.toLocaleString()} views` : "No views yet"}
                        </div>
                      </div>
                    </div>
                  </td>                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white font-medium">{article.author}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                      {article.category}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1.5 inline-flex items-center text-xs font-medium rounded-full ${
                        article.status === "published"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
                      }`}
                    >
                      {article.status === "published" ? (
                        <FaCheck className="mr-1.5" size={10} />
                      ) : (
                        <FaTimes className="mr-1.5" size={10} />
                      )}
                      {article.status}
                    </span>
                  </td>                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {article.publishedAt
                      ? formatDistanceToNow(new Date(article.publishedAt), {
                          addSuffix: true,
                        })
                      : "Not published"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      <Link 
                        href={`/articles/${article.slug}`} 
                        className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 p-1.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                        target="_blank"
                        title="View article"
                      >
                        <FaEye size={16} />
                        <span className="sr-only">View</span>
                      </Link>
                      <Link 
                        href={`/admin/articles/edit/${article.slug}`} 
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        title="Edit article"
                      >
                        <FaEdit size={16} />
                        <span className="sr-only">Edit</span>
                      </Link>
                      <button
                        onClick={() => alert(`Would delete article: ${article.title}`)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        title="Delete article"
                      >
                        <FaTrash size={16} />
                        <span className="sr-only">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <FaNewspaper className="text-gray-400 dark:text-gray-600 text-5xl mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-1">No articles found</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">Get started by creating your first article</p>
                    <Link href="/admin/articles/new" className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                      <FaPlus className="mr-2" size={12} />
                      Create Article
                    </Link>
                  </div>
                </td>
              </tr>
            )}          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {showPagination && articles.length > articlesPerPage && (
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">{indexOfFirstArticle + 1}</span> to{" "}
            <span className="font-medium">
              {indexOfLastArticle > articles.length ? articles.length : indexOfLastArticle}
            </span>{" "}
            of <span className="font-medium">{articles.length}</span> articles
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                currentPage === 1
                  ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => handlePageChange(number)}
                className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  currentPage === number
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {number}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                currentPage === totalPages
                  ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
