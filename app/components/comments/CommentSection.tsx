"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { FaReply, FaThumbsUp } from "react-icons/fa";
import Link from "next/link";

interface CommentType {
  id: string;
  content: string;
  author: {
    name: string;
    image: string;
  };
  createdAt: string;
  likeCount: number;
  isAuthorLiked: boolean;
  parentId?: string | null;
}

const Comment = ({ comment, onReply }: { comment: CommentType; onReply: (commentId: string) => void }) => {
  const [liked, setLiked] = useState(comment.isAuthorLiked);
  const [likeCount, setLikeCount] = useState(comment.likeCount);

  const handleLike = () => {
    // In production, this would call an API to toggle the like
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <div className="mb-4">
      <div className="flex items-start gap-3">
        <Image
          src={comment.author.image}
          alt={comment.author.name}
          width={40}
          height={40}
          className="rounded-full mt-1"
        />
        <div className="flex-1">
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{comment.author.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
          </div>
          <div className="flex items-center gap-6 mt-2 ml-2">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-sm ${
                liked ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
              } hover:text-blue-600 dark:hover:text-blue-400`}
            >
              <FaThumbsUp size={14} />
              <span>{likeCount}</span>
            </button>
            <button
              onClick={() => onReply(comment.id)}
              className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <FaReply size={14} />
              <span>Reply</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CommentSection({ articleSlug }: { articleSlug: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      // In production, this would fetch comments from the API
      // const response = await fetch(`/api/articles/${articleSlug}/comments`);
      // const data = await response.json();
      
      // For now, use mock data
      setTimeout(() => {
        setComments([
          {
            id: "1",
            content: "This is an amazing article! I've been waiting for the M3 chip for so long, and it sounds like it's going to be a game changer for my video editing workflow.",
            author: {
              name: "Sarah Johnson",
              image: "https://randomuser.me/api/portraits/women/12.jpg",
            },
            createdAt: new Date().toISOString(),
            likeCount: 8,
            isAuthorLiked: false,
            parentId: null,
          },
          {
            id: "2",
            content: "I'm skeptical about the battery life claims. Apple always overpromises on battery performance. Has anyone done independent testing yet?",
            author: {
              name: "Michael Chen",
              image: "https://randomuser.me/api/portraits/men/67.jpg",
            },
            createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            likeCount: 3,
            isAuthorLiked: false,
            parentId: null,
          },
          {
            id: "3",
            content: "I've been testing mine for a few days now, and I'm getting around 18 hours with mixed use, which is still impressive compared to the previous generation.",
            author: {
              name: "Emily Rodriguez",
              image: "https://randomuser.me/api/portraits/women/33.jpg",
            },
            createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
            likeCount: 12,
            isAuthorLiked: true,
            parentId: "2",
          },
          {
            id: "4",
            content: "Does anyone know if the thermal redesign actually makes a difference during sustained workloads? My M1 Pro still throttles after a few minutes of heavy rendering.",
            author: {
              name: "David Kim",
              image: "https://randomuser.me/api/portraits/men/42.jpg",
            },
            createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
            likeCount: 5,
            isAuthorLiked: false,
            parentId: null,
          },
        ]);
        setLoading(false);
      }, 500);
    };

    fetchComments();
  }, [articleSlug]);

  const handleReply = (commentId: string) => {
    if (!session) {
      setShowLoginPrompt(true);
      return;
    }
    
    setReplyingTo(commentId);
    // Focus on comment input
    document.getElementById("comment-input")?.focus();
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      setShowLoginPrompt(true);
      return;
    }

    if (!commentText.trim()) {
      return;
    }

    // In production, this would call an API to add the comment
    // await fetch(`/api/articles/${articleSlug}/comments`, {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     content: commentText,
    //     parentId: replyingTo,
    //   }),
    // });

    // For now, just add to local state
    const newComment: CommentType = {
      id: `temp-${Date.now()}`,
      content: commentText,
      author: {
        name: session.user?.name || "Anonymous",
        image: session.user?.image || "https://randomuser.me/api/portraits/lego/1.jpg",
      },
      createdAt: new Date().toISOString(),
      likeCount: 0,
      isAuthorLiked: false,
      parentId: replyingTo,
    };

    setComments([...comments, newComment]);
    setCommentText("");
    setReplyingTo(null);
  };

  const topLevelComments = comments.filter(comment => !comment.parentId);
  
  // Create a map of replies for each parent comment
  const repliesMap: Record<string, CommentType[]> = {};
  comments.forEach(comment => {
    if (comment.parentId) {
      if (!repliesMap[comment.parentId]) {
        repliesMap[comment.parentId] = [];
      }
      repliesMap[comment.parentId].push(comment);
    }
  });

  return (
    <section>
      <h3 className="text-2xl font-bold mb-6">Comments ({comments.length})</h3>
      
      {/* Comment form */}
      <form onSubmit={handleSubmitComment} className="mb-8">
        {replyingTo && (
          <div className="mb-2 text-sm bg-blue-50 dark:bg-blue-900/30 p-2 rounded flex items-center justify-between">
            <span>
              Replying to a comment by <strong>{comments.find(c => c.id === replyingTo)?.author.name}</strong>
            </span>
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Cancel
            </button>
          </div>
        )}
        
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <Image
              src={session?.user?.image || "https://randomuser.me/api/portraits/lego/1.jpg"}
              alt="User"
              width={40}
              height={40}
              className="rounded-full"
            />
          </div>
          <div className="flex-grow">
            <textarea
              id="comment-input"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={session ? "Write a comment..." : "Sign in to comment"}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
              rows={3}
              disabled={!session}
            ></textarea>
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={!session || !commentText.trim()}
                className={`px-4 py-2 rounded-lg ${
                  session && commentText.trim()
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                }`}
              >
                Post Comment
              </button>
            </div>
          </div>
        </div>
        
        {showLoginPrompt && (
          <div className="mt-3 text-center p-3 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-lg">
            <p>Please <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">sign in</Link> to join the conversation.</p>
          </div>
        )}
      </form>

      {/* Comments list */}
      <div className="space-y-6">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
              <div className="flex-1">
                <div className="bg-gray-200 dark:bg-gray-700 h-24 rounded-lg w-full"></div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
              <div className="flex-1">
                <div className="bg-gray-200 dark:bg-gray-700 h-16 rounded-lg w-full"></div>
              </div>
            </div>
          </div>
        ) : topLevelComments.length > 0 ? (
          topLevelComments.map((comment) => (
            <div key={comment.id}>
              <Comment comment={comment} onReply={handleReply} />
              
              {/* Render replies */}
              {repliesMap[comment.id] && repliesMap[comment.id].length > 0 && (
                <div className="ml-12 mt-2 space-y-2">
                  {repliesMap[comment.id].map((reply) => (
                    <Comment key={reply.id} comment={reply} onReply={handleReply} />
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            Be the first to comment on this article!
          </p>
        )}
      </div>
    </section>
  );
}
