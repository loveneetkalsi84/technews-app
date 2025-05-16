"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  author: {
    name: string;
    image: string;
  };
  articleTitle: string;
  articleSlug: string;
  content: string;
  createdAt: string;
  isApproved: boolean;
}

export default function LatestComments() {
  // Mock data for latest comments
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      author: {
        name: "Sarah Johnson",
        image: "https://randomuser.me/api/portraits/women/12.jpg",
      },
      articleTitle: "Apple Unveils New MacBook Pro with M3 Chip",
      articleSlug: "apple-unveils-new-macbook-pro-m3-chip",
      content: "This is an amazing article! I've been waiting for the M3 chip for so long, and it sounds like it's going to be a game changer for my video editing workflow.",
      createdAt: new Date().toISOString(),
      isApproved: true,
    },
    {
      id: "2",
      author: {
        name: "Michael Chen",
        image: "https://randomuser.me/api/portraits/men/67.jpg",
      },
      articleTitle: "Samsung Galaxy S23 Ultra Review",
      articleSlug: "samsung-galaxy-s23-ultra-review",
      content: "I'm skeptical about the battery life claims. Samsung always overpromises on battery performance. Has anyone done independent testing yet?",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      isApproved: true,
    },
    {
      id: "3",
      author: {
        name: "David Kim",
        image: "https://randomuser.me/api/portraits/men/42.jpg",
      },
      articleTitle: "NVIDIA Announces RTX 5090",
      articleSlug: "nvidia-announces-rtx-5090",
      content: "Does anyone know if the thermal redesign actually makes a difference during sustained workloads? My RTX 4090 still throttles after a few minutes of heavy rendering.",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      isApproved: false,
    },
  ]);

  const approveComment = (id: string) => {
    setComments(
      comments.map((comment) =>
        comment.id === id ? { ...comment, isApproved: true } : comment
      )
    );
  };

  const deleteComment = (id: string) => {
    setComments(comments.filter((comment) => comment.id !== id));
  };
  return (
    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
      {comments.length > 0 ? (
        comments.map((comment) => (
          <div 
            key={comment.id} 
            className={`p-4 border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ${
              comment.isApproved 
                ? "border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80" 
                : "border-yellow-300/70 dark:border-yellow-700/50 bg-yellow-50/80 dark:bg-yellow-900/20"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full border-2 border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex-shrink-0">
                <Image
                  src={comment.author.image}
                  alt={comment.author.name}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900 dark:text-white">{comment.author.name}</span>
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                
                <Link 
                  href={`/articles/${comment.articleSlug}`} 
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline mb-2 inline-flex items-center font-medium"
                >
                  <span className="mr-1">Re:</span> {comment.articleTitle}
                </Link>
                
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mt-1 italic">
                  "{comment.content}"
                </p>
                
                <div className="mt-3 flex justify-end space-x-2">
                  {!comment.isApproved && (
                    <button
                      onClick={() => approveComment(comment.id)}
                      className="text-xs bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-3 py-1.5 rounded-lg font-medium shadow-sm transition-all flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="text-xs bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-3 py-1.5 rounded-lg font-medium shadow-sm transition-all flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12 flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-1">No comments yet</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">Comments from your articles will appear here</p>
        </div>
      )}
      
      <div className="text-center mt-6 pt-3 border-t border-gray-200 dark:border-gray-700">
        <Link
          href="/admin/comments"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
        >
          View all comments
          <svg className="ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/>
          </svg>
        </Link>
      </div>
    </div>
  );
}
