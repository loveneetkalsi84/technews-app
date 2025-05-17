"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  FaSearch, 
  FaComments,
  FaTrash,
  FaFlag,
  FaReply,
  FaEllipsisH,
  FaCheck,
  FaTimes,
  FaCog,
  FaUserCircle
} from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";

// Types
interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    image?: string | null;
  };
  articleId: string;
  articleTitle: string;
  articleSlug: string;
  createdAt: string;
  status: "approved" | "pending" | "spam";
  likes: number;
}

export default function CommentsManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc", // asc or desc
  });

  // Protected route - check for auth and admin role
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/comments");
    } else if (status === "authenticated") {
      if ((session.user as any).role !== "admin") {
        router.push("/unauthorized");
      } else {
        // Load comments data
        fetchComments();
      }
    }
  }, [status, session, router]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      
      // In production, fetch from API
      // const response = await fetch("/api/comments/admin");
      // const data = await response.json();
      // setComments(data.comments);
      
      // For now, use mock data
      setTimeout(() => {
        setComments([
          {
            id: "1",
            content: "This is a great article! I learned a lot about the new features in the M3 chip.",
            author: {
              id: "user1",
              name: "John Doe",
              image: "https://randomuser.me/api/portraits/men/22.jpg"
            },
            articleId: "article1",
            articleTitle: "Apple Unveils New MacBook Pro with M3 Chip",
            articleSlug: "apple-unveils-new-macbook-pro-m3-chip",
            createdAt: new Date().toISOString(),
            status: "approved",
            likes: 5
          },
          {
            id: "2",
            content: "I disagree with your assessment of the battery life. In my experience, it's much worse than you described.",
            author: {
              id: "user2",
              name: "Jane Smith",
              image: "https://randomuser.me/api/portraits/women/22.jpg"
            },
            articleId: "article2",
            articleTitle: "Samsung Galaxy S23 Ultra Review",
            articleSlug: "samsung-galaxy-s23-ultra-review",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            status: "approved",
            likes: 2
          },
          {
            id: "3",
            content: "Check out my website at www.spam-link.com for great deals!",
            author: {
              id: "user3",
              name: "Spammer",
              image: null
            },
            articleId: "article1",
            articleTitle: "Apple Unveils New MacBook Pro with M3 Chip",
            articleSlug: "apple-unveils-new-macbook-pro-m3-chip",
            createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
            status: "spam",
            likes: 0
          },
          {
            id: "4",
            content: "I'm looking forward to trying this out. Does it work with older models too?",
            author: {
              id: "user4",
              name: "Alice Johnson",
              image: "https://randomuser.me/api/portraits/women/44.jpg"
            },
            articleId: "article3",
            articleTitle: "The Future of Artificial Intelligence",
            articleSlug: "future-of-artificial-intelligence",
            createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
            status: "pending",
            likes: 1
          },
          {
            id: "5",
            content: "Great tutorial! I followed along and got everything working perfectly.",
            author: {
              id: "user5",
              name: "Bob Wilson",
              image: "https://randomuser.me/api/portraits/men/45.jpg"
            },
            articleId: "article4",
            articleTitle: "How to Build a Modern Web Application with Next.js",
            articleSlug: "build-modern-web-application-nextjs",
            createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
            status: "approved",
            likes: 10
          }
        ]);
        setIsLoading(false);
      }, 800);
      
    } catch (error) {
      console.error("Error fetching comments:", error);
      setIsLoading(false);
    }
  };

  // Filter comments based on search term and status
  const filteredComments = comments.filter(comment => {
    const matchesSearch = 
      comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.articleTitle.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = 
      selectedStatus === "all" || 
      comment.status === selectedStatus;
      
    return matchesSearch && matchesStatus;
  });

  // Sort comments
  const sortedComments = [...filteredComments].sort((a, b) => {
    const aValue = a[sortConfig.key as keyof Comment];
    const bValue = b[sortConfig.key as keyof Comment];
    
    if (aValue < bValue) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Toggle sort
  const requestSort = (key: string) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Approve, reject, or delete comment
  const updateCommentStatus = (id: string, status: "approved" | "pending" | "spam") => {
    setComments(
      comments.map(comment => 
        comment.id === id ? { ...comment, status } : comment
      )
    );
    setActionMenuOpen(null);
  };

  const deleteComment = (id: string) => {
    setComments(comments.filter(comment => comment.id !== id));
    setActionMenuOpen(null);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center">
                <div className="h-10 w-1.5 rounded-full bg-green-600 dark:bg-green-500 mr-4"></div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Comments</h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2 ml-5.5">Manage and moderate user comments</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/settings#comment-settings"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200"
              >
                <FaCog className="mr-2" />
                Comment Settings
              </Link>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search comments..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          <div>
            <select
              className="w-full pl-4 pr-8 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Comments</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="spam">Spam</option>
            </select>
          </div>
        </div>

        {/* Comments Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-750">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Comment
                      </th>
                      <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Article
                      </th>
                      <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedComments.map((comment) => (
                      <tr key={comment.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                              {comment.author.image ? (
                                <Image
                                  src={comment.author.image}
                                  alt={comment.author.name}
                                  width={40}
                                  height={40}
                                  className="h-10 w-10 rounded-full"
                                />
                              ) : (                                <div className="h-10 w-10 flex items-center justify-center">
                                  <FaUserCircle className="text-gray-400 dark:text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {comment.author.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-gray-100 max-w-md truncate">
                            {comment.content}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            <Link href={`/articles/${comment.articleSlug}`} className="hover:underline hover:text-blue-500 dark:hover:text-blue-400">
                              {comment.articleTitle}
                            </Link>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            comment.status === 'approved' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                              : comment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {comment.status.charAt(0).toUpperCase() + comment.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="relative">
                            <button
                              onClick={() => setActionMenuOpen(actionMenuOpen === comment.id ? null : comment.id)}
                              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
                            >
                              <FaEllipsisH />
                            </button>
                            
                            {actionMenuOpen === comment.id && (
                              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-10">
                                <div className="py-1" role="menu" aria-orientation="vertical">
                                  {comment.status !== 'approved' && (
                                    <button
                                      onClick={() => updateCommentStatus(comment.id, 'approved')}
                                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left"
                                      role="menuitem"
                                    >
                                      <FaCheck className="mr-3 text-green-500" />
                                      Approve
                                    </button>
                                  )}
                                  
                                  {comment.status !== 'pending' && (
                                    <button
                                      onClick={() => updateCommentStatus(comment.id, 'pending')}
                                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left"
                                      role="menuitem"
                                    >
                                      <FaFlag className="mr-3 text-yellow-500" />
                                      Mark as pending
                                    </button>
                                  )}
                                  
                                  {comment.status !== 'spam' && (
                                    <button
                                      onClick={() => updateCommentStatus(comment.id, 'spam')}
                                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left"
                                      role="menuitem"
                                    >
                                      <FaTimes className="mr-3 text-red-500" />
                                      Mark as spam
                                    </button>
                                  )}
                                  
                                  <button
                                    onClick={() => deleteComment(comment.id)}
                                    className="flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left"
                                    role="menuitem"
                                  >
                                    <FaTrash className="mr-3" />
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Mobile view for comments */}
              <div className="md:hidden">
                {filteredComments.map((comment) => (
                  <div key={comment.id} className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                          {comment.author.image ? (
                            <Image 
                              src={comment.author.image} 
                              alt={comment.author.name} 
                              width={40} 
                              height={40}
                              className="h-full w-full object-cover" 
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-blue-100 dark:bg-blue-900">
                              <span className="text-blue-600 dark:text-blue-300 font-semibold">
                                {comment.author.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {comment.author.name}
                          </div>
                          <div className="mt-1 text-sm text-gray-700 dark:text-gray-300 break-words">
                            {comment.content.length > 100 
                              ? `${comment.content.substring(0, 100)}...` 
                              : comment.content}
                          </div>
                        </div>
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => setActionMenuOpen(actionMenuOpen === comment.id ? null : comment.id)}
                          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <FaEllipsisH className="text-gray-400" />
                        </button>
                        
                        {actionMenuOpen === comment.id && (
                          <div className="absolute right-0 z-10 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                            <div className="py-1" role="menu" aria-orientation="vertical">
                              {/* Action menu items for mobile */}
                              <button
                                onClick={() => updateCommentStatus(comment.id, 'approved')}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                              >
                                <FaCheck className="mr-2 text-green-500" />
                                Approve
                              </button>
                              <button
                                onClick={() => updateCommentStatus(comment.id, 'pending')}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                              >
                                <FaFlag className="mr-2 text-yellow-500" />
                                Mark as pending
                              </button>
                              <button
                                onClick={() => updateCommentStatus(comment.id, 'spam')}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                              >
                                <FaTimes className="mr-2 text-red-500" />
                                Mark as spam
                              </button>
                              <button
                                onClick={() => deleteComment(comment.id)}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center"
                              >
                                <FaTrash className="mr-2" />
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-4 gap-y-2">
                      <span>
                        {new Date(comment.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="flex items-center">
                        <Link 
                          href={`/articles/${comment.articleSlug}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[200px]"
                        >
                          {comment.articleTitle}
                        </Link>
                      </span>
                      <span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          comment.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          comment.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {comment.status.charAt(0).toUpperCase() + comment.status.slice(1)}
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        
        {/* Pagination */}
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {1} to {filteredComments.length} of {filteredComments.length} comments
          </div>
          <div className="flex space-x-2">
            <button
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md shadow-sm disabled:opacity-50"
              disabled={true}
            >
              Previous
            </button>
            <button
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md shadow-sm disabled:opacity-50"
              disabled={true}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
